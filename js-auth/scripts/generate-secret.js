// generate-secret.js
const crypto = require('crypto');

// Generates a 32-byte random string, encoded in base64 (results in ~44 characters)
// Or use 'hex' for a longer string with a-f and 0-9 characters (~64 characters)
const generateSecret = (bytes = 32, encoding = 'base64') => {
    return crypto.randomBytes(bytes).toString(encoding);
};

console.log("Generated SESSION_SECRET candidate:", generateSecret());
console.log("Generated CSRF_SECRET candidate:", generateSecret());
// For hex encoding (longer, different character set):
// console.log("Hex encoded secret candidate:", generateSecret(32, 'hex'));