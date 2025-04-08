const express = require('express');
const router = express.Router();

// Import API routes
const authRoutes = require('./api/auth');
const userRoutes = require('./api/users');
const touristRoutes = require('./api/tourists');
const guideRoutes = require('./api/guides');
const vehicleOwnerRoutes = require('./api/vehicleOwners');
const vehicleRoutes = require('./api/vehicles');
const locationRoutes = require('./api/locations');
const eventRoutes = require('./api/events');
const itineraryRoutes = require('./api/itineraries');
const bookingRoutes = require('./api/bookings');
const postRoutes = require('./api/posts');
const commentRoutes = require('./api/comments');
const reviewRoutes = require('./api/reviews');
const notificationRoutes = require('./api/notifications');
const alertRoutes = require('./api/alerts');
const messageRoutes = require('./api/messages');
const paymentRoutes = require('./api/payments');

// Use routes
router.use('/auth', authRoutes);
router.use('/users', userRoutes);
router.use('/tourists', touristRoutes);
router.use('/guides', guideRoutes);
router.use('/vehicle-owners', vehicleOwnerRoutes);
router.use('/vehicles', vehicleRoutes);
router.use('/locations', locationRoutes);
router.use('/events', eventRoutes);
router.use('/itineraries', itineraryRoutes);
router.use('/bookings', bookingRoutes);
router.use('/social/posts', postRoutes);
router.use('/social/comments', commentRoutes);
router.use('/reviews', reviewRoutes);
router.use('/notifications', notificationRoutes);
router.use('/alerts', alertRoutes);
router.use('/messages', messageRoutes);
router.use('/payments', paymentRoutes);

// API Health check route
router.get('/health', (req, res) => {
  res.status(200).json({
    status: 'success',
    message: 'API is running',
    timestamp: new Date(),
  });
});

module.exports = router;