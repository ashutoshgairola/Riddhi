// src/routes.tsx
import { Navigate, createBrowserRouter } from 'react-router-dom';

// Import Auth Components
import ProtectedRoute from './components/auth/ProtectedRoute';
import PublicRoute from './components/auth/PublicRoute.tsx';
// Layouts
import DashboardLayout from './layouts/DashboardLayout';
import Budgets from './pages/Budgets';
// Main pages
import Dashboard from './pages/Dashboard';
import ForgotPassword from './pages/ForgotPassword';
import Goals from './pages/Goals';
import Investments from './pages/Investments';
// Auth pages
import Login from './pages/Login';
import Register from './pages/Register';
import Reports from './pages/Reports';
import Settings from './pages/Settings';
import TransactionCategories from './pages/TransactionCategories';
import Transactions from './pages/Transactions';

// Main routes configuration
const routes = createBrowserRouter([
  {
    path: '/',
    element: <Navigate to="/dashboard" replace />,
  },
  // Auth routes with modern UI
  {
    path: '/login',
    element: (
      <PublicRoute>
        <Login />
      </PublicRoute>
    ),
  },
  {
    path: '/register',
    element: (
      <PublicRoute>
        <Register />
      </PublicRoute>
    ),
  },
  {
    path: '/forgot-password',
    element: (
      <PublicRoute>
        <ForgotPassword />
      </PublicRoute>
    ),
  },
  // Protected dashboard routes
  {
    path: '/',
    element: (
      <ProtectedRoute>
        <DashboardLayout />
      </ProtectedRoute>
    ),
    children: [
      {
        path: 'dashboard',
        element: <Dashboard />,
      },
      {
        path: 'transactions',
        element: <Transactions />,
      },
      {
        path: 'transactions/categories',
        element: <TransactionCategories />,
      },
      {
        path: 'budgets',
        element: <Budgets />,
      },
      {
        path: 'goals',
        element: <Goals />,
      },
      {
        path: 'investments',
        element: <Investments />,
      },
      {
        path: 'reports',
        element: <Reports />,
      },
      {
        path: 'settings',
        element: <Settings />,
      },
    ],
  },
  {
    path: '*',
    element: <Navigate to="/dashboard" replace />,
  },
]);

export default routes;
