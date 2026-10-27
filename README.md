# DebtShield 🛡️
> Production-Ready, Modular Multi-Debt Avalanche/Snowball Waterfall & Refinancing Simulator

DebtShield is an ultra-clean, deterministic financial engineering application designed to model multi-liability repayment schedules, contrast mathematical vs. behavioral payoff algorithms (Avalanche vs. Snowball), identify predatory negative-amortization debt traps, and evaluate fixed-rate consolidation loans.

Refactored into a modular multi-route architecture powered by **React Router v6** and **React Context**, DebtShield delivers zero-latency client calculations, local state persistence, and an Express REST API deployable to **Vercel** serverless functions.

---

## 🌟 Architecture & Pages

- **Dashboard (`/`)**:
  - 4 Key Metric Cards: Total Balance, Monthly Commitments, Total Interest Saved (Avalanche), Payoff Time Saved.
  - Payoff trajectory area chart preview.
  - Active liabilities overview and quick-navigation links.
- **My Debts (`/debts`)**:
  - Dedicated portfolio management workspace.
  - Add/Edit modal dialog with real-time interest charge and negative amortization debt trap warnings.
  - Action bar with demo data loader and reset functionality.
- **Payoff Strategies (`/strategies`)**:
  - Interactive extra monthly payment budget slider (₹0 to ₹50,000 / $0 to $1,000).
  - Side-by-side strategy comparison cards: **Avalanche (Interest-First, Optimal)** vs. **Snowball (Balance-First, Behavioral)**.
  - Multi-line Recharts comparison chart (Avalanche `#10B981`, Snowball `#0EA5E9`, Baseline `#F43F5E`).
  - Full month-by-month amortization schedule table with pagination, search filter, and CSV download.
- **Refinance (`/refinance`)**:
  - Personal loan consolidation simulator.
  - Interactive proposed APR %, duration (12, 24, 36, 48, 60 months), and origination fee % sliders.
  - Comparative metrics (new monthly payment, net interest difference, fee break-even timeline).
  - *"Is Refinancing Worth It?"* recommendation status badge and expandable consolidation amortization schedule.

---

## 📁 Repository Structure

```
debt-shield/
├── vercel.json                           # Vercel monorepo serverless deployment config
├── README.md                             # Architectural and operational documentation
├── .gitignore
├── backend/
│   ├── .env.example                      # Backend environment template
│   ├── package.json
│   ├── api/
│   │   └── index.js                      # Vercel Serverless Function entry point & local server
│   └── src/
│       ├── app.js                        # Express app with security headers & global error handler
│       ├── controllers/
│       │   └── debtController.js         # API handlers for /health, /simulate, and /refinance
│       ├── routes/
│       │   └── debtRoutes.js             # express-validator schemas
│       ├── middleware/
│       │   └── errorHandler.js           # Structured JSON error responses
│       └── utils/
│           └── debtEngine.js             # Deterministic calculation engine
└── frontend/
    ├── .env.example                      # Frontend environment variable configuration
    ├── package.json                      # React 18, React Router v6, Tailwind CSS, Recharts, Lucide
    ├── vite.config.js                    # Vite configuration with proxy and vendor chunking
    ├── tailwind.config.js                # Custom Slate/Emerald color palette
    ├── index.html
    └── src/
        ├── main.jsx                      # App bootstrap
        ├── App.jsx                       # Master router & layout container
        ├── index.css
        ├── context/
        │   └── DebtContext.jsx           # Global state synced with localStorage
        ├── pages/
        │   ├── DashboardPage.jsx         # Metric summary & quick overview
        │   ├── DebtsPage.jsx             # Portfolio builder & debt cards
        │   ├── StrategiesPage.jsx        # Strategy cards, budget slider & charts
        │   └── RefinancePage.jsx         # Consolidation loan matrix & recommendations
        ├── components/
        │   ├── Navbar.jsx                # Responsive navbar with currency toggle & actions
        │   ├── DebtInputModal.jsx        # Modal for adding/editing debts with validation
        │   ├── DebtCardRow.jsx           # High-density debt row with trap indicator
        │   ├── StrategyComparisonCards.jsx # Head-to-head comparison cards
        │   ├── PayoffChart.jsx           # Recharts timeline with strategy toggles
        │   ├── ScheduleTable.jsx         # Paginated monthly schedule with search & CSV export
        │   └── UI/
        │       ├── MetricCard.jsx        # Reusable metric card
        │       ├── Toast.jsx             # Notification toasts
        │       └── EmptyState.jsx        # Empty state prompt
        ├── utils/
        │   ├── debtEngine.js             # Deterministic calculation routines (ESM)
        │   └── exportUtils.js            # CSV and JSON exporters
        └── services/
            └── api.js                    # Axios client with fallback
```

---

## 🧮 Mathematical Simulation Specifications

1. **Avalanche Payoff (Interest-First)**:
   - Sorts debts by highest APR (%) descending (tie-break: lowest balance).
   - Accrues monthly interest per debt:
     $$\text{Interest} = \text{Balance} \times \left(\frac{\text{APR}}{1200}\right)$$
   - Pays mandatory minimum payments first across all active accounts.
   - Channels extra monthly payment and freed-up minimum payments of retired debts directly to the top priority debt.

2. **Snowball Payoff (Balance-First)**:
   - Sorts debts by lowest remaining balance ascending (tie-break: highest APR).
   - Accelerates cash flow towards smallest accounts to generate psychological wins.

3. **Negative Amortization (Debt Trap Detection)**:
   - Evaluates if $\text{MinPayment} \le \text{MonthlyInterest}$.
   - Flags accounts where principal will continue to increase without extra allocations.

4. **Refinancing Loan Amortization**:
   - Closed-form monthly payment formula:
     $$M = P \cdot \frac{r(1+r)^n}{(1+r)^n - 1}$$
     where $P = \text{Total Balance} \times (1 + \text{Fee}\%)$, $r = \frac{\text{APR}}{1200}$, and $n = \text{Months}$.
   - Computes net savings against current waterfall plan and break-even duration.

---

## 🚀 Running Locally

### Backend
```bash
cd backend
npm install
npm start
# API available at http://localhost:5000
```

### Frontend
```bash
cd frontend
npm install
npm run dev
# SPA available at http://localhost:5173
```

---

## ☁️ Vercel Deployment

Deploy directly using the Vercel CLI or Git integration:
```bash
vercel
```
`vercel.json` automatically routes `/api/(.*)` to `backend/api/index.js` and serves the React SPA from `frontend/dist`.

## Live Demo Link
https://drive.google.com/drive/folders/1caMPdtR0s7ye61W1Eo0sCyoEQBkp-PBw?usp=sharing
