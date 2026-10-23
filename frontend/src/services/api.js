
import axios from "axios";

const API = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
});

// =========================
// FUNDS
// =========================

export function addFunds(amount) {
  return API.post("/funds", {
    amount: Number(amount),
  });
}

// =========================
// DASHBOARD
// =========================

export function getDashboard() {
  return API.get("/dashboard");
}

// =========================
// EXPENSE CRUD
// =========================

export function createExpense(expenseData) {
  return API.post("/expenses", expenseData);
}

export function getExpenses(params = {}) {
  return API.get("/expenses", {
    params,
  });
}

export function getExpense(id) {
  return API.get(`/expenses/${id}`);
}

export function updateExpense(id, expenseData) {
  return API.put(`/expenses/${id}`, expenseData);
}

export function deleteExpense(id) {
  return API.delete(`/expenses/${id}`);
}

// =========================
// REPORTS & ANALYTICS
// =========================

export function getMonthlyReport() {
  return API.get("/reports/monthly");
}

export function getCategoryReport() {
  return API.get("/reports/category");
}

export function getExpenseStatistics() {
  return API.get("/reports/statistics");
}

// =========================
// CSV EXPORT
// =========================

export function exportExpenses() {
  return API.get("/reports/export", {
    responseType: "blob",
  });
}

