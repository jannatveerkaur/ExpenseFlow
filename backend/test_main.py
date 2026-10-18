
import csv
import json

import pytest
from fastapi.testclient import TestClient

import services
from main import app


@pytest.fixture
def client(tmp_path, monkeypatch):
    """Use temporary files so tests do not modify real project data."""

    data_dir = tmp_path / "data"
    data_dir.mkdir()

    expenses_file = data_dir / "expenses.csv"
    funds_file = data_dir / "funds.json"
    data_file = data_dir / "data.json"

    expenses_file.write_text(
        "id,name,amount,category,date,payment_method,description\n",
        encoding="utf-8",
    )
    funds_file.write_text("1000", encoding="utf-8")
    data_file.write_text(
        json.dumps({"expenses": [], "funds": 1000}),
        encoding="utf-8",
    )

    monkeypatch.setattr(services, "DATA_DIR", data_dir)
    monkeypatch.setattr(services, "EXPENSES_FILE", expenses_file)
    monkeypatch.setattr(services, "FUNDS_FILE", funds_file)
    monkeypatch.setattr(services, "DATA_FILE", data_file)

    # analytics.py imports read_data directly, so patch it as well.
    import analytics

    monkeypatch.setattr(analytics, "read_data", services.read_data)

    return TestClient(app)


def create_test_expense(client, name="Lunch", amount=250, category="Food",
                        expense_date="2026-10-16"):
    response = client.post(
        "/expenses",
        json={
            "name": name,
            "amount": amount,
            "category": category,
            "date": expense_date,
            "payment_method": "Cash",
            "description": "Test expense",
        },
    )
    return response


def test_home(client):
    response = client.get("/")
    assert response.status_code == 200
    assert response.json()["message"] == "ExpenseFlow API is running"


def test_add_funds(client):
    response = client.post("/funds", json={"amount": 500})

    assert response.status_code == 200
    assert response.json()["total_funds"] == 1500


def test_create_and_get_expense(client):
    created = create_test_expense(client)

    assert created.status_code == 200
    expense = created.json()
    assert expense["name"] == "Lunch"
    assert float(expense["amount"]) == 250

    response = client.get(f"/expenses/{expense['id']}")
    assert response.status_code == 200
    assert response.json()["id"] == expense["id"]


def test_update_expense(client):
    created = create_test_expense(client)
    expense_id = created.json()["id"]

    response = client.put(
        f"/expenses/{expense_id}",
        json={
            "name": "Dinner",
            "amount": 300,
            "category": "Food",
            "date": "2026-10-16",
            "payment_method": "UPI",
            "description": "Updated test expense",
        },
    )

    assert response.status_code == 200
    assert response.json()["name"] == "Dinner"
    assert float(response.json()["amount"]) == 300


def test_delete_expense(client):
    created = create_test_expense(client)
    expense_id = created.json()["id"]

    response = client.delete(f"/expenses/{expense_id}")
    assert response.status_code == 200

    missing = client.get(f"/expenses/{expense_id}")
    assert missing.status_code == 404


def test_filter_sort_and_paginate_expenses(client):
    create_test_expense(
        client, "Lunch", 250, "Food", "2026-10-16"
    )
    create_test_expense(
        client, "Taxi", 100, "Travel", "2026-10-15"
    )
    create_test_expense(
        client, "Dinner", 400, "Food", "2026-10-14"
    )

    response = client.get(
        "/expenses",
        params={
            "category": "Food",
            "sort_by": "amount",
            "order": "desc",
            "limit": 1,
            "offset": 0,
        },
    )

    assert response.status_code == 200
    result = response.json()
    assert result["total"] == 2
    assert len(result["expenses"]) == 1
    assert result["expenses"][0]["name"] == "Dinner"


def test_invalid_date_range(client):
    response = client.get(
        "/expenses",
        params={
            "start_date": "2026-10-20",
            "end_date": "2026-10-10",
        },
    )

    assert response.status_code == 400

def test_monthly_report(client):
    create_test_expense(
        client, "Lunch", 250, "Food", "2026-10-16"
    )
    response = client.get("/reports/monthly")

    assert response.status_code == 200
    assert response.json()["2026-10"] == 250


def test_category_report(client):
    create_test_expense(client, "Lunch", 250, "Food")
    create_test_expense(client, "Dinner", 150, "Food")

    response = client.get("/reports/category")

    assert response.status_code == 200
    assert response.json()["Food"] == 400


def test_statistics(client):
    create_test_expense(client, "Lunch", 250, "Food")
    create_test_expense(client, "Dinner", 150, "Food")

    response = client.get("/reports/statistics")

    assert response.status_code == 200
    result = response.json()
    assert result["total"] == 400
    assert result["average"] == 200
    assert result["highest"] == 250
    assert result["count"] == 2


def test_csv_export(client):
    create_test_expense(client)

    response = client.get("/reports/export")

    assert response.status_code == 200
    assert "text/csv" in response.headers["content-type"]
    assert 'filename="expense_report.csv"' in response.headers.get(
        "content-disposition", ""
    )

    rows = list(csv.DictReader(response.text.splitlines()))
    assert len(rows) == 1
    assert rows[0]["name"] == "Lunch"


def test_dashboard(client):
    create_test_expense(client, "Lunch", 250, "Food")

    response = client.get("/dashboard")

    assert response.status_code == 200
    result = response.json()
    assert result["total_funds"] == 1000
    assert result["total_expenses"] == 250
    assert result["remaining_balance"] == 750
    assert result["total_transactions"] == 1

# Additional validation tests

@pytest.mark.parametrize("amount", [-100, 0])
def test_reject_non_positive_expense_amount(client, amount):
    response = create_test_expense(client, amount=amount)
    assert response.status_code in (400, 422)


def test_reject_missing_expense_name(client):
    response = client.post(
        "/expenses",
        json={
            "amount": 100,
            "category": "Food",
            "date": "2026-10-18",
            "payment_method": "Cash",
            "description": "Missing name test",
        },
    )
    assert response.status_code == 422


def test_reject_missing_expense_amount(client):
    response = client.post(
        "/expenses",
        json={
            "name": "Lunch",
            "category": "Food",
            "date": "2026-10-18",
            "payment_method": "Cash",
            "description": "Missing amount test",
        },
    )
    assert response.status_code == 422


def test_reject_non_numeric_expense_amount(client):
    response = create_test_expense(client, amount="abc")
    assert response.status_code == 422


def test_malformed_csv_missing_amount_column(
    client, tmp_path, monkeypatch
):
    malformed_file = tmp_path / "malformed.csv"
    malformed_file.write_text(
        "id,name,category,date,payment_method,description\n"
        "EXP-001,Lunch,Food,2026-10-18,Cash,Test\n",
        encoding="utf-8",
    )

    monkeypatch.setattr(services, "EXPENSES_FILE", malformed_file)

    response = client.get("/reports/monthly")
    assert response.status_code == 500


def test_csv_with_invalid_amount(client, tmp_path, monkeypatch):
    malformed_file = tmp_path / "invalid_amount.csv"
    malformed_file.write_text(
        "id,name,amount,category,date,payment_method,description\n"
        "EXP-001,Lunch,abc,Food,2026-10-18,Cash,Test\n",
        encoding="utf-8",
    )

    monkeypatch.setattr(services, "EXPENSES_FILE", malformed_file)

    response = client.get("/reports/monthly")
    assert response.status_code == 500
