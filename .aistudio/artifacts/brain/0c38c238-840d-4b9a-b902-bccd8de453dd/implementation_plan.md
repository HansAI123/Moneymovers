# Multi-Portfolio Cloud Workspaces, Interactive Charting & Executive Wealth Intelligence

An institutional-grade upgrade to the Income ETF & Covered Call Evaluator providing secure Firebase authentication, persistent multi-project portfolio workspaces, interactive visual analytics (NAV decay trajectories, cash flow bar charts, risk/yield scatter plot), and exportable executive stress-test audit reports.

---

## User Review & Critical Decisions

> [!IMPORTANT]
> The following architectural and UX decisions were confirmed during the planning phase:

- **Authentication & Persistence**: Cloud synchronization powered by Firebase Authentication and Cloud Firestore, ensuring all project workspaces, custom asset weights, and simulation goals persist reliably across sessions and devices.
- **Multi-Project Workspace Model**: Independent project workspaces where each workspace has a dedicated investment mandate, target yield goal, tax jurisdiction settings, and asset basket (e.g., "Retirement Cash Flow IRA", "Aggressive Synthetic Yield Hub", "Defensive Capital Preservation").
- **Visual Analytics Suite**: Three interactive data visualizations embedded natively:
  1. *Historical NAV Trajectory & Divergence Curves* (multi-fund overlay vs. benchmark).
  2. *12-Month Forward Cash Flow Schedule* (monthly payout projection with ordinary vs. qualified vs. ROC breakdown).
  3. *Yield vs. NAV Erosion Risk Scatter Matrix* (visual risk frontier mapping green/yellow/red zones).
- **Premium Subscription Driver**: An Executive Risk Audit & Stress-Testing Suite delivering exportable print-ready PDF/Markdown audit reports, simulated macro shocks (Fed rate cuts, -20% equity drawdown, volatility spike), and automated dividend cut risk probability scoring.

---

## 1. Overview & Core Concept

### What It Does
The platform evolves from a single-session evaluation tool into a persistent, multi-project wealth operating system. Individual income investors, financial advisors, and wealth managers can sign in, create multiple distinct investment project workspaces, stress-test high-yield ETFs (covered call funds, synthetic option overlays, BDCs, CEFs), analyze historical return trajectories on interactive visual charts, and export executive-ready risk reports for compliance and client review.

### Target Audience & Persona
- **High-Yield Income & Covered Call Investors**: Allocating to funds like JEPI, JEPQ, SPYI, QQQY, CONY, or SVOL who need to avoid capital-eroding "yield traps".
- **Independent Registered Investment Advisors (RIAs) & Planners**: Managing distinct client portfolios with differing risk thresholds and tax brackets.
- **Fire / Dividend Growth Seekers**: Tracking sustainable monthly cash flows to replace salaried income.

### Key Value & Value Proposition for Subscriptions ($/month)
To convince users that a monthly subscription is well worth the investment:
1. **Capital Preservation Early Warning**: Identifies silent NAV decay before distribution cuts occur, saving users thousands of dollars in lost principal.
2. **Multi-Project Scenario Sandboxing**: Run side-by-side simulations of conservative vs. aggressive portfolios without losing configurations.
3. **Institutional Stress-Testing Engine**: Real-time simulation of market shock scenarios (-20% crash, rate changes, volatility expansion).
4. **Professional Audit Export**: 1-click generation of polished, executive-grade PDF/print investment audit reports with forensic analysis.

---

## 2. User Experience & Visual Design

### Key User Flows

```
┌─────────────────────────────────────────────────────────────────────────────────┐
│                              USER JOURNEY WORKFLOW                              │
└─────────────────────────────────────────────────────────────────────────────────┘
  1. Auth & Onboarding ──> 2. Workspace Hub ──────> 3. Portfolio Modeling
     • Email / Google         • Create Project         • Add/Weight Holdings
     • Guest Exploration      • Set Target Yield & Tax • Live NAV & Risk Badges
                              • Switch Workspaces      • Instant Sustainability Score
                                       │
                                       ▼
  6. Executive Audit <──── 5. Visual Analytics <─── 4. Tax & ROC Simulator
     • Stress-Test Shocks     • NAV Decay Overlay      • After-Tax Cash Flow
     • Dividend Cut Alerts    • Monthly Cash Flow Bars • Section 1256 Split
     • Exportable Audit PDF   • Risk/Yield Scatter     • ROC Basis Adjustments
```

