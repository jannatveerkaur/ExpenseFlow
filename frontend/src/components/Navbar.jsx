import { Link } from "react-router-dom";
import { useTheme } from "../context/ThemeContext";

function Navbar() {

  const { theme, toggleTheme } = useTheme();

  return (
    <nav className="navbar">

      <Link to="/" className="logo">
        💰 ExpenseFlow
      </Link>

      <div className="nav-links">

        <Link to="/dashboard">
          Dashboard
        </Link>

        <Link to="/add-expense">
          Add Expense
        </Link>

        <Link to="/expenses">
          Expenses
        </Link>

      </div>

      <button
        className="theme-btn"
        onClick={toggleTheme}
        type="button"
        aria-label="Toggle theme"
      >
        {theme === "light" ? "🌙" : "☀️"}
      </button>

    </nav>
  );
}

export default Navbar;