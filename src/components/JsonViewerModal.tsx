import React, { useState } from "react";
import { FundProfile, FundEvaluationOutput } from "../types/fund";
import { toStrictJsonOutput } from "../data/fundsData";
import { X, Copy, Check, Download, FileCode, CheckCircle2 } from "lucide-react";

interface JsonViewerModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedFund: FundProfile;
  allFunds: FundProfile[];
}

export const JsonViewerModal: React.FC<JsonViewerModalProps> = ({
  isOpen,
  onClose,
  selectedFund,
  allFunds,
}) => {
  const [viewMode, setViewMode] = useState<"single" | "all">("single");
  const [schemaMode, setSchemaMode] = useState<"strict" | "extended">("strict");
  const [copied, setCopied] = useState<boolean>(false);

  if (!isOpen) return null;

  const getFundJson = (fund: FundProfile) => {
    if (schemaMode === "strict") {
      return toStrictJsonOutput(fund);
    }
    return {
      ...toStrictJsonOutput(fund),
      dividend_cagr_3y_pct: fund.dividend_cagr_3y_pct,
      dividend_cagr_5y_pct: fund.dividend_cagr_5y_pct,
      dividend_growth_classification: fund.dividend_growth_classification,
      aum_billions: fund.aum_billions,
      expense_ratio_pct: fund.expense_ratio_pct,
      inception_year: fund.inception_year,
    };
  };

  const singleJson = getFundJson(selectedFund);
  const allJson = allFunds.map(getFundJson);

  const activeJson = viewMode === "single" ? singleJson : allJson;
  const jsonString = JSON.stringify(activeJson, null, 2);

  const handleCopy = () => {
    navigator.clipboard.writeText(jsonString);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    const blob = new Blob([jsonString], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download =
      viewMode === "single"
        ? `${selectedFund.ticker}_evaluation.json`
        : `income_etf_evaluations_fleet.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-[#0f172a] border border-slate-700 w-full max-w-3xl rounded-xl shadow-2xl flex flex-col max-h-[90vh] overflow-hidden">
        {/* Modal Header */}
        <div className="px-5 py-4 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-1.5 bg-sky-950/80 border border-sky-800 rounded text-sky-400">
              <FileCode className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-white">
                Strict Evaluator JSON Output
              </h3>
              <p className="text-[11px] text-slate-400">
                Adheres strictly to the requested analytical schema
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {/* Toggle Schema: Strict vs Extended with CAGR */}
            <div className="flex items-center gap-1 p-0.5 bg-slate-900 rounded border border-slate-800 text-xs">
              <button
                onClick={() => setSchemaMode("strict")}
                className={`px-2 py-1 rounded transition-colors ${
                  schemaMode === "strict"
                    ? "bg-sky-950 text-sky-300 font-semibold border border-sky-800"
                    : "text-slate-400 hover:text-slate-200"
                }`}
                title="Strict 12-field JSON format"
              >
                Strict Schema
              </button>
              <button
                onClick={() => setSchemaMode("extended")}
                className={`px-2 py-1 rounded transition-colors ${
                  schemaMode === "extended"
                    ? "bg-emerald-950 text-emerald-300 font-semibold border border-emerald-800"
                    : "text-slate-400 hover:text-slate-200"
                }`}
                title="Extended Profile including 3Y/5Y Dividend CAGR"
              >
                + Dividend CAGR
              </button>
            </div>

            {/* Toggle Single vs Fleet */}
            <div className="flex items-center gap-1 p-0.5 bg-slate-900 rounded border border-slate-800 text-xs">
              <button
                onClick={() => setViewMode("single")}
                className={`px-2.5 py-1 rounded transition-colors ${
                  viewMode === "single"
                    ? "bg-slate-800 text-white font-medium"
                    : "text-slate-400 hover:text-slate-200"
                }`}
              >
                {selectedFund.ticker}
              </button>
              <button
                onClick={() => setViewMode("all")}
                className={`px-2.5 py-1 rounded transition-colors ${
                  viewMode === "all"
                    ? "bg-slate-800 text-white font-medium"
                    : "text-slate-400 hover:text-slate-200"
                }`}
              >
                Fleet ({allFunds.length})
              </button>
            </div>

            <button
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* JSON Preview Content Area */}
        <div className="p-4 flex-1 overflow-auto bg-[#070b14] font-mono text-xs">
          <pre className="text-emerald-400/95 leading-relaxed selection:bg-sky-900">
            <code>{jsonString}</code>
          </pre>
        </div>

        {/* Modal Footer Controls */}
        <div className="px-5 py-3.5 border-t border-slate-800 bg-[#0d1424] flex items-center justify-between">
          <div className="flex items-center gap-2 text-[11px] text-slate-400">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
            <span>Strict format: ticker, fund_name, category, yields, NAV windows, alert_status</span>
          </div>

          <div className="flex items-center gap-2.5">
            <button
              onClick={handleDownload}
              className="px-3 py-1.5 text-xs text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded transition-colors flex items-center gap-1.5"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Download .json</span>
            </button>
            <button
              onClick={handleCopy}
              className="px-3.5 py-1.5 text-xs font-semibold text-slate-900 bg-sky-400 hover:bg-sky-300 rounded transition-colors flex items-center gap-1.5 shadow-sm"
            >
              {copied ? (
                <>
                  <Check className="w-3.5 h-3.5" />
                  <span>Copied to Clipboard</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5" />
                  <span>Copy JSON</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
