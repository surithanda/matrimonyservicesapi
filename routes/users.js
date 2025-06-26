const express = require('express');
const db = require('../config/database');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();

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

module.exports = router; 