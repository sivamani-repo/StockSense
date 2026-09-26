# 📦 StockSense

### Smart Inventory Management System

StockSense is a modular inventory management system built to help teams **monitor stock, manage inventory operations, and maintain clear visibility across warehouses and locations**.

Built for the **Odoo x GCET Hyderabad Hackathon 2026**.

---

## 🚀 What is StockSense?

Managing inventory involves products, warehouses, locations, stock movements, receipts, deliveries, transfers, and adjustments.

StockSense brings these operations into one application so users can:

- 📊 Monitor inventory from a central dashboard
- 📦 Manage products and stock
- 🏭 Work with warehouses and locations
- 📥 Receive stock
- 📤 Create deliveries
- 🔄 Transfer stock between locations
- ⚖️ Perform inventory adjustments
- 📚 Track stock movements through a ledger
- ⚠️ Identify low-stock and out-of-stock products

---

## ✨ Main Features

### 📊 Inventory Dashboard

The dashboard provides an overview of:

- Total products
- Total stock units
- Stock alerts
- Pending operations
- Recent stock movements
- Category-wise inventory distribution
- Operation completion status

### 📥 Receipts

Record incoming inventory and update stock quantities.

### 📤 Deliveries

Manage outgoing inventory and delivery operations.

### 🔄 Transfers

Move stock between inventory locations.

### ⚖️ Adjustments

Record inventory corrections and stock adjustments.

### 📚 Stock Ledger

View inventory movement history and quantity changes.

### ⚠️ Stock Alerts

Identify products that are:

- Low in stock
- Out of stock

and quickly access replenishment actions.

---

## 🛠️ Technology Stack

### Frontend

- React
- Vite
- JavaScript
- CSS
- Lucide React

### Backend

- FastAPI
- Python

### Database

- PostgreSQL

### Development

- Git
- GitHub

---

## 🏗️ Architecture

```text
                ┌─────────────────────┐
                │      StockSense     │
                │   Web Application   │
                └──────────┬──────────┘
                           │
              ┌────────────┴────────────┐
              │                         │
              ▼                         ▼
     ┌────────────────┐        ┌────────────────┐
     │ React + Vite   │        │    FastAPI     │
     │   Frontend     │◄──────►│    Backend     │
     └────────────────┘        └───────┬────────┘
                                       │
                                       ▼
                              ┌────────────────┐
                              │   PostgreSQL   │
                              │    Database    │
                              └────────────────┘
```

---

## 📁 Project Structure

```text
StockSense/
│
├── frontend/
│   ├── src/
│   ├── package.json
│   └── vite.config.*
│
├── backend/
│   ├── app/
│   └── requirements.txt
│
├── docs/
│
├── .env.example
├── .gitignore
└── README.md
```

---

# 💻 Run Locally

## 1. Clone the repository

```bash
git clone https://github.com/sivamani-repo/StockSense.git
cd StockSense
```

---

## 2. Configure PostgreSQL

StockSense uses PostgreSQL for persistent storage.

Create a PostgreSQL database and configure the required connection values in the root `.env` file using:

```text
.env.example
```

as the reference.

---

## 3. Start the Backend

```bash
cd backend
python -m pip install -r requirements.txt
uvicorn app.main:app --reload
```

---

## 4. Start the Frontend

Open another terminal:

```bash
cd frontend
npm install
npm run dev
```

Vite will display the local development URL in the terminal.

---

# 🔐 Environment Variables

Keep sensitive configuration inside:

```text
.env
```

Do not commit secrets to GitHub.

Use:

```text
.env.example
```

to document the required environment variables.

---

# 🔄 Inventory Workflow

A typical StockSense workflow looks like:

```text
Receive Stock
      ↓
Inventory Updated
      ↓
Monitor Stock
      ↓
Transfer / Deliver
      ↓
Track Movement
      ↓
Adjust When Required
```

The dashboard provides a centralized view of these operations.

---

# 🎨 UI & UX

StockSense follows a modern enterprise-style interface with:

- Responsive design
- Clear navigation
- Consistent visual hierarchy
- Loading states
- Error handling
- Empty states
- Search and filtering
- Interactive dashboard elements
- Accessible form controls

---

# 🧩 Development & Collaboration

The project uses Git and GitHub for version control.

Example workflow:

```bash
git pull

git checkout -b feature/my-feature

git add .

git commit -m "feat: describe your change"

git push origin feature/my-feature
```

Contributors should make meaningful changes and keep their work visible through Git history.

---

# 🏆 Hackathon

### Odoo x GCET Hyderabad Hackathon 2026

StockSense was developed as the team's solution for the virtual coding round.

The project focuses on:

- Dynamic inventory data
- Responsive UI
- Input validation
- Inventory operations
- Backend APIs
- Local PostgreSQL storage
- Git-based collaboration

---

# 👥 Team

**StockSense Team**

- Sivamani Dasari
- Gunda Yuvaraju
- Gangishetti Raju
- Dasari Varun

---

# 📌 Project Status

StockSense is an active hackathon project.

The current implementation provides the core inventory management foundation and operational dashboard, with the architecture designed to support further extensions.

---

## 📄 License

This project is developed for the **Odoo x GCET Hyderabad Hackathon 2026**.
