import { useNavigate } from "react-router-dom";
import { useTheme } from "../context/ThemeContext";

function Landing() {

  const navigate = useNavigate();

  const {
    theme,
    toggleTheme
  } = useTheme();

  return (
    <div className="landing-page">

      {/* Header */}

      <header className="landing-header">

        <h2>
          💰 ExpenseFlow
        </h2>

        <button
          className="theme-btn"
          onClick={toggleTheme}
          type="button"
          aria-label="Toggle theme"
        >
          {theme === "light" ? "🌙" : "☀️"}
        </button>

      </header>


      {/* Hero Section */}

      <main className="hero">

        <div className="hero-content">

          <h1>
            Manage Your Expenses
            <span> Easily.</span>
          </h1>

          <p>
            Track your spending, manage your funds,
            and keep your personal finances organized
            with ExpenseFlow.
          </p>

          <button
            className="primary-btn"
            onClick={() => navigate("/dashboard")}
          >
            Get Started →
          </button>

        </div>

      </main>


      {/* Footer */}

      <footer>

        <p>
          © 2026 ExpenseFlow
        </p>

      </footer>

    </div>
  );
}

export default Landing;