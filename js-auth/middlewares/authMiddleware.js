// middlewares/authMiddleware.js
module.exports = {
    ensureAuthenticated: function(req, res, next) {
        if (req.isAuthenticated()) {
            return next();
        }
        req.flash('error_msg', 'Please log in to view that resource');
        res.redirect('/auth/login');
    },
    ensureAdmin: function(req, res, next) {
        if (req.isAuthenticated() && req.user.role === 'admin') {
            return next();
        }
        req.flash('error_msg', 'You do not have permission to view that resource');
        if (req.isAuthenticated()) {
            res.redirect('/user/dashboard'); // or '/'
        } else {
            res.redirect('/auth/login');
        }
    },
    forwardAuthenticated: function(req, res, next) { // Prevent logged-in users from accessing login/register pages
        if (!req.isAuthenticated()) {
            return next();
        }
        res.redirect('/user/dashboard');
    }
};