1. **Authentication & Session Onboarding**:
   - Clean authentication modal with Email/Password and Google sign-in.
   - Smooth guest mode option allowing instant evaluation, with a top banner prompting users to save their project workspace to the cloud.
2. **Project Workspace Manager**:
   - Persistent dropdown switcher in the top navigation: select, create new, rename, or archive project workspaces.
   - Workspace metadata: Project Name, Description, Target Monthly Income, Tax Bracket, Investment Account Type (Taxable, Traditional IRA, Roth IRA).
   - Instant confirmation before deleting any project with zero accidental data loss.
3. **Interactive Visual Analytics View**:
   - **NAV Decay & Benchmark Divergence Chart**: Responsive SVG canvas with toggleable fund lines, time horizons (3M, 6M, 1Y), and hovering tooltip data points.
   - **Monthly Dividend Cash Flow Bar Graph**: Stacked monthly bar visualizer breaking down income into Qualified Dividends (green), Section 1256 60/40 (cyan), Ordinary Income (amber), and Return of Capital (emerald).
   - **Risk vs. Yield Scatter Plot**: Dynamic quadrant matrix mapping distribution yield (X-axis) against 12-month NAV change (Y-axis), with interactive hover inspect cards.
4. **Executive Audit & Stress-Test Suite**:
   - Scenario stress-test controls: Market Crash (-10%, -20%), Volatility Spike (VIX to 40), Tech Selloff (-15%), Yield Curve Inversion.
   - Diagnostic risk report generator: Formats executive summary, asset allocations, risk flags, tax liability forecast, and actionable fund replacements into a downloadable/printable report.

### Visual Identity & Theme
- **Theme**: Institutional terminal aesthetic built on Slate-950 (`#080c15`) background with dark slate container cards (`#0f172a`), refined 1px borders (`border-slate-800`), and typography-first information architecture.
- **Color Accents**:
  - Sky (`#38bdf8`): Primary action triggers, selected workspace highlights, benchmark comparisons.
  - Emerald (`#10b981`): Sustainable organic distributions, positive NAV trajectory, green status.
  - Amber (`#f59e0b`): ATM call capped upside, moderate erosion warning, yellow status.
  - Rose (`#f43f5e`): Destructive ROC flags, severe NAV decay (< -3.0%), red liquidation status.
- **Typography**: `Plus Jakarta Sans` for clean, confident headers and navigation; `JetBrains Mono` for tabular numerals (`tabular-nums`), prices, dividend percentages, and CAGR figures.

---

## 3. Key Product Decisions & Trade-Offs

### Decision 1: Firebase Auth & Firestore for State Persistence
- **Chosen Approach**: Provision Firebase via standard platform tools (`show_aistudio_ui` / `rpc_action`) with Firestore security rules restricting project reads and writes strictly to `request.auth.uid`.
- **Why**: Ensures cross-device persistence, real-time sync, zero data loss, and seamless cloud backups.
- **Fallback Support**: Includes an automatic offline/local caching bridge so users can prototype without signing in immediately, seamlessly merging local state to Firestore upon account creation.

### Decision 2: Project Workspaces vs. Flat Portfolio Lists
- **Chosen Approach**: Project workspaces encapsulate distinct simulation goals (e.g., Target Yield, Starting Capital, Marginal Tax Rate) alongside their asset basket.
- **Why**: High-net-worth investors treat different accounts differently (an IRA has 0% current tax drag, whereas a taxable brokerage account requires high Section 1256 and ROC efficiency).
- **Alternative Passed Over**: A single global fund list, which fails to support realistic multi-account tax modeling.

### Decision 3: Custom SVG & Responsive Canvas Charts vs. Heavy Chart Libraries
- **Chosen Approach**: Lightweight, high-performance responsive SVG charting components styled with Tailwind CSS tokens and interactive tooltips.
- **Why**: Zero external dependency bloat, guaranteed fast rendering, pixel-perfect dark theme harmony, full print/export compatibility, and zero layout shift.

---

## 4. Technical Architecture & Data Strategy

### System & Component Hierarchy

