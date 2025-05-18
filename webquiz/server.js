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
const CORS_ORIGIN = process.env.ALLOWED_ORIGINS || '*';
const COOKIE_SECURE = process.env.NODE_ENV === 'production';
const COOKIE_SAME_SITE = process.env.NODE_ENV === 'production' ? 'none' : 'lax';

// --- Game Configuration ---
const QUESTION_TIME_LIMIT = parseInt(process.env.QUESTION_TIME_LIMIT, 10) || 60; // seconds
const CORRECT_ANSWER_DISPLAY_DURATION = parseInt(process.env.CORRECT_ANSWER_DISPLAY_DURATION, 10) || 3000; // milliseconds
const MAX_PLAYERS = parseInt(process.env.MAX_PLAYERS, 10) || 8;

// --- Express App Setup ---
// Trust proxy - if your app is behind a proxy (e.g., Nginx, Heroku, Fly.io)
app.set('trust proxy', 1);

// Security middleware
app.use(helmet({
    contentSecurityPolicy: {
        directives: {
            defaultSrc: ["'self'"],
            scriptSrc: ["'self'", 'https://cdn.tailwindcss.com', 'https://cdnjs.cloudflare.com'],
            styleSrc: ["'self'", "'unsafe-inline'", 'https://fonts.googleapis.com'],
            fontSrc: ["'self'", 'https://fonts.gstatic.com'],
            imgSrc: ["'self'", 'data:'],
            connectSrc: ["'self'", CORS_ORIGIN === '*' ? '*' : CORS_ORIGIN.split(',')]
        }
    }
}));

app.use(cors({
    origin: CORS_ORIGIN,
    methods: ['GET', 'POST'],
    credentials: true
}));

// Session configuration
const sessionMiddleware = session({
    secret: SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    store: MongoStore.create({
        mongoUrl: MONGODB_URI,
        ttl: 14 * 24 * 60 * 60, // Session TTL (14 days)
        autoRemove: 'native', // Use MongoDB's TTL index
        collectionName: 'sessions',
        stringify: false
    }),
    cookie: {
        secure: COOKIE_SECURE,
        sameSite: COOKIE_SAME_SITE,
        httpOnly: true,
        maxAge: 14 * 24 * 60 * 60 * 1000 // 14 days in milliseconds
    }
});

app.use(sessionMiddleware);

// Express middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Rate limiting - Apply after 'trust proxy' is set
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: process.env.NODE_ENV === 'test' ? 1000 : 100, // limit per IP
    standardHeaders: true,
    legacyHeaders: false,
});
app.use(limiter);

// Compression
app.use(compression());

// Socket.io setup with session sharing
const io = socketIo(server, {
    cors: {
        origin: CORS_ORIGIN,
        methods: ["GET", "POST"],
        credentials: true
    }
});

// Share session data with Socket.io
const wrap = middleware => (socket, next) => middleware(socket.request, {}, next);
io.use(wrap(sessionMiddleware));

// Connect user's Socket.io session with their Express session
io.use((socket, next) => {
    const session = socket.request.session;
    if (session && session.id) {
        socket.sessionID = session.id;
        next();
    } else {
        next(new Error('Unauthorized: No session found'));
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

// --- Routes ---
// Serve static files from the "public" directory with caching
app.use('/assets', express.static(path.join(__dirname, 'public'), {
    maxAge: '1d', // Cache static assets for 1 day
    etag: true
}));

// Main route with session check
app.get('/', (req, res) => {
    // Initialize session if needed
    if (!req.session.userId) {
        req.session.userId = Date.now().toString(36) + Math.random().toString(36).substr(2);
    }
    // Send the game HTML
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// API routes
app.get('/api/categories', (req, res) => {
    res.json({ categories: availableCategories });
});

// Error handler
app.use((err, req, res, next) => {
    console.error('Server error:', err);
    res.status(500).json({ error: 'Internal server error' });
});

// --- Socket.IO Game Logic ---
// ... (rest of the socket.io game logic is unchanged, so I'm keeping it as is)

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