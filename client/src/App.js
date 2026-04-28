import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import "./App.css";

import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import QuizAttempt from "./pages/QuizAttempt";
import Result from "./pages/Result";

import AdminDashboard from "./pages/admin/AdminDashboard";
import CreateQuiz from "./pages/admin/CreateQuiz";
import ManageQuestion from "./pages/admin/ManageQuestion";
import ViewResults from "./pages/admin/ViewResults";
import ProtectedRoute from "./components/ProtectedRoute";



function App() {
  return (
    <Router>
      <Routes>
        <Route path="/admin/results" element={<ViewResults />} />
        <Route path="/" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route
          path="/dashboard"
          element={<ProtectedRoute><Dashboard /></ProtectedRoute>}
        />

        <Route
          path="/quiz/:id"
          element={<ProtectedRoute><QuizAttempt /></ProtectedRoute>}
        />

        <Route
          path="/result/:id"
          element={<ProtectedRoute><Result /></ProtectedRoute>}
        />

        <Route
          path="/admin"
          element={<ProtectedRoute><AdminDashboard /></ProtectedRoute>}
        />
        <Route
          path="/admin/create"
          element={<ProtectedRoute><CreateQuiz /></ProtectedRoute>}
        />
        <Route
          path="/admin/manage"
          element={<ProtectedRoute><ManageQuestion /></ProtectedRoute>}
        />
      </Routes>
    </Router>
  );
}

export default App;