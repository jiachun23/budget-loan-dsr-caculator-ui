# CLAUDE.md

Guidance for working in this repository.

## What this is

A **Loan & DSR Calculator** web app. It computes loan monthly instalments
(property = amortized, car = flat-rate), optional budget comparisons with
suggestions, and the Debt Service Ratio (DSR) from income and expenses.

The app is **100% client-side**. There is no backend or server — all
calculations run in the browser. (It previously had a Python/FastAPI backend;
that logic was ported to TypeScript and now lives in the frontend.)

## Tech stack

- **SvelteKit 2** with **Svelte 5 runes** (`$state`, `$derived`, `$effect`, `$props`)
- **TypeScript**
- **TailwindCSS 3**
- **Chart.js** (expense pie chart)
- **@sveltejs/adapter-static** — prerendered to a static site (SSR disabled)

## Project structure

```
loan-calc/
├── CLAUDE.md
├── README.md
└── frontend/                      # the entire app
    ├── svelte.config.js           # uses adapter-static, fallback: index.html
    ├── src/
    │   ├── app.html
    │   ├── app.css
    │   ├── routes/
    │   │   ├── +layout.ts         # prerender = true, ssr = false (SPA)
    │   │   ├── +layout.svelte
    │   │   └── +page.svelte        # tab UI: Loan + DSR
    │   └── lib/
    │       ├── components/
    │       │   ├── LoanCalculator.svelte
    │       │   ├── DSRCalculator.svelte
    │       │   ├── ExpenseItem.svelte
    │       │   └── PieChart.svelte
    │       ├── services/
    │       │   ├── api.ts           # public API: types + calculateLoan / calculateDSR
    │       │   └── calculations.ts  # the actual math (ported from old Python backend)
    │       └── utils/
    │           └── categories.ts    # expense categories + status colors
    └── build/                       # static build output (generated)
```

## How the calculations work

All logic is in [frontend/src/lib/services/calculations.ts](frontend/src/lib/services/calculations.ts):

- `calculate(req)` → loan instalment + optional budget comparison (replaces the
  old `POST /api/calculate`).
- `calculateDsr(req)` → DSR percentage, status, recommendation, expense
  breakdown (replaces the old `POST /api/dsr`).

[frontend/src/lib/services/api.ts](frontend/src/lib/services/api.ts) is a thin
façade that keeps the original interfaces and exposes **async** `calculateLoan`
and `calculateDSR` wrappers. The async signatures are intentional so existing
callers (`await calculateLoan(...)`) keep working without changes.

**Important:** the request/response field names use `snake_case`
(e.g. `total_amount`, `monthly_instalment`, `expense_breakdown`) — preserved
from the original API so the components did not need to change. Keep this
convention if you extend the types.

### Domain rules (don't change without intent)

- Property loans: amortized formula. Car loans: flat-rate formula.
- Max loan term for suggestions: property 35 years, car 9 years.
- DSR thresholds: Healthy ≤ 30%, Medium ≤ 50%, Caution ≤ 70%, else High Risk.
- The pie chart always includes a `"Loan Instalment"` slice on top of expenses.
- Monetary values are rounded to 2 decimals; currency is RM (MYR).

## Commands

Run everything from `frontend/`:

```bash
cd frontend
npm install
npm run dev        # local dev server (http://localhost:5173)
npm run build      # static build → frontend/build/
npm run preview    # serve the production build locally
```

There is no separate backend process to start.

## Deployment

The build output is fully static. Host `frontend/build/` on any static host
(Vercel, Netlify, GitHub Pages, S3, etc.). On Vercel, set the project **Root
Directory** to `frontend`; SvelteKit + adapter-static handles the rest.

## Conventions

- Use Svelte 5 runes, not legacy stores/reactive statements, for new component state.
- Keep pure calculation logic in `calculations.ts`; keep `api.ts` as the typed
  public surface. UI components should import from `api.ts`, not `calculations.ts`.
- Match the existing Tailwind utility-class style in components.
