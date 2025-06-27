# Account Details API Documentation

## Overview
This document describes the Account Details Management API endpoints for the Matrimony Services platform. These APIs allow creating, updating, and retrieving comprehensive account details with profile photo upload functionality, all based on email identification.

## Database Structure

### Tables Used
1. **users** - Primary user information
2. **user_profiles** - Extended profile information  
3. **user_images** - Profile photos and other images
4. **primary_contact** - Contact information

### Key Features
- Email-based user identification
- Profile photo upload with automatic file management
- Create or update account details in a single operation
- Comprehensive validation and error handling
- Automatic profile picture management (deactivate old, activate new)

## API Endpoints

### 1. Create/Update Account Details (JSON Only)

**Endpoint:** `POST /api/users/account-details`

**Description:** Create or update account details using JSON payload (no file upload)

**Headers:**
```
Authorization: Bearer <JWT_TOKEN>
Content-Type: application/json
```

**Request Body:**
```json
{
  "email": "john.doe@example.com",
  "first_name": "John",
  "middle_name": "Michael",
  "last_name": "Doe",
  "birth_date": "1995-08-15",
  "gender": "Male",
  "primary_phone": "9876543210",
  "secondary_phone": "9876543211",
  "complete_address": "123 Main Street, Apartment 4B, Downtown Area",
  "city": "New York",
  "state": "NY",
  "zip_code": "10001",
  "country": "United States"
}
```

**Required Fields:**
- `email` (valid email format)
- `first_name` (non-empty string)
- `last_name` (non-empty string)
- `gender` (Must be: "Male", "Female", or "Other")

**Optional Fields:**
- `middle_name`
- `birth_date` (YYYY-MM-DD format, age must be 18-100)
- `primary_phone`
- `secondary_phone`
- `complete_address`
- `city`
- `state`
- `zip_code`
- `country`

**Success Response (200/201):**
```json
{
  "message": "Account details created/updated successfully",
  "account_details": {
    "user_id": 123,
    "email": "john.doe@example.com",
    "first_name": "John",
    "middle_name": "Michael",
    "last_name": "Doe",
    "full_name": "John Michael Doe",
    "birth_date": "1995-08-15T00:00:00.000Z",
    "gender": "Male",
    "complete_address": "123 Main Street, Apartment 4B, Downtown Area",
    "city": "New York",
    "state": "NY",
    "country": "United States",
    "zip_code": "10001",
    "primary_phone": "9876543210",
    "secondary_phone": "9876543211",
    "profile_picture": null,
    "created_at": "2024-01-01T10:00:00.000Z",
    "updated_at": "2024-01-01T10:00:00.000Z"
  }
}
```

### 2. Create/Update Account Details with Profile Photo

**Endpoint:** `POST /api/users/account-details-with-photo`

**Description:** Create or update account details with optional profile photo upload using multipart/form-data

**Headers:**
```
Authorization: Bearer <JWT_TOKEN>
Content-Type: multipart/form-data
```

**Form Data Fields:**
- `email` (text, required)
- `first_name` (text, required)
- `middle_name` (text, optional)
- `last_name` (text, required)
- `birth_date` (text, optional, format: YYYY-MM-DD)
- `gender` (text, required, values: Male/Female/Other)
- `primary_phone` (text, optional)
- `secondary_phone` (text, optional)
- `complete_address` (text, optional)
- `city` (text, optional)
- `state` (text, optional)
- `zip_code` (text, optional)
- `country` (text, optional)
- `profile_photo` (file, optional, max 5MB, images only)

**Profile Photo Requirements:**
- File type: Images only (jpg, jpeg, png, gif, webp)
- Maximum size: 5MB
- Automatically resizes and optimizes
- Replaces any existing profile picture

**Success Response (200/201):**
```json
{
  "message": "Account details created/updated successfully",
  "account_details": {
    "user_id": 123,
    "email": "jane.smith@example.com",
    "first_name": "Jane",
    "middle_name": "Elizabeth",
    "last_name": "Smith",
    "full_name": "Jane Elizabeth Smith",
    "birth_date": "1992-12-03T00:00:00.000Z",
    "gender": "Female",
    "complete_address": "456 Oak Avenue, Suite 2A, Business District",
    "city": "Los Angeles",
    "state": "CA",
    "country": "United States",
    "zip_code": "90210",
    "primary_phone": "9876543212",
    "secondary_phone": "9876543213",
    "profile_picture": {
      "id": 45,
      "filename": "profile-1640995200000-abc123.jpg",
      "original_name": "my-photo.jpg",
      "file_path": "./uploads/profile-pictures/profile-1640995200000-abc123.jpg",
      "file_size": 245760
    },
    "created_at": "2024-01-01T10:00:00.000Z",
    "updated_at": "2024-01-01T10:00:00.000Z"
  }
}
```

### 3. Get Account Details by Email

**Endpoint:** `GET /api/users/account-details/:email`

**Description:** Retrieve complete account details by email address

**Headers:**
```
Authorization: Bearer <JWT_TOKEN>
```

**URL Parameters:**
- `email` - The email address of the user

**Example:**
```
GET /api/users/account-details/john.doe@example.com
```

