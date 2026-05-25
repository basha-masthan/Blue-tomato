const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const User = require('../models/User');
const Vendor = require('../models/Vendor');
const Order = require('../models/Order');
const VendorOrder = require('../models/VendorOrder');
const Transaction = require('../models/Transaction');
const Restaurant = require('../models/Restaurant');
const MenuItem = require('../models/MenuItem');
const Service = require('../models/Service');
const VendorService = require('../models/VendorService');
const Banner = require('../models/Banner');
const AppConfig = require('../models/AppConfig');
const Notification = require('../models/Notification');

// ── Admin Auth ──────────────────────────────────────

const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required' });
    }

    const user = await User.findOne({ email: email.toLowerCase() }).select('+password');
    if (!user || user.role !== 'admin') {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    if (!user.isActive || user.deletedAt) {
      return res.status(401).json({ message: 'Account is inactive or deleted' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const token = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET || 'fallback_secret',
      { expiresIn: '7d' }
    );

    res.json({
      message: 'Login successful',
      token,
      admin: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    res.status(500).json({ message: 'Login failed', error: error.message });
  }
};

const getMe = async (req, res) => {
  try {
    const admin = await User.findById(req.admin._id).select('-password');
    res.json({ admin });
  } catch (error) {
    res.status(500).json({ message: 'Failed to get admin profile', error: error.message });
  }
};

// ── Dashboard Stats ─────────────────────────────────

const getDashboardStats = async (req, res) => {
  try {
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const startOfWeek = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

    const [
      totalUsers,
      totalVendors,
      totalOrders,
      totalTransactions,
      totalRestaurants,
      totalServices,
      monthlyOrders,
      monthlyRevenue,
      weeklyUsers,
      weeklyVendors,
      pendingVendors,
      activeVendors,
      rejectedVendors,
      activeUsers,
      inactiveUsers,
    ] = await Promise.all([
      User.countDocuments({ role: 'customer', deletedAt: null }),
      Vendor.countDocuments({ deletedAt: null }),
      Order.countDocuments(),
      Transaction.countDocuments(),
      Restaurant.countDocuments(),
      Service.countDocuments(),
      Order.countDocuments({ createdAt: { $gte: startOfMonth } }),
      Transaction.aggregate([
        { $match: { createdAt: { $gte: startOfMonth }, status: 'payment_received' } },
        { $group: { _id: null, total: { $sum: '$amount' } } },
      ]),
      User.countDocuments({ role: 'customer', createdAt: { $gte: startOfWeek }, deletedAt: null }),
      Vendor.countDocuments({ createdAt: { $gte: startOfWeek }, deletedAt: null }),
      Vendor.countDocuments({ approvalStatus: 'pending', deletedAt: null }),
      Vendor.countDocuments({ approvalStatus: 'approved', isActive: true, deletedAt: null }),
      Vendor.countDocuments({ approvalStatus: 'rejected', deletedAt: null }),
      User.countDocuments({ role: 'customer', isActive: true, deletedAt: null }),
      User.countDocuments({ role: 'customer', isActive: false, deletedAt: null }),
    ]);

    // Recent 12 months revenue for chart
    const revenueByMonth = await Transaction.aggregate([
      {
        $match: {
          createdAt: {
            $gte: new Date(now.getFullYear(), now.getMonth() - 11, 1),
          },
          status: 'payment_received',
        },
      },
      {
        $group: {
          _id: {
            year: { $year: '$createdAt' },
            month: { $month: '$createdAt' },
          },
          total: { $sum: '$amount' },
        },
      },
      { $sort: { '_id.year': 1, '_id.month': 1 } },
    ]);

    // Order status distribution
    const orderStatusCounts = await Order.aggregate([
      { $group: { _id: '$status', count: { $sum: 1 } } },
    ]);

    res.json({
      stats: {
        totalUsers,
        totalVendors,
        totalOrders,
        totalTransactions,
        totalRestaurants,
        totalServices,
        monthlyOrders,
        monthlyRevenue: monthlyRevenue[0]?.total || 0,
        weeklyNewUsers: weeklyUsers,
        weeklyNewVendors: weeklyVendors,
        pendingVendors,
        activeVendors,
        rejectedVendors,
        activeUsers,
        inactiveUsers,
      },
      revenueByMonth,
      orderStatusCounts,
    });
  } catch (error) {
    res.status(500).json({ message: 'Failed to get dashboard stats', error: error.message });
  }
};

// ── Vendor Management ───────────────────────────────

const getVendors = async (req, res) => {
  try {
    const { page = 1, limit = 20, status, search, sortBy = 'createdAt', sortOrder = 'desc' } = req.query;
    const query = { deletedAt: null };

    if (status) {
      query.approvalStatus = status;
    }

    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { phone: { $regex: search, $options: 'i' } },
      ];
    }

    const sort = {};
    sort[sortBy] = sortOrder === 'asc' ? 1 : -1;

    const skip = (Number(page) - 1) * Number(limit);

    const [vendors, total] = await Promise.all([
      Vendor.find(query)
        .sort(sort)
        .skip(skip)
        .limit(Number(limit))
        .select('-password'),
      Vendor.countDocuments(query),
    ]);

    res.json({
      vendors,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total,
        pages: Math.ceil(total / Number(limit)),
      },
    });
  } catch (error) {
    res.status(500).json({ message: 'Failed to get vendors', error: error.message });
  }
};

