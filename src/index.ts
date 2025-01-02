import express from 'express';
import dotenv from 'dotenv';
import accountRoutes from './routes/account.routes';
import authRoutes from './routes/auth.routes';
import swaggerUi from 'swagger-ui-express';
import cors from './config/cors';
import { specs } from './config/swagger';
import path from 'path';

dotenv.config();

const app = express();
const port = process.env.PORT || 3000;

// Middleware
app.use(cors);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve swagger static files
app.use('/api-docs', express.static(path.join(__dirname, 'node_modules/swagger-ui-dist')));

// Health check endpoint
app.get('/', (req, res) => {
  res.status(200).json({ status: 'OK' });
});

// Routes
app.use('/api/account', accountRoutes);
app.use('/api/auth', authRoutes);

// Swagger documentation setup
app.use('/api-docs', swaggerUi.serve);
app.get('/api-docs', swaggerUi.setup(specs, {
  customSiteTitle: "Account Management API Docs",
  swaggerOptions: {
    url: '/api-docs/swagger.json',
    persistAuthorization: true
  }
}));

// Serve swagger spec
app.get('/api-docs/swagger.json', (req, res) => {
  res.setHeader('Content-Type', 'application/json');
  res.send(specs);
});

// Error handling middleware
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error(err.stack);
  res.status(500).json({
    success: false,
    message: 'Internal server error',
    error: process.env.NODE_ENV === 'development' ? err.message : undefined
  });
});

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
}); 