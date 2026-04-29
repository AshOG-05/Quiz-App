import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import API from "../../api/api";
import Navbar from "../../components/Navbar";

function CreateQuiz() {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [timeLimit, setTimeLimit] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!title.trim()) {
      setError("Quiz title is required");
      return;
    }

    setLoading(true);
    setError("");
    try {
      const payload = { title, description };
      if (timeLimit) payload.time_limit = parseInt(timeLimit);
      
      const res = await API.post("/quizzes", payload);
      setSuccess("Quiz created successfully!");
      setTitle("");
      setDescription("");
      setTimeLimit("");
      
      setTimeout(() => {
        navigate("/admin");
      }, 1500);
    } catch (err) {
      setError(err.response?.data?.message || "Error creating quiz");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page">
      <Navbar />
      <div className="page-content">
        <div className="admin-header">
          <h1>Create New Quiz</h1>
          <p>Add a new quiz to the system</p>
        </div>

        <div className="form-container">
          {error && <div className="alert alert-error">{error}</div>}
          {success && <div className="alert alert-success">{success}</div>}

          <form onSubmit={handleCreate}>
            <div className="form-group">
              <label>Quiz Title *</label>
              <input
                type="text"
                placeholder="e.g., JavaScript Basics"
                value={title}
                onChange={(e) => {
                  setTitle(e.target.value);
                  setError("");
                }}
                required
                autoFocus
              />
            </div>

            <div className="form-group">
              <label>Description</label>
              <textarea
                placeholder="Describe what this quiz is about"
                value={description}
                onChange={(e) => {
                  setDescription(e.target.value);
                  setError("");
                }}
              />
            </div>

            <div className="form-group">
              <label>Time Limit (Minutes)</label>
              <input
                type="number"
                placeholder="e.g., 30 (Leave blank for no limit)"
                value={timeLimit}
                onChange={(e) => {
                  setTimeLimit(e.target.value);
                  setError("");
                }}
                min="1"
              />
            </div>

            <div style={{ display: "flex", gap: "10px" }}>
              <button 
                type="submit" 
                className="btn btn-primary"
                disabled={loading}
                style={{ flex: 1 }}
              >
                {loading ? <span className="spinner-sm" /> : "Create Quiz"}
              </button>
              <button 
                type="button" 
                className="btn btn-secondary"
                onClick={() => navigate("/admin")}
                style={{ flex: 1 }}
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

export default CreateQuiz;