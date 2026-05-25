const jwt = require('jsonwebtoken');
const Vendor = require('../models/Vendor');

const auth = async (req, res, next) => {
  try {
    const header = req.headers.authorization;
    if (!header || !header.startsWith('Bearer ')) {
      return res.status(401).json({ message: 'No token provided' });
    }

    const token = header.split(' ')[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    const vendor = await Vendor.findById(decoded.id);
    if (!vendor || !vendor.isActive || vendor.deletedAt) {
      return res.status(401).json({ message: 'Vendor not found or inactive' });
    }

    req.vendor = vendor;
    next();
  } catch (error) {
    return res.status(401).json({ message: 'Invalid token', error: error.message });
  }
};

module.exports = auth;
