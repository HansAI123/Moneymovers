import React, { useState } from "react";
import {
  TrendingUp,
  TrendingDown,
  BarChart3,
  ScatterChart as ScatterIcon,
  PieChart,
  Layers,
  Info,
  Calendar,
  ShieldCheck,
  ShieldAlert,
  AlertTriangle,
  Sparkles,
} from "lucide-react";
import { FundProfile, ProjectWorkspace } from "../types/fund";

interface InteractiveAnalyticsSuiteProps {
  funds: FundProfile[];
  activeWorkspace: ProjectWorkspace;
  selectedTicker: string;
  onSelectFund: (ticker: string) => void;
}

export const InteractiveAnalyticsSuite: React.FC<InteractiveAnalyticsSuiteProps> = ({
  funds,
  activeWorkspace,
  selectedTicker,
  onSelectFund,
}) => {
  const [activeChartTab, setActiveChartTab] = useState<"nav" | "income" | "scatter">("nav");
  const [timeHorizon, setTimeHorizon] = useState<"3M" | "6M" | "12M">("12M");
  const [hoveredDataPoint, setHoveredDataPoint] = useState<any | null>(null);

  // Active workspace holdings matched with full fund profiles
  const workspaceHoldings = activeWorkspace.holdings
    .map((h) => {
      const fund = funds.find((f) => f.ticker === h.ticker);
      return fund ? { ...fund, weightPct: h.weight_pct } : null;
    })
    .filter(Boolean) as (FundProfile & { weightPct: number })[];

  // Fallback to top 4 funds if workspace has no holdings
  const activeSeries =
    workspaceHoldings.length > 0
      ? workspaceHoldings
      : funds.slice(0, 4).map((f) => ({ ...f, weightPct: 25 }));

  // Financial math for aggregate metrics
  const portfolioYield = activeSeries.reduce(
    (acc, f) => acc + (f.distribution_yield_pct * f.weightPct) / 100,
    0
  );
  const portfolioNavChange12M = activeSeries.reduce(
    (acc, f) => acc + (f.nav_change_12m_pct * f.weightPct) / 100,
    0
  );
  const annualGrossCashFlow = (activeWorkspace.initialCapital * portfolioYield) / 100;

  // Tax math
  const effectiveTaxRate =
    activeWorkspace.accountType !== "taxable" ? 0 : activeWorkspace.marginalTaxRatePct;
  const netEstimatedIncome = annualGrossCashFlow * (1 - effectiveTaxRate / 100);

  // -------------------------------------------------------------------------
  // CHART 1: Historical NAV Trajectory (SVG Line Graph)
  // -------------------------------------------------------------------------
  const months =
    timeHorizon === "3M"
      ? ["M-3", "M-2", "M-1", "Current"]
      : timeHorizon === "6M"
      ? ["M-6", "M-5", "M-4", "M-3", "M-2", "M-1", "Current"]
      : [
          "M-12",
          "M-11",
          "M-10",
          "M-9",
          "M-8",
          "M-7",
          "M-6",
          "M-5",
          "M-4",
          "M-3",
          "M-2",
          "M-1",
          "Current",
        ];

  // Normalized trajectories based on NAV changes
  const chartHeight = 220;
  const chartWidth = 600;
  const paddingX = 40;
  const paddingY = 25;

  const colorPalette = [
    { stroke: "#38bdf8", fill: "#38bdf8", name: "Sky" },
    { stroke: "#10b981", fill: "#10b981", name: "Emerald" },
    { stroke: "#f59e0b", fill: "#f59e0b", name: "Amber" },
    { stroke: "#a855f7", fill: "#a855f7", name: "Purple" },
    { stroke: "#f43f5e", fill: "#f43f5e", name: "Rose" },
  ];

  // Map fund trajectory points
  const getTrajectoryPoints = (navDelta: number, count: number) => {
    return Array.from({ length: count }, (_, i) => {
      const progress = i / (count - 1);
      // Realistic compounding path with monthly variations
      const oscillation = Math.sin(i * 1.4) * 0.8;
      const val = 100 + navDelta * progress + (i === count - 1 ? 0 : oscillation);
      return val;
    });
  };

  // Find min/max values across all series for scaling
  let minVal = 85;
  let maxVal = 115;
  activeSeries.forEach((f) => {
    const delta =
      timeHorizon === "3M"
        ? f.nav_change_3m_pct
        : timeHorizon === "6M"
        ? f.nav_change_6m_pct
        : f.nav_change_12m_pct;
    const pts = getTrajectoryPoints(delta, months.length);
    pts.forEach((p) => {
      if (p < minVal) minVal = p - 2;
      if (p > maxVal) maxVal = p + 2;
    });
  });

  const scaleY = (val: number) => {
    return (
      chartHeight -
      paddingY -
      ((val - minVal) / (maxVal - minVal || 1)) * (chartHeight - paddingY * 2)
    );
  };

  const scaleX = (index: number) => {
    return paddingX + (index / (months.length - 1)) * (chartWidth - paddingX * 2);
  };

  // -------------------------------------------------------------------------
  // CHART 2: 12-Month Forward Cash Flow Schedule (Monthly Stacked Bars)
  // -------------------------------------------------------------------------
  const monthlyNames = [
    "Jan",
    "Feb",
    "Mar",
    "Apr",
    "May",
    "Jun",
    "Jul",
    "Aug",
    "Sep",
    "Oct",
    "Nov",
    "Dec",
  ];
  const monthlyBaseIncome = annualGrossCashFlow / 12;

  // Breakdown proportions
  const avgRocPct =
    activeSeries.reduce((acc, f) => acc + (f.roc_composition_pct * f.weightPct) / 100, 0) || 20;
  const isTaxSheltered = activeWorkspace.accountType !== "taxable";

  const monthlyBarsData = monthlyNames.map((m, idx) => {
    // minor seasonal variation (+/- 4%)
    const variation = 1 + Math.sin(idx * 0.9) * 0.04;
    const totalMonth = monthlyBaseIncome * variation;
    const roc = isTaxSheltered ? 0 : (totalMonth * avgRocPct) / 100;
    const sec1256 = isTaxSheltered ? 0 : totalMonth * 0.35;
    const qualified = isTaxSheltered ? 0 : totalMonth * 0.25;
    const ordinary = totalMonth - roc - sec1256 - qualified;

    return {
      month: m,
      total: totalMonth,
      roc,
      sec1256,
      qualified,
      ordinary,
    };
  });

  const maxMonthTotal = Math.max(...monthlyBarsData.map((d) => d.total)) * 1.15 || 1000;

  // -------------------------------------------------------------------------
  // CHART 3: Yield vs. NAV Erosion Risk Scatter Matrix
  // -------------------------------------------------------------------------
  const scatterWidth = 600;
  const scatterHeight = 260;
  const scatterPadX = 45;
  const scatterPadY = 30;

  const minYield = 0;
  const maxYield = 70;
  const minNavChange = -35;
  const maxNavChange = 15;

  const scaleScatterX = (yVal: number) => {
    return scatterPadX + (yVal / (maxYield - minYield)) * (scatterWidth - scatterPadX * 2);
  };

  const scaleScatterY = (nVal: number) => {
    return (
      scatterHeight -
      scatterPadY -
      ((nVal - minNavChange) / (maxNavChange - minNavChange)) * (scatterHeight - scatterPadY * 2)
    );
  };

  return (
    <div className="space-y-6">
      {/* Header and Visual Mode Selector */}
      <div className="bg-[#0f172a] border border-slate-800 rounded-xl p-5">
        <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-slate-800/80">
          <div>
            <div className="text-xs font-semibold text-sky-400 tracking-wider uppercase flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Interactive Quantitative Graphics</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-bold text-white mt-1">
              Portfolio Visual Analytics & Risk Topography
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Auditing workspace: <strong className="text-slate-200">{activeWorkspace.name}</strong> (${activeWorkspace.initialCapital.toLocaleString()} Capital Base)
            </p>
          </div>

          {/* Segmented Chart Selector Tabs */}
          <div className="flex items-center gap-1 p-1 bg-slate-900 border border-slate-800 rounded-lg">
            <button
              onClick={() => setActiveChartTab("nav")}
              className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-colors flex items-center gap-1.5 cursor-pointer ${
                activeChartTab === "nav"
                  ? "bg-slate-800 text-sky-400 shadow-sm"
                  : "text-slate-400 hover:text-slate-200"
              }`}
            >
              <TrendingUp className="w-3.5 h-3.5" />
              <span>NAV Decay Trajectory</span>
            </button>
            <button
              onClick={() => setActiveChartTab("income")}
              className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-colors flex items-center gap-1.5 cursor-pointer ${
                activeChartTab === "income"
                  ? "bg-slate-800 text-emerald-400 shadow-sm"
                  : "text-slate-400 hover:text-slate-200"
              }`}
            >
              <BarChart3 className="w-3.5 h-3.5" />
              <span>Cash Flow Forecast</span>
            </button>
            <button
              onClick={() => setActiveChartTab("scatter")}
              className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-colors flex items-center gap-1.5 cursor-pointer ${
                activeChartTab === "scatter"
                  ? "bg-slate-800 text-amber-400 shadow-sm"
                  : "text-slate-400 hover:text-slate-200"
              }`}
            >
              <ScatterIcon className="w-3.5 h-3.5" />
              <span>Yield vs. Risk Scatter</span>
            </button>
          </div>
        </div>

        {/* Aggregate KPI Ribbon for active workspace */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-4">
          <div className="bg-[#0b101e] border border-slate-800/80 p-3 rounded-lg">
            <div className="text-[11px] text-slate-400">Blended Portfolio Yield</div>
            <div className="text-lg font-mono font-bold text-white mt-0.5">
              {portfolioYield.toFixed(2)}%
            </div>
            <div className="text-[10px] text-slate-400 mt-0.5">
              Target: {activeWorkspace.targetYieldPct}%
            </div>
          </div>

          <div className="bg-[#0b101e] border border-slate-800/80 p-3 rounded-lg">
            <div className="text-[11px] text-slate-400">12M Weighted NAV Trajectory</div>
            <div
              className={`text-lg font-mono font-bold mt-0.5 ${
                portfolioNavChange12M >= 0
                  ? "text-emerald-400"
                  : portfolioNavChange12M >= -2.0
                  ? "text-amber-400"
                  : "text-rose-400"
              }`}
            >
              {portfolioNavChange12M >= 0 ? "+" : ""}
              {portfolioNavChange12M.toFixed(2)}%
            </div>
            <div className="text-[10px] text-slate-400 mt-0.5">
              {portfolioNavChange12M >= -1.5 ? "Capital Preserved" : "Principal Erosion Detected"}
            </div>
          </div>

          <div className="bg-[#0b101e] border border-slate-800/80 p-3 rounded-lg">
            <div className="text-[11px] text-slate-400">Annual Gross Cash Flow</div>
            <div className="text-lg font-mono font-bold text-sky-400 mt-0.5">
              ${Math.round(annualGrossCashFlow).toLocaleString()}
            </div>
            <div className="text-[10px] text-slate-400 mt-0.5">
              ~${Math.round(annualGrossCashFlow / 12).toLocaleString()}/month
            </div>
          </div>

          <div className="bg-[#0b101e] border border-slate-800/80 p-3 rounded-lg">
            <div className="text-[11px] text-slate-400">Estimated After-Tax Yield</div>
            <div className="text-lg font-mono font-bold text-emerald-400 mt-0.5">
              {((netEstimatedIncome / activeWorkspace.initialCapital) * 100).toFixed(2)}%
            </div>
            <div className="text-[10px] text-slate-400 mt-0.5">
              {activeWorkspace.accountType === "taxable"
                ? `${activeWorkspace.marginalTaxRatePct}% marginal tax drag`
                : "Tax-exempt account"}
            </div>
          </div>
        </div>
      </div>

      {/* =======================================================================
          VIEW 1: Multi-Fund NAV Trajectory Curve
         ======================================================================= */}
      {activeChartTab === "nav" && (
        <div className="bg-[#0f172a] border border-slate-800 rounded-xl p-5 space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-sky-400" />
                <span>Normalized Capital Trajectory (Base = 100.0)</span>
              </h3>
              <p className="text-xs text-slate-400">
                Visualizing NAV preservation vs. silent capital erosion across evaluated timeframes.
              </p>
            </div>

            {/* Time horizon pill switch */}
            <div className="flex items-center gap-1 p-1 bg-slate-900 border border-slate-800 rounded-lg text-xs">
              {(["3M", "6M", "12M"] as const).map((h) => (
                <button
                  key={h}
                  onClick={() => setTimeHorizon(h)}
                  className={`px-2.5 py-1 rounded font-medium transition-colors cursor-pointer ${
                    timeHorizon === h
                      ? "bg-slate-800 text-sky-400 font-bold"
                      : "text-slate-400 hover:text-white"
                  }`}
                >
                  {h}
                </button>
              ))}
            </div>
          </div>

          {/* SVG Graph Viewport */}
          <div className="relative bg-[#080d1a] border border-slate-800/80 rounded-xl p-4 overflow-hidden">
            <svg
              viewBox={`0 0 ${chartWidth} ${chartHeight}`}
              className="w-full h-auto overflow-visible select-none"
            >
              {/* Baseline 100 reference line */}
              <line
                x1={paddingX}
                y1={scaleY(100)}
                x2={chartWidth - paddingX}
                y2={scaleY(100)}
                stroke="#334155"
                strokeWidth="1.5"
                strokeDasharray="4 4"
              />
              <text
                x={chartWidth - paddingX + 5}
                y={scaleY(100) + 4}
                fill="#64748b"
                fontSize="10"
                fontFamily="monospace"
              >
                100.0 (Par)
              </text>

              {/* Horizontal gridlines */}
              {[90, 95, 105, 110].map((gridVal) => {
                if (gridVal < minVal || gridVal > maxVal) return null;
                const y = scaleY(gridVal);
                return (
                  <g key={gridVal}>
                    <line
                      x1={paddingX}
                      y1={y}
                      x2={chartWidth - paddingX}
                      y2={y}
                      stroke="#1e293b"
                      strokeWidth="1"
                    />
                    <text
                      x={paddingX - 25}
                      y={y + 3}
                      fill="#475569"
                      fontSize="9"
                      fontFamily="monospace"
                    >
                      {gridVal}
                    </text>
                  </g>
                );
              })}

              {/* X-axis labels */}
              {months.map((m, idx) => {
                const x = scaleX(idx);
                return (
                  <text
                    key={m}
                    x={x}
                    y={chartHeight - 6}
                    fill="#64748b"
                    fontSize="9"
                    textAnchor="middle"
                    fontFamily="monospace"
                  >
                    {m}
                  </text>
                );
              })}

              {/* Series lines for each fund */}
              {activeSeries.map((fund, sIdx) => {
                const delta =
                  timeHorizon === "3M"
                    ? fund.nav_change_3m_pct
                    : timeHorizon === "6M"
                    ? fund.nav_change_6m_pct
                    : fund.nav_change_12m_pct;
                const points = getTrajectoryPoints(delta, months.length);
                const color = colorPalette[sIdx % colorPalette.length];

                const pathData = points
                  .map((val, idx) => {
                    const x = scaleX(idx);
                    const y = scaleY(val);
                    return `${idx === 0 ? "M" : "L"} ${x} ${y}`;
                  })
                  .join(" ");

                return (
                  <g key={fund.ticker}>
                    <path
                      d={pathData}
                      fill="none"
                      stroke={color.stroke}
                      strokeWidth="2.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                    {/* Points */}
                    {points.map((val, pIdx) => {
                      const x = scaleX(pIdx);
                      const y = scaleY(val);
                      return (
                        <circle
                          key={pIdx}
                          cx={x}
                          cy={y}
                          r="3"
                          fill="#0f172a"
                          stroke={color.stroke}
                          strokeWidth="2"
                          className="hover:r-5 cursor-pointer transition-all"
                          onMouseEnter={() =>
                            setHoveredDataPoint({
                              ticker: fund.ticker,
                              month: months[pIdx],
                              value: val.toFixed(2),
                              color: color.stroke,
                            })
                          }
                          onMouseLeave={() => setHoveredDataPoint(null)}
                        />
                      );
                    })}
                  </g>
                );
              })}
            </svg>

            {/* Hover tooltip */}
            {hoveredDataPoint && (
              <div className="absolute top-3 right-3 p-2.5 bg-slate-900/95 border border-slate-700 rounded-lg text-xs shadow-xl backdrop-blur-sm pointer-events-none">
                <div className="flex items-center gap-1.5 font-bold text-white">
                  <span
                    className="w-2.5 h-2.5 rounded-full"
                    style={{ backgroundColor: hoveredDataPoint.color }}
                  />
                  <span>{hoveredDataPoint.ticker}</span>
                  <span className="text-slate-400 font-normal">· {hoveredDataPoint.month}</span>
                </div>
                <div className="font-mono text-slate-200 mt-1">
                  NAV Value: <strong className="text-white">{hoveredDataPoint.value}</strong>
                </div>
              </div>
            )}
          </div>

          {/* Series Legend */}
          <div className="flex flex-wrap items-center gap-4 pt-1 text-xs">
            {activeSeries.map((fund, sIdx) => {
              const color = colorPalette[sIdx % colorPalette.length];
              return (
                <button
                  key={fund.ticker}
                  onClick={() => onSelectFund(fund.ticker)}
                  className={`flex items-center gap-2 p-1.5 rounded-lg border transition-colors cursor-pointer ${
                    selectedTicker === fund.ticker
                      ? "border-sky-500 bg-sky-500/10 text-white"
                      : "border-slate-800 bg-slate-900 text-slate-300 hover:border-slate-700"
                  }`}
                >
                  <span
                    className="w-3 h-3 rounded-full shrink-0"
                    style={{ backgroundColor: color.stroke }}
                  />
                  <span className="font-bold">{fund.ticker}</span>
                  <span className="text-slate-400 text-[11px]">({fund.weightPct}%)</span>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* =======================================================================
          VIEW 2: 12-Month Forward Cash Flow Forecast (Monthly Stacked Bars)
         ======================================================================= */}
      {activeChartTab === "income" && (
        <div className="bg-[#0f172a] border border-slate-800 rounded-xl p-5 space-y-4">
          <div>
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <BarChart3 className="w-4 h-4 text-emerald-400" />
              <span>Projected 12-Month Cash Flow & Tax Composition</span>
            </h3>
            <p className="text-xs text-slate-400">
              Breakdown of estimated monthly cash distributions by tax category under your current tax bracket.
            </p>
          </div>

          {/* Bar Chart Canvas */}
          <div className="bg-[#080d1a] border border-slate-800/80 rounded-xl p-5">
            <div className="grid grid-cols-12 gap-2 h-48 items-end pt-6 pb-2 border-b border-slate-800">
              {monthlyBarsData.map((d) => {
                const totalH = (d.total / maxMonthTotal) * 100;
                const rocH = (d.roc / d.total) * 100;
                const sec1256H = (d.sec1256 / d.total) * 100;
                const qualH = (d.qualified / d.total) * 100;
                const ordH = 100 - rocH - sec1256H - qualH;

                return (
                  <div
                    key={d.month}
                    className="flex flex-col items-center h-full justify-end group relative cursor-pointer"
                  >
                    {/* Tooltip on hover */}
                    <div className="absolute -top-14 opacity-0 group-hover:opacity-100 transition-opacity bg-slate-900 border border-slate-700 p-2 rounded text-[11px] text-white shadow-xl pointer-events-none z-20 whitespace-nowrap">
                      <div className="font-bold">{d.month}: ${Math.round(d.total).toLocaleString()}</div>
                      <div className="text-emerald-400">ROC: ${Math.round(d.roc)}</div>
                      <div className="text-sky-400">Sec 1256: ${Math.round(d.sec1256)}</div>
                      <div className="text-amber-400">Ordinary: ${Math.round(d.ordinary)}</div>
                    </div>

                    {/* Stacked bar cylinder */}
                    <div
                      className="w-full max-w-[28px] rounded-t overflow-hidden flex flex-col-reverse transition-all group-hover:brightness-110"
                      style={{ height: `${Math.max(15, totalH)}%` }}
                    >
                      {/* ROC (Emerald) */}
                      <div style={{ height: `${rocH}%` }} className="bg-emerald-500 w-full" />
                      {/* Section 1256 (Sky) */}
                      <div style={{ height: `${sec1256H}%` }} className="bg-sky-500 w-full" />
                      {/* Qualified (Cyan) */}
                      <div style={{ height: `${qualH}%` }} className="bg-teal-400 w-full" />
                      {/* Ordinary (Amber) */}
                      <div style={{ height: `${ordH}%` }} className="bg-amber-500 w-full" />
                    </div>

                    {/* Month Label */}
                    <span className="text-[10px] text-slate-400 mt-2 font-mono">{d.month}</span>
                  </div>
                );
              })}
            </div>

            {/* Income Legend */}
            <div className="flex flex-wrap items-center justify-between gap-3 pt-3 text-xs">
              <div className="flex flex-wrap items-center gap-3">
                <div className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded bg-emerald-500" />
                  <span className="text-slate-300">Non-Taxable ROC</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded bg-sky-500" />
                  <span className="text-slate-300">Section 1256 (60/40)</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded bg-teal-400" />
                  <span className="text-slate-300">Qualified Dividends</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded bg-amber-500" />
                  <span className="text-slate-300">Ordinary Income</span>
                </div>
              </div>

              <div className="text-xs font-mono text-slate-300">
                Average Payout: <strong className="text-white">${Math.round(monthlyBaseIncome).toLocaleString()}/mo</strong>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* =======================================================================
          VIEW 3: Yield vs. NAV Erosion Risk Scatter Matrix
         ======================================================================= */}
      {activeChartTab === "scatter" && (
        <div className="bg-[#0f172a] border border-slate-800 rounded-xl p-5 space-y-4">
          <div>
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <ScatterIcon className="w-4 h-4 text-amber-400" />
              <span>Distribution Yield vs. 12-Month NAV Erosion Frontier</span>
            </h3>
            <p className="text-xs text-slate-400">
              Hover over or click any fund node to inspect sustainability classification and alternative recommendations.
            </p>
          </div>

          <div className="relative bg-[#080d1a] border border-slate-800/80 rounded-xl p-4">
            <svg
              viewBox={`0 0 ${scatterWidth} ${scatterHeight}`}
              className="w-full h-auto overflow-visible select-none"
            >
              {/* Green Zone Background Shading (Sustainable Yield) */}
              <rect
                x={scaleScatterX(5)}
                y={scaleScatterY(maxNavChange)}
                width={scaleScatterX(35) - scaleScatterX(5)}
                height={scaleScatterY(-1.5) - scaleScatterY(maxNavChange)}
                fill="#10b981"
                fillOpacity="0.05"
              />

              {/* Red Zone Background Shading (Yield Trap Territory) */}
              <rect
                x={scaleScatterX(25)}
                y={scaleScatterY(-3.0)}
                width={scatterWidth - scatterPadX - scaleScatterX(25)}
                height={scaleScatterY(minNavChange) - scaleScatterY(-3.0)}
                fill="#f43f5e"
                fillOpacity="0.08"
              />

              {/* Danger Zone Reference Lines */}
              <line
                x1={scatterPadX}
                y1={scaleScatterY(-1.5)}
                x2={scatterWidth - scatterPadX}
                y2={scaleScatterY(-1.5)}
                stroke="#eab308"
                strokeWidth="1"
                strokeDasharray="4 4"
              />
              <line
                x1={scatterPadX}
                y1={scaleScatterY(-3.0)}
                x2={scatterWidth - scatterPadX}
                y2={scaleScatterY(-3.0)}
                stroke="#f43f5e"
                strokeWidth="1.5"
                strokeDasharray="4 4"
              />
              <line
                x1={scaleScatterX(0)}
                y1={scaleScatterY(0)}
                x2={scatterWidth - scatterPadX}
                y2={scaleScatterY(0)}
                stroke="#475569"
                strokeWidth="1.5"
              />

              <text
                x={scatterWidth - scatterPadX - 5}
                y={scaleScatterY(-3.0) - 6}
                fill="#f43f5e"
                fontSize="9"
                textAnchor="end"
                fontFamily="monospace"
              >
                Destructive Erosion Threshold (&lt; -3.0% NAV)
              </text>

              {/* Grid labels */}
              {[0, 15, 30, 45, 60].map((yVal) => (
                <text
                  key={yVal}
                  x={scaleScatterX(yVal)}
                  y={scatterHeight - 8}
                  fill="#64748b"
                  fontSize="9"
                  textAnchor="middle"
                  fontFamily="monospace"
                >
                  {yVal}%
                </text>
              ))}

              {/* Plot all fleet funds */}
              {funds.map((fund) => {
                const cx = scaleScatterX(fund.distribution_yield_pct);
                const cy = scaleScatterY(fund.nav_change_12m_pct);
                const isSelected = selectedTicker === fund.ticker;

                let nodeColor = "#10b981";
                if (fund.alert_status === "YELLOW") nodeColor = "#f59e0b";
                if (fund.alert_status === "RED") nodeColor = "#f43f5e";

                return (
                  <g
                    key={fund.ticker}
                    className="cursor-pointer"
                    onClick={() => onSelectFund(fund.ticker)}
                  >
                    <circle
                      cx={cx}
                      cy={cy}
                      r={isSelected ? 7 : 5}
                      fill={nodeColor}
                      stroke={isSelected ? "#ffffff" : "#0f172a"}
                      strokeWidth={isSelected ? 2.5 : 1.5}
                      className="transition-all hover:r-7"
                    />
                    <text
                      x={cx}
                      y={cy - 8}
                      fill={isSelected ? "#ffffff" : "#cbd5e1"}
                      fontSize={isSelected ? "11" : "9"}
                      fontWeight={isSelected ? "bold" : "normal"}
                      textAnchor="middle"
                      fontFamily="monospace"
                    >
                      {fund.ticker}
                    </text>
                  </g>
                );
              })}
            </svg>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs pt-1">
            <div className="bg-[#0b101e] border border-emerald-500/20 p-2.5 rounded-lg">
              <div className="text-emerald-400 font-semibold">Green Quadrant: Sustainable Cash</div>
              <div className="text-[11px] text-slate-400 mt-0.5">
                Distribution supported by organic options premium without cannibalizing principal NAV.
              </div>
            </div>

            <div className="bg-[#0b101e] border border-amber-500/20 p-2.5 rounded-lg">
              <div className="text-amber-400 font-semibold">Yellow Quadrant: Upside Cap Drag</div>
              <div className="text-[11px] text-slate-400 mt-0.5">
                Mild NAV lag due to call write strike assignment during aggressive market rallies.
              </div>
            </div>

            <div className="bg-[#0b101e] border border-rose-500/20 p-2.5 rounded-lg">
              <div className="text-rose-400 font-semibold">Red Quadrant: Destructive Trap</div>
              <div className="text-[11px] text-slate-400 mt-0.5">
                Payout exceeds income generation. Return of capital is steadily reducing share base.
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
