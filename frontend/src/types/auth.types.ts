// src/types/auth.types.ts
export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  phone?: string;
  profileImageUrl?: string;
  createdAt: string;
  updatedAt: string;
  isFirstLogin: boolean;
}

export interface AuthResponse {
  token: string;
  user: User;
  expiresAt: string;
}

export interface RegisterDTO {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
}

export interface LoginDTO {
  email: string;
  password: string;
}

export interface ResetPasswordRequestDTO {
  email: string;
}

export interface ResetPasswordConfirmDTO {
  token: string;
  newPassword: string;
}

export interface UpdateProfileDTO {
  firstName?: string;
  lastName?: string;
  phone?: string;
  profileImageUrl?: string;
}

export interface ChangePasswordDTO {
  currentPassword: string;
  newPassword: string;
}
