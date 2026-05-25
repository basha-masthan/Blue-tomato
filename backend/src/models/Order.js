const mongoose = require('mongoose');

// ─────────────────────────────────────────────
// Sub-schema: Order Item (snapshot at order time)
// ─────────────────────────────────────────────
// We snapshot the item details so price changes don't affect past orders.
const orderItemSchema = new mongoose.Schema(
  {
    menuItemId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'MenuItem',
      required: true,
    },
    name:     { type: String, required: true },     // snapshotted name
    price:    { type: Number, required: true },     // snapshotted unit price
    image:    { type: String, default: '' },
    isVeg:    { type: Boolean, default: false },
    quantity: { type: Number, required: true, min: 1, default: 1 },

    // Selected variant (if any)
    variant: {
      name:  { type: String, default: '' },
      price: { type: Number, default: 0 },
    },

    // Selected add-ons (if any)
    addons: [
      {
        name:  { type: String },
        price: { type: Number, default: 0 },
      },
    ],

    // Computed subtotal for this line item
    subtotal: { type: Number, required: true },
  },
  { _id: true }
);

// ─────────────────────────────────────────────
// Sub-schema: Delivery Address Snapshot
// ─────────────────────────────────────────────
const deliveryAddressSchema = new mongoose.Schema(
  {
    label:        { type: String, default: 'Home' },
    addressLine1: { type: String, required: true },
    addressLine2: { type: String, default: '' },
    city:         { type: String, required: true },
    state:        { type: String, required: true },
    pincode:      { type: String, required: true },
    landmark:     { type: String, default: '' },
    lat:          { type: Number, default: null },
    lng:          { type: Number, default: null },
  },
  { _id: false }
);

// ─────────────────────────────────────────────
// Main Schema: Order
// ─────────────────────────────────────────────
const orderSchema = new mongoose.Schema(
  {
    // ── References ────────────────────────────
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'User reference is required'],
      index: true,
    },

    restaurantId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Restaurant',
      required: [true, 'Restaurant reference is required'],
      index: true,
    },

    // ── Order Number (human-readable) ─────────
    orderNumber: {
      type: String,
      unique: true,
      // Generated in pre-save hook, e.g. "BT-FOOD-20240526-0042"
    },

    // ── Items ─────────────────────────────────
    items: {
      type: [orderItemSchema],
      validate: {
        validator: (v) => v.length > 0,
        message: 'Order must contain at least one item',
      },
    },

    // ── Pricing Breakdown ─────────────────────
    pricing: {
      itemTotal:      { type: Number, required: true, min: 0 },
      deliveryFee:    { type: Number, default: 0 },
      taxAmount:      { type: Number, default: 0 },   // GST 5%
      platformFee:    { type: Number, default: 5 },
      discountAmount: { type: Number, default: 0 },   // coupon savings
      grandTotal:     { type: Number, required: true, min: 0 },
    },

    // ── Coupon ────────────────────────────────
    coupon: {
      code:           { type: String, default: '' },
      discountAmount: { type: Number, default: 0 },
    },

    // ── Delivery Address Snapshot ─────────────
    deliveryAddress: {
      type: deliveryAddressSchema,
      required: true,
    },

    // ── Delivery Preferences ──────────────────
    deliveryPreferences: {
      noContactDelivery:   { type: Boolean, default: false },
      avoidCalling:        { type: Boolean, default: false },
      cookingInstructions: { type: String, default: '', maxlength: 300 },
    },

    // ── Payment ───────────────────────────────
    paymentMethod: {
      type: String,
      enum: ['card', 'upi', 'cod', 'wallet', 'netbanking'],
      required: [true, 'Payment method is required'],
    },

    paymentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Payment',
      default: null,
    },

    isPaid: {
      type: Boolean,
      default: false,
    },

    // ── Order Status FSM ──────────────────────
    // Flow: pending -> confirmed -> preparing -> out_for_delivery -> delivered
    //  OR:  pending -> cancelled
    status: {
      type: String,
      enum: [
        'pending',
        'confirmed',
        'preparing',
        'out_for_delivery',
        'delivered',
        'cancelled',
      ],
      default: 'pending',
    },

    // ── Status Timeline ───────────────────────
    statusTimeline: [
      {
        status:    { type: String },
        timestamp: { type: Date, default: Date.now },
        note:      { type: String, default: '' },
      },
    ],

    // ── Estimated Delivery ────────────────────
    estimatedDeliveryTime: {
      type: Date,
      default: null,
    },

    // ── Delivery Partner ──────────────────────
    deliveryPartnerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },

    // ── Cancellation ──────────────────────────
    cancellationReason: { type: String, default: '' },
    cancelledBy: {
      type: String,
      enum: ['user', 'restaurant', 'system', null],
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
orderSchema.index({ userId: 1, createdAt: -1 });
orderSchema.index({ restaurantId: 1, status: 1 });
orderSchema.index({ orderNumber: 1 });
orderSchema.index({ status: 1, createdAt: -1 });

// ─────────────────────────────────────────────
// Pre-save Hook: Generate order number + timeline
// ─────────────────────────────────────────────
orderSchema.pre('save', async function (next) {
  if (!this.orderNumber) {
    const date = new Date();
    const dateStr = date.toISOString().slice(0, 10).replace(/-/g, '');
    const count = await this.constructor.countDocuments();
    this.orderNumber = `BT-FOOD-${dateStr}-${String(count + 1).padStart(4, '0')}`;
  }

  if (this.isModified('status')) {
    this.statusTimeline.push({ status: this.status, timestamp: new Date() });
  }

  next();
});

// ─────────────────────────────────────────────
// Virtuals
// ─────────────────────────────────────────────
orderSchema.virtual('totalItems').get(function () {
  return this.items.reduce((sum, item) => sum + item.quantity, 0);
});

orderSchema.virtual('isActive').get(function () {
  return !['delivered', 'cancelled'].includes(this.status);
});

// ─────────────────────────────────────────────
// Static Methods
// ─────────────────────────────────────────────
orderSchema.statics.getOrderHistory = function (userId) {
  return this.find({ userId })
    .populate('restaurantId', 'name logo coverImage')
    .sort({ createdAt: -1 });
};

orderSchema.statics.getActiveOrders = function (userId) {
  return this.find({
    userId,
    status: { $nin: ['delivered', 'cancelled'] },
  }).populate('restaurantId', 'name logo');
};

module.exports = mongoose.model('Order', orderSchema);
