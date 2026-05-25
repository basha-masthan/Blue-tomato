const express = require('express');
const router = express.Router();
const authController = require('../controllers/vendorAuthController');
const auth = require('../middleware/auth');

router.post('/register', authController.register);
router.post('/login', authController.login);
router.get('/me', auth, authController.getMe);
router.patch('/toggle-online', auth, authController.toggleOnline);

module.exports = router;
