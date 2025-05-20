// middleware/session.js
// Modular session middleware with error handling

const session = require('express-session');
const MongoStore = require('connect-mongo');

/**
 * Creates a robust session middleware with error handling
 * @param {Object} config - Configuration options
 * @returns {Function} Express middleware
 */
module.exports = function createSessionMiddleware(config = {}) {
    // Default configuration
    const {
        mongoUrl = process.env.MONGO_URI || 'mongodb://localhost:27017/quiz_sessions',
        dbName = process.env.MONGO_SESSIONS_DB_NAME || 'js_auth_db',
        collectionName = 'sessions',
        secret = process.env.SESSION_SECRET || 'defaultsecret',
        cookieName = process.env.SESSION_NAME || 'quiz.sid',
        cookieDomain = process.env.COOKIE_DOMAIN,
        isProduction = process.env.NODE_ENV === 'production',
        maxAge = 24 * 60 * 60 * 1000, // 1 day in ms
    } = config;

    // Create session store with connection error handling
    const store = MongoStore.create({
        mongoUrl,
        dbName,
        collectionName,
        ttl: maxAge / 1000, // TTL in seconds
        touchAfter: 60 * 60, // 1 hour in seconds
        crypto: {
            secret
        },
        autoRemove: 'interval',
        autoRemoveInterval: 60, // minutes
        stringify: false, // Use JSON.parse and JSON.stringify
        // Handle connection errors
        connectionOptions: {
            useNewUrlParser: true,
            useUnifiedTopology: true,
            serverSelectionTimeoutMS: 5000,
            socketTimeoutMS: 45000,
        }
    });

    // Log store errors
    store.on('error', function(error) {
        console.error('Session store error:', error);
    });

    // Create session middleware
    const sessionMiddleware = session({
        name: cookieName,
        secret,
        resave: false,
        saveUninitialized: false,
        store,
        cookie: {
            secure: isProduction,
            httpOnly: true,
            maxAge,
            sameSite: isProduction ? 'none' : 'lax',
            path: '/',
            domain: cookieDomain || undefined
        },
        rolling: true,
        unset: 'destroy'
    });

    // Return a wrapped middleware that handles errors
    return function(req, res, next) {
        sessionMiddleware(req, res, (err) => {
            // Handle session errors
            if (err) {
                console.error('Session middleware error:', err.message);
                // Clear the cookie to force a new session
                if (req.cookies && req.cookies[cookieName]) {
                    res.clearCookie(cookieName);
                }
                return next();
            }

            // Check for missing session
            if (!req.session) {
                console.warn('Session not available, creating new session');
                if (req.cookies && req.cookies[cookieName]) {
                    res.clearCookie(cookieName);
                }
            }

            next();
        });
    };
};