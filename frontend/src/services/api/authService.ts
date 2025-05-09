// src/services/api/authService.ts
import {
  AuthResponse,
  ChangePasswordDTO,
  LoginDTO,
  RegisterDTO,
  ResetPasswordConfirmDTO,
  ResetPasswordRequestDTO,
  UpdateProfileDTO,
  User,
} from '../../types/auth.types';
import apiClient, { ApiResponse } from './apiClient';

class AuthService {
  private baseUrl = '/api/auth';

  // ----- Authentication -----

  public async register(data: RegisterDTO): Promise<ApiResponse<AuthResponse>> {
    return apiClient.post<ApiResponse<AuthResponse>, RegisterDTO>(`${this.baseUrl}/register`, data);
  }

  public async login(data: LoginDTO): Promise<ApiResponse<AuthResponse>> {
    const response = await apiClient.post<ApiResponse<AuthResponse>, LoginDTO>(
      `${this.baseUrl}/login`,
      data,
    );
    // Store token in localStorage
    if (response.data.token) {
      localStorage.setItem('auth_token', response.data.token);
      localStorage.setItem('user', JSON.stringify(response.data.user));
      localStorage.setItem('token_expires_at', response.data.expiresAt);
    }

    return response;
  }

  public async logout(): Promise<void> {
    try {
      // Call logout API (if applicable)
      await apiClient.post(`${this.baseUrl}/logout`, {});
    } catch {
      // Ignore errors during logout
    } finally {
      // Clear local storage
      localStorage.removeItem('auth_token');
      localStorage.removeItem('user');
      localStorage.removeItem('token_expires_at');
    }
  }

  // ----- Password Management -----

  public async requestPasswordReset(
    data: ResetPasswordRequestDTO,
  ): Promise<ApiResponse<{ message: string }>> {
    return apiClient.post<ApiResponse<{ message: string }>, ResetPasswordRequestDTO>(
      `${this.baseUrl}/reset-password/request`,
      data,
    );
  }

  public async confirmPasswordReset(
    data: ResetPasswordConfirmDTO,
  ): Promise<ApiResponse<{ message: string }>> {
    return apiClient.post<ApiResponse<{ message: string }>, ResetPasswordConfirmDTO>(
      `${this.baseUrl}/reset-password/confirm`,
      data,
    );
  }

  public async changePassword(data: ChangePasswordDTO): Promise<ApiResponse<{ message: string }>> {
    return apiClient.put<ApiResponse<{ message: string }>, ChangePasswordDTO>(
      `${this.baseUrl}/change-password`,
      data,
    );
  }

  // ----- User Profile -----

  public async getProfile(): Promise<ApiResponse<User>> {
    return apiClient.get<ApiResponse<User>>(`${this.baseUrl}/profile`);
  }

  public async updateProfile(data: UpdateProfileDTO): Promise<ApiResponse<User>> {
    return apiClient.put<ApiResponse<User>, UpdateProfileDTO>(`${this.baseUrl}/profile`, data);
  }

  // ----- Auth Status Helpers -----

  public isAuthenticated(): boolean {
    const token = localStorage.getItem('auth_token');
    const expiresAt = localStorage.getItem('token_expires_at');

    if (!token || !expiresAt) {
      return false;
    }

    // Check if token is expired
    const expiryDate = new Date(expiresAt);
    if (expiryDate < new Date()) {
      this.logout();
      return false;
    }

    return true;
  }

  public getCurrentUser(): User | null {
    if (!this.isAuthenticated()) {
      return null;
    }

    const userJson = localStorage.getItem('user');
    if (!userJson) {
      return null;
    }

    try {
      return JSON.parse(userJson);
    } catch {
      this.logout();
      return null;
    }
  }
}

export const authService = new AuthService();
export default authService;
