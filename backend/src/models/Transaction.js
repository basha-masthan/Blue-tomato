const mongoose = require('mongoose');

const transactionSchema = new mongoose.Schema({
  vendor: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Vendor',
    required: [true, 'Vendor reference is required'],
  },
  order: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'VendorOrder',
    required: [true, 'Order reference is required'],
  },
  transactionId: {
    type: String,
    required: true,
    trim: true,
  },
  amount: {
    type: Number,
    required: true,
    min: 0,
  },
  status: {
    type: String,
    enum: ['payment_received', 'payment_pending'],
    default: 'payment_pending',
  },
  serviceType: {
    type: String,
    trim: true,
  },
  paymentMethod: {
    type: String,
    trim: true,
    default: '',
  },
  deletedAt: { type: Date, default: null },
}, {
  timestamps: true,
});

transactionSchema.index({ vendor: 1, createdAt: -1 });
transactionSchema.index({ order: 1 });
transactionSchema.index({ transactionId: 1 });

module.exports = mongoose.model('Transaction', transactionSchema);
