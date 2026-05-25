const mongoose = require('mongoose');

const orderItemSchema = new mongoose.Schema({
  name: { type: String, required: true },
  price: { type: Number, required: true },
  quantity: { type: Number, required: true, min: 1, default: 1 },
  image: { type: String, default: '' },
}, { _id: false });

const customerSchema = new mongoose.Schema({
  name: { type: String, required: true },
  phone: { type: String, default: '' },
  address: { type: String, default: '' },
}, { _id: false });

const vendorOrderSchema = new mongoose.Schema({
  vendor: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Vendor',
    required: [true, 'Vendor reference is required'],
    index: true,
  },

  orderId: {
    type: String,
  },

  customer: {
    type: customerSchema,
    required: true,
  },

  items: {
    type: [orderItemSchema],
    required: true,
  },

  totalAmount: {
    type: Number,
    required: true,
    min: 0,
  },

  status: {
    type: String,
    enum: ['pending', 'processing', 'completed', 'declined'],
    default: 'pending',
  },

  paymentStatus: {
    type: String,
    enum: ['prepaid', 'cod', 'pending'],
    default: 'pending',
  },

  serviceType: {
    type: String,
    trim: true,
    default: 'food',
  },

  deletedAt: {
    type: Date,
    default: null,
  },
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true },
});

// Generate order ID before saving
vendorOrderSchema.pre('save', function(next) {
  if (!this.orderId) {
    const date = new Date();
    const dateStr = date.toISOString().slice(0, 10).replace(/-/g, '');
    const random = Math.floor(1000 + Math.random() * 9000);
    this.orderId = `ORD${dateStr}${random}`;
  }
  if (typeof next === 'function') {
    next();
  }
});

vendorOrderSchema.index({ vendor: 1, status: 1 });
vendorOrderSchema.index({ vendor: 1, createdAt: -1 });
vendorOrderSchema.index({ orderId: 1 });

module.exports = mongoose.model('VendorOrder', vendorOrderSchema);
