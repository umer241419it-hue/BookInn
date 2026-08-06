import React, { useState, useRef } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { ChevronDown, User, Shield, LogOut } from 'lucide-react';
import { useOutsideClick } from '../hooks/useOutsideClick';

const ProfileDropdown = ({ user, isAdmin, logout }) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);
  const navigate = useNavigate();

  useOutsideClick(dropdownRef, () => setIsOpen(false), isOpen);

  const toggleDropdown = () => {
    setIsOpen((prev) => !prev);
  };

  const handleLogout = () => {
    setIsOpen(false);
    logout();
    navigate('/');
  };

  const handleItemClick = () => {
    setIsOpen(false);
  };

  const initial = user?.name ? user.name.charAt(0).toUpperCase() : 'U';

  return (
    <div className="profile-dropdown-container" ref={dropdownRef}>
      <button
        type="button"
        className={`profile-trigger ${isOpen ? 'active' : ''}`}
        onClick={toggleDropdown}
        aria-expanded={isOpen}
        aria-haspopup="true"
        aria-label="User account menu"
      >
        <div className="avatar-circle">
          {user?.avatarUrl ? (
            <img src={user.avatarUrl} alt={user.name} className="avatar-img" />
          ) : (
            <span className="avatar-initial">{initial}</span>
          )}
        </div>
        <span className="profile-user-name">{user?.name || 'User'}</span>
        <ChevronDown size={16} className={`dropdown-caret ${isOpen ? 'open' : ''}`} aria-hidden="true" />
      </button>

      {isOpen && (
        <div className="profile-dropdown-menu" role="menu">
          {/* Header Info */}
          <div className="dropdown-user-header">
            <div className="avatar-circle large">
              {user?.avatarUrl ? (
                <img src={user.avatarUrl} alt={user.name} className="avatar-img" />
              ) : (
                <span className="avatar-initial">{initial}</span>
              )}
            </div>
            <div className="header-details">
              <p className="user-display-name">{user?.name}</p>
              <p className="user-display-email">{user?.email}</p>
              {isAdmin && (
                <span className="role-badge admin">
                  <Shield size={12} aria-hidden="true" style={{ verticalAlign: '-1px', marginRight: '3px' }} />
                  Admin
                </span>
              )}
            </div>
          </div>

          <div className="dropdown-divider" />

          {/* Navigation Links */}
          <div className="dropdown-section">
            <NavLink
              to="/profile"
              className={({ isActive }) => `dropdown-item ${isActive ? 'active' : ''}`}
              onClick={handleItemClick}
              role="menuitem"
            >
              <User size={18} aria-hidden="true" /> Profile
            </NavLink>


          </div>

          <div className="dropdown-divider" />

          {/* Logout Action */}
          <div className="dropdown-section">
            <button
              type="button"
              className="dropdown-item logout-item"
              onClick={handleLogout}
              role="menuitem"
            >
              <LogOut size={18} aria-hidden="true" /> Log Out
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProfileDropdown;
