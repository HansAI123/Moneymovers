import React, { useState, useEffect } from "react";
import {
  ShieldAlert,
  ShieldCheck,
  AlertTriangle,
  AlertOctagon,
  TrendingUp,
  TrendingDown,
  ArrowRight,
  PieChart,
  Scale,
  Sparkles,
  BarChart3,
  Layers,
  Search,
  CheckCircle2,
  Info,
  X,
  Compass,
  Zap,
  ArrowUpRight,
  HelpCircle
} from "lucide-react";
import { FundProfile } from "../types/fund";
import { NavTab } from "./Navbar";
import heroIncomeImg from "../assets/images/hero_income_diagnostic_1792328608973.jpg";
import featureMatrixImg from "../assets/images/feature_matrix_audit_1792328609883.jpg";
import featureTaxImg from "../assets/images/feature_tax_simulator_1792328609265.jpg";

interface LandingPageProps {
  funds: FundProfile[];
  onNavigateTab: (tab: NavTab) => void;
  onOpenSearchModal: () => void;
  onSelectFund: (ticker: string) => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({
  funds,
  onNavigateTab,
  onOpenSearchModal,
  onSelectFund,
}) => {
  const [showWelcomeGuide, setShowWelcomeGuide] = useState<boolean>(() => {
    try {
      return localStorage.getItem("has_seen_income_welcome") !== "true";
    } catch {
      return true;
    }
  });

  const [activeFaq, setActiveFaq] = useState<number | null>(null);

  const handleDismissWelcome = () => {
    setShowWelcomeGuide(false);
    try {
      localStorage.setItem("has_seen_income_welcome", "true");
    } catch {
      // ignore
    }
  };

  const handleResetWelcome = () => {
    setShowWelcomeGuide(true);
    try {
      localStorage.removeItem("has_seen_income_welcome");
    } catch {
      // ignore
    }
  };

  // Quick stats
  const totalFunds = funds.length;
  const greenFunds = funds.filter((f) => f.alert_status === "GREEN");
  const redFunds = funds.filter((f) => f.alert_status === "RED");
  const avgYield =
    funds.reduce((acc, f) => acc + f.distribution_yield_pct, 0) / (totalFunds || 1);

  return (
    <div className="space-y-12 pb-12">
      {/* =========================================================================
          FIRST-TIME USER WELCOME ONBOARDING BRIEFING
          Explains:
          1. What this app does
          2. Main features
          3. Where to start
         ========================================================================= */}
      {showWelcomeGuide ? (
        <section
          aria-labelledby="welcome-briefing-title"
          className="relative bg-gradient-to-b from-sky-950/40 via-[#0f172a] to-[#0b1120] border border-sky-500/30 rounded-xl p-6 sm:p-8 shadow-xl shadow-sky-950/20 transition-all"
        >
          {/* Header row with badge & dismiss button */}
          <div className="flex items-start justify-between gap-4 pb-4 border-b border-slate-800">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-lg bg-sky-500/10 border border-sky-500/30 flex items-center justify-center text-sky-400">
                <Compass className="w-5 h-5" />
              </div>
              <div>
                <div className="text-[11px] font-semibold text-sky-400 tracking-wider uppercase">
                  First-Time User Orientation &amp; Executive Briefing
                </div>
                <h2
                  id="welcome-briefing-title"
                  className="text-lg sm:text-xl font-bold text-white tracking-tight"
                >
                  Welcome to the Income ETF &amp; Covered Call Evaluator
                </h2>
              </div>
            </div>

            <button
              onClick={handleDismissWelcome}
              className="text-slate-400 hover:text-white px-3 py-1.5 rounded-md hover:bg-slate-800 text-xs font-medium transition-colors flex items-center gap-1.5 cursor-pointer shrink-0"
              title="Dismiss onboarding banner"
            >
              <span>Dismiss Guide</span>
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* 3 Core Questions: What it does, Main Features, Where to Start */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-6">
            {/* Column 1: What this app does */}
            <div className="space-y-2.5">
              <div className="flex items-center gap-2 text-sky-400 text-xs font-semibold uppercase tracking-wider">
                <span className="w-5 h-5 rounded-full bg-sky-500/20 text-sky-300 flex items-center justify-center text-[10px] font-bold">
                  1
                </span>
                <span>What This App Does</span>
              </div>
              <h3 className="text-sm font-semibold text-white">
                Unmasks Yield Traps &amp; NAV Erosion
              </h3>
              <p className="text-xs text-slate-300 leading-relaxed">
                Many modern covered call and synthetic option ETFs boast headline yields of 12% to 70%, but silently liquidate your underlying capital through <strong>destructive Return of Capital (ROC)</strong> and upside capping.
              </p>
              <p className="text-xs text-slate-400 leading-relaxed">
                This platform provides institutional-grade forensic diagnostics to separate genuine organic cash flow from self-liquidating capital decay.
              </p>
            </div>

            {/* Column 2: Main features */}
            <div className="space-y-2.5">
              <div className="flex items-center gap-2 text-emerald-400 text-xs font-semibold uppercase tracking-wider">
                <span className="w-5 h-5 rounded-full bg-emerald-500/20 text-emerald-300 flex items-center justify-center text-[10px] font-bold">
                  2
                </span>
                <span>Main Features</span>
              </div>
              <h3 className="text-sm font-semibold text-white">
                Comprehensive Diagnostic Suite
              </h3>
              <ul className="space-y-2 text-xs text-slate-300">
                <li className="flex items-start gap-2">
                  <span className="text-emerald-400 font-bold">·</span>
                  <span><strong>Fleet Risk Matrix:</strong> Traffic-light Green/Yellow/Red health rating on 12+ preloaded institutional income funds.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-emerald-400 font-bold">·</span>
                  <span><strong>Dividend CAGR Sparklines:</strong> Audit 3-year &amp; 5-year payout trajectory to identify dividend cuts early.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-emerald-400 font-bold">·</span>
                  <span><strong>Portfolio Engine:</strong> Weight allocation stress-tester with 1-click swap replacements for hazardous holdings.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-emerald-400 font-bold">·</span>
                  <span><strong>Tax &amp; ROC Calculator:</strong> Model actual after-tax net cash flow across ordinary and Section 1256 brackets.</span>
                </li>
              </ul>
            </div>

            {/* Column 3: Where to start */}
            <div className="space-y-2.5">
              <div className="flex items-center gap-2 text-amber-400 text-xs font-semibold uppercase tracking-wider">
                <span className="w-5 h-5 rounded-full bg-amber-500/20 text-amber-300 flex items-center justify-center text-[10px] font-bold">
                  3
                </span>
                <span>Where to Start</span>
              </div>
              <h3 className="text-sm font-semibold text-white">
                Recommended First Steps
              </h3>
              <div className="space-y-2 pt-1">
                <button
                  onClick={() => onNavigateTab("fleet")}
                  className="w-full text-left p-2.5 rounded-lg bg-slate-900/90 hover:bg-slate-800 border border-slate-800 hover:border-sky-500/50 transition-colors flex items-center justify-between group cursor-pointer"
                >
                  <div>
                    <div className="text-xs font-semibold text-white group-hover:text-sky-300 transition-colors">
                      1. Scan the Fleet Matrix
                    </div>
                    <div className="text-[11px] text-slate-400">
                      Sort funds by yield, NAV change, and alert status
                    </div>
                  </div>
                  <ArrowRight className="w-3.5 h-3.5 text-slate-500 group-hover:text-sky-400 transition-colors" />
                </button>

                <button
                  onClick={() => {
                    onSelectFund("JEPI");
                    onNavigateTab("diagnostics");
                  }}
                  className="w-full text-left p-2.5 rounded-lg bg-slate-900/90 hover:bg-slate-800 border border-slate-800 hover:border-emerald-500/50 transition-colors flex items-center justify-between group cursor-pointer"
                >
                  <div>
                    <div className="text-xs font-semibold text-white group-hover:text-emerald-300 transition-colors">
                      2. Inspect a Diagnostic Card
                    </div>
                    <div className="text-[11px] text-slate-400">
                      Review option structure &amp; 3Y CAGR for JEPI
                    </div>
                  </div>
                  <ArrowRight className="w-3.5 h-3.5 text-slate-500 group-hover:text-emerald-400 transition-colors" />
                </button>

                <button
                  onClick={() => onNavigateTab("simulator")}
                  className="w-full text-left p-2.5 rounded-lg bg-slate-900/90 hover:bg-slate-800 border border-slate-800 hover:border-indigo-500/50 transition-colors flex items-center justify-between group cursor-pointer"
                >
                  <div>
                    <div className="text-xs font-semibold text-white group-hover:text-indigo-300 transition-colors">
                      3. Run the Tax Simulator
                    </div>
                    <div className="text-[11px] text-slate-400">
                      Calculate your real net take-home yield
                    </div>
                  </div>
                  <ArrowRight className="w-3.5 h-3.5 text-slate-500 group-hover:text-indigo-400 transition-colors" />
                </button>
              </div>
            </div>
          </div>

          {/* Footer of Welcome Card with Dismiss CTA */}
          <div className="mt-6 pt-4 border-t border-slate-800/80 flex flex-wrap items-center justify-between gap-3 text-xs">
            <span className="text-slate-400">
              Tip: You can re-open this guide anytime via the "Welcome Guide" button in the top navigation.
            </span>
            <button
              onClick={handleDismissWelcome}
              className="px-4 py-1.5 text-xs font-semibold bg-sky-500 hover:bg-sky-400 text-slate-950 rounded-md transition-colors cursor-pointer"
            >
              Start Exploring Platform
            </button>
          </div>
        </section>
      ) : (
        /* Re-open guide banner strip */
        <div className="bg-[#0f172a] border border-slate-800 rounded-lg p-3 px-4 flex items-center justify-between text-xs">
          <div className="flex items-center gap-2 text-slate-300">
            <Compass className="w-4 h-4 text-sky-400" />
            <span>Need a refresher on platform features and quantitative rules?</span>
          </div>
          <button
            onClick={handleResetWelcome}
            className="text-xs font-semibold text-sky-400 hover:text-sky-300 transition-colors cursor-pointer"
          >
            Show First-Time User Guide
          </button>
        </div>
      )}

      {/* =========================================================================
          HERO SECTION (Domain-Native Proposition with Visual Focal Point)
         ========================================================================= */}
      <section className="relative overflow-hidden rounded-2xl bg-[#0a0f1d] border border-slate-800/90 p-6 sm:p-10 lg:p-12">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
          {/* Left Column: Proposition & CTAs */}
          <div className="lg:col-span-7 space-y-6">
            {/* Institutional Subtitle / Trust marker */}
            <div className="text-xs font-medium text-slate-400 tracking-wide flex items-center gap-2">
              <span className="text-emerald-400 font-semibold uppercase tracking-wider">
                Institutional Wealth Architecture
              </span>
              <span aria-hidden="true" className="text-slate-600">·</span>
              <span>Capital Preservation Engine</span>
            </div>

            {/* Sized Headline adhering to clamp guidelines */}
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-white tracking-tight leading-[1.12]">
              Forensic Income Analysis for Covered Call &amp; High-Yield Funds
            </h1>

            {/* Value Proposition without generic buzzwords */}
            <p className="text-sm sm:text-base text-slate-300 max-w-2xl leading-relaxed">
              High headline yields frequently mask systemic capital decay. We audit option strike selection, Return of Capital (ROC) tax classifications, and multi-year dividend growth rates to protect your principal from self-liquidating yield traps.
            </p>

            {/* Single dominant primary CTA + secondary actions */}
            <div className="flex flex-wrap items-center gap-3 pt-2">
              <button
                onClick={() => onNavigateTab("fleet")}
                className="px-5 py-2.5 text-xs font-semibold text-slate-950 bg-sky-400 hover:bg-sky-300 rounded-lg transition-colors flex items-center gap-2 shadow-sm cursor-pointer whitespace-nowrap shrink-0"
              >
                <span>Launch Fleet Matrix</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              <button
                onClick={() => onNavigateTab("analytics")}
                className="px-4 py-2.5 text-xs font-medium text-slate-200 bg-slate-900 hover:bg-slate-800 border border-slate-700 rounded-lg transition-colors flex items-center gap-2 cursor-pointer whitespace-nowrap shrink-0"
              >
                <TrendingUp className="w-4 h-4 text-emerald-400" />
                <span>Interactive Graphs</span>
              </button>

              <button
                onClick={() => onNavigateTab("audit")}
                className="px-4 py-2.5 text-xs font-medium text-slate-200 bg-slate-900 hover:bg-slate-800 border border-slate-700 rounded-lg transition-colors flex items-center gap-2 cursor-pointer whitespace-nowrap shrink-0"
              >
                <ShieldCheck className="w-4 h-4 text-amber-400" />
                <span>Executive Risk Audit</span>
              </button>

              <button
                onClick={() => onNavigateTab("portfolio")}
                className="px-4 py-2.5 text-xs font-medium text-slate-200 bg-slate-900 hover:bg-slate-800 border border-slate-700 rounded-lg transition-colors flex items-center gap-2 cursor-pointer whitespace-nowrap shrink-0"
              >
                <PieChart className="w-4 h-4 text-sky-400" />
                <span>Portfolio Engine</span>
              </button>

              <button
                onClick={onOpenSearchModal}
                className="px-3.5 py-2 text-xs font-medium text-slate-400 hover:text-white transition-colors flex items-center gap-1.5 cursor-pointer whitespace-nowrap shrink-0"
              >
                <Search className="w-3.5 h-3.5" />
                <span>Audit Custom Ticker</span>
              </button>
            </div>

            {/* Unboxed Metadata (Zero-Pill discipline) */}
            <div className="pt-4 border-t border-slate-800/80 flex flex-wrap items-center gap-4 text-xs text-slate-400">
              <div className="flex items-center gap-1.5">
                <span className="font-mono tabular-nums text-white font-semibold">12+</span>
                <span>Preloaded Funds</span>
              </div>
              <span aria-hidden="true" className="text-slate-700">·</span>
              <div className="flex items-center gap-1.5">
                <span className="font-mono tabular-nums text-emerald-400 font-semibold">{greenFunds.length}</span>
                <span>Green Safe</span>
              </div>
              <span aria-hidden="true" className="text-slate-700">·</span>
              <div className="flex items-center gap-1.5">
                <span className="font-mono tabular-nums text-rose-400 font-semibold">{redFunds.length}</span>
                <span>Red Traps Flagged</span>
              </div>
              <span aria-hidden="true" className="text-slate-700">·</span>
              <div className="flex items-center gap-1.5">
                <span className="text-slate-300 font-medium">3Y &amp; 5Y Dividend CAGR</span>
              </div>
            </div>
          </div>

          {/* Right Column: Hero Visual Asset with resilient fallback */}
          <div className="lg:col-span-5">
            <div className="relative rounded-xl overflow-hidden border border-slate-800 bg-[#080d19] aspect-[16/9] lg:aspect-[4/3] shadow-2xl">
              <img
                src={heroIncomeImg}
                onError={(e) => {
                  const target = e.currentTarget;
                  if (target.src !== "/images/hero_income_diagnostic_1792328608973.jpg") {
                    target.src = "/images/hero_income_diagnostic_1792328608973.jpg";
                  }
                }}
                alt="Institutional wealth management income diagnostic terminal"
                loading="eager"
                className="w-full h-full object-cover object-center"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#080d19] via-transparent to-transparent pointer-events-none" />
              <div className="absolute bottom-3 left-3 right-3 p-3 bg-slate-950/80 backdrop-blur-md border border-slate-800/80 rounded-lg flex items-center justify-between text-xs">
                <div>
                  <div className="text-white font-semibold">Forensic Wealth Terminal</div>
                  <div className="text-slate-400 text-[11px]">Strict quantitative rules &amp; tax modeling</div>
                </div>
                <span className="text-emerald-400 font-mono font-medium text-xs">Active Engine</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* =========================================================================
          ASYMMETRIC BENTO GRID: CORE CAPABILITIES & MECHANISMS
         ========================================================================= */}
      <section className="space-y-6">
        <div>
          <div className="text-xs font-semibold text-sky-400 tracking-wider uppercase mb-1">
            System Capabilities
          </div>
          <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
            Comprehensive Analytical Architecture
          </h2>
          <p className="text-xs sm:text-sm text-slate-400 mt-1 max-w-2xl">
            Engineered to evaluate option writing mechanics, distribution sustainability, and true tax drag across taxable and sheltered wealth accounts.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {/* Bento Card 1: col-span-2 Fleet Risk Matrix */}
          <div className="md:col-span-2 bg-[#0f172a] border border-slate-800 rounded-xl p-6 flex flex-col justify-between hover:border-slate-700 transition-colors">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-mono text-sky-400 font-semibold">01. Fleet Risk Matrix</span>
                <span className="text-xs text-slate-500">Automated 12-Month Audits</span>
              </div>
              <h3 className="text-lg font-bold text-white">
                Multi-Factor Risk Classification &amp; NAV Trajectory
              </h3>
              <p className="text-xs text-slate-300 leading-relaxed max-w-xl">
                Continuously evaluates funds across 3-month, 6-month, and 12-month trailing NAV changes. Detects whether distribution payouts are generated from active option premium, underlying dividend cash flows, or destructive capital return.
              </p>

              {/* Visual feature asset */}
              <div className="relative rounded-lg overflow-hidden border border-slate-800/80 aspect-[16/7] my-3">
                <img
                  src={featureMatrixImg}
                  onError={(e) => {
                    const target = e.currentTarget;
                    if (target.src !== "/images/feature_matrix_audit_1792328609883.jpg") {
                      target.src = "/images/feature_matrix_audit_1792328609883.jpg";
                    }
                  }}
                  alt="Risk Audit Matrix interface"
                  loading="lazy"
                  className="w-full h-full object-cover"
                />
              </div>

              <div className="grid grid-cols-3 gap-3 pt-2 text-xs">
                <div className="bg-[#0b101e] border border-slate-800 p-2.5 rounded-lg">
                  <div className="text-slate-400 text-[11px]">Green Threshold</div>
                  <div className="font-mono text-emerald-400 font-bold mt-0.5">&ge; -1.5% NAV</div>
                </div>
                <div className="bg-[#0b101e] border border-slate-800 p-2.5 rounded-lg">
                  <div className="text-slate-400 text-[11px]">Yellow Threshold</div>
                  <div className="font-mono text-amber-400 font-bold mt-0.5">-1.5% to -3.0%</div>
                </div>
                <div className="bg-[#0b101e] border border-slate-800 p-2.5 rounded-lg">
                  <div className="text-slate-400 text-[11px]">Red Liquidation</div>
                  <div className="font-mono text-rose-400 font-bold mt-0.5">&lt; -3.0% NAV</div>
                </div>
              </div>
            </div>

            <div className="pt-5 mt-4 border-t border-slate-800/80 flex items-center justify-between">
              <span className="text-xs text-slate-400">Sort by yield, CAGR, or status</span>
              <button
                onClick={() => onNavigateTab("fleet")}
                className="text-xs font-semibold text-sky-400 hover:text-sky-300 transition-colors flex items-center gap-1 cursor-pointer"
              >
                <span>View Fleet Matrix</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Bento Card 2: col-span-1 Dividend CAGR & Sustainability */}
          <div className="md:col-span-1 bg-[#0f172a] border border-slate-800 rounded-xl p-6 flex flex-col justify-between hover:border-slate-700 transition-colors">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-mono text-emerald-400 font-semibold">02. Dividend CAGR</span>
                <span className="text-xs text-slate-500">3Y &amp; 5Y Trends</span>
              </div>
              <h3 className="text-lg font-bold text-white">
                Payout Growth vs. Stagnation
              </h3>
              <p className="text-xs text-slate-300 leading-relaxed">
                A high yield that shrinks every year is a compounding trap. We track 3-year and 5-year Compound Annual Growth Rates (CAGR) on distribution per share.
              </p>

