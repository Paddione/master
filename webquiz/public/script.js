/**
 * script.js
 * * CSP Refinements:
 * This version addresses potential Content Security Policy (CSP) sensitivities
 * by refactoring dynamic HTML generation. Specifically, instances of `element.innerHTML = "string" + variable + "string";`
 * have been changed to use `document.createElement`, `element.appendChild`, and `element.textContent`
 * for better security and to avoid any misinterpretation by strict CSP rules that might flag
 * string concatenation in `innerHTML` as potentially unsafe (though it's not a direct 'eval').
 * * Note: This script, even in previous versions, did not directly use `eval()`, `new Function()`,
 * or string arguments in `setTimeout()` / `setInterval()`. If 'unsafe-eval' CSP errors persist,
 * the cause likely lies in the server's CSP header configuration, inline scripts in the HTML,
 * or third-party library interactions. Check the browser console for the exact source of the CSP violation.
 */
document.addEventListener('DOMContentLoaded', () => {
    const socket = io({
        withCredentials: true, // Important for session cookies
    });

    // --- DOM Elements ---
    const loadingOverlay = document.getElementById('loading-overlay');
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
    const submitScoreHallOfFameBtn = document.getElementById('submit-score-hall-of-fame-btn');
    const submitScoreStatusMsg = document.getElementById('submit-score-status-msg');

    const globalNotification = document.getElementById('global-notification');
    const muteBtn = document.getElementById('mute-btn');

    const hostTogglePauseBtn = document.getElementById('host-toggle-pause-btn');
    const hostSkipToEndBtn = document.getElementById('host-skip-to-end-btn');
    const gamePausedOverlay = document.getElementById('game-paused-overlay');
    const pauseResumeMessage = document.getElementById('pause-resume-message');


    // --- Game State Variables ---
    let currentLobbyId = null;
    let currentPlayerId = null;
    let currentQuestionDataCache = null;
    let currentQuestionIndex = -1;
    let isHost = false;
    let questionTimeLimit = 60;
    let currentSelectedCategoryKey = null;
    let allAvailableCategoriesCache = [];
    let isMuted = localStorage.getItem('quizMuted') === 'true';
    let isGamePaused = false;
    let wasTimedOut = false;
    let connectionRetryCount = 0;
    const MAX_CONNECTION_RETRIES = 3;


    // --- Speech Synthesis Setup ---
    console.log('[DEBUG] Initializing Speech Synthesis...');
    const synth = window.speechSynthesis;
    let voices = [];
    let currentSpeechUtterance = null;

    function populateVoices() {
        voices = synth.getVoices();
        console.log('[DEBUG] TTS Voices loaded/changed:', voices.length);
    }
    if (synth.onvoiceschanged !== undefined) {
        synth.onvoiceschanged = populateVoices;
    }
    populateVoices();


    // --- Sound Effects ---
    const soundEffectsVolume = 0.3;
    const menuMusicVolume = 0.5;

    const sounds = {
        click: new Audio('/assets/sounds/click.mp3'),
        correctAnswer: new Audio('/assets/sounds/correctanswer.mp3'),
        incorrectAnswer: new Audio('/assets/sounds/incorrectanswer.mp3'),
        menuMusic: new Audio('/assets/sounds/menumusic.mp3'),
        streak: new Audio('/assets/sounds/streak.mp3'),
        timesUp: new Audio('/assets/sounds/timesup.mp3'),
        playerJoined: new Audio('/assets/sounds/lobby_player_join.mp3'),
        gameStart: new Audio('/assets/sounds/game_start_quiz.mp3')
    };

    sounds.menuMusic.loop = true;
    sounds.menuMusic.volume = menuMusicVolume;


    // --- Utility Functions ---
    function updateMuteButtonAppearance() {
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
        isMuted = !isMuted;
        localStorage.setItem('quizMuted', isMuted.toString());
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
        if (isMuted && soundName !== 'click') return;
        if (isMuted && soundName === 'click' && sounds[soundName]) {
            sounds[soundName].volume = soundEffectsVolume * 0.5;
            sounds[soundName].currentTime = 0;
            sounds[soundName].play().catch(error => console.warn(`Error playing sound ${soundName} (muted click):`, error));
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
            sound.play().catch(error => console.warn(`Error playing sound ${soundName}:`, error));
        } else {
            console.warn(`Sound not found: ${soundName}`);
        }
    }

    function startMenuMusic() {
        if (isMuted) return;
        sounds.menuMusic.volume = menuMusicVolume;
        if (sounds.menuMusic.paused) {
            sounds.menuMusic.play().catch(error => console.warn("Error playing menu music:", error));
        }
    }

    function stopMenuMusic() {
        sounds.menuMusic.pause();
        sounds.menuMusic.currentTime = 0;
    }

    function showScreen(screenElement) {
        console.log('[DEBUG] showScreen called for:', screenElement ? screenElement.id : 'undefined element');

        if (loadingOverlay) {
            loadingOverlay.classList.add('hidden');
        }

        if (synth && synth.speaking && screenElement !== quizContainer && screenElement !== gameOverContainer) {
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
            if(lobbyConnectContainer) lobbyConnectContainer.classList.remove('hidden');
            return;
        }

        if (screenElement === lobbyConnectContainer || screenElement === lobbyWaitingRoom || screenElement === gameOverContainer) {
            startMenuMusic();
            if (hostTogglePauseBtn) hostTogglePauseBtn.classList.add('hidden');
            if (hostSkipToEndBtn) hostSkipToEndBtn.classList.add('hidden');
        } else {
            stopMenuMusic();
        }

        if (screenElement === quizContainer) {
            if (isHost) {
                if (hostTogglePauseBtn) {
                    hostTogglePauseBtn.classList.remove('hidden');
                    hostTogglePauseBtn.disabled = false;
                    hostTogglePauseBtn.textContent = isGamePaused ? 'Spiel fortsetzen' : 'Pause Spiel';
                }
                if (hostSkipToEndBtn) {
                    hostSkipToEndBtn.classList.remove('hidden');
                    hostSkipToEndBtn.disabled = isGamePaused;
                }
            } else {
                if (hostTogglePauseBtn) hostTogglePauseBtn.classList.add('hidden');
                if (hostSkipToEndBtn) hostSkipToEndBtn.classList.add('hidden');
            }
        }

        if (gamePausedOverlay && screenElement !== quizContainer) {
            gamePausedOverlay.classList.add('hidden');
            isGamePaused = false;
        }
    }

    function displayError(element, message, duration = 3000) {
        if(element) {
            element.textContent = message;
            element.classList.remove('hidden');
            setTimeout(() => {
                element.textContent = '';
                element.classList.add('hidden');
            }, duration);
        } else {
            console.warn("[DEBUG] displayError: element is null for message:", message);
            showGlobalNotification(message, 'error');
        }
    }

    function showGlobalNotification(message, type = 'error', duration = 3000) {
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
        console.log('[DEBUG] populateCategorySelector - START. Categories:', JSON.stringify(categories), 'Selected:', selectedCategoryKey);

        if (!categorySelect) {
            console.error("[DEBUG] populateCategorySelector: categorySelect element not found!");
            return;
        }

        allAvailableCategoriesCache = Array.isArray(categories) ? [...categories] : [];
        categorySelect.innerHTML = '';

        if (allAvailableCategoriesCache.length === 0) {
            const option = document.createElement('option');
            option.value = "";
            option.textContent = "Keine Kategorien verfügbar";
            categorySelect.appendChild(option);
            categorySelect.disabled = true;
            if(chosenCategoryDisplay) chosenCategoryDisplay.classList.add('hidden');
            if(startGameLobbyBtn) startGameLobbyBtn.disabled = true;
            return;
        }

        categorySelect.disabled = !isHost;

        const defaultOption = document.createElement('option');
        defaultOption.value = "";
        defaultOption.textContent = "-- Kategorie auswählen --";
        defaultOption.disabled = true;
        defaultOption.selected = !selectedCategoryKey;
        categorySelect.appendChild(defaultOption);

        allAvailableCategoriesCache.forEach(categoryKey => {
            const option = document.createElement('option');
            option.value = categoryKey;
            option.textContent = categoryKey;
            if (selectedCategoryKey && categoryKey === selectedCategoryKey) {
                option.selected = true;
            }
            categorySelect.appendChild(option);
        });

        if (selectedCategoryKey && allAvailableCategoriesCache.includes(selectedCategoryKey)) {
            currentSelectedCategoryKey = selectedCategoryKey;
            categorySelect.value = selectedCategoryKey;
            if(currentCategoryText) currentCategoryText.textContent = selectedCategoryKey;
            if(chosenCategoryDisplay && !isHost) chosenCategoryDisplay.classList.remove('hidden');
            else if (chosenCategoryDisplay && isHost) chosenCategoryDisplay.classList.add('hidden');
        } else {
            currentSelectedCategoryKey = null;
            categorySelect.value = "";
            if(currentCategoryText) currentCategoryText.textContent = "Keine Kategorie ausgewählt";
            if(chosenCategoryDisplay) chosenCategoryDisplay.classList.add('hidden');
        }
        if(startGameLobbyBtn) startGameLobbyBtn.disabled = !isHost || !categorySelect.value;
    }

    function handleCategoryChange() {
        if (isHost) {
            currentSelectedCategoryKey = categorySelect.value || null;
            if (currentLobbyId) {
                socket.emit('hostSelectedCategory', { lobbyId: currentLobbyId, categoryKey: currentSelectedCategoryKey });
            }
            const playerCount = playerListLobby ? playerListLobby.children.length : 0;
            if(startGameLobbyBtn) startGameLobbyBtn.disabled = !currentSelectedCategoryKey || playerCount < 1;
            if(chosenCategoryDisplay) chosenCategoryDisplay.classList.add('hidden');
        }
    }

    function updatePlayerList(players, initialLobbyCategories = [], currentCatFromServer = null) {
        if (!playerListLobby) return;
        playerListLobby.innerHTML = ''; // Clear old list

        const me = players.find(p => p.id === currentPlayerId);
        if (me) isHost = me.isHost;
        else isHost = false;

        players.forEach(player => {
            const playerDiv = document.createElement('div');
            playerDiv.className = 'player-entry bg-slate-700/80 p-3 rounded-lg shadow-md flex justify-between items-center text-slate-100 my-1';
            if (player.disconnected) playerDiv.classList.add('opacity-50', 'italic');
            if (player.isHost) playerDiv.classList.add('ring-2', 'ring-sky-400');

            const nameSpan = document.createElement('span');
            nameSpan.className = 'player-name font-medium';
            let nameDisplayText = player.name;
            if (player.id === currentPlayerId) nameDisplayText += ' (Du)';
            nameSpan.textContent = nameDisplayText;
            playerDiv.appendChild(nameSpan);

            if (player.disconnected) {
                const statusSpan = document.createElement('span');
                statusSpan.className = 'text-xs text-red-400 ml-2';
                statusSpan.textContent = '(Getrennt)';
                nameSpan.appendChild(statusSpan); // Append to nameSpan to keep it together
            }

            if (player.isHost) {
                const hostBadgeSpan = document.createElement('span');
                hostBadgeSpan.className = 'player-host-badge bg-sky-500 text-white text-xs font-semibold px-2.5 py-1 rounded-full ml-2';
                hostBadgeSpan.textContent = 'Host';
                // Append to playerDiv to have it on the right, or to nameSpan if preferred next to name
                playerDiv.appendChild(hostBadgeSpan);
            }
            playerListLobby.appendChild(playerDiv);
        });

        const categoriesForDropdown = (Array.isArray(initialLobbyCategories) && initialLobbyCategories.length > 0)
            ? initialLobbyCategories : allAvailableCategoriesCache;

        if (categorySelectionContainer) {
            if (categoriesForDropdown.length > 0) {
                categorySelectionContainer.classList.remove('hidden');
                populateCategorySelector(categoriesForDropdown, currentCatFromServer || currentSelectedCategoryKey);
            } else {
                categorySelectionContainer.classList.add('hidden');
                if(startGameLobbyBtn) startGameLobbyBtn.disabled = true;
            }
        }

        if (isHost) {
            if(lobbyMessage) lobbyMessage.textContent = "Du bist der Host. Wähle eine Kategorie und starte das Spiel.";
            if(startGameLobbyBtn) {
                startGameLobbyBtn.classList.remove('hidden');
                startGameLobbyBtn.disabled = !categorySelect.value || players.length < 1;
            }
            if(chosenCategoryDisplay) chosenCategoryDisplay.classList.add('hidden');
            if(categorySelect) categorySelect.disabled = false;
        } else {
            if(lobbyMessage) lobbyMessage.textContent = "Warte, bis der Host das Spiel startet...";
            if(startGameLobbyBtn) startGameLobbyBtn.classList.add('hidden');
            if(categorySelect) categorySelect.disabled = true;

            if (currentCatFromServer) {
                if(currentCategoryText) currentCategoryText.textContent = currentCatFromServer;
                if(chosenCategoryDisplay) chosenCategoryDisplay.classList.remove('hidden');
            } else {
                if(currentCategoryText) currentCategoryText.textContent = "Kategorie wird gewählt...";
                if(chosenCategoryDisplay) chosenCategoryDisplay.classList.add('hidden');
            }
        }
    }

    function updateLiveScores(scoresData) {
        if (!liveScoresList) return;
        liveScoresList.innerHTML = ''; // Clear old scores
        const sortedScores = [...scoresData].sort((a, b) => b.score - a.score);

        sortedScores.forEach(player => {
            const scoreDiv = document.createElement('div');
            scoreDiv.className = 'player-entry-quiz flex justify-between items-center p-2 bg-slate-700/70 rounded-md mb-1';
            if (player.id === currentPlayerId) scoreDiv.classList.add('ring-1', 'ring-amber-400');
            if (player.disconnected) scoreDiv.classList.add('opacity-60');

            const nameSpan = document.createElement('span');
            nameSpan.className = 'player-name-quiz text-slate-200';
            let displayNameText = player.name;
            if (player.id === currentPlayerId) displayNameText += " (Du)";
            nameSpan.textContent = displayNameText;

            if (player.disconnected) {
                const statusIndicatorSpan = document.createElement('span');
                statusIndicatorSpan.className = 'text-xs text-red-400 ml-1';
                statusIndicatorSpan.textContent = '(Getrennt)';
                nameSpan.appendChild(statusIndicatorSpan);
            }
            scoreDiv.appendChild(nameSpan);

            const scoreDetailsDiv = document.createElement('div');
            scoreDetailsDiv.className = 'text-right';

            const playerScoreSpan = document.createElement('span');
            playerScoreSpan.className = 'player-score-quiz text-amber-400 font-semibold';
            playerScoreSpan.textContent = `${player.score} Pkt`;
            scoreDetailsDiv.appendChild(playerScoreSpan);

            const playerStreakSpan = document.createElement('span');
            playerStreakSpan.className = 'player-streak-quiz text-xs text-sky-300 ml-2';
            playerStreakSpan.textContent = `(Streak: ${player.streak || 0})`;
            scoreDetailsDiv.appendChild(playerStreakSpan);

            scoreDiv.appendChild(scoreDetailsDiv);
            liveScoresList.appendChild(scoreDiv);
        });
    }

    function renderOptions(data) {
        if(optionsContainer) {
            optionsContainer.innerHTML = ''; // Clear previous options
            const optionIndices = ['a)', 'b)', 'c)', 'd)', 'e)', 'f)'];
            data.options.forEach((optionText, index) => {
                const button = document.createElement('button');
                button.className = 'option-btn w-full text-left p-3 my-1.5 rounded-lg transition-all duration-150 ease-in-out focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-800';
                button.disabled = isGamePaused;

                const indexSpan = document.createElement('span');
                indexSpan.className = 'option-index font-semibold mr-2 px-2 py-1 bg-slate-600 rounded';
                indexSpan.textContent = optionIndices[index % optionIndices.length];
                button.appendChild(indexSpan);

                const textSpan = document.createElement('span');
                textSpan.className = 'option-text';
                textSpan.textContent = optionText;
                button.appendChild(textSpan);

                button.classList.add('bg-slate-700', 'border', 'border-slate-600', 'hover:bg-sky-700', 'hover:border-sky-500', 'text-slate-100');
                button.classList.remove('selected', 'correct', 'incorrect-picked', 'reveal-correct', 'flash-correct', 'ring-sky-300');

                button.addEventListener('click', () => {
                    playSound('click');
                    optionsContainer.querySelectorAll('.option-btn').forEach(btn => {
                        btn.disabled = true;
                        btn.classList.remove('selected', 'ring-4', 'ring-white', 'bg-sky-500', 'border-sky-400');
                        if (!btn.classList.contains('correct') && !btn.classList.contains('incorrect-picked') && !btn.classList.contains('reveal-correct')) {
                            btn.classList.add('bg-slate-700', 'border-slate-600');
                        }
                    });
                    button.classList.add('selected', 'bg-sky-600', 'border-sky-500', 'ring-4', 'ring-white');
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
    }

    // --- Event Listeners for UI ---
    if(createLobbyBtn) createLobbyBtn.addEventListener('click', () => {
        playSound('click');
        const playerName = playerNameInput.value.trim() || `AnonSpieler${Math.floor(Math.random()*1000)}`;
        if (!playerName) {
            displayError(connectErrorMsg, 'Bitte gib einen Spielernamen ein.');
            return;
        }
        socket.emit('createLobby', playerName);
        createLobbyBtn.disabled = true;
        if(joinLobbyBtn) joinLobbyBtn.disabled = true;
        if(connectErrorMsg) connectErrorMsg.textContent = '';
    });

    if(joinLobbyBtn) joinLobbyBtn.addEventListener('click', () => {
        playSound('click');
        const lobbyId = lobbyIdInput.value.trim().toUpperCase();
        const playerName = playerNameInput.value.trim() || `AnonSpieler${Math.floor(Math.random()*1000)}`;

        if (!playerName) {
            displayError(connectErrorMsg, 'Bitte gib einen Spielernamen ein.');
            return;
        }
        if (!lobbyId) {
            displayError(connectErrorMsg, 'Bitte gib eine Lobby ID ein.');
            return;
        }
        socket.emit('joinLobby', { lobbyId, playerName });
        if(createLobbyBtn) createLobbyBtn.disabled = true;
        joinLobbyBtn.disabled = true;
        if(connectErrorMsg) connectErrorMsg.textContent = '';
    });

    if(copyLobbyIdBtn) copyLobbyIdBtn.addEventListener('click', () => {
        playSound('click');
        if (currentLobbyId && displayLobbyId && displayLobbyId.textContent) {
            navigator.clipboard.writeText(displayLobbyId.textContent)
                .then(() => showGlobalNotification(`Lobby ID ${displayLobbyId.textContent} kopiert!`, 'success', 2000))
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
            socket.emit('startGame', { lobbyId: currentLobbyId, categoryKey: currentSelectedCategoryKey });
            startGameLobbyBtn.disabled = true;
            if(startGameErrorMsg) startGameErrorMsg.textContent = '';
        }
    });

    if(leaveLobbyBtn) leaveLobbyBtn.addEventListener('click', () => {
        playSound('click');
        if (socket.connected) socket.disconnect();
        stopMenuMusic();
        if (synth && synth.speaking) synth.cancel();
        showScreen(lobbyConnectContainer);
        currentLobbyId = null;
        currentPlayerId = null;
        isHost = false;
        isGamePaused = false;
        if(gamePausedOverlay) gamePausedOverlay.classList.add('hidden');
        if(createLobbyBtn) createLobbyBtn.disabled = false;
        if(joinLobbyBtn) joinLobbyBtn.disabled = false;
        if(lobbyIdInput) lobbyIdInput.value = '';
        if (!socket.connected) socket.connect();
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
            socket.emit('hostTogglePause', { lobbyId: currentLobbyId });
        }
    }

    if (hostTogglePauseBtn) {
        hostTogglePauseBtn.addEventListener('click', () => {
            playSound('click');
            triggerHostPause();
        });
    }

    if (hostSkipToEndBtn) {
        hostSkipToEndBtn.addEventListener('click', () => {
            playSound('click');
            if (isHost && currentLobbyId && quizContainer && !quizContainer.classList.contains('hidden') && !isGamePaused) {
                if (confirm("Möchtest du das Spiel wirklich für alle beenden? Dies zeigt sofort den Ergebnisbildschirm.")) {
                    socket.emit('hostSkipToEnd', { lobbyId: currentLobbyId });
                    hostSkipToEndBtn.disabled = true;
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
    socket.on('connect', () => {
        console.log('[DEBUG] Connected to server with ID:', socket.id);
        if(loadingOverlay) loadingOverlay.classList.remove('hidden');
        socket.emit('checkExistingSession');
        connectionRetryCount = 0;
        if(createLobbyBtn) createLobbyBtn.disabled = false;
        if(joinLobbyBtn) joinLobbyBtn.disabled = false;
    });

    socket.on('disconnect', (reason) => {
        console.warn('[DEBUG] Vom Server getrennt:', reason);
        if (reason === 'io server disconnect') {
            showGlobalNotification('Vom Server getrennt.', 'error', 5000);
        } else {
            showGlobalNotification('Verbindung verloren. Versuche erneut...', 'error', 5000);
        }
        stopMenuMusic();
        if (synth && synth.speaking) synth.cancel();
        if (isGamePaused && gamePausedOverlay) {
            gamePausedOverlay.classList.add('hidden');
            isGamePaused = false;
        }
        if(createLobbyBtn) createLobbyBtn.disabled = true;
        if(joinLobbyBtn) joinLobbyBtn.disabled = true;
        if(startGameLobbyBtn) startGameLobbyBtn.disabled = true;
    });

    socket.on('connect_error', (err) => {
        console.error('[DEBUG] Connection attempt failed:', err.message);
        connectionRetryCount++;
        if (connectionRetryCount >= MAX_CONNECTION_RETRIES) {
            showGlobalNotification('Verbindung zum Server fehlgeschlagen. Bitte Seite neu laden.', 'error', 10000);
        }
    });

    socket.on('lobbyCreated', (data) => {
        currentLobbyId = data.lobbyId;
        currentPlayerId = data.playerId;
        isHost = true;
        if(displayLobbyId) displayLobbyId.textContent = currentLobbyId;
        updatePlayerList(data.players, data.availableCategories);
        showScreen(lobbyWaitingRoom);
        if(connectErrorMsg) connectErrorMsg.textContent = '';
        playSound('playerJoined');
    });

    socket.on('joinedLobby', (data) => {
        currentLobbyId = data.lobbyId;
        currentPlayerId = data.playerId;
        isHost = data.isHost;
        if(displayLobbyId) displayLobbyId.textContent = currentLobbyId;
        updatePlayerList(data.players, data.availableCategories, data.selectedCategory);
        showScreen(lobbyWaitingRoom);
        if(connectErrorMsg) connectErrorMsg.textContent = '';
        playSound('playerJoined');
    });

    socket.on('playerUpdated', (data) => {
        if (data.lobbyId === currentLobbyId) {
            updatePlayerList(data.players, data.availableCategories, data.selectedCategory);
            if (data.message) showGlobalNotification(data.message, 'info', 2500);
            if (data.playSound) playSound(data.playSound);
        }
    });

    socket.on('lobbyNotFound', (data) => {
        displayError(connectErrorMsg, `Lobby ${data.lobbyId} nicht gefunden oder ist voll.`);
        if(createLobbyBtn) createLobbyBtn.disabled = false;
        if(joinLobbyBtn) joinLobbyBtn.disabled = false;
    });

    socket.on('lobbyError', (data) => {
        displayError(connectErrorMsg, data.message);
        if(createLobbyBtn) createLobbyBtn.disabled = false;
        if(joinLobbyBtn) joinLobbyBtn.disabled = false;
    });

    socket.on('hostChangedCategory', (data) => {
        if (!isHost) {
            currentSelectedCategoryKey = data.categoryKey;
            populateCategorySelector(allAvailableCategoriesCache, data.categoryKey);
            if(currentCategoryText) currentCategoryText.textContent = data.categoryKey || "Kategorie wird gewählt...";
            if(chosenCategoryDisplay && data.categoryKey) chosenCategoryDisplay.classList.remove('hidden');
            else if(chosenCategoryDisplay) chosenCategoryDisplay.classList.add('hidden');
        }
    });

    socket.on('gameStarting', (data) => {
        playSound('gameStart');
    });

    socket.on('newQuestion', (data) => {
        currentQuestionDataCache = data;
        currentQuestionIndex = data.questionIndex;
        questionTimeLimit = data.timeLimit;
        wasTimedOut = false;

        if (synth && synth.speaking) synth.cancel();
        showScreen(quizContainer);

        if(playerInfoQuiz) {
            const playersDataString = quizContainer.dataset.players;
            let me = null;
            if (playersDataString) {
                try {
                    const playersData = JSON.parse(playersDataString);
                    me = playersData.find(p => p.id === currentPlayerId);
                } catch (e) { console.error("Error parsing playersData:", e); }
            }
            if (me) playerInfoQuiz.textContent = `${me.name} (Punkte: ${me.score})`;
            else if (playerNameInput && playerNameInput.value) playerInfoQuiz.textContent = `${playerNameInput.value.trim()} (Punkte: 0)`;
            else playerInfoQuiz.textContent = `Spieler (Punkte: 0)`;
        }

        if(questionCounter) questionCounter.textContent = `Frage ${data.questionIndex + 1} von ${data.totalQuestions}`;
        if(gameCategoryDisplay) gameCategoryDisplay.textContent = `Kategorie: ${data.category}`;
        if(questionText) questionText.textContent = data.question;

        renderOptions(data);

        let questionToSpeak = `Frage ${data.questionIndex + 1}: ${data.question}. Optionen sind: `;
        data.options.forEach((option, index) => {
            questionToSpeak += `${String.fromCharCode(97 + index)}) ${option}. `;
        });
        speak(questionToSpeak, 'de-DE', null, true);
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
            if(timerDisplay) timerDisplay.textContent = isHost ? `Pausiert (${Math.ceil(timeLeft)}s)` : `Pausiert`;
            return;
        }
        if(!timerDisplay) return;

        timerDisplay.textContent = `${timeLeft}s`;
        if (timeLeft <= 5 && timeLeft > 0) {
            timerDisplay.classList.remove('text-amber-400');
            timerDisplay.classList.add('text-red-500', 'animate-pulse');
        } else if (timeLeft === 0) {
            wasTimedOut = true;
            timerDisplay.classList.add('text-red-500');
            timerDisplay.classList.remove('animate-pulse');
            if(waitingForOthersMsg) waitingForOthersMsg.textContent = "Zeit abgelaufen! Antwort wird aufgedeckt...";
            if(optionsContainer) optionsContainer.querySelectorAll('.option-btn').forEach(btn => btn.disabled = true);
        } else {
            timerDisplay.classList.remove('text-red-500', 'animate-pulse');
            timerDisplay.classList.add('text-amber-400');
        }
    });

    socket.on('answerResult', (data) => {
        if (data.isCorrect) {
            playSound('correctAnswer');
            if (data.streak && data.streak > 1) playSound('streak');
        } else {
            playSound('incorrectAnswer');
        }

        const playersDataString = quizContainer.dataset.players;
        if (playersDataString) {
            try {
                const players = JSON.parse(playersDataString);
                const playerIndex = players.findIndex(p => p.id === currentPlayerId);
                if (playerIndex !== -1) {
                    players[playerIndex].score = data.score;
                    players[playerIndex].streak = data.streak;
                    quizContainer.dataset.players = JSON.stringify(players);
                    if (playerInfoQuiz) playerInfoQuiz.textContent = `${players[playerIndex].name} (Punkte: ${players[playerIndex].score})`;
                }
            } catch (e) { console.error("Error updating score in answerResult:", e); }
        }

        if(waitingForOthersMsg) waitingForOthersMsg.textContent = "Warte auf Ergebnisse aller Spieler...";
        if(feedbackText) {
            if (data.isCorrect) {
                feedbackText.textContent = `Richtig! ${data.streak > 1 ? `Streak: ${data.streak}` : ''}`;
                feedbackText.className = 'text-lg font-medium text-green-400 mt-2';
            } else {
                feedbackText.textContent = 'Leider falsch!';
                feedbackText.className = 'text-lg font-medium text-red-400 mt-2';
            }
        }

        if (optionsContainer) {
            optionsContainer.querySelectorAll('.option-btn.selected').forEach(btn => {
                btn.classList.remove('bg-sky-600', 'border-sky-500', 'ring-4', 'ring-white');
                if (data.isCorrect) btn.classList.add('correct', 'bg-green-500', 'border-green-400', 'text-white');
                else btn.classList.add('incorrect-picked', 'bg-red-500', 'border-red-400', 'text-white');
            });
        }
    });

    socket.on('questionOver', (data) => {
        if (wasTimedOut && !isGamePaused) playSound('timesUp');
        wasTimedOut = false;

        if(feedbackText && !feedbackText.textContent) {
            feedbackText.textContent = data.isCorrect ? 'Richtig!' : (data.playerAnswer ? 'Leider falsch.' : 'Keine Antwort gegeben.');
            feedbackText.className = data.isCorrect ? 'text-lg font-medium text-green-400 mt-2' : 'text-lg font-medium text-red-400 mt-2';
        }
        if(waitingForOthersMsg) waitingForOthersMsg.textContent = "Richtige Antwort wird aufgedeckt...";

        if(optionsContainer) {
            optionsContainer.querySelectorAll('.option-btn').forEach(btn => {
                btn.disabled = true;
                btn.classList.remove('selected', 'ring-4', 'ring-white', 'bg-sky-600', 'border-sky-500');

                const btnTextSpan = btn.querySelector('.option-text');
                const btnText = btnTextSpan ? btnTextSpan.textContent.trim() : '';
                const correctAnswerText = data.correctAnswer.trim();

                if (btnText === correctAnswerText) {
                    btn.classList.remove('incorrect-picked', 'bg-red-500', 'border-red-400');
                    btn.classList.add('reveal-correct', 'bg-emerald-500', 'border-emerald-400', 'text-white', 'flash-correct');
                    setTimeout(() => {
                        btn.classList.remove('flash-correct');
                        if (!btn.classList.contains('correct')) {
                            btn.classList.add('bg-emerald-500', 'border-emerald-400', 'text-white');
                        }
                    }, 2000);
                } else if (!btn.classList.contains('incorrect-picked') && !btn.classList.contains('correct')) {
                    btn.classList.add('bg-slate-700', 'border-slate-600', 'opacity-60');
                }
            });
        }
        updateLiveScores(data.scores);

        const textToSpeak = `Die richtige Antwort war: ${data.correctAnswer}`;
        speak(textToSpeak, 'de-DE', () => {
            if(waitingForOthersMsg) waitingForOthersMsg.textContent = "Nächste Frage kommt...";
        }, false);
    });

    socket.on('gameOver', (data) => {
        stopMenuMusic();
        if (synth && synth.speaking) synth.cancel();
        isGamePaused = false;
        if(gamePausedOverlay) gamePausedOverlay.classList.add('hidden');
        if(hostSkipToEndBtn) hostSkipToEndBtn.classList.add('hidden');

        if(finalScoresDiv) {
            finalScoresDiv.innerHTML = ''; // Clear previous scores
            data.finalScores.forEach((player, index) => {
                const scoreEntry = document.createElement('div');
                scoreEntry.className = 'final-score-entry flex justify-between items-center p-3 my-1.5 rounded-lg text-slate-100';

                let medalText = '';
                let medalClass = '';
                if (index === 0) { medalText = '🥇 '; medalClass = 'bg-amber-500/80'; }
                else if (index === 1) { medalText = '🥈 '; medalClass = 'bg-slate-500/80'; }
                else if (index === 2) { medalText = '🥉 '; medalClass = 'bg-orange-700/80'; }
                else { medalClass = 'bg-slate-600/70'; }

                scoreEntry.classList.add(medalClass);
                if (player.id === currentPlayerId) scoreEntry.classList.add('ring-2', 'ring-white');

                const nameSpan = document.createElement('span');
                nameSpan.className = 'font-medium';
                let displayNameText = player.name;
                if (player.originalId === currentPlayerId || player.id === currentPlayerId) {
                    displayNameText += " (Du)";
                }
                nameSpan.textContent = medalText + displayNameText;

                if (player.disconnected) {
                    const statusSpan = document.createElement('span');
                    statusSpan.className = 'text-xs text-red-300 ml-2';
                    statusSpan.textContent = '(Getrennt)';
                    nameSpan.appendChild(statusSpan);
                }
                scoreEntry.appendChild(nameSpan);

                const pointsSpan = document.createElement('span');
                pointsSpan.className = 'font-semibold';
                pointsSpan.textContent = `${player.score} Pkt`;
                scoreEntry.appendChild(pointsSpan);

                finalScoresDiv.appendChild(scoreEntry);
            });
        }

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
        if (synth && synth.speaking) synth.cancel();
        currentLobbyId = data.lobbyId;
        allAvailableCategoriesCache = Array.isArray(data.availableCategories) ? [...data.availableCategories] : [];
        updatePlayerList(data.players, allAvailableCategoriesCache, data.selectedCategory);
        showScreen(lobbyWaitingRoom);
        isGamePaused = false;
        if(gamePausedOverlay) gamePausedOverlay.classList.add('hidden');
        if(hostTogglePauseBtn) hostTogglePauseBtn.textContent = 'Pause Spiel';

        if(lobbyMessage) lobbyMessage.textContent = isHost ? "Spiel zurückgesetzt. Wähle Kategorie und starte!" : "Host hat das Spiel zurückgesetzt. Warte auf Start...";
        if(startGameLobbyBtn && isHost) startGameLobbyBtn.disabled = !categorySelect.value || data.players.length < 1;
        if(playAgainHostBtn) playAgainHostBtn.disabled = false;

        if (submitScoreHallOfFameBtn) submitScoreHallOfFameBtn.classList.add('hidden');
        if (submitScoreStatusMsg) submitScoreStatusMsg.textContent = '';
        startMenuMusic();
    });

    socket.on('gamePaused', (data) => {
        isGamePaused = true;
        if (synth && synth.speaking) synth.cancel();
        if(gamePausedOverlay) gamePausedOverlay.classList.remove('hidden');
        if(pauseResumeMessage) {
            pauseResumeMessage.textContent = isHost ?
                "Spiel pausiert. (Leertaste zum Fortsetzen)" :
                "Das Spiel ist pausiert. Warte auf den Host.";
        }
        if(hostTogglePauseBtn && isHost) {
            hostTogglePauseBtn.textContent = 'Spiel fortsetzen';
            hostTogglePauseBtn.disabled = false;
        }
        if(hostSkipToEndBtn && isHost) hostSkipToEndBtn.disabled = true;

        if(optionsContainer) optionsContainer.querySelectorAll('.option-btn').forEach(btn => btn.disabled = true);
        if(timerDisplay && data.remainingTime !== undefined) {
            timerDisplay.textContent = isHost ? `Pausiert (${Math.ceil(data.remainingTime)}s)` : `Pausiert`;
        } else if(timerDisplay) {
            timerDisplay.textContent = 'Pausiert';
        }
    });

    socket.on('gameResumed', () => {
        isGamePaused = false;
        if(gamePausedOverlay) gamePausedOverlay.classList.add('hidden');

        if(hostTogglePauseBtn && isHost) {
            hostTogglePauseBtn.textContent = 'Pause Spiel';
            hostTogglePauseBtn.disabled = false;
        }
        if(hostSkipToEndBtn && isHost) hostSkipToEndBtn.disabled = false;

        if(optionsContainer) {
            optionsContainer.querySelectorAll('.option-btn').forEach(btn => {
                const isAnsweredOrRevealed = btn.classList.contains('selected') ||
                    btn.classList.contains('correct') ||
                    btn.classList.contains('incorrect-picked') ||
                    btn.classList.contains('reveal-correct');
                if (!isAnsweredOrRevealed) {
                    btn.disabled = false;
                }
            });
        }
    });

    socket.on('gameSkippedToEnd', () => {
        if (synth && synth.speaking) synth.cancel();
        showGlobalNotification('Der Host hat das Spiel beendet und zum Ergebnis übersprungen.', 'info', 4000);
    });

    socket.on('sessionRestored', (data) => {
        currentPlayerId = data.playerId;
        currentLobbyId = data.lobbyId;
        isHost = data.isHost;

        if (data.gameState === 'lobby') {
            if(displayLobbyId) displayLobbyId.textContent = currentLobbyId;
            updatePlayerList(data.players, data.availableCategories, data.selectedCategory);
            showScreen(lobbyWaitingRoom);
        } else if (data.gameState === 'quiz') {
            showScreen(quizContainer);
            if (data.currentQuestion) socket.emit('newQuestion', data.currentQuestion); // Simulate event
            if (data.isPaused) socket.emit('gamePaused', { remainingTime: data.remainingTime }); // Simulate event
        } else if (data.gameState === 'gameOver') {
            socket.emit('gameOver', { finalScores: data.finalScores }); // Simulate event
        } else {
            showScreen(lobbyConnectContainer);
        }
        showGlobalNotification('Sitzung wiederhergestellt!', 'success');
    });

    socket.on('noSessionFound', () => {
        showScreen(lobbyConnectContainer);
        if(loadingOverlay) loadingOverlay.classList.add('hidden');
    });

    // --- Initial setup ---
    showScreen(lobbyConnectContainer);
    updateMuteButtonAppearance();

    const savedPlayerName = localStorage.getItem('quizPlayerName');
    if (savedPlayerName && playerNameInput) {
        playerNameInput.value = savedPlayerName;
    }
    if(playerNameInput) playerNameInput.addEventListener('input', () => {
        if (playerNameInput.value) localStorage.setItem('quizPlayerName', playerNameInput.value);
        else localStorage.removeItem('quizPlayerName');
    });
    if(lobbyIdInput) lobbyIdInput.addEventListener('input', () => {
        lobbyIdInput.value = lobbyIdInput.value.toUpperCase();
    });

    // --- Hall of Fame Score Submission ---
    if (submitScoreHallOfFameBtn) {
        submitScoreHallOfFameBtn.addEventListener('click', () => {
            playSound('click');
            const myPlayerName = playerNameInput.value.trim() || "Anonymous Quizzer";
            let myFinalScore = 0;

            const finalScoresEntries = finalScoresDiv ? finalScoresDiv.querySelectorAll('.final-score-entry') : [];
            finalScoresEntries.forEach(entry => {
                const nameElement = entry.querySelector('span:first-child');
                if (nameElement && nameElement.textContent.includes('(Du)')) {
                    const scoreElement = entry.querySelector('span:last-child');
                    if (scoreElement) myFinalScore = parseInt(scoreElement.textContent, 10) || 0;
                }
            });

            const questionSetName = currentQuestionDataCache ? currentQuestionDataCache.category : "Unbekannte Kategorie";

            if (submitScoreStatusMsg) submitScoreStatusMsg.textContent = 'Sende Punktzahl...';
            submitScoreHallOfFameBtn.disabled = true;

            const authAppUrl = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1' ? 'http://localhost:7000' : 'https://auth.korczewski.de';

            fetch(`${authAppUrl}/api/hall-of-fame/submit`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', },
                body: JSON.stringify({
                    playerName: myPlayerName,
                    questionSet: questionSetName,
                    score: myFinalScore
                }),
                credentials: 'include'
            })
                .then(response => {
                    if (!response.ok) return response.json().then(err => Promise.reject(err));
                    return response.json();
                })
                .then(data => {
                    if (data.message === 'Score submitted successfully!') {
                        if (submitScoreStatusMsg) submitScoreStatusMsg.textContent = 'Punktzahl erfolgreich gesendet!';
                        showGlobalNotification('Punktzahl an Hall of Fame gesendet!', 'success');
                    } else {
                        if (submitScoreStatusMsg) submitScoreStatusMsg.textContent = `Fehler: ${data.message || 'Senden fehlgeschlagen.'}`;
                        showGlobalNotification(`Fehler: ${data.message || 'Senden fehlgeschlagen.'}`, 'error');
                        submitScoreHallOfFameBtn.disabled = false;
                    }
                })
                .catch(error => {
                    console.error('Error submitting score to Hall of Fame:', error);
                    const errorMessage = error.message || error.error || 'Netzwerkfehler oder Server nicht erreichbar.';
                    if (submitScoreStatusMsg) submitScoreStatusMsg.textContent = `Fehler: ${errorMessage}`;
                    showGlobalNotification(`Fehler beim Senden: ${errorMessage}`, 'error');
                    submitScoreHallOfFameBtn.disabled = false;
                });
        });
    }

}); // End of DOMContentLoaded
