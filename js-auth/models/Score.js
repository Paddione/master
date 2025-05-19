// models/Score.js
const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const ScoreSchema = new Schema({
    playerName: {
        type: String,
        required: [true, 'Player name is required'],
        trim: true,
        maxlength: [50, 'Player name cannot exceed 50 characters']
    },
    questionSet: {
        type: String,
        required: [true, 'Question set name is required'],
        trim: true,
        index: true // Add index for faster querying by questionSet
    },
    score: {
        type: Number,
        required: [true, 'Score value is required'],
        min: [0, 'Score must be a non-negative number']
    },
    userId: {
        type: Schema.Types.ObjectId,
        ref: 'User', // Reference to User model
        default: null // Will be null for guest users
    },
    timestamp: {
        type: Date,
        default: Date.now,
        index: true // Add index for sorting by timestamp
    }
}, {
    timestamps: {
        createdAt: 'createdAt',
        updatedAt: 'updatedAt'
    },
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
});

// Compound index for faster leaderboard queries
ScoreSchema.index({ questionSet: 1, score: -1, timestamp: 1 });

// Virtual for determining if score was submitted by a registered user
ScoreSchema.virtual('isRegisteredUser').get(function() {
    return this.userId !== null;
});

// Virtual to return display name (can be extended if you add username lookup)
ScoreSchema.virtual('displayName').get(function() {
    return this.playerName;
});

// Static method to get top scores for a question set
ScoreSchema.statics.getTopScores = async function(questionSet, limit = 20) {
    return this.find({ questionSet })
        .sort({ score: -1, timestamp: 1 })
        .limit(limit)
        .populate('userId', 'username')
        .lean();
};

// Static method to get a user's personal best score
ScoreSchema.statics.getPersonalBest = async function(userId, questionSet) {
    if (!userId) return null;

    return this.findOne({
        userId,
        questionSet
    })
        .sort({ score: -1, timestamp: 1 })
        .lean();
};

// Method to check if score qualifies for leaderboard
ScoreSchema.methods.qualifiesForLeaderboard = async function(limit = 20) {
    const lowestTopScore = await this.constructor.findOne({
        questionSet: this.questionSet
    })
        .sort({ score: 1 })
        .limit(1)
        .lean();

    if (!lowestTopScore) return true; // No scores yet, so this qualifies

    const topScoresCount = await this.constructor.countDocuments({
        questionSet: this.questionSet
    });

    return topScoresCount < limit || this.score > lowestTopScore.score;
};

const Score = mongoose.model('Score', ScoreSchema);

module.exports = Score;