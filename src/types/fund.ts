export type AlertStatus = "GREEN" | "YELLOW" | "RED";

export type FundCategory =
  | "Broad Index Covered Call"
  | "Single Stock Covered Call"
  | "BDC"
  | "Preferred";

/**
 * Strict JSON output schema specified by user
 */
export interface FundEvaluationOutput {
  ticker: string;
  fund_name: string;
  category: FundCategory;
  distribution_yield_pct: number;
  nav_change_3m_pct: number;
  nav_change_6m_pct: number;
  nav_change_12m_pct: number;
  total_return_12m_pct: number;
  is_destructive_roc: boolean;
  alert_status: AlertStatus;
  risk_summary: string;
  replacement_candidate: string;
}

export type DividendGrowthClassification =
  | "Growing"
  | "Stable"
  | "Stagnant"
  | "Declining"
  | "Insufficient History";

/**
 * Extended fund profile for deep-dive charting and analysis
 */
export interface FundProfile extends FundEvaluationOutput {
  id: string;
  description: string;
  current_nav: number;
  current_price: number;
  aum_billions: number;
  expense_ratio_pct: number;
  inception_year: number;
  distribution_frequency: "Monthly" | "Quarterly";
  underlying_benchmark: "SPY" | "QQQ" | "Single Stock" | "Russell 2000" | "US Aggregate";
  benchmark_return_12m_pct: number;
  nav_erosion_drag_pct: number; // Delta: Fund NAV change - Benchmark
  payout_history_stability: "Stable" | "Declining" | "Volatile" | "Growing";
  roc_composition_pct: number; // Percentage of recent distributions categorized as ROC
  is_tax_favorable_roc: boolean; // ROC for tax deferral (e.g. SPX Section 1256) vs destructive capital return
  dividend_cagr_3y_pct: number | null; // 3-Year Dividend Compound Annual Growth Rate (%)
  dividend_cagr_5y_pct: number | null; // 5-Year Dividend Compound Annual Growth Rate (%)
  dividend_growth_classification: DividendGrowthClassification;
  monthly_nav_history: {
    month: string;
    nav: number;
    distribution: number;
    benchmark_normalized: number;
  }[];
  structural_pros: string[];
  structural_cons: string[];
}

export interface BenchmarkMetrics {
  ticker: "SPY" | "QQQ";
  name: string;
  return_3m_pct: number;
  return_6m_pct: number;
  return_12m_pct: number;
  dividend_yield_pct: number;
}

export type WeightingStrategy = "Equal Weighted" | "Vol / Risk-Capped" | "Target Yield Solver";

export interface PortfolioHolding extends FundProfile {
  weight_pct: number;
  allocated_dollars: number;
  annual_income_dollars: number;
  is_excluded: boolean;
}
