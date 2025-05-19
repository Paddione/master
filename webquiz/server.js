// webquiz/server.js - Enhanced with session support
const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const fs = require('fs');
const path = require('path');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const cors = require('cors');
const compression = require('compression');
const session = require('express-session');
const MongoStore = require('connect-mongo');

// Assuming dotenv is installed for process.env variables if not provided by Docker
if (process.env.NODE_ENV !== 'production') { // Only load dotenv in dev if present
    try {
        require('dotenv').config({ path: path.join(__dirname, '.env') });
    } catch (e) {
        console.log('dotenv not found or not used, relying on Docker env vars');
    }
}

const app = express();
const server = http.createServer(app);

// --- Environment Configuration ---
const PORT = process.env.PORT || 3000;
// FIX: Use the same MongoDB URI format as in docker-compose, using the container name "mongo" instead of localhost
const MONGODB_URI = process.env.MONGO_URI || `mongodb://${process.env.MONGO_ROOT_USER}:${process.env.MONGO_ROOT_PASSWORD}@mongo:27017/${process.env.MONGO_SESSIONS_DB_NAME}?authSource=admin&directConnection=true`;
const SESSION_SECRET = process.env.SESSION_SECRET || 'quiz-session-secret-key-change-in-production';
const COOKIE_SECURE = process.env.NODE_ENV === 'production';
const COOKIE_SAME_SITE = process.env.NODE_ENV === 'production' ? 'none' : 'lax';

// --- Game Configuration ---
const QUESTION_TIME_LIMIT = parseInt(process.env.QUESTION_TIME_LIMIT, 10) || 60; // seconds
const CORRECT_ANSWER_DISPLAY_DURATION = parseInt(process.env.CORRECT_ANSWER_DISPLAY_DURATION, 10) || 3000; // milliseconds
const MAX_PLAYERS = parseInt(process.env.MAX_PLAYERS, 10) || 8;

// Parse allowed origins from env or use defaults
const ALLOWED_ORIGINS = process.env.ALLOWED_ORIGINS
    ? process.env.ALLOWED_ORIGINS.split(',')
    : ['https://auth.korczewski.de', 'http://localhost:4000', 'http://localhost:7001'];

// --- Trust proxy for proper client IP detection behind reverse proxy ---
app.set('trust proxy', 1);

// --- Security middleware ---
app.use(helmet({
    contentSecurityPolicy: {
        directives: {
            defaultSrc: ["'self'"],
            scriptSrc: ["'self'", "'unsafe-inline'", 'https://cdn.tailwindcss.com', 'https://cdnjs.cloudflare.com', 'local.adguard.org'],
            styleSrc: ["'self'", "'unsafe-inline'", 'https://fonts.googleapis.com'],
            fontSrc: ["'self'", 'https://fonts.gstatic.com'],
            imgSrc: ["'self'", 'data:'],
            connectSrc: ["'self'"].concat(ALLOWED_ORIGINS)
        }
    }
}));

// --- CORS Configuration ---
app.use(cors({
    origin: ALLOWED_ORIGINS,
    methods: ['GET', 'POST'],
    credentials: true
}));

// --- Express middleware ---
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(compression());

// --- Session Configuration ---
const sessionConfig = {
    secret: SESSION_SECRET,
    resave: false,
    saveUninitialized: true, // Changed to true to ensure session exists
    store: MongoStore.create({
        mongoUrl: MONGODB_URI,
        ttl: 14 * 24 * 60 * 60, // 14 days
        autoRemove: 'native',
        collectionName: 'sessions',
        stringify: false
    }),
    cookie: {
        maxAge: 14 * 24 * 60 * 60 * 1000, // 14 days in milliseconds
        httpOnly: true,
        secure: COOKIE_SECURE,
        path: process.env.SESSION_COOKIE_PATH || '/',
        sameSite: process.env.SESSION_COOKIE_SAME_SITE || COOKIE_SAME_SITE
    },
    name: process.env.SESSION_COOKIE_NAME || 'quiz_auth_session'
};

