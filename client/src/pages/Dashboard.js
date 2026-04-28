// src/pages/Dashboard.js - Student quiz listing page
import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import API from '../api/api';
import Navbar from '../components/Navbar';
import { useAuth } from '../context/AuthContext';

const Dashboard = () => {
  const [quizzes, setQuizzes] = useState([]);
  const [loading, setLoading] = useState(true);
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
    fetchQuizzes();
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
                <div className="quiz-meta">
                  <span>👤 {quiz.created_by_name || 'Admin'}</span>
                </div>
                <Link to={`/quiz/${quiz.id}`} className="btn btn-primary btn-full">
                  Start Quiz →
                </Link>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;