# StockSense

**StockSense** is a modular inventory management system built with React, Vite, FastAPI, and PostgreSQL. The project is designed with a modular architecture to support maintainable development and future expansion.

## Tech Stack

- **Frontend:** React, Vite
- **Backend:** Python, FastAPI
- **Database:** PostgreSQL

## Project Structure

```text
StockSense/
├── frontend/       # React application and Vite configuration
├── backend/        # FastAPI application, modules, and tests
├── docs/           # Project documentation
├── .env.example    # Environment variable template
└── README.md
```

## Prerequisites

Ensure the following tools are installed:

- [Node.js and npm](https://nodejs.org/)
- [Python 3](https://www.python.org/)
- [PostgreSQL](https://www.postgresql.org/)
- Git

## Getting Started

### 1. Clone the Repository

```bash
git clone https://github.com/sivamani-repo/StockSense.git
cd StockSense
```

### 2. Configure Environment Variables

Copy the example environment file to `.env` in the project root.

**Windows PowerShell:**

```powershell
Copy-Item .env.example .env
```

**Linux/macOS:**

```bash
cp .env.example .env
```

Update `.env` with your PostgreSQL connection details and any other required configuration.

Ensure that the PostgreSQL database exists before starting the backend. Use the variable names and format defined in `.env.example`.

### 3. Start the Frontend

Open a terminal in the project root and run:

```bash
cd frontend
npm install
npm run dev
```

Open the local URL printed by Vite, typically:

```text
http://localhost:5173
```

### 4. Start the Backend

Open a **separate terminal** in the project root and run:

```bash
cd backend
python -m venv .venv
```

Activate the virtual environment.

**Windows PowerShell:**

```powershell
.\.venv\Scripts\Activate.ps1
```

**Linux/macOS:**

```bash
source .venv/bin/activate
```

Install the backend dependencies:

```bash
python -m pip install -r requirements.txt
```

Start the FastAPI development server:

```bash
uvicorn app.main:app --reload
```

The backend should be available at:

```text
http://127.0.0.1:8000
```

Access the interactive API documentation at:

```text
http://127.0.0.1:8000/docs
```

## Development

- Keep the frontend and backend running in separate terminals.
- Store local configuration and secrets in `.env`.
- Do not commit `.env`, virtual environments, or `node_modules`.
- Use `.env.example` to document the environment variables required to run the project.

## About

StockSense is being developed as a modular inventory management system, with an emphasis on clean project organization, maintainability, and extensibility.
