const VendorOrder = require('../models/VendorOrder');
const Transaction = require('../models/Transaction');

exports.getOrders = async (req, res) => {
  try {
    const { status } = req.query;
    const query = { vendor: req.vendor._id, deletedAt: null };
    if (status) query.status = status;

    const orders = await VendorOrder.find(query).sort({ createdAt: -1 });
    res.json({ orders });
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch orders', error: error.message });
  }
};

exports.getOrderById = async (req, res) => {
  try {
    const order = await VendorOrder.findOne({
      _id: req.params.id,
      vendor: req.vendor._id,
      deletedAt: null,
    });
    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }
    res.json({ order });
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch order', error: error.message });
  }
};

exports.acceptOrder = async (req, res) => {
  try {
    const order = await VendorOrder.findOne({
      _id: req.params.id,
      vendor: req.vendor._id,
      status: 'pending',
      deletedAt: null,
    });
    if (!order) {
      return res.status(404).json({ message: 'Order not found or already processed' });
    }

    order.status = 'processing';
    await order.save();

    res.json({ message: 'Order accepted', order });
  } catch (error) {
    res.status(500).json({ message: 'Failed to accept order', error: error.message });
  }
};

exports.declineOrder = async (req, res) => {
  try {
    const order = await VendorOrder.findOne({
      _id: req.params.id,
      vendor: req.vendor._id,
      status: 'pending',
      deletedAt: null,
    });
    if (!order) {
      return res.status(404).json({ message: 'Order not found or already processed' });
    }

    order.status = 'declined';
    await order.save();

    res.json({ message: 'Order declined', order });
  } catch (error) {
    res.status(500).json({ message: 'Failed to decline order', error: error.message });
  }
};

exports.completeOrder = async (req, res) => {
  try {
    const order = await VendorOrder.findOne({
      _id: req.params.id,
      vendor: req.vendor._id,
      status: 'processing',
      deletedAt: null,
    });
    if (!order) {
      return res.status(404).json({ message: 'Order not found or not in processing status' });
    }

    order.status = 'completed';
    await order.save();

    const transactionId = `TXN${Date.now()}${Math.random().toString(36).substr(2, 6).toUpperCase()}`;
    await Transaction.create({
      vendor: req.vendor._id,
      order: order._id,
      transactionId,
      amount: order.totalAmount,
      status: order.paymentStatus === 'prepaid' ? 'payment_received' : 'payment_pending',
      serviceType: order.serviceType,
    });

    res.json({ message: 'Order completed', order });
  } catch (error) {
    res.status(500).json({ message: 'Failed to complete order', error: error.message });
  }
};

exports.getOrderHistory = async (req, res) => {
  try {
    const orders = await VendorOrder.find({
      vendor: req.vendor._id,
      status: { $in: ['completed', 'declined'] },
      deletedAt: null,
    }).sort({ createdAt: -1 });

    const grouped = {};
    for (const order of orders) {
      const dateKey = order.createdAt.toISOString().split('T')[0];
      if (!grouped[dateKey]) grouped[dateKey] = [];
      grouped[dateKey].push(order);
    }

    res.json({ groupedHistory: grouped });
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch order history', error: error.message });
  }
};
