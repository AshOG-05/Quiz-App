import React, { useEffect, useState } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import Navbar from "../components/Navbar";

function Result() {
  const location = useLocation();
  const navigate = useNavigate();
  const { id } = useParams();
  const [result, setResult] = useState(null);

  useEffect(() => {
    const state = location.state;
    if (state && state.score !== undefined) {
      setResult(state);
    }
  }, [location.state]);

  const percentage = result ? Math.round((result.score / result.total) * 100) : 0;

  if (!result) {
    return (
      <div className="page">
        <Navbar />
        <div className="page-content">
          <div className="loading-state">
            <div className="spinner" />
            <p>Loading result...</p>
          </div>
        </div>
      </div>
    );
  }

  const isPassed = percentage >= 60;

  return (
    <div className="page">
      <Navbar />
      <div className="page-content">
        <div className="result-container">
          <div className="result-icon">
            {isPassed ? "🎉" : "💪"}
          </div>

          <h1>{isPassed ? "Congratulations!" : "Keep Learning!"}</h1>

          <div className="result-box">
            <h2>Your Score</h2>
            <div className="result-score">
              {result.score}/{result.total}
            </div>
            <div className="result-percentage">
              {percentage}% Correct
            </div>
            
            <div className={`result-message ${isPassed ? "pass" : "fail"}`}>
              {isPassed 
                ? "🌟 Great job! You passed the quiz!" 
                : "📚 Keep practicing to improve your score!"}
            </div>
          </div>

          <div style={{ display: 'flex', gap: '10px', justifyContent: 'center' }}>
            <button 
              onClick={() => navigate("/dashboard")}
              className="btn btn-secondary"
              style={{ minWidth: "150px" }}
            >
              Go to Dashboard
            </button>
            {result.submissionId && (
              <button 
                onClick={() => navigate(`/submission/${result.submissionId}`)}
                className="btn btn-primary"
                style={{ minWidth: "150px" }}
              >
                Review Answers
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default Result;