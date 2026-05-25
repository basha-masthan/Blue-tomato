const mongoose = require('mongoose');

// ─────────────────────────────────────────────
// Sub-schema: Opening Hours for each day
// ─────────────────────────────────────────────
const openingHoursSchema = new mongoose.Schema(
  {
    day: {
      type: String,
      enum: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'],
      required: true,
    },
    openTime:  { type: String, default: '09:00' }, // "HH:MM" 24-hour
    closeTime: { type: String, default: '22:00' },
    isClosed:  { type: Boolean, default: false },
  },
  { _id: false }
);

// ─────────────────────────────────────────────
// Sub-schema: Location (GeoJSON Point)
// ─────────────────────────────────────────────
const locationSchema = new mongoose.Schema(
  {
    type:        { type: String, enum: ['Point'], default: 'Point' },
    coordinates: { type: [Number], default: [0, 0] }, // [lng, lat]
    address:     { type: String, trim: true, default: '' },
    city:        { type: String, trim: true, default: '' },
    state:       { type: String, trim: true, default: '' },
    pincode:     { type: String, trim: true, default: '' },
  },
  { _id: false }
);

// ─────────────────────────────────────────────
// Main Schema: Restaurant
// ─────────────────────────────────────────────
const restaurantSchema = new mongoose.Schema(
  {
    // ── Identity ──────────────────────────────
    name: {
      type: String,
      required: [true, 'Restaurant name is required'],
      trim: true,
      maxlength: [100, 'Name cannot exceed 100 characters'],
    },

    description: {
      type: String,
      trim: true,
      default: '',
      maxlength: [500, 'Description cannot exceed 500 characters'],
    },

    // ── Cuisine & Category ────────────────────
    cuisines: {
      type: [String], // e.g. ['Biryani', 'Seafood', 'Indian']
      default: [],
    },

    category: {
      type: String,
      enum: ['veg', 'non-veg', 'both'],
      default: 'both',
    },

    // ── Media ─────────────────────────────────
    coverImage: { type: String, default: '' },
    logo:       { type: String, default: '' },

    // ── Ratings ───────────────────────────────
    deliveryRating: {
      type: Number,
      min: 0,
      max: 5,
      default: 0,
    },
    diningRating: {
      type: Number,
      min: 0,
      max: 5,
      default: 0,
    },
    totalRatingsCount: { type: Number, default: 0 },

    // ── Pricing ───────────────────────────────
    costForTwo: {
      type: Number, // in ₹
      default: 200,
    },

    // ── Delivery Config ───────────────────────
    deliveryTime: {
      min: { type: Number, default: 20 }, // minutes
      max: { type: Number, default: 30 },
    },
    deliveryFee:        { type: Number, default: 0 },
    freeDeliveryAbove:  { type: Number, default: 199 }, // free delivery if order > this
    minimumOrderAmount: { type: Number, default: 99 },

    // ── Offer / Promo Tag ─────────────────────
    offerTag: {
      type: String,
      trim: true,
      default: '', // e.g. "20% OFF", "FREE DELIVERY", "BUY 1 GET 1"
    },

    // ── Location ──────────────────────────────
    location: {
      type: locationSchema,
      default: () => ({}),
    },

    // ── Opening Hours ─────────────────────────
    openingHours: {
      type: [openingHoursSchema],
      default: [],
    },

    isOpen: {
      type: Boolean,
      default: true, // manual override toggle
    },

    // ── Status ────────────────────────────────
    isActive:   { type: Boolean, default: true },
    isFeatured: { type: Boolean, default: false },

    // ── Owner Reference (future) ───────────────
    ownerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
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
restaurantSchema.index({ 'location.coordinates': '2dsphere' }); // geo queries
restaurantSchema.index({ name: 'text', cuisines: 'text' });     // text search
restaurantSchema.index({ isActive: 1, isFeatured: -1 });
restaurantSchema.index({ deliveryRating: -1 });

// ─────────────────────────────────────────────
// Virtuals
// ─────────────────────────────────────────────
restaurantSchema.virtual('deliveryTimeText').get(function () {
  return `${this.deliveryTime.min}-${this.deliveryTime.max} min`;
});

restaurantSchema.virtual('avgRating').get(function () {
  if (this.totalRatingsCount === 0) return 0;
  return ((this.deliveryRating + this.diningRating) / 2).toFixed(1);
});

// ─────────────────────────────────────────────
// Static Methods
// ─────────────────────────────────────────────
restaurantSchema.statics.findActive = function (query = {}) {
  return this.find({ ...query, isActive: true });
};

restaurantSchema.statics.findFeatured = function () {
  return this.find({ isActive: true, isFeatured: true }).sort({ deliveryRating: -1 });
};

module.exports = mongoose.model('Restaurant', restaurantSchema);
