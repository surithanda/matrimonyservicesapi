# Matrimony Backend API

Simple Express.js server with MySQL database for user authentication.

## Setup

1. Install dependencies:
```bash
npm install
```

2. Start the server:
```bash
npm start
```

Or for development with auto-restart:
```bash
npm run dev
```

## API Endpoints

### Registration
- **POST** `/api/register`
- Body: `{ "name": "John Doe", "email": "john@example.com", "password": "password123", "phone": "1234567890" }`

### Login
- **POST** `/api/login`
- Body: `{ "email": "john@example.com", "password": "password123" }`

### Get Profile (Protected)
- **GET** `/api/profile`
- Headers: `Authorization: Bearer <token>`

### Get All Users (Protected)
- **GET** `/api/users`
- Headers: `Authorization: Bearer <token>`

## Database

The server automatically creates a `users` table with the following structure:
- id (INT, AUTO_INCREMENT, PRIMARY KEY)
- email (VARCHAR(255), UNIQUE, NOT NULL)
- password (VARCHAR(255), NOT NULL) - bcrypt hashed
- name (VARCHAR(255), NOT NULL)
- phone (VARCHAR(20))
- created_at (TIMESTAMP)
- updated_at (TIMESTAMP)

Server runs on port 8080 by default. 