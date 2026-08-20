import React, { useState, useEffect } from 'react';
import ReactDOM from 'react-dom';
import { AlertTriangle, X, RotateCcw, Calendar, CreditCard, Ban } from 'lucide-react';
import { formatPriceINR } from '../utils/formatCurrency';
import { formatDate } from '../utils/formatDate';

/**
 * CancelBookingModal - Modal dialog replacing browser window.confirm for booking cancellations.
 * Clearly displays reservation details, refund implications, and handles loading/error states.
 *
 * @param {Object} props
 * @param {boolean} props.isOpen - Whether modal is visible.
 * @param {Function} props.onClose - Callback to close modal.
 * @param {Function} props.onConfirm - Async callback taking booking._id to execute cancellation.
 * @param {Object} props.booking - The booking record to cancel.
 * @param {boolean} [props.isAdmin=false] - Whether triggered by an administrator.
 */
const CancelBookingModal = ({
  isOpen,
  onClose,
  onConfirm,
  booking,
  isAdmin = false,
}) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Lock background scroll and handle Escape key while modal is active
  useEffect(() => {
    if (!isOpen || !booking) return;

    document.body.style.overflow = 'hidden';

    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && !loading) {
        onClose();
      }
    };

    window.addEventListener('keydown', handleKeyDown);

    return () => {
      document.body.style.overflow = '';
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, booking, loading, onClose]);

  // Reset state when booking changes or modal opens
  useEffect(() => {
    if (isOpen) {
      setError('');
      setLoading(false);
    }
  }, [isOpen, booking]);

  if (!isOpen || !booking) return null;

  const isPaid = booking.paymentStatus === 'paid';

  // Calculate refund amount
  let calculatedAmount = booking.amountPaid;
  if (!calculatedAmount && booking.roomId && booking.roomId.price) {
    const checkInDate = new Date(booking.checkIn);
    const checkOutDate = new Date(booking.checkOut);
    const nights = Math.max(1, Math.ceil((checkOutDate - checkInDate) / (1000 * 60 * 60 * 24)));
    calculatedAmount = nights * booking.roomId.price;
  }
  const displayAmount = calculatedAmount || 0;

  const handleConfirm = async () => {
    setError('');
    setLoading(true);
    try {
      await onConfirm(booking);
      onClose();
    } catch (err) {
      console.error('Cancellation error:', err);
      setError(err.response?.data?.error || err.message || 'Failed to cancel reservation.');
    } finally {
      setLoading(false);
    }
  };

  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget && !loading) {
      onClose();
    }
  };

  const modalContent = (
    <div
      className="modal-overlay"
      onClick={handleBackdropClick}
      tabIndex={-1}
      role="dialog"
      aria-modal="true"
      aria-labelledby="cancel-booking-modal-title"
    >
      <div
        className="modal-card"
        style={{
          maxWidth: '520px',
          padding: '1.75rem',
          borderRadius: '12px',
          background: '#ffffff',
          boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
        }}
      >
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
          <h2
            id="cancel-booking-modal-title"
            style={{
              fontSize: '1.25rem',
              color: '#dc2626',
              margin: 0,
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              fontWeight: 700,
            }}
          >
            <AlertTriangle size={22} color="#dc2626" />
            {isAdmin ? 'Admin Cancel Reservation' : 'Cancel Reservation'}
          </h2>
          <button
            type="button"
            className="btn-modal-close"
            onClick={onClose}
            disabled={loading}
            aria-label="Close modal"
            style={{
              background: 'none',
              border: 'none',
              cursor: loading ? 'not-allowed' : 'pointer',
              color: 'var(--text-muted, #64748b)',
              padding: '4px',
              borderRadius: '4px',
            }}
          >
            <X size={20} />
          </button>
        </div>

        {/* Error notification banner if any */}
        {error && (
          <div
            className="error-banner"
            style={{
              marginBottom: '1rem',
              fontSize: '0.875rem',
              padding: '0.75rem',
              background: '#fef2f2',
              border: '1px solid #fecaca',
              color: '#991b1b',
              borderRadius: '8px',
            }}
          >
            {error}
          </div>
        )}

        {/* Reservation summary card */}
        <div
          style={{
            background: '#f8fafc',
            border: '1px solid var(--border-color, #e2e8f0)',
            borderRadius: '8px',
            padding: '1rem',
            marginBottom: '1rem',
            fontSize: '0.9rem',
          }}
        >
          <div style={{ fontWeight: 600, color: 'var(--primary-color, #0f172a)', marginBottom: '0.5rem' }}>
            {booking.roomId?.type || 'Room'} Reservation
          </div>
          
          <div style={{ color: '#475569', display: 'flex', flexDirection: 'column', gap: '0.3rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              <strong>Guest:</strong> {booking.guestName} ({booking.guestPhone})
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              <Calendar size={14} color="#64748b" />
              <span>
                <strong>Stay:</strong> {formatDate(booking.checkIn)} → {formatDate(booking.checkOut)}
              </span>
            </div>
          </div>
        </div>

        {/* Refund or Policy Notice */}
        {isPaid ? (
          <div
            style={{
              background: '#f0fdf4',
              border: '1px solid #bbf7d0',
              borderRadius: '8px',
              padding: '0.85rem 1rem',
              marginBottom: '1.25rem',
              fontSize: '0.875rem',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontWeight: 600, color: '#166534', marginBottom: '0.25rem' }}>
              <RotateCcw size={16} /> Automated Razorpay Refund
            </div>
            <p style={{ margin: 0, color: '#14532d', lineHeight: 1.45 }}>
              A full refund of <strong>{formatPriceINR(displayAmount)}</strong> will be automatically initiated to the guest's original payment method. The refund status will update to <em>Processing</em> and synchronize once processed by Razorpay.
            </p>
          </div>
        ) : (
          <div
            style={{
              background: '#fefce8',
              border: '1px solid #fef08a',
              borderRadius: '8px',
              padding: '0.85rem 1rem',
              marginBottom: '1.25rem',
              fontSize: '0.875rem',
              color: '#854d0e',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontWeight: 600, marginBottom: '0.25rem' }}>
              <CreditCard size={16} /> Payment Pending
            </div>
            <p style={{ margin: 0, lineHeight: 1.45 }}>
              This reservation was not completed with a paid transaction. No charges will be processed, and the reserved room will be immediately released.
            </p>
          </div>
        )}

        {/* Warning text */}
        <p style={{ fontSize: '0.85rem', color: '#64748b', marginBottom: '1.5rem', lineHeight: 1.4 }}>
          <strong>Notice:</strong> This cancellation is permanent and cannot be undone. Room dates will immediately become available for other guests to book.
        </p>

        {/* Action buttons */}
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem' }}>
          <button
            type="button"
            className="btn-cancel"
            onClick={onClose}
            disabled={loading}
            style={{
              padding: '0.6rem 1.2rem',
              borderRadius: '8px',
              border: '1px solid var(--border-color, #cbd5e1)',
              backgroundColor: '#ffffff',
              color: 'var(--text-main, #334155)',
              cursor: loading ? 'not-allowed' : 'pointer',
              fontWeight: 600,
              fontSize: '0.9rem',
            }}
          >
            Keep Reservation
          </button>

          <button
            type="button"
            onClick={handleConfirm}
            disabled={loading}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.4rem',
              padding: '0.6rem 1.25rem',
              borderRadius: '8px',
              border: 'none',
              backgroundColor: '#dc2626',
              color: '#ffffff',
              cursor: loading ? 'not-allowed' : 'pointer',
              fontWeight: 600,
              fontSize: '0.9rem',
              boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
              opacity: loading ? 0.8 : 1,
            }}
          >
            {loading ? (
              <>
                <RotateCcw size={16} className="spin-animation" style={{ animation: 'spin 1s linear infinite' }} />
                <span>Cancelling...</span>
              </>
            ) : (
              <>
                <Ban size={16} />
                <span>Confirm Cancellation</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );

  return ReactDOM.createPortal(modalContent, document.body);
};

export default CancelBookingModal;
