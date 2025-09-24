import { Router } from 'express';
import { createPersonalProfile, updatePersonalProfile, deletePersonalProfile, createProfileAddress, updateProfileAddress, deleteProfileAddress, createProfileEducation, updateProfileEducation, deleteProfileEducation, createProfileEmployment, updateProfileEmployment, deleteProfileEmployment, createProfileProperty, updateProfileProperty, deleteProfileProperty, createFamilyReference, updateFamilyReference, deleteFamilyReference, createProfileLifestyle, updateProfileLifestyle, deleteProfileLifestyle, uploadProfilePhoto, createProfilePhoto, getPersonalProfile, getProfileAddress, getProfileEducation, getProfileEmployment, getProfileProperty, getFamilyReference, getProfileLifestyle, getProfileHobbies, addProfileHobby, removeProfileHobby, addProfileFamily, updateProfileFamily, deleteProfileFamily, searchProfiles, getUserPreferences, saveUserPreferences, createFavoriteProfile, getFavorites, deleteFavorite, trackProfileView, getProfilesByAccountId, getProfilePhotos, getCompleteProfile, getAllProfiles } from '../controllers/profile.controller';
import { validateApiKey } from '../middlewares/apiKey.middleware';
import { authenticateJWT } from '../middlewares/auth.middleware';

const router = Router();

router.post(
  '/personalDetails',
  validateApiKey,
  authenticateJWT,
  getPersonalProfile
);

router.post(
  '/addressDetails',
  validateApiKey,
  authenticateJWT,
  getProfileAddress
);

// modify the below
router.post(
  '/educationDetails',
  validateApiKey,
  authenticateJWT,
  getProfileEducation
);

router.post(
  '/employmentDetails',
  validateApiKey,
  authenticateJWT,
  getProfileEmployment
);

router.post(
  '/propertyDetails',
  validateApiKey,
  authenticateJWT,
  getProfileProperty
);

router.post(
  '/family-referenceDetails',
  validateApiKey,
  authenticateJWT,
  getFamilyReference
);

router.post(
  '/lifestyleDetails',
  validateApiKey,
  authenticateJWT,
  getProfileLifestyle
);



/**
 * @swagger
 * /profile/hobbiesDetails:
 *   post:
 *     summary: Get all hobbies for a profile
 *     tags: [Profile]
 *     security:
 *       - ApiKeyAuth: []
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               profile_id:
 *                 type: integer
 *     responses:
 *       200:
 *         description: List of hobbies
 *       400:
 *         description: Invalid request data
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Server error
 */
router.post(
  '/hobbiesDetails',
  validateApiKey,
  authenticateJWT,
  getProfileHobbies
);

/**
 * @swagger
 * /profile/hobby:
 *   post:
 *     summary: Add a hobby for a profile
 *     tags: [Profile]
 *     security:
 *       - ApiKeyAuth: []
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               profile_id:
 *                 type: integer
 *               hobby:
 *                 type: string
 *     responses:
 *       201:
 *         description: Hobby added successfully
 *       400:
 *         description: Invalid request data
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Server error
 */
router.post(
  '/hobby',
  validateApiKey,
  authenticateJWT,
  addProfileHobby
);

/**
 * @swagger
 * /profile/hobby:
 *   delete:
 *     summary: Remove a hobby for a profile
 *     tags: [Profile]
 *     security:
 *       - ApiKeyAuth: []
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               profile_id:
 *                 type: integer
 *               hobby:
 *                 type: string
 *     responses:
 *       200:
 *         description: Hobby removed successfully
 *       400:
 *         description: Invalid request data
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Server error
 */
router.delete(
  '/hobby',
  validateApiKey,
  authenticateJWT,
  removeProfileHobby
);

router.post(
  '/personalDetails',
  validateApiKey,
  authenticateJWT,
  getPersonalProfile
);

router.post(
  '/addressDetails',
  validateApiKey,
  authenticateJWT,
  getProfileAddress
);

