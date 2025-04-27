import { Router } from "express";
import multer from "multer";
import { SettingsController } from "./controller";
import { AuthMiddleware } from "../middleware/auth";

export class SettingsRoutes {
  private router: Router;
  private controller: SettingsController;
  private authMiddleware: AuthMiddleware;
  private upload: multer.Multer;

  constructor(controller: SettingsController, authMiddleware: AuthMiddleware) {
    this.router = Router();
    this.controller = controller;
    this.authMiddleware = authMiddleware;

    // Configure multer for memory storage (files saved temporarily in memory)
    this.upload = multer({
      storage: multer.memoryStorage(),
      limits: {
        fileSize: 10 * 1024 * 1024, // 10MB limit
      },
    });

    this.setupRoutes();
  }

  private setupRoutes(): void {
    // All routes require authentication
    this.router.use(this.authMiddleware.authenticate);

    // User Preferences routes
    this.router.get("/preferences", this.controller.getUserPreferences);
    this.router.put("/preferences", this.controller.updateUserPreferences);

    // Notification Settings routes
    this.router.get("/notifications", this.controller.getNotificationSettings);
    this.router.put(
      "/notifications/:id",
      this.controller.updateNotificationSetting
    );

    // Account Connections routes
    this.router.get("/connections", this.controller.getAccountConnections);
    this.router.post("/connections", this.controller.connectAccount);
    this.router.post(
      "/connections/:id/refresh",
      this.controller.refreshConnection
    );
    this.router.delete("/connections/:id", this.controller.disconnectAccount);

    // Data Management routes
    this.router.get("/data/export", this.controller.exportData);
    this.router.post(
      "/data/import",
      this.upload.single("file"),
      this.controller.importData
    );
    this.router.delete("/data", this.controller.clearData);
  }

  getRouter(): Router {
    return this.router;
  }
}
