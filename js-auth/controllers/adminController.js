// controllers/adminController.js
const User = require('../models/User');
const bcrypt = require('bcryptjs');
const { validationResult } = require('express-validator'); // If needed for admin forms

// GET Admin Dashboard
exports.getAdminDashboard = (req, res) => {
    res.render('admin/dashboard', {
        title: 'Admin Dashboard',
        user: req.user
    });
};

// GET Manage Users Page
exports.getManageUsers = async (req, res) => {
    try {
        const users = await User.find().sort({ createdAt: -1 }); // Get all users
        res.render('admin/users', {
            title: 'Manage Users',
            users: users,
            user: req.user // Current admin user
        });
    } catch (err) {
        console.error(err);
        req.flash('error_msg', 'Could not fetch users.');
        res.redirect('/admin/dashboard');
    }
};

// GET Edit User Page
exports.getEditUser = async (req, res) => {
    try {
        const userToEdit = await User.findById(req.params.id);
        if (!userToEdit) {
            req.flash('error_msg', 'User not found.');
            return res.redirect('/admin/users');
        }
        res.render('admin/edit-user', {
            title: 'Edit User',
            userToEdit: userToEdit,
            user: req.user // Current admin user
        });
    } catch (err) {
        console.error(err);
        req.flash('error_msg', 'Error fetching user details.');
        res.redirect('/admin/users');
    }
};

// POST Edit User
exports.postEditUser = async (req, res) => {
    const { username, email, role, isVerified } = req.body;
    const userId = req.params.id;

    // Basic validation (can be extended with express-validator)
    if (!username || !email || !role) {
        req.flash('error_msg', 'All fields except password are required.');
        return res.redirect(`/admin/users/${userId}/edit`);
    }

    try {
        const userToUpdate = await User.findById(userId);
        if (!userToUpdate) {
            req.flash('error_msg', 'User not found.');
            return res.redirect('/admin/users');
        }

        // Check if email or username is being changed to one that already exists (excluding current user)
        if (email.toLowerCase() !== userToUpdate.email) {
            const emailExists = await User.findOne({ email: email.toLowerCase(), _id: { $ne: userId } });
            if (emailExists) {
                req.flash('error_msg', 'Email already in use by another account.');
                return res.redirect(`/admin/users/${userId}/edit`);
            }
        }
        if (username !== userToUpdate.username) {
            const usernameExists = await User.findOne({ username: username, _id: { $ne: userId } });
            if (usernameExists) {
                req.flash('error_msg', 'Username already in use by another account.');
                return res.redirect(`/admin/users/${userId}/edit`);
            }
        }


        userToUpdate.username = username;
        userToUpdate.email = email.toLowerCase();
        userToUpdate.role = role;
        userToUpdate.isVerified = isVerified === 'on' || isVerified === true; // Handle checkbox

        // Optionally allow password change by admin
        if (req.body.newPassword && req.body.newPassword.trim() !== '') {
            if (req.body.newPassword.length < 6) {
                req.flash('error_msg', 'New password must be at least 6 characters long.');
                return res.redirect(`/admin/users/${userId}/edit`);
            }
            // No need to hash here, pre-save hook will do it if 'password' field is modified.
            // However, explicitly setting it marks it as modified.
            const salt = await bcrypt.genSalt(12);
            userToUpdate.password = await bcrypt.hash(req.body.newPassword, salt);
        }

        await userToUpdate.save();
        req.flash('success_msg', 'User updated successfully.');
        res.redirect('/admin/users');

    } catch (err) {
        console.error(err);
        req.flash('error_msg', 'Error updating user.');
        res.redirect(`/admin/users/${userId}/edit`);
    }
};

// POST Delete User
exports.postDeleteUser = async (req, res) => {
    try {
        const userToDelete = await User.findById(req.params.id);

        if (!userToDelete) {
            req.flash('error_msg', 'User not found.');
            return res.redirect('/admin/users');
        }

        // Prevent admin from deleting themselves
        if (userToDelete._id.toString() === req.user._id.toString()) {
            req.flash('error_msg', 'You cannot delete your own account from the admin panel.');
            return res.redirect('/admin/users');
        }

        await User.deleteOne({ _id: req.params.id });
        req.flash('success_msg', 'User deleted successfully.');
        res.redirect('/admin/users');
    } catch (err) {
        console.error(err);
        req.flash('error_msg', 'Error deleting user.');
        res.redirect('/admin/users');
    }
};