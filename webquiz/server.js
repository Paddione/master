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
        const questionsPath = path.join(__dirname, 'questions.json'); // Assuming questions.json is in the same directory as server.js
        if (!fs.existsSync(questionsPath)) {
            console.error(`questions.json not found at ${questionsPath}. Using fallback.`);
            throw new Error('questions.json not found');
        }
        const data = fs.readFileSync(questionsPath, 'utf8');
        allQuestionSets = JSON.parse(data);
        availableCategories = Object.keys(allQuestionSets);
        if (availableCategories.length === 0) {
            console.error("No question categories found in questions.json or it's empty. Using fallback.");
            throw new Error('No categories'); // Force fallback
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

// Security middleware
app.use(helmet());
app.use(cors({
    origin: process.env.ALLOWED_ORIGINS || '*',
    methods: ['GET', 'POST']
}));

// Rate limiting
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100 // limit each IP to 100 requests per windowMs
});
app.use(limiter);

// Serve static files from the "public" directory
app.use(express.static(path.join(__dirname, 'public')));

// Add caching headers for static files
app.use(express.static(path.join(__dirname, 'public'), {
    maxAge: '1d',
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
            playerAnswers: {}, // Stores answers for the current question: { questionIndex: { playerId: { answer, isCorrect, pointsEarned, timeTaken } } }
        };
        socket.join(lobbyId);
        socket.emit('lobbyCreated', {
            lobbyId,
            players: lobbies[lobbyId].players,
            playerId: socket.id,
            availableCategories: availableCategories // Send all available categories from server
        });
        console.log(`Lobby ${lobbyId} created by ${playerName} (${socket.id})`);
    });

    socket.on('joinLobby', ({ lobbyId, playerName }) => {
        const lobby = lobbies[lobbyId];
        if (lobby) {
            if (lobby.gameState !== 'waiting' && lobby.gameState !== 'active') { // Allow joining active games
                socket.emit('lobbyError', 'Das Spiel in dieser Lobby ist bereits beendet.');
                return;
            }
            if (lobby.players.length >= MAX_PLAYERS && !lobby.players.find(p => p.id === socket.id)) {
                socket.emit('lobbyError', `Diese Lobby ist voll (max. ${MAX_PLAYERS} Spieler).`);
                return;
            }

            // If player is rejoining, update their socket ID but keep their score/state if game is active
            const existingPlayerIndex = lobby.players.findIndex(p => p.id === socket.id); // This might be problematic if socket ID changes on reconnect
            // A more robust rejoin would use a persistent player ID or token. For now, new socket = new player or updated existing.

            const newPlayer = { id: socket.id, name: playerName || `Spieler ${socket.id.substring(0,4)}`, score: 0, streak: 0, isHost: false, hasAnswered: false };
            if (lobby.gameState === 'active' && existingPlayerIndex !== -1) {
                // Player rejoining an active game, try to preserve score (simple example)
                // This needs more robust handling for true "rejoin" logic
                console.log(`Player ${lobby.players[existingPlayerIndex].name} is rejoining/already in lobby ${lobbyId}. Updating socket id.`);
                // For simplicity, we'll just add them as a new player if their old socket ID is different.
                // True rejoin logic is complex.
            } else {
                lobby.players.push(newPlayer);
            }

            socket.join(lobbyId);

            socket.emit('joinedLobby', {
                lobbyId,
                players: lobby.players,
                playerId: socket.id,
                gameState: lobby.gameState,
                selectedCategory: lobby.selectedCategory,
                allCategoriesForLobby: availableCategories, // Send all available categories
                isPaused: lobby.isPaused,
                remainingTime: lobby.isPaused ? lobby.remainingTimeOnPause : undefined
            });
            // Notify other players in the lobby
            socket.to(lobbyId).emit('playerJoined', {
                players: lobby.players,
                joinedPlayerId: socket.id,
                joinedPlayerName: newPlayer.name,
                allCategoriesForLobby: availableCategories, // Ensure others also get updated category list
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
                lobby.selectedCategory = categoryKey || null; // Allow unselecting
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
            if (lobby.players.length < 1) {
                socket.emit('startGameError', 'Nicht genügend Spieler, um das Spiel zu starten.');
                return;
            }
            // Ensure the category passed from client matches the one stored, or set it if not set
            if (!lobby.selectedCategory || lobby.selectedCategory !== categoryKey) {
                if (allQuestionSets[categoryKey]) {
                    lobby.selectedCategory = categoryKey;
                    io.to(lobbyId).emit('categoryUpdatedByHost', lobby.selectedCategory); // Inform clients
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
                lobby.selectedCategory = null; // Reset category
                io.to(lobbyId).emit('categoryUpdatedByHost', null);
                return;
            }

            lobby.gameState = 'active';
            lobby.isPaused = false;
            lobby.remainingTimeOnPause = null;
            lobby.currentQuestionIndex = -1; // Will be incremented by sendNextQuestion
            lobby.playerAnswers = {};
            // Reset player scores and streaks for a new game
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
            // Emit an error or a neutral result to the player
            socket.emit('answerResult', {
                isCorrect: false,
                correctAnswer: "Fehler: Frage nicht gefunden",
                score: player.score,
                streak: player.streak,
                pointsEarned: 0
            });
            return; // Avoid further processing
        }

        const isCorrect = currentQuestion.answer === answer;
        let pointsEarned = 0;

        if (isCorrect) {
            player.streak++;
            const timeRemaining = Math.max(0, QUESTION_TIME_LIMIT - timeTaken);
            // Points: Base 100 for correct, + up to 50 for speed (scaled), + streak bonus (e.g., streak * 10)
            const basePoints = 100;
            const timeBonus = Math.floor((timeRemaining / QUESTION_TIME_LIMIT) * 50);
            const streakBonus = player.streak * 10;
            pointsEarned = basePoints + timeBonus + streakBonus;
        } else {
            player.streak = 0;
            pointsEarned = 0; // Or negative points: Math.max(-50, -10 * (lobby.players.find(p=>p.id === socket.id)?.streak || 1));
        }
        player.score += pointsEarned;
        player.score = Math.max(0, player.score); // Ensure score doesn't go below 0

        if (!lobby.playerAnswers[questionIndex]) {
            lobby.playerAnswers[questionIndex] = {};
        }
        lobby.playerAnswers[questionIndex][socket.id] = { answer, isCorrect, pointsEarned, timeTaken };

        socket.emit('answerResult', {
            isCorrect,
            correctAnswer: currentQuestion.answer, // Send correct answer for immediate feedback if desired
            score: player.score,
            streak: player.streak,
            pointsEarned
        });

        // Check if all players have answered
        const allAnswered = lobby.players.every(p => p.hasAnswered);
        if (allAnswered && !lobby.isPaused) { // If all answered and game not paused
            clearTimeout(lobby.questionTimeout); // Stop the timer
            clearInterval(lobby.questionTimerInterval);
            processQuestionEnd(lobbyId); // Move to show results
        }
    });

    socket.on('hostTogglePause', ({ lobbyId }) => {
        const lobby = lobbies[lobbyId];
        if (lobby && lobby.players.find(p => p.id === socket.id && p.isHost) && lobby.gameState === 'active') {
            if (lobby.isPaused) { // Resuming game
                lobby.isPaused = false;
                io.to(lobbyId).emit('gameResumed');
                console.log(`Lobby ${lobbyId} resumed by host.`);
                if (lobby.remainingTimeOnPause !== null) {
                    // Recalculate questionStartTime based on when it was paused
                    const timePassedBeforePause = QUESTION_TIME_LIMIT - lobby.remainingTimeOnPause;
                    lobby.questionStartTime = Date.now() - (timePassedBeforePause * 1000);
                    startQuestionTimer(lobby, lobby.remainingTimeOnPause); // Resume timer with remaining time
                    lobby.remainingTimeOnPause = null; // Clear remaining time on pause
                } else {
                    // Fallback if remainingTimeOnPause was not set (should not happen ideally)
                    console.warn(`Lobby ${lobbyId} resumed, but remainingTimeOnPause was null. Starting timer with full duration.`);
                    lobby.questionStartTime = Date.now();
                    startQuestionTimer(lobby, QUESTION_TIME_LIMIT);
                }
            } else { // Pausing game
                lobby.isPaused = true;
                if (lobby.questionTimerInterval) clearInterval(lobby.questionTimerInterval);
                if (lobby.questionTimeout) clearTimeout(lobby.questionTimeout);

                // Calculate and store remaining time
                const elapsedTime = (Date.now() - lobby.questionStartTime) / 1000;
                lobby.remainingTimeOnPause = Math.max(0, QUESTION_TIME_LIMIT - elapsedTime);

                io.to(lobbyId).emit('gamePaused', { remainingTime: lobby.remainingTimeOnPause });
                console.log(`Lobby ${lobbyId} paused by host. Time left: ${lobby.remainingTimeOnPause}`);
            }
        } else {
            console.warn(`Host toggle pause denied for lobby ${lobbyId} by socket ${socket.id}. Conditions not met (Not host, game not active, or lobby not found).`);
            // Optionally emit an error back to the host
            // socket.emit('pauseError', 'Could not toggle pause state.');
        }
    });

    // ADDED: Listener for host skipping to end
    socket.on('hostSkipToEnd', ({ lobbyId }) => {
        const lobby = lobbies[lobbyId];
        if (lobby && lobby.players.find(p => p.id === socket.id && p.isHost) && lobby.gameState === 'active' && !lobby.isPaused) {
            console.log(`Host ${socket.id} is skipping to end for lobby ${lobbyId}.`);
            endGame(lobbyId); // Call the existing endGame function
        } else {
            console.warn(`Host skip to end denied for lobby ${lobbyId} by socket ${socket.id}. Conditions not met.`);
            socket.emit('skipToEndError', 'Konnte das Spiel nicht überspringen.');
        }
    });


    socket.on('disconnect', () => {
        console.log(`Client disconnected: ${socket.id}`);
        for (const lobbyId in lobbies) {
            const lobby = lobbies[lobbyId];
            const playerIndex = lobby.players.findIndex(p => p.id === socket.id);
            if (playerIndex !== -1) {
                const disconnectedPlayer = lobby.players.splice(playerIndex, 1)[0];
                console.log(`Player ${disconnectedPlayer.name} removed from lobby ${lobbyId}`);

                if (lobby.players.length === 0) {
                    console.log(`Lobby ${lobbyId} is empty, deleting.`);
                    clearTimeout(lobby.questionTimeout);
                    clearInterval(lobby.questionTimerInterval);
                    delete lobbies[lobbyId];
                } else {
                    let hostChanged = false;
                    if (disconnectedPlayer.isHost && lobby.players.length > 0) {
                        lobby.players[0].isHost = true; // Assign host to the next player in list
                        hostChanged = true;
                    }
                    io.to(lobbyId).emit('playerLeft', {
                        players: lobby.players,
                        disconnectedPlayerName: disconnectedPlayer.name,
                        disconnectedPlayerId: disconnectedPlayer.id,
                        selectedCategory: lobby.selectedCategory // Send current category
                    });
                    if (hostChanged) {
                        io.to(lobbyId).emit('hostChanged', {
                            newHostId: lobby.players[0].id,
                            players: lobby.players,
                            availableCategories: availableCategories, // Send all categories
                            selectedCategory: lobby.selectedCategory
                        });
                    }

                    // If game is active, not paused, and all remaining players have answered, process question end
                    if (lobby.gameState === 'active' && !lobby.isPaused && lobby.players.length > 0 && lobby.players.every(p => p.hasAnswered)) {
                        clearTimeout(lobby.questionTimeout);
                        clearInterval(lobby.questionTimerInterval);
                        processQuestionEnd(lobbyId);
                    } else if (lobby.gameState === 'active' && lobby.players.length === 0) {
                        // If all players disconnected during an active game
                        console.log(`Game in lobby ${lobbyId} ended due to all players disconnecting.`);
                        clearTimeout(lobby.questionTimeout);
                        clearInterval(lobby.questionTimerInterval);
                        delete lobbies[lobbyId]; // Or mark as finished and then delete
                    }
                }
                break; // Exit loop once player is found and handled
            }
        }
    });

    function startQuestionTimer(lobby, duration) {
        if (!lobby) {
            console.error("startQuestionTimer called with null lobby");
            return;
        }
        console.log(`[TIMER] Starting question timer for lobby ${lobby.id} with duration ${duration}s`);
        // Clear any existing timers for this lobby
        if (lobby.questionTimerInterval) clearInterval(lobby.questionTimerInterval);
        if (lobby.questionTimeout) clearTimeout(lobby.questionTimeout);

        let timeLeft = Math.ceil(duration); // Ensure we start with the full integer value
        io.to(lobby.id).emit('timerUpdate', timeLeft); // Initial timer value

        lobby.questionTimerInterval = setInterval(() => {
            if (lobby.isPaused) {
                // console.log(`[TIMER] Interval skipped for lobby ${lobby.id} (paused).`);
                return; // Don't decrement or emit if paused
            }
            timeLeft--;
            io.to(lobby.id).emit('timerUpdate', timeLeft);
            // console.log(`[TIMER] Update for lobby ${lobby.id}: ${timeLeft}s left`);
            if (timeLeft <= 0) {
                // console.log(`[TIMER] Interval clearing for lobby ${lobby.id} (timeLeft: ${timeLeft})`);
                clearInterval(lobby.questionTimerInterval); // Stop interval when time is up
            }
        }, 1000);

        lobby.questionTimeout = setTimeout(() => {
            if (lobby.isPaused) {
                // console.log(`[TIMER] Timeout function execution skipped for lobby ${lobby.id} (paused).`);
                return; // Don't process end if paused
            }
            console.log(`Time up for question ${lobby.currentQuestionIndex} in lobby ${lobby.id}`);
            if(lobby.questionTimerInterval) clearInterval(lobby.questionTimerInterval); // Ensure interval is cleared
            processQuestionEnd(lobby.id);
        }, Math.ceil(duration) * 1000 + 100); // Add a small buffer to ensure interval runs to 0
    }


    function sendNextQuestion(lobbyId) {
        const lobby = lobbies[lobbyId];
        if (!lobby || lobby.gameState !== 'active' || lobby.isPaused) {
            console.log(`[GAMEFLOW] sendNextQuestion for ${lobbyId} aborted. GameState: ${lobby ? lobby.gameState : 'N/A'}, Paused: ${lobby ? lobby.isPaused : 'N/A'}`);
            return;
        }

        // Reset hasAnswered for all players
        lobby.players.forEach(p => p.hasAnswered = false);
        lobby.currentQuestionIndex++;

        if (!lobby.questions || lobby.currentQuestionIndex >= lobby.questions.length) {
            endGame(lobbyId); // No more questions
            return;
        }

        const question = lobby.questions[lobby.currentQuestionIndex];
        if (!question) {
            console.error(`Error: Question at index ${lobby.currentQuestionIndex} for category ${lobby.selectedCategory} is undefined.`);
            endGame(lobbyId); // End game if question is missing
            return;
        }

        const questionData = {
            question: question.question,
            options: question.options, // Options should already be shuffled if done at source
            questionIndex: lobby.currentQuestionIndex,
            totalQuestions: lobby.questions.length,
            timeLimit: QUESTION_TIME_LIMIT,
            category: lobby.selectedCategory
        };

        lobby.questionStartTime = Date.now();
        lobby.remainingTimeOnPause = null; // Reset pause state for new question
        io.to(lobbyId).emit('newQuestion', questionData);
        // Send updated scores (e.g., if scores were reset for a new game but players remained)
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

        // Clear timers immediately
        if (lobby.questionTimerInterval) clearInterval(lobby.questionTimerInterval);
        if (lobby.questionTimeout) clearTimeout(lobby.questionTimeout);
        lobby.questionTimerInterval = null; // Nullify to prevent reuse
        lobby.questionTimeout = null;

        const currentQuestion = lobby.questions[lobby.currentQuestionIndex];
        if(!currentQuestion){
            console.error("processQuestionEnd: currentQuestion is undefined. Lobby:", lobbyId, "Index:", lobby.currentQuestionIndex);
            // Attempt to send next question or end game to prevent stall
            sendNextQuestion(lobbyId);
            return;
        }
        io.to(lobbyId).emit('questionOver', {
            correctAnswer: currentQuestion.answer,
            scores: lobby.players.map(p => ({ id: p.id, name: p.name, score: p.score, streak: p.streak }))
        });
        console.log(`[GAMEFLOW] Question ${lobby.currentQuestionIndex + 1} over for lobby ${lobbyId}. Displaying answer.`);

        // Wait for display duration then send next question
        setTimeout(() => {
            if (lobbies[lobbyId] && lobbies[lobbyId].gameState === 'active' && !lobbies[lobbyId].isPaused) { // Check lobby still exists and is active
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

        // Clear any running timers
        if (lobby.questionTimerInterval) clearInterval(lobby.questionTimerInterval);
        if (lobby.questionTimeout) clearTimeout(lobby.questionTimeout);
        lobby.questionTimerInterval = null;
        lobby.questionTimeout = null;


        lobby.gameState = 'finished';
        lobby.isPaused = false; // Ensure not stuck in paused state
        const finalScores = lobby.players
            .map(p => ({ name: p.name, score: p.score, originalId: p.id })) // Include originalId if needed by client
            .sort((a, b) => b.score - a.score);

        io.to(lobbyId).emit('gameOver', { finalScores });
        console.log(`Game ended in lobby ${lobbyId}. Final scores:`, finalScores.map(s => ({name: s.name, score: s.score})));
        // Note: Lobby is not deleted here, allowing for "Play Again" or viewing scores.
        // It will be deleted if all players disconnect or a new game isn't started after a while (manual cleanup needed for that).
    }


    socket.on('playAgain', (lobbyId) => {
        const lobby = lobbies[lobbyId];
        // Only host can restart, and only if game is finished or waiting
        if (lobby && lobby.players.find(p => p.id === socket.id && p.isHost) && (lobby.gameState === 'finished' || lobby.gameState === 'waiting')) {
            // Reset lobby state for a new game
            lobby.players.forEach(p => {
                p.score = 0;
                p.streak = 0;
                p.hasAnswered = false;
            });
            lobby.currentQuestionIndex = -1;
            // lobby.selectedCategory = null; // Keep category or allow host to re-select
            lobby.questions = []; // Clear old questions
            lobby.gameState = 'waiting'; // Back to waiting for host to start
            lobby.isPaused = false;
            lobby.remainingTimeOnPause = null;
            lobby.playerAnswers = {};

            // Clear any residual timers
            if (lobby.questionTimerInterval) clearInterval(lobby.questionTimerInterval);
            if (lobby.questionTimeout) clearTimeout(lobby.questionTimeout);
            lobby.questionTimerInterval = null;
            lobby.questionTimeout = null;

            io.to(lobbyId).emit('lobbyResetForPlayAgain', {
                lobbyId: lobby.id,
                players: lobby.players,
                gameState: lobby.gameState,
                availableCategories: availableCategories, // Send all categories again
                selectedCategory: lobby.selectedCategory // Send current or null category
            });
            console.log(`Lobby ${lobbyId} reset for a new game by host ${socket.id}. Host needs to (re)select category and start.`);
        } else {
            socket.emit('lobbyError', 'Nur der Host kann das Spiel neu starten oder die Bedingungen sind nicht erfüllt.');
        }
    });

    socket.on('error', (error) => {
        console.error('Socket error:', error);
    });
    
    socket.on('disconnect', (reason) => {
        // Handle disconnection
        handlePlayerDisconnect(socket);
    });
});


// Server listening
server.listen(PORT, () => {
    loadQuestions(); // Load questions once on server startup
    console.log(`Quiz server running on http://localhost:${PORT}`);
    console.log(`To play, open public/index.html in your browser or navigate to the root URL of this app.`);
    console.log(`If using Docker, it will be mapped to the host port specified in docker-compose.yml (e.g., http://localhost:4000)`);
});

process.on('uncaughtException', (error) => {
    console.error('Uncaught Exception:', error);
    // Perform cleanup
    process.exit(1);
});

process.on('SIGTERM', () => {
    console.log('SIGTERM received. Performing cleanup...');
    // Cleanup code here
    process.exit(0);
});
