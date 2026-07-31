import React, { useState, useEffect, useMemo } from 'react';
import SearchForm from '../components/SearchForm';
import FilterBar from '../components/FilterBar';
import RoomGrid from '../components/RoomGrid';
import BookingModal from '../components/BookingModal';
import { getAllRooms, getAvailableRooms } from '../api/rooms';

const SearchPage = () => {
  const [rooms, setRooms] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Active search date range
  const [searchDates, setSearchDates] = useState({ checkIn: '', checkOut: '' });

  // Selected room for modal
  const [selectedRoom, setSelectedRoom] = useState(null);

  // Filter States
  const [selectedType, setSelectedType] = useState('All');
  const [minPrice, setMinPrice] = useState('');
  const [maxPrice, setMaxPrice] = useState('');
  const [minCapacity, setMinCapacity] = useState('All');

  useEffect(() => {
    fetchInitialRooms();
  }, []);

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

  const handleBookingSuccess = () => {
    // Re-fetch room list to update available rooms
    if (searchDates.checkIn && searchDates.checkOut) {
      handleSearch(searchDates.checkIn, searchDates.checkOut);
    } else {
      fetchInitialRooms();
    }
  };

  // Dynamically derive distinct room types from current rooms array
  const roomTypes = useMemo(() => {
    if (!rooms || rooms.length === 0) return [];
    const types = rooms.map((room) => room.type).filter(Boolean);
    return Array.from(new Set(types));
  }, [rooms]);

  // Client-side filtering of rooms
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
        <RoomGrid rooms={filteredRooms} onBookRoom={(room) => setSelectedRoom(room)} />
      )}

      {selectedRoom && (
        <BookingModal
          room={selectedRoom}
          initialCheckIn={searchDates.checkIn}
          initialCheckOut={searchDates.checkOut}
          onClose={() => setSelectedRoom(null)}
          onBookingSuccess={handleBookingSuccess}
        />
      )}
    </div>
  );
};

export default SearchPage;
