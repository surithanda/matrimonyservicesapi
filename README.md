# 🚀 Matrimony Services API

A modern, scalable matrimony services API built with **TypeScript**, **Prisma**, and **Express.js** following 2025 coding standards and best practices.

[![Node.js](https://img.shields.io/badge/Node.js-18%2B-green)](https://nodejs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.6%2B-blue)](https://www.typescriptlang.org/)
[![Prisma](https://img.shields.io/badge/Prisma-5.22%2B-darkblue)](https://www.prisma.io/)
[![Express](https://img.shields.io/badge/Express-4.19%2B-lightgrey)](https://expressjs.com/)
[![License](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

## ✨ Features

### 🔐 Authentication & Security
- **JWT-based authentication** with refresh tokens
- **API key validation** for secure access
- **Role-based access control** (User, Admin, Moderator, Support)
- **Rate limiting** with configurable tiers
- **Password hashing** with bcrypt
- **Account lockout** protection
- **Security logging** and monitoring

### 👤 Profile Management
- **Comprehensive profile system** with detailed information
- **Photo upload and management** with validation
- **Partner preferences** with advanced filtering
- **Profile verification** system
- **Privacy settings** and visibility controls

### 💕 Matching & Interactions
- **Interest system** (send/receive interests)
- **Smart matching algorithm** with scoring
- **Profile discovery** with filters
- **Match management** and tracking

### 💳 Subscription System
- **Flexible subscription plans**
- **Payment processing** integration
- **Feature-based access control**
- **Usage tracking** and limits

### 📊 Admin & Monitoring
- **Comprehensive admin panel**
- **User management** and moderation
- **Analytics and reporting**
- **System health monitoring**
- **Audit logging**

### 🔧 Developer Experience
- **Modern TypeScript** with strict mode
- **Prisma ORM** for type-safe database operations
- **Comprehensive API documentation** with Swagger/OpenAPI
- **Docker support** with multi-stage builds
- **ESLint & Prettier** for code quality
- **Jest testing** framework
- **GitHub Actions** CI/CD pipeline

## 🏗️ Architecture

### 🗂️ Project Structure
```
src/
├── config/           # Configuration files
│   ├── app.config.ts        # Application configuration
│   ├── cors.config.ts       # CORS settings
│   ├── database.config.ts   # Database connection
│   ├── logger.config.ts     # Logging configuration
│   ├── rate-limit.config.ts # Rate limiting rules
│   └── swagger.config.ts    # API documentation
├── controllers/      # Request handlers
├── middleware/       # Express middleware
│   ├── auth.middleware.ts        # Authentication
│   ├── error-handler.middleware.ts # Error handling
│   ├── request-logger.middleware.ts # Request logging
│   └── not-found.middleware.ts   # 404 handler
├── routes/          # API route definitions
├── services/        # Business logic layer
├── models/          # Database models (Prisma)
├── utils/           # Utility functions
├── validators/      # Input validation schemas
├── types/           # TypeScript type definitions
├── database/        # Database related files
│   ├── schema.prisma        # Prisma schema
│   ├── migrations/          # Database migrations
│   └── seeds/              # Seed data
└── server.ts        # Application entry point
```

### 🛠️ Technology Stack
- **Runtime**: Node.js 18+
- **Language**: TypeScript 5.6+
- **Framework**: Express.js 4.19+
- **Database**: MySQL 8.0+ (with Prisma ORM)
- **Cache**: Redis 7+
- **Authentication**: JWT
- **Validation**: Zod
- **Documentation**: Swagger/OpenAPI 3.0
- **Testing**: Jest + Supertest
- **Linting**: ESLint + Prettier
- **Containerization**: Docker + Docker Compose

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ and npm 8+
- MySQL 8.0+ or Docker
- Redis (optional, for caching)

### 1. Clone and Install
```bash
# Clone the repository
git clone https://github.com/your-username/matrimony-services-api.git
cd matrimony-services-api

# Install dependencies
npm install
```

### 2. Environment Setup
```bash
# Copy environment variables
cp .env.example .env

# Edit .env with your configuration
nano .env
```

### 3. Database Setup
```bash
# Generate Prisma client
npm run db:generate

# Run database migrations
npm run db:migrate

# Seed the database (optional)
npm run db:seed
```

### 4. Start Development Server
```bash
# Start in development mode
npm run dev

# Or start with Docker Compose
docker-compose up -d
```

The API will be available at `http://localhost:3000`

### 5. Access Documentation
- **API Documentation**: http://localhost:3000/api/v1/docs
- **Health Check**: http://localhost:3000/health

## 🐳 Docker Development

### Development Environment
```bash
# Start all services
docker-compose --profile dev up -d

# View logs
docker-compose logs -f app

# Access services
# App: http://localhost:3000
# Adminer (DB UI): http://localhost:8080
# Redis Commander: http://localhost:8081
```

### Production Deployment
```bash
# Build and start production containers
docker-compose -f docker-compose.yml up -d

# With monitoring
docker-compose --profile monitoring up -d
```

## 📝 API Usage

### Authentication
```bash
# Register a new user
curl -X POST http://localhost:3000/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -H "X-API-Key: your_api_key" \
  -d '{
    "email": "user@example.com",
    "password": "SecurePassword123!",
    "confirmPassword": "SecurePassword123!",
    "firstName": "John",
    "lastName": "Doe",
    "dateOfBirth": "1990-01-01",
    "gender": "MALE"
  }'

# Login
curl -X POST http://localhost:3000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -H "X-API-Key: your_api_key" \
  -d '{
    "email": "user@example.com",
    "password": "SecurePassword123!"
  }'
```

### Profile Management
```bash
# Get current user profile
curl -X GET http://localhost:3000/api/v1/profiles/me \
  -H "Authorization: Bearer your_jwt_token" \
  -H "X-API-Key: your_api_key"

# Update profile
curl -X PUT http://localhost:3000/api/v1/profiles/me \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer your_jwt_token" \
  -H "X-API-Key: your_api_key" \
  -d '{
    "bio": "Updated bio",
    "occupation": "Software Engineer"
  }'
```

## 🧪 Testing

### Run Tests
```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage
npm run test:coverage

# Run E2E tests
npm run test:e2e
```

### Test Structure
```
tests/
├── unit/           # Unit tests
├── integration/    # Integration tests
├── e2e/           # End-to-end tests
└── fixtures/      # Test data
```

## 🔧 Development Commands

```bash
# Development
npm run dev              # Start development server
npm run build           # Build for production
npm run start           # Start production server

# Database
npm run db:generate     # Generate Prisma client
npm run db:push        # Push schema changes
npm run db:migrate     # Run migrations
npm run db:reset       # Reset database
npm run db:seed        # Seed database
npm run db:studio      # Open Prisma Studio

# Code Quality
npm run lint           # Run ESLint
npm run lint:fix       # Fix ESLint issues
npm run format         # Format code with Prettier

# Docker
npm run docker:build   # Build Docker image
npm run docker:run     # Run with Docker Compose
```

## 📊 Monitoring & Logging

### Application Logs
- **Location**: `logs/` directory
- **Levels**: error, warn, info, debug
- **Format**: JSON (structured logging)
- **Rotation**: Automatic with size limits

### Health Monitoring
```bash
# Health check endpoint
curl http://localhost:3000/health

# Database health
curl http://localhost:3000/api/v1/admin/health/database
```

### Performance Monitoring
- **Slow queries**: Automatically logged (>1000ms)
- **Request timing**: All requests logged with duration
- **Memory usage**: Monitored and logged
- **Error tracking**: Comprehensive error logging

## 🔒 Security Features

### Authentication Security
- **JWT tokens** with expiration
- **Refresh token** rotation
- **Account lockout** after failed attempts
- **Password complexity** requirements
- **Rate limiting** on auth endpoints

### API Security
- **API key validation**
- **CORS protection**
- **Helmet security headers**
- **Input validation** with Zod
- **SQL injection protection** via Prisma
- **XSS protection**

### Data Protection
- **Password hashing** with bcrypt
- **Sensitive data masking** in logs
- **Data encryption** at rest
- **Secure file uploads**

## 🚀 Deployment

### Environment Variables
Key environment variables for production:

```bash
NODE_ENV=production
DATABASE_URL=mysql://user:pass@host:3306/db
JWT_SECRET=your-super-secure-secret
API_KEY=your-production-api-key
```

### Production Checklist
- [ ] Set strong JWT secrets
- [ ] Configure database connection
- [ ] Set up Redis for caching
- [ ] Configure email service
- [ ] Set up file storage (AWS S3)
- [ ] Configure monitoring
- [ ] Set up SSL/TLS
- [ ] Configure reverse proxy
- [ ] Set up CI/CD pipeline

## 🤝 Contributing

1. **Fork** the repository
2. **Create** a feature branch (`git checkout -b feature/amazing-feature`)
3. **Commit** your changes (`git commit -m 'Add amazing feature'`)
4. **Push** to the branch (`git push origin feature/amazing-feature`)
5. **Open** a Pull Request

### Development Guidelines
- Follow **TypeScript strict mode**
- Write **comprehensive tests**
- Use **conventional commits**
- Update **documentation**
- Ensure **code quality** (ESLint + Prettier)

## 📄 License

This project is licensed under the **MIT License** - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

### Documentation
- **API Docs**: `/api/v1/docs` (Swagger UI)
- **Database Schema**: Open Prisma Studio with `npm run db:studio`

### Getting Help
- 📧 **Email**: support@matrimony-app.com
- 💬 **Issues**: [GitHub Issues](https://github.com/your-username/matrimony-services-api/issues)
- 📖 **Wiki**: [Project Wiki](https://github.com/your-username/matrimony-services-api/wiki)

---

**Built with ❤️ by the Matrimony Services Team** 