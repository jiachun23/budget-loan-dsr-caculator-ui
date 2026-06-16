# Loan Calculator & DSR App

A web application for calculating loan payments and assessing Debt Service
Ratio (DSR). Runs **entirely in the browser** — no backend or server required.

## Features

### Loan Calculator
- Calculate monthly instalment based on property/car price, downpayment, interest rate, and loan period
- Property loans use the amortized formula; car loans use a flat-rate formula
- Optional budget comparison feature
- Smart suggestions when over budget (extend term, increase downpayment, reduce price)

### DSR Calculator
- Calculate Debt Service Ratio based on income and expenses
- Dynamic expense list with categories
- Pie chart visualization of expense breakdown
- Status indicators: Healthy, Medium, Caution, High Risk

## Tech Stack

- **Framework**: SvelteKit (Svelte 5) + TypeScript
- **Styling**: TailwindCSS
- **Charts**: Chart.js
- **Build**: `@sveltejs/adapter-static` (prerendered static site)

All calculation logic runs client-side in TypeScript
(`frontend/src/lib/services/calculations.ts`). This was previously a
Python/FastAPI backend and has been ported into the frontend.

## Project Structure

```
loan-calc/
├── CLAUDE.md
├── README.md
└── frontend/              # the entire SvelteKit application
    └── src/
        ├── routes/        # +page.svelte (UI), +layout.ts (prerender config)
        └── lib/
            ├── components/ # LoanCalculator, DSRCalculator, ExpenseItem, PieChart
            ├── services/   # api.ts (public API), calculations.ts (the math)
            └── utils/      # categories.ts
```

## Local Development

### Prerequisites
- Node.js 18+
- npm

### Setup

```bash
cd frontend
npm install
npm run dev
```

The app runs on `http://localhost:5173`.

## Build & Deploy

```bash
cd frontend
npm run build      # static output in frontend/build/
npm run preview    # preview the production build locally
```

The contents of `frontend/build/` can be hosted on any static host (Vercel,
Netlify, GitHub Pages, S3, etc.). On Vercel, set the project **Root Directory**
to `frontend`.

## DSR Thresholds

| Status    | DSR Range  |
|-----------|------------|
| Healthy   | ≤ 30%      |
| Medium    | 30% - 50%  |
| Caution   | 50% - 70%  |
| High Risk | > 70%      |

## License

MIT
