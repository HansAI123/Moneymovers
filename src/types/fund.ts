export type AlertStatus = "GREEN" | "YELLOW" | "RED";

export type FundCategory =
  | "Broad Index Covered Call"
  | "Single Stock Covered Call"
  | "BDC"
  | "Preferred"
  | "Dividend Growth ETF";

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
  top_holdings?: HoldingStock[];
  sector_weights?: Record<string, number>;
  sec_19a_notice?: Sec19aNotice;
}

export interface HoldingStock {
  symbol: string;
  name: string;
  weight_pct: number;
  sector: string;
}

export interface Sec19aNotice {
  ticker: string;
  fund_name: string;
  filing_date: string;
  distribution_per_share: number;
  net_investment_income_pct: number;
  short_term_capital_gains_pct: number;
  long_term_capital_gains_pct: number;
  return_of_capital_pct: number;
  cumulative_roc_ytd_pct: number;
  is_destructive_roc: boolean;
  sec_form_reference: string;
  forensic_verdict: string;
  legal_disclaimer: string;
}

export interface OverlapConcentration {
  symbol: string;
  name: string;
  total_weight_pct: number;
  sector: string;
  contributing_funds: { ticker: string; fund_weight: number; effective_exposure: number }[];
}

export interface EfficientFrontierPoint {
  target_yield: number;
  portfolio_volatility: number;
  sharpe_ratio: number;
  weights: Record<string, number>;
  is_current_portfolio?: boolean;
  is_optimal_sharpe?: boolean;
  is_min_volatility?: boolean;
}

export interface BenchmarkMetrics {
  ticker: "SPY" | "QQQ";
  name: string;
  return_3m_pct: number;
  return_6m_pct: number;
  return_12m_pct: number;
  dividend_yield_pct: number;
}

export type WeightingStrategy =
  | "Equal Weighted"
  | "Vol / Risk-Capped"
  | "Target Yield Solver"
  | "MVO (Mean-Variance)";

export interface PortfolioHolding extends FundProfile {
  weight_pct: number;
  allocated_dollars: number;
  annual_income_dollars: number;
  is_excluded: boolean;
  after_tax_income_dollars?: number;
  effective_tax_drag_pct?: number;
  tax_treatment_label?: string;
}

export interface ProjectHolding {
  ticker: string;
  weight_pct: number;
  shares?: number;
  cost_basis?: number;
}

export interface ProjectWorkspace {
  id: string;
  userId: string;
  name: string;
  description: string;
  accountType: "taxable" | "traditional_ira" | "roth_ira";
  initialCapital: number;
  targetYieldPct: number;
  marginalTaxRatePct: number;
  createdAt: string;
  updatedAt: string;
  holdings: ProjectHolding[];
}
