// js-auth/app.js
require('dotenv').config();

const express = require('express');
const mongoose = require('mongoose');
const session = require('express-session');
const MongoStore = require('connect-mongo');
const passport = require('passport');
const flash = require('connect-flash');
const path = require('path');
const csrf = require('csurf');
const cors = require('cors'); // <<<< 1. REQUIRE CORS

const User = require('./models/User');
const bcrypt = require('bcryptjs');

const app = express();

// Set trust proxy if behind a reverse proxy
if (process.env.NODE_ENV === 'production') {
    app.set('trust proxy', 1);
}

// --- CORS Configuration ---
// IMPORTANT: Configure this BEFORE your routes and other middleware that needs it.
const allowedOrigins = process.env.ALLOWED_ORIGINS
    ? process.env.ALLOWED_ORIGINS.split(',')
    : [
        'https://game.korczewski.de', // Your quiz game app
        'http://localhost:4000',      // Quiz game local dev (if applicable, adjust port)
        'http://localhost:3001',      // Quiz game local dev (another possible port)
        process.env.APP_BASE_URL      // Your auth app's own base URL (e.g., https://auth.korczewski.de)
    ];

const corsOptions = {
    origin: function (origin, callback) {
        // Allow requests with no origin (like mobile apps or curl requests)
        if (!origin) return callback(null, true);
        if (allowedOrigins.indexOf(origin) === -1) {
            const msg = 'The CORS policy for this site does not allow access from the specified Origin.';
            return callback(new Error(msg), false);
        }
        return callback(null, true);
    },
    credentials: true, // <<<< IMPORTANT for sending cookies (like session cookies) from frontend
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'], // Specify allowed methods
    allowedHeaders: ['Content-Type', 'Authorization', 'X-CSRF-Token', 'X-Requested-With'], // Specify allowed headers, add 'X-CSRF-Token' if you plan to send CSRF token via header for API calls
};

app.use(cors(corsOptions)); // <<<< 2. USE CORS MIDDLEWARE

// --- Passport Configuration ---
require('./config/passport-config')(passport);

// --- Database Configuration & Connection ---
// FIX: Use the container name "mongo" instead of localhost
// Make sure dbURI is using the configuration from docker-compose environment
const dbURI = process.env.MONGO_URI || `mongodb://${process.env.MONGO_ROOT_USER}:${process.env.MONGO_ROOT_PASSWORD}@mongo:27017/${process.env.MONGO_AUTH_DB_NAME}?authSource=admin&directConnection=true`;

const connectWithRetry = () => {
    console.log('Attempting MongoDB connection...');
    mongoose.connect(dbURI, { serverSelectionTimeoutMS: 5000 })
        .then(() => {
            console.log('MongoDB Connected Successfully.');
            createFirstAdminUser();
        })
        .catch(err => {
            console.error(`MongoDB Connection Error: ${err.message} - Retrying in 5 seconds...`);
            setTimeout(connectWithRetry, 5000);
        });
};
connectWithRetry();

async function createFirstAdminUser() {
    if (process.env.FIRST_ADMIN_EMAIL && process.env.FIRST_ADMIN_PASSWORD) {
        try {
            const existingAdmin = await User.findOne({ role: 'admin' });
            if (existingAdmin) { return; }
            const existingUserByEmail = await User.findOne({ email: process.env.FIRST_ADMIN_EMAIL.toLowerCase() });
            if (existingUserByEmail) {
                console.warn(`Could not create first admin: Email "${process.env.FIRST_ADMIN_EMAIL}" is already in use.`);
                return;
            }
            const adminUser = new User({
                username: process.env.FIRST_ADMIN_USERNAME || 'admin',
                email: process.env.FIRST_ADMIN_EMAIL.toLowerCase(),
                password: process.env.FIRST_ADMIN_PASSWORD,
                role: 'admin',
                isVerified: true
            });
            await adminUser.save();
            console.log(`First admin user created successfully. Email: ${process.env.FIRST_ADMIN_EMAIL}`);
        } catch (error) {
            console.error('Error during first admin user creation:', error.message);
        }
    }
}


// --- View Engine Setup (EJS) ---
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// --- Middleware ---
app.use(express.urlencoded({ extended: false }));
app.use(express.json());

// Express Session Middleware with consistent configuration
const sessionConfig = {
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    store: MongoStore.create({
        mongoUrl: dbURI,
        collectionName: 'sessions',
        ttl: 14 * 24 * 60 * 60 // 14 days
    }),
    cookie: {
        // Use consistent settings from environment variables
        maxAge: parseInt(process.env.SESSION_COOKIE_MAX_AGE, 10) || 1000 * 60 * 60 * 24 * 7, // 7 days
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        path: process.env.SESSION_COOKIE_PATH || '/',
        sameSite: process.env.SESSION_COOKIE_SAME_SITE || 'lax'
    },
    name: process.env.SESSION_COOKIE_NAME || 'quiz_auth_session' // Consistent name across services
};

// In production, set cookie domain for cross-subdomain sharing
if (process.env.NODE_ENV === 'production' && process.env.SESSION_COOKIE_DOMAIN) {
    sessionConfig.cookie.domain = process.env.SESSION_COOKIE_DOMAIN;
}

