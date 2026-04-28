const db = require('../config/db');

// Get all quizzes
exports.getAllQuizzes = (req, res) => {
  const query = `
    SELECT q.id, q.title, q.description, q.created_by, u.name as created_by_name,
           COUNT(qn.id) as question_count
    FROM quizzes q
    LEFT JOIN users u ON q.created_by = u.id
    LEFT JOIN questions qn ON q.id = qn.quiz_id
    GROUP BY q.id
    ORDER BY q.created_at DESC
  `;

  db.query(query, (err, quizzes) => {
    if (err) {
      console.error('Get quizzes error:', err);
      return res.status(500).json({ message: 'Failed to fetch quizzes', error: err.message });
    }
    res.json(quizzes);
  });
};

// Get quiz with questions
exports.getQuizWithQuestions = (req, res) => {
  const { id } = req.params;
  const userId = req.user.id;

  // Check if user already submitted
  db.query(
    'SELECT id FROM submissions WHERE quiz_id = ? AND user_id = ?',
    [id, userId],
    (err, submissions) => {
      if (err) {
        console.error('Check submission error:', err);
        return res.status(500).json({ message: 'Database error', error: err.message });
      }

      if (submissions && submissions.length > 0) {
        return res.status(409).json({ message: 'You have already submitted this quiz' });
      }

      // Get quiz
      db.query('SELECT id, title, description FROM quizzes WHERE id = ?', [id], (err, quizzes) => {
        if (err) {
          console.error('Get quiz error:', err);
          return res.status(500).json({ message: 'Failed to fetch quiz', error: err.message });
        }

        if (!quizzes || quizzes.length === 0) {
          return res.status(404).json({ message: 'Quiz not found' });
        }

        // Get questions (without correct answers)
        db.query(
          'SELECT id, question_text, option_a, option_b, option_c, option_d FROM questions WHERE quiz_id = ? ORDER BY id',
          [id],
          (err, questions) => {
            if (err) {
              console.error('Get questions error:', err);
              return res.status(500).json({ message: 'Failed to fetch questions', error: err.message });
            }

            res.json({
              quiz: quizzes[0],
              questions: questions || [],
            });
          }
        );
      });
    }
  );
};

// Submit quiz and auto-evaluate
exports.submitQuiz = (req, res) => {
  const { id } = req.params;
  const { answers } = req.body;
  const userId = req.user.id;

  // Check if already submitted
  db.query(
    'SELECT id FROM submissions WHERE quiz_id = ? AND user_id = ?',
    [id, userId],
    (err, existing) => {
      if (err) {
        console.error('Check existing error:', err);
        return res.status(500).json({ message: 'Database error', error: err.message });
      }

      if (existing && existing.length > 0) {
        return res.status(409).json({ message: 'You have already submitted this quiz' });
      }

      // Get all questions for the quiz
      db.query(
        'SELECT id, correct_answer FROM questions WHERE quiz_id = ?',
        [id],
        (err, questions) => {
          if (err) {
            console.error('Get questions error:', err);
            return res.status(500).json({ message: 'Failed to fetch questions', error: err.message });
          }

          if (!questions || questions.length === 0) {
            return res.status(404).json({ message: 'Quiz not found' });
          }

          // Calculate score
          let score = 0;
          questions.forEach((q) => {
            if (answers[q.id] === q.correct_answer) {
              score++;
            }
          });

          // Create submission
          db.query(
            'INSERT INTO submissions (quiz_id, user_id, score, total_questions) VALUES (?, ?, ?, ?)',
            [id, userId, score, questions.length],
            (err, result) => {
              if (err) {
                console.error('Create submission error:', err);
                return res.status(500).json({ message: 'Failed to submit quiz', error: err.message });
              }

              const submissionId = result.insertId;
              let answersInserted = 0;

              // Store answers
              Object.entries(answers).forEach(([questionId, userAnswer]) => {
                const question = questions.find((q) => q.id == questionId);
                const isCorrect = question && userAnswer === question.correct_answer;

                db.query(
                  'INSERT INTO answers (submission_id, question_id, user_answer, is_correct) VALUES (?, ?, ?, ?)',
                  [submissionId, questionId, userAnswer, isCorrect ? 1 : 0],
                  (err) => {
                    if (err) {
                      console.error('Insert answer error:', err);
                    }
                    answersInserted++;
                    
                    // Once all answers are stored, send response
                    if (answersInserted === Object.keys(answers).length) {
                      res.json({
                        message: 'Quiz submitted successfully',
                        score,
                        total: questions.length,
                        submissionId,
                      });
                    }
                  }
                );
              });
            }
          );
        }
      );
    }
  );
};

