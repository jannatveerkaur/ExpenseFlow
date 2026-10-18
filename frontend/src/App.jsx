
import { Routes, Route } from "react-router-dom";

import Landing from "./pages/Landing";
import Dashboard from "./pages/Dashboard";
import AddExpense from "./pages/AddExpense";
import ExpenseHistory from "./pages/ExpenseHistory";
import Reports from "./pages/Reports";

function App() {
  return (
    <Routes>
      {/* Landing Page */}
      <Route path="/" element={<Landing />} />

      {/* Dashboard */}
      <Route path="/dashboard" element={<Dashboard />} />

      {/* Add Expense */}
      <Route path="/add-expense" element={<AddExpense />} />

      {/* Expense History */}
      <Route path="/expenses" element={<ExpenseHistory />} />

      {/* Reports & Analytics */}
      <Route path="/reports" element={<Reports />} />
    </Routes>
  );
}

export default App;

