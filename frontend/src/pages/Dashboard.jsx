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
    error
  } = useExpense();

  const [fundAmount, setFundAmount] = useState("");
  const [fundError, setFundError] = useState("");
  const [fundSuccess, setFundSuccess] = useState("");

  const recentExpenses = [...expenses]
    .reverse()
    .slice(0, 5);

  async function handleAddFunds() {
    setFundError("");
    setFundSuccess("");

    if (!fundAmount) {
      setFundError("Amount is required.");
      return;
    }

    if (Number(fundAmount) <= 0) {
      setFundError("Amount must be greater than 0.");
      return;
    }

    try {
      await addFunds(fundAmount);

      setFundAmount("");
      setFundSuccess("Funds added successfully.");
    } catch (err) {
      setFundError("Unable to add funds.");
    }
  }

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

        {error && (
          <p className="error-message">
            {error}
          </p>
        )}

        <section className="dashboard-cards">

          <div className="dashboard-card">
            <p>Total Funds</p>

            <h2>
              ₹{dashboard.total_funds}
            </h2>
          </div>

          <div className="dashboard-card">
            <p>Total Expenses</p>

            <h2>
              ₹{dashboard.total_expenses}
            </h2>
          </div>

          <div className="dashboard-card">
            <p>Remaining Balance</p>

            <h2>
              ₹{dashboard.remaining_balance}
            </h2>
          </div>

          <div className="dashboard-card">
            <p>Total Transactions</p>

            <h2>
              {dashboard.total_transactions}
            </h2>
          </div>

        </section>

        <section className="add-funds">

          <h2>Add Funds</h2>

          <div className="fund-form">

            <input
              type="number"
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
            <p className="error-message">
              {fundError}
            </p>
          )}

          {fundSuccess && (
            <p className="success-message">
              {fundSuccess}
            </p>
          )}

        </section>

        <section className="recent-expenses">

          <div className="section-header">

            <h2>Recent Expenses</h2>

            <Link to="/expenses">
              View All Expenses →
            </Link>

          </div>

          <div className="expense-list">

            {recentExpenses.length === 0 ? (

              <p>
                No expenses recorded yet.
              </p>

            ) : (

              recentExpenses.map((expense) => (

                <div
                  className="expense-row"
                  key={expense.id}
                >

                  <div>
                    <h3>
                      {expense.name}
                    </h3>

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