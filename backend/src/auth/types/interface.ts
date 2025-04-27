// Authentication domain types

import { ObjectId } from "mongodb";

export interface User {
  _id?: ObjectId;
  id?: string;
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  profileImageUrl?: string;
  createdAt: Date;
  lastLogin?: Date;
}

export interface UserDTO {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  profileImageUrl?: string;
  createdAt: string;
  lastLogin?: string;
  token?: string;
}

export interface RegisterUserRequest {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface ResetPasswordRequest {
  email: string;
}

export interface ResetPasswordConfirmRequest {
  token: string;
  newPassword: string;
}

export interface UpdateProfileRequest {
  firstName?: string;
  lastName?: string;
  profileImageUrl?: string;
}

export interface ChangePasswordRequest {
  currentPassword: string;
  newPassword: string;
}

export interface AuthToken {
  userId: string;
  email: string;
}

export interface PasswordResetToken {
  userId: string;
  token: string;
  expiresAt: Date;
}
