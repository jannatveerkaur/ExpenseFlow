
import csv
import json
from pathlib import Path

DATA_DIR = Path(__file__).parent / "data"
DATA_FILE = DATA_DIR / "data.json"
EXPENSES_FILE = DATA_DIR / "expenses.csv"
FUNDS_FILE = DATA_DIR / "funds.json"

CSV_FIELDS = [
    "id",
    "name",
    "amount",
    "category",
    "date",
    "payment_method",
    "description",
]


def read_expenses_csv():
    """Read expense records from CSV."""
    if not EXPENSES_FILE.exists():
        return []

    with open(
        EXPENSES_FILE,
        "r",
        newline="",
        encoding="utf-8-sig",
    ) as file:
        reader = csv.DictReader(file)

        if not reader.fieldnames:
            return []

        # Normalize column names to avoid accidental spaces/BOM.
        reader.fieldnames = [
            name.strip() if name else name
            for name in reader.fieldnames
        ]

        required_fields = set(CSV_FIELDS)
        actual_fields = set(reader.fieldnames)

        if not required_fields.issubset(actual_fields):
            missing = sorted(required_fields - actual_fields)
            raise ValueError(
                f"Invalid expenses.csv headers. Missing columns: {missing}. "
                f"Expected: {CSV_FIELDS}"
            )

        expenses = []

        for row in reader:
            if not any(value for value in row.values() if value):
                continue

            amount_value = row.get("amount")

            if amount_value is None or not amount_value.strip():
                raise ValueError(
                    "An expense row has a missing amount. "
                    "Check expenses.csv."
                )

            try:
                amount = float(amount_value)
            except ValueError as exc:
                raise ValueError(
                    f"Invalid expense amount: {amount_value}"
                ) from exc

            expense = {
                field: row.get(field, "")
                for field in CSV_FIELDS
            }
            expense["amount"] = amount

            expenses.append(expense)

        return expenses


def write_expenses_csv(expenses):
    """Write all expense records to CSV."""
    DATA_DIR.mkdir(parents=True, exist_ok=True)

    with open(
        EXPENSES_FILE,
        "w",
        newline="",
        encoding="utf-8",
    ) as file:
        writer = csv.DictWriter(
            file,
            fieldnames=CSV_FIELDS,
            extrasaction="ignore",
        )

        writer.writeheader()

        for expense in expenses:
            row = {
                field: expense.get(field, "")
                for field in CSV_FIELDS
            }
            writer.writerow(row)


def migrate_json_to_csv():
    """Import existing JSON expenses when CSV does not exist."""
    DATA_DIR.mkdir(parents=True, exist_ok=True)

    # Do not overwrite an existing CSV.
    if EXPENSES_FILE.exists():
        return

    expenses = []

    if DATA_FILE.exists():
        with open(DATA_FILE, "r", encoding="utf-8") as file:
            old_data = json.load(file)

        expenses = old_data.get("expenses", [])

    write_expenses_csv(expenses)


def read_data():
    """Return expenses and funds in the existing data structure."""
    migrate_json_to_csv()

    if FUNDS_FILE.exists():
        with open(FUNDS_FILE, "r", encoding="utf-8") as file:
            funds = json.load(file)
    else:
        funds = []

        # Preserve funds from the original JSON file.
        if DATA_FILE.exists():
            with open(DATA_FILE, "r", encoding="utf-8") as file:
                old_data = json.load(file)

            funds = old_data.get("funds", [])

        write_funds(funds)

    return {
        "expenses": read_expenses_csv(),
        "funds": funds,
    }


def write_funds(funds):
    """Persist funds separately from expense records."""
    DATA_DIR.mkdir(parents=True, exist_ok=True)

    with open(FUNDS_FILE, "w", encoding="utf-8") as file:
        json.dump(funds, file, indent=2)


def write_data(data):
    """Persist expenses to CSV and funds to JSON."""
    write_expenses_csv(data.get("expenses", []))
    write_funds(data.get("funds", []))


def get_next_expense_id(expenses):
    """Generate the next EXP-001-style ID."""
    numbers = []

    for expense in expenses:
        try:
            numbers.append(int(expense["id"].split("-")[1]))
        except (KeyError, ValueError, IndexError):
            continue

    next_number = max(numbers, default=0) + 1

    return f"EXP-{next_number:03d}"


def create_expense(expense_data):
    """Create and persist an expense."""
    data = read_data()

    new_expense = {
        "id": get_next_expense_id(data["expenses"]),
        **expense_data,
    }

    data["expenses"].append(new_expense)
    write_data(data)

    return new_expense


def get_all_expenses():
    """Return every expense."""
    return read_data()["expenses"]


def get_expense_by_id(expense_id):
    """Find an expense by its ID."""
    for expense in get_all_expenses():
        if expense["id"] == expense_id:
            return expense

    return None


def update_expense(expense_id, updated_data):
    """Update an expense without changing its ID."""
    data = read_data()

    for index, expense in enumerate(data["expenses"]):
        if expense["id"] == expense_id:
            updated_expense = {
                **expense,
                **updated_data,
                "id": expense_id,
            }

            data["expenses"][index] = updated_expense
            write_data(data)

            return updated_expense

    return None


def delete_expense(expense_id):
    """Delete an expense by its ID."""
    data = read_data()

    for index, expense in enumerate(data["expenses"]):
        if expense["id"] == expense_id:
            data["expenses"].pop(index)
            write_data(data)

            return True

    return False

