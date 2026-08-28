import json
from pathlib import Path



DATA_FILE = Path(__file__).parent / "data" / "data.json"


def read_data():

    with open(DATA_FILE, "r") as file:
        return json.load(file)


def write_data(data):

    with open(DATA_FILE, "w") as file:
        json.dump(data, file, indent=2)




def get_next_expense_id(expenses):

    if not expenses:
        return "EXP-001"

    numbers = []

    for expense in expenses:

        number = int(
            expense["id"].split("-")[1]
        )

        numbers.append(number)

    next_number = max(numbers) + 1

    return f"EXP-{next_number:03d}"




def create_expense(expense_data):

    data = read_data()

    new_expense = {
        "id": get_next_expense_id(
            data["expenses"]
        ),
        **expense_data
    }

    data["expenses"].append(new_expense)

    write_data(data)

    return new_expense




def get_all_expenses():

    data = read_data()

    return data["expenses"]




def get_expense_by_id(expense_id):

    data = read_data()

    for expense in data["expenses"]:

        if expense["id"] == expense_id:
            return expense

    return None




def update_expense(
    expense_id,
    updated_data
):

    data = read_data()

    for index, expense in enumerate(
        data["expenses"]
    ):

        if expense["id"] == expense_id:

            updated_expense = {
                "id": expense_id,
                **updated_data
            }

            data["expenses"][index] = (
                updated_expense
            )

            write_data(data)

            return updated_expense

    return None




def delete_expense(expense_id):

    data = read_data()

    for expense in data["expenses"]:

        if expense["id"] == expense_id:

            data["expenses"].remove(expense)

            write_data(data)

            return True

    return False

