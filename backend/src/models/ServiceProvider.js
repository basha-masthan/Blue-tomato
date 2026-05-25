const mongoose = require('mongoose');

// ─────────────────────────────────────────────
// Sub-schema: Availability Schedule
// ─────────────────────────────────────────────
const scheduleSlotSchema = new mongoose.Schema(
  {
    day: {
      type: String,
      enum: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'],
    },
    startTime: { type: String, default: '08:00' }, // HH:MM 24h
    endTime:   { type: String, default: '20:00' },
    isOff:     { type: Boolean, default: false },
  },
  { _id: false }
);

// ─────────────────────────────────────────────
// Main Schema: ServiceProvider
// ─────────────────────────────────────────────
const serviceProviderSchema = new mongoose.Schema(
  {
    // ── Link to User account ──────────────────
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'User reference is required'],
      unique: true,
    },

    // ── Identity / Profile ────────────────────
    displayName: {
      type: String,
      required: [true, 'Display name is required'],
      trim: true,
      maxlength: [80, 'Name cannot exceed 80 characters'],
    },

    bio: {
      type: String,
      trim: true,
      default: '',
      maxlength: [400, 'Bio cannot exceed 400 characters'],
    },

    profilePic: { type: String, default: '' },

    // ── Specializations ───────────────────────
    // e.g. ['Plumbing', 'Electrical', 'Carpentry']
    specializations: {
      type: [String],
      default: [],
    },

    // ── Experience ────────────────────────────
    experienceYears: {
      type: Number,
      default: 0,
      min: 0,
    },

    // ── Ratings ───────────────────────────────
    rating: {
      type: Number,
      min: 0,
      max: 5,
      default: 0,
    },
    totalRatingsCount: { type: Number, default: 0 },
    completedJobs:     { type: Number, default: 0 },

    // ── Location / Service Area ───────────────
    location: {
      type: {
        type: String,
        enum: ['Point'],
        default: 'Point',
      },
      coordinates: { type: [Number], default: [0, 0] }, // [lng, lat]
    },
    serviceCity:   { type: String, trim: true, default: '' },
    serviceRadius: { type: Number, default: 15 }, // km radius they serve

    // ── Availability ──────────────────────────
    isAvailableNow: { type: Boolean, default: true },
    schedule: {
      type: [scheduleSlotSchema],
      default: [],
    },

    // ── Verification ──────────────────────────
    isVerified:     { type: Boolean, default: false }, // admin verified provider
    isActive:       { type: Boolean, default: true },
    isOnboarded:    { type: Boolean, default: false }, // completed profile setup

    // ── Documents (verification) ──────────────
    govIdType:      { type: String, enum: ['aadhaar', 'pan', 'passport', 'dl', ''], default: '' },
    govIdUrl:       { type: String, default: '' },

    // ── Bank / Payout ─────────────────────────
    bankAccount: {
      accountNumber: { type: String, default: '' },
      ifsc:          { type: String, default: '' },
      accountHolder: { type: String, default: '' },
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// ─────────────────────────────────────────────
// Indexes
// ─────────────────────────────────────────────
serviceProviderSchema.index({ 'location': '2dsphere' });
serviceProviderSchema.index({ specializations: 1, isAvailableNow: 1, isVerified: 1 });
serviceProviderSchema.index({ rating: -1, completedJobs: -1 });

// ─────────────────────────────────────────────
// Virtuals
// ─────────────────────────────────────────────
serviceProviderSchema.virtual('ratingText').get(function () {
  return this.rating.toFixed(1);
});

// ─────────────────────────────────────────────
// Static Methods
// ─────────────────────────────────────────────

/**
 * Find verified & available providers by specialization.
 * @param {string} specialization - e.g. 'Plumbing'
 */
serviceProviderSchema.statics.findBySpecialization = function (specialization) {
  return this.find({
    specializations: specialization,
    isVerified: true,
    isActive: true,
    isAvailableNow: true,
  }).sort({ rating: -1, completedJobs: -1 });
};

module.exports = mongoose.model('ServiceProvider', serviceProviderSchema);
