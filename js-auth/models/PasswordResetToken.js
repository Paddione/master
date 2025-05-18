// models/PasswordResetToken.js
const mongoose = require('mongoose');
const { v4: uuidv4 } = require('uuid');

const PasswordResetTokenSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: 'User'
    },
    token: {
        type: String,
        required: true,
        unique: true,
        default: () => uuidv4() // Generate a UUID for the token
    },
    expiresAt: {
        type: Date,
        required: true,
        // Set token to expire in 1 hour by default
        default: () => Date.now() + 3600000 // 1 hour in milliseconds
    }
});

// Index for auto-deletion of expired tokens by MongoDB (TTL index)
PasswordResetTokenSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

const PasswordResetToken = mongoose.model('PasswordResetToken', PasswordResetTokenSchema);
module.exports = PasswordResetToken;