// In production, set cookie domain for cross-subdomain sharing
if (process.env.NODE_ENV === 'production' && process.env.SESSION_COOKIE_DOMAIN) {
    sessionConfig.cookie.domain = process.env.SESSION_COOKIE_DOMAIN;
}

const sessionMiddleware = session(sessionConfig);
app.use(sessionMiddleware);

// --- Rate limiting ---
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: process.env.NODE_ENV === 'test' ? 1000 : 100, // limit per IP
    standardHeaders: true,
    legacyHeaders: false,
    keyGenerator: (req) => req.ip,
    skip: () => process.env.NODE_ENV === 'development' || process.env.NODE_ENV === 'test'
});

app.use(limiter);

// --- Socket.IO setup ---
const io = socketIo(server, {
    path: '/game/socket.io',
    cors: {
        origin: ALLOWED_ORIGINS,
        methods: ["GET", "POST"],
        credentials: true
    }
});

// Share session data with Socket.IO
const wrap = middleware => (socket, next) => middleware(socket.request, {}, next);
io.use(wrap(sessionMiddleware));

// Connect user's Socket.IO session with their Express session
io.use((socket, next) => {
    const session = socket.request.session;
    if (session) {
        socket.sessionID = session.id;

        if (session.passport && session.passport.user) {
            socket.userId = session.passport.user;
            socket.isAuthenticated = true;
            console.log(`Socket connected with authenticated user ID: ${socket.userId}`);
        } else if (session.isGuest && session.guestId) {
            socket.guestId = session.guestId;
            socket.isGuest = true;
            console.log(`Socket connected with guest ID: ${socket.guestId}`);
        }

        next();
    } else {
        console.log('Socket connection without valid session');
        socket.isAuthenticated = false;
        socket.isGuest = false;
        next();
    }
});

// --- Quiz Game State ---
let allQuestionSets = {};
let availableCategories = [];
let lobbies = {}; // In-memory store for lobbies

function generateLobbyId() {
    return Math.random().toString(36).substring(2, 8).toUpperCase();
}

function loadQuestions() {
    try {
        const questionsPath = path.join(__dirname, 'questions.json');
        if (!fs.existsSync(questionsPath)) {
            console.error(`questions.json not found at ${questionsPath}. Using fallback.`);
            throw new Error('questions.json not found');
        }
        const data = fs.readFileSync(questionsPath, 'utf8');
        allQuestionSets = JSON.parse(data);
        availableCategories = Object.keys(allQuestionSets);
        if (availableCategories.length === 0) {
            console.error("No question categories found in questions.json or it's empty. Using fallback.");
            throw new Error('No categories');
        }
        console.log('Question sets loaded successfully. Categories:', availableCategories.join(', '));
    } catch (error) {
        console.error('Error loading questions.json:', error.message);
        console.warn("Using fallback questions due to error.");
        allQuestionSets = {
            "Fallback Fragen": [
                { question: "Was ist 2 + 2?", options: ["3", "4", "5", "6"], answer: "4" },
                { question: "Was ist die Hauptstadt von Deutschland?", options: ["Berlin", "Madrid", "Paris", "Rom"], answer: "Berlin" },
                { question: "Wie viele Kontinente gibt es?", options: ["5", "6", "7", "8"], answer: "7" }
            ]
        };
        availableCategories = Object.keys(allQuestionSets);
    }
}

function shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
}

// --- Static Files ---
app.use('/game', express.static(path.join(__dirname, 'public')));

// --- Routes ---
// Redirect root to /game
app.get('/', (req, res) => {
    res.redirect('/game');
});

