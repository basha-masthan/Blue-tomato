const express = require('express');
const router = express.Router();
const profileController = require('../controllers/vendorProfileController');
const auth = require('../middleware/auth');

router.get('/', auth, profileController.getProfile);
router.patch('/', auth, profileController.updateProfile);
router.patch('/addresses', auth, profileController.updateAddresses);
router.get('/bank-details', auth, profileController.getBankDetails);
router.patch('/bank-details', auth, profileController.updateBankDetails);
router.get('/documents', auth, profileController.getDocuments);
router.patch('/documents', auth, profileController.updateDocuments);
router.get('/dashboard-stats', auth, profileController.getDashboardStats);

module.exports = router;
