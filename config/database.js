const mysql = require('mysql2');
require('dotenv').config();

// MySQL Connection
const db = mysql.createConnection({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD.replace(/'/g, ''), // Remove quotes from password
  database: process.env.DB_NAME
});

// Connect to MySQL
db.connect((err) => {
  if (err) {
    console.error('Error connecting to MySQL:', err);
    return;
  }
  console.log('Connected to MySQL database');
  
  // Create users table if not exists
  const createUsersTable = `
    CREATE TABLE IF NOT EXISTS users (
      id INT AUTO_INCREMENT PRIMARY KEY,
      email VARCHAR(255) UNIQUE NOT NULL,
      password VARCHAR(255) NOT NULL,
      first_name VARCHAR(100) NOT NULL,
      middle_name VARCHAR(100),
      last_name VARCHAR(100) NOT NULL,
      birth_date DATE,
      gender ENUM('Male', 'Female', 'Other') NOT NULL,
      complete_address TEXT,
      city VARCHAR(100),
      state VARCHAR(100),
      country VARCHAR(100),
      zip_code VARCHAR(20),
      contact_email VARCHAR(255),
      primary_phone VARCHAR(20),
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
    )
  `;
  
  // Create OTP table if not exists
  const createOtpTable = `
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
  `;
  
  db.query(createUsersTable, (err) => {
    if (err) {
      console.error('Error creating users table:', err);
    } else {
      console.log('Users table ready');
    }
  });

  db.query(createOtpTable, (err) => {
    if (err) {
      console.error('Error creating OTP table:', err);
    } else {
      console.log('OTP table ready');
    }
  });

  // Create user profiles table if not exists
  const createProfilesTable = `
    CREATE TABLE IF NOT EXISTS user_profiles (
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
    )
  `;

  db.query(createProfilesTable, (err) => {
    if (err) {
      console.error('Error creating profiles table:', err);
    } else {
      console.log('User profiles table ready');
    }
  });

  // primary contact table
  const createPrimaryContactTable = `
    CREATE TABLE IF NOT EXISTS primary_contact (
      id INT AUTO_INCREMENT PRIMARY KEY,
      email VARCHAR(255) NOT NULL,
      city VARCHAR(100),
      state VARCHAR(100),
      country VARCHAR(100),
      zip_code VARCHAR(20),
      complete_address TEXT,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
  `;
  db.query(createPrimaryContactTable, (err) => {
    if (err) {
      console.error('Error creating primary_contact table:', err);
    } else {
      console.log('Primary Contact table ready');
    }
  });

  // primary contact table
  const createEducationTable = `
    CREATE TABLE IF NOT EXISTS education (
      id INT AUTO_INCREMENT PRIMARY KEY,
      email VARCHAR(255) NOT NULL,
      degree VARCHAR(255) NOT NULL,
      institution_name VARCHAR(255) NOT NULL,
      year_of_passing VARCHAR(100) NOT NULL,
      complete_address TEXT,
      city VARCHAR(100),
      state VARCHAR(100),
      country VARCHAR(100),
      zip_code VARCHAR(20),
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
  `;
  db.query(createEducationTable, (err) => {
    if (err) {
      console.error('Error creating education table:', err);
    } else {
      console.log('education table ready');
    }
  });

  // User images table
  const createUserImagesTable = `
    CREATE TABLE IF NOT EXISTS user_images (
      id INT AUTO_INCREMENT PRIMARY KEY,
      email VARCHAR(255) NOT NULL,
      image_type ENUM('profile_picture', 'cover_photo', 'individual_picture') NOT NULL,
      filename VARCHAR(255) NOT NULL,
      original_name VARCHAR(255) NOT NULL,
      file_path VARCHAR(500) NOT NULL,
      file_size INT,
      mime_type VARCHAR(100),
      is_active BOOLEAN DEFAULT TRUE,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      INDEX idx_email (email),
      INDEX idx_image_type (image_type),
      INDEX idx_email_type (email, image_type)
    )
  `;
  db.query(createUserImagesTable, (err) => {
    if (err) {
      console.error('Error creating user_images table:', err);
    } else {
      console.log('User images table ready');
    }
  });
});

module.exports = db; 