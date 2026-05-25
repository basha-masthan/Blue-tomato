const express = require('express');
const router = express.Router();
const orderController = require('../controllers/vendorOrderController');
const auth = require('../middleware/auth');

router.get('/', auth, orderController.getOrders);
router.get('/history', auth, orderController.getOrderHistory);
router.get('/:id', auth, orderController.getOrderById);
router.patch('/:id/accept', auth, orderController.acceptOrder);
router.patch('/:id/decline', auth, orderController.declineOrder);
router.patch('/:id/complete', auth, orderController.completeOrder);

module.exports = router;
