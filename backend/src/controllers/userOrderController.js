const Order = require('../models/Order');

// Create a new order
exports.createOrder = async (req, res) => {
  try {
    const { restaurantId, items, pricing, deliveryAddress, paymentMethod } = req.body;
    
    // In a real app, we'd recalculate pricing here to prevent frontend manipulation
    // For now, we trust the frontend pricing object

    const order = await Order.create({
      userId: req.user.id,
      restaurantId,
      items,
      pricing,
      deliveryAddress,
      paymentMethod,
      status: 'pending' // Initialize as pending
    });

    res.status(201).json({ message: 'Order created successfully', order });
  } catch (error) {
    res.status(500).json({ message: 'Failed to create order', error: error.message });
  }
};

// Get all orders for the logged-in user
exports.getMyOrders = async (req, res) => {
  try {
    const orders = await Order.find({ userId: req.user.id })
      .populate('restaurantId', 'name profilePic')
      .sort({ createdAt: -1 });

    res.json({ orders });
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch orders', error: error.message });
  }
};

// Get a specific order details
exports.getOrderById = async (req, res) => {
  try {
    const { id } = req.params;
    const order = await Order.findOne({ _id: id, userId: req.user.id })
      .populate('restaurantId', 'name profilePic currentAddress');

    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    res.json({ order });
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch order details', error: error.message });
  }
};
