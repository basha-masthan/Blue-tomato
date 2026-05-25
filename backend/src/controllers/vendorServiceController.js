const VendorService = require('../models/VendorService');

exports.getServices = async (req, res) => {
  try {
    const { category } = req.query;
    const query = { vendor: req.vendor._id, deletedAt: null };
    if (category) query.category = category;

    const services = await VendorService.find(query).sort({ createdAt: -1 });
    res.json({ services });
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch services', error: error.message });
  }
};

exports.createService = async (req, res) => {
  try {
    const { name, category, description, price, priceFrom, priceTo, image, type } = req.body;

    const service = await VendorService.create({
      vendor: req.vendor._id,
      name,
      category,
      description,
      price: type === 'food' ? price : undefined,
      priceFrom: type === 'service' ? priceFrom : undefined,
      priceTo: type === 'service' ? priceTo : undefined,
      image,
      type: type || 'food',
    });

    res.status(201).json({ message: 'Service created', service });
  } catch (error) {
    res.status(500).json({ message: 'Failed to create service', error: error.message });
  }
};

exports.updateService = async (req, res) => {
  try {
    const { id } = req.params;
    const service = await VendorService.findOne({ _id: id, vendor: req.vendor._id, deletedAt: null });
    if (!service) {
      return res.status(404).json({ message: 'Service not found' });
    }

    const allowedFields = ['name', 'category', 'description', 'price', 'priceFrom', 'priceTo', 'image', 'isAvailable'];
    for (const field of allowedFields) {
      if (req.body[field] !== undefined) {
        service[field] = req.body[field];
      }
    }

    await service.save();
    res.json({ message: 'Service updated', service });
  } catch (error) {
    res.status(500).json({ message: 'Failed to update service', error: error.message });
  }
};

exports.toggleAvailability = async (req, res) => {
  try {
    const { id } = req.params;
    const service = await VendorService.findOne({ _id: id, vendor: req.vendor._id, deletedAt: null });
    if (!service) {
      return res.status(404).json({ message: 'Service not found' });
    }

    service.isAvailable = !service.isAvailable;
    await service.save();
    res.json({ message: `Service is now ${service.isAvailable ? 'available' : 'unavailable'}`, service });
  } catch (error) {
    res.status(500).json({ message: 'Failed to toggle availability', error: error.message });
  }
};

exports.deleteService = async (req, res) => {
  try {
    const { id } = req.params;
    const service = await VendorService.findOne({ _id: id, vendor: req.vendor._id, deletedAt: null });
    if (!service) {
      return res.status(404).json({ message: 'Service not found' });
    }

    service.deletedAt = new Date();
    await service.save();
    res.json({ message: 'Service deleted' });
  } catch (error) {
    res.status(500).json({ message: 'Failed to delete service', error: error.message });
  }
};