// modify the below
router.post(
  '/educationDetails',
  validateApiKey,
  authenticateJWT,
  getProfileEducation
);

router.post(
  '/employmentDetails',
  validateApiKey,
  authenticateJWT,
  getProfileEmployment
);

router.post(
  '/propertyDetails',
  validateApiKey,
  authenticateJWT,
  getProfileProperty
);

router.post(
  '/family-referenceDetails',
  validateApiKey,
  authenticateJWT,
  getFamilyReference
);

router.post(
  '/lifestyleDetails',
  validateApiKey,
  authenticateJWT,
  getProfileLifestyle
);



/**
 * @swagger
 * /profile/hobbiesDetails:
 *   post:
 *     summary: Get all hobbies for a profile
 *     tags: [Profile]
 *     security:
 *       - ApiKeyAuth: []
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               profile_id:
 *                 type: integer
 *     responses:
 *       200:
 *         description: List of hobbies
 *       400:
 *         description: Invalid request data
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Server error
 */
router.post(
  '/hobbiesDetails',
  validateApiKey,
  authenticateJWT,
  getProfileHobbies
);

/**
 * @swagger
 * /profile/hobby:
 *   post:
 *     summary: Add a hobby for a profile
 *     tags: [Profile]
 *     security:
 *       - ApiKeyAuth: []
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               profile_id:
 *                 type: integer
 *               hobby:
 *                 type: string
 *     responses:
 *       201:
 *         description: Hobby added successfully
 *       400:
 *         description: Invalid request data
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Server error
 */
router.post(
  '/hobby',
  validateApiKey,
  authenticateJWT,
  addProfileHobby
);

/**
 * @swagger
 * /profile/hobby:
 *   delete:
 *     summary: Remove a hobby for a profile
 *     tags: [Profile]
 *     security:
 *       - ApiKeyAuth: []
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               profile_id:
 *                 type: integer
 *               hobby:
 *                 type: string
 *     responses:
 *       200:
 *         description: Hobby removed successfully
 *       400:
 *         description: Invalid request data
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Server error
 */
router.delete(
  '/hobby',
  validateApiKey,
  authenticateJWT,
  removeProfileHobby
);

router.post(
  '/personalDetails',
  validateApiKey,
  authenticateJWT,
  getPersonalProfile
);

router.post(
  '/addressDetails',
  validateApiKey,
  authenticateJWT,
  getProfileAddress
);

// modify the below
router.post(
  '/educationDetails',
  validateApiKey,
  authenticateJWT,
  getProfileEducation
);

router.post(
  '/employmentDetails',
  validateApiKey,
  authenticateJWT,
  getProfileEmployment
);

router.post(
  '/propertyDetails',
  validateApiKey,
  authenticateJWT,
  getProfileProperty
);

router.post(
  '/family-referenceDetails',
  validateApiKey,
  authenticateJWT,
  getFamilyReference
);

router.post(
  '/lifestyleDetails',
  validateApiKey,
  authenticateJWT,
  getProfileLifestyle
);



/**
 * @swagger
 * /profile/personal:
 *   post:
 *     summary: Create personal profile
 *     tags: [Profile]
 *     security:
 *       - ApiKeyAuth: []
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/ProfilePersonal'
 *     responses:
 *       201:
 *         description: Personal profile created successfully
 *       400:
 *         description: Invalid request data
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Server error
 */
router.post(
  '/personal',
  validateApiKey,
  authenticateJWT,
  createPersonalProfile
);

/**
 * @swagger
 * /profile/personal/{id}:
 *   put:
 *     summary: Update personal profile
 *     tags: [Profile]
 *     security:
 *       - ApiKeyAuth: []
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Profile ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/PersonalProfile'
 *     responses:
 *       200:
 *         description: Personal profile updated successfully
 *       400:
 *         description: Invalid request data
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Server error
 */
