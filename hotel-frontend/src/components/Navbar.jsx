import React, { useState, useEffect } from 'react';
import { NavLink, Link } from 'react-router-dom';
import { LogIn } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { getNavItems } from '../config/navConfig';
import ProfileDropdown from './ProfileDropdown';
import Logo from './Logo';
import './Navbar.css';

const Navbar = () => {
  const { user, isLoggedIn, isAdmin, logout } = useAuth();
  const [isScrolled, setIsScrolled] = useState(false);

  // Dynamic scroll listener for glassmorphic header elevation
  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 10) {
        setIsScrolled(true);
      } else {
        setIsScrolled(false);
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navItems = getNavItems({ isLoggedIn, isAdmin });

  return (
    <header className={`navbar-header ${isScrolled ? 'scrolled' : ''}`}>
      {/* Desktop Navigation Layout (≥ 768px) */}
      <div className="navbar-container desktop-header-container">
        {/* Left: Logo & Brand */}
        <Link to="/" className="navbar-brand" aria-label="BookInn Home">
          <Logo size="small" variant="light" />
        </Link>

        {/* Center: Navigation Links */}
        <nav className="navbar-desktop-nav" aria-label="Main Navigation">
          {navItems.map((item) => {
            const IconComponent = item.icon;
            return (
              <NavLink
                key={item.path}
                to={item.path}
                end={item.path === '/'}
                className={({ isActive }) => `nav-item-link ${isActive ? 'active' : ''}`}
              >
                <IconComponent size={18} aria-hidden="true" className="nav-icon" />
                <span>{item.label}</span>
              </NavLink>
            );
          })}
        </nav>

        {/* Right: Profile / Sign In */}
        <div className="navbar-actions">
          {isLoggedIn && user ? (
            <ProfileDropdown user={user} isAdmin={isAdmin} logout={logout} />
          ) : (
            <NavLink to="/login" className="btn-signin-nav">
              <LogIn size={18} aria-hidden="true" />
              <span>Sign In</span>
            </NavLink>
          )}
        </div>
      </div>

      {/* Mobile 2-Row Navigation Layout (< 768px) */}
      <div className="mobile-header-wrapper">
        {/* Row 1: Brand & Profile Avatar */}
        <div className="mobile-header-row1">
          <Link to="/" className="navbar-brand" aria-label="BookInn Home">
            <Logo size="small" variant="light" />
          </Link>
          <div className="mobile-profile-action">
            {isLoggedIn && user ? (
              <ProfileDropdown user={user} isAdmin={isAdmin} logout={logout} />
            ) : (
              <NavLink to="/login" className="btn-signin-nav">
                <LogIn size={16} aria-hidden="true" />
                <span>Sign In</span>
              </NavLink>
            )}
          </div>
        </div>

        {/* Row 2: Evenly Distributed Horizontal Navigation Bar */}
        <nav className="mobile-nav-row2" aria-label="Mobile Navigation">
          {navItems.map((item) => {
            const IconComponent = item.icon;
            return (
              <NavLink
                key={item.path}
                to={item.path}
                end={item.path === '/'}
                className={({ isActive }) => `mobile-nav-item ${isActive ? 'active' : ''}`}
              >
                <IconComponent size={16} aria-hidden="true" />
                <span>{item.label}</span>
              </NavLink>
            );
          })}
        </nav>
      </div>
    </header>
  );
};

export default Navbar;
