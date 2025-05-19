// routes/apiRoutes.js
const express = require('express');
const router = express.Router();

// API endpoint to get CSRF token
router.get('/csrf-token', (req, res) => {
    if (!req.csrfToken) {
        return res.status(500).json({ error: 'CSRF protection not enabled' });
    }

    // Generate and store a CSRF token in the session
    const token = req.csrfToken();
    req.session.csrfToken = token;

    res.json({ csrfToken: token });
});

// API endpoint to check auth status
router.get('/auth-status', (req, res) => {
    if (req.isAuthenticated()) {
        return res.json({
            isAuthenticated: true,
            userId: req.user._id,
            username: req.user.username,
            role: req.user.role
        });
    } else if (req.session.isGuest && req.session.guestId) {
        return res.json({
            isAuthenticated: false,
            isGuest: true,
            guestId: req.session.guestId
        });
    } else {
        return res.json({
            isAuthenticated: false,
            isGuest: false
        });
    }
});

module.exports = router;