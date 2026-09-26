# StockSense Backend

FastAPI backend for the StockSense inventory management system. The existing
Product CRUD API is preserved; this foundation also provides environment-based
settings, SQLite session management, local-development CORS, and a health check.

## Run locally

From the repository root, create a local environment file and install backend
dependencies:

```bash
copy .env.example .env
cd backend
python -m pip install -r requirements.txt
uvicorn app.main:app --reload
```

The API documentation is available at `http://127.0.0.1:8000/docs`, and the
health endpoint is `http://127.0.0.1:8000/health`. The default database is
`backend/stocksense.db`; its location and CORS origins can be configured through
the root `.env` file. Keep `.env` local and never commit it.
