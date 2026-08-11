import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { CheckCircle2, Calendar, X, AlertTriangle } from 'lucide-react';
import SearchForm from '../components/SearchForm';
import FilterBar from '../components/FilterBar';
import RoomGrid from '../components/RoomGrid';
import BookingModal from '../components/BookingModal';
import RoomManagementToolbar from '../components/admin/RoomManagementToolbar';
import RoomFormModal from '../components/admin/RoomFormModal';
import DeleteRoomDialog from '../components/admin/DeleteRoomDialog';
import { getAllRooms, getAvailableRooms, createRoomType, updateRoomType, deleteRoomType } from '../api/rooms';
import { useAuth } from '../context/AuthContext';

const SearchPage = () => {
  const [rooms, setRooms] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [toastMessage, setToastMessage] = useState('');

  const { isLoggedIn, isAdmin } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  // Active search date range
  const [searchDates, setSearchDates] = useState({ checkIn: '', checkOut: '' });

  // Guest booking modal & Date prompt modal
  const [selectedRoom, setSelectedRoom] = useState(null);
  const [datePromptRoom, setDatePromptRoom] = useState(null);
  const [promptCheckIn, setPromptCheckIn] = useState('');
  const [promptCheckOut, setPromptCheckOut] = useState('');
  const [promptError, setPromptError] = useState('');

  // Admin Management Modal states
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [editingRoom, setEditingRoom] = useState(null);
  const [deletingRoom, setDeletingRoom] = useState(null);

  // Filter States
  const [selectedType, setSelectedType] = useState('All');
  const [minPrice, setMinPrice] = useState('');
  const [maxPrice, setMaxPrice] = useState('');
  const [minCapacity, setMinCapacity] = useState('All');

  useEffect(() => {
    fetchInitialRooms();
  }, []);

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage('');
    }, 4000);
  };

  const fetchInitialRooms = async () => {
    setLoading(true);
    setError('');
    try {
      const data = await getAllRooms();
      setRooms(data);
      setSearchDates({ checkIn: '', checkOut: '' });
    } catch (err) {
      console.error('Error fetching rooms:', err);
      setError(err.response?.data?.error || 'Failed to load rooms from backend.');
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = async (checkIn, checkOut) => {
    setSearchDates({ checkIn, checkOut });
    setLoading(true);
    setError('');
    try {
      const data = await getAvailableRooms(checkIn, checkOut);
      setRooms(data);
    } catch (err) {
      console.error('Error searching rooms:', err);
      setError(err.response?.data?.error || 'Failed to search available rooms.');
    } finally {
      setLoading(false);
    }
  };

  const handleClearDates = () => {
    fetchInitialRooms();
  };

  const handleBookingClick = (room) => {
    if (isAdmin) return;
    if (!isLoggedIn) {
      // Redirect logged-out user to login page
      navigate('/login', { state: { from: location } });
      return;
    }

    // Step 2 & 3: If dates are not set yet, prompt date selection first
    if (!searchDates.checkIn || !searchDates.checkOut) {
      const todayStr = new Date().toISOString().split('T')[0];
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      const tomorrowStr = tomorrow.toISOString().split('T')[0];

      setDatePromptRoom(room);
      setPromptCheckIn(todayStr);
      setPromptCheckOut(tomorrowStr);
      setPromptError('');
      return;
    }

    // Step 5: If dates are set, open final booking review & payment modal
    setSelectedRoom(room);
  };

  const handleDatePromptSubmit = async (e) => {
    e.preventDefault();
    setPromptError('');

    if (!promptCheckIn || !promptCheckOut) {
      setPromptError('Please select both Check-In and Check-Out dates.');
      return;
    }

    const todayStr = new Date().toISOString().split('T')[0];
    if (new Date(promptCheckIn) < new Date(todayStr)) {
      setPromptError('Check-In date cannot be in the past.');
      return;
    }

    if (new Date(promptCheckOut) <= new Date(promptCheckIn)) {
      setPromptError('Check-Out date must be after Check-In date.');
      return;
    }

    const roomToBook = datePromptRoom;
    const cIn = promptCheckIn;
    const cOut = promptCheckOut;
    setDatePromptRoom(null);

    // Call backend availability API with dates
    await handleSearch(cIn, cOut);

    // Proceed to booking modal if room is available
    if (roomToBook) {
      setSelectedRoom(roomToBook);
    }
  };

  const handleBookingSuccess = () => {
    if (searchDates.checkIn && searchDates.checkOut) {
      handleSearch(searchDates.checkIn, searchDates.checkOut);
    } else {
      fetchInitialRooms();
    }
  };

  // Admin handlers
  const handleOpenAddModal = () => {
    setEditingRoom(null);
    setIsFormModalOpen(true);
  };

  const handleOpenEditModal = (room) => {
    setEditingRoom(room);
    setIsFormModalOpen(true);
  };

  const handleFormModalSubmit = async (formData) => {
    if (editingRoom) {
      // Edit Room Type
      const res = await updateRoomType(editingRoom.type, formData);
      showToast(res.message || `Room type '${formData.type}' updated successfully.`);
    } else {
      // Create Room Type
      const res = await createRoomType(formData);
      showToast(res.message || `Room type '${formData.type}' created successfully.`);
    }
    if (searchDates.checkIn && searchDates.checkOut) {
      handleSearch(searchDates.checkIn, searchDates.checkOut);
    } else {
      fetchInitialRooms();
    }
  };

  const handleDeleteConfirm = async (typeKey) => {
    const res = await deleteRoomType(typeKey);
    showToast(res.message || `Room type '${typeKey}' deleted successfully.`);
    if (searchDates.checkIn && searchDates.checkOut) {
      handleSearch(searchDates.checkIn, searchDates.checkOut);
    } else {
      fetchInitialRooms();
    }
  };

  const roomTypes = useMemo(() => {
    if (!rooms || rooms.length === 0) return [];
    const types = rooms.map((room) => room.type).filter(Boolean);
    return Array.from(new Set(types));
  }, [rooms]);

  const totalInventoryCount = useMemo(() => {
    if (!rooms || rooms.length === 0) return 0;
    return rooms.reduce((acc, room) => acc + (room.totalCount || room.count || 0), 0);
  }, [rooms]);

  const filteredRooms = useMemo(() => {
    return rooms.filter((room) => {
      if (selectedType !== 'All' && room.type !== selectedType) {
        return false;
      }
      if (minCapacity !== 'All' && room.capacity < Number(minCapacity)) {
        return false;
      }
      if (minPrice !== '' && room.price < Number(minPrice)) {
        return false;
      }
      if (maxPrice !== '' && room.price > Number(maxPrice)) {
        return false;
      }
      return true;
    });
  }, [rooms, selectedType, minPrice, maxPrice, minCapacity]);

  const handleResetFilters = () => {
    setSelectedType('All');
    setMinPrice('');
    setMaxPrice('');
    setMinCapacity('All');
  };

  const hasDates = Boolean(searchDates.checkIn && searchDates.checkOut);

  return (
    <div className="search-page">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="success-banner" style={{ marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <CheckCircle2 size={18} /> {toastMessage}
        </div>
      )}

      {/* Admin Management Toolbar */}
      {isAdmin && (
        <RoomManagementToolbar
          onAddRoomType={handleOpenAddModal}
          totalTypes={rooms.length}
          totalInventory={totalInventoryCount}
        />
      )}

      <SearchForm
        onSearch={handleSearch}
        onClear={handleClearDates}
        activeCheckIn={searchDates.checkIn}
        activeCheckOut={searchDates.checkOut}
      />

      <FilterBar
        roomTypes={roomTypes}
        selectedType={selectedType}
        onTypeChange={setSelectedType}
        minPrice={minPrice}
        maxPrice={maxPrice}
        onMinPriceChange={setMinPrice}
        onMaxPriceChange={setMaxPrice}
        minCapacity={minCapacity}
        onCapacityChange={setMinCapacity}
        onResetFilters={handleResetFilters}
      />

      {error && <div className="error-banner">{error}</div>}

      {loading ? (
        <div className="loading-state">Loading rooms & availability...</div>
      ) : (
        <RoomGrid
          rooms={filteredRooms}
          hasDates={hasDates}
          onBookRoom={handleBookingClick}
          onEditRoom={handleOpenEditModal}
          onDeleteRoom={(room) => setDeletingRoom(room)}
        />
      )}

      {/* STEP 2 DATE PROMPT MODAL */}
      {datePromptRoom && (
        <div className="modal-overlay" onClick={() => setDatePromptRoom(null)}>
          <div className="modal-card" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '420px', padding: '1.5rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
              <h3 style={{ margin: 0, fontSize: '1.15rem', color: 'var(--primary-color)', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                <Calendar size={18} /> Select Stay Dates
              </h3>
              <button
                type="button"
                onClick={() => setDatePromptRoom(null)}
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#64748b' }}
              >
                <X size={18} />
              </button>
            </div>

            <p style={{ fontSize: '0.85rem', color: '#64748b', marginBottom: '1rem' }}>
              Please choose your check-in & check-out dates to check availability for <strong>{datePromptRoom.type} Room</strong>.
            </p>

            {promptError && (
              <div className="error-banner" style={{ marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                <AlertTriangle size={15} /> {promptError}
              </div>
            )}

            <form onSubmit={handleDatePromptSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div className="form-group">
                <label htmlFor="promptCheckIn">Check-In Date *</label>
                <input
                  type="date"
                  id="promptCheckIn"
                  min={new Date().toISOString().split('T')[0]}
                  value={promptCheckIn}
                  onChange={(e) => setPromptCheckIn(e.target.value)}
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="promptCheckOut">Check-Out Date *</label>
                <input
                  type="date"
                  id="promptCheckOut"
                  min={promptCheckIn || new Date().toISOString().split('T')[0]}
                  value={promptCheckOut}
                  onChange={(e) => setPromptCheckOut(e.target.value)}
                  required
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem', marginTop: '0.5rem' }}>
                <button
                  type="button"
                  className="btn-cancel"
                  onClick={() => setDatePromptRoom(null)}
                  style={{ padding: '0.55rem 1rem', borderRadius: '6px' }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn-submit"
                  style={{ padding: '0.55rem 1.25rem', borderRadius: '6px' }}
                >
                  Check Availability & Continue
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Guest Booking Modal */}
      {selectedRoom && (
        <BookingModal
          room={selectedRoom}
          initialCheckIn={searchDates.checkIn}
          initialCheckOut={searchDates.checkOut}
          onClose={() => setSelectedRoom(null)}
          onBookingSuccess={handleBookingSuccess}
        />
      )}

      {/* Admin Create/Edit Modal */}
      <RoomFormModal
        isOpen={isFormModalOpen}
        onClose={() => setIsFormModalOpen(false)}
        onSubmit={handleFormModalSubmit}
        initialData={editingRoom}
      />

      {/* Admin Delete Confirmation Dialog */}
      <DeleteRoomDialog
        isOpen={Boolean(deletingRoom)}
        onClose={() => setDeletingRoom(null)}
        onConfirm={handleDeleteConfirm}
        roomType={deletingRoom}
      />
    </div>
  );
};

export default SearchPage;
