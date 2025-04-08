const jwt = require('jsonwebtoken');
const User = require('../models/User');
const errorResponse = require('../utils/errorResponse');

// Protect routes - require authentication
exports.protect = async (req, res, next) => {
  let token;

  // Get token from header
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    token = req.headers.authorization.split(' ')[1];
  }

  // Check if token exists
  if (!token) {
    return res.status(401).json(
      errorResponse('Not authorized to access this route', 401)
    );
  }

  try {
    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Get user from token
    const user = await User.findById(decoded.id);

    if (!user) {
      return res.status(401).json(
        errorResponse('User not found', 401)
      );
    }

    // Check if user is verified
    if (!user.isVerified) {
      return res.status(401).json(
        errorResponse('Please verify your email to access this resource', 401)
      );
    }

    // Add user to request object
    req.user = user;
    next();
  } catch (error) {
    return res.status(401).json(
      errorResponse('Not authorized to access this route', 401)
    );
  }
};

// Grant access to specific roles
exports.authorize = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return res.status(403).json(
        errorResponse(`User role ${req.user.role} is not authorized to access this route`, 403)
      );
    }
    next();
  };
};