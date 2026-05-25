const jwt = require('jsonwebtoken');
const Vendor = require('../models/Vendor');

const generateToken = (vendor) => {
  return jwt.sign(
    { id: vendor._id, email: vendor.email, type: vendor.registrationType },
    process.env.JWT_SECRET,
    { expiresIn: '30d' }
  );
};

exports.register = async (req, res) => {
  try {
    const {
      name, email, phone, password,
      dateOfBirth, gender, bloodGroup, emergencyContact,
      registrationType, aadhaar, pan,
      currentAddress, permanentAddress, sameAsCurrentAddress,
      bankDetails,
    } = req.body;

    const existing = await Vendor.findOne({
      $or: [{ email: email.toLowerCase() }, { phone }],
    });
    if (existing) {
      return res.status(400).json({ message: 'Vendor already exists with this email or phone' });
    }

    const vendor = await Vendor.create({
      name, email, phone, password,
      dateOfBirth, gender, bloodGroup, emergencyContact,
      registrationType,
      aadhaar, pan,
      currentAddress,
      permanentAddress: sameAsCurrentAddress ? null : permanentAddress,
      sameAsCurrentAddress,
      bankDetails,
    });

    const token = generateToken(vendor);

    res.status(201).json({
      message: 'Vendor registered successfully',
      token,
      vendor: {
        id: vendor._id,
        name: vendor.name,
        email: vendor.email,
        phone: vendor.phone,
        registrationType: vendor.registrationType,
        isOnline: vendor.isOnline,
        isVerified: vendor.isVerified,
        kycComplete: vendor.kycComplete,
      },
    });
  } catch (error) {
    res.status(500).json({ message: 'Registration failed', error: error.message });
  }
};

exports.login = async (req, res) => {
  try {
    const { email, phone, password } = req.body;

    if ((!email && !phone) || !password) {
      return res.status(400).json({ message: 'Email/Phone and password are required' });
    }

    const query = email
      ? { email: email.toLowerCase() }
      : { phone };

    const vendor = await Vendor.findOne(query).select('+password');
    if (!vendor) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const isMatch = await vendor.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    // Check approval status
    if (vendor.approvalStatus === 'pending') {
      return res.status(403).json({
        message: 'Your account is pending admin approval. Please wait for approval.',
        approvalStatus: 'pending',
      });
    }

    if (vendor.approvalStatus === 'rejected') {
      return res.status(403).json({
        message: vendor.rejectionReason
          ? `Your account has been rejected. Reason: ${vendor.rejectionReason}`
          : 'Your account has been rejected. Please contact support.',
        approvalStatus: 'rejected',
        rejectionReason: vendor.rejectionReason,
      });
    }

    if (!vendor.isActive || vendor.deletedAt) {
      return res.status(403).json({ message: 'Your account has been deactivated. Please contact support.' });
    }

    const token = generateToken(vendor);

    res.json({
      message: 'Login successful',
      token,
      vendor: {
        id: vendor._id,
        name: vendor.name,
        email: vendor.email,
        phone: vendor.phone,
        registrationType: vendor.registrationType,
        isOnline: vendor.isOnline,
        isVerified: vendor.isVerified,
        kycComplete: vendor.kycComplete,
        approvalStatus: vendor.approvalStatus,
      },
    });
  } catch (error) {
    res.status(500).json({ message: 'Login failed', error: error.message });
  }
};

exports.getMe = async (req, res) => {
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

exports.toggleOnline = async (req, res) => {
  try {
    const vendor = await Vendor.findById(req.vendor._id);
    vendor.isOnline = !vendor.isOnline;
    await vendor.save();
    res.json({ message: `Vendor is now ${vendor.isOnline ? 'online' : 'offline'}`, isOnline: vendor.isOnline });
  } catch (error) {
    res.status(500).json({ message: 'Failed to toggle status', error: error.message });
  }
};
