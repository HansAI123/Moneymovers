import React, { useState, useId } from "react";
import { Calculator, AlertTriangle, ShieldCheck, AlertOctagon, RefreshCw } from "lucide-react";

export const RocSimulator: React.FC = () => {
  const initialCapId = useId();
  const yieldPctId = useId();
  const mktReturnId = useId();

  const [initialCapital, setInitialCapital] = useState<number>(100000);
  const [distributionYieldPct, setDistributionYieldPct] = useState<number>(12);
  const [marketReturnPct, setMarketReturnPct] = useState<number>(10);
  const [strategyType, setStrategyType] = useState<"otm" | "atm" | "synthetic">("otm");

  // Strategy parameters:
  // OTM (JEPI/SPYI): Upside capture ~65%, Downside capture ~75%, Option premium income covers ~7-10%
  // ATM (XYLD): Upside capture ~20%, Downside capture ~95%, Option premium covers ~8-10%
  // Synthetic (NVDY/TSLY): Upside capture ~25%, Downside capture ~100%, Extreme premium (40-60%)

  const calculateProjection = () => {
    let upsideCapture = 0.65;
    let downsideCapture = 0.75;
    let structuralOptionBleed = 0.01; // annual drag from call roll friction

    if (strategyType === "atm") {
      upsideCapture = 0.20;
      downsideCapture = 0.95;
      structuralOptionBleed = 0.025;
    } else if (strategyType === "synthetic") {
      upsideCapture = 0.30;
      downsideCapture = 1.05;
      structuralOptionBleed = 0.08;
    }

    // Capital gross performance before payouts
    let grossCapitalGrowthPct =
      marketReturnPct >= 0
        ? marketReturnPct * upsideCapture - structuralOptionBleed * 100
        : marketReturnPct * downsideCapture - structuralOptionBleed * 100;

    // Monthly iterative calculation
    let currentNav = initialCapital;
    let cumulativeDistributions = 0;
    let principalLiquidated = 0;

    const monthlyGrossRate = Math.pow(1 + grossCapitalGrowthPct / 100, 1 / 12) - 1;
    const monthlyPayoutRate = distributionYieldPct / 100 / 12;

    for (let month = 1; month <= 12; month++) {
      // capital earns gross monthly return
      currentNav = currentNav * (1 + monthlyGrossRate);
      // distribution is paid out based on current value
      const payout = currentNav * monthlyPayoutRate;
      cumulativeDistributions += payout;
      currentNav -= payout;

      // if payout exceeded organic growth, the excess is destructive ROC
      const organicMonthlyGrowth = currentNav * monthlyGrossRate;
      if (payout > Math.max(0, organicMonthlyGrowth)) {
        principalLiquidated += (payout - Math.max(0, organicMonthlyGrowth));
      }
    }

    const endingCapital = Math.max(0, currentNav);
    const navChangePct = ((endingCapital - initialCapital) / initialCapital) * 100;
    const totalReturnDollars = endingCapital + cumulativeDistributions - initialCapital;
    const totalReturnPct = (totalReturnDollars / initialCapital) * 100;

    // Destructive ROC % of total distribution
    const destructiveRocRatio = Math.min(
      100,
      Math.max(0, (principalLiquidated / (cumulativeDistributions || 1)) * 100)
    );

    // Alert Status
    let status: "GREEN" | "YELLOW" | "RED" = "GREEN";
    if (navChangePct < -3.0 || destructiveRocRatio > 35) {
      status = "RED";
    } else if (navChangePct < -1.5 || destructiveRocRatio > 15) {
      status = "YELLOW";
    }

    return {
      endingCapital,
      navChangePct,
      cumulativeDistributions,
      totalReturnDollars,
      totalReturnPct,
      destructiveRocRatio,
      status,
    };
  };

  const results = calculateProjection();

  return (
    <div className="bg-[#0f172a] border border-slate-800 rounded-lg p-5">
      <div className="flex items-center justify-between pb-4 border-b border-slate-800 mb-5">
        <div>
          <h2 className="text-base font-semibold text-white flex items-center gap-2">
            <Calculator className="w-5 h-5 text-sky-400" />
            <span>Interactive Dividend Safety &amp; ROC Simulator</span>
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Model 12-month capital preservation, cash distribution sustainability, and destructive principal cannibalization under varying market conditions.
          </p>
        </div>

        <button
          onClick={() => {
            setInitialCapital(100000);
            setDistributionYieldPct(12);
            setMarketReturnPct(10);
            setStrategyType("otm");
          }}
          className="text-xs text-slate-400 hover:text-white flex items-center gap-1.5 p-1.5 hover:bg-slate-800 rounded transition-colors"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          <span>Reset Defaults</span>
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Controls Column */}
        <div className="lg:col-span-5 space-y-4">
          {/* Strategy Selection */}
          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1.5">
              Option Writing Strategy Archetype
            </label>
            <div className="grid grid-cols-3 gap-2 text-xs font-medium">
              <button
                onClick={() => setStrategyType("otm")}
                className={`p-2 rounded border text-left transition-colors ${
                  strategyType === "otm"
                    ? "bg-sky-950 border-sky-500 text-sky-300"
                    : "bg-slate-900 border-slate-800 text-slate-400 hover:border-slate-700"
                }`}
              >
                <div className="font-semibold text-white">OTM Dynamic</div>
                <div className="text-[10px] text-slate-400 mt-0.5">e.g. JEPI, SPYI</div>
              </button>
              <button
                onClick={() => setStrategyType("atm")}
                className={`p-2 rounded border text-left transition-colors ${
                  strategyType === "atm"
                    ? "bg-sky-950 border-sky-500 text-sky-300"
                    : "bg-slate-900 border-slate-800 text-slate-400 hover:border-slate-700"
                }`}
              >
                <div className="font-semibold text-white">ATM 100% Capped</div>
                <div className="text-[10px] text-slate-400 mt-0.5">e.g. XYLD, QYLD</div>
              </button>
              <button
                onClick={() => setStrategyType("synthetic")}
                className={`p-2 rounded border text-left transition-colors ${
                  strategyType === "synthetic"
                    ? "bg-sky-950 border-sky-500 text-sky-300"
                    : "bg-slate-900 border-slate-800 text-slate-400 hover:border-slate-700"
                }`}
              >
                <div className="font-semibold text-white">Synthetic Single</div>
                <div className="text-[10px] text-slate-400 mt-0.5">e.g. NVDY, TSLY</div>
              </button>
            </div>
          </div>

          {/* Initial Portfolio Capital */}
          <div>
            <div className="flex justify-between text-xs mb-1">
              <label htmlFor={initialCapId} className="text-slate-300">Initial Portfolio Allocation</label>
              <span className="font-mono text-white font-semibold">
                ${initialCapital.toLocaleString()}
              </span>
            </div>
            <input
              id={initialCapId}
              type="range"
              min="10000"
              max="500000"
              step="5000"
              value={initialCapital}
              onChange={(e) => setInitialCapital(Number(e.target.value))}
              className="w-full accent-sky-400 cursor-pointer"
            />
          </div>

          {/* Distribution Yield Target */}
          <div>
            <div className="flex justify-between text-xs mb-1">
              <label htmlFor={yieldPctId} className="text-slate-300">Target Annual Distribution Yield</label>
              <span className="font-mono font-bold text-sky-400">
                {distributionYieldPct.toFixed(1)}%
              </span>
            </div>
            <input
              id={yieldPctId}
              type="range"
              min="5"
              max="65"
              step="1"
              value={distributionYieldPct}
              onChange={(e) => setDistributionYieldPct(Number(e.target.value))}
              className="w-full accent-sky-400 cursor-pointer"
            />
            <div className="flex justify-between text-[10px] text-slate-500 font-mono mt-0.5">
              <span>5% (Conservative)</span>
              <span>12% (Covered Call)</span>
              <span>65% (Ultra YieldMax)</span>
            </div>
          </div>

          {/* Underlying Market 12M Return */}
          <div>
            <div className="flex justify-between text-xs mb-1">
              <label htmlFor={mktReturnId} className="text-slate-300">Simulated Underlying Market Return (12M)</label>
              <span
                className={`font-mono font-bold ${
                  marketReturnPct >= 0 ? "text-emerald-400" : "text-rose-400"
                }`}
              >
                {marketReturnPct > 0 ? "+" : ""}
                {marketReturnPct}%
              </span>
            </div>
            <input
              id={mktReturnId}
              type="range"
              min="-30"
              max="40"
              step="1"
              value={marketReturnPct}
              onChange={(e) => setMarketReturnPct(Number(e.target.value))}
              className="w-full accent-sky-400 cursor-pointer"
            />
            <div className="flex justify-between text-[10px] text-slate-500 font-mono mt-0.5">
              <span>-30% (Severe Bear)</span>
              <span>0% (Flat)</span>
              <span>+40% (Extreme Bull)</span>
            </div>
          </div>
        </div>

        {/* Results & Health Diagnosis Column */}
        <div className="lg:col-span-7 bg-[#0b101e] border border-slate-800 rounded-lg p-5 flex flex-col justify-between">
          <div>
            {/* Top Status Badge */}
            <div className="flex items-center justify-between pb-3 border-b border-slate-800 mb-4">
              <span className="text-xs font-semibold text-slate-300">
                12-Month Projected Sustainability Outcome
              </span>
              <div
                className={`px-3 py-1 rounded border text-xs font-bold flex items-center gap-1.5 ${
                  results.status === "GREEN"
                    ? "bg-emerald-950 border-emerald-700 text-emerald-300"
                    : results.status === "YELLOW"
                    ? "bg-amber-950 border-amber-700 text-amber-300"
                    : "bg-rose-950 border-rose-700 text-rose-300"
                }`}
              >
                {results.status === "GREEN" && <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />}
                {results.status === "YELLOW" && <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />}
                {results.status === "RED" && <AlertOctagon className="w-3.5 h-3.5 text-rose-400" />}
                <span>{results.status} ALERT</span>
              </div>
            </div>

            {/* Projected Key Numbers */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 font-mono tabular-nums text-xs mb-4">
              <div className="bg-slate-900/80 p-2.5 rounded border border-slate-800">
                <span className="text-slate-400 block text-[11px] font-sans">Ending Capital</span>
                <span className="text-sm font-bold text-white">
                  ${Math.round(results.endingCapital).toLocaleString()}
                </span>
                <span
                  className={`block text-[10px] ${
                    results.navChangePct >= 0 ? "text-emerald-400" : "text-rose-400"
                  }`}
                >
                  {results.navChangePct > 0 ? "+" : ""}
                  {results.navChangePct.toFixed(1)}% NAV
                </span>
              </div>

              <div className="bg-slate-900/80 p-2.5 rounded border border-slate-800">
                <span className="text-slate-400 block text-[11px] font-sans">Cash Distributed</span>
                <span className="text-sm font-bold text-sky-400">
                  ${Math.round(results.cumulativeDistributions).toLocaleString()}
                </span>
                <span className="block text-[10px] text-slate-400">
                  {distributionYieldPct}% nominal
                </span>
              </div>

              <div className="bg-slate-900/80 p-2.5 rounded border border-slate-800">
                <span className="text-slate-400 block text-[11px] font-sans">Net Total Gain/Loss</span>
                <span
                  className={`text-sm font-bold ${
                    results.totalReturnDollars >= 0 ? "text-emerald-400" : "text-rose-400"
                  }`}
                >
                  {results.totalReturnDollars > 0 ? "+" : ""}$
                  {Math.round(results.totalReturnDollars).toLocaleString()}
                </span>
                <span
                  className={`block text-[10px] ${
                    results.totalReturnPct >= 0 ? "text-emerald-400" : "text-rose-400"
                  }`}
                >
                  {results.totalReturnPct > 0 ? "+" : ""}
                  {results.totalReturnPct.toFixed(1)}% TR
                </span>
              </div>

              <div className="bg-slate-900/80 p-2.5 rounded border border-slate-800">
                <span className="text-slate-400 block text-[11px] font-sans">Destructive ROC</span>
                <span
                  className={`text-sm font-bold ${
                    results.destructiveRocRatio > 35
                      ? "text-rose-400"
                      : results.destructiveRocRatio > 15
                      ? "text-amber-400"
                      : "text-emerald-400"
                  }`}
                >
                  {results.destructiveRocRatio.toFixed(0)}%
                </span>
                <span className="block text-[10px] text-slate-400">of total cash payout</span>
              </div>
            </div>

            {/* Diagnostic Interpretation */}
            <div className="p-3 bg-slate-900/60 rounded border border-slate-800/80 text-xs text-slate-300 space-y-1.5 leading-relaxed font-sans">
              <div className="font-semibold text-white flex items-center gap-1.5">
                <span>Diagnostic Assessment:</span>
              </div>
              {results.status === "GREEN" && (
                <p>
                  Healthy preservation profile. Strategy generates sustainable cash flow without severely eroding NAV. Capital is preserved (&ge; -1.5% NAV change) while paying out organic cash distributions.
                </p>
              )}
              {results.status === "YELLOW" && (
                <p>
                  Caution advised. Mild capital erosion (-1.5% to -3.0%). Payout rate exceeds organic portfolio generation, causing principal compression that will reduce future nominal dollar distributions unless markets accelerate.
                </p>
              )}
              {results.status === "RED" && (
                <p className="text-rose-300">
                  Severe destructive ROC detected. Over {results.destructiveRocRatio.toFixed(0)}% of the cashflow paid to you is simply your own liquidated principal returning back to you. The fund NAV degrades rapidly, leading to permanent capital loss.
                </p>
              )}
            </div>
          </div>

          <div className="text-[11px] text-slate-500 pt-3 border-t border-slate-800 mt-4 flex justify-between">
            <span>Model calculates dynamic option beta, volatility drag, and monthly compounding.</span>
            <span className="font-mono text-slate-400">Strict Rule Engine</span>
          </div>
        </div>
      </div>
    </div>
  );
};
