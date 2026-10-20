import React, { useState, useMemo } from "react";
import { FundProfile, ProjectWorkspace } from "../types/fund";
import {
  calculatePortfolioOverlap,
  calculatePairwiseOverlap,
  ETF_TOP_HOLDINGS,
} from "../data/overlapData";
import {
  Layers,
  AlertTriangle,
  ShieldAlert,
  Search,
  PieChart,
  BarChart3,
  TrendingUp,
  Info,
  CheckCircle2,
  AlertOctagon,
  Sparkles,
  ArrowRight,
  ExternalLink,
} from "lucide-react";

interface OverlapMatrixProps {
  availableFunds: FundProfile[];
  activeWorkspace: ProjectWorkspace;
  onSelectFund: (ticker: string) => void;
}

export const OverlapMatrix: React.FC<OverlapMatrixProps> = ({
  availableFunds,
  activeWorkspace,
  onSelectFund,
}) => {
  const [stockSearch, setStockSearch] = useState<string>("");
  const [selectedStockSymbol, setSelectedStockSymbol] = useState<string | null>(null);

  // Derive active portfolio holdings from workspace or fallback to default core
  const portfolioHoldings = useMemo(() => {
    if (activeWorkspace.holdings.length > 0) {
      return activeWorkspace.holdings;
    }
    return [
      { ticker: "JEPI", weight_pct: 35 },
      { ticker: "JEPQ", weight_pct: 35 },
      { ticker: "SPYI", weight_pct: 30 },
    ];
  }, [activeWorkspace]);

  // Compute aggregated portfolio overlap, sector exposure, and concentration warnings
  const overlapResults = useMemo(() => {
    return calculatePortfolioOverlap(portfolioHoldings);
  }, [portfolioHoldings]);

  // Filtered underlying stock concentrations
  const filteredStocks = useMemo(() => {
    if (!stockSearch.trim()) return overlapResults.stockConcentrations;
    const query = stockSearch.trim().toUpperCase();
    return overlapResults.stockConcentrations.filter(
      (s) => s.symbol.includes(query) || s.name.toUpperCase().includes(query)
    );
  }, [overlapResults.stockConcentrations, stockSearch]);

  const activeTickers = portfolioHoldings.map((h) => h.ticker);

  return (
    <div className="space-y-6">
      {/* Header and Summary Ribbon */}
      <div className="bg-[#0f172a] border border-slate-800 rounded-xl p-5 shadow-sm">
        <div className="flex flex-wrap items-start justify-between gap-4 pb-4 border-b border-slate-800">
          <div>
            <div className="flex items-center gap-2.5">
              <div className="p-2 bg-sky-500/10 border border-sky-500/30 rounded-xl text-sky-400">
                <Layers className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-base font-bold text-white tracking-tight flex items-center gap-2">
                  <span>Portfolio Overlap &amp; Concentration Matrix</span>
                  <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded bg-sky-950 text-sky-300 border border-sky-800">
                    Cross-Holding Audit
                  </span>
                </h2>
                <p className="text-xs text-slate-400 mt-0.5">
                  Uncovers hidden single-stock duplication across your ETFs and flags excessive concentration in specific companies or sectors.
                </p>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-400 font-medium">Active Workspace:</span>
            <span className="text-xs font-mono font-bold text-sky-400 bg-sky-950/80 border border-sky-800 px-2.5 py-1 rounded-lg">
              {activeWorkspace.name} ({portfolioHoldings.length} ETFs)
            </span>
          </div>
        </div>

        {/* Forensic Concentration Warning Banners */}
        {overlapResults.warnings.length > 0 && (
          <div className="mt-4 space-y-2">
            {overlapResults.warnings.map((warn, i) => (
              <div
                key={i}
                className="p-3 bg-amber-500/10 border border-amber-500/30 rounded-lg flex items-start gap-2.5 text-xs text-amber-200"
              >
                <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                <span className="leading-relaxed font-medium">{warn}</span>
              </div>
            ))}
          </div>
        )}

        {/* Executive Exposure KPI Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-4">
          <div className="bg-slate-900/90 border border-slate-800 rounded-lg p-3">
            <span className="text-[11px] text-slate-400 block font-medium">Magnificent 7 Exposure</span>
            <div className="flex items-baseline justify-between mt-0.5">
              <span className="text-2xl font-bold font-mono text-white tabular-nums">
                {overlapResults.megaCapTechExposurePct.toFixed(1)}%
              </span>
              <span
                className={`text-[10px] font-bold font-mono px-1.5 py-0.5 rounded ${
                  overlapResults.megaCapTechExposurePct >= 30
                    ? "bg-rose-950 text-rose-300 border border-rose-800"
                    : "bg-emerald-950 text-emerald-300 border border-emerald-800"
                }`}
              >
                {overlapResults.megaCapTechExposurePct >= 30 ? "OVERWEIGHT" : "BALANCED"}
              </span>
            </div>
            <span className="text-[10px] text-slate-500 mt-0.5 block">AAPL, MSFT, NVDA, AMZN...</span>
          </div>

          <div className="bg-slate-900/90 border border-slate-800 rounded-lg p-3">
            <span className="text-[11px] text-slate-400 block font-medium">Largest Single Stock</span>
            <div className="flex items-baseline justify-between mt-0.5">
              <span className="text-xl font-bold font-mono text-sky-400 tabular-nums">
                {overlapResults.stockConcentrations[0]?.symbol || "N/A"}
              </span>
              <span className="text-xs font-mono font-bold text-white">
                {overlapResults.stockConcentrations[0]?.total_weight_pct.toFixed(1) || "0"}%
              </span>
            </div>
            <span className="text-[10px] text-slate-400 truncate block mt-0.5">
              {overlapResults.stockConcentrations[0]?.name || "None"}
            </span>
          </div>

          <div className="bg-slate-900/90 border border-slate-800 rounded-lg p-3">
            <span className="text-[11px] text-slate-400 block font-medium">Dominant Sector</span>
            <div className="flex items-baseline justify-between mt-0.5">
              <span className="text-xl font-bold font-mono text-white truncate max-w-[130px]">
                {Object.entries(overlapResults.sectorDistribution).sort((a, b) => b[1] - a[1])[0]?.[0] || "None"}
              </span>
              <span className="text-xs font-mono font-bold text-sky-400">
                {Object.entries(overlapResults.sectorDistribution).sort((a, b) => b[1] - a[1])[0]?.[1]?.toFixed(1) || "0"}%
              </span>
            </div>
            <span className="text-[10px] text-slate-500 mt-0.5 block">Sector concentration</span>
          </div>

          <div className="bg-slate-900/90 border border-slate-800 rounded-lg p-3">
            <span className="text-[11px] text-slate-400 block font-medium">Underlying Stocks Tracked</span>
            <div className="flex items-baseline justify-between mt-0.5">
              <span className="text-2xl font-bold font-mono text-emerald-400 tabular-nums">
                {overlapResults.stockConcentrations.length}
              </span>
              <span className="text-[10px] text-emerald-500 font-mono">Disaggregated</span>
            </div>
            <span className="text-[10px] text-slate-500 mt-0.5 block">Cross-ETF holdings</span>
          </div>
        </div>
      </div>

      {/* Main Two-Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Top 10 Underlying Stock Exposure Table (7 cols) */}
        <div className="lg:col-span-7 bg-[#0f172a] border border-slate-800 rounded-xl overflow-hidden shadow-sm flex flex-col">
          <div className="p-4 border-b border-slate-800 flex flex-wrap items-center justify-between gap-3">
            <div>
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <span>Top Underlying Equity Exposures</span>
                <span className="text-[10px] text-slate-400 font-normal">
                  (Aggregated across {portfolioHoldings.length} ETFs)
                </span>
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Effective single-stock weight after multiplying fund weight × ETF underlying allocation.
              </p>
            </div>

            {/* Stock Search Filter */}
            <div className="relative w-44">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" />
              <input
                type="text"
                placeholder="Search symbol/name..."
                value={stockSearch}
                onChange={(e) => setStockSearch(e.target.value)}
                className="w-full bg-[#080d1a] border border-slate-700 rounded-lg pl-8 pr-2.5 py-1 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-sky-500"
              />
            </div>
          </div>

          <div className="overflow-x-auto flex-1">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#0b101e] text-slate-400 border-b border-slate-800 text-[11px] font-medium tracking-wider uppercase">
                <tr>
                  <th className="py-3 px-4">Underlying Stock</th>
                  <th className="py-3 px-3">Sector</th>
                  <th className="py-3 px-3 text-right">Portfolio Exposure</th>
                  <th className="py-3 px-4">Contributing ETFs</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 font-mono tabular-nums">
                {filteredStocks.slice(0, 15).map((stock) => {
                  const isHighExposure = stock.total_weight_pct >= 5.0;
                  return (
                    <tr
                      key={stock.symbol}
                      onClick={() => setSelectedStockSymbol(stock.symbol)}
                      className="hover:bg-slate-800/40 transition-colors cursor-pointer"
                    >
                      <td className="py-3 px-4 font-sans">
                        <div className="flex items-center gap-2">
                          <span className="font-mono font-bold text-white">{stock.symbol}</span>
                          {isHighExposure && (
                            <span className="text-[10px] font-bold font-mono px-1.5 py-0.2 rounded bg-amber-950 text-amber-300 border border-amber-800">
                              HIGH
                            </span>
                          )}
                        </div>
                        <div className="text-[11px] text-slate-400 truncate max-w-[170px]">
                          {stock.name}
                        </div>
                      </td>

                      <td className="py-3 px-3 font-sans text-slate-400 text-xs">
                        {stock.sector}
                      </td>

                      <td className="py-3 px-3 text-right font-bold text-sky-400 text-sm">
                        {stock.total_weight_pct.toFixed(2)}%
                      </td>

                      <td className="py-3 px-4 font-sans">
                        <div className="flex flex-wrap gap-1">
                          {stock.contributing_funds.map((cf) => (
                            <span
                              key={cf.ticker}
                              className="px-1.5 py-0.5 rounded text-[10px] font-mono bg-slate-900 border border-slate-700 text-slate-300"
                              title={`${cf.ticker} allocates ${cf.fund_weight}% of portfolio, contributing ${cf.effective_exposure.toFixed(2)}% to ${stock.symbol}`}
                            >
                              {cf.ticker}: {cf.effective_exposure.toFixed(1)}%
                            </span>
                          ))}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Right Column: Sector Breakdown & Pairwise Overlap Heatmap (5 cols) */}
        <div className="lg:col-span-5 space-y-6">
          {/* Sector Allocation Breakdown */}
          <div className="bg-[#0f172a] border border-slate-800 rounded-xl p-4 shadow-sm">
            <h3 className="text-xs font-bold text-white uppercase tracking-wider mb-2 flex items-center gap-1.5">
              <PieChart className="w-4 h-4 text-sky-400" />
              <span>Aggregated Sector Breakdown</span>
            </h3>
            <p className="text-[11px] text-slate-400 mb-3">
              Total macroeconomic sector exposure combined across all portfolio holdings.
            </p>

            <div className="space-y-2.5">
              {Object.entries(overlapResults.sectorDistribution)
                .sort((a, b) => b[1] - a[1])
                .slice(0, 7)
                .map(([sec, weight]) => {
                  const isOverweight = weight >= 30.0;
                  return (
                    <div key={sec} className="space-y-1">
                      <div className="flex items-center justify-between text-xs font-sans">
                        <span className="text-slate-300 font-medium">{sec}</span>
                        <span
                          className={`font-mono font-bold ${
                            isOverweight ? "text-amber-400" : "text-white"
                          }`}
                        >
                          {weight.toFixed(1)}%
                        </span>
                      </div>
                      <div className="h-1.5 w-full bg-slate-800 rounded-full overflow-hidden">
                        <div
                          style={{ width: `${Math.min(100, weight)}%` }}
                          className={`h-full rounded-full ${
                            isOverweight ? "bg-amber-500" : "bg-sky-500"
                          }`}
                        />
                      </div>
                    </div>
                  );
                })}
            </div>
          </div>

          {/* Pairwise ETF Overlap Matrix */}
          <div className="bg-[#0f172a] border border-slate-800 rounded-xl p-4 shadow-sm">
            <h3 className="text-xs font-bold text-white uppercase tracking-wider mb-2 flex items-center gap-1.5">
              <Layers className="w-4 h-4 text-emerald-400" />
              <span>Pairwise Common Holdings Overlap</span>
            </h3>
            <p className="text-[11px] text-slate-400 mb-3">
              Percentage of identical equity holdings shared between any two ETFs in your portfolio.
            </p>

            <div className="overflow-x-auto">
              <table className="w-full text-center text-xs font-mono">
                <thead>
                  <tr className="border-b border-slate-800 text-[10px] text-slate-400">
                    <th className="py-2 px-2 text-left font-sans">ETF</th>
                    {activeTickers.slice(0, 5).map((t) => (
                      <th key={t} className="py-2 px-2 font-bold text-white">
                        {t}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                  {activeTickers.slice(0, 5).map((rowTicker) => (
                    <tr key={rowTicker} className="hover:bg-slate-800/30">
                      <td className="py-2 px-2 text-left font-bold text-white font-sans">
                        {rowTicker}
                      </td>
                      {activeTickers.slice(0, 5).map((colTicker) => {
                        const overlapPct = calculatePairwiseOverlap(rowTicker, colTicker);
                        const isSelf = rowTicker === colTicker;
                        const isHigh = overlapPct >= 40.0;
                        return (
                          <td
                            key={colTicker}
                            className={`py-2 px-2 tabular-nums text-xs font-bold ${
                              isSelf
                                ? "bg-slate-800 text-slate-500"
                                : isHigh
                                ? "bg-amber-950/40 text-amber-300"
                                : "text-slate-300"
                            }`}
                          >
                            {isSelf ? "100%" : `${overlapPct}%`}
                          </td>
                        );
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="mt-3 text-[11px] text-slate-500 flex items-center gap-1.5">
              <Info className="w-3.5 h-3.5 text-slate-500 shrink-0" />
              <span>
                High overlap (&gt;40%) indicates duplicate exposure. Pairing broad index funds like JEPI, SPYI, and XYLD compounds underlying Big Tech beta without adding diversification.
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
