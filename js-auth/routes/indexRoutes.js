// routes/indexRoutes.js
const express = require('express');
const router = express.Router();
const { ensureAuthenticated, forwardAuthenticated } = require('../middlewares/authMiddleware'); // Assuming path is correct
const { v4: uuidv4 } = require('uuid'); // For generating unique guest IDs

// Welcome Page
// forwardAuthenticated prevents logged-in users from seeing the generic welcome page
// and redirects them to their dashboard (which then redirects to game or admin dashboard)
router.get('/', forwardAuthenticated, (req, res) => {
    // This page should ideally offer Login, Register, and "Play as Guest" options
    res.render('index', { title: 'Welcome to Auth Portal' });
});

// Dashboard (redirects to user/admin dashboard for authenticated users)
// If a logged-in user somehow hits /dashboard, they get redirected appropriately.
// The authMiddleware's forwardAuthenticated already sends them to /user/dashboard
// which could then be a simple page that immediately redirects to game.korczewski.de
// or your /user/dashboard in userRoutes.js can handle the redirect.
router.get('/dashboard', ensureAuthenticated, (req, res) => {
    // If ensureAuthenticated passes, req.user exists.
    // Instead of redirecting to a local dashboard that might then redirect again,
    // consider redirecting directly to the game from here if that's the primary flow.
    // Or, your /user/dashboard and /admin/dashboard can be landing pages that
    // themselves offer a link/button to "Go to Game".

    // For now, keeping your original logic:
    if (req.user.role === 'admin') {
        // Admin might have a different landing page or go to an admin panel first
        // before going to the game.
        return res.redirect('/admin/dashboard'); // Or 'http://game.korczewski.de/admin-lounge' if applicable
    } else {
        // Regular user is authenticated, send them to the game.
        return res.redirect('http://auth.korczewski.de/game');
    }
});

// NEW: Play as Guest Route
router.get('/play-as-guest', (req, res) => {
    if (req.isAuthenticated()) {
        // User is already logged in.
        // Redirect them to the game with their existing authenticated session.
        return res.redirect('http://auth.korczewski.de/game');
    }

    // User is not authenticated, proceed to create a guest session.
    // Clear any potentially lingering partial session data if necessary
    if (req.session.passport && req.session.passport.user) {
        delete req.session.passport.user;
    }
    delete req.session.user; // If you manually store user object

    // Set guest-specific session information
    req.session.isGuest = true;
    req.session.guestId = uuidv4(); // Generate a unique ID for the guest
    // req.session.guestName = "Guest"; // Optional: if you want a display name

    // Save the session explicitly before redirecting to ensure it's written
    req.session.save(err => {
        if (err) {
            console.error('Error saving guest session:', err);
            req.flash('error_msg', 'Could not start a guest session. Please try again.');
            return res.redirect('/'); // Redirect to home/login page
        }
        // Session saved, now redirect to the game app.
        // The session cookie (with .korczewski.de domain) will be sent.
        console.log('Guest session created, redirecting to game.');
        res.redirect('http://auth.korczewski.de/game');
    });
});

module.exports = router;
