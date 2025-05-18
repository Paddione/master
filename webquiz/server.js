// webquiz/server.js
const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const fs = require('fs');
const path = require('path');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const cors = require('cors');
const compression = require('compression');

// Assuming dotenv is installed for process.env variables if not provided by Docker
if (process.env.NODE_ENV !== 'production') { // Only load dotenv in dev if present
    try {
        require('dotenv').config({ path: path.join(__dirname, '.env') });
    } catch (e) {
        // console.log('dotenv not found or not used, relying on Docker env vars');
    }
}

const app = express();
const server = http.createServer(app);
const io = socketIo(server);

const PORT = process.env.PORT || 3000; // Port for the quiz game server

// --- Game Configuration ---
const QUESTION_TIME_LIMIT = parseInt(process.env.QUESTION_TIME_LIMIT, 10) || 60; // seconds
const CORRECT_ANSWER_DISPLAY_DURATION = parseInt(process.env.CORRECT_ANSWER_DISPLAY_DURATION, 10) || 3000; // milliseconds
const MAX_PLAYERS = parseInt(process.env.MAX_PLAYERS, 10) || 8;

let allQuestionSets = {};
let availableCategories = [];

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

// --- Express App Setup ---

// FIX 1: Trust proxy
// If your app is behind one proxy (e.g., Nginx, Heroku, Fly.io), set this to 1.
// If behind multiple proxies, set to the number of proxies.
// See https://expressjs.com/en/guide/behind-proxies.html
app.set('trust proxy', 1); // Adjust as needed for your environment

// Security middleware
app.use(helmet());
app.use(cors({
    origin: process.env.ALLOWED_ORIGINS || '*', // Configure this properly for production
    methods: ['GET', 'POST']
}));

// Rate limiting - Apply after 'trust proxy' is set
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: process.env.NODE_ENV === 'test' ? 1000 : 100, // limit each IP to 100 requests per windowMs, higher for tests
    standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
    legacyHeaders: false, // Disable the `X-RateLimit-*` headers
    // keyGenerator: (req, res) => req.ip, // Default, uses req.ip which is now proxy-aware
});
app.use(limiter);

// Compression
app.use(compression());

// Serve static files from the "public" directory
app.use(express.static(path.join(__dirname, 'public'), {
    maxAge: '1d', // Cache static assets for 1 day
    etag: true
}));

// Main route to serve the quiz game HTML
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});


let lobbies = {}; // In-memory store for lobbies

