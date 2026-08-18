import app from './app';
import { AppConfig } from './config/AppConfig';
import { MongoDatabase } from './core/database/MongoDatabase';
import { Logger } from './shared/utils/Logger';

const startServer = async () => {
  try {
    // Connect to MongoDB
    await MongoDatabase.connect();

    // Listen on port
    const server = app.listen(AppConfig.port, () => {
      Logger.info(`🚀 StayOS API Server running in [${AppConfig.env}] mode on port ${AppConfig.port}`);
    });

    const shutdown = async (signal: string) => {
      Logger.warn(`Received ${signal}. Initializing graceful shutdown process...`);
      
      server.close(async () => {
        Logger.info('Express server stopped accepting new requests.');
        
        try {
          await MongoDatabase.disconnect();
          Logger.info('MongoDB connections disconnected successfully.');
          Logger.info('Graceful shutdown completed. Exiting.');
          process.exit(0);
        } catch (dbErr) {
          Logger.error('Error disconnecting database during shutdown:', { error: dbErr });
          process.exit(1);
        }
      });

      // Force termination timer (10 seconds)
      setTimeout(() => {
        Logger.error('Forceful shutdown: connection cleanup timed out.');
        process.exit(1);
      }, 10000);
    };

    process.on('SIGTERM', () => shutdown('SIGTERM'));
    process.on('SIGINT', () => shutdown('SIGINT'));

  } catch (error) {
    Logger.error('Failed to initialize server', { error });
    process.exit(1);
  }
};

// Process-level unhandled error event handlers
process.on('uncaughtException', (error) => {
  Logger.error('UNCAUGHT EXCEPTION! Shutting down server immediately...', {
    error: {
      message: error.message,
      stack: error.stack
    }
  });
  process.exit(1);
});

process.on('unhandledRejection', (reason) => {
  const errorMsg = reason instanceof Error ? reason.message : String(reason);
  const errorStack = reason instanceof Error ? reason.stack : undefined;
  
  Logger.error('UNHANDLED REJECTION! Shutting down server immediately...', {
    error: {
      message: errorMsg,
      stack: errorStack
    }
  });
  process.exit(1);
});

startServer();
