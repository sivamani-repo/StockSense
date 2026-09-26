# StockSense

StockSense is a modular inventory management system. This repository contains the initial project structure for a React + Vite frontend and a FastAPI backend.

## Project structure

- `frontend/` - React application and Vite configuration.
- `backend/` - FastAPI application, future modules, and tests.
- `docs/` - Project documentation.

## Start the frontend

```bash
cd frontend
npm install
npm run dev
```

## Start the backend

```bash
cd backend
python -m pip install -r requirements.txt
uvicorn app.main:app --reload
```
