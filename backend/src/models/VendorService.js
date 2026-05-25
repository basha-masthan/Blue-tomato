const mongoose = require('mongoose');

const vendorServiceSchema = new mongoose.Schema({
  vendor: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Vendor',
    required: [true, 'Vendor reference is required'],
    index: true,
  },

  name: {
    type: String,
    required: [true, 'Service name is required'],
    trim: true,
    maxlength: [100, 'Name cannot exceed 100 characters'],
  },

  category: {
    type: String,
    required: [true, 'Category is required'],
    trim: true,
  },

  description: {
    type: String,
    trim: true,
    default: '',
    maxlength: [400, 'Description cannot exceed 400 characters'],
  },

  // For food items - fixed price
  price: {
    type: Number,
    min: 0,
    default: null,
  },

  // For service items - price range
  priceFrom: {
    type: Number,
    min: 0,
    default: null,
  },

  priceTo: {
    type: Number,
    min: 0,
    default: null,
  },

  // Type: 'food' or 'service'
  type: {
    type: String,
    enum: ['food', 'service'],
    default: 'food',
  },

  image: {
    type: String,
    default: '',
  },

  isAvailable: {
    type: Boolean,
    default: true,
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

vendorServiceSchema.index({ vendor: 1, category: 1 });
vendorServiceSchema.index({ vendor: 1, isAvailable: 1 });

module.exports = mongoose.model('VendorService', vendorServiceSchema);
