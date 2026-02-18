# GitHub Copilot Instructions for ₹iddhi

## Project Overview

₹iddhi is a full-stack personal finance management application. It consists of:

- **Backend**: Node.js + Express + TypeScript REST API using MongoDB
- **Frontend**: React 19 + TypeScript + Vite SPA styled with Tailwind CSS

---

## Repository Structure

```
/
├── backend/        # Express API (TypeScript, MongoDB)
│   └── src/
│       ├── accounts/       # Bank account management
│       ├── auth/           # JWT authentication
│       ├── budgets/        # Budget planning
│       ├── common/         # Shared utilities & logging helpers
│       ├── config/         # DB connection, Pino logger
│       ├── goals/          # Savings & debt goals
│       ├── middleware/     # Auth, error handling, file upload
│       ├── reports/        # Financial reports & insights
│       ├── settings/       # User preferences
│       └── transactions/   # Transactions, categories, attachments
└── frontend/       # React SPA (Vite, Tailwind CSS)
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

## Tech Stack

### Backend

- **Runtime**: Node.js (>=14)
- **Framework**: Express 4
- **Language**: TypeScript 5 (strict mode, `noImplicitAny`, `strictNullChecks`)
- **Database**: MongoDB (native driver, no ODM)
- **Auth**: JWT (`jsonwebtoken`) + bcryptjs
- **Logging**: Pino + pino-http with trace middleware
- **Validation**: `validator` library
- **File uploads**: Multer
- **Package manager**: pnpm

### Frontend

- **Framework**: React 19
- **Build tool**: Vite 6
- **Language**: TypeScript 5
- **Routing**: React Router DOM 7
- **Styling**: Tailwind CSS 3
- **HTTP client**: Axios
- **Charts**: Recharts
- **Animations**: Framer Motion
- **Icons**: Lucide React
- **Date handling**: Day.js
- **Utilities**: Lodash
- **Package manager**: pnpm

---

## Coding Conventions

### General

- Use **TypeScript** everywhere; avoid `any` types.
- Prefer explicit return types on functions and methods.
- Use `const` by default; use `let` only when re-assignment is needed.
- Keep files focused on a single responsibility.

### Backend

- Follow the layered architecture: **routes → controller → service → db**.
  - `routes.ts` – Express router, no business logic.
  - `controller.ts` – Request/response handling, input validation, calls service.
  - `service.ts` – Business logic, calls db layer.
  - `db.ts` – All MongoDB queries; returns plain domain objects or DTOs.
- Place domain types in `<module>/types/interface.ts`.
- Use `log` (Pino) from `./config/logger` for structured logging; never use `console.log`.
- Handle all async errors with `try/catch` and pass errors to `next()` for the error middleware.
- Passwords are hashed with `bcryptjs`; never store or log plain-text passwords.
- All protected routes must use `AuthMiddleware`.
- MongoDB `_id` fields should be typed as `string | ObjectId` and converted to strings in DTOs.

### Frontend

- Components live under `src/components/` (shared) or `src/pages/` (route-level).
- API calls belong in `src/services/`; never make Axios calls directly in components or hooks.
- Global state is managed via React Context in `src/contexts/`.
- Use custom hooks in `src/hooks/` to encapsulate stateful logic.
- Tailwind utility classes are preferred over custom CSS; avoid inline styles.
- Use Framer Motion for animations; keep animations subtle and purposeful.
- Use Lucide React for all icons; do not introduce a second icon library.
- Format dates with Day.js; do not use `new Date().toLocaleDateString()` directly.
- Use Recharts for all data visualisations.

---

## Naming Conventions

| Artifact              | Convention                                              | Example                                         |
| --------------------- | ------------------------------------------------------- | ----------------------------------------------- |
| Files & folders       | `kebab-case` (backend), `PascalCase` (React components) | `transaction-service.ts`, `TransactionList.tsx` |
| Interfaces            | `PascalCase` prefixed with context                      | `TransactionDTO`, `BudgetService`               |
| React components      | `PascalCase`                                            | `BudgetCard`                                    |
| Hooks                 | `camelCase` prefixed with `use`                         | `useTransactions`                               |
| Constants             | `UPPER_SNAKE_CASE`                                      | `MAX_FILE_SIZE`                                 |
| Environment variables | `UPPER_SNAKE_CASE`                                      | `MONGO_URI`, `JWT_SECRET`                       |

---

## Environment Variables

### Backend (`backend/.env`)

```
PORT=
MONGO_URI=
JWT_SECRET=
JWT_EXPIRES_IN=
```

### Frontend (`frontend/.env`)

```
VITE_API_BASE_URL=
```

---

## Common Patterns

### Adding a new backend module

1. Create a folder under `backend/src/<module>/`.
2. Add `types/interface.ts`, `db.ts`, `service.ts`, `controller.ts`, `routes.ts`.
3. Register the router in `backend/src/app.ts`.

### Adding a new frontend page

1. Create `src/pages/<Page>.tsx`.
2. Add the route in `src/routes.tsx`.
3. Create any required service functions in `src/services/`.

### Error handling (backend)

- Throw typed errors with an HTTP status code property.
- The `ErrorMiddleware` in `src/middleware/error.ts` catches all unhandled errors and returns a consistent JSON error response.

---

## Scripts

### Backend

```bash
pnpm dev        # Start dev server with hot-reload (ts-node-dev)
pnpm build      # Compile TypeScript to build/
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
