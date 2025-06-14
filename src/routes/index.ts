/**
 * =================================
 * MAIN ROUTES SETUP
 * Combine all route modules
 * =================================
 */

import { Router } from 'express';
import swaggerUi from 'swagger-ui-express';
import { specs } from '@/config/swagger.config';
import { config } from '@/config/app.config';

// Import route modules
import authRoutes from './auth.routes';
import userRoutes from './user.routes';
import profileRoutes from './profile.routes';
import photoRoutes from './photo.routes';
import interestRoutes from './interest.routes';
import matchRoutes from './match.routes';
import subscriptionRoutes from './subscription.routes';
import adminRoutes from './admin.routes';

/**
 * Setup all application routes
 */
export const setupRoutes = (): Router => {
  const router = Router();

  // =================================
  // API DOCUMENTATION
  // =================================
  if (config.ENABLE_SWAGGER) {
    // Swagger UI
    router.use('/docs', swaggerUi.serve);
    router.get('/docs', swaggerUi.setup(specs, {
      customCss: '.swagger-ui .topbar { display: none }',
      customSiteTitle: 'Matrimony Services API Documentation',
      swaggerOptions: {
        url: `/api/${config.API_VERSION}/docs/swagger.json`,
      },
    }));

    // Swagger JSON spec
    router.get('/docs/swagger.json', (req, res) => {
      res.setHeader('Content-Type', 'application/json');
      res.send(specs);
    });
  }

  // =================================
  // API ROUTES
  // =================================
  
  // Authentication routes (public)
  router.use('/auth', authRoutes);
  
  // User management routes
  router.use('/users', userRoutes);
  
  // Profile management routes
  router.use('/profiles', profileRoutes);
  
  // Photo management routes
  router.use('/photos', photoRoutes);
  
  // Interest management routes
  router.use('/interests', interestRoutes);
  
  // Match management routes
  router.use('/matches', matchRoutes);
  
  // Subscription management routes
  router.use('/subscriptions', subscriptionRoutes);
  
  // Admin routes
  router.use('/admin', adminRoutes);

  return router;
}; 