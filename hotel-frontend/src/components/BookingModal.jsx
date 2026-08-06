import React, { useState, useEffect } from 'react';
import ReactDOM from 'react-dom';
import { X, ShieldCheck, CheckCircle2, AlertTriangle, CreditCard } from 'lucide-react';
import { createBooking } from '../api/bookings';
import { createRazorpayOrder, verifyRazorpayPayment } from '../api/payments';
import { formatPriceINR } from '../utils/formatCurrency';
import Logo from './Logo';

const BookingModal = ({ room, initialCheckIn = '', initialCheckOut = '', onClose, onBookingSuccess }) => {
  const [guestName, setGuestName] = useState('');
  const [guestPhone, setGuestPhone] = useState('');
  const [checkIn, setCheckIn] = useState(initialCheckIn);
  const [checkOut, setCheckOut] = useState(initialCheckOut);
  const [loading, setLoading] = useState(false);
  const [verifying, setVerifying] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [paymentFailed, setPaymentFailed] = useState(false);
  const [pendingBooking, setPendingBooking] = useState(null);

  // Lock background scroll and handle Escape key while modal is active
  useEffect(() => {
    if (!room) return;

    document.body.style.overflow = 'hidden';

    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    window.addEventListener('keydown', handleKeyDown);

    return () => {
      document.body.style.overflow = '';
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [room, onClose]);

  if (!room) return null;

  // Launch Razorpay Checkout widget
  const triggerRazorpayCheckout = async (bookingObj) => {
    setLoading(true);
    setPaymentFailed(false);
    setError('');

    try {
      // 1. Request Razorpay order from backend
      const orderData = await createRazorpayOrder({ bookingId: bookingObj._id });

      if (!orderData || !orderData.order) {
        throw new Error('Could not generate Razorpay payment order.');
      }

      const { order, keyId } = orderData;

      if (!window.Razorpay) {
        setError('Razorpay SDK script is not loaded. Please refresh the page and try again.');
        setLoading(false);
        return;
      }

      // 2. Configure Razorpay Widget Options
      const options = {
        key: keyId || import.meta.env.VITE_RAZORPAY_KEY_ID,
        amount: order.amount,
        currency: order.currency || 'INR',
        name: 'BookInn Hotels',
        description: `Payment for ${room.type} Room Stay (TEST MODE)`,
        order_id: order.id,
        prefill: {
          name: guestName || bookingObj.guestName || '',
          contact: guestPhone || bookingObj.guestPhone || '',
        },
        theme: {
          color: '#6366f1',
        },
        handler: async function (response) {
          setVerifying(true);
          setLoading(false);
          setError('');
          try {
            // 3. Verify signature server-side
            const verifyRes = await verifyRazorpayPayment({
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
              bookingId: bookingObj._id,
            });

            if (verifyRes.success) {
              setSuccess(true);
              setPaymentFailed(false);
              setTimeout(() => {
                onBookingSuccess();
                onClose();
              }, 2000);
            } else {
              setPaymentFailed(true);
              setError('Payment verification failed on server. Signature mismatch.');
            }
          } catch (err) {
            console.error('Payment verification error:', err);
            setPaymentFailed(true);
            setError(err.response?.data?.error || 'Server payment verification failed.');
          } finally {
            setVerifying(false);
          }
        },
        modal: {
          ondismiss: function () {
            setPaymentFailed(true);
            setLoading(false);
            setError('Payment process was dismissed before completion.');
          },
        },
      };

      const razorpayInstance = new window.Razorpay(options);

      razorpayInstance.on('payment.failed', function (response) {
        console.error('Razorpay Payment Failed:', response.error);
        setPaymentFailed(true);
        setLoading(false);
        setError(`Payment failed: ${response.error.description || 'Transaction failed'}`);
      });

      razorpayInstance.open();
    } catch (err) {
      console.error('Razorpay checkout creation failed:', err);
      setPaymentFailed(true);
      setError(err.response?.data?.error || err.message || 'Failed to initialize payment gateway.');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setPaymentFailed(false);

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
      // Create initial pending booking
      const newBooking = await createBooking({
        roomType: room.type,
        guestName: guestName.trim(),
        guestPhone: guestPhone.trim(),
        checkIn,
        checkOut,
      });

      setPendingBooking(newBooking);

      // Immediately launch Razorpay modal
      await triggerRazorpayCheckout(newBooking);
    } catch (err) {
      console.error('Booking creation failed:', err);
      if (err.response) {
        const status = err.response.status;
        if (status === 409) {
          setError('Rooms in this category were just booked for these dates — please select another');
        } else if (status === 400) {
          setError(err.response.data?.error || 'Invalid booking details provided.');
        } else {
          setError('Something went wrong creating booking, please try again');
        }
      } else {
        setError('Something went wrong creating booking, please try again');
      }
      setLoading(false);
    }
  };

  const handleRetryPayment = () => {
    if (pendingBooking) {
      triggerRazorpayCheckout(pendingBooking);
    }
  };

  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  const modalMarkup = (
    <div
      className="modal-overlay"
      onClick={handleBackdropClick}
      tabIndex={-1}
      role="dialog"
      aria-modal="true"
      aria-labelledby="booking-modal-title"
    >
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h3 id="booking-modal-title" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Logo size="small" iconOnly /> Book {room.type} Room
          </h3>
          <button type="button" className="modal-close-btn" onClick={onClose} aria-label="Close modal">
            <X size={20} aria-hidden="true" />
          </button>
        </div>

        <div className="modal-subhead">
          <span><strong>Capacity:</strong> {room.capacity} {room.capacity === 1 ? 'Guest' : 'Guests'}</span>
          <span><strong>Price:</strong> {formatPriceINR(room.price)} / night</span>
        </div>

        {error && <div className="error-banner">{error}</div>}

        {verifying && (
          <div className="loading-state" style={{ margin: '1rem 0', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <ShieldCheck size={18} aria-hidden="true" /> Cryptographically verifying signature with server... Please wait.
          </div>
        )}

        {success && (
          <div className="success-banner" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <CheckCircle2 size={18} aria-hidden="true" /> Payment verified & reservation confirmed! Refreshing bookings...
          </div>
        )}

        {paymentFailed && !verifying && !success && (
          <div className="payment-failed-container" style={{ margin: '1rem 0', textAlign: 'center' }}>
            <p style={{ color: '#ef4444', fontWeight: 600, marginBottom: '0.75rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.4rem' }}>
              <AlertTriangle size={18} aria-hidden="true" /> Payment Pending / Verification Failed
            </p>
            <p style={{ fontSize: '0.9rem', color: '#64748b', marginBottom: '1rem' }}>
              Your reservation has been saved with <strong>pending</strong> payment status. You can retry paying now with Razorpay TEST mode.
            </p>
            <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'center' }}>
              <button
                type="button"
                className="btn-submit"
                onClick={handleRetryPayment}
                disabled={loading}
                style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem' }}
              >
                <CreditCard size={18} aria-hidden="true" />
                {loading ? 'Opening Razorpay...' : 'Retry Payment (Razorpay Test)'}
              </button>
              <button type="button" className="btn-cancel" onClick={onClose}>
                Close
              </button>
            </div>
          </div>
        )}

        {!success && !paymentFailed && !verifying && (
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
                {loading ? 'Initializing Razorpay...' : 'Proceed to Pay with Razorpay'}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );

  return ReactDOM.createPortal(modalMarkup, document.body);
};

export default BookingModal;
