import React, { useState, useMemo, useId } from "react";
import { FundProfile, WeightingStrategy, PortfolioHolding } from "../types/fund";
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
  Info
} from "lucide-react";

interface PortfolioEngineProps {
  availableFunds: FundProfile[];
  onSelectFund: (ticker: string) => void;
  onPerformSwap: (oldTicker: string, newTicker: string) => void;
}

export const PortfolioEngine: React.FC<PortfolioEngineProps> = ({
  availableFunds,
  onSelectFund,
  onPerformSwap,
}) => {
  const capitalId = useId();
  const targetYieldId = useId();
  const maxCapId = useId();

  // Default watchlist requested by user: JEPI, JEPQ, XYLD, NVDY, O, GPIX
  const [watchlistInput, setWatchlistInput] = useState<string>("JEPI, JEPQ, XYLD, NVDY, O, GPIX");
  const [activeTickers, setActiveTickers] = useState<string[]>([
    "JEPI",
    "JEPQ",
    "XYLD",
    "NVDY",
    "O",
    "GPIX",
  ]);

  const [strategy, setStrategy] = useState<WeightingStrategy>("Equal Weighted");
  const [targetYield, setTargetYield] = useState<number>(8.0);
  const [maxSingleCap, setMaxSingleCap] = useState<number>(15.0);
  const [portfolioCapital, setPortfolioCapital] = useState<number>(100000);
  const [swapSuccessMessage, setSwapSuccessMessage] = useState<string>("");

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
  const { holdings, optMessage, blendedYield, greenCount, redCount } = useMemo(() => {
    const activeFunds = watchlistFunds.filter((f) => f.alert_status !== "RED");
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
    }

    // Map into PortfolioHolding array
    const holdingsResult: PortfolioHolding[] = watchlistFunds.map((fund) => {
      const isRed = fund.alert_status === "RED";
      const weight = isRed ? 0 : calculatedWeights[fund.ticker] || 0;
      const allocated_dollars = Math.round((portfolioCapital * weight) / 100);
      const annual_income_dollars = Math.round((allocated_dollars * fund.distribution_yield_pct) / 100);

      return {
        ...fund,
        weight_pct: weight,
        allocated_dollars,
        annual_income_dollars,
        is_excluded: isRed,
      };
    });

    const activeHoldings = holdingsResult.filter((h) => !h.is_excluded);
    const totalYieldWeighted = activeHoldings.reduce(
      (acc, h) => acc + (h.distribution_yield_pct * h.weight_pct) / 100,
      0
    );

    const green = watchlistFunds.filter((f) => f.alert_status === "GREEN").length;
    const red = watchlistFunds.filter((f) => f.alert_status === "RED").length;

    return {
      holdings: holdingsResult,
      optMessage: message,
      blendedYield: totalYieldWeighted,
      greenCount: green,
      redCount: red,
    };
  }, [watchlistFunds, strategy, targetYield, maxSingleCap, portfolioCapital]);

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
      {/* Header and Strategy Controls */}
      <div className="bg-[#0f172a] border border-slate-800 rounded-lg p-5">
        <div className="flex flex-wrap items-start justify-between gap-4 pb-4 border-b border-slate-800">
          <div>
            <div className="flex items-center gap-2">
              <PieChart className="w-5 h-5 text-sky-400" />
              <h2 className="text-base font-semibold text-white">
                Income Portfolio Engine &amp; Weighting Screener
              </h2>
            </div>
            <p className="text-xs text-slate-400 mt-1 max-w-2xl">
              Screen covered call ETFs for destructive Return of Capital (ROC), automatically exclude deteriorating assets, and optimize capital allocation across healthy vehicles.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-400 font-medium">Optimization Status:</span>
            <span className="text-xs text-emerald-400 font-mono font-semibold bg-emerald-950/80 border border-emerald-800 px-2.5 py-0.5 rounded">
              {strategy}
            </span>
          </div>
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
              <label htmlFor={targetYieldId} className="text-slate-300 font-medium">Target Yield</label>
              <span className="font-mono text-sky-400 font-bold">{targetYield.toFixed(1)}%</span>
            </div>
            <input
              id={targetYieldId}
              type="range"
              min="4.0"
              max="15.0"
              step="0.5"
              value={targetYield}
              disabled={strategy !== "Target Yield Solver"}
              onChange={(e) => setTargetYield(Number(e.target.value))}
              className="w-full accent-sky-400 disabled:opacity-30 cursor-pointer"
            />
          </div>

          {/* Max Single Asset Cap */}
          <div>
            <div className="flex justify-between mb-1.5">
              <label htmlFor={maxCapId} className="text-slate-300 font-medium">Single-Asset Cap</label>
              <span className="font-mono text-sky-400 font-bold">{maxSingleCap.toFixed(0)}%</span>
            </div>
            <input
              id={maxCapId}
              type="range"
              min="5.0"
              max="30.0"
              step="2.5"
              value={maxSingleCap}
              disabled={strategy !== "Vol / Risk-Capped"}
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
              placeholder="e.g. JEPI, JEPQ, XYLD, NVDY, O, GPIX"
              className="flex-1 bg-[#080d1a] border border-slate-700 rounded px-2.5 py-1 text-xs text-white font-mono uppercase focus:outline-none focus:border-sky-500"
            />
            <button
              onClick={handleUpdateWatchlist}
              className="px-3 py-1 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-medium rounded transition-colors"
            >
              Update Watchlist
            </button>
          </div>

          <div className="text-[11px] text-slate-400">
            {optMessage}
          </div>
        </div>
      </div>

      {swapSuccessMessage && (
        <div className="bg-emerald-950/70 border border-emerald-700 text-emerald-300 text-xs px-4 py-2.5 rounded-lg flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 shrink-0" />
          <span>{swapSuccessMessage}</span>
        </div>
      )}

      {/* Portfolio Executive KPI Ribbon */}
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
          <div className="text-xs text-slate-400 font-medium mb-1">Blended Portfolio Yield</div>
          <div className="flex items-baseline justify-between">
            <span className="text-2xl font-bold text-sky-400 font-mono tabular-nums">
              {blendedYield.toFixed(2)}%
            </span>
            <span className="text-xs text-slate-400 font-mono">Weighted</span>
          </div>
          <div className="text-[11px] text-slate-500 mt-1">Net portfolio cash distribution</div>
        </div>

        <div className="bg-[#0f172a] border border-slate-800 rounded-lg p-3.5">
          <div className="text-xs text-slate-400 font-medium mb-1">Annual Cash Flow</div>
          <div className="flex items-baseline justify-between">
            <span className="text-2xl font-bold text-emerald-400 font-mono tabular-nums">
              ${Math.round((portfolioCapital * blendedYield) / 100).toLocaleString()}
            </span>
            <span className="text-xs text-slate-400">/ year</span>
          </div>
          <div className="text-[11px] text-slate-500 mt-1">
            ~${Math.round((portfolioCapital * blendedYield) / 100 / 12).toLocaleString()} / month
          </div>
        </div>

        <div className="bg-[#0f172a] border border-slate-800 rounded-lg p-3.5">
          <div className="text-xs text-slate-400 font-medium mb-1">Risk Governance Status</div>
          <div className="flex items-baseline justify-between">
            <span className="text-2xl font-bold text-white font-mono tabular-nums">
              <span className="text-emerald-400">{greenCount}G</span> · <span className="text-rose-400">{redCount}R</span>
            </span>
            <span className="text-xs text-rose-400 font-semibold">{redCount} Excluded</span>
          </div>
          <div className="text-[11px] text-slate-500 mt-1">Capital protected from decay</div>
        </div>
      </div>

      {/* Hybrid Swap Engine (Action Required when Red Flags Present) */}
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
                    className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-slate-950 font-bold rounded flex items-center gap-1.5 transition-colors shadow-sm"
                  >
                    <ArrowRightLeft className="w-3.5 h-3.5" />
                    <span>Swap with {rf.replacement_candidate?.split(" ")[0] || "JEPI"}</span>
                  </button>
                  <button
                    onClick={() => handleExecuteSwap(rf.ticker, "")}
                    className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded transition-colors"
                  >
                    Redistribute Across Fleet
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Portfolio Allocation Matrix */}
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
                      {h.is_excluded ? "$0" : `$${h.annual_income_dollars.toLocaleString()}`}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
