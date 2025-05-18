// public/script.js
// This is the version from the artifact "multiplayer_quiz_js_tts_feature"
// with the title "script.js (Robust Answer Reveal & TTS Timing)"
// It uses the consolidated `speak()` function.
// ADDED: Skip to End functionality

document.addEventListener('DOMContentLoaded', () => {
    const socket = io();

    // --- DOM Elements ---
    // ... (all your existing DOM element consts)
    const lobbyConnectContainer = document.getElementById('lobby-connect-container');
    const playerNameInput = document.getElementById('player-name');
    const createLobbyBtn = document.getElementById('create-lobby-btn');
    const lobbyIdInput = document.getElementById('lobby-id-input');
    const joinLobbyBtn = document.getElementById('join-lobby-btn');
    const connectErrorMsg = document.getElementById('connect-error-msg');

    const lobbyWaitingRoom = document.getElementById('lobby-waiting-room');
    const displayLobbyId = document.getElementById('display-lobby-id');
    const copyLobbyIdBtn = document.getElementById('copy-lobby-id-btn');
    const playerListLobby = document.getElementById('player-list-lobby');
    const categorySelectionContainer = document.getElementById('category-selection-container');
    const categorySelect = document.getElementById('category-select');
    const chosenCategoryDisplay = document.getElementById('chosen-category-display');
    const currentCategoryText = document.getElementById('current-category-text');
    const lobbyMessage = document.getElementById('lobby-message');
    const startGameLobbyBtn = document.getElementById('start-game-lobby-btn');
    const startGameErrorMsg = document.getElementById('start-game-error-msg');

    const quizContainer = document.getElementById('quiz-container');
    const playerInfoQuiz = document.getElementById('player-info-quiz');
    const questionCounter = document.getElementById('question-counter');
    const gameCategoryDisplay = document.getElementById('game-category-display');
    const timerDisplay = document.getElementById('timer');
    const questionText = document.getElementById('question-text');
    const optionsContainer = document.getElementById('options-container');
    const feedbackText = document.getElementById('feedback-text');
    const liveScoresList = document.getElementById('live-scores-list');
    const waitingForOthersMsg = document.getElementById('waiting-for-others-msg');

    const gameOverContainer = document.getElementById('game-over-container');
    const finalScoresDiv = document.getElementById('final-scores');
    const playAgainHostBtn = document.getElementById('play-again-host-btn');
    const waitingForHostPlayAgainBtn = document.getElementById('waiting-for-host-play-again-btn');
    const leaveLobbyBtn = document.getElementById('leave-lobby-btn');
    const submitScoreHallOfFameBtn = document.getElementById('submit-score-hall-of-fame-btn'); // For Hall of Fame
    const submitScoreStatusMsg = document.getElementById('submit-score-status-msg'); // For Hall of Fame status

    const globalNotification = document.getElementById('global-notification');
    const muteBtn = document.getElementById('mute-btn');

    const hostTogglePauseBtn = document.getElementById('host-toggle-pause-btn');
    const hostSkipToEndBtn = document.getElementById('host-skip-to-end-btn'); // ADDED: Skip to End button
    const gamePausedOverlay = document.getElementById('game-paused-overlay');
    const pauseResumeMessage = document.getElementById('pause-resume-message');


    // --- Game State Variables ---
    // ... (all your existing game state variables)
    let currentLobbyId = null;
    let currentPlayerId = null;
    let currentQuestionDataCache = null; // To store current question set for HoF
    let currentQuestionIndex = -1;
    let isHost = false;
    let questionTimeLimit = 60;
    let currentSelectedCategoryKey = null;
    let allAvailableCategoriesCache = [];
    let isMuted = false;
    let isGamePaused = false;
    let wasTimedOut = false;


    // --- Speech Synthesis ---
    // ... (your existing speech synthesis code)
    console.log('[DEBUG] Initializing Speech Synthesis...');
    const synth = window.speechSynthesis;
    let voices = [];
    let currentSpeechUtterance = null; // To manage the current utterance being spoken

    function populateVoices() {
        voices = synth.getVoices();
        console.log('[DEBUG] TTS Voices loaded/changed:', voices.length);
    }
    if (synth.onvoiceschanged !== undefined) {
        synth.onvoiceschanged = populateVoices;
    }
    populateVoices();
    console.log('[DEBUG] Speech Synthesis initialized. Synth object:', synth);


    // --- Sound Effects ---
    // ... (your existing sound effects code)
    const soundEffectsVolume = 0.3;
    const menuMusicVolume = 0.5;

    const sounds = {
        click: new Audio('/sounds/click.mp3'),
        correctAnswer: new Audio('/sounds/correctanswer.mp3'),
        incorrectAnswer: new Audio('/sounds/incorrectanswer.mp3'),
        menuMusic: new Audio('/sounds/menumusic.mp3'),
        streak: new Audio('/sounds/streak.mp3'),
        timesUp: new Audio('/sounds/timesup.mp3'),
        playerJoined: new Audio('/sounds/lobby_player_join.mp3'),
        gameStart: new Audio('/sounds/game_start_quiz.mp3')
    };

    sounds.menuMusic.loop = true;
    sounds.menuMusic.volume = menuMusicVolume;


    function updateMuteButtonAppearance() {
        // ... (your existing updateMuteButtonAppearance function)
        if (muteBtn) {
            muteBtn.textContent = isMuted ? 'Unmute' : 'Mute';
            if (isMuted) {
                muteBtn.classList.remove('bg-sky-600', 'hover:bg-sky-700');
                muteBtn.classList.add('bg-red-600', 'hover:bg-red-700');
            } else {
                muteBtn.classList.remove('bg-red-600', 'hover:bg-red-700');
                muteBtn.classList.add('bg-sky-600', 'hover:bg-sky-700');
            }
        }
    }

    // Consolidated speak function
    // ... (your existing speak function)
    function speak(text, lang = 'de-DE', onEndCallback = null, isQuestion = false) {
        if (isMuted || !synth || !text) {
            console.log(`[DEBUG] TTS (${isQuestion ? 'Question' : 'Text'}): Muted, synth not available, or no text. Skipping speech.`);
            if (onEndCallback) onEndCallback();
            return;
        }

        if (synth.speaking) {
            console.log(`[DEBUG] TTS (${isQuestion ? 'Question' : 'Text'}): Cancelling previous speech.`);
            synth.cancel();
        }

        setTimeout(() => {
            currentSpeechUtterance = new SpeechSynthesisUtterance(text);
            currentSpeechUtterance.lang = lang;

            const targetVoice = voices.find(voice => voice.lang === lang && voice.name.toLowerCase().includes('german'));
            if (targetVoice) {
                currentSpeechUtterance.voice = targetVoice;
            } else {
                const defaultLangVoice = voices.find(voice => voice.lang === lang);
                if (defaultLangVoice) currentSpeechUtterance.voice = defaultLangVoice;
            }

            currentSpeechUtterance.onend = () => {
                console.log(`[DEBUG] TTS (${isQuestion ? 'Question' : 'Text'}): Finished speaking - `, text);
                currentSpeechUtterance = null;
                if (onEndCallback) onEndCallback();
            };
            currentSpeechUtterance.onerror = (event) => {
                console.error(`[DEBUG] TTS (${isQuestion ? 'Question' : 'Text'}): Error - `, event);
                currentSpeechUtterance = null;
                if (onEndCallback) onEndCallback();
            };

            console.log(`[DEBUG] TTS (${isQuestion ? 'Question' : 'Text'}): Attempting to speak:`, text, 'with voice:', currentSpeechUtterance.voice ? currentSpeechUtterance.voice.name : 'default');
            synth.speak(currentSpeechUtterance);
        }, 100);
    }


    function toggleMute() {
        // ... (your existing toggleMute function)
        isMuted = !isMuted;
        updateMuteButtonAppearance();
        if (isMuted) {
            stopMenuMusic();
            if (synth && synth.speaking) {
                console.log('[DEBUG] TTS: Muting, cancelling speech.');
                synth.cancel();
            }
        } else {
            const currentScreenElement = [lobbyConnectContainer, lobbyWaitingRoom, gameOverContainer].find(
                s => s && !s.classList.contains('hidden')
            );
            if (currentScreenElement) {
                startMenuMusic();
            }
        }
        console.log('[DEBUG] Mute toggled. isMuted:', isMuted);
    }

    function playSound(soundName) {
        // ... (your existing playSound function)
        if (isMuted && soundName !== 'click') return;
        if (isMuted && soundName === 'click' && sounds[soundName]) {
            sounds[soundName].volume = soundEffectsVolume * 0.5;
            sounds[soundName].currentTime = 0;
            sounds[soundName].play().catch(error => console.log(`Error playing sound ${soundName}:`, error));
            return;
        }
        if (isMuted) return;

        const sound = sounds[soundName];
        if (sound) {
            sound.currentTime = 0;
            if (soundName !== 'menuMusic') {
                sound.volume = soundEffectsVolume;
            } else {
                sound.volume = menuMusicVolume;
            }
            sound.play().catch(error => console.log(`Error playing sound ${soundName}:`, error));
        } else {
            console.warn(`Sound not found: ${soundName}`);
        }
    }

    function startMenuMusic() {
        // ... (your existing startMenuMusic function)
        if (isMuted) return;
        sounds.menuMusic.volume = menuMusicVolume;
        if (sounds.menuMusic.paused) {
            sounds.menuMusic.play().catch(error => console.log("Error playing menu music:", error));
        }
    }

    function stopMenuMusic() {
        // ... (your existing stopMenuMusic function)
        sounds.menuMusic.pause();
        sounds.menuMusic.currentTime = 0;
    }

    function showScreen(screenElement) {
        console.log('[DEBUG] showScreen called for:', screenElement ? screenElement.id : 'undefined element');

        if (synth && synth.speaking && screenElement !== quizContainer) {
            console.log('[DEBUG] TTS: Screen changed, cancelling speech.');
            synth.cancel();
        }

        [lobbyConnectContainer, lobbyWaitingRoom, quizContainer, gameOverContainer].forEach(s => {
            if(s) s.classList.add('hidden');
        });
        if (screenElement) {
            screenElement.classList.remove('hidden');
        } else {
            console.error("[DEBUG] showScreen: screenElement is null or undefined!");
            return;
        }

        if (screenElement === lobbyConnectContainer || screenElement === lobbyWaitingRoom || screenElement === gameOverContainer) {
            startMenuMusic();
            // Hide host controls when not in quiz screen
            if (hostTogglePauseBtn) hostTogglePauseBtn.classList.add('hidden');
            if (hostSkipToEndBtn) hostSkipToEndBtn.classList.add('hidden'); // ADDED: Hide skip button
        } else {
            stopMenuMusic();
        }

        if (screenElement === quizContainer) {
            if (isHost) { // Show host-specific controls
                if (hostTogglePauseBtn) {
                    hostTogglePauseBtn.classList.remove('hidden');
                    hostTogglePauseBtn.disabled = isGamePaused; // Enable if game is not paused, disable if paused
                    hostTogglePauseBtn.textContent = isGamePaused ? 'Spiel fortsetzen' : 'Pause Spiel';
                }
                if (hostSkipToEndBtn) { // ADDED: Show skip button for host
                    hostSkipToEndBtn.classList.remove('hidden');
                    hostSkipToEndBtn.disabled = false; // Always enabled for host during active game
                }
            } else { // Hide host-specific controls for non-hosts
                if (hostTogglePauseBtn) hostTogglePauseBtn.classList.add('hidden');
                if (hostSkipToEndBtn) hostSkipToEndBtn.classList.add('hidden'); // ADDED: Hide skip button for non-hosts
            }
        } else { // If not quiz container, ensure host buttons are hidden
            if (hostTogglePauseBtn) hostTogglePauseBtn.classList.add('hidden');
            if (hostSkipToEndBtn) hostSkipToEndBtn.classList.add('hidden');
        }

        if (gamePausedOverlay && screenElement !== quizContainer) {
            gamePausedOverlay.classList.add('hidden');
        }
    }

    function displayError(element, message, duration = 3000) {
        // ... (your existing displayError function)
        if(element) {
            element.textContent = message;
            setTimeout(() => { element.textContent = ''; }, duration);
        } else {
            console.warn("[DEBUG] displayError: element is null for message:", message);
        }
    }

    function showGlobalNotification(message, type = 'error', duration = 3000) {
        // ... (your existing showGlobalNotification function)
        if(globalNotification) {
            globalNotification.textContent = message;
            globalNotification.className = 'fixed top-5 right-5 p-4 rounded-lg shadow-xl text-sm z-50 animate-pulse';
            if (type === 'error') globalNotification.classList.add('bg-red-500', 'text-white');
            else if (type === 'success') globalNotification.classList.add('bg-green-500', 'text-white');
            else globalNotification.classList.add('bg-sky-500', 'text-white');

            globalNotification.classList.remove('hidden');
            setTimeout(() => {
                globalNotification.classList.add('hidden');
            }, duration);
        }
    }

    function populateCategorySelector(categories, selectedCategoryKey = null) {
        // ... (your existing populateCategorySelector function)
        console.log('[DEBUG] populateCategorySelector - START. Categories received:', JSON.stringify(categories), 'Selected:', selectedCategoryKey);

        if (!categorySelect) {
            console.error("[DEBUG] populateCategorySelector: categorySelect element not found!");
            return;
        }

        allAvailableCategoriesCache = Array.isArray(categories) ? [...categories] : [];
        console.log('[DEBUG] populateCategorySelector - allAvailableCategoriesCache updated:', JSON.stringify(allAvailableCategoriesCache));

        categorySelect.innerHTML = '';

        if (allAvailableCategoriesCache.length === 0) {
            const option = document.createElement('option');
            option.value = "";
            option.textContent = "Keine Kategorien verfügbar";
            categorySelect.appendChild(option);
            categorySelect.disabled = true;
            console.warn('[DEBUG] populateCategorySelector - No categories available for dropdown (allAvailableCategoriesCache is empty).');
            if(chosenCategoryDisplay) chosenCategoryDisplay.classList.add('hidden');
            return;
        }

        const defaultOption = document.createElement('option');
        defaultOption.value = "";
        defaultOption.textContent = "-- Kategorie auswählen --";
        defaultOption.disabled = true;
        defaultOption.selected = !selectedCategoryKey;
        categorySelect.appendChild(defaultOption);
        console.log('[DEBUG] populateCategorySelector - Added default option.');

        allAvailableCategoriesCache.forEach(categoryKey => {
            const option = document.createElement('option');
            option.value = categoryKey;
            option.textContent = categoryKey;
            if (selectedCategoryKey && categoryKey === selectedCategoryKey) {
                option.selected = true;
            }
            categorySelect.appendChild(option);
        });
        console.log('[DEBUG] populateCategorySelector - Added all category options. Current HTML:', categorySelect.innerHTML);

        if (selectedCategoryKey && allAvailableCategoriesCache.includes(selectedCategoryKey)) {
            currentSelectedCategoryKey = selectedCategoryKey;
            categorySelect.value = selectedCategoryKey;
            if(currentCategoryText) currentCategoryText.textContent = selectedCategoryKey;
            if(chosenCategoryDisplay) chosenCategoryDisplay.classList.remove('hidden');
        } else {
            currentSelectedCategoryKey = null;
            categorySelect.value = "";
            if(currentCategoryText) currentCategoryText.textContent = "";
            if(chosenCategoryDisplay) chosenCategoryDisplay.classList.add('hidden');
        }

        console.log('[DEBUG] populateCategorySelector - END. currentSelectedCategoryKey:', currentSelectedCategoryKey, 'categorySelect.value:', categorySelect.value);
    }

    function handleCategoryChange() {
        // ... (your existing handleCategoryChange function)
        console.log('[DEBUG] handleCategoryChange - START. Current categorySelect.value:', categorySelect.value, 'isHost:', isHost);
        if (isHost) {
            currentSelectedCategoryKey = categorySelect.value || null;
            console.log('[DEBUG] handleCategoryChange - Host selected category:', currentSelectedCategoryKey);

            if (currentLobbyId) {
                socket.emit('hostSelectedCategory', { lobbyId: currentLobbyId, categoryKey: currentSelectedCategoryKey });
            } else {
                console.warn("[DEBUG] handleCategoryChange: currentLobbyId is null, cannot emit selection.");
            }

            const playerCount = playerListLobby ? playerListLobby.children.length : 0;
            if(startGameLobbyBtn) startGameLobbyBtn.disabled = !currentSelectedCategoryKey || playerCount < 1;
            console.log('[DEBUG] handleCategoryChange - Start Game Button Disabled:', startGameLobbyBtn ? startGameLobbyBtn.disabled : 'N/A');

            if (currentSelectedCategoryKey) {
                if(currentCategoryText) currentCategoryText.textContent = currentSelectedCategoryKey;
                if(chosenCategoryDisplay) chosenCategoryDisplay.classList.remove('hidden');
            } else {
                if(currentCategoryText) currentCategoryText.textContent = "";
                if(chosenCategoryDisplay) chosenCategoryDisplay.classList.add('hidden');
            }
        } else {
            console.log('[DEBUG] handleCategoryChange - Not host, no action taken for emission.');
        }
    }

    function updatePlayerList(players, initialLobbyCategories = [], currentCatFromServer = null) {
        // ... (your existing updatePlayerList function)
        // Minor adjustment to ensure host buttons are correctly shown/hidden when player list updates
        console.log('[DEBUG] updatePlayerList - START. Players:', players.length, 'InitialLobbyCategories:', JSON.stringify(initialLobbyCategories), 'CurrentCatFromServer:', currentCatFromServer, 'CurrentPlayerId:', currentPlayerId);

        if (!playerListLobby) {
            console.error("[DEBUG] updatePlayerList: playerListLobby element not found!");
            return;
        }
        playerListLobby.innerHTML = '';

        const me = players.find(p => p.id === currentPlayerId);
        if (me) {
            isHost = me.isHost;
            console.log('[DEBUG] updatePlayerList - Updated local isHost to:', isHost);
        } else {
            console.warn('[DEBUG] updatePlayerList - Current player not found in player list. Assuming not host.');
            isHost = false;
        }

        players.forEach(player => {
            const playerDiv = document.createElement('div');
            // Using Tailwind classes for styling player entries for consistency
            playerDiv.className = 'player-entry bg-slate-600/50 p-3 rounded-md shadow flex justify-between items-center text-slate-200';
            let nameDisplay = player.name;
            if (player.id === currentPlayerId) {
                nameDisplay += ' (Du)';
                if (player.isHost) {
                    playerDiv.classList.add('ring-2', 'ring-sky-500'); // Highlight current player if host
                }
            }
            playerDiv.innerHTML = `<span class="player-name font-medium">${nameDisplay}</span>${player.isHost ? '<span class="player-host-badge bg-sky-500 text-white text-xs font-semibold px-2 py-1 rounded-full">Host</span>' : ''}`;
            playerListLobby.appendChild(playerDiv);
        });
        console.log('[DEBUG] updatePlayerList - Player list populated.');

        const categoriesForDropdown = (Array.isArray(initialLobbyCategories) && initialLobbyCategories.length > 0)
            ? initialLobbyCategories
            : allAvailableCategoriesCache;

        console.log('[DEBUG] updatePlayerList - categoriesForDropdown determined as:', JSON.stringify(categoriesForDropdown));

        if (categorySelectionContainer) {
            if (categoriesForDropdown && categoriesForDropdown.length > 0) {
                categorySelectionContainer.classList.remove('hidden');
                console.log('[DEBUG] updatePlayerList - Category selection container UNHIDDEN.');
                populateCategorySelector(categoriesForDropdown, currentCatFromServer || currentSelectedCategoryKey);
            } else {
                categorySelectionContainer.classList.add('hidden');
                console.log('[DEBUG] updatePlayerList - No categories to display, category selection container HIDDEN.');
            }
        } else {
            console.error("[DEBUG] updatePlayerList: categorySelectionContainer element not found!");
        }

        if (categorySelect) {
            categorySelect.disabled = !isHost;
            console.log('[DEBUG] updatePlayerList - Category select disabled state set to:', categorySelect.disabled);
        } else {
            console.error("[DEBUG] updatePlayerList: categorySelect element not found for disabling!");
        }

        if (isHost) {
            if(lobbyMessage) lobbyMessage.textContent = "Du bist der Host. Wähle eine Kategorie und starte das Spiel.";
            if(startGameLobbyBtn) {
                startGameLobbyBtn.classList.remove('hidden');
                const playerCount = playerListLobby.children.length;
                startGameLobbyBtn.disabled = !categorySelect.value || playerCount < 1; // Ensure a category is selected
                console.log('[DEBUG] updatePlayerList - Host UI updated. Start button unhidden. Disabled:', startGameLobbyBtn.disabled);
            }
        } else {
            if(lobbyMessage) lobbyMessage.textContent = "Warte, bis der Host das Spiel startet oder eine Kategorie wählt...";
            if(startGameLobbyBtn) startGameLobbyBtn.classList.add('hidden');

            if (currentCatFromServer) {
                if(currentCategoryText) currentCategoryText.textContent = currentCatFromServer;
                if(chosenCategoryDisplay) chosenCategoryDisplay.classList.remove('hidden');
            } else {
                if(chosenCategoryDisplay) chosenCategoryDisplay.classList.add('hidden');
            }
            console.log('[DEBUG] updatePlayerList - Non-Host UI updated.');
        }

        // Update host-specific buttons based on current screen and host status
        const currentScreen = [lobbyConnectContainer, lobbyWaitingRoom, quizContainer, gameOverContainer].find(
            s => s && !s.classList.contains('hidden')
        );
        if (currentScreen === quizContainer) {
            if (isHost) {
                if (hostTogglePauseBtn) hostTogglePauseBtn.classList.remove('hidden');
                if (hostSkipToEndBtn) hostSkipToEndBtn.classList.remove('hidden'); // ADDED
            } else {
                if (hostTogglePauseBtn) hostTogglePauseBtn.classList.add('hidden');
                if (hostSkipToEndBtn) hostSkipToEndBtn.classList.add('hidden'); // ADDED
            }
        }

        console.log('[DEBUG] updatePlayerList - END.');
    }


    function updateLiveScores(scoresData) {
        // ... (your existing updateLiveScores function)
        if (!liveScoresList) return;
        liveScoresList.innerHTML = '';
        const sortedScores = [...scoresData].sort((a, b) => b.score - a.score);
        sortedScores.forEach(player => {
            const scoreDiv = document.createElement('div');
            scoreDiv.className = 'player-entry-quiz'; // Base class
            if (player.id === currentPlayerId) {
                scoreDiv.classList.add('current-player-highlight'); // Highlight for current player
            }

            let displayName = player.name;
            if (player.id === currentPlayerId) displayName += " (Du)";

            scoreDiv.innerHTML = `
                <span class="player-name-quiz">${displayName}</span>
                <div>
                    <span class="player-score-quiz">${player.score} Pkt</span>
                    <span class="player-streak-quiz">(Streak: ${player.streak || 0})</span>
                </div>`;
            liveScoresList.appendChild(scoreDiv);
        });
    }

    // --- Event Listeners for UI ---
    // ... (your existing UI event listeners)
    if(createLobbyBtn) createLobbyBtn.addEventListener('click', () => {
        playSound('click');
        const playerName = playerNameInput.value.trim() || 'AnonSpieler';
        socket.emit('createLobby', playerName);
        createLobbyBtn.disabled = true;
        if(joinLobbyBtn) joinLobbyBtn.disabled = true;
    });

    if(joinLobbyBtn) joinLobbyBtn.addEventListener('click', () => {
        playSound('click');
        const lobbyId = lobbyIdInput.value.trim().toUpperCase();
        const playerName = playerNameInput.value.trim() || 'AnonSpieler';
        if (lobbyId) {
            socket.emit('joinLobby', { lobbyId, playerName });
            if(createLobbyBtn) createLobbyBtn.disabled = true;
            joinLobbyBtn.disabled = true;
        } else {
            displayError(connectErrorMsg, 'Bitte gib eine Lobby ID ein.');
        }
    });

    if(copyLobbyIdBtn) copyLobbyIdBtn.addEventListener('click', () => {
        playSound('click');
        if (currentLobbyId) {
            navigator.clipboard.writeText(currentLobbyId)
                .then(() => showGlobalNotification(`Lobby ID ${currentLobbyId} kopiert!`, 'success', 2000))
                .catch(err => showGlobalNotification('Kopieren der ID fehlgeschlagen.', 'error', 2000));
        }
    });

    if(categorySelect) categorySelect.addEventListener('change', handleCategoryChange);

    if(startGameLobbyBtn) startGameLobbyBtn.addEventListener('click', () => {
        playSound('click');
        if (isHost && currentLobbyId) {
            const selectedCategoryFromDropdown = categorySelect.value;
            if (!selectedCategoryFromDropdown) {
                displayError(startGameErrorMsg, "Bitte wähle eine Fragenkategorie aus.");
                return;
            }
            // Use currentSelectedCategoryKey which is updated by handleCategoryChange
            socket.emit('startGame', { lobbyId: currentLobbyId, categoryKey: currentSelectedCategoryKey });
            startGameLobbyBtn.disabled = true;
        }
    });

    if(leaveLobbyBtn) leaveLobbyBtn.addEventListener('click', () => {
        playSound('click');
        stopMenuMusic();
        if (synth && synth.speaking) synth.cancel();
        // Reset client state before reload
        currentLobbyId = null;
        currentPlayerId = null;
        isHost = false;
        // ... any other relevant client state vars ...
        window.location.reload();
    });

    if(playAgainHostBtn) playAgainHostBtn.addEventListener('click', () => {
        playSound('click');
        if (isHost && currentLobbyId) {
            socket.emit('playAgain', currentLobbyId);
            playAgainHostBtn.disabled = true;
        }
    });

    if (muteBtn) {
        muteBtn.addEventListener('click', () => {
            playSound('click');
            toggleMute();
        });
    }

    function triggerHostPause() {
        if (currentLobbyId && isHost && quizContainer && !quizContainer.classList.contains('hidden')) {
            console.log('[DEBUG] Triggering hostTogglePause. isGamePaused (client-side before emit):', isGamePaused);
            socket.emit('hostTogglePause', { lobbyId: currentLobbyId });
        } else {
            console.log('[DEBUG] Conditions not met for triggering host pause.');
        }
    }

    if (hostTogglePauseBtn) {
        hostTogglePauseBtn.addEventListener('click', () => {
            playSound('click');
            triggerHostPause();
        });
    }

    // ADDED: Event listener for Skip to End button
    if (hostSkipToEndBtn) {
        hostSkipToEndBtn.addEventListener('click', () => {
            playSound('click');
            if (isHost && currentLobbyId && quizContainer && !quizContainer.classList.contains('hidden') && !isGamePaused) {
                if (confirm("Möchtest du das Spiel wirklich für alle beenden?")) {
                    console.log(`[DEBUG] Host skipping to end for lobby ${currentLobbyId}`);
                    socket.emit('hostSkipToEnd', { lobbyId: currentLobbyId });
                    hostSkipToEndBtn.disabled = true; // Disable button after click
                }
            }
        });
    }

    document.addEventListener('keydown', (event) => {
        if ((event.code === 'Space' || event.key === ' ') &&
            isHost &&
            quizContainer && !quizContainer.classList.contains('hidden') &&
            !['INPUT', 'TEXTAREA', 'SELECT'].includes(document.activeElement.tagName)) {

            event.preventDefault();
            playSound('click');
            triggerHostPause();
        }
    });

    // --- Socket.IO Event Handlers ---
    // ... (your existing socket.io event handlers like 'connect', 'disconnect', etc.)
    socket.on('connect', () => {
        console.log('[DEBUG] Connected to server with ID:', socket.id);
        if(createLobbyBtn) createLobbyBtn.disabled = false;
        if(joinLobbyBtn) joinLobbyBtn.disabled = false;
        if (lobbyConnectContainer && !lobbyConnectContainer.classList.contains('hidden') ||
            lobbyWaitingRoom && !lobbyWaitingRoom.classList.contains('hidden')) {
            startMenuMusic();
        }
    });

    socket.on('disconnect', (reason) => {
        console.log('[DEBUG] Vom Server getrennt:', reason);
        showGlobalNotification('Vom Server getrennt. Versuche erneut zu verbinden...', 'error', 5000);
        stopMenuMusic();
        if (synth && synth.speaking) synth.cancel();
        if (isGamePaused && gamePausedOverlay) {
            gamePausedOverlay.classList.add('hidden');
            isGamePaused = false;
        }
        // Optionally redirect to connect screen or show a persistent message
        // showScreen(lobbyConnectContainer); // Example: force back to connect screen
    });

    socket.on('lobbyCreated', (data) => {
        console.log('[DEBUG] lobbyCreated event received from server:', JSON.stringify(data));
        currentLobbyId = data.lobbyId;
        currentPlayerId = data.playerId;
        if(displayLobbyId) displayLobbyId.textContent = currentLobbyId;

        allAvailableCategoriesCache = Array.isArray(data.availableCategories) ? [...data.availableCategories] : [];
        console.log('[DEBUG] lobbyCreated - allAvailableCategoriesCache set to:', JSON.stringify(allAvailableCategoriesCache));

        updatePlayerList(data.players, allAvailableCategoriesCache, null);

        showScreen(lobbyWaitingRoom);
        if(connectErrorMsg) connectErrorMsg.textContent = '';
    });

    socket.on('joinedLobby', (data) => {
        console.log('[DEBUG] joinedLobby event received:', JSON.stringify(data));
        currentLobbyId = data.lobbyId;
        currentPlayerId = data.playerId;
        if(displayLobbyId) displayLobbyId.textContent = currentLobbyId;

        allAvailableCategoriesCache = Array.isArray(data.allCategoriesForLobby) ? [...data.allCategoriesForLobby] : [];
        console.log('[DEBUG] joinedLobby - allAvailableCategoriesCache set to:', JSON.stringify(allAvailableCategoriesCache));

        updatePlayerList(data.players, allAvailableCategoriesCache, data.selectedCategory);
        showScreen(lobbyWaitingRoom);
        if(connectErrorMsg) connectErrorMsg.textContent = '';

        if (data.gameState === 'active') {
            if(lobbyMessage) lobbyMessage.textContent = "Spiel beigetreten. Warte auf nächste Frage.";
            stopMenuMusic();
            if (gameCategoryDisplay && data.selectedCategory) {
                gameCategoryDisplay.textContent = data.selectedCategory;
            }
            // Update host buttons visibility based on current player's host status
            if (isHost) {
                if (hostTogglePauseBtn) hostTogglePauseBtn.classList.remove('hidden');
                if (hostSkipToEndBtn) hostSkipToEndBtn.classList.remove('hidden'); // ADDED
            }

            if (data.isPaused) {
                isGamePaused = true;
                if(gamePausedOverlay) gamePausedOverlay.classList.remove('hidden');
                if(pauseResumeMessage) {
                    pauseResumeMessage.textContent = isHost ?
                        "Spiel pausiert. (Leertaste zum Pausieren/Fortsetzen)" :
                        "Das Spiel ist pausiert. Warte auf den Host.";
                }
                if(hostTogglePauseBtn) {
                    hostTogglePauseBtn.textContent = 'Spiel fortsetzen';
                    hostTogglePauseBtn.disabled = !isHost;
                }
                if(optionsContainer) optionsContainer.querySelectorAll('.option-btn').forEach(btn => btn.disabled = true);
            }
        }
    });

    socket.on('categoryUpdatedByHost', (categoryKey) => {
        console.log('[DEBUG] categoryUpdatedByHost received:', categoryKey);
        currentSelectedCategoryKey = categoryKey;

        if (categorySelect && categorySelect.options.length > 0) {
            categorySelect.value = categoryKey || "";
        } else if (categorySelect) {
            console.warn("[DEBUG] categoryUpdatedByHost: categorySelect has no options, cannot set value.");
        }

        if (categoryKey) {
            if(currentCategoryText) currentCategoryText.textContent = categoryKey;
            if(chosenCategoryDisplay) chosenCategoryDisplay.classList.remove('hidden');
        } else {
            if(currentCategoryText) currentCategoryText.textContent = "";
            if(chosenCategoryDisplay) chosenCategoryDisplay.classList.add('hidden');
        }

        if (isHost && startGameLobbyBtn) {
            const playerCount = playerListLobby ? playerListLobby.children.length : 0;
            startGameLobbyBtn.disabled = !currentSelectedCategoryKey || playerCount < 1;
        }
        console.log('[DEBUG] categoryUpdatedByHost - UI updated for category:', categoryKey);
    });

    socket.on('lobbyError', (message) => {
        displayError(connectErrorMsg, message, 5000); // Increased duration
        if(createLobbyBtn) createLobbyBtn.disabled = false;
        if(joinLobbyBtn) joinLobbyBtn.disabled = false;
        console.error('[DEBUG] Lobby Fehler:', message);
    });

    socket.on('startGameError', (message) => {
        displayError(startGameErrorMsg, message);
        if (isHost && startGameLobbyBtn) {
            startGameLobbyBtn.disabled = false; // Re-enable start button on error
        }
        console.error('[DEBUG] Start Game Error:', message);
    });

    socket.on('playerJoined', (data) => {
        console.log('[DEBUG] playerJoined event received (another player):', JSON.stringify(data));
        allAvailableCategoriesCache = Array.isArray(data.allCategoriesForLobby) ? [...data.allCategoriesForLobby] : allAvailableCategoriesCache;
        updatePlayerList(data.players, allAvailableCategoriesCache, data.selectedCategory);

        if (data.joinedPlayerId !== currentPlayerId) {
            playSound('playerJoined');
            showGlobalNotification(`${data.joinedPlayerName} ist der Lobby beigetreten.`, 'info', 2000);
        }
    });

    socket.on('playerLeft', (data) => {
        console.log('[DEBUG] playerLeft event received:', JSON.stringify(data));
        updatePlayerList(data.players, allAvailableCategoriesCache, data.selectedCategory);
        showGlobalNotification(`${data.disconnectedPlayerName} hat die Lobby verlassen.`, 'info', 2000);
    });

    socket.on('hostChanged', (data) => {
        console.log('[DEBUG] hostChanged event received:', JSON.stringify(data));
        allAvailableCategoriesCache = Array.isArray(data.availableCategories) ? [...data.availableCategories] : [];
        updatePlayerList(data.players, allAvailableCategoriesCache, data.selectedCategory); // This will update isHost
        const newHost = data.players.find(p => p.id === data.newHostId);
        if (newHost) {
            showGlobalNotification(`${newHost.name} ist jetzt der Host.`, 'info', 3000);
        }
        // Update visibility of host buttons based on new host status and current screen
        const currentScreen = [lobbyConnectContainer, lobbyWaitingRoom, quizContainer, gameOverContainer].find(
            s => s && !s.classList.contains('hidden')
        );
        if (currentScreen === quizContainer) {
            if (isHost) {
                if (hostTogglePauseBtn) {
                    hostTogglePauseBtn.classList.remove('hidden');
                    hostTogglePauseBtn.disabled = isGamePaused;
                    hostTogglePauseBtn.textContent = isGamePaused ? 'Spiel fortsetzen' : 'Pause Spiel';
                }
                if (hostSkipToEndBtn) hostSkipToEndBtn.classList.remove('hidden'); // ADDED
            } else {
                if (hostTogglePauseBtn) hostTogglePauseBtn.classList.add('hidden');
                if (hostSkipToEndBtn) hostSkipToEndBtn.classList.add('hidden'); // ADDED
            }
        }
    });

    socket.on('gameStarted', (data) => {
        console.log('[DEBUG] gameStarted event received:', JSON.stringify(data));
        stopMenuMusic();
        playSound('gameStart');
        if(gameCategoryDisplay) gameCategoryDisplay.textContent = data.category || "Unbekannt";
        showScreen(quizContainer); // This function will now handle showing host buttons
        isGamePaused = false;
        if(gamePausedOverlay) gamePausedOverlay.classList.add('hidden');
        if(hostTogglePauseBtn) {
            hostTogglePauseBtn.textContent = 'Pause Spiel';
            hostTogglePauseBtn.disabled = !isHost; // Disable if not host
        }
        if(hostSkipToEndBtn) { // ADDED
            hostSkipToEndBtn.disabled = !isHost; // Disable if not host
        }
    });

    socket.on('newQuestion', (data) => {
        wasTimedOut = false;
        currentQuestionDataCache = data; // Cache question data for potential HoF submission

        if (isGamePaused) { // If game was paused and a new question comes, it means it was resumed implicitly
            isGamePaused = false;
            if(gamePausedOverlay) gamePausedOverlay.classList.add('hidden');
            if(hostTogglePauseBtn && isHost) {
                hostTogglePauseBtn.textContent = 'Pause Spiel';
                hostTogglePauseBtn.disabled = false;
            }
        }

        speak(data.question, 'de-DE', null, true);

        currentQuestionIndex = data.questionIndex;
        questionTimeLimit = data.timeLimit;
        if(gameCategoryDisplay) gameCategoryDisplay.textContent = data.category || currentSelectedCategoryKey || "Unbekannt";

        console.log('[DEBUG] newQuestion - Received question data:', data);
        if (questionText) {
            questionText.textContent = data.question;
        } else {
            console.error('[DEBUG] newQuestion - questionText element NOT found!');
        }

        if(questionCounter) questionCounter.textContent = `F: ${data.questionIndex + 1}/${data.totalQuestions}`;

        // Fetch current player data from the dataset if available, otherwise use input or default
        let myPlayerName = playerNameInput.value.trim() || "Du";
        let myPlayerScore = 0;
        if (quizContainer.dataset.players) {
            try {
                const playersData = JSON.parse(quizContainer.dataset.players);
                const me = playersData.find(p => p.id === currentPlayerId);
                if (me) {
                    myPlayerName = me.name;
                    myPlayerScore = me.score;
                }
            } catch (e) { console.error("Error parsing players data from dataset", e); }
        }
        if (playerInfoQuiz) {
            playerInfoQuiz.textContent = `${myPlayerName} (Punkte: ${myPlayerScore})`;
        }


        if(optionsContainer) {
            optionsContainer.innerHTML = '';
            const optionIndices = ['a)', 'b)', 'c)', 'd)', 'e)', 'f)'];

            data.options.forEach((optionText, index) => {
                const button = document.createElement('button');
                button.className = 'option-btn';
                button.disabled = isGamePaused;

                const indexSpan = document.createElement('span');
                indexSpan.className = 'option-index';
                indexSpan.textContent = optionIndices[index % optionIndices.length];

                const textSpan = document.createElement('span');
                textSpan.className = 'option-text';
                textSpan.textContent = optionText;

                button.appendChild(indexSpan);
                button.appendChild(textSpan);

                // Default styling for options
                button.classList.add('bg-slate-700', 'border-slate-600', 'hover:bg-sky-700', 'hover:border-sky-500');
                button.classList.remove('selected', 'correct', 'incorrect-picked', 'reveal-correct', 'flash-correct');


                button.addEventListener('click', () => {
                    playSound('click');
                    optionsContainer.querySelectorAll('.option-btn').forEach(btn => {
                        btn.disabled = true;
                        btn.classList.remove('selected', 'ring-4', 'ring-white'); // Remove selection visual
                        // Reset to default non-selected style
                        btn.classList.add('bg-slate-700', 'border-slate-600', 'hover:bg-sky-700', 'hover:border-sky-500');
                        btn.classList.remove('bg-sky-500', 'border-sky-400');
                    });
                    button.classList.add('selected', 'bg-sky-500', 'border-sky-400', 'ring-4', 'ring-white'); // Add selection visual
                    button.classList.remove('bg-slate-700', 'border-slate-600', 'hover:bg-sky-700', 'hover:border-sky-500');

                    socket.emit('submitAnswer', {
                        lobbyId: currentLobbyId,
                        questionIndex: currentQuestionIndex,
                        answer: optionText
                    });
                    if(feedbackText) feedbackText.textContent = '';
                    if(waitingForOthersMsg) waitingForOthersMsg.textContent = "Antwort übermittelt. Warte auf andere Spieler oder Timer...";
                });
                optionsContainer.appendChild(button);
            });
        }
        if(feedbackText) feedbackText.textContent = '';
        if(waitingForOthersMsg) waitingForOthersMsg.textContent = '';
        if(timerDisplay) {
            timerDisplay.textContent = isGamePaused ? 'Pausiert' : `${questionTimeLimit}s`;
            timerDisplay.classList.remove('text-red-500', 'text-amber-400');
            if (!isGamePaused) timerDisplay.classList.add('text-amber-400');
        }
    });

    socket.on('updateScores', (playersScoreData) => {
        if(quizContainer) quizContainer.dataset.players = JSON.stringify(playersScoreData);
        updateLiveScores(playersScoreData);
        const me = playersScoreData.find(p => p.id === currentPlayerId);
        if (me && playerInfoQuiz) {
            playerInfoQuiz.textContent = `${me.name} (Punkte: ${me.score})`;
        }
    });

    socket.on('timerUpdate', (timeLeft) => {
        if (isGamePaused) {
            if(timerDisplay) {
                timerDisplay.textContent = isHost ?
                    `Pausiert (${Math.ceil(timeLeft)}s)` :
                    `Pausiert`;
            }
            return;
        }
        if(!timerDisplay) return;
        timerDisplay.textContent = `${timeLeft}s`;
        if (timeLeft <= 5 && timeLeft > 0) {
            timerDisplay.classList.remove('text-amber-400');
            timerDisplay.classList.add('text-red-500');
        } else if (timeLeft === 0) {
            wasTimedOut = true;
            timerDisplay.classList.add('text-red-500');
            if(waitingForOthersMsg) waitingForOthersMsg.textContent = "Zeit abgelaufen! Antwort wird aufgedeckt...";
            if(optionsContainer) optionsContainer.querySelectorAll('.option-btn').forEach(btn => btn.disabled = true);
        } else {
            timerDisplay.classList.remove('text-red-500');
            timerDisplay.classList.add('text-amber-400');
        }
    });

    socket.on('answerResult', (data) => {
        console.log('[DEBUG] answerResult received:', data);

        // Update player's own score display immediately if possible
        const meFromDataset = quizContainer.dataset.players ? JSON.parse(quizContainer.dataset.players).find(p => p.id === currentPlayerId) : null;
        if (meFromDataset && playerInfoQuiz) {
            meFromDataset.score = data.score; // Update score from server result
            meFromDataset.streak = data.streak;
            playerInfoQuiz.textContent = `${meFromDataset.name} (Punkte: ${meFromDataset.score})`;
            // Update the dataset as well
            const players = JSON.parse(quizContainer.dataset.players);
            const playerIndex = players.findIndex(p => p.id === currentPlayerId);
            if (playerIndex !== -1) {
                players[playerIndex].score = data.score;
                players[playerIndex].streak = data.streak;
                quizContainer.dataset.players = JSON.stringify(players);
            }
        }


        if(waitingForOthersMsg) waitingForOthersMsg.textContent = "Warte auf Ergebnisse aller Spieler...";
        if(feedbackText) {
            feedbackText.textContent = `Deine Antwort wurde registriert.`;
            feedbackText.className = 'text-lg font-medium text-slate-300';
        }

        // Highlight the player's chosen button based on correctness
        if (optionsContainer) {
            optionsContainer.querySelectorAll('.option-btn.selected').forEach(btn => {
                btn.classList.remove('bg-sky-500', 'border-sky-400'); // Remove generic selected style
                if (data.isCorrect) {
                    btn.classList.add('correct'); // Uses .correct style from CSS
                } else {
                    btn.classList.add('incorrect-picked'); // Uses .incorrect-picked style from CSS
                }
            });
        }
    });

    socket.on('questionOver', (data) => {
        console.log('[DEBUG] questionOver received:', data, 'wasTimedOut:', wasTimedOut);
        if (wasTimedOut && !isGamePaused) {
            playSound('timesUp');
        }
        wasTimedOut = false;

        if(feedbackText) {
            feedbackText.textContent = ''; // Clear "registered" message
        }
        if(waitingForOthersMsg) waitingForOthersMsg.textContent = "Richtige Antwort wird aufgedeckt...";

        if(optionsContainer) {
            optionsContainer.querySelectorAll('.option-btn').forEach(btn => {
                btn.disabled = true; // Ensure all buttons are disabled
                // Remove selection-specific styles if not already handled by answerResult
                btn.classList.remove('selected', 'ring-4', 'ring-white', 'bg-sky-500', 'border-sky-400');

                const btnText = btn.querySelector('.option-text').textContent.trim(); // Get text from span
                const correctAnswerText = data.correctAnswer.trim();

                // If this button was the correct answer, apply reveal-correct and flash
                if (btnText === correctAnswerText) {
                    btn.classList.remove('incorrect-picked', 'correct', 'bg-slate-700', 'border-slate-600');
                    btn.classList.add('flash-correct'); // Applies base style and animation
                    // Remove flash class after animation completes so style persists if needed
                    setTimeout(() => {
                        btn.classList.remove('flash-correct');
                        // Optionally, ensure it stays styled as 'reveal-correct' if flash-correct doesn't persist the style
                        if (!btn.classList.contains('correct') && !btn.classList.contains('incorrect-picked')) {
                            btn.classList.add('reveal-correct'); // Fallback to persistent correct style
                        }
                    }, 3000); // Match animation duration (0.5s * 6 iterations)
                } else if (!btn.classList.contains('incorrect-picked') && !btn.classList.contains('correct')) {
                    // If it's not the correct one and wasn't picked, ensure default disabled style
                    btn.classList.add('bg-slate-700', 'border-slate-600', 'opacity-60');
                }
            });
        }
        updateLiveScores(data.scores); // Update scores with final for this question

        const textToSpeak = `Die richtige Antwort war: ${data.correctAnswer}`;
        speak(textToSpeak, 'de-DE', () => {
            if(waitingForOthersMsg) waitingForOthersMsg.textContent = "Nächste Frage kommt...";
            // Server will send next question, no need for client to emit ready
        }, false);
    });

    socket.on('gameOver', (data) => {
        console.log('[DEBUG] gameOver event received:', data);
        stopMenuMusic();
        if (synth && synth.speaking) synth.cancel();
        isGamePaused = false;
        if(gamePausedOverlay) gamePausedOverlay.classList.add('hidden');
        if(hostSkipToEndBtn) hostSkipToEndBtn.classList.add('hidden'); // ADDED: Hide skip button on game over

        if(finalScoresDiv) {
            finalScoresDiv.innerHTML = ''; // Clear previous scores
            data.finalScores.forEach((player, index) => {
                const scoreEntry = document.createElement('div');
                scoreEntry.className = 'final-score-entry';
                let medal = '';
                let medalClass = '';
                if (index === 0) { medal = '🥇 '; medalClass = 'final-score-gold'; }
                else if (index === 1) { medal = '🥈 '; medalClass = 'final-score-silver'; }
                else if (index === 2) { medal = '🥉 '; medalClass = 'final-score-bronze'; }

                if (medalClass) scoreEntry.classList.add(medalClass);

                let displayName = player.name;
                if (player.originalId === currentPlayerId) { // Assuming server sends originalId
                    displayName += " (Du)";
                }
                scoreEntry.innerHTML = `<span>${medal}${displayName}</span><span>${player.score} Pkt</span>`;
                finalScoresDiv.appendChild(scoreEntry);
            });
        }

        // Show "Submit to Hall of Fame" button
        if (submitScoreHallOfFameBtn) {
            submitScoreHallOfFameBtn.classList.remove('hidden');
            submitScoreHallOfFameBtn.disabled = false;
        }
        if (submitScoreStatusMsg) submitScoreStatusMsg.textContent = '';


        if (isHost) {
            if(playAgainHostBtn) playAgainHostBtn.classList.remove('hidden');
            if(playAgainHostBtn) playAgainHostBtn.disabled = false;
            if(waitingForHostPlayAgainBtn) waitingForHostPlayAgainBtn.classList.add('hidden');
        } else {
            if(playAgainHostBtn) playAgainHostBtn.classList.add('hidden');
            if(waitingForHostPlayAgainBtn) waitingForHostPlayAgainBtn.classList.remove('hidden');
        }
        showScreen(gameOverContainer);
        startMenuMusic();
    });

    socket.on('lobbyResetForPlayAgain', (data) => {
        console.log('[DEBUG] lobbyResetForPlayAgain received:', JSON.stringify(data));
        if (synth && synth.speaking) synth.cancel();
        currentLobbyId = data.lobbyId;
        allAvailableCategoriesCache = Array.isArray(data.availableCategories) ? [...data.availableCategories] : [];
        updatePlayerList(data.players, allAvailableCategoriesCache, data.selectedCategory); // This will update isHost
        showScreen(lobbyWaitingRoom);
        isGamePaused = false;
        if(gamePausedOverlay) gamePausedOverlay.classList.add('hidden');
        if(hostTogglePauseBtn) {
            hostTogglePauseBtn.textContent = 'Pause Spiel';
            // Visibility handled by showScreen/updatePlayerList
        }
        if(hostSkipToEndBtn) { // ADDED
            // Visibility handled by showScreen/updatePlayerList
        }


        if(lobbyMessage) lobbyMessage.textContent = isHost ? "Spiel zurückgesetzt. Wähle Kategorie und starte!" : "Host hat das Spiel zurückgesetzt. Warte auf Start...";
        if(startGameLobbyBtn) startGameLobbyBtn.disabled = !isHost || !categorySelect.value;
        if(playAgainHostBtn) playAgainHostBtn.disabled = false; // Re-enable for host

        // Hide Hall of Fame button and message
        if (submitScoreHallOfFameBtn) submitScoreHallOfFameBtn.classList.add('hidden');
        if (submitScoreStatusMsg) submitScoreStatusMsg.textContent = '';
    });

    socket.on('gamePaused', (data) => {
        console.log('[DEBUG] gamePaused event received. Remaining time:', data.remainingTime);
        isGamePaused = true;
        if (synth && synth.speaking) synth.cancel();
        if(gamePausedOverlay) gamePausedOverlay.classList.remove('hidden');
        if(pauseResumeMessage) {
            pauseResumeMessage.textContent = isHost ?
                "Spiel pausiert. (Leertaste zum Pausieren/Fortsetzen)" :
                "Das Spiel ist pausiert. Warte auf den Host.";
        }
        if(hostTogglePauseBtn && isHost) {
            hostTogglePauseBtn.textContent = 'Spiel fortsetzen';
            hostTogglePauseBtn.disabled = false; // Host can always resume
        }
        if(hostSkipToEndBtn && isHost) { // ADDED: Disable skip button when paused
            hostSkipToEndBtn.disabled = true;
        }


        if(optionsContainer) optionsContainer.querySelectorAll('.option-btn').forEach(btn => btn.disabled = true);
        if(timerDisplay && data.remainingTime !== undefined) {
            timerDisplay.textContent = isHost ? `Pausiert (${Math.ceil(data.remainingTime)}s)` : `Pausiert`;
        } else if(timerDisplay) {
            timerDisplay.textContent = 'Pausiert';
        }
    });

    socket.on('gameResumed', () => {
        console.log('[DEBUG] gameResumed event received.');
        isGamePaused = false;
        if(gamePausedOverlay) gamePausedOverlay.classList.add('hidden');

        if(hostTogglePauseBtn && isHost) {
            hostTogglePauseBtn.textContent = 'Pause Spiel';
            hostTogglePauseBtn.disabled = false;
        }
        if(hostSkipToEndBtn && isHost) { // ADDED: Enable skip button when resumed
            hostSkipToEndBtn.disabled = false;
        }

        if(optionsContainer) {
            optionsContainer.querySelectorAll('.option-btn').forEach(btn => {
                const isAnsweredOrRevealed = btn.classList.contains('selected') ||
                    btn.classList.contains('correct') ||
                    btn.classList.contains('incorrect-picked') ||
                    btn.classList.contains('reveal-correct') ||
                    btn.classList.contains('flash-correct');
                if (!isAnsweredOrRevealed) {
                    btn.disabled = false;
                }
            });
        }
        console.log('[DEBUG] gameResumed: UI updated for resume.');
    });

    // Initial setup
    showScreen(lobbyConnectContainer);
    updateMuteButtonAppearance();
    const savedPlayerName = localStorage.getItem('quizPlayerName');
    if (savedPlayerName && playerNameInput) {
        playerNameInput.value = savedPlayerName;
    }
    if(playerNameInput) playerNameInput.addEventListener('input', () => {
        localStorage.setItem('quizPlayerName', playerNameInput.value);
    });
    if(lobbyIdInput) lobbyIdInput.addEventListener('input', () => {
        lobbyIdInput.value = lobbyIdInput.value.toUpperCase();
    });

    // --- Hall of Fame Score Submission (Placeholder for now) ---
    if (submitScoreHallOfFameBtn) {
        submitScoreHallOfFameBtn.addEventListener('click', () => {
            playSound('click');
            const myPlayerName = playerNameInput.value.trim() || "Anonymous Quizzer";
            let myFinalScore = 0;

            // Try to get the score from the displayed final scores
            const finalScoresEntries = finalScoresDiv.querySelectorAll('.final-score-entry');
            finalScoresEntries.forEach(entry => {
                const nameElement = entry.querySelector('span:first-child');
                if (nameElement && nameElement.textContent.includes('(Du)')) {
                    const scoreElement = entry.querySelector('span:last-child');
                    if (scoreElement) {
                        myFinalScore = parseInt(scoreElement.textContent, 10) || 0;
                    }
                }
            });

            const questionSetName = currentQuestionDataCache ? currentQuestionDataCache.category : "Unknown Category";

            if (submitScoreStatusMsg) submitScoreStatusMsg.textContent = 'Submitting score...';
            submitScoreHallOfFameBtn.disabled = true;

            // The actual fetch to your auth-app's API endpoint
            // This URL needs to point to your auth-app, e.g., http://localhost:7000 or https://auth.korczewski.de
            const authAppUrl = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1' ? 'http://localhost:7000' : 'https://auth.korczewski.de';

            fetch(`${authAppUrl}/api/hall-of-fame/submit`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    // If your API requires CSRF token and this is a different origin,
                    // CSRF via custom headers might be tricky without proper CORS.
                    // For now, assuming session cookie handles auth if API is on same parent domain.
                },
                body: JSON.stringify({
                    playerName: myPlayerName,
                    questionSet: questionSetName,
                    score: myFinalScore
                })
            })
                .then(response => response.json())
                .then(data => {
                    if (data.message === 'Score submitted successfully!') {
                        if (submitScoreStatusMsg) submitScoreStatusMsg.textContent = 'Score submitted!';
                        showGlobalNotification('Score submitted to Hall of Fame!', 'success');
                    } else {
                        if (submitScoreStatusMsg) submitScoreStatusMsg.textContent = `Error: ${data.message || 'Could not submit score.'}`;
                        showGlobalNotification(`Error: ${data.message || 'Could not submit score.'}`, 'error');
                        submitScoreHallOfFameBtn.disabled = false; // Re-enable on error
                    }
                })
                .catch(error => {
                    console.error('Error submitting score to Hall of Fame:', error);
                    if (submitScoreStatusMsg) submitScoreStatusMsg.textContent = 'Network error. Could not submit score.';
                    showGlobalNotification('Network error. Could not submit score.', 'error');
                    submitScoreHallOfFameBtn.disabled = false; // Re-enable on error
                });
        });
    }

});