router.put(
  '/personal/:id',
  validateApiKey,
  authenticateJWT,
  updatePersonalProfile
);

/**
 * @swagger
 * /profile/personal/{id}:
 *   delete:
 *     summary: Delete personal profile
 *     tags: [Profile]
 *     security:
 *       - ApiKeyAuth: []
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Profile ID
 *     responses:
 *       200:
 *         description: Personal profile deleted successfully
 *       400:
 *         description: Invalid request data
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Server error
 */
router.delete(
  '/personal/:id',
  validateApiKey,
  authenticateJWT,
  deletePersonalProfile
);

/**
 * @swagger
 * /profile/address:
 *   post:
 *     summary: Create profile address
 *     tags: [Profile]
 *     security:
 *       - ApiKeyAuth: []
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/ProfileAddress'
 *     responses:
 *       201:
 *         description: Profile address created successfully
 *       400:
 *         description: Invalid request data
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Server error
 */
router.post(
  '/address',
  validateApiKey,
  authenticateJWT,
  createProfileAddress
);

/**
 * @swagger
 * /profile/address/{id}:
 *   put:
 *     summary: Update profile address
 *     tags: [Profile]
 *     security:
 *       - ApiKeyAuth: []
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Address ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/ProfileAddress'
 *     responses:
 *       200:
 *         description: Profile address updated successfully
 *       400:
 *         description: Invalid request data
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Server error
 */
router.put(
  '/address/:id',
  validateApiKey,
  authenticateJWT,
  updateProfileAddress
);

/**
 * @swagger
 * /profile/address/{id}:
 *   delete:
 *     summary: Delete profile address
 *     tags: [Profile]
 *     security:
 *       - ApiKeyAuth: []
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Address ID
 *       - in: query
 *         name: profile_id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Profile ID
 *     responses:
 *       200:
 *         description: Profile address deleted successfully
 *       400:
 *         description: Invalid request data
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Server error
 */
router.delete(
  '/address/:id',
  validateApiKey,
  authenticateJWT,
  deleteProfileAddress
);

/**
 * @swagger
 * /profile/education:
 *   post:
 *     summary: Create profile education
 *     tags: [Profile]
 *     security:
 *       - ApiKeyAuth: []
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/ProfileEducation'
 *     responses:
 *       201:
 *         description: Profile education created successfully
 *       400:
 *         description: Invalid request data
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Server error
 */
router.post(
  '/education',
  validateApiKey,
  authenticateJWT,
  createProfileEducation
);

/**
 * @swagger
 * /profile/education/{id}:
 *   put:
 *     summary: Update profile education
 *     tags: [Profile]
 *     security:
 *       - ApiKeyAuth: []
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Education ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/ProfileEducation'
 *     responses:
 *       200:
 *         description: Education updated successfully
 *       400:
 *         description: Invalid request data
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Server error
 */
router.put(
  '/education/:id',
  validateApiKey,
  authenticateJWT,
  updateProfileEducation
);

/**
 * @swagger
 * /profile/education/{id}:
 *   delete:
 *     summary: Delete profile education
 *     tags: [Profile]
 *     security:
 *       - ApiKeyAuth: []
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Education ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               profile_id:
 *                 type: integer
 *     responses:
 *       200:
 *         description: Education deleted successfully
 *       400:
 *         description: Invalid request data
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Server error
 */
router.delete(
  '/education/:id',
  validateApiKey,
  authenticateJWT,
  deleteProfileEducation
);

/**
 * @swagger
 * /profile/employment:
 *   post:
 *     summary: Create profile employment
 *     tags: [Profile]
 *     security:
 *       - ApiKeyAuth: []
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/ProfileEmployment'
 *     responses:
 *       201:
 *         description: Profile employment created successfully
 *       400:
 *         description: Invalid request data
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Server error
 */
router.post(
  '/employment',
  validateApiKey,
  authenticateJWT,
  createProfileEmployment
);

