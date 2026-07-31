import React, { useState, useEffect } from 'react';
import { getMyBookings, cancelBooking } from '../api/bookings';

const BookingsPage = () => {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  useEffect(() => {
    fetchUserBookings();
  }, []);

  const fetchUserBookings = async () => {
    setLoading(true);
    setError('');
    try {
      const data = await getMyBookings();
      setBookings(data);
    } catch (err) {
      console.error('Error fetching user bookings:', err);
      setError(err.response?.data?.error || 'Failed to load your bookings.');
    } finally {
      setLoading(false);
    }
  };

  const handleCancelBooking = async (id) => {
    if (!window.confirm('Are you sure you want to cancel this booking?')) return;

    setError('');
    setSuccessMsg('');
    try {
      await cancelBooking(id);
      setSuccessMsg('Booking cancelled successfully.');
      fetchUserBookings();
    } catch (err) {
      console.error('Error cancelling booking:', err);
      setError(err.response?.data?.error || 'Failed to cancel booking.');
    }
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return 'N/A';
    return new Date(dateStr).toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  return (
    <div className="bookings-page">
      <div className="bookings-page-header">
        <h2>My Reservations</h2>
        <p>View and manage your personal hotel room bookings</p>
      </div>

      {error && <div className="error-banner">{error}</div>}
      {successMsg && <div className="success-banner">{successMsg}</div>}

      {loading ? (
        <div className="loading-state">Loading your reservations...</div>
      ) : bookings.length === 0 ? (
        <div className="empty-state">You have no active bookings.</div>
      ) : (
        <div className="bookings-list">
          {bookings.map((booking) => (
            <div key={booking._id} className="booking-card">
              <div className="booking-card-header">
                <div>
                  <span className="booking-guest">{booking.guestName}</span>
                  <span className="booking-phone"> ({booking.guestPhone})</span>
                </div>
                <span className="booking-status-badge confirmed">
                  {booking.status || 'Confirmed'}
                </span>
              </div>

              <div className="booking-card-body">
                <p>
                  <strong>Room:</strong>{' '}
                  {booking.roomId
                    ? `Room ${booking.roomId.number} (${booking.roomId.type})`
                    : 'Room details unavailable'}
                </p>
                <p>
                  <strong>Check-In:</strong> {formatDate(booking.checkIn)}
                </p>
                <p>
                  <strong>Check-Out:</strong> {formatDate(booking.checkOut)}
                </p>
              </div>

              <div className="booking-card-footer">
                <button
                  type="button"
                  className="btn-cancel-booking"
                  onClick={() => handleCancelBooking(booking._id)}
                >
                  Cancel Reservation
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default BookingsPage;
