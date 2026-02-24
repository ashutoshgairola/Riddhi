// src/pages/Register.tsx
import { FormEvent, useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';

import { motion } from 'framer-motion';
import { AlertCircle, ArrowLeft, Check, Eye, EyeOff, UserPlus } from 'lucide-react';

import { useAuth } from '../hooks/useAuth';

// Use your existing hook

// Animated blob background
const AnimatedBlobs = () => (
  <div className="absolute inset-0 overflow-hidden">
    <motion.div
      animate={{
        scale: [1, 1.1, 1],
        x: [0, -10, 0],
        y: [0, 10, 0],
        opacity: [0.6, 0.8, 0.6],
      }}
      transition={{
        duration: 12,
        repeat: Infinity,
        ease: 'easeInOut',
      }}
      className="absolute top-1/4 -right-24 w-64 h-64 rounded-full bg-gradient-to-br from-green-200 to-green-300 blur-3xl opacity-60"
    />
    <motion.div
      animate={{
        scale: [1, 0.9, 1],
        x: [0, 15, 0],
        y: [0, -15, 0],
        opacity: [0.5, 0.7, 0.5],
      }}
      transition={{
        duration: 15,
        repeat: Infinity,
        ease: 'easeInOut',
        delay: 2,
      }}
      className="absolute bottom-1/3 -left-20 w-80 h-80 rounded-full bg-gradient-to-tr from-green-100 to-green-200 blur-3xl opacity-40"
    />
    <motion.div
      animate={{
        scale: [1, 1.2, 1],
        opacity: [0.3, 0.5, 0.3],
      }}
      transition={{
        duration: 10,
        repeat: Infinity,
        ease: 'easeInOut',
        delay: 1,
      }}
      className="absolute -top-20 left-1/3 w-96 h-96 rounded-full bg-gradient-to-b from-green-50 to-green-100 blur-3xl opacity-30"
    />
  </div>
);

// Password strength indicator
const PasswordStrength = ({ password }: { password: string }) => {
  const getStrength = (): {
    strength: 'weak' | 'medium' | 'strong';
    color: string;
    width: string;
  } => {
    if (!password) return { strength: 'weak', color: 'bg-gray-200', width: 'w-0' };

    if (password.length < 8) return { strength: 'weak', color: 'bg-red-500', width: 'w-1/3' };

    const hasLowercase = /[a-z]/.test(password);
    const hasUppercase = /[A-Z]/.test(password);
    const hasNumber = /[0-9]/.test(password);
    const hasSpecial = /[!@#$%^&*(),.?":{}|<>]/.test(password);

    const score = [hasLowercase, hasUppercase, hasNumber, hasSpecial].filter(Boolean).length;

    if (score <= 2) return { strength: 'weak', color: 'bg-red-500', width: 'w-1/3' };
    if (score === 3) return { strength: 'medium', color: 'bg-yellow-500', width: 'w-2/3' };
    return { strength: 'strong', color: 'bg-green-500', width: 'w-full' };
  };

  const { strength, color, width } = getStrength();

  return (
    <div className="mt-2">
      <div className="h-1 w-full bg-gray-200 rounded-full overflow-hidden">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width }}
          transition={{ duration: 0.3 }}
          className={`h-full ${color}`}
        />
      </div>
      <div className="flex justify-between mt-1">
        <span className="text-xs text-gray-500">Weak</span>
        <span className="text-xs text-gray-500">Medium</span>
        <span className="text-xs text-gray-500">Strong</span>
      </div>
      {password && (
        <p
          className={`text-xs mt-1 ${
            strength === 'weak'
              ? 'text-red-600'
              : strength === 'medium'
                ? 'text-yellow-600'
                : 'text-green-600'
          }`}
        >
          {strength === 'weak'
            ? 'Password is weak'
            : strength === 'medium'
              ? 'Password is decent'
              : 'Password is strong'}
        </p>
      )}
    </div>
  );
};

