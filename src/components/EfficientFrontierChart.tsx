import React, { useState, useEffect, useMemo } from "react";
import { FundProfile, ProjectWorkspace, EfficientFrontierPoint } from "../types/fund";
import { optimizePortfolioMvo, buildCovarianceMatrix } from "../utils/mvoOptimizer";
import {
  TrendingUp,
  Activity,
  Sliders,
  CheckCircle2,
  Sparkles,
  Info,
  ShieldCheck,
  RefreshCw,
  Award,
} from "lucide-react";

interface EfficientFrontierChartProps {
  availableFunds: FundProfile[];
  activeWorkspace: ProjectWorkspace;
  onApplyWeights?: (newWeights: Record<string, number>, targetYield: number) => void;
}

export const EfficientFrontierChart: React.FC<EfficientFrontierChartProps> = ({
  availableFunds,
  activeWorkspace,
  onApplyWeights,
}) => {
  const [maxWeightCap, setMaxWeightCap] = useState<number>(0.30);
  const [hoveredPoint, setHoveredPoint] = useState<EfficientFrontierPoint | null>(null);
  const [appliedMessage, setAppliedMessage] = useState<string>("");

  const activeHoldings = useMemo(() => {
    if (activeWorkspace.holdings.length > 0) {
      return activeWorkspace.holdings;
    }
    return [
      { ticker: "JEPI", weight_pct: 30 },
      { ticker: "JEPQ", weight_pct: 25 },
      { ticker: "SPYI", weight_pct: 25 },
      { ticker: "SCHD", weight_pct: 20 },
    ];
  }, [activeWorkspace]);

  const tickers = useMemo(() => activeHoldings.map((h) => h.ticker), [activeHoldings]);

  const yields = useMemo(() => {
    return tickers.map((t) => {
      const fund = availableFunds.find((f) => f.ticker === t);
      return fund?.distribution_yield_pct || 8.0;
    });
  }, [tickers, availableFunds]);

  // Current portfolio metrics
  const currentMetrics = useMemo(() => {
    const cov = buildCovarianceMatrix(tickers);
    const weightsArr = activeHoldings.map((h) => h.weight_pct / 100);

    let variance = 0;
    for (let i = 0; i < tickers.length; i++) {
      for (let j = 0; j < tickers.length; j++) {
        variance += weightsArr[i] * cov[i][j] * weightsArr[j];
      }
    }
    const vol = Math.round(Math.sqrt(Math.max(0, variance)) * 10000) / 100;
    const currentYield = Math.round(
      weightsArr.reduce((acc, w, i) => acc + w * yields[i], 0) * 100
    ) / 100;

    const weightsObj: Record<string, number> = {};
    tickers.forEach((t, i) => {
      weightsObj[t] = activeHoldings[i]?.weight_pct || 0;
    });

    return {
      portfolio_volatility: vol,
      target_yield: currentYield,
      sharpe_ratio: vol > 0 ? (currentYield - 4.5) / vol : 0,
      weights: weightsObj,
      is_current_portfolio: true,
    };
  }, [tickers, yields, activeHoldings]);

  // Compute 12 points along the Efficient Frontier curve using MVO quadratic solver
  const frontierPoints: EfficientFrontierPoint[] = useMemo(() => {
    if (tickers.length < 2) return [];

    const cov = buildCovarianceMatrix(tickers);
    const minYield = Math.min(...yields);

    const sortedYields = [...yields].sort((a, b) => b - a);
    let maxPossible = 0;
    let remWeight = 1.0;
    for (const y of sortedYields) {
      const take = Math.min(maxWeightCap, remWeight);
      maxPossible += take * y;
      remWeight -= take;
    }

    const steps = 12;
    const stepSize = (maxPossible - minYield) / (steps - 1);
    const points: EfficientFrontierPoint[] = [];

    for (let i = 0; i < steps; i++) {
      const targetY = minYield + i * stepSize;
      const opt = optimizePortfolioMvo(tickers, yields, targetY, maxWeightCap, cov);
      if (opt.success && opt.portfolio_volatility_pct !== null && opt.portfolio_yield_pct !== null) {
        const excess = Math.max(0, opt.portfolio_yield_pct - 4.5);
        const sharpe = opt.portfolio_volatility_pct > 0 ? excess / opt.portfolio_volatility_pct : 0;
        points.push({
          target_yield: Math.round(opt.portfolio_yield_pct * 100) / 100,
          portfolio_volatility: Math.round(opt.portfolio_volatility_pct * 100) / 100,
          sharpe_ratio: Math.round(sharpe * 100) / 100,
          weights: opt.optimized_weights || {},
        });
      }
    }

    if (points.length > 0) {
      let minVolIdx = 0;
      let maxSharpeIdx = 0;
      for (let i = 1; i < points.length; i++) {
        if (points[i].portfolio_volatility < points[minVolIdx].portfolio_volatility) {
          minVolIdx = i;
        }
        if (points[i].sharpe_ratio > points[maxSharpeIdx].sharpe_ratio) {
          maxSharpeIdx = i;
        }
      }
      points[minVolIdx].is_min_volatility = true;
      points[maxSharpeIdx].is_optimal_sharpe = true;
    }

    return points;
  }, [tickers, yields, maxWeightCap]);

  const minVolPoint = frontierPoints.find((p) => p.is_min_volatility) || frontierPoints[0];
  const maxSharpePoint = frontierPoints.find((p) => p.is_optimal_sharpe) || frontierPoints[0];

  // SVG dimensions for Frontier Chart
  const svgWidth = 640;
  const svgHeight = 280;
  const padding = { top: 25, right: 30, bottom: 40, left: 50 };

  const allVols = [
    ...frontierPoints.map((p) => p.portfolio_volatility),
    currentMetrics.portfolio_volatility,
  ];
  const allYields = [
    ...frontierPoints.map((p) => p.target_yield),
    currentMetrics.target_yield,
  ];

  const minX = Math.max(0, Math.min(...allVols) * 0.85);
  const maxX = Math.max(...allVols) * 1.15;
  const minY = Math.max(0, Math.min(...allYields) * 0.85);
  const maxY = Math.max(...allYields) * 1.15;

  const scaleX = (vol: number) => {
    return padding.left + ((vol - minX) / (maxX - minX || 1)) * (svgWidth - padding.left - padding.right);
  };

  const scaleY = (y: number) => {
    return (
      svgHeight -
      padding.bottom -
      ((y - minY) / (maxY - minY || 1)) * (svgHeight - padding.top - padding.bottom)
    );
  };

  // Generate SVG path for frontier curve
  const pathD = useMemo(() => {
    if (frontierPoints.length < 2) return "";
    const sorted = [...frontierPoints].sort((a, b) => a.portfolio_volatility - b.portfolio_volatility);
    return sorted.reduce((acc, p, idx) => {
      const x = scaleX(p.portfolio_volatility);
      const y = scaleY(p.target_yield);
      return idx === 0 ? `M ${x} ${y}` : `${acc} L ${x} ${y}`;
    }, "");
  }, [frontierPoints, minX, maxX, minY, maxY]);

  const handleApplyPoint = (p: EfficientFrontierPoint, label: string) => {
    if (onApplyWeights) {
      onApplyWeights(p.weights, p.target_yield);
      setAppliedMessage(`Adopted ${label} allocation (${p.target_yield.toFixed(1)}% Yield, ${p.portfolio_volatility.toFixed(1)}% Vol)`);
      setTimeout(() => setAppliedMessage(""), 4000);
    }
  };

  return (
    <div className="bg-[#0f172a] border border-slate-800 rounded-xl p-5 shadow-sm space-y-4">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-slate-800">
        <div>
          <div className="flex items-center gap-2">
            <Activity className="w-5 h-5 text-emerald-400" />
            <h3 className="text-base font-bold text-white tracking-tight flex items-center gap-2">
              <span>Modern Portfolio Theory (MVO) Efficient Frontier</span>
              <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded bg-emerald-950 text-emerald-300 border border-emerald-800 font-bold">
                SLSQP Quadratic Solver
              </span>
            </h3>
          </div>
          <p className="text-xs text-slate-400 mt-0.5">
            Mathematically maps the boundary of maximum yield achievable for every level of annualized portfolio volatility risk.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 text-xs">
            <label className="text-slate-400 font-medium">Risk Cap:</label>
            <select
              value={maxWeightCap}
              onChange={(e) => setMaxWeightCap(Number(e.target.value))}
              className="bg-slate-900 border border-slate-700 rounded px-2 py-1 text-white font-mono text-xs focus:outline-none focus:border-emerald-500"
            >
              <option value={0.20}>20% Cap</option>
              <option value={0.25}>25% Cap</option>
              <option value={0.30}>30% Cap</option>
              <option value={0.40}>40% Cap</option>
              <option value={0.50}>50% Cap</option>
            </select>
          </div>
        </div>
      </div>

      {appliedMessage && (
        <div className="p-2.5 bg-emerald-500/10 border border-emerald-500/30 rounded-lg flex items-center gap-2 text-xs text-emerald-300">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{appliedMessage}</span>
        </div>
      )}

      {/* SVG Canvas and Interactive Curve */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-center">
        <div className="lg:col-span-8 bg-[#090e1c] border border-slate-800 rounded-xl p-3 relative overflow-hidden">
          <svg viewBox={`0 0 ${svgWidth} ${svgHeight}`} className="w-full h-auto">
            {/* Grid lines */}
            {[0.25, 0.5, 0.75].map((pct) => {
              const yVal = minY + pct * (maxY - minY);
              const yPos = scaleY(yVal);
              return (
                <g key={pct}>
                  <line
                    x1={padding.left}
                    y1={yPos}
                    x2={svgWidth - padding.right}
                    y2={yPos}
                    stroke="#1e293b"
                    strokeDasharray="3 3"
                  />
                  <text
                    x={padding.left - 8}
                    y={yPos + 3}
                    textAnchor="end"
                    fill="#64748b"
                    fontSize="10"
                    fontFamily="monospace"
                  >
                    {yVal.toFixed(1)}%
                  </text>
                </g>
              );
            })}

            {/* X-axis labels */}
            {[0.2, 0.5, 0.8].map((pct) => {
              const xVal = minX + pct * (maxX - minX);
              const xPos = scaleX(xVal);
              return (
                <text
                  key={pct}
                  x={xPos}
                  y={svgHeight - 12}
                  textAnchor="middle"
                  fill="#64748b"
                  fontSize="10"
                  fontFamily="monospace"
                >
                  {xVal.toFixed(1)}% σ
                </text>
              );
            })}

            {/* Efficient Frontier Curve */}
            {pathD && (
              <path
                d={pathD}
                fill="none"
                stroke="#10b981"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            )}

            {/* Curve points */}
            {frontierPoints.map((p, idx) => {
              const cx = scaleX(p.portfolio_volatility);
              const cy = scaleY(p.target_yield);
              const isMinVol = p.is_min_volatility;
              const isSharpe = p.is_optimal_sharpe;

              return (
                <circle
                  key={idx}
                  cx={cx}
                  cy={cy}
                  r={isSharpe ? 6.5 : isMinVol ? 5.5 : 3.5}
                  fill={isSharpe ? "#38bdf8" : isMinVol ? "#10b981" : "#64748b"}
                  stroke="#0f172a"
                  strokeWidth="1.5"
                  className="cursor-pointer hover:r-7 transition-all"
                  onMouseEnter={() => setHoveredPoint(p)}
                />
              );
            })}

            {/* Current Portfolio Point Marker */}
            {currentMetrics && (
              <g>
                <circle
                  cx={scaleX(currentMetrics.portfolio_volatility)}
                  cy={scaleY(currentMetrics.target_yield)}
                  r="7"
                  fill="#f59e0b"
                  stroke="#ffffff"
                  strokeWidth="2"
                  className="cursor-pointer animate-pulse"
                  onMouseEnter={() => setHoveredPoint(currentMetrics as any)}
                />
                <text
                  x={scaleX(currentMetrics.portfolio_volatility) + 10}
                  y={scaleY(currentMetrics.target_yield) - 8}
                  fill="#fbbf24"
                  fontSize="11"
                  fontWeight="bold"
                >
                  Your Portfolio ({currentMetrics.target_yield.toFixed(1)}%)
                </text>
              </g>
            )}

            {/* Axis titles */}
            <text
              x={svgWidth / 2}
              y={svgHeight - 2}
              textAnchor="middle"
              fill="#94a3b8"
              fontSize="10"
              fontWeight="bold"
            >
              Annualized Portfolio Volatility Risk (σ)
            </text>
            <text
              x={-svgHeight / 2}
              y={14}
              textAnchor="middle"
              transform="rotate(-90)"
              fill="#94a3b8"
              fontSize="10"
              fontWeight="bold"
            >
              Distribution Yield (%)
            </text>
          </svg>
        </div>

        {/* Right Column: Key Frontier Portfolios */}
        <div className="lg:col-span-4 space-y-3">
          {/* Optimal Sharpe Point Card */}
          {maxSharpePoint && (
            <div className="p-3.5 rounded-xl bg-sky-950/40 border border-sky-800/80">
              <div className="flex items-center justify-between mb-1">
                <div className="flex items-center gap-1.5 text-sky-400 font-bold text-xs">
                  <Award className="w-4 h-4" />
                  <span>Optimal Sharpe Portfolio</span>
                </div>
                <span className="font-mono text-xs font-bold text-sky-300">
                  {maxSharpePoint.target_yield.toFixed(1)}% Yield
                </span>
              </div>
              <p className="text-[11px] text-slate-400">
                Highest income-per-unit-of-risk with {maxSharpePoint.portfolio_volatility.toFixed(1)}% volatility.
              </p>
              {onApplyWeights && (
                <button
                  onClick={() => handleApplyPoint(maxSharpePoint, "Optimal Sharpe")}
                  className="mt-2.5 w-full py-1 px-2.5 bg-sky-500 hover:bg-sky-400 text-slate-950 text-xs font-bold rounded-lg transition-colors cursor-pointer"
                >
                  Adopt Optimal Sharpe Weights
                </button>
              )}
            </div>
          )}

          {/* Min Volatility Point Card */}
          {minVolPoint && (
            <div className="p-3.5 rounded-xl bg-emerald-950/40 border border-emerald-800/80">
              <div className="flex items-center justify-between mb-1">
                <div className="flex items-center gap-1.5 text-emerald-400 font-bold text-xs">
                  <ShieldCheck className="w-4 h-4" />
                  <span>Minimum Volatility Portfolio</span>
                </div>
                <span className="font-mono text-xs font-bold text-emerald-300">
                  {minVolPoint.portfolio_volatility.toFixed(1)}% Vol
                </span>
              </div>
              <p className="text-[11px] text-slate-400">
                Lowest possible drawdowns with {minVolPoint.target_yield.toFixed(1)}% distribution yield.
              </p>
              {onApplyWeights && (
                <button
                  onClick={() => handleApplyPoint(minVolPoint, "Min Volatility")}
                  className="mt-2.5 w-full py-1 px-2.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-xs font-bold rounded-lg transition-colors cursor-pointer"
                >
                  Adopt Min-Var Weights
                </button>
              )}
            </div>
          )}

          {/* Hovered Point Inspector */}
          {hoveredPoint && (
            <div className="p-3 rounded-lg bg-slate-900 border border-slate-700 text-xs font-mono">
              <span className="text-[10px] text-slate-400 uppercase font-sans font-bold block mb-1">
                Selected Frontier Point
              </span>
              <div className="flex justify-between">
                <span className="text-slate-300">Yield:</span>
                <span className="text-white font-bold">{hoveredPoint.target_yield.toFixed(2)}%</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-300">Volatility (σ):</span>
                <span className="text-emerald-400 font-bold">{hoveredPoint.portfolio_volatility.toFixed(2)}%</span>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
