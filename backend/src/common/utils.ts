import { Response } from 'express';

export function sendResponse({
  res,
  status = 200,
  data,
  message,
}: {
  res: Response;
  status?: number;
  data: any;
  message: string;
}) {
  res.status(status).json({
    status: status,
    data,
    message,
  });
}
