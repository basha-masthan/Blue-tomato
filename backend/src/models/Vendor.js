const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const addressSchema = new mongoose.Schema({
  apartment: { type: String, trim: true, default: '' },
  street: { type: String, trim: true, default: '' },
  city: { type: String, required: true, trim: true },
  state: { type: String, required: true, trim: true },
  country: { type: String, required: true, trim: true, default: 'India' },
  zip: { type: String, required: true, trim: true },
}, { _id: false });

const bankDetailsSchema = new mongoose.Schema({
  bankName: { type: String, required: true, trim: true },
  accountHolderName: { type: String, required: true, trim: true },
  accountNumber: { type: String, required: true, trim: true },
  branchName: { type: String, trim: true, default: '' },
  ifscCode: { type: String, required: true, trim: true },
  pinCode: { type: String, trim: true, default: '' },
}, { _id: false });

const aadhaarSchema = new mongoose.Schema({
  number: { type: String, trim: true },
  frontImage: { type: String, default: '' },
  backImage: { type: String, default: '' },
}, { _id: false });

const panSchema = new mongoose.Schema({
  number: { type: String, trim: true },
  image: { type: String, default: '' },
}, { _id: false });

const vendorSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Name is required'],
    trim: true,
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    lowercase: true,
    trim: true,
  },
  phone: {
    type: String,
    required: [true, 'Phone is required'],
    unique: true,
    trim: true,
  },
  password: {
    type: String,
    required: [true, 'Password is required'],
    minlength: [6, 'Password must be at least 6 characters'],
    select: false,
  },
  dateOfBirth: { type: Date },
  gender: { type: String, enum: ['Male', 'Female', 'Other'] },
  bloodGroup: { type: String, trim: true },
  emergencyContact: { type: String, trim: true },

  registrationType: {
    type: String,
    enum: ['restaurant', 'it_firm', 'plumbing', 'electrical', 'cleaning', 'other'],
    required: [true, 'Registration type is required'],
  },

  profilePic: { type: String, default: '' },

  aadhaar: aadhaarSchema,
  pan: panSchema,

  currentAddress: addressSchema,
  permanentAddress: {
    type: addressSchema,
    default: null,
  },
  sameAsCurrentAddress: { type: Boolean, default: false },

  bankDetails: bankDetailsSchema,

  isVerified: { type: Boolean, default: false },
  isActive: { type: Boolean, default: false }, // inactive until admin approval
  isOnline: { type: Boolean, default: false },
  kycComplete: { type: Boolean, default: false },

  // ── Admin Approval ────────────────────────
  approvalStatus: {
    type: String,
    enum: ['pending', 'approved', 'rejected'],
    default: 'pending',
  },
  rejectionReason: {
    type: String,
    trim: true,
    default: '',
  },
  approvedAt: { type: Date, default: null },
  rejectedAt: { type: Date, default: null },


  fcmToken: { type: String, default: null },

  deletedAt: { type: Date, default: null },
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true },
});

vendorSchema.index({ registrationType: 1 });
vendorSchema.index({ isOnline: 1 });

vendorSchema.pre('save', async function () {
  if (!this.isModified('password') || !this.password) return;
  const salt = await bcrypt.genSalt(12);
  this.password = await bcrypt.hash(this.password, salt);
});

vendorSchema.methods.comparePassword = async function (candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

vendorSchema.methods.softDelete = async function () {
  this.isActive = false;
  this.deletedAt = new Date();
  return this.save();
};

vendorSchema.statics.findActive = function (query = {}) {
  return this.find({ ...query, isActive: true, deletedAt: null });
};

module.exports = mongoose.model('Vendor', vendorSchema);