/**
 * @swagger
 * /profile/employment/{id}:
 *   put:
 *     summary: Update profile employment
 *     tags: [Profile]
 *     security:
 *       - ApiKeyAuth: []
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Employment ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/ProfileEmployment'
 *     responses:
 *       200:
 *         description: Employment updated successfully
 *       400:
 *         description: Invalid request data
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Server error
 */
router.put(
  '/employment/:id',
  validateApiKey,
  authenticateJWT,
  updateProfileEmployment
);

/**
 * @swagger
 * /profile/employment/{id}:
 *   delete:
 *     summary: Delete profile employment
 *     tags: [Profile]
 *     security:
 *       - ApiKeyAuth: []
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Employment ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               profile_id:
 *                 type: integer
 *     responses:
 *       200:
 *         description: Employment deleted successfully
 *       400:
 *         description: Invalid request data
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Server error
 */
router.delete(
  '/employment/:id',
  validateApiKey,
  authenticateJWT,
  deleteProfileEmployment
);

/**
 * @swagger
 * /profile/property:
 *   post:
 *     summary: Create profile property
 *     tags: [Profile]
 *     security:
 *       - ApiKeyAuth: []
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/ProfileProperty'
 *     responses:
 *       201:
 *         description: Profile property created successfully
 *       400:
 *         description: Invalid request data
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Server error
 */
router.post(
  '/property',
  validateApiKey,
  authenticateJWT,
  createProfileProperty
);

/**
 * @swagger
 * /profile/property/{id}:
 *   put:
 *     summary: Update profile property
 *     tags: [Profile]
 *     security:
 *       - ApiKeyAuth: []
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Property ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/ProfileProperty'
 *     responses:
 *       200:
 *         description: Property updated successfully
 *       400:
 *         description: Invalid request data
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Server error
 */
router.put(
  '/property/:id',
  validateApiKey,
  authenticateJWT,
  updateProfileProperty
);

/**
 * @swagger
 * /profile/property/{id}:
 *   delete:
 *     summary: Delete profile property
 *     tags: [Profile]
 *     security:
 *       - ApiKeyAuth: []
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Property ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               profile_id:
 *                 type: integer
 *     responses:
 *       200:
 *         description: Property deleted successfully
 *       400:
 *         description: Invalid request data
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Server error
 */
router.delete(
  '/property/:id',
  validateApiKey,
  authenticateJWT,
  deleteProfileProperty
);

/**
 * @swagger
 * /profile/family-reference:
 *   post:
 *     summary: Create family reference
 *     tags: [Profile]
 *     security:
 *       - ApiKeyAuth: []
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/ProfileFamilyReference'
 *     responses:
 *       201:
 *         description: Family reference created successfully
 *       400:
 *         description: Invalid request data
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Server error
 */
router.post(
  '/family-reference',
  validateApiKey,
  authenticateJWT,
  createFamilyReference
);

/**
 * @swagger
 * /profile/family-reference/{id}:
 *   put:
 *     summary: Update family reference
 *     tags: [Profile]
 *     security:
 *       - ApiKeyAuth: []
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Reference ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/ProfileFamilyReference'
 *     responses:
 *       200:
 *         description: Family reference updated successfully
 *       400:
 *         description: Invalid request data
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Server error
 */
router.put(
  '/family-reference/:id',
  validateApiKey,
  authenticateJWT,
  updateFamilyReference
);

/**
 * @swagger
 * /profile/family-reference/{id}:
 *   delete:
 *     summary: Delete family reference
 *     tags: [Profile]
 *     security:
 *       - ApiKeyAuth: []
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Reference ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               profile_id:
 *                 type: integer
 *     responses:
 *       200:
 *         description: Family reference deleted successfully
 *       400:
 *         description: Invalid request data
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Server error
 */
router.delete(
  '/family-reference/:id',
  validateApiKey,
  authenticateJWT,
  deleteFamilyReference
);

