const Transaction = require('../models/Transaction');

exports.getTransactions = async (req, res) => {
  try {
    const transactions = await Transaction.find({ vendor: req.vendor._id, deletedAt: null })
      .populate('order', 'orderId')
      .sort({ createdAt: -1 });
    res.json({ transactions });
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch transactions', error: error.message });
  }
};

exports.getTransactionById = async (req, res) => {
  try {
    const transaction = await Transaction.findOne({
      _id: req.params.id,
      vendor: req.vendor._id,
      deletedAt: null,
    }).populate('order', 'orderId');
    if (!transaction) {
      return res.status(404).json({ message: 'Transaction not found' });
    }
    res.json({ transaction });
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch transaction', error: error.message });
  }
};

exports.getTransactionSummary = async (req, res) => {
  try {
    const result = await Transaction.aggregate([
      { $match: { vendor: req.vendor._id, deletedAt: null } },
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 },
          total: { $sum: '$amount' },
        },
      },
    ]);

    const summary = {
      totalReceived: 0,
      totalPending: 0,
      countReceived: 0,
      countPending: 0,
    };

    for (const group of result) {
      if (group._id === 'payment_received') {
        summary.totalReceived = group.total;
        summary.countReceived = group.count;
      } else if (group._id === 'payment_pending') {
        summary.totalPending = group.total;
        summary.countPending = group.count;
      }
    }

    res.json({ summary });
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch summary', error: error.message });
  }
};
