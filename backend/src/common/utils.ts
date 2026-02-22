import { Response } from 'express';

export function sendResponse({
  res,
  status = 200,
  data,
  message,
}: {
  res: Response;
  status?: number;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  data: any;
  message: string;
}): void {
  res.status(status).json({
    status: status,
    data,
    message,
  });
}

/** Safely extract a message string from an unknown catch value. */
export function getErrorMessage(error: unknown): string {
  if (error instanceof Error) return error.message;
  return String(error);
}
