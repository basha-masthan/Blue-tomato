const mongoose = require('mongoose');

// ─────────────────────────────────────────────
// Main Schema: Service
// ─────────────────────────────────────────────
const serviceSchema = new mongoose.Schema(
  {
    // ── Ownership ─────────────────────────────
    providerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'ServiceProvider',
      required: [true, 'Provider reference is required'],
      index: true,
    },

    // ── Identity ──────────────────────────────
    name: {
      type: String,
      required: [true, 'Service name is required'],
      trim: true,
      maxlength: [100, 'Name cannot exceed 100 characters'],
    },

    description: {
      type: String,
      trim: true,
      default: '',
      maxlength: [400, 'Description cannot exceed 400 characters'],
    },

    // ── Category ──────────────────────────────
    // Matches the service tiles shown in HomeServicesHomeScreen
    category: {
      type: String,
      enum: [
        'Plumbing',
        'Carpentry',
        'Electrical',
        'Cleaning',
        'Painting',
        'Appliance Repair',
        'Pest Control',
        'Other',
      ],
      required: [true, 'Category is required'],
    },

    // ── Pricing ───────────────────────────────
    basePrice: {
      type: Number,
      required: [true, 'Base price is required'],
      min: 0,
    },

    priceType: {
      type: String,
      enum: ['fixed', 'starting_from', 'per_hour'],
      default: 'starting_from',
    },

    // ── Duration ──────────────────────────────
    estimatedDuration: {
      type: Number, // in minutes
      default: 60,
    },

    // ── Ratings ───────────────────────────────
    rating:      { type: Number, min: 0, max: 5, default: 0 },
    reviewCount: { type: Number, default: 0 },

    // ── Media ─────────────────────────────────
    image: { type: String, default: '' },
    icon:  { type: String, default: '' }, // Ionicons name

    // ── Status ────────────────────────────────
    isAvailable: { type: Boolean, default: true },
    isFeatured:  { type: Boolean, default: false },
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
serviceSchema.index({ providerId: 1, category: 1 });
serviceSchema.index({ category: 1, isAvailable: 1 });
serviceSchema.index({ name: 'text', description: 'text' });
serviceSchema.index({ rating: -1 });

// ─────────────────────────────────────────────
// Virtuals
// ─────────────────────────────────────────────
serviceSchema.virtual('priceDisplay').get(function () {
  const prefix = this.priceType === 'starting_from' ? 'Starting Rs.'
               : this.priceType === 'per_hour'       ? 'Rs./hr '
               : 'Rs.';
  return `${prefix}${this.basePrice}`;
});

// ─────────────────────────────────────────────
// Static Methods
// ─────────────────────────────────────────────

/**
 * Get all available services by category.
 */
serviceSchema.statics.findByCategory = function (category) {
  return this.find({ category, isAvailable: true })
    .populate('providerId', 'displayName profilePic rating isVerified')
    .sort({ rating: -1 });
};

module.exports = mongoose.model('Service', serviceSchema);