io.on('connection', (socket) => {
    console.log(`New client connected: ${socket.id}`);

    socket.on('createLobby', (playerName) => {
        const lobbyId = generateLobbyId();
        lobbies[lobbyId] = {
            id: lobbyId,
            players: [{ id: socket.id, name: playerName || `Spieler ${socket.id.substring(0,4)}`, score: 0, streak: 0, isHost: true, hasAnswered: false }],
            currentQuestionIndex: -1,
            questions: [],
            selectedCategory: null,
            gameState: 'waiting', // 'waiting', 'active', 'paused', 'finished'
            isPaused: false,
            remainingTimeOnPause: null,
            questionStartTime: null,
            questionTimerInterval: null,
            questionTimeout: null,
            playerAnswers: {},
        };
        socket.join(lobbyId);
        socket.emit('lobbyCreated', {
            lobbyId,
            players: lobbies[lobbyId].players,
            playerId: socket.id,
            availableCategories: availableCategories
        });
        console.log(`Lobby ${lobbyId} created by ${playerName} (${socket.id})`);
    });

    socket.on('joinLobby', ({ lobbyId, playerName }) => {
        const lobby = lobbies[lobbyId];
        if (lobby) {
            if (lobby.gameState !== 'waiting' && lobby.gameState !== 'active') {
                socket.emit('lobbyError', 'Das Spiel in dieser Lobby ist bereits beendet.');
                return;
            }
            if (lobby.players.length >= MAX_PLAYERS && !lobby.players.find(p => p.id === socket.id)) {
                socket.emit('lobbyError', `Diese Lobby ist voll (max. ${MAX_PLAYERS} Spieler).`);
                return;
            }

            const newPlayer = { id: socket.id, name: playerName || `Spieler ${socket.id.substring(0,4)}`, score: 0, streak: 0, isHost: lobby.players.length === 0, hasAnswered: false };
            // If the lobby was empty, the first player to join (or create) becomes host.
            // This logic might need adjustment if createLobby already sets a host.
            // The createLobby already sets the creator as host, so this isHost for join might be redundant or simplified.
            // Let's assume host is only set on creation, and subsequent joins are not hosts.
            newPlayer.isHost = false; // Ensure only creator is host initially. Host transfer happens on disconnect.

            // Check if player is already in the lobby (e.g., due to a quick reconnect with the same socket ID, though unlikely)
            const existingPlayer = lobby.players.find(p => p.id === socket.id);
            if (!existingPlayer) {
                lobby.players.push(newPlayer);
            } else {
                // Player with this socket ID already exists, perhaps update their name if provided
                existingPlayer.name = playerName || existingPlayer.name;
                console.log(`Player ${existingPlayer.name} (${socket.id}) re-acknowledged in lobby ${lobbyId}`);
            }


            socket.join(lobbyId);

            socket.emit('joinedLobby', {
                lobbyId,
                players: lobby.players,
                playerId: socket.id,
                gameState: lobby.gameState,
                selectedCategory: lobby.selectedCategory,
                allCategoriesForLobby: availableCategories,
                isPaused: lobby.isPaused,
                remainingTime: lobby.isPaused ? lobby.remainingTimeOnPause : undefined
            });
            socket.to(lobbyId).emit('playerJoined', {
                players: lobby.players,
                joinedPlayerId: socket.id,
                joinedPlayerName: newPlayer.name,
                allCategoriesForLobby: availableCategories,
                selectedCategory: lobby.selectedCategory
            });
            console.log(`${newPlayer.name} (${socket.id}) joined lobby ${lobbyId}`);
        } else {
            socket.emit('lobbyError', 'Lobby nicht gefunden.');
        }
    });

    socket.on('hostSelectedCategory', ({ lobbyId, categoryKey }) => {
        const lobby = lobbies[lobbyId];
        if (lobby && lobby.players.find(p => p.id === socket.id && p.isHost)) {
            if (availableCategories.includes(categoryKey) || categoryKey === null || categoryKey === "") {
                lobby.selectedCategory = categoryKey || null;
                console.log(`Lobby ${lobbyId}: Host ${socket.id} selected category ${lobby.selectedCategory}`);
                io.to(lobbyId).emit('categoryUpdatedByHost', lobby.selectedCategory);
            } else {
                socket.emit('lobbyError', 'Ungültige Kategorie ausgewählt.');
            }
        } else {
            console.warn(`Unauthorized category selection or lobby not found. Lobby: ${lobbyId}, Socket: ${socket.id}`);
            socket.emit('lobbyError', 'Kategorie konnte nicht ausgewählt werden.');
        }
    });


    socket.on('startGame', ({ lobbyId, categoryKey }) => {
        const lobby = lobbies[lobbyId];
        if (lobby && lobby.players.find(p => p.id === socket.id && p.isHost)) {
            if (lobby.players.length < 1) { // Or 2 if you want minimum 2 players
                socket.emit('startGameError', 'Nicht genügend Spieler, um das Spiel zu starten.');
                return;
            }
            if (!lobby.selectedCategory || lobby.selectedCategory !== categoryKey) {
                if (allQuestionSets[categoryKey]) {
                    lobby.selectedCategory = categoryKey;
                    io.to(lobbyId).emit('categoryUpdatedByHost', lobby.selectedCategory);
                } else {
                    socket.emit('startGameError', 'Bitte wähle zuerst eine gültige Fragenkategorie aus.');
                    return;
                }
            }

            if (!allQuestionSets[lobby.selectedCategory]) {
                socket.emit('startGameError', 'Ungültige Fragenkategorie ausgewählt.');
                return;
            }

            lobby.questions = shuffleArray([...allQuestionSets[lobby.selectedCategory]]);
            if (!lobby.questions || lobby.questions.length === 0) {
                socket.emit('startGameError', `Keine Fragen in der Kategorie "${lobby.selectedCategory}" gefunden.`);
                lobby.selectedCategory = null;
                io.to(lobbyId).emit('categoryUpdatedByHost', null);
                return;
            }

            lobby.gameState = 'active';
            lobby.isPaused = false;
            lobby.remainingTimeOnPause = null;
            lobby.currentQuestionIndex = -1;
            lobby.playerAnswers = {};
            lobby.players.forEach(p => {
                p.score = 0;
                p.streak = 0;
                p.hasAnswered = false;
            });

            io.to(lobbyId).emit('gameStarted', { lobbyId, players: lobby.players, category: lobby.selectedCategory });
            console.log(`Game started in lobby ${lobbyId} with category "${lobby.selectedCategory}"`);
            sendNextQuestion(lobbyId);
        } else {
            socket.emit('startGameError', 'Nur der Host kann das Spiel starten oder die Lobby wurde nicht gefunden.');
        }
    });

    socket.on('submitAnswer', ({ lobbyId, questionIndex, answer }) => {
        const lobby = lobbies[lobbyId];
        if (!lobby || lobby.gameState !== 'active' || lobby.isPaused || lobby.currentQuestionIndex !== questionIndex) {
            console.log(`Invalid answer submission for lobby ${lobbyId} by ${socket.id} (paused: ${lobby ? lobby.isPaused : 'N/A'}, gameState: ${lobby ? lobby.gameState : 'N/A'}, qIndex client: ${questionIndex}, qIndex server: ${lobby ? lobby.currentQuestionIndex : 'N/A'})`);
            return;
        }

        const player = lobby.players.find(p => p.id === socket.id);
        if (!player || player.hasAnswered) {
            console.log(`Player ${socket.id} already answered or not found in lobby ${lobbyId}`);
            return;
        }

        player.hasAnswered = true;
        const timeTaken = (Date.now() - lobby.questionStartTime) / 1000;
        const currentQuestion = lobby.questions[lobby.currentQuestionIndex];

        if (!currentQuestion) {
            console.error(`Error: currentQuestion is undefined in lobby ${lobbyId} at index ${lobby.currentQuestionIndex}.`);
            socket.emit('answerResult', {
                isCorrect: false,
                correctAnswer: "Fehler: Frage nicht gefunden",
                score: player.score,
                streak: player.streak,
                pointsEarned: 0
            });
            return;
        }

        const isCorrect = currentQuestion.answer === answer;
        let pointsEarned = 0;

        if (isCorrect) {
            player.streak++;
            const timeRemaining = Math.max(0, QUESTION_TIME_LIMIT - timeTaken);
            const basePoints = 100;
            const timeBonus = Math.floor((timeRemaining / QUESTION_TIME_LIMIT) * 50);
            const streakBonus = player.streak * 10;
            pointsEarned = basePoints + timeBonus + streakBonus;
        } else {
            player.streak = 0;
            pointsEarned = 0;
        }
        player.score += pointsEarned;
        player.score = Math.max(0, player.score);

        if (!lobby.playerAnswers[questionIndex]) {
            lobby.playerAnswers[questionIndex] = {};
        }
        lobby.playerAnswers[questionIndex][socket.id] = { answer, isCorrect, pointsEarned, timeTaken };

        socket.emit('answerResult', {
            isCorrect,
            correctAnswer: currentQuestion.answer,
            score: player.score,
            streak: player.streak,
            pointsEarned
        });

        const allAnswered = lobby.players.every(p => p.hasAnswered);
        if (allAnswered && !lobby.isPaused) {
            clearTimeout(lobby.questionTimeout);
            clearInterval(lobby.questionTimerInterval);
            processQuestionEnd(lobbyId);
        }
    });

    socket.on('hostTogglePause', ({ lobbyId }) => {
        const lobby = lobbies[lobbyId];
        if (lobby && lobby.players.find(p => p.id === socket.id && p.isHost) && lobby.gameState === 'active') {
            if (lobby.isPaused) {
                lobby.isPaused = false;
                io.to(lobbyId).emit('gameResumed');
                console.log(`Lobby ${lobbyId} resumed by host.`);
                if (lobby.remainingTimeOnPause !== null) {
                    const timePassedBeforePause = QUESTION_TIME_LIMIT - lobby.remainingTimeOnPause;
                    lobby.questionStartTime = Date.now() - (timePassedBeforePause * 1000);
                    startQuestionTimer(lobby, lobby.remainingTimeOnPause);
                    lobby.remainingTimeOnPause = null;
                } else {
                    console.warn(`Lobby ${lobbyId} resumed, but remainingTimeOnPause was null. Starting timer with full duration.`);
                    lobby.questionStartTime = Date.now();
                    startQuestionTimer(lobby, QUESTION_TIME_LIMIT);
                }
            } else {
                lobby.isPaused = true;
                if (lobby.questionTimerInterval) clearInterval(lobby.questionTimerInterval);
                if (lobby.questionTimeout) clearTimeout(lobby.questionTimeout);

                const elapsedTime = (Date.now() - lobby.questionStartTime) / 1000;
                lobby.remainingTimeOnPause = Math.max(0, QUESTION_TIME_LIMIT - elapsedTime);

                io.to(lobbyId).emit('gamePaused', { remainingTime: lobby.remainingTimeOnPause });
                console.log(`Lobby ${lobbyId} paused by host. Time left: ${lobby.remainingTimeOnPause}`);
            }
        } else {
            console.warn(`Host toggle pause denied for lobby ${lobbyId} by socket ${socket.id}. Conditions not met.`);
        }
    });

    socket.on('hostSkipToEnd', ({ lobbyId }) => {
        const lobby = lobbies[lobbyId];
        if (lobby && lobby.players.find(p => p.id === socket.id && p.isHost) && lobby.gameState === 'active' && !lobby.isPaused) {
            console.log(`Host ${socket.id} is skipping to end for lobby ${lobbyId}.`);
            endGame(lobbyId);
        } else {
            console.warn(`Host skip to end denied for lobby ${lobbyId} by socket ${socket.id}. Conditions not met.`);
            socket.emit('skipToEndError', 'Konnte das Spiel nicht überspringen.');
        }
    });

    socket.on('playAgain', (lobbyId) => {
        const lobby = lobbies[lobbyId];
        if (lobby && lobby.players.find(p => p.id === socket.id && p.isHost) && (lobby.gameState === 'finished' || lobby.gameState === 'waiting')) {
            lobby.players.forEach(p => {
                p.score = 0;
                p.streak = 0;
                p.hasAnswered = false;
            });
            lobby.currentQuestionIndex = -1;
            lobby.questions = [];
            lobby.gameState = 'waiting';
            lobby.isPaused = false;
            lobby.remainingTimeOnPause = null;
            lobby.playerAnswers = {};

            if (lobby.questionTimerInterval) clearInterval(lobby.questionTimerInterval);
            if (lobby.questionTimeout) clearTimeout(lobby.questionTimeout);
            lobby.questionTimerInterval = null;
            lobby.questionTimeout = null;

            io.to(lobbyId).emit('lobbyResetForPlayAgain', {
                lobbyId: lobby.id,
                players: lobby.players,
                gameState: lobby.gameState,
                availableCategories: availableCategories,
                selectedCategory: lobby.selectedCategory
            });
            console.log(`Lobby ${lobbyId} reset for a new game by host ${socket.id}.`);
        } else {
            socket.emit('lobbyError', 'Nur der Host kann das Spiel neu starten oder die Bedingungen sind nicht erfüllt.');
        }
    });

    socket.on('error', (error) => {
        console.error('Socket error:', error);
    });

    // FIX 2: Corrected disconnect logic. Removed the faulty 'handlePlayerDisconnect' call.
    // This is the single, correct handler for 'disconnect'.
    socket.on('disconnect', (reason) => {
        console.log(`Client disconnected: ${socket.id}. Reason: ${reason}`);
        for (const lobbyId in lobbies) {
            const lobby = lobbies[lobbyId];
            const playerIndex = lobby.players.findIndex(p => p.id === socket.id);

            if (playerIndex !== -1) {
                const disconnectedPlayer = lobby.players.splice(playerIndex, 1)[0];
                console.log(`Player ${disconnectedPlayer.name} (${disconnectedPlayer.id}) removed from lobby ${lobbyId}`);

                if (lobby.players.length === 0) {
                    console.log(`Lobby ${lobbyId} is empty, deleting.`);
                    clearTimeout(lobby.questionTimeout);
                    clearInterval(lobby.questionTimerInterval);
                    delete lobbies[lobbyId];
                } else {
                    let hostChanged = false;
                    if (disconnectedPlayer.isHost) {
                        lobby.players[0].isHost = true; // Assign host to the next player
                        hostChanged = true;
                        console.log(`Host changed in lobby ${lobbyId} to ${lobby.players[0].name} (${lobby.players[0].id})`);
                    }

                    // Notify remaining players about the disconnection and potential host change
                    io.to(lobbyId).emit('playerLeft', {
                        players: lobby.players,
                        disconnectedPlayerName: disconnectedPlayer.name,
                        disconnectedPlayerId: disconnectedPlayer.id,
                        selectedCategory: lobby.selectedCategory
                    });

                    if (hostChanged) {
                        io.to(lobbyId).emit('hostChanged', {
                            newHostId: lobby.players[0].id,
                            players: lobby.players,
                            availableCategories: availableCategories,
                            selectedCategory: lobby.selectedCategory
                        });
                    }

                    // If game is active, not paused, and all *remaining* players have answered, process question end
                    if (lobby.gameState === 'active' && !lobby.isPaused && lobby.players.every(p => p.hasAnswered)) {
                        console.log(`All remaining players in lobby ${lobbyId} have answered after a disconnect. Processing question end.`);
                        clearTimeout(lobby.questionTimeout);
                        clearInterval(lobby.questionTimerInterval);
                        processQuestionEnd(lobbyId);
                    }
                }
                break; // Player found and handled, exit loop
            }
        }
    });
});

