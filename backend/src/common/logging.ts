import { Request, Response } from 'express';
import { Logger } from 'pino';

/**
 * Utility function to wrap controller methods with consistent logging
 */
export const withLogging = <T extends any[], R>(
  logger: Logger,
  methodName: string,
  handler: (req: Request, res: Response, ...args: T) => Promise<R>,
) => {
  return async (req: Request, res: Response, ...args: T): Promise<R> => {
    const requestId = Math.random().toString(36).substring(7);
    const requestLogger = logger.child({ requestId, method: methodName });

    // Log request start with sanitized data
    const logData: any = {
      userId: req.body.user?.userId || (req as any).user?.userId || (req as any).user?.id,
      url: req.originalUrl,
      method: req.method,
    };

    // Add query params for GET requests
    if (req.method === 'GET' && Object.keys(req.query).length > 0) {
      logData.query = req.query;
    }

    // Add body params for other methods (excluding sensitive data)
    if (req.method !== 'GET' && req.body && Object.keys(req.body).length > 0) {
      const sanitizedBody = { ...req.body };
      delete sanitizedBody.password;
      delete sanitizedBody.currentPassword;
      delete sanitizedBody.newPassword;
      delete sanitizedBody.user; // Remove user object to avoid duplication

      if (Object.keys(sanitizedBody).length > 0) {
        logData.body = sanitizedBody;
      }
    }

    requestLogger.info(logData, `${methodName} request started`);

    try {
      const result = await handler(req, res, ...args);
      requestLogger.info({ userId: logData.userId }, `${methodName} completed successfully`);
      return result;
    } catch (error: any) {
      const errorData = {
        userId: logData.userId,
        error: {
          message: error.message,
          stack: error.stack,
          name: error.name,
        },
      };

      if (
        error.message &&
        (error.message.includes('Invalid credentials') ||
          error.message.includes('Email already registered') ||
          error.message.includes('Email not found') ||
          error.message.includes('Unauthorized') ||
          error.message.includes('not found'))
      ) {
        requestLogger.warn(errorData, `${methodName} failed: ${error.message}`);
      } else {
        requestLogger.error(errorData, `${methodName} failed with unexpected error`);
      }

      throw error; // Re-throw to maintain existing error handling
    }
  };
};

/**
 * Extract user ID from request for logging purposes
 */
export const getUserId = (req: Request): string | undefined => {
  return req.body.user?.userId || (req as any).user?.userId || (req as any).user?.id;
};

/**
 * Create sanitized log data from request
 */
export const createRequestLogData = (req: Request, additionalData?: Record<string, any>) => {
  const logData: any = {
    userId: getUserId(req),
    url: req.originalUrl,
    method: req.method,
    ...additionalData,
  };

  // Add query params for GET requests
  if (req.method === 'GET' && Object.keys(req.query).length > 0) {
    logData.query = req.query;
  }

  return logData;
};
