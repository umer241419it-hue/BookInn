import React, { useState, useEffect } from 'react';
import { getAllBookings, cancelBooking } from '../api/bookings';
import Logo from '../components/Logo';

const AdminBookingsPage = () => {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  useEffect(() => {
    fetchAdminBookings();
  }, []);

  const fetchAdminBookings = async () => {
    setLoading(true);
    setError('');
    try {
      const data = await getAllBookings();
      setBookings(data);
    } catch (err) {
      console.error('Error fetching admin bookings:', err);
      setError(err.response?.data?.error || 'Failed to load system bookings.');
    } finally {
      setLoading(false);
    }
  };

  const handleCancelBooking = async (id) => {
    if (!window.confirm('Admin Action: Are you sure you want to cancel this booking?')) return;

    setError('');
    setSuccessMsg('');
    try {
      await cancelBooking(id);
      setSuccessMsg('Booking cancelled successfully as Admin.');
      fetchAdminBookings();
    } catch (err) {
      console.error('Admin cancel error:', err);
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
        <h2 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Logo size="small" iconOnly /> All Hotel Reservations (Admin View)
        </h2>
        <p style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', marginTop: '0.25rem' }}>
          Manage reservations across all registered users on <Logo size="xs" inline />
        </p>
      </div>

      {error && <div className="error-banner">{error}</div>}
      {successMsg && <div className="success-banner">{successMsg}</div>}

      {loading ? (
        <div className="loading-state">Loading all system bookings...</div>
      ) : bookings.length === 0 ? (
        <div className="empty-state">No bookings found in database.</div>
      ) : (
        <div className="bookings-list">
          {bookings.map((booking) => (
            <div key={booking._id} className="booking-card admin-card">
              <div className="booking-card-header">
                <div>
                  <span className="booking-guest">{booking.guestName}</span>
                  <span className="booking-phone"> ({booking.guestPhone})</span>
                  {booking.userId && (
                    <span className="user-email-badge"> Account: {booking.userId.email}</span>
                  )}
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
                  Admin Cancel
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default AdminBookingsPage;
