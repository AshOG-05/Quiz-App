import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import API from "../../api/api";
import Navbar from "../../components/Navbar";

function CreateQuiz() {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [timeLimit, setTimeLimit] = useState("");
  const [targetBranch, setTargetBranch] = useState("");
  const [targetSection, setTargetSection] = useState("");
  const [passcode, setPasscode] = useState("");
  const [startTime, setStartTime] = useState("");
  const [endTime, setEndTime] = useState("");
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
      if (targetBranch) payload.target_branch = targetBranch;
      if (targetSection) payload.target_section = targetSection;
      if (passcode) payload.passcode = passcode;
      if (startTime) payload.start_time = startTime;
      if (endTime) payload.end_time = endTime;
      
      const res = await API.post("/quizzes", payload);
      setSuccess("Quiz created successfully!");
      setTitle("");
      setDescription("");
      setTimeLimit("");
      setTargetBranch("");
      setTargetSection("");
      setPasscode("");
      setStartTime("");
      setEndTime("");
      
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

            <div className="form-group">
              <label>Target Branch / Course (Optional)</label>
              <input
                type="text"
                placeholder="e.g., Computer Science, Mechanical (Leave blank for all)"
                value={targetBranch}
                onChange={(e) => {
                  setTargetBranch(e.target.value);
                  setError("");
                }}
              />
            </div>

            <div className="form-group">
              <label>Target Section (Optional)</label>
              <input
                type="text"
                placeholder="e.g., A, B (Leave blank for all)"
                value={targetSection}
                onChange={(e) => {
                  setTargetSection(e.target.value);
                  setError("");
                }}
              />
            </div>

            <div className="form-group">
              <label>Quiz Passcode (Optional)</label>
              <input
                type="text"
                placeholder="Set a passcode to restrict access"
                value={passcode}
                onChange={(e) => {
                  setPasscode(e.target.value);
                  setError("");
                }}
              />
            </div>

            <div style={{ display: "flex", gap: "15px" }}>
              <div className="form-group" style={{ flex: 1 }}>
                <label>Start Time (Optional)</label>
                <input
                  type="datetime-local"
                  value={startTime}
                  onChange={(e) => {
                    setStartTime(e.target.value);
                    setError("");
                  }}
                />
              </div>
              <div className="form-group" style={{ flex: 1 }}>
                <label>End Time (Optional)</label>
                <input
                  type="datetime-local"
                  value={endTime}
                  onChange={(e) => {
                    setEndTime(e.target.value);
                    setError("");
                  }}
                />
              </div>
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