// --- Helper Functions for Game Logic ---
function startQuestionTimer(lobby, duration) {
    if (!lobby) {
        console.error("startQuestionTimer called with null lobby");
        return;
    }
    console.log(`[TIMER] Starting question timer for lobby ${lobby.id} with duration ${duration}s`);
    if (lobby.questionTimerInterval) clearInterval(lobby.questionTimerInterval);
    if (lobby.questionTimeout) clearTimeout(lobby.questionTimeout);

    let timeLeft = Math.ceil(duration);
    io.to(lobby.id).emit('timerUpdate', timeLeft);

    lobby.questionTimerInterval = setInterval(() => {
        if (lobby.isPaused) return;
        timeLeft--;
        io.to(lobby.id).emit('timerUpdate', timeLeft);
        if (timeLeft <= 0) {
            clearInterval(lobby.questionTimerInterval);
        }
    }, 1000);

    lobby.questionTimeout = setTimeout(() => {
        if (lobby.isPaused) return;
        console.log(`Time up for question ${lobby.currentQuestionIndex} in lobby ${lobby.id}`);
        if(lobby.questionTimerInterval) clearInterval(lobby.questionTimerInterval);
        processQuestionEnd(lobby.id);
    }, Math.ceil(duration) * 1000 + 100); // Small buffer
}

