
import {
  createContext,
  useContext,
  useEffect,
  useState,
} from "react";

import {
  getDashboard,
  getExpenses,
  addFunds as addFundsAPI,
  createExpense as createExpenseAPI,
  updateExpense as updateExpenseAPI,
  deleteExpense as deleteExpenseAPI,
} from "../services/api";

const ExpenseContext = createContext();

export function ExpenseProvider({ children }) {
  const [funds, setFunds] = useState(0);

  const [expenses, setExpenses] = useState([]);

  const [dashboard, setDashboard] = useState({
    total_funds: 0,
    total_expenses: 0,
    remaining_balance: 0,
    total_transactions: 0,
  });

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Load dashboard and expense data from the backend.
  async function loadData() {
    try {
      setLoading(true);
      setError("");

      const [dashboardResponse, expensesResponse] =
        await Promise.all([
          getDashboard(),
          getExpenses(),
        ]);

      // Update dashboard data safely.
      const dashboardData = dashboardResponse.data;

      setDashboard({
        total_funds: dashboardData?.total_funds ?? 0,
        total_expenses: dashboardData?.total_expenses ?? 0,
        remaining_balance:
          dashboardData?.remaining_balance ?? 0,
        total_transactions:
          dashboardData?.total_transactions ?? 0,
      });

      setFunds(dashboardData?.total_funds ?? 0);

      // Support both the old array response and the new
      // paginated response from GET /expenses.
      const responseData = expensesResponse.data;

      const expenseList = Array.isArray(responseData)
        ? responseData
        : Array.isArray(responseData?.expenses)
          ? responseData.expenses
          : [];

      setExpenses(expenseList);
    } catch (err) {
      console.error("Error loading ExpenseFlow data:", err);
      setError("Unable to connect to the backend.");
    } finally {
      setLoading(false);
    }
  }

  // Load data when the provider first mounts.
  useEffect(() => {
    loadData();
  }, []);

  // Add funds and refresh the dashboard.
  async function addFunds(amount) {
    try {
      setError("");

      await addFundsAPI(amount);
      await loadData();
    } catch (err) {
      console.error("Error adding funds:", err);
      setError("Unable to add funds.");
      throw err;
    }
  }

  // Create an expense and refresh the data.
  async function addExpense(expenseData) {
    try {
      setError("");

      await createExpenseAPI(expenseData);
      await loadData();
    } catch (err) {
      console.error("Error creating expense:", err);
      setError("Unable to add expense.");
      throw err;
    }
  }

  // Update an existing expense and refresh the data.
  async function updateExpense(id, updatedData) {
    try {
      setError("");

      await updateExpenseAPI(id, updatedData);
      await loadData();
    } catch (err) {
      console.error("Error updating expense:", err);
      setError("Unable to update expense.");
      throw err;
    }
  }

  // Delete an expense and refresh the data.
  async function deleteExpense(id) {
    try {
      setError("");

      await deleteExpenseAPI(id);
      await loadData();
    } catch (err) {
      console.error("Error deleting expense:", err);
      setError("Unable to delete expense.");
      throw err;
    }
  }

  return (
    <ExpenseContext.Provider
      value={{
        funds,
        expenses,
        dashboard,
        loading,
        error,
        addFunds,
        addExpense,
        updateExpense,
        deleteExpense,
        loadData,
      }}
    >
      {children}
    </ExpenseContext.Provider>
  );
}

export function useExpense() {
  return useContext(ExpenseContext);
}
