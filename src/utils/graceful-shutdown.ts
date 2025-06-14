/**
 * =================================
 * GRACEFUL SHUTDOWN UTILITY
 * Handle server shutdown gracefully
 * =================================
 */

import { Server } from 'http';
import { logger } from '@/config/logger.config';
import { databaseManager } from '@/config/database.config';

/**
 * Graceful shutdown handler
 */
export const gracefulShutdown = (server: Server): void => {
  const shutdownHandler = (signal: string) => {
    logger.info(`Received ${signal}. Starting graceful shutdown...`);
    
    // Stop accepting new connections
    server.close(async (err) => {
      if (err) {
        logger.error('Error during server shutdown:', err);
        process.exit(1);
      }
      
      try {
        // Close database connections
        await databaseManager.disconnect();
        logger.info('Database connections closed');
        
        // Close other resources (Redis, etc.)
        // Add any other cleanup logic here
        
        logger.info('Graceful shutdown completed');
        process.exit(0);
      } catch (error) {
        logger.error('Error during graceful shutdown:', error);
        process.exit(1);
      }
    });
    
    // Force shutdown after 30 seconds
    setTimeout(() => {
      logger.error('Could not close connections in time, forcefully shutting down');
      process.exit(1);
    }, 30000);
  };

  // Listen for termination signals
  process.on('SIGTERM', () => shutdownHandler('SIGTERM'));
  process.on('SIGINT', () => shutdownHandler('SIGINT'));
  
  // Handle uncaught exceptions
  process.on('uncaughtException', (err) => {
    logger.error('Uncaught Exception:', err);
    shutdownHandler('UNCAUGHT_EXCEPTION');
  });
  
  // Handle unhandled promise rejections
  process.on('unhandledRejection', (reason, promise) => {
    logger.error('Unhandled Rejection at:', promise, 'reason:', reason);
    shutdownHandler('UNHANDLED_REJECTION');
  });
}; 