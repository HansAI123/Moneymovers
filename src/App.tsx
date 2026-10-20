import React, { useState, useEffect } from "react";
import { PRELOADED_FUNDS, BENCHMARKS, toStrictJsonOutput } from "./data/fundsData";
import { FundProfile, AlertStatus, FundCategory, ProjectWorkspace, ProjectHolding } from "./types/fund";
import { Navbar, NavTab } from "./components/Navbar";
import { MetricRibbon } from "./components/MetricRibbon";
import { FundMatrixTable, TableFilter } from "./components/FundMatrixTable";
import { FundDiagnosticCard } from "./components/FundDiagnosticCard";
import { BenchmarkComparison } from "./components/BenchmarkComparison";
import { RocSimulator } from "./components/RocSimulator";
import { PortfolioEngine } from "./components/PortfolioEngine";
import { JsonViewerModal } from "./components/JsonViewerModal";
import { CustomTickerModal } from "./components/CustomTickerModal";
import { LandingPage } from "./components/LandingPage";
import { AuthModal } from "./components/AuthModal";
import { WorkspaceManagerModal } from "./components/WorkspaceManagerModal";
import { InteractiveAnalyticsSuite } from "./components/InteractiveAnalyticsSuite";
import { ExecutiveAuditReport } from "./components/ExecutiveAuditReport";
import { OverlapMatrix } from "./components/OverlapMatrix";
import { Sec19aAuditModal } from "./components/Sec19aAuditModal";
import {
  subscribeToAuth,
  logoutUser,
  fetchUserProjects,
  saveUserProject,
  deleteUserProject,
} from "./services/firebase";
import {
  ShieldAlert,
  Search,
  Plus,
  FileJson,
  Layers,
  ArrowRight,
  TrendingUp,
  Sliders,
  CheckCircle2,
  Briefcase,
} from "lucide-react";

// Default initial project workspaces
const DEFAULT_INITIAL_WORKSPACES: ProjectWorkspace[] = [
  {
    id: "proj_retirement_ira",
    userId: "guest",
    name: "Retirement Cash Flow IRA",
    description: "Capital preservation covered call portfolio with 8.5% target distribution yield",
    accountType: "traditional_ira",
    initialCapital: 100000,
    targetYieldPct: 8.5,
    marginalTaxRatePct: 24,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    holdings: [
      { ticker: "JEPI", weight_pct: 40 },
      { ticker: "SPYI", weight_pct: 35 },
      { ticker: "JEPQ", weight_pct: 25 },
    ],
  },
  {
    id: "proj_taxable_shielded",
    userId: "guest",
    name: "Tax-Shielded Growth & Income",
    description: "Section 1256 index call spread focus for 60/40 capital gains tax optimization",
    accountType: "taxable",
    initialCapital: 50000,
    targetYieldPct: 10.0,
    marginalTaxRatePct: 28,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    holdings: [
      { ticker: "SPYI", weight_pct: 45 },
      { ticker: "JEPI", weight_pct: 30 },
      { ticker: "GPIX", weight_pct: 25 },
    ],
  },
];

