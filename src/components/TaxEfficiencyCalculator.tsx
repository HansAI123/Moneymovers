import React, { useState, useId, useMemo } from "react";
import { FundProfile } from "../types/fund";
import {
  Scale,
  DollarSign,
  TrendingUp,
  Percent,
  ShieldCheck,
  AlertTriangle,
  Info,
  HelpCircle,
  PiggyBank,
  Briefcase,
  Building,
  RefreshCw,
  Landmark,
  Layers,
  ArrowRight
} from "lucide-react";

interface TaxEfficiencyCalculatorProps {
  funds?: FundProfile[];
  initialTicker?: string;
}

interface DistributionPreset {
  name: string;
  ticker?: string;
  category: string;
  defaultYield: number;
  qualifiedPct: number;
  ordinaryPct: number;
  rocPct: number;
  description: string;
  taxRecommendation: "Taxable Ideal" | "Tax-Advantaged Ideal" | "Neutral / Flexible";
}

const PRESET_ARCHETYPES: DistributionPreset[] = [
  {
    name: "SPYI Archetype (Tax-Advantaged Call Spread)",
    ticker: "SPYI",
    category: "Index Options Spreads",
    defaultYield: 12.1,
    qualifiedPct: 8,
    ordinaryPct: 14,
    rocPct: 78,
    description: "SPX Section 1256 index options generate heavy tax-favorable ROC and 60/40 blended gains, shielding distributions from current-year tax drag.",
    taxRecommendation: "Taxable Ideal",
  },
  {
    name: "JEPI Archetype (Defensive Equity + ELN)",
    ticker: "JEPI",
    category: "Equity-Linked Notes",
    defaultYield: 7.6,
    qualifiedPct: 18,
    ordinaryPct: 78,
    rocPct: 4,
    description: "Underlying equities pay qualified dividends (~15-20%), while ELN option coupons are treated primarily as ordinary non-qualified income.",
    taxRecommendation: "Tax-Advantaged Ideal",
  },
  {
    name: "XYLD Archetype (At-the-Money BuyWrite)",
    ticker: "XYLD",
    category: "ATM Index Calls",
    defaultYield: 9.8,
    ordinaryPct: 82,
    qualifiedPct: 5,
    rocPct: 13,
    description: "Option premiums harvested from monthly ATM S&P 500 calls are largely taxed as ordinary income, creating high annual tax drag in taxable accounts.",
    taxRecommendation: "Tax-Advantaged Ideal",
  },
  {
    name: "NVDY / High-Yield Synthetic Archetype",
    ticker: "NVDY",
    category: "Single Stock Synthetic",
    defaultYield: 58.4,
    qualifiedPct: 0,
    ordinaryPct: 32,
    rocPct: 68,
    description: "Synthetic options structures pass distributions heavily as destructive ROC (liquidating capital) alongside short-term ordinary option gains.",
    taxRecommendation: "Tax-Advantaged Ideal",
  },
  {
    name: "MAIN / BDC Archetype (Net Investment Income)",
    ticker: "MAIN",
    category: "Business Development Co.",
    defaultYield: 7.9,
    qualifiedPct: 12,
    ordinaryPct: 88,
    rocPct: 0,
    description: "Pass-through corporate structure passes private debt interest straight through as ordinary non-qualified income (often qualifies for Section 199A deduction).",
    taxRecommendation: "Tax-Advantaged Ideal",
  },
  {
    name: "O / REIT Archetype (Real Estate Income)",
    ticker: "O",
    category: "Real Estate Investment Trust",
    defaultYield: 5.6,
    qualifiedPct: 0,
    ordinaryPct: 75,
    rocPct: 25,
    description: "Depreciation allows ~20-30% return of capital deferral, with remaining rent income taxed as ordinary income (eligible for 20% QBI deduction).",
    taxRecommendation: "Tax-Advantaged Ideal",
  },
  {
    name: "SCHD / Pure Dividend Growth Archetype",
    ticker: "SCHD",
    category: "Qualified Equity Dividends",
    defaultYield: 3.5,
    qualifiedPct: 100,
    ordinaryPct: 0,
    rocPct: 0,
    description: "100% qualified corporate dividends taxed at favorable long-term capital gains rates (0% / 15% / 20%). Highly tax-efficient in taxable accounts.",
    taxRecommendation: "Taxable Ideal",
  },
];

