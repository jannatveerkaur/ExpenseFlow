
# ExpenseFlow API

ExpenseFlow is a personal expense management backend built with FastAPI. It allows users to manage expenses and funds, view dashboard statistics, generate reports, filter and sort records, paginate results, and export expense data as CSV.

## Features

- Add and manage funds
- Create, retrieve, update, and delete expenses
- Dashboard with total funds, expenses, remaining balance, and transaction count
- Monthly expense reports
- Category-wise expense reports
- Overall expense statistics
- Filter expenses by date range and category
- Sort expenses by date, amount, or name
- Paginate expense results
- Export expenses to CSV
- Automated API tests using pytest

## Tech Stack

- Python
- FastAPI
- Pydantic
- CSV for expense storage
- JSON for funds storage
- Pytest and HTTPX for testing

## Project Structure

```text
backend/
├── main.py
├── models.py
├── services.py
├── analytics.py
├── test_main.py
├── requirements.txt
├── data/
│   ├── expenses.csv
│   ├── funds.json
│   └── data.json
└── venv/
```

The `venv/` directory is generated locally and should not be committed to Git.

## Installation

### 1. Clone the repository

```bash
git clone YOUR_REPOSITORY_URL
cd "Expense Flow/backend"
```

Replace `YOUR_REPOSITORY_URL` with your actual Git repository URL.

### 2. Create and activate a virtual environment

```bash
python3 -m venv venv
source venv/bin/activate
```

### 3. Install dependencies

```bash
pip install -r requirements.txt
pip install pytest httpx
```

### 4. Start the API

```bash
uvicorn main:app --reload
```

The API will be available at:

http://127.0.0.1:8000

Interactive API documentation:

http://127.0.0.1:8000/docs

## API Endpoints

| Method | Endpoint | Description |
|---|---|---|
| GET | `/` | API health check |
| POST | `/funds` | Add funds |
| GET | `/dashboard` | Dashboard statistics |
| POST | `/expenses` | Create an expense |
| GET | `/expenses` | List, filter, sort, and paginate expenses |
| GET | `/expenses/{expense_id}` | Retrieve one expense |
| PUT | `/expenses/{expense_id}` | Update an expense |
| DELETE | `/expenses/{expense_id}` | Delete an expense |
| GET | `/reports/monthly` | Monthly report |
| GET | `/reports/category` | Category-wise report |
| GET | `/reports/statistics` | Overall statistics |
| GET | `/reports/export` | Export expenses as CSV |

## Filtering, Sorting, and Pagination

Example request:

```text
GET /expenses?category=Food&sort_by=amount&order=desc&limit=5&offset=0
```

Available query parameters:

- `start_date`: Include expenses on or after this date.
- `end_date`: Include expenses on or before this date.
- `category`: Filter by category.
- `sort_by`: `date`, `amount`, or `name`.
- `order`: `asc` or `desc`.
- `limit`: Number of records per page, from 1 to 100.
- `offset`: Number of records to skip.

## Running Automated Tests

Run the following command from the backend directory:

```bash
pytest -v
```

The current test suite contains 19 tests covering CRUD operations, funds, dashboard calculations, filtering, pagination, analytics, date validation, and CSV export.

## Data Storage

Expense records are stored in CSV, while the total funds balance is stored in JSON. The application also supports migration from the original JSON data file when the CSV file has not yet been created.

## Future Improvements

- User authentication and authorization
- SQLite or MongoDB integration
- More advanced analytics and visualizations
- Additional validation and error handling
- Deployment to a production hosting platform

