const express = require('express');
const router = express.Router();

// Import API routes
const authRoutes = require('./api/auth');
const userRoutes = require('./api/users');
const touristRoutes = require('./api/tourists');

// Use routes
router.use('/auth', authRoutes);
router.use('/users', userRoutes);
router.use('/tourists', touristRoutes);

// API Health check route
router.get('/health', (req, res) => {
  res.status(200).json({
    status: 'success',
    message: 'API is running',
    timestamp: new Date(),
  });
});

module.exports = router;