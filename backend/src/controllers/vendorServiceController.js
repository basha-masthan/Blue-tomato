const Vendor = require('../models/Vendor');
const Subcategory = require('../models/Subcategory');
const Category = require('../models/Category');

exports.getServices = async (req, res) => {
  try {
    const vendor = await Vendor.findById(req.vendor._id).populate('serviceCategory');
    if (!vendor || !vendor.serviceCategory) {
      return res.json({ services: [] });
    }

    const subcategories = await Subcategory.find({ category: vendor.serviceCategory._id, isActive: true });
    
    // Convert vendor.serviceSubcategories to an array of strings for easy comparison
    const vendorSubIds = vendor.serviceSubcategories.map(id => id.toString());

    const services = subcategories.map(sub => ({
      _id: sub._id,
      name: sub.name,
      category: vendor.serviceCategory.name,
      description: sub.description,
      price: sub.basePrice, // mapping basePrice to price
      image: sub.image,
      isAvailable: vendorSubIds.includes(sub._id.toString()),
    }));

    res.json({ services });
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch services', error: error.message });
  }
};

exports.createService = async (req, res) => {
  // Creating custom services is no longer allowed based on user request.
  res.status(403).json({ message: 'Creating custom services is not allowed. Admin manages services.' });
};

exports.updateService = async (req, res) => {
  // Updating custom services is no longer allowed.
  res.status(403).json({ message: 'Updating custom services is not allowed. Admin manages services.' });
};

exports.toggleAvailability = async (req, res) => {
  try {
    const { id } = req.params; // id of the Subcategory
    const vendor = await Vendor.findById(req.vendor._id);
    
    if (!vendor) {
      return res.status(404).json({ message: 'Vendor not found' });
    }

    const subcategoryIdStr = id.toString();
    const vendorSubIds = vendor.serviceSubcategories.map(subId => subId.toString());

    let isNowAvailable = false;

    if (vendorSubIds.includes(subcategoryIdStr)) {
      // Remove it
      vendor.serviceSubcategories = vendor.serviceSubcategories.filter(subId => subId.toString() !== subcategoryIdStr);
      isNowAvailable = false;
    } else {
      // Add it
      vendor.serviceSubcategories.push(id);
      isNowAvailable = true;
    }

    await vendor.save();
    res.json({ message: `Service is now ${isNowAvailable ? 'available' : 'unavailable'}`, isAvailable: isNowAvailable });
  } catch (error) {
    res.status(500).json({ message: 'Failed to toggle availability', error: error.message });
  }
};

exports.deleteService = async (req, res) => {
  // Deleting custom services is no longer allowed.
  res.status(403).json({ message: 'Deleting services is not allowed. Admin manages services.' });
};
