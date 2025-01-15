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
        description: 'Account management endpoints including profile updates and photo management'
      },
      {
        name: 'Profile',
        description: 'Profile management endpoints including personal, address, education and employment details'
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
      schemas: {
        AccountUpdate: {
          type: 'object',
          properties: {
            primary_phone: {
              type: 'string',
              example: '1234567890'
            },
            primary_phone_country: {
              type: 'string',
              example: 'US'
            },
            primary_phone_type: {
              type: 'string',
              enum: ['MOBILE', 'HOME', 'WORK']
            },
            secondary_phone: {
              type: 'string',
              example: '0987654321'
            },
            secondary_phone_country: {
              type: 'string',
              example: 'US'
            },
            secondary_phone_type: {
              type: 'string',
              enum: ['MOBILE', 'HOME', 'WORK']
            },
            first_name: {
              type: 'string',
              example: 'John'
            },
            last_name: {
              type: 'string',
              example: 'Doe'
            },
            middle_name: {
              type: 'string',
              example: 'Smith'
            },
            birth_date: {
              type: 'string',
              format: 'date',
              example: '1990-01-01'
            },
            gender: {
              type: 'string',
              enum: ['M', 'F', 'O']
            },
            address_line1: {
              type: 'string',
              example: '123 Main St'
            },
            address_line2: {
              type: 'string',
              example: 'Apt 4B'
            },
            city: {
              type: 'string',
              example: 'New York'
            },
            state: {
              type: 'string',
              example: 'NY'
            },
            zip: {
              type: 'string',
              example: '10001'
            },
            country: {
              type: 'string',
              example: 'US'
            },
            secret_question: {
              type: 'string',
              example: 'What is your pet\'s name?'
            },
            secret_answer: {
              type: 'string',
              example: 'Max'
            },
            driving_license: {
              type: 'string',
              example: 'DL123456'
            }
          }
        },
        PhotoUpload: {
          type: 'object',
          required: ['photo'],
          properties: {
            photo: {
              type: 'string',
              format: 'binary',
              description: 'Profile photo (max 5MB, image files only)'
            }
          }
        },
        OTPVerificationResponse: {
          type: 'object',
          properties: {
            success: {
              type: 'boolean',
              example: true
            },
            message: {
              type: 'string',
              example: 'OTP verified successfully'
            },
            token: {
              type: 'string',
              example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...'
            },
            user: {
              type: 'object',
              properties: {
                full_name: {
                  type: 'string',
                  example: 'John Doe'
                },
                email: {
                  type: 'string',
                  example: 'john.doe@example.com'
                },
                phone: {
                  type: 'string',
                  example: '1234567890'
                },
                date_of_birth: {
                  type: 'string',
                  example: '1990-01-01'
                },
                age: {
                  type: 'number',
                  example: 33
                },
                address: {
                  type: 'string',
                  example: '123 Main St'
                },
                city: {
                  type: 'string',
                  example: 'New York'
                },
                state: {
                  type: 'string',
                  example: 'NY'
                },
                country: {
                  type: 'string',
                  example: 'US'
                },
                zip_code: {
                  type: 'string',
                  example: '10001'
                },
                account_code: {
                  type: 'string',
                  example: 'ACC123'
                },
                account_id: {
                  type: 'number',
                  example: 1
                }
              }
            }
          }
        },
        ProfileEducation: {
          type: 'object',
          required: [
            'profile_id',
            'education_level',
            'year_completed',
            'institution_name',
            'address_line1',
            'city',
            'state',
            'country',
            'zip',
            'field_of_study'
          ],
          properties: {
            profile_id: {
              type: 'integer',
              example: 1
            },
            education_level: {
              type: 'integer',
              example: 1
            },
            year_completed: {
              type: 'integer',
              example: 2020
            },
            institution_name: {
              type: 'string',
              example: 'University of Example'
            },
            address_line1: {
              type: 'string',
              example: '123 Education St'
            },
            city: {
              type: 'string',
              example: 'College Town'
            },
            state: {
              type: 'string',
              example: 'ST'
            },
            country: {
              type: 'string',
              example: 'US'
            },
            zip: {
              type: 'string',
              example: '12345'
            },
            field_of_study: {
              type: 'integer',
              example: 1
            }
          }
        },
        ProfileEmployment: {
          type: 'object',
          required: [
            'profile_id',
            'institution_name',
            'address_line1',
            'city',
            'state',
            'country',
            'zip',
            'start_year',
            'end_year',
            'job_title',
            'last_salary_drawn'
          ],
          properties: {
            profile_id: {
              type: 'integer',
              example: 1
            },
            institution_name: {
              type: 'string',
              example: 'Tech Corp Inc'
            },
            address_line1: {
              type: 'string',
              example: '456 Business Ave'
            },
            city: {
              type: 'string',
              example: 'Tech City'
            },
            state: {
              type: 'string',
              example: 'TC'
            },
            country: {
              type: 'string',
              example: 'US'
            },
            zip: {
              type: 'string',
              example: '54321'
            },
            start_year: {
              type: 'integer',
              example: 2018
            },
            end_year: {
              type: 'integer',
              example: 2022
            },
            job_title: {
              type: 'string',
              example: 'Senior Developer'
            },
            last_salary_drawn: {
              type: 'string',
              example: '100000'
            }
          }
        },
        ProfilePersonal: {
          type: 'object',
          required: [
            'profile_id'
          ],
          properties: {
            profile_id: {
              type: 'integer',
              example: 1
            }
          }
        },
        ProfileAddress: {
          type: 'object',
          required: [
            'profile_id',
            'address_line1',
            'city',
            'state',
            'country',
            'zip'
          ],
          properties: {
            profile_id: {
              type: 'integer',
              example: 1
            },
            address_line1: {
              type: 'string',
              example: '123 Main St'
            },
            address_line2: {
              type: 'string',
              example: 'Apt 4B'
            },
            city: {
              type: 'string',
              example: 'New York'
            },
            state: {
              type: 'string',
              example: 'NY'
            },
            country: {
              type: 'string',
              example: 'US'
            },
            zip: {
              type: 'string',
              example: '10001'
            }
          }
        }
      }
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