/**
 * @swagger
 * /profile/lifestyle:
 *   post:
 *     summary: Create profile lifestyle
 *     tags: [Profile]
 *     security:
 *       - ApiKeyAuth: []
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/ProfileLifestyle'
 *     responses:
 *       201:
 *         description: Profile lifestyle created successfully
 *       400:
 *         description: Invalid request data
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Server error
 */
router.post(
  '/lifestyle',
  validateApiKey,
  authenticateJWT,
  createProfileLifestyle
);

/**
 * @swagger
 * /profile/lifestyle/{id}:
 *   put:
 *     summary: Update profile lifestyle
 *     tags: [Profile]
 *     security:
 *       - ApiKeyAuth: []
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Lifestyle ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/ProfileLifestyle'
 *     responses:
 *       200:
 *         description: Lifestyle updated successfully
 *       400:
 *         description: Invalid request data
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Server error
 */
router.put(
  '/lifestyle/:id',
  validateApiKey,
  authenticateJWT,
  updateProfileLifestyle
);

/**
 * @swagger
 * /profile/lifestyle/{id}:
 *   delete:
 *     summary: Delete profile lifestyle
 *     tags: [Profile]
 *     security:
 *       - ApiKeyAuth: []
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Lifestyle ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               profile_id:
 *                 type: integer
 *     responses:
 *       200:
 *         description: Lifestyle deleted successfully
 *       400:
 *         description: Invalid request data
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Server error
 */
router.delete(
  '/lifestyle/:id',
  validateApiKey,
  authenticateJWT,
  deleteProfileLifestyle
);

/**
 * @swagger
 * /profile/photo:
 *   post:
 *     summary: Upload a profile photo
 *     description: Upload a profile photo with type (450=profile, 454=cover, 456=additional)
 *     tags: [Profile]
 *     security:
 *       - ApiKeyAuth: []
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             required:
 *               - profile_id
 *               - photo_type
 *               - photo
 *             properties:
 *               profile_id:
 *                 type: integer
 *                 description: The ID of the profile to attach the photo to
 *                 example: 123
 *               photo_type:
 *                 type: integer
 *                 description: Type of photo (1=profile, 2=cover, 3=additional)
 *                 enum: [1, 2, 3]
 *                 example: 1
 *               description:
 *                 type: string
 *                 description: Optional description of the photo
 *                 example: "Profile picture from summer vacation"
 *               caption:
 *                 type: string
 *                 description: Optional caption for the photo
 *                 example: "Summer 2023"
 *               photo:
 *                 type: string
 *                 format: binary
 *                 description: The image file to upload (JPEG, PNG, or WebP, max 5MB)
 *     responses:
 *       201:
 *         description: Photo uploaded successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: "Profile photo uploaded successfully"
 *                 data:
 *                   type: object
 *                   properties:
 *                     photo_id:
 *                       type: integer
 *                       example: 456
 *                     url:
 *                       type: string
 *                       example: "/uploads/accounts/abc123/profiles/123/photos/profile-1234567890.jpg"
 *       400:
 *         description: Invalid request or file
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       401:
 *         description: Unauthorized - Missing or invalid authentication
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       413:
 *         description: File too large (max 5MB)
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       415:
 *         description: Unsupported file type (only JPEG, PNG, WebP allowed)
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       500:
 *         description: Server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.post(
  '/photo',
  validateApiKey,
  authenticateJWT,
  uploadProfilePhoto,
  createProfilePhoto
);

// Get profile photos
router.get(
  '/photos/:profileId',
  validateApiKey,
  authenticateJWT,
  getProfilePhotos
);

/**
 * @swagger
 * /profile/family:
 *   post:
 *     summary: Add a family record for a profile
 *     tags: [Profile]
 *     security:
 *       - ApiKeyAuth: []
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               profile_id:
 *                 type: integer
 *               family:
 *                 type: object
 *     responses:
 *       201:
 *         description: Family record added successfully
 *       400:
 *         description: Invalid request data
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Server error
 */
