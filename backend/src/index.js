const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const http = require('http');
const { Server } = require('socket.io');
require('dotenv').config();

const Vendor = require('./models/Vendor');
const ServiceBooking = require('./models/ServiceBooking');

const app = express();
const PORT = process.env.PORT || 5000;
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST', 'PATCH', 'PUT', 'DELETE']
  }
});

// Middleware
app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Database Connection
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/blue-tomato', {
}).then(() => {
  console.log('Connected to MongoDB');
}).catch((err) => {
  console.error('MongoDB connection error:', err);
});

// Basic Route
app.get('/', (req, res) => {
  res.send('Blue Tomato API is running');
});

// Vendor Routes
app.use('/api/vendor/auth', require('./routes/vendorAuth'));
app.use('/api/vendor/profile', require('./routes/vendorProfile'));
app.use('/api/vendor/services', require('./routes/vendorServices'));
app.use('/api/vendor/orders', require('./routes/vendorOrders'));
app.use('/api/vendor/transactions', require('./routes/vendorTransactions'));
app.use('/api/vendor/uploads', require('./routes/vendorUploads'));

// User Routes
app.use('/api/user/auth', require('./routes/userAuth'));
app.use('/api/user/vendors', require('./routes/userVendors'));
app.use('/api/user/orders', require('./routes/userOrders'));
app.use('/api/user/bookings', require('./routes/userServiceBookings'));

// Admin Routes
app.use('/api/admin', require('./routes/admin'));

// Public API Routes (for mobile apps)
app.use('/api/public', require('./routes/public'));

// Socket.io for Real-time Updates
io.on('connection', (socket) => {
  console.log('New client connected:', socket.id);

  // Users join room based on their userId
  socket.on('join_user', (userId) => {
    socket.join(`user_${userId}`);
    console.log(`Socket ${socket.id} joined user room: user_${userId}`);
  });

  // Vendors join room based on their vendorId
  socket.on('join_vendor', (vendorId) => {
    socket.join(`vendor_${vendorId}`);
    console.log(`Socket ${socket.id} joined vendor room: vendor_${vendorId}`);
  });

  // Vendor updates order status -> notify user
  socket.on('order_status_update', (data) => {
    // data should contain { orderId, userId, status }
    io.to(`user_${data.userId}`).emit('order_updated', data);
  });

  // User places an order -> notify vendor
  socket.on('new_order', (data) => {
    // data should contain { orderId, vendorId }
    io.to(`vendor_${data.vendorId}`).emit('new_order_received', data);
  });

  // ── Lead Broadcast System ─────────────────────────────
  
  // 1. User requests home service -> Broadcast to eligible vendors
  socket.on('request_home_service', async (data) => {
    // data should contain { bookingId, categoryId, subcategoryId, city }
    try {
      const { bookingId, categoryId, subcategoryId, city } = data;
      
      const booking = await ServiceBooking.findById(bookingId);
      if (!booking || booking.status !== 'searching') return;

      // Find vendors that match category, subcategory, city, and are active
      const eligibleVendors = await Vendor.find({
        isActive: true,
        approvalStatus: 'approved',
        serviceCategory: categoryId,
        serviceSubcategories: subcategoryId,
        'currentAddress.city': { $regex: new RegExp(`^${city}$`, 'i') },
        _id: { $nin: booking.rejectedBy.map(r => r.vendorId) }
      });

      // Emit lead to each eligible vendor
      eligibleVendors.forEach(vendor => {
        io.to(`vendor_${vendor._id}`).emit('lead_broadcast', {
          bookingId,
          serviceName: booking.serviceName,
          address: booking.serviceAddress,
          scheduledDate: booking.scheduledDate,
          pricing: booking.pricing
        });
      });
    } catch (err) {
      console.error('Error broadcasting lead:', err);
    }
  });

  // 2. Vendor claims a lead -> Assign to vendor and notify user
  socket.on('claim_lead', async (data, callback) => {
    // data should contain { bookingId, vendorId }
    try {
      const { bookingId, vendorId } = data;
      
      // Use atomic update to ensure only one vendor gets it
      const booking = await ServiceBooking.findOneAndUpdate(
        { _id: bookingId, status: 'searching' },
        { status: 'confirmed', providerId: vendorId },
        { new: true }
      );

      if (booking) {
        // Success: This vendor won the lead
        io.to(`user_${booking.userId}`).emit('lead_claimed', { bookingId, vendorId });
        // Optionally notify other vendors that it's taken
        socket.broadcast.emit('lead_taken', { bookingId });
        if (callback) callback({ success: true, booking });
      } else {
        // Failed: Lead already taken or cancelled
        if (callback) callback({ success: false, message: 'Lead already claimed or unavailable' });
      }
    } catch (err) {
      console.error('Error claiming lead:', err);
      if (callback) callback({ success: false, message: 'Server error' });
    }
  });

  // 3. Vendor rejects or cancels a lead
  socket.on('cancel_lead', async (data) => {
    // data should contain { bookingId, vendorId, reason }
    try {
      const { bookingId, vendorId, reason } = data;
      
      const booking = await ServiceBooking.findById(bookingId);
      if (!booking) return;

      if (booking.status === 'confirmed' && booking.providerId.toString() === vendorId) {
        // Vendor accepted but then cancelled
        booking.status = 'searching';
        booking.providerId = undefined; // Unassign
        booking.cancelledBy = 'provider'; // Temp track cancellation
      }

      // Add to rejectedBy array so they don't get pinged again
      booking.rejectedBy.push({ vendorId, reason, timestamp: new Date() });
      await booking.save();

      // If status is searching, re-broadcast to other vendors
      if (booking.status === 'searching') {
        const eligibleVendors = await Vendor.find({
          isActive: true,
          approvalStatus: 'approved',
          serviceCategory: booking.serviceCategoryId,
          serviceSubcategories: booking.serviceSubcategoryId,
          'currentAddress.city': { $regex: new RegExp(`^${booking.serviceAddress.city}$`, 'i') },
          _id: { $nin: booking.rejectedBy.map(r => r.vendorId) }
        });

        eligibleVendors.forEach(vendor => {
          io.to(`vendor_${vendor._id}`).emit('lead_broadcast', {
            bookingId,
            serviceName: booking.serviceName,
            address: booking.serviceAddress,
            scheduledDate: booking.scheduledDate,
            pricing: booking.pricing
          });
        });
        
        // Notify user that it's back to searching
        io.to(`user_${booking.userId}`).emit('lead_searching', { bookingId });
      }

    } catch (err) {
      console.error('Error cancelling lead:', err);
    }
  });

  socket.on('disconnect', () => {
    console.log('Client disconnected:', socket.id);
  });
});

server.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
