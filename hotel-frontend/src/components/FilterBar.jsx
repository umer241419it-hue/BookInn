import React, { useState, useRef, useEffect } from 'react';

const FilterBar = ({
  roomTypes = [],
  selectedType,
  onTypeChange,
  minPrice,
  maxPrice,
  onMinPriceChange,
  onMaxPriceChange,
  minCapacity,
  onCapacityChange,
  onResetFilters,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const filterRef = useRef(null);

  // Calculate count of active non-default filters
  const activeCount =
    (selectedType !== 'All' ? 1 : 0) +
    (minCapacity !== 'All' ? 1 : 0) +
    (minPrice !== '' ? 1 : 0) +
    (maxPrice !== '' ? 1 : 0);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (filterRef.current && !filterRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  return (
    <div className="filter-wrapper" ref={filterRef}>
      <div className="filter-trigger-bar">
        <button
          type="button"
          className={`btn-filter-trigger ${activeCount > 0 ? 'active' : ''}`}
          onClick={() => setIsOpen((prev) => !prev)}
        >
          <svg
            className="filter-icon"
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"></polygon>
          </svg>
          <span>Filter Rooms</span>
          {activeCount > 0 && <span className="active-filter-badge">{activeCount}</span>}
        </button>
      </div>

      {isOpen && (
        <div className="filter-popover-card">
          <div className="filter-popover-header">
            <h3>Filter Rooms</h3>
            <div className="filter-header-actions">
              {activeCount > 0 && (
                <button type="button" className="btn-reset-filters" onClick={onResetFilters}>
                  Reset All
                </button>
              )}
              <button
                type="button"
                className="filter-close-btn"
                onClick={() => setIsOpen(false)}
              >
                &times;
              </button>
            </div>
          </div>

          <div className="filter-controls">
            {/* Room Type Filter */}
            <div className="filter-group">
              <label htmlFor="pop-filter-room-type">Room Type</label>
              <select
                id="pop-filter-room-type"
                value={selectedType}
                onChange={(e) => onTypeChange(e.target.value)}
              >
                <option value="All">All Types</option>
                {roomTypes.map((type) => (
                  <option key={type} value={type}>
                    {type}
                  </option>
                ))}
              </select>
            </div>

            {/* Capacity Filter */}
            <div className="filter-group">
              <label htmlFor="pop-filter-capacity">Capacity</label>
              <select
                id="pop-filter-capacity"
                value={minCapacity}
                onChange={(e) => onCapacityChange(e.target.value)}
              >
                <option value="All">Any Capacity</option>
                <option value="1">1+ Guest</option>
                <option value="2">2+ Guests</option>
                <option value="3">3+ Guests</option>
                <option value="4">4+ Guests</option>
              </select>
            </div>

            {/* Min Price Filter */}
            <div className="filter-group">
              <label htmlFor="pop-filter-min-price">Min Price (₹)</label>
              <input
                type="number"
                id="pop-filter-min-price"
                placeholder="Min"
                value={minPrice}
                onChange={(e) => onMinPriceChange(e.target.value)}
                min="0"
              />
            </div>

            {/* Max Price Filter */}
            <div className="filter-group">
              <label htmlFor="pop-filter-max-price">Max Price (₹)</label>
              <input
                type="number"
                id="pop-filter-max-price"
                placeholder="Max"
                value={maxPrice}
                onChange={(e) => onMaxPriceChange(e.target.value)}
                min="0"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default FilterBar;
