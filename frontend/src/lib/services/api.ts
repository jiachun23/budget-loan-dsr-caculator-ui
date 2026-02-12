const API_BASE = import.meta.env.VITE_API_URL || '/api';

export interface CalculateRequest {
  total_amount: number;
  downpayment: number;
  interest: number;
  years: number;
  monthly_budget?: number;
}

export interface Suggestion {
  type: string;
  message: string;
  new_term?: number;
  new_monthly_payment?: number;
  additional_downpayment?: number;
  new_downpayment?: number;
  suggested_price?: number;
}

export interface BudgetComparison {
  budget: number;
  monthly_payment: number;
  difference: number;
  status: string;
  suggestions: Suggestion[];
}

export interface CalculateResponse {
  downpayment: number;
  downpayment_percentage: number;
  interest_rate: string;
  loan_amount: number;
  loan_period: string;
  monthly_instalment: number;
  budget_comparison?: BudgetComparison;
}

export interface ExpenseItem {
  category: string;
  name: string;
  amount: number;
}

export interface DSRRequest {
  monthly_instalment: number;
  gross_income: number;
  net_income?: number;
  expenses: ExpenseItem[];
}

export interface DSRResponse {
  total_monthly_debt: number;
  dsr_percentage: number;
  status: string;
  recommendation: string;
  expense_breakdown: Record<string, number>;
}

export async function calculateLoan(data: CalculateRequest): Promise<CalculateResponse> {
  const response = await fetch(`${API_BASE}/calculate`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }

  return response.json();
}

export async function calculateDSR(data: DSRRequest): Promise<DSRResponse> {
  const response = await fetch(`${API_BASE}/dsr`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }

  return response.json();
}
