import express from 'express';
import dotenv from 'dotenv';
import accountRoutes from './routes/account.routes';
import authRoutes from './routes/auth.routes';
import swaggerUi from 'swagger-ui-express';
import cors from './config/cors';
import { specs } from './config/swagger';
import profileRoutes from './routes/profile.routes';
import logger from './config/logger';

dotenv.config();

const app = express();
const port = process.env.PORT || 3000;

// Middleware
app.use(cors);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Request logging middleware
app.use((req, res, next) => {
  logger.info(`Incoming ${req.method} request to ${req.url}`, {
    method: req.method,
    url: req.url,
    ip: req.ip,
    headers: req.headers
  });
  next();
});

// Health check endpoint
app.get('/', (req, res) => {
  logger.info('Health check endpoint called');
  res.status(200).json({ status: 'OK' });
});

// Routes
app.use('/api/account', accountRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/profile', profileRoutes);

// Swagger documentation setup
app.use('/api-docs', swaggerUi.serve);
app.get('/api-docs', swaggerUi.setup(specs, {
  customCss: '.swagger-ui .topbar { display: none }',
  customSiteTitle: "Account Management API Documentation",
  swaggerOptions: {
    url: "/api-docs/swagger.json",
  },
}));

// Serve swagger spec
app.get('/api-docs/swagger.json', (req, res) => {
  res.setHeader('Content-Type', 'application/json');
  res.send(specs);
});

// Error handling middleware
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  logger.error('Internal server error', {
    error: err.message,
    stack: err.stack,
    url: req.url,
    method: req.method
  });
  res.status(500).json({
    success: false,
    message: 'Internal server error',
    error: process.env.NODE_ENV === 'development' ? err.message : undefined
  });
});

app.listen(port, () => {
  logger.info(`Server is running on port ${port}`);
}); 