import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import API from "../api/api";
import Navbar from "../components/Navbar";

function SubmissionDetails() {
  const { id } = useParams();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchDetails = async () => {
      try {
        const res = await API.get(`/quizzes/submission/${id}`);
        setData(res.data);
      } catch (err) {
        setError("Failed to load submission details.");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchDetails();
  }, [id]);

  if (loading) {
    return (
      <div className="page">
        <Navbar />
        <div className="loading-state">
          <div className="spinner" />
          <p>Loading details...</p>
        </div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="page">
        <Navbar />
        <div className="page-content">
          <div className="alert alert-error">{error || "Not found"}</div>
          <Link to="/dashboard" className="btn btn-primary">Back to Dashboard</Link>
        </div>
      </div>
    );
  }

  const { submission, answers } = data;
  const percentage = Math.round((submission.score / submission.total_questions) * 100);

  return (
    <div className="page">
      <Navbar />
      <div className="page-content">
        <div className="page-header" style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div>
            <h1>{submission.quiz_title} - Review</h1>
            <p className="subtitle">Submitted on: {new Date(submission.submitted_at).toLocaleString()}</p>
          </div>
          <div style={{ textAlign: "right" }}>
            <h2 style={{ margin: 0, color: percentage >= 60 ? "var(--success)" : "var(--danger)" }}>
              {submission.score} / {submission.total_questions} ({percentage}%)
            </h2>
          </div>
        </div>

        <div className="questions-review">
          {answers.map((q, idx) => (
            <div key={q.id} className="question-card" style={{ marginBottom: "20px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <div className="question-number">Question {idx + 1}</div>
                <div>
                  {q.is_correct ? (
                    <span style={{ color: "var(--success)", fontWeight: "bold" }}>✓ Correct</span>
                  ) : (
                    <span style={{ color: "var(--danger)", fontWeight: "bold" }}>✗ Incorrect</span>
                  )}
                </div>
              </div>
              <h3 className="question-text" style={{ marginTop: "10px", fontSize: "1.2rem" }}>{q.question_text}</h3>
              
              <div className="options-grid" style={{ marginTop: "15px" }}>
                {["A", "B", "C", "D"].map(opt => {
                  const optText = q[`option_${opt.toLowerCase()}`];
                  let className = "option-btn";
                  let style = { cursor: "default", opacity: 0.8 };

                  if (opt === q.correct_answer) {
                    className += " selected";
                    style = { ...style, borderColor: "var(--success)", backgroundColor: "rgba(34,197,94,0.1)", color: "var(--success)" };
                  } else if (opt === q.user_answer && q.user_answer !== q.correct_answer) {
                    className += " selected";
                    style = { ...style, borderColor: "var(--danger)", backgroundColor: "rgba(239,68,68,0.1)", color: "var(--danger)" };
                  }

                  return (
                    <div key={opt} className={className} style={style}>
                      <span className="option-label">{opt}</span>
                      <span className="option-text">{optText}</span>
                      {opt === q.correct_answer && <span style={{marginLeft: "auto"}}>✓</span>}
                      {opt === q.user_answer && q.user_answer !== q.correct_answer && <span style={{marginLeft: "auto"}}>✗ (Your Answer)</span>}
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>

        <div style={{ marginTop: "30px", textAlign: "center" }}>
          <Link to="/dashboard" className="btn btn-primary">Back to Dashboard</Link>
        </div>
      </div>
    </div>
  );
}

export default SubmissionDetails;
