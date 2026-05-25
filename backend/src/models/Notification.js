const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Title is required'],
    trim: true,
    maxlength: [100, 'Title cannot exceed 100 characters'],
  },
  body: {
    type: String,
    required: [true, 'Body is required'],
    trim: true,
    maxlength: [500, 'Body cannot exceed 500 characters'],
  },
  // Image for rich notification
  image: {
    type: String,
    default: '',
  },
  // Target audience
  targetAudience: {
    type: String,
    enum: ['all', 'customers', 'vendors', 'specific_users'],
    default: 'all',
  },
  // Specific user IDs (if targetAudience is 'specific_users')
  targetUserIds: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  }],
  // Specific vendor IDs (if targetAudience is 'vendors' and want specific ones)
  targetVendorIds: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Vendor',
  }],
  // Navigation action when tapped
  actionType: {
    type: String,
    enum: ['none', 'order', 'restaurant', 'offer', 'url', 'screen'],
    default: 'none',
  },
  actionValue: {
    type: String,
    default: '',
  },
  // Delivery status
  status: {
    type: String,
    enum: ['draft', 'scheduled', 'sending', 'sent', 'failed'],
    default: 'draft',
  },
  // Schedule for later
  scheduledAt: {
    type: Date,
    default: null,
  },
  // Sent timestamp
  sentAt: {
    type: Date,
    default: null,
  },
  // Statistics
  stats: {
    sent: { type: Number, default: 0 },
    delivered: { type: Number, default: 0 },
    opened: { type: Number, default: 0 },
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
}, {
  timestamps: true,
});

notificationSchema.index({ status: 1, scheduledAt: 1 });
notificationSchema.index({ createdAt: -1 });

module.exports = mongoose.model('Notification', notificationSchema);
