// controllers/userController.js
const User = require('../models/User');
const bcrypt = require('bcryptjs');
const { validationResult } = require('express-validator');

// GET User Dashboard
exports.getDashboard = (req, res) => {
    res.render('user/dashboard', {
        title: 'Dashboard',
        user: req.user
    });
};

// GET Change Password Page
exports.getChangePassword = (req, res) => {
    const validationErrors = req.flash('validation_errors') || [];
    res.render('user/change-password', {
        title: 'Change Password',
        user: req.user,
        errors: validationErrors,
        oldInput: {} // No old input for password fields
    });
};

// POST Change Password
exports.postChangePassword = async (req, res, next) => {
    const { currentPassword, newPassword, confirmNewPassword } = req.body;
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
        req.flash('validation_errors', errors.array());
        return res.status(422).render('user/change-password', {
            title: 'Change Password',
            user: req.user,
            errors: errors.array(),
            oldInput: {}
        });
    }

    try {
        const user = await User.findById(req.user.id);
        if (!user) {
            req.flash('error_msg', 'User not found.');
            return res.redirect('/auth/login'); // Should not happen if authenticated
        }

        const isMatch = await bcrypt.compare(currentPassword, user.password);
        if (!isMatch) {
            req.flash('error_msg', 'Incorrect current password.');
            return res.render('user/change-password', {
                title: 'Change Password',
                user: req.user,
                errors: [{ msg: 'Incorrect current password.' }],
                oldInput: {}
            });
        }

        user.password = newPassword; // Hashing done by pre-save hook
        await user.save();

        req.flash('success_msg', 'Password changed successfully.');
        res.redirect('/user/dashboard');

    } catch (err) {
        console.error(err);
        req.flash('error_msg', 'Something went wrong. Please try again.');
        res.redirect('/user/change-password');
        // or next(err)
    }
};