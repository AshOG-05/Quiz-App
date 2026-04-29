import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import API from "../../api/api";
import Navbar from "../../components/Navbar";

function AdminDashboard() {
  const [quizzes, setQuizzes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchQuizzes = async () => {
      try {
        const res = await API.get("/quizzes");
        setQuizzes(res.data);
      } catch (err) {
        setError("Failed to load quizzes");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchQuizzes();
  }, []);

  const handleDeleteQuiz = async (quizId) => {
    if (window.confirm("Are you sure you want to delete this quiz? All associated questions and submissions will also be deleted.")) {
      try {
        await API.delete(`/quizzes/${quizId}`);
        setQuizzes(quizzes.filter(q => q.id !== quizId));
      } catch (err) {
        alert(err.response?.data?.message || "Failed to delete quiz");
      }
    }
  };

  return (
    <div className="page">
      <Navbar />
      <div className="page-content">
        <div className="admin-header">
          <h1>Admin Dashboard</h1>
          <p>Manage your quizzes and questions</p>
        </div>

        <div style={{ marginBottom: "30px", display: "flex", gap: "12px", flexWrap: "wrap" }}>
          <Link to="/admin/create" className="btn btn-success">
            + Create New Quiz
          </Link>
          <Link to="/admin/results" className="btn btn-primary">
            📊 View All Results
          </Link>
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
            <div className="empty-icon">📋</div>
            <h3>No Quizzes Yet</h3>
            <p>Create your first quiz to get started!</p>
            <Link to="/admin/create" className="btn btn-primary" style={{ marginTop: "20px" }}>
              Create Quiz
            </Link>
          </div>
        )}

        {!loading && quizzes.length > 0 && (
          <div className="table-container">
            <table>
              <thead>
                <tr>
                  <th>Title</th>
                  <th>Questions</th>
                  <th>Created By</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {quizzes.map((quiz) => (
                  <tr key={quiz.id}>
                    <td>{quiz.title}</td>
                    <td>{quiz.question_count || 0}</td>
                    <td>{quiz.created_by_name || "You"}</td>
                    <td>
                      <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
                        <Link
                          to={`/admin/manage?quizId=${quiz.id}`}
                          className="btn btn-primary btn-small"
                        >
                          Manage
                        </Link>
                        <Link
                          to="/admin/results"
                          className="btn btn-small"
                          style={{ background: "#6c757d", color: "#fff" }}
                        >
                          Results
                        </Link>
                        <button
                          onClick={() => handleDeleteQuiz(quiz.id)}
                          className="btn btn-small btn-danger"
                          style={{ background: "#dc3545", color: "#fff", border: "none" }}
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

export default AdminDashboard;