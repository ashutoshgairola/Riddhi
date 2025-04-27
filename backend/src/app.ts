import express, { Express } from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import { Db } from "mongodb";

import { ErrorMiddleware } from "./middleware/error";
import { AuthService } from "./auth/service";
import { AuthController } from "./auth/controller";
import { AuthMiddleware } from "./middleware/auth";
import { AuthRoutes } from "./auth/routes";
import { TransactionService } from "./transactions/service";
import { TransactionController } from "./transactions/controller";
import { TransactionRoutes } from "./transactions/routes";

export class App {
  private app: Express;
  private db: Db;

  constructor(db: Db) {
    this.app = express();
    this.db = db;
    this.configureMiddleware();
    this.configureRoutes();
    this.configureErrorHandling();
  }

  private configureMiddleware(): void {
    // Security middleware
    this.app.use(helmet());
    this.app.use(cors());

    // Request parsing middleware
    this.app.use(express.json());
    this.app.use(express.urlencoded({ extended: true }));

    // Logging middleware
    this.app.use(morgan("dev"));
  }

  private configureRoutes(): void {
    // Auth routes
    const authService = new AuthService(this.db);
    const authController = new AuthController(authService);
    const authMiddleware = new AuthMiddleware(authService);
    const authRoutes = new AuthRoutes(authController, authMiddleware);

    // Transaction routes
    const transactionService = new TransactionService(this.db);
    const transactionController = new TransactionController(transactionService);
    const transactionRoutes = new TransactionRoutes(
      transactionController,
      authMiddleware
    );

    // Initialize services
    authService.initialize().catch((error) => {
      console.error("Failed to initialize auth service:", error);
    });

    transactionService.initialize().catch((error: unknown) => {
      console.error("Failed to initialize transaction service:", error);
    });

    // Set up API routes
    this.app.use("/api/auth", authRoutes.getRouter());
    this.app.use("/api/transactions", transactionRoutes.getRouter());

    // Root route
    this.app.get("/", (req, res) => {
      res.json({ message: "Finance Tracker API" });
    });
  }

  private configureErrorHandling(): void {
    // Not found middleware
    this.app.use(ErrorMiddleware.handleNotFound);

    // Error handling middleware
    this.app.use(ErrorMiddleware.handleErrors);
  }

  getExpressApp(): Express {
    return this.app;
  }
}
