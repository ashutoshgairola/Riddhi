# FinTrack - Personal Finance Tracker

FinTrack is a comprehensive web application that helps users monitor their income, expenses, investments, and overall financial health. Built with React and TypeScript for the frontend and Node.js for the backend, it provides an intuitive interface for managing personal finances.

## Features

### User Account Management

- Secure authentication with email/password and 2FA
- User profile management with personal financial goals
- Account recovery options

### Dashboard

- Financial overview with key metrics (net worth, monthly cash flow)
- Customizable widgets for different financial aspects
- Recent transaction feed
- Goal progress tracking

### Transaction Management

- Manual transaction entry with categorization
- Bank account/credit card integration for automatic import
- Recurring transaction setup
- Receipt image upload and storage

### Budget Planning

- Monthly budget creation by category
- Budget vs. actual comparison visualizations
- Flexible budget adjustment tools
- Budget templates and recommendations

### Expense Analysis

- Categorized spending breakdown
- Spending trend analysis over time
- Custom reporting with exportable data

### Income Tracking

- Multiple income source management
- Income vs. expense ratio analysis
- Tax liability estimation

### Investment Portfolio Tracking

- Asset allocation visualization
- Individual investment performance tracking
- Integration with major brokerages
- Historical performance analysis

### Debt Management

- Loan and credit card debt tracking
- Interest payment analysis
- Debt payoff strategy tools

### Financial Goal Setting

- Goal creation with target amounts and deadlines
- Progress visualization
- Goal priority management

## Tech Stack

### Frontend

- React with TypeScript
- React Router for navigation
- Context API for state management
- Recharts for data visualization
- Tailwind CSS for styling

### Backend

- Node.js with TypeScript
- Express.js framework
- MongoDB for data storage
- JWT for authentication
- RESTful API design

## Getting Started

### Prerequisites

- Node.js (v16.x or later)
- npm (v8.x or later)
- MongoDB (v5.x or later)

### Installation

1. Clone the repository

```bash
git clone https://github.com/yourusername/fintrack.git
cd fintrack
```

2. Install dependencies for both frontend and backend

```bash
# Install backend dependencies
cd server
npm install

# Install frontend dependencies
cd ../client
npm install
```

3. Create .env files

In the `server` directory, create a `.env` file:

```
PORT=5000
MONGODB_URI=mongodb://localhost:27017/fintrack
JWT_SECRET=yoursecretkey
```

In the `client` directory, create a `.env` file:

```
REACT_APP_API_URL=http://localhost:5000/api
```

4. Start the development servers

For the backend:

```bash
cd server
npm run dev
```

For the frontend:

```bash
cd client
npm start
```

5. Access the application at `http://localhost:3000`

## Project Structure

```
fintrack/
├── client/                        # Frontend React application
│   ├── public/                    # Public assets
│   └── src/
│       ├── assets/                # Images and icons
│       ├── components/            # React components
│       ├── contexts/              # Context providers
│       ├── hooks/                 # Custom React hooks
│       ├── layouts/               # Page layouts
│       ├── pages/                 # Page components
│       ├── services/              # API services
│       ├── types/                 # TypeScript type definitions
│       └── utils/                 # Utility functions
├── server/                        # Backend Node.js application
│   ├── src/
│   │   ├── config/                # Configuration files
│   │   ├── controllers/           # Route controllers
│   │   ├── middleware/            # Express middleware
│   │   ├── models/                # MongoDB models
│   │   ├── routes/                # API routes
│   │   ├── services/              # Business logic
│   │   ├── types/                 # TypeScript type definitions
│   │   └── utils/                 # Utility functions
│   └── tests/                     # Backend tests
├── .gitignore
├── package.json
└── README.md
```

## API Documentation

The backend provides a RESTful API for the frontend application. The API is organized into the following resources:

- `/api/auth` - Authentication and user management
- `/api/transactions` - Transaction management
- `/api/budgets` - Budget planning
- `/api/goals` - Financial goal tracking
- `/api/accounts` - Account management
- `/api/settings` - User preferences and settings
- `/api/reports` - Financial reporting and analysis

For detailed API documentation, see [API.md](./API.md).

## Development

### Code Style

We use ESLint and Prettier to enforce code style. Please ensure your code passes linting before submitting PRs:

```bash
# In client or server directory
npm run lint
```

### Testing

Run tests with:

```bash
# In client or server directory
npm test
```

## Deployment

### Prerequisites

- Node.js (v16.x or later)
- MongoDB database (hosted or self-managed)

### Build

To build for production:

```bash
# Build frontend
cd client
npm run build

# Build backend
cd ../server
npm run build
```

### Deployment Options

1. **Self-hosted**: Deploy the Node.js backend and serve the React static files
2. **Containerized**: Docker configurations are available in the `docker` directory
3. **Cloud platforms**: Deploy to Heroku, AWS, Azure, or Google Cloud

## Roadmap

- Mobile app development
- Financial advisor network integration
- AI-powered financial recommendations
- International market expansion with multi-currency support

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

Please ensure your code follows the project's style guidelines and include appropriate tests.

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Acknowledgments

- [Recharts](https://recharts.org/) for data visualization
- [Tailwind CSS](https://tailwindcss.com/) for UI styling
- [React Router](https://reactrouter.com/) for navigation
- [Express.js](https://expressjs.com/) for the backend API

## Contact

Project Link: [https://github.com/yourusername/fintrack](https://github.com/yourusername/fintrack)
