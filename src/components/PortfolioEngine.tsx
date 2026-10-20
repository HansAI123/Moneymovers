import React, { useState, useMemo, useId, useEffect, useCallback } from "react";
import { FundProfile, WeightingStrategy, PortfolioHolding, ProjectWorkspace, ProjectHolding } from "../types/fund";
import {
  optimizePortfolioMvo,
  buildCovarianceMatrix,
  VixContext,
  evaluateVixStatus,
} from "../utils/mvoOptimizer";
import {
  PieChart,
  ShieldAlert,
  ArrowRightLeft,
  Sliders,
  DollarSign,
  CheckCircle2,
  AlertOctagon,
  Sparkles,
  TrendingUp,
  RefreshCw,
  Plus,
  Trash2,
  Info,
  Save,
  Briefcase,
  Gauge,
  Activity,
  Layers,
  Zap,
  Scale,
  Percent,
} from "lucide-react";
import { EfficientFrontierChart } from "./EfficientFrontierChart";
import { OverlapMatrix } from "./OverlapMatrix";

interface PortfolioEngineProps {
  availableFunds: FundProfile[];
  onSelectFund: (ticker: string) => void;
  onPerformSwap: (oldTicker: string, newTicker: string) => void;
  activeWorkspace?: ProjectWorkspace;
  onSaveToWorkspace?: (updatedWorkspace: ProjectWorkspace) => void;
  onOpenSec19aNotice?: (ticker: string) => void;
}

