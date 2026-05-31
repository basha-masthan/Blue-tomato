const express = require('express');
const router = express.Router();
const bookingController = require('../controllers/userServiceBookingController');
const userAuth = require('../middleware/userAuthMiddleware');

router.post('/', userAuth, bookingController.createBooking);
router.get('/', userAuth, bookingController.getMyBookings);

module.exports = router;
