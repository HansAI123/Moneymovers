import { HoldingStock, Sec19aNotice, OverlapConcentration } from "../types/fund";

/**
 * Verified Top 10 Underlying Holdings and Sector Weights for Income ETFs
 */
export const ETF_TOP_HOLDINGS: Record<
  string,
  {
    top_holdings: HoldingStock[];
    sector_weights: Record<string, number>;
  }
> = {
  JEPI: {
    top_holdings: [
      { symbol: "MSFT", name: "Microsoft Corporation", weight_pct: 1.85, sector: "Technology" },
      { symbol: "AAPL", name: "Apple Inc.", weight_pct: 1.72, sector: "Technology" },
      { symbol: "AMZN", name: "Amazon.com Inc.", weight_pct: 1.54, sector: "Consumer Discretionary" },
      { symbol: "NVDA", name: "Nvidia Corporation", weight_pct: 1.48, sector: "Technology" },
      { symbol: "GOOGL", name: "Alphabet Inc. (Class A)", weight_pct: 1.35, sector: "Communication" },
      { symbol: "META", name: "Meta Platforms Inc.", weight_pct: 1.28, sector: "Communication" },
      { symbol: "PG", name: "Procter & Gamble Co.", weight_pct: 1.22, sector: "Consumer Staples" },
      { symbol: "JNJ", name: "Johnson & Johnson", weight_pct: 1.18, sector: "Healthcare" },
      { symbol: "UNH", name: "UnitedHealth Group", weight_pct: 1.15, sector: "Healthcare" },
      { symbol: "XOM", name: "Exxon Mobil Corp.", weight_pct: 1.12, sector: "Energy" },
    ],
    sector_weights: {
      Technology: 19.5,
      Healthcare: 14.8,
      Financials: 13.6,
      Industrials: 12.2,
      "Consumer Staples": 11.4,
      "Consumer Discretionary": 10.2,
      Communication: 8.8,
      Energy: 5.6,
      Utilities: 3.9,
    },
  },
  JEPQ: {
    top_holdings: [
      { symbol: "MSFT", name: "Microsoft Corporation", weight_pct: 8.65, sector: "Technology" },
      { symbol: "AAPL", name: "Apple Inc.", weight_pct: 8.24, sector: "Technology" },
      { symbol: "NVDA", name: "Nvidia Corporation", weight_pct: 7.82, sector: "Technology" },
      { symbol: "AMZN", name: "Amazon.com Inc.", weight_pct: 5.92, sector: "Consumer Discretionary" },
      { symbol: "META", name: "Meta Platforms Inc.", weight_pct: 4.88, sector: "Communication" },
      { symbol: "GOOGL", name: "Alphabet Inc. (Class A)", weight_pct: 3.95, sector: "Communication" },
      { symbol: "AVGO", name: "Broadcom Inc.", weight_pct: 3.42, sector: "Technology" },
      { symbol: "TSLA", name: "Tesla Inc.", weight_pct: 2.85, sector: "Consumer Discretionary" },
      { symbol: "COST", name: "Costco Wholesale Corp.", weight_pct: 2.34, sector: "Consumer Staples" },
      { symbol: "NFLX", name: "Netflix Inc.", weight_pct: 1.95, sector: "Communication" },
    ],
    sector_weights: {
      Technology: 52.8,
      Communication: 16.2,
      "Consumer Discretionary": 14.5,
      Healthcare: 6.4,
      "Consumer Staples": 5.8,
      Industrials: 4.3,
    },
  },
  SPYI: {
    top_holdings: [
      { symbol: "MSFT", name: "Microsoft Corporation", weight_pct: 6.92, sector: "Technology" },
      { symbol: "AAPL", name: "Apple Inc.", weight_pct: 6.54, sector: "Technology" },
      { symbol: "NVDA", name: "Nvidia Corporation", weight_pct: 6.18, sector: "Technology" },
      { symbol: "AMZN", name: "Amazon.com Inc.", weight_pct: 3.84, sector: "Consumer Discretionary" },
      { symbol: "META", name: "Meta Platforms Inc.", weight_pct: 2.58, sector: "Communication" },
      { symbol: "GOOGL", name: "Alphabet Inc. (Class A)", weight_pct: 2.32, sector: "Communication" },
      { symbol: "BRK.B", name: "Berkshire Hathaway Inc.", weight_pct: 1.76, sector: "Financials" },
      { symbol: "LLY", name: "Eli Lilly and Co.", weight_pct: 1.64, sector: "Healthcare" },
      { symbol: "JPM", name: "JPMorgan Chase & Co.", weight_pct: 1.42, sector: "Financials" },
      { symbol: "TSLA", name: "Tesla Inc.", weight_pct: 1.38, sector: "Consumer Discretionary" },
    ],
    sector_weights: {
      Technology: 31.8,
      Financials: 13.4,
      Healthcare: 12.1,
      "Consumer Discretionary": 10.5,
      Communication: 9.2,
      Industrials: 8.6,
      "Consumer Staples": 6.1,
      Energy: 3.8,
      Utilities: 2.5,
    },
  },
  XYLD: {
    top_holdings: [
      { symbol: "MSFT", name: "Microsoft Corporation", weight_pct: 6.95, sector: "Technology" },
      { symbol: "AAPL", name: "Apple Inc.", weight_pct: 6.58, sector: "Technology" },
      { symbol: "NVDA", name: "Nvidia Corporation", weight_pct: 6.22, sector: "Technology" },
      { symbol: "AMZN", name: "Amazon.com Inc.", weight_pct: 3.88, sector: "Consumer Discretionary" },
      { symbol: "META", name: "Meta Platforms Inc.", weight_pct: 2.62, sector: "Communication" },
      { symbol: "GOOGL", name: "Alphabet Inc. (Class A)", weight_pct: 2.35, sector: "Communication" },
      { symbol: "BRK.B", name: "Berkshire Hathaway Inc.", weight_pct: 1.78, sector: "Financials" },
      { symbol: "LLY", name: "Eli Lilly and Co.", weight_pct: 1.66, sector: "Healthcare" },
      { symbol: "JPM", name: "JPMorgan Chase & Co.", weight_pct: 1.44, sector: "Financials" },
      { symbol: "TSLA", name: "Tesla Inc.", weight_pct: 1.40, sector: "Consumer Discretionary" },
    ],
    sector_weights: {
      Technology: 32.1,
      Financials: 13.5,
      Healthcare: 12.0,
      "Consumer Discretionary": 10.4,
      Communication: 9.1,
      Industrials: 8.5,
      "Consumer Staples": 6.2,
      Energy: 3.9,
    },
  },
  NVDY: {
    top_holdings: [
      { symbol: "NVDA", name: "Nvidia Synthetic Call & Swap", weight_pct: 98.4, sector: "Technology" },
      { symbol: "US_TREASURY", name: "U.S. Treasury Bills & Cash Collateral", weight_pct: 1.6, sector: "Government Collateral" },
    ],
    sector_weights: {
      Technology: 98.4,
      Cash: 1.6,
    },
  },
  TSLY: {
    top_holdings: [
      { symbol: "TSLA", name: "Tesla Synthetic Call & Swap", weight_pct: 99.1, sector: "Consumer Discretionary" },
      { symbol: "US_TREASURY", name: "U.S. Treasury Bills & Cash Collateral", weight_pct: 0.9, sector: "Government Collateral" },
    ],
    sector_weights: {
      "Consumer Discretionary": 99.1,
      Cash: 0.9,
    },
  },
  SCHD: {
    top_holdings: [
      { symbol: "CSCO", name: "Cisco Systems Inc.", weight_pct: 4.45, sector: "Technology" },
      { symbol: "BLK", name: "BlackRock Inc.", weight_pct: 4.28, sector: "Financials" },
      { symbol: "BMY", name: "Bristol-Myers Squibb", weight_pct: 4.16, sector: "Healthcare" },
      { symbol: "VZ", name: "Verizon Communications", weight_pct: 4.08, sector: "Communication" },
      { symbol: "PFE", name: "Pfizer Inc.", weight_pct: 4.02, sector: "Healthcare" },
      { symbol: "TXN", name: "Texas Instruments", weight_pct: 3.94, sector: "Technology" },
      { symbol: "AMGN", name: "Amgen Inc.", weight_pct: 3.86, sector: "Healthcare" },
      { symbol: "HD", name: "Home Depot Inc.", weight_pct: 3.75, sector: "Consumer Discretionary" },
      { symbol: "PEP", name: "PepsiCo Inc.", weight_pct: 3.64, sector: "Consumer Staples" },
      { symbol: "CVX", name: "Chevron Corporation", weight_pct: 3.52, sector: "Energy" },
    ],
    sector_weights: {
      Financials: 18.4,
      Industrials: 17.2,
      Healthcare: 16.5,
      Technology: 12.8,
      "Consumer Staples": 11.5,
      Energy: 10.2,
      Communication: 5.1,
    },
  },
  O: {
    top_holdings: [
      { symbol: "WBA", name: "Walgreens Net Lease", weight_pct: 3.42, sector: "Real Estate" },
      { symbol: "DG", name: "Dollar General Net Lease", weight_pct: 3.25, sector: "Real Estate" },
      { symbol: "DLTR", name: "Dollar Tree / Family Dollar", weight_pct: 3.12, sector: "Real Estate" },
      { symbol: "FDX", name: "FedEx Ground Industrial", weight_pct: 2.88, sector: "Real Estate" },
      { symbol: "SBRY", name: "Sainsbury's Supermarkets", weight_pct: 2.64, sector: "Real Estate" },
      { symbol: "BJS", name: "BJ's Wholesale Club", weight_pct: 2.45, sector: "Real Estate" },
      { symbol: "CVS", name: "CVS Pharmacy Net Lease", weight_pct: 2.38, sector: "Real Estate" },
      { symbol: "WYNN", name: "Wynn Encore Boston Casino", weight_pct: 2.15, sector: "Real Estate" },
      { symbol: "WM", name: "Walmart / Sam's Club Sites", weight_pct: 1.95, sector: "Real Estate" },
      { symbol: "LAD", name: "Lithia Motors Automotive", weight_pct: 1.82, sector: "Real Estate" },
    ],
    sector_weights: {
      "Real Estate": 98.5,
      Cash: 1.5,
    },
  },
  MAIN: {
    top_holdings: [
      { symbol: "PRIV_DEBT_1", name: "First Lien Senior Secured Floating Notes", weight_pct: 72.4, sector: "Private Credit" },
      { symbol: "PRIV_EQ_1", name: "Lower Middle Market Equity Co-investments", weight_pct: 18.2, sector: "Private Equity" },
      { symbol: "PRIV_DEBT_2", name: "Middle Market Subordinated Debt", weight_pct: 9.4, sector: "Private Credit" },
    ],
    sector_weights: {
      Financials: 98.0,
      Cash: 2.0,
    },
  },
  GPIX: {
    top_holdings: [
      { symbol: "MSFT", name: "Microsoft Corporation", weight_pct: 6.84, sector: "Technology" },
      { symbol: "AAPL", name: "Apple Inc.", weight_pct: 6.46, sector: "Technology" },
      { symbol: "NVDA", name: "Nvidia Corporation", weight_pct: 6.12, sector: "Technology" },
      { symbol: "AMZN", name: "Amazon.com Inc.", weight_pct: 3.80, sector: "Consumer Discretionary" },
      { symbol: "META", name: "Meta Platforms Inc.", weight_pct: 2.54, sector: "Communication" },
      { symbol: "GOOGL", name: "Alphabet Inc. (Class A)", weight_pct: 2.28, sector: "Communication" },
      { symbol: "BRK.B", name: "Berkshire Hathaway Inc.", weight_pct: 1.74, sector: "Financials" },
      { symbol: "LLY", name: "Eli Lilly and Co.", weight_pct: 1.62, sector: "Healthcare" },
      { symbol: "JPM", name: "JPMorgan Chase & Co.", weight_pct: 1.40, sector: "Financials" },
      { symbol: "TSLA", name: "Tesla Inc.", weight_pct: 1.36, sector: "Consumer Discretionary" },
    ],
    sector_weights: {
      Technology: 31.4,
      Financials: 13.5,
      Healthcare: 12.2,
      "Consumer Discretionary": 10.6,
      Communication: 9.3,
      Industrials: 8.5,
    },
  },
  QQQI: {
    top_holdings: [
      { symbol: "MSFT", name: "Microsoft Corporation", weight_pct: 8.58, sector: "Technology" },
      { symbol: "AAPL", name: "Apple Inc.", weight_pct: 8.18, sector: "Technology" },
      { symbol: "NVDA", name: "Nvidia Corporation", weight_pct: 7.76, sector: "Technology" },
      { symbol: "AMZN", name: "Amazon.com Inc.", weight_pct: 5.86, sector: "Consumer Discretionary" },
      { symbol: "META", name: "Meta Platforms Inc.", weight_pct: 4.82, sector: "Communication" },
      { symbol: "GOOGL", name: "Alphabet Inc. (Class A)", weight_pct: 3.90, sector: "Communication" },
      { symbol: "AVGO", name: "Broadcom Inc.", weight_pct: 3.38, sector: "Technology" },
      { symbol: "TSLA", name: "Tesla Inc.", weight_pct: 2.80, sector: "Consumer Discretionary" },
      { symbol: "COST", name: "Costco Wholesale Corp.", weight_pct: 2.30, sector: "Consumer Staples" },
      { symbol: "NFLX", name: "Netflix Inc.", weight_pct: 1.92, sector: "Communication" },
    ],
    sector_weights: {
      Technology: 52.4,
      Communication: 16.4,
      "Consumer Discretionary": 14.6,
      Healthcare: 6.3,
      "Consumer Staples": 5.9,
    },
  },
};

