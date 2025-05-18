// config/passport-config.js
const LocalStrategy = require('passport-local').Strategy;
const MicrosoftStrategy = require('passport-microsoft').Strategy; // Add this
const bcrypt = require('bcryptjs');
const User = require('../models/User');

module.exports = function(passport) {
    // ... (your existing LocalStrategy configuration) ...
    passport.use(
        new LocalStrategy({ usernameField: 'email' }, (email, password, done) => {
            // ... (existing local strategy logic)
            User.findOne({ email: email.toLowerCase() })
                .then(user => {
                    if (!user) {
                        return done(null, false, { message: 'That email is not registered' });
                    }
                    if (!user.password) { // User might have registered via OAuth and has no local password
                        return done(null, false, { message: 'Please log in with the method you originally used (e.g., Microsoft login) or reset your password if you wish to set one.' });
                    }
                    bcrypt.compare(password, user.password, (err, isMatch) => {
                        if (err) throw err;
                        if (isMatch) {
                            return done(null, user);
                        } else {
                            return done(null, false, { message: 'Password incorrect' });
                        }
                    });
                })
                .catch(err => console.log(err));
        })
    );


    // Microsoft Strategy Configuration
    if (process.env.MICROSOFT_CLIENT_ID && process.env.MICROSOFT_CLIENT_SECRET) {
        passport.use(new MicrosoftStrategy({
                clientID: process.env.MICROSOFT_CLIENT_ID,
                clientSecret: process.env.MICROSOFT_CLIENT_SECRET,
                callbackURL: `${process.env.APP_BASE_URL}/auth/microsoft/callback`,
                scope: ['user.read'] // Defines the permissions your app requests
            },
            async (accessToken, refreshToken, profile, done) => {
                // profile object contains user information from Microsoft
                // console.log(profile);
                const microsoftEmail = profile.emails && profile.emails.length > 0 ? profile.emails[0].value : null;
                if (!microsoftEmail) {
                    return done(null, false, { message: 'Could not retrieve email from Microsoft account.' });
                }

                try {
                    let user = await User.findOne({ email: microsoftEmail.toLowerCase() });

                    if (user) {
                        // User exists, log them in.
                        // Optionally, you could update user details here if they've changed in Microsoft.
                        // e.g., user.microsoftId = profile.id; await user.save();
                        return done(null, user);
                    } else {
                        // User doesn't exist, create a new user account.
                        const newUser = new User({
                            // Microsoft profile might not provide a 'username' directly in the same way.
                            // You might need to derive it or ask the user to set one later.
                            // For now, using display name or part of email.
                            username: profile.displayName || microsoftEmail.split('@')[0],
                            email: microsoftEmail.toLowerCase(),
                            // No local password for OAuth users initially
                            // password: will be undefined
                            role: 'user', // Default role
                            isVerified: true // Assume email from Microsoft is verified
                            // Store Microsoft profile ID for future reference/linking
                            // microsoftId: profile.id
                        });
                        await newUser.save();
                        return done(null, newUser);
                    }
                } catch (err) {
                    return done(err);
                }
            }));
    } else {
        console.warn("Microsoft OAuth credentials (CLIENT_ID or CLIENT_SECRET) are missing. Microsoft login will be disabled.");
    }


    passport.serializeUser((user, done) => {
        done(null, user.id);
    });

    passport.deserializeUser(async (id, done) => {
        try {
            const user = await User.findById(id);
            done(null, user);
        } catch (err) {
            done(err, null);
        }
    });
};