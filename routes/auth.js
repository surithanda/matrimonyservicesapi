const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const db = require('../config/database');
const { generateOTP, sendOTPEmail } = require('../utils/emailService');
require('dotenv').config();

const router = express.Router();

// Registration API
router.post('/register', async (req, res) => {
  try {
    const { 
      email, 
      password, 
      confirmPassword,
      first_name, 
      middle_name, 
      last_name,
      birth_date,
      gender,
      complete_address,
      city,
      state,
      country,
      zip_code,
      contact_email,
      primary_phone
    } = req.body;

    // Basic validation
    if (!email || !password || !first_name || !last_name || !gender) {
      return res.status(400).json({ 
        error: 'Email, password, first name, last name, and gender are required' 
      });
    }

    // Password confirmation validation
    if (password !== confirmPassword) {
      return res.status(400).json({ 
        error: 'Passwords do not match' 
      });
    }

    // Email format validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ 
        error: 'Please provide a valid email address' 
      });
    }

    // Password strength validation
    if (password.length < 6) {
      return res.status(400).json({ 
        error: 'Password must be at least 6 characters long' 
      });
    }

    // Birth date validation (if provided)
    if (birth_date) {
      const birthDate = new Date(birth_date);
      const currentDate = new Date();
      const age = currentDate.getFullYear() - birthDate.getFullYear();
      
      if (age < 18 || age > 100) {
        return res.status(400).json({ 
          error: 'Age must be between 18 and 100 years' 
        });
      }
    }

    // Check if user already exists
    const checkUserQuery = 'SELECT id FROM users WHERE email = ?';
    
    db.query(checkUserQuery, [email], async (err, results) => {
      if (err) {
        console.error('Database error:', err);
        return res.status(500).json({ error: 'Database error' });
      }

      if (results.length > 0) {
        return res.status(400).json({ error: 'User already exists with this email' });
      }

      // Hash password
      const saltRounds = 10;
      const hashedPassword = await bcrypt.hash(password, saltRounds);

      // Insert new user
      const insertUserQuery = `
        INSERT INTO users (
          email, password, first_name, middle_name, last_name, 
          birth_date, gender, complete_address, city, state, 
          country, zip_code, contact_email, primary_phone
        ) 
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `;

      const userValues = [
        email,
        hashedPassword,
        first_name,
        middle_name || null,
        last_name,
        birth_date || null,
        gender,
        complete_address || null,
        city || null,
        state || null,
        country || null,
        zip_code || null,
        contact_email || email, // Use registration email as default
        primary_phone || null
      ];

      db.query(insertUserQuery, userValues, (err, result) => {
        if (err) {
          console.error('Error inserting user:', err);
          return res.status(500).json({ error: 'Failed to register user' });
        }

        // Generate JWT token
        // const token = jwt.sign(
        //   { id: result.insertId, email: email },
        //   process.env.JWT_SECRET,
        //   { expiresIn: '24h' }
        // );

        res.status(201).json({
          message: 'User registered successfully',
          user: {
            id: result.insertId,
            email: email,
            first_name: first_name,
            middle_name: middle_name,
            last_name: last_name,
            birth_date: birth_date,
            gender: gender,
            complete_address: complete_address,
            city: city,
            state: state,
            country: country,
            zip_code: zip_code,
            contact_email: contact_email || email,
            primary_phone: primary_phone,
            full_name: `${first_name} ${middle_name ? middle_name + ' ' : ''}${last_name}`
          },
          // token: token
        });
      });
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Generate and Send OTP API
router.post('/send-otp', async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validation
    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }

    // Check if user exists and get password for verification
    const checkUserQuery = 'SELECT id, first_name, password FROM users WHERE email = ?';
    
    db.query(checkUserQuery, [email], async (err, results) => {
      if (err) {
        console.error('Database error:', err);
        return res.status(500).json({ error: 'Database error' });
      }

      if (results.length === 0) {
        return res.status(404).json({ error: 'Invalid email or password' });
      }

      const user = results[0];

      // Verify password
      const isValidPassword = await bcrypt.compare(password, user.password);

      if (!isValidPassword) {
        return res.status(400).json({ error: 'Invalid email or password' });
      }

      // Generate OTP
      const otp = generateOTP();
      const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes from now

      // Delete any existing unused OTPs for this email
      const deleteOldOtpQuery = 'DELETE FROM otp_verification WHERE email = ? AND used = FALSE';
      
      db.query(deleteOldOtpQuery, [email], async (err) => {
        if (err) {
          console.error('Error deleting old OTPs:', err);
        }

        // Insert new OTP
        const insertOtpQuery = `
          INSERT INTO otp_verification (email, otp, expires_at) 
          VALUES (?, ?, ?)
        `;

        db.query(insertOtpQuery, [email, otp, expiresAt], async (err, result) => {
          if (err) {
            console.error('Error inserting OTP:', err);
            return res.status(500).json({ error: 'Failed to generate OTP' });
          }

          // Send OTP email
          const emailResult = await sendOTPEmail(email, otp);
          
          if (!emailResult.success) {
            return res.status(500).json({ error: 'Failed to send OTP email' });
          }

          res.json({
            message: 'OTP sent successfully to your email',
            email: email
          });
        });
      });
    });
  } catch (error) {
    console.error('Send OTP error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Login with OTP API
router.post('/login', async (req, res) => {
  try {
    const { email, otp } = req.body;

    // Validation
    if (!email || !otp) {
      return res.status(400).json({ error: 'Email and OTP are required' });
    }

    // Find user by email
    const findUserQuery = 'SELECT * FROM users WHERE email = ?';

    db.query(findUserQuery, [email], async (err, userResults) => {
      if (err) {
        console.error('Database error:', err);
        return res.status(500).json({ error: 'Database error' });
      }

      if (userResults.length === 0) {
        return res.status(400).json({ error: 'Invalid email or OTP' });
      }

      const user = userResults[0];

      // Verify OTP
      const verifyOtpQuery = `
        SELECT * FROM otp_verification 
        WHERE email = ? AND otp = ? AND used = FALSE AND expires_at > NOW()
        ORDER BY created_at DESC 
        LIMIT 1
      `;

      db.query(verifyOtpQuery, [email, otp], async (err, otpResults) => {
        if (err) {
          console.error('Database error:', err);
          return res.status(500).json({ error: 'Database error' });
        }

        if (otpResults.length === 0) {
          return res.status(400).json({ error: 'Invalid or expired OTP' });
        }

        // Mark OTP as used
        const markOtpUsedQuery = 'UPDATE otp_verification SET used = TRUE WHERE id = ?';
        db.query(markOtpUsedQuery, [otpResults[0].id]);

        // Generate JWT token
        const token = jwt.sign(
          { id: user.id, email: user.email },
          process.env.JWT_SECRET,
          { expiresIn: '24h' }
        );

        // Update last login (optional)
        const updateLoginQuery = 'UPDATE users SET updated_at = CURRENT_TIMESTAMP WHERE id = ?';
        db.query(updateLoginQuery, [user.id]);

        res.json({
          message: 'Login successful',
          user: {
            id: user.id,
            email: user.email,
            first_name: user.first_name,
            middle_name: user.middle_name,
            last_name: user.last_name,
            full_name: `${user.first_name} ${user.middle_name ? user.middle_name + ' ' : ''}${user.last_name}`,
            birth_date: user.birth_date,
            gender: user.gender,
            primary_phone: user.primary_phone
          },
          token: token
        });
      });
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Legacy login with password (keep for backward compatibility)
router.post('/login-password', (req, res) => {
  try {
    const { email, password } = req.body;

    // Validation
    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }

    // Find user by email
    const findUserQuery = 'SELECT * FROM users WHERE email = ?';

    db.query(findUserQuery, [email], async (err, results) => {
      if (err) {
        console.error('Database error:', err);
        return res.status(500).json({ error: 'Database error' });
      }

      if (results.length === 0) {
        return res.status(400).json({ error: 'Invalid email or password' });
      }

      const user = results[0];

      // Compare password
      const isValidPassword = await bcrypt.compare(password, user.password);

      if (!isValidPassword) {
        return res.status(400).json({ error: 'Invalid email or password' });
      }

      // Generate JWT token
      const token = jwt.sign(
        { id: user.id, email: user.email },
        process.env.JWT_SECRET,
        { expiresIn: '24h' }
      );

      // Update last login (optional)
      const updateLoginQuery = 'UPDATE users SET updated_at = CURRENT_TIMESTAMP WHERE id = ?';
      db.query(updateLoginQuery, [user.id]);

      res.json({
        message: 'Login successful',
        user: {
          id: user.id,
          email: user.email,
          first_name: user.first_name,
          middle_name: user.middle_name,
          last_name: user.last_name,
          full_name: `${user.first_name} ${user.middle_name ? user.middle_name + ' ' : ''}${user.last_name}`,
          birth_date: user.birth_date,
          gender: user.gender,
          primary_phone: user.primary_phone
        },
        token: token
      });
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router; 