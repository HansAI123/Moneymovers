# Income ETF & Covered Call Evaluator

An executive wealth management evaluation dashboard and risk diagnostic engine designed to analyze high-yield covered call ETFs, BDCs, and income funds for destructive Return of Capital (ROC), net asset value (NAV) decay, and dividend sustainability.

## User Review & Critical Decisions

> [!IMPORTANT]
> The following architectural and UX specifications have been synthesized from the initial prompt and confirmed through Phase 1 user clarification:
> - **Preloaded Fund Suite**: Core covered call suite preloaded by default (`JEPI`, `JEPQ`, `XYLD`, `NVDY`), with comprehensive analysis across 3M, 6M, and 12M NAV windows, 12M total return, and benchmark comparisons.
> - **Core Analytical Scope**: Real-time ticker evaluator & search, benchmark comparison against `SPY` and `QQQ` (isolating market beta from destructive ROC), dividend safety/ROC scenario simulator, and one-click JSON data export conforming strictly to the requested analytical schema.
> - **Visual Direction**: Modern executive wealth management dashboard aesthetic (refined dark charcoal `#0B0F19` canvas, muted hairline dividers, tabular financial metrics, crisp alert indicators for GREEN/YELLOW/RED, zero clutter).
> - **Default Decision**: The evaluator includes rich historical distribution profiles, ROC categorization (favorable tax ROC vs destructive principal liquidation), and rule-based replacement candidate matching (e.g., swapping eroding single-stock options ETFs like NVDY into defensive index funds like JEPI/JEPQ or balanced equity income).

---

## 1. Overview & Core Concept

### What It Does
The **Income ETF & Covered Call Evaluator** provides financial advisors, institutional allocators, and retail dividend investors with an objective, quantitative diagnostic tool to determine whether high distribution yields (8% to 60%+) represent genuine income or destructive principal liquidation. It calculates 3-Month, 6-Month, and 12-Month NAV trends, benchmarks fund performance against underlying indices (`SPY` and `QQQ`), tags funds with strict alert ratings (`GREEN`, `YELLOW`, `RED`), provides actionable risk summaries, recommends viable replacement candidates, and emits production-ready JSON.

### Target Audience & Persona
- **Private Wealth & RIA Managers**: Needing transparent client-facing audit reports on whether clients' high-yield holdings are cannibalizing retirement capital.
- **Income & FIRE Investors**: Evaluating covered call vehicles (JPMorgan Hedged Equity, Global X, YieldMax, Defiance) for true cashflow sustainability.
- **Options & Derivatives Analysts**: Inspecting synthetic option strategy drag, upside capping, and downside participation asymmetry.

### Key Value Delivered
- **Unmasks "Yield Traps"**: Clear distinction between synthetic option upside capping with full downside capture vs. quality dividend cash flow.
- **Strict Analytical JSON Output**: Direct copy/export capability in the exact specified JSON format for programmatic ingestion or reporting.
- **Benchmark Decoupling**: Visual proof of whether a fund's NAV decline was caused by broad market declines or structural option erosion.

---

## 2. User Experience & Visual Design

### Key User Flows
1. **Executive Overview & Fleet Audit**: Upon landing, the user reviews a curated fleet of preloaded income vehicles (`JEPI`, `JEPQ`, `XYLD`, `NVDY`) displayed in an executive matrix showing 30-day distribution yield, NAV trajectory across 3M/6M/12M, 12M total return, destructive ROC classification, and alert status badges.
2. **Interactive Ticker Inspection & Custom Search**: The user can select any fund or search/enter any ticker (e.g., `TSLY`, `SVOL`, `SPYI`, `FEPI`, `MAIN`, `ARCC`) to trigger an immediate diagnostic evaluation complete with risk breakdown, benchmark divergence, and replacement candidates.
3. **Benchmark Divergence Analysis**: The user switches between `SPY` and `QQQ` benchmark overlays to inspect the delta between market price return and fund NAV change, highlighting destructive decay during market rallies.
4. **Interactive Dividend Safety & ROC Simulator**: The user adjusts simulated market performance and dividend payout scenarios to model 12-month capital preservation under different interest rate and volatility regimes.
5. **JSON Schema Export & Raw Inspector**: A dedicated split-pane modal/drawer lets users view, validate, and copy the strict JSON output structure for single tickers or the entire portfolio.

