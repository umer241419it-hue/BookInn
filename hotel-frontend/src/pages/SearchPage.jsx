import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { CheckCircle2 } from 'lucide-react';
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

  // Guest booking modal
  const [selectedRoom, setSelectedRoom] = useState(null);

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

  const handleBookingClick = (room) => {
    if (isAdmin) return;
    if (!isLoggedIn) {
      // Redirect logged-out user to login page
      navigate('/login', { state: { from: location } });
      return;
    }
    setSelectedRoom(room);
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
    fetchInitialRooms();
  };

  const handleDeleteConfirm = async (typeKey) => {
    const res = await deleteRoomType(typeKey);
    showToast(res.message || `Room type '${typeKey}' deleted successfully.`);
    fetchInitialRooms();
  };

  const roomTypes = useMemo(() => {
    if (!rooms || rooms.length === 0) return [];
    const types = rooms.map((room) => room.type).filter(Boolean);
    return Array.from(new Set(types));
  }, [rooms]);

  const totalInventoryCount = useMemo(() => {
    if (!rooms || rooms.length === 0) return 0;
    return rooms.reduce((acc, room) => acc + (room.count || 0), 0);
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

      <SearchForm onSearch={handleSearch} />

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
        <div className="loading-state">Loading rooms...</div>
      ) : (
        <RoomGrid
          rooms={filteredRooms}
          onBookRoom={handleBookingClick}
          onEditRoom={handleOpenEditModal}
          onDeleteRoom={(room) => setDeletingRoom(room)}
        />
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
