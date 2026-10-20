import React, { useState } from "react";
import { FundProfile, FundCategory, AlertStatus } from "../types/fund";
import { ArrowUpDown, AlertCircle, CheckCircle2, ChevronRight, FileJson, TrendingUp, TrendingDown, ShieldCheck } from "lucide-react";

export type TableFilter = "ALL" | AlertStatus | FundCategory | "GROWING" | "DECLINING" | "NO_SINGLE_STOCK";

interface FundMatrixTableProps {
  funds: FundProfile[];
  selectedTicker: string;
  onSelectFund: (ticker: string) => void;
  onViewJson: (fund: FundProfile) => void;
  currentFilter: TableFilter;
  onFilterChange: (filter: TableFilter) => void;
}

type SortField =
  | "ticker"
  | "distribution_yield_pct"
  | "nav_change_3m_pct"
  | "nav_change_6m_pct"
  | "nav_change_12m_pct"
  | "total_return_12m_pct"
  | "dividend_cagr_3y_pct"
  | "alert_status";

export const FundMatrixTable: React.FC<FundMatrixTableProps> = ({
  funds,
  selectedTicker,
  onSelectFund,
  onViewJson,
  currentFilter,
  onFilterChange,
}) => {
  const [sortField, setSortField] = useState<SortField>("alert_status");
  const [sortAsc, setSortAsc] = useState<boolean>(true);

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortAsc(!sortAsc);
    } else {
      setSortField(field);
      setSortAsc(false); // default descending for financial figures
    }
  };

  // Filter logic
  const filteredFunds = funds.filter((fund) => {
    if (currentFilter === "ALL") return true;
    if (currentFilter === "NO_SINGLE_STOCK") {
      return fund.category !== "Single Stock Covered Call";
    }
    if (currentFilter === "GROWING") {
      return fund.dividend_growth_classification === "Growing";
    }
    if (currentFilter === "DECLINING") {
      return fund.dividend_growth_classification === "Declining";
    }
    if (currentFilter === "GREEN" || currentFilter === "YELLOW" || currentFilter === "RED") {
      return fund.alert_status === currentFilter;
    }
    return fund.category === currentFilter;
  });

  // Sort logic
  const sortedFunds = [...filteredFunds].sort((a, b) => {
    let comparison = 0;
    if (sortField === "alert_status") {
      const order = { RED: 0, YELLOW: 1, GREEN: 2 };
      comparison = order[a.alert_status] - order[b.alert_status];
    } else if (sortField === "ticker") {
      comparison = a.ticker.localeCompare(b.ticker);
    } else if (sortField === "dividend_cagr_3y_pct") {
      const valA = a.dividend_cagr_3y_pct ?? -999;
      const valB = b.dividend_cagr_3y_pct ?? -999;
      comparison = valA - valB;
    } else {
      comparison = (a[sortField] as number) - (b[sortField] as number);
    }
    return sortAsc ? comparison : -comparison;
  });

  const growingCount = funds.filter((f) => f.dividend_growth_classification === "Growing").length;
  const decliningCount = funds.filter((f) => f.dividend_growth_classification === "Declining").length;

  return (
    <div className="bg-[#0f172a] border border-slate-800 rounded-lg overflow-hidden">
      {/* Table Header Controls */}
      <div className="p-4 border-b border-slate-800 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-base font-semibold text-white">
            Evaluated Income Funds Matrix
          </h2>
          <div className="text-xs text-slate-400 mt-0.5">
            Click any row to inspect deep NAV trajectory, 3Y/5Y dividend CAGR, and benchmark divergence
          </div>
        </div>

        {/* Filter buttons - functional interactive controls */}
        <div className="flex flex-wrap items-center gap-1.5 p-1 bg-slate-900/90 rounded-md border border-slate-800/80 text-xs">
          <button
            onClick={() => onFilterChange("ALL")}
            className={`px-2.5 py-1 rounded transition-colors whitespace-nowrap ${
              currentFilter === "ALL"
                ? "bg-slate-800 text-white font-medium shadow-sm"
                : "text-slate-400 hover:text-slate-200"
            }`}
          >
            All ({funds.length})
          </button>
          <button
            onClick={() => onFilterChange("NO_SINGLE_STOCK")}
            className={`px-2.5 py-1 rounded transition-colors whitespace-nowrap flex items-center gap-1 ${
              currentFilter === "NO_SINGLE_STOCK"
                ? "bg-sky-950 text-sky-300 font-semibold border border-sky-700 shadow-sm"
                : "text-slate-400 hover:text-sky-300"
            }`}
            title="Exclude single-stock synthetic funds (e.g. YieldMax/TSLY/NVDY); focus purely on broad index covered calls and dividend growth ETFs"
          >
            <ShieldCheck className="w-3 h-3 text-sky-400" />
            <span>Broad Index Only ({funds.filter((f) => f.category !== "Single Stock Covered Call").length})</span>
          </button>
          <button
            onClick={() => onFilterChange("GROWING")}
            className={`px-2.5 py-1 rounded transition-colors whitespace-nowrap flex items-center gap-1 ${
              currentFilter === "GROWING"
                ? "bg-emerald-950 text-emerald-300 font-semibold border border-emerald-700 shadow-sm"
                : "text-slate-400 hover:text-emerald-400"
            }`}
            title="Show only sustainable income growers with positive multi-year dividend growth"
          >
            <TrendingUp className="w-3 h-3 text-emerald-400" />
            <span>Growers ({growingCount})</span>
          </button>
          <button
            onClick={() => onFilterChange("DECLINING")}
            className={`px-2.5 py-1 rounded transition-colors whitespace-nowrap flex items-center gap-1 ${
              currentFilter === "DECLINING"
                ? "bg-rose-950 text-rose-300 font-semibold border border-rose-700 shadow-sm"
                : "text-slate-400 hover:text-rose-400"
            }`}
            title="Show funds with declining payouts or destructive NAV liquidation"
          >
            <TrendingDown className="w-3 h-3 text-rose-400" />
            <span>Declining ({decliningCount})</span>
          </button>
          <div className="w-[1px] h-4 bg-slate-800 mx-1 hidden sm:block" />
          <button
            onClick={() => onFilterChange("GREEN")}
            className={`px-2.5 py-1 rounded transition-colors whitespace-nowrap ${
              currentFilter === "GREEN"
                ? "bg-emerald-950 text-emerald-300 font-medium border border-emerald-800"
                : "text-slate-400 hover:text-emerald-400"
            }`}
          >
            Green
          </button>
          <button
            onClick={() => onFilterChange("YELLOW")}
            className={`px-2.5 py-1 rounded transition-colors whitespace-nowrap ${
              currentFilter === "YELLOW"
                ? "bg-amber-950 text-amber-300 font-medium border border-amber-800"
                : "text-slate-400 hover:text-amber-400"
            }`}
          >
            Yellow
          </button>
          <button
            onClick={() => onFilterChange("RED")}
            className={`px-2.5 py-1 rounded transition-colors whitespace-nowrap ${
              currentFilter === "RED"
                ? "bg-rose-950 text-rose-300 font-medium border border-rose-800"
                : "text-slate-400 hover:text-rose-400"
            }`}
          >
            Red Alert
          </button>
        </div>
      </div>

      {/* Responsive Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs">
          <thead className="bg-[#0b101e] text-slate-400 border-b border-slate-800 text-[11px] font-medium tracking-wider uppercase">
            <tr>
              <th
                onClick={() => handleSort("ticker")}
                className="py-3 px-4 cursor-pointer hover:text-white"
              >
                <div className="flex items-center gap-1">
                  <span>Ticker &amp; Fund</span>
                  <ArrowUpDown className="w-3 h-3 text-slate-500" />
                </div>
              </th>
              <th className="py-3 px-3">Category</th>
              <th
                onClick={() => handleSort("distribution_yield_pct")}
                className="py-3 px-3 text-right cursor-pointer hover:text-white"
              >
                <div className="flex items-center justify-end gap-1">
                  <span>Yield</span>
                  <ArrowUpDown className="w-3 h-3 text-slate-500" />
                </div>
              </th>
              <th
                onClick={() => handleSort("nav_change_3m_pct")}
                className="py-3 px-3 text-right cursor-pointer hover:text-white"
              >
                <div className="flex items-center justify-end gap-1">
                  <span>3M NAV</span>
                  <ArrowUpDown className="w-3 h-3 text-slate-500" />
                </div>
              </th>
              <th
                onClick={() => handleSort("nav_change_6m_pct")}
                className="py-3 px-3 text-right cursor-pointer hover:text-white"
              >
                <div className="flex items-center justify-end gap-1">
                  <span>6M NAV</span>
                  <ArrowUpDown className="w-3 h-3 text-slate-500" />
                </div>
              </th>
              <th
                onClick={() => handleSort("nav_change_12m_pct")}
                className="py-3 px-3 text-right cursor-pointer hover:text-white"
              >
                <div className="flex items-center justify-end gap-1">
                  <span>12M NAV</span>
                  <ArrowUpDown className="w-3 h-3 text-slate-500" />
                </div>
              </th>
              <th
                onClick={() => handleSort("total_return_12m_pct")}
                className="py-3 px-3 text-right cursor-pointer hover:text-white"
              >
                <div className="flex items-center justify-end gap-1">
                  <span>12M Return</span>
                  <ArrowUpDown className="w-3 h-3 text-slate-500" />
                </div>
              </th>
              <th
                onClick={() => handleSort("dividend_cagr_3y_pct")}
                className="py-3 px-3 text-right cursor-pointer hover:text-white"
                title="Compound Annual Growth Rate of distributions over 3Y and 5Y"
              >
                <div className="flex items-center justify-end gap-1">
                  <span>Div CAGR (3Y/5Y)</span>
                  <ArrowUpDown className="w-3 h-3 text-slate-500" />
                </div>
              </th>
              <th className="py-3 px-3 text-center" title="Dividend sustainability classification: Growing, Stable, Stagnant, or Declining">
                Payout Trajectory
              </th>
              <th className="py-3 px-3 text-center">ROC Health</th>
              <th
                onClick={() => handleSort("alert_status")}
                className="py-3 px-4 text-center cursor-pointer hover:text-white"
              >
                <div className="flex items-center justify-center gap-1">
                  <span>Alert Status</span>
                  <ArrowUpDown className="w-3 h-3 text-slate-500" />
                </div>
              </th>
              <th className="py-3 px-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/60 font-mono tabular-nums">
            {sortedFunds.length === 0 ? (
              <tr>
                <td colSpan={12} className="py-8 text-center text-slate-500 font-sans">
                  No funds match the current filter criteria.
                </td>
              </tr>
            ) : (
              sortedFunds.map((fund) => {
                const isSelected = fund.ticker === selectedTicker;

                return (
                  <tr
                    key={fund.ticker}
                    onClick={() => onSelectFund(fund.ticker)}
                    className={`cursor-pointer transition-colors ${
                      isSelected
                        ? "bg-sky-950/40 hover:bg-sky-950/60"
                        : "hover:bg-slate-800/40"
                    }`}
                  >
                    {/* Ticker & Fund Name */}
                    <td className="py-3 px-4 font-sans">
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-bold text-white text-sm">
                          {fund.ticker}
                        </span>
                        {isSelected && (
                          <span className="text-[10px] text-sky-400 font-sans font-medium px-1.5 py-0.2 bg-sky-950/70 border border-sky-800/80 rounded">
                            ACTIVE
                          </span>
                        )}
                      </div>
                      <div className="text-[11px] text-slate-400 truncate max-w-[200px]">
                        {fund.fund_name}
                      </div>
                    </td>

                    {/* Category - rendered as clean text with no pills */}
                    <td className="py-3 px-3 font-sans text-slate-300">
                      <span className="text-[11px] text-slate-400">
                        {fund.category}
                      </span>
                    </td>

                    {/* Yield */}
                    <td className="py-3 px-3 text-right">
                      <span className="font-semibold text-white">
                        {fund.distribution_yield_pct.toFixed(1)}%
                      </span>
                    </td>

                    {/* 3M NAV */}
                    <td
                      className={`py-3 px-3 text-right ${
                        fund.nav_change_3m_pct >= 0
                          ? "text-emerald-400"
                          : fund.nav_change_3m_pct < -3.0
                          ? "text-rose-400 font-semibold"
                          : "text-amber-400"
                      }`}
                    >
                      {fund.nav_change_3m_pct > 0 ? "+" : ""}
                      {fund.nav_change_3m_pct.toFixed(1)}%
                    </td>

                    {/* 6M NAV */}
                    <td
                      className={`py-3 px-3 text-right ${
                        fund.nav_change_6m_pct >= 0
                          ? "text-emerald-400"
                          : fund.nav_change_6m_pct < -3.0
                          ? "text-rose-400 font-semibold"
                          : "text-amber-400"
                      }`}
                    >
                      {fund.nav_change_6m_pct > 0 ? "+" : ""}
                      {fund.nav_change_6m_pct.toFixed(1)}%
                    </td>

                    {/* 12M NAV */}
                    <td
                      className={`py-3 px-3 text-right ${
                        fund.nav_change_12m_pct >= -1.5
                          ? "text-emerald-400 font-medium"
                          : fund.nav_change_12m_pct >= -3.0
                          ? "text-amber-400 font-medium"
                          : "text-rose-400 font-bold"
                      }`}
                    >
                      {fund.nav_change_12m_pct > 0 ? "+" : ""}
                      {fund.nav_change_12m_pct.toFixed(1)}%
                    </td>

                    {/* 12M Total Return */}
                    <td
                      className={`py-3 px-3 text-right ${
                        fund.total_return_12m_pct >= 0
                          ? "text-emerald-400 font-medium"
                          : "text-rose-400 font-bold"
                      }`}
                    >
                      {fund.total_return_12m_pct > 0 ? "+" : ""}
                      {fund.total_return_12m_pct.toFixed(1)}%
                    </td>

                    {/* Div CAGR (3Y / 5Y) */}
                    <td className="py-3 px-3 text-right">
                      <div className="font-semibold">
                        {fund.dividend_cagr_3y_pct !== null ? (
                          <span
                            className={
                              fund.dividend_cagr_3y_pct >= 2.0
                                ? "text-emerald-400 font-bold"
                                : fund.dividend_cagr_3y_pct >= -1.0
                                ? "text-slate-300"
                                : "text-rose-400 font-bold"
                            }
                          >
                            {fund.dividend_cagr_3y_pct > 0 ? "+" : ""}
                            {fund.dividend_cagr_3y_pct.toFixed(1)}%
                            <span className="text-[10px] text-slate-500 font-sans font-normal ml-0.5">3Y</span>
                          </span>
                        ) : (
                          <span className="text-slate-500 text-[11px] font-sans">N/A</span>
                        )}
                      </div>
                      <div className="text-[10px]">
                        {fund.dividend_cagr_5y_pct !== null ? (
                          <span
                            className={
                              fund.dividend_cagr_5y_pct >= 2.0
                                ? "text-emerald-400/90 font-medium"
                                : fund.dividend_cagr_5y_pct >= -1.0
                                ? "text-slate-400"
                                : "text-rose-400 font-medium"
                            }
                          >
                            {fund.dividend_cagr_5y_pct > 0 ? "+" : ""}
                            {fund.dividend_cagr_5y_pct.toFixed(1)}%
                            <span className="text-slate-500 font-sans ml-0.5">5Y</span>
                          </span>
                        ) : (
                          <span className="text-slate-600 font-sans">&lt;5Y</span>
                        )}
                      </div>
                    </td>

                    {/* Payout Trajectory */}
                    <td className="py-3 px-3 text-center font-sans">
                      {fund.dividend_growth_classification === "Growing" && (
                        <div
                          className="inline-flex items-center gap-1 px-2 py-0.5 rounded border border-emerald-700/80 bg-emerald-950/70 text-emerald-300 font-semibold text-[10px]"
                          title="Sustainable Income Grower: payout compounds organically over multi-year periods"
                        >
                          <TrendingUp className="w-3 h-3 text-emerald-400 shrink-0" />
                          <span>GROWING</span>
                        </div>
                      )}
                      {fund.dividend_growth_classification === "Stable" && (
                        <div
                          className="inline-flex items-center gap-1 px-2 py-0.5 rounded border border-sky-800/80 bg-sky-950/70 text-sky-300 font-medium text-[10px]"
                          title="Stable Payout: maintaining dividend rate without principal impairment"
                        >
                          <span>STABLE</span>
                        </div>
                      )}
                      {fund.dividend_growth_classification === "Stagnant" && (
                        <div
                          className="inline-flex items-center gap-1 px-2 py-0.5 rounded border border-amber-800/80 bg-amber-950/70 text-amber-300 font-medium text-[10px]"
                          title="Stagnant: flat or lagging inflation; lacks organic income expansion"
                        >
                          <span>STAGNANT</span>
                        </div>
                      )}
                      {fund.dividend_growth_classification === "Declining" && (
                        <div
                          className="inline-flex items-center gap-1 px-2 py-0.5 rounded border border-rose-800/80 bg-rose-950/70 text-rose-300 font-bold text-[10px]"
                          title="Declining Payout: structural NAV erosion haircut risk"
                        >
                          <TrendingDown className="w-3 h-3 text-rose-400 shrink-0" />
                          <span>DECLINING</span>
                        </div>
                      )}
                      {fund.dividend_growth_classification === "Insufficient History" && (
                        <div
                          className="inline-flex items-center gap-1 px-2 py-0.5 rounded border border-slate-800 bg-slate-900/80 text-slate-400 text-[10px]"
                          title="Recent Inception: multi-year track record maturing"
                        >
                          <span>&lt;3Y HIST</span>
                        </div>
                      )}
                    </td>

                    {/* ROC Health */}
                    <td className="py-3 px-3 text-center font-sans">
                      {fund.is_destructive_roc ? (
                        <div className="flex items-center justify-center gap-1 text-rose-400 text-[11px] font-medium">
                          <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                          <span>Destructive</span>
                        </div>
                      ) : (
                        <div className="flex items-center justify-center gap-1 text-slate-300 text-[11px]">
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                          <span>Sustainable</span>
                        </div>
                      )}
                    </td>

                    {/* Alert Status (Strict GREEN / YELLOW / RED) */}
                    <td className="py-3 px-4 text-center font-sans">
                      {fund.alert_status === "GREEN" && (
                        <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded border border-emerald-700/80 bg-emerald-950/60 text-emerald-300 font-semibold text-[11px]">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                          <span>GREEN</span>
                        </div>
                      )}
                      {fund.alert_status === "YELLOW" && (
                        <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded border border-amber-700/80 bg-amber-950/60 text-amber-300 font-semibold text-[11px]">
                          <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
                          <span>YELLOW</span>
                        </div>
                      )}
                      {fund.alert_status === "RED" && (
                        <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded border border-rose-700/80 bg-rose-950/60 text-rose-300 font-semibold text-[11px]">
                          <span className="w-1.5 h-1.5 rounded-full bg-rose-400" />
                          <span>RED</span>
                        </div>
                      )}
                    </td>

                    {/* Actions */}
                    <td className="py-3 px-3 text-right font-sans">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            onViewJson(fund);
                          }}
                          className="p-1.5 text-slate-400 hover:text-sky-300 hover:bg-slate-700/60 rounded transition-colors"
                          title="View strict JSON"
                        >
                          <FileJson className="w-4 h-4" />
                        </button>
                        <ChevronRight className="w-4 h-4 text-slate-600" />
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};