const getVendorById = async (req, res) => {
  try {
    const vendor = await Vendor.findById(req.params.id).select('-password');
    if (!vendor) {
      return res.status(404).json({ message: 'Vendor not found' });
    }
    res.json({ vendor });
  } catch (error) {
    res.status(500).json({ message: 'Failed to get vendor', error: error.message });
  }
};

const approveVendor = async (req, res) => {
  try {
    const vendor = await Vendor.findById(req.params.id);
    if (!vendor) {
      return res.status(404).json({ message: 'Vendor not found' });
    }

    if (vendor.approvalStatus === 'approved') {
      return res.status(400).json({ message: 'Vendor is already approved' });
    }

    vendor.approvalStatus = 'approved';
    vendor.isActive = true;
    vendor.isVerified = true;
    vendor.approvedAt = new Date();
    vendor.rejectionReason = '';
    vendor.rejectedAt = null;
    await vendor.save();

    res.json({ message: 'Vendor approved successfully', vendor: vendor.toObject() });
  } catch (error) {
    res.status(500).json({ message: 'Failed to approve vendor', error: error.message });
  }
};

const rejectVendor = async (req, res) => {
  try {
    const { reason } = req.body;
    if (!reason || reason.trim().length === 0) {
      return res.status(400).json({ message: 'Rejection reason is required' });
    }

    const vendor = await Vendor.findById(req.params.id);
    if (!vendor) {
      return res.status(404).json({ message: 'Vendor not found' });
    }

    vendor.approvalStatus = 'rejected';
    vendor.isActive = false;
    vendor.rejectionReason = reason.trim();
    vendor.rejectedAt = new Date();
    vendor.approvedAt = null;
    await vendor.save();

    res.json({ message: 'Vendor rejected', vendor: vendor.toObject() });
  } catch (error) {
    res.status(500).json({ message: 'Failed to reject vendor', error: error.message });
  }
};

const toggleVendorActive = async (req, res) => {
  try {
    const vendor = await Vendor.findById(req.params.id);
    if (!vendor) {
      return res.status(404).json({ message: 'Vendor not found' });
    }

    vendor.isActive = !vendor.isActive;
    await vendor.save();

    res.json({
      message: `Vendor ${vendor.isActive ? 'activated' : 'deactivated'} successfully`,
      vendor: vendor.toObject(),
    });
  } catch (error) {
    res.status(500).json({ message: 'Failed to toggle vendor status', error: error.message });
  }
};

// ── User Management ─────────────────────────────────

const getUsers = async (req, res) => {
  try {
    const { page = 1, limit = 20, status, search, sortBy = 'createdAt', sortOrder = 'desc' } = req.query;
    const query = { role: 'customer', deletedAt: null };

    if (status === 'active') {
      query.isActive = true;
    } else if (status === 'inactive') {
      query.isActive = false;
    }

    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { phone: { $regex: search, $options: 'i' } },
      ];
    }

    const sort = {};
    sort[sortBy] = sortOrder === 'asc' ? 1 : -1;

    const skip = (Number(page) - 1) * Number(limit);

    const [users, total] = await Promise.all([
      User.find(query)
        .sort(sort)
        .skip(skip)
        .limit(Number(limit))
        .select('-password'),
      User.countDocuments(query),
    ]);

    res.json({
      users,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total,
        pages: Math.ceil(total / Number(limit)),
      },
    });
  } catch (error) {
    res.status(500).json({ message: 'Failed to get users', error: error.message });
  }
};

