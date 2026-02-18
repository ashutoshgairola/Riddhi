// src/contexts/AuthContext.tsx
import React, { ReactNode, createContext, useContext, useEffect, useState } from 'react';

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

interface AuthState {
  isAuthenticated: boolean;
  user: User | null;
  loading: boolean;
  error: ApiError | null;
}

interface AuthContextType {
  authState: AuthState;
  login: (data: LoginDTO) => Promise<boolean>;
  register: (data: RegisterDTO) => Promise<boolean>;
  logout: () => void;
  requestPasswordReset: (email: string) => Promise<boolean>;
  confirmPasswordReset: (data: ResetPasswordConfirmDTO) => Promise<boolean>;
  changePassword: (data: ChangePasswordDTO) => Promise<boolean>;
  updateProfile: (data: UpdateProfileDTO) => Promise<boolean>;
  isAuthenticated: boolean;
  user: User | null;
  loading: boolean;
  error: ApiError | null;
  clearError: () => void;
  checkAuth: () => Promise<boolean>;
}

// Initial auth state
const initialAuthState: AuthState = {
  isAuthenticated: false,
  user: null,
  loading: true,
  error: null,
};

// Create context
const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [authState, setAuthState] = useState<AuthState>(initialAuthState);
  const [authInitialized, setAuthInitialized] = useState(false);

  // Check for existing session on initial load
  useEffect(() => {
    const checkAuthStatus = async () => {
      if (authInitialized) return;

      try {
        setAuthState((prev) => ({ ...prev, loading: true }));

        // First check if we have a token and it's not expired
        if (authService.isAuthenticated()) {
          // Get user from localStorage
          const currentUser = authService.getCurrentUser();

          if (currentUser) {
            setAuthState({
              isAuthenticated: true,
              user: currentUser,
              loading: false,
              error: null,
            });
          } else {
            // Try to fetch user from API if we have a token but no user
            try {
              const response = await authService.getProfile();
              setAuthState({
                isAuthenticated: true,
                user: response.data,
                loading: false,
                error: null,
              });
            } catch {
              // If API call fails, clear tokens and show as logged out
              authService.logout();
              setAuthState({
                isAuthenticated: false,
                user: null,
                loading: false,
                error: null,
              });
            }
          }
        } else {
          // No valid token found, set as not authenticated
          setAuthState({
            isAuthenticated: false,
            user: null,
            loading: false,
            error: null,
          });
        }

        setAuthInitialized(true);
      } catch (err) {
        console.error('Auth initialization error:', err);
        // Handle any error during auth check by showing user as not authenticated
        setAuthState({
          isAuthenticated: false,
          user: null,
          loading: false,
          error: err as ApiError,
        });
        setAuthInitialized(true);
      }
    };

    // Start the auth check process
    checkAuthStatus();
  }, [authInitialized]);

  // Force check authentication status
  const checkAuth = async (): Promise<boolean> => {
    try {
      setAuthState((prev) => ({ ...prev, loading: true }));

      // First check if we have a token and it's not expired
      if (authService.isAuthenticated()) {
        // Get user from localStorage
        const currentUser = authService.getCurrentUser();

        if (currentUser) {
          setAuthState({
            isAuthenticated: true,
            user: currentUser,
            loading: false,
            error: null,
          });
          return true;
        } else {
          // Try to fetch user from API if we have a token but no user
          try {
            const response = await authService.getProfile();
            setAuthState({
              isAuthenticated: true,
              user: response.data,
              loading: false,
              error: null,
            });
            return true;
          } catch {
            // If API call fails, clear tokens and show as logged out
            authService.logout();
            setAuthState({
              isAuthenticated: false,
              user: null,
              loading: false,
              error: null,
            });
            return false;
          }
        }
      } else {
        // No valid token found, set as not authenticated
        setAuthState({
          isAuthenticated: false,
          user: null,
          loading: false,
          error: null,
        });
        return false;
      }
    } catch (err) {
      console.error('Auth check error:', err);
      // Handle any error during auth check by showing user as not authenticated
      setAuthState({
        isAuthenticated: false,
        user: null,
        loading: false,
        error: err as ApiError,
      });
      return false;
    }
  };

  // Login function
  const login = async (data: LoginDTO): Promise<boolean> => {
    try {
      setAuthState((prev) => ({ ...prev, loading: true, error: null }));

      const response = await authService.login(data);

      setAuthState({
        isAuthenticated: true,
        user: response.data.user,
        loading: false,
        error: null,
      });

      return true;
    } catch (err) {
      setAuthState((prev) => ({
        ...prev,
        loading: false,
        error: err as ApiError,
      }));
      return false;
    }
  };

  // Register function
  const register = async (data: RegisterDTO): Promise<boolean> => {
    try {
      setAuthState((prev) => ({ ...prev, loading: true, error: null }));

      const response = await authService.register(data);

      setAuthState({
        isAuthenticated: true,
        user: response.data.user,
        loading: false,
        error: null,
      });

      return true;
    } catch (err) {
      setAuthState((prev) => ({
        ...prev,
        loading: false,
        error: err as ApiError,
      }));
      return false;
    }
  };

  // Logout function
  const logout = () => {
    authService.logout();

    setAuthState({
      isAuthenticated: false,
      user: null,
      loading: false,
      error: null,
    });
  };

  // Request password reset function
  const requestPasswordReset = async (email: string): Promise<boolean> => {
    try {
      setAuthState((prev) => ({ ...prev, loading: true, error: null }));

      await authService.requestPasswordReset({ email });

      setAuthState((prev) => ({
        ...prev,
        loading: false,
        error: null,
      }));

      return true;
    } catch (err) {
      setAuthState((prev) => ({
        ...prev,
        loading: false,
        error: err as ApiError,
      }));
      return false;
    }
  };

  // Confirm password reset function
  const confirmPasswordReset = async (data: ResetPasswordConfirmDTO): Promise<boolean> => {
    try {
      setAuthState((prev) => ({ ...prev, loading: true, error: null }));

      await authService.confirmPasswordReset(data);

      setAuthState((prev) => ({
        ...prev,
        loading: false,
        error: null,
      }));

      return true;
    } catch (err) {
      setAuthState((prev) => ({
        ...prev,
        loading: false,
        error: err as ApiError,
      }));
      return false;
    }
  };

  // Change password function
  const changePassword = async (data: ChangePasswordDTO): Promise<boolean> => {
    try {
      setAuthState((prev) => ({ ...prev, loading: true, error: null }));

      await authService.changePassword(data);

      setAuthState((prev) => ({
        ...prev,
        loading: false,
        error: null,
      }));

      return true;
    } catch (err) {
      setAuthState((prev) => ({
        ...prev,
        loading: false,
        error: err as ApiError,
      }));
      return false;
    }
  };

  // Update profile function
  const updateProfile = async (data: UpdateProfileDTO): Promise<boolean> => {
    try {
      setAuthState((prev) => ({ ...prev, loading: true, error: null }));

      const response = await authService.updateProfile(data);

      setAuthState((prev) => ({
        ...prev,
        isAuthenticated: true,
        user: response.data,
        loading: false,
        error: null,
      }));

      return true;
    } catch (err) {
      setAuthState((prev) => ({
        ...prev,
        loading: false,
        error: err as ApiError,
      }));
      return false;
    }
  };

  // Clear error function
  const clearError = () => {
    setAuthState((prev) => ({
      ...prev,
      error: null,
    }));
  };

  const value = {
    authState,
    login,
    register,
    logout,
    requestPasswordReset,
    confirmPasswordReset,
    changePassword,
    updateProfile,
    isAuthenticated: authState.isAuthenticated,
    user: authState.user,
    loading: authState.loading,
    error: authState.error,
    clearError,
    checkAuth,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

// Custom hook for using auth context
// eslint-disable-next-line react-refresh/only-export-components
export const useAuth = () => {
  const context = useContext(AuthContext);

  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }

  return context;
};
