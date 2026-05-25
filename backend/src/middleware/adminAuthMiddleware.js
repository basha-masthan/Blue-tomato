const jwt = require('jsonwebtoken');
const User = require('../models/User');

/**
 * Admin Authentication Middleware
 * Verifies the JWT token and ensures the user has admin role.
 */
const adminAuth = async (req, res, next) => {
  try {
    const header = req.headers.authorization;
    if (!header || !header.startsWith('Bearer ')) {
      return res.status(401).json({ message: 'No token provided' });
    }

    const token = header.split(' ')[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'fallback_secret');

    const user = await User.findById(decoded.id);
    if (!user) {
      return res.status(401).json({ message: 'User not found' });
    }

    if (user.role !== 'admin') {
      return res.status(403).json({ message: 'Access denied. Admin privileges required.' });
    }

    if (!user.isActive || user.deletedAt) {
      return res.status(401).json({ message: 'Admin account is inactive or deleted' });
    }

    req.admin = user;
    next();
  } catch (error) {
    return res.status(401).json({ message: 'Invalid token', error: error.message });
  }
};

module.exports = adminAuth;
