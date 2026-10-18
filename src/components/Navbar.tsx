import React from "react";
import { ShieldAlert, FileCode2, Search } from "lucide-react";

interface NavbarProps {
  activeTab: "fleet" | "diagnostics" | "benchmark" | "portfolio" | "simulator";
  onTabChange: (tab: "fleet" | "diagnostics" | "benchmark" | "portfolio" | "simulator") => void;
  onOpenJsonModal: () => void;
  onOpenSearchModal: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  onTabChange,
  onOpenJsonModal,
  onOpenSearchModal,
}) => {
  return (
    <header className="sticky top-0 z-30 w-full bg-[#080c15]/95 backdrop-blur-md border-b border-slate-800/80">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between gap-8 h-16">
          {/* Zone 1: Single text element wordmark */}
          <div className="flex items-center gap-3 shrink-0">
            <div className="w-8 h-8 rounded bg-gradient-to-br from-emerald-500 to-sky-600 flex items-center justify-center text-slate-950 font-bold text-sm">
              IE
            </div>
            <a
              href="#"
              className="text-base font-bold tracking-tight text-white whitespace-nowrap shrink-0 hover:text-sky-300 transition-colors"
            >
              Apex Wealth · Income Evaluator
            </a>
          </div>

          {/* Zone 2: 5 clean single-line text navigation links */}
          <nav className="hidden md:flex items-center gap-6 lg:gap-8 text-sm font-medium">
            <button
              onClick={() => onTabChange("fleet")}
              className={`whitespace-nowrap shrink-0 transition-colors py-1 ${
                activeTab === "fleet"
                  ? "text-sky-400 border-b-2 border-sky-400 font-semibold"
                  : "text-slate-400 hover:text-slate-200"
              }`}
            >
              Fleet Overview
            </button>
            <button
              onClick={() => onTabChange("portfolio")}
              className={`whitespace-nowrap shrink-0 transition-colors py-1 ${
                activeTab === "portfolio"
                  ? "text-sky-400 border-b-2 border-sky-400 font-semibold"
                  : "text-slate-400 hover:text-slate-200"
              }`}
            >
              Portfolio Engine
            </button>
            <button
              onClick={() => onTabChange("diagnostics")}
              className={`whitespace-nowrap shrink-0 transition-colors py-1 ${
                activeTab === "diagnostics"
                  ? "text-sky-400 border-b-2 border-sky-400 font-semibold"
                  : "text-slate-400 hover:text-slate-200"
              }`}
            >
              Risk Diagnostics
            </button>
            <button
              onClick={() => onTabChange("benchmark")}
              className={`whitespace-nowrap shrink-0 transition-colors py-1 ${
                activeTab === "benchmark"
                  ? "text-sky-400 border-b-2 border-sky-400 font-semibold"
                  : "text-slate-400 hover:text-slate-200"
              }`}
            >
              Benchmark Audit
            </button>
            <button
              onClick={() => onTabChange("simulator")}
              className={`whitespace-nowrap shrink-0 transition-colors py-1 ${
                activeTab === "simulator"
                  ? "text-sky-400 border-b-2 border-sky-400 font-semibold"
                  : "text-slate-400 hover:text-slate-200"
              }`}
            >
              Tax &amp; ROC Simulator
            </button>
          </nav>

          {/* Zone 3: 1 primary action with secondary search button */}
          <div className="flex items-center gap-3 shrink-0">
            <button
              onClick={onOpenSearchModal}
              className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded transition-colors text-xs flex items-center gap-1.5"
              title="Evaluate any ticker"
            >
              <Search className="w-4 h-4" />
              <span className="hidden sm:inline font-medium">Evaluate Ticker</span>
            </button>
            <button
              onClick={onOpenJsonModal}
              className="px-3.5 py-1.5 text-xs font-semibold text-slate-900 bg-sky-400 hover:bg-sky-300 rounded transition-colors whitespace-nowrap shrink-0 flex items-center gap-1.5 shadow-sm"
            >
              <FileCode2 className="w-3.5 h-3.5" />
              <span>Export Strict JSON</span>
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};
