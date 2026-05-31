const mongoose = require('mongoose');
const Category = require('./src/models/Category');
const Subcategory = require('./src/models/Subcategory');
require('dotenv').config({ path: './.env' });

async function run() {
  try {
    const uri = process.env.MONGODB_URI;
    await mongoose.connect(uri);
    
    const categories = await Category.find();
    console.log('Categories:');
    categories.forEach(c => console.log(`- ${c.name} (isActive: ${c.isActive})`));
    
    const subcategories = await Subcategory.find();
    console.log('\nSubcategories:');
    subcategories.forEach(s => console.log(`- ${s.name} (Category ID: ${s.category})`));
    
  } catch (error) {
    console.error(error);
  } finally {
    mongoose.disconnect();
  }
}

run();
