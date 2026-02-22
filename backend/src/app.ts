import cors from 'cors';
import express, { Express } from 'express';
import helmet from 'helmet';
import { Db } from 'mongodb';

import { AccountController } from './accounts/controller';
import { AccountRoutes } from './accounts/routes';
import { AccountService } from './accounts/service';
import { AuthController } from './auth/controller';
import { AuthRoutes } from './auth/routes';
import { AuthService } from './auth/service';
import { BudgetController } from './budgets/controller';
import { BudgetRoutes } from './budgets/routes';
import { BudgetService } from './budgets/service';
import { httpLogger, log, traceMiddleware } from './config/logger';
import { DashboardController } from './dashboard/controller';
import { DashboardRoutes } from './dashboard/routes';
import { DashboardService } from './dashboard/service';
import { GoalController } from './goals/controller';
import { GoalRoutes } from './goals/routes';
import { GoalService } from './goals/service';
import { InvestmentController } from './investments/controller';
import { InvestmentRoutes } from './investments/routes';
import { InvestmentService } from './investments/service';
import { AuthMiddleware } from './middleware/auth';
import { ErrorMiddleware } from './middleware/error';
import { NotificationsRoutes } from './notifications/routes';
import { NotificationService } from './notifications/service';
import { ReportController } from './reports/controller';
import { ReportRoutes } from './reports/routes';
import { ReportService } from './reports/service';
import { SchedulerController } from './schedular/controller';
import { SchedulerRoutes } from './schedular/routes';
import { SchedulerService } from './schedular/service';
import { SearchRoutes } from './search/routes';
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
    this.db = db;
    this.app = express();
    log.info('Initializing Express application');

    this.configureMiddleware();
    this.configureRoutes();
    this.configureErrorHandling();
    log.info('Express application initialized successfully');
  }

  private configureMiddleware(): void {
    // Security middleware
    this.app.use(helmet());
    this.app.use(cors({ origin: 'http://localhost:5173' }));

    // Request parsing middleware
    this.app.use(express.json());
    this.app.use(express.urlencoded({ extended: true }));

    // Trace ID middleware - must be before HTTP logger
    this.app.use(traceMiddleware);

    // Logging middleware - Pino HTTP logger
    this.app.use(httpLogger);

    log.info('Express middleware configured');
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

    // Investments routes
    const investmentService = new InvestmentService(this.db);
    const investmentController = new InvestmentController(investmentService);
    const investmentRoutes = new InvestmentRoutes(investmentController, authMiddleware);

    // Dashboard routes
    const dashboardService = new DashboardService(this.db);
    const dashboardController = new DashboardController(dashboardService);
    const dashboardRoutes = new DashboardRoutes(dashboardController, authMiddleware);

    // Scheduler routes
    const notificationService = new NotificationService(this.db);
    const notificationsRoutes = new NotificationsRoutes(this.db, authMiddleware);
    const schedulerService = new SchedulerService(this.db, notificationService);
    schedulerService.initialize().catch((error) => {
      log.error('Failed to initialize scheduler service', { error, service: 'scheduler' });
    });
    schedulerService.start();
    const schedulerController = new SchedulerController(schedulerService);
    const schedulerRoutes = new SchedulerRoutes(schedulerController);

    // Initialize services
    authService.initialize().catch((error) => {
      log.error('Failed to initialize auth service', { error, service: 'auth' });
    });

    transactionService.initialize().catch((error) => {
      log.error('Failed to initialize transaction service', { error, service: 'transaction' });
    });

    budgetService.initialize().catch((error) => {
      log.error('Failed to initialize budget service', { error, service: 'budget' });
    });

    goalService.initialize().catch((error) => {
      log.error('Failed to initialize goal service', { error, service: 'goal' });
    });

    accountService.initialize().catch((error) => {
      log.error('Failed to initialize account service', { error, service: 'account' });
    });

    reportService.initialize().catch((error) => {
      log.error('Failed to initialize report service', { error, service: 'report' });
    });

    settingsService.initialize().catch((error) => {
      log.error('Failed to initialize settings service', { error, service: 'settings' });
    });

    investmentService.initialize().catch((error) => {
      log.error('Failed to initialize investment service', { error, service: 'investments' });
    });

    dashboardService.initialize().catch((error) => {
      log.error('Failed to initialize dashboard service', { error, service: 'dashboard' });
    });

    // Set up API routes
    this.app.use('/api/auth', authRoutes.getRouter());
    this.app.use('/api/transactions', transactionRoutes.getRouter());
    this.app.use('/api/budgets', budgetRoutes.getRouter());
    this.app.use('/api/goals', goalRoutes.getRouter());
    this.app.use('/api/accounts', accountRoutes.getRouter());
    this.app.use('/api/reports', reportRoutes.getRouter());
    this.app.use('/api/settings', settingsRoutes.getRouter());
    this.app.use('/api/investments', investmentRoutes.getRouter());
    this.app.use('/api/dashboard', dashboardRoutes.getRouter());
    this.app.use('/api/admin/scheduler', schedulerRoutes.router);
    this.app.use('/api/notifications', notificationsRoutes.router);

    const searchRoutes = new SearchRoutes(this.db, authMiddleware);
    this.app.use('/api/search', searchRoutes.router);

    // Root route
    this.app.get('/', (_req, res) => {
      log.info('Root endpoint accessed');
      res.json({ message: 'Finance Tracker API' });
    });

    // Health check (used by Docker / load balancers)
    this.app.get('/health', (_req, res) => {
      res.json({ status: 'ok' });
    });

    log.info('API routes configured');
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
