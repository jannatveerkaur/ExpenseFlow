
from collections import defaultdict
from datetime import date

import numpy as np
import pandas as pd

from services import read_data


def get_monthly_summary():
    """Return total spending grouped by month (YYYY-MM)."""
    data = read_data()
    monthly_totals = defaultdict(float)

    for expense in data.get("expenses", []):
        try:
            expense_date = date.fromisoformat(expense["date"])
            amount = float(expense["amount"])
        except (ValueError, TypeError, KeyError):
            continue

        month = expense_date.strftime("%Y-%m")
        monthly_totals[month] += amount

    return {
        month: round(total, 2)
        for month, total in sorted(monthly_totals.items())
    }


def get_category_summary():
    """Return total spending grouped by category using Pandas."""
    data = read_data()
    expenses = data.get("expenses", [])

    if not expenses:
        return {}

    df = pd.DataFrame(expenses)
    df["amount"] = pd.to_numeric(df["amount"], errors="coerce")
    df = df.dropna(subset=["amount"])
    df["category"] = df["category"].fillna("Others")

    totals = df.groupby("category")["amount"].sum()

    return {
        category: round(float(total), 2)
        for category, total in sorted(totals.items())
    }


def get_expense_statistics():
    """Return overall expense statistics using NumPy and Pandas."""
    data = read_data()
    expenses = data.get("expenses", [])

    if not expenses:
        return {
            "total": 0,
            "average": 0,
            "highest": 0,
            "highest_expense": None,
            "count": 0,
        }

    df = pd.DataFrame(expenses)
    df["amount"] = pd.to_numeric(df["amount"], errors="coerce")
    df = df.dropna(subset=["amount"])

    if df.empty:
        return {
            "total": 0,
            "average": 0,
            "highest": 0,
            "highest_expense": None,
            "count": 0,
        }

    amounts = df["amount"].to_numpy(dtype=float)

    highest_index = int(np.argmax(amounts))
    highest_expense = df.iloc[highest_index].to_dict()

    total = float(np.sum(amounts))
    average = float(np.mean(amounts))
    highest = float(np.max(amounts))

    return {
        "total": round(total, 2),
        "average": round(average, 2),
        "highest": round(highest, 2),
        "highest_expense": highest_expense,
        "count": len(amounts),
    }

