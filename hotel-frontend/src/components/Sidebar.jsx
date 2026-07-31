import React, { useState } from 'react';

const Sidebar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('search');

  const toggleSidebar = () => {
    setIsOpen((prev) => !prev);
  };

  return (
    <>
      {/* Mobile Hamburger Header / Button */}
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
        <span className="mobile-brand">BookInn Hotel</span>
      </div>

      {/* Overlay for mobile drawer */}
      {isOpen && <div className="sidebar-overlay" onClick={toggleSidebar}></div>}

      {/* Navigation Sidebar */}
      <aside className={`sidebar ${isOpen ? 'open' : ''}`}>
        <div className="sidebar-brand">
          <span className="brand-icon">🏨</span>
          <h2>BookInn</h2>
        </div>

        <nav className="sidebar-nav">
          <a
            href="#search"
            className={`nav-link ${activeTab === 'search' ? 'active' : ''}`}
            onClick={(e) => {
              e.preventDefault();
              setActiveTab('search');
              setIsOpen(false);
            }}
          >
            <span className="nav-icon">🔍</span> Search Rooms
          </a>

          <a
            href="#bookings"
            className={`nav-link ${activeTab === 'bookings' ? 'active' : ''}`}
            onClick={(e) => {
              e.preventDefault();
              setActiveTab('bookings');
              setIsOpen(false);
            }}
          >
            <span className="nav-icon">📋</span> My Bookings
          </a>
        </nav>
      </aside>
    </>
  );
};

export default Sidebar;
