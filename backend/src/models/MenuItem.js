const mongoose = require('mongoose');

// ─────────────────────────────────────────────
// Sub-schema: Variant / Size option
// ─────────────────────────────────────────────
const variantSchema = new mongoose.Schema(
  {
    name:  { type: String, trim: true, required: true }, // e.g. "Full", "Half", "Large"
    price: { type: Number, required: true, min: 0 },
  },
  { _id: true }
);

// ─────────────────────────────────────────────
// Sub-schema: Add-on / Customization
// ─────────────────────────────────────────────
const addonSchema = new mongoose.Schema(
  {
    name:  { type: String, trim: true, required: true }, // e.g. "Extra Cheese", "Raita"
    price: { type: Number, default: 0, min: 0 },
  },
  { _id: true }
);

// ─────────────────────────────────────────────
// Main Schema: MenuItem
// ─────────────────────────────────────────────
const menuItemSchema = new mongoose.Schema(
  {
    // ── Ownership ─────────────────────────────
    restaurantId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Restaurant',
      required: [true, 'Restaurant reference is required'],
      index: true,
    },

    // ── Identity ──────────────────────────────
    name: {
      type: String,
      required: [true, 'Item name is required'],
      trim: true,
      maxlength: [100, 'Name cannot exceed 100 characters'],
    },

    description: {
      type: String,
      trim: true,
      default: '',
      maxlength: [300, 'Description cannot exceed 300 characters'],
    },

    // ── Category (within menu) ────────────────
    category: {
      type: String,
      trim: true,
      default: 'Main Course', // e.g. Starters, Main Course, Dessert, Beverages
    },

    // ── Veg / Non-Veg ─────────────────────────
    isVeg: {
      type: Boolean,
      required: true,
      default: false,
    },

    // ── Pricing ───────────────────────────────
    price: {
      type: Number,
      required: [true, 'Price is required'],
      min: [0, 'Price cannot be negative'],
    },

    // Variants (e.g. Half / Full) — optional
    variants: {
      type: [variantSchema],
      default: [],
    },

    // Add-ons (e.g. Extra cheese) — optional
    addons: {
      type: [addonSchema],
      default: [],
    },

    // ── Media ─────────────────────────────────
    image: {
      type: String,
      default: '', // URL (TheMealDB or uploaded)
    },

    // ── Ratings ───────────────────────────────
    rating: {
      type: Number,
      min: 0,
      max: 5,
      default: 0,
    },
    reviewsCount: {
      type: Number,
      default: 0,
    },

    // ── Labels / Badges ───────────────────────
    isBestseller: { type: Boolean, default: false },
    isRecommended: { type: Boolean, default: false },
    isSpicy:       { type: Boolean, default: false },

    // ── Nutrition (optional) ──────────────────
    calories: { type: Number, default: null },

    // ── Availability ──────────────────────────
    isAvailable: {
      type: Boolean,
      default: true, // toggle to mark as sold-out
    },

    // ── Sort Order ────────────────────────────
    sortOrder: {
      type: Number,
      default: 0, // lower number appears first in menu
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
menuItemSchema.index({ restaurantId: 1, category: 1 });
menuItemSchema.index({ restaurantId: 1, isAvailable: 1 });
menuItemSchema.index({ name: 'text', description: 'text' }); // search support
menuItemSchema.index({ isBestseller: -1, rating: -1 });

// ─────────────────────────────────────────────
// Static Methods
// ─────────────────────────────────────────────

/**
 * Get all available items for a restaurant, grouped by category.
 * @param {ObjectId} restaurantId
 */
menuItemSchema.statics.getMenuByRestaurant = async function (restaurantId) {
  const items = await this.find({ restaurantId, isAvailable: true }).sort({
    category: 1,
    sortOrder: 1,
  });

  // Group by category
  return items.reduce((acc, item) => {
    const cat = item.category;
    if (!acc[cat]) acc[cat] = [];
    acc[cat].push(item);
    return acc;
  }, {});
};

/**
 * Get bestseller items for a restaurant.
 */
menuItemSchema.statics.getBestsellers = function (restaurantId) {
  return this.find({ restaurantId, isBestseller: true, isAvailable: true }).limit(10);
};

module.exports = mongoose.model('MenuItem', menuItemSchema);
