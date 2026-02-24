// src/pages/ForgotPassword.tsx
import { FormEvent, useEffect, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';

import { motion } from 'framer-motion';
import { AlertCircle, ArrowLeft, Check, Eye, EyeOff, KeyRound } from 'lucide-react';

import { useAuth } from '../hooks/useAuth';

// Use your existing hook

// Floating elements for background visual interest
const FloatingElements = () => (
  <div className="absolute inset-0 overflow-hidden pointer-events-none">
    <motion.div
      animate={{
        y: [0, -10, 0],
        opacity: [0.6, 1, 0.6],
      }}
      transition={{
        duration: 6,
        repeat: Infinity,
        ease: 'easeInOut',
      }}
      className="absolute top-10 left-1/3"
    >
      <svg width="40" height="40" viewBox="0 0 40 40" fill="none">
        <circle cx="20" cy="20" r="20" fill="#E8F5E9" />
      </svg>
    </motion.div>
    <motion.div
      animate={{
        y: [0, 10, 0],
        opacity: [0.4, 0.8, 0.4],
      }}
      transition={{
        duration: 8,
        repeat: Infinity,
        ease: 'easeInOut',
        delay: 1,
      }}
      className="absolute bottom-20 right-1/4"
    >
      <svg width="60" height="60" viewBox="0 0 60 60" fill="none">
        <rect width="60" height="60" rx="12" fill="#C8E6C9" />
      </svg>
    </motion.div>
    <motion.div
      animate={{
        x: [0, 15, 0],
        y: [0, -5, 0],
        rotate: [0, 10, 0],
        opacity: [0.3, 0.6, 0.3],
      }}
      transition={{
        duration: 10,
        repeat: Infinity,
        ease: 'easeInOut',
        delay: 2,
      }}
      className="absolute top-1/3 right-10"
    >
      <svg width="30" height="30" viewBox="0 0 30 30" fill="none">
        <polygon points="15,0 30,30 0,30" fill="#A5D6A7" />
      </svg>
    </motion.div>
  </div>
);

const ResetPasswordForm = ({ token, onSuccess }: { token: string; onSuccess: () => void }) => {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [formError, setFormError] = useState('');
  const { confirmPasswordReset, loading, error, clearError } = useAuth();

  useEffect(() => {
    if (error) {
      clearError();
    }
    setFormError('');
  }, [password, confirmPassword, clearError, error]);

  const validateForm = (): boolean => {
    if (password.length < 8) {
      setFormError('Password must be at least 8 characters');
      return false;
    }

    if (password !== confirmPassword) {
      setFormError('Passwords do not match');
      return false;
    }

    return true;
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    const success = await confirmPasswordReset({
      token,
      newPassword: password,
    });

    if (success) {
      onSuccess();
    }
  };

  return (
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

      <div>
        <label htmlFor="password" className="block text-sm font-medium leading-6 text-gray-900">
          New Password
        </label>
        <div className="mt-2 relative">
          <input
            id="password"
            name="password"
            type={showPassword ? 'text' : 'password'}
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="block w-full rounded-md border-0 py-3 px-4 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-green-600 text-base leading-normal pr-10"
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600"
          >
            {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
          </button>
        </div>
      </div>

      <div>
        <label
          htmlFor="confirmPassword"
          className="block text-sm font-medium leading-6 text-gray-900"
        >
          Confirm New Password
        </label>
        <div className="mt-2">
          <input
            id="confirmPassword"
            name="confirmPassword"
            type={showPassword ? 'text' : 'password'}
            required
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            className={`block w-full rounded-md border-0 py-3 px-4 text-gray-900 shadow-sm ring-1 ring-inset ${
              confirmPassword && password !== confirmPassword
                ? 'ring-red-300 focus:ring-red-600'
                : 'ring-gray-300 focus:ring-green-600'
            } placeholder:text-gray-400 focus:ring-2 focus:ring-inset text-base leading-normal`}
          />
        </div>
        {confirmPassword && password !== confirmPassword && (
          <p className="mt-1 text-xs text-red-600">Passwords don't match</p>
        )}
      </div>

      <div>
        <button
          type="submit"
          disabled={loading}
          className="flex w-full justify-center items-center rounded-md bg-green-600 px-3 py-3 text-sm font-semibold text-white shadow-sm hover:bg-green-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-green-600 transition-colors"
        >
          {loading ? (
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
            <KeyRound className="mr-2" size={18} />
          )}
          {loading ? 'Resetting password...' : 'Reset Password'}
        </button>
      </div>
    </form>
  );
};

const RequestResetForm = ({ onRequestSent }: { onRequestSent: () => void }) => {
  const [email, setEmail] = useState('');
  const [formError, setFormError] = useState('');
  const { requestPasswordReset, loading, error, clearError } = useAuth();

  useEffect(() => {
    if (error) {
      clearError();
    }
    setFormError('');
  }, [email, clearError, error]);

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

    return true;
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    const success = await requestPasswordReset(email);
    if (success) {
      onRequestSent();
    }
  };

  return (
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

      <div>
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
            className="block w-full rounded-md border-0 py-3 px-4 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-green-600 text-base leading-normal"
            placeholder="Enter your registered email"
          />
        </div>
      </div>

      <div>
        <button
          type="submit"
          disabled={loading}
          className="flex w-full justify-center items-center rounded-md bg-green-600 px-3 py-3 text-sm font-semibold text-white shadow-sm hover:bg-green-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-green-600 transition-colors"
        >
          {loading ? (
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
            <KeyRound className="mr-2" size={18} />
          )}
          {loading ? 'Sending reset link...' : 'Send Reset Link'}
        </button>
      </div>
    </form>
  );
};

// Main component
const ForgotPassword = () => {
  const [requestSent, setRequestSent] = useState(false);
  const [resetSuccess, setResetSuccess] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  // Get token from query params
  const queryParams = new URLSearchParams(location.search);
  const token = queryParams.get('token');

  const handleRequestSent = () => {
    setRequestSent(true);
  };

  const handleResetSuccess = () => {
    setResetSuccess(true);
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-12 bg-white relative">
      <FloatingElements />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="max-w-md w-full space-y-8 relative z-10"
      >
        <div className="text-center">
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.5 }}
            className="mx-auto h-16 w-16 rounded-full bg-green-100 flex items-center justify-center text-green-700"
          >
            <KeyRound size={30} />
          </motion.div>

          <h2 className="mt-6 text-3xl font-bold text-gray-900">
            {token
              ? resetSuccess
                ? 'Password Reset Complete'
                : 'Reset Your Password'
              : requestSent
                ? 'Check Your Email'
                : 'Forgot Your Password?'}
          </h2>

          <p className="mt-2 text-sm text-gray-600">
            {token
              ? resetSuccess
                ? 'Your password has been successfully reset.'
                : 'Please enter your new password below.'
              : requestSent
                ? "We've sent a password reset link to your email."
                : "Enter your email and we'll send you a link to reset your password."}
          </p>
        </div>

        <div className="mt-8 bg-white p-6 rounded-lg shadow-sm border border-gray-100">
          {token ? (
            resetSuccess ? (
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.4 }}
                className="flex flex-col items-center"
              >
                <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center text-green-600 mb-4">
                  <Check size={30} />
                </div>
                <p className="text-center mb-6">
                  Your password has been successfully reset. You can now log in with your new
                  password.
                </p>
                <button
                  onClick={() => navigate('/login')}
                  className="w-full bg-green-600 text-white py-3 px-4 rounded-md font-medium hover:bg-green-500 transition-colors"
                >
                  Go to Login
                </button>
              </motion.div>
            ) : (
              <ResetPasswordForm token={token} onSuccess={handleResetSuccess} />
            )
          ) : requestSent ? (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.4 }}
              className="flex flex-col items-center"
            >
              <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center text-green-600 mb-4">
                <Check size={30} />
              </div>
              <p className="text-center mb-6">
                Please check your email for a link to reset your password. If you don't receive an
                email within a few minutes, check your spam folder.
              </p>
              <button
                onClick={() => setRequestSent(false)}
                className="text-green-600 hover:text-green-500 font-medium flex items-center"
              >
                <ArrowLeft size={16} className="mr-1" />
                Try with different email
              </button>
            </motion.div>
          ) : (
            <RequestResetForm onRequestSent={handleRequestSent} />
          )}
        </div>

        <div className="text-center mt-6">
          <Link
            to="/login"
            className="text-sm font-medium text-green-600 hover:text-green-500 flex items-center justify-center"
          >
            <ArrowLeft size={16} className="mr-1" />
            Back to Login
          </Link>
        </div>
      </motion.div>
    </div>
  );
};

export default ForgotPassword;
