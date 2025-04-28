import { Request, Response } from 'express';

export class ErrorMiddleware {
  static handleErrors = (err: Error, req: Request, res: Response): void => {
    console.error('Error:', err);

    const statusCode = res.statusCode !== 200 ? res.statusCode : 500;

    res.status(statusCode).json({
      error: err.message || 'Internal Server Error',
      stack: process.env.NODE_ENV === 'production' ? '🥞' : err.stack,
    });
  };

  static handleNotFound = (req: Request, res: Response): void => {
    res.status(404).json({ error: 'Resource not found' });
  };
}
