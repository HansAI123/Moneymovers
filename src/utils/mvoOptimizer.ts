/**
 * Modern Portfolio Theory (Mean-Variance Optimization / MVO)
 * Implements constrained quadratic optimization minimizing historical portfolio volatility
 * subject to hitting a target distribution yield and honoring single-asset risk caps.
 */

export interface VixContext {
  current_vix: number;
  avg_vix_1mo: number;
  status: string;
  yield_sustainability?: string;
  timestamp: string;
}

export interface MvoResult {
  success: boolean;
  optimized_weights: Record<string, number> | null;
  weights_array: number[] | null;
  portfolio_volatility_pct: number | null;
  portfolio_yield_pct: number | null;
  message: string;
  vix_context?: VixContext;
  covariance_matrix?: number[][];
}

// Baseline historical volatilities and correlations for key covered call and dividend funds
const BASELINE_VOLATILITIES: Record<string, number> = {
  JEPI: 0.115,  // 11.5% annualized vol (managed OTM calls)
  JEPQ: 0.148,  // 14.8% vol (Nasdaq tech focus)
  SPYI: 0.122,  // 12.2% vol (SPX call spreads)
  XYLD: 0.138,  // 13.8% vol (ATM calls)
  QYLD: 0.165,  // 16.5% vol
  GPIX: 0.118,  // 11.8% vol (Dynamic call writing)
  O: 0.185,     // 18.5% vol (REIT)
  SCHD: 0.128,  // 12.8% vol (Dividend growth)
  NVDY: 0.380,  // 38.0% vol (Single stock synthetic)
  TSLY: 0.440,  // 44.0% vol (Single stock synthetic)
  CONY: 0.580,  // 58.0% vol (Crypto proxy synthetic)
  DEFAULT: 0.150,
};

/**
 * Builds an annualized covariance matrix for given tickers using historical returns or empirical correlations.
 */
export function buildCovarianceMatrix(
  tickers: string[],
  historicalCloses?: Record<string, number[]>
): number[][] {
  const n = tickers.length;
  const cov: number[][] = Array.from({ length: n }, () => Array(n).fill(0));

  // If daily close prices are provided, compute actual sample covariance
  if (historicalCloses) {
    const validSeries = tickers.map((t) => historicalCloses[t] || []);
    const minLen = Math.min(...validSeries.map((s) => s.length));

    if (minLen > 20) {
      // Calculate daily returns
      const returns: number[][] = validSeries.map((prices) => {
        const ret: number[] = [];
        for (let t = 1; t < minLen; t++) {
          ret.push((prices[t] - prices[t - 1]) / prices[t - 1]);
        }
        return ret;
      });

      const numDays = returns[0].length;
      const means = returns.map((r) => r.reduce((a, b) => a + b, 0) / numDays);

      for (let i = 0; i < n; i++) {
        for (let j = 0; j < n; j++) {
          let sumProd = 0;
          for (let t = 0; t < numDays; t++) {
            sumProd += (returns[i][t] - means[i]) * (returns[j][t] - means[j]);
          }
          // Annualize: 252 trading days per year
          cov[i][j] = (sumProd / (numDays - 1)) * 252;
        }
      }
      return cov;
    }
  }

  // Fallback: Empirical covariance based on category volatilities and asset correlations
  for (let i = 0; i < n; i++) {
    const volI = BASELINE_VOLATILITIES[tickers[i]] || BASELINE_VOLATILITIES.DEFAULT;
    for (let j = 0; j < n; j++) {
      const volJ = BASELINE_VOLATILITIES[tickers[j]] || BASELINE_VOLATILITIES.DEFAULT;
      let corr = 0.65; // baseline equity correlation
      if (i === j) {
        corr = 1.0;
      } else if (
        (tickers[i].includes("TSLY") || tickers[i].includes("CONY") || tickers[i].includes("NVDY")) &&
        (tickers[j] === "O" || tickers[j] === "SCHD")
      ) {
        corr = 0.28; // low correlation between synthetic single stocks and real estate / value
      } else if (tickers[i] === "O" || tickers[j] === "O") {
        corr = 0.45; // REITs have lower correlation to broad equity
      } else if (
        (tickers[i].includes("Q") || tickers[i] === "QQQ") &&
        (tickers[j].includes("Q") || tickers[j] === "QQQ")
      ) {
        corr = 0.88; // high tech-to-tech correlation
      }
      cov[i][j] = corr * volI * volJ;
    }
  }

  return cov;
}

