import React, { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Logo from './Logo';

const Sidebar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const { user, isLoggedIn, isAdmin, logout } = useAuth();
  const navigate = useNavigate();

  const toggleSidebar = () => {
    setIsOpen((prev) => !prev);
  };

  const closeSidebar = () => {
    setIsOpen(false);
  };

  const handleLogoutClick = () => {
    logout();
    closeSidebar();
    navigate('/');
  };

  return (
    <>
      {/* Mobile Header / Hamburger */}
      <div className="mobile-header">
        <button
          className="hamburger-btn"
          onClick={toggleSidebar}
          aria-label="Toggle Navigation"
        >
          <span className="hamburger-bar"></span>
          <span className="hamburger-bar"></span>
          <span className="hamburger-bar"></span>
        </button>
        <Logo size="small" variant="light" />
      </div>

      {/* Overlay for mobile drawer */}
      {isOpen && <div className="sidebar-overlay" onClick={closeSidebar}></div>}

      {/* Navigation Sidebar */}
      <aside className={`sidebar ${isOpen ? 'open' : ''}`}>
        <div className="sidebar-brand">
          <Logo size="medium" variant="light" />
        </div>

        {isLoggedIn && user && (
          <div className="user-profile-summary">
            <span className="user-avatar">👤</span>
            <div className="user-info">
              <p className="user-name">{user.name}</p>
              <p className="user-role-badge">{user.role}</p>
            </div>
          </div>
        )}

        <nav className="sidebar-nav">
          {isAdmin ? (
            /* Admin-Only Navigation Links */
            <>
              <NavLink
                to="/admin"
                end
                className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
                onClick={closeSidebar}
              >
                <span className="nav-icon">👑</span> All Bookings (Admin)
              </NavLink>

              <button type="button" className="nav-link btn-logout" onClick={handleLogoutClick}>
                <span className="nav-icon">🚪</span> Log Out
              </button>
            </>
          ) : (
            /* Guest and Regular User Navigation Links */
            <>
              <NavLink
                to="/"
                end
                className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
                onClick={closeSidebar}
              >
                <span className="nav-icon">🔍</span> Search Rooms
              </NavLink>

              {isLoggedIn ? (
                <>
                  <NavLink
                    to="/bookings"
                    className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
                    onClick={closeSidebar}
                  >
                    <span className="nav-icon">📋</span> My Bookings
                  </NavLink>

                  <button type="button" className="nav-link btn-logout" onClick={handleLogoutClick}>
                    <span className="nav-icon">🚪</span> Log Out
                  </button>
                </>
              ) : (
                <>
                  <NavLink
                    to="/login"
                    className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
                    onClick={closeSidebar}
                  >
                    <span className="nav-icon">🔑</span> Log In
                  </NavLink>

                  <NavLink
                    to="/signup"
                    className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
                    onClick={closeSidebar}
                  >
                    <span className="nav-icon">✨</span> Sign Up
                  </NavLink>
                </>
              )}
            </>
          )}
        </nav>
      </aside>
    </>
  );
};

export default Sidebar;
