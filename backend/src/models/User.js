const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

// ─────────────────────────────────────────────
// Sub-schema: Address
// ─────────────────────────────────────────────
const addressSchema = new mongoose.Schema(
  {
    label: {
      type: String,
      enum: ['Home', 'Work', 'Other'],
      default: 'Home',
    },
    // Only used when label === 'Other'
    customLabel: {
      type: String,
      trim: true,
      default: '',
    },
    addressLine1: {
      type: String,
      required: [true, 'Address line 1 is required'],
      trim: true,
    },
    addressLine2: {
      type: String,
      trim: true,
      default: '',
    },
    city: {
      type: String,
      required: [true, 'City is required'],
      trim: true,
    },
    state: {
      type: String,
      required: [true, 'State is required'],
      trim: true,
    },
    pincode: {
      type: String,
      required: [true, 'Pincode is required'],
      trim: true,
      match: [/^\d{6}$/, 'Pincode must be a 6-digit number'],
    },
    landmark: {
      type: String,
      trim: true,
      default: '',
    },
    lat: {
      type: Number,
      default: null,
    },
    lng: {
      type: Number,
      default: null,
    },
    isDefault: {
      type: Boolean,
      default: false,
    },
  },
  { _id: true } // each address gets its own _id for easy reference
);

// ─────────────────────────────────────────────
// Main Schema: User
// ─────────────────────────────────────────────
const userSchema = new mongoose.Schema(
  {
    // ── Identity ──────────────────────────────
    name: {
      type: String,
      required: [true, 'Name is required'],
      trim: true,
      minlength: [2, 'Name must be at least 2 characters'],
      maxlength: [60, 'Name cannot exceed 60 characters'],
    },

    email: {
      type: String,
      unique: true,
      sparse: true, // allows null for OTP-only users
      lowercase: true,
      trim: true,
      match: [
        /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
        'Please provide a valid email address',
      ],
    },

    phone: {
      type: String,
      unique: true,
      sparse: true, // allows null for email-only users
      trim: true,
      match: [
        /^\+?[1-9]\d{9,14}$/,
        'Please provide a valid phone number (E.164 format)',
      ],
    },

    // ── Authentication ────────────────────────
    password: {
      type: String,
      minlength: [6, 'Password must be at least 6 characters'],
      select: false, // never returned in default queries
    },

    loginMethod: {
      type: String,
      enum: {
        values: ['email', 'google', 'facebook', 'otp'],
        message: 'Login method must be one of: email, google, facebook, otp',
      },
      required: [true, 'Login method is required'],
    },

    // ── Profile ───────────────────────────────
    profilePic: {
      type: String,
      trim: true,
      default: '',
    },

    role: {
      type: String,
      enum: ['customer', 'admin'],
      default: 'customer',
    },

    // ── Account Status ────────────────────────
    isVerified: {
      type: Boolean,
      default: false, // set to true after OTP/email verification
    },

    isActive: {
      type: Boolean,
      default: true, // set to false to suspend/ban
    },

    // ── Push Notifications ────────────────────
    fcmToken: {
      type: String,
      default: null,
    },

    // ── Addresses ─────────────────────────────
    addresses: {
      type: [addressSchema],
      default: [],
    },

    // Points to index in addresses[] for quick UI default
    defaultAddressIndex: {
      type: Number,
      default: 0,
    },

    // ── Soft Delete ───────────────────────────
    deletedAt: {
      type: Date,
      default: null,
      // If non-null, consider user as deleted
    },
  },
  {
    timestamps: true, // auto-manages createdAt & updatedAt
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// ─────────────────────────────────────────────
// Indexes
// ─────────────────────────────────────────────
userSchema.index({ createdAt: -1 });
// email and phone have `unique: true` which auto-creates indexes — no explicit index needed

// ─────────────────────────────────────────────
// Virtuals
// ─────────────────────────────────────────────

// Returns the address marked as default (or first address)
userSchema.virtual('defaultAddress').get(function () {
  if (!this.addresses || this.addresses.length === 0) return null;
  const found = this.addresses.find((a) => a.isDefault);
  return found || this.addresses[this.defaultAddressIndex] || this.addresses[0];
});

// Returns full name initials for avatar fallback
userSchema.virtual('initials').get(function () {
  if (!this.name) return '?';
  return this.name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
});

// ─────────────────────────────────────────────
// Pre-save Hook: Hash password before saving
// ─────────────────────────────────────────────
userSchema.pre('save', async function () {
  // Only hash if password field was modified
  if (!this.isModified('password') || !this.password) return;

  const salt = await bcrypt.genSalt(12);
  this.password = await bcrypt.hash(this.password, salt);
});

// ─────────────────────────────────────────────
// Instance Methods
// ─────────────────────────────────────────────

/**
 * Compare a plain-text password against the stored hash.
 * @param {string} candidatePassword
 * @returns {Promise<boolean>}
 */
userSchema.methods.comparePassword = async function (candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

/**
 * Soft-delete the user (does NOT remove from DB).
 */
userSchema.methods.softDelete = async function () {
  this.isActive = false;
  this.deletedAt = new Date();
  return this.save();
};

/**
 * Add or update an address; marks it as default if it's the first one.
 * @param {Object} addressData
 */
userSchema.methods.addAddress = async function (addressData) {
  if (this.addresses.length === 0) {
    addressData.isDefault = true;
  }
  this.addresses.push(addressData);
  return this.save();
};

/**
 * Set an address as the default by its _id.
 * @param {ObjectId|string} addressId
 */
userSchema.methods.setDefaultAddress = async function (addressId) {
  this.addresses.forEach((addr) => {
    addr.isDefault = addr._id.toString() === addressId.toString();
  });
  return this.save();
};

// ─────────────────────────────────────────────
// Static Methods
// ─────────────────────────────────────────────

/**
 * Find active (non-deleted) users only.
 */
userSchema.statics.findActive = function (query = {}) {
  return this.find({ ...query, isActive: true, deletedAt: null });
};

/**
 * Find a user by email or phone (case-insensitive).
 * @param {string} identifier — email or phone
 */
userSchema.statics.findByIdentifier = function (identifier) {
  return this.findOne({
    $or: [
      { email: identifier.toLowerCase() },
      { phone: identifier },
    ],
    isActive: true,
    deletedAt: null,
  }).select('+password'); // explicitly include password for auth flows
};

// ─────────────────────────────────────────────
// Export
// ─────────────────────────────────────────────
module.exports = mongoose.model('User', userSchema);
