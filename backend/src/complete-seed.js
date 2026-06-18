/**
 * ─────────────────────────────────────────────────────────────
 * Blue Tomato — Complete Database Seed Script
 * ─────────────────────────────────────────────────────────────
 * Seeds all 16 models with realistic, interconnected data:
 *   User, Vendor, Category, Subcategory, Service, ServiceProvider,
 *   VendorService, VendorOrder, Order, MenuItem, Restaurant,
 *   ServiceBooking, Transaction, Banner, AppConfig, Notification
 *
 * Usage:  npm run complete-seed
 * ─────────────────────────────────────────────────────────────
 */
require('dotenv').config();
const mongoose = require('mongoose');

// ── Models ─────────────────────────────────────────
const User = require('./models/User');
const Vendor = require('./models/Vendor');
const Category = require('./models/Category');
const Subcategory = require('./models/Subcategory');
const Service = require('./models/Service');
const ServiceProvider = require('./models/ServiceProvider');
const VendorService = require('./models/VendorService');
const VendorOrder = require('./models/VendorOrder');
const Order = require('./models/Order');
const MenuItem = require('./models/MenuItem');
const Restaurant = require('./models/Restaurant');
const ServiceBooking = require('./models/ServiceBooking');
const Transaction = require('./models/Transaction');
const Banner = require('./models/Banner');
const AppConfig = require('./models/AppConfig');
const Notification = require('./models/Notification');

// ── Helpers ────────────────────────────────────────
const URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/blue-tomato';

function generateOrderId() {
  const date = new Date();
  const dateStr = date.toISOString().slice(0, 10).replace(/-/g, '');
  const random = Math.floor(1000 + Math.random() * 9000);
  return `ORD${dateStr}${random}`;
}

function generateTransactionId() {
  return `TXN${Date.now()}${Math.random().toString(36).substr(2, 6).toUpperCase()}`;
}

function daysFromNow(days) {
  const d = new Date();
  d.setDate(d.getDate() + days);
  return d;
}

function hoursAgo(hours) {
  const d = new Date();
  d.setHours(d.getHours() - hours);
  return d;
}

