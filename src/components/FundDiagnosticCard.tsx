import React, { useState } from "react";
import { FundProfile, BenchmarkMetrics } from "../types/fund";
import {
  ShieldCheck,
  AlertTriangle,
  AlertOctagon,
  Copy,
  Check,
  TrendingUp,
  ArrowRight,
  Info,
  DollarSign,
  Layers,
  Scale,
  Sparkles,
  Loader2
} from "lucide-react";
import { toStrictJsonOutput } from "../data/fundsData";

interface FundDiagnosticCardProps {
  fund: FundProfile;
  benchmarks: Record<"SPY" | "QQQ", BenchmarkMetrics>;
  onViewJson: (fund: FundProfile) => void;
  onSelectReplacement?: (ticker: string) => void;
  onUpdateFund?: (updated: FundProfile) => void;
}

const CagrSparklineBadge: React.FC<{ value: number | null; minYears: number }> = ({ value, minYears }) => {
  if (value === null) {
    return (
      <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded bg-slate-900 border border-slate-800 text-[11px] text-slate-500 font-sans">
        <svg className="w-5 h-2.5 text-slate-600" viewBox="0 0 24 10" fill="none">
          <line x1="2" y1="5" x2="22" y2="5" stroke="currentColor" strokeWidth="1.5" strokeDasharray="2 2" />
        </svg>
        <span>N/A (&lt;{minYears}Y)</span>
      </span>
    );
  }

  const isPositive = value >= 0;
  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-[11px] font-mono font-semibold border ${
        isPositive
          ? "bg-emerald-950/70 border-emerald-700/60 text-emerald-300 shadow-xs"
          : "bg-rose-950/70 border-rose-700/60 text-rose-300 shadow-xs"
      }`}
    >
      <svg
        className={`w-6 h-3 ${isPositive ? "text-emerald-400" : "text-rose-400"}`}
        viewBox="0 0 24 10"
        fill="none"
      >
        {isPositive ? (
          <path
            d="M 2 8 C 8 7, 14 3, 22 2"
            stroke="currentColor"
            strokeWidth="1.75"
            strokeLinecap="round"
          />
        ) : (
          <path
            d="M 2 2 C 8 3, 14 7, 22 8"
            stroke="currentColor"
            strokeWidth="1.75"
            strokeLinecap="round"
          />
        )}
      </svg>
      <span>
        {isPositive ? "+" : ""}
        {value.toFixed(1)}%
      </span>
    </span>
  );
};

export const FundDiagnosticCard: React.FC<FundDiagnosticCardProps> = ({
  fund,
  benchmarks,
  onViewJson,
  onSelectReplacement,
  onUpdateFund,
}) => {
  const [copied, setCopied] = useState(false);
  const [isAuditing, setIsAuditing] = useState(false);
  const [auditMessage, setAuditMessage] = useState("");

  const benchmark = benchmarks[fund.underlying_benchmark === "QQQ" ? "QQQ" : "SPY"];

  const handleCopyJson = () => {
    const jsonStr = JSON.stringify(toStrictJsonOutput(fund), null, 2);
    navigator.clipboard.writeText(jsonStr);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleRunGeminiAudit = async () => {
    setIsAuditing(true);
    setAuditMessage("");

    try {
      const response = await fetch("/api/analyze-fund", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ticker: fund.ticker }),
      });

      if (!response.ok) throw new Error("Audit request failed");
      const result = await response.json();

      if (onUpdateFund && result.ticker) {
        const updated: FundProfile = {
          ...fund,
          distribution_yield_pct: result.distribution_yield_pct ?? fund.distribution_yield_pct,
          nav_change_3m_pct: result.nav_change_3m_pct ?? fund.nav_change_3m_pct,
          nav_change_6m_pct: result.nav_change_6m_pct ?? fund.nav_change_6m_pct,
          nav_change_12m_pct: result.nav_change_12m_pct ?? fund.nav_change_12m_pct,
          total_return_12m_pct: result.total_return_12m_pct ?? fund.total_return_12m_pct,
          is_destructive_roc: Boolean(result.is_destructive_roc),
          alert_status: result.alert_status || fund.alert_status,
          risk_summary: result.risk_summary || fund.risk_summary,
          replacement_candidate: result.replacement_candidate || fund.replacement_candidate,
          dividend_cagr_3y_pct:
            result.dividend_cagr_3y_pct !== undefined
              ? result.dividend_cagr_3y_pct
              : fund.dividend_cagr_3y_pct,
          dividend_cagr_5y_pct:
            result.dividend_cagr_5y_pct !== undefined
              ? result.dividend_cagr_5y_pct
              : fund.dividend_cagr_5y_pct,
          dividend_growth_classification:
            result.dividend_growth_classification || fund.dividend_growth_classification,
        };
        onUpdateFund(updated);
        setAuditMessage(
          `Diagnostic Audit Verified: ${result.alert_status} · ${
            result.dividend_growth_classification || "Income Analyzed"
          }`
        );
      }
    } catch {
      setAuditMessage("Local quantitative rules applied");
    } finally {
      setIsAuditing(false);
      setTimeout(() => setAuditMessage(""), 4000);
    }
  };

  return (
    <div className="bg-[#0f172a] border border-slate-800 rounded-lg p-5">
      {/* Header: Ticker, Name, Alert Badge & Quick JSON copy */}
      <div className="flex flex-wrap items-start justify-between gap-4 pb-4 border-b border-slate-800">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-2xl font-bold font-mono text-white tracking-tight">
              {fund.ticker}
            </span>
            <span className="text-slate-500 font-sans">·</span>
            <span className="text-sm text-slate-300 font-medium">
              {fund.fund_name}
            </span>
          </div>
          <div className="flex items-center gap-2 text-xs text-slate-400 mt-1">
            <span>{fund.category}</span>
            <span aria-hidden="true">·</span>
            <span>AUM ${fund.aum_billions}B</span>
            <span aria-hidden="true">·</span>
            <span>Expense {fund.expense_ratio_pct}%</span>
            <span aria-hidden="true">·</span>
            <span>Frequency {fund.distribution_frequency}</span>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Status Badge */}
          <div
            className={`px-3 py-1.5 rounded border flex items-center gap-2 text-xs font-bold ${
              fund.alert_status === "GREEN"
                ? "bg-emerald-950/80 border-emerald-600/80 text-emerald-300"
                : fund.alert_status === "YELLOW"
                ? "bg-amber-950/80 border-amber-600/80 text-amber-300"
                : "bg-rose-950/80 border-rose-600/80 text-rose-300"
            }`}
          >
            {fund.alert_status === "GREEN" && <ShieldCheck className="w-4 h-4 text-emerald-400" />}
            {fund.alert_status === "YELLOW" && <AlertTriangle className="w-4 h-4 text-amber-400" />}
            {fund.alert_status === "RED" && <AlertOctagon className="w-4 h-4 text-rose-400" />}
            <span>STATUS: {fund.alert_status}</span>
          </div>

          {/* Forensic Audit Button */}
          <button
            onClick={handleRunGeminiAudit}
            disabled={isAuditing}
            className="px-3 py-1.5 text-xs bg-slate-800 hover:bg-slate-700 text-sky-300 border border-slate-700 rounded transition-colors flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
            title="Re-run real-time quantitative diagnostic audit"
          >
            {isAuditing ? (
              <>
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                <span>Auditing...</span>
              </>
            ) : (
              <>
                <Sparkles className="w-3.5 h-3.5 text-sky-400" />
                <span>Forensic Audit</span>
              </>
            )}
          </button>

          {/* Copy JSON Button */}
          <button
            onClick={handleCopyJson}
            className="px-3 py-1.5 text-xs bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded transition-colors flex items-center gap-1.5 cursor-pointer"
            title="Copy strict JSON response"
          >
            {copied ? (
              <>
                <Check className="w-3.5 h-3.5 text-emerald-400" />
                <span className="text-emerald-400 font-medium">Copied!</span>
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5" />
                <span>Copy JSON</span>
              </>
            )}
          </button>
        </div>
      </div>

      {auditMessage && (
        <div className="mt-2 text-xs text-emerald-400 bg-emerald-950/40 border border-emerald-900 px-3 py-1 rounded">
          {auditMessage}
        </div>
      )}

      {/* Grid: 4 Analytical Modules including Dividend CAGR */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 my-5">
        {/* Module 1: NAV Change Windows */}
        <div className="bg-[#0b101e] border border-slate-800/80 rounded-lg p-3.5">
          <div className="text-xs text-slate-400 font-medium mb-2 flex items-center justify-between">
            <span>NAV Trajectory Trend</span>
            <span className="text-[10px] text-slate-500 font-mono">Net Ex-Date</span>
          </div>
          <div className="space-y-2 font-mono tabular-nums text-xs">
            <div className="flex items-center justify-between">
              <span className="text-slate-400">3-Month NAV</span>
              <span
                className={`font-semibold ${
                  fund.nav_change_3m_pct >= 0
                    ? "text-emerald-400"
                    : fund.nav_change_3m_pct < -3.0
                    ? "text-rose-400"
                    : "text-amber-400"
                }`}
              >
                {fund.nav_change_3m_pct > 0 ? "+" : ""}
                {fund.nav_change_3m_pct.toFixed(1)}%
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-slate-400">6-Month NAV</span>
              <span
                className={`font-semibold ${
                  fund.nav_change_6m_pct >= 0
                    ? "text-emerald-400"
                    : fund.nav_change_6m_pct < -3.0
                    ? "text-rose-400"
                    : "text-amber-400"
                }`}
              >
                {fund.nav_change_6m_pct > 0 ? "+" : ""}
                {fund.nav_change_6m_pct.toFixed(1)}%
              </span>
            </div>
            <div className="flex items-center justify-between border-t border-slate-800 pt-1.5">
              <span className="text-slate-300 font-sans font-medium">12-Month NAV</span>
              <span
                className={`font-bold ${
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
          </div>
          <div className="mt-2.5 pt-2 border-t border-slate-800/60 text-[11px] text-slate-400">
            {fund.nav_change_12m_pct >= -1.5 ? (
              <span className="text-emerald-400">✓ Healthy: NAV preservation &ge; -1.5%</span>
            ) : fund.nav_change_12m_pct >= -3.0 ? (
              <span className="text-amber-400">⚠ Caution: Mild erosion (-1.5% to -3.0%)</span>
            ) : (
              <span className="text-rose-400">✕ Alert: Severe decay (&lt; -3.0%)</span>
            )}
          </div>
        </div>

        {/* Module 2: Total Return vs Underlying Benchmark */}
        <div className="bg-[#0b101e] border border-slate-800/80 rounded-lg p-3.5">
          <div className="text-xs text-slate-400 font-medium mb-2 flex items-center justify-between">
            <span>Total Return vs. Benchmark</span>
            <span className="text-[10px] text-sky-400 font-mono">{benchmark.ticker}</span>
          </div>
          <div className="space-y-2 font-mono tabular-nums text-xs">
            <div className="flex items-center justify-between">
              <span className="text-slate-400">Fund 12M Total Return</span>
              <span
                className={`font-semibold ${
                  fund.total_return_12m_pct >= 0 ? "text-emerald-400" : "text-rose-400"
                }`}
              >
                {fund.total_return_12m_pct > 0 ? "+" : ""}
                {fund.total_return_12m_pct.toFixed(1)}%
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-slate-400">{benchmark.ticker} Benchmark 12M</span>
              <span className="font-semibold text-sky-400">
                +{benchmark.return_12m_pct.toFixed(1)}%
              </span>
            </div>
            <div className="flex items-center justify-between border-t border-slate-800 pt-1.5">
              <span className="text-slate-300 font-sans font-medium">Benchmark Divergence</span>
              <span className="font-semibold text-slate-300">
                {(fund.total_return_12m_pct - benchmark.return_12m_pct).toFixed(1)}%
              </span>
            </div>
          </div>
          <div className="mt-2.5 pt-2 border-t border-slate-800/60 text-[11px] text-slate-400">
            {fund.is_destructive_roc ? (
              <span className="text-rose-400">
                Lags benchmark despite market rally: destructive option bleed.
              </span>
            ) : (
              <span className="text-slate-400">
                Standard covered call trade-off: lower volatility for income.
              </span>
            )}
          </div>
        </div>

        {/* Module 3: Return of Capital (ROC) Health */}
        <div className="bg-[#0b101e] border border-slate-800/80 rounded-lg p-3.5">
          <div className="text-xs text-slate-400 font-medium mb-2 flex items-center justify-between">
            <span>ROC Health Assessment</span>
            <span className="text-[10px] text-slate-500">Distribution Audit</span>
          </div>
          <div className="space-y-2 font-mono tabular-nums text-xs">
            <div className="flex items-center justify-between">
              <span className="text-slate-400">Distribution Yield</span>
              <span className="font-bold text-white">
                {fund.distribution_yield_pct.toFixed(1)}%
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-slate-400">ROC Status</span>
              <span
                className={`font-semibold font-sans ${
                  fund.is_destructive_roc ? "text-rose-400" : "text-emerald-400"
                }`}
              >
                {fund.is_destructive_roc ? "Destructive ROC" : "Sustainable Payout"}
              </span>
            </div>
            <div className="flex items-center justify-between border-t border-slate-800 pt-1.5">
              <span className="text-slate-300 font-sans font-medium">Payout Stability</span>
              <span className="font-sans text-slate-300">{fund.payout_history_stability}</span>
            </div>
          </div>
          <div className="mt-2.5 pt-2 border-t border-slate-800/60 text-[11px]">
            {fund.is_destructive_roc ? (
              <span className="text-rose-300 font-medium">
                Payout is liquidating fund principal to maintain nominal yield.
              </span>
            ) : fund.is_tax_favorable_roc ? (
              <span className="text-emerald-300">
                Tax-advantaged option premium / ROC classification without capital decay.
              </span>
            ) : (
              <span className="text-slate-400">
                Distribution fully covered by investment income.
              </span>
            )}
          </div>
        </div>

        {/* Module 4: 3-Year & 5-Year Dividend CAGR */}
        <div className="bg-[#0b101e] border border-slate-800/80 rounded-lg p-3.5">
          <div className="text-xs text-slate-400 font-medium mb-2 flex items-center justify-between">
            <span>Dividend CAGR &amp; Growth</span>
            <span
              className={`text-[10px] font-sans font-bold px-1.5 py-0.5 rounded ${
                fund.dividend_growth_classification === "Growing"
                  ? "bg-emerald-950 text-emerald-300 border border-emerald-800"
                  : fund.dividend_growth_classification === "Stable"
                  ? "bg-sky-950 text-sky-300 border border-sky-800"
                  : fund.dividend_growth_classification === "Stagnant"
                  ? "bg-amber-950 text-amber-300 border border-amber-800"
                  : fund.dividend_growth_classification === "Declining"
                  ? "bg-rose-950 text-rose-300 border border-rose-800"
                  : "bg-slate-900 text-slate-400 border border-slate-800"
              }`}
            >
              {fund.dividend_growth_classification}
            </span>
          </div>
          <div className="space-y-2 text-xs">
            <div className="flex items-center justify-between">
              <span className="text-slate-400">3-Year Dividend CAGR</span>
              <CagrSparklineBadge value={fund.dividend_cagr_3y_pct} minYears={3} />
            </div>
            <div className="flex items-center justify-between">
              <span className="text-slate-400">5-Year Dividend CAGR</span>
              <CagrSparklineBadge value={fund.dividend_cagr_5y_pct} minYears={5} />
            </div>
            <div className="flex items-center justify-between border-t border-slate-800 pt-1.5 font-sans">
              <span className="text-slate-300 font-medium">Growth Trajectory</span>
              <span className="text-slate-300 text-[11px] font-medium">
                {fund.dividend_growth_classification}
              </span>
            </div>
          </div>
          <div className="mt-2.5 pt-2 border-t border-slate-800/60 text-[11px]">
            {fund.dividend_growth_classification === "Growing" ? (
              <span className="text-emerald-400">
                ✓ Payouts consistently compound, preserving inflation-adjusted purchasing power.
              </span>
            ) : fund.dividend_growth_classification === "Declining" ? (
              <span className="text-rose-400">
                ⚠ Declining payouts: NAV decay systematically compresses nominal dollar cash flow.
              </span>
            ) : fund.dividend_growth_classification === "Stagnant" ? (
              <span className="text-amber-400">
                Flat payout stream; lacks organic inflation-hedging dividend growth.
              </span>
            ) : (
              <span className="text-slate-400">
                Recent inception ({fund.inception_year}); multi-year CAGR still maturing.
              </span>
            )}
          </div>

          {/* Purchasing Power vs Inflation Gauge */}
          <div className="mt-2.5 pt-2 border-t border-slate-800/80 flex items-center justify-between text-[11px]">
            <span className="text-slate-400 font-sans">Real Payout vs. 2.5% Inflation:</span>
            {fund.dividend_cagr_3y_pct !== null && fund.dividend_cagr_3y_pct > 2.5 ? (
              <span className="text-emerald-400 font-mono font-semibold">
                +{(fund.dividend_cagr_3y_pct - 2.5).toFixed(1)}% Real Growth
              </span>
            ) : fund.dividend_cagr_3y_pct !== null && fund.dividend_cagr_3y_pct > 0 ? (
              <span className="text-amber-400 font-mono font-medium">
                -{(2.5 - fund.dividend_cagr_3y_pct).toFixed(1)}% Real Drag
              </span>
            ) : fund.dividend_cagr_3y_pct !== null ? (
              <span className="text-rose-400 font-mono font-bold">
                Eroding Purchasing Power
              </span>
            ) : (
              <span className="text-slate-500 font-mono">Incepted {fund.inception_year}</span>
            )}
          </div>
        </div>
      </div>

      {/* Risk Summary & Replacement Candidate Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-3 border-t border-slate-800">
        {/* Risk Summary */}
        <div className="bg-[#080d1a] border border-slate-800/60 rounded-lg p-4">
          <div className="flex items-center gap-2 text-xs font-semibold text-slate-200 mb-2">
            <Info className="w-4 h-4 text-sky-400 shrink-0" />
            <span>Risk Summary &amp; Sustainability Audit</span>
          </div>
          <p className="text-xs text-slate-300 leading-relaxed">
            {fund.risk_summary}
          </p>
        </div>

        {/* Replacement Candidate Recommendation */}
        <div className="bg-[#080d1a] border border-slate-800/60 rounded-lg p-4">
          <div className="flex items-center gap-2 text-xs font-semibold text-slate-200 mb-2">
            <Scale className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>Actionable Replacement Candidate</span>
          </div>
          <p className="text-xs text-slate-300 leading-relaxed mb-3">
            {fund.replacement_candidate}
          </p>
          {fund.alert_status !== "GREEN" && (
            <div className="text-[11px] text-sky-400/90 flex items-center gap-1.5">
              <span>Consider reallocating capital to mitigate ongoing NAV cannibalization.</span>
            </div>
          )}
        </div>
      </div>

      {/* 12-Month NAV Trajectory Mini Chart */}
      <div className="mt-5 pt-4 border-t border-slate-800">
        <div className="flex items-center justify-between text-xs text-slate-400 mb-3">
          <span className="font-semibold text-slate-300">
            12-Month Historical NAV Trend &amp; Monthly Distributions
          </span>
          <span className="text-[11px] text-slate-500 font-mono">
            Current NAV: ${fund.current_nav.toFixed(2)}
          </span>
        </div>

        <div className="grid grid-cols-12 gap-1.5 items-end h-28 bg-[#0b101e] p-3 rounded-lg border border-slate-800/60">
          {fund.monthly_nav_history.map((m, idx) => {
            const minNav = Math.min(...fund.monthly_nav_history.map((x) => x.nav)) * 0.95;
            const maxNav = Math.max(...fund.monthly_nav_history.map((x) => x.nav)) * 1.05;
            const heightPct = Math.max(
              15,
              Math.min(100, ((m.nav - minNav) / (maxNav - minNav || 1)) * 100)
            );

            return (
              <div
                key={idx}
                className="flex flex-col items-center justify-end h-full group relative"
              >
                <div className="opacity-0 group-hover:opacity-100 transition-opacity absolute bottom-full mb-1 bg-slate-900 border border-slate-700 text-[10px] text-white px-2 py-1 rounded shadow-lg pointer-events-none z-20 whitespace-nowrap font-mono">
                  <div>{m.month}: ${m.nav.toFixed(2)}</div>
                  <div className="text-sky-300">Div: ${m.distribution.toFixed(2)}</div>
                </div>

                <div
                  className="w-1.5 rounded-t bg-sky-400/80 mb-1"
                  style={{ height: `${Math.min(30, m.distribution * 20)}px` }}
                  title={`Distribution: $${m.distribution}`}
                />

                <div
                  className={`w-full rounded-t transition-all ${
                    fund.alert_status === "GREEN"
                      ? "bg-emerald-600/60 hover:bg-emerald-500"
                      : fund.alert_status === "YELLOW"
                      ? "bg-amber-600/60 hover:bg-amber-500"
                      : "bg-rose-600/60 hover:bg-rose-500"
                  }`}
                  style={{ height: `${heightPct}%` }}
                />
                <span className="text-[10px] text-slate-500 mt-1 font-mono">{m.month}</span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
