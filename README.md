# ₹iddhi — Personal Finance Manager

![₹iddhi Dashboard](./riddhi-dashboard.png)

> **Take control of your financial future.** ₹iddhi is a full-stack personal finance application built for the Indian market — track transactions, plan budgets, manage goals, monitor investments, and get actionable insights, all in one place.

---

## Table of Contents

- [Features](#features)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Getting Started](#getting-started)
- [Docker](#docker)
- [Environment Variables](#environment-variables)
- [API Overview](#api-overview)
- [Scripts](#scripts)

---

## Features

### 💰 Dashboard

- Net worth at a glance
- Monthly income vs. expense cash flow chart
- Spending breakdown by category
- Recent transactions feed
- Goal progress snapshot

### 📊 Transactions

- Create, edit, and delete income / expense / transfer transactions
- Attach receipts and files to transactions
- Categorise with custom icons and colours
- Full-text search, multi-filter (type, date range, amount, status, tags) and sort
- Export transactions to CSV

### 📝 Budgets

- Create monthly budgets with income and allocation targets
- Add budget categories linked to transaction categories
- Real-time progress bars (on-track / near-limit / over-budget alerts)
- Monthly overview chart comparing income, spend, and budget
- Search and sort budget categories

### 🎯 Goals

- Savings, debt payoff, major purchase, retirement, and other goal types
- Target amount, target date, and contribution schedule
- Visual progress bars and time-remaining countdown
- Pause, resume, and complete goals
- Search and sort goals by priority, progress, due date, or name

### 💼 Investments

- Track stocks, ETFs, mutual funds, bonds, crypto, REITs, and more
- Asset-class filter (stocks, bonds, real estate, alternatives, cash)
- Gain/loss and % return per holding
- Asset allocation doughnut chart
- Portfolio performance over time chart
- Search and sort by value, performance, or name

### 📈 Reports & Insights

- Spending trend reports
- Category breakdown analysis
- Month-over-month comparisons
- Exportable data

### 🔔 Notifications

- In-app push notification support (Web Push API)
- Notification log with mark-as-read
- Scheduled background jobs (budget alerts, goal reminders)

### 🔍 Global Search

- Search across transactions, budgets, goals, accounts, and investments from the navbar
- Click a result to navigate directly to the item and highlight it on the page

### ⚙️ Settings

- Profile management (name, email, avatar)
- Currency and locale preferences
- Light / dark theme toggle
- Connected accounts management
- Notification preferences

---

## Tech Stack

### Backend

| Layer              | Technology                      |
| ------------------ | ------------------------------- |
| Runtime            | Node.js ≥ 18                    |
| Framework          | Express 4                       |
| Language           | TypeScript 5 (strict)           |
| Database           | MongoDB (native driver, no ODM) |
| Auth               | JWT + bcryptjs                  |
| Logging            | Pino + pino-http                |
| Validation         | validator.js                    |
| File uploads       | Multer                          |
| Push notifications | web-push                        |
| Scheduler          | node-cron                       |
| Package manager    | pnpm                            |

### Frontend

| Layer           | Technology         |
| --------------- | ------------------ |
| Framework       | React 19           |
| Build tool      | Vite 6             |
| Language        | TypeScript 5       |
| Routing         | React Router DOM 7 |
| Styling         | Tailwind CSS 3     |
| HTTP client     | Axios              |
| Charts          | Recharts           |
| Animations      | Framer Motion      |
| Icons           | Lucide React       |
| Date handling   | Day.js             |
| Utilities       | Lodash             |
| Package manager | pnpm               |

---

## Project Structure

```
/
├── backend/
│   └── src/
│       ├── accounts/       # Bank account management
│       ├── auth/           # JWT authentication (register, login, refresh)
│       ├── budgets/        # Budget creation & category tracking
│       ├── common/         # Shared utilities & logging helpers
│       ├── config/         # DB connection, Pino logger
│       ├── dashboard/      # Aggregated dashboard stats
│       ├── goals/          # Savings & debt goals
│       ├── investments/    # Investment portfolio
│       ├── middleware/     # Auth, error handling, file upload
│       ├── notifications/  # Web Push & notification log
│       ├── reports/        # Financial reports & insights
│       ├── schedular/      # Background cron jobs
│       ├── search/         # Global full-text search
│       ├── settings/       # User preferences
│       └── transactions/   # Transactions, categories, attachments
└── frontend/
    └── src/
        ├── components/     # Reusable UI components
        ├── contexts/       # React context providers
        ├── hooks/          # Custom React hooks
        ├── layouts/        # Page layout wrappers
        ├── pages/          # Route-level page components
        ├── services/       # Axios API client calls
        ├── types/          # Shared TypeScript interfaces & enums
        └── utils/          # Pure helper functions
```

---

## Getting Started

### Prerequisites

- Node.js ≥ 18
- pnpm (`npm i -g pnpm`)
- MongoDB instance (local or Atlas)

### 1. Clone the repo

```bash
git clone https://github.com/ashutoshgairola/Riddhi.git
cd Riddhi
```

### 2. Backend setup

```bash
cd backend
cp .env.example .env   # fill in your values (see below)
pnpm install
pnpm dev
```

### 3. Frontend setup

```bash
cd frontend
cp .env.example .env   # set VITE_API_BASE_URL
pnpm install
pnpm dev
```

The frontend dev server runs on **<http://localhost:5173>** and the API on **<http://localhost:3000>** (or whichever `PORT` you set).

---

## Docker

The easiest way to run the full stack (MongoDB + backend API + frontend) is with Docker Compose.

### Prerequisites

- [Docker](https://docs.docker.com/get-docker/) ≥ 24
- [Docker Compose](https://docs.docker.com/compose/) v2

### Quick start

```bash
# 1. Copy and fill in the root .env
cp .env.example .env
# Edit .env — at minimum set JWT_SECRET

# 2. Build and start all services
docker compose up --build

# 3. Open the app
open http://localhost
```

The compose stack starts three services:

| Service           | Container         | Port                          |
| ----------------- | ----------------- | ----------------------------- |
| MongoDB 7         | `riddhi_mongo`    | internal only                 |
| Express API       | `riddhi_backend`  | internal only (port 3000)     |
| nginx + React SPA | `riddhi_frontend` | **`80`** → `http://localhost` |

nginx proxies all `/api/*` requests to the backend so the frontend never needs to know the API's direct address.

### Useful commands

```bash
# Run in the background
docker compose up -d --build

# View logs
docker compose logs -f

# Stop and remove containers (keeps volumes)
docker compose down

# Stop and wipe all data (including MongoDB volume)
docker compose down -v
```

### Volumes

| Volume         | Purpose                                                               |
| -------------- | --------------------------------------------------------------------- |
| `mongo_data`   | Persistent MongoDB data                                               |
| `uploads_data` | User-uploaded attachments (shared between backend container and host) |

---

## Environment Variables

### `backend/.env`

```env
PORT=3000
MONGO_URI=mongodb://localhost:27017/riddhi
JWT_SECRET=your_jwt_secret_here
JWT_EXPIRES_IN=7d
VAPID_PUBLIC_KEY=your_vapid_public_key
VAPID_PRIVATE_KEY=your_vapid_private_key
VAPID_EMAIL=mailto:you@example.com
```

### `frontend/.env`

```env
VITE_API_BASE_URL=http://localhost:3000
```

---

## API Overview

All protected routes require an `Authorization: Bearer <token>` header.

| Module                 | Base Path                                         |
| ---------------------- | ------------------------------------------------- |
| Auth                   | `POST /api/auth/register`, `POST /api/auth/login` |
| Dashboard              | `GET /api/dashboard`                              |
| Transactions           | `GET/POST/PUT/DELETE /api/transactions`           |
| Transaction Categories | `GET/POST/PUT/DELETE /api/categories`             |
| Budgets                | `GET/POST/PUT/DELETE /api/budgets`                |
| Goals                  | `GET/POST/PUT/DELETE /api/goals`                  |
| Investments            | `GET/POST/PUT/DELETE /api/investments`            |
| Reports                | `GET /api/reports`                                |
| Accounts               | `GET/POST/PUT/DELETE /api/accounts`               |
| Search                 | `GET /api/search?q=<query>`                       |
| Notifications          | `GET/POST /api/notifications`                     |
| Settings               | `GET/PUT /api/settings`                           |

A full Postman collection is included at [`riddhi-postman-collection.json`](./riddhi-postman-collection.json).

---

## Scripts

### Backend

```bash
pnpm dev        # Start dev server with hot-reload (ts-node-dev)
pnpm build      # Compile TypeScript → build/
pnpm start      # Run compiled output
pnpm lint       # ESLint
pnpm format     # Prettier
pnpm test       # Jest
```

### Frontend

```bash
pnpm dev        # Vite dev server (http://localhost:5173)
pnpm build      # Type-check + Vite production build
pnpm preview    # Preview production build
pnpm lint       # ESLint
pnpm format     # Prettier
```

---

## License

MIT © [Ashutosh Gairola](https://github.com/ashutoshgairola)