### Visual Identity & Theme
- **Aesthetic Direction**: High-trust executive wealth management console with crisp dark background, muted structural panels, and meticulous financial typography.
- **Color Palette**:
  - Neutral Canvas: Deep Obsidian / Charcoal (`#090D16` and `#0E1424`)
  - Structural Panels & Cards: Deep Slate (`#151C2F` with hairline border `#222F4C`)
  - Text & Hierarchy: Crisp Primary (`#F8FAFC`), Subdued Secondary (`#94A3B8`), Muted Captions (`#64748B`)
  - Status Indicators (Strictly text-paired):
    - `GREEN`: Emerald (`#10B981`) - Healthy NAV ($\ge -1.5\%$) and positive total return
    - `YELLOW`: Amber (`#F59E0B`) - Mild NAV erosion ($-1.5\%$ to $-3.0\%$) and payout cut risk
    - `RED`: Rose (`#F43F5E`) - Severe NAV erosion ($< -3.0\%$) or principal liquidation
  - Accent / Action: Precision Cyan / Cobalt (`#38BDF8` / `#2563EB`)
- **Typography**:
  - Brand & Headers: `Plus Jakarta Sans` for clean, confident display hierarchy.
  - Body & UI Controls: `DM Sans` for high legibility at dense viewport scales.
  - Metrics, Numbers & Tables: Strict tabular monospace (`font-mono tabular-nums`).
- **Layout Rhythm**: Strict 3-zone Top Bar Contract (Wordmark — 4 navigation links — Primary Action), executive KPI summary strip, 2-column diagnostic work area, and high-density responsive comparison grid.

---

## 3. Key Product Decisions & Trade-Offs

### Decision 1: Standardized Mathematical Model for NAV Erosion & ROC Flagging
- **Chosen Approach**: Evaluate NAV changes net of reinvested distributions to isolate pure capital trajectory over 3M, 6M, and 12M windows. If 12-Month NAV change is below $-3.0\%$ while the underlying benchmark is flat or positive, or if yield significantly exceeds net strategy returns, mark `is_destructive_roc: true` and status `RED`.
- **Why**: Many single-stock synthetic covered call ETFs advertise $50\%+$ yields while the underlying stock appreciates and the ETF NAV declines $25\%+$. Isolating NAV drag directly surfaces destructive capital return.
- **Alternatives Considered**: Relying solely on official Section 19(a) notices, which often classify accounting Return of Capital (ROC) identically for tax-deferred option premium vs. true capital liquidation.

### Decision 2: Dual Output Mode (Visual Dashboard + Production JSON)
- **Chosen Approach**: Maintain a dedicated JSON inspector and copy action accessible at both the individual card level and global fleet level, adhering 100% strictly to the requested schema.
- **Why**: Allows both intuitive executive visual review and seamless programmatic extraction.

### Decision 3: Client-Side Scenario Simulator with Deterministic Market Math
- **Chosen Approach**: Build an in-memory financial calculator that runs real-time dividend sustainability simulations without external server latency or rate limits, backed by verified historical distributions and benchmark beta profiles.
- **Why**: Instant interactive responsiveness when toggling between tickers and stress-testing market drops or volatility shocks.

---

## 4. Technical Architecture & Data Strategy

### Architecture & Component Diagram

