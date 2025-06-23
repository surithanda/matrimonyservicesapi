# Detailed Profile API Documentation

## Overview

The Detailed Profile API provides endpoints for comprehensive matrimony profile management using email-based operations. This API supports all the form fields shown in the matrimony profile form and allows for creating, updating, and retrieving detailed user profiles.

## Endpoints

### 1. GET /api/detailed-profile

Retrieve a detailed profile by email address.

**Query Parameters:**
- `email` (required): The email address of the user

**Response Structure:**
```json
{
  "message": "Detailed profile retrieved successfully",
  "profile": {
    "user_info": {
      "id": 1,
      "email": "user@example.com",
      "created_at": "2024-01-01T00:00:00.000Z"
    },
    "personal_details": {
      "first_name": "John",
      "middle_name": "Michael",
      "last_name": "Doe",
      "prefix": "Mr.",
      "suffix": "Jr.",
      "gender": "Male",
      "birth_date": "1995-08-15"
    },
    "contact_details": {
      "primary_phone": "9876543210",
      "home_phone": "1234567890",
      "emergency_phone": "9999999999",
      "email": "john.doe@example.com"
    },
    "demographics": {
      "nationality": "American",
      "religion": "Christianity",
      "marital_status": "Single",
      "caste": "General"
    },
    "physical_attributes": {
      "height_inches": 72,
      "weight": 75.5,
      "weight_unit": "Kilograms",
      "complexion": "Fair",
      "disability": "None"
    },
    "professional_social": {
      "profession": "Software Engineer",
      "whatsapp_number": "9876543210",
      "linkedin_url": "https://linkedin.com/in/johndoe",
      "facebook_url": "https://facebook.com/johndoe",
      "instagram_url": "https://instagram.com/johndoe"
    },
    "summary": {
      "brief_summary": "A brief description about the person..."
    },
    "profile_updated_at": "2024-01-01T00:00:00.000Z"
  }
}
```

**Example Request:**
```
GET /api/detailed-profile?email=john.doe@example.com
```

### 2. POST /api/detailed-profile

Create or update a detailed profile using email in the request body.

**Request Body:**
```json
{
  "email": "john.doe@example.com",
  "profile_data": {
    "personal_details": {
      "first_name": "John",
      "middle_name": "Michael",
      "last_name": "Doe",
      "prefix": "Mr.",
      "suffix": "Jr.",
      "gender": "Male",
      "birth_date": "1995-08-15"
    },
    "contact_details": {
      "primary_phone": "9876543210",
      "home_phone": "1234567890",
      "emergency_phone": "9999999999",
      "email": "john.doe@example.com"
    },
    "demographics": {
      "nationality": "American",
      "religion": "Christianity",
      "marital_status": "Single",
      "caste": "General"
    },
    "physical_attributes": {
      "height_inches": 72,
      "weight": 75.5,
      "weight_unit": "Kilograms",
      "complexion": "Fair",
      "disability": "None"
    },
    "professional_social": {
      "profession": "Software Engineer",
      "whatsapp_number": "9876543210",
      "linkedin_url": "https://linkedin.com/in/johndoe",
      "facebook_url": "https://facebook.com/johndoe",
      "instagram_url": "https://instagram.com/johndoe"
    },
    "summary": {
      "brief_summary": "I am a passionate software engineer..."
    }
  }
}
```

**Response (Create):**
```json
{
  "message": "Detailed profile created successfully",
  "user_id": 1,
  "email": "john.doe@example.com",
  "profile_id": 1,
  "operation": "create"
}
```

**Response (Update):**
```json
{
  "message": "Detailed profile updated successfully",
  "user_id": 1,
  "email": "john.doe@example.com",
  "operation": "update"
}
```

## Field Specifications

### Personal Details
- **first_name**: String - First name of the person
- **middle_name**: String (optional) - Middle name
- **last_name**: String - Last name of the person
- **prefix**: String (optional) - Title prefix (Mr., Ms., Dr., etc.)
- **suffix**: String (optional) - Name suffix (Jr., Sr., III, etc.)
- **gender**: Enum - Male/Female/Other
- **birth_date**: Date - Birth date in YYYY-MM-DD format

### Contact Details
- **primary_phone**: String - Primary phone number
- **home_phone**: String (optional) - Home phone number
- **emergency_phone**: String (optional) - Emergency contact phone
- **email**: String - Email address

### Demographics
- **nationality**: String (optional) - Nationality
- **religion**: String (optional) - Religion
- **marital_status**: Enum (optional) - Single/Married/Divorced/Widowed
- **caste**: String (optional) - Caste information

### Physical Attributes
- **height_inches**: Integer (optional) - Height in inches
- **weight**: Decimal (optional) - Weight value
- **weight_unit**: Enum (optional) - Kilograms/Pounds
- **complexion**: Enum (optional) - Fair/Medium/Dark/Very Fair/Wheatish
- **disability**: String (optional) - Disability information (default: "None")

### Professional & Social Details
- **profession**: String (optional) - Profession/occupation
- **whatsapp_number**: String (optional) - WhatsApp number
- **linkedin_url**: String (optional) - LinkedIn profile URL
- **facebook_url**: String (optional) - Facebook profile URL
- **instagram_url**: String (optional) - Instagram profile URL

### Summary
- **brief_summary**: Text (optional) - Brief description about the person

## Error Responses

### 400 Bad Request
```json
{
  "error": "Email is required in request body"
}
```

### 404 Not Found
```json
{
  "error": "User not found with this email"
}
```

### 500 Internal Server Error
```json
{
  "error": "Database error"
}
```

## Usage Examples

### Creating a Profile
1. First, ensure the user is registered in the system
2. Use POST `/api/detailed-profile` with the email and complete profile data
3. The system will automatically create a new profile if none exists

### Updating a Profile
1. Use POST `/api/detailed-profile` with the same email and updated profile data
2. The system will automatically update the existing profile

### Retrieving a Profile
1. Use GET `/api/detailed-profile?email=user@example.com`
2. Returns the complete profile with all sections organized

## Notes
- All endpoints work with email addresses without requiring authentication tokens
- The API automatically handles create vs update operations
- Profile data is organized into logical sections matching the matrimony form structure
- Image upload functionality is not implemented in the current version
- All optional fields can be omitted from requests
- The API maintains backward compatibility with existing profile endpoints 