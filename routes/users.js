const express = require('express');
const db = require('../config/database');
const { authenticateToken } = require('../middleware/auth');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { v4: uuidv4 } = require('uuid');

const router = express.Router();

// Configure multer for profile photo uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const profileUploadPath = './uploads/profile-pictures/';
    
    // Create directory if it doesn't exist
    if (!fs.existsSync(profileUploadPath)) {
      fs.mkdirSync(profileUploadPath, { recursive: true });
    }
    
    cb(null, profileUploadPath);
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + uuidv4();
    const extension = path.extname(file.originalname);
    cb(null, 'profile-' + uniqueSuffix + extension);
  }
});

// File filter to allow only images
const fileFilter = (req, file, cb) => {
  if (file.mimetype.startsWith('image/')) {
    cb(null, true);
  } else {
    cb(new Error('Only image files are allowed!'), false);
  }
};

const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB limit
  }
});

// Get all users (protected route) - for admin/testing purposes
router.get('/users', authenticateToken, (req, res) => {
  const getAllUsersQuery = `
    SELECT id, email, first_name, middle_name, last_name, birth_date, 
           gender, city, state, country, primary_phone, created_at 
    FROM users ORDER BY created_at DESC`;
  
  db.query(getAllUsersQuery, (err, results) => {
    if (err) {
      console.error('Database error:', err);
      return res.status(500).json({ error: 'Database error' });
    }

    // Add full_name to each user
    const usersWithFullName = results.map(user => ({
      ...user,
      full_name: `${user.first_name} ${user.middle_name ? user.middle_name + ' ' : ''}${user.last_name}`
    }));

    res.json({
      message: 'Users retrieved successfully',
      users: usersWithFullName,
      total: results.length
    });
  });
});

