import { Router } from 'express';
import { createPersonalProfile, createProfileAddress, createProfileEducation, createProfileEmployment, createProfileProperty, createFamilyReference, createProfileLifestyle, uploadProfilePhoto, createProfilePhoto, getPersonalProfile, getProfileAddress, getProfileEducation, getProfileEmployment, getProfileProperty, getFamilyReference, getProfileLifestyle, getProfileHobbies, addProfileHobby, removeProfileHobby, addProfileFamily, updateProfileFamily, deleteProfileFamily } from '../controllers/profile.controller';
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
 * /profile/photo:
 *   post:
 *     summary: Upload profile photo
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
 *             properties:
 *               profile_id:
 *                 type: integer
 *               photo_type:
 *                 type: integer
 *               description:
 *                 type: string
 *               caption:
 *                 type: string
 *               photo:
 *                 type: string
 *                 format: binary
 *     responses:
 *       201:
 *         description: Profile photo uploaded successfully
 *       400:
 *         description: Invalid request data
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Server error
 */
router.post(
  '/photo',
  validateApiKey,
  authenticateJWT,
  uploadProfilePhoto,
  createProfilePhoto
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

export default router;