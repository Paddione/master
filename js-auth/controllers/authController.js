// js-auth/controllers/authController.js
const passport = require('passport');
const User = require('../models/User'); // Ensure this path is correct
const crypto =require('crypto');
// const { sendPasswordResetEmail } = require('../services/emailService'); // If using an email service

// --- Render Pages ---

exports.getRegister = (req, res) => {
    res.render('auth/register', { // Path to views/auth/register.ejs
        title: 'Register',
        old_input: req.flash('old_input')[0] || {},
        validation_errors: req.flash('validation_errors'),
        csrfToken: req.csrfToken()
    });
};

exports.getLogin = (req, res) => {
    res.render('auth/login', { // Path to views/auth/login.ejs
        title: 'Login',
        old_input: req.flash('old_input')[0] || {},
        csrfToken: req.csrfToken()
    });
};

exports.getLogout = (req, res, next) => {
    req.logout(function(err) {
        if (err) {
            console.error("Error during logout:", err);
            req.flash('error_msg', 'Could not log out. Please try again.');
            return res.redirect('/');
        }
        req.flash('success_msg', 'You have been successfully logged out.');
        res.render('auth/logout', { // Path to views/auth/logout.ejs
            title: 'Logged Out',
            csrfToken: req.csrfToken()
        });
    });
};

exports.getForgotPassword = (req, res) => {
    res.render('auth/forgot-password', { // Path to views/auth/forgot-password.ejs
        title: 'Forgot Password',
        csrfToken: req.csrfToken(),
        old_input: req.flash('old_input')[0] || {}
    });
};

exports.getResetPassword = async (req, res) => {
    try {
        const user = await User.findOne({
            resetPasswordToken: req.params.token,
            resetPasswordExpires: { $gt: Date.now() }
        });

        if (!user) {
            req.flash('error_msg', 'Password reset token is invalid or has expired.');
            return res.redirect('/auth/forgot-password');
        }
        res.render('auth/reset-password', { // Path to views/auth/reset-password.ejs
            title: 'Reset Password',
            token: req.params.token,
            csrfToken: req.csrfToken()
        });
    } catch (error) {
        console.error("Error finding user for password reset:", error);
        req.flash('error_msg', 'An error occurred. Please try again.');
        res.redirect('/auth/forgot-password');
    }
};


// --- Handle Form Submissions ---

exports.postRegister = async (req, res) => {
    const { username, email, password } = req.body;
    try {
        let userByEmail = await User.findOne({ email: email.toLowerCase() });
        if (userByEmail) {
            req.flash('error_msg', 'Email is already registered.');
            req.flash('old_input', req.body);
            return res.redirect('/auth/register');
        }
        let userByUsername = await User.findOne({ username: username });
        if (userByUsername) {
            req.flash('error_msg', 'Username is already taken.');
            req.flash('old_input', req.body);
            return res.redirect('/auth/register');
        }
        const newUser = new User({ username, email: email.toLowerCase(), password });
        await newUser.save();
        req.flash('success_msg', 'You are now registered and can log in.');
        res.redirect('/auth/login');
    } catch (error) {
        console.error("Error during registration:", error);
        req.flash('error_msg', 'Something went wrong during registration. Please try again.');
        req.flash('old_input', req.body);
        res.redirect('/auth/register');
    }
};

exports.postLogin = (req, res, next) => {
    passport.authenticate('local', (err, user, info) => {
        if (err) { return next(err); }
        if (!user) {
            req.flash('error_msg', info.message || 'Login failed. Please check your credentials.');
            req.flash('old_input', req.body);
            return res.redirect('/auth/login');
        }
        req.logIn(user, function(err) {
            if (err) {
                req.flash('error_msg', 'An error occurred during login.');
                return next(err);
            }
            if (req.user.role === 'admin') {
                return res.redirect('/admin/dashboard');
            } else {
                return res.redirect('/user/dashboard');
            }
        });
    })(req, res, next);
};

exports.postForgotPassword = async (req, res) => {
    const { email } = req.body;
    try {
        const user = await User.findOne({ email: email.toLowerCase() });
        if (!user) {
            req.flash('success_msg', 'If an account with that email exists, a password reset link has been sent.');
            return res.redirect('/auth/forgot-password');
        }
        const token = crypto.randomBytes(20).toString('hex');
        user.resetPasswordToken = token;
        user.resetPasswordExpires = Date.now() + 3600000; // 1 hour
        await user.save();
        // TODO: Implement actual email sending
        // await sendPasswordResetEmail(user.email, token, req.headers.host);
        console.log(`Password reset token for ${user.email}: ${token} (Email sending not implemented)`);
        req.flash('success_msg', `If your email is registered, you will receive a password reset link shortly. (For testing, token: ${token})`);
        res.redirect('/auth/forgot-password');
    } catch (error) {
        console.error("Error in forgot password:", error);
        req.flash('error_msg', 'Error processing request. Please try again.');
        res.redirect('/auth/forgot-password');
    }
};

exports.postResetPassword = async (req, res) => {
    const { password } = req.body;
    try {
        const user = await User.findOne({
            resetPasswordToken: req.params.token,
            resetPasswordExpires: { $gt: Date.now() }
        });
        if (!user) {
            req.flash('error_msg', 'Password reset token is invalid or has expired.');
            return res.redirect('/auth/forgot-password');
        }
        user.password = password;
        user.resetPasswordToken = undefined;
        user.resetPasswordExpires = undefined;
        await user.save();
        req.logIn(user, function(err) {
            if (err) {
                console.error("Error logging in after password reset:", err);
                req.flash('success_msg', 'Password has been reset. Please log in manually.');
                return res.redirect('/auth/login');
            }
            req.flash('success_msg', 'Success! Your password has been changed. You are now logged in.');
            res.redirect('/user/dashboard');
        });
    } catch (error) { // Corrected: removed trailing underscore
        console.error("Error resetting password:", error);
        req.flash('error_msg', 'Error resetting password. Please try again.');
        res.redirect('back');
    }
};
