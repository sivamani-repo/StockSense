# Architecture

StockSense is organized as a frontend and backend application:

- `frontend/` contains the React user interface, built and served with Vite.
- `backend/` contains the FastAPI application and future backend modules.

The `app/models/`, `app/schemas/`, and `app/services/` directories are extension points for implementation work. No persistence, API routes, or business behavior is defined yet.
