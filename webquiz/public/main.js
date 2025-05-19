/**
 * main.js - Main entry point for the Quiz Application
 * This file handles initialization and core application setup
 */

// Wait for the DOM to be fully loaded before initializing
document.addEventListener('DOMContentLoaded', () => {
    console.log('Quiz Application Initializing...');

    // Handle base path for assets when running under /game
    const basePath = window.CONFIG?.BASE_PATH || '/game/';

    // Initialize the UI
    initializeUI();

    // Load application config
    loadConfiguration();

    // Check authentication status
    checkAuthStatus();

    // Initialize Socket.IO connection
    initializeSocketConnection();

    console.log('Quiz Application Initialized Successfully');
});

/**
 * Initialize the user interface components
 */
function initializeUI() {
    // Set up event listeners for UI elements
    setupEventListeners();

    // Update the UI based on the current state
    updateUI();

    // Show the initial screen
    showInitialScreen();
}

/**
 * Set up event listeners for UI elements
 */
function setupEventListeners() {
    // Add click listeners to buttons
    document.querySelectorAll('button').forEach(button => {
        button.addEventListener('click', handleButtonClick);
    });

    // Add sound control listeners
    setupSoundControls();

    // Handle window resize events
    window.addEventListener('resize', handleResize);
}

/**
 * Handle button clicks based on their id or class
 */
function handleButtonClick(event) {
    // Get the button that was clicked
    const button = event.currentTarget;

    // Play click sound
    playSound('click');

    // Handle different buttons based on id or class
    if (button.id === 'mute-btn') {
        toggleMute();
    }
    // Add more button handlers as needed
}

/**
 * Set up sound controls
 */
function setupSoundControls() {
    // Initialize sound settings from localStorage
    const isMuted = localStorage.getItem('quizMuted') === 'true';

    // Update UI to reflect current mute state
    updateMuteButtonUI(isMuted);
}

/**
 * Update UI based on mute state
 */
function updateMuteButtonUI(isMuted) {
    const muteButton = document.getElementById('mute-btn');
    if (muteButton) {
        muteButton.textContent = isMuted ? 'Unmute' : 'Mute';

        if (isMuted) {
            muteButton.classList.remove('bg-sky-600', 'hover:bg-sky-700');
            muteButton.classList.add('bg-red-600', 'hover:bg-red-700');
        } else {
            muteButton.classList.remove('bg-red-600', 'hover:bg-red-700');
            muteButton.classList.add('bg-sky-600', 'hover:bg-sky-700');
        }
    }
}

/**
 * Handle window resize events
 */
function handleResize() {
    // Update UI elements based on window size
    // Implement responsive design adjustments if needed
}

/**
 * Show the initial screen based on application state
 */
function showInitialScreen() {
    // Show the loading overlay initially
    const loadingOverlay = document.getElementById('loading-overlay');
    if (loadingOverlay) {
        loadingOverlay.classList.remove('hidden');
    }

    // Then show the appropriate screen after initialization
    showScreen(document.getElementById('lobby-connect-container'));
}

/**
 * Show a specific screen and hide others
 */
function showScreen(screenElement) {
    if (!screenElement) return;

    // Hide all screens
    [
        'loading-overlay',
        'lobby-connect-container',
        'lobby-waiting-room',
        'quiz-container',
        'game-over-container'
    ].forEach(id => {
        const element = document.getElementById(id);
        if (element) {
            element.classList.add('hidden');
        }
    });

    // Show the requested screen
    screenElement.classList.remove('hidden');

    // Play appropriate music based on screen
    if (screenElement.id === 'quiz-container') {
        stopMenuMusic();
    } else {
        startMenuMusic();
    }
}

/**
 * Load and apply application configuration
 */
function loadConfiguration() {
    // Check for server-provided configuration
    if (!window.CONFIG) {
        // Create a default CONFIG object if not provided by the server
        window.CONFIG = {
            AUTH_APP_URL: window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'
                ? 'http://localhost:7000'
                : 'https://auth.korczewski.de',
            SESSION_NAME: 'quiz_auth_session',
            SESSION_PATH: '/',
            SESSION_DOMAIN: window.location.hostname.includes('.') ? '.' + window.location.hostname.split('.').slice(-2).join('.') : window.location.hostname,
            SESSION_SAME_SITE: 'lax',
            BASE_PATH: '/game/'
        };
        console.log('[DEBUG] Using default CONFIG:', window.CONFIG);
    } else {
        console.log('[DEBUG] Using server-provided CONFIG:', window.CONFIG);
    }
}

/**
 * Check the user's authentication status
 */
function checkAuthStatus() {
    fetch('/game/api/user', {
        credentials: 'include' // Important to include cookies
    })
        .then(response => response.json())
        .then(data => {
            console.log('[DEBUG] Auth status check:', data);

            if (data.isAuthenticated) {
                console.log('[DEBUG] User is authenticated with ID:', data.id);
                // Update UI for authenticated users
                updateUIForAuthenticatedUser(data);
            } else if (data.isGuest) {
                console.log('[DEBUG] User is a guest with ID:', data.id);
                // Update UI for guest users
                updateUIForGuestUser(data);
            } else {
                console.log('[DEBUG] User is not authenticated or a guest');
                // Update UI for anonymous users
                updateUIForAnonymousUser();
            }
        })
        .catch(error => {
            console.error('Error checking authentication status:', error);
        });
}

/**
 * Update UI for authenticated users
 */
function updateUIForAuthenticatedUser(userData) {
    // Implement any UI changes needed for authenticated users
}

/**
 * Update UI for guest users
 */
function updateUIForGuestUser(userData) {
    // Implement any UI changes needed for guest users
}

/**
 * Update UI for anonymous users
 */
function updateUIForAnonymousUser() {
    // Implement any UI changes needed for anonymous users
}

/**
 * Initialize Socket.IO connection
 */
function initializeSocketConnection() {
    // Socket.IO connection is handled in script.js
    // This function is a placeholder for any additional setup needed
}

/**
 * Play a sound effect
 */
function playSound(soundName) {
    // This function is implemented in script.js
    // This is a placeholder to maintain function reference
}

/**
 * Start menu music
 */
function startMenuMusic() {
    // This function is implemented in script.js
    // This is a placeholder to maintain function reference
}

/**
 * Stop menu music
 */
function stopMenuMusic() {
    // This function is implemented in script.js
    // This is a placeholder to maintain function reference
}

/**
 * Toggle mute state
 */
function toggleMute() {
    // This function is implemented in script.js
    // This is a placeholder to maintain function reference
}

// Expose functions that need to be accessible from other scripts
window.showScreen = showScreen;
window.playSound = playSound;
window.startMenuMusic = startMenuMusic;
window.stopMenuMusic = stopMenuMusic;
window.toggleMute = toggleMute;