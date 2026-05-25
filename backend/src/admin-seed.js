require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('./models/User');

async function seedAdmin() {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/blue-tomato');
    console.log('Connected to MongoDB');

    // Check if admin already exists
    const existingAdmin = await User.findOne({ role: 'admin' });
    if (existingAdmin) {
      console.log('Admin user already exists:');
      console.log(`  Name: ${existingAdmin.name}`);
      console.log(`  Email: ${existingAdmin.email}`);
      console.log('Skipping creation.');
      process.exit(0);
    }

    // Create admin user
    const adminData = {
      name: 'Super Admin',
      email: 'admin@bluetomato.com',
      phone: '+911234567890',
      password: 'Admin@123',
      loginMethod: 'email',
      role: 'admin',
      isVerified: true,
      isActive: true,
    };

    const admin = await User.create(adminData);
    console.log('Admin user created successfully!');
    console.log(`  Name: ${admin.name}`);
    console.log(`  Email: ${admin.email}`);
    console.log(`  Password: Admin@123`);
    console.log('');
    console.log('You can now login at the admin dashboard with:');
    console.log(`  Email: admin@bluetomato.com`);
    console.log(`  Password: Admin@123`);

    process.exit(0);
  } catch (error) {
    console.error('Failed to create admin user:', error.message);
    process.exit(1);
  }
}

seedAdmin();
