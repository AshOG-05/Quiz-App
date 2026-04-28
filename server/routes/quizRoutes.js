const express = require('express');
const router = express.Router();

const quizController = require('../controllers/quizController');
const authMiddleware = require('../middleware/authMiddleware');

// Public routes
router.get('/', quizController.getAllQuizzes);

// ⚠️ IMPORTANT: Named/specific routes MUST come before /:id wildcard
// otherwise Express will match "results" and "user" as an :id param
router.get('/results', authMiddleware, quizController.getAllResults);
router.get('/user/submissions', authMiddleware, quizController.getUserSubmissions);

// Wildcard param routes — must be AFTER specific routes
router.get('/:id', authMiddleware, quizController.getQuizWithQuestions);
router.post('/:id/submit', authMiddleware, quizController.submitQuiz);
router.post('/:id/questions', authMiddleware, quizController.addQuestion);

// Admin: create quiz
router.post('/', authMiddleware, quizController.createQuiz);

module.exports = router;