// Create quiz (admin only)
exports.createQuiz = (req, res) => {
  const { title, description } = req.body;
  const adminId = req.user.id;

  if (!title) {
    return res.status(400).json({ message: 'Quiz title is required' });
  }

  db.query(
    'INSERT INTO quizzes (title, description, created_by) VALUES (?, ?, ?)',
    [title, description || null, adminId],
    (err, result) => {
      if (err) {
        console.error('Create quiz error:', err);
        return res.status(500).json({ message: 'Failed to create quiz', error: err.message });
      }

      res.status(201).json({
        message: 'Quiz created successfully',
        quizId: result.insertId,
      });
    }
  );
};

// Add question to quiz (admin only)
exports.addQuestion = (req, res) => {
  const { id } = req.params;
  const { question_text, option_a, option_b, option_c, option_d, correct_answer } = req.body;

  if (!question_text || !option_a || !option_b || !option_c || !option_d || !correct_answer) {
    return res.status(400).json({ message: 'All fields are required' });
  }

  // Verify quiz exists and belongs to user
  db.query('SELECT created_by FROM quizzes WHERE id = ?', [id], (err, quizzes) => {
    if (err) {
      console.error('Get quiz error:', err);
      return res.status(500).json({ message: 'Database error', error: err.message });
    }

    if (!quizzes || quizzes.length === 0 || quizzes[0].created_by !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized to add questions to this quiz' });
    }

    db.query(
      'INSERT INTO questions (quiz_id, question_text, option_a, option_b, option_c, option_d, correct_answer) VALUES (?, ?, ?, ?, ?, ?, ?)',
      [id, question_text, option_a, option_b, option_c, option_d, correct_answer],
      (err, result) => {
        if (err) {
          console.error('Add question error:', err);
          return res.status(500).json({ message: 'Failed to add question', error: err.message });
        }

        res.status(201).json({
          message: 'Question added successfully',
          questionId: result.insertId,
        });
      }
    );
  });
};

// Get user's submission history
exports.getUserSubmissions = (req, res) => {
  const userId = req.user.id;

  db.query(
    `SELECT s.id, q.title, s.score, s.total_questions, s.submitted_at
     FROM submissions s
     JOIN quizzes q ON s.quiz_id = q.id
     WHERE s.user_id = ?
     ORDER BY s.submitted_at DESC`,
    [userId],
    (err, submissions) => {
      if (err) {
        console.error('Get submissions error:', err);
        return res.status(500).json({ message: 'Failed to fetch submission history', error: err.message });
      }

      res.json(submissions || []);
    }
  );
};
// Get all student results (admin)
exports.getAllResults = (req, res) => {
  const query = `
    SELECT 
      u.name,
      u.email,
      q.title AS quiz_title,
      s.score,
      s.total_questions,
      s.submitted_at
    FROM submissions s
    JOIN users u ON s.user_id = u.id
    JOIN quizzes q ON s.quiz_id = q.id
    ORDER BY s.submitted_at DESC
  `;

  db.query(query, (err, results) => {
    if (err) {
      console.error('Get results error:', err);
      return res.status(500).json({ message: 'Failed to fetch results', error: err.message });
    }

    res.json(results);
  });
};