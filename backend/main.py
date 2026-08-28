from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware

from models import (
    FundRequest,
    ExpenseCreate,
    ExpenseUpdate
)

from services import (
    read_data,
    write_data,
    create_expense,
    get_all_expenses,
    get_expense_by_id,
    update_expense,
    delete_expense
)


# =========================
# FASTAPI APP
# =========================

app = FastAPI(
    title="ExpenseFlow API",
    description="Personal Expense Management System API",
    version="1.0.0"
)


# =========================
# CORS
# =========================

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://127.0.0.1:5173"
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# =========================
# HOME
# =========================

@app.get("/")
def home():

    return {
        "message": "ExpenseFlow API is running"
    }


# =========================
# ADD FUNDS
# =========================

@app.post("/funds")
def add_funds(request: FundRequest):

    data = read_data()

    data["funds"] += request.amount

    write_data(data)

    return {
        "message": "Funds added successfully",
        "total_funds": data["funds"]
    }


# =========================
# DASHBOARD
# =========================

@app.get("/dashboard")
def get_dashboard():

    data = read_data()

    total_funds = data["funds"]

    total_expenses = sum(
        expense["amount"]
        for expense in data["expenses"]
    )

    remaining_balance = (
        total_funds - total_expenses
    )

    total_transactions = len(
        data["expenses"]
    )

    return {
        "total_funds": total_funds,
        "total_expenses": total_expenses,
        "remaining_balance": remaining_balance,
        "total_transactions": total_transactions
    }


# =========================
# CREATE EXPENSE
# =========================

@app.post("/expenses")
def add_expense(expense: ExpenseCreate):

    new_expense = create_expense(
        expense.model_dump()
    )

    return new_expense


# =========================
# GET ALL EXPENSES
# =========================

@app.get("/expenses")
def get_expenses():

    return get_all_expenses()


# =========================
# GET SINGLE EXPENSE
# =========================

@app.get("/expenses/{expense_id}")
def get_single_expense(expense_id: str):

    expense = get_expense_by_id(expense_id)

    if expense is None:

        raise HTTPException(
            status_code=404,
            detail="Expense not found."
        )

    return expense


# =========================
# UPDATE EXPENSE
# =========================

@app.put("/expenses/{expense_id}")
def edit_expense(
    expense_id: str,
    expense: ExpenseUpdate
):

    updated_expense = update_expense(
        expense_id,
        expense.model_dump()
    )

    if updated_expense is None:

        raise HTTPException(
            status_code=404,
            detail="Expense not found."
        )

    return updated_expense


# =========================
# DELETE EXPENSE
# =========================

@app.delete("/expenses/{expense_id}")
def remove_expense(expense_id: str):

    deleted = delete_expense(expense_id)

    if not deleted:

        raise HTTPException(
            status_code=404,
            detail="Expense not found."
        )

    return {
        "message": "Expense deleted successfully."
    }

