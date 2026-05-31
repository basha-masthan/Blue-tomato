const mongoose = require('mongoose');
const VendorService = require('./src/models/VendorService');
require('dotenv').config({ path: './.env' });

async function run() {
  try {
    const uri = process.env.MONGODB_URI;
    await mongoose.connect(uri);
    
    // Clear all VendorServices
    const result = await VendorService.deleteMany({});
    console.log(`Deleted ${result.deletedCount} vendor services.`);
    
  } catch (error) {
    console.error(error);
  } finally {
    mongoose.disconnect();
  }
}

run();
