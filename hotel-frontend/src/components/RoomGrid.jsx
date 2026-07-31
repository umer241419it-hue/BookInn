import React from 'react';
import RoomCard from './RoomCard';

const RoomGrid = ({ rooms, onBookRoom }) => {
  if (!rooms || rooms.length === 0) {
    return <div className="empty-state">No rooms available</div>;
  }

  return (
    <div className="room-grid">
      {rooms.map((room) => (
        <RoomCard key={room._id || room.number} room={room} onBookRoom={onBookRoom} />
      ))}
    </div>
  );
};

export default RoomGrid;