/**
 * Modern Portfolio Theory (Mean-Variance Optimization / MVO).
 * Finds the exact weights that minimize historical volatility while hitting the target yield.
 * Translates the SLSQP numerical optimization solver into robust, zero-dependency TypeScript.
 */
export function optimizePortfolioMvo(
  tickers: string[],
  yields: number[],
  targetYield: number,
  maxWeight = 0.25,
  covMatrix?: number[][]
): MvoResult {
  const numAssets = tickers.length;

  if (numAssets === 0) {
    return {
      success: false,
      optimized_weights: null,
      weights_array: null,
      portfolio_volatility_pct: null,
      portfolio_yield_pct: null,
      message: "⚠️ Please select at least one fund to optimize.",
    };
  }

  // 1. Build covariance matrix if not provided
  const cov = covMatrix || buildCovarianceMatrix(tickers);

  // 2. Mathematical Feasibility Check:
  // Is it mathematically possible to hit the target yield under the given max asset cap?
  const sortedIndices = [...Array(numAssets).keys()].sort(
    (a, b) => yields[b] - yields[a]
  );

  // Check sum of caps
  if (numAssets * maxWeight < 0.999) {
    const minCapRequired = Math.ceil((1.0 / numAssets) * 100);
    return {
      success: false,
      optimized_weights: null,
      weights_array: null,
      portfolio_volatility_pct: null,
      portfolio_yield_pct: null,
      message: `⚠️ MVO Failed: Max cap ${Math.round(maxWeight * 100)}% is too restrictive for ${numAssets} assets (sum of caps is ${(numAssets * maxWeight * 100).toFixed(0)}% < 100%). Raise cap to at least ${minCapRequired}%.`,
      covariance_matrix: cov,
    };
  }

  // Initial feasible point by allocating up to maxWeight starting from highest yielding assets
  let curW = new Array(numAssets).fill(0);
  let remainingWeight = 1.0;
  for (const idx of sortedIndices) {
    const take = Math.min(maxWeight, remainingWeight);
    curW[idx] = take;
    remainingWeight -= take;
  }

  const maxPossibleYield = curW.reduce((acc, wi, i) => acc + wi * yields[i], 0);

  if (targetYield > maxPossibleYield + 1e-4) {
    return {
      success: false,
      optimized_weights: null,
      weights_array: null,
      portfolio_volatility_pct: null,
      portfolio_yield_pct: null,
      message: `⚠️ MVO Failed: Target yield ${targetYield.toFixed(1)}% exceeds maximum achievable yield ${maxPossibleYield.toFixed(1)}% under ${Math.round(maxWeight * 100)}% risk caps. Try lowering target yield or raising risk caps.`,
      covariance_matrix: cov,
    };
  }

  // If equal weighting satisfies targetYield and maxWeight >= 1/n, start from equal weighting for maximum initial entropy
  const eqW = new Array(numAssets).fill(1.0 / numAssets);
  const eqYield = eqW.reduce((acc, wi, i) => acc + wi * yields[i], 0);
  if (eqYield >= targetYield && maxWeight >= 1.0 / numAssets - 1e-6) {
    curW = [...eqW];
  }

  // Function to evaluate portfolio variance: w^T * Sigma * w
  function getVariance(weights: number[]): number {
    let variance = 0;
    for (let i = 0; i < numAssets; i++) {
      for (let j = 0; j < numAssets; j++) {
        variance += weights[i] * cov[i][j] * weights[j];
      }
    }
    return Math.max(0, variance);
  }

  // 3. Coordinate Descent / Pairwise Transfer (Sequential Minimal Optimization for Convex QP)
  // Minimizes f(w) = w^T * cov * w
  // Subject to:
  //   sum(w) = 1.0
  //   sum(w * yields) >= targetYield
  //   0 <= w_i <= maxWeight for all i
  for (let iter = 0; iter < 1200; iter++) {
    let maxImprovement = 0;

    for (let i = 0; i < numAssets; i++) {
      for (let j = 0; j < numAssets; j++) {
        if (i === j) continue;

        const curYield = curW.reduce((acc, wi, k) => acc + wi * yields[k], 0);
        const yDiff = yields[i] - yields[j];

        // Feasible bounds on delta (transfer from j to i):
        // 0 <= curW[i] + delta <= maxWeight  ==>  -curW[i] <= delta <= maxWeight - curW[i]
        // 0 <= curW[j] - delta <= maxWeight  ==>  curW[j] - maxWeight <= delta <= curW[j]
        let minDelta = Math.max(-curW[i], curW[j] - maxWeight);
        let maxDelta = Math.min(maxWeight - curW[i], curW[j]);

        // Yield constraint: curYield + delta * yDiff >= targetYield
        if (Math.abs(yDiff) > 1e-6) {
          if (yDiff > 0) {
            minDelta = Math.max(minDelta, (targetYield - curYield) / yDiff);
          } else {
            maxDelta = Math.min(maxDelta, (targetYield - curYield) / yDiff);
          }
        } else {
          if (curYield < targetYield - 1e-5) continue;
        }

        if (minDelta > maxDelta + 1e-7) continue;

        // Quadratic objective derivative along delta:
        // f(w + delta*(e_i - e_j)) = f(w) + 2*delta*( (cov*w)_i - (cov*w)_j ) + delta^2 * (cov_ii - 2*cov_ij + cov_jj)
        let gradDiff = 0;
        for (let k = 0; k < numAssets; k++) {
          gradDiff += 2 * cov[i][k] * curW[k] - 2 * cov[j][k] * curW[k];
        }
        const quadCoeff = 2 * (cov[i][i] - 2 * cov[i][j] + cov[j][j]);

        let optDelta = 0;
        if (quadCoeff > 1e-8) {
          optDelta = -gradDiff / quadCoeff;
        }

        // Clamp to feasible segment
        optDelta = Math.max(minDelta, Math.min(maxDelta, optDelta));

        if (Math.abs(optDelta) > 1e-6) {
          curW[i] += optDelta;
          curW[j] -= optDelta;
          maxImprovement = Math.max(maxImprovement, Math.abs(optDelta));
        }
      }
    }

    if (maxImprovement < 1e-5) break;
  }

  // 4. Normalization and rounding to guarantee sum = 100%
  let sum = curW.reduce((a, b) => a + b, 0);
  if (sum > 0) curW = curW.map((w) => w / sum);

  for (let pass = 0; pass < 20; pass++) {
    let excess = 0;
    let freeCount = 0;
    for (let i = 0; i < numAssets; i++) {
      if (curW[i] > maxWeight) {
        excess += curW[i] - maxWeight;
        curW[i] = maxWeight;
      } else if (curW[i] > 0) {
        freeCount++;
      }
    }
    if (excess <= 1e-6 || freeCount === 0) break;
    const add = excess / freeCount;
    for (let i = 0; i < numAssets; i++) {
      if (curW[i] < maxWeight) curW[i] += add;
    }
  }

  const portfolioVariance = getVariance(curW);
  const portfolioVolatilityPct = Math.round(Math.sqrt(portfolioVariance) * 10000) / 100;
  const portfolioYieldPct =
    Math.round(curW.reduce((acc, wi, i) => acc + wi * yields[i], 0) * 100) / 100;

  // Convert to clean percentage weights (e.g. 30.0%)
  const optimizedWeights: Record<string, number> = {};
  const weightsArray = curW.map((w) => Math.round(w * 10000) / 100);

  tickers.forEach((ticker, i) => {
    optimizedWeights[ticker] = weightsArray[i];
  });

  return {
    success: true,
    optimized_weights: optimizedWeights,
    weights_array: weightsArray,
    portfolio_volatility_pct: portfolioVolatilityPct,
    portfolio_yield_pct: portfolioYieldPct,
    message: "✅ MVO Optimal Portfolio Generated",
    covariance_matrix: cov,
  };
}

/**
 * Evaluates VIX level to assess option premium sustainability.
 */
export function evaluateVixStatus(vixLevel: number): string {
  if (vixLevel < 13) {
    return "⚠️ High Risk of Yield Cuts (Low Volatility Environment)";
  } else if (vixLevel < 18) {
    return "✅ Stable / Average Option Premiums";
  } else {
    return "🔥 Elevated Yields (High Volatility Environment)";
  }
}
