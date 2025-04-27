// src/routes.tsx
import { createBrowserRouter, Navigate } from "react-router-dom";

// Layouts
// import AuthLayout from "./layouts/AuthLayout";
import DashboardLayout from "./layouts/DashboardLayout";

// Auth pages
// import Login from "./pages/auth/Login";
// import Register from "./pages/auth/Register";
// import ResetPassword from "./pages/auth/ResetPassword";

// Main pages
import Dashboard from "./pages/Dashboard";
import Transactions from "./pages/Transactions";
import Budgets from "./pages/Budgets";
import Goals from "./pages/Goals";
import Investments from "./pages/Investments";
import Reports from "./pages/Reports";
import Settings from "./pages/Settings";

// Auth guard component
// import AuthGuard from "./components/auth/AuthGuard";

const routes = createBrowserRouter([
  {
    path: "/",
    element: <Navigate to="/dashboard" replace />,
  },
  // {
  //   path: "/",
  //   element: <AuthLayout />,
  //   children: [
  //     {
  //       path: "login",
  //       element: <Login />,
  //     },
  //     {
  //       path: "register",
  //       element: <Register />,
  //     },
  //     {
  //       path: "reset-password",
  //       element: <ResetPassword />,
  //     },
  //   ],
  // },
  {
    path: "/",
    element: (
      // <AuthGuard>
      <DashboardLayout />
      // </AuthGuard>
    ),
    children: [
      {
        path: "dashboard",
        element: <Dashboard />,
      },
      {
        path: "transactions",
        element: <Transactions />,
      },
      {
        path: "budgets",
        element: <Budgets />,
      },
      {
        path: "goals",
        element: <Goals />,
      },
      {
        path: "investments",
        element: <Investments />,
      },
      {
        path: "reports",
        element: <Reports />,
      },
      {
        path: "settings",
        element: <Settings />,
      },
    ],
  },
  {
    path: "*",
    element: <Navigate to="/dashboard" replace />,
  },
]);

export default routes;
