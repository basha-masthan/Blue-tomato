const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const http = require('http');
const { Server } = require('socket.io');
require('dotenv').config();

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

  socket.on('disconnect', () => {
    console.log('Client disconnected:', socket.id);
  });
});

server.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
