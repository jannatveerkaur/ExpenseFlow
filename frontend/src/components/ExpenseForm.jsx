import { useEffect, useState } from "react";
import {
  useNavigate,
  useSearchParams
} from "react-router-dom";

import { useExpense } from "../context/ExpenseContext";

function ExpenseForm() {
  const navigate = useNavigate();

  const [searchParams] = useSearchParams();

  const editId = searchParams.get("edit");

  const {
    expenses,
    addExpense,
    updateExpense,
    loading
  } = useExpense();

  const [formData, setFormData] = useState({
    name: "",
    amount: "",
    category: "Food",
    date: new Date().toISOString().split("T")[0],
    payment_method: "Cash",
    description: ""
  });

  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!editId) {
      return;
    }

    const existingExpense = expenses.find(
      (expense) => expense.id === editId
    );

    if (!existingExpense) {
      if (!loading) {
        setError("Expense not found.");
      }
      return;
    }

    setFormData({
      name: existingExpense.name,
      amount: existingExpense.amount,
      category: existingExpense.category,
      date: existingExpense.date,
      payment_method: existingExpense.payment_method,
      description: existingExpense.description || ""
    });
  }, [editId, expenses, loading]);

  function handleChange(event) {
    const { name, value } = event.target;

    setFormData((currentData) => ({
      ...currentData,
      [name]: value
    }));

    setError("");
  }

  async function handleSubmit(event) {
    event.preventDefault();

    setError("");

    if (!formData.name.trim()) {
      setError("Expense name is required.");
      return;
    }

    if (
      !formData.amount ||
      Number(formData.amount) <= 0
    ) {
      setError("Amount must be greater than 0.");
      return;
    }

    if (!formData.date) {
      setError("Date is required.");
      return;
    }

    if (formData.description.length > 200) {
      setError(
        "Description cannot exceed 200 characters."
      );
      return;
    }

    try {
      setSaving(true);

      const expenseData = {
        name: formData.name.trim(),
        amount: Number(formData.amount),
        category: formData.category,
        date: formData.date,
        payment_method: formData.payment_method,
        description: formData.description.trim()
      };

      if (editId) {
        await updateExpense(
          editId,
          expenseData
        );

        alert("Expense updated successfully!");
      } else {
        await addExpense(expenseData);

        alert("Expense saved successfully!");
      }

      navigate("/expenses");

    } catch (error) {
      console.error(error);

      setError(
        editId
          ? "Unable to update expense."
          : "Unable to save expense."
      );
    } finally {
      setSaving(false);
    }
  }

  function handleReset() {
    setFormData({
      name: "",
      amount: "",
      category: "Food",
      date: new Date().toISOString().split("T")[0],
      payment_method: "Cash",
      description: ""
    });

    setError("");
  }

  return (
    <form
      className="expense-form"
      onSubmit={handleSubmit}
    >
      {error && (
        <div className="error-message">
          {error}
        </div>
      )}

      <h2>
        {editId ? "Edit Expense" : "Add Expense"}
      </h2>

      <div className="form-group">
        <label>
          Expense Name
        </label>

        <input
          type="text"
          name="name"
          value={formData.name}
          onChange={handleChange}
          placeholder="e.g. Lunch"
          disabled={saving}
        />
      </div>

      <div className="form-group">
        <label>
          Amount
        </label>

        <input
          type="number"
          name="amount"
          value={formData.amount}
          onChange={handleChange}
          placeholder="e.g. 250"
          min="0"
          disabled={saving}
        />
      </div>

      <div className="form-group">
        <label>
          Category
        </label>

        <select
          name="category"
          value={formData.category}
          onChange={handleChange}
          disabled={saving}
        >
          <option value="Food">Food</option>
          <option value="Shopping">Shopping</option>
          <option value="Travel">Travel</option>
          <option value="Bills">Bills</option>
          <option value="Education">Education</option>
          <option value="Others">Others</option>
        </select>
      </div>

      <div className="form-group">
        <label>
          Date
        </label>

        <input
          type="date"
          name="date"
          value={formData.date}
          onChange={handleChange}
          disabled={saving}
        />
      </div>

      <div className="form-group">
        <label>
          Payment Method
        </label>

        <select
          name="payment_method"
          value={formData.payment_method}
          onChange={handleChange}
          disabled={saving}
        >
          <option value="Cash">Cash</option>
          <option value="UPI">UPI</option>
          <option value="Card">Card</option>
          <option value="Other">Other</option>
        </select>
      </div>

      <div className="form-group">
        <label>
          Description
        </label>

        <textarea
          name="description"
          value={formData.description}
          onChange={handleChange}
          maxLength={200}
          placeholder="Optional description"
          disabled={saving}
        />

        <small>
          {formData.description.length}/200
        </small>
      </div>

      <div className="form-actions">
        <button
          type="button"
          className="secondary-btn"
          onClick={handleReset}
          disabled={saving}
        >
          Reset
        </button>

        <button
          type="submit"
          className="primary-btn"
          disabled={saving}
        >
          {saving
            ? "Saving..."
            : editId
              ? "Update Expense"
              : "Save Expense"}
        </button>
      </div>
    </form>
  );
}

export default ExpenseForm;