function sendNextQuestion(lobbyId) {
    const lobby = lobbies[lobbyId];
    if (!lobby || lobby.gameState !== 'active' || lobby.isPaused) {
        console.log(`[GAMEFLOW] sendNextQuestion for ${lobbyId} aborted. GameState: ${lobby ? lobby.gameState : 'N/A'}, Paused: ${lobby ? lobby.isPaused : 'N/A'}`);
        return;
    }

    lobby.players.forEach(p => p.hasAnswered = false);
    lobby.currentQuestionIndex++;

    if (!lobby.questions || lobby.currentQuestionIndex >= lobby.questions.length) {
        endGame(lobbyId);
        return;
    }

    const question = lobby.questions[lobby.currentQuestionIndex];
    if (!question) {
        console.error(`Error: Question at index ${lobby.currentQuestionIndex} for category ${lobby.selectedCategory} is undefined.`);
        endGame(lobbyId);
        return;
    }

    const questionData = {
        question: question.question,
        options: question.options,
        questionIndex: lobby.currentQuestionIndex,
        totalQuestions: lobby.questions.length,
        timeLimit: QUESTION_TIME_LIMIT,
        category: lobby.selectedCategory
    };

    lobby.questionStartTime = Date.now();
    lobby.remainingTimeOnPause = null;
    io.to(lobbyId).emit('newQuestion', questionData);
    io.to(lobbyId).emit('updateScores', lobby.players.map(p => ({id: p.id, name: p.name, score: p.score, streak: p.streak })));

    startQuestionTimer(lobby, QUESTION_TIME_LIMIT);
    console.log(`[GAMEFLOW] Sent new question ${lobby.currentQuestionIndex + 1} for lobby ${lobbyId}`);
}

