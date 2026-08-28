import Navbar from "../components/Navbar";
import ExpenseForm from "../components/ExpenseForm";

function AddExpense() {
  return (
    <>
      <Navbar />

      <main className="form-page">

        <div className="page-header">

          <div>
            <h1>Add Expense</h1>

            <p>
              Record a new expense.
            </p>
          </div>

        </div>

        <ExpenseForm />

      </main>
    </>
  );
}

export default AddExpense;