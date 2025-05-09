import { Request, Response } from 'express';

import { sendResponse } from '../common/utils';
import { AuthService } from './service';
import {
  ChangePasswordRequest,
  LoginRequest,
  RegisterUserRequest,
  ResetPasswordConfirmRequest,
  ResetPasswordRequest,
  UpdateProfileRequest,
} from './types/interface';

export class AuthController {
  private authService: AuthService;

  constructor(authService: AuthService) {
    this.authService = authService;
  }

  register = async (req: Request, res: Response): Promise<void> => {
    try {
      const userData: RegisterUserRequest = req.body;

      // Basic validation
      if (!userData.email || !userData.password || !userData.firstName || !userData.lastName) {
        res.status(400).json({ error: 'Missing required fields' });
        return;
      }

      const user = await this.authService.register(userData);
      sendResponse({
        res,
        status: 201,
        data: user,
        message: 'User registered successfully',
      });
    } catch (error: any) {
      if (error.message === 'Email already registered') {
        res.status(400).json({ error: error.message });
      } else {
        console.error('Registration error:', error);
        res.status(500).json({ error: 'Internal server error' });
      }
    }
  };

  login = async (req: Request, res: Response): Promise<void> => {
    try {
      const credentials: LoginRequest = req.body;

      // Basic validation
      if (!credentials.email || !credentials.password) {
        res.status(400).json({ error: 'Email and password are required' });
        return;
      }

      const user = await this.authService.login(credentials);
      sendResponse({
        res,
        data: user,
        message: 'Login successful',
      });
    } catch (error: any) {
      if (error.message === 'Invalid credentials') {
        res.status(401).json({ error: error.message });
      } else {
        console.error('Login error:', error);
        res.status(500).json({ error: 'Internal server error' });
      }
    }
  };

  resetPasswordRequest = async (req: Request, res: Response): Promise<void> => {
    try {
      const { email }: ResetPasswordRequest = req.body;

      if (!email) {
        res.status(400).json({ error: 'Email is required' });
        return;
      }

      await this.authService.requestPasswordReset(email);
      sendResponse({
        res,
        data: null,
        message: 'Password reset email sent successfully',
      });
    } catch (error: any) {
      if (error.message === 'Email not found') {
        res.status(404).json({ error: error.message });
      } else {
        console.error('Password reset request error:', error);
        res.status(500).json({ error: 'Internal server error' });
      }
    }
  };

  resetPasswordConfirm = async (req: Request, res: Response): Promise<void> => {
    try {
      const { token, newPassword }: ResetPasswordConfirmRequest = req.body;

      if (!token || !newPassword) {
        res.status(400).json({ error: 'Token and new password are required' });
        return;
      }

      await this.authService.confirmPasswordReset(token, newPassword);
      sendResponse({
        res,
        data: null,
        message: 'Password reset successfully',
      });
    } catch (error: any) {
      if (error.message === 'Invalid or expired token') {
        res.status(400).json({ error: error.message });
      } else {
        console.error('Password reset confirmation error:', error);
        res.status(500).json({ error: 'Internal server error' });
      }
    }
  };

  getProfile = async (req: Request, res: Response): Promise<void> => {
    try {
      const { userId } = req.body.user;

      if (!userId) {
        res.status(401).json({ error: 'Unauthorized' });
        return;
      }

      const profile = await this.authService.getProfile(userId);
      sendResponse({
        res,
        data: profile,
        message: 'User profile retrieved successfully',
      });
    } catch (error) {
      console.error('Get profile error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  };

  updateProfile = async (req: Request, res: Response): Promise<void> => {
    try {
      const { userId } = req.body.user;
      delete req.body.user;
      const updates: UpdateProfileRequest = req.body;

      if (!userId) {
        res.status(401).json({ error: 'Unauthorized' });
        return;
      }

      const updatedProfile = await this.authService.updateProfile(userId, updates);
      sendResponse({
        res,
        data: updatedProfile,
        message: 'User profile updated successfully',
      });
    } catch (error) {
      console.error('Update profile error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  };

  changePassword = async (req: Request, res: Response): Promise<void> => {
    try {
      const { userId } = req.body.user;
      const { currentPassword, newPassword }: ChangePasswordRequest = req.body;

      if (!userId) {
        res.status(401).json({ error: 'Unauthorized' });
        return;
      }

      if (!currentPassword || !newPassword) {
        res.status(400).json({ error: 'Current password and new password are required' });
        return;
      }

      await this.authService.changePassword(userId, currentPassword, newPassword);
      sendResponse({
        res,
        data: null,
        message: 'Password changed successfully',
      });
    } catch (error: any) {
      if (error.message === 'Current password is incorrect') {
        res.status(401).json({ error: error.message });
      } else {
        console.error('Change password error:', error);
        res.status(500).json({ error: 'Internal server error' });
      }
    }
  };
}
