import React, { useState, useEffect } from 'react';
import { getMyBookings, cancelBooking } from '../api/bookings';
import { createRazorpayOrder, verifyRazorpayPayment } from '../api/payments';
import { formatPriceINR } from '../utils/formatCurrency';
import Logo from '../components/Logo';

const BookingsPage = () => {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('bookings');
  const [payingBookingId, setPayingBookingId] = useState(null);
  const [copiedId, setCopiedId] = useState('');
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
      ? `This will cancel your booking and refund ${formatPriceINR(amount || 0)} to your original payment method`
      : 'Are you sure you want to cancel this booking?';

    if (!window.confirm(confirmPrompt)) return;

    setError('');
    setSuccessMsg('');
    try {
      const res = await cancelBooking(booking._id);
      setSuccessMsg(res.message || 'Booking cancelled successfully.');
      fetchUserBookings();
    } catch (err) {
      console.error('Error cancelling booking:', err);
      setError(err.response?.data?.error || 'Failed to cancel booking.');
    }
  };

  const handlePayNow = async (booking) => {
    setPayingBookingId(booking._id);
    setError('');
    setSuccessMsg('');

    try {
      const orderData = await createRazorpayOrder({ bookingId: booking._id });
      if (!orderData || !orderData.order) {
        throw new Error('Could not create Razorpay payment order.');
      }

      const { order, keyId } = orderData;

      if (!window.Razorpay) {
        setError('Razorpay SDK script not available. Please refresh the page.');
        setPayingBookingId(null);
        return;
      }

      const options = {
        key: keyId || import.meta.env.VITE_RAZORPAY_KEY_ID,
        amount: order.amount,
        currency: order.currency || 'INR',
        name: 'BookInn Hotels',
        description: `Payment for Booking ID ${booking._id}`,
        order_id: order.id,
        prefill: {
          name: booking.guestName || '',
          contact: booking.guestPhone || '',
        },
        theme: {
          color: '#6366f1',
        },
        handler: async function (response) {
          try {
            const verifyRes = await verifyRazorpayPayment({
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
              bookingId: booking._id,
            });

            if (verifyRes.success) {
              setSuccessMsg('🎉 Payment successfully verified! Booking confirmed.');
              fetchUserBookings();
            } else {
              setError('Payment verification failed on server.');
            }
          } catch (err) {
            console.error('Payment verification error:', err);
            setError(err.response?.data?.error || 'Server signature verification failed.');
          } finally {
            setPayingBookingId(null);
          }
        },
        modal: {
          ondismiss: function () {
            setPayingBookingId(null);
          },
        },
      };

      const razorpayInstance = new window.Razorpay(options);
      razorpayInstance.open();
    } catch (err) {
      console.error('Pay Now Error:', err);
      setError(err.response?.data?.error || err.message || 'Failed to launch payment.');
      setPayingBookingId(null);
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

  const refundBookingsList = bookings.filter((b) => b.refundStatus && b.refundStatus !== 'none');
  const activeBookingsList = activeTab === 'refunds' ? refundBookingsList : bookings;

  return (
    <div className="bookings-page">
      <div className="bookings-page-header">
        <h2 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Logo size="small" iconOnly /> My Reservations & Refunds
        </h2>
        <p style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', marginTop: '0.25rem' }}>
          View reservations, copy transaction IDs, and track refunds on <Logo size="xs" inline />
        </p>
      </div>

      {error && <div className="error-banner">{error}</div>}
      {successMsg && <div className="success-banner">{successMsg}</div>}

      {/* Tab Navigation */}
      <div style={{ display: 'flex', gap: '1rem', marginBottom: '1.5rem', borderBottom: '1px solid #e2e8f0' }}>
        <button
          type="button"
          onClick={() => setActiveTab('bookings')}
          style={{
            padding: '0.6rem 1.2rem',
            background: 'none',
            border: 'none',
            borderBottom: activeTab === 'bookings' ? '3px solid #6366f1' : '3px solid transparent',
            color: activeTab === 'bookings' ? '#6366f1' : '#64748b',
            fontWeight: activeTab === 'bookings' ? '600' : '500',
            fontSize: '0.95rem',
            cursor: 'pointer',
          }}
        >
          My Bookings ({bookings.length})
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('refunds')}
          style={{
            padding: '0.6rem 1.2rem',
            background: 'none',
            border: 'none',
            borderBottom: activeTab === 'refunds' ? '3px solid #6366f1' : '3px solid transparent',
            color: activeTab === 'refunds' ? '#6366f1' : '#64748b',
            fontWeight: activeTab === 'refunds' ? '600' : '500',
            fontSize: '0.95rem',
            cursor: 'pointer',
          }}
        >
          Refunds ({refundBookingsList.length})
        </button>
      </div>

      {loading ? (
        <div className="loading-state">Loading your reservations...</div>
      ) : activeBookingsList.length === 0 ? (
        <div className="empty-state">
          {activeTab === 'refunds' ? 'No refund records found.' : 'You have no active bookings.'}
        </div>
      ) : (
        <div className="bookings-list">
          {activeBookingsList.map((booking) => (
            <div key={booking._id} className="booking-card">
              <div className="booking-card-header">
                <div>
                  <span className="booking-guest">{booking.guestName}</span>
                  <span className="booking-phone"> ({booking.guestPhone})</span>
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

                {/* Refund Information if active */}
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

              <div className="booking-card-footer" style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end' }}>
                {booking.status !== 'cancelled' && booking.paymentStatus !== 'paid' && (
                  <button
                    type="button"
                    className="btn-submit"
                    style={{ padding: '0.4rem 0.8rem', fontSize: '0.85rem' }}
                    onClick={() => handlePayNow(booking)}
                    disabled={payingBookingId === booking._id}
                  >
                    {payingBookingId === booking._id ? 'Opening Razorpay...' : '💳 Pay Now'}
                  </button>
                )}
                {booking.status !== 'cancelled' && (
                  <button
                    type="button"
                    className="btn-cancel-booking"
                    onClick={() => handleCancelBooking(booking)}
                  >
                    Cancel Reservation
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

export default BookingsPage;
