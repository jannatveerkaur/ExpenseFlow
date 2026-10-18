
import csv
import io
from datetime import date
from typing import Literal

from fastapi import FastAPI, HTTPException, Query
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import StreamingResponse

from models import (
    FundRequest,
    ExpenseCreate,
    ExpenseUpdate,
)

from services import (
    read_data,
    write_data,
    create_expense,
    get_all_expenses,
    get_expense_by_id,
    update_expense,
    delete_expense,
)

from analytics import (
    get_monthly_summary,
    get_category_summary,
    get_expense_statistics,
)


# =========================
# FASTAPI APP
# =========================

app = FastAPI(
    title="ExpenseFlow API",
    description=(
        "Personal Expense Management System API "
        "with CRUD, analytics, filtering, pagination, "
        "sorting, and CSV export."
    ),
    version="1.0.0",
)


# =========================
# CORS
# =========================

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://127.0.0.1:5173",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# =========================
# COMMON REPORT ERROR HANDLER
# =========================

def run_report(report_function, report_name: str):
    try:
        return report_function()
    except (ValueError, OSError, csv.Error) as exc:
        raise HTTPException(
            status_code=500,
            detail=f"Unable to generate {report_name}: {exc}",
        ) from exc


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

    data["funds"] = float(data.get("funds", 0)) + float(
        request.amount
    )

    write_data(data)

    return {
        "message": "Funds added successfully",
        "total_funds": data["funds"],
    }


# =========================
# DASHBOARD
# =========================

@app.get("/dashboard")
def get_dashboard():
    data = read_data()

    total_funds = float(data.get("funds", 0))

    total_expenses = sum(
        float(expense["amount"])
        for expense in data["expenses"]
    )

    remaining_balance = total_funds - total_expenses

    return {
        "total_funds": round(total_funds, 2),
        "total_expenses": round(total_expenses, 2),
        "remaining_balance": round(remaining_balance, 2),
        "total_transactions": len(data["expenses"]),
    }


# =========================
# CREATE EXPENSE
# =========================

@app.post("/expenses")
def add_expense(expense: ExpenseCreate):
    return create_expense(expense.model_dump())


# =========================
# GET ALL EXPENSES
# FILTERING, PAGINATION, SORTING
# =========================

@app.get("/expenses")
def get_expenses(
    start_date: date | None = Query(
        default=None,
        description="Filter expenses from this date (YYYY-MM-DD)",
    ),
    end_date: date | None = Query(
        default=None,
        description="Filter expenses until this date (YYYY-MM-DD)",
    ),
    category: str | None = Query(
        default=None,
        description="Filter by expense category",
    ),
    limit: int = Query(default=10, ge=1, le=100),
    offset: int = Query(default=0, ge=0),
    sort_by: Literal["date", "amount", "name"] = Query(
        default="date"
    ),
    order: Literal["asc", "desc"] = Query(default="desc"),
):
    expenses = get_all_expenses()

    if start_date and end_date and start_date > end_date:
        raise HTTPException(
            status_code=400,
            detail="start_date cannot be after end_date",
        )

    if start_date:
        expenses = [
            expense for expense in expenses
            if date.fromisoformat(expense["date"]) >= start_date
        ]

    if end_date:
        expenses = [
            expense for expense in expenses
            if date.fromisoformat(expense["date"]) <= end_date
        ]

    if category:
        selected_category = category.strip().lower()
        expenses = [
            expense for expense in expenses
            if expense.get("category", "").strip().lower()
            == selected_category
        ]

    reverse = order == "desc"

    if sort_by == "date":
        expenses.sort(
            key=lambda expense: expense.get("date", ""),
            reverse=reverse,
        )
    elif sort_by == "amount":
        expenses.sort(
            key=lambda expense: float(expense["amount"]),
            reverse=reverse,
        )
    else:
        expenses.sort(
            key=lambda expense: expense.get("name", "").lower(),
            reverse=reverse,
        )

    total = len(expenses)
    paginated_expenses = expenses[offset:offset + limit]

    return {
        "total": total,
        "limit": limit,
        "offset": offset,
        "expenses": paginated_expenses,
    }


# =========================
# GET SINGLE EXPENSE
# =========================

@app.get("/expenses/{expense_id}")
def get_single_expense(expense_id: str):
    expense = get_expense_by_id(expense_id)

    if expense is None:
        raise HTTPException(
            status_code=404,
            detail="Expense not found.",
        )

    return expense


# =========================
# UPDATE EXPENSE
# =========================

@app.put("/expenses/{expense_id}")
def edit_expense(
    expense_id: str,
    expense: ExpenseUpdate,
):
    updated_expense = update_expense(
        expense_id,
        expense.model_dump(),
    )

    if updated_expense is None:
        raise HTTPException(
            status_code=404,
            detail="Expense not found.",
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
            detail="Expense not found.",
        )

    return {
        "message": "Expense deleted successfully."
    }


# =========================
# ANALYTICS: MONTHLY REPORT
# =========================

@app.get("/reports/monthly")
def monthly_report():
    return run_report(
        get_monthly_summary,
        "monthly report",
    )


# =========================
# ANALYTICS: CATEGORY REPORT
# =========================

@app.get("/reports/category")
def category_report():
    return run_report(
        get_category_summary,
        "category report",
    )


# =========================
# ANALYTICS: OVERALL STATISTICS
# =========================

@app.get("/reports/statistics")
def expense_statistics():
    return run_report(
        get_expense_statistics,
        "expense statistics",
    )


# =========================
# EXPORT EXPENSES AS CSV
# =========================

@app.get("/reports/export")
def export_expenses():
    try:
        expenses = get_all_expenses()

        output = io.StringIO()

        fieldnames = [
            "id",
            "name",
            "amount",
            "category",
            "date",
            "payment_method",
            "description",
        ]

        writer = csv.DictWriter(
            output,
            fieldnames=fieldnames,
            extrasaction="ignore",
        )

        writer.writeheader()
        writer.writerows(expenses)
        output.seek(0)

        return StreamingResponse(
            iter([output.getvalue()]),
            media_type="text/csv",
            headers={
                "Content-Disposition": (
                    'attachment; filename="expense_report.csv"'
                )
            },
        )
    except (ValueError, OSError, csv.Error) as exc:
        raise HTTPException(
            status_code=500,
            detail=f"Unable to export expenses: {exc}",
        ) from exc

