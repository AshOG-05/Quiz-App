import React, { useState, useEffect } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import API from "../../api/api";
import Navbar from "../../components/Navbar";

function ManageQuestion() {
  const [searchParams] = useSearchParams();
  const [questions, setQuestions] = useState([]);
  const [quizDetails, setQuizDetails] = useState(null);
  const [editingQuestionId, setEditingQuestionId] = useState(null);
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

  useEffect(() => {
    if (quizId) {
      fetchExistingQuestions();
    }
  }, [quizId]);

  const fetchExistingQuestions = async () => {
    try {
      const res = await API.get(`/quizzes/${quizId}/admin`);
      setQuestions(res.data.questions);
      setQuizDetails(res.data.quiz);
    } catch (err) {
      console.error(err);
      // We might get a 409 if admin attempted it, but usually admins don't attempt
    }
  };

  const handleDeleteQuestion = async (questionId) => {
    if (window.confirm("Are you sure you want to delete this question?")) {
      try {
        await API.delete(`/quizzes/questions/${questionId}`);
        setQuestions(questions.filter(q => q.id !== questionId));
        setSuccess("Question deleted successfully");
        setTimeout(() => setSuccess(""), 3000);
      } catch (err) {
        alert(err.response?.data?.message || "Failed to delete question");
      }
    }
  };

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

  const handleEditClick = (q) => {
    setEditingQuestionId(q.id);
    setQuestionText(q.question_text);
    setOptionA(q.option_a);
    setOptionB(q.option_b);
    setOptionC(q.option_c);
    setOptionD(q.option_d);
    setCorrectAnswer(q.correct_answer || "A");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleCancelEdit = () => {
    setEditingQuestionId(null);
    setQuestionText("");
    setOptionA("");
    setOptionB("");
    setOptionC("");
    setOptionD("");
    setCorrectAnswer("A");
    setError("");
  };

  const handleSubmitQuestion = async (e) => {
    e.preventDefault();

    if (!questionText.trim() || !optionA.trim() || !optionB.trim() || !optionC.trim() || !optionD.trim()) {
      setError("All fields are required");
      return;
    }

    setLoading(true);
    setError("");

    try {
      if (editingQuestionId) {
        await API.put(`/quizzes/questions/${editingQuestionId}`, {
          question_text: questionText,
          option_a: optionA,
          option_b: optionB,
          option_c: optionC,
          option_d: optionD,
          correct_answer: correctAnswer
        });
        setSuccess("Question updated successfully!");
      } else {
        await API.post(`/quizzes/${quizId}/questions`, {
          question_text: questionText,
          option_a: optionA,
          option_b: optionB,
          option_c: optionC,
          option_d: optionD,
          correct_answer: correctAnswer
        });
        setSuccess("Question added successfully!");
      }

      handleCancelEdit();
      
      // Refresh the question list
      fetchExistingQuestions();

      setTimeout(() => {
        setSuccess("");
      }, 3000);
    } catch (err) {
      setError(err.response?.data?.message || "Error saving question");
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
          <h1>Manage Questions</h1>
          <p>{quizDetails ? `Quiz: ${quizDetails.title}` : `Quiz ID: ${quizId}`}</p>
        </div>

        {error && <div className="alert alert-error">{error}</div>}
        {success && <div className="alert alert-success">{success}</div>}

        <div className="content-layout" style={{ display: "flex", gap: "20px", flexWrap: "wrap", alignItems: "flex-start" }}>
          <div className="form-container" style={{ flex: "1 1 400px" }}>
            <h3>{editingQuestionId ? "Edit Question" : "Add New Question"}</h3>
            <form onSubmit={handleSubmitQuestion} style={{ marginTop: "15px" }}>
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
                />
              </div>

              <div className="form-row">
                <div className="form-group" style={{ flex: 1 }}>
                  <label>Option A *</label>
                  <input
                    type="text"
                    placeholder="Option A"
                    value={optionA}
                    onChange={(e) => setOptionA(e.target.value)}
                    required
                  />
                </div>
                <div className="form-group" style={{ flex: 1 }}>
                  <label>Option B *</label>
                  <input
                    type="text"
                    placeholder="Option B"
                    value={optionB}
                    onChange={(e) => setOptionB(e.target.value)}
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
                    onChange={(e) => setOptionC(e.target.value)}
                    required
                  />
                </div>
                <div className="form-group" style={{ flex: 1 }}>
                  <label>Option D *</label>
                  <input
                    type="text"
                    placeholder="Option D"
                    value={optionD}
                    onChange={(e) => setOptionD(e.target.value)}
                    required
                  />
                </div>
              </div>

              <div className="form-group">
                <label>Correct Answer *</label>
                <select
                  value={correctAnswer}
                  onChange={(e) => setCorrectAnswer(e.target.value)}
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
                  {loading ? "Saving..." : (editingQuestionId ? "Update Question" : "Add Question")}
                </button>
                {editingQuestionId ? (
                  <button 
                    type="button" 
                    className="btn btn-secondary"
                    onClick={handleCancelEdit}
                    style={{ flex: 1 }}
                  >
                    Cancel Edit
                  </button>
                ) : (
                  <button 
                    type="button" 
                    className="btn btn-secondary"
                    onClick={() => navigate("/admin")}
                    style={{ flex: 1 }}
                  >
                    Back to Dashboard
                  </button>
                )}
              </div>
            </form>
          </div>

          <div className="existing-questions" style={{ flex: "1 1 400px", background: "white", padding: "30px", borderRadius: "12px", boxShadow: "0 4px 6px -1px rgba(0,0,0,0.1)" }}>
            <h3>Existing Questions ({questions.length})</h3>
            <div style={{ marginTop: "15px", display: "flex", flexDirection: "column", gap: "15px" }}>
              {questions.length === 0 ? (
                <p style={{ color: "#6b7280" }}>No questions added yet.</p>
              ) : (
                questions.map((q, index) => (
                  <div key={q.id} style={{ border: "1px solid #e5e7eb", padding: "15px", borderRadius: "8px" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: "10px" }}>
                      <p style={{ margin: "0 0 10px 0", fontWeight: "600", fontSize: "15px" }}>
                        {index + 1}. {q.question_text}
                      </p>
                      <div style={{ display: "flex", gap: "8px" }}>
                        <button 
                          onClick={() => handleEditClick(q)}
                          className="btn btn-small"
                          style={{ background: "#f59e0b", color: "#fff", border: "none", padding: "4px 8px", fontSize: "12px", flexShrink: 0 }}
                        >
                          Edit
                        </button>
                        <button 
                          onClick={() => handleDeleteQuestion(q.id)}
                          className="btn btn-small btn-danger"
                          style={{ background: "#dc3545", color: "#fff", border: "none", padding: "4px 8px", fontSize: "12px", flexShrink: 0 }}
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                    <ul style={{ margin: 0, paddingLeft: "20px", fontSize: "14px", color: "#4b5563" }}>
                      <li>A) {q.option_a}</li>
                      <li>B) {q.option_b}</li>
                      <li>C) {q.option_c}</li>
                      <li>D) {q.option_d}</li>
                    </ul>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ManageQuestion;