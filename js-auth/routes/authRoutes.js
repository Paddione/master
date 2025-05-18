// routes/authRoutes.js
const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { forwardAuthenticated } = require('../middlewares/authMiddleware');
const { registrationRules, loginRules, forgotPasswordRules, resetPasswordRules, validate } = require('../middlewares/validationMiddleware');

// Register Page
router.get('/register', forwardAuthenticated, authController.getRegister);
router.post('/register', forwardAuthenticated, registrationRules(), authController.postRegister);

// Login Page
router.get('/login', forwardAuthenticated, authController.getLogin);
router.post('/login', loginRules(), authController.postLogin);

// Logout
router.get('/logout', authController.getLogout);

// Forgot Password
router.get('/forgot-password', forwardAuthenticated, authController.getForgotPassword);
router.post('/forgot-password', forwardAuthenticated, forgotPasswordRules(), authController.postForgotPassword);

// Reset Password
router.get('/reset-password/:token', forwardAuthenticated, authController.getResetPassword);
router.post('/reset-password/:token', forwardAuthenticated, resetPasswordRules(), authController.postResetPassword);


module.exports = router;