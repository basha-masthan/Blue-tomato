const mongoose = require('mongoose');

const appConfigSchema = new mongoose.Schema({
  // Config type to support multiple apps
  appType: {
    type: String,
    enum: ['user', 'vendor'],
    required: true,
    unique: true,
  },

  // ── Colors ────────────────────────────────
  colors: {
    primary: { type: String, default: '#0ea5e9' },      // Main brand color
    primaryDark: { type: String, default: '#0284c7' },   // Darker shade
    primaryLight: { type: String, default: '#bae6fd' },  // Lighter shade
    secondary: { type: String, default: '#f97316' },     // Accent color
    success: { type: String, default: '#22c55e' },       // Success/green
    warning: { type: String, default: '#f59e0b' },       // Warning/yellow
    danger: { type: String, default: '#ef4444' },        // Error/red
    background: { type: String, default: '#f8fafc' },    // App background
    surface: { type: String, default: '#ffffff' },       // Card/surface
    text: { type: String, default: '#0f172a' },          // Primary text
    textSecondary: { type: String, default: '#64748b' },   // Secondary text
  },

  // ── Typography ────────────────────────────
  fontFamily: {
    type: String,
    default: 'System',
  },

  // ── Logo & Assets ────────────────────────
  logo: {
    type: String,
    default: '',
  },
  logoWhite: {
    type: String,
    default: '',
  },
  splashImage: {
    type: String,
    default: '',
  },

  // ── Features Toggle ─────────────────────
  features: {
    showBanner: { type: Boolean, default: true },
    showCategories: { type: Boolean, default: true },
    showFeatured: { type: Boolean, default: true },
    showOffers: { type: Boolean, default: true },
    enableSearch: { type: Boolean, default: true },
    enableNotifications: { type: Boolean, default: true },
    enableChat: { type: Boolean, default: false },
    enableReviews: { type: Boolean, default: true },
  },

  // ── Layout ───────────────────────────────
  layout: {
    bannerHeight: { type: Number, default: 180 }, // pixels
    cardRadius: { type: Number, default: 12 },    // border radius
    gridColumns: { type: Number, default: 2 },     // category grid columns
  },

  updatedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  },

  updatedAt: {
    type: Date,
    default: Date.now,
  },
}, {
  timestamps: true,
});

module.exports = mongoose.model('AppConfig', appConfigSchema);
