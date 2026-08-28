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

  async function loadData() {
    try {
      setLoading(true);
      setError("");

      const [dashboardResponse, expensesResponse] = await Promise.all([
        getDashboard(),
        getExpenses(),
      ]);

      setDashboard(dashboardResponse.data);
      setFunds(dashboardResponse.data.total_funds);
      setExpenses(expensesResponse.data);
    } catch (err) {
      console.error(err);
      setError("Unable to connect to the backend.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadData();
  }, []);

  async function addFunds(amount) {
    try {
      setError("");
      await addFundsAPI(amount);
      await loadData();
    } catch (err) {
      console.error(err);
      setError("Unable to add funds.");
      throw err;
    }
  }

  async function addExpense(expenseData) {
    try {
      setError("");
      await createExpenseAPI(expenseData);
      await loadData();
    } catch (err) {
      console.error(err);
      setError("Unable to add expense.");
      throw err;
    }
  }

  async function updateExpense(id, updatedData) {
    try {
      setError("");
      await updateExpenseAPI(id, updatedData);
      await loadData();
    } catch (err) {
      console.error(err);
      setError("Unable to update expense.");
      throw err;
    }
  }

  async function deleteExpense(id) {
    try {
      setError("");
      await deleteExpenseAPI(id);
      await loadData();
    } catch (err) {
      console.error(err);
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