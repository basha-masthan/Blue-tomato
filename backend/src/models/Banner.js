const mongoose = require('mongoose');

const bannerSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Banner title is required'],
    trim: true,
    maxlength: [100, 'Title cannot exceed 100 characters'],
  },
  subtitle: {
    type: String,
    trim: true,
    default: '',
    maxlength: [200, 'Subtitle cannot exceed 200 characters'],
  },
  image: {
    type: String,
    required: [true, 'Banner image URL is required'],
    trim: true,
  },
  // Target screen/screen to navigate when tapped
  actionType: {
    type: String,
    enum: ['none', 'restaurant', 'category', 'url', 'screen'],
    default: 'none',
  },
  actionValue: {
    type: String,
    default: '', // restaurantId, category name, URL, or screen name
  },
  // Which app this banner is for
  targetApp: {
    type: String,
    enum: ['user', 'vendor', 'both'],
    default: 'user',
  },
  // Display order (lower number = first)
  sortOrder: {
    type: Number,
    default: 0,
  },
  isActive: {
    type: Boolean,
    default: true,
  },
  // Schedule
  startDate: {
    type: Date,
    default: null,
  },
  endDate: {
    type: Date,
    default: null,
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
}, {
  timestamps: true,
});

bannerSchema.index({ targetApp: 1, isActive: 1, sortOrder: 1 });

module.exports = mongoose.model('Banner', bannerSchema);