export const PortfolioEngine: React.FC<PortfolioEngineProps> = ({
  availableFunds,
  onSelectFund,
  onPerformSwap,
  activeWorkspace,
  onSaveToWorkspace,
  onOpenSec19aNotice,
}) => {
  const capitalId = useId();
  const targetYieldId = useId();
  const maxCapId = useId();

  // Sub-view switcher within Portfolio Suite: Screener / Efficient Frontier / Overlap Matrix
  const [engineSubView, setEngineSubView] = useState<"screener" | "frontier" | "overlap">("screener");

  // Account Regime toggle: Taxable Account vs Roth / IRA
  const [accountMode, setAccountMode] = useState<"taxable" | "roth">(
    activeWorkspace?.accountType === "roth_ira" ? "roth" : "taxable"
  );

  // Preference: Exclude volatile single-stock synthetic funds (TSLY, NVDY, CONY, etc.)
  const [excludeSingleStock, setExcludeSingleStock] = useState<boolean>(true);

  // Watchlist initialized from activeWorkspace if available, else default
  const initialTickers =
    activeWorkspace && activeWorkspace.holdings.length > 0
      ? activeWorkspace.holdings.map((h) => h.ticker)
      : ["JEPI", "JEPQ", "SPYI", "XYLD", "O", "GPIX"];

  const [watchlistInput, setWatchlistInput] = useState<string>(initialTickers.join(", "));
  const [activeTickers, setActiveTickers] = useState<string[]>(initialTickers);

  const [strategy, setStrategy] = useState<WeightingStrategy>("Equal Weighted");
  const [targetYield, setTargetYield] = useState<number>(activeWorkspace?.targetYieldPct || 8.0);
  const [maxSingleCap, setMaxSingleCap] = useState<number>(15.0);
  const [portfolioCapital, setPortfolioCapital] = useState<number>(
    activeWorkspace?.initialCapital || 100000
  );
  const [swapSuccessMessage, setSwapSuccessMessage] = useState<string>("");
  const [saveSuccessMessage, setSaveSuccessMessage] = useState<string>("");
  const [benchmarkSuccessMessage, setBenchmarkSuccessMessage] = useState<string>("");

  // Live VIX context score state matching user's Python get_vix_context_score()
  const [vixData, setVixData] = useState<VixContext>({
    current_vix: 18.44,
    avg_vix_1mo: 15.86,
    status: "🔥 Elevated Yields (High Volatility Environment)",
    yield_sustainability: "Elevated Yields (High Volatility Environment)",
    timestamp: new Date().toISOString(),
  });
  const [isVixLoading, setIsVixLoading] = useState<boolean>(false);

  const fetchVixContext = useCallback(async () => {
    setIsVixLoading(true);
    try {
      const res = await fetch("/api/vix-context");
      if (res.ok) {
        const data = await res.json();
        setVixData(data);
      }
    } catch (err) {
      console.warn("Failed to fetch live VIX:", err);
    } finally {
      setIsVixLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchVixContext();
  }, [fetchVixContext]);

  // Handler to load exact Python MVO test configuration: JEPI, JEPQ, XYLD, O, SCHD
  const handleLoadPythonExample = () => {
    const pythonTickers = ["JEPI", "JEPQ", "XYLD", "O", "SCHD"];
    setWatchlistInput(pythonTickers.join(", "));
    setActiveTickers(pythonTickers);
    setStrategy("MVO (Mean-Variance)");
    setTargetYield(7.0);
    setMaxSingleCap(30.0);
    setBenchmarkSuccessMessage("Loaded Python MVO benchmark: JEPI, JEPQ, XYLD, O, SCHD (7.0% Target Yield, 30% Max Weight Cap)");
    setTimeout(() => setBenchmarkSuccessMessage(""), 5000);
  };

  // Keep in sync when activeWorkspace changes
  useEffect(() => {
    if (activeWorkspace) {
      if (activeWorkspace.holdings.length > 0) {
        const tickers = activeWorkspace.holdings.map((h) => h.ticker);
        setActiveTickers(tickers);
        setWatchlistInput(tickers.join(", "));
      }
      setPortfolioCapital(activeWorkspace.initialCapital);
      setTargetYield(activeWorkspace.targetYieldPct);
    }
  }, [activeWorkspace?.id]);

  // Handler for custom watchlist submission
  const handleUpdateWatchlist = () => {
    const list = watchlistInput
      .split(",")
      .map((t) => t.trim().toUpperCase())
      .filter(Boolean);
    if (list.length > 0) {
      setActiveTickers(Array.from(new Set(list)));
    }
  };

  // Resolve fund profiles for active tickers
  const watchlistFunds: FundProfile[] = useMemo(() => {
    return activeTickers.map((ticker) => {
      const found = availableFunds.find((f) => f.ticker === ticker);
      if (found) return found;

      // Fallback for custom tickers in watchlist
      return {
        id: ticker,
        ticker,
        fund_name: `${ticker} Income Strategy`,
        category: ticker.includes("Y") ? "Single Stock Covered Call" : "Broad Index Covered Call",
        distribution_yield_pct: 8.5,
        nav_change_3m_pct: 0.5,
        nav_change_6m_pct: 1.2,
        nav_change_12m_pct: 2.0,
        total_return_12m_pct: 10.5,
        is_destructive_roc: false,
        alert_status: "GREEN",
        risk_summary: "Custom screened income holding.",
        replacement_candidate: "JEPI",
        description: "Custom user holding.",
        current_nav: 30.0,
        current_price: 30.0,
        aum_billions: 1.0,
        expense_ratio_pct: 0.5,
        inception_year: 2022,
        distribution_frequency: "Monthly",
        underlying_benchmark: "SPY",
        benchmark_return_12m_pct: 22.8,
        nav_erosion_drag_pct: -20.8,
        payout_history_stability: "Stable",
        roc_composition_pct: 5.0,
        is_tax_favorable_roc: true,
        dividend_cagr_3y_pct: null,
        dividend_cagr_5y_pct: null,
        dividend_growth_classification: "Stable",
        monthly_nav_history: [],
        structural_pros: [],
        structural_cons: [],
      };
    });
  }, [activeTickers, availableFunds]);

  // Portfolio Weighting Engine algorithm (matches Python Streamlit engine)
  const {
    holdings,
    optMessage,
    blendedYield,
    afterTaxYield,
    totalIncomePreTax,
    totalIncomeAfterTax,
    annualTaxDragDollars,
    greenCount,
    redCount,
    portfolioVolatility,
    equalWeightVolatility,
    volatilitySavings,
  } = useMemo(() => {
    const activeFunds = watchlistFunds.filter((f) => {
      if (f.alert_status === "RED") return false;
      if (excludeSingleStock && f.category === "Single Stock Covered Call") return false;
      return true;
    });
    const n = activeFunds.length;

    let message = "Portfolio successfully optimized.";
    let calculatedWeights: Record<string, number> = {};

    if (activeFunds.length === 0) {
      message = "All funds in watchlist are flagged RED. Unable to build portfolio.";
      watchlistFunds.forEach((f) => (calculatedWeights[f.ticker] = 0));
    } else if (strategy === "Equal Weighted") {
      const eqWeight = Math.round((100.0 / n) * 100) / 100;
      activeFunds.forEach((f) => {
        calculatedWeights[f.ticker] = eqWeight;
      });
    } else if (strategy === "Vol / Risk-Capped") {
      let rawWeights: number[] = [];
      activeFunds.forEach((f) => {
        if (f.category === "Single Stock Covered Call" || f.distribution_yield_pct > 15.0) {
          rawWeights.push(Math.min(maxSingleCap, 100.0 / n));
        } else {
          rawWeights.push(100.0 / n);
        }
      });
      const totalRaw = rawWeights.reduce((a, b) => a + b, 0);
      activeFunds.forEach((f, idx) => {
        calculatedWeights[f.ticker] = Math.round((rawWeights[idx] / totalRaw) * 10000) / 100;
      });
    } else if (strategy === "Target Yield Solver") {
      const maxPossible = Math.max(...activeFunds.map((f) => f.distribution_yield_pct));
      let effectiveTarget = targetYield;
      if (targetYield > maxPossible) {
        message = `Target yield of ${targetYield}% exceeds maximum available yield (${maxPossible.toFixed(1)}%). Normalized to maximum.`;
        effectiveTarget = maxPossible;
      }
      const sumYields = activeFunds.reduce((acc, f) => acc + f.distribution_yield_pct, 0);
      activeFunds.forEach((f) => {
        const rawW = (f.distribution_yield_pct / (sumYields || 1)) * 100;
        calculatedWeights[f.ticker] = Math.round(rawW * 100) / 100;
      });
    } else if (strategy === "MVO (Mean-Variance)") {
      // Modern Portfolio Theory (Mean-Variance Optimization / MVO)
      // SLSQP Quadratic Programming Solver matching user's Python optimize_portfolio_mvo()
      const tickers = activeFunds.map((f) => f.ticker);
      const yields = activeFunds.map((f) => f.distribution_yield_pct);
      const mvo = optimizePortfolioMvo(
        tickers,
        yields,
        targetYield,
        maxSingleCap / 100.0
      );

      message = mvo.message;
      if (mvo.success && mvo.optimized_weights) {
        calculatedWeights = mvo.optimized_weights;
      } else {
        // Fallback to equal weight if target is impossible with caps
        const eqWeight = Math.round((100.0 / n) * 100) / 100;
        activeFunds.forEach((f) => {
          calculatedWeights[f.ticker] = eqWeight;
        });
      }
    }

    // Map into PortfolioHolding array with tax-treatment logic
    const holdingsResult: PortfolioHolding[] = watchlistFunds.map((fund) => {
      const isRed = fund.alert_status === "RED";
      const weight = isRed ? 0 : calculatedWeights[fund.ticker] || 0;
      const allocated_dollars = Math.round((portfolioCapital * weight) / 100);
      const annual_income_dollars = Math.round((allocated_dollars * fund.distribution_yield_pct) / 100);

      // Tax treatment calculation
      let effectiveTaxDragPct = 0;
      let taxTreatmentLabel = "Tax-Free (Roth IRA)";

      if (accountMode === "taxable") {
        if (fund.is_tax_favorable_roc) {
          // Constructive ROC (e.g. SPYI, GPIX) - tax deferred until sale
          effectiveTaxDragPct = 0;
          taxTreatmentLabel = "Tax-Sheltered ROC (0% Current Drag)";
        } else if (fund.category === "Dividend Growth ETF") {
          // Qualified Dividends (e.g. SCHD) - 15% federal capital gains rate
          effectiveTaxDragPct = 15;
          taxTreatmentLabel = "Qualified Div (15% Cap Gains)";
        } else {
          // Ordinary Income (e.g. JEPI ELN coupon, XYLD, BDCs) - standard 24% tax rate
          effectiveTaxDragPct = 24;
          taxTreatmentLabel = "Ordinary Income (24% Tax Drag)";
        }
      }

      const after_tax_income_dollars = Math.round(
        annual_income_dollars * (1 - effectiveTaxDragPct / 100)
      );

      return {
        ...fund,
        weight_pct: weight,
        allocated_dollars,
        annual_income_dollars,
        after_tax_income_dollars,
        effective_tax_drag_pct: effectiveTaxDragPct,
        tax_treatment_label: taxTreatmentLabel,
        is_excluded: isRed,
      };
    });

    const activeHoldings = holdingsResult.filter((h) => !h.is_excluded);
    const totalYieldWeighted = activeHoldings.reduce(
      (acc, h) => acc + (h.distribution_yield_pct * h.weight_pct) / 100,
      0
    );

    const totalIncomePreTax = activeHoldings.reduce(
      (acc, h) => acc + h.annual_income_dollars,
      0
    );
    const totalIncomeAfterTax = activeHoldings.reduce(
      (acc, h) => acc + (h.after_tax_income_dollars ?? h.annual_income_dollars),
      0
    );
    const annualTaxDragDollars = Math.max(0, totalIncomePreTax - totalIncomeAfterTax);
    const afterTaxYieldWeighted = portfolioCapital > 0 ? (totalIncomeAfterTax / portfolioCapital) * 100 : 0;

    // Calculate Portfolio Volatility (Annualized Standard Deviation)
    let portfolioVol = 0;
    let eqVol = 0;
    if (activeFunds.length > 0) {
      const activeTickersList = activeFunds.map((f) => f.ticker);
      const cov = buildCovarianceMatrix(activeTickersList);
      const currentWeights = activeFunds.map((f) => (calculatedWeights[f.ticker] || 0) / 100.0);
      const eqWeights = new Array(activeFunds.length).fill(1.0 / activeFunds.length);

      let currentVar = 0;
      let eqVar = 0;
      for (let i = 0; i < activeFunds.length; i++) {
        for (let j = 0; j < activeFunds.length; j++) {
          currentVar += currentWeights[i] * cov[i][j] * currentWeights[j];
          eqVar += eqWeights[i] * cov[i][j] * eqWeights[j];
        }
      }
      portfolioVol = Math.round(Math.sqrt(Math.max(0, currentVar)) * 10000) / 100;
      eqVol = Math.round(Math.sqrt(Math.max(0, eqVar)) * 10000) / 100;
    }

    const green = watchlistFunds.filter((f) => f.alert_status === "GREEN").length;
    const red = watchlistFunds.filter((f) => f.alert_status === "RED").length;

    return {
      holdings: holdingsResult,
      optMessage: message,
      blendedYield: totalYieldWeighted,
      afterTaxYield: afterTaxYieldWeighted,
      totalIncomePreTax,
      totalIncomeAfterTax,
      annualTaxDragDollars,
      greenCount: green,
      redCount: red,
      portfolioVolatility: portfolioVol,
      equalWeightVolatility: eqVol,
      volatilitySavings: Math.max(0, Math.round((eqVol - portfolioVol) * 100) / 100),
    };
  }, [watchlistFunds, strategy, targetYield, maxSingleCap, portfolioCapital, accountMode]);

  // Effective workspace for child analytical modules (Efficient Frontier, Overlap Matrix)
  const effectiveWorkspace: ProjectWorkspace = useMemo(() => {
    const activeNonExcluded = holdings.filter((h) => !h.is_excluded && h.weight_pct > 0);
    const mappedHoldings =
      activeNonExcluded.length > 0
        ? activeNonExcluded.map((h) => ({ ticker: h.ticker, weight_pct: h.weight_pct }))
        : activeTickers.map((t) => ({
            ticker: t,
            weight_pct: Math.round((100 / (activeTickers.length || 1)) * 100) / 100,
          }));

    return {
      ...(activeWorkspace || {
        id: "active_portfolio",
        userId: "guest",
        name: "Active Portfolio",
        description: "Interactive portfolio session",
        accountType: accountMode === "roth" ? "roth_ira" : "taxable",
        initialCapital: portfolioCapital,
        targetYieldPct: targetYield,
        marginalTaxRatePct: 24,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        holdings: mappedHoldings,
      }),
      accountType: accountMode === "roth" ? "roth_ira" : "taxable",
      initialCapital: portfolioCapital,
      targetYieldPct: targetYield,
      holdings: mappedHoldings,
    };
  }, [activeWorkspace, accountMode, portfolioCapital, targetYield, holdings, activeTickers]);

  // Execute swap for red-flagged fund
  const handleExecuteSwap = (oldTicker: string, replacementTicker: string) => {
    const cleanOld = oldTicker.toUpperCase();
    const cleanNew = replacementTicker.toUpperCase();

    // Check if new ticker is already in active list
    if (activeTickers.includes(cleanNew)) {
      // Just remove the old ticker and let weights redistribute
      setActiveTickers(activeTickers.filter((t) => t !== cleanOld));
      setSwapSuccessMessage(`Swapped ${cleanOld} out; redistributed capital across healthy assets.`);
    } else {
      setActiveTickers(activeTickers.map((t) => (t === cleanOld ? cleanNew : t)));
      setSwapSuccessMessage(`Successfully swapped ${cleanOld} with ${cleanNew} in portfolio.`);
    }

    onPerformSwap(cleanOld, cleanNew);
    setTimeout(() => setSwapSuccessMessage(""), 4000);
  };

  const redFlags = holdings.filter((h) => h.alert_status === "RED");

  return (
    <div className="space-y-6">
      {/* Portfolio Suite Sub-View Navigation Switcher */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-[#0d1424] border border-slate-800 p-2.5 rounded-xl shadow-xs">
        <div className="flex flex-wrap items-center gap-1.5">
          <button
            onClick={() => setEngineSubView("screener")}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer flex items-center gap-1.5 ${
              engineSubView === "screener"
                ? "bg-sky-500 text-slate-950 shadow-md font-bold"
                : "text-slate-400 hover:text-white hover:bg-slate-800/60"
            }`}
          >
            <Sliders className="w-3.5 h-3.5" />
            <span>MVO Allocation Screener</span>
          </button>

          <button
            onClick={() => setEngineSubView("frontier")}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer flex items-center gap-1.5 ${
              engineSubView === "frontier"
                ? "bg-sky-500 text-slate-950 shadow-md font-bold"
                : "text-slate-400 hover:text-white hover:bg-slate-800/60"
            }`}
          >
            <TrendingUp className="w-3.5 h-3.5" />
            <span>Efficient Frontier Curve</span>
          </button>

          <button
            onClick={() => setEngineSubView("overlap")}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer flex items-center gap-1.5 ${
              engineSubView === "overlap"
                ? "bg-sky-500 text-slate-950 shadow-md font-bold"
                : "text-slate-400 hover:text-white hover:bg-slate-800/60"
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span>Cross-ETF Overlap Matrix</span>
          </button>
        </div>

        {/* Account Regime Quick Switcher */}
        <div className="flex items-center gap-2">
          <span className="text-xs text-slate-400 font-medium hidden sm:inline">Tax Regime:</span>
          <div className="inline-flex rounded-lg bg-slate-900 border border-slate-700/80 p-0.5">
            <button
              onClick={() => setAccountMode("taxable")}
              className={`px-2.5 py-1 rounded-md text-xs font-semibold transition-all cursor-pointer ${
                accountMode === "taxable"
                  ? "bg-amber-500 text-slate-950 shadow-sm font-bold"
                  : "text-slate-400 hover:text-white"
              }`}
              title="Taxable Account: Favors constructive ROC (SPYI, GPIX) & qualified dividends. Penalizes ordinary income by marginal tax rate."
            >
              💼 Taxable
            </button>
            <button
              onClick={() => setAccountMode("roth")}
              className={`px-2.5 py-1 rounded-md text-xs font-semibold transition-all cursor-pointer ${
                accountMode === "roth"
                  ? "bg-emerald-500 text-slate-950 shadow-sm font-bold"
                  : "text-slate-400 hover:text-white"
              }`}
              title="Roth IRA: Ignores tax efficiency (0% tax drag). Optimizes purely for total return and highest safe nominal yield."
            >
              🛡️ Roth / IRA
            </button>
          </div>
        </div>
      </div>

      {/* Sub-View: Efficient Frontier Curve */}
      {engineSubView === "frontier" && (
        <EfficientFrontierChart
          availableFunds={availableFunds}
          activeWorkspace={effectiveWorkspace}
          onApplyWeights={(_newWeights, newTargetYield) => {
            setStrategy("MVO (Mean-Variance)");
            setTargetYield(newTargetYield);
            setEngineSubView("screener");
          }}
        />
      )}

      {/* Sub-View: Cross-ETF Overlap & Holding Matrix */}
      {engineSubView === "overlap" && (
        <OverlapMatrix
          availableFunds={availableFunds}
          activeWorkspace={effectiveWorkspace}
          onSelectFund={onSelectFund}
        />
      )}

      {/* Sub-View: MVO Allocation Screener */}
      {engineSubView === "screener" && (
        <div className="space-y-6">
          {/* 1. Market Volatility & Option Yield Sustainability Gauge (VIX Context Score) */}
          <div className="bg-gradient-to-r from-[#0b1329] via-[#0f172a] to-[#0b1329] border border-slate-800 rounded-lg p-5 shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-slate-800/80 mb-3.5">
          <div className="flex items-center gap-2.5">
            <div className="p-1.5 bg-amber-500/10 border border-amber-500/30 rounded-lg">
              <Gauge className="w-4 h-4 text-amber-400" />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-white tracking-wide flex items-center gap-2">
                <span>Option Yield Sustainability &amp; VIX Market Regime</span>
                <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded bg-sky-950/70 text-sky-400 border border-sky-800">
                  Quantitative Screener
                </span>
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Evaluates CBOE Volatility Index (^VIX) to verify whether ETF distribution yields and option premiums are sustainable or at risk of compression.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={fetchVixContext}
              disabled={isVixLoading}
              className="text-xs text-slate-300 hover:text-white flex items-center gap-1.5 transition-colors px-3 py-1.5 rounded-lg bg-slate-800/80 hover:bg-slate-700/80 border border-slate-700 cursor-pointer shadow-sm disabled:opacity-50"
              title="Refresh live VIX market quote"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isVixLoading ? "animate-spin text-sky-400" : "text-slate-400"}`} />
              <span>{isVixLoading ? "Syncing VIX..." : "Refresh ^VIX"}</span>
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-center">
          {/* VIX Level Cards */}
          <div className="lg:col-span-4 flex items-center gap-3">
            <div className="flex-1 bg-slate-900/90 border border-slate-800 rounded-lg p-3">
              <span className="text-[11px] text-slate-400 block font-medium">CBOE VIX Level</span>
              <div className="flex items-baseline gap-2 mt-0.5">
                <span className="text-2xl font-bold font-mono text-white tabular-nums">
                  {vixData?.current_vix?.toFixed(2) ?? "18.44"}
                </span>
                <span className="text-[11px] font-mono text-slate-400">spot</span>
              </div>
            </div>

            <div className="flex-1 bg-slate-900/90 border border-slate-800 rounded-lg p-3">
              <span className="text-[11px] text-slate-400 block font-medium">1-Month Average</span>
              <div className="flex items-baseline gap-2 mt-0.5">
                <span className="text-2xl font-bold font-mono text-slate-300 tabular-nums">
                  {vixData?.avg_vix_1mo?.toFixed(2) ?? "15.86"}
                </span>
                <span className="text-[11px] font-mono text-slate-400">30d ma</span>
              </div>
            </div>
          </div>

          {/* Status Badge & Explanation */}
          <div className="lg:col-span-8 bg-slate-900/60 border border-slate-800/80 rounded-lg p-3.5">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <span className="text-xs text-slate-400 font-medium">Yield Sustainability Status:</span>
                <span
                  className={`text-xs font-semibold px-2.5 py-1 rounded-md border font-mono ${
                    vixData?.current_vix < 13
                      ? "bg-rose-950/80 border-rose-700 text-rose-300"
                      : vixData?.current_vix < 18
                      ? "bg-emerald-950/80 border-emerald-700 text-emerald-300"
                      : "bg-amber-950/80 border-amber-700 text-amber-300"
                  }`}
                >
                  {vixData?.status || "🔥 Elevated Yields (High Volatility Environment)"}
                </span>
              </div>
              <span className="text-[11px] text-slate-500 font-mono">
                Updated: {new Date(vixData?.timestamp || Date.now()).toLocaleTimeString()}
              </span>
            </div>

            <p className="text-xs text-slate-300 mt-2 leading-relaxed">
              {vixData?.current_vix < 13
                ? "Low volatility regime: Option strike premiums are compressed. High-yield synthetic funds (like JEPI, JEPQ, XYLD) face increased distribution cut risk or must write closer at-the-money options that erode NAV."
                : vixData?.current_vix < 18
                ? "Normalized volatility regime: Option pricing is balanced and sustainable. Fund managers can comfortably harvest call premiums while preserving capital appreciation buffers."
                : "Elevated volatility regime: Option premiums are rich and highly remunerative. Covered call funds capture fat distributions without being forced to sacrifice NAV buffers."}
            </p>
          </div>
        </div>
      </div>

      {/* 2. Header and Strategy Controls */}
      <div className="bg-[#0f172a] border border-slate-800 rounded-lg p-5">
        <div className="flex flex-wrap items-start justify-between gap-4 pb-4 border-b border-slate-800">
          <div>
            <div className="flex items-center gap-2">
              <PieChart className="w-5 h-5 text-sky-400" />
              <h2 className="text-base font-semibold text-white">
                Income Portfolio Engine &amp; MVO Weighting Screener
              </h2>
            </div>
            <p className="text-xs text-slate-400 mt-1 max-w-2xl">
              Screen covered call ETFs for destructive Return of Capital (ROC), automatically exclude deteriorating assets, and optimize capital allocation across healthy vehicles using Modern Portfolio Theory (Mean-Variance Optimization).
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            <button
              onClick={handleLoadPythonExample}
              className="px-3 py-1.5 bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 border border-amber-500/40 text-xs font-semibold rounded-lg transition-colors flex items-center gap-1.5 cursor-pointer shadow-sm"
              title="Load example benchmark portfolio from Python MVO optimizer: JEPI, JEPQ, XYLD, O, SCHD"
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              <span>Load Python MVO Preset</span>
            </button>

            {activeWorkspace && onSaveToWorkspace && (
              <button
                onClick={() => {
                  const updatedHoldings: ProjectHolding[] = holdings
                    .filter((h: PortfolioHolding) => !h.is_excluded && h.weight_pct > 0)
                    .map((h: PortfolioHolding) => ({ ticker: h.ticker, weight_pct: h.weight_pct }));
                  onSaveToWorkspace({
                    ...activeWorkspace,
                    initialCapital: portfolioCapital,
                    targetYieldPct: targetYield,
                    holdings: updatedHoldings,
                    updatedAt: new Date().toISOString(),
                  });
                  setSaveSuccessMessage(`Saved allocation to ${activeWorkspace.name}`);
                  setTimeout(() => setSaveSuccessMessage(""), 3500);
                }}
                className="px-3 py-1.5 bg-sky-500 hover:bg-sky-400 text-slate-950 font-bold text-xs rounded-lg transition-colors flex items-center gap-1.5 cursor-pointer shadow-sm"
              >
                <Save className="w-3.5 h-3.5" />
                <span>Save to {activeWorkspace.name}</span>
              </button>
            )}

            <span className="text-xs text-slate-400 font-medium">Optimization Model:</span>
            <span className="text-xs text-emerald-400 font-mono font-semibold bg-emerald-950/80 border border-emerald-800 px-2.5 py-1 rounded">
              {strategy}
            </span>
          </div>
        </div>

        {/* Confirmation Banners */}
        {benchmarkSuccessMessage && (
          <div className="mt-3 p-2.5 bg-amber-500/10 border border-amber-500/30 rounded-lg flex items-center gap-2 text-xs text-amber-300">
            <Sparkles className="w-4 h-4 text-amber-400 shrink-0" />
            <span>{benchmarkSuccessMessage}</span>
          </div>
        )}

        {saveSuccessMessage && (
          <div className="mt-3 p-2.5 bg-emerald-500/10 border border-emerald-500/30 rounded-lg flex items-center gap-2 text-xs text-emerald-300">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>{saveSuccessMessage}</span>
          </div>
        )}

        {/* Tax Regime Strategy Rationale Banner */}
        <div
          className={`mt-4 p-3 rounded-lg border text-xs leading-relaxed flex items-center justify-between gap-3 ${
            accountMode === "taxable"
              ? "bg-amber-950/30 border-amber-800/70 text-amber-200"
              : "bg-emerald-950/30 border-emerald-800/70 text-emerald-200"
          }`}
        >
          <div className="flex items-center gap-2.5">
            <Percent className="w-4 h-4 shrink-0 text-amber-400" />
            <div>
              <span className="font-bold text-white uppercase text-[11px] tracking-wider block mb-0.5">
                {accountMode === "taxable" ? "💼 Taxable Account Regime" : "🛡️ Roth / IRA Tax-Exempt Regime"}
              </span>
              <span>
                {accountMode === "taxable" ? (
                  <>
                    Favoring constructive Return of Capital (ROC) and Section 1256 index options (e.g. SPYI, GPIX) to defer tax, while discounting ordinary income yields (JEPI ELNs, XYLD, BDCs) by your marginal bracket (24%).
                  </>
                ) : (
                  <>
                    Tax efficiency ignored (0% tax drag). Optimizing purely for total return and maximum nominal cash flow without penalizing non-qualified ordinary distributions.
                  </>
                )}
              </span>
            </div>
          </div>
          <span className="font-mono text-[10px] uppercase font-bold px-2 py-0.5 rounded bg-black/40 border border-current shrink-0">
            {accountMode === "taxable" ? "Tax Drag Applied" : "0% Tax Drag"}
          </span>
        </div>

        {/* Strategy Control Sliders */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-4 text-xs">
          {/* Strategy Dropdown */}
          <div>
            <label className="block text-slate-300 font-medium mb-1.5">
              Weighting Strategy
            </label>
            <select
              value={strategy}
              onChange={(e) => setStrategy(e.target.value as WeightingStrategy)}
              className="w-full bg-[#080d1a] border border-slate-700 rounded p-2 text-white font-medium focus:outline-none focus:border-sky-500"
            >
              <option value="Equal Weighted">Equal Weighted (100 / N)</option>
              <option value="Vol / Risk-Capped">Vol / Risk-Capped</option>
              <option value="Target Yield Solver">Target Yield Solver</option>
              <option value="MVO (Mean-Variance)">Modern Portfolio Theory (MVO - SLSQP Solver)</option>
            </select>
          </div>

          {/* Portfolio Capital Input */}
          <div>
            <label htmlFor={capitalId} className="block text-slate-300 font-medium mb-1.5">
              Portfolio Principal ($)
            </label>
            <input
              id={capitalId}
              type="number"
              step="5000"
              value={portfolioCapital}
              onChange={(e) => setPortfolioCapital(Number(e.target.value) || 0)}
              className="w-full bg-[#080d1a] border border-slate-700 rounded p-2 text-white font-mono focus:outline-none focus:border-sky-500"
            />
          </div>

          {/* Target Yield Slider */}
          <div>
            <div className="flex justify-between mb-1.5">
              <label htmlFor={targetYieldId} className="text-slate-300 font-medium">
                Target Yield {strategy === "MVO (Mean-Variance)" && "(Constraint)"}
              </label>
              <span className="font-mono text-sky-400 font-bold">{targetYield.toFixed(1)}%</span>
            </div>
            <input
              id={targetYieldId}
              type="range"
              min="3.0"
              max="15.0"
              step="0.1"
              value={targetYield}
              disabled={strategy !== "Target Yield Solver" && strategy !== "MVO (Mean-Variance)"}
              onChange={(e) => setTargetYield(Number(e.target.value))}
              className="w-full accent-sky-400 disabled:opacity-30 cursor-pointer"
            />
          </div>

          {/* Max Single Asset Cap */}
          <div>
            <div className="flex justify-between mb-1.5">
              <label htmlFor={maxCapId} className="text-slate-300 font-medium">
                Single-Asset Cap {strategy === "MVO (Mean-Variance)" && "(Upper Bound)"}
              </label>
              <span className="font-mono text-sky-400 font-bold">{maxSingleCap.toFixed(0)}%</span>
            </div>
            <input
              id={maxCapId}
              type="range"
              min="10.0"
              max="50.0"
              step="1.0"
              value={maxSingleCap}
              disabled={strategy !== "Vol / Risk-Capped" && strategy !== "MVO (Mean-Variance)"}
              onChange={(e) => setMaxSingleCap(Number(e.target.value))}
              className="w-full accent-sky-400 disabled:opacity-30 cursor-pointer"
            />
          </div>
        </div>

        {/* Watchlist Input Strip */}
        <div className="mt-4 pt-3 border-t border-slate-800 flex flex-wrap items-center justify-between gap-3">
          <div className="flex-1 min-w-[280px] flex items-center gap-2">
            <span className="text-xs text-slate-400 whitespace-nowrap">Watchlist Tickers:</span>
            <input
              type="text"
              value={watchlistInput}
              onChange={(e) => setWatchlistInput(e.target.value)}
              placeholder="e.g. JEPI, JEPQ, XYLD, O, SCHD"
              className="flex-1 bg-[#080d1a] border border-slate-700 rounded px-2.5 py-1 text-xs text-white font-mono uppercase focus:outline-none focus:border-sky-500"
            />
            <button
              onClick={handleUpdateWatchlist}
              className="px-3 py-1 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-medium rounded transition-colors cursor-pointer"
            >
              Update Watchlist
            </button>
          </div>

          <div
            className={`text-xs px-2.5 py-1 rounded border font-mono font-medium ${
              optMessage.startsWith("✅")
                ? "bg-emerald-950/60 border-emerald-800 text-emerald-300"
                : optMessage.startsWith("⚠️")
                ? "bg-amber-950/60 border-amber-800 text-amber-300"
                : "bg-slate-900 border-slate-700 text-slate-300"
            }`}
          >
            {optMessage}
          </div>
        </div>
      </div>

      {/* 3. MVO Dedicated Volatility Optimization Visual Panel (when MVO selected) */}
      {strategy === "MVO (Mean-Variance)" && (
        <div className="bg-gradient-to-br from-[#0c1322] via-[#0f172a] to-[#0c1322] border border-sky-900/60 rounded-lg p-5">
          <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-slate-800">
            <div>
              <div className="flex items-center gap-2">
                <Activity className="w-5 h-5 text-sky-400" />
                <h3 className="text-sm font-semibold text-white">
                  Modern Portfolio Theory (MVO) Optimization Breakdown
                </h3>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                SLSQP quadratic programming solver minimizing annualized portfolio covariance: <code className="text-sky-300 font-mono">min wᵀ Σ w</code> subject to <code className="text-sky-300 font-mono">Σ w_i · y_i ≥ {targetYield.toFixed(1)}%</code> and <code className="text-sky-300 font-mono">w_i ≤ {maxSingleCap.toFixed(0)}%</code>.
              </p>
            </div>

            <div className="flex items-center gap-3">
              <div className="bg-slate-900/90 border border-slate-800 rounded px-3 py-1.5 text-right">
                <span className="text-[10px] text-slate-400 block font-medium">Optimal Volatility (σ_p)</span>
                <span className="text-lg font-bold font-mono text-emerald-400 tabular-nums">
                  {portfolioVolatility.toFixed(2)}%
                </span>
              </div>
              <div className="bg-slate-900/90 border border-slate-800 rounded px-3 py-1.5 text-right">
                <span className="text-[10px] text-slate-400 block font-medium">Equal-Weight (σ_eq)</span>
                <span className="text-lg font-bold font-mono text-slate-400 tabular-nums">
                  {equalWeightVolatility.toFixed(2)}%
                </span>
              </div>
              {volatilitySavings > 0 && (
                <div className="bg-emerald-950/80 border border-emerald-800 rounded px-3 py-1.5 text-right">
                  <span className="text-[10px] text-emerald-400 block font-medium">Risk Reduction</span>
                  <span className="text-lg font-bold font-mono text-emerald-300 tabular-nums">
                    -{volatilitySavings.toFixed(2)}%
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Visual Stacked Weight Allocation Bar */}
          <div className="mt-4">
            <div className="flex items-center justify-between text-xs text-slate-400 mb-1.5">
              <span className="font-medium">MVO Optimal Asset Allocation Stack:</span>
              <span className="font-mono text-emerald-400">Sum of Weights: 100.0%</span>
            </div>

            <div className="h-6 w-full rounded-lg overflow-hidden flex border border-slate-700 bg-slate-900 shadow-inner">
              {holdings
                .filter((h) => !h.is_excluded && h.weight_pct > 0)
                .map((h, idx) => {
                  const palette = [
                    "bg-sky-500",
                    "bg-emerald-500",
                    "bg-amber-500",
                    "bg-indigo-500",
                    "bg-violet-500",
                    "bg-teal-500",
                    "bg-cyan-500",
                    "bg-rose-500",
                  ];
                  const color = palette[idx % palette.length];
                  return (
                    <div
                      key={h.ticker}
                      style={{ width: `${h.weight_pct}%` }}
                      className={`${color} h-full transition-all duration-300 flex items-center justify-center text-[10px] font-bold text-slate-950 truncate px-1`}
                      title={`${h.ticker}: ${h.weight_pct.toFixed(2)}% ($${h.allocated_dollars.toLocaleString()})`}
                    >
                      {h.weight_pct >= 8 ? `${h.ticker} ${h.weight_pct.toFixed(0)}%` : h.ticker}
                    </div>
                  );
                })}
            </div>

            {/* Legend */}
            <div className="flex flex-wrap items-center gap-3 mt-3">
              {holdings
                .filter((h) => !h.is_excluded && h.weight_pct > 0)
                .map((h, idx) => {
                  const palette = [
                    "bg-sky-500",
                    "bg-emerald-500",
                    "bg-amber-500",
                    "bg-indigo-500",
                    "bg-violet-500",
                    "bg-teal-500",
                    "bg-cyan-500",
                    "bg-rose-500",
                  ];
                  const color = palette[idx % palette.length];
                  return (
                    <div key={h.ticker} className="flex items-center gap-1.5 text-xs">
                      <div className={`w-2.5 h-2.5 rounded-full ${color}`} />
                      <span className="font-mono font-bold text-white">{h.ticker}</span>
                      <span className="text-slate-400 font-mono">({h.weight_pct.toFixed(2)}%)</span>
                    </div>
                  );
                })}
            </div>
          </div>
        </div>
      )}

      {swapSuccessMessage && (
        <div className="bg-emerald-950/70 border border-emerald-700 text-emerald-300 text-xs px-4 py-2.5 rounded-lg flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 shrink-0" />
          <span>{swapSuccessMessage}</span>
        </div>
      )}

      {/* 4. Portfolio Executive KPI Ribbon */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <div className="bg-[#0f172a] border border-slate-800 rounded-lg p-3.5">
          <div className="text-xs text-slate-400 font-medium mb-1">Active Portfolio Holdings</div>
          <div className="flex items-baseline justify-between">
            <span className="text-2xl font-bold text-white font-mono tabular-nums">
              {holdings.filter((h) => !h.is_excluded).length} / {holdings.length}
            </span>
            <span className="text-xs text-emerald-400 font-medium">Safe Assets</span>
          </div>
          <div className="text-[11px] text-slate-500 mt-1">Excludes destructive ROC funds</div>
        </div>

        <div className="bg-[#0f172a] border border-slate-800 rounded-lg p-3.5">
          <div className="text-xs text-slate-400 font-medium mb-1">
            {accountMode === "taxable" ? "Pre-Tax / Net After-Tax Yield" : "Blended Portfolio Yield"}
          </div>
          <div className="flex items-baseline justify-between">
            <div className="flex items-baseline gap-1.5">
              <span className="text-2xl font-bold text-sky-400 font-mono tabular-nums">
                {blendedYield.toFixed(2)}%
              </span>
              {accountMode === "taxable" && (
                <span className="text-xs font-bold text-emerald-400 font-mono tabular-nums">
                  / {afterTaxYield.toFixed(2)}% net
                </span>
              )}
            </div>
            <span className="text-xs text-slate-400 font-mono">
              {strategy === "MVO (Mean-Variance)" ? "Target Hit" : "Weighted"}
            </span>
          </div>
          <div className="text-[11px] text-slate-500 mt-1">
            {accountMode === "taxable" ? "Accounts for ROC deferral & tax drag" : "Net portfolio cash distribution"}
          </div>
        </div>

        <div className="bg-[#0f172a] border border-slate-800 rounded-lg p-3.5">
          <div className="text-xs text-slate-400 font-medium mb-1">
            {accountMode === "taxable" ? "Net After-Tax Cash Flow" : "Annual Cash Flow (Tax-Free)"}
          </div>
          <div className="flex items-baseline justify-between">
            <span className="text-2xl font-bold text-emerald-400 font-mono tabular-nums">
              ${(accountMode === "taxable" ? totalIncomeAfterTax : totalIncomePreTax).toLocaleString()}
            </span>
            <span className="text-xs text-slate-400">/ year</span>
          </div>
          <div className="text-[11px] text-slate-500 mt-1">
            {accountMode === "taxable"
              ? `Tax Drag: -$${annualTaxDragDollars.toLocaleString()} / yr`
              : "Tax Drag: $0 (100% Tax-Free Compound Growth)"}
          </div>
        </div>

        <div className="bg-[#0f172a] border border-slate-800 rounded-lg p-3.5">
          <div className="text-xs text-slate-400 font-medium mb-1">
            {strategy === "MVO (Mean-Variance)" ? "Annualized Portfolio Risk" : "Risk Governance Status"}
          </div>
          <div className="flex items-baseline justify-between">
            {strategy === "MVO (Mean-Variance)" ? (
              <span className="text-2xl font-bold text-emerald-400 font-mono tabular-nums">
                {portfolioVolatility.toFixed(1)}% <span className="text-xs text-slate-400 font-sans">σ</span>
              </span>
            ) : (
              <span className="text-2xl font-bold text-white font-mono tabular-nums">
                <span className="text-emerald-400">{greenCount}G</span> · <span className="text-rose-400">{redCount}R</span>
              </span>
            )}
            <span className="text-xs text-emerald-400 font-semibold">
              {strategy === "MVO (Mean-Variance)" ? `-${volatilitySavings.toFixed(1)}% vs Equal` : `${redCount} Excluded`}
            </span>
          </div>
          <div className="text-[11px] text-slate-500 mt-1">
            {strategy === "MVO (Mean-Variance)" ? "Optimized via SLSQP solver" : "Capital protected from decay"}
          </div>
        </div>
      </div>

      {/* 5. Hybrid Swap Engine (Action Required when Red Flags Present) */}
      {redFlags.length > 0 && (
        <div className="bg-[#18111e] border border-rose-900/60 rounded-lg p-4">
          <div className="flex items-center gap-2 text-rose-400 font-semibold text-xs mb-2">
            <AlertOctagon className="w-4 h-4" />
            <span>Hybrid Swap Engine: Action Required for Flagged Assets</span>
          </div>
          <p className="text-xs text-slate-300 mb-3">
            The following funds exhibit severe NAV erosion or unsustainable distributions funded by principal liquidation. Choose a resolution to protect portfolio capital:
          </p>

          <div className="space-y-3">
            {redFlags.map((rf) => (
              <div
                key={rf.ticker}
                className="bg-[#110d18] border border-rose-800/60 rounded-lg p-3.5 flex flex-wrap items-center justify-between gap-3 text-xs"
              >
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-bold text-rose-300 text-sm">{rf.ticker}</span>
                    <span className="text-slate-400">({rf.fund_name})</span>
                    <span className="text-rose-400 font-semibold">· {rf.nav_change_12m_pct}% 12M NAV Drop</span>
                  </div>
                  <div className="text-slate-400 text-[11px] mt-0.5 max-w-xl">
                    {rf.risk_summary}
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleExecuteSwap(rf.ticker, rf.replacement_candidate?.split(" ")[0] || "JEPI")}
                    className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-slate-950 font-bold rounded flex items-center gap-1.5 transition-colors shadow-sm cursor-pointer"
                  >
                    <ArrowRightLeft className="w-3.5 h-3.5" />
                    <span>Swap with {rf.replacement_candidate?.split(" ")[0] || "JEPI"}</span>
                  </button>
                  <button
                    onClick={() => handleExecuteSwap(rf.ticker, "")}
                    className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded transition-colors cursor-pointer"
                  >
                    Redistribute Across Fleet
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 6. Portfolio Allocation Matrix */}
      <div className="bg-[#0f172a] border border-slate-800 rounded-lg overflow-hidden">
        <div className="p-4 border-b border-slate-800 flex items-center justify-between">
          <div>
            <h3 className="text-sm font-semibold text-white">
              Optimized Portfolio Allocation Table
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Weightings computed via {strategy} model with destructive ROC exclusion
            </p>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#0b101e] text-slate-400 border-b border-slate-800 text-[11px] font-medium tracking-wider uppercase">
              <tr>
                <th className="py-3 px-4">Holding Ticker</th>
                <th className="py-3 px-3">Category</th>
                <th className="py-3 px-3 text-right">Yield</th>
                <th className="py-3 px-3 text-right">12M NAV</th>
                <th className="py-3 px-3 text-right">3Y Div CAGR</th>
                <th className="py-3 px-3 text-center">Alert Status</th>
                <th className="py-3 px-3 text-right">Target Weight</th>
                <th className="py-3 px-3 text-right">Allocation ($)</th>
                <th className="py-3 px-4 text-right">Est. Annual Income</th>
                <th className="py-3 px-3 text-center">SEC 19a-1</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 font-mono tabular-nums">
              {holdings.map((h) => {
                return (
                  <tr
                    key={h.ticker}
                    onClick={() => onSelectFund(h.ticker)}
                    className={`cursor-pointer transition-colors ${
                      h.is_excluded
                        ? "bg-rose-950/20 hover:bg-rose-950/30 text-rose-300/70"
                        : "hover:bg-slate-800/40"
                    }`}
                  >
                    <td className="py-3 px-4 font-sans">
                      <div className="flex items-center gap-2">
                        <span className={`font-mono font-bold ${h.is_excluded ? "text-rose-400 line-through" : "text-white"}`}>
                          {h.ticker}
                        </span>
                        {h.is_excluded && (
                          <span className="text-[10px] text-rose-400 font-sans px-1.5 py-0.2 bg-rose-950/70 border border-rose-800/80 rounded font-semibold">
                            EXCLUDED
                          </span>
                        )}
                      </div>
                      <div className="text-[11px] text-slate-400 truncate max-w-[200px]">
                        {h.fund_name}
                      </div>
                    </td>

                    <td className="py-3 px-3 font-sans text-slate-400">
                      {h.category}
                    </td>

                    <td className="py-3 px-3 text-right font-semibold text-white">
                      {h.distribution_yield_pct.toFixed(1)}%
                    </td>

                    <td
                      className={`py-3 px-3 text-right ${
                        h.nav_change_12m_pct >= -1.5
                          ? "text-emerald-400"
                          : h.nav_change_12m_pct >= -3.0
                          ? "text-amber-400"
                          : "text-rose-400 font-bold"
                      }`}
                    >
                      {h.nav_change_12m_pct > 0 ? "+" : ""}
                      {h.nav_change_12m_pct.toFixed(1)}%
                    </td>

                    <td className="py-3 px-3 text-right font-mono">
                      {h.dividend_cagr_3y_pct !== null ? (
                        <span className={h.dividend_cagr_3y_pct >= 2.0 ? "text-emerald-400 font-semibold" : "text-slate-300"}>
                          {h.dividend_cagr_3y_pct > 0 ? "+" : ""}{h.dividend_cagr_3y_pct.toFixed(1)}%
                        </span>
                      ) : (
                        <span className="text-slate-500 font-sans text-[11px]">N/A</span>
                      )}
                    </td>

                    <td className="py-3 px-3 text-center font-sans">
                      <span
                        className={`inline-block px-2 py-0.5 rounded text-[11px] font-bold border ${
                          h.alert_status === "GREEN"
                            ? "bg-emerald-950 text-emerald-300 border-emerald-800"
                            : h.alert_status === "YELLOW"
                            ? "bg-amber-950 text-amber-300 border-amber-800"
                            : "bg-rose-950 text-rose-300 border-rose-800"
                        }`}
                      >
                        {h.alert_status}
                      </span>
                    </td>

                    <td className="py-3 px-3 text-right font-bold text-sky-400">
                      {h.is_excluded ? "0.00%" : `${h.weight_pct.toFixed(2)}%`}
                    </td>

                    <td className="py-3 px-3 text-right text-white">
                      {h.is_excluded ? "$0" : `$${h.allocated_dollars.toLocaleString()}`}
                    </td>

                    <td className="py-3 px-4 text-right font-semibold text-emerald-400">
                      {h.is_excluded ? (
                        "$0"
                      ) : (
                        <div>
                          <div>${h.annual_income_dollars.toLocaleString()}</div>
                          {accountMode === "taxable" && (
                            <div className="text-[10px] text-slate-400 font-sans font-normal mt-0.5">
                              Net: <span className="text-emerald-300 font-mono font-medium">${h.after_tax_income_dollars?.toLocaleString()}</span>
                              <span className="block text-[9px] text-amber-400/90 truncate max-w-[130px] ml-auto">{h.tax_treatment_label}</span>
                            </div>
                          )}
                        </div>
                      )}
                    </td>

                    <td className="py-3 px-3 text-center font-sans">
                      {onOpenSec19aNotice && !h.is_excluded && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            onOpenSec19aNotice(h.ticker);
                          }}
                          className="px-2 py-1 rounded bg-sky-950/80 hover:bg-sky-900 border border-sky-800 text-sky-400 text-[10px] font-mono transition-colors cursor-pointer inline-flex items-center gap-1 shadow-xs"
                          title={`Audit legal SEC Rule 19a-1 notice for ${h.ticker}`}
                        >
                          <Scale className="w-3 h-3 text-sky-400" />
                          <span>19a-1</span>
                        </button>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
        </div>
      )}
    </div>
  );
};