// ── Main Seed ──────────────────────────────────────
async function seed() {
  try {
    await mongoose.connect(URI);
    console.log('✓ Connected to MongoDB');

    // ───────────────────────────────────────────────
    //  0.  Clear existing data (preserve admin users)
    // ───────────────────────────────────────────────
    console.log('\n—— Clearing existing data (preserving admin users) ——');

    await AppConfig.deleteMany({});
    await Banner.deleteMany({});
    await Notification.deleteMany({});
    await Transaction.deleteMany({});
    await VendorOrder.deleteMany({});
    await Order.deleteMany({});
    await ServiceBooking.deleteMany({});
    await VendorService.deleteMany({});
    await Service.deleteMany({});
    await ServiceProvider.deleteMany({});
    await MenuItem.deleteMany({});
    await Restaurant.deleteMany({});
    await Vendor.deleteMany({});
    await Subcategory.deleteMany({});
    await Category.deleteMany({});
    await User.deleteMany({ role: { $ne: 'admin' } }); // keep existing admin

    console.log('✓ Non-admin data cleared');

    // ───────────────────────────────────────────────
    //  1.  Categories
    // ───────────────────────────────────────────────
    console.log('\n—— Seeding Categories ——');

    const categories = await Category.insertMany([
      { name: 'Plumbing', image: 'water', description: 'Pipe repairs, tap installation, drainage solutions', isActive: true },
      { name: 'Electrical', image: 'flash', description: 'Wiring, switchboard repair, fan installation', isActive: true },
      { name: 'Cleaning', image: 'sparkles', description: 'Home deep cleaning, office cleaning, sofa cleaning', isActive: true },
      { name: 'Carpentry', image: 'hammer', description: 'Furniture repair, custom woodwork, door fixing', isActive: true },
      { name: 'Painting', image: 'color-palette', description: 'Interior & exterior painting, texture work', isActive: true },
      { name: 'Appliance Repair', image: 'hardware-chip', description: 'AC, fridge, washing machine, microwave repair', isActive: true },
      { name: 'Pest Control', image: 'bug', description: 'Cockroach, termite, mosquito, rodent control', isActive: true },
    ]);
    const catMap = {};
    categories.forEach(c => { catMap[c.name] = c._id; });
    console.log(`✓ ${categories.length} categories created`);

    // ───────────────────────────────────────────────
    //  2.  Subcategories
    // ───────────────────────────────────────────────
    console.log('\n—— Seeding Subcategories ——');

    const subcategories = await Subcategory.insertMany([
      // Plumbing
      { name: 'Pipe Repair', category: catMap['Plumbing'], basePrice: 499, description: 'Fix leaking or burst pipes', isActive: true },
      { name: 'Tap Installation', category: catMap['Plumbing'], basePrice: 299, description: 'Install new faucets and taps', isActive: true },
      { name: 'Drain Cleaning', category: catMap['Plumbing'], basePrice: 399, description: 'Unclog blocked drains', isActive: true },
      { name: 'Water Heater Repair', category: catMap['Plumbing'], basePrice: 599, description: 'Geyser repair and maintenance', isActive: true },
      // Electrical
      { name: 'Switchboard Repair', category: catMap['Electrical'], basePrice: 249, description: 'Fix switches and sockets', isActive: true },
      { name: 'Fan Installation', category: catMap['Electrical'], basePrice: 349, description: 'Ceiling fan installation', isActive: true },
      { name: 'Wiring', category: catMap['Electrical'], basePrice: 999, description: 'Complete or partial house wiring', isActive: true },
      { name: 'Lighting Installation', category: catMap['Electrical'], basePrice: 199, description: 'Install lights and fixtures', isActive: true },
      // Cleaning
      { name: 'Home Deep Cleaning', category: catMap['Cleaning'], basePrice: 1999, description: 'Full house deep cleaning (1-2 BHK)', isActive: true },
      { name: 'Kitchen Cleaning', category: catMap['Cleaning'], basePrice: 799, description: 'Deep kitchen cleaning & degreasing', isActive: true },
      { name: 'Sofa Cleaning', category: catMap['Cleaning'], basePrice: 499, description: 'Upholstery cleaning per seat', isActive: true },
      // Carpentry
      { name: 'Furniture Repair', category: catMap['Carpentry'], basePrice: 399, description: 'Repair broken furniture', isActive: true },
      { name: 'Door Fixing', category: catMap['Carpentry'], basePrice: 299, description: 'Fix jammed doors, hinges, handles', isActive: true },
      { name: 'Custom Furniture', category: catMap['Carpentry'], basePrice: 5000, description: 'Custom-built shelves, cabinets', isActive: true },
      // Painting
      { name: 'Interior Painting', category: catMap['Painting'], basePrice: 3000, description: 'Interior wall painting per room', isActive: true },
      { name: 'Texture Painting', category: catMap['Painting'], basePrice: 4500, description: 'Decorative texture finishes', isActive: true },
      // Appliance Repair
      { name: 'AC Repair', category: catMap['Appliance Repair'], basePrice: 399, description: 'AC servicing and repair', isActive: true },
      { name: 'Fridge Repair', category: catMap['Appliance Repair'], basePrice: 449, description: 'Refrigerator repair service', isActive: true },
      { name: 'Washing Machine Repair', category: catMap['Appliance Repair'], basePrice: 349, description: 'Front & top load repair', isActive: true },
      // Pest Control
      { name: 'General Pest Control', category: catMap['Pest Control'], basePrice: 999, description: 'Cockroach, ant & spider control', isActive: true },
      { name: 'Termite Control', category: catMap['Pest Control'], basePrice: 2999, description: 'Complete termite treatment', isActive: true },
    ]);
    const subcatByCat = {};
    subcategories.forEach(s => {
      const catName = categories.find(c => c._id.equals(s.category))?.name;
      if (catName) {
        if (!subcatByCat[catName]) subcatByCat[catName] = [];
        subcatByCat[catName].push(s._id);
      }
    });
    console.log(`✓ ${subcategories.length} subcategories created`);

    // ───────────────────────────────────────────────
    //  3.  Users (Customers)
    // ───────────────────────────────────────────────
    console.log('\n—— Seeding Users ——');

    const customerData = [
      {
        name: 'Rahul Sharma',
        email: 'rahul@demo.com',
        phone: '+919876500001',
        password: 'demo123',
        loginMethod: 'email',
        role: 'customer',
        isVerified: true,
        isActive: true,
        addresses: [
          { label: 'Home', addressLine1: 'A-101, Green Apartments', city: 'Mumbai', state: 'Maharashtra', pincode: '400001', lat: 19.0760, lng: 72.8777, isDefault: true },
          { label: 'Work', addressLine1: 'BKC, Bandra East', city: 'Mumbai', state: 'Maharashtra', pincode: '400051', lat: 19.0636, lng: 72.8319, isDefault: false },
        ],
      },
      {
        name: 'Priya Patel',
        email: 'priya@demo.com',
        phone: '+919876500002',
        password: 'demo123',
        loginMethod: 'email',
        role: 'customer',
        isVerified: true,
        isActive: true,
        addresses: [
          { label: 'Home', addressLine1: '42, Sunshine Society', city: 'Delhi', state: 'Delhi', pincode: '110001', lat: 28.7041, lng: 77.1025, isDefault: true },
        ],
      },
      {
        name: 'Amit Kumar',
        email: 'amit@demo.com',
        phone: '+919876500003',
        password: 'demo123',
        loginMethod: 'email',
        role: 'customer',
        isVerified: true,
        isActive: true,
        addresses: [
          { label: 'Home', addressLine1: '7, Lake View Colony', city: 'Bangalore', state: 'Karnataka', pincode: '560001', lat: 12.9716, lng: 77.5946, isDefault: true },
        ],
      },
      {
        name: 'Sneha Reddy',
        email: 'sneha@demo.com',
        phone: '+919876500004',
        password: 'demo123',
        loginMethod: 'email',
        role: 'customer',
        isVerified: true,
        isActive: true,
        addresses: [
          { label: 'Home', addressLine1: '12-3-456, Himayatnagar', city: 'Hyderabad', state: 'Telangana', pincode: '500029', lat: 17.3850, lng: 78.4867, isDefault: true },
        ],
      },
      {
        name: 'Vikram Singh',
        email: 'vikram@demo.com',
        phone: '+919876500005',
        password: 'demo123',
        loginMethod: 'email',
        role: 'customer',
        isVerified: true,
        isActive: true,
        addresses: [
          { label: 'Home', addressLine1: '88, Rajput Nagar', city: 'Jaipur', state: 'Rajasthan', pincode: '302001', lat: 26.9124, lng: 75.7873, isDefault: true },
        ],
      },
    ];

    const customers = [];
    for (const data of customerData) {
      let user = await User.findOne({ email: data.email });
      if (!user) {
        user = await User.create(data);
        console.log(`  Created user: ${user.name} (${user.email})`);
      } else {
        console.log(`  Skipped (exists): ${user.name}`);
      }
      customers.push(user);
    }
    const customerMap = {};
    customers.forEach(c => { customerMap[c.email] = c._id; });

    // Admin user
    const existingAdmin = await User.findOne({ role: 'admin' });
    let adminUser;
    if (!existingAdmin) {
      adminUser = await User.create({
        name: 'Super Admin',
        email: 'admin@bluetomato.com',
        phone: '+911234567890',
        password: 'Admin@123',
        loginMethod: 'email',
        role: 'admin',
        isVerified: true,
        isActive: true,
      });
      console.log(`✓ Admin created: ${adminUser.email}`);
    } else {
      adminUser = existingAdmin;
      console.log(`✓ Admin exists: ${adminUser.email}`);
    }

    // ───────────────────────────────────────────────
    //  4.  Service Providers
    // ───────────────────────────────────────────────
    console.log('\n—— Seeding Service Providers ——');

    const serviceProviderData = [
      {
        userId: customerMap['rahul@demo.com'], displayName: 'Rahul Sharma', bio: 'Experienced plumber with 8 years of expertise',
        specializations: ['Plumbing', 'Carpentry'], experienceYears: 8, rating: 4.7, totalRatingsCount: 124, completedJobs: 340,
        location: { type: 'Point', coordinates: [72.8777, 19.0760] }, serviceCity: 'Mumbai', serviceRadius: 15,
        isAvailableNow: true, isVerified: true, isActive: true, isOnboarded: true,
      },
      {
        userId: customerMap['priya@demo.com'], displayName: 'Priya Patel', bio: 'Expert electrician and home appliance specialist',
        specializations: ['Electrical', 'Appliance Repair'], experienceYears: 6, rating: 4.5, totalRatingsCount: 89, completedJobs: 210,
        location: { type: 'Point', coordinates: [77.1025, 28.7041] }, serviceCity: 'Delhi', serviceRadius: 20,
        isAvailableNow: true, isVerified: true, isActive: true, isOnboarded: true,
      },
      {
        userId: customerMap['amit@demo.com'], displayName: 'Amit Kumar', bio: 'Professional painter and decorator',
        specializations: ['Painting', 'Cleaning'], experienceYears: 10, rating: 4.9, totalRatingsCount: 256, completedJobs: 580,
        location: { type: 'Point', coordinates: [77.5946, 12.9716] }, serviceCity: 'Bangalore', serviceRadius: 10,
        isAvailableNow: true, isVerified: true, isActive: true, isOnboarded: true,
      },
    ];

    const providers = [];
    for (const data of serviceProviderData) {
      const existing = await ServiceProvider.findOne({ userId: data.userId });
      if (!existing) {
        const sp = await ServiceProvider.create(data);
        providers.push(sp);
        console.log(`  Created provider: ${sp.displayName}`);
      } else {
        providers.push(existing);
        console.log(`  Skipped (exists): ${existing.displayName}`);
      }
    }

    // ───────────────────────────────────────────────
    //  5.  Services (Home Services)
    // ───────────────────────────────────────────────
    console.log('\n—— Seeding Home Services ——');

    const homeServicesData = [
      // Plumbing services
      { providerId: providers[0]._id, name: 'Leaking Pipe Repair', description: 'Fix all types of leaking pipes', category: 'Plumbing', basePrice: 499, priceType: 'starting_from', estimatedDuration: 60, rating: 4.6, reviewCount: 89, image: 'https://images.unsplash.com/photo-1607472586893-edb57bdc0e39?w=400', isAvailable: true, isFeatured: true },
      { providerId: providers[0]._id, name: 'Tap Installation', description: 'Install new mixer taps & faucets', category: 'Plumbing', basePrice: 299, priceType: 'starting_from', estimatedDuration: 30, rating: 4.4, reviewCount: 56, image: 'https://images.unsplash.com/photo-1585409677983-0f6c41ca9c3b?w=400', isAvailable: true },
      { providerId: providers[0]._id, name: 'Drain Unclogging', description: 'Clear blocked kitchen & bathroom drains', category: 'Plumbing', basePrice: 399, priceType: 'fixed', estimatedDuration: 45, rating: 4.3, reviewCount: 120, image: 'https://images.unsplash.com/photo-1581578731548-c64695cc6952?w=400', isAvailable: true },
      // Electrical services
      { providerId: providers[1]._id, name: 'Switchboard Repair', description: 'Fix or replace damaged switchboards', category: 'Electrical', basePrice: 249, priceType: 'starting_from', estimatedDuration: 30, rating: 4.5, reviewCount: 67, image: 'https://images.unsplash.com/photo-1558618666-fcd25c85f82e?w=400', isAvailable: true },
      { providerId: providers[1]._id, name: 'Ceiling Fan Installation', description: 'Install new ceiling fans with wiring', category: 'Electrical', basePrice: 349, priceType: 'fixed', estimatedDuration: 45, rating: 4.7, reviewCount: 78, image: 'https://images.unsplash.com/photo-1615567964485-6c2c2e9b57c1?w=400', isAvailable: true, isFeatured: true },
      { providerId: providers[1]._id, name: 'AC Servicing', description: 'Complete AC cleaning and gas refill', category: 'Appliance Repair', basePrice: 499, priceType: 'starting_from', estimatedDuration: 60, rating: 4.2, reviewCount: 34, image: 'https://images.unsplash.com/photo-1585771724684-38269d6639fd?w=400', isAvailable: true },
      // Painting services
      { providerId: providers[2]._id, name: 'Interior Wall Painting', description: 'Premium interior painting with Asian Paints', category: 'Painting', basePrice: 3000, priceType: 'starting_from', estimatedDuration: 240, rating: 4.8, reviewCount: 156, image: 'https://images.unsplash.com/photo-1581858726788-75bc0f6a952d?w=400', isAvailable: true, isFeatured: true },
      { providerId: providers[2]._id, name: 'Home Deep Cleaning', description: 'Complete 2BHK deep cleaning service', category: 'Cleaning', basePrice: 2499, priceType: 'fixed', estimatedDuration: 180, rating: 4.6, reviewCount: 98, image: 'https://images.unsplash.com/photo-1581578731548-c64695cc6952?w=400', isAvailable: true },
      { providerId: providers[2]._id, name: 'Kitchen Deep Cleaning', description: 'Degrease and sanitize your kitchen', category: 'Cleaning', basePrice: 999, priceType: 'fixed', estimatedDuration: 120, rating: 4.4, reviewCount: 72, image: 'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=400', isAvailable: true },
    ];

    const services = [];
    for (const data of homeServicesData) {
      const existing = await Service.findOne({ name: data.name, providerId: data.providerId });
      if (!existing) {
        const svc = await Service.create(data);
        services.push(svc);
        console.log(`  Created service: ${svc.name}`);
      } else {
        services.push(existing);
        console.log(`  Skipped (exists): ${existing.name}`);
      }
    }

    // ───────────────────────────────────────────────
    //  6.  Restaurants
    // ───────────────────────────────────────────────
    console.log('\n—— Seeding Restaurants ——');

    const restaurantData = [
      {
        name: 'Paradise Biryani', description: 'Authentic Hyderabadi Dum Biryani since 1953',
        cuisines: ['Biryani', 'Mughlai', 'Indian'], category: 'non-veg',
        coverImage: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=800',
        logo: 'https://images.unsplash.com/photo-1631515243349-e0cb75fb8d3a?w=200',
        deliveryRating: 4.6, diningRating: 4.5, totalRatingsCount: 10500,
        costForTwo: 600,
        deliveryTime: { min: 25, max: 40 }, deliveryFee: 30, freeDeliveryAbove: 199, minimumOrderAmount: 99,
        offerTag: '20% OFF on first order',
        location: { type: 'Point', coordinates: [78.4867, 17.3850], address: 'Banjara Hills, Road No 12', city: 'Hyderabad', state: 'Telangana', pincode: '500034' },
        openingHours: [
          { day: 'Monday', openTime: '10:00', closeTime: '23:00', isClosed: false },
          { day: 'Tuesday', openTime: '10:00', closeTime: '23:00', isClosed: false },
          { day: 'Wednesday', openTime: '10:00', closeTime: '23:00', isClosed: false },
          { day: 'Thursday', openTime: '10:00', closeTime: '23:00', isClosed: false },
          { day: 'Friday', openTime: '10:00', closeTime: '23:30', isClosed: false },
          { day: 'Saturday', openTime: '09:00', closeTime: '23:30', isClosed: false },
          { day: 'Sunday', openTime: '09:00', closeTime: '23:00', isClosed: false },
        ],
        isOpen: true, isActive: true, isFeatured: true,
      },
      {
        name: 'Punjab Grill', description: 'North Indian fine dining with a modern twist',
        cuisines: ['North Indian', 'Punjabi', 'Tandoor'], category: 'both',
        coverImage: 'https://images.unsplash.com/photo-1552566626-52f8b828add9?w=800',
        logo: 'https://images.unsplash.com/photo-1512152272829-e3139592d56f?w=200',
        deliveryRating: 4.3, diningRating: 4.4, totalRatingsCount: 7800,
        costForTwo: 800,
        deliveryTime: { min: 30, max: 45 }, deliveryFee: 40, freeDeliveryAbove: 299, minimumOrderAmount: 149,
        offerTag: 'FREE DELIVERY above ₹299',
        location: { type: 'Point', coordinates: [77.1025, 28.7041], address: 'Connaught Place, Outer Circle', city: 'Delhi', state: 'Delhi', pincode: '110001' },
        openingHours: [
          { day: 'Monday', openTime: '11:00', closeTime: '22:30', isClosed: false },
          { day: 'Tuesday', openTime: '11:00', closeTime: '22:30', isClosed: false },
          { day: 'Wednesday', openTime: '11:00', closeTime: '22:30', isClosed: false },
          { day: 'Thursday', openTime: '11:00', closeTime: '22:30', isClosed: false },
          { day: 'Friday', openTime: '11:00', closeTime: '23:00', isClosed: false },
          { day: 'Saturday', openTime: '10:00', closeTime: '23:00', isClosed: false },
          { day: 'Sunday', openTime: '10:00', closeTime: '22:30', isClosed: false },
        ],
        isOpen: true, isActive: true, isFeatured: true,
      },
      {
        name: 'Healthy Bowl', description: 'Fresh salads, smoothies & healthy meals',
        cuisines: ['Healthy', 'Salads', 'Continental'], category: 'veg',
        coverImage: 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=800',
        logo: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=200',
        deliveryRating: 4.5, diningRating: 4.2, totalRatingsCount: 3400,
        costForTwo: 450,
        deliveryTime: { min: 15, max: 25 }, deliveryFee: 20, freeDeliveryAbove: 149, minimumOrderAmount: 79,
        offerTag: 'BUY 1 GET 1 on smoothies',
        location: { type: 'Point', coordinates: [77.5946, 12.9716], address: 'Indiranagar, 100 Feet Road', city: 'Bangalore', state: 'Karnataka', pincode: '560038' },
        openingHours: [
          { day: 'Monday', openTime: '08:00', closeTime: '22:00', isClosed: false },
          { day: 'Tuesday', openTime: '08:00', closeTime: '22:00', isClosed: false },
          { day: 'Wednesday', openTime: '08:00', closeTime: '22:00', isClosed: false },
          { day: 'Thursday', openTime: '08:00', closeTime: '22:00', isClosed: false },
          { day: 'Friday', openTime: '08:00', closeTime: '22:00', isClosed: false },
          { day: 'Saturday', openTime: '09:00', closeTime: '22:00', isClosed: false },
          { day: 'Sunday', openTime: '09:00', closeTime: '21:00', isClosed: false },
        ],
        isOpen: true, isActive: true, isFeatured: false,
      },
    ];

    const restaurants = [];
    for (const data of restaurantData) {
      const existing = await Restaurant.findOne({ name: data.name });
      if (!existing) {
        const r = await Restaurant.create(data);
        restaurants.push(r);
        console.log(`  Created restaurant: ${r.name}`);
      } else {
        restaurants.push(existing);
        console.log(`  Skipped (exists): ${existing.name}`);
      }
    }

    // ───────────────────────────────────────────────
    //  7.  Menu Items
    // ───────────────────────────────────────────────
    console.log('\n—— Seeding Menu Items ——');

    const menuItemData = [
      // Paradise Biryani
      { restaurantId: restaurants[0]._id, name: 'Hyderabadi Chicken Dum Biryani', description: 'Aromatic basmati rice layered with tender chicken', category: 'Biryani', isVeg: false, price: 299, variants: [{ name: 'Half', price: 179 }, { name: 'Full', price: 299 }], addons: [{ name: 'Extra Raita', price: 30 }, { name: 'Extra Gravy', price: 40 }], image: 'https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?w=400', rating: 4.8, reviewsCount: 1520, isBestseller: true, isRecommended: true, isSpicy: true, calories: 650, isAvailable: true, sortOrder: 1 },
      { restaurantId: restaurants[0]._id, name: 'Mutton Biryani', description: 'Tender mutton pieces cooked in rich spices', category: 'Biryani', isVeg: false, price: 399, variants: [{ name: 'Half', price: 229 }, { name: 'Full', price: 399 }], image: 'https://images.unsplash.com/photo-1589302168068-964664d93cb0?w=400', rating: 4.7, reviewsCount: 980, isBestseller: true, isRecommended: true, isSpicy: true, calories: 720, isAvailable: true, sortOrder: 2 },
      { restaurantId: restaurants[0]._id, name: 'Chicken 65', description: 'Spicy deep-fried chicken appetizer', category: 'Starters', isVeg: false, price: 249, variants: [{ name: 'Regular', price: 249 }, { name: 'Large', price: 399 }], image: 'https://images.unsplash.com/photo-1567620832903-9fc6debc209f?w=400', rating: 4.5, reviewsCount: 670, isBestseller: false, isSpicy: true, calories: 400, isAvailable: true, sortOrder: 3 },
      { restaurantId: restaurants[0]._id, name: 'Gulab Jamun', description: 'Soft milk dumplings in rose syrup', category: 'Desserts', isVeg: true, price: 99, image: 'https://images.unsplash.com/photo-1666190050266-6427e73b1ea7?w=400', rating: 4.6, reviewsCount: 420, isRecommended: true, calories: 280, isAvailable: true, sortOrder: 10 },
      // Punjab Grill
      { restaurantId: restaurants[1]._id, name: 'Butter Chicken', description: 'Creamy tomato-based curry with tender chicken', category: 'Main Course', isVeg: false, price: 399, variants: [{ name: 'Half', price: 249 }, { name: 'Full', price: 399 }], addons: [{ name: 'Extra Cream', price: 50 }, { name: 'Cheese Dip', price: 30 }], image: 'https://images.unsplash.com/photo-1603894584373-5ac82b2ae398?w=400', rating: 4.7, reviewsCount: 2100, isBestseller: true, isRecommended: true, calories: 550, isAvailable: true, sortOrder: 1 },
      { restaurantId: restaurants[1]._id, name: 'Dal Makhani', description: 'Slow-cooked black lentils in rich gravy', category: 'Main Course', isVeg: true, price: 249, variants: [{ name: 'Half', price: 159 }, { name: 'Full', price: 249 }], image: 'https://images.unsplash.com/photo-1546833999-b9f581a1996d?w=400', rating: 4.6, reviewsCount: 1340, isBestseller: true, calories: 350, isAvailable: true, sortOrder: 2 },
      { restaurantId: restaurants[1]._id, name: 'Tandoori Roti', description: 'Whole wheat bread from clay oven', category: 'Breads', isVeg: true, price: 35, image: 'https://images.unsplash.com/photo-1565557623262-b1c8757b94e8?w=400', rating: 4.3, reviewsCount: 890, isAvailable: true, sortOrder: 6 },
      { restaurantId: restaurants[1]._id, name: 'Paneer Tikka', description: 'Grilled cottage cheese with bell peppers', category: 'Starters', isVeg: true, price: 299, variants: [{ name: 'Regular', price: 299 }, { name: 'Large', price: 449 }], addons: [{ name: 'Mint Chutney', price: 20 }], image: 'https://images.unsplash.com/photo-1567188040759-fb8a883dc6d8?w=400', rating: 4.4, reviewsCount: 560, isRecommended: true, isAvailable: true, sortOrder: 3 },
      { restaurantId: restaurants[1]._id, name: 'Mango Lassi', description: 'Creamy yogurt drink with mango pulp', category: 'Beverages', isVeg: true, price: 119, image: 'https://images.unsplash.com/photo-1527661591475-527312dd65f5?w=400', rating: 4.5, reviewsCount: 340, isAvailable: true, sortOrder: 11 },
      // Healthy Bowl
      { restaurantId: restaurants[2]._id, name: 'Classic Caesar Salad', description: 'Crisp romaine lettuce, parmesan, croutons', category: 'Salads', isVeg: true, price: 249, addons: [{ name: 'Grilled Chicken', price: 80 }, { name: 'Extra Avocado', price: 60 }], image: 'https://images.unsplash.com/photo-1546793665-c74683f339c1?w=400', rating: 4.5, reviewsCount: 230, isBestseller: true, calories: 320, isAvailable: true, sortOrder: 1 },
      { restaurantId: restaurants[2]._id, name: 'Protein Smoothie Bowl', description: 'Acai base with granola, banana, berries', category: 'Bowls', isVeg: true, price: 299, image: 'https://images.unsplash.com/photo-1590301157890-4810ed352733?w=400', rating: 4.6, reviewsCount: 180, isBestseller: true, isRecommended: true, calories: 280, isAvailable: true, sortOrder: 2 },
      { restaurantId: restaurants[2]._id, name: 'Quinoa Buddha Bowl', description: 'Quinoa with roasted veggies, hummus, greens', category: 'Bowls', isVeg: true, price: 349, addons: [{ name: 'Extra Hummus', price: 50 }, { name: 'Grilled Paneer', price: 70 }], image: 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=400', rating: 4.4, reviewsCount: 145, isRecommended: true, calories: 380, isAvailable: true, sortOrder: 3 },
    ];

    const menuItems = [];
    for (const data of menuItemData) {
      const existing = await MenuItem.findOne({ name: data.name, restaurantId: data.restaurantId });
      if (!existing) {
        const mi = await MenuItem.create(data);
        menuItems.push(mi);
      } else {
        menuItems.push(existing);
      }
    }
    console.log(`✓ ${menuItems.length} menu items seeded`);

    // ───────────────────────────────────────────────
    //  8.  Banners
    // ───────────────────────────────────────────────
    console.log('\n—— Seeding Banners ——');

    const bannersData = [
      { title: 'Weekend Feast', subtitle: 'Get 20% off on all Biryani orders!', image: 'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=800', actionType: 'category', actionValue: 'Biryani', targetApp: 'user', sortOrder: 1, isActive: true, startDate: null, endDate: daysFromNow(30), createdBy: adminUser._id },
      { title: 'Home Cleaning Special', subtitle: 'Flat ₹500 off on deep cleaning', image: 'https://images.unsplash.com/photo-1581578731548-c64695cc6952?w=800', actionType: 'category', actionValue: 'Cleaning', targetApp: 'user', sortOrder: 2, isActive: true, startDate: null, endDate: daysFromNow(15), createdBy: adminUser._id },
      { title: 'Vendor Onboarding', subtitle: 'Join as a vendor and earn ₹10k/month', image: 'https://images.unsplash.com/photo-1553729459-afe8f2e0d106?w=800', actionType: 'screen', actionValue: 'Register', targetApp: 'vendor', sortOrder: 1, isActive: true, startDate: null, endDate: daysFromNow(60), createdBy: adminUser._id },
      { title: 'New on Blue Tomato', subtitle: 'Healthy Bowls now available!', image: 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=800', actionType: 'restaurant', actionValue: restaurants[2]._id.toString(), targetApp: 'user', sortOrder: 3, isActive: true, startDate: null, endDate: daysFromNow(45), createdBy: adminUser._id },
    ];

    const banners = await Banner.insertMany(bannersData);
    console.log(`✓ ${banners.length} banners created`);

    // ───────────────────────────────────────────────
    //  9.  App Configs
    // ───────────────────────────────────────────────
    console.log('\n—— Seeding App Configs ——');

    const appConfigsData = [
      {
        appType: 'user',
        colors: { primary: '#0ea5e9', primaryDark: '#0284c7', primaryLight: '#bae6fd', secondary: '#f97316', success: '#22c55e', warning: '#f59e0b', danger: '#ef4444', background: '#f8fafc', surface: '#ffffff', text: '#0f172a', textSecondary: '#64748b' },
        fontFamily: 'System',
        features: { showBanner: true, showCategories: true, showFeatured: true, showOffers: true, enableSearch: true, enableNotifications: true, enableChat: true, enableReviews: true },
        layout: { bannerHeight: 180, cardRadius: 12, gridColumns: 2 },
        updatedBy: adminUser._id,
      },
      {
        appType: 'vendor',
        colors: { primary: '#059669', primaryDark: '#047857', primaryLight: '#a7f3d0', secondary: '#f97316', success: '#22c55e', warning: '#f59e0b', danger: '#ef4444', background: '#f0fdf4', surface: '#ffffff', text: '#0f172a', textSecondary: '#64748b' },
        fontFamily: 'System',
        features: { showBanner: true, showCategories: true, showFeatured: true, showOffers: true, enableSearch: true, enableNotifications: true, enableChat: true, enableReviews: true },
        layout: { bannerHeight: 160, cardRadius: 10, gridColumns: 2 },
        updatedBy: adminUser._id,
      },
    ];

    for (const data of appConfigsData) {
      const existing = await AppConfig.findOne({ appType: data.appType });
      if (!existing) {
        await AppConfig.create(data);
        console.log(`  Created config: ${data.appType}`);
      } else {
        console.log(`  Skipped (exists): ${data.appType}`);
      }
    }

    // ───────────────────────────────────────────────
    // 10.  Vendors
    // ───────────────────────────────────────────────
    console.log('\n—— Seeding Vendors ——');

    const vendorData = [
      {
        name: 'Spice Garden Restaurant', email: 'spicegarden@bluetomato.com', phone: '9876500101',
        password: 'password123', registrationType: 'restaurant',
        serviceCategory: catMap['Plumbing'], // mapped to first cat — in practice each vendor has one
        serviceSubcategories: [subcatByCat['Plumbing'][0]],
        dateOfBirth: new Date('1988-03-15'), gender: 'Male', bloodGroup: 'O+', emergencyContact: '9876500199',
        currentAddress: { apartment: '42, Food Lane', city: 'Mumbai', state: 'Maharashtra', country: 'India', zip: '400001' },
        sameAsCurrentAddress: true,
        bankDetails: { bankName: 'HDFC Bank', accountHolderName: 'Spice Garden Restaurant', accountNumber: '111122223333', ifscCode: 'HDFC0001234' },
        profilePic: 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=200',
        isVerified: true, isActive: true, isOnline: true, kycComplete: true,
        approvalStatus: 'approved', approvedAt: hoursAgo(720),
      },
      {
        name: 'Quick Fix Plumbing', email: 'quickfix@bluetomato.com', phone: '9876500202',
        password: 'password123', registrationType: 'plumbing',
        serviceCategory: catMap['Plumbing'],
        serviceSubcategories: [subcatByCat['Plumbing'][0], subcatByCat['Plumbing'][1], subcatByCat['Plumbing'][2]],
        dateOfBirth: new Date('1985-07-22'), gender: 'Male', bloodGroup: 'B+', emergencyContact: '9876500299',
        aadhaar: { number: '123456789012' },
        pan: { number: 'ABCDE1234F' },
        currentAddress: { apartment: '7, Service Colony', city: 'Mumbai', state: 'Maharashtra', country: 'India', zip: '400012' },
        sameAsCurrentAddress: true,
        bankDetails: { bankName: 'SBI Bank', accountHolderName: 'Quick Fix Plumbing', accountNumber: '9876543210', ifscCode: 'SBIN0001234' },
        profilePic: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200',
        isVerified: true, isActive: true, isOnline: true, kycComplete: true,
        approvalStatus: 'approved', approvedAt: hoursAgo(480),
      },
      {
        name: 'ElectroTech Services', email: 'electrotech@bluetomato.com', phone: '9876500303',
        password: 'password123', registrationType: 'electrical',
        serviceCategory: catMap['Electrical'],
        serviceSubcategories: [subcatByCat['Electrical'][0], subcatByCat['Electrical'][1], subcatByCat['Electrical'][2]],
        dateOfBirth: new Date('1990-11-05'), gender: 'Male', bloodGroup: 'A+', emergencyContact: '9876500399',
        aadhaar: { number: '987654321098' },
        pan: { number: 'FGHIJ5678K' },
        currentAddress: { apartment: '12, Electronic Nagar', city: 'Delhi', state: 'Delhi', country: 'India', zip: '110001' },
        sameAsCurrentAddress: true,
        bankDetails: { bankName: 'ICICI Bank', accountHolderName: 'ElectroTech Services', accountNumber: '556677889900', ifscCode: 'ICIC0005678' },
        profilePic: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=200',
        isVerified: true, isActive: true, isOnline: true, kycComplete: true,
        approvalStatus: 'approved', approvedAt: hoursAgo(360),
      },
      {
        name: 'Sparkle Clean Pro', email: 'sparkle@bluetomato.com', phone: '9876500404',
        password: 'password123', registrationType: 'cleaning',
        serviceCategory: catMap['Cleaning'],
        serviceSubcategories: [subcatByCat['Cleaning'][0], subcatByCat['Cleaning'][1], subcatByCat['Cleaning'][2]],
        dateOfBirth: new Date('1992-04-18'), gender: 'Female', bloodGroup: 'AB+', emergencyContact: '9876500499',
        currentAddress: { apartment: '88, Cleaners Street', city: 'Bangalore', state: 'Karnataka', country: 'India', zip: '560001' },
        sameAsCurrentAddress: false,
        permanentAddress: { apartment: '88, Cleaners Street', city: 'Bangalore', state: 'Karnataka', country: 'India', zip: '560001' },
        bankDetails: { bankName: 'Axis Bank', accountHolderName: 'Sparkle Clean Pro', accountNumber: '223344556677', ifscCode: 'UTIB0009101' },
        profilePic: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=200',
        isVerified: true, isActive: true, isOnline: false, kycComplete: true,
        approvalStatus: 'approved', approvedAt: hoursAgo(240),
      },
      {
        name: 'New Painters Co', email: 'painters@bluetomato.com', phone: '9876500505',
        password: 'password123', registrationType: 'painting',
        serviceCategory: catMap['Painting'],
        serviceSubcategories: [subcatByCat['Painting'][0], subcatByCat['Painting'][1]],
        dateOfBirth: new Date('1987-09-30'), gender: 'Male', bloodGroup: 'O-',
        currentAddress: { apartment: '5, Art Colony', city: 'Jaipur', state: 'Rajasthan', country: 'India', zip: '302001' },
        bankDetails: { bankName: 'HDFC Bank', accountHolderName: 'New Painters Co', accountNumber: '998877665544', ifscCode: 'HDFC0009876' },
        profilePic: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=200',
        isVerified: true, isActive: true, isOnline: true, kycComplete: true,
        approvalStatus: 'approved', approvedAt: hoursAgo(168),
      },
      {
        name: 'Pending Vendor', email: 'pending@bluetomato.com', phone: '9876500606',
        password: 'password123', registrationType: 'plumbing',
        serviceCategory: catMap['Plumbing'],
        serviceSubcategories: [subcatByCat['Plumbing'][3]],
        currentAddress: { apartment: '99, New Market', city: 'Mumbai', state: 'Maharashtra', country: 'India', zip: '400001' },
        bankDetails: { bankName: 'SBI', accountHolderName: 'Pending Vendor', accountNumber: '112233445566', ifscCode: 'SBIN0001122' },
        isVerified: false, isActive: false, isOnline: false, kycComplete: false,
        approvalStatus: 'pending',
      },
    ];

    const vendors = [];
    for (const data of vendorData) {
      const existing = await Vendor.findOne({ email: data.email });
      if (!existing) {
        const v = await Vendor.create(data);
        vendors.push(v);
        console.log(`  Created vendor: ${v.name} (${v.email})`);
      } else {
        vendors.push(existing);
        console.log(`  Skipped (exists): ${existing.name}`);
      }
    }

    // ───────────────────────────────────────────────
    // 11.  Vendor Services (menu items & services)
    // ───────────────────────────────────────────────
    console.log('\n—— Seeding Vendor Services ——');

    const vendorServicesData = [];
    // Restaurant vendor items (Spice Garden)
    const foodItems = [
      { name: 'Butter Chicken', category: 'Main Course', description: 'Creamy tomato-based curry', price: 350, type: 'food' },
      { name: 'Dal Makhani', category: 'Main Course', description: 'Slow cooked black lentils', price: 220, type: 'food' },
      { name: 'Paneer Tikka', category: 'Starters', description: 'Grilled cottage cheese', price: 280, type: 'food' },
      { name: 'Garlic Naan', category: 'Breads', description: 'Tandoori bread with garlic butter', price: 60, type: 'food' },
      { name: 'Chicken Biryani', category: 'Rice', description: 'Aromatic basmati with chicken', price: 320, type: 'food' },
      { name: 'Gulab Jamun', category: 'Desserts', description: 'Sweet milk dumplings', price: 120, type: 'food' },
    ];
    foodItems.forEach(item => {
      vendorServicesData.push({ vendor: vendors[0]._id, ...item, isAvailable: true });
    });

    // Plumbing vendor services
    const plumbingServices = [
      { name: 'Pipe Repair', category: 'Plumbing', description: 'Fix leaking pipes', price: null, priceFrom: 500, priceTo: 1500, type: 'service' },
      { name: 'Tap Installation', category: 'Plumbing', description: 'Install new taps/mixers', price: null, priceFrom: 300, priceTo: 800, type: 'service' },
      { name: 'Bathroom Fitting', category: 'Plumbing', description: 'Complete bathroom setup', price: null, priceFrom: 2000, priceTo: 8000, type: 'service' },
      { name: 'Water Tank Cleaning', category: 'Plumbing', description: 'Overhead tank cleaning', price: null, priceFrom: 1000, priceTo: 3000, type: 'service' },
    ];
    plumbingServices.forEach(svc => {
      vendorServicesData.push({ vendor: vendors[1]._id, ...svc, isAvailable: true });
    });

    // Electrical vendor services
    const electricalServices = [
      { name: 'Switchboard Repair', category: 'Electrical', description: 'Fix/replace switchboards', price: null, priceFrom: 250, priceTo: 600, type: 'service' },
      { name: 'Fan Installation', category: 'Electrical', description: 'Ceiling fan installation', price: null, priceFrom: 350, priceTo: 700, type: 'service' },
      { name: 'House Wiring', category: 'Electrical', description: 'Complete house wiring', price: null, priceFrom: 5000, priceTo: 25000, type: 'service' },
      { name: 'Light Installation', category: 'Electrical', description: 'Install light fixtures', price: null, priceFrom: 200, priceTo: 500, type: 'service' },
    ];
    electricalServices.forEach(svc => {
      vendorServicesData.push({ vendor: vendors[2]._id, ...svc, isAvailable: true });
    });

    // Cleaning vendor services
    const cleaningServices = [
      { name: 'Home Deep Cleaning', category: 'Cleaning', description: 'Full 2BHK deep cleaning', price: null, priceFrom: 1999, priceTo: 3999, type: 'service' },
      { name: 'Sofa Cleaning', category: 'Cleaning', description: 'Per seat upholstery cleaning', price: null, priceFrom: 499, priceTo: 999, type: 'service' },
      { name: 'Kitchen Deep Cleaning', category: 'Cleaning', description: 'Kitchen degrease & sanitize', price: null, priceFrom: 799, priceTo: 1499, type: 'service' },
    ];
    cleaningServices.forEach(svc => {
      vendorServicesData.push({ vendor: vendors[3]._id, ...svc, isAvailable: true });
    });

    // Painting vendor services
    const paintingServices = [
      { name: 'Interior Wall Painting', category: 'Painting', description: 'Per room painting', price: null, priceFrom: 3000, priceTo: 8000, type: 'service' },
      { name: 'Texture Painting', category: 'Painting', description: 'Decorative wall textures', price: null, priceFrom: 4500, priceTo: 12000, type: 'service' },
    ];
    paintingServices.forEach(svc => {
      vendorServicesData.push({ vendor: vendors[4]._id, ...svc, isAvailable: true });
    });

    let vsCount = 0;
    for (const data of vendorServicesData) {
      const existing = await VendorService.findOne({ vendor: data.vendor, name: data.name });
      if (!existing) {
        await VendorService.create(data);
        vsCount++;
      }
    }
    console.log(`✓ ${vsCount} vendor services/menu items created`);

    // ───────────────────────────────────────────────
    // 12.  Food Delivery Orders
    // ───────────────────────────────────────────────
    console.log('\n—— Seeding Food Orders ——');

    const foodOrdersData = [
      {
        userId: customerMap['rahul@demo.com'], restaurantId: restaurants[0]._id,
        items: [
          { menuItemId: menuItems[0]._id, name: 'Hyderabadi Chicken Dum Biryani', price: 299, image: menuItems[0].image, isVeg: false, quantity: 1, variant: { name: 'Full', price: 299 }, addons: [{ name: 'Extra Raita', price: 30 }], subtotal: 329 },
        ],
        pricing: { itemTotal: 329, deliveryFee: 30, taxAmount: 16, platformFee: 5, discountAmount: 0, grandTotal: 380 },
        deliveryAddress: { label: 'Home', addressLine1: 'A-101, Green Apartments', city: 'Mumbai', state: 'Maharashtra', pincode: '400001' },
        paymentMethod: 'upi', isPaid: true,
        status: 'delivered',
      },
      {
        userId: customerMap['priya@demo.com'], restaurantId: restaurants[1]._id,
        items: [
          { menuItemId: menuItems[4]._id, name: 'Butter Chicken', price: 399, image: menuItems[4].image, isVeg: false, quantity: 1, variant: { name: 'Full', price: 399 }, addons: [{ name: 'Extra Cream', price: 50 }], subtotal: 449 },
          { menuItemId: menuItems[5]._id, name: 'Dal Makhani', price: 249, image: menuItems[5].image, isVeg: true, quantity: 1, variant: { name: 'Full', price: 249 }, subtotal: 249 },
          { menuItemId: menuItems[7]._id, name: 'Tandoori Roti', price: 35, isVeg: true, quantity: 3, subtotal: 105 },
        ],
        pricing: { itemTotal: 803, deliveryFee: 0, taxAmount: 40, platformFee: 5, discountAmount: 0, grandTotal: 848 },
        deliveryAddress: { label: 'Home', addressLine1: '42, Sunshine Society', city: 'Delhi', state: 'Delhi', pincode: '110001' },
        paymentMethod: 'cod', isPaid: false,
        status: 'preparing',
      },
      {
        userId: customerMap['sneha@demo.com'], restaurantId: restaurants[0]._id,
        items: [
          { menuItemId: menuItems[1]._id, name: 'Mutton Biryani', price: 399, image: menuItems[1].image, isVeg: false, quantity: 1, variant: { name: 'Full', price: 399 }, subtotal: 399 },
          { menuItemId: menuItems[2]._id, name: 'Chicken 65', price: 249, image: menuItems[2].image, isVeg: false, quantity: 1, variant: { name: 'Regular', price: 249 }, subtotal: 249 },
        ],
        pricing: { itemTotal: 648, deliveryFee: 30, taxAmount: 32, platformFee: 5, discountAmount: 130, grandTotal: 585 },
        coupon: { code: 'BIRYANI20', discountAmount: 130 },
        deliveryAddress: { label: 'Home', addressLine1: '12-3-456, Himayatnagar', city: 'Hyderabad', state: 'Telangana', pincode: '500029' },
        paymentMethod: 'card', isPaid: true,
        status: 'confirmed',
      },
      {
        userId: customerMap['amit@demo.com'], restaurantId: restaurants[2]._id,
        items: [
          { menuItemId: menuItems[10]._id, name: 'Classic Caesar Salad', price: 249, image: menuItems[10].image, isVeg: true, quantity: 1, addons: [{ name: 'Grilled Chicken', price: 80 }], subtotal: 329 },
          { menuItemId: menuItems[11]._id, name: 'Protein Smoothie Bowl', price: 299, image: menuItems[11].image, isVeg: true, quantity: 1, subtotal: 299 },
        ],
        pricing: { itemTotal: 628, deliveryFee: 0, taxAmount: 31, platformFee: 5, discountAmount: 0, grandTotal: 664 },
        deliveryAddress: { label: 'Home', addressLine1: '7, Lake View Colony', city: 'Bangalore', state: 'Karnataka', pincode: '560001' },
        paymentMethod: 'wallet', isPaid: true,
        status: 'pending',
      },
    ];

    let foodOrderCount = 0;
    for (const data of foodOrdersData) {
      // Avoid duplicate generation by checking a unique combination
      const existing = await Order.findOne({ userId: data.userId, restaurantId: data.restaurantId, 'pricing.grandTotal': data.pricing.grandTotal });
      if (!existing) {
        await Order.create(data);
        foodOrderCount++;
      }
    }
    console.log(`✓ ${foodOrderCount} food orders created`);

    // ───────────────────────────────────────────────
    // 13.  Vendor Orders
    // ───────────────────────────────────────────────
    console.log('\n—— Seeding Vendor Orders ——');

    const vendorOrdersData = [
      {
        vendor: vendors[0]._id, // Spice Garden
        customer: { name: 'Rahul Sharma', phone: '9876543200', address: '101, ABC Apartments, Mumbai' },
        items: [{ name: 'Butter Chicken', price: 350, quantity: 1 }, { name: 'Garlic Naan', price: 60, quantity: 2 }],
        totalAmount: 470, status: 'completed', paymentStatus: 'prepaid', serviceType: 'food',
      },
      {
        vendor: vendors[0]._id,
        customer: { name: 'Priya Patel', phone: '9876543201', address: '202, XYZ Heights, Mumbai' },
        items: [{ name: 'Paneer Tikka', price: 280, quantity: 1 }, { name: 'Dal Makhani', price: 220, quantity: 1 }],
        totalAmount: 500, status: 'completed', paymentStatus: 'cod', serviceType: 'food',
      },
      {
        vendor: vendors[0]._id,
        customer: { name: 'Amit Kumar', phone: '9876543202', address: '303, PQR Tower, Mumbai' },
        items: [{ name: 'Chicken Biryani', price: 320, quantity: 2 }, { name: 'Gulab Jamun', price: 120, quantity: 2 }],
        totalAmount: 880, status: 'processing', paymentStatus: 'prepaid', serviceType: 'food',
      },
      {
        vendor: vendors[1]._id, // Quick Fix Plumbing
        customer: { name: 'Suresh Verma', phone: '9876543203', address: '404, LMN Society, Mumbai' },
        items: [{ name: 'Pipe Repair', price: 1000, quantity: 1 }],
        totalAmount: 1000, status: 'completed', paymentStatus: 'cod', serviceType: 'plumbing',
      },
      {
        vendor: vendors[1]._id,
        customer: { name: 'Neha Gupta', phone: '9876543204', address: '505, STV Complex, Mumbai' },
        items: [{ name: 'Tap Installation', price: 500, quantity: 2 }],
        totalAmount: 1000, status: 'completed', paymentStatus: 'prepaid', serviceType: 'plumbing',
      },
      {
        vendor: vendors[2]._id, // ElectroTech
        customer: { name: 'Vikram Singh', phone: '9876543205', address: '606, DEF Colony, Delhi' },
        items: [{ name: 'Switchboard Repair', price: 400, quantity: 1 }],
        totalAmount: 400, status: 'completed', paymentStatus: 'prepaid', serviceType: 'electrical',
      },
      {
        vendor: vendors[3]._id, // Sparkle Clean
        customer: { name: 'Ananya Reddy', phone: '9876543206', address: '707, GHI Layout, Bangalore' },
        items: [{ name: 'Home Deep Cleaning', price: 2999, quantity: 1 }],
        totalAmount: 2999, status: 'pending', paymentStatus: 'cod', serviceType: 'cleaning',
      },
    ];

    const vendorOrders = [];
    for (const data of vendorOrdersData) {
      const existing = await VendorOrder.findOne({ vendor: data.vendor, totalAmount: data.totalAmount, 'customer.phone': data.customer.phone });
      if (!existing) {
        const order = await VendorOrder.create(data);
        vendorOrders.push(order);
      } else {
        vendorOrders.push(existing);
      }
    }
    console.log(`✓ ${vendorOrders.length} vendor orders created`);

    // ───────────────────────────────────────────────
    // 14.  Transactions
    // ───────────────────────────────────────────────
    console.log('\n—— Seeding Transactions ——');

    let txnCount = 0;
    for (const order of vendorOrders) {
      // Only create transactions for completed or processing orders
      if (['completed', 'processing'].includes(order.status)) {
        const existing = await Transaction.findOne({ order: order._id });
        if (!existing) {
          const isPaid = order.paymentStatus === 'prepaid';
          await Transaction.create({
            vendor: order.vendor,
            order: order._id,
            transactionId: generateTransactionId(),
            amount: order.totalAmount,
            status: isPaid ? 'payment_received' : 'payment_pending',
            serviceType: order.serviceType,
            paymentMethod: isPaid ? 'UPI' : 'COD',
          });
          txnCount++;
        }
      }
    }
    console.log(`✓ ${txnCount} transactions created`);

    // ───────────────────────────────────────────────
    // 15.  Service Bookings
    // ───────────────────────────────────────────────
    console.log('\n—— Seeding Service Bookings ——');

    const bookingsData = [
      {
        userId: customerMap['rahul@demo.com'],
        providerId: providers[0]._id,
        serviceId: services[0]._id,
        serviceName: 'Leaking Pipe Repair',
        serviceCategory: 'Plumbing',
        serviceCategoryId: catMap['Plumbing'],
        serviceSubcategoryId: subcatByCat['Plumbing'][0],
        scheduledDate: daysFromNow(1),
        scheduledTimeSlot: '10:00 AM - 12:00 PM',
        pricing: { serviceTotal: 499, gstAmount: 25, convenienceFee: 5, visitCharges: 0, discountAmount: 0, grandTotal: 529 },
        serviceAddress: { label: 'Home', addressLine1: 'A-101, Green Apartments', city: 'Mumbai', state: 'Maharashtra', pincode: '400001' },
        paymentMethod: 'upi', isPaid: true,
        status: 'confirmed',
        userNotes: 'Please come with necessary tools',
      },
      {
        userId: customerMap['priya@demo.com'],
        providerId: null,
        serviceId: services[4]._id,
        serviceName: 'Ceiling Fan Installation',
        serviceCategory: 'Electrical',
        serviceCategoryId: catMap['Electrical'],
        serviceSubcategoryId: subcatByCat['Electrical'][1],
        scheduledDate: daysFromNow(2),
        scheduledTimeSlot: '02:00 PM - 04:00 PM',
        pricing: { serviceTotal: 349, gstAmount: 17, convenienceFee: 5, visitCharges: 50, discountAmount: 0, grandTotal: 421 },
        serviceAddress: { label: 'Home', addressLine1: '42, Sunshine Society', city: 'Delhi', state: 'Delhi', pincode: '110001' },
        paymentMethod: 'cod', isPaid: false,
        status: 'searching',
        userNotes: 'I have the fan already',
      },
      {
        userId: customerMap['sneha@demo.com'],
        providerId: providers[2]._id,
        serviceId: services[6]._id,
        serviceName: 'Interior Wall Painting',
        serviceCategory: 'Painting',
        serviceCategoryId: catMap['Painting'],
        serviceSubcategoryId: subcatByCat['Painting'][0],
        scheduledDate: daysFromNow(-7),
        scheduledTimeSlot: '08:00 AM - 12:00 PM',
        pricing: { serviceTotal: 3000, gstAmount: 150, convenienceFee: 5, visitCharges: 0, discountAmount: 300, grandTotal: 2855 },
        coupon: { code: 'PAINT10', discountAmount: 300 },
        serviceAddress: { label: 'Home', addressLine1: '12-3-456, Himayatnagar', city: 'Hyderabad', state: 'Telangana', pincode: '500029' },
        paymentMethod: 'card', isPaid: true,
        status: 'completed',
      },
      {
        userId: customerMap['vikram@demo.com'],
        providerId: null,
        serviceId: services[7]._id,
        serviceName: 'Home Deep Cleaning',
        serviceCategory: 'Cleaning',
        serviceCategoryId: catMap['Cleaning'],
        serviceSubcategoryId: subcatByCat['Cleaning'][0],
        scheduledDate: daysFromNow(-1),
        scheduledTimeSlot: '09:00 AM - 01:00 PM',
        pricing: { serviceTotal: 2499, gstAmount: 125, convenienceFee: 5, visitCharges: 0, discountAmount: 0, grandTotal: 2629 },
        serviceAddress: { label: 'Home', addressLine1: '88, Rajput Nagar', city: 'Jaipur', state: 'Rajasthan', pincode: '302001' },
        paymentMethod: 'wallet', isPaid: true,
        status: 'cancelled',
        cancellationReason: 'Changed my mind',
        cancelledBy: 'user',
      },
    ];

    let bookingCount = 0;
    for (const data of bookingsData) {
      const existing = await ServiceBooking.findOne({
        userId: data.userId,
        serviceName: data.serviceName,
        scheduledDate: data.scheduledDate,
      });
      if (!existing) {
        const booking = await ServiceBooking.create(data);
        // Manually set initial timeline entry since pre-save hook only tracks status changes
        bookingCount++;
        console.log(`  Created booking: ${booking.serviceName} for ${booking.serviceAddress.city}`);
      }
    }
    console.log(`✓ ${bookingCount} service bookings created`);

    // ───────────────────────────────────────────────
    // 16.  Notifications
    // ───────────────────────────────────────────────
    console.log('\n—— Seeding Notifications ——');

    const notificationsData = [
      { title: 'Welcome to Blue Tomato!', body: 'Thank you for joining us. Explore our wide range of food & services.', targetAudience: 'all', actionType: 'screen', actionValue: 'Home', status: 'sent', sentAt: hoursAgo(168), createdBy: adminUser._id },
      { title: 'Weekend Treat!', body: 'Get 20% off on all Biryani orders this weekend!', targetAudience: 'customers', actionType: 'offer', actionValue: 'BIRYANI20', status: 'sent', sentAt: hoursAgo(24), createdBy: adminUser._id },
      { title: 'New Service Available', body: 'Pest Control services now live in your area!', targetAudience: 'customers', actionType: 'screen', actionValue: 'Categories', status: 'sent', sentAt: hoursAgo(48), createdBy: adminUser._id },
      { title: 'Vendor Earnings Report', body: 'Check your monthly earnings summary in the dashboard.', targetAudience: 'vendors', actionType: 'screen', actionValue: 'Earnings', status: 'draft', createdBy: adminUser._id },
    ];

    const notifications = await Notification.insertMany(notificationsData);
    console.log(`✓ ${notifications.length} notifications created`);

    // ───────────────────────────────────────────────
    //  Summary
    // ───────────────────────────────────────────────
    console.log('\n═══════════════════════════════════════');
    console.log('  ✅ COMPLETE SEED FINISHED');
    console.log('═══════════════════════════════════════');
    console.log(`  Categories:        ${categories.length}`);
    console.log(`  Subcategories:     ${subcategories.length}`);
    console.log(`  Users:             ${customers.length} customers + admin`);
    console.log(`  Service Providers: ${providers.length}`);
    console.log(`  Services:          ${services.length}`);
    console.log(`  Restaurants:       ${restaurants.length}`);
    console.log(`  Menu Items:        ${menuItems.length}`);
    console.log(`  Vendors:           ${vendors.length}`);
    console.log(`  Vendor Services:   ${vsCount}`);
    console.log(`  Banners:           ${banners.length}`);
    console.log(`  App Configs:       2`);
    console.log(`  Food Orders:       ${foodOrderCount}`);
    console.log(`  Vendor Orders:     ${vendorOrders.length}`);
    console.log(`  Transactions:      ${txnCount}`);
    console.log(`  Service Bookings:  ${bookingCount}`);
    console.log(`  Notifications:     ${notifications.length}`);
    console.log('─────────────────────────────────────');
    console.log('  Admin:');
    console.log(`    Email:    admin@bluetomato.com`);
    console.log(`    Password: Admin@123`);
    console.log('  Users:');
    customers.forEach(c => console.log(`    ${c.email} / demo123`));
    console.log('  Vendors:');
    vendors.forEach(v => console.log(`    ${v.email} / password123`));
    console.log('═══════════════════════════════════════\n');

    process.exit(0);
  } catch (error) {
    console.error('\n❌ Seed failed:', error.message);
    console.error(error.stack);
    process.exit(1);
  }
}

seed();
