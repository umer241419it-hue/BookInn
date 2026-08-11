import React, { useState } from 'react';
import { Calendar, Search, RotateCcw, AlertTriangle } from 'lucide-react';

const SearchForm = ({ onSearch, onClear, activeCheckIn = '', activeCheckOut = '' }) => {
  const [checkIn, setCheckIn] = useState(activeCheckIn);
  const [checkOut, setCheckOut] = useState(activeCheckOut);
  const [formError, setFormError] = useState('');

  const todayStr = new Date().toISOString().split('T')[0];

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!checkIn || !checkOut) {
      setFormError('Please select both Check-In and Check-Out dates.');
      return;
    }

    if (new Date(checkIn) < new Date(todayStr)) {
      setFormError('Check-In date cannot be in the past.');
      return;
    }

    if (new Date(checkOut) <= new Date(checkIn)) {
      setFormError('Check-Out date must be after Check-In date.');
      return;
    }

    setFormError('');
    onSearch(checkIn, checkOut);
  };

  const handleReset = () => {
    setCheckIn('');
    setCheckOut('');
    setFormError('');
    if (onClear) onClear();
  };

  return (
    <div className="search-form-card">
      {formError && (
        <div className="error-banner" style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
          <AlertTriangle size={16} /> {formError}
        </div>
      )}
      <form onSubmit={handleSubmit} className="search-form" style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem', alignItems: 'flex-end' }}>
        <div className="form-group" style={{ flex: 1, minWidth: '180px' }}>
          <label htmlFor="checkIn" style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
            <Calendar size={15} /> Check-In Date
          </label>
          <input
            type="date"
            id="checkIn"
            min={todayStr}
            value={checkIn}
            onChange={(e) => setCheckIn(e.target.value)}
            required
          />
        </div>

        <div className="form-group" style={{ flex: 1, minWidth: '180px' }}>
          <label htmlFor="checkOut" style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
            <Calendar size={15} /> Check-Out Date
          </label>
          <input
            type="date"
            id="checkOut"
            min={checkIn || todayStr}
            value={checkOut}
            onChange={(e) => setCheckOut(e.target.value)}
            required
          />
        </div>

        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <button
            type="submit"
            className="btn-submit"
            style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', padding: '0.65rem 1.25rem' }}
          >
            <Search size={16} /> Check Availability
          </button>

          {(checkIn || checkOut) && (
            <button
              type="button"
              onClick={handleReset}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.3rem',
                padding: '0.65rem 0.9rem',
                borderRadius: '8px',
                border: '1px solid var(--border-color)',
                backgroundColor: '#ffffff',
                color: '#64748b',
                fontWeight: 600,
                cursor: 'pointer',
              }}
              title="Reset dates & view all rooms"
            >
              <RotateCcw size={15} /> Reset
            </button>
          )}
        </div>
      </form>
    </div>
  );
};

export default SearchForm;

