import React, { useState } from "react";
import { FundProfile, FundCategory, DividendGrowthClassification } from "../types/fund";
import { evaluateFundRules, classifyDividendGrowth } from "../data/fundsData";
import { X, Plus, Search, Sparkles, Bot, Loader2, CheckCircle2, TrendingUp } from "lucide-react";

interface CustomTickerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddFund: (newFund: FundProfile) => void;
  existingTickers: string[];
}

export const CustomTickerModal: React.FC<CustomTickerModalProps> = ({
  isOpen,
  onClose,
  onAddFund,
  existingTickers,
}) => {
  const [ticker, setTicker] = useState("");
  const [fundName, setFundName] = useState("");
  const [category, setCategory] = useState<FundCategory>("Broad Index Covered Call");
  const [yieldPct, setYieldPct] = useState<string>("10.5");
  const [nav3m, setNav3m] = useState<string>("0.5");
  const [nav6m, setNav6m] = useState<string>("1.2");
  const [nav12m, setNav12m] = useState<string>("-1.8");
  const [totalReturn12m, setTotalReturn12m] = useState<string>("8.5");
  const [cagr3y, setCagr3y] = useState<string>("3.5");
  const [cagr5y, setCagr5y] = useState<string>("");
  const [growthClassification, setGrowthClassification] = useState<DividendGrowthClassification>("Growing");
  const [customRiskSummary, setCustomRiskSummary] = useState<string>("");
  const [customReplacement, setCustomReplacement] = useState<string>("");

  const [isAiLoading, setIsAiLoading] = useState(false);
  const [aiSuccessMessage, setAiSuccessMessage] = useState("");

  if (!isOpen) return null;

  // Preset quick picks with dividend growth classifications
  const presets = [
    {
      ticker: "FEPI",
      name: "REX FANG & Innovation Equity Premium Income ETF",
      category: "Broad Index Covered Call" as FundCategory,
      yield: 25.1,
      nav3m: 0.8,
      nav6m: 1.4,
      nav12m: 2.1,
      tr12m: 27.2,
      cagr3y: "",
      cagr5y: "",
      growth: "Stable" as DividendGrowthClassification,
      risk: "Concentrated FANG+ tech basket with out-of-the-money call writing. High volatility enables sustainable premium harvesting with positive NAV growth (+2.1%).",
      replacement: "Retain position (high performance tech income vehicle)",
    },
    {
      ticker: "SVOL",
      name: "Simplify Volatility Premium ETF",
      category: "Broad Index Covered Call" as FundCategory,
      yield: 16.2,
      nav3m: 0.2,
      nav6m: 0.8,
      nav12m: 1.1,
      tr12m: 17.3,
      cagr3y: "0.8",
      cagr5y: "",
      growth: "Stable" as DividendGrowthClassification,
      risk: "Short VIX futures income strategy protected by deep out-of-the-money VIX call options. Tail-risk hedge prevents catastrophic roll collapse while paying monthly cash.",
      replacement: "Retain position (uncorrelated volatility income hedge)",
    },
    {
      ticker: "CONY",
      name: "YieldMax COIN Option Income Strategy ETF",
      category: "Single Stock Covered Call" as FundCategory,
      yield: 72.5,
      nav3m: -6.4,
      nav6m: -14.2,
      nav12m: -28.5,
      tr12m: 12.4,
      cagr3y: "",
      cagr5y: "",
      growth: "Declining" as DividendGrowthClassification,
      risk: "Extreme crypto-correlated synthetic options strategy. Astronomical headline yield masks rapid -28.5% NAV liquidation resulting from call strikes breached on volatile rallies.",
      replacement: "JEPQ (Tech/broad income) or SVOL",
    },
    {
      ticker: "QQQI",
      name: "NEOS Nasdaq-100 High Income ETF",
      category: "Broad Index Covered Call" as FundCategory,
      yield: 14.2,
      nav3m: 1.1,
      nav6m: 2.4,
      nav12m: 3.5,
      tr12m: 18.2,
      cagr3y: "",
      cagr5y: "",
      growth: "Stable" as DividendGrowthClassification,
      risk: "Nasdaq-100 call spread strategy offering 60/40 tax advantages and partial upside participation. Zero destructive ROC with positive capital appreciation.",
      replacement: "Retain position (premier tax-efficient Nasdaq income)",
    },
  ];

  const handleApplyPreset = (preset: typeof presets[0]) => {
    setTicker(preset.ticker);
    setFundName(preset.name);
    setCategory(preset.category);
    setYieldPct(preset.yield.toString());
    setNav3m(preset.nav3m.toString());
    setNav6m(preset.nav6m.toString());
    setNav12m(preset.nav12m.toString());
    setTotalReturn12m(preset.tr12m.toString());
    setCagr3y(preset.cagr3y);
    setCagr5y(preset.cagr5y);
    setGrowthClassification(preset.growth);
    setCustomRiskSummary(preset.risk);
    setCustomReplacement(preset.replacement);
    setAiSuccessMessage("");
  };

  // Live Gemini Analysis API call
  const handleAnalyzeWithGemini = async () => {
    const symbol = ticker.trim().toUpperCase();
    if (!symbol) return;

    setIsAiLoading(true);
    setAiSuccessMessage("");

    try {
      const response = await fetch("/api/analyze-fund", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ticker: symbol }),
      });

      if (!response.ok) {
        throw new Error("Failed to analyze with Gemini");
      }

      const result = await response.json();

      setFundName(result.fund_name || `${symbol} Income Fund`);
      if (result.category) setCategory(result.category);
      if (result.distribution_yield_pct !== undefined)
        setYieldPct(String(result.distribution_yield_pct));
      if (result.nav_change_3m_pct !== undefined)
        setNav3m(String(result.nav_change_3m_pct));
      if (result.nav_change_6m_pct !== undefined)
        setNav6m(String(result.nav_change_6m_pct));
      if (result.nav_change_12m_pct !== undefined)
        setNav12m(String(result.nav_change_12m_pct));
      if (result.total_return_12m_pct !== undefined)
        setTotalReturn12m(String(result.total_return_12m_pct));
      if (result.risk_summary) setCustomRiskSummary(result.risk_summary);
      if (result.replacement_candidate)
        setCustomReplacement(result.replacement_candidate);
      if (result.dividend_cagr_3y_pct !== undefined && result.dividend_cagr_3y_pct !== null)
        setCagr3y(String(result.dividend_cagr_3y_pct));
      if (result.dividend_cagr_5y_pct !== undefined && result.dividend_cagr_5y_pct !== null)
        setCagr5y(String(result.dividend_cagr_5y_pct));
      if (result.dividend_growth_classification)
        setGrowthClassification(result.dividend_growth_classification);

      setAiSuccessMessage(
        `Diagnostic Audit Complete: ${result.alert_status} Status · ${
          result.is_destructive_roc ? "Destructive ROC" : "Healthy ROC"
        } · ${result.dividend_growth_classification || "Income Analyzed"}`
      );
    } catch {
      // Fallback locally
      const cleanTicker = symbol;
      const nav12 = parseFloat(nav12m) || -1.5;
      const tr12 = parseFloat(totalReturn12m) || 8.0;
      const yld = parseFloat(yieldPct) || 10.0;
      const { alert_status, is_destructive_roc } = evaluateFundRules(nav12, tr12, yld, category);
      const c3 = cagr3y.trim() !== "" ? parseFloat(cagr3y) : null;
      const c5 = cagr5y.trim() !== "" ? parseFloat(cagr5y) : null;
      const growth = classifyDividendGrowth(c3, c5, is_destructive_roc);
      setGrowthClassification(growth);

      setCustomRiskSummary(
        is_destructive_roc
          ? `Severe NAV erosion (${nav12}% 12M). High nominal yield (${yld}%) is actively depleting underlying principal.`
          : `NAV preservation (${nav12}% 12M) with total return (+${tr12}%). Sustainable income.`
      );
      setCustomReplacement(alert_status === "GREEN" ? "Retain position" : "JEPI or SPYI");
      setAiSuccessMessage(`Audited via rule engine (${alert_status})`);
    } finally {
      setIsAiLoading(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanTicker = ticker.trim().toUpperCase();
    if (!cleanTicker) return;

    const nav12 = parseFloat(nav12m) || 0;
    const tr12 = parseFloat(totalReturn12m) || 0;
    const yld = parseFloat(yieldPct) || 0;
    const cagr3Val = cagr3y.trim() !== "" ? parseFloat(cagr3y) : null;
    const cagr5Val = cagr5y.trim() !== "" ? parseFloat(cagr5y) : null;

    const { alert_status, is_destructive_roc } = evaluateFundRules(
      nav12,
      tr12,
      yld,
      category
    );

    const finalGrowth =
      growthClassification || classifyDividendGrowth(cagr3Val, cagr5Val, is_destructive_roc);

    const defaultRisk = is_destructive_roc
      ? `Severe NAV erosion (${nav12.toFixed(1)}% 12M). High nominal yield (${yld.toFixed(1)}%) is actively depleting underlying principal to finance distributions.`
      : alert_status === "YELLOW"
      ? `Mild NAV erosion (${nav12.toFixed(1)}% 12M). Upside capping indicates structural drag and distribution cut hazard unless market surges.`
      : `Healthy capital preservation (+${nav12.toFixed(1)}% 12M NAV) and positive total return (+${tr12.toFixed(1)}%). Sustainable income distribution.`;

    const defaultReplacement =
      alert_status === "GREEN"
        ? "Retain position (sound income generation)"
        : category === "Single Stock Covered Call"
        ? "JEPQ or JEPI (broad index covered calls with lower downside capture)"
        : "SPYI (tax-efficient index call spreads) or MAIN (BDC credit income)";

    const newFund: FundProfile = {
      id: cleanTicker,
      ticker: cleanTicker,
      fund_name: fundName.trim() || `${cleanTicker} Income Fund`,
      category,
      distribution_yield_pct: yld,
      nav_change_3m_pct: parseFloat(nav3m) || 0,
      nav_change_6m_pct: parseFloat(nav6m) || 0,
      nav_change_12m_pct: nav12,
      total_return_12m_pct: tr12,
      is_destructive_roc,
      alert_status,
      risk_summary: customRiskSummary.trim() || defaultRisk,
      replacement_candidate: customReplacement.trim() || defaultReplacement,
      description: `Evaluated income vehicle ${cleanTicker}.`,
      current_nav: 25.0,
      current_price: 25.0,
      aum_billions: 1.2,
      expense_ratio_pct: 0.65,
      inception_year: 2023,
      distribution_frequency: "Monthly",
      underlying_benchmark: category.includes("Nasdaq") ? "QQQ" : "SPY",
      benchmark_return_12m_pct: category.includes("Nasdaq") ? 26.4 : 22.8,
      nav_erosion_drag_pct: nav12 - 22.8,
      payout_history_stability: is_destructive_roc ? "Declining" : finalGrowth === "Growing" ? "Growing" : "Stable",
      roc_composition_pct: is_destructive_roc ? 65.0 : 5.0,
      is_tax_favorable_roc: !is_destructive_roc,
      dividend_cagr_3y_pct: cagr3Val,
      dividend_cagr_5y_pct: cagr5Val,
      dividend_growth_classification: finalGrowth,
      monthly_nav_history: [
        { month: "Nov", nav: 24.5, distribution: 0.25, benchmark_normalized: 100 },
        { month: "Dec", nav: 24.8, distribution: 0.26, benchmark_normalized: 103 },
        { month: "Jan", nav: 24.9, distribution: 0.25, benchmark_normalized: 105 },
        { month: "Feb", nav: 25.1, distribution: 0.27, benchmark_normalized: 108 },
        { month: "Mar", nav: 25.0, distribution: 0.25, benchmark_normalized: 110 },
        { month: "Apr", nav: 24.7, distribution: 0.24, benchmark_normalized: 107 },
        { month: "May", nav: 25.1, distribution: 0.26, benchmark_normalized: 112 },
        { month: "Jun", nav: 25.3, distribution: 0.26, benchmark_normalized: 114 },
        { month: "Jul", nav: 25.4, distribution: 0.27, benchmark_normalized: 116 },
        { month: "Aug", nav: 24.9, distribution: 0.25, benchmark_normalized: 115 },
        { month: "Sep", nav: 25.0, distribution: 0.25, benchmark_normalized: 118 },
        { month: "Oct", nav: 25.0, distribution: 0.26, benchmark_normalized: 122 },
      ],
      structural_pros: ["Custom analyzed position"],
      structural_cons: [is_destructive_roc ? "Active destructive ROC risk" : "Standard option upside capping"],
    };

    onAddFund(newFund);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-[#0f172a] border border-slate-700 w-full max-w-2xl rounded-xl shadow-2xl flex flex-col max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="px-5 py-4 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-1.5 bg-sky-950/80 border border-sky-800 rounded text-sky-400">
              <Search className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-white">
                Evaluate Ticker with Live Market Feed &amp; Rule Engine
              </h3>
              <p className="text-[11px] text-slate-400">
                Runs live price/yield ingestion and forensic ROC health analysis
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        <div className="p-5 overflow-y-auto space-y-4">
          {/* Quick Presets */}
          <div>
            <div className="text-xs font-medium text-slate-300 mb-2 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-sky-400" />
              <span>Institutional Quick Presets</span>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {presets.map((p) => (
                <button
                  key={p.ticker}
                  type="button"
                  onClick={() => handleApplyPreset(p)}
                  className="p-2 text-left bg-slate-900 border border-slate-800 hover:border-sky-500 rounded transition-colors cursor-pointer"
                >
                  <div className="font-mono font-bold text-white text-xs">{p.ticker}</div>
                  <div className="text-[10px] text-sky-400 font-mono">{p.yield}% Yield</div>
                  <div className="text-[10px] text-slate-500 truncate">{p.category}</div>
                </button>
              ))}
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4 pt-3 border-t border-slate-800">
            {/* Ticker Input with Market Feed Action */}
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">
                Ticker Symbol
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  required
                  placeholder="e.g. JEPI, NVDY, SVOL, FEPI"
                  value={ticker}
                  onChange={(e) => setTicker(e.target.value.toUpperCase())}
                  className="flex-1 bg-[#080d1a] border border-slate-700 rounded px-3 py-2 text-xs text-white font-mono uppercase focus:outline-none focus:border-sky-500"
                />
                <button
                  type="button"
                  onClick={handleAnalyzeWithGemini}
                  disabled={!ticker.trim() || isAiLoading}
                  className="px-4 py-2 bg-gradient-to-r from-sky-500 to-indigo-600 hover:from-sky-400 hover:to-indigo-500 disabled:opacity-50 text-white text-xs font-semibold rounded flex items-center gap-1.5 transition-all shadow-sm cursor-pointer"
                >
                  {isAiLoading ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      <span>Ingesting Data...</span>
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-3.5 h-3.5" />
                      <span>Ingest &amp; Audit Ticker</span>
                    </>
                  )}
                </button>
              </div>

              {aiSuccessMessage && (
                <div className="mt-2 text-xs text-emerald-400 flex items-center gap-1.5 font-medium">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>{aiSuccessMessage}</span>
                </div>
              )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">
                  Fund Full Name
                </label>
                <input
                  type="text"
                  placeholder="e.g. NEOS Nasdaq-100 High Income"
                  value={fundName}
                  onChange={(e) => setFundName(e.target.value)}
                  className="w-full bg-[#080d1a] border border-slate-700 rounded px-3 py-1.5 text-xs text-white focus:outline-none focus:border-sky-500"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">
                  Category
                </label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value as FundCategory)}
                  className="w-full bg-[#080d1a] border border-slate-700 rounded px-3 py-1.5 text-xs text-white focus:outline-none focus:border-sky-500"
                >
                  <option value="Broad Index Covered Call">Broad Index Covered Call</option>
                  <option value="Single Stock Covered Call">Single Stock Covered Call</option>
                  <option value="BDC">BDC</option>
                  <option value="Preferred">Preferred</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">
                  Distribution Yield (%)
                </label>
                <input
                  type="number"
                  step="0.1"
                  required
                  placeholder="e.g. 11.5"
                  value={yieldPct}
                  onChange={(e) => setYieldPct(e.target.value)}
                  className="w-full bg-[#080d1a] border border-slate-700 rounded px-3 py-1.5 text-xs text-white font-mono focus:outline-none focus:border-sky-500"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">
                  12M Total Return (%)
                </label>
                <input
                  type="number"
                  step="0.1"
                  required
                  value={totalReturn12m}
                  onChange={(e) => setTotalReturn12m(e.target.value)}
                  className="w-full bg-[#080d1a] border border-slate-700 rounded px-3 py-1.5 text-xs text-white font-mono focus:outline-none focus:border-sky-500"
                />
              </div>
            </div>

            {/* NAV Trends 3M, 6M, 12M */}
            <div className="pt-2 border-t border-slate-800">
              <span className="block text-xs font-medium text-slate-300 mb-2">
                NAV Change Trends (adjusted for distributions)
              </span>
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-[11px] text-slate-400 mb-1">3M NAV (%)</label>
                  <input
                    type="number"
                    step="0.1"
                    required
                    value={nav3m}
                    onChange={(e) => setNav3m(e.target.value)}
                    className="w-full bg-[#080d1a] border border-slate-700 rounded px-2.5 py-1 text-xs text-white font-mono focus:outline-none focus:border-sky-500"
                  />
                </div>
                <div>
                  <label className="block text-[11px] text-slate-400 mb-1">6M NAV (%)</label>
                  <input
                    type="number"
                    step="0.1"
                    required
                    value={nav6m}
                    onChange={(e) => setNav6m(e.target.value)}
                    className="w-full bg-[#080d1a] border border-slate-700 rounded px-2.5 py-1 text-xs text-white font-mono focus:outline-none focus:border-sky-500"
                  />
                </div>
                <div>
                  <label className="block text-[11px] text-slate-400 mb-1">12M NAV (%)</label>
                  <input
                    type="number"
                    step="0.1"
                    required
                    value={nav12m}
                    onChange={(e) => setNav12m(e.target.value)}
                    className="w-full bg-[#080d1a] border border-slate-700 rounded px-2.5 py-1 text-xs text-white font-mono focus:outline-none focus:border-sky-500"
                  />
                </div>
              </div>
            </div>

            {/* Dividend CAGR & Growth Sustainability */}
            <div className="pt-2 border-t border-slate-800">
              <span className="block text-xs font-medium text-slate-300 mb-2 flex items-center gap-1.5">
                <TrendingUp className="w-3.5 h-3.5 text-emerald-400" />
                <span>Dividend CAGR &amp; Payout Growth Sustainability</span>
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-[11px] text-slate-400 mb-1">
                    3-Year Dividend CAGR (%)
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    placeholder="e.g. 4.8 (blank if &lt;3Y)"
                    value={cagr3y}
                    onChange={(e) => setCagr3y(e.target.value)}
                    className="w-full bg-[#080d1a] border border-slate-700 rounded px-2.5 py-1 text-xs text-white font-mono focus:outline-none focus:border-sky-500"
                  />
                </div>
                <div>
                  <label className="block text-[11px] text-slate-400 mb-1">
                    5-Year Dividend CAGR (%)
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    placeholder="e.g. 5.2 (blank if &lt;5Y)"
                    value={cagr5y}
                    onChange={(e) => setCagr5y(e.target.value)}
                    className="w-full bg-[#080d1a] border border-slate-700 rounded px-2.5 py-1 text-xs text-white font-mono focus:outline-none focus:border-sky-500"
                  />
                </div>
                <div>
                  <label className="block text-[11px] text-slate-400 mb-1">
                    Payout Trajectory
                  </label>
                  <select
                    value={growthClassification}
                    onChange={(e) =>
                      setGrowthClassification(e.target.value as DividendGrowthClassification)
                    }
                    className="w-full bg-[#080d1a] border border-slate-700 rounded px-2.5 py-1 text-xs text-white focus:outline-none focus:border-sky-500"
                  >
                    <option value="Growing">Growing (&gt;2% CAGR)</option>
                    <option value="Stable">Stable (-0.5% to 2%)</option>
                    <option value="Stagnant">Stagnant (-2.5% to -0.5%)</option>
                    <option value="Declining">Declining (Payout erosion)</option>
                    <option value="Insufficient History">Insufficient History (&lt;3Y)</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Custom Notes / Risk Summary */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">
                  Risk Summary (AI Generated / Custom)
                </label>
                <textarea
                  rows={2}
                  placeholder="Gemini risk observations..."
                  value={customRiskSummary}
                  onChange={(e) => setCustomRiskSummary(e.target.value)}
                  className="w-full bg-[#080d1a] border border-slate-700 rounded px-3 py-1.5 text-xs text-white focus:outline-none focus:border-sky-500"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">
                  Replacement Candidate
                </label>
                <textarea
                  rows={2}
                  placeholder="Recommended swap candidate..."
                  value={customReplacement}
                  onChange={(e) => setCustomReplacement(e.target.value)}
                  className="w-full bg-[#080d1a] border border-slate-700 rounded px-3 py-1.5 text-xs text-white focus:outline-none focus:border-sky-500"
                />
              </div>
            </div>

            {/* Modal Actions */}
            <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-800">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-xs text-slate-300 hover:text-white bg-slate-800 rounded transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 text-xs font-semibold text-slate-900 bg-sky-400 hover:bg-sky-300 rounded transition-colors flex items-center gap-1.5 shadow-sm"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Evaluated Fund to Fleet</span>
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};
