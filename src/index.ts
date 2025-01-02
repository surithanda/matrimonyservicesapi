import express from 'express';
import dotenv from 'dotenv';
import accountRoutes from './routes/account.routes';
import authRoutes from './routes/auth.routes';
import swaggerUi from 'swagger-ui-express';
import cors from './config/cors';
import { specs } from './config/swagger';

dotenv.config();

const app = express();
const port = process.env.PORT || 3000;

// Middleware
app.use(cors);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

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
  customCss: '.swagger-ui .topbar { display: none }',
  customSiteTitle: "Account Management API Documentation",
  customfavIcon: "/assets/favicon.ico",
  swaggerUrl: "/api-docs/swagger.json",
  explorer: true,
  customJs: 'https://cdnjs.cloudflare.com/ajax/libs/swagger-ui/5.10.5/swagger-ui-bundle.js',
  customCssUrl: 'https://cdnjs.cloudflare.com/ajax/libs/swagger-ui/5.10.5/swagger-ui.min.css'
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