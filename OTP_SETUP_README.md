# OTP Authentication Setup Guide

## Overview
This matrimony backend now supports OTP (One-Time Password) based authentication for enhanced security. Users can login using OTP sent to their email instead of passwords.

## Features Added
- **Send OTP API**: Generates and sends OTP to user's email
- **Login with OTP API**: Authenticates users using OTP
- **Legacy Password Login**: Backward compatibility with password-based login
- **Email Service**: Integrated nodemailer for email delivery

## Email Configuration

### 1. Environment Variables
Add the following variables to your `.env` file:

```env
# Email Configuration for OTP
EMAIL_USER=your-email@gmail.com
EMAIL_PASSWORD=your-app-password

# Existing variables
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your-db-password
DB_NAME=matrimony_db
JWT_SECRET=your-jwt-secret
```

### 2. Gmail Setup (Recommended)
1. Enable 2-Factor Authentication on your Gmail account
2. Generate an App Password:
   - Go to Google Account Settings
   - Security → 2-Step Verification
   - App passwords → Generate password for "Mail"
   - Use this password in `EMAIL_PASSWORD`

### 3. Alternative Email Providers
You can modify `utils/emailService.js` to use other providers:

```javascript
// For Outlook/Hotmail
const transporter = nodemailer.createTransport({
  service: 'hotmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASSWORD
  }
});

// For custom SMTP
const transporter = nodemailer.createTransport({
  host: 'smtp.your-provider.com',
  port: 587,
  secure: false,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASSWORD
  }
});
```

## API Endpoints

### 1. Send OTP
**POST** `/api/send-otp`

**Request Body:**
```json
{
  "email": "user@example.com"
}
```

**Response (Success):**
```json
{
  "message": "OTP sent successfully to your email",
  "email": "user@example.com"
}
```

**Response (Error):**
```json
{
  "error": "User not found with this email"
}
```

### 2. Login with OTP
**POST** `/api/login`

**Request Body:**
```json
{
  "email": "user@example.com",
  "otp": "123456"
}
```

**Response (Success):**
```json
{
  "message": "Login successful",
  "user": {
    "id": 1,
    "name": "John Doe",
    "email": "user@example.com",
    "phone": "9876543210"
  },
  "token": "jwt-token-here"
}
```

### 3. Legacy Password Login
**POST** `/api/login-password`

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "password123"
}
```

## Database Changes

A new table `otp_verification` has been created:

```sql
CREATE TABLE IF NOT EXISTS otp_verification (
  id INT AUTO_INCREMENT PRIMARY KEY,
  email VARCHAR(255) NOT NULL,
  otp VARCHAR(6) NOT NULL,
  expires_at TIMESTAMP NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  used BOOLEAN DEFAULT FALSE,
  INDEX idx_email (email),
  INDEX idx_expires_at (expires_at)
);
```

## OTP Security Features

1. **Expiration**: OTPs expire after 10 minutes
2. **Single Use**: Each OTP can only be used once
3. **Email Validation**: OTP is only sent to registered email addresses
4. **Cleanup**: Old unused OTPs are automatically deleted when new ones are generated

## Testing with Postman

1. Import the updated Postman collection: `Matrimony_API_Tests.postman_collection.json`
2. Set up environment variables:
   - `base_url`: http://localhost:8080
3. Test flow:
   - Register a user
   - Send OTP to email
   - Check email for OTP
   - Login with OTP

## Troubleshooting

### Common Issues:

1. **Email not sending:**
   - Check EMAIL_USER and EMAIL_PASSWORD in .env
   - Ensure Gmail App Password is correct
   - Check internet connection

2. **OTP expired:**
   - OTPs are valid for 10 minutes only
   - Request a new OTP if expired

3. **Database errors:**
   - Ensure OTP table is created
   - Check database connection

### Testing Email in Development:

For development, you can use services like:
- **Mailtrap** (fake SMTP for testing)
- **Ethereal Email** (nodemailer test accounts)

Example with Ethereal Email:
```javascript
// Add to emailService.js for testing
const testAccount = await nodemailer.createTestAccount();
const transporter = nodemailer.createTransport({
  host: 'smtp.ethereal.email',
  port: 587,
  secure: false,
  auth: {
    user: testAccount.user,
    pass: testAccount.pass,
  },
});
```

## Installation

1. Install nodemailer dependency:
```bash
npm install nodemailer
```

2. Update your `.env` file with email credentials

3. Start the server:
```bash
npm start
```

The server will automatically create the OTP table on startup.

## API Flow

1. **User Registration**: User creates account with email/password
2. **OTP Request**: User requests OTP by providing email
3. **Email Delivery**: System sends 6-digit OTP to user's email
4. **OTP Login**: User provides email + OTP to login
5. **JWT Token**: System returns JWT token for authenticated requests

This system provides enhanced security while maintaining a smooth user experience. 