const getUserById = async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select('-password');
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.json({ user });
  } catch (error) {
    res.status(500).json({ message: 'Failed to get user', error: error.message });
  }
};

const toggleUserActive = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    user.isActive = !user.isActive;
    await user.save();

    res.json({
      message: `User ${user.isActive ? 'activated' : 'deactivated'} successfully`,
      user: user.toObject(),
    });
  } catch (error) {
    res.status(500).json({ message: 'Failed to toggle user status', error: error.message });
  }
};

const deleteUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    await user.softDelete();
    res.json({ message: 'User deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Failed to delete user', error: error.message });
  }
};

// ── Service / Food Management ───────────────────────

const getServices = async (req, res) => {
  try {
    const { page = 1, limit = 20, type, search } = req.query;
    const query = { deletedAt: null };

    if (type) {
      query.type = type;
    }

    if (search) {
      query.name = { $regex: search, $options: 'i' };
    }

    const skip = (Number(page) - 1) * Number(limit);

    const [services, total] = await Promise.all([
      VendorService.find(query)
        .populate('vendor', 'name email approvalStatus')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(Number(limit)),
      VendorService.countDocuments(query),
    ]);

    res.json({
      services,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total,
        pages: Math.ceil(total / Number(limit)),
      },
    });
  } catch (error) {
    res.status(500).json({ message: 'Failed to get services', error: error.message });
  }
};

const getMenuItems = async (req, res) => {
  try {
    const { page = 1, limit = 20, restaurantId, search, isAvailable } = req.query;
    const query = {};

    if (restaurantId) {
      query.restaurantId = restaurantId;
    }

    if (isAvailable !== undefined) {
      query.isAvailable = isAvailable === 'true';
    }

    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { category: { $regex: search, $options: 'i' } },
      ];
    }

    const skip = (Number(page) - 1) * Number(limit);

    const [items, total] = await Promise.all([
      MenuItem.find(query)
        .populate('restaurantId', 'name')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(Number(limit)),
      MenuItem.countDocuments(query),
    ]);

    res.json({
      items,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total,
        pages: Math.ceil(total / Number(limit)),
      },
    });
  } catch (error) {
    res.status(500).json({ message: 'Failed to get menu items', error: error.message });
  }
};

const toggleServiceAvailability = async (req, res) => {
  try {
    const service = await VendorService.findById(req.params.id);
    if (!service) {
      return res.status(404).json({ message: 'Service not found' });
    }

    service.isAvailable = !service.isAvailable;
    await service.save();

    res.json({
      message: `Service ${service.isAvailable ? 'enabled' : 'disabled'} successfully`,
      service,
    });
  } catch (error) {
    res.status(500).json({ message: 'Failed to toggle service', error: error.message });
  }
};

const deleteService = async (req, res) => {
  try {
    const service = await VendorService.findById(req.params.id);
    if (!service) {
      return res.status(404).json({ message: 'Service not found' });
    }

    service.deletedAt = new Date();
    await service.save();

    res.json({ message: 'Service deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Failed to delete service', error: error.message });
  }
};

// ── Order Management ──────────────────────────────────

const getOrders = async (req, res) => {
  try {
    const { page = 1, limit = 20, status, search } = req.query;
    const query = {};

    if (status) {
      query.status = status;
    }

    if (search) {
      query.orderNumber = { $regex: search, $options: 'i' };
    }

    const skip = (Number(page) - 1) * Number(limit);

    const [orders, total] = await Promise.all([
      Order.find(query)
        .populate('userId', 'name email phone')
        .populate('restaurantId', 'name')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(Number(limit)),
      Order.countDocuments(query),
    ]);

    res.json({
      orders,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total,
        pages: Math.ceil(total / Number(limit)),
      },
    });
  } catch (error) {
    res.status(500).json({ message: 'Failed to get orders', error: error.message });
  }
};

