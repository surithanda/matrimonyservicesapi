# Forgot Password & Reset Password API Documentation

## Overview
This document describes the Forgot Password and Reset Password functionality for the Matrimony Services API. The system uses email-based OTP verification to securely reset user passwords.

## Database Schema
The system uses the existing `otp_verification` table to store password reset OTPs:

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
)
```

## API Endpoints

### 1. Forgot Password API

**Endpoint:** `POST /auth/forgot-password`

**Description:** Sends a password reset OTP to the user's registered email address.

**Request Body:**
```json
{
  "email": "user@example.com"
}
```

**Request Validation:**
- `email` is required
- Email must be in valid format
- User must exist in the database

**Success Response (200):**
```json
{
  "message": "Password reset OTP has been sent to your email address",
  "email": "user@example.com"
}
```

**Error Responses:**

**400 Bad Request - Missing Email:**
```json
{
  "error": "Email is required"
}
```

**400 Bad Request - Invalid Email Format:**
```json
{
  "error": "Please provide a valid email address"
}
```

**404 Not Found - User Not Found:**
```json
{
  "error": "No account found with this email address"
}
```

**500 Internal Server Error:**
```json
{
  "error": "Failed to send password reset email"
}
```

**Features:**
- Generates a 4-digit OTP
- OTP expires after 15 minutes
- Deletes any existing unused OTPs for the email
- Sends professional HTML email with OTP
- Uses user's first name in email personalization

---

### 2. Reset Password API

**Endpoint:** `POST /auth/reset-password`

**Description:** Verifies the OTP and updates the user's password.

**Request Body:**
```json
{
  "email": "user@example.com",
  "otp": "1234",
  "newPassword": "newSecurePassword123",
  "confirmNewPassword": "newSecurePassword123"
}
```

**Request Validation:**
- All fields are required
- Email must be in valid format
- `newPassword` and `confirmNewPassword` must match
- Password must be at least 6 characters long
- OTP must be valid and not expired
- User must exist in the database

**Success Response (200):**
```json
{
  "message": "Password reset successfully. You can now login with your new password.",
  "email": "user@example.com"
}
```

**Error Responses:**

**400 Bad Request - Missing Fields:**
```json
{
  "error": "Email, OTP, new password, and confirm password are required"
}
```

**400 Bad Request - Invalid Email:**
```json
{
  "error": "Please provide a valid email address"
}
```

**400 Bad Request - Password Mismatch:**
```json
{
  "error": "New passwords do not match"
}
```

**400 Bad Request - Weak Password:**
```json
{
  "error": "Password must be at least 6 characters long"
}
```

**400 Bad Request - Invalid OTP:**
```json
{
  "error": "Invalid or expired OTP"
}
```

**404 Not Found - User Not Found:**
```json
{
  "error": "No account found with this email address"
}
```

**500 Internal Server Error:**
```json
{
  "error": "Failed to update password"
}
```

**Features:**
- Verifies OTP validity and expiration
- Hashes password using bcrypt with 10 salt rounds
- Marks OTP as used after successful reset
- Updates user's password in database
- Updates user's `updated_at` timestamp

---

## Security Features

1. **OTP Expiration:** All OTPs expire after 15 minutes
2. **One-time Use:** OTPs are marked as used and cannot be reused
3. **Password Hashing:** New passwords are hashed using bcrypt
4. **Email Validation:** Robust email format validation
5. **User Verification:** Checks user existence before processing
6. **Clean Up:** Removes old unused OTPs before generating new ones

## Email Template Features

The password reset email includes:
- Professional HTML design
- User personalization with first name
- Clear OTP display with highlighting
- Security warnings and instructions
- Expiration time notification
- Branded Matrimony Services design

## Integration with Frontend

Based on the provided form design, the frontend should:

1. **Forgot Password Form:**
   - Collect user email
   - Call `/auth/forgot-password` API
   - Show success message to check email

2. **Reset Password Form:**
   - Display OTP input field
   - Display new password field
   - Display confirm password field
   - Call `/auth/reset-password` API
   - Redirect to login on success

## Usage Flow

1. User enters email on forgot password page
2. System sends OTP to email
3. User receives email with OTP
4. User enters OTP and new password
5. System validates and updates password
6. User can login with new password

## Dependencies

- `bcryptjs` - For password hashing
- `nodemailer` - For sending emails
- `mysql2` - For database operations
- Environment variables for email configuration 