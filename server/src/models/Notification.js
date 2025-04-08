const mongoose = require('mongoose');

const NotificationSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true // Add index for faster queries
    },
    type: {
      type: String,
      enum: [
        'booking_request',
        'booking_confirmation',
        'booking_cancellation',
        'payment_received',
        'payment_refund',
        'review_received',
        'message_received',
        'itinerary_update',
        'weather_alert',
        'safety_alert',
        'event_reminder',
        'guide_verification',
        'vehicle_verification',
        'system_message'
      ],
      required: true
    },
    title: {
      type: String,
      required: true
    },
    message: {
      type: String,
      required: true
    },
    isRead: {
      type: Boolean,
      default: false
    },
    data: {
      // Additional data specific to notification type
      // e.g., bookingId, guideId, locationId, etc.
      type: mongoose.Schema.Types.Mixed
    },
    priority: {
      type: String,
      enum: ['low', 'medium', 'high'],
      default: 'medium'
    },
    expiresAt: {
      // Optional expiration date for time-sensitive notifications
      type: Date
    }
  },
  {
    timestamps: true
  }
);

// Index for querying unread notifications efficiently
NotificationSchema.index({ userId: 1, isRead: 1 });

// Index for expiring notifications
NotificationSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

// Method to mark as read
NotificationSchema.methods.markAsRead = async function() {
  this.isRead = true;
  return this.save();
};

// Static method to create a new notification
NotificationSchema.statics.createNotification = async function(data) {
  const notification = new this(data);
  await notification.save();
  return notification;
};

// Static method to get unread notifications for user
NotificationSchema.statics.getUnreadForUser = async function(userId, limit = 20) {
  return this.find({ userId, isRead: false })
    .sort({ createdAt: -1 })
    .limit(limit);
};

// Static method to mark all as read for user
NotificationSchema.statics.markAllAsReadForUser = async function(userId) {
  return this.updateMany(
    { userId, isRead: false },
    { isRead: true }
  );
};

module.exports = mongoose.model('Notification', NotificationSchema);