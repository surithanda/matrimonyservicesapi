/**
 * =================================
 * APPLICATION CONFIGURATION
 * Type-safe configuration with validation
 * =================================
 */

import { z } from 'zod';

// Configuration schema for validation
const configSchema = z.object({
  // =================================
  // APPLICATION SETTINGS
  // =================================
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  PORT: z.coerce.number().default(3000),
  API_VERSION: z.string().default('v1'),
  APP_NAME: z.string().default('matrimony-services-api'),
  APP_URL: z.string().url().default('http://localhost:3000'),

  // =================================
  // DATABASE SETTINGS
  // =================================
  DATABASE_URL: z.string().min(1, 'Database URL is required'),
  DB_HOST: z.string().default('localhost'),
  DB_PORT: z.coerce.number().default(3306),
  DB_USER: z.string().min(1, 'Database user is required'),
  DB_PASSWORD: z.string().min(1, 'Database password is required'),
  DB_NAME: z.string().min(1, 'Database name is required'),
  DB_CONNECTION_LIMIT: z.coerce.number().default(20),
  DB_QUEUE_LIMIT: z.coerce.number().default(0),
  DB_TIMEOUT: z.coerce.number().default(10000),

  // =================================
  // REDIS SETTINGS
  // =================================
  REDIS_URL: z.string().optional(),
  REDIS_HOST: z.string().default('localhost'),
  REDIS_PORT: z.coerce.number().default(6379),
  REDIS_PASSWORD: z.string().optional(),
  REDIS_TTL: z.coerce.number().default(3600),

  // =================================
  // JWT & AUTHENTICATION
  // =================================
  JWT_SECRET: z.string().min(32, 'JWT secret must be at least 32 characters'),
  JWT_EXPIRES_IN: z.string().default('24h'),
  JWT_REFRESH_SECRET: z.string().min(32, 'JWT refresh secret must be at least 32 characters'),
  JWT_REFRESH_EXPIRES_IN: z.string().default('7d'),
  BCRYPT_ROUNDS: z.coerce.number().default(12),

  // =================================
  // EMAIL SETTINGS
  // =================================
  EMAIL_HOST: z.string().default('smtp.gmail.com'),
  EMAIL_PORT: z.coerce.number().default(587),
  EMAIL_SECURE: z.coerce.boolean().default(false),
  EMAIL_USER: z.string().email('Invalid email format'),
  EMAIL_PASSWORD: z.string().min(1, 'Email password is required'),
  EMAIL_FROM: z.string().email('Invalid email format'),
  EMAIL_FROM_NAME: z.string().default('Matrimony Services'),

  // =================================
  // FILE UPLOAD SETTINGS
  // =================================
  UPLOAD_DIR: z.string().default('uploads'),
  MAX_FILE_SIZE: z.coerce.number().default(5242880), // 5MB
  ALLOWED_FILE_TYPES: z.string().default('jpg,jpeg,png,gif,pdf'),

  // =================================
  // AWS/CLOUD STORAGE (OPTIONAL)
  // =================================
  AWS_ACCESS_KEY_ID: z.string().optional(),
  AWS_SECRET_ACCESS_KEY: z.string().optional(),
  AWS_REGION: z.string().default('us-east-1'),
  AWS_S3_BUCKET: z.string().optional(),
  AWS_CLOUDFRONT_URL: z.string().url().optional(),

  // =================================
  // SECURITY SETTINGS
  // =================================
  API_KEY: z.string().min(16, 'API key must be at least 16 characters'),
  MASTER_API_KEY: z.string().optional(),
  RATE_LIMIT_WINDOW_MS: z.coerce.number().default(900000), // 15 minutes
  RATE_LIMIT_MAX_REQUESTS: z.coerce.number().default(100),
  CORS_ORIGIN: z.string().default('http://localhost:3000'),
  ALLOWED_ORIGINS: z.string().default('http://localhost:3000'),

  // =================================
  // THIRD-PARTY SERVICES (OPTIONAL)
  // =================================
  STRIPE_PUBLISHABLE_KEY: z.string().optional(),
  STRIPE_SECRET_KEY: z.string().optional(),
  STRIPE_WEBHOOK_SECRET: z.string().optional(),
  TWILIO_ACCOUNT_SID: z.string().optional(),
  TWILIO_AUTH_TOKEN: z.string().optional(),
  TWILIO_PHONE_NUMBER: z.string().optional(),
  GOOGLE_CLIENT_ID: z.string().optional(),
  GOOGLE_CLIENT_SECRET: z.string().optional(),
  FACEBOOK_APP_ID: z.string().optional(),
  FACEBOOK_APP_SECRET: z.string().optional(),

  // =================================
  // MONITORING & ANALYTICS (OPTIONAL)
  // =================================
  LOG_LEVEL: z.enum(['error', 'warn', 'info', 'debug']).default('info'),
  LOG_FORMAT: z.enum(['json', 'simple']).default('json'),
  LOG_FILE_PATH: z.string().default('logs/app.log'),
  SENTRY_DSN: z.string().url().optional(),
  NEW_RELIC_LICENSE_KEY: z.string().optional(),
  GOOGLE_ANALYTICS_ID: z.string().optional(),

  // =================================
  // FEATURE FLAGS
  // =================================
  ENABLE_SWAGGER: z.coerce.boolean().default(true),
  ENABLE_CORS: z.coerce.boolean().default(true),
  ENABLE_COMPRESSION: z.coerce.boolean().default(true),
  ENABLE_HELMET: z.coerce.boolean().default(true),
  ENABLE_RATE_LIMITING: z.coerce.boolean().default(true),
  ENABLE_REQUEST_LOGGING: z.coerce.boolean().default(true),

  // =================================
  // DEVELOPMENT SETTINGS
  // =================================
  DEBUG: z.string().optional(),
  ENABLE_SQL_LOGGING: z.coerce.boolean().default(false),
  ENABLE_SEED_DATA: z.coerce.boolean().default(false),
});

// Parse and validate environment variables
const parseConfig = () => {
  try {
    return configSchema.parse(process.env);
  } catch (error) {
    if (error instanceof z.ZodError) {
      const errorMessages = error.errors.map(
        (err) => `${err.path.join('.')}: ${err.message}`
      );
      throw new Error(`Configuration validation failed:\n${errorMessages.join('\n')}`);
    }
    throw error;
  }
};

// Export validated configuration
export const config = parseConfig();

// Type for configuration
export type Config = z.infer<typeof configSchema>;

// Helper functions
export const isDevelopment = () => config.NODE_ENV === 'development';
export const isProduction = () => config.NODE_ENV === 'production';
export const isTest = () => config.NODE_ENV === 'test';

// Database connection string builder
export const buildDatabaseUrl = () => {
  if (config.DATABASE_URL) {
    return config.DATABASE_URL;
  }
  
  return `mysql://${config.DB_USER}:${config.DB_PASSWORD}@${config.DB_HOST}:${config.DB_PORT}/${config.DB_NAME}`;
};

// Redis connection string builder
export const buildRedisUrl = () => {
  if (config.REDIS_URL) {
    return config.REDIS_URL;
  }
  
  const auth = config.REDIS_PASSWORD ? `:${config.REDIS_PASSWORD}@` : '';
  return `redis://${auth}${config.REDIS_HOST}:${config.REDIS_PORT}`;
};

// Allowed file types array
export const getAllowedFileTypes = () => {
  return config.ALLOWED_FILE_TYPES.split(',').map(type => type.trim());
};

// CORS origins array
export const getCorsOrigins = () => {
  return config.ALLOWED_ORIGINS.split(',').map(origin => origin.trim());
}; 