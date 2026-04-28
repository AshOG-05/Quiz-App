// src/components/Navbar.js
import React from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Navbar = () => {
  const { user, logout, isAdmin } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const isActive = (path) => location.pathname === path ? 'active' : '';

  return (
    <nav className="navbar">
      <div className="nav-brand">
        <span>⚡ QuizPulse</span>
      </div>

      <div className="nav-links">
        {isAdmin ? (
          <>
            <Link to="/admin" className={isActive('/admin')}>Dashboard</Link>
            <Link to="/admin/create" className={isActive('/admin/create')}>Create Quiz</Link>
            <Link to="/admin/manage" className={isActive('/admin/manage')}>Manage Questions</Link>
          </>
        ) : (
          <>
            <Link to="/dashboard" className={isActive('/dashboard')}>Quizzes</Link>
          </>
        )}
      </div>

      <div className="nav-user">
        <span>
          <span className={`role-badge ${user?.role}`}>{user?.role || 'User'}</span>
          {user?.name || 'Guest'}
        </span>
        <button onClick={handleLogout} className="btn btn-outline btn-small">Logout</button>
      </div>
    </nav>
  );
};

export default Navbar;