export const TaxEfficiencyCalculator: React.FC<TaxEfficiencyCalculatorProps> = ({
  funds = [],
  initialTicker,
}) => {
  const investmentId = useId();
  const yieldId = useId();
  const federalBracketId = useId();
  const stateTaxId = useId();

  // Core Inputs
  const [investmentAmount, setInvestmentAmount] = useState<number>(100000);
  const [distributionYieldPct, setDistributionYieldPct] = useState<number>(10.0);
  const [federalOrdinaryRate, setFederalOrdinaryRate] = useState<number>(32);
  const [customLtcgRate, setCustomLtcgRate] = useState<number | null>(null);
  const [stateTaxRate, setStateTaxRate] = useState<number>(5.0);
  const [includeNiit, setIncludeNiit] = useState<boolean>(true); // 3.8% Net Investment Income Tax

  // 19(a) Characterization percentages (must sum to 100%)
  const [qualifiedPct, setQualifiedPct] = useState<number>(10);
  const [ordinaryPct, setOrdinaryPct] = useState<number>(25);
  const [rocPct, setRocPct] = useState<number>(65);

  const [activePresetName, setActivePresetName] = useState<string>("SPYI Archetype (Tax-Advantaged Call Spread)");

  // Determine standard federal qualified dividend / LTCG bracket based on federal ordinary rate
  const defaultFederalLtcgRate = useMemo(() => {
    if (federalOrdinaryRate <= 12) return 0;
    if (federalOrdinaryRate <= 35) return 15;
    return 20;
  }, [federalOrdinaryRate]);

  const effectiveFederalLtcgRate = customLtcgRate !== null ? customLtcgRate : defaultFederalLtcgRate;

  // Total Tax Rates for each bucket
  // Qualified: Federal LTCG + State + (NIIT if enabled)
  const totalQualifiedTaxRate = useMemo(() => {
    let rate = effectiveFederalLtcgRate + stateTaxRate;
    if (includeNiit) rate += 3.8;
    return Math.min(100, Math.max(0, rate));
  }, [effectiveFederalLtcgRate, stateTaxRate, includeNiit]);

  // Ordinary: Federal Ordinary + State + (NIIT if enabled for unearned income)
  const totalOrdinaryTaxRate = useMemo(() => {
    let rate = federalOrdinaryRate + stateTaxRate;
    if (includeNiit) rate += 3.8;
    return Math.min(100, Math.max(0, rate));
  }, [federalOrdinaryRate, stateTaxRate, includeNiit]);

  // Normalized percentages (ensure sum is 100%)
  const rawSum = qualifiedPct + ordinaryPct + rocPct;
  const normQual = rawSum > 0 ? (qualifiedPct / rawSum) * 100 : 0;
  const normOrd = rawSum > 0 ? (ordinaryPct / rawSum) * 100 : 0;
  const normRoc = rawSum > 0 ? (rocPct / rawSum) * 100 : 0;

  // Calculation Engine
  const annualGrossDistribution = (investmentAmount * distributionYieldPct) / 100;

  const qualifiedDollars = (annualGrossDistribution * normQual) / 100;
  const ordinaryDollars = (annualGrossDistribution * normOrd) / 100;
  const rocDollars = (annualGrossDistribution * normRoc) / 100;

  const taxOnQualified = (qualifiedDollars * totalQualifiedTaxRate) / 100;
  const taxOnOrdinary = (ordinaryDollars * totalOrdinaryTaxRate) / 100;
  const taxOnRoc = 0.0; // Current year tax is $0 for ROC!

  const totalAnnualTax = taxOnQualified + taxOnOrdinary + taxOnRoc;
  const netAfterTaxIncome = Math.max(0, annualGrossDistribution - totalAnnualTax);

  const effectiveBlendedTaxRate =
    annualGrossDistribution > 0 ? (totalAnnualTax / annualGrossDistribution) * 100 : 0;

  const afterTaxYieldPct =
    investmentAmount > 0 ? (netAfterTaxIncome / investmentAmount) * 100 : 0;

  const taxDragPct = distributionYieldPct - afterTaxYieldPct;

  // Benchmark comparison: If this distribution was 100% ordinary income
  const hypothetical100PctOrdinaryTax =
    (annualGrossDistribution * totalOrdinaryTaxRate) / 100;
  const hypothetical100PctOrdinaryNet =
    annualGrossDistribution - hypothetical100PctOrdinaryTax;
  const hypothetical100PctOrdinaryYield =
    investmentAmount > 0 ? (hypothetical100PctOrdinaryNet / investmentAmount) * 100 : 0;

  const annualTaxSavingsVsOrdinary = Math.max(
    0,
    hypothetical100PctOrdinaryTax - totalAnnualTax
  );
  const taxAlphaPct = afterTaxYieldPct - hypothetical100PctOrdinaryYield;

  // Tax-Equivalent Yield (TEY):
  // What yield would a 100% ordinary asset (like a bond / CD) need to pay to equal this after-tax yield?
  const ordinaryRetainFraction = 1 - totalOrdinaryTaxRate / 100;
  const taxEquivalentYieldPct =
    ordinaryRetainFraction > 0 ? afterTaxYieldPct / ordinaryRetainFraction : afterTaxYieldPct;

  // Handle Preset Selection
  const applyPreset = (preset: DistributionPreset) => {
    setActivePresetName(preset.name);
    setDistributionYieldPct(preset.defaultYield);
    setQualifiedPct(preset.qualifiedPct);
    setOrdinaryPct(preset.ordinaryPct);
    setRocPct(preset.rocPct);
  };

  // Handle Loading from active fleet Fund
  const handleSelectFleetFund = (ticker: string) => {
    const fund = funds.find((f) => f.ticker === ticker);
    if (!fund) return;

    setActivePresetName(`${fund.ticker} Fleet Profile`);
    setDistributionYieldPct(fund.distribution_yield_pct);

    // Approximate breakdown from fund properties
    const roc = Math.min(100, Math.max(0, fund.roc_composition_pct));
    let qual = 0;
    let ord = 0;

    if (fund.category === "BDC") {
      qual = 12;
      ord = Math.max(0, 100 - roc - qual);
    } else if (fund.category === "Broad Index Covered Call") {
      if (roc > 50) {
        // e.g. SPYI
        qual = 8;
        ord = Math.max(0, 100 - roc - qual);
      } else {
        // e.g. JEPI / JEPQ
        qual = 18;
        ord = Math.max(0, 100 - roc - qual);
      }
    } else if (fund.category === "Single Stock Covered Call") {
      // e.g. NVDY / TSLY
      qual = 0;
      ord = Math.max(0, 100 - roc);
    } else {
      qual = 10;
      ord = Math.max(0, 100 - roc - qual);
    }

    setRocPct(roc);
    setQualifiedPct(qual);
    setOrdinaryPct(ord);
  };

  // Adjust sliders with automatic proportional rebalance of other two
  const handleSliderChange = (
    changedType: "qualified" | "ordinary" | "roc",
    newVal: number
  ) => {
    setActivePresetName("Custom Mix");
    const val = Math.min(100, Math.max(0, newVal));

    if (changedType === "qualified") {
      setQualifiedPct(val);
      const remaining = 100 - val;
      const currentOtherSum = ordinaryPct + rocPct || 1;
      setOrdinaryPct(Math.round((ordinaryPct / currentOtherSum) * remaining));
      setRocPct(100 - val - Math.round((ordinaryPct / currentOtherSum) * remaining));
    } else if (changedType === "ordinary") {
      setOrdinaryPct(val);
      const remaining = 100 - val;
      const currentOtherSum = qualifiedPct + rocPct || 1;
      setQualifiedPct(Math.round((qualifiedPct / currentOtherSum) * remaining));
      setRocPct(100 - val - Math.round((qualifiedPct / currentOtherSum) * remaining));
    } else if (changedType === "roc") {
      setRocPct(val);
      const remaining = 100 - val;
      const currentOtherSum = qualifiedPct + ordinaryPct || 1;
      setQualifiedPct(Math.round((qualifiedPct / currentOtherSum) * remaining));
      setOrdinaryPct(100 - val - Math.round((qualifiedPct / currentOtherSum) * remaining));
    }
  };

  return (
    <div className="bg-[#0f172a] border border-slate-800 rounded-lg p-5 space-y-6">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-800 gap-3">
        <div>
          <div className="flex items-center gap-2">
            <Scale className="w-5 h-5 text-emerald-400" />
            <h2 className="text-base font-semibold text-white">
              Distribution Tax Efficiency &amp; After-Tax Yield Calculator
            </h2>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-950 border border-emerald-800 text-emerald-300">
              Form 1099-DIV / 19(a) Engine
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1 max-w-3xl leading-relaxed">
            Distributions from covered-call ETFs and high-yield funds are not taxed equally. Calculate your true take-home yield by differentiating between{" "}
            <span className="text-emerald-400 font-medium">Qualified Dividends</span>,{" "}
            <span className="text-amber-400 font-medium">Ordinary Non-Qualified Income</span>, and{" "}
            <span className="text-sky-400 font-medium">Return of Capital (ROC)</span>.
          </p>
        </div>

        <button
          onClick={() => applyPreset(PRESET_ARCHETYPES[0])}
          className="text-xs text-slate-400 hover:text-white flex items-center gap-1.5 p-1.5 hover:bg-slate-800 rounded transition-colors self-start shrink-0 cursor-pointer"
          title="Reset to standard SPYI tax-efficient preset"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          <span>Reset Defaults</span>
        </button>
      </div>

      {/* Preset Archetype Selector Ribbon */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
            <Layers className="w-3.5 h-3.5 text-sky-400" />
            <span>Select Fund Archetype or Custom Mix:</span>
          </span>
          <span className="text-[11px] text-slate-400">
            Current: <span className="text-white font-medium">{activePresetName}</span>
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-2">
          {PRESET_ARCHETYPES.map((preset) => {
            const isSelected = activePresetName === preset.name;
            return (
              <button
                key={preset.name}
                onClick={() => applyPreset(preset)}
                className={`p-2.5 rounded-lg border text-left transition-all cursor-pointer ${
                  isSelected
                    ? "bg-sky-950/70 border-sky-500 shadow-sm ring-1 ring-sky-500/50"
                    : "bg-[#0b101e] border-slate-800 hover:border-slate-700 text-slate-400"
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs font-bold text-white font-mono">
                    {preset.ticker || "CUSTOM"}
                  </span>
                  <span className="text-[10px] text-sky-400 font-mono font-semibold">
                    {preset.defaultYield}%
                  </span>
                </div>
                <div className="text-[10px] text-slate-300 line-clamp-1">
                  {preset.category}
                </div>
                <div className="text-[9px] text-slate-500 mt-1 font-mono">
                  {preset.rocPct}% ROC · {preset.ordinaryPct}% Ord
                </div>
              </button>
            );
          })}
        </div>

        {/* Fleet Integration Dropdown (if user evaluated custom funds) */}
        {funds.length > 0 && (
          <div className="flex flex-wrap items-center gap-2 pt-1 text-xs text-slate-400">
            <span>Or load from evaluated fleet:</span>
            <div className="flex flex-wrap items-center gap-1.5">
              {funds.slice(0, 8).map((f) => (
                <button
                  key={f.ticker}
                  onClick={() => handleSelectFleetFund(f.ticker)}
                  className="px-2 py-0.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-200 text-[11px] font-mono border border-slate-700 transition-colors cursor-pointer"
                >
                  {f.ticker} ({f.distribution_yield_pct}%)
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Main Grid: Controls vs. After-Tax Results */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Tax Profile & Distribution Mix Controls */}
        <div className="lg:col-span-5 space-y-5">
          {/* Section A: Capital & Pre-Tax Yield */}
          <div className="bg-[#0b101e] border border-slate-800 rounded-lg p-4 space-y-4">
            <div className="text-xs font-semibold text-slate-200 flex items-center justify-between pb-2 border-b border-slate-800/80">
              <span className="flex items-center gap-1.5">
                <DollarSign className="w-3.5 h-3.5 text-emerald-400" />
                <span>Capital &amp; Yield Target</span>
              </span>
              <span className="text-slate-500 text-[11px] font-mono">
                Gross: ${(investmentAmount * distributionYieldPct / 100).toLocaleString()}/yr
              </span>
            </div>

            {/* Portfolio Size */}
            <div>
              <div className="flex justify-between text-xs mb-1">
                <label htmlFor={investmentId} className="text-slate-300">
                  Total Position Size / Allocation
                </label>
                <span className="font-mono text-white font-semibold">
                  ${investmentAmount.toLocaleString()}
                </span>
              </div>
              <input
                id={investmentId}
                type="range"
                min="10000"
                max="500000"
                step="5000"
                value={investmentAmount}
                onChange={(e) => setInvestmentAmount(Number(e.target.value))}
                className="w-full accent-sky-400 cursor-pointer"
              />
              <div className="flex justify-between text-[10px] text-slate-500 font-mono mt-0.5">
                <span>$10,000</span>
                <span>$100,000</span>
                <span>$500,000</span>
              </div>
            </div>

            {/* Nominal Pre-Tax Yield */}
            <div>
              <div className="flex justify-between text-xs mb-1">
                <label htmlFor={yieldId} className="text-slate-300">
                  Pre-Tax Headline Distribution Yield
                </label>
                <span className="font-mono font-bold text-sky-400">
                  {distributionYieldPct.toFixed(1)}%
                </span>
              </div>
              <input
                id={yieldId}
                type="range"
                min="2.0"
                max="35.0"
                step="0.1"
                value={distributionYieldPct}
                onChange={(e) => setDistributionYieldPct(Number(e.target.value))}
                className="w-full accent-sky-400 cursor-pointer"
              />
              <div className="flex justify-between text-[10px] text-slate-500 font-mono mt-0.5">
                <span>2% (Equity Div)</span>
                <span>10% (Covered Call)</span>
                <span>35% (High Octane)</span>
              </div>
            </div>
          </div>

          {/* Section B: User Tax Rates */}
          <div className="bg-[#0b101e] border border-slate-800 rounded-lg p-4 space-y-4">
            <div className="text-xs font-semibold text-slate-200 flex items-center justify-between pb-2 border-b border-slate-800/80">
              <span className="flex items-center gap-1.5">
                <Landmark className="w-3.5 h-3.5 text-sky-400" />
                <span>Your Marginal Tax Profile</span>
              </span>
              <span className="text-slate-400 text-[11px] font-mono">
                Total Ord: {totalOrdinaryTaxRate.toFixed(1)}%
              </span>
            </div>

            {/* Federal Ordinary Bracket Quick Buttons */}
            <div>
              <div className="flex justify-between text-xs mb-1.5">
                <label htmlFor={federalBracketId} className="text-slate-300">
                  Federal Ordinary Income Tax Bracket
                </label>
                <span className="font-mono font-bold text-white">
                  {federalOrdinaryRate}%
                </span>
              </div>
              <div className="grid grid-cols-7 gap-1 text-[11px] font-mono text-center mb-2">
                {[10, 12, 22, 24, 32, 35, 37].map((bracket) => (
                  <button
                    key={bracket}
                    type="button"
                    onClick={() => {
                      setFederalOrdinaryRate(bracket);
                      setCustomLtcgRate(null);
                    }}
                    className={`py-1 rounded border transition-colors cursor-pointer ${
                      federalOrdinaryRate === bracket
                        ? "bg-sky-500 text-slate-950 font-bold border-sky-400"
                        : "bg-slate-900 border-slate-800 text-slate-400 hover:text-white"
                    }`}
                  >
                    {bracket}%
                  </button>
                ))}
              </div>
              <input
                id={federalBracketId}
                type="range"
                min="10"
                max="45"
                step="1"
                value={federalOrdinaryRate}
                onChange={(e) => {
                  setFederalOrdinaryRate(Number(e.target.value));
                  setCustomLtcgRate(null);
                }}
                className="w-full accent-sky-400 cursor-pointer"
              />
            </div>

            {/* State Tax Rate & NIIT */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
              <div>
                <div className="flex justify-between text-xs mb-1">
                  <label htmlFor={stateTaxId} className="text-slate-300">
                    State / Local Tax Rate
                  </label>
                  <span className="font-mono text-white font-semibold">
                    {stateTaxRate.toFixed(1)}%
                  </span>
                </div>
                <input
                  id={stateTaxId}
                  type="range"
                  min="0"
                  max="13.3"
                  step="0.5"
                  value={stateTaxRate}
                  onChange={(e) => setStateTaxRate(Number(e.target.value))}
                  className="w-full accent-sky-400 cursor-pointer"
                />
                <div className="flex justify-between text-[9px] text-slate-500 font-mono mt-0.5">
                  <span>0% (TX/FL)</span>
                  <span>5% (Avg)</span>
                  <span>13.3% (CA)</span>
                </div>
              </div>

              {/* NIIT 3.8% Checkbox */}
              <div className="flex flex-col justify-center bg-slate-900/60 p-2.5 rounded border border-slate-800">
                <label className="flex items-start gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={includeNiit}
                    onChange={(e) => setIncludeNiit(e.target.checked)}
                    className="mt-0.5 accent-sky-400 rounded cursor-pointer"
                  />
                  <div className="text-[11px] leading-tight">
                    <span className="font-semibold text-slate-200 block">
                      Include 3.8% NIIT
                    </span>
                    <span className="text-slate-400 text-[10px]">
                      Net Investment Income Tax (AGI &gt;$200k/$250k)
                    </span>
                  </div>
                </label>
              </div>
            </div>

            {/* Automatic Capital Gains Rate Note */}
            <div className="text-[11px] text-slate-400 bg-slate-900/80 p-2 rounded border border-slate-800/80 flex items-center justify-between font-sans">
              <span>
                Qualified / LTCG Federal Bracket:{" "}
                <span className="text-emerald-400 font-semibold font-mono">
                  {effectiveFederalLtcgRate}%
                </span>
              </span>
              <span className="text-slate-500">
                Total Qual Tax:{" "}
                <span className="text-slate-300 font-mono">
                  {totalQualifiedTaxRate.toFixed(1)}%
                </span>
              </span>
            </div>
          </div>

          {/* Section C: 19(a) Distribution Characterization Sliders */}
          <div className="bg-[#0b101e] border border-slate-800 rounded-lg p-4 space-y-3.5">
            <div className="flex items-center justify-between pb-2 border-b border-slate-800/80">
              <span className="text-xs font-semibold text-slate-200 flex items-center gap-1.5">
                <Briefcase className="w-3.5 h-3.5 text-amber-400" />
                <span>19(a) Characterization Mix (sums to 100%)</span>
              </span>
              <span className="text-[10px] text-slate-500 font-mono">
                Form 1099-DIV
              </span>
            </div>

            {/* Proportional Preview Bar */}
            <div className="h-3 w-full rounded-full overflow-hidden flex bg-slate-800 shadow-inner">
              <div
                style={{ width: `${normQual}%` }}
                className="bg-emerald-500 transition-all duration-200"
                title={`Qualified Dividends: ${normQual.toFixed(1)}%`}
              />
              <div
                style={{ width: `${normOrd}%` }}
                className="bg-amber-500 transition-all duration-200"
                title={`Ordinary Non-Qualified: ${normOrd.toFixed(1)}%`}
              />
              <div
                style={{ width: `${normRoc}%` }}
                className="bg-sky-500 transition-all duration-200"
                title={`Return of Capital: ${normRoc.toFixed(1)}%`}
              />
            </div>
            <div className="flex items-center justify-between text-[10px] font-mono text-slate-400 pt-0.5">
              <span className="text-emerald-400">● {normQual.toFixed(0)}% Qualified</span>
              <span className="text-amber-400">● {normOrd.toFixed(0)}% Ordinary</span>
              <span className="text-sky-400">● {normRoc.toFixed(0)}% Return of Capital (ROC)</span>
            </div>

            {/* 1. Qualified Dividends Slider */}
            <div className="space-y-1">
              <div className="flex justify-between text-xs">
                <span className="text-slate-300 flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-emerald-400" />
                  <span>Qualified Dividends</span>
                </span>
                <span className="font-mono text-emerald-400 font-semibold">
                  {normQual.toFixed(1)}% · ${(qualifiedDollars).toLocaleString()}
                </span>
              </div>
              <input
                type="range"
                min="0"
                max="100"
                step="1"
                value={qualifiedPct}
                onChange={(e) => handleSliderChange("qualified", Number(e.target.value))}
                className="w-full accent-emerald-400 cursor-pointer"
              />
              <span className="text-[10px] text-slate-500 block">
                Taxed at LTCG rate ({totalQualifiedTaxRate.toFixed(1)}% blended). Eligible equity dividends.
              </span>
            </div>

            {/* 2. Ordinary Income Slider */}
            <div className="space-y-1">
              <div className="flex justify-between text-xs">
                <span className="text-slate-300 flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-amber-400" />
                  <span>Ordinary Income / Option Premiums</span>
                </span>
                <span className="font-mono text-amber-400 font-semibold">
                  {normOrd.toFixed(1)}% · ${(ordinaryDollars).toLocaleString()}
                </span>
              </div>
              <input
                type="range"
                min="0"
                max="100"
                step="1"
                value={ordinaryPct}
                onChange={(e) => handleSliderChange("ordinary", Number(e.target.value))}
                className="w-full accent-amber-400 cursor-pointer"
              />
              <span className="text-[10px] text-slate-500 block">
                Taxed at full marginal rate ({totalOrdinaryTaxRate.toFixed(1)}% blended). Option writing, ELNs, short-term gains.
              </span>
            </div>

            {/* 3. Return of Capital (ROC) Slider */}
            <div className="space-y-1">
              <div className="flex justify-between text-xs">
                <span className="text-slate-300 flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-sky-400" />
                  <span>Return of Capital (ROC)</span>
                </span>
                <span className="font-mono text-sky-400 font-bold">
                  {normRoc.toFixed(1)}% · ${(rocDollars).toLocaleString()}
                </span>
              </div>
              <input
                type="range"
                min="0"
                max="100"
                step="1"
                value={rocPct}
                onChange={(e) => handleSliderChange("roc", Number(e.target.value))}
                className="w-full accent-sky-400 cursor-pointer"
              />
              <span className="text-[10px] text-sky-300/80 block font-medium">
                0% Current-Year Tax Drag! Reduces cost basis until basis reaches $0.
              </span>
            </div>
          </div>
        </div>

        {/* Right Column: After-Tax Yield & Diagnostic Assessment */}
        <div className="lg:col-span-7 space-y-5 flex flex-col justify-between">
          <div className="space-y-5">
            {/* Top Scorecard: Effective After-Tax Yield Hero */}
            <div className="bg-gradient-to-br from-[#0c1427] to-[#080d1a] border border-slate-700/80 rounded-xl p-5 shadow-lg relative overflow-hidden">
              <div className="absolute top-0 right-0 transform translate-x-4 -translate-y-4 w-32 h-32 bg-emerald-500/10 rounded-full blur-2xl pointer-events-none" />

              <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
                <div>
                  <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                    Net After-Tax Performance
                  </span>
                  <div className="flex items-baseline gap-2 mt-0.5">
                    <span className="text-3xl sm:text-4xl font-extrabold text-white font-mono tracking-tight">
                      {afterTaxYieldPct.toFixed(2)}%
                    </span>
                    <span className="text-xs text-slate-400">
                      effective after-tax yield (vs {distributionYieldPct.toFixed(1)}% pre-tax)
                    </span>
                  </div>
                </div>

                <div className="text-right">
                  <span className="text-xs text-slate-400 block">Annual Cash Retained</span>
                  <span className="text-2xl font-bold font-mono text-emerald-400">
                    ${Math.round(netAfterTaxIncome).toLocaleString()}
                  </span>
                  <span className="text-[11px] text-slate-500 block font-mono">
                    out of ${(annualGrossDistribution).toLocaleString()} pre-tax
                  </span>
                </div>
              </div>

              {/* Cash Flow Distribution vs Tax Retention Bar */}
              <div className="space-y-1.5 pt-2 border-t border-slate-800">
                <div className="flex justify-between text-xs font-mono">
                  <span className="text-emerald-400 font-semibold flex items-center gap-1">
                    <span>Kept: ${(netAfterTaxIncome).toLocaleString()}</span>
                    <span>({((netAfterTaxIncome / (annualGrossDistribution || 1)) * 100).toFixed(1)}%)</span>
                  </span>
                  <span className="text-rose-400 font-semibold flex items-center gap-1">
                    <span>Tax: ${(totalAnnualTax).toLocaleString()}</span>
                    <span>({effectiveBlendedTaxRate.toFixed(1)}%)</span>
                  </span>
                </div>

                <div className="h-3 w-full bg-slate-800/80 rounded-full overflow-hidden flex">
                  <div
                    style={{
                      width: `${(netAfterTaxIncome / (annualGrossDistribution || 1)) * 100}%`,
                    }}
                    className="bg-gradient-to-r from-emerald-500 to-teal-400 transition-all duration-300"
                  />
                  <div
                    style={{
                      width: `${(totalAnnualTax / (annualGrossDistribution || 1)) * 100}%`,
                    }}
                    className="bg-gradient-to-r from-rose-500 to-rose-600 transition-all duration-300"
                  />
                </div>
              </div>
            </div>

            {/* 4 Metric Cards */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 font-mono tabular-nums text-xs">
              {/* Blended Effective Tax Rate */}
              <div className="bg-[#0b101e] p-3 rounded-lg border border-slate-800">
                <span className="text-slate-400 block text-[11px] font-sans">
                  Effective Tax Rate
                </span>
                <span className="text-lg font-bold text-white">
                  {effectiveBlendedTaxRate.toFixed(1)}%
                </span>
                <span className="block text-[10px] text-slate-500 font-sans mt-0.5">
                  vs {totalOrdinaryTaxRate.toFixed(1)}% full ordinary
                </span>
              </div>

              {/* Annual Tax Savings (Tax Alpha) */}
              <div className="bg-[#0b101e] p-3 rounded-lg border border-slate-800">
                <span className="text-slate-400 block text-[11px] font-sans">
                  Annual Tax Savings
                </span>
                <span
                  className={`text-lg font-bold ${
                    annualTaxSavingsVsOrdinary > 0 ? "text-emerald-400" : "text-slate-300"
                  }`}
                >
                  +${Math.round(annualTaxSavingsVsOrdinary).toLocaleString()}
                </span>
                <span className="block text-[10px] text-emerald-400 font-sans mt-0.5">
                  +{taxAlphaPct.toFixed(2)}% Tax Alpha
                </span>
              </div>

              {/* Tax-Equivalent Yield */}
              <div className="bg-[#0b101e] p-3 rounded-lg border border-slate-800">
                <span className="text-slate-400 block text-[11px] font-sans">
                  Tax-Equiv. Yield (TEY)
                </span>
                <span className="text-lg font-bold text-sky-400">
                  {taxEquivalentYieldPct.toFixed(2)}%
                </span>
                <span className="block text-[10px] text-slate-500 font-sans mt-0.5">
                  Ordinary bond hurdle
                </span>
              </div>

              {/* Tax Drag */}
              <div className="bg-[#0b101e] p-3 rounded-lg border border-slate-800">
                <span className="text-slate-400 block text-[11px] font-sans">
                  Annual Tax Drag
                </span>
                <span className="text-lg font-bold text-rose-400">
                  -{taxDragPct.toFixed(2)}%
                </span>
                <span className="block text-[10px] text-slate-500 font-sans mt-0.5">
                  -${Math.round(totalAnnualTax).toLocaleString()}/yr tax cost
                </span>
              </div>
            </div>

            {/* Breakdown Table by Characterization Bucket */}
            <div className="bg-[#0b101e] border border-slate-800 rounded-lg overflow-hidden text-xs">
              <div className="p-3 bg-slate-900/60 border-b border-slate-800 font-semibold text-slate-300 flex items-center justify-between">
                <span>Distribution Characterization Audit (Form 1099-DIV)</span>
                <span className="text-[11px] text-slate-500 font-normal">
                  Annual Totals for ${investmentAmount.toLocaleString()} Capital
                </span>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead className="bg-[#080d1a] text-slate-400 text-[11px] font-medium border-b border-slate-800">
                    <tr>
                      <th className="py-2.5 px-3">Distribution Type</th>
                      <th className="py-2.5 px-3 text-right">Share (%)</th>
                      <th className="py-2.5 px-3 text-right">Gross Cash</th>
                      <th className="py-2.5 px-3 text-right">Tax Rate</th>
                      <th className="py-2.5 px-3 text-right">Tax Paid</th>
                      <th className="py-2.5 px-3 text-right">Net Cash Kept</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60 font-mono text-xs">
                    <tr>
                      <td className="py-2 px-3 flex items-center gap-2 font-sans text-slate-200">
                        <span className="w-2 h-2 rounded-full bg-emerald-400" />
                        <span>Qualified Dividends</span>
                      </td>
                      <td className="py-2 px-3 text-right text-slate-300">{normQual.toFixed(1)}%</td>
                      <td className="py-2 px-3 text-right text-slate-200">${Math.round(qualifiedDollars).toLocaleString()}</td>
                      <td className="py-2 px-3 text-right text-emerald-400">{totalQualifiedTaxRate.toFixed(1)}%</td>
                      <td className="py-2 px-3 text-right text-rose-400">-${Math.round(taxOnQualified).toLocaleString()}</td>
                      <td className="py-2 px-3 text-right font-semibold text-emerald-400">
                        ${Math.round(qualifiedDollars - taxOnQualified).toLocaleString()}
                      </td>
                    </tr>
                    <tr>
                      <td className="py-2 px-3 flex items-center gap-2 font-sans text-slate-200">
                        <span className="w-2 h-2 rounded-full bg-amber-400" />
                        <span>Ordinary Income / Option Prem.</span>
                      </td>
                      <td className="py-2 px-3 text-right text-slate-300">{normOrd.toFixed(1)}%</td>
                      <td className="py-2 px-3 text-right text-slate-200">${Math.round(ordinaryDollars).toLocaleString()}</td>
                      <td className="py-2 px-3 text-right text-amber-400">{totalOrdinaryTaxRate.toFixed(1)}%</td>
                      <td className="py-2 px-3 text-right text-rose-400">-${Math.round(taxOnOrdinary).toLocaleString()}</td>
                      <td className="py-2 px-3 text-right font-semibold text-slate-200">
                        ${Math.round(ordinaryDollars - taxOnOrdinary).toLocaleString()}
                      </td>
                    </tr>
                    <tr className="bg-sky-950/20">
                      <td className="py-2 px-3 flex items-center gap-2 font-sans text-sky-200 font-medium">
                        <span className="w-2 h-2 rounded-full bg-sky-400" />
                        <span>Return of Capital (ROC)</span>
                      </td>
                      <td className="py-2 px-3 text-right text-sky-300 font-bold">{normRoc.toFixed(1)}%</td>
                      <td className="py-2 px-3 text-right text-sky-200">${Math.round(rocDollars).toLocaleString()}</td>
                      <td className="py-2 px-3 text-right text-emerald-400 font-bold">0.0%</td>
                      <td className="py-2 px-3 text-right text-emerald-400 font-bold">$0</td>
                      <td className="py-2 px-3 text-right font-bold text-sky-300">
                        ${Math.round(rocDollars).toLocaleString()}
                      </td>
                    </tr>
                  </tbody>
                  <tfoot className="bg-slate-900/80 font-mono text-xs font-bold border-t border-slate-700">
                    <tr>
                      <td className="py-2.5 px-3 font-sans text-white">Total Distribution</td>
                      <td className="py-2.5 px-3 text-right text-slate-300">100.0%</td>
                      <td className="py-2.5 px-3 text-right text-white">${Math.round(annualGrossDistribution).toLocaleString()}</td>
                      <td className="py-2.5 px-3 text-right text-slate-300">{effectiveBlendedTaxRate.toFixed(1)}%</td>
                      <td className="py-2.5 px-3 text-right text-rose-400">-${Math.round(totalAnnualTax).toLocaleString()}</td>
                      <td className="py-2.5 px-3 text-right text-emerald-400">
                        ${Math.round(netAfterTaxIncome).toLocaleString()}
                      </td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            </div>

            {/* Strategic Account Placement & ROC Insight Card */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
              {/* Account Placement Recommendation */}
              <div className="bg-[#0b101e] border border-slate-800 rounded-lg p-3.5 space-y-2">
                <div className="font-semibold text-white flex items-center gap-1.5">
                  <PiggyBank className="w-4 h-4 text-sky-400" />
                  <span>Optimal Account Placement:</span>
                </div>
                <div className="space-y-1.5 text-slate-300 leading-relaxed font-sans">
                  {normRoc >= 50 ? (
                    <div className="p-2 rounded bg-emerald-950/40 border border-emerald-800 text-emerald-300">
                      <strong>Taxable Brokerage Prime Target:</strong> High ROC ({normRoc.toFixed(0)}%) allows distributions to flow with zero immediate tax drag ({effectiveBlendedTaxRate.toFixed(1)}% effective rate). Do NOT waste tax-advantaged IRA space on high-ROC funds!
                    </div>
                  ) : normOrd >= 65 ? (
                    <div className="p-2 rounded bg-amber-950/40 border border-amber-800 text-amber-300">
                      <strong>Tax-Advantaged Account Ideal (IRA/401k):</strong> Heavy ordinary income ({normOrd.toFixed(0)}%) causes a severe {taxDragPct.toFixed(2)}% annual tax drag. Hold in a Roth or Traditional IRA to prevent annual ordinary income haircuts.
                    </div>
                  ) : (
                    <div className="p-2 rounded bg-slate-900 border border-slate-800 text-slate-300">
                      <strong>Flexible Placement:</strong> Balanced mix between qualified dividends and ordinary premiums. Suitable for taxable accounts if marginal bracket is below 24%.
                    </div>
                  )}
                </div>
              </div>

              {/* ROC Cost Basis Reduction Mechanics Note */}
              <div className="bg-[#0b101e] border border-slate-800 rounded-lg p-3.5 space-y-2">
                <div className="font-semibold text-white flex items-center gap-1.5">
                  <Info className="w-4 h-4 text-emerald-400" />
                  <span>Return of Capital (ROC) Mechanics:</span>
                </div>
                <p className="text-slate-400 leading-relaxed text-[11px] font-sans">
                  ROC is non-taxable in the current tax year, reducing your cost basis from{" "}
                  <span className="text-white font-mono">${investmentAmount.toLocaleString()}</span> to{" "}
                  <span className="text-sky-300 font-mono font-semibold">
                    ${Math.max(0, investmentAmount - rocDollars).toLocaleString()}
                  </span>{" "}
                  after 1 year. Only when your cost basis reaches zero are subsequent ROC distributions taxed as long-term capital gains upon sale.
                </p>
              </div>
            </div>
          </div>

          {/* Footer Note */}
          <div className="text-[11px] text-slate-500 pt-3 border-t border-slate-800 flex justify-between font-sans">
            <span>Calculates federal brackets (10%-37%), state tax, and NIIT (3.8%). Consult a qualified CPA.</span>
            <span className="font-mono text-emerald-400">Tax Alpha Engine</span>
          </div>
        </div>
      </div>
    </div>
  );
};