app.use(session(sessionConfig));

// Passport Middleware
app.use(passport.initialize());
app.use(passport.session());

// CSRF Protection Middleware
// IMPORTANT: CSRF protection is typically for form submissions from your own domain.
// For APIs called from different subdomains (like your game app calling auth app API),
// session cookies + CORS with credentials:true is often the primary protection against CSRF
// if the API endpoint is state-changing.
const csrfProtection = csrf({
    cookie: false, // Don't use a cookie-based CSRF token storage, since we want to make cross-domain API calls
    ignoreMethods: ['GET', 'HEAD', 'OPTIONS'] // Don't require CSRF for these methods
});
app.use(csrfProtection);

// Connect Flash Middleware
app.use(flash());

// Global Variables Middleware
app.use(function(req, res, next) {
    res.locals.success_msg = req.flash('success_msg');
    res.locals.error_msg = req.flash('error_msg');
    res.locals.error = req.flash('error'); // Passport.js login failure message
    res.locals.validation_errors = req.flash('validation_errors');
    res.locals.old_input = req.flash('old_input')[0] || {};
    res.locals.currentUser = req.user || null;
    res.locals.csrfToken = typeof req.csrfToken === 'function' ? req.csrfToken() : '';
    next();
});

// Static Folder Middleware
app.use(express.static(path.join(__dirname, 'public')));

// --- Routes ---
app.use('/', require('./routes/indexRoutes'));
app.use('/auth', require('./routes/authRoutes'));
app.use('/user', require('./routes/userRoutes'));
app.use('/admin', require('./routes/adminRoutes'));
app.use('/', require('./routes/hallOfFameRoutes')); // Contains /api/hall-of-fame/*
app.use('/api', require('./routes/apiRoutes'));

// --- Error Handling Middleware ---
// CSRF Token Error Handler
app.use(function (err, req, res, next) {
    if (err.code === 'EBADCSRFTOKEN') {
        console.warn('CSRF Token Error:', req.path, req.method, req.headers.origin);

        // For API requests, respond with JSON
        if (req.path.startsWith('/api/')) {
            return res.status(403).json({ message: 'Invalid CSRF token or session expired. Please refresh and try again.' });
        }

        // For browser requests, try to use flash, else fallback
        if (typeof req.flash === 'function') {
            req.flash('error_msg', 'Form submission error or session expired. Please try again.');
            return res.redirect(req.session.returnTo || req.originalUrl.split('?')[0] || '/');
        } else {
            // Fallback: log and redirect to login or error page with a query param
            console.error('req.flash is not a function in CSRF error handler. Session might be lost or middleware order issue.');
            return res.redirect('/auth/login?error=session_expired');
        }
    }
    next(err);
});

// 404 Not Found Handler
app.use((req, res, next) => {
    res.status(404).render('404', { // Assuming you have a 404.ejs view
        title: 'Page Not Found'
    });
});

// General Error Handler
app.use((err, req, res, next) => {
    console.error("Global Error Handler Invoked:", err.status, err.message, err.stack);
    const statusCode = err.status || 500;
    const errorMessage = (process.env.NODE_ENV === 'development' || err.expose || statusCode < 500) ? err.message : 'An unexpected error occurred.';

    // For API requests, respond with JSON
    if (req.path.startsWith('/api/')) {
        return res.status(statusCode).json({ message: errorMessage });
    }

    if (res.headersSent) {
        return next(err);
    }
    res.status(statusCode).render('error', {
        title: `Error ${statusCode}`,
        message: errorMessage,
        error: process.env.NODE_ENV === 'development' ? { message: err.message, stack: err.stack, status: statusCode } : {},
        currentUser: req.user || null,
        success_msg: '',
        error_msg: '',
        validation_errors: [],
        old_input: {}
    });
});

// --- Server Initialization & Graceful Shutdown ---
const PORT = process.env.PORT || 7000;
const server = app.listen(PORT, () => {
    console.log(`Auth server started on port ${PORT}`);
    console.log(`Application accessible at: ${process.env.APP_BASE_URL || `http://localhost:${PORT}`}`);
});

// ... (your existing gracefulShutdown function) ...
async function gracefulShutdown(signal) {
    console.log(`\nReceived ${signal}. Shutting down gracefully...`);
    const forceShutdownTimeout = setTimeout(() => {
        console.error('Graceful shutdown timed out, forcefully shutting down');
        process.exit(1);
    }, 15000);

    try {
        await new Promise((resolve, reject) => {
            server.close((err) => {
                if (err) {
                    console.error('Error closing HTTP server:', err);
                    return reject(err);
                }
                console.log('HTTP server closed.');
                resolve();
            });
        });
        await mongoose.connection.close();
        console.log('MongoDB connection closed.');
        clearTimeout(forceShutdownTimeout);
        process.exit(0);
    } catch (err) {
        console.error('Error during graceful shutdown:', err);
        clearTimeout(forceShutdownTimeout);
        process.exit(1);
    }
}
process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGINT', () => gracefulShutdown('SIGINT'));