# Profile Management API Documentation

## Overview
The Profile Management API provides comprehensive endpoints for creating, updating, and retrieving user profiles in the matrimony application. All profile operations are based on email address as the unique identifier and require authentication.

## Authentication
All profile endpoints require a valid JWT token in the Authorization header:
```
Authorization: Bearer <jwt_token>
```

## Endpoints

### 1. Create/Update Profile
**POST** `/api/profile`

Creates a new profile or updates an existing profile for a user identified by email address.

#### Request Body
```json
{
  "email": "user@example.com",
  "first_name": "John",
  "middle_name": "Michael",
  "last_name": "Doe",
  "prefix": "Mr.",
  "suffix": "Jr.",
  "gender": "Male",
  "birth_date": "1995-08-15",
  "primary_phone": "9876543210",
  "home_phone": "9876543211",
  "emergency_phone": "9876543212",
  "nationality": "Indian",
  "religion": "Hindu",
  "marital_status": "Single",
  "caste": "General",
  "height_inches": 70,
  "weight": 75.5,
  "weight_unit": "Kilograms",
  "complexion": "Fair",
  "disability": "None",
  "profession": "Software Engineer",
  "whatsapp_number": "9876543210",
  "linkedin_url": "https://linkedin.com/in/johndoe",
  "facebook_url": "https://facebook.com/johndoe",
  "instagram_url": "https://instagram.com/johndoe",
  "summary": "Looking for a life partner who shares similar values and interests."
}
```

#### Response (Create - 201)
```json
{
  "message": "Profile created successfully",
  "profile_id": 1,
  "user_id": 123,
  "email": "user@example.com"
}
```

#### Response (Update - 200)
```json
{
  "message": "Profile updated successfully",
  "user_id": 123,
  "email": "user@example.com"
}
```

### 2. Get Profile by Email
**GET** `/api/profile/:email`

Retrieves a user's profile information using their email address.

#### Parameters
- `email` (path parameter): User's email address

#### Response (200)
```json
{
  "message": "Profile retrieved successfully",
  "user": {
    "user_id": 123,
    "email": "user@example.com",
    "created_at": "2024-01-01T10:00:00.000Z",
    "has_profile": true
  },
  "profile": {
    "profile_id": 1,
    "first_name": "John",
    "middle_name": "Michael",
    "last_name": "Doe",
    "prefix": "Mr.",
    "suffix": "Jr.",
    "full_name": "Mr. John Michael Doe Jr.",
    "gender": "Male",
    "birth_date": "1995-08-15",
    "primary_phone": "9876543210",
    "home_phone": "9876543211",
    "emergency_phone": "9876543212",
    "email": "user@example.com",
    "nationality": "Indian",
    "religion": "Hindu",
    "marital_status": "Single",
    "caste": "General",
    "height_inches": 70,
    "weight": 75.5,
    "weight_unit": "Kilograms",
    "complexion": "Fair",
    "disability": "None",
    "profession": "Software Engineer",
    "whatsapp_number": "9876543210",
    "linkedin_url": "https://linkedin.com/in/johndoe",
    "facebook_url": "https://facebook.com/johndoe",
    "instagram_url": "https://instagram.com/johndoe",
    "summary": "Looking for a life partner who shares similar values and interests.",
    "created_at": "2024-01-01T10:00:00.000Z",
    "updated_at": "2024-01-01T11:00:00.000Z"
  }
}
```

### 3. Get All Profiles
**GET** `/api/profiles`

Retrieves all user profiles with optional filtering capabilities.

#### Query Parameters
- `gender` (optional): Filter by gender (Male, Female, Other)
- `marital_status` (optional): Filter by marital status (Single, Married, Divorced, Widowed)
- `religion` (optional): Filter by religion
- `min_age` (optional): Minimum age filter
- `max_age` (optional): Maximum age filter
- `limit` (optional): Number of results to return (default: 50)

#### Example Request
```
GET /api/profiles?gender=Female&marital_status=Single&religion=Hindu&min_age=25&max_age=35&limit=20
```