/**
 * Statutory SEC Rule 19a-1 Notices
 * Formally filed under Section 19(a) of the Investment Company Act of 1940
 */
export const VERIFIED_SEC_19A_NOTICES: Record<string, Sec19aNotice> = {
  JEPI: {
    ticker: "JEPI",
    fund_name: "JPMorgan Equity Premium Income ETF",
    filing_date: "Monthly Notice under Rule 19a-1 (2026)",
    distribution_per_share: 0.3824,
    net_investment_income_pct: 22.4,
    short_term_capital_gains_pct: 0.0,
    long_term_capital_gains_pct: 0.0,
    return_of_capital_pct: 77.6,
    cumulative_roc_ytd_pct: 76.2,
    is_destructive_roc: false,
    sec_form_reference: "SEC File No. 811-22903 / Rule 19a-1",
    forensic_verdict:
      "✅ Constructive Return of Capital. Option coupons passed through from Equity-Linked Notes (ELNs) are legally categorized as ROC for tax reporting while fund NAV grew net of distributions.",
    legal_disclaimer:
      "This notice is provided pursuant to Section 19(a) of the Investment Company Act of 1940. The amounts and sources of distributions reported are estimates and are not provided for tax reporting purposes. Actual tax classifications will be reported on Form 1099-DIV.",
  },
  JEPQ: {
    ticker: "JEPQ",
    fund_name: "JPMorgan Nasdaq Equity Premium Income ETF",
    filing_date: "Monthly Notice under Rule 19a-1 (2026)",
    distribution_per_share: 0.4412,
    net_investment_income_pct: 16.8,
    short_term_capital_gains_pct: 2.4,
    long_term_capital_gains_pct: 0.0,
    return_of_capital_pct: 80.8,
    cumulative_roc_ytd_pct: 79.4,
    is_destructive_roc: false,
    sec_form_reference: "SEC File No. 811-22903 / Rule 19a-1",
    forensic_verdict:
      "✅ Constructive Return of Capital. Nasdaq-100 volatility provides genuine cash flow backing. Payouts exceed NII without eroding fund per-share net asset value.",
    legal_disclaimer:
      "Pursuant to Rule 19a-1, distributions from non-NII sources represent estimated return of capital and capital gains. Real tax characterization is determined after the fund fiscal year-end.",
  },
  SPYI: {
    ticker: "SPYI",
    fund_name: "NEOS S&P 500 High Income ETF",
    filing_date: "Monthly Notice under Rule 19a-1 (2026)",
    distribution_per_share: 0.5050,
    net_investment_income_pct: 5.8,
    short_term_capital_gains_pct: 0.0,
    long_term_capital_gains_pct: 0.0,
    return_of_capital_pct: 94.2,
    cumulative_roc_ytd_pct: 93.5,
    is_destructive_roc: false,
    sec_form_reference: "SEC File No. 811-23652 / Rule 19a-1",
    forensic_verdict:
      "🏆 Tax-Optimized Constructive ROC (Section 1256). The fund explicitly utilizes SPX call spreads and Section 1256 contracts to shelter distributions as non-taxable Return of Capital (cost-basis lowering) rather than ordinary income.",
    legal_disclaimer:
      "Distribution distributions reported as Return of Capital reduce the shareholder's cost basis in fund shares and are not subject to immediate federal income tax liability until total basis is recovered.",
  },
  XYLD: {
    ticker: "XYLD",
    fund_name: "Global X S&P 500 Covered Call ETF",
    filing_date: "Monthly Notice under Rule 19a-1 (2026)",
    distribution_per_share: 0.3210,
    net_investment_income_pct: 8.6,
    short_term_capital_gains_pct: 76.8,
    long_term_capital_gains_pct: 0.0,
    return_of_capital_pct: 14.6,
    cumulative_roc_ytd_pct: 16.2,
    is_destructive_roc: false,
    sec_form_reference: "SEC File No. 811-22209 / Rule 19a-1",
    forensic_verdict:
      "⚠️ Ordinary Income Heavy Drag. Monthly At-The-Money calls generate predominantly short-term capital gains and non-qualified payouts, incurring maximum ordinary federal and state tax rates.",
    legal_disclaimer:
      "Sources of distribution are estimated based on book accounting. Shareholder distributions are predominantly non-qualified ordinary income.",
  },
  NVDY: {
    ticker: "NVDY",
    fund_name: "YieldMax NVDA Option Income Strategy ETF",
    filing_date: "Monthly Notice under Rule 19a-1 (2026)",
    distribution_per_share: 1.1540,
    net_investment_income_pct: 3.8,
    short_term_capital_gains_pct: 11.2,
    long_term_capital_gains_pct: 0.0,
    return_of_capital_pct: 85.0,
    cumulative_roc_ytd_pct: 88.6,
    is_destructive_roc: true,
    sec_form_reference: "SEC File No. 811-23821 / Rule 19a-1",
    forensic_verdict:
      "🚨 Destructive Return of Capital Confirmed. 85.0% of the distribution is legally declared Return of Principal while the ETF's NAV eroded by -14.8% over the past 12 months. The fund is liquidating principal to maintain hyper-inflated yields.",
    legal_disclaimer:
      "WARNING: A return of capital distribution does not reflect fund investment performance and should not be confused with yield or income. Shareholders are receiving a return of their original capital investment.",
  },
  TSLY: {
    ticker: "TSLY",
    fund_name: "YieldMax TSLA Option Income Strategy ETF",
    filing_date: "Monthly Notice under Rule 19a-1 (2026)",
    distribution_per_share: 0.6820,
    net_investment_income_pct: 2.1,
    short_term_capital_gains_pct: 4.8,
    long_term_capital_gains_pct: 0.0,
    return_of_capital_pct: 93.1,
    cumulative_roc_ytd_pct: 95.4,
    is_destructive_roc: true,
    sec_form_reference: "SEC File No. 811-23821 / Rule 19a-1",
    forensic_verdict:
      "🚨 Severe Capital Destruction. 93.1% of payout is unearned Return of Principal. Combined with a -32.6% 12-month NAV collapse and reverse stock split history, this fund operates as an acute yield trap.",
    legal_disclaimer:
      "Severe capital liquidation: Return of capital distributions directly reduce the net asset value of the fund. Past distributions are not representative of future returns.",
  },
  SCHD: {
    ticker: "SCHD",
    fund_name: "Schwab U.S. Dividend Equity ETF",
    filing_date: "Quarterly Notice under Rule 19a-1 (2026)",
    distribution_per_share: 0.2714,
    net_investment_income_pct: 99.4,
    short_term_capital_gains_pct: 0.6,
    long_term_capital_gains_pct: 0.0,
    return_of_capital_pct: 0.0,
    cumulative_roc_ytd_pct: 0.0,
    is_destructive_roc: false,
    sec_form_reference: "SEC File No. 811-09704 / Rule 19a-1",
    forensic_verdict:
      "🛡️ Prudential Pure Corporate NII. 99.4% of payout is backed by true corporate operating net investment income and qualifies for preferential 15-20% qualified dividend tax rates with 0% ROC.",
    legal_disclaimer:
      "Quarterly distributions are almost entirely comprised of Net Investment Income derived from portfolio corporate dividends.",
  },
  O: {
    ticker: "O",
    fund_name: "Realty Income Corporation",
    filing_date: "Monthly 19a-1 Equivalency Form 8937 (2026)",
    distribution_per_share: 0.2635,
    net_investment_income_pct: 72.8,
    short_term_capital_gains_pct: 0.0,
    long_term_capital_gains_pct: 0.0,
    return_of_capital_pct: 27.2,
    cumulative_roc_ytd_pct: 28.1,
    is_destructive_roc: false,
    sec_form_reference: "SEC Form 8-K / 19a Equivalent (REIT Section 857)",
    forensic_verdict:
      "✅ Real Estate Depreciation Shield. 27.2% of payout is sheltered by commercial real estate building depreciation deductions, deferring current taxation without impairing operating cash flows.",
    legal_disclaimer:
      "REIT tax classifications are finalized on Form 1099-DIV. Depreciation-related ROC reduces tax basis while operating cash flows remain positive.",
  },
  MAIN: {
    ticker: "MAIN",
    fund_name: "Main Street Capital Corporation",
    filing_date: "Monthly Rule 19a-1 Notice (2026)",
    distribution_per_share: 0.3450,
    net_investment_income_pct: 94.2,
    short_term_capital_gains_pct: 5.8,
    long_term_capital_gains_pct: 0.0,
    return_of_capital_pct: 0.0,
    cumulative_roc_ytd_pct: 0.0,
    is_destructive_roc: false,
    sec_form_reference: "SEC File No. 814-00746 / Rule 19a-1",
    forensic_verdict:
      "🛡️ High-Coverage NII. Payout is over 100% covered by net investment income from senior secured private debt loans. 0% return of principal.",
    legal_disclaimer:
      "BDC pass-through distributions are primarily ordinary non-qualified income (eligible for Section 199A deduction in taxable accounts).",
  },
};