router.post(
  '/family',
  validateApiKey,
  authenticateJWT,
  addProfileFamily
);

/**
 * @swagger
 * /profile/family:
 *   put:
 *     summary: Update a family record for a profile
 *     tags: [Profile]
 *     security:
 *       - ApiKeyAuth: []
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               profile_id:
 *                 type: integer
 *               family:
 *                 type: object
 *     responses:
 *       200:
 *         description: Family record updated successfully
 *       400:
 *         description: Invalid request data
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Server error
 */
router.put(
  '/family',
  validateApiKey,
  authenticateJWT,
  updateProfileFamily
);

/**
 * @swagger
 * /profile/family:
 *   delete:
 *     summary: Delete a family record for a profile
 *     tags: [Profile]
 *     security:
 *       - ApiKeyAuth: []
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               profile_id:
 *                 type: integer
 *               family_id:
 *                 type: integer
 *     responses:
 *       200:
 *         description: Family record deleted successfully
 *       400:
 *         description: Invalid request data
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Server error
 */
router.delete(
  '/family',
  validateApiKey,
  authenticateJWT,
  deleteProfileFamily
);

/**
 * @swagger
 * /profile/search:
 *   post:
 *     summary: Search profiles with filters
 *     tags: [Profile]
 *     security:
 *       - ApiKeyAuth: []
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               profile_id:
 *                 type: integer
 *                 description: Current user's profile ID
 *               min_age:
 *                 type: integer
 *                 description: Minimum age filter
 *               max_age:
 *                 type: integer
 *                 description: Maximum age filter
 *               religion:
 *                 type: integer
 *                 description: Religion ID filter
 *               max_education:
 *                 type: integer
 *                 description: Maximum education level filter
 *               occupation:
 *                 type: integer
 *                 description: Occupation ID filter
 *               country:
 *                 type: string
 *                 description: Country filter
 *               caste_id:
 *                 type: integer
 *                 description: Caste ID filter
 *               marital_status:
 *                 type: integer
 *                 description: Marital status filter
 *     responses:
 *       200:
 *         description: Profiles retrieved successfully
 *       400:
 *         description: Invalid request data
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Server error
 */
router.post(
  '/search',
  validateApiKey,
  authenticateJWT,
  searchProfiles
);

/**
 * @swagger
 * /profile/favorites:
 *   post:
 *     summary: Add or remove a profile from favorites
 *     tags: [Profile]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - favoriteProfileId
 *               - isFavorite
 *             properties:
 *               favoriteProfileId:
 *                 type: integer
 *                 description: ID of the profile to add/remove from favorites
 *               isFavorite:
 *                 type: boolean
 *                 description: Whether to add (true) or remove (false) from favorites
 *     responses:
 *       200:
 *         description: Favorite status updated successfully
 *       400:
 *         description: Invalid input
 *       500:
 *         description: Server error
 */
// router.post(
//   '/favorites',
//   validateApiKey,
//   authenticateJWT,
//   toggleFavoriteProfile
// );

/**
 * @swagger
 * /profile/search/preferences/{profileId}:
 *   get:
 *     summary: Get user search preferences
 *     tags: [Profile]
 *     security:
 *       - ApiKeyAuth: []
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: profileId
 *         required: true
 *         schema:
 *           type: integer
 *         description: Profile ID
 *     responses:
 *       200:
 *         description: User preferences retrieved successfully
 *       400:
 *         description: Invalid request data
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Server error
 */
router.get(
  '/search/preferences/:profileId',
  validateApiKey,
  authenticateJWT,
  getUserPreferences
);

