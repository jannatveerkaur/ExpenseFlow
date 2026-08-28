import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import { useExpense } from "../context/ExpenseContext";

function ExpenseHistory() {
  const navigate = useNavigate();

  const {
    expenses,
    deleteExpense,
    loading,
    error
  } = useExpense();

  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("All");
  const [deletingId, setDeletingId] = useState(null);

  const filteredExpenses = expenses.filter((expense) => {
    const matchesSearch = expense.name
      .toLowerCase()
      .includes(search.toLowerCase());

    const matchesCategory =
      category === "All" ||
      expense.category === category;

    return matchesSearch && matchesCategory;
  });

  async function handleDelete(id) {
    const confirmed = window.confirm(
      "Are you sure you want to delete this expense?"
    );

    if (!confirmed) {
      return;
    }

    try {
      setDeletingId(id);

      await deleteExpense(id);

      alert("Expense deleted successfully!");
    } catch (err) {
      console.error("Delete error:", err);
    } finally {
      setDeletingId(null);
    }
  }

  function handleEdit(id) {
    navigate(`/add-expense?edit=${id}`);
  }

  return (
    <>
      <Navbar />

      <main className="history-page">

        <div className="page-header">
          <div>
            <h1>Expense History</h1>

            <p>
              View and manage all your expenses.
            </p>
          </div>
        </div>

        {error && (
          <div className="error-message">
            {error}
          </div>
        )}

        <section className="filters">

          <input
            type="text"
            placeholder="Search expense..."
            value={search}
            onChange={(event) =>
              setSearch(event.target.value)
            }
          />

          <select
            value={category}
            onChange={(event) =>
              setCategory(event.target.value)
            }
          >
            <option value="All">All</option>
            <option value="Food">Food</option>
            <option value="Shopping">Shopping</option>
            <option value="Travel">Travel</option>
            <option value="Bills">Bills</option>
            <option value="Education">Education</option>
            <option value="Others">Others</option>
          </select>

        </section>

        <section className="expense-table-wrapper">

          {loading ? (
            <p>Loading expenses...</p>
          ) : filteredExpenses.length === 0 ? (
            <p>No expenses found.</p>
          ) : (

            <table className="expense-table">

              <thead>
                <tr>
                  <th>ID</th>
                  <th>Name</th>
                  <th>Amount</th>
                  <th>Category</th>
                  <th>Date</th>
                  <th>Payment</th>
                  <th>Actions</th>
                </tr>
              </thead>

              <tbody>

                {filteredExpenses.map((expense) => (

                  <tr key={expense.id}>

                    <td>{expense.id}</td>

                    <td>{expense.name}</td>

                    <td>
                      ₹{expense.amount}
                    </td>

                    <td>
                      {expense.category}
                    </td>

                    <td>
                      {expense.date}
                    </td>

                    <td>
                      {expense.payment_method}
                    </td>

                    <td>

                      <button
                        className="edit-btn"
                        onClick={() =>
                          handleEdit(expense.id)
                        }
                        disabled={deletingId !== null}
                      >
                        Edit
                      </button>

                      <button
                        className="delete-btn"
                        onClick={() =>
                          handleDelete(expense.id)
                        }
                        disabled={deletingId !== null}
                      >
                        {deletingId === expense.id
                          ? "Deleting..."
                          : "Delete"}
                      </button>

                    </td>

                  </tr>

                ))}

              </tbody>

            </table>

          )}

        </section>

      </main>
    </>
  );
}

export default ExpenseHistory;