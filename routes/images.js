const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { v4: uuidv4 } = require('uuid');
const db = require('../config/database');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    // Default to temporary uploads directory - we'll move the file later
    const tempUploadPath = './uploads/temp/';
    
    // Create directory if it doesn't exist
    if (!fs.existsSync(tempUploadPath)) {
      fs.mkdirSync(tempUploadPath, { recursive: true });
    }
    
    cb(null, tempUploadPath);
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + uuidv4();
    const extension = path.extname(file.originalname);
    cb(null, file.fieldname + '-' + uniqueSuffix + extension);
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

// Upload image endpoint
router.post('/upload', authenticateToken, upload.single('image'), (req, res) => {
  try {
    const { email, image_type } = req.body;
    if (!email) {
      return res.status(400).json({ error: 'Email is required' });
    }
    
    if (!image_type || !['profile_picture', 'cover_photo', 'individual_picture'].includes(image_type)) {
      return res.status(400).json({ 
        error: 'Valid image_type is required (profile_picture, cover_photo, or individual_picture)' 
      });
    }
    
    if (!req.file) {
      return res.status(400).json({ error: 'No image file uploaded' });
    }
    
    // Email format validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ 
        error: 'Please provide a valid email address' 
      });
    }

    // Determine the correct destination folder based on image_type
    let destinationFolder;
    switch (image_type) {
      case 'profile_picture':
        destinationFolder = './uploads/profile-pictures/';
        break;
      case 'cover_photo':
        destinationFolder = './uploads/cover-photos/';
        break;
      case 'individual_picture':
        destinationFolder = './uploads/individual-pictures/';
        break;
      default:
        destinationFolder = './uploads/individual-pictures/';
    }

    // Create destination directory if it doesn't exist
    if (!fs.existsSync(destinationFolder)) {
      fs.mkdirSync(destinationFolder, { recursive: true });
    }

    // Move file from temp to correct destination
    const tempPath = req.file.path;
    const finalPath = path.join(destinationFolder, req.file.filename);
    
    try {
      fs.renameSync(tempPath, finalPath);
      // Update req.file.path to the new location
      req.file.path = finalPath;
    } catch (moveError) {
      console.error('Error moving file:', moveError);
      return res.status(500).json({ error: 'Failed to move uploaded file' });
    }
    
    // For profile picture and cover photo, deactivate existing ones
    if (image_type === 'profile_picture' || image_type === 'cover_photo') {
      const deactivateQuery = `
        UPDATE user_images 
        SET is_active = FALSE 
        WHERE email = ? AND image_type = ?
      `;
      
      db.query(deactivateQuery, [email, image_type], (err) => {
        if (err) {
          console.error('Error deactivating existing images:', err);
        }
      });
    }
    
    // Save image info to database
    const insertImageQuery = `
      INSERT INTO user_images (
        email, image_type, filename, original_name, 
        file_path, file_size, mime_type
      ) VALUES (?, ?, ?, ?, ?, ?, ?)
    `;
    
    const values = [
      email,
      image_type,
      req.file.filename,
      req.file.originalname,
      req.file.path,
      req.file.size,
      req.file.mimetype
    ];
    
    db.query(insertImageQuery, values, (err, result) => {
      if (err) {
        console.error('Database error:', err);
        return res.status(500).json({ error: 'Failed to save image information' });
      }
      
      res.status(201).json({
        message: 'Image uploaded successfully',
        image: {
          id: result.insertId,
          email: email,
          image_type: image_type,
          filename: req.file.filename,
          original_name: req.file.originalname,
          file_size: req.file.size,
          mime_type: req.file.mimetype,
          upload_path: req.file.path
        }
      });
    });
    
  } catch (error) {
    console.error('Upload error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get images by email and type
router.get('/user/:email', authenticateToken, (req, res) => {
  try {
    const { email } = req.params;
    const { image_type } = req.query;
    
    // Email format validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ 
        error: 'Please provide a valid email address' 
      });
    }
    
    let query = `
      SELECT id, email, image_type, filename, original_name, 
             file_path, file_size, mime_type, created_at 
      FROM user_images 
      WHERE email = ? AND is_active = TRUE
    `;
    let queryParams = [email];
    
    if (image_type && ['profile_picture', 'cover_photo', 'individual_picture'].includes(image_type)) {
      query += ' AND image_type = ?';
      queryParams.push(image_type);
    }
    
    query += ' ORDER BY created_at DESC';
    
    db.query(query, queryParams, (err, results) => {
      if (err) {
        console.error('Database error:', err);
        return res.status(500).json({ error: 'Database error' });
      }
      
      // Group images by type
      const groupedImages = {
        profile_picture: [],
        cover_photo: [],
        individual_pictures: []
      };
      
      results.forEach(image => {
        if (image.image_type === 'individual_picture') {
          groupedImages.individual_pictures.push(image);
        } else {
          groupedImages[image.image_type].push(image);
        }
      });
      
      res.json({
        message: 'Images retrieved successfully',
        email: email,
        images: groupedImages,
        total_count: results.length
      });
    });
    
  } catch (error) {
    console.error('Get images error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Delete image by ID
router.delete('/:imageId', authenticateToken, (req, res) => {
  try {
    const { imageId } = req.params;
    const { email } = req.body;
    
    if (!email) {
      return res.status(400).json({ error: 'Email is required' });
    }
    
    // Get image info first
    const getImageQuery = 'SELECT * FROM user_images WHERE id = ? AND email = ? AND is_active = TRUE';
    
    db.query(getImageQuery, [imageId, email], (err, results) => {
      if (err) {
        console.error('Database error:', err);
        return res.status(500).json({ error: 'Database error' });
      }
      
      if (results.length === 0) {
        return res.status(404).json({ error: 'Image not found' });
      }
      
      const image = results[0];
      
      // Delete from database
      const deleteQuery = 'UPDATE user_images SET is_active = FALSE WHERE id = ? AND email = ?';
      
      db.query(deleteQuery, [imageId, email], (err, result) => {
        if (err) {
          console.error('Database error:', err);
          return res.status(500).json({ error: 'Failed to delete image' });
        }
        
        // Optionally delete the actual file
        try {
          if (fs.existsSync(image.file_path)) {
            fs.unlinkSync(image.file_path);
          }
        } catch (fileErr) {
          console.error('Error deleting file:', fileErr);
          // Don't fail the request if file deletion fails
        }
        
        res.json({
          message: 'Image deleted successfully',
          deleted_image: {
            id: image.id,
            filename: image.filename,
            image_type: image.image_type
          }
        });
      });
    });
    
  } catch (error) {
    console.error('Delete image error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Serve uploaded images
router.get('/file/:filename', (req, res) => {
  try {
    const { filename } = req.params;
    const { type } = req.query; // profile_picture, cover_photo, individual_picture
    
    let imagePath;
    
    switch (type) {
      case 'profile_picture':
        imagePath = path.join(__dirname, '../uploads/profile-pictures/', filename);
        break;
      case 'cover_photo':
        imagePath = path.join(__dirname, '../uploads/cover-photos/', filename);
        break;
      case 'individual_picture':
        imagePath = path.join(__dirname, '../uploads/individual-pictures/', filename);
        break;
      default:
        // Try to find the file in all directories
        const possiblePaths = [
          path.join(__dirname, '../uploads/profile-pictures/', filename),
          path.join(__dirname, '../uploads/cover-photos/', filename),
          path.join(__dirname, '../uploads/individual-pictures/', filename)
        ];
        
        imagePath = possiblePaths.find(p => fs.existsSync(p));
    }
    
    if (!imagePath || !fs.existsSync(imagePath)) {
      return res.status(404).json({ error: 'Image not found' });
    }
    
    res.sendFile(imagePath);
    
  } catch (error) {
    console.error('Serve image error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router; 