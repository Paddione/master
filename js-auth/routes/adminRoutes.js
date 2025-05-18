// routes/adminRoutes.js
const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');
const { ensureAuthenticated, ensureAdmin } = require('../middlewares/authMiddleware');
// Add validation middleware if needed for admin forms

// Admin Dashboard
router.get('/dashboard', ensureAuthenticated, ensureAdmin, adminController.getAdminDashboard);

// Manage Users
router.get('/users', ensureAuthenticated, ensureAdmin, adminController.getManageUsers);

// Edit User
router.get('/users/:id/edit', ensureAuthenticated, ensureAdmin, adminController.getEditUser);
router.post('/users/:id/edit', ensureAuthenticated, ensureAdmin, adminController.postEditUser);

// Delete User
router.post('/users/:id/delete', ensureAuthenticated, ensureAdmin, adminController.postDeleteUser);


module.exports = router;