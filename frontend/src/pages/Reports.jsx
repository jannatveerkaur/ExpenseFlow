
import { useEffect, useState } from "react";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  PieChart,
  Pie,
  Cell,
  Legend,
} from "recharts";

import Navbar from "../components/Navbar";

import {
  getMonthlyReport,
  getCategoryReport,
  getExpenseStatistics,
  exportExpenses,
} from "../services/api";

import "./Reports.css";

const CHART_COLORS = [
  "#4F46E5",
  "#0D9488",
  "#F59E0B",
  "#EC4899",
  "#8B5CF6",
  "#64748B",
];

function formatCurrency(value) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 2,
  }).format(Number(value) || 0);
}

function Reports() {
  const [monthlyData, setMonthlyData] = useState([]);
  const [categoryData, setCategoryData] = useState([]);
  const [statistics, setStatistics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadReports() {
      try {
        setLoading(true);
        setError("");

        const [monthlyResponse, categoryResponse, statsResponse] =
          await Promise.all([
            getMonthlyReport(),
            getCategoryReport(),
            getExpenseStatistics(),
          ]);

        setMonthlyData(
          Object.entries(monthlyResponse.data || {})
            .map(([month, amount]) => ({
              month,
              amount: Number(amount) || 0,
            }))
            .sort((a, b) => a.month.localeCompare(b.month))
        );

        setCategoryData(
          Object.entries(categoryResponse.data || {})
            .map(([category, amount]) => ({
              category,
              amount: Number(amount) || 0,
            }))
            .sort((a, b) => b.amount - a.amount)
        );

        setStatistics(statsResponse.data);
      } catch (err) {
        console.error("Unable to load reports:", err);
        setError(
          "Unable to load reports. Please check that the backend is running."
        );
      } finally {
        setLoading(false);
      }
    }

    loadReports();
  }, []);

  async function handleExport() {
    try {
      const response = await exportExpenses();

      const url = window.URL.createObjectURL(
        new Blob([response.data], { type: "text/csv" })
      );

      const link = document.createElement("a");
      link.href = url;
      link.download = "expense_report.csv";
      document.body.appendChild(link);
      link.click();
      link.remove();

      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error("CSV export failed:", err);
      setError("Unable to export expenses. Please try again.");
    }
  }

  if (loading) {
    return (
      <>
        <Navbar />
        <main className="reports-page">
          <p>Loading reports...</p>
        </main>
      </>
    );
  }

  return (
    <>
      <Navbar />

      <main className="reports-page">
        <header className="reports-header">
          <div>
            <h1>Reports & Analytics</h1>
            <p>Understand your spending and financial habits.</p>
          </div>

          <button
            type="button"
            className="reports-export-btn"
            onClick={handleExport}
          >
            Export CSV
          </button>
        </header>

        {error && (
          <p className="reports-error" role="alert">
            {error}
          </p>
        )}

        <section className="reports-stats">
          <article className="report-stat-card">
            <p>Total Expenses</p>
            <h2>{formatCurrency(statistics?.total)}</h2>
          </article>

          <article className="report-stat-card">
            <p>Average Expense</p>
            <h2>{formatCurrency(statistics?.average)}</h2>
          </article>

          <article className="report-stat-card">
            <p>Highest Expense</p>
            <h2>{formatCurrency(statistics?.highest)}</h2>
            <span>
              {statistics?.highest_expense?.name || "No expenses yet"}
            </span>
          </article>

          <article className="report-stat-card">
            <p>Total Transactions</p>
            <h2>{statistics?.count ?? 0}</h2>
          </article>
        </section>

        <section className="reports-charts">
          <article className="report-chart-card">
            <h2>Monthly Spending</h2>

            {monthlyData.length === 0 ? (
              <p>No monthly expense data available yet.</p>
            ) : (
              <div className="report-chart">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={monthlyData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip
                      formatter={(value) => formatCurrency(value)}
                    />
                    <Bar
                      dataKey="amount"
                      name="Expenses"
                      fill="#4F46E5"
                      radius={[6, 6, 0, 0]}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            )}
          </article>

          <article className="report-chart-card">
            <h2>Category Breakdown</h2>

            {categoryData.length === 0 ? (
              <p>No category expense data available yet.</p>
            ) : (
              <div className="report-chart">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={categoryData}
                      dataKey="amount"
                      nameKey="category"
                      cx="50%"
                      cy="50%"
                      outerRadius={100}
                      label={({ category, percent }) =>
                        `${category} ${(percent * 100).toFixed(0)}%`
                      }
                    >
                      {categoryData.map((entry, index) => (
                        <Cell
                          key={entry.category}
                          fill={
                            CHART_COLORS[index % CHART_COLORS.length]
                          }
                        />
                      ))}
                    </Pie>
                    <Tooltip
                      formatter={(value) => formatCurrency(value)}
                    />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            )}
          </article>
        </section>

        <section className="report-table-card">
          <h2>Category-wise Expenses</h2>

          {categoryData.length === 0 ? (
            <p>No expenses to display.</p>
          ) : (
            <div className="report-table-wrapper">
              <table className="report-table">
                <thead>
                  <tr>
                    <th>Category</th>
                    <th>Total Amount</th>
                  </tr>
                </thead>

                <tbody>
                  {categoryData.map((item) => (
                    <tr key={item.category}>
                      <td>{item.category}</td>
                      <td>{formatCurrency(item.amount)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>
      </main>
    </>
  );
}

export default Reports;
