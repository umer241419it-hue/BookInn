import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Copy, Check, RotateCcw, CreditCard, CheckCircle2 } from 'lucide-react';
import { getMyBookings, cancelBooking } from '../api/bookings';
import { createRazorpayOrder, verifyRazorpayPayment } from '../api/payments';
import { formatPriceINR } from '../utils/formatCurrency';
import { formatDateTime } from '../utils/formatDate';
import BookingStatusGroup from '../components/BookingStatusBadge';
import Logo from '../components/Logo';

const BookingsPage = () => {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchParams, setSearchParams] = useSearchParams();

  const tabParam = searchParams.get('tab');
  const activeTab = tabParam === 'cancelled' || tabParam === 'refunds' ? 'refunds' : 'bookings';

  const handleTabChange = (tabKey) => {
    const paramValue = tabKey === 'refunds' ? 'cancelled' : 'booked';
    setSearchParams({ tab: paramValue }, { replace: true });
  };

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
              setSuccessMsg('Payment successfully verified! Booking confirmed.');
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


  const bookedBookings = bookings.filter((b) => b.status !== 'cancelled');
  const cancelledBookings = bookings.filter((b) => b.status === 'cancelled');
  const activeBookingsList = activeTab === 'refunds' ? cancelledBookings : bookedBookings;

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
          onClick={() => handleTabChange('bookings')}
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
          Booked ({bookedBookings.length})
        </button>
        <button
          type="button"
          onClick={() => handleTabChange('refunds')}
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
          Cancelled ({cancelledBookings.length})
        </button>
      </div>

      {loading ? (
        <div className="loading-state">Loading your reservations...</div>
      ) : activeBookingsList.length === 0 ? (
        <div className="empty-state">
          {activeTab === 'refunds' ? 'No cancelled reservations found.' : 'No booked reservations found.'}
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
                <BookingStatusGroup
                  paymentStatus={booking.paymentStatus}
                  refundStatus={booking.refundStatus}
                  bookingStatus={booking.status}
                />
              </div>

              <div className="booking-card-body">
                <p>
                  <strong>Room Type:</strong>{' '}
                  {booking.roomId ? booking.roomId.type : 'Room details unavailable'}
                </p>
                <p>
                  <strong>Check-In:</strong> {formatDate(booking.checkIn)} | <strong>Check-Out:</strong> {formatDate(booking.checkOut)}
                </p>
                <p style={{ margin: '0.25rem 0', color: '#64748b', fontSize: '0.85rem' }}>
                  <strong>Booked On:</strong> {formatDateTime(booking.createdAt)}
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

                {/* Refund Information if active */}
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
                        <strong>Refunded On:</strong> {formatDateTime(booking.refundedAt)}
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
                    style={{ padding: '0.4rem 0.8rem', fontSize: '0.85rem', display: 'inline-flex', alignItems: 'center', gap: '0.35rem' }}
                    onClick={() => handlePayNow(booking)}
                    disabled={payingBookingId === booking._id}
                  >
                    <CreditCard size={14} aria-hidden="true" />
                    {payingBookingId === booking._id ? 'Opening Razorpay...' : 'Pay Now'}
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
