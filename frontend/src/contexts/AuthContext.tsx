// src/contexts/AuthContext.tsx
import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";
import { User, AuthState } from "../types/auth.types";

interface AuthContextType {
  authState: AuthState;
  login: (email: string, password: string) => Promise<void>;
  register: (userData: Partial<User>, password: string) => Promise<void>;
  logout: () => void;
  resetPassword: (email: string) => Promise<void>;
  updateProfile: (userData: Partial<User>) => Promise<void>;
  isAuthenticated: boolean;
  user: User | null;
  loading: boolean;
  error: string | null;
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

// Demo user for testing purposes
const demoUser: User = {
  id: "1",
  email: "john.doe@example.com",
  firstName: "John",
  lastName: "Doe",
  profileImageUrl: undefined,
  createdAt: "2024-01-01T00:00:00.000Z",
  lastLogin: new Date().toISOString(),
};

export const AuthProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  const [authState, setAuthState] = useState<AuthState>(initialAuthState);

  // Check for existing session on initial load
  useEffect(() => {
    const checkAuthStatus = async () => {
      try {
        // In a real app, this would verify the token with your backend
        const token = localStorage.getItem("auth_token");

        if (token) {
          // Simulating a successful authentication check
          setAuthState({
            isAuthenticated: true,
            user: demoUser,
            loading: false,
            error: null,
          });
        } else {
          setAuthState({
            isAuthenticated: false,
            user: null,
            loading: false,
            error: null,
          });
        }
      } catch {
        setAuthState({
          isAuthenticated: false,
          user: null,
          loading: false,
          error: "Failed to verify authentication",
        });
      }
    };

    checkAuthStatus();
  }, []);

  // Login function
  const login = async (email: string, password: string) => {
    try {
      setAuthState((prev) => ({ ...prev, loading: true, error: null }));

      // Simulating API call
      // In a real app, you would make an actual API call to authenticate
      await new Promise((resolve) => setTimeout(resolve, 1000));

      // Demo validation (replace with actual API validation)
      if (email === "john.doe@example.com" && password === "password") {
        // Store auth token in localStorage
        localStorage.setItem("auth_token", "demo_token_123");

        setAuthState({
          isAuthenticated: true,
          user: demoUser,
          loading: false,
          error: null,
        });
      } else {
        throw new Error("Invalid credentials");
      }
    } catch (error) {
      setAuthState((prev) => ({
        ...prev,
        loading: false,
        error: error instanceof Error ? error.message : "Login failed",
      }));
    }
  };

  // Register function
  const register = async (userData: Partial<User>) => {
    try {
      setAuthState((prev) => ({ ...prev, loading: true, error: null }));

      // Simulating API call
      await new Promise((resolve) => setTimeout(resolve, 1000));

      // Create new user (in a real app, this would be done by the backend)
      const newUser: User = {
        id: Date.now().toString(),
        email: userData.email || "",
        firstName: userData.firstName || "",
        lastName: userData.lastName || "",
        profileImageUrl: userData.profileImageUrl,
        createdAt: new Date().toISOString(),
        lastLogin: new Date().toISOString(),
      };

      // Store auth token
      localStorage.setItem("auth_token", "demo_token_123");

      setAuthState({
        isAuthenticated: true,
        user: newUser,
        loading: false,
        error: null,
      });
    } catch (error) {
      setAuthState((prev) => ({
        ...prev,
        loading: false,
        error: error instanceof Error ? error.message : "Registration failed",
      }));
    }
  };

  // Logout function
  const logout = () => {
    // Remove token from localStorage
    localStorage.removeItem("auth_token");

    setAuthState({
      isAuthenticated: false,
      user: null,
      loading: false,
      error: null,
    });
  };

  // Reset password function
  const resetPassword = async () => {
    try {
      setAuthState((prev) => ({ ...prev, loading: true, error: null }));

      // Simulating API call
      await new Promise((resolve) => setTimeout(resolve, 1000));

      // In a real app, this would trigger a password reset email

      setAuthState((prev) => ({
        ...prev,
        loading: false,
        error: null,
      }));
    } catch (error) {
      setAuthState((prev) => ({
        ...prev,
        loading: false,
        error: error instanceof Error ? error.message : "Password reset failed",
      }));
    }
  };

  // Update profile function
  const updateProfile = async (userData: Partial<User>) => {
    try {
      setAuthState((prev) => ({ ...prev, loading: true, error: null }));

      // Simulating API call
      await new Promise((resolve) => setTimeout(resolve, 1000));

      // Update user data (in a real app, this would be done by the backend)
      if (authState.user) {
        const updatedUser = {
          ...authState.user,
          ...userData,
        };

        setAuthState({
          isAuthenticated: true,
          user: updatedUser,
          loading: false,
          error: null,
        });
      }
    } catch (error) {
      setAuthState((prev) => ({
        ...prev,
        loading: false,
        error: error instanceof Error ? error.message : "Profile update failed",
      }));
    }
  };

  const value = {
    // Removed password parameter from register function
    authState,
    login,
    register,
    logout,
    resetPassword,
    updateProfile,
    isAuthenticated: authState.isAuthenticated,
    user: authState.user,
    loading: authState.loading,
    error: authState.error,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

// Custom hook for using auth context
export const useAuth = () => {
  const context = useContext(AuthContext);

  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }

  return context;
};