// Password requirements list
const PasswordRequirements = ({ password }: { password: string }) => {
  const requirements = [
    { label: 'At least 8 characters', met: password.length >= 8 },
    { label: 'At least 1 uppercase letter', met: /[A-Z]/.test(password) },
    { label: 'At least 1 lowercase letter', met: /[a-z]/.test(password) },
    { label: 'At least 1 number', met: /[0-9]/.test(password) },
    { label: 'At least 1 special character', met: /[!@#$%^&*(),.?":{}|<>]/.test(password) },
  ];

  return (
    <div className="mt-3">
      <p className="text-xs text-gray-500 mb-1">Password requirements:</p>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-1">
        {requirements.map((req, index) => (
          <div key={index} className="flex items-center">
            <div
              className={`w-4 h-4 rounded-full flex items-center justify-center mr-2 ${
                req.met ? 'bg-green-100 text-green-600' : 'bg-gray-100 text-gray-400'
              }`}
            >
              {req.met && <Check size={12} />}
            </div>
            <span className={`text-xs ${req.met ? 'text-green-600' : 'text-gray-500'}`}>
              {req.label}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};

// Main register component
const Register = () => {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    confirmPassword: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [formError, setFormError] = useState('');
  const [agreedToTerms, setAgreedToTerms] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);

  const { register, error, loading, isAuthenticated, clearError } = useAuth();
  const navigate = useNavigate();

  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated) {
      navigate('/dashboard');
    }
  }, [isAuthenticated, navigate]);

  // Clear API errors when form changes
  useEffect(() => {
    if (error) {
      clearError();
    }
    setFormError('');
  }, [formData, clearError, error]);

  const validateStep1 = (): boolean => {
    if (!formData.firstName.trim()) {
      setFormError('First name is required');
      return false;
    }

    if (!formData.lastName.trim()) {
      setFormError('Last name is required');
      return false;
    }

    return true;
  };

  const validateStep2 = (): boolean => {
    if (!formData.email.trim()) {
      setFormError('Email is required');
      return false;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      setFormError('Please enter a valid email address');
      return false;
    }

    if (!formData.password) {
      setFormError('Password is required');
      return false;
    }

    if (formData.password.length < 8) {
      setFormError('Password must be at least 8 characters');
      return false;
    }

    if (formData.password !== formData.confirmPassword) {
      setFormError('Passwords do not match');
      return false;
    }

    if (!agreedToTerms) {
      setFormError('You must agree to the terms and conditions');
      return false;
    }

    return true;
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleNextStep = () => {
    if (currentStep === 1 && validateStep1()) {
      setCurrentStep(2);
    }
  };

  const handlePrevStep = () => {
    if (currentStep === 2) {
      setCurrentStep(1);
    }
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();

    if (currentStep === 1) {
      handleNextStep();
      return;
    }

    if (!validateStep2()) {
      return;
    }

    const { firstName, lastName, email, password } = formData;
    const success = await register({ firstName, lastName, email, password });

    if (success) {
      navigate('/dashboard');
    }
  };

  return (
    <div className="min-h-screen relative flex flex-col justify-center items-center py-12 px-4 sm:px-6 lg:px-8 bg-white overflow-hidden">
      <AnimatedBlobs />

      <div className="w-full max-w-md relative z-10">
        <div className="text-center">
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.5 }}
            className="mx-auto h-16 w-16 rounded-full bg-green-100 flex items-center justify-center text-green-700"
          >
            <UserPlus size={30} />
          </motion.div>
          <motion.h2
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.1, duration: 0.6 }}
            className="mt-6 text-3xl font-bold tracking-tight text-gray-900"
          >
            Create your account
          </motion.h2>
          <motion.p
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.2, duration: 0.6 }}
            className="mt-2 text-sm text-gray-600"
          >
            Start your financial journey with ₹iddhi
          </motion.p>
        </div>

        <div className="mt-8">
          {/* Step indicator */}
          <div className="mb-8">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-200"></div>
              </div>
              <div className="relative flex justify-between">
                <div className="flex flex-col items-center">
                  <span
                    className={`w-8 h-8 flex items-center justify-center rounded-full text-xs font-medium ${
                      currentStep >= 1 ? 'bg-green-600 text-white' : 'bg-gray-200 text-gray-600'
                    }`}
                  >
                    1
                  </span>
                  <span className="mt-2 text-xs text-gray-500">Personal Info</span>
                </div>
                <div className="flex flex-col items-center">
                  <span
                    className={`w-8 h-8 flex items-center justify-center rounded-full text-xs font-medium ${
                      currentStep >= 2 ? 'bg-green-600 text-white' : 'bg-gray-200 text-gray-600'
                    }`}
                  >
                    2
                  </span>
                  <span className="mt-2 text-xs text-gray-500">Account Details</span>
                </div>
              </div>
            </div>
          </div>

          <motion.div
            key={`step-${currentStep}`}
            initial={{ x: currentStep === 1 ? -200 : 200, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: currentStep === 1 ? -200 : 200, opacity: 0 }}
            transition={{ duration: 0.5 }}
          >
            <form
              onSubmit={handleSubmit}
              className="space-y-6 bg-white p-6 rounded-lg shadow-sm border border-gray-100"
            >
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

              {currentStep === 1 && (
                <>
                  <div className="grid grid-cols-1 gap-6">
                    <div>
                      <label
                        htmlFor="firstName"
                        className="block text-sm font-medium leading-6 text-gray-900"
                      >
                        First name
                      </label>
                      <div className="mt-2">
                        <input
                          id="firstName"
                          name="firstName"
                          type="text"
                          autoComplete="given-name"
                          required
                          value={formData.firstName}
                          onChange={handleInputChange}
                          className="block w-full rounded-md border-0 py-3 px-4 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-green-600 text-base leading-normal"
                        />
                      </div>
                    </div>

                    <div>
                      <label
                        htmlFor="lastName"
                        className="block text-sm font-medium leading-6 text-gray-900"
                      >
                        Last name
                      </label>
                      <div className="mt-2">
                        <input
                          id="lastName"
                          name="lastName"
                          type="text"
                          autoComplete="family-name"
                          required
                          value={formData.lastName}
                          onChange={handleInputChange}
                          className="block w-full rounded-md border-0 py-3 px-4 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-green-600 text-base leading-normal"
                        />
                      </div>
                    </div>
                  </div>
                </>
              )}

              {currentStep === 2 && (
                <>
                  <div>
                    <label
                      htmlFor="email"
                      className="block text-sm font-medium leading-6 text-gray-900"
                    >
                      Email address
                    </label>
                    <div className="mt-2">
                      <input
                        id="email"
                        name="email"
                        type="email"
                        autoComplete="email"
                        required
                        value={formData.email}
                        onChange={handleInputChange}
                        className="block w-full rounded-md border-0 py-3 px-4 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-green-600 text-base leading-normal"
                      />
                    </div>
                  </div>

                  <div>
                    <label
                      htmlFor="password"
                      className="block text-sm font-medium leading-6 text-gray-900"
                    >
                      Password
                    </label>
                    <div className="mt-2 relative">
                      <input
                        id="password"
                        name="password"
                        type={showPassword ? 'text' : 'password'}
                        autoComplete="new-password"
                        required
                        value={formData.password}
                        onChange={handleInputChange}
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
                    <PasswordStrength password={formData.password} />
                    <PasswordRequirements password={formData.password} />
                  </div>

                  <div>
                    <label
                      htmlFor="confirmPassword"
                      className="block text-sm font-medium leading-6 text-gray-900"
                    >
                      Confirm password
                    </label>
                    <div className="mt-2">
                      <input
                        id="confirmPassword"
                        name="confirmPassword"
                        type={showPassword ? 'text' : 'password'}
                        autoComplete="new-password"
                        required
                        value={formData.confirmPassword}
                        onChange={handleInputChange}
                        className={`block w-full rounded-md border-0 py-3 px-4 text-gray-900 shadow-sm ring-1 ring-inset ${
                          formData.confirmPassword && formData.password !== formData.confirmPassword
                            ? 'ring-red-300 focus:ring-red-600'
                            : 'ring-gray-300 focus:ring-green-600'
                        } placeholder:text-gray-400 focus:ring-2 focus:ring-inset text-base leading-normal`}
                      />
                    </div>
                    {formData.confirmPassword && formData.password !== formData.confirmPassword && (
                      <p className="mt-1 text-xs text-red-600">Passwords don't match</p>
                    )}
                  </div>

                  <div className="flex items-start">
                    <div className="flex items-center h-5">
                      <input
                        id="terms"
                        name="terms"
                        type="checkbox"
                        checked={agreedToTerms}
                        onChange={(e) => setAgreedToTerms(e.target.checked)}
                        className="h-4 w-4 rounded border-gray-300 text-green-600 focus:ring-green-600"
                      />
                    </div>
                    <div className="ml-3 text-sm">
                      <label htmlFor="terms" className="text-gray-500">
                        I agree to the{' '}
                        <a href="#" className="text-green-600 hover:text-green-500">
                          Terms and Conditions
                        </a>{' '}
                        and{' '}
                        <a href="#" className="text-green-600 hover:text-green-500">
                          Privacy Policy
                        </a>
                      </label>
                    </div>
                  </div>
                </>
              )}

              <div className="flex justify-between items-center mt-8">
                {currentStep === 2 ? (
                  <button
                    type="button"
                    onClick={handlePrevStep}
                    className="flex items-center text-sm font-medium text-green-600 hover:text-green-500"
                  >
                    <ArrowLeft size={16} className="mr-1" />
                    Back
                  </button>
                ) : (
                  <div></div>
                )}

                <button
                  type="submit"
                  disabled={loading}
                  className="flex justify-center items-center rounded-md bg-green-600 px-5 py-3 text-sm font-semibold text-white shadow-sm hover:bg-green-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-green-600 transition-colors"
                >
                  {loading && (
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
                  )}
                  {currentStep === 1
                    ? 'Continue'
                    : loading
                      ? 'Creating account...'
                      : 'Create account'}
                </button>
              </div>
            </form>
          </motion.div>

          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.7, duration: 0.6 }}
            className="mt-6 text-center"
          >
            <p className="text-sm text-gray-500">
              Already have an account?{' '}
              <Link
                to="/login"
                className="font-semibold leading-6 text-green-600 hover:text-green-500 inline-flex items-center"
              >
                <ArrowLeft size={16} className="mr-1" />
                Sign in
              </Link>
            </p>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default Register;
