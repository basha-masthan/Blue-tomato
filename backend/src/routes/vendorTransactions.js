const express = require('express');
const router = express.Router();
const transactionController = require('../controllers/vendorTransactionController');
const auth = require('../middleware/auth');

router.get('/', auth, transactionController.getTransactions);
router.get('/summary', auth, transactionController.getTransactionSummary);
router.get('/:id', auth, transactionController.getTransactionById);

module.exports = router;
