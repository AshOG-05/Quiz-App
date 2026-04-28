const express = require('express');
const router = express.Router();

const quizController = require('../controllers/quizController');
const authMiddleware = require('../middleware/authMiddleware');

// Public routes
router.get('/', quizController.getAllQuizzes);

// Protected routes
router.get('/:id', authMiddleware, quizController.getQuizWithQuestions);
router.post('/:id/submit', authMiddleware, quizController.submitQuiz);
router.post('/', authMiddleware, quizController.createQuiz);
router.post('/:id/questions', authMiddleware, quizController.addQuestion);
router.get('/user/submissions', authMiddleware, quizController.getUserSubmissions);

// 🔥 FIXED: use controller reference correctly
router.get('/results', authMiddleware, quizController.getAllResults);

module.exports = router;