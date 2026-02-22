import { Request, Response } from 'express';

import { createChildLogger } from '../config/logger';

export class ErrorMiddleware {
  private static logger = createChildLogger({ middleware: 'ErrorMiddleware' });

  static handleErrors = (err: Error, req: Request, res: Response): void => {
    const statusCode = res.statusCode !== 200 ? res.statusCode : 500;

    // Log error with context
    const errorContext = {
      error: {
        name: err.name,
        message: err.message,
        stack: err.stack,
      },
      request: {
        method: req.method,
        url: req.originalUrl,
        userId: req.user?.userId ?? req.body?.user?.userId,
        ip: req.ip,
        userAgent: req.get('user-agent'),
      },
      statusCode,
    };

    if (statusCode >= 500) {
      ErrorMiddleware.logger.error(errorContext, 'Internal server error occurred');
    } else {
      ErrorMiddleware.logger.warn(errorContext, 'Client error occurred');
    }

    res.status(statusCode).json({
      error: err.message || 'Internal Server Error',
      stack: process.env.NODE_ENV === 'production' ? '🥞' : err.stack,
    });
  };

  static handleNotFound = (req: Request, res: Response): void => {
    ErrorMiddleware.logger.warn(
      {
        request: {
          method: req.method,
          url: req.originalUrl,
          ip: req.ip,
          userAgent: req.get('user-agent'),
        },
      },
      'Resource not found',
    );

    res.status(404).json({ error: 'Resource not found' });
  };
}
