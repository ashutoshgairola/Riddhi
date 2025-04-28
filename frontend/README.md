# ₹iddhi Frontend

The frontend application for ₹iddhi - a comprehensive personal finance management platform. This React application provides an intuitive and responsive user interface for the ₹iddhi API.

## Features

- **Interactive Dashboard**: Visualize your financial data with customizable widgets
- **Transaction Management**: Track and categorize income and expenses with ease
- **Budget Planning**: Create and monitor monthly budgets by category
- **Goal Tracking**: Set financial goals and visualize your progress
- **Investment Portfolio**: Monitor your investments with detailed analytics
- **Reports & Insights**: Generate custom reports to gain financial insights
- **Account Management**: Connect multiple financial accounts in one place
- **Responsive Design**: Seamless experience across desktop, tablet, and mobile devices

## Tech Stack

- **React 18**: UI library for building the application interface
- **TypeScript**: For type-safe code and improved developer experience
- **React Router**: For application routing
- **Context API**: For state management across the application
- **Recharts**: For interactive data visualizations
- **Tailwind CSS**: For styling with a utility-first approach
- **React Hook Form**: For form handling with validation

## Getting Started

### Prerequisites

- Node.js (v16.x or later)
- npm (v8.x or later)
- API backend running (see the ₹iddhi API repository)

### Installation

1. Clone the repository

```bash
git clone https://github.com/riddhi/frontend.git
cd frontend
```

2. Install dependencies

```bash
npm install
```

3. Create a `.env` file in the root directory with the following variables:

```
REACT_APP_API_URL=http://localhost:5000/api
```

4. Start the development server

```bash
npm start
```

5. The application will be available at `http://localhost:3000`

## Development

### Available Scripts

- `npm start` - Runs the app in development mode
- `npm test` - Launches the test runner
- `npm run build` - Builds the app for production
- `npm run lint` - Lints the code using ESLint
- `npm run format` - Formats the code using Prettier

### Project Structure

```
src/
├── assets/            # Static assets like images
├── components/        # Reusable components
│   ├── auth/          # Authentication components
│   ├── budgets/       # Budget-related components
│   ├── common/        # Shared components
│   ├── dashboard/     # Dashboard widgets and components
│   ├── goals/         # Goal-tracking components
│   ├── investments/   # Investment components
│   ├── reports/       # Reporting and analytics components
│   ├── settings/      # User settings components
│   └── transactions/  # Transaction management components
├── contexts/          # React Context providers
├── hooks/             # Custom React hooks
├── layouts/           # Page layouts
├── pages/             # Page components
├── services/          # API service integrations
├── types/             # TypeScript type definitions
└── utils/             # Utility functions
```

### Component Development

Components follow a standard structure:

- Each component is in its own directory with related files
- TypeScript interfaces for component props
- Proper error handling and loading states
- Jest tests for component functionality

### Styling

This project uses Tailwind CSS for styling. Custom theme configuration is available in the `tailwind.config.js` file.

## Deployment

### Building for Production

```bash
npm run build
```

This creates a `build` directory with optimized production files that can be served from any static file server.

### Deployment Options

- **Static hosting**: Deploy to services like Netlify, Vercel, or GitHub Pages
- **Docker**: Containerized deployment using the included Dockerfile
- **Traditional hosting**: Upload build files to any web server

## Contributing

Contributions are welcome! Please check out our [contribution guidelines](CONTRIBUTING.md) for details on how to get started.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## Design System

The application follows a consistent design system:

- Color palette focuses on greens and blues for a financial application feel
- Typography uses Inter for readability across devices
- Components follow accessibility best practices
- Mobile-first responsive design approach
