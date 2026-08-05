import React, { useState, useEffect } from 'react';
import { Copy, Check, RotateCcw } from 'lucide-react';
import { getAllBookings, cancelBooking } from '../api/bookings';
import { formatPriceINR } from '../utils/formatCurrency';
import Logo from '../components/Logo';

const AdminBookingsPage = () => {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [copiedId, setCopiedId] = useState('');
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterPayment, setFilterPayment] = useState('all');

  useEffect(() => {
    fetchBookings();
  }, []);

  const fetchBookings = async () => {
    setLoading(true);
    setError('');
    try {
      const data = await getAllBookings();
      setBookings(data);
    } catch (err) {
      console.error('Error fetching admin bookings:', err);
      setError(err.response?.data?.error || 'Failed to load bookings.');
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
      ? `ADMIN ACTION: Cancel booking for ${booking.guestName} and issue ${formatPriceINR(amount || 0)} Razorpay refund?`
      : `ADMIN ACTION: Cancel booking for ${booking.guestName}?`;

    if (!window.confirm(confirmPrompt)) return;

    setError('');
    setSuccessMsg('');
    try {
      const res = await cancelBooking(booking._id);
      setSuccessMsg(res.message || 'Booking cancelled and refund processed.');
      fetchBookings();
    } catch (err) {
      console.error('Admin cancel error:', err);
      setError(err.response?.data?.error || 'Failed to cancel booking.');
    }
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return '';
    return new Date(dateStr).toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const filteredBookings = bookings.filter((b) => {
    if (filterStatus !== 'all' && b.status !== filterStatus) return false;
    if (filterPayment !== 'all' && b.paymentStatus !== filterPayment) return false;
    return true;
  });

  return (
    <div className="admin-bookings-page">
      <div className="page-header" style={{ marginBottom: '1.5rem' }}>
        <h1 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--primary-color)' }}>
          <Logo size="medium" /> Admin Bookings Management
        </h1>
        <p style={{ color: 'var(--text-muted)' }}>Overview of all system bookings, status tracking, and refunds.</p>
      </div>

      {error && <div className="error-banner">{error}</div>}
      {successMsg && <div className="success-banner">{successMsg}</div>}

      <div className="admin-filter-bar" style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', marginBottom: '1.5rem', background: '#fff', padding: '1rem', borderRadius: '8px', border: '1px solid var(--border-color)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <label htmlFor="statusFilter" style={{ fontWeight: 600, fontSize: '0.9rem' }}>Booking Status:</label>
          <select
            id="statusFilter"
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            style={{ padding: '0.4rem 0.6rem', borderRadius: '6px', border: '1px solid var(--border-color)' }}
          >
            <option value="all">All Statuses</option>
            <option value="pending">Pending</option>
            <option value="confirmed">Confirmed</option>
            <option value="cancelled">Cancelled</option>
          </select>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <label htmlFor="paymentFilter" style={{ fontWeight: 600, fontSize: '0.9rem' }}>Payment Status:</label>
          <select
            id="paymentFilter"
            value={filterPayment}
            onChange={(e) => setFilterPayment(e.target.value)}
            style={{ padding: '0.4rem 0.6rem', borderRadius: '6px', border: '1px solid var(--border-color)' }}
          >
            <option value="all">All Payments</option>
            <option value="pending">Pending</option>
            <option value="paid">Paid</option>
            <option value="failed">Failed</option>
          </select>
        </div>
      </div>

      {loading ? (
        <div className="loading-state">Loading all system bookings...</div>
      ) : filteredBookings.length === 0 ? (
        <div className="empty-state">No bookings match the selected filters.</div>
      ) : (
        <div className="bookings-list" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {filteredBookings.map((booking) => (
            <div key={booking._id} className="booking-card" style={{ background: '#fff', padding: '1.25rem', borderRadius: '10px', border: '1px solid var(--border-color)', boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}>
              <div className="booking-card-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '0.5rem', marginBottom: '0.75rem' }}>
                <div>
                  <h3 style={{ margin: 0, fontSize: '1.1rem' }}>
                    Room {booking.roomId?.number || 'N/A'} ({booking.roomId?.type || 'Standard'})
                  </h3>
                  <p style={{ margin: '0.2rem 0 0 0', fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                    Guest: <strong>{booking.guestName}</strong> ({booking.guestPhone})
                  </p>
                </div>
                <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap' }}>
                  <span className={`status-badge status-${booking.status}`}>
                    Status: {booking.status}
                  </span>
                  <span className={`status-badge payment-${booking.paymentStatus}`}>
                    Payment: {booking.paymentStatus}
                  </span>
                </div>
              </div>

              <div className="booking-card-body" style={{ fontSize: '0.9rem', color: '#334155' }}>
                <p style={{ margin: '0.2rem 0' }}>
                  <strong>User Account:</strong> {booking.userId?.name || 'N/A'} ({booking.userId?.email || 'N/A'})
                </p>
                <p style={{ margin: '0.2rem 0' }}>
                  <strong>Check-In:</strong> {formatDate(booking.checkIn)} | <strong>Check-Out:</strong> {formatDate(booking.checkOut)}
                </p>

                <div style={{ margin: '0.5rem 0', display: 'flex', gap: '1rem', flexWrap: 'wrap', fontSize: '0.85rem', background: '#f8fafc', padding: '0.5rem 0.75rem', borderRadius: '6px' }}>
                  {booking.razorpayOrderId && (
                    <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.3rem' }}>
                      <strong>Order ID:</strong> <code>{truncateId(booking.razorpayOrderId)}</code>
                      <button
                        type="button"
                        onClick={() => handleCopy(booking.razorpayOrderId)}
                        title="Copy Order ID"
                        style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '2px 4px', fontSize: '0.75rem', color: copiedId === booking.razorpayOrderId ? '#16a34a' : '#6366f1', display: 'inline-flex', alignItems: 'center', gap: '2px' }}
                      >
                        {copiedId === booking.razorpayOrderId ? <><Check size={12} aria-hidden="true" /> Copied</> : <Copy size={12} aria-hidden="true" />}
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
                        style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '2px 4px', fontSize: '0.75rem', color: copiedId === booking.razorpayPaymentId ? '#16a34a' : '#6366f1', display: 'inline-flex', alignItems: 'center', gap: '2px' }}
                      >
                        {copiedId === booking.razorpayPaymentId ? <><Check size={12} aria-hidden="true" /> Copied</> : <Copy size={12} aria-hidden="true" />}
                      </button>
                    </span>
                  )}
                </div>

                {booking.refundStatus && booking.refundStatus !== 'none' && (
                  <div style={{ marginTop: '0.5rem', background: '#f0fdf4', padding: '0.6rem 0.75rem', borderRadius: '6px', border: '1px solid #bbf7d0', fontSize: '0.85rem' }}>
                    <p style={{ margin: 0, fontWeight: 600, color: '#166534', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                      <RotateCcw size={14} aria-hidden="true" /> Refund Details ({formatPriceINR(booking.refundAmount || booking.amountPaid || 0)})
                    </p>
                    {booking.razorpayRefundId && (
                      <p style={{ margin: '0.2rem 0 0 0', color: '#334155' }}>
                        <strong>Refund ID:</strong> <code>{truncateId(booking.razorpayRefundId)}</code>
                        <button
                          type="button"
                          onClick={() => handleCopy(booking.razorpayRefundId)}
                          title="Copy Refund ID"
                          style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '2px 4px', fontSize: '0.75rem', color: copiedId === booking.razorpayRefundId ? '#16a34a' : '#6366f1', display: 'inline-flex', alignItems: 'center', gap: '2px' }}
                        >
                          {copiedId === booking.razorpayRefundId ? <><Check size={12} aria-hidden="true" /> Copied</> : <Copy size={12} aria-hidden="true" />}
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

              <div className="booking-card-footer" style={{ marginTop: '1rem', borderTop: '1px solid var(--border-color)', paddingTop: '1rem' }}>
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
