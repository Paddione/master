/**
 * index.js
 *
 * This is the main entry point for the Quiz Server application.
 * It simply requires and runs the main server logic defined in server_1.js.
 *
 * To start the server, you would typically run:
 * node index.js
 *
 * Make sure your package.json's "main" field points to this file if you are using
 * npm start and it's configured to run the main file.
 * Alternatively, you could rename server_1.js to index.js if that's preferred
 * and your setup expects index.js directly.
 */

// Log that the index.js file is being executed
console.log('[index.js] Starting Quiz Server...');

// Require the main server logic file.
// This will execute the code within server_1.js, effectively starting the server.
// Ensure server_1.js is in the same directory or provide the correct path.
require('./server.js');

// You can add any other top-level initializations here if needed,
// though typically all application logic is encapsulated within the required module.
console.log('[index.js] Quiz Server setup initiated from server.js.');