#### Response (200)
```json
{
  "message": "Profiles retrieved successfully",
  "profiles": [
    {
      "user_id": 123,
      "user_email": "user@example.com",
      "profile_id": 1,
      "first_name": "Jane",
      "middle_name": "Elizabeth",
      "last_name": "Smith",
      "prefix": "Ms.",
      "suffix": null,
      "full_name": "Ms. Jane Elizabeth Smith",
      "gender": "Female",
      "birth_date": "1992-12-03",
      "primary_phone": "9876543211",
      "nationality": "Indian",
      "religion": "Hindu",
      "marital_status": "Single",
      "caste": "General",
      "height_inches": 64,
      "weight": 55.0,
      "weight_unit": "Kilograms",
      "complexion": "Fair",
      "profession": "Doctor",
      "summary": "I am a doctor looking for a caring and understanding life partner.",
      "profile_created_at": "2024-01-01T10:00:00.000Z",
      "age": 31
    }
  ],
  "total": 1,
  "filters_applied": {
    "gender": "Female",
    "marital_status": "Single",
    "religion": "Hindu",
    "min_age": "25",
    "max_age": "35",
    "limit": "20"
  }
}
```

## Field Validations

### Required Fields
- `email`: Must be a valid email format and correspond to an existing user

### Optional Fields
All other fields are optional, but some have specific validation rules:

#### Enum Fields
- `gender`: Male, Female, Other
- `marital_status`: Single, Married, Divorced, Widowed
- `weight_unit`: Kilograms, Pounds
- `complexion`: Fair, Medium, Dark, Very Fair, Wheatish

#### Data Types
- `height_inches`: Integer
- `weight`: Decimal (5,2)
- `birth_date`: Date format (YYYY-MM-DD)
- All URL fields should be valid URLs

## Database Schema

The `user_profiles` table structure:

```sql
CREATE TABLE user_profiles (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  first_name VARCHAR(100),
  middle_name VARCHAR(100),
  last_name VARCHAR(100),
  prefix VARCHAR(20),
  suffix VARCHAR(20),
  gender ENUM('Male', 'Female', 'Other'),
  birth_date DATE,
  primary_phone VARCHAR(20),
  home_phone VARCHAR(20),
  emergency_phone VARCHAR(20),
  email VARCHAR(255),
  nationality VARCHAR(100),
  religion VARCHAR(100),
  marital_status ENUM('Single', 'Married', 'Divorced', 'Widowed'),
  caste VARCHAR(100),
  height_inches INT,
  weight DECIMAL(5,2),
  weight_unit ENUM('Kilograms', 'Pounds') DEFAULT 'Kilograms',
  complexion ENUM('Fair', 'Medium', 'Dark', 'Very Fair', 'Wheatish'),
  disability VARCHAR(255) DEFAULT 'None',
  profession VARCHAR(255),
  whatsapp_number VARCHAR(20),
  linkedin_url VARCHAR(255),
  facebook_url VARCHAR(255),
  instagram_url VARCHAR(255),
  summary TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  UNIQUE KEY unique_user_profile (user_id)
);
```

## Error Responses

### 400 - Bad Request
```json
{
  "error": "Email is required"
}
```

### 404 - Not Found
```json
{
  "error": "User not found with this email address"
}
```

### 401 - Unauthorized
```json
{
  "error": "Access token required"
}
```

### 403 - Forbidden
```json
{
  "error": "Invalid or expired token"
}
```

### 500 - Internal Server Error
```json
{
  "error": "Database error"
}
```

## Features

1. **Email-based Profile Management**: All operations use email as the identifier
2. **Create/Update in Single Endpoint**: The POST endpoint intelligently creates or updates profiles
3. **Comprehensive Profile Data**: Supports all matrimony-relevant fields
4. **Advanced Filtering**: Age-based and attribute-based filtering for profile search
5. **Full Name Generation**: Automatically generates formatted full names
6. **Foreign Key Relationships**: Maintains data integrity with user accounts
7. **Timestamp Tracking**: Automatic creation and update timestamps

## Usage Notes

1. Users must be registered before creating a profile
2. One profile per user (enforced by unique constraint)
3. All endpoints require authentication
4. Age calculation is done automatically based on birth_date
5. Profile updates preserve existing data for fields not provided in the request
6. Email validation ensures proper format
7. The system supports partial profile updates 