import express from 'express';
import dotenv from 'dotenv';
import accountRoutes from './routes/account.routes';
import loginRoutes from './routes/login.routes';
import swaggerUi from 'swagger-ui-express';
import { specs } from './config/swagger';

dotenv.config();

const app = express();
const port = process.env.PORT || 3000;

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.use('/api/account', accountRoutes);
app.use('/api/auth', loginRoutes);

// Swagger documentation route
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(specs));

// Error handling middleware
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error(err.stack);
  res.status(500).json({
    success: false,
    message: 'Internal server error',
    error: err.message
  });
});

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
}); 