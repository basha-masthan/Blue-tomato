const express = require('express');
const router = express.Router();
const adminAuth = require('../middleware/adminAuthMiddleware');
const adminController = require('../controllers/adminController');

// ── Auth (No auth required) ─────────────────────────
router.post('/auth/login', adminController.login);

// ── Auth Required Routes ────────────────────────────
router.use(adminAuth);

// ── Dashboard ───────────────────────────────────────
router.get('/dashboard/stats', adminController.getDashboardStats);

// ── Vendor Management ───────────────────────────────
router.get('/vendors', adminController.getVendors);
router.get('/vendors/:id', adminController.getVendorById);
router.patch('/vendors/:id/approve', adminController.approveVendor);
router.patch('/vendors/:id/reject', adminController.rejectVendor);
router.patch('/vendors/:id/toggle', adminController.toggleVendorActive);

// ── User Management ─────────────────────────────────
router.get('/users', adminController.getUsers);
router.get('/users/:id', adminController.getUserById);
router.patch('/users/:id/toggle', adminController.toggleUserActive);
router.delete('/users/:id', adminController.deleteUser);

// ── Services & Menu Items ─────────────────────────
router.get('/services', adminController.getServices);
router.get('/menu-items', adminController.getMenuItems);
router.patch('/services/:id/toggle', adminController.toggleServiceAvailability);
router.delete('/services/:id', adminController.deleteService);

// ── Orders ─────────────────────────────────────────
router.get('/orders', adminController.getOrders);
router.get('/orders/:id', adminController.getOrderById);
router.patch('/orders/:id/status', adminController.updateOrderStatus);

// ── Transactions ────────────────────────────────────
router.get('/transactions', adminController.getTransactions);
router.get('/transactions/summary', adminController.getTransactionSummary);

// ── Restaurants ─────────────────────────────────────
router.get('/restaurants', adminController.getRestaurants);
router.get('/restaurants/:id', adminController.getRestaurantById);
router.patch('/restaurants/:id', adminController.updateRestaurant);

// ── Banners ─────────────────────────────────────────
router.get('/banners', adminController.getBanners);
router.post('/banners', adminController.createBanner);
router.patch('/banners/:id', adminController.updateBanner);
router.delete('/banners/:id', adminController.deleteBanner);
router.patch('/banners/:id/toggle', adminController.toggleBanner);

// ── App Config / Theme ──────────────────────────────
router.get('/app-configs', adminController.getAppConfigs);
router.get('/app-configs/:appType', adminController.getAppConfig);
router.patch('/app-configs/:appType', adminController.updateAppConfig);

// ── Notifications ───────────────────────────────────
router.get('/notifications', adminController.getNotifications);
router.post('/notifications', adminController.createNotification);
router.post('/notifications/:id/send', adminController.sendNotification);
router.delete('/notifications/:id', adminController.deleteNotification);

// ── Me ──────────────────────────────────────────────
router.get('/auth/me', adminController.getMe);

module.exports = router;
