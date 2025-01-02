import express from 'express';
import dotenv from 'dotenv';
import accountRoutes from './routes/account.routes';
import authRoutes from './routes/auth.routes';
import swaggerUi from 'swagger-ui-express';
import cors from './config/cors';
import swaggerJsdoc from 'swagger-jsdoc';

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
const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Matrimoney API Documentation',
      version: '1.0.0',
      description: 'API documentation for Matrimoney backend',
    },
    servers: [
      {
        url: process.env.NODE_ENV === 'production'
          ? 'https://matrimoney-backend-j9tsnbj9m-b4xabhisheks-projects.vercel.app'
          : 'http://localhost:3000',
        description: process.env.NODE_ENV === 'production' ? 'Production Server' : 'Development Server'
      },
    ],
  },
  apis: ['./src/routes/*.ts'],
};

const specs = swaggerJsdoc(options);
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(specs));

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