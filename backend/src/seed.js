const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
require('dotenv').config();

// Simple User schema inline for seeding
const userSchema = new mongoose.Schema({
  name: String,
  email: { type: String, unique: true },
  phone: String,
  password: String,
  loginMethod: String,
  profilePic: String,
  addresses: Array,
}, { timestamps: true });

const User = mongoose.model('User', userSchema);

const dummyUsers = [
  {
    name: 'Azad Khan',
    email: 'azad@demo.com',
    phone: '+91 9876543210',
    password: 'demo123',
    loginMethod: 'email',
    profilePic: '',
    addresses: [
      { label: 'Home', addressText: '123 Main Street, Srinagar, J&K, India', lat: 34.0836, lng: 74.7973 },
      { label: 'Work', addressText: 'Tech Park, Sector 5, Jammu, J&K, India', lat: 32.7266, lng: 74.857 },
    ],
  },
  {
    name: 'Sara Ahmed',
    email: 'sara@demo.com',
    phone: '+91 8765432109',
    password: 'demo123',
    loginMethod: 'email',
    profilePic: '',
    addresses: [
      { label: 'Home', addressText: '456 Garden Colony, Sopore, J&K, India', lat: 34.2947, lng: 74.4611 },
    ],
  },
  {
    name: 'Raju Bhai',
    email: 'raju@demo.com',
    phone: '+91 7654321098',
    password: 'demo123',
    loginMethod: 'email',
    profilePic: '',
    addresses: [],
  },
];

async function seed() {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/blue-tomato');
    console.log('✅ Connected to MongoDB');

    // Clear existing users
    await User.deleteMany({});
    console.log('🗑️  Cleared existing users');

    // Hash passwords and insert
    for (const userData of dummyUsers) {
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(userData.password, salt);
      const user = new User({ ...userData, password: hashedPassword });
      await user.save();
      console.log(`✅ Created user: ${userData.name} (${userData.email})`);
    }

    console.log('\n🎉 Seed complete! Dummy credentials:');
    console.log('─────────────────────────────────────');
    dummyUsers.forEach(u => {
      console.log(`  📧 Email    : ${u.email}`);
      console.log(`  🔑 Password : ${u.password}`);
      console.log(`  📞 Phone    : ${u.phone}`);
      console.log('  ─────────────────────────────────────');
    });

    process.exit(0);
  } catch (err) {
    console.error('❌ Seed failed:', err.message);
    process.exit(1);
  }
}

seed();
