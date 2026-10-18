import React, { useState } from "react";
import { FundProfile, BenchmarkMetrics } from "../types/fund";
import { TrendingUp, Info, Scale, ArrowUpRight, ArrowDownRight } from "lucide-react";

interface BenchmarkComparisonProps {
  funds: FundProfile[];
  benchmarks: Record<"SPY" | "QQQ", BenchmarkMetrics>;
  onSelectFund: (ticker: string) => void;
}

export const BenchmarkComparison: React.FC<BenchmarkComparisonProps> = ({
  funds,
  benchmarks,
  onSelectFund,
}) => {
  const [selectedBenchmark, setSelectedBenchmark] = useState<"SPY" | "QQQ">("SPY");
  const benchmark = benchmarks[selectedBenchmark];

  return (
    <div className="space-y-6">
      {/* Benchmark Header & Selector */}
      <div className="bg-[#0f172a] border border-slate-800 rounded-lg p-5">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h2 className="text-base font-semibold text-white flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-sky-400" />
              <span>Underlying Benchmark Audit &amp; Market Beta Decoupling</span>
            </h2>
            <p className="text-xs text-slate-400 mt-1 max-w-2xl">
              Comparing income fund NAV trajectories against broad market indices isolates whether a fund's performance reflects general equity beta or structural destructive ROC caused by upside call-capping and downside capture.
            </p>
          </div>

          {/* Benchmark Selector Segmented Controls */}
          <div className="flex items-center gap-1 p-1 bg-slate-900 rounded-lg border border-slate-800">
            <button
              onClick={() => setSelectedBenchmark("SPY")}
              className={`px-3 py-1.5 text-xs font-medium rounded transition-colors ${
                selectedBenchmark === "SPY"
                  ? "bg-sky-500 text-slate-950 font-bold shadow-sm"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              SPY (S&amp;P 500: +{benchmarks.SPY.return_12m_pct}%)
            </button>
            <button
              onClick={() => setSelectedBenchmark("QQQ")}
              className={`px-3 py-1.5 text-xs font-medium rounded transition-colors ${
                selectedBenchmark === "QQQ"
                  ? "bg-sky-500 text-slate-950 font-bold shadow-sm"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              QQQ (Nasdaq-100: +{benchmarks.QQQ.return_12m_pct}%)
            </button>
          </div>
        </div>

        {/* Benchmark Metric Highlight Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mt-4 pt-4 border-t border-slate-800">
          <div className="bg-[#0b101e] border border-slate-800/80 rounded p-3 text-xs">
            <div className="text-slate-400">3-Month Return</div>
            <div className="text-base font-bold text-emerald-400 font-mono mt-0.5">
              +{benchmark.return_3m_pct}%
            </div>
            <div className="text-[11px] text-slate-500">Short-term market momentum</div>
          </div>
          <div className="bg-[#0b101e] border border-slate-800/80 rounded p-3 text-xs">
            <div className="text-slate-400">6-Month Return</div>
            <div className="text-base font-bold text-emerald-400 font-mono mt-0.5">
              +{benchmark.return_6m_pct}%
            </div>
            <div className="text-[11px] text-slate-500">Intermediate market trend</div>
          </div>
          <div className="bg-[#0b101e] border border-slate-800/80 rounded p-3 text-xs">
            <div className="text-slate-400">12-Month Total Return</div>
            <div className="text-base font-bold text-emerald-400 font-mono mt-0.5">
              +{benchmark.return_12m_pct}%
            </div>
            <div className="text-[11px] text-slate-500">Benchmark hurdle rate</div>
          </div>
        </div>
      </div>

      {/* Comparative Matrix: Fund NAV vs Benchmark */}
      <div className="bg-[#0f172a] border border-slate-800 rounded-lg p-5">
        <h3 className="text-sm font-semibold text-white mb-1">
          Relative Performance vs. {benchmark.ticker} ({benchmark.name})
        </h3>
        <p className="text-xs text-slate-400 mb-4">
          Funds showing severe NAV decay in a market that climbed +{benchmark.return_12m_pct}% have severe structural option asymmetric payoff or destructive capital liquidation.
        </p>

        <div className="space-y-4">
          {funds.map((fund) => {
            const navDivergence = fund.nav_change_12m_pct - benchmark.return_12m_pct;
            const totalReturnDivergence = fund.total_return_12m_pct - benchmark.return_12m_pct;

            return (
              <div
                key={fund.ticker}
                onClick={() => onSelectFund(fund.ticker)}
                className="bg-[#0b101e] border border-slate-800 hover:border-slate-700 rounded-lg p-4 transition-colors cursor-pointer"
              >
                <div className="flex flex-wrap items-center justify-between gap-3 mb-2">
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-bold text-white text-sm">
                      {fund.ticker}
                    </span>
                    <span className="text-slate-400 text-xs">({fund.fund_name})</span>
                    <span className="text-[11px] text-slate-500">· {fund.category}</span>
                  </div>

                  <div className="flex items-center gap-3">
                    <span className="text-xs font-mono font-semibold text-white">
                      Yield: {fund.distribution_yield_pct.toFixed(1)}%
                    </span>
                    <div
                      className={`text-xs px-2 py-0.5 rounded font-bold border ${
                        fund.alert_status === "GREEN"
                          ? "bg-emerald-950 text-emerald-300 border-emerald-800"
                          : fund.alert_status === "YELLOW"
                          ? "bg-amber-950 text-amber-300 border-amber-800"
                          : "bg-rose-950 text-rose-300 border-rose-800"
                      }`}
                    >
                      {fund.alert_status}
                    </div>
                  </div>
                </div>

                {/* Performance Comparison Grid */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs font-mono tabular-nums pt-2 border-t border-slate-800/60">
                  <div>
                    <span className="text-slate-400 font-sans block text-[11px]">Fund 12M NAV</span>
                    <span
                      className={`font-semibold ${
                        fund.nav_change_12m_pct >= -1.5
                          ? "text-emerald-400"
                          : fund.nav_change_12m_pct >= -3.0
                          ? "text-amber-400"
                          : "text-rose-400"
                      }`}
                    >
                      {fund.nav_change_12m_pct > 0 ? "+" : ""}
                      {fund.nav_change_12m_pct.toFixed(1)}%
                    </span>
                  </div>

                  <div>
                    <span className="text-slate-400 font-sans block text-[11px]">12M Total Return</span>
                    <span
                      className={`font-semibold ${
                        fund.total_return_12m_pct >= 0 ? "text-emerald-400" : "text-rose-400"
                      }`}
                    >
                      {fund.total_return_12m_pct > 0 ? "+" : ""}
                      {fund.total_return_12m_pct.toFixed(1)}%
                    </span>
                  </div>

                  <div>
                    <span className="text-slate-400 font-sans block text-[11px]">NAV Lag vs {benchmark.ticker}</span>
                    <span className="font-semibold text-slate-300">
                      {navDivergence > 0 ? "+" : ""}
                      {navDivergence.toFixed(1)}%
                    </span>
                  </div>

                  <div>
                    <span className="text-slate-400 font-sans block text-[11px]">Total Return Lag</span>
                    <span
                      className={`font-semibold ${
                        totalReturnDivergence >= 0 ? "text-emerald-400" : "text-amber-400"
                      }`}
                    >
                      {totalReturnDivergence > 0 ? "+" : ""}
                      {totalReturnDivergence.toFixed(1)}%
                    </span>
                  </div>
                </div>

                {/* Analytical Insight */}
                <div className="mt-2 pt-2 border-t border-slate-800/40 text-[11px] text-slate-400 font-sans flex items-start gap-1.5">
                  <Info className="w-3.5 h-3.5 text-sky-400 shrink-0 mt-0.5" />
                  <span>
                    {fund.is_destructive_roc
                      ? `Severe Destructive Drag: In a +${benchmark.return_12m_pct}% bull market, NAV fell ${fund.nav_change_12m_pct.toFixed(1)}%. Option strikes capping upside while bearing full volatility drawdowns.`
                      : fund.alert_status === "YELLOW"
                      ? `Mild Upside Lag: ATM option overwriting captured high income but capped NAV recovery by ${Math.abs(navDivergence).toFixed(1)}% vs. benchmark.`
                      : `Healthy Trade-off: Out-of-the-money strategy preserved positive capital expansion while harvesting ${fund.distribution_yield_pct.toFixed(1)}% cash income.`}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