const getOrderById = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id)
      .populate('userId', 'name email phone')
      .populate('restaurantId', 'name logo');
    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }
    res.json({ order });
  } catch (error) {
    res.status(500).json({ message: 'Failed to get order', error: error.message });
  }
};

const updateOrderStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const validStatuses = ['pending', 'confirmed', 'preparing', 'out_for_delivery', 'delivered', 'cancelled'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ message: 'Invalid status' });
    }

    const order = await Order.findById(req.params.id);
    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    order.status = status;
    if (status === 'cancelled') {
      order.cancelledBy = 'system';
    }
    await order.save();

    res.json({ message: 'Order status updated', order });
  } catch (error) {
    res.status(500).json({ message: 'Failed to update order status', error: error.message });
  }
};

// ── Transaction Management ────────────────────────────

const getTransactions = async (req, res) => {
  try {
    const { page = 1, limit = 20, status, vendorId } = req.query;
    const query = {};

    if (status) {
      query.status = status;
    }

    if (vendorId) {
      query.vendor = vendorId;
    }

    const skip = (Number(page) - 1) * Number(limit);

    const [transactions, total] = await Promise.all([
      Transaction.find(query)
        .populate('vendor', 'name email')
        .populate('order', 'orderNumber totalAmount')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(Number(limit)),
      Transaction.countDocuments(query),
    ]);

    res.json({
      transactions,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total,
        pages: Math.ceil(total / Number(limit)),
      },
    });
  } catch (error) {
    res.status(500).json({ message: 'Failed to get transactions', error: error.message });
  }
};

const getTransactionSummary = async (req, res) => {
  try {
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

    const [totalRevenue, monthlyRevenue, pendingAmount, totalCount] = await Promise.all([
      Transaction.aggregate([
        { $match: { status: 'payment_received' } },
        { $group: { _id: null, total: { $sum: '$amount' } } },
      ]),
      Transaction.aggregate([
        { $match: { createdAt: { $gte: startOfMonth }, status: 'payment_received' } },
        { $group: { _id: null, total: { $sum: '$amount' } } },
      ]),
      Transaction.aggregate([
        { $match: { status: 'payment_pending' } },
        { $group: { _id: null, total: { $sum: '$amount' } } },
      ]),
      Transaction.countDocuments(),
    ]);

    res.json({
      totalRevenue: totalRevenue[0]?.total || 0,
      monthlyRevenue: monthlyRevenue[0]?.total || 0,
      pendingAmount: pendingAmount[0]?.total || 0,
      totalCount,
    });
  } catch (error) {
    res.status(500).json({ message: 'Failed to get transaction summary', error: error.message });
  }
};

// ── Restaurant Management ─────────────────────────────

const getRestaurants = async (req, res) => {
  try {
    const { page = 1, limit = 20, status, search } = req.query;
    const query = {};

    if (status === 'active') {
      query.isActive = true;
    } else if (status === 'inactive') {
      query.isActive = false;
    }

    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { cuisines: { $in: [new RegExp(search, 'i')] } },
      ];
    }

    const skip = (Number(page) - 1) * Number(limit);

    const [restaurants, total] = await Promise.all([
      Restaurant.find(query)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(Number(limit)),
      Restaurant.countDocuments(query),
    ]);

    res.json({
      restaurants,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total,
        pages: Math.ceil(total / Number(limit)),
      },
    });
  } catch (error) {
    res.status(500).json({ message: 'Failed to get restaurants', error: error.message });
  }
};

const getRestaurantById = async (req, res) => {
  try {
    const restaurant = await Restaurant.findById(req.params.id);
    if (!restaurant) {
      return res.status(404).json({ message: 'Restaurant not found' });
    }
    res.json({ restaurant });
  } catch (error) {
    res.status(500).json({ message: 'Failed to get restaurant', error: error.message });
  }
};

