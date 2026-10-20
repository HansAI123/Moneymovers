import React, { useState, useEffect } from "react";
import { FundProfile, Sec19aNotice } from "../types/fund";
import { VERIFIED_SEC_19A_NOTICES } from "../data/overlapData";
import {
  ShieldAlert,
  ShieldCheck,
  AlertTriangle,
  X,
  FileText,
  Search,
  ExternalLink,
  Info,
  CheckCircle2,
  RefreshCw,
  Scale,
  DollarSign,
  AlertOctagon,
} from "lucide-react";

interface Sec19aAuditModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialTicker: string;
  availableFunds: FundProfile[];
}

export const Sec19aAuditModal: React.FC<Sec19aAuditModalProps> = ({
  isOpen,
  onClose,
  initialTicker,
  availableFunds,
}) => {
  const [selectedTicker, setSelectedTicker] = useState<string>(initialTicker);
  const [notice, setNotice] = useState<Sec19aNotice | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [searchQuery, setSearchQuery] = useState<string>("");

  useEffect(() => {
    setSelectedTicker(initialTicker);
  }, [initialTicker]);

  useEffect(() => {
    if (!isOpen) return;

    const fetchNotice = async () => {
      setIsLoading(true);
      const symbol = selectedTicker.toUpperCase();

      // Check client-side verified database first
      if (VERIFIED_SEC_19A_NOTICES[symbol]) {
        setNotice(VERIFIED_SEC_19A_NOTICES[symbol]);
        setIsLoading(false);
        return;
      }

      // Query server endpoint
      try {
        const res = await fetch(`/api/sec-19a-notice/${encodeURIComponent(symbol)}`);
        if (res.ok) {
          const data = await res.json();
          setNotice(data);
        } else {
          setNotice(null);
        }
      } catch (err) {
        console.warn("Failed to load SEC 19a notice:", err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchNotice();
  }, [isOpen, selectedTicker]);

  if (!isOpen) return null;

  const currentFund = availableFunds.find((f) => f.ticker === selectedTicker);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-3xl bg-[#0b101e] border border-slate-700/80 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-800 bg-[#0d1424] flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-sky-500/10 border border-sky-500/30 text-sky-400">
              <Scale className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-bold text-white tracking-tight">
                  SEC Rule 19a-1 Forensic Auditor
                </h2>
                <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-sky-950 text-sky-300 border border-sky-700">
                  Statutory Breakdown
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                Section 19(a) of the Investment Company Act of 1940: Legally declared sources of distribution
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800/80 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Quick Ticker Switcher */}
        <div className="px-6 py-2.5 bg-slate-900/80 border-b border-slate-800 flex items-center gap-2 overflow-x-auto">
          <span className="text-[11px] text-slate-400 font-medium shrink-0">Quick Audit:</span>
          {["JEPI", "JEPQ", "SPYI", "XYLD", "NVDY", "TSLY", "SCHD", "O", "MAIN"].map((t) => (
            <button
              key={t}
              onClick={() => setSelectedTicker(t)}
              className={`px-2.5 py-1 text-xs font-mono font-bold rounded-md transition-colors cursor-pointer shrink-0 ${
                selectedTicker === t
                  ? "bg-sky-500 text-slate-950 shadow-sm"
                  : "bg-slate-800/80 hover:bg-slate-700 text-slate-300 border border-slate-700/60"
              }`}
            >
              {t}
            </button>
          ))}
        </div>

        {/* Content Body */}
        <div className="p-6 overflow-y-auto space-y-5 text-xs text-slate-300">
          {isLoading ? (
            <div className="py-16 text-center space-y-3">
              <RefreshCw className="w-8 h-8 text-sky-400 animate-spin mx-auto" />
              <p className="text-sm font-medium text-slate-300">
                Retrieving verified SEC Form 19a-1 notice for {selectedTicker}...
              </p>
            </div>
          ) : notice ? (
            <>
              {/* Notice Overview Card */}
              <div className="bg-[#0f172a] border border-slate-800 rounded-xl p-4">
                <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-slate-800">
                  <div>
                    <span className="text-xl font-bold font-mono text-white mr-2">
                      {notice.ticker}
                    </span>
                    <span className="text-slate-400 text-xs font-sans">
                      {notice.fund_name}
                    </span>
                  </div>
                  <div className="text-right">
                    <span className="text-xs text-slate-400 block font-medium">Recent Payout per Share</span>
                    <span className="text-base font-bold font-mono text-emerald-400">
                      ${notice.distribution_per_share.toFixed(4)}
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-3">
                  <div>
                    <span className="text-[11px] text-slate-400 block">SEC Form Citation</span>
                    <span className="font-mono text-slate-200 text-xs truncate block font-medium">
                      {notice.sec_form_reference}
                    </span>
                  </div>
                  <div>
                    <span className="text-[11px] text-slate-400 block">Notice Schedule</span>
                    <span className="text-slate-200 text-xs font-medium">{notice.filing_date}</span>
                  </div>
                  <div>
                    <span className="text-[11px] text-slate-400 block">Current ROC Share</span>
                    <span
                      className={`font-mono text-xs font-bold ${
                        notice.is_destructive_roc ? "text-rose-400" : "text-sky-400"
                      }`}
                    >
                      {notice.return_of_capital_pct.toFixed(1)}%
                    </span>
                  </div>
                  <div>
                    <span className="text-[11px] text-slate-400 block">Cumulative YTD ROC</span>
                    <span
                      className={`font-mono text-xs font-bold ${
                        notice.is_destructive_roc ? "text-rose-400" : "text-amber-300"
                      }`}
                    >
                      {notice.cumulative_roc_ytd_pct.toFixed(1)}%
                    </span>
                  </div>
                </div>
              </div>

              {/* Forensic Breakdown Bar Graph */}
              <div className="bg-[#0f172a] border border-slate-800 rounded-xl p-4">
                <h3 className="text-xs font-semibold text-white uppercase tracking-wider mb-2">
                  Distribution Source Decomposition
                </h3>
                <p className="text-[11px] text-slate-400 mb-3">
                  Exact percentage of the dividend payout derived from Net Investment Income vs Capital Gains vs Return of Principal.
                </p>

                {/* Stacked Horizontal Bar */}
                <div className="h-7 w-full rounded-lg overflow-hidden flex border border-slate-700 bg-slate-900 shadow-inner">
                  {notice.net_investment_income_pct > 0 && (
                    <div
                      style={{ width: `${notice.net_investment_income_pct}%` }}
                      className="bg-emerald-500 h-full flex items-center justify-center text-[10px] font-bold text-slate-950 truncate px-1 transition-all"
                      title={`Net Investment Income: ${notice.net_investment_income_pct}%`}
                    >
                      NII {notice.net_investment_income_pct.toFixed(0)}%
                    </div>
                  )}
                  {notice.short_term_capital_gains_pct > 0 && (
                    <div
                      style={{ width: `${notice.short_term_capital_gains_pct}%` }}
                      className="bg-indigo-500 h-full flex items-center justify-center text-[10px] font-bold text-white truncate px-1 transition-all"
                      title={`Short-Term Gains: ${notice.short_term_capital_gains_pct}%`}
                    >
                      ST {notice.short_term_capital_gains_pct.toFixed(0)}%
                    </div>
                  )}
                  {notice.long_term_capital_gains_pct > 0 && (
                    <div
                      style={{ width: `${notice.long_term_capital_gains_pct}%` }}
                      className="bg-sky-500 h-full flex items-center justify-center text-[10px] font-bold text-slate-950 truncate px-1 transition-all"
                      title={`Long-Term Gains: ${notice.long_term_capital_gains_pct}%`}
                    >
                      LT {notice.long_term_capital_gains_pct.toFixed(0)}%
                    </div>
                  )}
                  {notice.return_of_capital_pct > 0 && (
                    <div
                      style={{ width: `${notice.return_of_capital_pct}%` }}
                      className={`${
                        notice.is_destructive_roc ? "bg-rose-500" : "bg-amber-500"
                      } h-full flex items-center justify-center text-[10px] font-bold text-slate-950 truncate px-1 transition-all`}
                      title={`Return of Capital: ${notice.return_of_capital_pct}%`}
                    >
                      ROC {notice.return_of_capital_pct.toFixed(0)}%
                    </div>
                  )}
                </div>

                {/* Legend & Stat Boxes */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-4">
                  <div className="p-2.5 rounded-lg bg-emerald-950/40 border border-emerald-800/60">
                    <div className="flex items-center gap-1.5 text-emerald-400 font-semibold mb-0.5">
                      <span className="w-2 h-2 rounded-full bg-emerald-400" />
                      <span>Net Investment Income</span>
                    </div>
                    <span className="text-base font-bold font-mono text-emerald-300">
                      {notice.net_investment_income_pct.toFixed(1)}%
                    </span>
                    <span className="text-[10px] text-slate-400 block mt-0.5">Operating earnings</span>
                  </div>

                  <div className="p-2.5 rounded-lg bg-indigo-950/40 border border-indigo-800/60">
                    <div className="flex items-center gap-1.5 text-indigo-300 font-semibold mb-0.5">
                      <span className="w-2 h-2 rounded-full bg-indigo-400" />
                      <span>Short-Term Gains</span>
                    </div>
                    <span className="text-base font-bold font-mono text-indigo-200">
                      {notice.short_term_capital_gains_pct.toFixed(1)}%
                    </span>
                    <span className="text-[10px] text-slate-400 block mt-0.5">Ordinary tax rate</span>
                  </div>

                  <div className="p-2.5 rounded-lg bg-sky-950/40 border border-sky-800/60">
                    <div className="flex items-center gap-1.5 text-sky-400 font-semibold mb-0.5">
                      <span className="w-2 h-2 rounded-full bg-sky-400" />
                      <span>Long-Term Gains</span>
                    </div>
                    <span className="text-base font-bold font-mono text-sky-300">
                      {notice.long_term_capital_gains_pct.toFixed(1)}%
                    </span>
                    <span className="text-[10px] text-slate-400 block mt-0.5">Preferential 15-20%</span>
                  </div>

                  <div
                    className={`p-2.5 rounded-lg ${
                      notice.is_destructive_roc
                        ? "bg-rose-950/40 border border-rose-800/60"
                        : "bg-amber-950/40 border border-amber-800/60"
                    }`}
                  >
                    <div
                      className={`flex items-center gap-1.5 font-semibold mb-0.5 ${
                        notice.is_destructive_roc ? "text-rose-400" : "text-amber-400"
                      }`}
                    >
                      <span
                        className={`w-2 h-2 rounded-full ${
                          notice.is_destructive_roc ? "bg-rose-400" : "bg-amber-400"
                        }`}
                      />
                      <span>Return of Capital</span>
                    </div>
                    <span
                      className={`text-base font-bold font-mono ${
                        notice.is_destructive_roc ? "text-rose-300" : "text-amber-300"
                      }`}
                    >
                      {notice.return_of_capital_pct.toFixed(1)}%
                    </span>
                    <span className="text-[10px] text-slate-400 block mt-0.5">
                      {notice.is_destructive_roc ? "Liquidating principal" : "Cost basis reduction"}
                    </span>
                  </div>
                </div>
              </div>

              {/* Forensic Audit Verdict Banner */}
              <div
                className={`p-4 rounded-xl border flex items-start gap-3 ${
                  notice.is_destructive_roc
                    ? "bg-rose-950/40 border-rose-700/80 text-rose-200"
                    : "bg-emerald-950/40 border-emerald-700/80 text-emerald-200"
                }`}
              >
                {notice.is_destructive_roc ? (
                  <AlertOctagon className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />
                ) : (
                  <ShieldCheck className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
                )}
                <div>
                  <h4 className="text-xs font-bold uppercase tracking-wider mb-1 flex items-center gap-2">
                    <span>Forensic Audit Verdict</span>
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-mono ${
                        notice.is_destructive_roc
                          ? "bg-rose-900/90 text-rose-200 border border-rose-700"
                          : "bg-emerald-900/90 text-emerald-200 border border-emerald-700"
                      }`}
                    >
                      {notice.is_destructive_roc ? "FLAGGED: DESTRUCTIVE ROC" : "PASSED: CONSTRUCTIVE ROC"}
                    </span>
                  </h4>
                  <p className="text-xs leading-relaxed text-slate-200">{notice.forensic_verdict}</p>
                </div>
              </div>

              {/* Statutory Legal Disclaimer */}
              <div className="p-3 bg-slate-900/90 border border-slate-800 rounded-lg text-[11px] text-slate-400 leading-relaxed flex items-start gap-2">
                <Info className="w-4 h-4 text-slate-500 shrink-0 mt-0.5" />
                <span>{notice.legal_disclaimer}</span>
              </div>
            </>
          ) : (
            <div className="py-12 text-center text-slate-400">
              No official Rule 19a-1 filing found for {selectedTicker}.
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-3 border-t border-slate-800 bg-[#0d1424] flex items-center justify-between">
          <span className="text-[11px] text-slate-400">
            SEC Form 19a-1 Statutory Compliance Engine
          </span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium rounded-lg transition-colors cursor-pointer"
          >
            Close Audit
          </button>
        </div>
      </div>
    </div>
  );
};