**Success Response (200):**
```json
{
  "message": "Account details retrieved successfully",
  "account_details": {
    "user_id": 123,
    "email": "john.doe@example.com",
    "first_name": "John",
    "middle_name": "Michael",
    "last_name": "Doe",
    "full_name": "John Michael Doe",
    "birth_date": "1995-08-15T00:00:00.000Z",
    "gender": "Male",
    "complete_address": "123 Main Street, Apartment 4B, Downtown Area",
    "city": "New York",
    "state": "NY",
    "country": "United States",
    "zip_code": "10001",
    "primary_phone": "9876543210",
    "secondary_phone": "9876543211",
    "profile_picture": {
      "filename": "profile-1640995200000-xyz789.jpg",
      "file_path": "./uploads/profile-pictures/profile-1640995200000-xyz789.jpg",
      "original_name": "profile-pic.jpg",
      "uploaded_at": "2024-01-01T10:00:00.000Z"
    },
    "created_at": "2024-01-01T10:00:00.000Z",
    "updated_at": "2024-01-01T10:00:00.000Z"
  }
}
```

### 4. Deactivate Account

**Endpoint:** `POST /api/users/deactivate-account`

**Description:** Deactivate user account (currently deactivates images, keeps user data)

**Headers:**
```
Authorization: Bearer <JWT_TOKEN>
Content-Type: application/json
```

**Request Body:**
```json
{
  "email": "user@example.com"
}
```

**Success Response (200):**
```json
{
  "message": "Account images deactivated successfully. Contact support for complete account deletion.",
  "email": "user@example.com",
  "deactivated_at": "2024-01-01T10:00:00.000Z"
}
```

## Error Responses

### Validation Errors (400)
```json
{
  "error": "Email is required"
}
```

```json
{
  "error": "First name and last name are required"
}
```

```json
{
  "error": "Valid gender is required (Male, Female, or Other)"
}
```

```json
{
  "error": "Please provide a valid email address"
}
```

```json
{
  "error": "Please provide a valid birth date (age must be between 18-100)"
}
```

### Authentication Errors (401)
```json
{
  "error": "Access denied. Token required."
}
```

```json
{
  "error": "Invalid token."
}
```

### Not Found Errors (404)
```json
{
  "error": "Account not found"
}
```

```json
{
  "error": "User not found"
}
```

### File Upload Errors (400)
```json
{
  "error": "Only image files are allowed!"
}
```

```json
{
  "error": "File too large. Maximum size is 5MB."
}
```

### Server Errors (500)
```json
{
  "error": "Database error"
}
```

```json
{
  "error": "Internal server error"
}
```

## File Storage

### Profile Picture Storage
- **Location:** `./uploads/profile-pictures/`
- **Naming Convention:** `profile-{timestamp}-{uuid}.{extension}`
- **File Management:** 
  - Old profile pictures are automatically deactivated (not deleted)
  - Only one active profile picture per user
  - Files are preserved for data integrity

### Database Storage
- Image metadata stored in `user_images` table
- `is_active` field manages active/inactive images
- Full file paths stored for retrieval

## Usage Examples

### Example 1: Create New Account with Basic Details
```javascript
const response = await fetch('/api/users/account-details', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': 'Bearer ' + token
  },
  body: JSON.stringify({
    email: 'newuser@example.com',
    first_name: 'New',
    last_name: 'User',
    gender: 'Male',
    city: 'Chicago',
    state: 'IL',
    country: 'United States'
  })
});
```

### Example 2: Update Account with Profile Photo
```javascript
const formData = new FormData();
formData.append('email', 'user@example.com');
formData.append('first_name', 'Updated');
formData.append('last_name', 'Name');
formData.append('gender', 'Female');
formData.append('profile_photo', fileInput.files[0]);

const response = await fetch('/api/users/account-details-with-photo', {
  method: 'POST',
  headers: {
    'Authorization': 'Bearer ' + token
  },
  body: formData
});
```

### Example 3: Retrieve Account Details
```javascript
const response = await fetch('/api/users/account-details/user@example.com', {
  method: 'GET',
  headers: {
    'Authorization': 'Bearer ' + token
  }
});
```

## Form Integration

### HTML Form Example
```html
<form id="accountForm" enctype="multipart/form-data">
  <!-- Profile Photo -->
  <input type="file" name="profile_photo" accept="image/*">
  
  <!-- Basic Information -->
  <input type="email" name="email" required>
  <input type="text" name="first_name" required>
  <input type="text" name="middle_name">
  <input type="text" name="last_name" required>
  <input type="date" name="birth_date">
  
  <!-- Gender -->
  <select name="gender" required>
    <option value="">Select Gender</option>
    <option value="Male">Male</option>
    <option value="Female">Female</option>
    <option value="Other">Other</option>
  </select>
  
  <!-- Contact -->
  <input type="tel" name="primary_phone">
  <input type="tel" name="secondary_phone">
  
  <!-- Address -->
  <textarea name="complete_address"></textarea>
  <input type="text" name="city">
  <input type="text" name="state">
  <input type="text" name="zip_code">
  <input type="text" name="country">
  
  <button type="submit">Save Changes</button>
</form>
```

## Security Considerations

1. **Authentication Required:** All endpoints require valid JWT token
2. **File Upload Security:** 
   - File type validation (images only)
   - File size limits (5MB)
   - Unique filename generation to prevent conflicts
3. **Input Validation:** 
   - Email format validation
   - Age validation for birth dates
   - Required field validation
4. **Data Privacy:** Email-based identification maintains user privacy

## Best Practices

1. **Error Handling:** Always handle API errors gracefully
2. **File Upload:** Check file size and type before uploading
3. **Data Validation:** Validate data on frontend before API calls
4. **User Experience:** Provide loading states during API calls
5. **Image Optimization:** Consider compressing images before upload

## Testing with Postman

The Postman collection includes comprehensive tests for all endpoints:
- `Account Details Management` folder contains all test requests
- Pre-configured test scripts validate responses
- Environment variables for token management
- Sample data for testing various scenarios 