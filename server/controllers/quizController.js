const db = require('../config/db');

// Get all quizzes
exports.getAllQuizzes = (req, res) => {
  const query = `
    SELECT q.id, q.title, q.description, q.time_limit, q.created_by, u.name as created_by_name,
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
      db.query('SELECT id, title, description, time_limit FROM quizzes WHERE id = ?', [id], (err, quizzes) => {
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
  const { title, description, time_limit } = req.body;
  const adminId = req.user.id;

  if (!title) {
    return res.status(400).json({ message: 'Quiz title is required' });
  }

  db.query(
    'INSERT INTO quizzes (title, description, time_limit, created_by) VALUES (?, ?, ?, ?)',
    [title, description || null, time_limit || null, adminId],
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
      s.id AS submission_id,
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

// Delete quiz (admin only)
exports.deleteQuiz = (req, res) => {
  const { id } = req.params;

  db.query('SELECT created_by FROM quizzes WHERE id = ?', [id], (err, quizzes) => {
    if (err) {
      console.error('Get quiz error:', err);
      return res.status(500).json({ message: 'Database error', error: err.message });
    }

    if (!quizzes || quizzes.length === 0) {
      return res.status(404).json({ message: 'Quiz not found' });
    }

    if (quizzes[0].created_by !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized to delete this quiz' });
    }

    db.query('DELETE FROM quizzes WHERE id = ?', [id], (err) => {
      if (err) {
        console.error('Delete quiz error:', err);
        return res.status(500).json({ message: 'Failed to delete quiz', error: err.message });
      }

      res.json({ message: 'Quiz deleted successfully' });
    });
  });
};

// Delete question (admin only)
exports.deleteQuestion = (req, res) => {
  const { id } = req.params;

  db.query(
    'SELECT q.created_by FROM questions qn JOIN quizzes q ON qn.quiz_id = q.id WHERE qn.id = ?',
    [id],
    (err, results) => {
      if (err) {
        console.error('Get question error:', err);
        return res.status(500).json({ message: 'Database error', error: err.message });
      }

      if (!results || results.length === 0) {
        return res.status(404).json({ message: 'Question not found' });
      }

      if (results[0].created_by !== req.user.id) {
        return res.status(403).json({ message: 'Not authorized to delete this question' });
      }

      db.query('DELETE FROM questions WHERE id = ?', [id], (err) => {
        if (err) {
          console.error('Delete question error:', err);
          return res.status(500).json({ message: 'Failed to delete question', error: err.message });
        }

        res.json({ message: 'Question deleted successfully' });
      });
    }
  );
};

// Update question (admin only)
exports.updateQuestion = (req, res) => {
  const { id } = req.params;
  const { question_text, option_a, option_b, option_c, option_d, correct_answer } = req.body;

  if (!question_text || !option_a || !option_b || !option_c || !option_d || !correct_answer) {
    return res.status(400).json({ message: 'All fields are required' });
  }

  db.query(
    'SELECT q.created_by FROM questions qn JOIN quizzes q ON qn.quiz_id = q.id WHERE qn.id = ?',
    [id],
    (err, results) => {
      if (err) {
        console.error('Get question error:', err);
        return res.status(500).json({ message: 'Database error', error: err.message });
      }

      if (!results || results.length === 0) {
        return res.status(404).json({ message: 'Question not found' });
      }

      if (results[0].created_by !== req.user.id) {
        return res.status(403).json({ message: 'Not authorized to edit this question' });
      }

      db.query(
        'UPDATE questions SET question_text = ?, option_a = ?, option_b = ?, option_c = ?, option_d = ?, correct_answer = ? WHERE id = ?',
        [question_text, option_a, option_b, option_c, option_d, correct_answer, id],
        (err) => {
          if (err) {
            console.error('Update question error:', err);
            return res.status(500).json({ message: 'Failed to update question', error: err.message });
          }

          res.json({ message: 'Question updated successfully' });
        }
      );
    }
  );
};

// Get quiz with full questions (admin only)
exports.getQuizAdmin = (req, res) => {
  const { id } = req.params;

  db.query('SELECT id, title, description, time_limit, created_by FROM quizzes WHERE id = ?', [id], (err, quizzes) => {
    if (err) {
      console.error('Get quiz error:', err);
      return res.status(500).json({ message: 'Failed to fetch quiz', error: err.message });
    }

    if (!quizzes || quizzes.length === 0) {
      return res.status(404).json({ message: 'Quiz not found' });
    }

    if (quizzes[0].created_by !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    db.query(
      'SELECT id, question_text, option_a, option_b, option_c, option_d, correct_answer FROM questions WHERE quiz_id = ? ORDER BY id',
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
};

// Get detailed submission info (for student review)
exports.getSubmissionDetails = (req, res) => {
  const { id } = req.params; // submission id
  const userId = req.user.id;

  // 1. Get submission
  db.query(
    'SELECT s.id, s.quiz_id, s.score, s.total_questions, s.submitted_at, q.title, q.description FROM submissions s JOIN quizzes q ON s.quiz_id = q.id WHERE s.id = ?',
    [id],
    (err, submissions) => {
      if (err) return res.status(500).json({ message: 'Database error', error: err.message });
      if (!submissions || submissions.length === 0) return res.status(404).json({ message: 'Submission not found' });
      
      const submission = submissions[0];

      // Security check: only the user who took it (or admin) can view
      // We will just do a simple check. If req.user.role === 'admin' they can view, else must match user_id
      // For now, let's also fetch user_id from submission and check
      db.query('SELECT user_id FROM submissions WHERE id = ?', [id], (err, subUserId) => {
        if (err) return res.status(500).json({ message: 'Database error' });
        if (subUserId[0].user_id !== userId && req.user.role !== 'admin') {
           return res.status(403).json({ message: 'Not authorized to view this submission' });
        }

        // 2. Get questions and answers
        db.query(
          `SELECT q.id, q.question_text, q.option_a, q.option_b, q.option_c, q.option_d, q.correct_answer,
                  a.user_answer, a.is_correct
           FROM questions q
           LEFT JOIN answers a ON q.id = a.question_id AND a.submission_id = ?
           WHERE q.quiz_id = ?
           ORDER BY q.id`,
          [id, submission.quiz_id],
          (err, questionsAndAnswers) => {
             if (err) return res.status(500).json({ message: 'Failed to fetch details' });

             res.json({
               submission: {
                 id: submission.id,
                 quiz_id: submission.quiz_id,
                 score: submission.score,
                 total_questions: submission.total_questions,
                 submitted_at: submission.submitted_at,
                 quiz_title: submission.title,
                 quiz_description: submission.description
               },
               answers: questionsAndAnswers || []
             });
          }
        );
      });
    }
  );
};