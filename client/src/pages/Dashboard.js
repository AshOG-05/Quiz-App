// src/pages/Dashboard.js - Student quiz listing page
import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import API from '../api/api';
import Navbar from '../components/Navbar';
import { useAuth } from '../context/AuthContext';

const Dashboard = () => {
  const [quizzes, setQuizzes] = useState([]);
  const [submissions, setSubmissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submissionsLoading, setSubmissionsLoading] = useState(true);
  const [error, setError] = useState('');
  const { user } = useAuth();

  useEffect(() => {
    const fetchQuizzes = async () => {
      try {
        const res = await API.get('/quizzes');
        setQuizzes(res.data);
      } catch (err) {
        setError('Failed to load quizzes. Please refresh the page.');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    const fetchSubmissions = async () => {
      try {
        const res = await API.get('/quizzes/user/submissions');
        setSubmissions(res.data);
      } catch (err) {
        console.error('Failed to load submission history:', err);
      } finally {
        setSubmissionsLoading(false);
      }
    };

    fetchQuizzes();
    fetchSubmissions();
  }, []);

  return (
    <div className="page">
      <Navbar />
      <div className="page-content">
        <div className="page-header">
          <div>
            <h1>Available Quizzes</h1>
            <p className="subtitle">Welcome back, {user?.name}! Choose a quiz to start.</p>
          </div>
        </div>

        {loading && (
          <div className="loading-state">
            <div className="spinner" />
            <p>Loading quizzes...</p>
          </div>
        )}

        {error && <div className="alert alert-error">{error}</div>}

        {!loading && quizzes.length === 0 && (
          <div className="empty-state">
            <div className="empty-icon">📚</div>
            <h3>No Quizzes Available</h3>
            <p>Check back later — your instructor hasn't posted any quizzes yet.</p>
          </div>
        )}

        {!loading && quizzes.length > 0 && (
          <div className="quiz-grid">
            {quizzes.map((quiz) => (
              <div key={quiz.id} className="quiz-card">
                <div className="quiz-card-header">
                  <div className="quiz-icon">📝</div>
                  <span className="question-count">{quiz.question_count || 0} Questions</span>
                </div>
                <h3>{quiz.title}</h3>
                <p className="quiz-description">{quiz.description || 'No description provided.'}</p>
                <div className="quiz-meta" style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span>👤 {quiz.created_by_name || 'Admin'}</span>
                  {quiz.time_limit && <span>⏱ {quiz.time_limit} mins</span>}
                </div>
                <Link to={`/quiz/${quiz.id}`} className="btn btn-primary btn-full">
                  Start Quiz →
                </Link>
              </div>
            ))}
          </div>
        )}

        {/* My Results Section */}
        <div className="page-header" style={{ marginTop: '48px' }}>
          <div>
            <h1>My Results</h1>
            <p className="subtitle">Your quiz submission history</p>
          </div>
        </div>

        {submissionsLoading && (
          <div className="loading-state">
            <div className="spinner" />
            <p>Loading your results...</p>
          </div>
        )}

        {!submissionsLoading && submissions.length === 0 && (
          <div className="empty-state">
            <div className="empty-icon">📊</div>
            <h3>No Results Yet</h3>
            <p>Complete a quiz above to see your score here.</p>
          </div>
        )}

        {!submissionsLoading && submissions.length > 0 && (
          <div className="table-container">
            <table>
              <thead>
                <tr>
                  <th>Quiz</th>
                  <th>Score</th>
                  <th>Total</th>
                  <th>Percentage</th>
                  <th>Submitted</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {submissions.map((s, i) => {
                  const pct = Math.round((s.score / s.total_questions) * 100);
                  return (
                    <tr key={i}>
                      <td>{s.title}</td>
                      <td>{s.score}</td>
                      <td>{s.total_questions}</td>
                      <td>
                        <span style={{
                          color: pct >= 60 ? 'var(--success)' : 'var(--danger)',
                          fontWeight: 600
                        }}>
                          {pct}%
                        </span>
                      </td>
                      <td>{new Date(s.submitted_at).toLocaleString()}</td>
                      <td>
                        <Link to={`/submission/${s.id}`} className="btn btn-small btn-primary">Review</Link>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;