const express = require('express');
const router = express.Router();
const orderController = require('../controllers/userOrderController');
const userAuth = require('../middleware/userAuthMiddleware');

// Place an order
router.post('/', userAuth, orderController.createOrder);

// Get order history
router.get('/', userAuth, orderController.getMyOrders);

// Get specific order
router.get('/:id', userAuth, orderController.getOrderById);

module.exports = router;
