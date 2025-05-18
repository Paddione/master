// routes/userRoutes.js
const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const { ensureAuthenticated } = require('../middlewares/authMiddleware');
const { changePasswordRules, validate } = require('../middlewares/validationMiddleware');


// User Dashboard
router.get('/dashboard', ensureAuthenticated, userController.getDashboard);

// Change Password Page
router.get('/change-password', ensureAuthenticated, userController.getChangePassword);
router.post('/change-password', ensureAuthenticated, changePasswordRules(), userController.postChangePassword);

// Add other user-specific routes here (e.g., profile edit)

module.exports = router;