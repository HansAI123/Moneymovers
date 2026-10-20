import React, { useState } from "react";
import {
  ShieldAlert,
  ShieldCheck,
  AlertTriangle,
  Printer,
  Download,
  Sliders,
  Sparkles,
  Zap,
  TrendingDown,
  DollarSign,
  FileText,
  CheckCircle2,
  AlertOctagon,
  ArrowRight,
  Info,
} from "lucide-react";
import { FundProfile, ProjectWorkspace } from "../types/fund";

interface ExecutiveAuditReportProps {
  funds: FundProfile[];
  activeWorkspace: ProjectWorkspace;
  onSelectFund: (ticker: string) => void;
}

export const ExecutiveAuditReport: React.FC<ExecutiveAuditReportProps> = ({
  funds,
  activeWorkspace,
  onSelectFund,
}) => {
  // Stress-test shock sliders
  const [marketShockPct, setMarketShockPct] = useState<number>(-20);
  const [volatilityVix, setVolatilityVix] = useState<number>(35);
  const [rateCutBps, setRateCutBps] = useState<number>(-100);
  const [activePreset, setActivePreset] = useState<string>("recession");

  // Matched holdings
  const holdingsWithProfiles = activeWorkspace.holdings
    .map((h) => {
      const fund = funds.find((f) => f.ticker === h.ticker);
      return fund ? { ...fund, weightPct: h.weight_pct } : null;
    })
    .filter(Boolean) as (FundProfile & { weightPct: number })[];

  const activeHoldings =
    holdingsWithProfiles.length > 0
      ? holdingsWithProfiles
      : funds.slice(0, 4).map((f) => ({ ...f, weightPct: 25 }));

  // Aggregate metrics
  const portfolioYield = activeHoldings.reduce(
    (acc, f) => acc + (f.distribution_yield_pct * f.weightPct) / 100,
    0
  );
  const annualIncome = (activeWorkspace.initialCapital * portfolioYield) / 100;
  const portfolioNavChange12M = activeHoldings.reduce(
    (acc, f) => acc + (f.nav_change_12m_pct * f.weightPct) / 100,
    0
  );

  // Red trap count
  const redFlags = activeHoldings.filter((f) => f.alert_status === "RED");
  const yellowFlags = activeHoldings.filter((f) => f.alert_status === "YELLOW");

  // Stress-test simulation calculation
  // Covered call funds typically have ~0.70x downside capture of underlying index shocks
  const estimatedPortfolioShock = marketShockPct * 0.72 + (volatilityVix > 30 ? -2.5 : 0);
  const simulatedPortfolioValue =
    activeWorkspace.initialCapital * (1 + estimatedPortfolioShock / 100);
  const capitalAtRisk = activeWorkspace.initialCapital - simulatedPortfolioValue;

  // Distribution cut probability
  let cutRiskProbability = 15;
  if (redFlags.length > 0) cutRiskProbability += redFlags.length * 25;
  if (portfolioNavChange12M < -2.0) cutRiskProbability += 20;
  if (marketShockPct < -15) cutRiskProbability += 15;
  cutRiskProbability = Math.min(95, cutRiskProbability);

  const applyPreset = (presetKey: string) => {
    setActivePreset(presetKey);
    if (presetKey === "recession") {
      setMarketShockPct(-20);
      setVolatilityVix(38);
      setRateCutBps(-100);
    } else if (presetKey === "flash_crash") {
      setMarketShockPct(-10);
      setVolatilityVix(45);
      setRateCutBps(0);
    } else if (presetKey === "stagflation") {
      setMarketShockPct(-12);
      setVolatilityVix(26);
      setRateCutBps(50);
    } else if (presetKey === "soft_landing") {
      setMarketShockPct(5);
      setVolatilityVix(16);
      setRateCutBps(-50);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-6">
      {/* Top Banner: Why this is worth paying monthly */}
      <div className="bg-gradient-to-r from-sky-950/60 via-slate-900 to-[#080d19] border border-sky-500/30 rounded-xl p-5 shadow-lg">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded text-[11px] font-semibold bg-sky-500/20 text-sky-400 border border-sky-500/30">
              <Zap className="w-3.5 h-3.5" />
              <span>Institutional Wealth Intelligence</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
              Executive Audit &amp; Macroeconomic Stress-Testing Engine
            </h2>
            <p className="text-xs sm:text-sm text-slate-300 max-w-2xl">
              Detects hidden capital erosion, models multi-asset shock scenarios, and produces audit-ready compliance reports for fiduciary peace of mind.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="px-4 py-2.5 bg-sky-500 hover:bg-sky-400 text-slate-950 text-xs font-bold rounded-lg transition-colors flex items-center gap-2 cursor-pointer shadow-md"
            >
              <Printer className="w-4 h-4" />
              <span>Print / Export Audit Report</span>
            </button>
          </div>
        </div>
      </div>

      {/* Stress-Testing Console */}
      <div className="bg-[#0f172a] border border-slate-800 rounded-xl p-5 space-y-5">
        <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-slate-800">
          <div>
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <Sliders className="w-4 h-4 text-sky-400" />
              <span>Scenario Stress-Test Simulator</span>
            </h3>
            <p className="text-xs text-slate-400">
              Simulate macro market dislocations and assess downside capital capture vs. S&amp;P 500.
            </p>
          </div>

          {/* Preset Buttons */}
          <div className="flex flex-wrap items-center gap-1.5">
            {[
              { id: "recession", label: "Recession (-20% Equity)" },
              { id: "flash_crash", label: "Vol Spike (VIX 45)" },
              { id: "stagflation", label: "Stagflation" },
              { id: "soft_landing", label: "Soft Landing (+5%)" },
            ].map((p) => (
              <button
                key={p.id}
                onClick={() => applyPreset(p.id)}
                className={`px-2.5 py-1 text-xs rounded transition-colors cursor-pointer ${
                  activePreset === p.id
                    ? "bg-sky-500 text-slate-950 font-bold"
                    : "bg-slate-800 text-slate-300 hover:bg-slate-700"
                }`}
              >
                {p.label}
              </button>
            ))}
          </div>
        </div>

        {/* Sliders Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {/* Slider 1: S&P 500 Market Shock */}
          <div className="bg-[#0b101e] border border-slate-800 p-4 rounded-lg space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-400 font-medium">S&amp;P 500 Equity Shock</span>
              <span className="font-mono font-bold text-white">{marketShockPct}%</span>
            </div>
            <input
              type="range"
              min={-40}
              max={20}
              step={1}
              value={marketShockPct}
              onChange={(e) => {
                setMarketShockPct(Number(e.target.value));
                setActivePreset("custom");
              }}
              className="w-full accent-sky-400 cursor-pointer"
            />
            <div className="flex justify-between text-[10px] text-slate-500 font-mono">
              <span>-40% Crash</span>
              <span>0% Par</span>
              <span>+20% Rally</span>
            </div>
          </div>

          {/* Slider 2: VIX Volatility Index */}
          <div className="bg-[#0b101e] border border-slate-800 p-4 rounded-lg space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-400 font-medium">Market Volatility (VIX)</span>
              <span className="font-mono font-bold text-amber-400">{volatilityVix}</span>
            </div>
            <input
              type="range"
              min={12}
              max={65}
              step={1}
              value={volatilityVix}
              onChange={(e) => {
                setVolatilityVix(Number(e.target.value));
                setActivePreset("custom");
              }}
              className="w-full accent-amber-400 cursor-pointer"
            />
            <div className="flex justify-between text-[10px] text-slate-500 font-mono">
              <span>12 (Calm)</span>
              <span>25 (Elevated)</span>
              <span>65 (Panic)</span>
            </div>
          </div>

          {/* Slider 3: Interest Rate Shock */}
          <div className="bg-[#0b101e] border border-slate-800 p-4 rounded-lg space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-400 font-medium">Fed Funds Rate Shift</span>
              <span className="font-mono font-bold text-emerald-400">{rateCutBps} bps</span>
            </div>
            <input
              type="range"
              min={-200}
              max={150}
              step={25}
              value={rateCutBps}
              onChange={(e) => {
                setRateCutBps(Number(e.target.value));
                setActivePreset("custom");
              }}
              className="w-full accent-emerald-400 cursor-pointer"
            />
            <div className="flex justify-between text-[10px] text-slate-500 font-mono">
              <span>-200 bps Cuts</span>
              <span>0 (Flat)</span>
              <span>+150 bps Hikes</span>
            </div>
          </div>
        </div>

        {/* Stress Simulation Outcomes */}
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 pt-2">
          <div className="bg-[#0b101e] border border-slate-800 p-3.5 rounded-lg">
            <div className="text-[11px] text-slate-400">Simulated Portfolio Impact</div>
            <div
              className={`text-xl font-mono font-bold mt-1 ${
                estimatedPortfolioShock >= 0 ? "text-emerald-400" : "text-rose-400"
              }`}
            >
              {estimatedPortfolioShock >= 0 ? "+" : ""}
              {estimatedPortfolioShock.toFixed(1)}%
            </div>
            <div className="text-[10px] text-slate-400 mt-1 font-mono">
              Capture: 72% of SPY shock
            </div>
          </div>

          <div className="bg-[#0b101e] border border-slate-800 p-3.5 rounded-lg">
            <div className="text-[11px] text-slate-400">Simulated Capital at Risk</div>
            <div className="text-xl font-mono font-bold text-white mt-1">
              ${Math.round(capitalAtRisk).toLocaleString()}
            </div>
            <div className="text-[10px] text-slate-400 mt-1">
              Remaining: ${Math.round(simulatedPortfolioValue).toLocaleString()}
            </div>
          </div>

          <div className="bg-[#0b101e] border border-slate-800 p-3.5 rounded-lg">
            <div className="text-[11px] text-slate-400">Distribution Cut Probability</div>
            <div
              className={`text-xl font-mono font-bold mt-1 ${
                cutRiskProbability >= 50
                  ? "text-rose-400"
                  : cutRiskProbability >= 30
                  ? "text-amber-400"
                  : "text-emerald-400"
              }`}
            >
              {cutRiskProbability}%
            </div>
            <div className="text-[10px] text-slate-400 mt-1">
              {cutRiskProbability >= 50 ? "High Risk: Action Needed" : "Manageable Coverage"}
            </div>
          </div>

          <div className="bg-[#0b101e] border border-slate-800 p-3.5 rounded-lg">
            <div className="text-[11px] text-slate-400">Yield Trap Vulnerability</div>
            <div className="text-xl font-mono font-bold mt-1 text-sky-400">
              {redFlags.length === 0 ? "0 Flags" : `${redFlags.length} Liquidating`}
            </div>
            <div className="text-[10px] text-slate-400 mt-1">
              {redFlags.length > 0 ? "Rebalance recommended" : "Optimal Capital Preservation"}
            </div>
          </div>
        </div>
      </div>

      {/* Printable / Executive Fiduciary Report Container */}
      <div className="bg-[#0f172a] border border-slate-800 rounded-xl p-6 sm:p-8 space-y-6 print:border-none print:p-0 print:bg-white print:text-black">
        {/* Printable Header */}
        <div className="border-b border-slate-800 pb-5 flex flex-wrap items-center justify-between gap-4">
          <div>
            <div className="text-xs uppercase font-mono tracking-widest text-sky-400 font-semibold mb-1">
              Fiduciary Income Audit &amp; Capital Preservation Memorandum
            </div>
            <h3 className="text-xl font-bold text-white">
              Institutional Risk Assessment: {activeWorkspace.name}
            </h3>
            <div className="text-xs text-slate-400 mt-1 flex flex-wrap items-center gap-2">
              <span>Account Type: <strong className="text-slate-200 capitalize">{activeWorkspace.accountType.replace("_", " ")}</strong></span>
              <span>·</span>
              <span>Capital Base: <strong className="text-slate-200 font-mono">${activeWorkspace.initialCapital.toLocaleString()}</strong></span>
              <span>·</span>
              <span>Audit Date: <strong className="text-slate-200">{new Date().toLocaleDateString()}</strong></span>
            </div>
          </div>

          <div className="text-right">
            <div className="text-xs text-slate-400">Composite Health Rating</div>
            <div
              className={`text-lg font-bold font-mono mt-0.5 ${
                redFlags.length === 0 ? "text-emerald-400" : "text-rose-400"
              }`}
            >
              {redFlags.length === 0 ? "TIER-1 CONSERVATIVE" : "ELEVATED CAPITAL DRAG"}
            </div>
          </div>
        </div>

        {/* Executive Summary Finding */}
        <div className="bg-[#080d1a] border border-slate-800 p-4 rounded-xl space-y-2">
          <div className="text-xs font-semibold text-sky-400 uppercase tracking-wide">
            Executive Summary &amp; Forensic Verdict
          </div>
          <p className="text-xs sm:text-sm text-slate-200 leading-relaxed">
            The {activeWorkspace.name} allocation targets an annual yield of{" "}
            <strong className="text-white font-mono">{activeWorkspace.targetYieldPct}%</strong> and currently delivers an audited gross yield of{" "}
            <strong className="text-white font-mono">{portfolioYield.toFixed(2)}%</strong> (~${Math.round(annualIncome).toLocaleString()}/year).{" "}
            {redFlags.length > 0 ? (
              <span className="text-rose-300">
                Warning: {redFlags.length} position(s) ({redFlags.map((r) => r.ticker).join(", ")}) exhibit destructive Return of Capital where payouts are cannibalizing principal NAV (&lt; -3.0% 12M trend). Reallocation to capital-preserving index call spreads is strongly advised to safeguard capital base.
              </span>
            ) : (
              <span className="text-emerald-300">
                The portfolio demonstrates healthy capital preservation with no destructive ROC yield traps detected. Payout cash flow is organically backed by underlying index call option premiums and dividend flow.
              </span>
            )}
          </p>
        </div>

        {/* Portfolio Holdings Audit Table */}
        <div className="space-y-3">
          <div className="text-xs font-semibold text-slate-300 uppercase tracking-wider">
            Audited Portfolio Constituents
          </div>

          <div className="overflow-x-auto rounded-lg border border-slate-800">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-900 text-slate-400 uppercase tracking-wider font-mono text-[10px]">
                <tr>
                  <th className="p-3">Ticker</th>
                  <th className="p-3">Strategy</th>
                  <th className="p-3 text-right">Allocation</th>
                  <th className="p-3 text-right">Yield</th>
                  <th className="p-3 text-right">12M NAV</th>
                  <th className="p-3">Audit Status</th>
                  <th className="p-3">Fiduciary Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/80">
                {activeHoldings.map((fund) => {
                  return (
                    <tr
                      key={fund.ticker}
                      className="hover:bg-slate-800/40 transition-colors"
                    >
                      <td className="p-3 font-bold text-white font-mono">
                        <button
                          onClick={() => onSelectFund(fund.ticker)}
                          className="hover:text-sky-400 transition-colors text-left"
                        >
                          {fund.ticker}
                        </button>
                      </td>
                      <td className="p-3 text-slate-300">{fund.category}</td>
                      <td className="p-3 text-right font-mono text-white">
                        {fund.weightPct}%
                      </td>
                      <td className="p-3 text-right font-mono text-emerald-400 font-semibold">
                        {fund.distribution_yield_pct.toFixed(1)}%
                      </td>
                      <td
                        className={`p-3 text-right font-mono font-semibold ${
                          fund.nav_change_12m_pct >= 0
                            ? "text-emerald-400"
                            : fund.nav_change_12m_pct >= -2.0
                            ? "text-amber-400"
                            : "text-rose-400"
                        }`}
                      >
                        {fund.nav_change_12m_pct >= 0 ? "+" : ""}
                        {fund.nav_change_12m_pct.toFixed(1)}%
                      </td>
                      <td className="p-3">
                        <span
                          className={`inline-flex items-center gap-1 font-semibold ${
                            fund.alert_status === "GREEN"
                              ? "text-emerald-400"
                              : fund.alert_status === "YELLOW"
                              ? "text-amber-400"
                              : "text-rose-400"
                          }`}
                        >
                          {fund.alert_status === "GREEN" && <ShieldCheck className="w-3.5 h-3.5" />}
                          {fund.alert_status === "YELLOW" && <AlertTriangle className="w-3.5 h-3.5" />}
                          {fund.alert_status === "RED" && <AlertOctagon className="w-3.5 h-3.5" />}
                          <span>{fund.alert_status}</span>
                        </span>
                      </td>
                      <td className="p-3 text-slate-300">
                        {fund.alert_status === "GREEN" ? (
                          <span className="text-emerald-400 text-[11px]">Retain (Benchmark)</span>
                        ) : (
                          <span className="text-sky-400 text-[11px] font-medium">
                            Swap &rarr; {fund.replacement_candidate}
                          </span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Fiduciary Action Checklist */}
        <div className="bg-[#0b101e] border border-slate-800 p-4 rounded-xl space-y-3">
          <div className="text-xs font-semibold text-slate-300 uppercase tracking-wide">
            Fiduciary Optimization Checklist
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
            <div className="flex items-start gap-2.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
              <div className="text-slate-300">
                <strong className="text-white">Tax Drag Optimization</strong>: Ensure high Section 1256 option writing funds (SPYI) are allocated in taxable accounts to capture 60/40 capital gains rates.
              </div>
            </div>

            <div className="flex items-start gap-2.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
              <div className="text-slate-300">
                <strong className="text-white">Cap-Lag Protection</strong>: Use out-of-the-money (OTM) or call spread writing structures to minimize upside capping during sharp index rallies.
              </div>
            </div>

            <div className="flex items-start gap-2.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
              <div className="text-slate-300">
                <strong className="text-white">Dividend Sustainability Audit</strong>: Re-evaluate fund distributions every quarter to confirm monthly payouts do not exceed total trailing returns.
              </div>
            </div>

            <div className="flex items-start gap-2.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
              <div className="text-slate-300">
                <strong className="text-white">Synthetic Single-Stock Boundary</strong>: Cap single-stock synthetic option strategies (TSLY, CONY) below 10% of total allocation due to extreme underlying beta.
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