/**
 * @swagger
 * /profile/favorites:
 *   get:
 *     summary: Get user's favorites
 *     tags: [Profile]
 *     security:
 *       - ApiKeyAuth: []
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: profileId
 *         required: true
 *         schema:
 *           type: integer
 *         description: Profile ID
 *     responses:
 *       200:
 *         description: Favorites retrieved successfully
 *       400:
 *         description: Invalid request data
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Server error
 */
router.post(
  '/favoriteList',
  validateApiKey,
  authenticateJWT,
  getFavorites
);

/**
 * @swagger
 * /profile/favorites:
 *   post:
 *     summary: Add or remove a profile from favorites
 *     tags: [Profile]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - profile_id
 *               - favorite_profile_id
 *               - is_favorite
 *             properties:
 *               profile_id:
 *                 type: integer
 *                 description: ID of the profile who is favoriting
 *               favorite_profile_id:
 *                 type: integer
 *                 description: ID of the profile being favorited
 *               is_favorite:
 *                 type: boolean
 *                 description: Whether to add (true) or remove (false) from favorites
 *     responses:
 *       200:
 *         description: Favorite status updated successfully
 *       400:
 *         description: Invalid input
 *       500:
 *         description: Server error
 */
router.post(
  '/favorites',
  validateApiKey,
  authenticateJWT,
  createFavoriteProfile
);

/**
 * @swagger
 * /profile/favorites/{profileId}/{favoriteProfileId}:
 *   delete:
 *     summary: Remove a profile from favorites
 *     tags: [Profile]
 *     security:
 *       - ApiKeyAuth: []
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: profileId
 *         required: true
 *         schema:
 *           type: integer
 *         description: Profile ID
 *       - in: path
 *         name: favoriteProfileId
 *         required: true
 *         schema:
 *           type: integer
 *         description: Favorite Profile ID
 *     responses:
 *       200:
 *         description: Favorite removed successfully
 *       400:
 *         description: Invalid request data
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Server error
 */
router.post(
  '/removeFavorites',
  validateApiKey,
  authenticateJWT,
  deleteFavorite
);

/**
 * @swagger
 * /profile/search/preferences:
 *   post:
 *     summary: Save user search preferences
 *     tags: [Profile]
 *     security:
 *       - ApiKeyAuth: []
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - profile_id
 *             properties:
 *               profile_id:
 *                 type: integer
 *                 description: Profile ID
 *               min_age:
 *                 type: integer
 *                 description: Minimum age preference
 *               max_age:
 *                 type: integer
 *                 description: Maximum age preference
 *               gender:
 *                 type: string
 *                 description: Gender preference
 *               location_preference:
 *                 type: string
 *                 description: Location preference
 *               distance_preference:
 *                 type: integer
 *                 description: Distance preference in kilometers
 *     responses:
 *       200:
 *         description: User preferences saved successfully
 *       400:
 *         description: Invalid request data
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Server error
 */
router.post(
  '/search/preferences',
  validateApiKey,
  authenticateJWT,
  saveUserPreferences
);

/**
 * @swagger
 * /profile/views:
 *   post:
 *     summary: Track when a user views another profile
 *     tags: [Profile]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - viewedProfileId
 *             properties:
 *               viewedProfileId:
 *                 type: integer
 *                 description: ID of the profile being viewed
 *     responses:
 *       200:
 *         description: Profile view tracked successfully
 *       400:
 *         description: Invalid input or user not authenticated
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Server error
 */
router.post(
  '/views',
  validateApiKey,
  authenticateJWT,
  trackProfileView
);

// Get profiles by account ID
router.get(
  '/account_profiles/:accountId',
  validateApiKey,
  authenticateJWT,
  getProfilesByAccountId
);

// Get complete profile data using eb_profile_get_complete_data
router.post(
  '/completeProfile',
  validateApiKey,
  authenticateJWT,
  getCompleteProfile
);

// Get all profiles using eb_profile_search_get_all
router.post(
  '/allProfiles',
  validateApiKey,
  authenticateJWT,
  getAllProfiles
);

export default router;