              <div className="space-y-3 pt-2">
                <div className="p-3 bg-[#0b101e] border border-slate-800 rounded-lg">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-slate-300 font-medium">Sustainable Grower</span>
                    <span className="text-emerald-400 font-mono font-bold">+4.8% CAGR</span>
                  </div>
                  <div className="text-[11px] text-slate-500 mt-1">
                    Expanding monthly distributions with NAV appreciation (e.g. JEPI, MAIN)
                  </div>
                </div>

                <div className="p-3 bg-[#0b101e] border border-slate-800 rounded-lg">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-slate-300 font-medium">Eroding Yield Trap</span>
                    <span className="text-rose-400 font-mono font-bold">-14.2% CAGR</span>
                  </div>
                  <div className="text-[11px] text-slate-500 mt-1">
                    Capped upside + full downside forces consecutive monthly payout cuts (e.g. TSLY)
                  </div>
                </div>
              </div>
            </div>

            <div className="pt-5 mt-4 border-t border-slate-800/80 flex items-center justify-between">
              <span className="text-xs text-slate-400">Mini-sparkline visualizer</span>
              <button
                onClick={() => {
                  onSelectFund("MAIN");
                  onNavigateTab("diagnostics");
                }}
                className="text-xs font-semibold text-emerald-400 hover:text-emerald-300 transition-colors flex items-center gap-1 cursor-pointer"
              >
                <span>Audit Growers</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Bento Card 3: col-span-1 Portfolio Engine */}
          <div className="md:col-span-1 bg-[#0f172a] border border-slate-800 rounded-xl p-6 flex flex-col justify-between hover:border-slate-700 transition-colors">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-mono text-purple-400 font-semibold">03. Portfolio Engine</span>
                <span className="text-xs text-slate-500">Allocation Screener</span>
              </div>
              <h3 className="text-lg font-bold text-white">
                Stress-Testing &amp; 1-Click Replacements
              </h3>
              <p className="text-xs text-slate-300 leading-relaxed">
                Simulate your multi-asset income portfolio under Equal-Weighted, Yield-Weighted, or Capital-Preservation strategies. Instantly replace flagged red funds with sustainable peers.
              </p>

              <div className="p-3 bg-[#0b101e] border border-slate-800 rounded-lg space-y-2">
                <div className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Algorithmic Replacement Matching</span>
                </div>
                <div className="text-[11px] text-slate-400 leading-relaxed">
                  Automatically pairs hazardous single-stock vehicles with resilient index-based covered call funds with matching asset classes.
                </div>
              </div>
            </div>

            <div className="pt-5 mt-4 border-t border-slate-800/80 flex items-center justify-between">
              <span className="text-xs text-slate-400">Custom capital sizing</span>
              <button
                onClick={() => onNavigateTab("portfolio")}
                className="text-xs font-semibold text-purple-400 hover:text-purple-300 transition-colors flex items-center gap-1 cursor-pointer"
              >
                <span>Launch Engine</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Bento Card 4: col-span-2 Tax & ROC Simulator */}
          <div className="md:col-span-2 bg-[#0f172a] border border-slate-800 rounded-xl p-6 flex flex-col justify-between hover:border-slate-700 transition-colors">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-mono text-amber-400 font-semibold">04. Tax Efficiency</span>
                <span className="text-xs text-slate-500">After-Tax Net Yield</span>
              </div>
              <h3 className="text-lg font-bold text-white">
                Tax Drag &amp; Return of Capital (ROC) Simulator
              </h3>
              <p className="text-xs text-slate-300 leading-relaxed max-w-xl">
                Taxes are the largest single drag on taxable income portfolios. Our simulator calculates true after-tax yield based on your marginal tax rate, separating qualified dividends from ordinary income, Section 1256 60/40 treatment, and non-taxable ROC cost-basis deferrals.
              </p>

              {/* Visual feature asset */}
              <div className="relative rounded-lg overflow-hidden border border-slate-800/80 aspect-[16/7] my-3">
                <img
                  src={featureTaxImg}
                  onError={(e) => {
                    const target = e.currentTarget;
                    if (target.src !== "/images/feature_tax_simulator_1792328609265.jpg") {
                      target.src = "/images/feature_tax_simulator_1792328609265.jpg";
                    }
                  }}
                  alt="Tax efficiency simulator interface"
                  loading="lazy"
                  className="w-full h-full object-cover"
                />
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-2 text-xs">
                <div className="bg-[#0b101e] border border-slate-800 p-2 rounded">
                  <span className="text-slate-400 text-[11px]">Qualified Divs</span>
                  <div className="font-mono text-white font-semibold">15% - 20% Tax</div>
                </div>
                <div className="bg-[#0b101e] border border-slate-800 p-2 rounded">
                  <span className="text-slate-400 text-[11px]">Sec 1256 Options</span>
                  <div className="font-mono text-white font-semibold">60/40 Split</div>
                </div>
                <div className="bg-[#0b101e] border border-slate-800 p-2 rounded">
                  <span className="text-slate-400 text-[11px]">Non-Taxable ROC</span>
                  <div className="font-mono text-emerald-400 font-semibold">0% Current Tax</div>
                </div>
                <div className="bg-[#0b101e] border border-slate-800 p-2 rounded">
                  <span className="text-slate-400 text-[11px]">Ordinary Income</span>
                  <div className="font-mono text-rose-400 font-semibold">Marginal Rate</div>
                </div>
              </div>
            </div>

            <div className="pt-5 mt-4 border-t border-slate-800/80 flex items-center justify-between">
              <span className="text-xs text-slate-400">Includes fund preset loaders</span>
              <button
                onClick={() => onNavigateTab("simulator")}
                className="text-xs font-semibold text-amber-400 hover:text-amber-300 transition-colors flex items-center gap-1 cursor-pointer"
              >
                <span>Calculate After-Tax Cash Flow</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* =========================================================================
          THE 3-TIER DIAGNOSTIC STANDARD (Proof & Evidence)
         ========================================================================= */}
      <section className="bg-[#0f172a] border border-slate-800 rounded-2xl p-6 sm:p-8 space-y-6">
        <div>
          <div className="text-xs font-semibold text-sky-400 tracking-wider uppercase mb-1">
            Institutional Methodology
          </div>
          <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
            The Quantitative Traffic-Light Standard
          </h2>
          <p className="text-xs sm:text-sm text-slate-400 mt-1 max-w-2xl">
            How our diagnostic engine evaluates every income ETF, BDC, and synthetic covered call fund.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {/* GREEN Standard */}
          <div className="bg-[#0b101e] border border-emerald-900/60 rounded-xl p-5 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-emerald-400" />
                <span className="font-bold text-emerald-400 text-sm tracking-wide">STATUS: GREEN</span>
              </div>
              <span className="text-xs font-mono text-emerald-400 font-semibold">&ge; -1.5% NAV</span>
            </div>
            <h3 className="text-sm font-semibold text-white">
              Sustainable Growth &amp; Out-of-the-Money Spreads
            </h3>
            <p className="text-xs text-slate-300 leading-relaxed">
              Funds writing calls out-of-the-money (1.5%–3% above market) or utilizing disciplined equity-linked notes (ELNs). Preserves upside participation during market rallies, preventing the NAV from decaying.
            </p>
            <div className="text-[11px] text-slate-400 pt-2 border-t border-slate-800/80">
              <strong>Representative Funds:</strong> JEPI, JEPQ, SPYI, MAIN, O
            </div>
          </div>

          {/* YELLOW Standard */}
          <div className="bg-[#0b101e] border border-amber-900/60 rounded-xl p-5 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-amber-400" />
                <span className="font-bold text-amber-400 text-sm tracking-wide">STATUS: YELLOW</span>
              </div>
              <span className="text-xs font-mono text-amber-400 font-semibold">-1.5% to -3.0%</span>
            </div>
            <h3 className="text-sm font-semibold text-white">
              Capital Stagnation &amp; Rigid At-the-Money Capping
            </h3>
            <p className="text-xs text-slate-300 leading-relaxed">
              Funds writing 100% ATM calls each month. Every selloff locks in losses that cannot be recovered on the rebound. Generates reliable monthly cash flow but suffers gradual NAV stagnation over multi-year periods.
            </p>
            <div className="text-[11px] text-slate-400 pt-2 border-t border-slate-800/80">
              <strong>Representative Funds:</strong> XYLD, PFF
            </div>
          </div>

          {/* RED Standard */}
          <div className="bg-[#0b101e] border border-rose-900/60 rounded-xl p-5 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <AlertOctagon className="w-5 h-5 text-rose-400" />
                <span className="font-bold text-rose-400 text-sm tracking-wide">STATUS: RED</span>
              </div>
              <span className="text-xs font-mono text-rose-400 font-semibold">&lt; -3.0% NAV</span>
            </div>
            <h3 className="text-sm font-semibold text-white">
              Destructive ROC &amp; Synthetic Single-Stock Decay
            </h3>
            <p className="text-xs text-slate-300 leading-relaxed">
              Synthetic option strategies on volatile single stocks. Upside is strictly capped while bearing 100% of the downside. The massive 50%+ yields are heavily funded by returning your own deteriorating capital.
            </p>
            <div className="text-[11px] text-slate-400 pt-2 border-t border-slate-800/80">
              <strong>Representative Funds:</strong> NVDY, TSLY, CONY
            </div>
          </div>
        </div>
      </section>

      {/* =========================================================================
          FEATURED PRELOADED FUNDS SHOWCASE
         ========================================================================= */}
      <section className="space-y-4">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <div className="text-xs font-semibold text-sky-400 tracking-wider uppercase mb-1">
              Evaluated Roster
            </div>
            <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
              Pre-Audited Benchmark &amp; Income Funds
            </h2>
            <p className="text-xs sm:text-sm text-slate-400 mt-0.5">
              Select any fund below to inspect its forensic diagnostic breakdown.
            </p>
          </div>

          <button
            onClick={() => onNavigateTab("fleet")}
            className="text-xs font-semibold text-sky-400 hover:text-sky-300 transition-colors flex items-center gap-1.5 cursor-pointer"
          >
            <span>Open Full Fleet Matrix ({totalFunds} funds)</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {funds.slice(0, 4).map((fund) => {
            const isGreen = fund.alert_status === "GREEN";
            const isYellow = fund.alert_status === "YELLOW";
            const isRed = fund.alert_status === "RED";

            return (
              <div
                key={fund.ticker}
                onClick={() => {
                  onSelectFund(fund.ticker);
                  onNavigateTab("diagnostics");
                }}
                className="bg-[#0f172a] hover:bg-[#131d33] border border-slate-800 hover:border-slate-700 rounded-xl p-4 cursor-pointer transition-all flex flex-col justify-between group shadow-sm"
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-mono text-lg font-bold text-white group-hover:text-sky-400 transition-colors">
                      {fund.ticker}
                    </span>
                    <span
                      className={`text-[11px] font-bold px-2 py-0.5 rounded border ${
                        isGreen
                          ? "bg-emerald-950/80 border-emerald-700/80 text-emerald-300"
                          : isYellow
                          ? "bg-amber-950/80 border-amber-700/80 text-amber-300"
                          : "bg-rose-950/80 border-rose-700/80 text-rose-300"
                      }`}
                    >
                      {fund.alert_status}
                    </span>
                  </div>

                  <div className="text-xs text-slate-300 font-medium line-clamp-1">
                    {fund.fund_name}
                  </div>
                  <div className="text-[11px] text-slate-500 mt-0.5">
                    {fund.category}
                  </div>

                  <div className="grid grid-cols-2 gap-2 mt-4 pt-3 border-t border-slate-800/80 text-xs">
                    <div>
                      <div className="text-slate-400 text-[10px]">Distribution Yield</div>
                      <div className="font-mono text-white font-bold tabular-nums">
                        {fund.distribution_yield_pct.toFixed(1)}%
                      </div>
                    </div>
                    <div>
                      <div className="text-slate-400 text-[10px]">12M NAV Drift</div>
                      <div
                        className={`font-mono font-bold tabular-nums ${
                          fund.nav_change_12m_pct >= 0
                            ? "text-emerald-400"
                            : fund.nav_change_12m_pct >= -3.0
                            ? "text-amber-400"
                            : "text-rose-400"
                        }`}
                      >
                        {fund.nav_change_12m_pct > 0 ? "+" : ""}
                        {fund.nav_change_12m_pct.toFixed(1)}%
                      </div>
                    </div>
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-slate-800/80 flex items-center justify-between text-xs text-slate-400 group-hover:text-sky-400 transition-colors">
                  <span>Audit Diagnostics</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* =========================================================================
          FREQUENTLY ASKED QUESTIONS & METHODOLOGY NOTES
         ========================================================================= */}
      <section className="bg-[#0f172a] border border-slate-800 rounded-2xl p-6 sm:p-8 space-y-4">
        <div>
          <div className="text-xs font-semibold text-sky-400 tracking-wider uppercase mb-1">
            Knowledge Base
          </div>
          <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
            Frequently Asked Questions
          </h2>
          <p className="text-xs sm:text-sm text-slate-400 mt-0.5">
            Key concepts in covered call ETF analysis and capital preservation.
          </p>
        </div>

        <div className="space-y-3 pt-2">
          {[
            {
              q: "What is the difference between destructive and constructive Return of Capital (ROC)?",
              a: "Constructive ROC occurs when a fund passes through unrealized accounting losses or Section 1256 options distributions, lowering your cost basis without shrinking fund assets. Destructive ROC happens when a fund distributes money it did not earn, returning your original invested capital while NAV steadily drops toward zero.",
            },
            {
              q: "Why do single-stock YieldMax funds (NVDY, TSLY) have such high yields but RED alerts?",
              a: "Single-stock option strategies suffer from asymmetric payoff profiles: upside gains are strictly capped at the monthly strike price, but they participate in 100% of underlying stock crashes. Over time, volatile stocks chop the NAV downward, forcing subsequent monthly dividend distributions to be cut.",
            },
            {
              q: "How does out-of-the-money (OTM) call writing protect long-term capital?",
              a: "By writing call options 1.5% to 3.0% out-of-the-money (like JEPI and SPYI), the fund captures both equity upside rallies and option cash flow. This creates room for NAV expansion during bull markets to offset inevitable market pullbacks.",
            },
            {
              q: "How does the Tax Efficiency Simulator calculate after-tax yield?",
              a: "It separates your gross distribution into qualified dividends (taxed at 15%–20%), constructive ROC (0% current tax, defers to sale), Section 1256 option contracts (60% long-term / 40% short-term), and ordinary income (taxed at your marginal tax bracket).",
            },
          ].map((item, idx) => (
            <div
              key={idx}
              className="bg-[#0b101e] border border-slate-800/80 rounded-lg overflow-hidden"
            >
              <button
                onClick={() => setActiveFaq(activeFaq === idx ? null : idx)}
                className="w-full text-left p-4 flex items-center justify-between gap-4 text-xs sm:text-sm font-semibold text-white hover:text-sky-300 transition-colors cursor-pointer"
              >
                <span>{item.q}</span>
                <span className="text-slate-500 font-mono text-base">
                  {activeFaq === idx ? "−" : "+"}
                </span>
              </button>
              {activeFaq === idx && (
                <div className="px-4 pb-4 text-xs text-slate-300 leading-relaxed border-t border-slate-800/60 pt-3">
                  {item.a}
                </div>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* =========================================================================
          FINAL ACTION CALLOUT / CONVERSION BLOCK
         ========================================================================= */}
      <section className="bg-gradient-to-r from-sky-950/40 via-slate-900 to-slate-900 border border-slate-800 rounded-2xl p-6 sm:p-8 flex flex-wrap items-center justify-between gap-6">
        <div className="space-y-1 max-w-xl">
          <h3 className="text-lg sm:text-xl font-bold text-white tracking-tight">
            Ready to audit your income portfolio?
          </h3>
          <p className="text-xs sm:text-sm text-slate-400">
            Scan your holdings across our quantitative rules, uncover hidden NAV drag, and simulate true after-tax returns.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => onNavigateTab("fleet")}
            className="px-5 py-2.5 text-xs font-semibold text-slate-950 bg-sky-400 hover:bg-sky-300 rounded-lg transition-colors flex items-center gap-2 cursor-pointer shadow-sm"
          >
            <span>Explore Fleet Matrix</span>
            <ArrowRight className="w-4 h-4" />
          </button>
          <button
            onClick={onOpenSearchModal}
            className="px-4 py-2.5 text-xs font-medium text-slate-300 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-lg transition-colors cursor-pointer"
          >
            Audit Any Ticker
          </button>
        </div>
      </section>
    </div>
  );
};
