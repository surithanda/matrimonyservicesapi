/**
 * =================================
 * MATRIMONY SERVICES API - MAIN SERVER
 * Modern Express.js server with TypeScript
 * =================================
 */

import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import rateLimit from 'express-rate-limit';
import { createServer } from 'http';

// Import configurations
import { config } from '@/config/app.config';
import { corsConfig } from '@/config/cors.config';
import { rateLimitConfig } from '@/config/rate-limit.config';
import { logger } from '@/config/logger.config';

// Import middleware
import { requestLogger } from '@/middleware/request-logger.middleware';
import { errorHandler } from '@/middleware/error-handler.middleware';
import { notFoundHandler } from '@/middleware/not-found.middleware';
import { validateApiKey } from '@/middleware/auth.middleware';

// Import routes
import { setupRoutes } from '@/routes';

// Import utilities
import { gracefulShutdown } from '@/utils/graceful-shutdown';
import { createUploadsDirectory } from '@/utils/file-system';

/**
 * Bootstrap the application
 */
async function bootstrap(): Promise<void> {
  try {
    // Create Express application
    const app = express();
    const server = createServer(app);

    // Trust proxy (important for production behind reverse proxy)
    app.set('trust proxy', 1);

    // Disable X-Powered-By header for security
    app.disable('x-powered-by');

    // =================================
    // SECURITY MIDDLEWARE
    // =================================
    
    // Helmet - Security headers
    app.use(helmet({
      contentSecurityPolicy: {
        directives: {
          defaultSrc: ["'self'"],
          styleSrc: ["'self'", "'unsafe-inline'"],
          scriptSrc: ["'self'"],
          imgSrc: ["'self'", "data:", "https:"],
        },
      },
      crossOriginEmbedderPolicy: false,
    }));

    // CORS
    app.use(cors(corsConfig));

    // Rate limiting
    if (config.ENABLE_RATE_LIMITING) {
      app.use(rateLimit(rateLimitConfig));
    }

    // =================================
    // PARSING MIDDLEWARE
    // =================================
    
    // Body parsing
    app.use(express.json({ limit: '10mb' }));
    app.use(express.urlencoded({ extended: true, limit: '10mb' }));

    // Compression
    if (config.ENABLE_COMPRESSION) {
      app.use(compression());
    }

    // =================================
    // LOGGING MIDDLEWARE
    // =================================
    
    if (config.ENABLE_REQUEST_LOGGING) {
      app.use(requestLogger);
    }

    // =================================
    // STATIC FILES
    // =================================
    
    // Serve uploads directory
    app.use('/uploads', express.static(config.UPLOAD_DIR));

    // =================================
    // API ROUTES
    // =================================
    
    // Health check (no auth required)
    app.get('/health', (req, res) => {
      res.status(200).json({
        status: 'OK',
        timestamp: new Date().toISOString(),
        uptime: process.uptime(),
        environment: config.NODE_ENV,
        version: config.API_VERSION,
      });
    });

    // API routes with authentication
    app.use(`/api/${config.API_VERSION}`, validateApiKey, setupRoutes());

    // =================================
    // ERROR HANDLING
    // =================================
    
    // 404 handler
    app.use(notFoundHandler);

    // Global error handler
    app.use(errorHandler);

    // =================================
    // SERVER STARTUP
    // =================================
    
    // Ensure uploads directory exists
    await createUploadsDirectory();

    // Start server
    server.listen(config.PORT, () => {
      logger.info(`🚀 Server started successfully`, {
        port: config.PORT,
        environment: config.NODE_ENV,
        version: config.API_VERSION,
        pid: process.pid,
      });
    });

    // =================================
    // GRACEFUL SHUTDOWN
    // =================================
    
    gracefulShutdown(server);

  } catch (error) {
    logger.error('❌ Failed to start server:', error);
    process.exit(1);
  }
}

// Start the application
bootstrap(); 