function processQuestionEnd(lobbyId) {
    const lobby = lobbies[lobbyId];
    if (!lobby || lobby.gameState !== 'active' || lobby.isPaused) {
        console.log(`[GAMEFLOW] processQuestionEnd for ${lobbyId} aborted. GameState: ${lobby ? lobby.gameState : 'N/A'}, Paused: ${lobby ? lobby.isPaused : 'N/A'}`);
        return;
    }

    if (lobby.questionTimerInterval) clearInterval(lobby.questionTimerInterval);
    if (lobby.questionTimeout) clearTimeout(lobby.questionTimeout);
    lobby.questionTimerInterval = null;
    lobby.questionTimeout = null;

    const currentQuestion = lobby.questions[lobby.currentQuestionIndex];
    if(!currentQuestion){
        console.error("processQuestionEnd: currentQuestion is undefined. Lobby:", lobbyId, "Index:", lobby.currentQuestionIndex);
        sendNextQuestion(lobbyId); // Attempt to recover or end game
        return;
    }
    io.to(lobbyId).emit('questionOver', {
        correctAnswer: currentQuestion.answer,
        scores: lobby.players.map(p => ({ id: p.id, name: p.name, score: p.score, streak: p.streak }))
    });
    console.log(`[GAMEFLOW] Question ${lobby.currentQuestionIndex + 1} over for lobby ${lobbyId}.`);

    setTimeout(() => {
        if (lobbies[lobbyId] && lobbies[lobbyId].gameState === 'active' && !lobbies[lobbyId].isPaused) {
            sendNextQuestion(lobbyId);
        }
    }, CORRECT_ANSWER_DISPLAY_DURATION);
}

