// Jest setup file for testing environment
process.env['NODE_ENV'] = 'test';
process.env['PORT'] = '3001';

// Database config
process.env['DATABASE_URL'] = 'mysql://test_user:test_password@localhost:3306/test_matrimony_db';
process.env['DB_USER'] = 'test_user';
process.env['DB_PASSWORD'] = 'test_password';
process.env['DB_NAME'] = 'test_matrimony_db';
process.env['DB_HOST'] = 'localhost';
process.env['DB_PORT'] = '3306';

// JWT config
process.env['JWT_SECRET'] = 'test_jwt_secret_key_at_least_32_characters_long_for_security';
process.env['JWT_REFRESH_SECRET'] = 'test_jwt_refresh_secret_key_at_least_32_characters_long_for_security';
process.env['JWT_ACCESS_EXPIRES_IN'] = '15m';
process.env['JWT_REFRESH_EXPIRES_IN'] = '7d';

// Email config
process.env['EMAIL_USER'] = 'test@example.com';
process.env['EMAIL_PASSWORD'] = 'test_password';
process.env['EMAIL_FROM'] = 'test@example.com';
process.env['EMAIL_HOST'] = 'smtp.gmail.com';
process.env['EMAIL_PORT'] = '587';

// API config
process.env['API_KEY'] = 'test_api_key_at_least_16_characters_long';
process.env['API_RATE_LIMIT_WINDOW_MS'] = '900000';
process.env['API_RATE_LIMIT_MAX_REQUESTS'] = '100';

// Redis config
process.env['REDIS_URL'] = 'redis://localhost:6379';
process.env['REDIS_HOST'] = 'localhost';
process.env['REDIS_PORT'] = '6379';

// File upload config
process.env['MAX_FILE_SIZE'] = '10485760';
process.env['UPLOAD_PATH'] = '/tmp/test-uploads';

// Feature flags
process.env['ENABLE_SWAGGER'] = 'true';
process.env['ENABLE_RATE_LIMITING'] = 'true';
process.env['ENABLE_COMPRESSION'] = 'true';
process.env['ENABLE_CORS'] = 'true';

// Monitoring
process.env['LOG_LEVEL'] = 'error';
process.env['ENABLE_REQUEST_LOGGING'] = 'false';

// Mock console methods in test environment to reduce noise
global.console = {
  ...console,
  log: jest.fn(),
  debug: jest.fn(),
  info: jest.fn(),
  warn: jest.fn(),
  error: jest.fn()
};

// Setup test timeout
jest.setTimeout(10000); 