import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import rateLimit from 'express-rate-limit';
import swaggerJsdoc from 'swagger-jsdoc';
import swaggerUi from 'swagger-ui-express';
import { config } from './config/app.config';
import { logger } from './config/logger.config';

const app = express();

// Basic middleware
app.use(helmet());
app.use(cors({
  origin: ['http://localhost:3000', 'http://localhost:3001'],
  credentials: true
}));
app.use(compression());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP, please try again after 15 minutes.'
});
app.use('/api/', limiter);

// Swagger setup
const swaggerOptions = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Matrimony Services API',
      version: '2.0.0',
      description: 'Modern matrimony services API with comprehensive features'
    },
    servers: [
      {
        url: 'http://localhost:3000',
        description: 'Development server'
      }
    ],
    components: {
      securitySchemes: {
        ApiKeyAuth: {
          type: 'apiKey',
          in: 'header',
          name: 'X-API-Key'
        },
        BearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT'
        }
      }
    }
  },
  apis: ['./src/routes/*.ts', './src/controllers/*.ts']
};

const specs = swaggerJsdoc(swaggerOptions);
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(specs));

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: config.NODE_ENV
  });
});

// API Routes
app.get('/api/test', (req, res) => {
  res.json({
    success: true,
    message: 'API is working!',
    timestamp: new Date().toISOString()
  });
});

// Auth routes
app.post('/api/auth/register', (req, res) => {
  const { email, password, firstName, lastName } = req.body;
  
  if (!email || !password || !firstName || !lastName) {
    return res.status(400).json({
      success: false,
      message: 'Missing required fields'
    });
  }

  res.status(201).json({
    success: true,
    message: 'User registered successfully',
    data: {
      id: '123',
      email,
      firstName,
      lastName,
      createdAt: new Date().toISOString()
    }
  });
});

app.post('/api/auth/login', (req, res) => {
  const { email, password } = req.body;
  
  if (!email || !password) {
    return res.status(400).json({
      success: false,
      message: 'Email and password are required'
    });
  }

  res.json({
    success: true,
    message: 'Login successful',
    data: {
      token: 'sample_jwt_token',
      user: {
        id: '123',
        email,
        role: 'USER'
      }
    }
  });
});

// Profile routes
app.get('/api/profiles', (req, res) => {
  res.json({
    success: true,
    message: 'Profiles retrieved successfully',
    data: [
      {
        id: '1',
        firstName: 'John',
        lastName: 'Doe',
        age: 28,
        location: 'New York',
        profession: 'Engineer'
      },
      {
        id: '2',
        firstName: 'Jane',
        lastName: 'Smith',
        age: 26,
        location: 'California',
        profession: 'Doctor'
      }
    ]
  });
});

app.get('/api/profiles/:id', (req, res) => {
  const { id } = req.params;
  
  res.json({
    success: true,
    message: 'Profile retrieved successfully',
    data: {
      id,
      firstName: 'John',
      lastName: 'Doe',
      age: 28,
      location: 'New York',
      profession: 'Engineer',
      bio: 'Looking for a life partner',
      interests: ['Reading', 'Travel', 'Cooking']
    }
  });
});

// Matches routes
app.get('/api/matches', (req, res) => {
  res.json({
    success: true,
    message: 'Matches retrieved successfully',
    data: [
      {
        id: '1',
        profileId: '2',
        compatibility: 85,
        status: 'pending'
      }
    ]
  });
});

// Interests routes
app.post('/api/interests', (req, res) => {
  const { targetUserId, message } = req.body;
  
  res.status(201).json({
    success: true,
    message: 'Interest sent successfully',
    data: {
      id: 'interest_123',
      targetUserId,
      message,
      status: 'sent',
      sentAt: new Date().toISOString()
    }
  });
});

// Admin routes
app.get('/api/admin/stats', (req, res) => {
  res.json({
    success: true,
    message: 'Admin statistics retrieved',
    data: {
      totalUsers: 1000,
      activeUsers: 750,
      totalMatches: 150,
      successfulMatches: 45
    }
  });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    message: 'Route not found',
    path: req.originalUrl
  });
});

// Error handler
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  logger.error('Error:', err);
  
  res.status(err.status || 500).json({
    success: false,
    message: err.message || 'Internal Server Error',
    ...(config.NODE_ENV === 'development' && { stack: err.stack })
  });
});

export default app; 