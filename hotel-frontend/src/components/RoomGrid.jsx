import React from 'react';
import RoomCard from './RoomCard';

const RoomGrid = ({ rooms, onBookRoom, onEditRoom, onDeleteRoom }) => {
  if (!rooms || rooms.length === 0) {
    return <div className="empty-state">No rooms available</div>;
  }

  return (
    <div className="room-grid">
      {rooms.map((room) => (
        <RoomCard
          key={room.type}
          room={room}
          onBookRoom={onBookRoom}
          onEditRoom={onEditRoom}
          onDeleteRoom={onDeleteRoom}
        />
      ))}
    </div>
  );
};

export default RoomGrid;
