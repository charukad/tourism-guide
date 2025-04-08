const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const authController = require('../../controllers/auth');
const validationMiddleware = require('../../middleware/validation');

// @route   POST /api/auth/register
// @desc    Register a new user
// @access  Public
router.post(
  '/register',
  [
    // Validation rules
    body('email').isEmail().withMessage('Please provide a valid email'),
    body('password')
      .isLength({ min: 6 })
      .withMessage('Password must be at least 6 characters long'),
    body('firstName').notEmpty().withMessage('First name is required'),
    body('lastName').notEmpty().withMessage('Last name is required'),
    body('role')
      .isIn(['tourist', 'guide', 'vehicleOwner'])
      .withMessage('Role must be either tourist, guide, or vehicleOwner'),
    // Apply validation middleware
    validationMiddleware,
  ],
  authController.register
);

// @route   POST /api/auth/login
// @desc    Login user and get token
// @access  Public
router.post(
  '/login',
  [
    // Validation rules
    body('email').isEmail().withMessage('Please provide a valid email'),
    body('password').notEmpty().withMessage('Password is required'),
    // Apply validation middleware
    validationMiddleware,
  ],
  authController.login
);

// @route   POST /api/auth/forgot-password
// @desc    Send password reset email
// @access  Public
router.post(
  '/forgot-password',
  [
    // Validation rules
    body('email').isEmail().withMessage('Please provide a valid email'),
    // Apply validation middleware
    validationMiddleware,
  ],
  authController.forgotPassword
);

// @route   POST /api/auth/reset-password
// @desc    Reset password with token
// @access  Public
router.post(
  '/reset-password',
  [
    // Validation rules
    body('token').notEmpty().withMessage('Token is required'),
    body('password')
      .isLength({ min: 6 })
      .withMessage('Password must be at least 6 characters long'),
    // Apply validation middleware
    validationMiddleware,
  ],
  authController.resetPassword
);

// @route   POST /api/auth/verify-email
// @desc    Verify email address
// @access  Public
router.post(
  '/verify-email',
  [
    // Validation rules
    body('token').notEmpty().withMessage('Token is required'),
    // Apply validation middleware
    validationMiddleware,
  ],
  authController.verifyEmail
);

// @route   POST /api/auth/refresh-token
// @desc    Refresh authentication token
// @access  Public
router.post(
  '/refresh-token',
  [
    // Validation rules
    body('refreshToken').notEmpty().withMessage('Refresh token is required'),
    // Apply validation middleware
    validationMiddleware,
  ],
  authController.refreshToken
);

module.exports = router;