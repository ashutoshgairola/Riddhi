import { NextFunction, Request, Response } from 'express';
import multer from 'multer';

export class UploadMiddleware {
  private storage: multer.StorageEngine;
  private upload: multer.Multer;
  private maxFileSize: number;
  private allowedMimeTypes: string[];

  constructor() {
    // Configure multer for memory storage (we'll handle the file saving later)
    this.storage = multer.memoryStorage();

    // Set file size limit (default 5MB)
    this.maxFileSize = parseInt(process.env.MAX_FILE_SIZE || '5242880', 10);

    // Define allowed file types
    this.allowedMimeTypes = [
      'image/jpeg',
      'image/png',
      'image/gif',
      'application/pdf',
      'text/plain',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'application/vnd.ms-excel',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    ];

    // Configure multer
    this.upload = multer({
      storage: this.storage,
      limits: {
        fileSize: this.maxFileSize,
      },
      fileFilter: (req, file, cb) => {
        this.fileFilter(req, file, cb);
      },
    });
  }

  private fileFilter(
    _req: Express.Request,
    file: Express.Multer.File,
    cb: multer.FileFilterCallback,
  ): void {
    // Check file type
    if (this.allowedMimeTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(
        new Error(
          'Invalid file type. Only images, PDFs, text files, and office documents are allowed.',
        ),
      );
    }
  }

  handleUpload = (req: Request, res: Response, next: NextFunction): void => {
    this.upload.single('file')(req, res, (err: any) => {
      if (err instanceof multer.MulterError) {
        if (err.code === 'LIMIT_FILE_SIZE') {
          return res.status(400).json({
            error: `File too large. Maximum size is ${this.maxFileSize / 1024 / 1024}MB.`,
          });
        }
        return res.status(400).json({ error: err.message });
      } else if (err) {
        return res.status(400).json({ error: err.message });
      }

      // File upload successful, continue
      next();
      return;
    });
  };
}
