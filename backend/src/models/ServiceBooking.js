const mongoose = require('mongoose');

// ─────────────────────────────────────────────
// Sub-schema: Address Snapshot (for service location)
// ─────────────────────────────────────────────
const serviceAddressSchema = new mongoose.Schema(
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
// Main Schema: ServiceBooking
// ─────────────────────────────────────────────
const serviceBookingSchema = new mongoose.Schema(
  {
    // ── References ────────────────────────────
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'User reference is required'],
      index: true,
    },

    providerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'ServiceProvider',
      required: false,
      index: true,
    },

    serviceId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Service',
      required: [true, 'Service reference is required'],
    },

    // ── Booking Number (human-readable) ───────
    bookingNumber: {
      type: String,
      unique: true,
      // e.g. "BT-SVC-20240526-0010"
    },

    // ── Snapshotted Service Info ───────────────
    serviceName:     { type: String, required: true },
    serviceCategory: { type: String, required: true },
    serviceCategoryId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Category',
      required: false,
    },
    serviceSubcategoryId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Subcategory',
      required: false,
    },

    // ── Scheduling ────────────────────────────
    scheduledDate: {
      type: Date,
      required: [true, 'Scheduled date is required'],
    },

    scheduledTimeSlot: {
      type: String,
      default: '', // e.g. "10:00 AM - 12:00 PM"
    },

    // ── Pricing Breakdown ─────────────────────
    pricing: {
      serviceTotal:    { type: Number, required: true, min: 0 },
      gstAmount:       { type: Number, default: 0 },
      convenienceFee:  { type: Number, default: 5 },
      visitCharges:    { type: Number, default: 0 },
      discountAmount:  { type: Number, default: 0 },
      grandTotal:      { type: Number, required: true, min: 0 },
    },

    // ── Coupon ────────────────────────────────
    coupon: {
      code:           { type: String, default: '' },
      discountAmount: { type: Number, default: 0 },
    },

    // ── Service Location ──────────────────────
    serviceAddress: {
      type: serviceAddressSchema,
      required: true,
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

    isPaid: { type: Boolean, default: false },

    // ── Booking Status FSM ────────────────────
    // Flow: pending -> confirmed -> in_progress -> completed
    //  OR:  pending -> cancelled
    status: {
      type: String,
      enum: [
        'searching',   // broadcasting to nearby vendors
        'pending',     // just booked, awaiting provider confirmation
        'confirmed',   // provider confirmed the booking
        'in_progress', // provider is on-site working
        'completed',   // job done successfully
        'cancelled',   // cancelled by user or provider
      ],
      default: 'searching',
    },

    // ── Status Timeline ───────────────────────
    statusTimeline: [
      {
        status:    { type: String },
        timestamp: { type: Date, default: Date.now },
        note:      { type: String, default: '' },
      },
    ],

    // ── Cancellation ──────────────────────────
    cancellationReason: { type: String, default: '' },
    cancelledBy: {
      type: String,
      enum: ['user', 'provider', 'system', null],
      default: null,
    },

    // ── Rejected By (Lead Broadcast) ──────────
    rejectedBy: [{
      vendorId: { type: mongoose.Schema.Types.ObjectId, ref: 'Vendor' },
      reason: { type: String, default: '' },
      timestamp: { type: Date, default: Date.now },
    }],

    // ── Notes from User ───────────────────────
    userNotes: {
      type: String,
      trim: true,
      default: '',
      maxlength: 300,
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
serviceBookingSchema.index({ userId: 1, createdAt: -1 });
serviceBookingSchema.index({ providerId: 1, status: 1 });
serviceBookingSchema.index({ scheduledDate: 1, status: 1 });
// bookingNumber has `unique: true` which auto-creates index

// ─────────────────────────────────────────────
// Pre-save Hook: Generate booking number + timeline
// ─────────────────────────────────────────────
serviceBookingSchema.pre('save', async function () {
  if (!this.bookingNumber) {
    const date = new Date();
    const dateStr = date.toISOString().slice(0, 10).replace(/-/g, '');
    const count = await this.constructor.countDocuments();
    this.bookingNumber = `BT-SVC-${dateStr}-${String(count + 1).padStart(4, '0')}`;
  }

  if (this.isModified('status')) {
    this.statusTimeline.push({ status: this.status, timestamp: new Date() });
  }
});

// ─────────────────────────────────────────────
// Virtuals
// ─────────────────────────────────────────────
serviceBookingSchema.virtual('isActive').get(function () {
  return !['completed', 'cancelled'].includes(this.status);
});

serviceBookingSchema.virtual('scheduledDateText').get(function () {
  return this.scheduledDate
    ? this.scheduledDate.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })
    : '';
});

// ─────────────────────────────────────────────
// Static Methods
// ─────────────────────────────────────────────
serviceBookingSchema.statics.getBookingHistory = function (userId) {
  return this.find({ userId })
    .populate('providerId', 'displayName profilePic rating')
    .populate('serviceId', 'name category image')
    .sort({ createdAt: -1 });
};

serviceBookingSchema.statics.getActiveBookings = function (userId) {
  return this.find({
    userId,
    status: { $nin: ['completed', 'cancelled'] },
  })
    .populate('providerId', 'displayName profilePic')
    .populate('serviceId', 'name category');
};

module.exports = mongoose.model('ServiceBooking', serviceBookingSchema);
