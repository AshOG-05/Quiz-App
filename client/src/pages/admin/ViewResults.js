import React, { useEffect, useState } from "react";
import API from "../../api/api";
import Navbar from "../../components/Navbar";

function ViewResults() {
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchResults = async () => {
      try {
        const res = await API.get("/quizzes/results");
        setResults(res.data);
      } catch (err) {
        console.error("Failed to load results:", err);
        setError("Failed to load results. Please try again.");
      } finally {
        setLoading(false);
      }
    };

    fetchResults();
  }, []);

  return (
    <div className="page">
      <Navbar />
      <div className="page-content">
        <div className="admin-header">
          <h1>Student Results</h1>
          <p>All quiz submissions from students</p>
        </div>

        {loading && (
          <div className="loading-state">
            <div className="spinner" />
            <p>Loading results...</p>
          </div>
        )}

        {error && <div className="alert alert-error">{error}</div>}

        {!loading && !error && results.length === 0 && (
          <div className="empty-state">
            <div className="empty-icon">📊</div>
            <h3>No Results Yet</h3>
            <p>No students have submitted any quizzes yet.</p>
          </div>
        )}

        {!loading && results.length > 0 && (
          <div className="table-container">
            <table>
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Email</th>
                  <th>Quiz</th>
                  <th>Score</th>
                  <th>Total</th>
                  <th>Percentage</th>
                  <th>Submitted At</th>
                </tr>
              </thead>
              <tbody>
                {results.map((r, i) => {
                  const pct = Math.round((r.score / r.total_questions) * 100);
                  return (
                    <tr key={i}>
                      <td>{r.name}</td>
                      <td>{r.email}</td>
                      <td>{r.quiz_title}</td>
                      <td>{r.score}</td>
                      <td>{r.total_questions}</td>
                      <td>
                        <span
                          style={{
                            color: pct >= 60 ? "var(--success)" : "var(--danger)",
                            fontWeight: 600,
                          }}
                        >
                          {pct}%
                        </span>
                      </td>
                      <td>{new Date(r.submitted_at).toLocaleString()}</td>
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
}

export default ViewResults;