const updateRestaurant = async (req, res) => {
  try {
    const { name, description, cuisines, isActive, isFeatured, isOpen } = req.body;
    const restaurant = await Restaurant.findById(req.params.id);
    if (!restaurant) {
      return res.status(404).json({ message: 'Restaurant not found' });
    }

    if (name !== undefined) restaurant.name = name;
    if (description !== undefined) restaurant.description = description;
    if (cuisines !== undefined) restaurant.cuisines = cuisines;
    if (isActive !== undefined) restaurant.isActive = isActive;
    if (isFeatured !== undefined) restaurant.isFeatured = isFeatured;
    if (isOpen !== undefined) restaurant.isOpen = isOpen;

    await restaurant.save();
    res.json({ message: 'Restaurant updated successfully', restaurant });
  } catch (error) {
    res.status(500).json({ message: 'Failed to update restaurant', error: error.message });
  }
};

// ── Banner Management ───────────────────────────────

const getBanners = async (req, res) => {
  try {
    const { targetApp, isActive } = req.query;
    const query = {};
    if (targetApp) query.targetApp = targetApp;
    if (isActive !== undefined) query.isActive = isActive === 'true';

    const banners = await Banner.find(query)
      .populate('createdBy', 'name')
      .sort({ sortOrder: 1, createdAt: -1 });

    res.json({ banners });
  } catch (error) {
    res.status(500).json({ message: 'Failed to get banners', error: error.message });
  }
};

const createBanner = async (req, res) => {
  try {
    const banner = await Banner.create({
      ...req.body,
      createdBy: req.admin._id,
    });
    res.status(201).json({ message: 'Banner created successfully', banner });
  } catch (error) {
    res.status(500).json({ message: 'Failed to create banner', error: error.message });
  }
};

const updateBanner = async (req, res) => {
  try {
    const banner = await Banner.findById(req.params.id);
    if (!banner) {
      return res.status(404).json({ message: 'Banner not found' });
    }

    const updates = req.body;
    Object.keys(updates).forEach((key) => {
      if (key !== '_id' && key !== 'createdBy') {
        banner[key] = updates[key];
      }
    });
    await banner.save();

    res.json({ message: 'Banner updated successfully', banner });
  } catch (error) {
    res.status(500).json({ message: 'Failed to update banner', error: error.message });
  }
};

const deleteBanner = async (req, res) => {
  try {
    const banner = await Banner.findByIdAndDelete(req.params.id);
    if (!banner) {
      return res.status(404).json({ message: 'Banner not found' });
    }
    res.json({ message: 'Banner deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Failed to delete banner', error: error.message });
  }
};

const toggleBanner = async (req, res) => {
  try {
    const banner = await Banner.findById(req.params.id);
    if (!banner) {
      return res.status(404).json({ message: 'Banner not found' });
    }
    banner.isActive = !banner.isActive;
    await banner.save();
    res.json({ message: `Banner ${banner.isActive ? 'activated' : 'deactivated'}`, banner });
  } catch (error) {
    res.status(500).json({ message: 'Failed to toggle banner', error: error.message });
  }
};

// ── App Config / Theme Management ───────────────────

const getAppConfigs = async (req, res) => {
  try {
    const configs = await AppConfig.find();
    res.json({ configs });
  } catch (error) {
    res.status(500).json({ message: 'Failed to get app configs', error: error.message });
  }
};

const getAppConfig = async (req, res) => {
  try {
    const { appType } = req.params;
    let config = await AppConfig.findOne({ appType });
    if (!config) {
      // Create default config if not exists
      config = await AppConfig.create({ appType });
    }
    res.json({ config });
  } catch (error) {
    res.status(500).json({ message: 'Failed to get app config', error: error.message });
  }
};

const updateAppConfig = async (req, res) => {
  try {
    const { appType } = req.params;
    const updates = req.body;

    let config = await AppConfig.findOne({ appType });
    if (!config) {
      config = new AppConfig({ appType });
    }

    // Deep merge colors
    if (updates.colors) {
      Object.assign(config.colors, updates.colors);
    }
    // Deep merge features
    if (updates.features) {
      Object.assign(config.features, updates.features);
    }
    // Deep merge layout
    if (updates.layout) {
      Object.assign(config.layout, updates.layout);
    }
    // Direct updates for other fields
    if (updates.logo !== undefined) config.logo = updates.logo;
    if (updates.logoWhite !== undefined) config.logoWhite = updates.logoWhite;
    if (updates.splashImage !== undefined) config.splashImage = updates.splashImage;
    if (updates.fontFamily !== undefined) config.fontFamily = updates.fontFamily;

    config.updatedBy = req.admin._id;
    config.updatedAt = new Date();
    await config.save();

    res.json({ message: 'App config updated successfully', config });
  } catch (error) {
    res.status(500).json({ message: 'Failed to update app config', error: error.message });
  }
};

