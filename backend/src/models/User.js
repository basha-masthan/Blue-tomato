const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: false,
  },
  email: {
    type: String,
    required: false,
    unique: true,
  },
  phone: {
    type: String,
    required: false,
    unique: true,
  },
  password: {
    type: String,
    required: false,
  },
  loginMethod: {
    type: String,
    enum: ['email', 'google', 'facebook', 'otp'],
    required: true,
  },
  profilePic: {
    type: String,
    default: '',
  },
  addresses: [{
    label: String, // Home, Work, Other
    addressText: String,
    lat: Number,
    lng: Number,
  }],
}, { timestamps: true });

module.exports = mongoose.model('User', userSchema);
