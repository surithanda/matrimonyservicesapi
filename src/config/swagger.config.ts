/**
 * =================================
 * SWAGGER/OPENAPI CONFIGURATION
 * API documentation setup
 * =================================
 */

import swaggerJsdoc from 'swagger-jsdoc';
import { config } from './app.config';

// Basic swagger definition
const swaggerDefinition = {
  openapi: '3.0.0',
  info: {
    title: 'Matrimony Services API',
    version: '2.0.0',
    description: 'Modern matrimony services API built with TypeScript, Prisma, and Express',
    contact: {
      name: 'API Support',
      email: 'support@matrimony-app.com',
    },
    license: {
      name: 'MIT',
      url: 'https://opensource.org/licenses/MIT',
    },
  },
  servers: [
    {
      url: `${config.APP_URL}/api/${config.API_VERSION}`,
      description: 'Development server',
    },
    {
      url: `https://api.matrimony-app.com/api/${config.API_VERSION}`,
      description: 'Production server',
    },
  ],
  components: {
    securitySchemes: {
      ApiKeyAuth: {
        type: 'apiKey',
        in: 'header',
        name: 'X-API-Key',
        description: 'API key for accessing the endpoints',
      },
      BearerAuth: {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        description: 'JWT token for authenticated requests',
      },
    },
    schemas: {
      // Error responses
      Error: {
        type: 'object',
        properties: {
          success: {
            type: 'boolean',
            example: false,
          },
          error: {
            type: 'string',
            example: 'VALIDATION_ERROR',
          },
          message: {
            type: 'string',
            example: 'Validation failed',
          },
          statusCode: {
            type: 'integer',
            example: 400,
          },
          timestamp: {
            type: 'string',
            format: 'date-time',
            example: '2025-01-08T10:30:00.000Z',
          },
          requestId: {
            type: 'string',
            example: 'req_123456789',
          },
        },
        required: ['success', 'error', 'message', 'statusCode', 'timestamp'],
      },
      
      // Success response wrapper
      SuccessResponse: {
        type: 'object',
        properties: {
          success: {
            type: 'boolean',
            example: true,
          },
          message: {
            type: 'string',
            example: 'Operation completed successfully',
          },
          data: {
            type: 'object',
            description: 'Response data',
          },
          meta: {
            type: 'object',
            properties: {
              timestamp: {
                type: 'string',
                format: 'date-time',
              },
              requestId: {
                type: 'string',
              },
            },
          },
        },
        required: ['success', 'data'],
      },

      // Pagination meta
      PaginationMeta: {
        type: 'object',
        properties: {
          page: {
            type: 'integer',
            example: 1,
          },
          limit: {
            type: 'integer',
            example: 10,
          },
          total: {
            type: 'integer',
            example: 100,
          },
          totalPages: {
            type: 'integer',
            example: 10,
          },
          hasNext: {
            type: 'boolean',
            example: true,
          },
          hasPrev: {
            type: 'boolean',
            example: false,
          },
        },
      },

      // User schemas
      User: {
        type: 'object',
        properties: {
          id: {
            type: 'string',
            example: 'user_123456789',
          },
          email: {
            type: 'string',
            format: 'email',
            example: 'user@example.com',
          },
          phone: {
            type: 'string',
            example: '+1234567890',
          },
          role: {
            type: 'string',
            enum: ['USER', 'ADMIN', 'MODERATOR', 'SUPPORT'],
            example: 'USER',
          },
          emailVerified: {
            type: 'boolean',
            example: true,
          },
          phoneVerified: {
            type: 'boolean',
            example: false,
          },
          lastLogin: {
            type: 'string',
            format: 'date-time',
            example: '2025-01-08T10:30:00.000Z',
          },
          createdAt: {
            type: 'string',
            format: 'date-time',
            example: '2025-01-01T00:00:00.000Z',
          },
          updatedAt: {
            type: 'string',
            format: 'date-time',
            example: '2025-01-08T10:30:00.000Z',
          },
        },
        required: ['id', 'email', 'role', 'emailVerified', 'createdAt', 'updatedAt'],
      },

      // Profile schemas
      Profile: {
        type: 'object',
        properties: {
          id: {
            type: 'string',
            example: 'profile_123456789',
          },
          userId: {
            type: 'string',
            example: 'user_123456789',
          },
          firstName: {
            type: 'string',
            example: 'John',
          },
          lastName: {
            type: 'string',
            example: 'Doe',
          },
          displayName: {
            type: 'string',
            example: 'John D.',
          },
          dateOfBirth: {
            type: 'string',
            format: 'date',
            example: '1990-01-01',
          },
          gender: {
            type: 'string',
            enum: ['MALE', 'FEMALE', 'OTHER'],
            example: 'MALE',
          },
          height: {
            type: 'integer',
            description: 'Height in centimeters',
            example: 175,
          },
          religion: {
            type: 'string',
            enum: ['HINDU', 'MUSLIM', 'CHRISTIAN', 'SIKH', 'BUDDHIST', 'JAIN', 'PARSI', 'JEWISH', 'OTHER', 'NO_RELIGION'],
            example: 'HINDU',
          },
          education: {
            type: 'string',
            enum: ['HIGH_SCHOOL', 'DIPLOMA', 'BACHELORS', 'MASTERS', 'DOCTORATE', 'PROFESSIONAL'],
            example: 'BACHELORS',
          },
          occupation: {
            type: 'string',
            example: 'Software Engineer',
          },
          bio: {
            type: 'string',
            example: 'I am a passionate software engineer...',
          },
          profileStatus: {
            type: 'string',
            enum: ['INCOMPLETE', 'COMPLETE', 'UNDER_REVIEW', 'APPROVED', 'REJECTED', 'SUSPENDED'],
            example: 'APPROVED',
          },
          profileViews: {
            type: 'integer',
            example: 42,
          },
          createdAt: {
            type: 'string',
            format: 'date-time',
            example: '2025-01-01T00:00:00.000Z',
          },
          updatedAt: {
            type: 'string',
            format: 'date-time',
            example: '2025-01-08T10:30:00.000Z',
          },
        },
        required: ['id', 'userId', 'firstName', 'lastName', 'dateOfBirth', 'gender', 'profileStatus', 'createdAt', 'updatedAt'],
      },

      // Auth schemas
      LoginRequest: {
        type: 'object',
        properties: {
          email: {
            type: 'string',
            format: 'email',
            example: 'user@example.com',
          },
          password: {
            type: 'string',
            minLength: 8,
            example: 'SecurePassword123!',
          },
        },
        required: ['email', 'password'],
      },

      LoginResponse: {
        type: 'object',
        properties: {
          success: {
            type: 'boolean',
            example: true,
          },
          message: {
            type: 'string',
            example: 'Login successful',
          },
          data: {
            type: 'object',
            properties: {
              user: {
                $ref: '#/components/schemas/User',
              },
              tokens: {
                type: 'object',
                properties: {
                  accessToken: {
                    type: 'string',
                    example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
                  },
                  refreshToken: {
                    type: 'string',
                    example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
                  },
                  expiresIn: {
                    type: 'integer',
                    example: 86400,
                  },
                },
                required: ['accessToken', 'refreshToken', 'expiresIn'],
              },
            },
            required: ['user', 'tokens'],
          },
        },
        required: ['success', 'message', 'data'],
      },

      RegisterRequest: {
        type: 'object',
        properties: {
          email: {
            type: 'string',
            format: 'email',
            example: 'newuser@example.com',
          },
          password: {
            type: 'string',
            minLength: 8,
            example: 'SecurePassword123!',
          },
          confirmPassword: {
            type: 'string',
            minLength: 8,
            example: 'SecurePassword123!',
          },
          firstName: {
            type: 'string',
            example: 'John',
          },
          lastName: {
            type: 'string',
            example: 'Doe',
          },
          dateOfBirth: {
            type: 'string',
            format: 'date',
            example: '1990-01-01',
          },
          gender: {
            type: 'string',
            enum: ['MALE', 'FEMALE', 'OTHER'],
            example: 'MALE',
          },
        },
        required: ['email', 'password', 'confirmPassword', 'firstName', 'lastName', 'dateOfBirth', 'gender'],
      },
    },
  },
  security: [
    {
      ApiKeyAuth: [],
    },
  ],
  tags: [
    {
      name: 'Authentication',
      description: 'User authentication and authorization',
    },
    {
      name: 'Users',
      description: 'User management operations',
    },
    {
      name: 'Profiles',
      description: 'Profile management operations',
    },
    {
      name: 'Photos',
      description: 'Photo upload and management',
    },
    {
      name: 'Interests',
      description: 'Interest management (like/unlike profiles)',
    },
    {
      name: 'Matches',
      description: 'Match discovery and management',
    },
    {
      name: 'Subscriptions',
      description: 'Subscription and payment management',
    },
    {
      name: 'Admin',
      description: 'Administrative operations',
    },
  ],
};

// Options for swagger-jsdoc
const options = {
  definition: swaggerDefinition,
  apis: [
    './src/routes/*.ts',
    './src/controllers/*.ts',
    './src/models/*.ts',
  ],
};

// Generate swagger specification
export const specs = swaggerJsdoc(options); 