// Main game page route
app.get('/game', (req, res) => {
    // Check session for user info
    let userInfo = null;
    if (req.session.passport && req.session.passport.user) {
        userInfo = { isAuthenticated: true, id: req.session.passport.user };
    } else if (req.session.isGuest && req.session.guestId) {
        userInfo = { isGuest: true, id: req.session.guestId };
    }

    // Log session info for debugging
    console.log('Session on quiz app:', req.sessionID,
        'auth:', userInfo ? (userInfo.isAuthenticated ? 'yes' : 'guest') : 'none');

    // Prepare client config
    const clientConfig = {
        AUTH_APP_URL: process.env.APP_BASE_URL || 'https://auth.korczewski.de',
        SESSION_NAME: process.env.SESSION_COOKIE_NAME || 'quiz_auth_session',
        SESSION_PATH: process.env.SESSION_COOKIE_PATH || '/',
        SESSION_DOMAIN: process.env.SESSION_COOKIE_DOMAIN || req.hostname,
        SESSION_SAME_SITE: process.env.SESSION_COOKIE_SAME_SITE || COOKIE_SAME_SITE,
        CSRF_TOKEN: req.session.csrfToken || '',
        BASE_PATH: '/game/' // For client-side path awareness
    };

    // Read the HTML file
    fs.readFile(path.join(__dirname, 'public', 'index.html'), 'utf8', (err, data) => {
        if (err) {
            console.error('Error reading index.html:', err);
            return res.status(500).send('Error loading game');
        }

        // Inject CONFIG object into the HTML
        const configScript = `<script>window.CONFIG = ${JSON.stringify(clientConfig)};</script>`;
        const modifiedHTML = data.replace('</head>', `${configScript}\n</head>`);

        res.send(modifiedHTML);
    });
});

// API routes
app.get('/game/api/categories', (req, res) => {
    res.json({ categories: availableCategories });
});

app.get('/game/api/user', (req, res) => {
    if (req.session.passport && req.session.passport.user) {
        return res.json({
            isAuthenticated: true,
            id: req.session.passport.user
        });
    } else if (req.session.isGuest && req.session.guestId) {
        return res.json({
            isGuest: true,
            id: req.session.guestId
        });
    } else {
        return res.json({
            isAuthenticated: false,
            isGuest: false
        });
    }
});

// Error handler
app.use((err, req, res, next) => {
    console.error('Server error:', err);
    res.status(500).json({ error: 'Internal server error' });
});

// --- Socket.IO Game Logic ---
// Set up Socket.IO event handlers
io.on('connection', (socket) => {
    console.log('A user connected:', socket.id);

    // Handle socket disconnection
    socket.on('disconnect', () => {
        console.log('User disconnected:', socket.id);
        // Add logic to handle player disconnection from lobbies
    });

    // Add other event handlers for your game logic (createLobby, joinLobby, etc.)
    // These would be specific to your game implementation
});

// --- Server Initialization ---
server.listen(PORT, () => {
    loadQuestions();
    console.log(`Quiz server running on http://localhost:${PORT}`);
    console.log(`To play, open the URL in your browser or navigate to the root URL of this app.`);
    console.log(`If using Docker, it will be mapped to the host port specified in docker-compose.yml (e.g., http://localhost:4000)`);
});

// --- Process Handling ---
process.on('uncaughtException', (error) => {
    console.error('Uncaught Exception:', error);
    // Perform cleanup if necessary, then exit
    process.exit(1); // Mandatory exit after uncaught exception
});

process.on('SIGTERM', () => {
    console.log('SIGTERM received. Shutting down gracefully...');
    server.close(() => {
        console.log('HTTP server closed.');
        // Close any other resources like database connections if you add them
        process.exit(0);
    });
    // Force shutdown if server hasn't closed in time
    setTimeout(() => {
        console.error('Graceful shutdown timed out, forcing exit.');
        process.exit(1);
    }, 10000); // 10 seconds
});

process.on('SIGINT', () => {
    // Handle Ctrl+C (similar to SIGTERM)
    console.log('SIGINT received. Shutting down gracefully...');
    server.close(() => {
        console.log('HTTP server closed.');
        process.exit(0);
    });
    setTimeout(() => {
        console.error('Graceful shutdown timed out, forcing exit.');
        process.exit(1);
    }, 10000);
});