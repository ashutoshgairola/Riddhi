import dotenv from "dotenv";
import { DatabaseConfig } from "./config/db";
import { App } from "./app";

// Load environment variables
dotenv.config();

// Set up process event handlers for graceful shutdown
process.on("uncaughtException", (error) => {
  console.error("Uncaught Exception:", error);
  process.exit(1);
});

process.on("unhandledRejection", (reason, promise) => {
  console.error("Unhandled Rejection at:", promise, "reason:", reason);
  process.exit(1);
});

// Server startup function
async function startServer() {
  try {
    // Connect to the database
    const dbConfig = DatabaseConfig.getInstance();
    await dbConfig.connect();

    // Create and configure the Express app
    const app = new App(dbConfig.getDb());
    const expressApp = app.getExpressApp();

    // Start the server
    const port = parseInt(process.env.PORT || "3000", 10);
    const server = expressApp.listen(port, () => {
      console.log(`Server running on port ${port}`);
    });

    // Handle graceful shutdown
    const shutdown = async () => {
      console.log("Shutting down server...");
      server.close(async () => {
        console.log("HTTP server closed");
        await dbConfig.disconnect();
        process.exit(0);
      });
    };

    process.on("SIGTERM", shutdown);
    process.on("SIGINT", shutdown);
  } catch (error) {
    console.error("Failed to start server:", error);
    process.exit(1);
  }
}

startServer();
