const Vendor = require('../models/Vendor');
const Service = require('../models/Service');

// Get vendors by type (e.g., 'restaurant' or 'plumbing')
exports.getVendors = async (req, res) => {
  try {
    const { type } = req.query;
    let query = { isActive: true, isVerified: true };
    if (type) {
      query.registrationType = type;
    }
    
    // Select fields safe for users to see
    const vendors = await Vendor.find(query).select('name registrationType profilePic currentAddress rating');
    res.json({ vendors });
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch vendors', error: error.message });
  }
};

// Get a specific vendor's details and their services/menu items
exports.getVendorDetails = async (req, res) => {
  try {
    const { id } = req.params;
    const vendor = await Vendor.findById(id).select('name registrationType profilePic currentAddress isOnline rating');
    
    if (!vendor) {
      return res.status(404).json({ message: 'Vendor not found' });
    }

    const services = await Service.find({ providerId: id, isAvailable: true });

    res.json({ vendor, services });
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch vendor details', error: error.message });
  }
};