// Create or Update User Profile
router.post('/profile', authenticateToken, (req, res) => {
  try {
    const {
      email,
      first_name,
      middle_name,
      last_name,
      prefix,
      suffix,
      gender,
      birth_date,
      primary_phone,
      home_phone,
      emergency_phone,
      nationality,
      religion,
      marital_status,
      caste,
      height_inches,
      weight,
      weight_unit,
      complexion,
      disability,
      profession,
      whatsapp_number,
      linkedin_url,
      facebook_url,
      instagram_url,
      summary
    } = req.body;

    // Validate required fields
    if (!email) {
      return res.status(400).json({ error: 'Email is required' });
    }

    // Email format validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ 
        error: 'Please provide a valid email address' 
      });
    }

    // First, check if user exists with this email
    const checkUserQuery = 'SELECT id FROM users WHERE email = ?';
    
    db.query(checkUserQuery, [email], (err, userResults) => {
      if (err) {
        console.error('Database error:', err);
        return res.status(500).json({ error: 'Database error' });
      }

      if (userResults.length === 0) {
        return res.status(404).json({ error: 'User not found with this email address' });
      }

      const userId = userResults[0].id;

      // Check if profile already exists
      const checkProfileQuery = 'SELECT id FROM user_profiles WHERE user_id = ?';
      
      db.query(checkProfileQuery, [userId], (err, profileResults) => {
        if (err) {
          console.error('Database error:', err);
          return res.status(500).json({ error: 'Database error' });
        }

        const profileValues = [
          userId,
          first_name || null,
          middle_name || null,
          last_name || null,
          prefix || null,
          suffix || null,
          gender || null,
          birth_date || null,
          primary_phone || null,
          home_phone || null,
          emergency_phone || null,
          email,
          nationality || null,
          religion || null,
          marital_status || null,
          caste || null,
          height_inches || null,
          weight || null,
          weight_unit || 'Kilograms',
          complexion || null,
          disability || 'None',
          profession || null,
          whatsapp_number || null,
          linkedin_url || null,
          facebook_url || null,
          instagram_url || null,
          summary || null
        ];

        if (profileResults.length === 0) {
          // Create new profile
          const insertProfileQuery = `
            INSERT INTO user_profiles (
              user_id, first_name, middle_name, last_name, prefix, suffix,
              gender, birth_date, primary_phone, home_phone, emergency_phone,
              email, nationality, religion, marital_status, caste,
              height_inches, weight, weight_unit, complexion, disability,
              profession, whatsapp_number, linkedin_url, facebook_url,
              instagram_url, summary
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
          `;

          db.query(insertProfileQuery, profileValues, (err, result) => {
            if (err) {
              console.error('Error creating profile:', err);
              return res.status(500).json({ error: 'Failed to create profile' });
            }

            res.status(201).json({
              message: 'Profile created successfully',
              profile_id: result.insertId,
              user_id: userId,
              email: email
            });
          });
        } else {
          // Update existing profile
          const updateProfileQuery = `
            UPDATE user_profiles SET
              first_name = ?, middle_name = ?, last_name = ?, prefix = ?, suffix = ?,
              gender = ?, birth_date = ?, primary_phone = ?, home_phone = ?, emergency_phone = ?,
              email = ?, nationality = ?, religion = ?, marital_status = ?, caste = ?,
              height_inches = ?, weight = ?, weight_unit = ?, complexion = ?, disability = ?,
              profession = ?, whatsapp_number = ?, linkedin_url = ?, facebook_url = ?,
              instagram_url = ?, summary = ?, updated_at = CURRENT_TIMESTAMP
            WHERE user_id = ?
          `;

          const updateValues = [...profileValues.slice(1), userId]; // Remove user_id from values and add it at the end

          db.query(updateProfileQuery, updateValues, (err, result) => {
            if (err) {
              console.error('Error updating profile:', err);
              return res.status(500).json({ error: 'Failed to update profile' });
            }

            res.json({
              message: 'Profile updated successfully',
              user_id: userId,
              email: email
            });
          });
        }
      });
    });
  } catch (error) {
    console.error('Profile operation error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get User Profile by Email
router.get('/profile/:email', authenticateToken, (req, res) => {
  try {
    const { email } = req.params;

    // Email format validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ 
        error: 'Please provide a valid email address' 
      });
    }

    // Get user and profile data
    const getProfileQuery = `
      SELECT 
        u.id as user_id,
        u.email as user_email,
        u.created_at as user_created_at,
        p.id as profile_id,
        p.first_name,
        p.middle_name,
        p.last_name,
        p.prefix,
        p.suffix,
        p.gender,
        p.birth_date,
        p.primary_phone,
        p.home_phone,
        p.emergency_phone,
        p.email as profile_email,
        p.nationality,
        p.religion,
        p.marital_status,
        p.caste,
        p.height_inches,
        p.weight,
        p.weight_unit,
        p.complexion,
        p.disability,
        p.profession,
        p.whatsapp_number,
        p.linkedin_url,
        p.facebook_url,
        p.instagram_url,
        p.summary,
        p.created_at as profile_created_at,
        p.updated_at as profile_updated_at
      FROM users u
      LEFT JOIN user_profiles p ON u.id = p.user_id
      WHERE u.email = ?
    `;

    db.query(getProfileQuery, [email], (err, results) => {
      if (err) {
        console.error('Database error:', err);
        return res.status(500).json({ error: 'Database error' });
      }

      if (results.length === 0) {
        return res.status(404).json({ 
          error: 'User not found with this email address' 
        });
      }

      const userData = results[0];
      
      // Create full name from profile data if available, otherwise from user data
      let full_name = '';
      if (userData.first_name || userData.last_name) {
        full_name = `${userData.prefix ? userData.prefix + ' ' : ''}${userData.first_name || ''} ${userData.middle_name ? userData.middle_name + ' ' : ''}${userData.last_name || ''} ${userData.suffix ? userData.suffix : ''}`.trim();
      }

      const response = {
        message: 'Profile retrieved successfully',
        user: {
          user_id: userData.user_id,
          email: userData.user_email,
          created_at: userData.user_created_at,
          has_profile: userData.profile_id ? true : false
        }
      };

      if (userData.profile_id) {
        response.profile = {
          profile_id: userData.profile_id,
          first_name: userData.first_name,
          middle_name: userData.middle_name,
          last_name: userData.last_name,
          prefix: userData.prefix,
          suffix: userData.suffix,
          full_name: full_name,
          gender: userData.gender,
          birth_date: userData.birth_date,
          primary_phone: userData.primary_phone,
          home_phone: userData.home_phone,
          emergency_phone: userData.emergency_phone,
          email: userData.profile_email,
          nationality: userData.nationality,
          religion: userData.religion,
          marital_status: userData.marital_status,
          caste: userData.caste,
          height_inches: userData.height_inches,
          weight: userData.weight,
          weight_unit: userData.weight_unit,
          complexion: userData.complexion,
          disability: userData.disability,
          profession: userData.profession,
          whatsapp_number: userData.whatsapp_number,
          linkedin_url: userData.linkedin_url,
          facebook_url: userData.facebook_url,
          instagram_url: userData.instagram_url,
          summary: userData.summary,
          created_at: userData.profile_created_at,
          updated_at: userData.profile_updated_at
        };
      }

      res.json(response);
    });
  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get All Profiles (for admin/matching purposes)
router.get('/profiles', authenticateToken, (req, res) => {
  try {
    const { gender, marital_status, religion, min_age, max_age, limit = 50 } = req.query;
    
    let whereConditions = [];
    let queryParams = [];

    // Build dynamic where clause
    if (gender) {
      whereConditions.push('p.gender = ?');
      queryParams.push(gender);
    }
    
    if (marital_status) {
      whereConditions.push('p.marital_status = ?');
      queryParams.push(marital_status);
    }
    
    if (religion) {
      whereConditions.push('p.religion = ?');
      queryParams.push(religion);
    }
    
    // Age filtering based on birth_date
    if (min_age) {
      whereConditions.push('p.birth_date <= DATE_SUB(CURDATE(), INTERVAL ? YEAR)');
      queryParams.push(min_age);
    }
    
    if (max_age) {
      whereConditions.push('p.birth_date >= DATE_SUB(CURDATE(), INTERVAL ? YEAR)');
      queryParams.push(max_age);
    }

    const whereClause = whereConditions.length > 0 ? 'WHERE ' + whereConditions.join(' AND ') : '';
    
    const getAllProfilesQuery = `
      SELECT 
        u.id as user_id,
        u.email as user_email,
        p.id as profile_id,
        p.first_name,
        p.middle_name,
        p.last_name,
        p.prefix,
        p.suffix,
        p.gender,
        p.birth_date,
        p.primary_phone,
        p.nationality,
        p.religion,
        p.marital_status,
        p.caste,
        p.height_inches,
        p.weight,
        p.weight_unit,
        p.complexion,
        p.profession,
        p.summary,
        p.created_at as profile_created_at,
        TIMESTAMPDIFF(YEAR, p.birth_date, CURDATE()) as age
      FROM users u
      INNER JOIN user_profiles p ON u.id = p.user_id
      ${whereClause}
      ORDER BY p.updated_at DESC
      LIMIT ?
    `;

    queryParams.push(parseInt(limit));

    db.query(getAllProfilesQuery, queryParams, (err, results) => {
      if (err) {
        console.error('Database error:', err);
        return res.status(500).json({ error: 'Database error' });
      }

      const profilesWithFullName = results.map(profile => ({
        ...profile,
        full_name: `${profile.prefix ? profile.prefix + ' ' : ''}${profile.first_name || ''} ${profile.middle_name ? profile.middle_name + ' ' : ''}${profile.last_name || ''} ${profile.suffix ? profile.suffix : ''}`.trim()
      }));

      res.json({
        message: 'Profiles retrieved successfully',
        profiles: profilesWithFullName,
        total: results.length,
        filters_applied: {
          gender: gender || null,
          marital_status: marital_status || null,
          religion: religion || null,
          min_age: min_age || null,
          max_age: max_age || null,
          limit: limit
        }
      });
    });
  } catch (error) {
    console.error('Get profiles error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});


// primarycontact route to check database connection
router.post('/primarycontact', authenticateToken, (req, res) => {
  try {
    const {email,city,state,country,zip_code,complete_address} = req.body;
    
    if (!email || !city || !state || !country || !zip_code || !complete_address) {
      return res.status(400).json({ error: 'Email and all others fields are required' });
    } 

    // Email format validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ 
        error: 'Please provide a valid email address' 
      });
    }

    // First, check if record exists with this email
    const checkRecordQuery = 'SELECT id FROM primary_contact WHERE email = ?';
    
    db.query(checkRecordQuery, [email], (err, recordResults) => {
      if (err) {
        console.error('Database error:', err);
        return res.status(500).json({ error: 'Database error' });
      }
      // If no record found, return 404
      // This is to ensure that we only insert new records if the email does not already exist
      if (recordResults.length === 0) {
        const primaryContactValues = [email, city, state, country, zip_code, complete_address];
        const primaryContactInsertQuery = `
          INSERT INTO primary_contact (email,city,state,country,zip_code,complete_address) 
          VALUES (?, ?, ?, ?, ?, ?)
        `; 
        db.query(primaryContactInsertQuery, [...primaryContactValues], (err, result) => {
          if (err) {
            console.error('Database error:', err);
            return res.status(500).json({ error: 'Database error' });
          }
          res.json({
            message: 'primary contact data inserted successfully',
            test_id: result.insertId,
            email: email
          });
        });
      }else{
        // update primary contact record if it exists
        const updateQuery = `
          UPDATE primary_contact 
          SET city = ?, state = ?, country = ?, zip_code = ?, complete_address = ?
          WHERE email = ?
        `;
        const updateValues = [city, state, country, zip_code, complete_address, email];

        db.query(updateQuery, updateValues, (err, updateResult) => {
        if (err) {
          console.error('Database update error:', err);
            return res.status(500).json({ error: 'Database update error' });
        }

        res.json({
          message: 'Primary contact updated successfully',
          email: email
        });
      });
      }
    })

  } catch (error) { 
    console.error('primarycontact route error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// education route to check database connection
router.post('/education', authenticateToken, (req, res) => {
  try {
    const {email,degree,institution_name,year_of_passing,complete_address,city,state,country,zip_code} = req.body;
    
    if (!email || !degree || !institution_name || !year_of_passing || !complete_address || !city || !state || !country || !zip_code) {
      return res.status(400).json({ error: 'Email and all others fields are required' });
    } 

    // Email format validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ 
        error: 'Please provide a valid email address' 
      });
    }

    // First, check if record exists with this email
    const checkRecordQuery = 'SELECT id FROM education WHERE email = ?';
    
    db.query(checkRecordQuery, [email], (err, recordResults) => {
      if (err) {
        console.error('Database error:', err);
        return res.status(500).json({ error: 'Database error' });
      }
      // If no record found, return 404
      // This is to ensure that we only insert new records if the email does not already exist
      if (recordResults.length === 0) {
        const educationValues = [email,degree,institution_name,year_of_passing,complete_address,city,state,country,zip_code];
        const educationInsertQuery = `
          INSERT INTO education (email,degree,institution_name,year_of_passing,complete_address,city,state,country,zip_code) 
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
        `; 
        db.query(educationInsertQuery, [...educationValues], (err, result) => {
          if (err) {
            console.error('Database error:', err);
            return res.status(500).json({ error: 'Database error' });
          }
          res.json({
            message: 'education data inserted successfully',
            test_id: result.insertId,
            email: email
          });
        });
      }else{
        // update education record if it exists
        const updateQuery = `
          UPDATE education 
          SET degree = ?, institution_name = ?, year_of_passing = ?, complete_address = ?, city = ?, state = ?, country = ?, zip_code = ?
          WHERE email = ?
        `;
        const updateValues = [degree, institution_name, year_of_passing, complete_address, city, state, country, zip_code, email];

        db.query(updateQuery, updateValues, (err, updateResult) => {
        if (err) {
          console.error('Database update error:', err);
            return res.status(500).json({ error: 'Database update error' });
        }

        res.json({
          message: 'Education updated successfully',
          email: email
        });
      });
      }
    })

  } catch (error) { 
    console.error('primarycontact route error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Create or Update Account Details with Profile Photo Upload
router.post('/account-details-with-photo', authenticateToken, upload.single('profile_photo'), (req, res) => {
  try {
    const {
      email,
      first_name,
      middle_name,
      last_name,
      birth_date,
      gender,
      primary_phone,
      secondary_phone,
      complete_address,
      city,
      state,
      zip_code,
      country
    } = req.body;

    // Validate required fields
    if (!email) {
      return res.status(400).json({ error: 'Email is required' });
    }

    if (!first_name || !last_name) {
      return res.status(400).json({ error: 'First name and last name are required' });
    }

    if (!gender || !['Male', 'Female', 'Other'].includes(gender)) {
      return res.status(400).json({ error: 'Valid gender is required (Male, Female, or Other)' });
    }

    // Email format validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ 
        error: 'Please provide a valid email address' 
      });
    }

    // Date validation if birth_date is provided
    if (birth_date) {
      const birthDateObj = new Date(birth_date);
      const today = new Date();
      const age = today.getFullYear() - birthDateObj.getFullYear();
      
      if (isNaN(birthDateObj.getTime()) || age < 18 || age > 100) {
        return res.status(400).json({ 
          error: 'Please provide a valid birth date (age must be between 18-100)' 
        });
      }
    }

    // Handle profile photo upload if provided
    let profilePhotoInfo = null;
    if (req.file) {
      // First, get existing active profile pictures to delete their files
      const getExistingPhotosQuery = `
        SELECT file_path, filename 
        FROM user_images 
        WHERE email = ? AND image_type = 'profile_picture' AND is_active = TRUE
      `;
      
      db.query(getExistingPhotosQuery, [email], (err, existingPhotos) => {
        if (err) {
          console.error('Error fetching existing profile pictures:', err);
          // Continue with saving new photo even if we can't fetch existing ones
          saveNewProfilePhoto();
        } else {
          // Delete physical files first
          if (existingPhotos.length > 0) {
            existingPhotos.forEach(photo => {
              if (fs.existsSync(photo.file_path)) {
                try {
                  fs.unlinkSync(photo.file_path);
                  console.log(`Deleted old profile photo: ${photo.filename}`);
                } catch (deleteErr) {
                  console.error(`Error deleting file ${photo.file_path}:`, deleteErr);
                }
              }
            });
          }
          
          // Deactivate existing profile pictures in database
          const deactivateQuery = `
            UPDATE user_images 
            SET is_active = FALSE 
            WHERE email = ? AND image_type = 'profile_picture'
          `;
          
          db.query(deactivateQuery, [email], (err) => {
            if (err) {
              console.error('Error deactivating existing profile pictures:', err);
            }
            // After deactivating old records, save the new photo
            saveNewProfilePhoto();
          });
        }
      });

      function saveNewProfilePhoto() {
        // Save new profile photo info
        const insertImageQuery = `
          INSERT INTO user_images (
            email, image_type, filename, original_name, 
            file_path, file_size, mime_type
          ) VALUES (?, ?, ?, ?, ?, ?, ?)
        `;
        
        const imageValues = [
          email,
          'profile_picture',
          req.file.filename,
          req.file.originalname,
          req.file.path,
          req.file.size,
          req.file.mimetype
        ];
        
        db.query(insertImageQuery, imageValues, (err, result) => {
          if (err) {
            console.error('Error saving profile photo:', err);
          } else {
            profilePhotoInfo = {
              id: result.insertId,
              filename: req.file.filename,
              original_name: req.file.originalname,
              file_path: req.file.path,
              file_size: req.file.size
            };
            console.log(`New profile photo saved: ${req.file.filename}`);
          }
        });
      }
    }

    // Update account details (same logic as before)
    updateAccountDetails();

    function updateAccountDetails() {
      // Check if user exists, if not create new user
      const checkUserQuery = 'SELECT id FROM users WHERE email = ?';
      
      db.query(checkUserQuery, [email], (err, userResults) => {
        if (err) {
          console.error('Database error:', err);
          return res.status(500).json({ error: 'Database error' });
        }

        let userId;
        
        if (userResults.length === 0) {
          // Create new user entry if doesn't exist
          const createUserQuery = `
            INSERT INTO users (
              email, first_name, middle_name, last_name, birth_date, 
              gender, complete_address, city, state, country, zip_code, primary_phone
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
          `;
          
          const userValues = [
            email,
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
            primary_phone || null
          ];

          db.query(createUserQuery, userValues, (err, result) => {
            if (err) {
              console.error('Error creating user:', err);
              return res.status(500).json({ error: 'Failed to create user account' });
            }
            
            userId = result.insertId;
            createOrUpdateProfile(userId);
          });
        } else {
          // Update existing user
          userId = userResults[0].id;
          
          const updateUserQuery = `
            UPDATE users SET
              first_name = ?, middle_name = ?, last_name = ?, birth_date = ?,
              gender = ?, complete_address = ?, city = ?, state = ?, country = ?,
              zip_code = ?, primary_phone = ?, updated_at = CURRENT_TIMESTAMP
            WHERE id = ?
          `;
          
          const updateUserValues = [
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
            primary_phone || null,
            userId
          ];

          db.query(updateUserQuery, updateUserValues, (err) => {
            if (err) {
              console.error('Error updating user:', err);
              return res.status(500).json({ error: 'Failed to update user account' });
            }
            
            createOrUpdateProfile(userId);
          });
        }

        function createOrUpdateProfile(userId) {
          // Check if profile exists
          const checkProfileQuery = 'SELECT id FROM user_profiles WHERE user_id = ?';
          
          db.query(checkProfileQuery, [userId], (err, profileResults) => {
            if (err) {
              console.error('Database error:', err);
              return res.status(500).json({ error: 'Database error' });
            }

            const profileValues = [
              userId,
              first_name,
              middle_name || null,
              last_name,
              gender,
              birth_date || null,
              primary_phone || null,
              secondary_phone || null, // Using home_phone field for secondary phone
              email
            ];

            if (profileResults.length === 0) {
              // Create new profile
              const insertProfileQuery = `
                INSERT INTO user_profiles (
                  user_id, first_name, middle_name, last_name, gender,
                  birth_date, primary_phone, home_phone, email
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
              `;

              db.query(insertProfileQuery, profileValues, (err, result) => {
                if (err) {
                  console.error('Error creating profile:', err);
                  return res.status(500).json({ error: 'Failed to create profile' });
                }

                // Fetch the complete account details
                fetchAccountDetailsWithPhoto(email, res, 'Account details created successfully', profilePhotoInfo);
              });
            } else {
              // Update existing profile
              const updateProfileQuery = `
                UPDATE user_profiles SET
                  first_name = ?, middle_name = ?, last_name = ?, gender = ?,
                  birth_date = ?, primary_phone = ?, home_phone = ?, email = ?,
                  updated_at = CURRENT_TIMESTAMP
                WHERE user_id = ?
              `;

              const updateValues = [...profileValues.slice(1), userId]; // Remove user_id from values and add it at the end

              db.query(updateProfileQuery, updateValues, (err) => {
                if (err) {
                  console.error('Error updating profile:', err);
                  return res.status(500).json({ error: 'Failed to update profile' });
                }

                // Fetch the complete account details
                fetchAccountDetailsWithPhoto(email, res, 'Account details updated successfully', profilePhotoInfo);
              });
            }
          });
        }
      });
    }
  } catch (error) {
    console.error('Account details with photo operation error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Create or Update Account Details (comprehensive endpoint with optional photo upload)
router.post('/account-details', authenticateToken, (req, res) => {
  try {
    const {
      email,
      first_name,
      middle_name,
      last_name,
      birth_date,
      gender,
      primary_phone,
      secondary_phone,
      complete_address,
      city,
      state,
      zip_code,
      country
    } = req.body;

    // Validate required fields
    if (!email) {
      return res.status(400).json({ error: 'Email is required' });
    }

    if (!first_name || !last_name) {
      return res.status(400).json({ error: 'First name and last name are required' });
    }

    if (!gender || !['Male', 'Female', 'Other'].includes(gender)) {
      return res.status(400).json({ error: 'Valid gender is required (Male, Female, or Other)' });
    }

    // Email format validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ 
        error: 'Please provide a valid email address' 
      });
    }

    // Date validation if birth_date is provided
    if (birth_date) {
      const birthDateObj = new Date(birth_date);
      const today = new Date();
      const age = today.getFullYear() - birthDateObj.getFullYear();
      
      if (isNaN(birthDateObj.getTime()) || age < 18 || age > 100) {
        return res.status(400).json({ 
          error: 'Please provide a valid birth date (age must be between 18-100)' 
        });
      }
    }

    // Check if user exists, if not create new user
    const checkUserQuery = 'SELECT id FROM users WHERE email = ?';
    
    db.query(checkUserQuery, [email], (err, userResults) => {
      if (err) {
        console.error('Database error:', err);
        return res.status(500).json({ error: 'Database error' });
      }

      let userId;
      
      if (userResults.length === 0) {
        // Create new user entry if doesn't exist
        const createUserQuery = `
          INSERT INTO users (
            email, first_name, middle_name, last_name, birth_date, 
            gender, complete_address, city, state, country, zip_code, primary_phone
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `;
        
        const userValues = [
          email,
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
          primary_phone || null
        ];

        db.query(createUserQuery, userValues, (err, result) => {
          if (err) {
            console.error('Error creating user:', err);
            return res.status(500).json({ error: 'Failed to create user account' });
          }
          
          userId = result.insertId;
          createOrUpdateProfile(userId);
        });
      } else {
        // Update existing user
        userId = userResults[0].id;
        
        const updateUserQuery = `
          UPDATE users SET
            first_name = ?, middle_name = ?, last_name = ?, birth_date = ?,
            gender = ?, complete_address = ?, city = ?, state = ?, country = ?,
            zip_code = ?, primary_phone = ?, updated_at = CURRENT_TIMESTAMP
          WHERE id = ?
        `;
        
        const updateUserValues = [
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
          primary_phone || null,
          userId
        ];

        db.query(updateUserQuery, updateUserValues, (err) => {
          if (err) {
            console.error('Error updating user:', err);
            return res.status(500).json({ error: 'Failed to update user account' });
          }
          
          createOrUpdateProfile(userId);
        });
      }

      function createOrUpdateProfile(userId) {
        // Check if profile exists
        const checkProfileQuery = 'SELECT id FROM user_profiles WHERE user_id = ?';
        
        db.query(checkProfileQuery, [userId], (err, profileResults) => {
          if (err) {
            console.error('Database error:', err);
            return res.status(500).json({ error: 'Database error' });
          }

          const profileValues = [
            userId,
            first_name,
            middle_name || null,
            last_name,
            gender,
            birth_date || null,
            primary_phone || null,
            secondary_phone || null, // Using home_phone field for secondary phone
            email
          ];

          if (profileResults.length === 0) {
            // Create new profile
            const insertProfileQuery = `
              INSERT INTO user_profiles (
                user_id, first_name, middle_name, last_name, gender,
                birth_date, primary_phone, home_phone, email
              ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
            `;

            db.query(insertProfileQuery, profileValues, (err, result) => {
              if (err) {
                console.error('Error creating profile:', err);
                return res.status(500).json({ error: 'Failed to create profile' });
              }

              // Fetch the complete account details
              fetchAccountDetails(email, res, 'Account details created successfully');
            });
          } else {
            // Update existing profile
            const updateProfileQuery = `
              UPDATE user_profiles SET
                first_name = ?, middle_name = ?, last_name = ?, gender = ?,
                birth_date = ?, primary_phone = ?, home_phone = ?, email = ?,
                updated_at = CURRENT_TIMESTAMP
              WHERE user_id = ?
            `;

            const updateValues = [...profileValues.slice(1), userId]; // Remove user_id from values and add it at the end

            db.query(updateProfileQuery, updateValues, (err) => {
              if (err) {
                console.error('Error updating profile:', err);
                return res.status(500).json({ error: 'Failed to update profile' });
              }

              // Fetch the complete account details
              fetchAccountDetails(email, res, 'Account details updated successfully');
            });
          }
        });
      }
    });
  } catch (error) {
    console.error('Account details operation error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get Account Details by Email
router.get('/account-details/:email', authenticateToken, (req, res) => {
  try {
    const { email } = req.params;

    // Email format validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ 
        error: 'Please provide a valid email address' 
      });
    }

    fetchAccountDetails(email, res, 'Account details retrieved successfully');
  } catch (error) {
    console.error('Get account details error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Helper function to fetch complete account details with photo info
function fetchAccountDetailsWithPhoto(email, res, successMessage, uploadedPhotoInfo = null) {
  const getAccountQuery = `
    SELECT 
      u.id as user_id,
      u.email,
      u.first_name,
      u.middle_name,
      u.last_name,
      u.birth_date,
      u.gender,
      u.complete_address,
      u.city,
      u.state,
      u.country,
      u.zip_code,
      u.primary_phone,
      up.home_phone as secondary_phone,
      u.created_at,
      u.updated_at,
      CONCAT(u.first_name, 
             CASE WHEN u.middle_name IS NOT NULL THEN CONCAT(' ', u.middle_name) ELSE '' END,
             ' ', u.last_name) as full_name
    FROM users u
    LEFT JOIN user_profiles up ON u.id = up.user_id
    WHERE u.email = ?
  `;
  
  db.query(getAccountQuery, [email], (err, results) => {
    if (err) {
      console.error('Database error:', err);
      return res.status(500).json({ error: 'Database error' });
    }

    if (results.length === 0) {
      return res.status(404).json({ error: 'Account not found' });
    }

    const accountDetails = results[0];

    // Get profile picture
    const getProfilePictureQuery = `
      SELECT filename, file_path, original_name, created_at
      FROM user_images 
      WHERE email = ? AND image_type = 'profile_picture' AND is_active = TRUE
      ORDER BY created_at DESC 
      LIMIT 1
    `;

    db.query(getProfilePictureQuery, [email], (err, imageResults) => {
      if (err) {
        console.error('Error fetching profile picture:', err);
        // Continue without image
      }

      // Add profile picture info to account details
      if (uploadedPhotoInfo) {
        // Use the newly uploaded photo info
        accountDetails.profile_picture = uploadedPhotoInfo;
      } else if (imageResults && imageResults.length > 0) {
        accountDetails.profile_picture = {
          filename: imageResults[0].filename,
          file_path: imageResults[0].file_path,
          original_name: imageResults[0].original_name,
          uploaded_at: imageResults[0].created_at
        };
      } else {
        accountDetails.profile_picture = null;
      }

      res.json({
        message: successMessage,
        account_details: accountDetails
      });
    });
  });
}

// Helper function to fetch complete account details
function fetchAccountDetails(email, res, successMessage) {
  const getAccountQuery = `
    SELECT 
      u.id as user_id,
      u.email,
      u.first_name,
      u.middle_name,
      u.last_name,
      u.birth_date,
      u.gender,
      u.complete_address,
      u.city,
      u.state,
      u.country,
      u.zip_code,
      u.primary_phone,
      up.home_phone as secondary_phone,
      u.created_at,
      u.updated_at,
      CONCAT(u.first_name, 
             CASE WHEN u.middle_name IS NOT NULL THEN CONCAT(' ', u.middle_name) ELSE '' END,
             ' ', u.last_name) as full_name
    FROM users u
    LEFT JOIN user_profiles up ON u.id = up.user_id
    WHERE u.email = ?
  `;
  
  db.query(getAccountQuery, [email], (err, results) => {
    if (err) {
      console.error('Database error:', err);
      return res.status(500).json({ error: 'Database error' });
    }

    if (results.length === 0) {
      return res.status(404).json({ error: 'Account not found' });
    }

    const accountDetails = results[0];

    // Get profile picture
    const getProfilePictureQuery = `
      SELECT filename, file_path, original_name, created_at
      FROM user_images 
      WHERE email = ? AND image_type = 'profile_picture' AND is_active = TRUE
      ORDER BY created_at DESC 
      LIMIT 1
    `;

    db.query(getProfilePictureQuery, [email], (err, imageResults) => {
      if (err) {
        console.error('Error fetching profile picture:', err);
        // Continue without image
      }

      // Add profile picture info to account details
      if (imageResults && imageResults.length > 0) {
        accountDetails.profile_picture = {
          filename: imageResults[0].filename,
          file_path: imageResults[0].file_path,
          original_name: imageResults[0].original_name,
          uploaded_at: imageResults[0].created_at
        };
      } else {
        accountDetails.profile_picture = null;
      }

      res.json({
        message: successMessage,
        account_details: accountDetails
      });
    });
  });
}

// Deactivate Account
router.post('/deactivate-account', authenticateToken, (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ error: 'Email is required' });
    }

    // Email format validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ 
        error: 'Please provide a valid email address' 
      });
    }

    // Check if user exists
    const checkUserQuery = 'SELECT id FROM users WHERE email = ?';
    
    db.query(checkUserQuery, [email], (err, userResults) => {
      if (err) {
        console.error('Database error:', err);
        return res.status(500).json({ error: 'Database error' });
      }

      if (userResults.length === 0) {
        return res.status(404).json({ error: 'User not found' });
      }

      // Note: Instead of deleting, we could add an 'is_active' field to users table
      // For now, we'll just deactivate all images and keep user data
      const deactivateImagesQuery = `
        UPDATE user_images 
        SET is_active = FALSE 
        WHERE email = ?
      `;

      db.query(deactivateImagesQuery, [email], (err) => {
        if (err) {
          console.error('Error deactivating images:', err);
          return res.status(500).json({ error: 'Failed to deactivate account images' });
        }

        res.json({
          message: 'Account images deactivated successfully. Contact support for complete account deletion.',
          email: email,
          deactivated_at: new Date().toISOString()
        });
      });
    });
  } catch (error) {
    console.error('Deactivate account error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router; 