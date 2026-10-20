import React, { useState } from "react";
import {
  FileCode2,
  Search,
  Compass,
  Briefcase,
  ChevronDown,
  Plus,
  User as UserIcon,
  LogOut,
  Cloud,
  CloudOff,
  Menu,
  X,
  TrendingUp,
  Sliders,
  ShieldCheck,
  Layers,
  Scale,
} from "lucide-react";
import { ProjectWorkspace } from "../types/fund";

export type NavTab =
  | "overview"
  | "fleet"
  | "analytics"
  | "audit"
  | "portfolio"
  | "overlap"
  | "diagnostics"
  | "benchmark"
  | "simulator";

interface NavbarProps {
  activeTab: NavTab;
  onTabChange: (tab: NavTab) => void;
  onOpenJsonModal: () => void;
  onOpenSearchModal: () => void;
  onOpenSec19aModal?: () => void;
  onOpenWelcomeGuide?: () => void;
  // Auth & Project Workspaces props
  currentUser: any | null;
  onOpenAuthModal: () => void;
  onLogout: () => void;
  projects: ProjectWorkspace[];
  activeWorkspace: ProjectWorkspace;
  onSelectWorkspace: (workspaceId: string) => void;
  onOpenNewWorkspaceModal: () => void;
  onOpenEditWorkspaceModal: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  onTabChange,
  onOpenJsonModal,
  onOpenSearchModal,
  onOpenSec19aModal,
  onOpenWelcomeGuide,
  currentUser,
  onOpenAuthModal,
  onLogout,
  projects,
  activeWorkspace,
  onSelectWorkspace,
  onOpenNewWorkspaceModal,
  onOpenEditWorkspaceModal,
}) => {
  const [isWorkspaceMenuOpen, setIsWorkspaceMenuOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const isGuest = currentUser?.isAnonymous;
  const isLoggedIn = !!currentUser && !isGuest;

  return (
    <header className="sticky top-0 z-30 w-full bg-[#080c15]/95 backdrop-blur-md border-b border-slate-800/80">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between gap-4 h-16">
          {/* Zone 1: Wordmark & Active Workspace Switcher */}
          <div className="flex items-center gap-3 shrink-0">
            <div className="w-8 h-8 rounded bg-gradient-to-br from-emerald-500 to-sky-600 flex items-center justify-center text-slate-950 font-bold text-sm shadow-sm">
              IE
            </div>
            <button
              onClick={() => onTabChange("overview")}
              className="hidden sm:block text-base font-bold tracking-tight text-white whitespace-nowrap hover:text-sky-300 transition-colors cursor-pointer text-left"
            >
              Apex Wealth · Income Evaluator
            </button>

            {/* Project Workspace Dropdown Selector */}
            <div className="relative">
              <button
                onClick={() => {
                  setIsWorkspaceMenuOpen(!isWorkspaceMenuOpen);
                  setIsUserMenuOpen(false);
                }}
                className="flex items-center gap-1.5 px-2.5 py-1.5 bg-slate-900 hover:bg-slate-800 border border-slate-700/80 rounded-lg text-xs font-medium text-slate-200 transition-colors cursor-pointer max-w-[180px] sm:max-w-[220px]"
                title="Switch or manage investment project workspaces"
              >
                <Briefcase className="w-3.5 h-3.5 text-sky-400 shrink-0" />
                <span className="truncate">{activeWorkspace.name}</span>
                <ChevronDown className="w-3 h-3 text-slate-400 shrink-0" />
              </button>

              {isWorkspaceMenuOpen && (
                <div className="absolute left-0 mt-2 w-64 bg-[#0f172a] border border-slate-700 rounded-xl shadow-2xl py-2 z-50 text-xs">
                  <div className="px-3 py-1.5 text-[11px] font-semibold text-slate-400 uppercase tracking-wider border-b border-slate-800 flex items-center justify-between">
                    <span>Project Workspaces ({projects.length})</span>
                    <button
                      onClick={() => {
                        setIsWorkspaceMenuOpen(false);
                        onOpenEditWorkspaceModal();
                      }}
                      className="text-sky-400 hover:underline cursor-pointer"
                    >
                      Edit Active
                    </button>
                  </div>

                  <div className="max-h-48 overflow-y-auto py-1">
                    {projects.map((proj) => (
                      <button
                        key={proj.id}
                        onClick={() => {
                          onSelectWorkspace(proj.id);
                          setIsWorkspaceMenuOpen(false);
                        }}
                        className={`w-full text-left px-3 py-2 flex items-center justify-between hover:bg-slate-800/80 transition-colors cursor-pointer ${
                          proj.id === activeWorkspace.id
                            ? "bg-sky-500/10 text-sky-400 font-semibold"
                            : "text-slate-300"
                        }`}
                      >
                        <div className="truncate">
                          <div>{proj.name}</div>
                          <div className="text-[10px] text-slate-400 font-mono">
                            ${proj.initialCapital.toLocaleString()} · {proj.targetYieldPct}% Target
                          </div>
                        </div>
                        {proj.id === activeWorkspace.id && (
                          <span className="w-1.5 h-1.5 rounded-full bg-sky-400 shrink-0 ml-2" />
                        )}
                      </button>
                    ))}
                  </div>

                  <div className="border-t border-slate-800 pt-1 mt-1 px-2">
                    <button
                      onClick={() => {
                        setIsWorkspaceMenuOpen(false);
                        onOpenNewWorkspaceModal();
                      }}
                      className="w-full py-1.5 px-2.5 text-left rounded-lg bg-sky-500/10 hover:bg-sky-500/20 text-sky-400 font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>New Project Workspace</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Zone 2: Navigation Links */}
          <nav className="hidden lg:flex items-center gap-4 xl:gap-5 text-sm font-medium">
            <button
              onClick={() => onTabChange("overview")}
              className={`whitespace-nowrap shrink-0 transition-colors py-1 cursor-pointer ${
                activeTab === "overview"
                  ? "text-sky-400 border-b-2 border-sky-400 font-semibold"
                  : "text-slate-400 hover:text-slate-200"
              }`}
            >
              Overview
            </button>
            <button
              onClick={() => onTabChange("fleet")}
              className={`whitespace-nowrap shrink-0 transition-colors py-1 cursor-pointer ${
                activeTab === "fleet"
                  ? "text-sky-400 border-b-2 border-sky-400 font-semibold"
                  : "text-slate-400 hover:text-slate-200"
              }`}
            >
              Fleet Matrix
            </button>
            <button
              onClick={() => onTabChange("analytics")}
              className={`whitespace-nowrap shrink-0 transition-colors py-1 cursor-pointer flex items-center gap-1.5 ${
                activeTab === "analytics"
                  ? "text-sky-400 border-b-2 border-sky-400 font-semibold"
                  : "text-slate-400 hover:text-slate-200"
              }`}
            >
              <TrendingUp className="w-3.5 h-3.5" />
              <span>Analytics &amp; Graphs</span>
            </button>
            <button
              onClick={() => onTabChange("audit")}
              className={`whitespace-nowrap shrink-0 transition-colors py-1 cursor-pointer flex items-center gap-1.5 ${
                activeTab === "audit"
                  ? "text-sky-400 border-b-2 border-sky-400 font-semibold"
                  : "text-slate-400 hover:text-slate-200"
              }`}
            >
              <Sliders className="w-3.5 h-3.5" />
              <span>Executive Audit</span>
            </button>
            <button
              onClick={() => onTabChange("portfolio")}
              className={`whitespace-nowrap shrink-0 transition-colors py-1 cursor-pointer ${
                activeTab === "portfolio"
                  ? "text-sky-400 border-b-2 border-sky-400 font-semibold"
                  : "text-slate-400 hover:text-slate-200"
              }`}
            >
              Portfolio &amp; MVO
            </button>
            <button
              onClick={() => onTabChange("overlap")}
              className={`whitespace-nowrap shrink-0 transition-colors py-1 cursor-pointer flex items-center gap-1.5 ${
                activeTab === "overlap"
                  ? "text-sky-400 border-b-2 border-sky-400 font-semibold"
                  : "text-slate-400 hover:text-slate-200"
              }`}
            >
              <Layers className="w-3.5 h-3.5" />
              <span>Overlap Matrix</span>
            </button>
            <button
              onClick={() => onTabChange("diagnostics")}
              className={`whitespace-nowrap shrink-0 transition-colors py-1 cursor-pointer ${
                activeTab === "diagnostics"
                  ? "text-sky-400 border-b-2 border-sky-400 font-semibold"
                  : "text-slate-400 hover:text-slate-200"
              }`}
            >
              Diagnostics
            </button>
            <button
              onClick={() => onTabChange("benchmark")}
              className={`whitespace-nowrap shrink-0 transition-colors py-1 cursor-pointer ${
                activeTab === "benchmark"
                  ? "text-sky-400 border-b-2 border-sky-400 font-semibold"
                  : "text-slate-400 hover:text-slate-200"
              }`}
            >
              Benchmark
            </button>
            <button
              onClick={() => onTabChange("simulator")}
              className={`whitespace-nowrap shrink-0 transition-colors py-1 cursor-pointer ${
                activeTab === "simulator"
                  ? "text-sky-400 border-b-2 border-sky-400 font-semibold"
                  : "text-slate-400 hover:text-slate-200"
              }`}
            >
              Tax &amp; ROC
            </button>
          </nav>

          {/* Zone 3: Actions & Auth Profile */}
          <div className="flex items-center gap-2 shrink-0">
            {onOpenSec19aModal && (
              <button
                onClick={onOpenSec19aModal}
                className="px-2.5 py-1.5 text-xs bg-sky-950/80 hover:bg-sky-900/90 text-sky-300 border border-sky-700/80 rounded transition-colors flex items-center gap-1.5 cursor-pointer font-medium shadow-xs"
                title="Audit legal SEC Rule 19a-1 notices for Return of Principal vs Net Investment Income"
              >
                <Scale className="w-3.5 h-3.5 text-sky-400" />
                <span className="hidden md:inline">SEC 19a-1</span>
              </button>
            )}

            <button
              onClick={onOpenSearchModal}
              className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded transition-colors text-xs flex items-center gap-1.5 cursor-pointer"
              title="Evaluate any ticker"
            >
              <Search className="w-4 h-4" />
              <span className="hidden xl:inline font-medium">Evaluate</span>
            </button>

            <button
              onClick={onOpenJsonModal}
              className="hidden sm:flex px-3 py-1.5 text-xs font-semibold text-slate-900 bg-sky-400 hover:bg-sky-300 rounded transition-colors whitespace-nowrap shrink-0 items-center gap-1.5 shadow-sm cursor-pointer"
            >
              <FileCode2 className="w-3.5 h-3.5" />
              <span>JSON</span>
            </button>

            {/* User Auth Profile Button */}
            <div className="relative">
              {isLoggedIn ? (
                <div>
                  <button
                    onClick={() => {
                      setIsUserMenuOpen(!isUserMenuOpen);
                      setIsWorkspaceMenuOpen(false);
                    }}
                    className="flex items-center gap-2 p-1.5 bg-slate-900 hover:bg-slate-800 border border-slate-700 rounded-lg text-xs transition-colors cursor-pointer"
                    title={currentUser.email || "Account Profile"}
                  >
                    <div className="w-6 h-6 rounded bg-sky-500/20 text-sky-400 flex items-center justify-center font-bold text-xs uppercase">
                      {currentUser.email ? currentUser.email.charAt(0) : "U"}
                    </div>
                    <Cloud className="w-3.5 h-3.5 text-emerald-400" />
                    <ChevronDown className="w-3 h-3 text-slate-400" />
                  </button>

                  {isUserMenuOpen && (
                    <div className="absolute right-0 mt-2 w-56 bg-[#0f172a] border border-slate-700 rounded-xl shadow-2xl py-2 z-50 text-xs">
                      <div className="px-3 py-2 border-b border-slate-800">
                        <div className="font-semibold text-white truncate">
                          {currentUser.displayName || "Subscriber"}
                        </div>
                        <div className="text-[11px] text-slate-400 truncate">
                          {currentUser.email}
                        </div>
                        <div className="flex items-center gap-1 text-[10px] text-emerald-400 mt-1 font-medium">
                          <Cloud className="w-3 h-3" />
                          <span>Cloud Synchronization Active</span>
                        </div>
                      </div>

                      <div className="py-1">
                        <button
                          onClick={() => {
                            setIsUserMenuOpen(false);
                            onOpenNewWorkspaceModal();
                          }}
                          className="w-full text-left px-3 py-2 text-slate-300 hover:bg-slate-800 hover:text-white flex items-center gap-2 cursor-pointer"
                        >
                          <Plus className="w-3.5 h-3.5 text-sky-400" />
                          <span>Create Project Workspace</span>
                        </button>
                      </div>

                      <div className="border-t border-slate-800 pt-1 px-1">
                        <button
                          onClick={() => {
                            setIsUserMenuOpen(false);
                            onLogout();
                          }}
                          className="w-full text-left px-3 py-2 text-rose-400 hover:bg-rose-500/10 rounded-lg flex items-center gap-2 cursor-pointer"
                        >
                          <LogOut className="w-3.5 h-3.5" />
                          <span>Sign Out</span>
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <button
                  onClick={onOpenAuthModal}
                  className="px-3 py-1.5 text-xs font-semibold text-slate-200 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-lg transition-colors flex items-center gap-1.5 cursor-pointer shadow-sm"
                  title="Sign in to save and sync portfolios"
                >
                  <UserIcon className="w-3.5 h-3.5 text-sky-400" />
                  <span>Sign In</span>
                </button>
              )}
            </div>

            {/* Mobile Navigation Toggle */}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="lg:hidden p-2 text-slate-400 hover:text-white rounded"
            >
              {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Mobile Dropdown Menu */}
        {isMobileMenuOpen && (
          <div className="lg:hidden py-3 border-t border-slate-800 grid grid-cols-2 gap-2 text-xs">
            <button
              onClick={() => {
                onTabChange("overview");
                setIsMobileMenuOpen(false);
              }}
              className={`p-2 rounded text-left ${activeTab === "overview" ? "bg-sky-500/20 text-sky-400 font-bold" : "text-slate-300"}`}
            >
              Overview
            </button>
            <button
              onClick={() => {
                onTabChange("fleet");
                setIsMobileMenuOpen(false);
              }}
              className={`p-2 rounded text-left ${activeTab === "fleet" ? "bg-sky-500/20 text-sky-400 font-bold" : "text-slate-300"}`}
            >
              Fleet Matrix
            </button>
            <button
              onClick={() => {
                onTabChange("analytics");
                setIsMobileMenuOpen(false);
              }}
              className={`p-2 rounded text-left ${activeTab === "analytics" ? "bg-sky-500/20 text-sky-400 font-bold" : "text-slate-300"}`}
            >
              Analytics &amp; Graphs
            </button>
            <button
              onClick={() => {
                onTabChange("audit");
                setIsMobileMenuOpen(false);
              }}
              className={`p-2 rounded text-left ${activeTab === "audit" ? "bg-sky-500/20 text-sky-400 font-bold" : "text-slate-300"}`}
            >
              Executive Audit
            </button>
            <button
              onClick={() => {
                onTabChange("portfolio");
                setIsMobileMenuOpen(false);
              }}
              className={`p-2 rounded text-left ${activeTab === "portfolio" ? "bg-sky-500/20 text-sky-400 font-bold" : "text-slate-300"}`}
            >
              Portfolio &amp; MVO
            </button>
            <button
              onClick={() => {
                onTabChange("overlap");
                setIsMobileMenuOpen(false);
              }}
              className={`p-2 rounded text-left ${activeTab === "overlap" ? "bg-sky-500/20 text-sky-400 font-bold" : "text-slate-300"}`}
            >
              Overlap Matrix
            </button>
            <button
              onClick={() => {
                onTabChange("diagnostics");
                setIsMobileMenuOpen(false);
              }}
              className={`p-2 rounded text-left ${activeTab === "diagnostics" ? "bg-sky-500/20 text-sky-400 font-bold" : "text-slate-300"}`}
            >
              Diagnostics
            </button>
            <button
              onClick={() => {
                onTabChange("benchmark");
                setIsMobileMenuOpen(false);
              }}
              className={`p-2 rounded text-left ${activeTab === "benchmark" ? "bg-sky-500/20 text-sky-400 font-bold" : "text-slate-300"}`}
            >
              Benchmark
            </button>
            <button
              onClick={() => {
                onTabChange("simulator");
                setIsMobileMenuOpen(false);
              }}
              className={`p-2 rounded text-left ${activeTab === "simulator" ? "bg-sky-500/20 text-sky-400 font-bold" : "text-slate-300"}`}
            >
              Tax &amp; ROC
            </button>
          </div>
        )}
      </div>
    </header>
  );
};
