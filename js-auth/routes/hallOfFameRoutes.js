// controllers/hallOfFameController.js
const Score = require('../models/Score');
const User = require('../models/User'); // Optional: if you want to fetch username for userId

// POST /api/hall-of-fame/submit
exports.submitScore = async (req, res) => {
    try {
        const { playerName, questionSet, score } = req.body;

        if (!playerName || !questionSet || score === undefined) {
            return res.status(400).json({ message: 'Missing required fields: playerName, questionSet, score.' });
        }

        if (typeof score !== 'number' || score < 0) {
            return res.status(400).json({ message: 'Score must be a non-negative number.' });
        }

        if (typeof playerName !== 'string' || playerName.trim().length === 0 || playerName.length > 50) {
            return res.status(400).json({ message: 'Player name must be a non-empty string up to 50 characters.' });
        }

        if (typeof questionSet !== 'string' || questionSet.trim().length === 0) {
            return res.status(400).json({ message: 'Question set must be a non-empty string.' });
        }

        // Extract user ID from session if available
        let userId = null;
        if (req.user && req.user._id) {
            // Standard passport authentication
            userId = req.user._id;
        } else if (req.session && req.session.passport && req.session.passport.user) {
            // Session has passport data but req.user not populated
            userId = req.session.passport.user;
        }

        const newScoreEntry = new Score({
            playerName: playerName.trim(),
            questionSet: questionSet.trim(),
            score: parseInt(score, 10), // Ensure score is an integer
            userId: userId // Use the extracted userId
        });

        await newScoreEntry.save();
        res.status(201).json({ message: 'Score submitted successfully!', score: newScoreEntry });

    } catch (error) {
        console.error('Error submitting score:', error);
        if (error.name === 'ValidationError') {
            return res.status(400).json({ message: 'Validation error.', errors: error.errors });
        }
        res.status(500).json({ message: 'Server error while submitting score.' });
    }
};

// GET /api/hall-of-fame/questionsets
exports.getQuestionSets = async (req, res) => {
    try {
        // Find distinct questionSet values from the Score collection
        const questionSets = await Score.distinct('questionSet');
        if (!questionSets) {
            return res.status(404).json({ message: 'No question sets found.' });
        }
        res.status(200).json(questionSets.sort()); // Sort them alphabetically
    } catch (error) {
        console.error('Error fetching question sets:', error);
        res.status(500).json({ message: 'Server error while fetching question sets.' });
    }
};

// GET /api/hall-of-fame/:questionSet
exports.getScoresByQuestionSet = async (req, res) => {
    try {
        const questionSet = req.params.questionSet;
        if (!questionSet) {
            return res.status(400).json({ message: 'Question set parameter is required.' });
        }

        const limit = parseInt(req.query.limit, 10) || 20; // Default to top 20 scores
        const page = parseInt(req.query.page, 10) || 1; // Default to page 1
        const skip = (page - 1) * limit;

        const scores = await Score.find({ questionSet: questionSet })
            .sort({ score: -1, timestamp: 1 }) // Sort by score (desc), then by time (asc for tie-breaking)
            .skip(skip)
            .limit(limit)
            .populate('userId', 'username') // Optionally populate username if userId is present
            .select('playerName score timestamp userId') // Select specific fields
            .lean(); // Use .lean() for faster queries if you don't need Mongoose model instances

        const totalScores = await Score.countDocuments({ questionSet: questionSet });

        if (!scores.length && totalScores === 0) {
            // It's not an error if a question set has no scores yet, return empty array
            return res.status(200).json({
                scores: [],
                currentPage: page,
                totalPages: 0,
                totalScores: 0,
                message: 'No scores found for this question set yet.'
            });
        }

        res.status(200).json({
            scores,
            currentPage: page,
            totalPages: Math.ceil(totalScores / limit),
            totalScores
        });

    } catch (error) {
        console.error(`Error fetching scores for ${req.params.questionSet}:`, error);
        res.status(500).json({ message: 'Server error while fetching scores.' });
    }
};


// GET /hall-of-fame (HTML Page)
exports.getHallOfFamePage = (req, res) => {
    // This controller just renders the page.
    // The actual data fetching for the dropdown and table will be done by client-side JS.
    res.render('hall-of-fame', {
        title: 'Hall of Fame',
        currentUser: req.user // Pass user info for the view
    });
};