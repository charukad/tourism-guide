const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');
const User = require('../models/User');
const Tourist = require('../models/Tourist');
const Guide = require('../models/Guide');
const VehicleOwner = require('../models/VehicleOwner');
const emailService = require('../services/email');
const errorResponse = require('../utils/errorResponse');

// Generate JWT Token
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN,
  });
};

// Generate Refresh Token
const generateRefreshToken = (id) => {
  return jwt.sign({ id }, process.env.REFRESH_TOKEN_SECRET, {
    expiresIn: process.env.REFRESH_TOKEN_EXPIRES_IN,
  });
};

// @desc    Register user
// @route   POST /api/auth/register
// @access  Public
exports.register = async (req, res, next) => {
  try {
    const { email, password, firstName, lastName, role, phoneNumber } = req.body;

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json(
        errorResponse('User with this email already exists', 400)
      );
    }

    // Create verification token
    const verificationToken = crypto.randomBytes(20).toString('hex');
    const verificationTokenExpires = Date.now() + 24 * 60 * 60 * 1000; // 24 hours

    // Create user
    const user = await User.create({
      email,
      password,
      firstName,
      lastName,
      role,
      phoneNumber,
      verificationToken,
      verificationTokenExpires,
    });

    // Create role-specific profile
    let profileData = {
      userId: user._id,
    };

    switch (role) {
      case 'tourist':
        await Tourist.create(profileData);
        break;
      case 'guide':
        await Guide.create(profileData);
        break;
      case 'vehicleOwner':
        await VehicleOwner.create(profileData);
        break;
      default:
        break;
    }

    // Send verification email
    try {
      await emailService.sendVerificationEmail(
        user.email,
        user.firstName,
        verificationToken
      );
    } catch (error) {
      console.error('Error sending verification email:', error);
      // Continue with the registration process even if email fails
    }

    res.status(201).json({
      status: 'success',
      message: 'User registered successfully. Please verify your email.',
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json(
      errorResponse('Server error during registration.', 500)
    );
  }
};

// @desc    Login user
// @route   POST /api/auth/login
// @access  Public
exports.login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    // Check if user exists
    const user = await User.findOne({ email }).select('+password');
    if (!user) {
      return res.status(401).json(
        errorResponse('Invalid credentials', 401)
      );
    }

    // Check if password matches
    const isMatch = await user.matchPassword(password);
    if (!isMatch) {
      return res.status(401).json(
        errorResponse('Invalid credentials', 401)
      );
    }

    // DEVELOPMENT MODIFICATION: Email verification check commented out
    // In production, uncomment this block to enforce email verification
    /*
    // Check if email is verified
    if (!user.isVerified) {
      return res.status(401).json(
        errorResponse('Please verify your email before logging in', 401)
      );
    }
    */

    // Generate tokens
    const token = generateToken(user._id);
    const refreshToken = generateRefreshToken(user._id);

    // Save refresh token to user
    user.refreshToken = refreshToken;
    await user.save();

    // Remove password from response
    user.password = undefined;

    res.status(200).json({
      status: 'success',
      token,
      refreshToken,
      user: {
        id: user._id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        role: user.role,
        profileImage: user.profileImage,
        isVerified: user.isVerified,
      },
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json(
      errorResponse('Server error during login.', 500)
    );
  }
};

// @desc    Verify email address
// @route   POST /api/auth/verify-email
// @access  Public
exports.verifyEmail = async (req, res, next) => {
  try {
    const { token } = req.body;

    // Find user with this verification token
    const user = await User.findOne({
      verificationToken: token,
      verificationTokenExpires: { $gt: Date.now() },
    });

    if (!user) {
      return res.status(400).json(
        errorResponse('Invalid or expired verification token', 400)
      );
    }

    // Update user verification status
    user.isVerified = true;
    user.verificationToken = undefined;
    user.verificationTokenExpires = undefined;
    await user.save();

    res.status(200).json({
      status: 'success',
      message: 'Email verified successfully. You can now log in.',
    });
  } catch (error) {
    console.error('Email verification error:', error);
    res.status(500).json(
      errorResponse('Server error during email verification', 500)
    );
  }
};

// @desc    Forgot password
// @route   POST /api/auth/forgot-password
// @access  Public
exports.forgotPassword = async (req, res, next) => {
  try {
    const user = await User.findOne({ email: req.body.email });

    if (!user) {
      return res.status(404).json(
        errorResponse('User not found with this email', 404)
      );
    }

    // Generate reset token
    const resetToken = crypto.randomBytes(20).toString('hex');
    user.resetPasswordToken = resetToken;
    user.resetPasswordExpires = Date.now() + 3600000; // 1 hour

    await user.save();

    // Send password reset email
    try {
      await emailService.sendPasswordResetEmail(
        user.email,
        user.firstName,
        resetToken
      );

      res.status(200).json({
        status: 'success',
        message: 'Password reset email sent',
      });
    } catch (error) {
      user.resetPasswordToken = undefined;
      user.resetPasswordExpires = undefined;
      await user.save();

      return res.status(500).json(
        errorResponse('Error sending password reset email', 500)
      );
    }
  } catch (error) {
    console.error('Forgot password error:', error);
    res.status(500).json(
      errorResponse('Server error during password reset request', 500)
    );
  }
};

// @desc    Reset password
// @route   POST /api/auth/reset-password
// @access  Public
exports.resetPassword = async (req, res, next) => {
  try {
    // Find user by reset token and check if it's expired
    const user = await User.findOne({
      resetPasswordToken: req.body.token,
      resetPasswordExpires: { $gt: Date.now() },
    });

    if (!user) {
      return res.status(400).json(
        errorResponse('Invalid or expired reset token', 400)
      );
    }

    // Set new password
    user.password = req.body.password;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;

    await user.save();

    // Send confirmation email
    try {
      await emailService.sendPasswordChangeConfirmation(
        user.email,
        user.firstName
      );
    } catch (error) {
      console.error('Error sending password change confirmation:', error);
      // Continue with password reset even if email fails
    }

    res.status(200).json({
      status: 'success',
      message: 'Password has been reset successfully',
    });
  } catch (error) {
    console.error('Reset password error:', error);
    res.status(500).json(
      errorResponse('Server error during password reset', 500)
    );
  }
};

// @desc    Refresh authentication token
// @route   POST /api/auth/refresh-token
// @access  Public
exports.refreshToken = async (req, res, next) => {
  try {
    const { refreshToken } = req.body;

    if (!refreshToken) {
      return res.status(401).json(
        errorResponse('Refresh token is required', 401)
      );
    }

    // Verify refresh token
    let decoded;
    try {
      decoded = jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET);
    } catch (error) {
      return res.status(401).json(
        errorResponse('Invalid refresh token', 401)
      );
    }

    // Find user with this refresh token
    const user = await User.findOne({
      _id: decoded.id,
      refreshToken: refreshToken,
    });

    if (!user) {
      return res.status(401).json(
        errorResponse('Refresh token not found or user not found', 401)
      );
    }

    // Generate new tokens
    const newToken = generateToken(user._id);
    const newRefreshToken = generateRefreshToken(user._id);

    // Update refresh token in database
    user.refreshToken = newRefreshToken;
    await user.save();

    res.status(200).json({
      status: 'success',
      token: newToken,
      refreshToken: newRefreshToken,
    });
  } catch (error) {
    console.error('Refresh token error:', error);
    res.status(500).json(
      errorResponse('Server error during token refresh', 500)
    );
  }
};

// @desc    Get current user profile
// @route   GET /api/auth/me
// @access  Private
exports.getMe = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id);

    res.status(200).json({
      status: 'success',
      data: {
        user: {
          id: user._id,
          firstName: user.firstName,
          lastName: user.lastName,
          email: user.email,
          role: user.role,
          profileImage: user.profileImage,
          isVerified: user.isVerified,
          phoneNumber: user.phoneNumber,
          preferredLanguage: user.preferredLanguage,
          notificationSettings: user.notificationSettings,
          createdAt: user.createdAt,
        }
      }
    });
  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json(
      errorResponse('Server error retrieving user profile', 500)
    );
  }
};