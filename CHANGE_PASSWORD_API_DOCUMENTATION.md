# Change Password API Documentation

## Overview
The Change Password API allows authenticated users to securely change their account password by providing their current password along with their new password and confirmation.

## Endpoint
```
POST /api/change-password
```

## Authentication Required
✅ **Required** - JWT Bearer Token
- Include the `Authorization` header with format: `Bearer <token>`
- Token is obtained from login APIs (`/api/login` or `/api/login-password`)

## Request Headers
| Header | Type | Required | Description |
|--------|------|----------|-------------|
| `Authorization` | String | ✅ Yes | JWT Bearer token for authentication |
| `Content-Type` | String | ✅ Yes | Must be `application/json` |

## Request Body
| Field | Type | Required | Validation | Description |
|-------|------|----------|------------|-------------|
| `currentPassword` | String | ✅ Yes | Non-empty | User's current password |
| `newPassword` | String | ✅ Yes | Min 6 characters | New password to set |
| `confirmNewPassword` | String | ✅ Yes | Must match newPassword | Confirmation of new password |

### Example Request
```json
{
    "currentPassword": "oldPassword123",
    "newPassword": "newSecurePassword456",
    "confirmNewPassword": "newSecurePassword456"
}
```

## Response Formats

### Success Response (200 OK)
```json
{
    "message": "Password changed successfully",
    "user": {
        "id": 1,
        "email": "user@example.com",
        "first_name": "John"
    }
}
```

### Error Responses

#### 400 Bad Request - Missing Fields
```json
{
    "error": "Current password, new password, and confirm new password are required"
}
```

#### 400 Bad Request - Password Mismatch
```json
{
    "error": "New passwords do not match"
}
```

#### 400 Bad Request - Weak Password
```json
{
    "error": "New password must be at least 6 characters long"
}
```

#### 400 Bad Request - Same Password
```json
{
    "error": "New password must be different from current password"
}
```

#### 400 Bad Request - Incorrect Current Password
```json
{
    "error": "Current password is incorrect"
}
```

#### 401 Unauthorized - Missing Token
```json
{
    "error": "Access token required"
}
```

#### 403 Forbidden - Invalid Token
```json
{
    "error": "Invalid or expired token"
}
```

#### 404 Not Found - User Not Found
```json
{
    "error": "User not found"
}
```

#### 500 Internal Server Error
```json
{
    "error": "Internal server error"
}
```

## Security Features

### Password Security
- **Current Password Verification**: Validates user knows their current password
- **Password Hashing**: New password is hashed using bcrypt with salt rounds = 10
- **Password Strength**: Minimum 6 characters required
- **Password Uniqueness**: New password must be different from current password

### Authentication Security
- **JWT Verification**: Validates user identity through JWT token
- **User Verification**: Confirms user exists in database before password change
- **Secure Updates**: Updates password with timestamp for audit trail

## Database Operations

### Tables Affected
- **users**: Updates the `password` and `updated_at` fields

### Query Operations
1. **SELECT**: Retrieves user information and current password hash
2. **UPDATE**: Updates password with new hash and timestamp

## Usage Examples

### cURL Example
```bash
curl -X POST http://localhost:3000/api/change-password \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{
    "currentPassword": "oldPassword123",
    "newPassword": "newSecurePassword456",
    "confirmNewPassword": "newSecurePassword456"
  }'
```

### JavaScript/Fetch Example
```javascript
const changePassword = async (currentPassword, newPassword, confirmNewPassword) => {
  try {
    const response = await fetch('/api/change-password', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      },
      body: JSON.stringify({
        currentPassword,
        newPassword,
        confirmNewPassword
      })
    });

    const data = await response.json();
    
    if (response.ok) {
      console.log('Password changed successfully:', data.message);
      return data;
    } else {
      console.error('Password change failed:', data.error);
      throw new Error(data.error);
    }
  } catch (error) {
    console.error('Network error:', error);
    throw error;
  }
};
```

## Frontend Integration

### Form Requirements
Based on the provided UI image, the form should include:

1. **Current Password Field**
   - Input type: `password`
   - Required validation
   - Label: "Current Password"

2. **New Password Field**
   - Input type: `password`
   - Required validation
   - Minimum length: 6 characters
   - Label: "New Password"

3. **Confirm New Password Field**
   - Input type: `password`
   - Required validation
   - Must match new password
   - Label: "Confirm New Password"

4. **Submit Button**
   - Text: "Change Password"
   - Disabled until all validations pass

### Example HTML Form
```html
<form id="changePasswordForm">
  <div class="form-group">
    <label for="currentPassword">Current Password</label>
    <input 
      type="password" 
      id="currentPassword" 
      name="currentPassword" 
      required 
    />
  </div>
  
  <div class="form-group">
    <label for="newPassword">New Password</label>
    <input 
      type="password" 
      id="newPassword" 
      name="newPassword" 
      minlength="6" 
      required 
    />
  </div>
  
  <div class="form-group">
    <label for="confirmNewPassword">Confirm New Password</label>
    <input 
      type="password" 
      id="confirmNewPassword" 
      name="confirmNewPassword" 
      required 
    />
  </div>
  
  <button type="submit" class="btn btn-primary">
    Change Password
  </button>
</form>
```

## Best Practices

### For Frontend Development
1. **Client-side Validation**: Implement password matching validation before API call
2. **Password Strength Indicator**: Show password strength meter for new password
3. **Error Handling**: Display specific error messages from API responses
4. **Loading States**: Show loading spinner during API request
5. **Success Feedback**: Clear form and show success message after successful change

### For Security
1. **HTTPS Only**: Always use HTTPS in production
2. **Token Storage**: Store JWT tokens securely (httpOnly cookies recommended)
3. **Password Policies**: Implement strong password policies on frontend
4. **Rate Limiting**: Consider implementing rate limiting for password change attempts
5. **Audit Logging**: Log password change events for security monitoring

## Testing with Postman

The Change Password API has been added to the Matrimony API Tests Postman collection under the "Authentication" folder. The request includes:

- **Pre-request Script**: None required (token should be set from login)
- **Test Script**: Validates successful password change and response structure
- **Environment Variables**: Uses `{{auth_token}}` and `{{base_url}}`

### Test Scenarios
1. **Valid Password Change**: All fields correct, should return 200
2. **Missing Current Password**: Should return 400 error
3. **Password Mismatch**: confirmNewPassword different from newPassword
4. **Weak Password**: newPassword less than 6 characters
5. **Incorrect Current Password**: Wrong current password provided
6. **Invalid Token**: Expired or malformed JWT token
7. **No Token**: Missing Authorization header

## API Workflow

1. **User Authentication**: User must be logged in and have valid JWT token
2. **Form Submission**: Frontend sends change password request
3. **Token Validation**: Server verifies JWT token and extracts user email
4. **User Lookup**: Server finds user in database by email from token
5. **Current Password Verification**: Server verifies current password using bcrypt
6. **New Password Validation**: Server validates new password requirements
7. **Password Update**: Server hashes new password and updates database
8. **Success Response**: Server returns success message with user info

## Related APIs

- **POST /api/login**: Get JWT token for authentication
- **POST /api/forgot-password**: Alternative password reset via OTP
- **POST /api/reset-password**: Reset password using OTP (no authentication required)

## Changelog

### Version 1.0.0 (Initial Release)
- ✅ Secure password change functionality
- ✅ JWT authentication required
- ✅ Current password verification
- ✅ Password strength validation
- ✅ Comprehensive error handling
- ✅ Database audit trail with timestamps
- ✅ Postman collection integration 