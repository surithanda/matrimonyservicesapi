import swaggerJsdoc from 'swagger-jsdoc';

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Account Management API',
      version: '1.0.0',
      description: 'API documentation for Account Management System\n\nAuthentication:\n- API Key (Required for all endpoints): Send as "x-api-key" header\n- JWT Token (Required for protected endpoints): Send as "Bearer" token in Authorization header',
    },
    servers: [
      {
        url: process.env.NODE_ENV === 'production'
          ? 'https://matrimoney-backend.vercel.app/api'
          : 'http://localhost:3000/api',
        description: process.env.NODE_ENV === 'production' ? 'Production server' : 'Development server',
      }
    ],
    tags: [
      {
        name: 'Auth',
        description: 'Authentication endpoints including login, registration, password management'
      },
      {
        name: 'Account',
        description: 'Account management endpoints'
      }
    ],
    components: {
      securitySchemes: {
        ApiKeyAuth: {
          type: 'apiKey',
          in: 'header',
          name: 'x-api-key',
          description: 'API key required for all endpoints'
        },
        BearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
          description: 'JWT token required for protected endpoints'
        }
      },
    },
    security: [
      {
        ApiKeyAuth: []
      }
    ],
  },
  apis: ['./src/routes/*.ts', './dist/routes/*.js'], // Include both TS and JS paths
};

export const specs = swaggerJsdoc(options); 