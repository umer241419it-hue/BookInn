import React, { useState } from 'react';

const SearchForm = ({ onSearch }) => {
  const [checkIn, setCheckIn] = useState('');
  const [checkOut, setCheckOut] = useState('');
  const [formError, setFormError] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!checkIn || !checkOut) {
      setFormError('Please select both Check-In and Check-Out dates.');
      return;
    }
    if (new Date(checkOut) <= new Date(checkIn)) {
      setFormError('Check-Out date must be after Check-In date.');
      return;
    }

    setFormError('');
    onSearch(checkIn, checkOut);
  };

  return (
    <div className="search-form-card">
      {formError && <div className="error-banner">{formError}</div>}
      <form onSubmit={handleSubmit} className="search-form">
        <div className="form-group">
          <label htmlFor="checkIn">Check-In Date</label>
          <input
            type="date"
            id="checkIn"
            value={checkIn}
            onChange={(e) => setCheckIn(e.target.value)}
            required
          />
        </div>

        <div className="form-group">
          <label htmlFor="checkOut">Check-Out Date</label>
          <input
            type="date"
            id="checkOut"
            value={checkOut}
            onChange={(e) => setCheckOut(e.target.value)}
            required
          />
        </div>

        <button type="submit" className="btn-submit">
          Search Available Rooms
        </button>
      </form>
    </div>
  );
};

export default SearchForm;
