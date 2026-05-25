const express = require('express');
const router = express.Router();
const authController = require('../controllers/userAuthController');
const userAuth = require('../middleware/userAuthMiddleware');

router.post('/register', authController.register);
router.post('/login', authController.login);
router.get('/me', userAuth, authController.getMe);

module.exports = router;