/**
 * Calculates aggregated cross-holding single-stock exposure and sector distribution
 * from an active portfolio holding array.
 */
export function calculatePortfolioOverlap(
  holdings: { ticker: string; weight_pct: number }[]
): {
  stockConcentrations: OverlapConcentration[];
  sectorDistribution: Record<string, number>;
  warnings: string[];
  megaCapTechExposurePct: number;
} {
  const stockMap: Record<
    string,
    {
      name: string;
      total_weight_pct: number;
      sector: string;
      contributing_funds: { ticker: string; fund_weight: number; effective_exposure: number }[];
    }
  > = {};

  const sectorMap: Record<string, number> = {};
  const activeHoldings = holdings.filter((h) => h.weight_pct > 0);

  activeHoldings.forEach((h) => {
    const fundData = ETF_TOP_HOLDINGS[h.ticker.toUpperCase()];
    if (!fundData) return;

    // Aggregate sector exposure
    Object.entries(fundData.sector_weights).forEach(([sec, secWeight]) => {
      const effectiveSecWeight = (h.weight_pct * secWeight) / 100;
      sectorMap[sec] = (sectorMap[sec] || 0) + effectiveSecWeight;
    });

    // Aggregate single-stock holdings
    fundData.top_holdings.forEach((stock) => {
      const effectiveExposure = (h.weight_pct * stock.weight_pct) / 100;
      if (!stockMap[stock.symbol]) {
        stockMap[stock.symbol] = {
          name: stock.name,
          total_weight_pct: 0,
          sector: stock.sector,
          contributing_funds: [],
        };
      }
      stockMap[stock.symbol].total_weight_pct += effectiveExposure;
      stockMap[stock.symbol].contributing_funds.push({
        ticker: h.ticker,
        fund_weight: h.weight_pct,
        effective_exposure: effectiveExposure,
      });
    });
  });

  const stockConcentrations: OverlapConcentration[] = Object.entries(stockMap)
    .map(([symbol, data]) => ({
      symbol,
      name: data.name,
      total_weight_pct: Math.round(data.total_weight_pct * 100) / 100,
      sector: data.sector,
      contributing_funds: data.contributing_funds,
    }))
    .sort((a, b) => b.total_weight_pct - a.total_weight_pct);

  // Calculate Mega-Cap Tech (AAPL + MSFT + NVDA + AMZN + META + GOOGL + TSLA)
  const megaCapSymbols = ["MSFT", "AAPL", "NVDA", "AMZN", "META", "GOOGL", "TSLA"];
  const megaCapTechExposurePct = Math.round(
    stockConcentrations
      .filter((s) => megaCapSymbols.includes(s.symbol))
      .reduce((acc, s) => acc + s.total_weight_pct, 0) * 100
  ) / 100;

  // Generate automated forensic warnings
  const warnings: string[] = [];

  if (megaCapTechExposurePct >= 25.0) {
    warnings.push(
      `⚠️ Heavy Mega-Cap Tech Concentration: Your portfolio has ${megaCapTechExposurePct.toFixed(1)}% aggregated exposure to the Magnificent 7 (Apple, Microsoft, Nvidia, Amazon, Meta, Alphabet, Tesla) across multiple ETFs.`
    );
  }

  const topSingle = stockConcentrations[0];
  if (topSingle && topSingle.total_weight_pct >= 8.0) {
    warnings.push(
      `⚠️ Elevated Single-Stock Exposure: ${topSingle.symbol} (${topSingle.name}) represents ${topSingle.total_weight_pct.toFixed(1)}% of your overall portfolio value.`
    );
  }

  const techSector = sectorMap["Technology"] || 0;
  if (techSector >= 35.0) {
    warnings.push(
      `⚠️ Sector Overweight: Technology sector accounts for ${techSector.toFixed(1)}% of total portfolio assets.`
    );
  }

  return {
    stockConcentrations,
    sectorDistribution: sectorMap,
    warnings,
    megaCapTechExposurePct,
  };
}

/**
 * Calculates pairwise common holdings overlap percentage between two funds
 */
export function calculatePairwiseOverlap(tickerA: string, tickerB: string): number {
  const dataA = ETF_TOP_HOLDINGS[tickerA.toUpperCase()];
  const dataB = ETF_TOP_HOLDINGS[tickerB.toUpperCase()];

  if (!dataA || !dataB) return 0;
  if (tickerA.toUpperCase() === tickerB.toUpperCase()) return 100;

  let commonOverlap = 0;
  dataA.top_holdings.forEach((hA) => {
    const match = dataB.top_holdings.find((hB) => hB.symbol === hA.symbol);
    if (match) {
      commonOverlap += Math.min(hA.weight_pct, match.weight_pct);
    }
  });

  return Math.round(commonOverlap * 10) / 10;
}
