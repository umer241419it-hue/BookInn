import React, { useState, useEffect, useRef } from 'react';
import { useSearchParams } from 'react-router-dom';
import { RotateCcw, Hotel, DoorClosed, CalendarCheck, CalendarDays, Ban, Calendar, Filter, AlertTriangle, CreditCard, X, BedDouble, IndianRupee } from 'lucide-react';

import { getAllBookings, cancelBooking } from '../api/bookings';
import { getRoomStats, getAllRooms } from '../api/rooms';
import { formatPriceINR } from '../utils/formatCurrency';
import { formatDateTime } from '../utils/formatDate';
import BookingStatusGroup from '../components/BookingStatusBadge';
import Logo from '../components/Logo';
import CopyButton from '../components/CopyButton';
import CancelBookingModal from '../components/CancelBookingModal';

const AdminBookingsPage = () => {
  const [bookings, setBookings] = useState([]);
  const [roomStats, setRoomStats] = useState({ totalRooms: 0, bookedRooms: 0, availableRooms: 0, activeBookings: 0 });
  const [loading, setLoading] = useState(true);
  const [searchParams, setSearchParams] = useSearchParams();

  const tabParam = searchParams.get('tab');
  const activeTab = tabParam === 'cancelled' || tabParam === 'refunds' ? 'refunds' : 'bookings';

  const handleTabChange = (tabKey) => {
    const paramValue = tabKey === 'refunds' ? 'cancelled' : 'booked';
    setSearchParams({ tab: paramValue }, { replace: true });
  };

  const [bookingToCancel, setBookingToCancel] = useState(null);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterPayment, setFilterPayment] = useState('all');

  // Independent Filter States (Booked Date, Stay Date, Room Type, Status, Payment)
  const [bookedDatePreset, setBookedDatePreset] = useState('all');
  const [stayDatePreset, setStayDatePreset] = useState('all');
  const [roomCategories, setRoomCategories] = useState([]);
  const [selectedRoomType, setSelectedRoomType] = useState('all');

  // Filter Popover state & outside click handler
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const filterRef = useRef(null);

  useEffect(() => {
    fetchStats();
  }, []);

  useEffect(() => {
    fetchBookings();
  }, [bookedDatePreset, stayDatePreset, selectedRoomType]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (filterRef.current && !filterRef.current.contains(event.target)) {
        setIsFilterOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const activeFilterCount = [
    bookedDatePreset !== 'all',
    stayDatePreset !== 'all',
    selectedRoomType !== 'all',
    filterStatus !== 'all',
    filterPayment !== 'all',
  ].filter(Boolean).length;

  const fetchStats = async () => {
    try {
      const stats = await getRoomStats();
      setRoomStats(stats);
      const roomsData = await getAllRooms();
      const types = roomsData.map((r) => r.type).filter(Boolean);
      setRoomCategories(types);
    } catch (err) {
      console.error('Error fetching room stats/types:', err);
    }
  };

  const fetchBookings = async () => {
    setLoading(true);
    setError('');
    try {
      const params = {};
      if (bookedDatePreset && bookedDatePreset !== 'all') params.bookedPeriod = bookedDatePreset;
      if (stayDatePreset && stayDatePreset !== 'all') params.stayPeriod = stayDatePreset;
      if (selectedRoomType && selectedRoomType !== 'all') params.roomType = selectedRoomType;

      const data = await getAllBookings(params);
      setBookings(data);
    } catch (err) {
      console.error('Error fetching admin bookings:', err);
      setError(err.response?.data?.error || 'Failed to load bookings.');
    } finally {
      setLoading(false);
    }
  };

  const handleBookedPresetChange = (val) => {
    setBookedDatePreset(val);
  };

  const handleStayPresetChange = (val) => {
    setStayDatePreset(val);
  };

  const handleRoomTypeChange = (val) => {
    setSelectedRoomType(val);
  };

  const handleClearAllFilters = () => {
    setBookedDatePreset('all');
    setStayDatePreset('all');
    setSelectedRoomType('all');
    setFilterStatus('all');
    setFilterPayment('all');
  };






  const truncateId = (id) => {
    if (!id) return '';
    if (id.length <= 10) return id;
    return `${id.slice(0, 6)}...${id.slice(-4)}`;
  };

  const handleOpenCancelModal = (booking) => {
    setBookingToCancel(booking);
  };

  const handleConfirmCancel = async (booking) => {
    setError('');
    setSuccessMsg('');
    const res = await cancelBooking(booking._id);
    const refundMsg = res.refund
      ? `Booking cancelled. Razorpay refund (${formatPriceINR(res.refund.amount)}) initiated (${res.refund.status}).`
      : res.message || 'Booking cancelled successfully.';

    setSuccessMsg(refundMsg);
    await fetchBookings();
    await fetchStats();
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return '';
    return new Date(dateStr).toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const bookedBookings = bookings.filter((b) => b.status !== 'cancelled');
  const cancelledBookings = bookings.filter((b) => b.status === 'cancelled');
  const tabBookings = activeTab === 'refunds' ? cancelledBookings : bookedBookings;

  const filteredBookings = tabBookings.filter((b) => {
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
        <p style={{ color: 'var(--text-muted)' }}>Overview of all system bookings, status tracking, and room statistics.</p>
      </div>

      {/* DASHBOARD ROOM STAT CARDS */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', marginBottom: '1.75rem' }}>
        <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '1.25rem', boxShadow: '0 2px 8px rgba(0,0,0,0.04)', display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <div style={{ width: '48px', height: '48px', borderRadius: '10px', background: '#e0e7ff', color: '#4f46e5', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Hotel size={24} />
          </div>
          <div>
            <span style={{ fontSize: '0.85rem', color: '#64748b', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px' }}>Total Rooms</span>
            <h2 style={{ margin: 0, fontSize: '1.8rem', color: '#0f172a', fontWeight: 700 }}>{roomStats.totalRooms}</h2>
          </div>
        </div>

        <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '1.25rem', boxShadow: '0 2px 8px rgba(0,0,0,0.04)', display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <div style={{ width: '48px', height: '48px', borderRadius: '10px', background: '#fee2e2', color: '#dc2626', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <DoorClosed size={24} />
          </div>
          <div>
            <span style={{ fontSize: '0.85rem', color: '#64748b', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px' }}>Booked Rooms</span>
            <h2 style={{ margin: 0, fontSize: '1.8rem', color: '#dc2626', fontWeight: 700 }}>{roomStats.bookedRooms}</h2>
          </div>
        </div>

        <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '1.25rem', boxShadow: '0 2px 8px rgba(0,0,0,0.04)', display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <div style={{ width: '48px', height: '48px', borderRadius: '10px', background: '#dcfce7', color: '#16a34a', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <CalendarCheck size={24} />
          </div>
          <div>
            <span style={{ fontSize: '0.85rem', color: '#64748b', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px' }}>Available Rooms</span>
            <h2 style={{ margin: 0, fontSize: '1.8rem', color: '#16a34a', fontWeight: 700 }}>{roomStats.availableRooms}</h2>
          </div>
        </div>

        <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '1.25rem', boxShadow: '0 2px 8px rgba(0,0,0,0.04)', display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <div style={{ width: '48px', height: '48px', borderRadius: '10px', background: '#e0e7ff', color: '#4f46e5', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <IndianRupee size={24} />
          </div>
          <div>
            <span style={{ fontSize: '0.85rem', color: '#64748b', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px' }}>Monthly Revenue</span>
            <h2 style={{ margin: 0, fontSize: '1.8rem', color: '#4f46e5', fontWeight: 700 }}>{formatPriceINR(roomStats.monthlyRevenue || 0)}</h2>
          </div>
        </div>
      </div>

      {error && <div className="error-banner">{error}</div>}
      {successMsg && <div className="success-banner">{successMsg}</div>}

      {/* Tab Navigation & Filters Toolbar */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem', borderBottom: '1px solid #e2e8f0', flexWrap: 'wrap', gap: '1rem' }}>
        <div style={{ display: 'flex', gap: '1rem' }}>
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

        {/* SINGLE COLLAPSIBLE "FILTERS" BUTTON & POPOVER PANEL */}
        <div style={{ position: 'relative', marginBottom: '0.5rem' }} ref={filterRef}>
          <button
            type="button"
            onClick={() => setIsFilterOpen((prev) => !prev)}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.4rem',
              padding: '0.5rem 1rem',
              borderRadius: '8px',
              border: activeFilterCount > 0 ? '1px solid #6366f1' : '1px solid #cbd5e1',
              backgroundColor: isFilterOpen ? '#f1f5f9' : '#ffffff',
              color: activeFilterCount > 0 ? '#4f46e5' : '#334155',
              fontWeight: 600,
              fontSize: '0.875rem',
              cursor: 'pointer',
              boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
              transition: 'all 0.2s ease',
            }}
          >
            <Filter size={16} /> Filters
            {activeFilterCount > 0 && (
              <span
                style={{
                  backgroundColor: '#4f46e5',
                  color: '#ffffff',
                  fontSize: '0.75rem',
                  fontWeight: 700,
                  padding: '0.1rem 0.45rem',
                  borderRadius: '10px',
                  lineHeight: 1,
                  marginLeft: '0.25rem',
                }}
              >
                {activeFilterCount}
              </span>
            )}
          </button>

          {/* FILTER POPOVER PANEL */}
          {isFilterOpen && (
            <div
              className="filter-popover-panel"
              style={{
                position: 'absolute',
                top: 'calc(100% + 8px)',
                right: 0,
                width: '320px',
                maxWidth: '90vw',
                backgroundColor: '#ffffff',
                borderRadius: '12px',
                border: '1px solid #e2e8f0',
                boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.05)',
                zIndex: 100,
                padding: '1.25rem',
                display: 'flex',
                flexDirection: 'column',
                gap: '1.15rem',
              }}
            >
              {/* Header */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingBottom: '0.6rem', borderBottom: '1px solid #f1f5f9' }}>
                <h3 style={{ margin: 0, fontSize: '0.95rem', fontWeight: 700, color: '#0f172a', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                  <Filter size={16} style={{ color: 'var(--primary-color)' }} /> Filters
                </h3>
                <button
                  type="button"
                  onClick={() => setIsFilterOpen(false)}
                  style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#64748b', padding: '2px', display: 'flex', alignItems: 'center' }}
                  aria-label="Close filters panel"
                >
                  <X size={18} />
                </button>
              </div>

              {/* 1. Booked Date Filter (createdAt) */}
              <div>
                <label htmlFor="bookedPeriodFilter" style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontWeight: 600, fontSize: '0.875rem', color: '#1e293b', marginBottom: '0.15rem' }}>
                  <CalendarCheck size={16} style={{ color: '#4f46e5' }} /> Booked Date
                </label>
                <span style={{ fontSize: '0.75rem', color: '#64748b', display: 'block', marginBottom: '0.35rem' }}>
                  Date the reservation was created
                </span>
                <select
                  id="bookedPeriodFilter"
                  value={bookedDatePreset}
                  onChange={(e) => handleBookedPresetChange(e.target.value)}
                  style={{ width: '100%', padding: '0.45rem 0.6rem', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '0.85rem' }}
                >
                  <option value="all">All Bookings</option>
                  <option value="today">Today</option>
                  <option value="this_week">This Week</option>
                  <option value="this_month">This Month</option>
                </select>
              </div>

              {/* 2. Check-in Date Filter (checkIn date only) */}
              <div>
                <label htmlFor="stayPeriodFilter" style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontWeight: 600, fontSize: '0.875rem', color: '#1e293b', marginBottom: '0.15rem' }}>
                  <CalendarDays size={16} style={{ color: '#0284c7' }} /> Check-in Date
                </label>
                <span style={{ fontSize: '0.75rem', color: '#64748b', display: 'block', marginBottom: '0.35rem' }}>
                  Date the guest is scheduled to check in
                </span>

                <select
                  id="stayPeriodFilter"
                  value={stayDatePreset}
                  onChange={(e) => handleStayPresetChange(e.target.value)}
                  style={{ width: '100%', padding: '0.45rem 0.6rem', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '0.85rem' }}
                >
                  <option value="all">All Bookings</option>
                  <option value="today">Today</option>
                  <option value="this_week">This Week</option>
                  <option value="this_month">This Month</option>
                </select>
              </div>

              {/* 3. Room Type Filter (dynamically fetched room categories) */}
              <div>
                <label htmlFor="roomTypeFilter" style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontWeight: 600, fontSize: '0.875rem', color: '#1e293b', marginBottom: '0.15rem' }}>
                  <BedDouble size={16} style={{ color: '#e11d48' }} /> Room Type
                </label>
                <span style={{ fontSize: '0.75rem', color: '#64748b', display: 'block', marginBottom: '0.35rem' }}>
                  Filter by room category
                </span>
                <select
                  id="roomTypeFilter"
                  value={selectedRoomType}
                  onChange={(e) => handleRoomTypeChange(e.target.value)}
                  style={{ width: '100%', padding: '0.45rem 0.6rem', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '0.85rem' }}
                >
                  <option value="all">All Room Types</option>
                  {roomCategories.map((type) => (
                    <option key={type} value={type}>
                      {type}
                    </option>
                  ))}
                </select>
              </div>

              {/* 4. Booking Status Filter */}
              <div>
                <label htmlFor="statusFilter" style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontWeight: 600, fontSize: '0.875rem', color: '#1e293b', marginBottom: '0.35rem' }}>
                  <Filter size={16} style={{ color: '#16a34a' }} /> Booking Status
                </label>
                <select
                  id="statusFilter"
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                  style={{ width: '100%', padding: '0.45rem 0.6rem', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '0.85rem' }}
                >
                  <option value="all">All Statuses</option>
                  <option value="pending">Pending</option>
                  <option value="confirmed">Confirmed</option>
                  <option value="cancelled">Cancelled</option>
                </select>
              </div>


              {/* 4. Payment Status Filter */}
              <div>
                <label htmlFor="paymentFilter" style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontWeight: 600, fontSize: '0.875rem', color: '#1e293b', marginBottom: '0.35rem' }}>
                  <CreditCard size={16} style={{ color: '#9333ea' }} /> Payment Status
                </label>
                <select
                  id="paymentFilter"
                  value={filterPayment}
                  onChange={(e) => setFilterPayment(e.target.value)}
                  style={{ width: '100%', padding: '0.45rem 0.6rem', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '0.85rem' }}
                >
                  <option value="all">All Payments</option>
                  <option value="pending">Pending</option>
                  <option value="paid">Paid</option>
                  <option value="failed">Failed</option>
                </select>
              </div>

              {/* Clear All Filters Button */}
              {activeFilterCount > 0 && (
                <div style={{ paddingTop: '0.6rem', borderTop: '1px solid #f1f5f9' }}>
                  <button
                    type="button"
                    onClick={handleClearAllFilters}
                    style={{
                      width: '100%',
                      display: 'inline-flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '0.4rem',
                      padding: '0.45rem 0.75rem',
                      borderRadius: '6px',
                      border: '1px solid #cbd5e1',
                      background: '#ffffff',
                      color: '#64748b',
                      fontWeight: 600,
                      fontSize: '0.85rem',
                      cursor: 'pointer',
                    }}
                  >
                    <RotateCcw size={14} /> Clear Filters
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>




      {loading ? (
        <div className="loading-state">Loading system bookings...</div>
      ) : filteredBookings.length === 0 ? (
        <div className="empty-state">
          {activeTab === 'refunds' ? 'No cancelled bookings match the selected date/status filters.' : 'No active bookings match the selected date/status filters.'}
        </div>
      ) : (
        <div className="bookings-list" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {filteredBookings.map((booking) => {
            const roomObj = booking.roomId;
            const roomImage = roomObj?.images?.[0] || 'https://images.unsplash.com/photo-1590490360182-c33d57733427?auto=format&fit=crop&w=400&q=80';

            return (
              <div key={booking._id} className="booking-card" style={{ background: '#fff', padding: '1.25rem', borderRadius: '10px', border: '1px solid var(--border-color)', boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}>
                <div className="booking-card-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '0.5rem', marginBottom: '0.75rem' }}>
                  <div>
                    <h3 style={{ margin: 0, fontSize: '1.15rem', color: '#0f172a', fontWeight: 600 }}>
                      {booking.guestName}
                      <span style={{ fontSize: '0.85rem', color: '#64748b', fontWeight: 400, marginLeft: '0.5rem' }}>
                        ({booking.guestPhone})
                      </span>
                    </h3>

                    {/* BOOKED ROOM DETAILS (ROBUST POPULATED DISPLAY) */}
                    {roomObj ? (
                      <div style={{ margin: '0.35rem 0 0 0', display: 'flex', alignItems: 'center', gap: '0.6rem', flexWrap: 'wrap' }}>
                        <img
                          src={roomImage}
                          alt="Room Thumbnail"
                          style={{ width: '38px', height: '28px', borderRadius: '4px', objectFit: 'cover', border: '1px solid #cbd5e1' }}
                          onError={(e) => {
                            e.target.src = 'https://images.unsplash.com/photo-1590490360182-c33d57733427?auto=format&fit=crop&w=400&q=80';
                          }}
                        />
                        <span style={{ background: '#f1f5f9', color: '#334155', padding: '0.15rem 0.5rem', borderRadius: '4px', fontWeight: 600, fontSize: '0.8rem' }}>
                          {roomObj.type} Room
                        </span>
                        <span style={{ fontSize: '0.85rem', color: '#475569', fontWeight: 500 }}>
                          • {formatPriceINR(roomObj.price)} / night
                        </span>

                      </div>
                    ) : (
                      <div style={{ margin: '0.35rem 0 0 0', background: '#fff1f2', border: '1px solid #fecdd3', color: '#e11d48', padding: '0.25rem 0.6rem', borderRadius: '6px', fontSize: '0.8rem', display: 'inline-flex', alignItems: 'center', gap: '0.3rem' }}>
                        <AlertTriangle size={14} /> Room Information Unavailable (Room record removed)
                      </div>
                    )}
                  </div>
                  <BookingStatusGroup
                    paymentStatus={booking.paymentStatus}
                    refundStatus={booking.refundStatus}
                    bookingStatus={booking.status}
                  />
                </div>

                <div className="booking-card-body" style={{ fontSize: '0.9rem', color: '#334155' }}>
                  <p style={{ margin: '0.2rem 0' }}>
                    <strong>User Account:</strong> {booking.userId?.name || 'Guest User'} ({booking.userId?.email || 'N/A'})
                  </p>
                  <p style={{ margin: '0.2rem 0' }}>
                    <strong>Check-In:</strong> {formatDate(booking.checkIn)} | <strong>Check-Out:</strong> {formatDate(booking.checkOut)}
                  </p>
                  <p style={{ margin: '0.2rem 0', color: '#64748b' }}>
                    <strong>Booking Created Date:</strong> {formatDateTime(booking.createdAt)}
                  </p>

                  <div style={{ margin: '0.5rem 0', display: 'flex', gap: '1rem', flexWrap: 'wrap', fontSize: '0.85rem', background: '#f8fafc', padding: '0.5rem 0.75rem', borderRadius: '6px' }}>
                    {booking.razorpayOrderId && (
                      <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.3rem' }}>
                        <strong>Order ID:</strong> <code>{truncateId(booking.razorpayOrderId)}</code>
                        <CopyButton text={booking.razorpayOrderId} label="Order ID" />
                      </span>
                    )}

                    {booking.razorpayPaymentId && (
                      <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.3rem' }}>
                        <strong>Payment ID:</strong> <code>{truncateId(booking.razorpayPaymentId)}</code>
                        <CopyButton text={booking.razorpayPaymentId} label="Payment ID" />
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
                          <CopyButton text={booking.razorpayRefundId} label="Refund ID" />
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

                <div className="booking-card-footer" style={{ marginTop: '1rem', borderTop: '1px solid var(--border-color)', paddingTop: '1rem' }}>
                  {booking.status !== 'cancelled' && (
                    <button
                      type="button"
                      className="btn-cancel-booking"
                      onClick={() => handleOpenCancelModal(booking)}
                    >
                      Admin Cancel
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Admin Booking Cancellation Modal Dialog */}
      <CancelBookingModal
        isOpen={Boolean(bookingToCancel)}
        onClose={() => setBookingToCancel(null)}
        onConfirm={handleConfirmCancel}
        booking={bookingToCancel}
        isAdmin={true}
      />
    </div>
  );
};

export default AdminBookingsPage;

