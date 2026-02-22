import { Request, Response } from 'express';
import { Logger } from 'pino';

/**
 * Utility function to wrap controller methods with consistent logging
 */
export const withLogging = <T extends unknown[], R>(
  logger: Logger,
  methodName: string,
  handler: (req: Request, res: Response, ...args: T) => Promise<R>,
) => {
  return async (req: Request, res: Response, ...args: T): Promise<R> => {
    const requestId = Math.random().toString(36).substring(7);
    const requestLogger = logger.child({ requestId, method: methodName });

    // Log request start with sanitized data
    const logData: Record<string, unknown> = {
      userId: req.body.user?.userId || req.user?.userId,
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
    } catch (error: unknown) {
      const errMsg = error instanceof Error ? error.message : String(error);
      const errorData = {
        userId: logData.userId,
        error: {
          message: errMsg,
          stack: error instanceof Error ? error.stack : undefined,
          name: error instanceof Error ? error.name : 'UnknownError',
        },
      };

      if (
        errMsg &&
        (errMsg.includes('Invalid credentials') ||
          errMsg.includes('Email already registered') ||
          errMsg.includes('Email not found') ||
          errMsg.includes('Unauthorized') ||
          errMsg.includes('not found'))
      ) {
        requestLogger.warn(errorData, `${methodName} failed: ${errMsg}`);
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
  // req.user is extended via declare global in middleware/auth.ts
  return req.body.user?.userId || req.user?.userId;
};

/**
 * Create sanitized log data from request
 */
export const createRequestLogData = (req: Request, additionalData?: Record<string, unknown>) => {
  const logData: Record<string, unknown> = {
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
