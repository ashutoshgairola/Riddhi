// src/pages/Login.tsx
import { FormEvent, useEffect, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';

import { motion } from 'framer-motion';
import { AlertCircle, ArrowRight, Eye, EyeOff, LogIn } from 'lucide-react';

import { useAuth } from '../hooks/useAuth';

// SVG elements for background decoration
const BackgroundElements = () => (
  <div className="absolute inset-0 overflow-hidden opacity-20 pointer-events-none">
    <svg className="absolute -right-10 top-10 w-56 h-56 text-green-500 fill-current opacity-20">
      <circle cx="56" cy="56" r="56" />
    </svg>
    <svg className="absolute left-20 bottom-10 w-72 h-72 text-green-400 fill-current opacity-20">
      <circle cx="120" cy="120" r="120" />
    </svg>
    <svg className="absolute -top-40 -right-40 w-96 h-96 text-green-600 fill-current opacity-10">
      <circle cx="120" cy="120" r="120" />
    </svg>
    <div className="absolute inset-x-0 bottom-0 h-40 bg-gradient-to-t from-white to-transparent"></div>
  </div>
);

// Animated decorative shapes
const AnimatedShapes = () => (
  <div className="absolute inset-0 overflow-hidden">
    <motion.div
      animate={{
        y: [0, 10, 0],
        opacity: [0.8, 1, 0.8],
      }}
      transition={{
        duration: 8,
        repeat: Infinity,
        ease: 'easeInOut',
      }}
      className="absolute top-20 left-20"
    >
      <svg width="40" height="40" viewBox="0 0 40 40" fill="none">
        <rect width="40" height="40" rx="8" fill="#4CAF50" fillOpacity="0.1" />
      </svg>
    </motion.div>
    <motion.div
      animate={{
        y: [0, -20, 0],
        opacity: [0.7, 1, 0.7],
      }}
      transition={{
        duration: 10,
        repeat: Infinity,
        ease: 'easeInOut',
        delay: 1,
      }}
      className="absolute bottom-40 right-32"
    >
      <svg width="60" height="60" viewBox="0 0 60 60" fill="none">
        <circle cx="30" cy="30" r="30" fill="#2E7D32" fillOpacity="0.15" />
      </svg>
    </motion.div>
    <motion.div
      animate={{
        x: [0, 15, 0],
        y: [0, -5, 0],
        opacity: [0.5, 1, 0.5],
      }}
      transition={{
        duration: 12,
        repeat: Infinity,
        ease: 'easeInOut',
        delay: 2,
      }}
      className="absolute top-60 right-20"
    >
      <svg width="80" height="80" viewBox="0 0 80 80" fill="none">
        <polygon points="0,0 80,0 40,70" fill="#81C784" fillOpacity="0.1" />
      </svg>
    </motion.div>
  </div>
);

// Main login component
const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [formError, setFormError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { login, error, loading, clearError } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  // Get the intended destination from location state, if available
  const from = location.state?.from?.pathname || '/dashboard';

  // Clear API errors when form changes
  useEffect(() => {
    if (error) {
      clearError();
    }
    setFormError('');
  }, [email, password, clearError, error]);

  // Validate the form
  const validateForm = (): boolean => {
    if (!email.trim()) {
      setFormError('Email is required');
      return false;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setFormError('Please enter a valid email address');
      return false;
    }

    if (!password) {
      setFormError('Password is required');
      return false;
    }

    return true;
  };

  // Handle form submission
  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();

    if (!validateForm() || isSubmitting) {
      return;
    }

    try {
      setIsSubmitting(true);
      const success = await login({ email, password });

      if (success) {
        navigate('/dashboard');
        console.log('Login successful, redirecting to', from);
      }
    } catch (err) {
      console.error('Login error:', err);
      setFormError('An unexpected error occurred during login');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col md:flex-row">
      {/* Left side - Branding and info */}
      <motion.div
        initial={{ x: -50, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        transition={{ duration: 0.6 }}
        className="bg-gradient-to-br from-green-100 via-green-50 to-white relative hidden md:flex md:w-1/2 p-12 flex-col justify-between overflow-hidden"
      >
        <BackgroundElements />
        <AnimatedShapes />

        <div className="relative z-10">
          <h1 className="text-4xl font-bold text-green-800">₹iddhi</h1>
          <p className="text-green-600 mt-2">Personal Finance Management</p>
        </div>

        <div className="relative z-10 max-w-md">
          <h2 className="text-2xl font-bold text-green-800 mb-4">
            Take control of your financial future
          </h2>
          <p className="text-green-700 mb-6">
            Track expenses, manage budgets, and achieve your financial goals with our comprehensive
            suite of tools.
          </p>

          <div className="flex flex-col gap-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-green-200 flex items-center justify-center text-green-700">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
                </svg>
              </div>
              <div>
                <h3 className="font-semibold text-green-800">Track Expenses</h3>
                <p className="text-sm text-green-600">Monitor where your money goes</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-green-200 flex items-center justify-center text-green-700">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <rect x="2" y="3" width="20" height="14" rx="2" ry="2" />
                  <line x1="8" y1="21" x2="16" y2="21" />
                  <line x1="12" y1="17" x2="12" y2="21" />
                </svg>
              </div>
              <div>
                <h3 className="font-semibold text-green-800">Budget Planning</h3>
                <p className="text-sm text-green-600">Set realistic financial targets</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-green-200 flex items-center justify-center text-green-700">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
                </svg>
              </div>
              <div>
                <h3 className="font-semibold text-green-800">Financial Insights</h3>
                <p className="text-sm text-green-600">Visualize your financial patterns</p>
              </div>
            </div>
          </div>
        </div>

        <div className="relative z-10 text-sm text-green-700">
          <p>© {new Date().getFullYear()} ₹iddhi. All rights reserved.</p>
        </div>
      </motion.div>

      {/* Right side - Login form */}
      <motion.div
        initial={{ x: 50, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        transition={{ duration: 0.6, delay: 0.2 }}
        className="flex-1 flex flex-col justify-center px-6 py-12 lg:px-8 bg-white"
      >
        <div className="sm:mx-auto sm:w-full sm:max-w-sm">
          <div className="flex justify-center">
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.5, delay: 0.5 }}
              className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center text-green-700"
            >
              <LogIn size={30} />
            </motion.div>
          </div>
          <h2 className="mt-6 text-center text-2xl font-bold leading-9 tracking-tight text-gray-900">
            Welcome back
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">Sign in to access your account</p>
        </div>

        <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-sm">
          <form onSubmit={handleSubmit} className="space-y-6">
            {(formError || error) && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="p-3 rounded-md bg-red-50 border border-red-200 text-red-600 flex items-center gap-2"
              >
                <AlertCircle size={16} />
                <span className="text-sm">
                  {formError || (error?.message ? error.message : 'An error occurred')}
                </span>
              </motion.div>
            )}

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
            >
              <label htmlFor="email" className="block text-sm font-medium leading-6 text-gray-900">
                Email address
              </label>
              <div className="mt-2">
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="block w-full rounded-md border-0 py-3 px-4 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-green-600 sm:text-sm sm:leading-6"
                  disabled={loading || isSubmitting}
                />
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
            >
              <div className="flex items-center justify-between">
                <label
                  htmlFor="password"
                  className="block text-sm font-medium leading-6 text-gray-900"
                >
                  Password
                </label>
                <div className="text-sm">
                  <Link
                    to="/forgot-password"
                    className="font-semibold text-green-600 hover:text-green-500"
                  >
                    Forgot password?
                  </Link>
                </div>
              </div>
              <div className="mt-2 relative">
                <input
                  id="password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="current-password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="block w-full rounded-md border-0 py-3 px-4 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-green-600 sm:text-sm sm:leading-6 pr-10"
                  disabled={loading || isSubmitting}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600"
                  disabled={loading || isSubmitting}
                >
                  {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="flex items-center"
            >
              <input
                id="remember-me"
                name="remember-me"
                type="checkbox"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                className="h-4 w-4 rounded border-gray-300 text-green-600 focus:ring-green-600"
                disabled={loading || isSubmitting}
              />
              <label htmlFor="remember-me" className="ml-2 block text-sm text-gray-900">
                Remember me
              </label>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
            >
              <button
                type="submit"
                disabled={loading || isSubmitting}
                className="flex w-full justify-center items-center rounded-md bg-green-600 px-3 py-3 text-sm font-semibold text-white shadow-sm hover:bg-green-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-green-600 transition-colors disabled:opacity-70 disabled:cursor-not-allowed"
              >
                {loading || isSubmitting ? (
                  <svg
                    className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    ></circle>
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    ></path>
                  </svg>
                ) : (
                  <LogIn className="mr-2" size={18} />
                )}
                {loading || isSubmitting ? 'Signing in...' : 'Sign in'}
              </button>
            </motion.div>
          </form>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.7 }}
            className="mt-8 text-center"
          >
            <p className="text-sm text-gray-500">
              Don't have an account?{' '}
              <Link
                to="/register"
                className="font-semibold leading-6 text-green-600 hover:text-green-500 inline-flex items-center"
              >
                Create an account
                <ArrowRight size={16} className="ml-1" />
              </Link>
            </p>
          </motion.div>
        </div>
      </motion.div>
    </div>
  );
};

export default Login;
