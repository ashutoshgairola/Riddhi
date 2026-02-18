import bcrypt from 'bcryptjs';
import crypto from 'crypto';
import dayjs from 'dayjs';
import jwt from 'jsonwebtoken';
import { Collection, Db } from 'mongodb';

import { createChildLogger } from '../config/logger';
import { UserModel } from './db';
import {
  AuthToken,
  LoginRequest,
  PasswordResetToken,
  RegisterUserRequest,
  UpdateProfileRequest,
  User,
  UserDTO,
} from './types/interface';

export class AuthService {
  private userModel: UserModel;
  private resetTokenCollection: Collection<PasswordResetToken>;
  private jwtSecret: string;
  private tokenExpiration: string;
  private logger = createChildLogger({ service: 'AuthService' });

  constructor(db: Db) {
    this.userModel = new UserModel(db);
    this.resetTokenCollection = db.collection<PasswordResetToken>('passwordResetTokens');
    this.jwtSecret = process.env.JWT_SECRET || 'your-secret-key';
    this.tokenExpiration = process.env.TOKEN_EXPIRATION || '24h';
  }

  async initialize(): Promise<void> {
    await this.userModel.initialize();
    // Create index for password reset tokens
    await this.resetTokenCollection.createIndex({ expiresAt: 1 }, { expireAfterSeconds: 0 });
    await this.resetTokenCollection.createIndex({ token: 1 }, { unique: true });
  }

  async register(userData: RegisterUserRequest): Promise<UserDTO> {
    // Check if user with this email already exists
    const existingUser = await this.userModel.findByEmail(userData.email);
    if (existingUser) {
      throw new Error('Email already registered');
    }

    const user = await this.userModel.create(userData);
    const token = this.generateToken(user);

    return this.mapUserToDTO(user, token);
  }

  async login(credentials: LoginRequest) {
    const user = await this.userModel.findByEmail(credentials.email);
    if (!user) {
      throw new Error('Invalid credentials');
    }

    const isPasswordValid = await this.userModel.comparePassword(user, credentials.password);
    if (!isPasswordValid) {
      throw new Error('Invalid credentials');
    }

    // Update last login time
    await this.userModel.updateLastLogin(user.id!);
    user.lastLogin = dayjs().toDate();

    const token = this.generateToken(user);
    return { user, token };
  }

  async requestPasswordReset(email: string): Promise<void> {
    const user = await this.userModel.findByEmail(email);
    if (!user) {
      throw new Error('Email not found');
    }

    // Generate reset token
    const token = crypto.randomBytes(32).toString('hex');

    // Store token with expiration time (e.g., 1 hour)
    const expiresAt = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

    // Remove any existing tokens for this user
    await this.resetTokenCollection.deleteMany({ userId: user.id });

    // Store new token
    await this.resetTokenCollection.insertOne({
      userId: user.id as string,
      token,
      expiresAt,
    });

    // In a real implementation, send email with reset link
    this.logger.info({ email, tokenLength: token.length }, 'Password reset token generated');

    // Email would be sent here
  }

  async confirmPasswordReset(token: string, newPassword: string): Promise<void> {
    // Find the token
    const resetToken = await this.resetTokenCollection.findOne({ token });
    if (!resetToken) {
      throw new Error('Invalid or expired token');
    }

    // Check if token is expired
    if (dayjs(resetToken.expiresAt).isBefore(dayjs())) {
      await this.resetTokenCollection.deleteOne({ token });
      throw new Error('Token has expired');
    }

    // Hash the new password
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // Update user's password
    const success = await this.userModel.updatePassword(resetToken.userId, hashedPassword);
    if (!success) {
      throw new Error('Failed to update password');
    }

    // Delete the token
    await this.resetTokenCollection.deleteOne({ token });
  }

  async getProfile(userId: string): Promise<UserDTO> {
    const user = await this.userModel.findById(userId);
    if (!user) {
      throw new Error('User not found');
    }

    return this.mapUserToDTO(user);
  }

  async updateProfile(userId: string, updates: UpdateProfileRequest): Promise<UserDTO> {
    const updatedUser = await this.userModel.updateProfile(userId, updates);
    if (!updatedUser) {
      throw new Error('User not found');
    }

    return this.mapUserToDTO(updatedUser);
  }

  async changePassword(
    userId: string,
    currentPassword: string,
    newPassword: string,
  ): Promise<void> {
    const user = await this.userModel.findById(userId);
    if (!user) {
      throw new Error('User not found');
    }

    const isPasswordValid = await this.userModel.comparePassword(user, currentPassword);
    if (!isPasswordValid) {
      throw new Error('Current password is incorrect');
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);
    const success = await this.userModel.updatePassword(userId, hashedPassword);

    if (!success) {
      throw new Error('Failed to update password');
    }
  }

  verifyToken(token: string): AuthToken {
    try {
      return jwt.verify(token, this.jwtSecret) as AuthToken;
    } catch (error) {
      throw new Error('Invalid or expired token');
    }
  }

  private generateToken(user: User): string {
    const payload: AuthToken = {
      userId: user._id!.toString(),
      email: user.email,
    };

    return jwt.sign(payload, this.jwtSecret, {
      expiresIn: this.tokenExpiration,
    } as jwt.SignOptions);
  }

  private mapUserToDTO(user: User, token?: string): UserDTO {
    const userDTO: UserDTO = {
      id: user._id!.toString(),
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      profileImageUrl: user.profileImageUrl,
      createdAt: user.createdAt.toISOString(),
      lastLogin: user.lastLogin ? user.lastLogin.toISOString() : undefined,
    };

    if (token) {
      userDTO.token = token;
    }

    return userDTO;
  }
}