```
┌────────────────────────────────────────────────────────────────────────┐
│                   Top Bar Navigation (3-Zone Contract)                 │
│  [Apex Wealth: Income Evaluator]   [Fleet | Audit | Simulator | JSON]  │
└────────────────────────────────────────────────────────────────────────┘
                                    │
                                    ▼
┌────────────────────────────────────────────────────────────────────────┐
│                Executive Fleet Summary Strip (KPI Ribbon)              │
│   Fleet Average Yield  ·  Erosion Risk Count  ·  Benchmark Delta SPY   │
└────────────────────────────────────────────────────────────────────────┘
                                    │
                                    ▼
┌──────────────────────────────────────┬─────────────────────────────────┐
│     Main Evaluator & Fund Matrix     │   Diagnostic Inspector Panel    │
│  - Filterable Fund Table (JEPI, etc) │  - NAV Trajectory 3M / 6M / 12M │
│  - Alert Status Badges (G / Y / R)   │  - Benchmark Divergence (SPY/QQQ│
│  - Quick Action to Inspect / JSON    │  - ROC Health & Capital Loss    │
│  - Ticker Search & Add Custom Fund   │  - Replacement Candidate Recs   │
└──────────────────────────────────────┴─────────────────────────────────┘
                                    │
                                    ▼
┌──────────────────────────────────────┬─────────────────────────────────┐
│   Dividend & ROC Stress Simulator    │     Strict JSON Output Panel    │
│  - Capital Preservation Slider       │  - Formatted JSON Preview       │
│  - Benchmark Volatility Shock Test   │  - Single / Full Fleet Selector │
│  - Sustainable Yield Threshold Calc  │  - One-Click Clipboard / Export │
└──────────────────────────────────────┴─────────────────────────────────┘
```

### Data Model & Schema Specification

```typescript
export interface FundAnalysisResult {
  ticker: string;
  fund_name: string;
  category: "Broad Index Covered Call" | "Single Stock Covered Call" | "BDC" | "Preferred";
  distribution_yield_pct: number;
  nav_change_3m_pct: number;
  nav_change_6m_pct: number;
  nav_change_12m_pct: number;
  total_return_12m_pct: number;
  is_destructive_roc: boolean;
  alert_status: "GREEN" | "YELLOW" | "RED";
  risk_summary: string;
  replacement_candidate: string;
  // Extended analytical metrics for deep-dive inspection
  underlying_benchmark: "SPY" | "QQQ" | "Russell 2000" | "Single Stock";
  benchmark_return_12m_pct: number;
  nav_erosion_drag_pct: number; // Delta vs benchmark
  distribution_frequency: "Monthly" | "Quarterly";
  aum_billions: number;
  expense_ratio_pct: number;
}
```

### Implementation Steps
1. **App Metadata & SEO Setup**: Configure `metadata.json` and `index.html` with accurate executive financial analyst titling, descriptions, and OpenGraph headers.
2. **Financial Data Engine (`src/data/fundsData.ts`)**: Construct comprehensive datasets for core covered call funds (`JEPI`, `JEPQ`, `XYLD`, `NVDY`, `TSLY`, `SPYI`, `SVOL`, `MAIN`), with historical NAV trajectories, benchmark divergences, dividend yields, ROC classifications, and replacement candidate pairings.
3. **Core Dashboard Components**:
   - `Navbar.tsx`: 3-zone contract with clean brand mark, navigation anchors, and export trigger.
   - `MetricRibbon.tsx`: High-level summary metrics with tabular formatting.
   - `FundMatrixTable.tsx`: Interactive table with sortable columns, alert badges, and row selection.
   - `FundDiagnosticCard.tsx`: Deep-dive view showing NAV decay across 3M/6M/12M, benchmark divergence chart, ROC breakdown, and replacement recommendation.
   - `BenchmarkComparison.tsx`: Relative performance comparison against SPY and QQQ.
   - `RocSimulator.tsx`: Interactive capital erosion and payout cut risk scenario modeller.
   - `JsonViewerModal.tsx`: Strictly formatted JSON generator with syntax highlighting and copy-to-clipboard.
4. **Verification & Testing**: Verify strict JSON compliance, test interactive state changes, and compile using `compile_applet`.
