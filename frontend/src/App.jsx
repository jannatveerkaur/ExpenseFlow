import { Routes, Route } from "react-router-dom";

import Landing from "./pages/Landing";
import Dashboard from "./pages/Dashboard";
import AddExpense from "./pages/AddExpense";
import ExpenseHistory from "./pages/ExpenseHistory";

function App() {
  return (
    <Routes>
      <Route path="/" element={<Landing />} />

      <Route path="/dashboard" element={<Dashboard />} />

      <Route path="/add-expense" element={<AddExpense />} />

      <Route path="/expenses" element={<ExpenseHistory />} />
    </Routes>
  );
}

export default App;