```
┌─────────────────────────────────────────────────────────────────────────────────┐
│                               SYSTEM ARCHITECTURE                               │
└─────────────────────────────────────────────────────────────────────────────────┘

                            ┌─────────────────────┐
                            │    Firebase Auth    │
                            │  (Email / Google)   │
                            └──────────┬──────────┘
                                       │
                                       ▼
 ┌───────────────────────────────────────────────────────────────────────────────┐
 │                            App State Orchestrator                             │
 │  • Current User & Auth State               • Active Project Workspace ID      │
 │  • Project Workspaces Collection           • Real-time Firestore Sync         │
 └───────┬───────────────────────────────────────────────────────────────┬───────┘
         │                                                               │
         ▼                                                               ▼
┌──────────────────┐                                           ┌──────────────────┐
│ Top Navbar       │                                           │ Main Workspace   │
│ • Workspace Drop │                                           │ Tabs Navigation  │
│ • New Project    │                                           └────────┬─────────┘
│ • Auth Profile   │                                                    │
└──────────────────┘                                                    │
         ┌───────────────────┬───────────────────┬──────────────────────┴────────┐
         ▼                   ▼                   ▼                               ▼
┌──────────────────┐┌──────────────────┐┌──────────────────┐┌───────────────────┐
│ Workspace View   ││ Visual Analytics ││ Fleet & Matrix   ││ Executive Audit   │
│ • Holdings Table ││ • NAV Decay SVG  ││ • Screener Grid  ││ • Stress Testing  │
│ • Weight Editor  ││ • Cash Flow Bars ││ • Diagnostics    ││ • Cut Risk Alert  │
│ • Yield Targets  ││ • Yield Scatter  ││ • Tax Simulator  ││ • Print/PDF Model │
└──────────────────┘└──────────────────┘└──────────────────┘└───────────────────┘
         │                                                               │
         ▼                                                               ▼
┌──────────────────────────────────────┐       ┌─────────────────────────────────┐
│ Firestore User Document Store        │       │ Express Server API Proxy        │
│ /users/{uid}/projects/{projectId}    │       │ /api/analyze-fund (Gemini)      │
└──────────────────────────────────────┘       └─────────────────────────────────┘
```

### Data Schema (Firestore Intermediate Representation)

```json
{
  "users": {
    "{userId}": {
      "profile": {
        "displayName": "Hans Tchepkou",
        "email": "HansTchepkou@gmail.com",
        "createdAt": "2026-10-19T05:00:00Z"
      },
      "projects": {
        "{projectId}": {
          "id": "proj_retirement_income",
          "name": "Retirement High-Yield IRA",
          "description": "Covered call cash flow with capital preservation",
          "targetYieldPct": 8.5,
          "initialCapital": 100000,
          "marginalTaxRatePct": 24,
          "accountType": "taxable",
          "updatedAt": "2026-10-19T05:22:00Z",
          "holdings": [
            { "ticker": "JEPI", "weightPct": 40, "shares": 680, "costBasis": 58.20 },
            { "ticker": "SPYI", "weightPct": 35, "shares": 720, "costBasis": 48.60 },
            { "ticker": "JEPQ", "weightPct": 25, "shares": 460, "costBasis": 54.10 }
          ]
        }
      }
    }
  }
}
```

### Security Rules Strategy (`firestore.rules`)
```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /users/{userId}/{document=**} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
  }
}
```

### Interactive State Transitions & Working Handlers
1. **Workspace Creation**: Click `"New Project"` -> Opens Project Setup Dialog -> Validates inputs (Name required, capital > 0) -> Adds to Firestore `users/{uid}/projects` -> Auto-switches active workspace.
2. **Holdings Management**: Users can add any ETF from the evaluated fleet or custom ticker, modify percentage weights or exact share counts, and see live recalculated metrics (blended yield, 12M weighted NAV change, after-tax net income).
3. **Interactive Charting**: Toggle between 3M, 6M, 1Y timeframes; hover crosshairs displaying precise date and percentage; responsive zoom/pan SVG coordinates.
4. **Stress Testing**: Slider-based and preset-based macroeconomic shock simulation with instant visual impact on portfolio value and projected cash distribution safety.
5. **Report Export**: Compiles verified project data, risk classifications, chart snapshots, and fund replacement recommendations into an executive print layout.
