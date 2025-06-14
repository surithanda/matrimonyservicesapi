/**
 * =================================
 * DATABASE CONFIGURATION
 * Prisma client setup with logging and connection management
 * =================================
 */

import { PrismaClient } from '@prisma/client';
import { config, isDevelopment } from './app.config';
import { dbLogger } from './logger.config';

// Prisma log levels based on environment
const getPrismaLogLevel = () => {
  if (isDevelopment() && config.ENABLE_SQL_LOGGING) {
    return ['query', 'info', 'warn', 'error'] as const;
  }
  return ['warn', 'error'] as const;
};

// Create Prisma client instance
export const prisma = new PrismaClient({
  log: getPrismaLogLevel(),
  errorFormat: 'pretty',
});

// Database connection management
class DatabaseManager {
  private static instance: DatabaseManager;
  private isConnected = false;
  private connectionAttempts = 0;
  private readonly maxRetries = 5;
  private readonly retryDelay = 5000; // 5 seconds

  private constructor() {}

  public static getInstance(): DatabaseManager {
    if (!DatabaseManager.instance) {
      DatabaseManager.instance = new DatabaseManager();
    }
    return DatabaseManager.instance;
  }

  /**
   * Connect to database with retry logic
   */
  public async connect(): Promise<void> {
    if (this.isConnected) {
      return;
    }

    while (this.connectionAttempts < this.maxRetries) {
      try {
        await prisma.$connect();
        await this.testConnection();
        
        this.isConnected = true;
        this.connectionAttempts = 0;
        
        dbLogger.info('Database connected successfully', {
          attempt: this.connectionAttempts + 1,
          database: config.DB_NAME,
        });
        
        return;
      } catch (error) {
        this.connectionAttempts++;
        
        dbLogger.error(`Database connection failed (attempt ${this.connectionAttempts}/${this.maxRetries})`, {
          error: error instanceof Error ? error.message : 'Unknown error',
          attempt: this.connectionAttempts,
        });

        if (this.connectionAttempts >= this.maxRetries) {
          throw new Error(`Failed to connect to database after ${this.maxRetries} attempts`);
        }

        // Wait before retrying
        await this.delay(this.retryDelay);
      }
    }
  }

  /**
   * Test database connection
   */
  private async testConnection(): Promise<void> {
    await prisma.$queryRaw`SELECT 1 as test`;
  }

  /**
   * Disconnect from database
   */
  public async disconnect(): Promise<void> {
    if (!this.isConnected) {
      return;
    }

    try {
      await prisma.$disconnect();
      this.isConnected = false;
      
      dbLogger.info('Database disconnected successfully');
    } catch (error) {
      dbLogger.error('Error disconnecting from database', {
        error: error instanceof Error ? error.message : 'Unknown error',
      });
      throw error;
    }
  }

  /**
   * Check if database is connected
   */
  public getConnectionStatus(): boolean {
    return this.isConnected;
  }

  /**
   * Get database health status
   */
  public async getHealthStatus(): Promise<{
    isConnected: boolean;
    responseTime: number;
    timestamp: string;
  }> {
    const startTime = Date.now();
    
    try {
      await this.testConnection();
      const responseTime = Date.now() - startTime;
      
      return {
        isConnected: true,
        responseTime,
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      return {
        isConnected: false,
        responseTime: Date.now() - startTime,
        timestamp: new Date().toISOString(),
      };
    }
  }

  /**
   * Delay utility
   */
  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

// Export database manager instance
export const databaseManager = DatabaseManager.getInstance();

// Prisma middleware for logging
prisma.$use(async (params, next) => {
  const start = Date.now();
  
  const result = await next(params);
  
  const duration = Date.now() - start;
  
  if (config.ENABLE_SQL_LOGGING) {
    dbLogger.debug('Database query executed', {
      model: params.model,
      action: params.action,
      duration: `${duration}ms`,
    });
  }

  // Log slow queries (>1000ms)
  if (duration > 1000) {
    dbLogger.warn('Slow database query detected', {
      model: params.model,
      action: params.action,
      duration: `${duration}ms`,
    });
  }

  return result;
});

// Error handling for Prisma
prisma.$on('error', (e) => {
  dbLogger.error('Prisma error occurred', {
    message: e.message,
    timestamp: e.timestamp,
  });
});

// Query logging in development
if (isDevelopment() && config.ENABLE_SQL_LOGGING) {
  prisma.$on('query', (e) => {
    dbLogger.debug('Database query', {
      query: e.query,
      params: e.params,
      duration: `${e.duration}ms`,
      timestamp: e.timestamp,
    });
  });
}

// Auto-connect on module load
databaseManager.connect().catch((error) => {
  dbLogger.error('Failed to connect to database on startup', {
    error: error instanceof Error ? error.message : 'Unknown error',
  });
  process.exit(1);
});

// Graceful shutdown handler
process.on('beforeExit', async () => {
  await databaseManager.disconnect();
});

export default prisma; 