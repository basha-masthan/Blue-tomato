const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const Vendor = require('./src/models/Vendor');
const Category = require('./src/models/Category');
require('dotenv').config({ path: './.env' });

async function run() {
  try {
    const uri = process.env.MONGODB_URI;
    await mongoose.connect(uri);
    
    const vendor = await Vendor.findOne({ email: 'plumbing@bluetomato.com' }).select('+password');
    if (!vendor) {
      console.log('Vendor not found');
      return;
    }
    
    console.log('Vendor:', vendor.email);
    console.log('isActive:', vendor.isActive);
    console.log('approvalStatus:', vendor.approvalStatus);
    
    const isMatch = await bcrypt.compare('password123', vendor.password);
    console.log('Password Match with password123:', isMatch);

    // Let's reset the password to be 100% sure, and also clear the services
    const salt = await bcrypt.genSalt(12);
    const newHash = await bcrypt.hash('password123', salt);

    vendor.password = newHash;
    
    // Clear all data for plumbing@bluetomato.com as requested
    const plumbingCategory = await Category.findOne({ name: /Plumbing/i });
    if (plumbingCategory) {
      vendor.serviceCategory = plumbingCategory._id;
    } else {
      console.log('Plumbing category not found in DB!');
    }
    
    vendor.serviceSubcategories = [];
    vendor.isActive = true;
    vendor.approvalStatus = 'approved';
    vendor.isVerified = true;
    
    // Use findByIdAndUpdate to bypass any pre('save') hooks if needed, though we want to save the new password.
    // Wait, the Vendor schema has a pre('save') hook that hashes the password if it's modified!
    // Let's NOT hash it manually if we use .save(). We'll just set vendor.password = 'password123'.
    
    vendor.password = 'password123';
    await vendor.save();
    console.log('Vendor password reset and services cleared.');
    
  } catch (error) {
    console.error(error);
  } finally {
    mongoose.disconnect();
  }
}

run();
