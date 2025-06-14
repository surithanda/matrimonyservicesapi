/**
 * =================================
 * LOGGER CONFIGURATION
 * Winston logger with multiple transports
 * =================================
 */

import winston from 'winston';
import path from 'path';
import { config, isDevelopment, isProduction } from './app.config';

// Custom log format
const logFormat = winston.format.combine(
  winston.format.timestamp({
    format: 'YYYY-MM-DD HH:mm:ss',
  }),
  winston.format.errors({ stack: true }),
  winston.format.json(),
  winston.format.prettyPrint()
);

// Development console format
const consoleFormat = winston.format.combine(
  winston.format.colorize(),
  winston.format.timestamp({
    format: 'HH:mm:ss',
  }),
  winston.format.printf(({ timestamp, level, message, ...meta }) => {
    let msg = `${timestamp} [${level}]: ${message}`;
    
    if (Object.keys(meta).length > 0) {
      msg += `\n${JSON.stringify(meta, null, 2)}`;
    }
    
    return msg;
  })
);

// Create transports array
const transports: winston.transport[] = [];

// Console transport (always enabled in development)
if (isDevelopment()) {
  transports.push(
    new winston.transports.Console({
      level: config.LOG_LEVEL,
      format: consoleFormat,
    })
  );
} else {
  // Simple console transport for production
  transports.push(
    new winston.transports.Console({
      level: config.LOG_LEVEL,
      format: logFormat,
    })
  );
}

// File transports (production and development)
if (config.LOG_FILE_PATH) {
  const logDir = path.dirname(config.LOG_FILE_PATH);
  
  // General log file
  transports.push(
    new winston.transports.File({
      filename: config.LOG_FILE_PATH,
      level: config.LOG_LEVEL,
      format: logFormat,
      maxsize: 5242880, // 5MB
      maxFiles: 5,
    })
  );
  
  // Error log file
  transports.push(
    new winston.transports.File({
      filename: path.join(logDir, 'error.log'),
      level: 'error',
      format: logFormat,
      maxsize: 5242880, // 5MB
      maxFiles: 5,
    })
  );
  
  // Separate file for HTTP requests
  transports.push(
    new winston.transports.File({
      filename: path.join(logDir, 'requests.log'),
      level: 'info',
      format: logFormat,
      maxsize: 5242880, // 5MB
      maxFiles: 10,
    })
  );
}

// Create logger instance
export const logger = winston.createLogger({
  level: config.LOG_LEVEL,
  format: logFormat,
  defaultMeta: {
    service: config.APP_NAME,
    environment: config.NODE_ENV,
    version: config.API_VERSION,
  },
  transports,
  exitOnError: false,
});

// Create separate logger for HTTP requests
export const httpLogger = winston.createLogger({
  level: 'info',
  format: logFormat,
  defaultMeta: {
    service: `${config.APP_NAME}-http`,
    environment: config.NODE_ENV,
  },
  transports: [
    new winston.transports.Console({
      level: 'info',
      format: isDevelopment() ? consoleFormat : logFormat,
    }),
    ...(config.LOG_FILE_PATH
      ? [
          new winston.transports.File({
            filename: path.join(path.dirname(config.LOG_FILE_PATH), 'requests.log'),
            level: 'info',
            format: logFormat,
            maxsize: 5242880,
            maxFiles: 10,
          }),
        ]
      : []),
  ],
});

// Database logger
export const dbLogger = winston.createLogger({
  level: config.ENABLE_SQL_LOGGING ? 'debug' : 'warn',
  format: logFormat,
  defaultMeta: {
    service: `${config.APP_NAME}-db`,
    environment: config.NODE_ENV,
  },
  transports: [
    new winston.transports.Console({
      level: config.ENABLE_SQL_LOGGING ? 'debug' : 'warn',
      format: isDevelopment() ? consoleFormat : logFormat,
    }),
    ...(config.LOG_FILE_PATH
      ? [
          new winston.transports.File({
            filename: path.join(path.dirname(config.LOG_FILE_PATH), 'database.log'),
            level: 'debug',
            format: logFormat,
            maxsize: 5242880,
            maxFiles: 5,
          }),
        ]
      : []),
  ],
});

// Error logging helper
export const logError = (error: Error, context?: Record<string, any>) => {
  logger.error(error.message, {
    stack: error.stack,
    name: error.name,
    ...context,
  });
};

// Performance logging helper
export const logPerformance = (operation: string, duration: number, context?: Record<string, any>) => {
  logger.info(`Performance: ${operation}`, {
    duration: `${duration}ms`,
    operation,
    ...context,
  });
};

// Audit logging helper
export const logAudit = (action: string, userId?: string, context?: Record<string, any>) => {
  logger.info(`Audit: ${action}`, {
    action,
    userId,
    timestamp: new Date().toISOString(),
    ...context,
  });
};

// Security logging helper
export const logSecurity = (event: string, severity: 'low' | 'medium' | 'high' | 'critical', context?: Record<string, any>) => {
  const logLevel = severity === 'critical' || severity === 'high' ? 'error' : 'warn';
  
  logger[logLevel](`Security: ${event}`, {
    event,
    severity,
    timestamp: new Date().toISOString(),
    ...context,
  });
}; 