const express = require('express');
const router = express.Router();
const vendorController = require('../controllers/userVendorController');
const userAuth = require('../middleware/userAuthMiddleware');

// Get list of vendors (can pass ?type=restaurant)
router.get('/', userAuth, vendorController.getVendors);

// Get specific vendor with their menu/services
router.get('/:id', userAuth, vendorController.getVendorDetails);

module.exports = router;
