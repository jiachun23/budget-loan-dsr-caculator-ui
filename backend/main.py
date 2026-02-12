from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Optional
import math

app = FastAPI()

# Configure CORS for frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # In production, specify your frontend domain
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Pydantic models for request/response validation
class CalculateRequest(BaseModel):
    total_amount: float
    downpayment: float
    interest: float
    years: int
    monthly_budget: Optional[float] = None

class ExpenseItem(BaseModel):
    category: str
    name: str
    amount: float

class DSRRequest(BaseModel):
    monthly_instalment: float
    gross_income: float
    net_income: Optional[float] = None
    expenses: List[ExpenseItem]

class Suggestion(BaseModel):
    type: str
    message: str
    new_term: Optional[int] = None
    new_monthly_payment: Optional[float] = None
    additional_downpayment: Optional[float] = None
    new_downpayment: Optional[float] = None
    suggested_price: Optional[float] = None

class BudgetComparison(BaseModel):
    budget: float
    monthly_payment: float
    difference: float
    status: str
    suggestions: List[Suggestion]

class CalculateResponse(BaseModel):
    downpayment: float
    downpayment_percentage: float
    interest_rate: str
    loan_amount: float
    loan_period: str
    monthly_instalment: float
    budget_comparison: Optional[BudgetComparison] = None

class DSRResponse(BaseModel):
    total_monthly_debt: float
    dsr_percentage: float
    status: str
    recommendation: str
    expense_breakdown: dict

# Test endpoint
@app.get("/test")
async def test():
    return "ok"

# Calculate monthly instalment
def calculate_monthly_instalment(loan_amount: float, interest_rate: float, years: int) -> float:
    return (loan_amount * interest_rate * years + loan_amount) / (years * 12)

# Generate budget suggestions
def generate_budget_suggestions(
    total_amount: float,
    downpayment: float,
    interest: float,
    years: int,
    budget: float,
    current_monthly: float
) -> List[Suggestion]:
    suggestions = []
    loan_amount = total_amount - downpayment
    interest_rate = interest / 100
    
    # Suggestion 1: Extend loan term
    max_years = 35  # Maximum typical loan term
    for test_years in range(years + 1, max_years + 1):
        test_monthly = calculate_monthly_instalment(loan_amount, interest_rate, test_years)
        if test_monthly <= budget:
            suggestions.append(Suggestion(
                type="extend_term",
                message=f"Extend loan term to {test_years} years to meet your budget",
                new_term=test_years,
                new_monthly_payment=round(test_monthly, 2)
            ))
            break
    
    # Suggestion 2: Increase downpayment
    # Calculate required loan amount for budget
    # monthly = (loan * rate * years + loan) / (years * 12)
    # budget * years * 12 = loan * (rate * years + 1)
    # loan = budget * years * 12 / (rate * years + 1)
    required_loan = budget * years * 12 / (interest_rate * years + 1)
    additional_downpayment = loan_amount - required_loan
    
    if additional_downpayment > 0 and downpayment + additional_downpayment < total_amount:
        new_monthly = calculate_monthly_instalment(required_loan, interest_rate, years)
        suggestions.append(Suggestion(
            type="increase_downpayment",
            message=f"Increase downpayment by RM {additional_downpayment:,.2f} to meet your budget",
            additional_downpayment=round(additional_downpayment, 2),
            new_downpayment=round(downpayment + additional_downpayment, 2),
            new_monthly_payment=round(new_monthly, 2)
        ))
    
    # Suggestion 3: Reduce property price
    # Keep same downpayment percentage
    downpayment_percent = downpayment / total_amount
    required_total = required_loan / (1 - downpayment_percent)
    
    if required_total > 0 and required_total < total_amount:
        new_loan = required_total - (required_total * downpayment_percent)
        new_monthly = calculate_monthly_instalment(new_loan, interest_rate, years)
        suggestions.append(Suggestion(
            type="reduce_price",
            message=f"Consider a property priced at RM {required_total:,.2f} to meet your budget",
            suggested_price=round(required_total, 2),
            new_monthly_payment=round(new_monthly, 2)
        ))
    
    return suggestions

# Endpoint to perform loan calculation
@app.post("/calculate", response_model=CalculateResponse)
async def calculate(data: CalculateRequest):
    downpayment_percent = (data.downpayment / data.total_amount) * 100
    interest_rate = data.interest / 100
    loan_amount = data.total_amount - data.downpayment
    years = data.years

    monthly_instalment = calculate_monthly_instalment(loan_amount, interest_rate, years)

    response = CalculateResponse(
        downpayment=round(data.downpayment, 2),
        downpayment_percentage=round(downpayment_percent, 2),
        interest_rate=f"{data.interest} %",
        loan_amount=round(loan_amount, 2),
        loan_period=f"{years} years",
        monthly_instalment=round(monthly_instalment, 2)
    )

    # Add budget comparison if budget is provided
    if data.monthly_budget is not None and data.monthly_budget > 0:
        difference = data.monthly_budget - monthly_instalment
        status = "Within Budget" if difference >= 0 else "Over Budget"
        
        suggestions = []
        if difference < 0:
            suggestions = generate_budget_suggestions(
                data.total_amount,
                data.downpayment,
                data.interest,
                data.years,
                data.monthly_budget,
                monthly_instalment
            )
        
        response.budget_comparison = BudgetComparison(
            budget=data.monthly_budget,
            monthly_payment=round(monthly_instalment, 2),
            difference=round(difference, 2),
            status=status,
            suggestions=suggestions
        )

    return response

# Endpoint to calculate DSR
@app.post("/dsr", response_model=DSRResponse)
async def calculate_dsr(data: DSRRequest):
    # Calculate total expenses
    total_expenses = sum(expense.amount for expense in data.expenses)
    
    # Total monthly debt includes loan instalment + other expenses
    total_monthly_debt = data.monthly_instalment + total_expenses
    
    # Calculate DSR percentage
    dsr_percentage = (total_monthly_debt / data.gross_income) * 100
    
    # Determine status based on DSR thresholds
    if dsr_percentage <= 30:
        status = "Healthy"
        recommendation = "Your debt service ratio is healthy. You have good capacity for additional borrowing if needed."
    elif dsr_percentage <= 50:
        status = "Medium"
        recommendation = "Your DSR is moderate. Consider maintaining current debt levels and building an emergency fund."
    elif dsr_percentage <= 70:
        status = "Caution"
        recommendation = "Your DSR is high. Consider reducing expenses, increasing downpayment, or extending loan terms to lower monthly commitments."
    else:
        status = "High Risk"
        recommendation = "Your DSR is very high. You may face difficulties getting loan approval. Consider a lower-priced property, higher downpayment, or reducing existing debts."
    
    # Create expense breakdown for pie chart
    expense_breakdown = {}
    for expense in data.expenses:
        category = expense.category
        if category in expense_breakdown:
            expense_breakdown[category] += expense.amount
        else:
            expense_breakdown[category] = expense.amount
    
    # Add loan instalment to breakdown
    expense_breakdown["Loan Instalment"] = data.monthly_instalment
    
    return DSRResponse(
        total_monthly_debt=round(total_monthly_debt, 2),
        dsr_percentage=round(dsr_percentage, 2),
        status=status,
        recommendation=recommendation,
        expense_breakdown=expense_breakdown
    )
