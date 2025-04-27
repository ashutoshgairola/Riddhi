import { Router } from "express";
import { TransactionController } from "./controller";
import { UploadMiddleware } from "../middleware/upload";
import { AuthMiddleware } from "../middleware/auth";

export class TransactionRoutes {
  private router: Router;
  private controller: TransactionController;
  private authMiddleware: AuthMiddleware;
  private uploadMiddleware: UploadMiddleware;

  constructor(
    controller: TransactionController,
    authMiddleware: AuthMiddleware
  ) {
    this.router = Router();
    this.controller = controller;
    this.authMiddleware = authMiddleware;
    this.uploadMiddleware = new UploadMiddleware();
    this.setupRoutes();
  }

  private setupRoutes(): void {
    // All routes require authentication
    this.router.use(this.authMiddleware.authenticate);

    // Transaction routes
    this.router.get("/", this.controller.getTransactions);
    this.router.get("/:id", this.controller.getTransactionById);
    this.router.post("/", this.controller.createTransaction);
    this.router.put("/:id", this.controller.updateTransaction);
    this.router.delete("/:id", this.controller.deleteTransaction);

    // Attachment routes
    this.router.post(
      "/:id/attachments",
      this.uploadMiddleware.handleUpload,
      this.controller.uploadAttachment
    );

    // Category routes
    this.router.get("/categories", this.controller.getCategories);
    this.router.post("/categories", this.controller.createCategory);
    this.router.put("/categories/:id", this.controller.updateCategory);
    this.router.delete("/categories/:id", this.controller.deleteCategory);
  }

  getRouter(): Router {
    return this.router;
  }
}
