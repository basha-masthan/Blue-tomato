const mongoose = require('mongoose');

const subcategorySchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Subcategory name is required'],
    trim: true,
  },
  category: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Category',
    required: [true, 'Category reference is required'],
  },
  basePrice: {
    type: Number,
    default: 0,
  },
  description: {
    type: String,
    trim: true,
    default: '',
  },
  image: {
    type: String,
    trim: true,
    default: '',
  },
  isActive: {
    type: Boolean,
    default: true,
  },
}, {
  timestamps: true,
});

subcategorySchema.index({ category: 1 });

module.exports = mongoose.model('Subcategory', subcategorySchema);
