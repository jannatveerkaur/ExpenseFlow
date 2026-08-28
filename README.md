# 💰 ExpenseFlow

ExpenseFlow is a full-stack personal expense management system.

It allows users to manage their available funds, record expenses, search and filter transactions, edit or delete expenses, and view basic spending information from a dashboard.

The project uses React.js for the frontend, FastAPI for the backend, and a JSON file for data storage.

---

## 🚀 Features

- Landing Page
- Dashboard
- Add Funds
- Add Expenses
- Expense ID generation
- Expense History
- Search Expenses
- Filter Expenses by Category
- Edit Expenses
- Delete Expenses
- Dashboard Calculations
- Light/Dark Mode
- Form Validation
- API Error Handling
- Responsive UI
- JSON File Storage

---

## 🛠️ Technology Stack

### Frontend

- React.js
- JavaScript
- HTML5
- CSS3
- React Router
- Axios
- Vite

### Backend

- Python
- FastAPI
- Pydantic
- Uvicorn

### Data Storage

- JSON

---

## 🏗️ Architecture

ExpenseFlow follows a three-layer architecture:

```text
React Frontend
      |
      | Axios / HTTP
      ↓
FastAPI Backend
      |
      | Read / Write
      ↓
JSON File