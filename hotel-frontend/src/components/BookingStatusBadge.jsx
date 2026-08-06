import React from 'react';

export const PaymentStatusBadge = ({ status }) => {
  const paymentStatus = (status || 'pending').toLowerCase();
  if (paymentStatus === 'paid') {
    return <span className="booking-status-badge badge-paid">Paid</span>;
  }
  if (paymentStatus === 'failed') {
    return <span className="booking-status-badge badge-failed">Payment Failed</span>;
  }
  return <span className="booking-status-badge badge-pending">Payment Pending</span>;
};

export const RefundStatusBadge = ({ status }) => {
  const refundStatus = (status || '').toLowerCase();
  if (refundStatus === 'processed') {
    return <span className="booking-status-badge badge-refund-processed">Refund Processed</span>;
  }
  if (refundStatus === 'processing') {
    return <span className="booking-status-badge badge-refund-processing">Refund Processing</span>;
  }
  if (refundStatus === 'failed') {
    return <span className="booking-status-badge badge-refund-failed">Refund Failed</span>;
  }
  return null;
};

export const BookingStatusBadge = ({ status }) => {
  const bookingStatus = (status || 'pending').toLowerCase();
  if (bookingStatus === 'cancelled') {
    return <span className="booking-status-badge badge-cancelled">CANCELLED</span>;
  }
  if (bookingStatus === 'confirmed') {
    return <span className="booking-status-badge badge-confirmed">CONFIRMED</span>;
  }
  return <span className="booking-status-badge badge-pending">PENDING</span>;
};

const BookingStatusGroup = ({ paymentStatus, refundStatus, bookingStatus }) => {
  return (
    <div className="booking-status-group" style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', flexWrap: 'wrap' }}>
      <PaymentStatusBadge status={paymentStatus} />
      {refundStatus && refundStatus !== 'none' && <RefundStatusBadge status={refundStatus} />}
      <BookingStatusBadge status={bookingStatus} />
    </div>
  );
};

export default BookingStatusGroup;
