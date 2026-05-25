const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
require('dotenv').config();

const Vendor = require('./models/Vendor');
const VendorOrder = require('./models/VendorOrder');
const VendorService = require('./models/VendorService');
const Transaction = require('./models/Transaction');

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/blue-tomato';

async function seed() {
  try {
    console.log('Connecting to MongoDB...');
    await mongoose.connect(MONGODB_URI);
    console.log('Connected to MongoDB');

    // Clear existing vendor data
    console.log('Clearing existing vendor data...');
    await Vendor.deleteMany({});
    await VendorOrder.deleteMany({});
    await VendorService.deleteMany({});
    await Transaction.deleteMany({});
    console.log('Cleared existing vendor data');

    // Create test vendor 1 - Restaurant
    console.log('Creating test vendor 1 (Restaurant)...');
    const vendor1 = await Vendor.create({
      name: 'Spice Garden Restaurant',
      email: 'restaurant@bluetomato.com',
      phone: '9876543210',
      password: 'password123',
      registrationType: 'restaurant',
      dateOfBirth: new Date('1990-01-01'),
      gender: 'Male',
      bloodGroup: 'O+',
      emergencyContact: '9876543211',
      aadhaar: {
        number: '123456789012',
      },
      pan: {
        number: 'ABCDE1234F',
      },
      currentAddress: {
        apartment: '123 Food Street',
        city: 'Mumbai',
        state: 'Maharashtra',
        country: 'India',
        zip: '400001',
      },
      sameAsCurrentAddress: true,
      bankDetails: {
        bankName: 'HDFC Bank',
        accountHolderName: 'Spice Garden Restaurant',
        accountNumber: '1234567890',
        ifscCode: 'HDFC0001234',
      },
      isVerified: true,
      isActive: true,
      kycComplete: true,
    });
    console.log('Created vendor 1:', vendor1.email);

    // Create test vendor 2 - Plumbing Service
    console.log('Creating test vendor 2 (Plumbing)...');
    const vendor2 = await Vendor.create({
      name: 'Quick Fix Plumbing',
      email: 'plumbing@bluetomato.com',
      phone: '9876543212',
      password: 'password123',
      registrationType: 'plumbing',
      dateOfBirth: new Date('1985-05-15'),
      gender: 'Male',
      bloodGroup: 'B+',
      emergencyContact: '9876543213',
      aadhaar: {
        number: '987654321098',
      },
      pan: {
        number: 'FGHIJ5678K',
      },
      currentAddress: {
        apartment: '456 Service Road',
        city: 'Delhi',
        state: 'Delhi',
        country: 'India',
        zip: '110001',
      },
      sameAsCurrentAddress: true,
      bankDetails: {
        bankName: 'SBI Bank',
        accountHolderName: 'Quick Fix Plumbing',
        accountNumber: '9876543210',
        ifscCode: 'SBIN0001234',
      },
      isVerified: true,
      isActive: true,
      kycComplete: true,
    });
    console.log('Created vendor 2:', vendor2.email);

    // Create menu items for restaurant vendor
    console.log('Creating menu items for restaurant...');
    const menuItems = [
      { name: 'Butter Chicken', category: 'Main Course', description: 'Creamy tomato-based curry', price: 350, type: 'food' },
      { name: 'Paneer Tikka', category: 'Starters', description: 'Grilled cottage cheese', price: 280, type: 'food' },
      { name: 'Garlic Naan', category: 'Breads', description: 'Bread with garlic butter', price: 60, type: 'food' },
      { name: 'Chicken Biryani', category: 'Rice', description: 'Aromatic rice with chicken', price: 320, type: 'food' },
      { name: 'Gulab Jamun', category: 'Desserts', description: 'Sweet milk dumplings', price: 120, type: 'food' },
    ];

    for (const item of menuItems) {
      await VendorService.create({
        vendor: vendor1._id,
        ...item,
        isAvailable: true,
      });
    }
    console.log('Created menu items');

    // Create services for plumbing vendor
    console.log('Creating services for plumbing...');
    const services = [
      { name: 'Pipe Repair', category: 'Plumbing', description: 'Fixing leaking pipes', priceFrom: 500, priceTo: 1500, type: 'service' },
      { name: 'Tap Installation', category: 'Plumbing', description: 'Installing new taps', priceFrom: 300, priceTo: 800, type: 'service' },
      { name: 'Bathroom Fitting', category: 'Plumbing', description: 'Complete bathroom setup', priceFrom: 2000, priceTo: 8000, type: 'service' },
      { name: 'Water Tank Cleaning', category: 'Plumbing', description: 'Cleaning overhead tanks', priceFrom: 1000, priceTo: 3000, type: 'service' },
    ];

    for (const service of services) {
      await VendorService.create({
        vendor: vendor2._id,
        ...service,
        isAvailable: true,
      });
    }
    console.log('Created services');

    // Create sample orders for restaurant
    console.log('Creating sample orders for restaurant...');
    const orders1 = [
      {
        vendor: vendor1._id,
        customer: { name: 'Rahul Sharma', phone: '9876543200', address: '101, ABC Apartments, Mumbai' },
        items: [
          { name: 'Butter Chicken', price: 350, quantity: 1 },
          { name: 'Garlic Naan', price: 60, quantity: 2 },
        ],
        totalAmount: 470,
        status: 'completed',
        paymentStatus: 'prepaid',
        serviceType: 'food',
      },
      {
        vendor: vendor1._id,
        customer: { name: 'Priya Patel', phone: '9876543201', address: '202, XYZ Heights, Mumbai' },
        items: [
          { name: 'Paneer Tikka', price: 280, quantity: 1 },
          { name: 'Chicken Biryani', price: 320, quantity: 1 },
        ],
        totalAmount: 600,
        status: 'completed',
        paymentStatus: 'cod',
        serviceType: 'food',
      },
      {
        vendor: vendor1._id,
        customer: { name: 'Amit Kumar', phone: '9876543202', address: '303, PQR Tower, Mumbai' },
        items: [
          { name: 'Butter Chicken', price: 350, quantity: 2 },
          { name: 'Gulab Jamun', price: 120, quantity: 2 },
        ],
        totalAmount: 940,
        status: 'pending',
        paymentStatus: 'prepaid',
        serviceType: 'food',
      },
    ];

    for (const orderData of orders1) {
      const order = await VendorOrder.create(orderData);
      
      // Create transaction for completed orders
      if (order.status === 'completed') {
        const transactionId = `TXN${Date.now()}${Math.random().toString(36).substr(2, 6).toUpperCase()}`;
        await Transaction.create({
          vendor: vendor1._id,
          order: order._id,
          transactionId,
          amount: order.totalAmount,
          status: order.paymentStatus === 'prepaid' ? 'payment_received' : 'payment_pending',
          serviceType: order.serviceType,
        });
      }
    }
    console.log('Created restaurant orders');

    // Create sample orders for plumbing
    console.log('Creating sample orders for plumbing...');
    const orders2 = [
      {
        vendor: vendor2._id,
        customer: { name: 'Suresh Verma', phone: '9876543203', address: '404, LMN Society, Delhi' },
        items: [
          { name: 'Pipe Repair', price: 800, quantity: 1 },
        ],
        totalAmount: 800,
        status: 'completed',
        paymentStatus: 'cod',
        serviceType: 'plumbing',
      },
      {
        vendor: vendor2._id,
        customer: { name: 'Neha Gupta', phone: '9876543204', address: '505, STV Complex, Delhi' },
        items: [
          { name: 'Tap Installation', price: 500, quantity: 2 },
        ],
        totalAmount: 1000,
        status: 'processing',
        paymentStatus: 'prepaid',
        serviceType: 'plumbing',
      },
    ];

    for (const orderData of orders2) {
      const order = await VendorOrder.create(orderData);
      
      if (order.status === 'completed') {
        const transactionId = `TXN${Date.now()}${Math.random().toString(36).substr(2, 6).toUpperCase()}`;
        await Transaction.create({
          vendor: vendor2._id,
          order: order._id,
          transactionId,
          amount: order.totalAmount,
          status: order.paymentStatus === 'prepaid' ? 'payment_received' : 'payment_pending',
          serviceType: order.serviceType,
        });
      }
    }
    console.log('Created plumbing orders');

    console.log('\n✅ Vendor seeding completed successfully!');
    console.log('\nTest Credentials:');
    console.log('Restaurant Vendor: restaurant@bluetomato.com / password123');
    console.log('Plumbing Vendor: plumbing@bluetomato.com / password123');

    process.exit(0);
  } catch (error) {
    console.error('Seeding failed:', error);
    process.exit(1);
  }
}

seed();
