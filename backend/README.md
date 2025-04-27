# ₹iddhi API

A robust REST API backend for a personal finance tracker application built with Node.js, TypeScript, and MongoDB following domain-driven design principles.

## Features

- **User Authentication**: Register, login, password reset, and profile management
- **Transactions Management**: Create, read, update, and delete financial transactions
- **Categories Management**: Organize transactions with customizable categories
- **Budget Planning**: Set and track budgets by category
- **Financial Goals**: Set and track financial goals
- **Account Management**: Track multiple financial accounts
- **Reports and Analytics**: Generate financial reports and insights
- **File Attachments**: Upload receipt images and documents for transactions

## Project Structure

The project follows a domain-driven design approach with the following structure:

```
/src
  /domains
    /auth                # Authentication and user management
    /transactions        # Transactions and categories
    /budgets             # Budget planning
    /goals              # Financial goals
    /accounts           # Account management
    /settings           # User preferences and settings
    /reports            # Financial reports and analytics
  /shared               # Shared utilities, middleware, and config
  app.ts                # Express application setup
  server.ts             # Server entry point
```

Each domain contains its own:

- Models (data structure)
- Services (business logic)
- Controllers (request handling)
- Routes (API endpoints)
- Middleware (domain-specific middleware)
- Types (TypeScript types and interfaces)

## Technology Stack

- **Node.js** - JavaScript runtime
- **TypeScript** - Typed JavaScript
- **MongoDB** - NoSQL database
- **Express** - Web framework
- **JSON Web Tokens (JWT)** - Authentication
- **Bcrypt** - Password hashing
- **Multer** - File uploads

## Getting Started

### Prerequisites

- Node.js (v14 or higher)
- MongoDB (local instance or MongoDB Atlas)

### Installation

1. Clone the repository:

   ```
   git clone https://github.com/yourusername/finance-tracker-api.git
   cd finance-tracker-api
   ```

2. Install dependencies:

   ```
   npm install
   ```

3. Create a `.env` file based on `.env.example`:

   ```
   cp .env.example .env
   ```

4. Update the `.env` file with your configuration.

5. Start the development server:
   ```
   npm run dev
   ```

### Build and Run

To build the project for production:

```
npm run build
```

To start the production server:

```
npm start
```

## API Documentation

The API follows RESTful conventions with the following main endpoints:

- `/api/auth` - Authentication endpoints
- `/api/transactions` - Transaction management
- `/api/budgets` - Budget planning
- `/api/goals` - Financial goals
- `/api/accounts` - Account management
- `/api/settings` - User preferences
- `/api/reports` - Financial reports

For detailed API documentation, refer to the API contract document.

## Security Features

- JWT-based authentication
- Password hashing with bcrypt
- CORS protection
- Helmet for HTTP security headers
- Input validation and sanitization
- Role-based access control
- User data isolation

## License

This project is licensed under the MIT License.
