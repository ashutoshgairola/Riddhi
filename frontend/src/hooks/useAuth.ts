// src/hooks/useAuth.ts
import { useCallback, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

import { ApiError } from '../services/api/apiClient';
import authService from '../services/api/authService';
import {
  ChangePasswordDTO,
  LoginDTO,
  RegisterDTO,
  ResetPasswordConfirmDTO,
  UpdateProfileDTO,
  User,
} from '../types/auth.types';

interface UseAuthReturn {
  isAuthenticated: boolean;
  user: User | null;
  loading: boolean;
  error: ApiError | null;
  login: (data: LoginDTO) => Promise<boolean>;
  register: (data: RegisterDTO) => Promise<boolean>;
  logout: () => void;
  requestPasswordReset: (email: string) => Promise<boolean>;
  confirmPasswordReset: (data: ResetPasswordConfirmDTO) => Promise<boolean>;
  changePassword: (data: ChangePasswordDTO) => Promise<boolean>;
  updateProfile: (data: UpdateProfileDTO) => Promise<boolean>;
  clearError: () => void;
  checkAuth: () => Promise<boolean>;
}

export const useAuth = (): UseAuthReturn => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<ApiError | null>(null);
  const [authChecked, setAuthChecked] = useState<boolean>(false);

  // Check authentication status on initial load
  const checkAuth = useCallback(async (): Promise<boolean> => {
    try {
      setLoading(true);

      // Check if user is authenticated
      const isAuth = authService.isAuthenticated();

      if (isAuth) {
        // Get current user
        const currentUser = authService.getCurrentUser();

        if (currentUser) {
          setIsAuthenticated(true);
          setUser(currentUser);
          return true;
        } else {
          // Try to fetch user profile if token exists but user data is missing
          try {
            const response = await authService.getProfile();
            if (response.data) {
              setIsAuthenticated(true);
              setUser(response.data);
              return true;
            }
          } catch {
            // If profile fetch fails, user is not authenticated
            authService.logout();
            setIsAuthenticated(false);
            setUser(null);
          }
        }
      } else {
        setIsAuthenticated(false);
        setUser(null);
      }

      return false;
    } catch (err) {
      setError(err as ApiError);
      setIsAuthenticated(false);
      setUser(null);
      return false;
    } finally {
      setLoading(false);
      setAuthChecked(true);
    }
  }, []);

  // Check auth on initial load
  useEffect(() => {
    if (!authChecked) {
      checkAuth();
    }
  }, [authChecked, checkAuth]);

  // Login function
  const login = async (data: LoginDTO): Promise<boolean> => {
    try {
      setLoading(true);
      setError(null);

      const response = await authService.login(data);

      // Set auth state
      setIsAuthenticated(true);
      setUser(response.data.user);

      return true;
    } catch (err) {
      setError(err as ApiError);
      return false;
    } finally {
      setLoading(false);
    }
  };

  // Register function
  const register = async (data: RegisterDTO): Promise<boolean> => {
    try {
      setLoading(true);
      setError(null);

      const response = await authService.register(data);

      // Set auth state
      setIsAuthenticated(true);
      setUser(response.data.user);

      return true;
    } catch (err) {
      setError(err as ApiError);
      return false;
    } finally {
      setLoading(false);
    }
  };

  const navigate = useNavigate();

  const logout = useCallback(() => {
    setLoading(true);

    try {
      authService.logout();

      // Clear auth state
      setIsAuthenticated(false);
      setUser(null);

      navigate('/login');
    } catch (err) {
      setError(err as ApiError);
    } finally {
      setLoading(false);
    }
  }, [navigate]);

  // Request password reset
  const requestPasswordReset = async (email: string): Promise<boolean> => {
    try {
      setLoading(true);
      setError(null);

      await authService.requestPasswordReset({ email });
      return true;
    } catch (err) {
      setError(err as ApiError);
      return false;
    } finally {
      setLoading(false);
    }
  };

  // Confirm password reset
  const confirmPasswordReset = async (data: ResetPasswordConfirmDTO): Promise<boolean> => {
    try {
      setLoading(true);
      setError(null);

      await authService.confirmPasswordReset(data);
      return true;
    } catch (err) {
      setError(err as ApiError);
      return false;
    } finally {
      setLoading(false);
    }
  };

  // Change password
  const changePassword = async (data: ChangePasswordDTO): Promise<boolean> => {
    try {
      setLoading(true);
      setError(null);

      await authService.changePassword(data);
      return true;
    } catch (err) {
      setError(err as ApiError);
      return false;
    } finally {
      setLoading(false);
    }
  };

  // Update profile
  const updateProfile = async (data: UpdateProfileDTO): Promise<boolean> => {
    try {
      setLoading(true);
      setError(null);

      const response = await authService.updateProfile(data);

      // Update user state
      setUser(response.data);

      return true;
    } catch (err) {
      setError(err as ApiError);
      return false;
    } finally {
      setLoading(false);
    }
  };

  // Clear error
  const clearError = useCallback(() => {
    setError(null);
  }, []);

  return {
    isAuthenticated,
    user,
    loading,
    error,
    login,
    register,
    logout,
    requestPasswordReset,
    confirmPasswordReset,
    changePassword,
    updateProfile,
    clearError,
    checkAuth,
  };
};

export default useAuth;
