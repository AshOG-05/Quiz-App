import React, { useEffect, useState } from "react";
import API from "../../api/api";
import Navbar from "../../components/Navbar";

function ViewResults() {
  const [results, setResults] = useState([]);

  useEffect(() => {
    const fetchResults = async () => {
      try {
        const res = await API.get("/quizzes/results");
        setResults(res.data);
      } catch (err) {
        console.error(err);
      }
    };

    fetchResults();
  }, []);

  return (
    <div>
      <Navbar />
      <h2>Student Results</h2>

      <table border="1">
        <thead>
          <tr>
            <th>Name</th>
            <th>Email</th>
            <th>Quiz</th>
            <th>Score</th>
            <th>Total</th>
          </tr>
        </thead>

        <tbody>
          {results.map((r, i) => (
            <tr key={i}>
              <td>{r.name}</td>
              <td>{r.email}</td>
              <td>{r.quiz_title}</td>
              <td>{r.score}</td>
              <td>{r.total_questions}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default ViewResults;