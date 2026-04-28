import React, { useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import API from "../../api/api";
import Navbar from "../../components/Navbar";

function ManageQuestion() {
  const [searchParams] = useSearchParams();
  const [questionText, setQuestionText] = useState("");
  const [optionA, setOptionA] = useState("");
  const [optionB, setOptionB] = useState("");
  const [optionC, setOptionC] = useState("");
  const [optionD, setOptionD] = useState("");
  const [correctAnswer, setCorrectAnswer] = useState("A");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const quizId = searchParams.get("quizId");

  if (!quizId) {
    return (
      <div className="page">
        <Navbar />
        <div className="page-content">
          <div className="alert alert-error">
            No quiz selected. <a href="/admin">Go back to dashboard.</a>
          </div>
        </div>
      </div>
    );
  }

  const handleAddQuestion = async (e) => {
    e.preventDefault();

    if (!questionText.trim() || !optionA.trim() || !optionB.trim() || !optionC.trim() || !optionD.trim()) {
      setError("All fields are required");
      return;
    }

    setLoading(true);
    setError("");

    try {
      await API.post(`/quizzes/${quizId}/questions`, {
        question_text: questionText,
        option_a: optionA,
        option_b: optionB,
        option_c: optionC,
        option_d: optionD,
        correct_answer: correctAnswer
      });

      setSuccess("Question added successfully!");
      setQuestionText("");
      setOptionA("");
      setOptionB("");
      setOptionC("");
      setOptionD("");
      setCorrectAnswer("A");

      setTimeout(() => {
        navigate("/admin");
      }, 1500);
    } catch (err) {
      setError(err.response?.data?.message || "Error adding question");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page">
      <Navbar />
      <div className="page-content">
        <div className="admin-header">
          <h1>Add Question to Quiz</h1>
          <p>Quiz ID: {quizId}</p>
        </div>

        <div className="form-container">
          {error && <div className="alert alert-error">{error}</div>}
          {success && <div className="alert alert-success">{success}</div>}

          <form onSubmit={handleAddQuestion}>
            <div className="form-group">
              <label>Question Text *</label>
              <textarea
                placeholder="Enter your question here"
                value={questionText}
                onChange={(e) => {
                  setQuestionText(e.target.value);
                  setError("");
                }}
                required
                rows="4"
                autoFocus
              />
            </div>

            <div className="form-row">
              <div className="form-group" style={{ flex: 1 }}>
                <label>Option A *</label>
                <input
                  type="text"
                  placeholder="Option A"
                  value={optionA}
                  onChange={(e) => {
                    setOptionA(e.target.value);
                    setError("");
                  }}
                  required
                />
              </div>
              <div className="form-group" style={{ flex: 1 }}>
                <label>Option B *</label>
                <input
                  type="text"
                  placeholder="Option B"
                  value={optionB}
                  onChange={(e) => {
                    setOptionB(e.target.value);
                    setError("");
                  }}
                  required
                />
              </div>
            </div>

            <div className="form-row">
              <div className="form-group" style={{ flex: 1 }}>
                <label>Option C *</label>
                <input
                  type="text"
                  placeholder="Option C"
                  value={optionC}
                  onChange={(e) => {
                    setOptionC(e.target.value);
                    setError("");
                  }}
                  required
                />
              </div>
              <div className="form-group" style={{ flex: 1 }}>
                <label>Option D *</label>
                <input
                  type="text"
                  placeholder="Option D"
                  value={optionD}
                  onChange={(e) => {
                    setOptionD(e.target.value);
                    setError("");
                  }}
                  required
                />
              </div>
            </div>

            <div className="form-group">
              <label>Correct Answer *</label>
              <select
                value={correctAnswer}
                onChange={(e) => {
                  setCorrectAnswer(e.target.value);
                  setError("");
                }}
                required
              >
                <option value="A">A</option>
                <option value="B">B</option>
                <option value="C">C</option>
                <option value="D">D</option>
              </select>
            </div>

            <div style={{ display: "flex", gap: "10px" }}>
              <button 
                type="submit" 
                className="btn btn-primary"
                disabled={loading}
                style={{ flex: 1 }}
              >
                {loading ? "Adding..." : "Add Question"}
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

export default ManageQuestion;