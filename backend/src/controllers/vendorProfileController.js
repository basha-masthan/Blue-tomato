const Vendor = require('../models/Vendor');

exports.getProfile = async (req, res) => {
  try {
    const vendor = await Vendor.findById(req.vendor._id);
    if (!vendor) {
      return res.status(404).json({ message: 'Vendor not found' });
    }
    res.json({ vendor });
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch profile', error: error.message });
  }
};

exports.updateProfile = async (req, res) => {
  try {
    const allowedFields = [
      'name', 'dateOfBirth', 'gender', 'bloodGroup',
      'emergencyContact', 'profilePic',
    ];
    const updates = {};
    for (const field of allowedFields) {
      if (req.body[field] !== undefined) {
        updates[field] = req.body[field];
      }
    }

    const vendor = await Vendor.findByIdAndUpdate(req.vendor._id, updates, {
      new: true,
      runValidators: true,
    });

    res.json({ message: 'Profile updated', vendor });
  } catch (error) {
    res.status(500).json({ message: 'Failed to update profile', error: error.message });
  }
};

exports.updateAddresses = async (req, res) => {
  try {
    const { currentAddress, permanentAddress, sameAsCurrentAddress } = req.body;
    const vendor = await Vendor.findById(req.vendor._id);

    if (currentAddress) vendor.currentAddress = currentAddress;
    vendor.sameAsCurrentAddress = sameAsCurrentAddress || false;
    if (!sameAsCurrentAddress && permanentAddress) {
      vendor.permanentAddress = permanentAddress;
    } else if (sameAsCurrentAddress) {
      vendor.permanentAddress = null;
    }

    await vendor.save();
    res.json({ message: 'Addresses updated', vendor });
  } catch (error) {
    res.status(500).json({ message: 'Failed to update addresses', error: error.message });
  }
};

exports.updateBankDetails = async (req, res) => {
  try {
    const vendor = await Vendor.findById(req.vendor._id);
    vendor.bankDetails = req.body;
    await vendor.save();
    res.json({ message: 'Bank details updated', vendor });
  } catch (error) {
    res.status(500).json({ message: 'Failed to update bank details', error: error.message });
  }
};

exports.updateDocuments = async (req, res) => {
  try {
    const { aadhaar, pan } = req.body;
    const vendor = await Vendor.findById(req.vendor._id);

    if (aadhaar) vendor.aadhaar = aadhaar;
    if (pan) vendor.pan = pan;

    if (vendor.aadhaar?.number && vendor.pan?.number) {
      vendor.kycComplete = true;
    }

    await vendor.save();
    res.json({ message: 'Documents updated', vendor });
  } catch (error) {
    res.status(500).json({ message: 'Failed to update documents', error: error.message });
  }
};

exports.getBankDetails = async (req, res) => {
  try {
    const vendor = await Vendor.findById(req.vendor._id).select('bankDetails');
    res.json({ bankDetails: vendor.bankDetails });
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch bank details', error: error.message });
  }
};

exports.getDocuments = async (req, res) => {
  try {
    const vendor = await Vendor.findById(req.vendor._id).select('aadhaar pan kycComplete');
    res.json({
      aadhaar: vendor.aadhaar,
      pan: vendor.pan,
      kycComplete: vendor.kycComplete,
    });
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch documents', error: error.message });
  }
};

const getDateRange = (filter) => {
  const now = new Date();
  let startDate;

  switch (filter) {
    case 'today':
      startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      break;
    case 'week':
      const dayOfWeek = now.getDay();
      startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate() - dayOfWeek);
      break;
    case 'month':
      startDate = new Date(now.getFullYear(), now.getMonth(), 1);
      break;
    case 'year':
      startDate = new Date(now.getFullYear(), 0, 1);
      break;
    default:
      startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  }

  return startDate;
};

exports.getDashboardStats = async (req, res) => {
  try {
    const VendorOrder = require('../models/VendorOrder');
    const vendorId = req.vendor._id;
    const { filter = 'today' } = req.query;

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const periodStart = getDateRange(filter);

    const [totalOrders, periodOrders, pendingOrders, processingOrders, completedOrders] =
      await Promise.all([
        VendorOrder.countDocuments({ vendor: vendorId, deletedAt: null }),
        VendorOrder.countDocuments({ vendor: vendorId, createdAt: { $gte: periodStart }, deletedAt: null }),
        VendorOrder.countDocuments({ vendor: vendorId, status: 'pending', deletedAt: null }),
        VendorOrder.countDocuments({ vendor: vendorId, status: 'processing', deletedAt: null }),
        VendorOrder.countDocuments({ vendor: vendorId, status: 'completed', deletedAt: null }),
      ]);

    const todayEarningsAgg = await VendorOrder.aggregate([
      { $match: { vendor: vendorId, status: 'completed', createdAt: { $gte: today }, deletedAt: null } },
      { $group: { _id: null, total: { $sum: '$totalAmount' } } },
    ]);

    const todayEarnings = todayEarningsAgg.length > 0 ? todayEarningsAgg[0].total : 0;

    const periodEarningsAgg = await VendorOrder.aggregate([
      { $match: { vendor: vendorId, status: 'completed', createdAt: { $gte: periodStart }, deletedAt: null } },
      { $group: { _id: null, total: { $sum: '$totalAmount' } } },
    ]);

    const periodEarnings = periodEarningsAgg.length > 0 ? periodEarningsAgg[0].total : 0;

    const lastMonthAgg = await VendorOrder.aggregate([
      {
        $match: {
          vendor: vendorId,
          status: 'completed',
          deletedAt: null,
          createdAt: { $gte: new Date(new Date().setMonth(new Date().getMonth() - 1)) },
        },
      },
      { $group: { _id: null, total: { $sum: '$totalAmount' }, count: { $sum: 1 } } },
    ]);

    const lastMonthEarnings = lastMonthAgg.length > 0 ? lastMonthAgg[0].total : 0;
    const lastMonthOrders = lastMonthAgg.length > 0 ? lastMonthAgg[0].count : 0;

    res.json({
      stats: {
        totalOrders,
        todayOrders: await VendorOrder.countDocuments({ vendor: vendorId, createdAt: { $gte: today }, deletedAt: null }),
        todayEarnings,
        periodOrders,
        periodEarnings,
        pendingOrders,
        processingOrders,
        completedOrders,
        lastMonthEarnings,
        lastMonthOrders,
        earnings: periodEarnings,
      },
    });
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch stats', error: error.message });
  }
};