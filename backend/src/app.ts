import cors from 'cors';
import express, { Express } from 'express';
import helmet from 'helmet';
import { Db } from 'mongodb';
import morgan from 'morgan';

import { AccountController } from './accounts/controller';
import { AccountRoutes } from './accounts/routes';
import { AccountService } from './accounts/service';
import { AuthController } from './auth/controller';
import { AuthRoutes } from './auth/routes';
import { AuthService } from './auth/service';
import { BudgetController } from './budgets/controller';
import { BudgetRoutes } from './budgets/routes';
import { BudgetService } from './budgets/service';
import { GoalController } from './goals/controller';
import { GoalRoutes } from './goals/routes';
import { GoalService } from './goals/service';
import { AuthMiddleware } from './middleware/auth';
import { ErrorMiddleware } from './middleware/error';
import { ReportController } from './reports/controller';
import { ReportRoutes } from './reports/routes';
import { ReportService } from './reports/service';
import { SettingsController } from './settings/controller';
import { SettingsRoutes } from './settings/routes';
import { SettingsService } from './settings/service';
import { TransactionController } from './transactions/controller';
import { TransactionRoutes } from './transactions/routes';
import { TransactionService } from './transactions/service';

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
    this.app.use(morgan('dev'));
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
    const transactionRoutes = new TransactionRoutes(transactionController, authMiddleware);

    // Budget routes
    const budgetService = new BudgetService(this.db);
    const budgetController = new BudgetController(budgetService);
    const budgetRoutes = new BudgetRoutes(budgetController, authMiddleware);

    // Goal routes
    const goalService = new GoalService(this.db);
    const goalController = new GoalController(goalService);
    const goalRoutes = new GoalRoutes(goalController, authMiddleware);

    // Account routes
    const accountService = new AccountService(this.db);
    const accountController = new AccountController(accountService);
    const accountRoutes = new AccountRoutes(accountController, authMiddleware);

    // Report routes
    const reportService = new ReportService(this.db);
    const reportController = new ReportController(reportService);
    const reportRoutes = new ReportRoutes(reportController, authMiddleware);

    // Settings routes
    const settingsService = new SettingsService(this.db);
    const settingsController = new SettingsController(settingsService);
    const settingsRoutes = new SettingsRoutes(settingsController, authMiddleware);

    // Initialize services
    authService.initialize().catch((error) => {
      console.error('Failed to initialize auth service:', error);
    });

    transactionService.initialize().catch((error) => {
      console.error('Failed to initialize transaction service:', error);
    });

    budgetService.initialize().catch((error) => {
      console.error('Failed to initialize budget service:', error);
    });

    goalService.initialize().catch((error) => {
      console.error('Failed to initialize goal service:', error);
    });

    accountService.initialize().catch((error) => {
      console.error('Failed to initialize account service:', error);
    });

    reportService.initialize().catch((error) => {
      console.error('Failed to initialize report service:', error);
    });

    // Set up API routes
    this.app.use('/api/auth', authRoutes.getRouter());
    this.app.use('/api/transactions', transactionRoutes.getRouter());
    this.app.use('/api/budgets', budgetRoutes.getRouter());
    this.app.use('/api/goals', goalRoutes.getRouter());
    this.app.use('/api/accounts', accountRoutes.getRouter());
    this.app.use('/api/reports', reportRoutes.getRouter());
    this.app.use('/api/settings', settingsRoutes.getRouter());

    // Root route
    this.app.get('/', (req, res) => {
      res.json({ message: 'Finance Tracker API' });
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
