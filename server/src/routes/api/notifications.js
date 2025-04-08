const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const notificationsController = require('../../controllers/notifications');
const { protect } = require('../../middleware/auth');
const validationMiddleware = require('../../middleware/validation');

// Protect all notification routes
router.use(protect);

// @route   GET /api/notifications
// @desc    Get all notifications for the logged-in user
// @access  Private
router.get('/', notificationsController.getNotifications);

// @route   GET /api/notifications/unread-count
// @desc    Get unread notification count
// @access  Private
router.get('/unread-count', notificationsController.getUnreadCount);

// @route   PUT /api/notifications/:id/read
// @desc    Mark a notification as read
// @access  Private
router.put('/:id/read', notificationsController.markAsRead);

// @route   PUT /api/notifications/read-all
// @desc    Mark all notifications as read
// @access  Private
router.put('/read-all', notificationsController.markAllAsRead);

// @route   DELETE /api/notifications/:id
// @desc    Delete a notification
// @access  Private
router.delete('/:id', notificationsController.deleteNotification);

// @route   PUT /api/notifications/settings
// @desc    Update notification settings
// @access  Private
router.put(
  '/settings',
  [
    body('email').isBoolean().optional(),
    body('push').isBoolean().optional(),
    body('sms').isBoolean().optional(),
    validationMiddleware
  ],
  notificationsController.updateSettings
);

module.exports = router;