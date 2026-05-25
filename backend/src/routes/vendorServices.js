const express = require('express');
const router = express.Router();
const serviceController = require('../controllers/vendorServiceController');
const auth = require('../middleware/auth');

router.get('/', auth, serviceController.getServices);
router.post('/', auth, serviceController.createService);
router.patch('/:id', auth, serviceController.updateService);
router.patch('/:id/toggle', auth, serviceController.toggleAvailability);
router.delete('/:id', auth, serviceController.deleteService);

module.exports = router;
