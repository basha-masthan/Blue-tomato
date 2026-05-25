require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./models/User');

const dummyUsers = [
  {
    name: 'Azad Khan',
    email: 'azad@demo.com',
    phone: '+919876543210',
    password: 'demo123',
    loginMethod: 'email',
    role: 'customer',
    isVerified: true,
    isActive: true,
    addresses: [
      {
        label: 'Home',
        addressLine1: '123 Main Street',
        city: 'Srinagar',
        state: 'Jammu & Kashmir',
        pincode: '190001',
        lat: 34.0836,
        lng: 74.7973,
        isDefault: true,
      },
      {
        label: 'Work',
        addressLine1: 'Tech Park, Sector 5',
        city: 'Jammu',
        state: 'Jammu & Kashmir',
        pincode: '180001',
        lat: 32.7266,
        lng: 74.857,
        isDefault: false,
      },
    ],
  },
  {
    name: 'Sara Ahmed',
    email: 'sara@demo.com',
    phone: '+918765432109',
    password: 'demo123',
    loginMethod: 'email',
    role: 'customer',
    isVerified: true,
    isActive: true,
    addresses: [
      {
        label: 'Home',
        addressLine1: '456 Garden Colony',
        city: 'Sopore',
        state: 'Jammu & Kashmir',
        pincode: '193201',
        lat: 34.2947,
        lng: 74.4611,
        isDefault: true,
      },
    ],
  },
  {
    name: 'Raju Bhai',
    email: 'raju@demo.com',
    phone: '+917654321098',
    password: 'demo123',
    loginMethod: 'email',
    role: 'customer',
    isVerified: true,
    isActive: true,
    addresses: [],
  },
];

async function seed() {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/blue-tomato');
    console.log('Connected to MongoDB');

    // Only clear non-admin users
    await User.deleteMany({ role: { $ne: 'admin' } });
    console.log('Cleared existing non-admin users');

    for (const userData of dummyUsers) {
      const user = await User.create(userData);
      console.log(`Created user: ${user.name} (${user.email})`);
    }

    console.log('\nSeed complete!');
    console.log('Dummy credentials:');
    dummyUsers.forEach((u) => {
      console.log(`  Email: ${u.email}`);
      console.log(`  Password: ${u.password}`);
      console.log(`  Phone: ${u.phone}`);
      console.log('  ──────────────────');
    });

    process.exit(0);
  } catch (err) {
    console.error('Seed failed:', err.message);
    process.exit(1);
  }
}

seed();
