/**
 * Public API for loan & DSR calculations.
 *
 * These functions used to call a remote Python/FastAPI backend over HTTP.
 * The logic now runs entirely in the browser (see ./calculations.ts), so no
 * network request or server is required. The async signatures are kept so
 * existing callers (`await calculateLoan(...)`) continue to work unchanged.
 */

import { calculate, calculateDsr } from './calculations';

export interface CalculateRequest {
  total_amount: number;
  downpayment: number;
  interest: number;
  years: number;
  loan_type: 'car' | 'property';
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
  loan_type: string;
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
  return calculate(data);
}

export async function calculateDSR(data: DSRRequest): Promise<DSRResponse> {
  return calculateDsr(data);
}
