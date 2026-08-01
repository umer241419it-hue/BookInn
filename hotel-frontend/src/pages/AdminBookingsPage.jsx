import React, { useState, useEffect } from 'react';
import { getAllBookings, cancelBooking } from '../api/bookings';
import { formatPriceINR } from '../utils/formatCurrency';
import Logo from '../components/Logo';

const AdminBookingsPage = () => {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [copiedId, setCopiedId] = useState('');
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

  const handleCopy = (text) => {
    if (!text) return;
    navigator.clipboard.writeText(text);
    setCopiedId(text);
    setTimeout(() => setCopiedId(''), 2000);
  };

  const truncateId = (id) => {
    if (!id) return '';
    if (id.length <= 10) return id;
    return `${id.slice(0, 6)}...${id.slice(-4)}`;
  };

  const handleCancelBooking = async (booking) => {
    const isPaid = booking.paymentStatus === 'paid';
    let amount = booking.amountPaid;
    if (!amount && booking.roomId && booking.roomId.price) {
      const checkInDate = new Date(booking.checkIn);
      const checkOutDate = new Date(booking.checkOut);
      const nights = Math.max(1, Math.ceil((checkOutDate - checkInDate) / (1000 * 60 * 60 * 24)));
      amount = nights * booking.roomId.price;
    }

    const confirmPrompt = isPaid
      ? `Admin Action: Cancel booking and refund ${formatPriceINR(amount || 0)} to customer original payment method?`
      : 'Admin Action: Are you sure you want to cancel this booking?';

    if (!window.confirm(confirmPrompt)) return;

    setError('');
    setSuccessMsg('');
    try {
      const res = await cancelBooking(booking._id);
      setSuccessMsg(res.message || 'Booking cancelled successfully as Admin.');
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

  const renderPaymentStatusBadge = (paymentStatus) => {
    const status = paymentStatus || 'pending';
    if (status === 'paid') {
      return <span className="booking-status-badge confirmed" style={{ background: '#dcfce7', color: '#15803d' }}>Paid</span>;
    }
    if (status === 'failed') {
      return <span className="booking-status-badge" style={{ background: '#fee2e2', color: '#b91c1c' }}>Payment Failed</span>;
    }
    return <span className="booking-status-badge" style={{ background: '#fef3c7', color: '#b45309' }}>Payment Pending</span>;
  };

  const renderRefundStatusBadge = (refundStatus) => {
    if (refundStatus === 'processed') {
      return <span className="booking-status-badge" style={{ background: '#dcfce7', color: '#15803d' }}>Refund Processed</span>;
    }
    if (refundStatus === 'processing') {
      return <span className="booking-status-badge" style={{ background: '#fef3c7', color: '#b45309' }}>Refund Processing</span>;
    }
    if (refundStatus === 'failed') {
      return <span className="booking-status-badge" style={{ background: '#fee2e2', color: '#b91c1c' }}>Refund Failed</span>;
    }
    return null;
  };

  return (
    <div className="bookings-page">
      <div className="bookings-page-header">
        <h2 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Logo size="small" iconOnly /> All Hotel Reservations (Admin View)
        </h2>
        <p style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', marginTop: '0.25rem' }}>
          Manage reservations, transaction IDs, and automated refunds on <Logo size="xs" inline />
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
                <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', flexWrap: 'wrap' }}>
                  {renderPaymentStatusBadge(booking.paymentStatus)}
                  {booking.refundStatus && booking.refundStatus !== 'none' && renderRefundStatusBadge(booking.refundStatus)}
                  <span className="booking-status-badge confirmed" style={booking.status === 'cancelled' ? { background: '#f1f5f9', color: '#64748b' } : {}}>
                    {booking.status ? booking.status.toUpperCase() : 'PENDING'}
                  </span>
                </div>
              </div>

              <div className="booking-card-body">
                <p>
                  <strong>Room:</strong>{' '}
                  {booking.roomId
                    ? `Room ${booking.roomId.number} (${booking.roomId.type})`
                    : 'Room details unavailable'}
                </p>
                <p>
                  <strong>Check-In:</strong> {formatDate(booking.checkIn)} | <strong>Check-Out:</strong> {formatDate(booking.checkOut)}
                </p>

                {/* Transaction IDs Section */}
                <div style={{ margin: '0.5rem 0', display: 'flex', gap: '1rem', flexWrap: 'wrap', fontSize: '0.85rem', background: '#f8fafc', padding: '0.5rem 0.75rem', borderRadius: '6px' }}>
                  {booking.razorpayOrderId && (
                    <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.3rem' }}>
                      <strong>Order ID:</strong> <code>{truncateId(booking.razorpayOrderId)}</code>
                      <button
                        type="button"
                        onClick={() => handleCopy(booking.razorpayOrderId)}
                        title="Copy Order ID"
                        style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '2px 4px', fontSize: '0.75rem', color: copiedId === booking.razorpayOrderId ? '#16a34a' : '#6366f1' }}
                      >
                        {copiedId === booking.razorpayOrderId ? '✓ Copied' : '📋'}
                      </button>
                    </span>
                  )}

                  {booking.razorpayPaymentId && (
                    <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.3rem' }}>
                      <strong>Payment ID:</strong> <code>{truncateId(booking.razorpayPaymentId)}</code>
                      <button
                        type="button"
                        onClick={() => handleCopy(booking.razorpayPaymentId)}
                        title="Copy Payment ID"
                        style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '2px 4px', fontSize: '0.75rem', color: copiedId === booking.razorpayPaymentId ? '#16a34a' : '#6366f1' }}
                      >
                        {copiedId === booking.razorpayPaymentId ? '✓ Copied' : '📋'}
                      </button>
                    </span>
                  )}
                </div>

                {/* Refund Information */}
                {booking.refundStatus && booking.refundStatus !== 'none' && (
                  <div style={{ marginTop: '0.5rem', background: '#f0fdf4', padding: '0.6rem 0.75rem', borderRadius: '6px', border: '1px solid #bbf7d0', fontSize: '0.85rem' }}>
                    <p style={{ margin: 0, fontWeight: 600, color: '#166534' }}>
                      💸 Refund Details ({formatPriceINR(booking.refundAmount || booking.amountPaid || 0)})
                    </p>
                    {booking.razorpayRefundId && (
                      <p style={{ margin: '0.2rem 0 0 0', color: '#334155' }}>
                        <strong>Refund ID:</strong> <code>{truncateId(booking.razorpayRefundId)}</code>
                        <button
                          type="button"
                          onClick={() => handleCopy(booking.razorpayRefundId)}
                          title="Copy Refund ID"
                          style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '2px 4px', fontSize: '0.75rem', color: copiedId === booking.razorpayRefundId ? '#16a34a' : '#6366f1' }}
                        >
                          {copiedId === booking.razorpayRefundId ? '✓ Copied' : '📋'}
                        </button>
                      </p>
                    )}
                    {booking.refundedAt && (
                      <p style={{ margin: '0.1rem 0 0 0', color: '#64748b' }}>
                        <strong>Refunded On:</strong> {formatDate(booking.refundedAt)}
                      </p>
                    )}
                  </div>
                )}
              </div>

              <div className="booking-card-footer">
                {booking.status !== 'cancelled' && (
                  <button
                    type="button"
                    className="btn-cancel-booking"
                    onClick={() => handleCancelBooking(booking)}
                  >
                    Admin Cancel
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default AdminBookingsPage;