function endGame(lobbyId) {
    const lobby = lobbies[lobbyId];
    if (!lobby) {
        console.warn(`[GAMEFLOW] endGame called for non-existent lobby: ${lobbyId}`);
        return;
    }

    if (lobby.questionTimerInterval) clearInterval(lobby.questionTimerInterval);
    if (lobby.questionTimeout) clearTimeout(lobby.questionTimeout);
    lobby.questionTimerInterval = null;
    lobby.questionTimeout = null;

    lobby.gameState = 'finished';
    lobby.isPaused = false;
    const finalScores = lobby.players
        .map(p => ({ name: p.name, score: p.score, originalId: p.id }))
        .sort((a, b) => b.score - a.score);

    io.to(lobbyId).emit('gameOver', { finalScores });
    console.log(`Game ended in lobby ${lobbyId}.`);
}

// --- Server Initialization ---
server.listen(PORT, () => {
    loadQuestions();
    console.log(`Quiz server running on http://localhost:${PORT}`);
    console.log(`To play, open public/index.html in your browser or navigate to the root URL of this app.`);
    console.log(`If using Docker, it will be mapped to the host port specified in docker-compose.yml (e.g., http://localhost:4000)`);
});

// --- Process Handling ---
process.on('uncaughtException', (error) => {
    console.error('Uncaught Exception:', error);
    // Perform cleanup if necessary, then exit
    // For a real app, you might want more sophisticated error reporting (e.g., Sentry)
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
