# StockSense Architecture


User
  ↓
React Frontend
  ↓
FastAPI Backend
  ↓
Business Logic
  ↓
Database

The backend persists application data in PostgreSQL through SQLAlchemy. The
PostgreSQL connection URL is required through environment configuration.