import React from 'react';

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
  return (
    <div className="filter-bar-card">
      <div className="filter-bar-header">
        <h3>Filter Rooms</h3>
        <button type="button" className="btn-reset-filters" onClick={onResetFilters}>
          Reset Filters
        </button>
      </div>

      <div className="filter-controls">
        {/* Room Type Filter */}
        <div className="filter-group">
          <label htmlFor="filter-room-type">Room Type</label>
          <select
            id="filter-room-type"
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
          <label htmlFor="filter-capacity">Capacity</label>
          <select
            id="filter-capacity"
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
          <label htmlFor="filter-min-price">Min Price (₹)</label>
          <input
            type="number"
            id="filter-min-price"
            placeholder="Min"
            value={minPrice}
            onChange={(e) => onMinPriceChange(e.target.value)}
            min="0"
          />
        </div>

        {/* Max Price Filter */}
        <div className="filter-group">
          <label htmlFor="filter-max-price">Max Price (₹)</label>
          <input
            type="number"
            id="filter-max-price"
            placeholder="Max"
            value={maxPrice}
            onChange={(e) => onMaxPriceChange(e.target.value)}
            min="0"
          />
        </div>
      </div>
    </div>
  );
};

export default FilterBar;
