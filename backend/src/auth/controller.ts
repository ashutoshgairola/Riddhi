import { Request, Response } from 'express';

import { getErrorMessage, sendResponse } from '../common/utils';
import { log } from '../config/logger';
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
  private readonly context = AuthController.name;
  private authService: AuthService;

  constructor(authService: AuthService) {
    this.authService = authService;
  }

  register = async (req: Request, res: Response): Promise<void> => {
    try {
      const userData: RegisterUserRequest = req.body;
      log.info('👤 User registration attempt', {
        context: this.context,
        method: 'register',
        email: userData.email,
      });

      // Basic validation
      if (!userData.email || !userData.password || !userData.firstName || !userData.lastName) {
        log.warn('❌ Registration failed: Missing required fields', {
          context: this.context,
          method: 'register',
        });
        res.status(400).json({ error: 'Missing required fields' });
        return;
      }

      const user = await this.authService.register(userData);

      log.info('✅ User registered successfully', {
        context: this.context,
        method: 'register',
        userId: user.id,
        email: userData.email,
      });

      sendResponse({
        res,
        status: 201,
        data: user,
        message: 'User registered successfully',
      });
    } catch (error: unknown) {
      const msg = getErrorMessage(error);
      if (msg === 'Email already registered') {
        log.warn('⚠️ Registration failed: Email already exists', {
          context: this.context,
          method: 'register',
          email: req.body.email,
          error: msg,
        });
        res.status(400).json({ error: msg });
      } else {
        log.error('💥 Registration failed: Internal server error', {
          context: this.context,
          method: 'register',
          error,
          email: req.body.email,
        });
        res.status(500).json({ error: 'Internal server error' });
      }
    }
  };

  login = async (req: Request, res: Response): Promise<void> => {
    try {
      const credentials: LoginRequest = req.body;
      log.info('🔐 User login attempt', {
        context: this.context,
        method: 'login',
        email: credentials.email,
      });

      // Basic validation
      if (!credentials.email || !credentials.password) {
        log.warn('❌ Login failed: Missing email or password', {
          context: this.context,
          method: 'login',
        });
        res.status(400).json({ error: 'Email and password are required' });
        return;
      }

      const user = await this.authService.login(credentials);

      log.info('✅ User logged in successfully', {
        context: this.context,
        method: 'login',
        userId: user.user.id,
        email: credentials.email,
      });

      sendResponse({
        res,
        data: user,
        message: 'Login successful',
      });
    } catch (error: unknown) {
      const msg = getErrorMessage(error);
      if (msg === 'Invalid credentials') {
        log.warn('⚠️ Login failed: Invalid credentials', {
          context: this.context,
          method: 'login',
          email: req.body.email,
        });
        res.status(401).json({ error: msg });
      } else {
        log.error('💥 Login failed: Internal server error', {
          context: this.context,
          method: 'login',
          error,
          email: req.body.email,
        });
        res.status(500).json({ error: 'Internal server error' });
      }
    }
  };

  resetPasswordRequest = async (req: Request, res: Response): Promise<void> => {
    try {
      const { email }: ResetPasswordRequest = req.body;
      log.info('🔑 Password reset request', {
        context: this.context,
        method: 'resetPasswordRequest',
        email,
      });

      if (!email) {
        log.warn('❌ Password reset failed: Email is required', {
          context: this.context,
          method: 'resetPasswordRequest',
        });
        res.status(400).json({ error: 'Email is required' });
        return;
      }

      await this.authService.requestPasswordReset(email);

      log.info('✅ Password reset email sent successfully', {
        context: this.context,
        method: 'resetPasswordRequest',
        email,
      });

      sendResponse({
        res,
        data: null,
        message: 'Password reset email sent successfully',
      });
    } catch (error: unknown) {
      const msg = getErrorMessage(error);
      if (msg === 'Email not found') {
        log.warn('⚠️ Password reset failed: Email not found', {
          context: this.context,
          method: 'resetPasswordRequest',
          email: req.body.email,
          error: msg,
        });
        res.status(404).json({ error: msg });
      } else {
        log.error('💥 Password reset request failed: Internal server error', {
          context: this.context,
          method: 'resetPasswordRequest',
          error,
          email: req.body.email,
        });
        res.status(500).json({ error: 'Internal server error' });
      }
    }
  };

  resetPasswordConfirm = async (req: Request, res: Response): Promise<void> => {
    try {
      const { token, newPassword }: ResetPasswordConfirmRequest = req.body;
      log.info('🔓 Password reset confirmation attempt', {
        context: this.context,
        method: 'resetPasswordConfirm',
      });

      if (!token || !newPassword) {
        log.warn('❌ Password reset confirmation failed: Token and password required', {
          context: this.context,
          method: 'resetPasswordConfirm',
        });
        res.status(400).json({ error: 'Token and new password are required' });
        return;
      }

      await this.authService.confirmPasswordReset(token, newPassword);

      log.info('✅ Password reset confirmed successfully', {
        context: this.context,
        method: 'resetPasswordConfirm',
      });

      sendResponse({
        res,
        data: null,
        message: 'Password reset successfully',
      });
    } catch (error: unknown) {
      const msg = getErrorMessage(error);
      if (msg === 'Invalid or expired token') {
        log.warn('⚠️ Password reset confirmation failed: Invalid token', {
          context: this.context,
          method: 'resetPasswordConfirm',
          error: msg,
        });
        res.status(400).json({ error: msg });
      } else {
        log.error('💥 Password reset confirmation failed: Internal server error', {
          context: this.context,
          method: 'resetPasswordConfirm',
          error,
        });
        res.status(500).json({ error: 'Internal server error' });
      }
    }
  };

  getProfile = async (req: Request, res: Response): Promise<void> => {
    try {
      const { userId } = req.body.user;
      log.info('👤 Get profile request', {
        context: this.context,
        method: 'getProfile',
        userId,
      });

      if (!userId) {
        log.warn('❌ Get profile failed: Unauthorized', {
          context: this.context,
          method: 'getProfile',
        });
        res.status(401).json({ error: 'Unauthorized' });
        return;
      }

      const profile = await this.authService.getProfile(userId);

      log.info('✅ Profile retrieved successfully', {
        context: this.context,
        method: 'getProfile',
        userId,
      });

      sendResponse({
        res,
        data: profile,
        message: 'User profile retrieved successfully',
      });
    } catch (error) {
      log.error('💥 Get profile failed: Internal server error', {
        context: this.context,
        method: 'getProfile',
        error,
        userId: req.body.user?.userId,
      });
      res.status(500).json({ error: 'Internal server error' });
    }
  };

  updateProfile = async (req: Request, res: Response): Promise<void> => {
    try {
      const { userId } = req.body.user;
      delete req.body.user;
      const updates: UpdateProfileRequest = req.body;

      log.info('📝 Update profile request', {
        context: this.context,
        method: 'updateProfile',
        userId,
      });

      if (!userId) {
        log.warn('❌ Update profile failed: Unauthorized', {
          context: this.context,
          method: 'updateProfile',
        });
        res.status(401).json({ error: 'Unauthorized' });
        return;
      }

      const updatedProfile = await this.authService.updateProfile(userId, updates);

      log.info('✅ Profile updated successfully', {
        context: this.context,
        method: 'updateProfile',
        userId,
      });

      sendResponse({
        res,
        data: updatedProfile,
        message: 'User profile updated successfully',
      });
    } catch (error) {
      log.error('💥 Update profile failed: Internal server error', {
        context: this.context,
        method: 'updateProfile',
        error,
        userId: req.body.user?.userId,
      });
      res.status(500).json({ error: 'Internal server error' });
    }
  };

  markWizardSeen = async (req: Request, res: Response): Promise<void> => {
    try {
      const { userId } = req.body.user;
      const updatedProfile = await this.authService.markWizardSeen(userId);
      sendResponse({ res, data: updatedProfile, message: 'Onboarding marked as complete' });
    } catch (error) {
      log.error('💥 Mark wizard seen failed', { context: this.context, error });
      res.status(500).json({ error: 'Internal server error' });
    }
  };

  changePassword = async (req: Request, res: Response): Promise<void> => {
    try {
      const { userId } = req.body.user;
      const { currentPassword, newPassword }: ChangePasswordRequest = req.body;

      log.info('🔒 Change password request', {
        context: this.context,
        method: 'changePassword',
        userId,
      });

      if (!userId) {
        log.warn('❌ Change password failed: Unauthorized', {
          context: this.context,
          method: 'changePassword',
        });
        res.status(401).json({ error: 'Unauthorized' });
        return;
      }

      if (!currentPassword || !newPassword) {
        log.warn('❌ Change password failed: Missing current or new password', {
          context: this.context,
          method: 'changePassword',
          userId,
        });
        res.status(400).json({ error: 'Current password and new password are required' });
        return;
      }

      await this.authService.changePassword(userId, currentPassword, newPassword);

      log.info('✅ Password changed successfully', {
        context: this.context,
        method: 'changePassword',
        userId,
      });

      sendResponse({
        res,
        data: null,
        message: 'Password changed successfully',
      });
    } catch (error: unknown) {
      const msg = getErrorMessage(error);
      if (msg === 'Current password is incorrect') {
        log.warn('⚠️ Change password failed: Incorrect current password', {
          context: this.context,
          method: 'changePassword',
          userId: req.body.user?.userId,
          error: msg,
        });
        res.status(401).json({ error: msg });
      } else {
        log.error('💥 Change password failed: Internal server error', {
          context: this.context,
          method: 'changePassword',
          error,
          userId: req.body.user?.userId,
        });
        res.status(500).json({ error: 'Internal server error' });
      }
    }
  };
}
