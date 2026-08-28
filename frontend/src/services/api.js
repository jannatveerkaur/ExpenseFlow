import axios from "axios";

const API = axios.create({
  baseURL: "http://127.0.0.1:8000",
});

export function addFunds(amount) {
  return API.post("/funds", {
    amount: Number(amount),
  });
}


export function getDashboard() {
  return API.get("/dashboard");
}



export function createExpense(expenseData) {
  return API.post("/expenses", expenseData);
}


export function getExpenses() {
  return API.get("/expenses");
}


export function getExpense(id) {
  return API.get(`/expenses/${id}`);
}


export function updateExpense(id, expenseData) {
  return API.put(
    `/expenses/${id}`,
    expenseData
  );
}

export function deleteExpense(id) {
  return API.delete(`/expenses/${id}`);
}