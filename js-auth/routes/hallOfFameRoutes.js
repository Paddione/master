// routes/hallOfFameRoutes.js
const express = require('express');
const router = express.Router();
const hallOfFameController = require('../controllers/hallOfFameController');
const { ensureAuthenticated } = require('../middlewares/authMiddleware'); // To protect the HTML page

// --- API Routes ---
// Endpoint for the quiz game client to submit scores
// No ensureAuthenticated here, as guests might submit scores,
// but we check req.user in the controller to link authenticated users.
router.post('/api/hall-of-fame/submit', hallOfFameController.submitScore);

// Endpoint to get all unique question set names that have scores
router.get('/api/hall-of-fame/questionsets', hallOfFameController.getQuestionSets);

// Endpoint to get scores for a specific question set
router.get('/api/hall-of-fame/:questionSet', hallOfFameController.getScoresByQuestionSet);

// --- HTML Page Route ---
// Page to display the Hall of Fame (requires user to be logged in to view)
router.get('/hall-of-fame', ensureAuthenticated, hallOfFameController.getHallOfFamePage);

module.exports = router;  // THIS LINE IS CRUCIAL