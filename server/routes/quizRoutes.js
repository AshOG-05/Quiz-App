const express = require('express');
const router = express.Router();

const quizController = require('../controllers/quizController');
const authMiddleware = require('../middleware/authMiddleware');

// Protected routes
router.get('/', authMiddleware, quizController.getAllQuizzes);

// ⚠️ IMPORTANT: Named/specific routes MUST come before /:id wildcard
// otherwise Express will match "results" and "user" as an :id param
router.get('/results', authMiddleware, quizController.getAllResults);
router.get('/user/submissions', authMiddleware, quizController.getUserSubmissions);
router.get('/submission/:id', authMiddleware, quizController.getSubmissionDetails);

// Wildcard param routes — must be AFTER specific routes
router.get('/:id', authMiddleware, quizController.getQuizWithQuestions);
router.post('/:id/submit', authMiddleware, quizController.submitQuiz);
router.post('/:id/questions', authMiddleware, quizController.addQuestion);

// Admin: create/delete/edit quiz and questions
router.post('/', authMiddleware, quizController.createQuiz);
router.get('/:id/admin', authMiddleware, quizController.getQuizAdmin);
router.delete('/:id', authMiddleware, quizController.deleteQuiz);
router.patch('/:id/status', authMiddleware, quizController.toggleQuizStatus);
router.delete('/questions/:id', authMiddleware, quizController.deleteQuestion);
router.put('/questions/:id', authMiddleware, quizController.updateQuestion);

module.exports = router;