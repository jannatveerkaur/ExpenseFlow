
import { Link, NavLink } from "react-router-dom";
import { useTheme } from "../context/ThemeContext";

function Navbar() {
  const { theme, toggleTheme } = useTheme();

  return (
    <nav className="navbar">
      {/* Logo */}
      <Link to="/" className="logo">
        💰 ExpenseFlow
      </Link>

      {/* Navigation Links */}
      <div className="nav-links">
        <NavLink to="/dashboard">
          Dashboard
        </NavLink>

        <NavLink to="/add-expense">
          Add Expense
        </NavLink>

        <NavLink to="/expenses">
          Expenses
        </NavLink>

        <NavLink to="/reports">
          Reports
        </NavLink>
      </div>

      {/* Light/Dark Theme Toggle */}
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

