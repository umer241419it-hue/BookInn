import React, { useState } from 'react';
import { createBooking } from '../api/bookings';
import { formatPriceINR } from '../utils/formatCurrency';

const BookingModal = ({ room, initialCheckIn = '', initialCheckOut = '', onClose, onBookingSuccess }) => {
  const [guestName, setGuestName] = useState('');
  const [guestPhone, setGuestPhone] = useState('');
  const [checkIn, setCheckIn] = useState(initialCheckIn);
  const [checkOut, setCheckOut] = useState(initialCheckOut);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  if (!room) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!guestName.trim() || !guestPhone.trim() || !checkIn || !checkOut) {
      setError('Please fill in all required fields.');
      return;
    }

    if (new Date(checkOut) <= new Date(checkIn)) {
      setError('Check-Out date must be after Check-In date.');
      return;
    }

    setLoading(true);

    try {
      await createBooking({
        roomId: room._id,
        guestName: guestName.trim(),
        guestPhone: guestPhone.trim(),
        checkIn,
        checkOut,
      });

      setSuccess(true);
      setTimeout(() => {
        onBookingSuccess();
        onClose();
      }, 1500);
    } catch (err) {
      console.error('Booking failed:', err);
      if (err.response) {
        const status = err.response.status;
        if (status === 409) {
          setError('This room was just booked by someone else — please choose another');
        } else if (status === 400) {
          setError(err.response.data?.error || 'Invalid booking details provided.');
        } else {
          setError('Something went wrong, please try again');
        }
      } else {
        // Network or server unreachable
        setError('Something went wrong, please try again');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h3>Book Room {room.number} ({room.type})</h3>
          <button type="button" className="modal-close-btn" onClick={onClose}>
            &times;
          </button>
        </div>

        <div className="modal-subhead">
          <span><strong>Capacity:</strong> {room.capacity} {room.capacity === 1 ? 'Guest' : 'Guests'}</span>
          <span><strong>Price:</strong> {formatPriceINR(room.price)} / night</span>
        </div>

        {error && <div className="error-banner">{error}</div>}
        {success && (
          <div className="success-banner">
            🎉 Booking confirmed successfully! Refreshing rooms...
          </div>
        )}

        {!success && (
          <form onSubmit={handleSubmit} className="booking-form">
            <div className="form-group">
              <label htmlFor="guestName">Guest Full Name *</label>
              <input
                type="text"
                id="guestName"
                placeholder="e.g. Rahul Sharma"
                value={guestName}
                onChange={(e) => setGuestName(e.target.value)}
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="guestPhone">Guest Phone Number *</label>
              <input
                type="tel"
                id="guestPhone"
                placeholder="e.g. +91 98765 43210"
                value={guestPhone}
                onChange={(e) => setGuestPhone(e.target.value)}
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="modalCheckIn">Check-In Date *</label>
              <input
                type="date"
                id="modalCheckIn"
                value={checkIn}
                onChange={(e) => setCheckIn(e.target.value)}
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="modalCheckOut">Check-Out Date *</label>
              <input
                type="date"
                id="modalCheckOut"
                value={checkOut}
                onChange={(e) => setCheckOut(e.target.value)}
                required
              />
            </div>

            <div className="modal-footer">
              <button type="button" className="btn-cancel" onClick={onClose} disabled={loading}>
                Cancel
              </button>
              <button type="submit" className="btn-submit" disabled={loading}>
                {loading ? 'Confirming...' : 'Confirm Booking'}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

export default BookingModal;
