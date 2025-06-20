# Matrimony API Structure

This document outlines the refactored structure of the Matrimony Backend API.

## File Structure

```
mybackend/
├── config/
│   └── database.js          # Database connection configuration
├── middleware/
│   └── auth.js              # JWT authentication middleware
├── routes/
│   ├── auth.js              # Authentication routes (register, login)
│   └── users.js             # User management routes (profile, users CRUD)
├── server.js                # Main server file with app setup
├── package.json
└── README.md
```

## API Endpoints

### Authentication Routes (`/api`)
- `POST /api/register` - Register a new user
- `POST /api/login` - Login user and get JWT token

### User Routes (`/api`)
- `GET /api/profile` - Get current user's profile (protected)
- `PUT /api/profile` - Update current user's profile (protected)
- `GET /api/users` - Get all users (protected)
- `GET /api/users/:id` - Get user by ID (protected)

### General Routes
- `GET /` - Health check endpoint

## Middleware

### Authentication Middleware
- **File**: `middleware/auth.js`
- **Function**: `authenticateToken`
- **Purpose**: Validates JWT tokens for protected routes

## Database Configuration

### Database Connection
- **File**: `config/database.js`
- **Purpose**: Manages MySQL connection and table creation
- **Features**: 
  - Automatic table creation on startup
  - Connection error handling
  - Environment variable configuration

## Environment Variables Required

```env
DB_HOST=localhost
DB_USER=your_username
DB_PASSWORD=your_password
DB_NAME=matrimony_db
JWT_SECRET=your_jwt_secret
PORT=8080
```

## Testing

Use the provided Postman collection `Matrimony_API_Tests.postman_collection.json` to test all endpoints. The collection includes:

1. **Authentication Tests**
   - User registration
   - User login
   - Invalid credential handling
   - Missing field validation

2. **User Management Tests**
   - Get user profile
   - Get all users
   - Get user by ID
   - Update user profile
   - Error scenarios (non-existent users, unauthorized access)

## Security Features

- Password hashing using bcrypt
- JWT token authentication
- Protected routes requiring valid tokens
- Input validation
- SQL injection prevention with parameterized queries 