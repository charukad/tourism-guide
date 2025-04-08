const Notification = require('../models/Notification');
const errorResponse = require('../utils/errorResponse');

/**
 * @desc    Get all notifications for the logged-in user
 * @route   GET /api/notifications
 * @access  Private
 */
exports.getNotifications = async (req, res) => {
  try {
    // Extract query parameters for pagination
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 20;
    const skipIndex = (page - 1) * limit;
    
    // Extract filter parameters
    const { read, type, priority } = req.query;
    
    // Build query based on filters
    let query = { userId: req.user._id };
    
    if (read !== undefined) {
      query.isRead = read === 'true';
    }
    
    if (type) {
      query.type = type;
    }
    
    if (priority) {
      query.priority = priority;
    }
    
    // Count total notifications matching the query
    const total = await Notification.countDocuments(query);
    
    // Find notifications with pagination
    const notifications = await Notification.find(query)
      .sort({ createdAt: -1 })
      .limit(limit)
      .skip(skipIndex);
    
    // Calculate pagination information
    const totalPages = Math.ceil(total / limit);
    
    res.status(200).json({
      status: 'success',
      data: {
        count: notifications.length,
        total,
        pagination: {
          currentPage: page,
          totalPages,
          hasNext: page < totalPages,
          hasPrev: page > 1
        },
        notifications
      }
    });
  } catch (error) {
    console.error('Error getting notifications:', error);
    res.status(500).json(errorResponse('Server error while fetching notifications', 500));
  }
};

/**
 * @desc    Get unread notification count
 * @route   GET /api/notifications/unread-count
 * @access  Private
 */
exports.getUnreadCount = async (req, res) => {
  try {
    const count = await Notification.countDocuments({
      userId: req.user._id,
      isRead: false
    });
    
    res.status(200).json({
      status: 'success',
      data: { count }
    });
  } catch (error) {
    console.error('Error getting unread count:', error);
    res.status(500).json(errorResponse('Server error while fetching unread count', 500));
  }
};

/**
 * @desc    Mark a notification as read
 * @route   PUT /api/notifications/:id/read
 * @access  Private
 */
exports.markAsRead = async (req, res) => {
  try {
    const notification = await Notification.findById(req.params.id);
    
    if (!notification) {
      return res.status(404).json(errorResponse('Notification not found', 404));
    }
    
    // Check if notification belongs to user
    if (notification.userId.toString() !== req.user._id.toString()) {
      return res.status(403).json(errorResponse('Not authorized to access this notification', 403));
    }
    
    // Mark as read
    notification.isRead = true;
    await notification.save();
    
    res.status(200).json({
      status: 'success',
      data: { notification }
    });
  } catch (error) {
    console.error('Error marking notification as read:', error);
    res.status(500).json(errorResponse('Server error while updating notification', 500));
  }
};

/**
 * @desc    Mark all notifications as read
 * @route   PUT /api/notifications/read-all
 * @access  Private
 */
exports.markAllAsRead = async (req, res) => {
  try {
    const result = await Notification.updateMany(
      { userId: req.user._id, isRead: false },
      { isRead: true }
    );
    
    res.status(200).json({
      status: 'success',
      data: {
        modifiedCount: result.modifiedCount
      }
    });
  } catch (error) {
    console.error('Error marking all notifications as read:', error);
    res.status(500).json(errorResponse('Server error while updating notifications', 500));
  }
};

/**
 * @desc    Delete a notification
 * @route   DELETE /api/notifications/:id
 * @access  Private
 */
exports.deleteNotification = async (req, res) => {
  try {
    const notification = await Notification.findById(req.params.id);
    
    if (!notification) {
      return res.status(404).json(errorResponse('Notification not found', 404));
    }
    
    // Check if notification belongs to user
    if (notification.userId.toString() !== req.user._id.toString()) {
      return res.status(403).json(errorResponse('Not authorized to delete this notification', 403));
    }
    
    await notification.deleteOne();
    
    res.status(200).json({
      status: 'success',
      data: null
    });
  } catch (error) {
    console.error('Error deleting notification:', error);
    res.status(500).json(errorResponse('Server error while deleting notification', 500));
  }
};

/**
 * @desc    Update notification settings
 * @route   PUT /api/notifications/settings
 * @access  Private
 */
exports.updateSettings = async (req, res) => {
  try {
    const { email, push, sms } = req.body;
    
    // Update user notification settings
    const user = req.user;
    user.notificationSettings = {
      email: email !== undefined ? email : user.notificationSettings.email,
      push: push !== undefined ? push : user.notificationSettings.push,
      sms: sms !== undefined ? sms : user.notificationSettings.sms
    };
    
    await user.save();
    
    res.status(200).json({
      status: 'success',
      data: {
        notificationSettings: user.notificationSettings
      }
    });
  } catch (error) {
    console.error('Error updating notification settings:', error);
    res.status(500).json(errorResponse('Server error while updating notification settings', 500));
  }
};