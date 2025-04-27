import { Router } from "express";
import { AuthController } from "./controller";
import { AuthMiddleware } from "../middleware/auth";

export class AuthRoutes {
  private router: Router;
  private controller: AuthController;
  private middleware: AuthMiddleware;

  constructor(controller: AuthController, middleware: AuthMiddleware) {
    this.router = Router();
    this.controller = controller;
    this.middleware = middleware;
    this.setupRoutes();
  }

  private setupRoutes(): void {
    // Public routes
    this.router.post("/register", this.controller.register);
    this.router.post("/login", this.controller.login);
    this.router.post(
      "/reset-password/request",
      this.controller.resetPasswordRequest
    );
    this.router.post(
      "/reset-password/confirm",
      this.controller.resetPasswordConfirm
    );

    // Protected routes
    this.router.get(
      "/profile",
      this.middleware.authenticate,
      this.controller.getProfile
    );
    this.router.put(
      "/profile",
      this.middleware.authenticate,
      this.controller.updateProfile
    );
    this.router.put(
      "/change-password",
      this.middleware.authenticate,
      this.controller.changePassword
    );
  }

  getRouter(): Router {
    return this.router;
  }
}
