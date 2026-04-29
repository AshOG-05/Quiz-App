// src/pages/QuizAttempt.js - MCQ quiz taking interface
import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import API from '../api/api';
import Navbar from '../components/Navbar';
import { useAuth } from '../context/AuthContext';

const QuizAttempt = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  
  const searchParams = new URLSearchParams(window.location.search);
  const passcode = searchParams.get('passcode') || '';

  const getStorageKey = () => `quiz_draft_${id}_${user?.id || 'guest'}`;

  const [quiz, setQuiz] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [answers, setAnswers] = useState({}); // { questionId: 'A' | 'B' | 'C' | 'D' }
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [timeLeft, setTimeLeft] = useState(null);

  useEffect(() => {
    const fetchQuiz = async () => {
      try {
        const url = passcode ? `/quizzes/${id}?passcode=${encodeURIComponent(passcode)}` : `/quizzes/${id}`;
        const res = await API.get(url);
        setQuiz(res.data.quiz);
        
        // Randomize questions order
        const shuffledQuestions = [...res.data.questions].sort(() => Math.random() - 0.5);
        setQuestions(shuffledQuestions);

        // Load saved state from localStorage
        const savedStateStr = localStorage.getItem(getStorageKey());
        if (savedStateStr) {
          const savedState = JSON.parse(savedStateStr);
          setAnswers(savedState.answers || {});
          setCurrentIndex(savedState.currentIndex || 0);
          if (savedState.timeLeft !== undefined && savedState.timeLeft !== null) {
            setTimeLeft(savedState.timeLeft);
          } else if (res.data.quiz.time_limit) {
            setTimeLeft(res.data.quiz.time_limit * 60);
          }
        } else if (res.data.quiz.time_limit) {
          setTimeLeft(res.data.quiz.time_limit * 60);
        }
      } catch (err) {
        if (err.response?.status === 409) {
          setError('You have already submitted this quiz.');
        } else {
          setError('Failed to load quiz. Please try again.');
        }
      } finally {
        setLoading(false);
      }
    };
    fetchQuiz();
  }, [id, user]);

  // Save to localStorage when state changes
  useEffect(() => {
    if (!loading && quiz) {
      const stateToSave = {
        answers,
        currentIndex,
        timeLeft
      };
      localStorage.setItem(getStorageKey(), JSON.stringify(stateToSave));
    }
  }, [answers, currentIndex, timeLeft, loading, quiz]);

  useEffect(() => {
    if (timeLeft === null || submitting) return;
    
    if (timeLeft <= 0) {
      handleSubmit(); // auto submit
      return;
    }
    
    const timer = setInterval(() => {
      setTimeLeft(prev => prev - 1);
    }, 1000);
    
    return () => clearInterval(timer);
  }, [timeLeft, submitting]);

  // Anti-cheating: Tab switching detection
  useEffect(() => {
    let warnings = 0;
    
    const handleVisibilityChange = () => {
      if (document.hidden && !submitting && questions.length > 0) {
        warnings++;
        if (warnings >= 3) {
           alert("Anti-Cheating System: You have switched tabs too many times. Your quiz is being automatically submitted.");
           handleSubmit();
        } else {
           alert(`Warning ${warnings} of 3: Please stay on this tab while taking the quiz. Switching tabs is considered suspicious behavior.`);
        }
      }
    };
    
    document.addEventListener("visibilitychange", handleVisibilityChange);
    return () => document.removeEventListener("visibilitychange", handleVisibilityChange);
  }, [submitting, questions.length, answers]); // Depend on answers so handleSubmit has the latest state

  const formatTime = (seconds) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  const handleAnswer = (questionId, option) => {
    setAnswers((prev) => ({ ...prev, [questionId]: option }));
  };

  const handleSubmit = async () => {
    const unanswered = questions.filter((q) => !answers[q.id]);
    if (unanswered.length > 0) {
      const confirmed = window.confirm(
        `You have ${unanswered.length} unanswered question(s). Submit anyway?`
      );
      if (!confirmed) return;
    }

    setSubmitting(true);
    try {
      const res = await API.post(`/quizzes/${id}/submit`, { answers });
      // Clear auto-save draft
      localStorage.removeItem(getStorageKey());
      navigate(`/result/${id}`, { state: res.data });
    } catch (err) {
      if (err.response?.status === 409) {
        setError('You have already submitted this quiz.');
        localStorage.removeItem(getStorageKey());
      } else {
        setError(err.response?.data?.message || 'Submission failed. Please try again.');
      }
      setSubmitting(false);
    }
  };

  const current = questions[currentIndex];
  const answeredCount = Object.keys(answers).length;
  const progress = questions.length ? (answeredCount / questions.length) * 100 : 0;

  if (loading) return (
    <div className="page"><Navbar />
      <div className="loading-state"><div className="spinner" /><p>Loading quiz...</p></div>
    </div>
  );

  if (error) return (
    <div className="page"><Navbar />
      <div className="page-content"><div className="alert alert-error">{error}</div></div>
    </div>
  );

  return (
    <div className="page">
      <Navbar />
      <div className="page-content quiz-attempt-page">
        {/* Quiz Header */}
        <div className="quiz-attempt-header">
          <div>
            <h1>{quiz?.title}</h1>
            <p>{answeredCount} of {questions.length} answered</p>
          </div>
          <div style={{ display: 'flex', gap: '15px', alignItems: 'center' }}>
            {timeLeft !== null && (
              <div className={`timer ${timeLeft < 60 ? 'timer-warning' : ''}`} style={{ fontWeight: 'bold', fontSize: '1.2rem', color: timeLeft < 60 ? 'var(--danger)' : 'inherit' }}>
                ⏱ {formatTime(timeLeft)}
              </div>
            )}
            <div className="progress-ring">
              <span>{Math.round(progress)}%</span>
            </div>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="progress-bar-container">
          <div className="progress-bar" style={{ width: `${progress}%` }} />
        </div>

        {/* Question Navigation Dots */}
        <div className="question-dots">
          {questions.map((q, i) => (
            <button
              key={q.id}
              className={`dot ${i === currentIndex ? 'active' : ''} ${answers[q.id] ? 'answered' : ''}`}
              onClick={() => setCurrentIndex(i)}
              title={`Question ${i + 1}`}
            >
              {i + 1}
            </button>
          ))}
        </div>

        {/* Question Card */}
        {current && (
          <div className="question-card">
            <div className="question-number">Question {currentIndex + 1} of {questions.length}</div>
            <h2 className="question-text">{current.question_text}</h2>

            <div className="options-grid">
              {['A', 'B', 'C', 'D'].map((opt) => {
                const optText = current[`option_${opt.toLowerCase()}`];
                const isSelected = answers[current.id] === opt;
                return (
                  <button
                    key={opt}
                    className={`option-btn ${isSelected ? 'selected' : ''}`}
                    onClick={() => handleAnswer(current.id, opt)}
                  >
                    <span className="option-label">{opt}</span>
                    <span className="option-text">{optText}</span>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Navigation */}
        <div className="quiz-navigation">
          <button
            className="btn btn-outline"
            onClick={() => setCurrentIndex((i) => Math.max(0, i - 1))}
            disabled={currentIndex === 0}
          >
            ← Previous
          </button>

          {currentIndex < questions.length - 1 ? (
            <button
              className="btn btn-primary"
              onClick={() => setCurrentIndex((i) => i + 1)}
            >
              Next →
            </button>
          ) : (
            <button
              className="btn btn-success"
              onClick={handleSubmit}
              disabled={submitting}
            >
              {submitting ? <span className="spinner-sm" /> : '✓ Submit Quiz'}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default QuizAttempt;