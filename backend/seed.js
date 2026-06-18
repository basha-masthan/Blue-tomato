require('dotenv').config({ path: 'backend/.env' });
const mongoose = require('mongoose');
const Category = require('./src/models/Category');
const Subcategory = require('./src/models/Subcategory');

async function seed() {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/blue-tomato');
    console.log('Connected to DB');

    // Create a generic "Home Services" category
    const cat = await Category.create({ name: 'Plumbing Services', image: 'water', isActive: true });
    console.log('Created category:', cat.name);

    // Create a subcategory
    const subcat = await Subcategory.create({
      name: 'Bathroom Repair',
      category: cat._id,
      basePrice: 599,
      isActive: true,
    });
    console.log('Created subcategory:', subcat.name);

  } catch (err) {
    console.error(err);
  } finally {
    process.exit(0);
  }
}

seed();
