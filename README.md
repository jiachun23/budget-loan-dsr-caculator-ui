# Loan Calculator & DSR App

A full-stack web application for calculating loan payments and assessing Debt Service Ratio (DSR).

## Features

### Loan Calculator
- Calculate monthly instalment based on property/car price, downpayment, interest rate, and loan period
- Optional budget comparison feature
- Smart suggestions when over budget (extend term, increase downpayment, reduce price)

### DSR Calculator
- Calculate Debt Service Ratio based on income and expenses
- Dynamic expense list with categories
- Pie chart visualization of expense breakdown
- Status indicators: Healthy, Medium, Caution, High Risk

## Tech Stack

- **Frontend**: SvelteKit + TypeScript + TailwindCSS + Chart.js
- **Backend**: FastAPI + Python 3.11
- **Deployment**: Vercel (monorepo)

## Project Structure

```
loan-calc/
├── frontend/           # SvelteKit application
│   ├── src/
│   │   ├── lib/
│   │   │   ├── components/
│   │   │   ├── services/
│   │   │   └── utils/
│   │   └── routes/
│   └── ...
├── backend/            # FastAPI application
│   ├── main.py
│   ├── requirements.txt
│   └── vercel.json
└── vercel.json         # Root deployment config
```

## Local Development

### Prerequisites
- Node.js 18+
- Python 3.11+
- npm or yarn

### Setup Backend

```bash
cd backend
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
pip install -r requirements.txt
uvicorn main:app --reload --port 8000
```

### Setup Frontend

```bash
cd frontend
npm install
npm run dev
```

The frontend will run on `http://localhost:5173` and will proxy API requests to the backend.

## Deploy to Vercel

### Option 1: Vercel CLI

1. Install Vercel CLI:
   ```bash
   npm install -g vercel
   ```

2. Login to Vercel:
   ```bash
   vercel login
   ```

3. Deploy:
   ```bash
   vercel
   ```

### Option 2: GitHub Integration

1. Push this repository to GitHub
2. Go to [vercel.com](https://vercel.com) and import your repository
3. Vercel will automatically detect the monorepo structure and deploy both frontend and backend

## API Endpoints

### POST /api/calculate
Calculate loan instalment and optional budget comparison.

**Request:**
```json
{
  "total_amount": 500000,
  "downpayment": 100000,
  "interest": 3.5,
  "years": 30,
  "monthly_budget": 1500
}
```

### POST /api/dsr
Calculate Debt Service Ratio.

**Request:**
```json
{
  "monthly_instalment": 1944.44,
  "gross_income": 8000,
  "expenses": [
    {"category": "Housing", "name": "Rent", "amount": 1500}
  ]
}
```

## DSR Thresholds

| Status | DSR Range |
|--------|-----------|
| Healthy | ≤ 30% |
| Medium | 30% - 50% |
| Caution | 50% - 70% |
| High Risk | > 70% |

## License

MIT
