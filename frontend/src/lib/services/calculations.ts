/**
 * Loan & DSR calculation logic.
 *
 * Ported from the former Python/FastAPI backend (backend/main.py) so the app
 * runs entirely in the browser with no server round-trip. All monetary values
 * are in RM. Calculations are synchronous and side-effect free.
 */

import type {
  CalculateRequest,
  CalculateResponse,
  DSRRequest,
  DSRResponse,
  Suggestion,
} from './api';

const round2 = (value: number): number => Math.round(value * 100) / 100;

/** Format a number like Python's `f"{value:,.2f}"` (thousands separators, 2 dp). */
function formatMoney(value: number): string {
  return value.toLocaleString('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

/** Flat-rate monthly instalment (used for car loans). */
function calculateFlatRateInstalment(
  loanAmount: number,
  interestRate: number,
  years: number,
): number {
  return (loanAmount * interestRate * years + loanAmount) / (years * 12);
}

/** Amortized monthly instalment (used for property loans). */
function calculateAmortizedInstalment(
  loanAmount: number,
  interestRate: number,
  years: number,
): number {
  if (interestRate === 0) {
    return loanAmount / (years * 12);
  }

  const monthlyRate = interestRate / 12;
  const numPayments = years * 12;

  return (
    (loanAmount * monthlyRate * Math.pow(1 + monthlyRate, numPayments)) /
    (Math.pow(1 + monthlyRate, numPayments) - 1)
  );
}

/** Select the calculation method based on loan type. */
function calculateInstalment(
  loanAmount: number,
  interestRate: number,
  years: number,
  loanType: string = 'property',
): number {
  return loanType === 'car'
    ? calculateFlatRateInstalment(loanAmount, interestRate, years)
    : calculateAmortizedInstalment(loanAmount, interestRate, years);
}

/** Generate suggestions to bring the monthly payment within budget. */
function generateBudgetSuggestions(
  totalAmount: number,
  downpayment: number,
  interest: number,
  years: number,
  budget: number,
  loanType: string = 'property',
): Suggestion[] {
  const suggestions: Suggestion[] = [];
  const loanAmount = totalAmount - downpayment;
  const interestRate = interest / 100;

  // Suggestion 1: Extend loan term
  const maxYears = loanType === 'property' ? 35 : 9;
  for (let testYears = years + 1; testYears <= maxYears; testYears++) {
    const testMonthly = calculateInstalment(loanAmount, interestRate, testYears, loanType);
    if (testMonthly <= budget) {
      suggestions.push({
        type: 'extend_term',
        message: `Extend loan term to ${testYears} years to meet your budget`,
        new_term: testYears,
        new_monthly_payment: round2(testMonthly),
      });
      break;
    }
  }

  // Suggestion 2: Increase downpayment
  // Determine the loan amount whose instalment exactly meets the budget.
  let requiredLoan = 0;
  if (loanType === 'car') {
    // Reverse of the flat-rate formula.
    requiredLoan = (budget * years * 12) / (interestRate * years + 1);
  } else if (interestRate === 0) {
    requiredLoan = budget * years * 12;
  } else {
    // Reverse of the amortization formula.
    const monthlyRate = interestRate / 12;
    const numPayments = years * 12;
    requiredLoan =
      (budget * (Math.pow(1 + monthlyRate, numPayments) - 1)) /
      (monthlyRate * Math.pow(1 + monthlyRate, numPayments));
  }

  const additionalDownpayment = loanAmount - requiredLoan;

  if (additionalDownpayment > 0 && downpayment + additionalDownpayment < totalAmount) {
    const newMonthly = calculateInstalment(requiredLoan, interestRate, years, loanType);
    suggestions.push({
      type: 'increase_downpayment',
      message: `Increase downpayment by RM ${formatMoney(additionalDownpayment)} to meet your budget`,
      additional_downpayment: round2(additionalDownpayment),
      new_downpayment: round2(downpayment + additionalDownpayment),
      new_monthly_payment: round2(newMonthly),
    });
  }

  // Suggestion 3: Reduce property/car price (keep same downpayment percentage)
  const downpaymentPercent = downpayment / totalAmount;
  const requiredTotal = requiredLoan / (1 - downpaymentPercent);

  if (requiredTotal > 0 && requiredTotal < totalAmount) {
    const newLoan = requiredTotal - requiredTotal * downpaymentPercent;
    const newMonthly = calculateInstalment(newLoan, interestRate, years, loanType);
    suggestions.push({
      type: 'reduce_price',
      message: `Consider a property priced at RM ${formatMoney(requiredTotal)} to meet your budget`,
      suggested_price: round2(requiredTotal),
      new_monthly_payment: round2(newMonthly),
    });
  }

  return suggestions;
}

/** Perform the loan calculation (replaces POST /api/calculate). */
export function calculate(data: CalculateRequest): CalculateResponse {
  const loanType = data.loan_type ?? 'property';
  const downpaymentPercent = (data.downpayment / data.total_amount) * 100;
  const interestRate = data.interest / 100;
  const loanAmount = data.total_amount - data.downpayment;
  const years = data.years;

  const monthlyInstalment = calculateInstalment(loanAmount, interestRate, years, loanType);

  const response: CalculateResponse = {
    downpayment: round2(data.downpayment),
    downpayment_percentage: round2(downpaymentPercent),
    interest_rate: `${data.interest} %`,
    loan_amount: round2(loanAmount),
    loan_period: `${years} years`,
    monthly_instalment: round2(monthlyInstalment),
    loan_type: loanType,
  };

  if (data.monthly_budget != null && data.monthly_budget > 0) {
    const difference = data.monthly_budget - monthlyInstalment;
    const status = difference >= 0 ? 'Within Budget' : 'Over Budget';

    const suggestions =
      difference < 0
        ? generateBudgetSuggestions(
            data.total_amount,
            data.downpayment,
            data.interest,
            data.years,
            data.monthly_budget,
            loanType,
          )
        : [];

    response.budget_comparison = {
      budget: data.monthly_budget,
      monthly_payment: round2(monthlyInstalment),
      difference: round2(difference),
      status,
      suggestions,
    };
  }

  return response;
}

/** Calculate the Debt Service Ratio (replaces POST /api/dsr). */
export function calculateDsr(data: DSRRequest): DSRResponse {
  const totalExpenses = data.expenses.reduce((sum, e) => sum + e.amount, 0);
  const totalMonthlyDebt = data.monthly_instalment + totalExpenses;
  const dsrPercentage = (totalMonthlyDebt / data.gross_income) * 100;

  let status: string;
  let recommendation: string;
  if (dsrPercentage <= 30) {
    status = 'Healthy';
    recommendation =
      'Your debt service ratio is healthy. You have good capacity for additional borrowing if needed.';
  } else if (dsrPercentage <= 50) {
    status = 'Medium';
    recommendation =
      'Your DSR is moderate. Consider maintaining current debt levels and building an emergency fund.';
  } else if (dsrPercentage <= 70) {
    status = 'Caution';
    recommendation =
      'Your DSR is high. Consider reducing expenses, increasing downpayment, or extending loan terms to lower monthly commitments.';
  } else {
    status = 'High Risk';
    recommendation =
      'Your DSR is very high. You may face difficulties getting loan approval. Consider a lower-priced property, higher downpayment, or reducing existing debts.';
  }

  // Build expense breakdown for the pie chart, summing by category.
  const expenseBreakdown: Record<string, number> = {};
  for (const expense of data.expenses) {
    expenseBreakdown[expense.category] =
      (expenseBreakdown[expense.category] ?? 0) + expense.amount;
  }
  expenseBreakdown['Loan Instalment'] = data.monthly_instalment;

  return {
    total_monthly_debt: round2(totalMonthlyDebt),
    dsr_percentage: round2(dsrPercentage),
    status,
    recommendation,
    expense_breakdown: expenseBreakdown,
  };
}