// ── Notification Management ─────────────────────────

const getNotifications = async (req, res) => {
  try {
    const { status, page = 1, limit = 20 } = req.query;
    const query = {};
    if (status) query.status = status;

    const skip = (Number(page) - 1) * Number(limit);
    const [notifications, total] = await Promise.all([
      Notification.find(query)
        .populate('createdBy', 'name')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(Number(limit)),
      Notification.countDocuments(query),
    ]);

    res.json({
      notifications,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total,
        pages: Math.ceil(total / Number(limit)),
      },
    });
  } catch (error) {
    res.status(500).json({ message: 'Failed to get notifications', error: error.message });
  }
};

const createNotification = async (req, res) => {
  try {
    const notification = await Notification.create({
      ...req.body,
      createdBy: req.admin._id,
    });
    res.status(201).json({ message: 'Notification created', notification });
  } catch (error) {
    res.status(500).json({ message: 'Failed to create notification', error: error.message });
  }
};

const sendNotification = async (req, res) => {
  try {
    const notification = await Notification.findById(req.params.id);
    if (!notification) {
      return res.status(404).json({ message: 'Notification not found' });
    }

    if (notification.status === 'sent') {
      return res.status(400).json({ message: 'Notification already sent' });
    }

    // Determine target users
    let targetUsers = [];
    if (notification.targetAudience === 'all') {
      targetUsers = await User.find({ role: 'customer', isActive: true, deletedAt: null });
      const vendors = await Vendor.find({ approvalStatus: 'approved', isActive: true });
      // For simplicity, we're just counting - in production you'd send FCM/APNs here
      notification.stats.sent = targetUsers.length + vendors.length;
    } else if (notification.targetAudience === 'customers') {
      targetUsers = await User.find({ role: 'customer', isActive: true, deletedAt: null });
      notification.stats.sent = targetUsers.length;
    } else if (notification.targetAudience === 'vendors') {
      targetUsers = await Vendor.find({ approvalStatus: 'approved', isActive: true });
      notification.stats.sent = targetUsers.length;
    } else if (notification.targetAudience === 'specific_users') {
      targetUsers = await User.find({
        _id: { $in: notification.targetUserIds },
        isActive: true,
      });
      notification.stats.sent = targetUsers.length;
    }

    // In a real app, you'd loop through targetUsers and send FCM here:
    // for (const user of targetUsers) {
    //   if (user.fcmToken) await sendFCM(user.fcmToken, notification);
    // }

    notification.status = 'sent';
    notification.sentAt = new Date();
    await notification.save();

    res.json({
      message: `Notification sent to ${notification.stats.sent} recipients`,
      notification,
    });
  } catch (error) {
    res.status(500).json({ message: 'Failed to send notification', error: error.message });
  }
};

const deleteNotification = async (req, res) => {
  try {
    const notification = await Notification.findByIdAndDelete(req.params.id);
    if (!notification) {
      return res.status(404).json({ message: 'Notification not found' });
    }
    res.json({ message: 'Notification deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Failed to delete notification', error: error.message });
  }
};

module.exports = {
  // Auth
  login,
  getMe,
  // Dashboard
  getDashboardStats,
  // Vendors
  getVendors,
  getVendorById,
  approveVendor,
  rejectVendor,
  toggleVendorActive,
  // Users
  getUsers,
  getUserById,
  toggleUserActive,
  deleteUser,
  // Services & Menu
  getServices,
  getMenuItems,
  toggleServiceAvailability,
  deleteService,
  // Orders
  getOrders,
  getOrderById,
  updateOrderStatus,
  // Transactions
  getTransactions,
  getTransactionSummary,
  // Restaurants
  getRestaurants,
  getRestaurantById,
  updateRestaurant,
  // Banners
  getBanners,
  createBanner,
  updateBanner,
  deleteBanner,
  toggleBanner,
  // App Config / Theme
  getAppConfigs,
  getAppConfig,
  updateAppConfig,
  // Notifications
  getNotifications,
  createNotification,
  sendNotification,
  deleteNotification,
};
