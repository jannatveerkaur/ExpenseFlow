from pydantic import BaseModel, Field
from typing import Literal


class FundRequest(BaseModel):
    amount: float = Field(gt=0)


class ExpenseCreate(BaseModel):
    name: str = Field(min_length=1)
    amount: float = Field(gt=0)

    category: Literal[
        "Food",
        "Shopping",
        "Travel",
        "Bills",
        "Education",
        "Others"
    ]

    date: str

    payment_method: Literal[
        "Cash",
        "UPI",
        "Card",
        "Other"
    ]

    description: str = Field(default="", max_length=200)


class Expense(ExpenseCreate):
    id: str


class ExpenseUpdate(BaseModel):
    name: str = Field(min_length=1)
    amount: float = Field(gt=0)

    category: Literal[
        "Food",
        "Shopping",
        "Travel",
        "Bills",
        "Education",
        "Others"
    ]

    date: str

    payment_method: Literal[
        "Cash",
        "UPI",
        "Card",
        "Other"
    ]

    description: str = Field(default="", max_length=200)