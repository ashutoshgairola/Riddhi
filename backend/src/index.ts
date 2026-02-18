import dotenv from 'dotenv';

import { App } from './app';
import { DatabaseConfig } from './config/db';
import { log, setupGracefulShutdown } from './config/logger';

// Load environment variables
dotenv.config();

// Set up graceful shutdown logging
setupGracefulShutdown();

// Set up process event handlers for graceful shutdown
process.on('uncaughtException', (error) => {
  log.fatal('Uncaught Exception - exiting process', { error });
  process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
  log.fatal('Unhandled Promise Rejection - exiting process', { reason, promise });
  process.exit(1);
});

// Server startup function
async function startServer() {
  try {
    log.info('Starting Riddhi API server...');

    // Connect to the database
    const dbConfig = DatabaseConfig.getInstance();
    await dbConfig.connect();
    const db = dbConfig.getDb();
    log.info('Database connection established');

    // Create and configure the Express app
    const app = new App(db);
    const expressApp = app.getExpressApp();

    // Start the server
    const port = parseInt(process.env.PORT || '3000', 10);
    const server = expressApp.listen(port, () => {
      log.info('Server running and ready to accept connections', { port });
    });

    // Handle graceful shutdown
    const shutdown = async () => {
      log.info('Received shutdown signal - initiating graceful shutdown');

      server.close(async (err) => {
        if (err) {
          log.error('Error during server shutdown', { error: err });
        } else {
          log.info('HTTP server closed successfully');
        }

        try {
          await dbConfig.disconnect();
          log.info('Database connection closed successfully');
        } catch (dbError) {
          log.error('Error closing database connection', { error: dbError });
        }

        log.info('Graceful shutdown completed');
        process.exit(0);
      });

      // Force shutdown after timeout
      setTimeout(() => {
        log.fatal('Forced shutdown due to timeout');
        process.exit(1);
      }, 10000);
    };

    process.on('SIGTERM', shutdown);
    process.on('SIGINT', shutdown);
  } catch (error) {
    log.fatal('Failed to start server', { error });
    process.exit(1);
  }
}

startServer();
