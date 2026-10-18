
import { useState } from "react";
import { Link } from "react-router-dom";
import Navbar from "../components/Navbar";
import { useExpense } from "../context/ExpenseContext";

function Dashboard() {
  const {
    dashboard,
    expenses,
    addFunds,
    loading,
    error,
  } = useExpense();

  const [fundAmount, setFundAmount] = useState("");
  const [fundError, setFundError] = useState("");
  const [fundSuccess, setFundSuccess] = useState("");

  // Safely handle both array and paginated API responses.
  const expenseList = Array.isArray(expenses)
    ? expenses
    : Array.isArray(expenses?.expenses)
      ? expenses.expenses
      : [];

  // Display the five most recent expenses.
  const recentExpenses = [...expenseList]
    .reverse()
    .slice(0, 5);

  async function handleAddFunds() {
    setFundError("");
    setFundSuccess("");

    if (!fundAmount.trim()) {
      setFundError("Amount is required.");
      return;
    }

    const amount = Number(fundAmount);

    if (!Number.isFinite(amount) || amount <= 0) {
      setFundError("Amount must be greater than 0.");
      return;
    }

    try {
      await addFunds(amount);

      setFundAmount("");
      setFundSuccess("Funds added successfully.");
    } catch (err) {
      setFundError(
        err?.response?.data?.detail ||
          err?.message ||
          "Unable to add funds."
      );
    }
  }

  // Provide default values while dashboard data loads.
  const dashboardData = {
    total_funds: 0,
    total_expenses: 0,
    remaining_balance: 0,
    total_transactions: 0,
    ...dashboard,
  };

  if (loading) {
    return (
      <>
        <Navbar />

        <main className="dashboard">
          <p>Loading dashboard...</p>
        </main>
      </>
    );
  }

  return (
    <>
      <Navbar />

      <main className="dashboard">
        {/* Page Header */}
        <div className="page-header">
          <div>
            <h1>Dashboard</h1>

            <p>
              Here's your spending overview.
            </p>
          </div>

          <Link
            to="/add-expense"
            className="primary-btn"
          >
            + Add Expense
          </Link>
        </div>

        {/* API Error */}
        {error && (
          <p className="error-message" role="alert">
            {error}
          </p>
        )}

        {/* Dashboard Summary Cards */}
        <section className="dashboard-cards">
          <div className="dashboard-card">
            <p>Total Funds</p>

            <h2>
              ₹{dashboardData.total_funds}
            </h2>
          </div>

          <div className="dashboard-card">
            <p>Total Expenses</p>

            <h2>
              ₹{dashboardData.total_expenses}
            </h2>
          </div>

          <div className="dashboard-card">
            <p>Remaining Balance</p>

            <h2>
              ₹{dashboardData.remaining_balance}
            </h2>
          </div>

          <div className="dashboard-card">
            <p>Total Transactions</p>

            <h2>
              {dashboardData.total_transactions}
            </h2>
          </div>
        </section>

        {/* Add Funds */}
        <section className="add-funds">
          <h2>Add Funds</h2>

          <div className="fund-form">
            <input
              type="number"
              min="0.01"
              step="0.01"
              placeholder="Enter amount"
              value={fundAmount}
              onChange={(event) => {
                setFundAmount(event.target.value);
                setFundError("");
                setFundSuccess("");
              }}
            />

            <button
              type="button"
              className="primary-btn"
              onClick={handleAddFunds}
              disabled={loading}
            >
              Add Funds
            </button>
          </div>

          {fundError && (
            <p className="error-message" role="alert">
              {fundError}
            </p>
          )}

          {fundSuccess && (
            <p className="success-message" role="status">
              {fundSuccess}
            </p>
          )}
        </section>

        {/* Recent Expenses */}
        <section className="recent-expenses">
          <div className="section-header">
            <h2>Recent Expenses</h2>

            <Link to="/expenses">
              View All Expenses →
            </Link>
          </div>

          <div className="expense-list">
            {recentExpenses.length === 0 ? (
              <p>No expenses recorded yet.</p>
            ) : (
              recentExpenses.map((expense) => (
                <div
                  className="expense-row"
                  key={expense.id}
                >
                  <div>
                    <h3>{expense.name}</h3>

                    <p>
                      {expense.category} • {expense.date}
                    </p>
                  </div>

                  <strong>
                    ₹{expense.amount}
                  </strong>
                </div>
              ))
            )}
          </div>
        </section>
      </main>
    </>
  );
}

export default Dashboard;