export default function App() {
  const [funds, setFunds] = useState<FundProfile[]>(PRELOADED_FUNDS);
  const [selectedTicker, setSelectedTicker] = useState<string>("JEPI");
  const [activeTab, setActiveTab] = useState<NavTab>("overview");
  const [tableFilter, setTableFilter] = useState<TableFilter>("ALL");

  // Modals state
  const [isJsonModalOpen, setIsJsonModalOpen] = useState<boolean>(false);
  const [isCustomModalOpen, setIsCustomModalOpen] = useState<boolean>(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState<boolean>(false);
  const [isWorkspaceModalOpen, setIsWorkspaceModalOpen] = useState<boolean>(false);
  const [isSec19aModalOpen, setIsSec19aModalOpen] = useState<boolean>(false);
  const [sec19aAuditTicker, setSec19aAuditTicker] = useState<string>("SPYI");
  const [editingWorkspace, setEditingWorkspace] = useState<ProjectWorkspace | null>(null);

  // Authentication and Multi-Project Workspace state
  const [currentUser, setCurrentUser] = useState<any | null>(null);
  const [projects, setProjects] = useState<ProjectWorkspace[]>(DEFAULT_INITIAL_WORKSPACES);
  const [activeWorkspaceId, setActiveWorkspaceId] = useState<string>(DEFAULT_INITIAL_WORKSPACES[0].id);

  // Active project workspace
  const activeWorkspace =
    projects.find((p) => p.id === activeWorkspaceId) || projects[0] || DEFAULT_INITIAL_WORKSPACES[0];

  // Active fund for deep diagnostic view
  const activeFund = funds.find((f) => f.ticker === selectedTicker) || funds[0];

  // Subscribe to Firebase Auth and load user's projects
  useEffect(() => {
    const unsubscribe = subscribeToAuth(async (user) => {
      setCurrentUser(user);
      if (user) {
        // Fetch projects from Firestore
        const userProjects = await fetchUserProjects(user.uid);
        if (userProjects.length > 0) {
          setProjects(userProjects);
          setActiveWorkspaceId(userProjects[0].id);
        } else {
          // Initialize user with default templates
          const initialized = DEFAULT_INITIAL_WORKSPACES.map((p) => ({
            ...p,
            id: `proj_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
            userId: user.uid,
          }));
          setProjects(initialized);
          setActiveWorkspaceId(initialized[0].id);
          for (const proj of initialized) {
            await saveUserProject(user.uid, proj);
          }
        }
      } else {
        // Load local guest projects
        const localProjects = await fetchUserProjects("guest");
        if (localProjects.length > 0) {
          setProjects(localProjects);
          setActiveWorkspaceId(localProjects[0].id);
        } else {
          setProjects(DEFAULT_INITIAL_WORKSPACES);
          setActiveWorkspaceId(DEFAULT_INITIAL_WORKSPACES[0].id);
        }
      }
    });

    return () => unsubscribe();
  }, []);

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

  // Workspace CRUD handlers
  const handleSaveWorkspace = async (savedWorkspace: ProjectWorkspace) => {
    const uid = currentUser?.uid || "guest";
    const updatedWithUser = { ...savedWorkspace, userId: uid };

    const exists = projects.findIndex((p) => p.id === savedWorkspace.id);
    let updatedProjects: ProjectWorkspace[];
    if (exists >= 0) {
      updatedProjects = [...projects];
      updatedProjects[exists] = updatedWithUser;
    } else {
      updatedProjects = [updatedWithUser, ...projects];
    }

    setProjects(updatedProjects);
    setActiveWorkspaceId(updatedWithUser.id);
    await saveUserProject(uid, updatedWithUser);
  };

  const handleDeleteWorkspace = async (workspaceId: string) => {
    const uid = currentUser?.uid || "guest";
    const remaining = projects.filter((p) => p.id !== workspaceId);
    const finalProjects = remaining.length > 0 ? remaining : DEFAULT_INITIAL_WORKSPACES;

    setProjects(finalProjects);
    if (activeWorkspaceId === workspaceId) {
      setActiveWorkspaceId(finalProjects[0].id);
    }
    await deleteUserProject(uid, workspaceId);
  };

  const handleLogout = async () => {
    await logoutUser();
    setCurrentUser(null);
  };

  return (
    <div className="min-h-screen bg-[#080c15] text-slate-100 flex flex-col font-sans">
      {/* Top Navigation Bar adhering to 3-Zone Contract with Auth & Project Switcher */}
      <Navbar
        activeTab={activeTab}
        onTabChange={setActiveTab}
        onOpenJsonModal={() => setIsJsonModalOpen(true)}
        onOpenSearchModal={() => setIsCustomModalOpen(true)}
        onOpenSec19aModal={() => {
          setSec19aAuditTicker(selectedTicker || "SPYI");
          setIsSec19aModalOpen(true);
        }}
        onOpenWelcomeGuide={() => {
          try {
            localStorage.removeItem("has_seen_income_welcome");
          } catch {
            // ignore
          }
          setActiveTab("overview");
        }}
        currentUser={currentUser}
        onOpenAuthModal={() => setIsAuthModalOpen(true)}
        onLogout={handleLogout}
        projects={projects}
        activeWorkspace={activeWorkspace}
        onSelectWorkspace={setActiveWorkspaceId}
        onOpenNewWorkspaceModal={() => {
          setEditingWorkspace(null);
          setIsWorkspaceModalOpen(true);
        }}
        onOpenEditWorkspaceModal={() => {
          setEditingWorkspace(activeWorkspace);
          setIsWorkspaceModalOpen(true);
        }}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Landing Page View (Welcome, Overview & Guide) */}
        {activeTab === "overview" && (
          <LandingPage
            funds={funds}
            onNavigateTab={setActiveTab}
            onOpenSearchModal={() => setIsCustomModalOpen(true)}
            onSelectFund={(ticker) => {
              setSelectedTicker(ticker);
              setActiveTab("diagnostics");
            }}
          />
        )}

        {/* Analytical Views (Fleet, Analytics, Audit, Portfolio, Overlap, Diagnostics, Benchmark, Simulator) */}
        {activeTab !== "overview" && (
          <div className="space-y-6">
            {/* Executive Workspace Header */}
            <div className="flex flex-wrap items-end justify-between gap-4 pb-2 border-b border-slate-800/80">
              <div>
                <div className="text-xs text-sky-400 font-semibold tracking-wider uppercase mb-1 flex items-center gap-1.5">
                  <ShieldAlert className="w-3.5 h-3.5" />
                  <span>
                    Workspace: {activeWorkspace.name} · ${activeWorkspace.initialCapital.toLocaleString()} ({activeWorkspace.targetYieldPct}% Target)
                  </span>
                </div>
                <h1 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
                  {activeTab === "fleet" && "Evaluated Fleet Matrix & Risk Screener"}
                  {activeTab === "analytics" && "Interactive Quantitative Graphics & Risk Topography"}
                  {activeTab === "audit" && "Executive Risk Audit & Macro Stress Simulator"}
                  {activeTab === "portfolio" && "Portfolio Stress-Testing & Allocation Engine"}
                  {activeTab === "overlap" && "Portfolio Cross-ETF Overlap & Holding Concentration Matrix"}
                  {activeTab === "diagnostics" && `Forensic Risk Diagnostics: ${activeFund?.ticker}`}
                  {activeTab === "benchmark" && "Underlying Benchmark Divergence Audit"}
                  {activeTab === "simulator" && "Distribution Tax Efficiency & ROC Simulator"}
                </h1>
                <p className="text-xs sm:text-sm text-slate-400 mt-1 max-w-3xl leading-relaxed">
                  Evaluating covered call strategies, synthetic single-stock funds, and BDCs for dividend safety, Return of Capital (ROC) health, and net asset value (NAV) erosion risk.
                </p>
              </div>

              <div className="flex items-center gap-2.5">
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

            {/* Tab: Fleet Overview & Matrix */}
            {activeTab === "fleet" && (
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
                      onSelectReplacement={(ticker) => {
                        const matched = funds.find((f) => f.ticker === ticker);
                        if (matched) setSelectedTicker(matched.ticker);
                      }}
                    />
                  </div>
                )}
              </div>
            )}

            {/* Tab: Interactive Analytics Suite (Graphs) */}
            {activeTab === "analytics" && (
              <InteractiveAnalyticsSuite
                funds={funds}
                activeWorkspace={activeWorkspace}
                selectedTicker={selectedTicker}
                onSelectFund={handleSelectFund}
              />
            )}

            {/* Tab: Executive Audit & Macro Stress Simulator (Subscription Value) */}
            {activeTab === "audit" && (
              <ExecutiveAuditReport
                funds={funds}
                activeWorkspace={activeWorkspace}
                onSelectFund={(ticker) => {
                  setSelectedTicker(ticker);
                  setActiveTab("diagnostics");
                }}
              />
            )}

            {/* Tab: Portfolio Engine & Weighting Screener */}
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
                activeWorkspace={activeWorkspace}
                onSaveToWorkspace={handleSaveWorkspace}
                onOpenSec19aNotice={(ticker) => {
                  setSec19aAuditTicker(ticker);
                  setIsSec19aModalOpen(true);
                }}
              />
            )}

            {/* Tab: Cross-Holding Portfolio Overlap & Concentration Matrix */}
            {activeTab === "overlap" && (
              <OverlapMatrix
                availableFunds={funds}
                activeWorkspace={activeWorkspace}
                onSelectFund={(ticker) => {
                  setSelectedTicker(ticker);
                  setActiveTab("diagnostics");
                }}
              />
            )}

            {/* Tab: Detailed Risk Diagnostics */}
            {activeTab === "diagnostics" && (
              <div className="space-y-6">
                <div className="bg-[#0f172a] border border-slate-800 rounded-lg p-3 flex flex-wrap items-center justify-between gap-3">
                  <span className="text-xs text-slate-400 font-medium">Select Fund for Diagnostic Audit:</span>
                  <div className="flex flex-wrap items-center gap-1.5">
                    {funds.map((f) => (
                      <button
                        key={f.ticker}
                        onClick={() => setSelectedTicker(f.ticker)}
                        className={`px-3 py-1 rounded text-xs font-mono font-medium transition-colors cursor-pointer ${
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
                    onOpenSec19aNotice={(ticker) => {
                      setSec19aAuditTicker(ticker);
                      setIsSec19aModalOpen(true);
                    }}
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

            {/* Tab: Underlying Benchmark Comparison (SPY / QQQ) */}
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

            {/* Tab: Interactive ROC & Tax Efficiency Simulator */}
            {activeTab === "simulator" && <RocSimulator funds={funds} />}
          </div>
        )}
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

      {/* User Login & Registration Modal */}
      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        onSuccess={(user) => {
          setCurrentUser(user);
        }}
      />

      {/* Workspace / Project Manager Modal */}
      <WorkspaceManagerModal
        isOpen={isWorkspaceModalOpen}
        onClose={() => {
          setIsWorkspaceModalOpen(false);
          setEditingWorkspace(null);
        }}
        onSaveWorkspace={handleSaveWorkspace}
        onDeleteWorkspace={handleDeleteWorkspace}
        editingWorkspace={editingWorkspace}
        existingCount={projects.length}
      />

      {/* SEC Rule 19a-1 Forensic Auditor Modal */}
      <Sec19aAuditModal
        isOpen={isSec19aModalOpen}
        onClose={() => setIsSec19aModalOpen(false)}
        initialTicker={sec19aAuditTicker}
        availableFunds={funds}
      />

      {/* Executive Footer */}
      <footer className="mt-auto border-t border-slate-800/80 bg-[#080c15] py-4 text-center text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 flex flex-wrap items-center justify-between gap-2">
          <span>Income ETF &amp; Covered Call Evaluator · Quantitative Diagnostic Engine</span>
          <div className="flex items-center gap-4 text-slate-400">
            <span>Alert Standards: GREEN (&ge; -1.5%) · YELLOW (-1.5% to -3.0%) · RED (&lt; -3.0%)</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
