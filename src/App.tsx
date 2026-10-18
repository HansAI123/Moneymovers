import React, { useState } from "react";
import { PRELOADED_FUNDS, BENCHMARKS, toStrictJsonOutput } from "./data/fundsData";
import { FundProfile, AlertStatus, FundCategory } from "./types/fund";
import { Navbar } from "./components/Navbar";
import { MetricRibbon } from "./components/MetricRibbon";
import { FundMatrixTable, TableFilter } from "./components/FundMatrixTable";
import { FundDiagnosticCard } from "./components/FundDiagnosticCard";
import { BenchmarkComparison } from "./components/BenchmarkComparison";
import { RocSimulator } from "./components/RocSimulator";
import { PortfolioEngine } from "./components/PortfolioEngine";
import { JsonViewerModal } from "./components/JsonViewerModal";
import { CustomTickerModal } from "./components/CustomTickerModal";
import { PythonCodeModal } from "./components/PythonCodeModal";
import {
  ShieldAlert,
  Search,
  Plus,
  FileJson,
  TrendingDown,
  ArrowRight,
  ExternalLink,
  Layers,
  Terminal,
  Bot
} from "lucide-react";

export default function App() {
  const [funds, setFunds] = useState<FundProfile[]>(PRELOADED_FUNDS);
  const [selectedTicker, setSelectedTicker] = useState<string>("JEPI");
  const [activeTab, setActiveTab] = useState<"fleet" | "portfolio" | "diagnostics" | "benchmark" | "simulator">("fleet");
  const [tableFilter, setTableFilter] = useState<TableFilter>("ALL");
  const [isJsonModalOpen, setIsJsonModalOpen] = useState<boolean>(false);
  const [isCustomModalOpen, setIsCustomModalOpen] = useState<boolean>(false);
  const [isPythonModalOpen, setIsPythonModalOpen] = useState<boolean>(false);

  // Active fund for deep diagnostic view
  const activeFund = funds.find((f) => f.ticker === selectedTicker) || funds[0];

  const handleSelectFund = (ticker: string) => {
    setSelectedTicker(ticker);
  };

  const handleViewJsonForFund = (fund: FundProfile) => {
    setSelectedTicker(fund.ticker);
    setIsJsonModalOpen(true);
  };

  const handleAddCustomFund = (newFund: FundProfile) => {
    const exists = funds.findIndex((f) => f.ticker === newFund.ticker);
    if (exists >= 0) {
      const updated = [...funds];
      updated[exists] = newFund;
      setFunds(updated);
    } else {
      setFunds([newFund, ...funds]);
    }
    setSelectedTicker(newFund.ticker);
  };

  const handleUpdateFund = (updatedFund: FundProfile) => {
    setFunds(funds.map((f) => (f.ticker === updatedFund.ticker ? updatedFund : f)));
  };

  return (
    <div className="min-h-screen bg-[#080c15] text-slate-100 flex flex-col font-sans">
      {/* Top Navigation Bar adhering to 3-Zone Contract */}
      <Navbar
        activeTab={activeTab}
        onTabChange={setActiveTab}
        onOpenJsonModal={() => setIsJsonModalOpen(true)}
        onOpenSearchModal={() => setIsCustomModalOpen(true)}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Executive Header Section */}
        <div className="flex flex-wrap items-end justify-between gap-4 mb-6">
          <div>
            <div className="text-xs text-sky-400 font-semibold tracking-wider uppercase mb-1 flex items-center gap-1.5">
              <Bot className="w-3.5 h-3.5" />
              <span>Gemini AI · Income ETF &amp; Covered Call Evaluator</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
              Income ETF &amp; Covered Call Evaluator
            </h1>
            <p className="text-xs sm:text-sm text-slate-400 mt-1 max-w-3xl leading-relaxed">
              Evaluating covered call strategies, synthetic single-stock funds, and BDCs for dividend safety, Return of Capital (ROC) health, and net asset value (NAV) erosion risk.
            </p>
          </div>

          <div className="flex items-center gap-2.5">
            <button
              onClick={() => setIsPythonModalOpen(true)}
              className="px-3.5 py-2 text-xs font-medium text-slate-300 bg-slate-900 hover:bg-slate-800 border border-slate-700/80 rounded-lg transition-colors flex items-center gap-1.5 cursor-pointer shadow-sm"
              title="View Google GenAI Python Code"
            >
              <Terminal className="w-3.5 h-3.5 text-sky-400" />
              <span>Python SDK</span>
            </button>
            <button
              onClick={() => setIsCustomModalOpen(true)}
              className="px-3.5 py-2 text-xs font-medium text-slate-200 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-lg transition-colors flex items-center gap-2 cursor-pointer shadow-sm"
            >
              <Plus className="w-3.5 h-3.5 text-sky-400" />
              <span>Evaluate Ticker</span>
            </button>
            <button
              onClick={() => setIsJsonModalOpen(true)}
              className="px-3.5 py-2 text-xs font-semibold text-slate-900 bg-sky-400 hover:bg-sky-300 rounded-lg transition-colors flex items-center gap-2 cursor-pointer shadow-sm"
            >
              <FileJson className="w-3.5 h-3.5" />
              <span>JSON Export</span>
            </button>
          </div>
        </div>

        {/* Executive KPI Ribbon */}
        <MetricRibbon
          funds={funds}
          benchmarks={BENCHMARKS}
          activeFilter={tableFilter}
          onFilterByStatus={(status) => {
            setTableFilter(status);
            setActiveTab("fleet");
          }}
        />

        {/* Tab 1: Fleet Overview & Matrix */}
        {activeTab === "fleet" && (
          <div className="space-y-6">
            <div className="space-y-6">
              <FundMatrixTable
                funds={funds}
                selectedTicker={selectedTicker}
                onSelectFund={handleSelectFund}
                onViewJson={handleViewJsonForFund}
                currentFilter={tableFilter}
                onFilterChange={setTableFilter}
              />

              {activeFund && (
                <div className="pt-2">
                  <div className="flex items-center justify-between mb-3">
                    <div className="text-xs font-semibold text-slate-300 flex items-center gap-2">
                      <Layers className="w-4 h-4 text-sky-400" />
                      <span>Active Focus: {activeFund.ticker} Analytical Diagnostic Breakdown</span>
                    </div>
                    <span className="text-xs text-slate-500">
                      Select any other row in table to change focus
                    </span>
                  </div>
                  <FundDiagnosticCard
                    fund={activeFund}
                    benchmarks={BENCHMARKS}
                    onViewJson={handleViewJsonForFund}
                    onUpdateFund={handleUpdateFund}
                    onOpenPythonModal={() => setIsPythonModalOpen(true)}
                    onSelectReplacement={(ticker) => {
                      const matched = funds.find((f) => f.ticker === ticker);
                      if (matched) setSelectedTicker(matched.ticker);
                    }}
                  />
                </div>
              )}
            </div>
          </div>
        )}

        {/* Tab 2: Portfolio Engine & Weighting Screener */}
        {activeTab === "portfolio" && (
          <PortfolioEngine
            availableFunds={funds}
            onSelectFund={(ticker) => {
              setSelectedTicker(ticker);
              setActiveTab("diagnostics");
            }}
            onPerformSwap={(oldTicker, newTicker) => {
              if (newTicker) {
                setSelectedTicker(newTicker);
              }
            }}
          />
        )}

        {/* Tab 3: Detailed Risk Diagnostics */}
        {activeTab === "diagnostics" && (
          <div className="space-y-6">
            <div className="bg-[#0f172a] border border-slate-800 rounded-lg p-3 flex flex-wrap items-center justify-between gap-3">
              <span className="text-xs text-slate-400 font-medium">Select Fund for Diagnostic Audit:</span>
              <div className="flex flex-wrap items-center gap-1.5">
                {funds.map((f) => (
                  <button
                    key={f.ticker}
                    onClick={() => setSelectedTicker(f.ticker)}
                    className={`px-3 py-1 rounded text-xs font-mono font-medium transition-colors ${
                      selectedTicker === f.ticker
                        ? "bg-sky-500 text-slate-950 font-bold"
                        : "bg-slate-900 text-slate-300 hover:bg-slate-800 border border-slate-800"
                    }`}
                  >
                    {f.ticker}
                  </button>
                ))}
              </div>
            </div>

            {activeFund && (
              <FundDiagnosticCard
                fund={activeFund}
                benchmarks={BENCHMARKS}
                onViewJson={handleViewJsonForFund}
                onUpdateFund={handleUpdateFund}
                onOpenPythonModal={() => setIsPythonModalOpen(true)}
                onSelectReplacement={(ticker) => {
                  const matched = funds.find((f) => f.ticker === ticker);
                  if (matched) setSelectedTicker(matched.ticker);
                }}
              />
            )}

            {/* Strategy Comparison Insight Box */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-[#0f172a] border border-slate-800 rounded-lg p-4">
                <div className="text-xs font-semibold text-emerald-400 mb-1">
                  GREEN: Out-of-the-Money &amp; Managed Spread (e.g. JEPI, JEPQ, SPYI)
                </div>
                <p className="text-xs text-slate-300 leading-relaxed">
                  Call options written at strikes 1.5%–3% above market, or using ELNs and call spreads. Allows positive NAV expansion during bull markets while delivering 7%–12% yields without principal liquidation.
                </p>
              </div>

              <div className="bg-[#0f172a] border border-slate-800 rounded-lg p-4">
                <div className="text-xs font-semibold text-amber-400 mb-1">
                  YELLOW: Rigid At-the-Money BuyWrite (e.g. XYLD)
                </div>
                <p className="text-xs text-slate-300 leading-relaxed">
                  Writes 100% ATM calls each month. Capping all capital appreciation prevents the fund from recovering after market selloffs. Mild continuous NAV decay (-1.5% to -3.0%) creates payout cut hazards over multi-year horizons.
                </p>
              </div>

              <div className="bg-[#0f172a] border border-slate-800 rounded-lg p-4">
                <div className="text-xs font-semibold text-rose-400 mb-1">
                  RED: Synthetic Single-Stock Options (e.g. NVDY, TSLY)
                </div>
                <p className="text-xs text-slate-300 leading-relaxed">
                  Synthetic options writing on high-beta single stocks. Severe upside capping combined with 100% downside participation leads to massive NAV erosion (&lt; -3.0%), with headline 50%+ yields driven by destructive Return of Capital.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Tab 4: Underlying Benchmark Comparison (SPY / QQQ) */}
        {activeTab === "benchmark" && (
          <BenchmarkComparison
            funds={funds}
            benchmarks={BENCHMARKS}
            onSelectFund={(ticker) => {
              setSelectedTicker(ticker);
              setActiveTab("diagnostics");
            }}
          />
        )}

        {/* Tab 5: Interactive ROC & Tax Efficiency Simulator */}
        {activeTab === "simulator" && <RocSimulator funds={funds} />}
      </main>

      {/* Strict JSON Output Modal */}
      <JsonViewerModal
        isOpen={isJsonModalOpen}
        onClose={() => setIsJsonModalOpen(false)}
        selectedFund={activeFund}
        allFunds={funds}
      />

      {/* Evaluate Custom Ticker Modal */}
      <CustomTickerModal
        isOpen={isCustomModalOpen}
        onClose={() => setIsCustomModalOpen(false)}
        onAddFund={handleAddCustomFund}
        existingTickers={funds.map((f) => f.ticker)}
      />

      {/* Python Script Modal */}
      <PythonCodeModal
        isOpen={isPythonModalOpen}
        onClose={() => setIsPythonModalOpen(false)}
        activeTicker={selectedTicker}
      />

      {/* Executive Footer */}
      <footer className="mt-auto border-t border-slate-800/80 bg-[#080c15] py-4 text-center text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 flex flex-wrap items-center justify-between gap-2">
          <span>Income ETF &amp; Covered Call Evaluator · Powered by Gemini AI &amp; Quantitative Rules</span>
          <div className="flex items-center gap-4 text-slate-400">
            <span>Alert Standards: GREEN (&ge; -1.5%) · YELLOW (-1.5% to -3.0%) · RED (&lt; -3.0%)</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
