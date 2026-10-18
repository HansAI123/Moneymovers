import React from "react";
import { FundProfile, BenchmarkMetrics } from "../types/fund";
import { ShieldCheck, AlertTriangle, AlertOctagon, TrendingUp, TrendingDown, ArrowUpRight } from "lucide-react";
import { TableFilter } from "./FundMatrixTable";

interface MetricRibbonProps {
  funds: FundProfile[];
  benchmarks: Record<"SPY" | "QQQ", BenchmarkMetrics>;
  onFilterByStatus?: (status: TableFilter) => void;
  activeFilter?: TableFilter;
}

export const MetricRibbon: React.FC<MetricRibbonProps> = ({
  funds,
  benchmarks,
  onFilterByStatus,
  activeFilter = "ALL",
}) => {
  const totalFunds = funds.length;
  const greenCount = funds.filter((f) => f.alert_status === "GREEN").length;
  const yellowCount = funds.filter((f) => f.alert_status === "YELLOW").length;
  const redCount = funds.filter((f) => f.alert_status === "RED").length;
  const destructiveRocCount = funds.filter((f) => f.is_destructive_roc).length;

  const growingCount = funds.filter((f) => f.dividend_growth_classification === "Growing").length;
  const decliningCount = funds.filter((f) => f.dividend_growth_classification === "Declining").length;

  const fundsWith3y = funds.filter((f) => f.dividend_cagr_3y_pct !== null);
  const avg3yCagr =
    fundsWith3y.length > 0
      ? fundsWith3y.reduce((acc, f) => acc + (f.dividend_cagr_3y_pct || 0), 0) / fundsWith3y.length
      : 0;

  const avgYield =
    funds.reduce((acc, f) => acc + f.distribution_yield_pct, 0) / (totalFunds || 1);

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 mb-6">
      {/* Average Yield */}
      <div className="bg-[#0f172a] border border-slate-800 rounded-lg p-3.5">
        <div className="text-xs text-slate-400 font-medium mb-1">Average Distribution Yield</div>
        <div className="flex items-baseline justify-between">
          <span className="text-2xl font-bold text-white font-mono tabular-nums">
            {avgYield.toFixed(1)}%
          </span>
          <span className="text-xs text-slate-500">{totalFunds} Positions</span>
        </div>
        <div className="text-[11px] text-slate-500 mt-1">Weighted fleet distribution</div>
      </div>

      {/* Sustainable Income Growers (Dividend CAGR > 2%) */}
      <button
        onClick={() => onFilterByStatus?.("GROWING")}
        className={`bg-[#0f172a] border rounded-lg p-3.5 text-left transition-colors cursor-pointer group ${
          activeFilter === "GROWING"
            ? "border-emerald-500 bg-emerald-950/20"
            : "border-slate-800 hover:border-emerald-500/50"
        }`}
      >
        <div className="flex items-center justify-between text-xs text-emerald-400 font-medium mb-1">
          <span>Income Growers</span>
          <TrendingUp className="w-3.5 h-3.5" />
        </div>
        <div className="flex items-baseline justify-between">
          <span className="text-2xl font-bold text-emerald-400 font-mono tabular-nums">
            {growingCount}
          </span>
          <span className="text-xs text-emerald-500/90 font-mono font-medium">
            +{avg3yCagr.toFixed(1)}% 3Y avg
          </span>
        </div>
        <div className="text-[11px] text-emerald-400/80 mt-1 flex items-center gap-1">
          <span>Sustainable dividend expansion</span>
          <ArrowUpRight className="w-3 h-3" />
        </div>
      </button>

      {/* Healthy NAV Trend (GREEN) */}
      <button
        onClick={() => onFilterByStatus?.("GREEN")}
        className={`bg-[#0f172a] border rounded-lg p-3.5 text-left transition-colors cursor-pointer group ${
          activeFilter === "GREEN"
            ? "border-emerald-500 bg-emerald-950/20"
            : "border-slate-800 hover:border-emerald-500/50"
        }`}
      >
        <div className="flex items-center justify-between text-xs text-emerald-400 font-medium mb-1">
          <span>Healthy NAV Status</span>
          <ShieldCheck className="w-3.5 h-3.5" />
        </div>
        <div className="flex items-baseline justify-between">
          <span className="text-2xl font-bold text-emerald-400 font-mono tabular-nums">
            {greenCount}
          </span>
          <span className="text-xs text-emerald-500/80 font-medium">Alert: GREEN</span>
        </div>
        <div className="text-[11px] text-slate-400 mt-1">NAV &ge; -1.5% · Positive return</div>
      </button>

      {/* Mild Erosion (YELLOW) */}
      <button
        onClick={() => onFilterByStatus?.("YELLOW")}
        className={`bg-[#0f172a] border rounded-lg p-3.5 text-left transition-colors cursor-pointer group ${
          activeFilter === "YELLOW"
            ? "border-amber-500 bg-amber-950/20"
            : "border-slate-800 hover:border-amber-500/50"
        }`}
      >
        <div className="flex items-center justify-between text-xs text-amber-400 font-medium mb-1">
          <span>Mild NAV Erosion Risk</span>
          <AlertTriangle className="w-3.5 h-3.5" />
        </div>
        <div className="flex items-baseline justify-between">
          <span className="text-2xl font-bold text-amber-400 font-mono tabular-nums">
            {yellowCount}
          </span>
          <span className="text-xs text-amber-500/80 font-medium">Alert: YELLOW</span>
        </div>
        <div className="text-[11px] text-slate-400 mt-1">NAV -1.5% to -3.0% · Payout cut risk</div>
      </button>

      {/* Severe Erosion & Destructive ROC (RED) */}
      <button
        onClick={() => onFilterByStatus?.("RED")}
        className={`bg-[#0f172a] border rounded-lg p-3.5 text-left transition-colors cursor-pointer group ${
          activeFilter === "RED"
            ? "border-rose-500 bg-rose-950/20"
            : "border-slate-800 hover:border-rose-500/50"
        }`}
      >
        <div className="flex items-center justify-between text-xs text-rose-400 font-medium mb-1">
          <span>Severe NAV Erosion</span>
          <AlertOctagon className="w-3.5 h-3.5" />
        </div>
        <div className="flex items-baseline justify-between">
          <span className="text-2xl font-bold text-rose-400 font-mono tabular-nums">
            {redCount}
          </span>
          <span className="text-xs text-rose-400 font-medium">Alert: RED</span>
        </div>
        <div className="text-[11px] text-rose-300/80 mt-1">
          {destructiveRocCount} destructive ROC · {decliningCount} decaying
        </div>
      </button>

      {/* Benchmark Reference */}
      <div className="bg-[#0f172a] border border-slate-800 rounded-lg p-3.5">
        <div className="flex items-center justify-between text-xs text-slate-400 font-medium mb-1">
          <span>Benchmark 12M Beta</span>
          <TrendingUp className="w-3.5 h-3.5 text-sky-400" />
        </div>
        <div className="flex items-center justify-between text-xs text-slate-300 font-mono tabular-nums mt-1">
          <span>SPY: <strong className="text-emerald-400">+{benchmarks.SPY.return_12m_pct}%</strong></span>
          <span>QQQ: <strong className="text-emerald-400">+{benchmarks.QQQ.return_12m_pct}%</strong></span>
        </div>
        <div className="text-[11px] text-slate-500 mt-1.5">Isolates market beta vs. option bleed</div>
      </div>
    </div>
  );
};
