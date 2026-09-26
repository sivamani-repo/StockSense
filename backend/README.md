# StockSense Backend

FastAPI backend for the StockSense inventory management system. The existing
Product CRUD API is preserved; this foundation also provides environment-based
settings, PostgreSQL session management, local-development CORS, and a health check.

## Run locally

Create a PostgreSQL database named `stocksense`, copy the example environment
file, and set its PostgreSQL username and password. Then install the backend
dependencies:

```bash
copy .env.example .env
cd backend
python -m pip install -r requirements.txt
uvicorn app.main:app --reload
```

The API documentation is available at `http://127.0.0.1:8000/docs`, and the
health endpoint is `http://127.0.0.1:8000/health`. Configure the PostgreSQL
connection and CORS origins in the root `.env` file. Keep `.env` local and never
commit it.

Tests require a separate PostgreSQL database whose name ends in `_test`. Set
`TEST_DATABASE_URL` to that database before running `python -m pytest`; the test
fixture recreates its tables and never connects to the application database.
