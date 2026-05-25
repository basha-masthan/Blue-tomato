const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const Vendor = require('./src/models/Vendor');
const Service = require('./src/models/Service');

const MONGODB_URI = 'mongodb+srv://basha:king@freefire.lrfkfsu.mongodb.net/blue-tomato';

const seedData = async () => {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('Connected to MongoDB');

    // Create a few restaurants
    const restaurants = [
      {
        name: 'Paradise Biryani',
        email: 'paradise@example.com',
        phone: '9876500001',
        password: 'password123',
        registrationType: 'restaurant',
        profilePic: 'https://images.unsplash.com/photo-1631515243349-e0cb75fb8d3a?w=600&auto=format&fit=crop&q=80',
        currentAddress: {
          city: 'Hyderabad',
          state: 'Telangana',
          country: 'India',
          zip: '500001'
        },
        bankDetails: {
          bankName: 'HDFC',
          accountHolderName: 'Paradise',
          accountNumber: '123456789',
          ifscCode: 'HDFC0001'
        },
        isActive: true,
        isVerified: true,
        isOnline: true,
        rating: 4.8
      },
      {
        name: 'Burger King',
        email: 'bk@example.com',
        phone: '9876500002',
        password: 'password123',
        registrationType: 'restaurant',
        profilePic: 'https://images.unsplash.com/photo-1550547660-d9450f859349?w=600&auto=format&fit=crop&q=80',
        currentAddress: {
          city: 'Hyderabad',
          state: 'Telangana',
          country: 'India',
          zip: '500001'
        },
        bankDetails: {
          bankName: 'ICICI',
          accountHolderName: 'Burger King',
          accountNumber: '987654321',
          ifscCode: 'ICIC0001'
        },
        isActive: true,
        isVerified: true,
        isOnline: true,
        rating: 4.2
      },
      {
        name: 'Dominos Pizza',
        email: 'dominos@example.com',
        phone: '9876500003',
        password: 'password123',
        registrationType: 'restaurant',
        profilePic: 'https://images.unsplash.com/photo-1574071318508-1cdbab80d002?w=600&auto=format&fit=crop&q=80',
        currentAddress: {
          city: 'Hyderabad',
          state: 'Telangana',
          country: 'India',
          zip: '500001'
        },
        bankDetails: {
          bankName: 'SBI',
          accountHolderName: 'Dominos',
          accountNumber: '1122334455',
          ifscCode: 'SBIN0001'
        },
        isActive: true,
        isVerified: true,
        isOnline: true,
        rating: 4.5
      }
    ];

    for (const r of restaurants) {
      let vendor = await Vendor.findOne({ email: r.email });
      if (!vendor) {
        vendor = new Vendor(r);
        await vendor.save();
        console.log(`Created restaurant: ${vendor.name}`);
      } else {
        console.log(`Restaurant already exists: ${vendor.name}`);
      }

      // Add items for this restaurant
      const items = [];
      if (r.name === 'Paradise Biryani') {
        items.push({
          providerId: vendor._id,
          name: 'Chicken Biryani',
          description: 'Authentic Hyderabadi Chicken Dum Biryani',
          category: 'Other',
          basePrice: 250,
          priceType: 'fixed',
          image: 'https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?w=600&auto=format&fit=crop&q=80',
          rating: 4.9,
          reviewCount: 500,
          isAvailable: true
        });
        items.push({
          providerId: vendor._id,
          name: 'Mutton Biryani',
          description: 'Special Mutton Biryani',
          category: 'Other',
          basePrice: 350,
          priceType: 'fixed',
          image: 'https://images.unsplash.com/photo-1589302168068-964664d93cb0?w=600&auto=format&fit=crop&q=80',
          rating: 4.8,
          reviewCount: 300,
          isAvailable: true
        });
      } else if (r.name === 'Burger King') {
        items.push({
          providerId: vendor._id,
          name: 'Whopper Burger',
          description: 'Signature flame-grilled beef burger',
          category: 'Other',
          basePrice: 150,
          priceType: 'fixed',
          image: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=600&auto=format&fit=crop&q=80',
          rating: 4.5,
          reviewCount: 150,
          isAvailable: true
        });
      } else if (r.name === 'Dominos Pizza') {
        items.push({
          providerId: vendor._id,
          name: 'Farmhouse Pizza',
          description: 'Delightful combination of onion, capsicum, tomato & grilled mushroom',
          category: 'Other',
          basePrice: 399,
          priceType: 'fixed',
          image: 'https://images.unsplash.com/photo-1513104890138-7c749659a591?w=600&auto=format&fit=crop&q=80',
          rating: 4.3,
          reviewCount: 400,
          isAvailable: true
        });
      }

      for (const item of items) {
        const existingItem = await Service.findOne({ providerId: vendor._id, name: item.name });
        if (!existingItem) {
          await Service.create(item);
          console.log(`Added item ${item.name} for ${vendor.name}`);
        } else {
          console.log(`Item ${item.name} already exists for ${vendor.name}`);
        }
      }
    }

    console.log('Seeding completed successfully');
    process.exit(0);
  } catch (error) {
    console.error('Error seeding data:', error);
    process.exit(1);
  }
};

seedData();
