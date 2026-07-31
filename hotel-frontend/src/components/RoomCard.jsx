import React from 'react';
import { formatPriceINR } from '../utils/formatCurrency';

const RoomCard = ({ room, onBookRoom }) => {
  if (!room) return null;

  // room prop holds category summary object: { type, price, capacity, count, roomIds }
  return (
    <div className="room-card">
      <div>
        <div className="room-card-header">
          <span className="room-title">{room.type} Room</span>
          <span className="room-count-badge">
            {room.count} {room.count === 1 ? 'room available' : 'rooms available'}
          </span>
        </div>
        <div className="room-details">
          <p>
            <strong>Capacity:</strong> {room.capacity} {room.capacity === 1 ? 'Guest' : 'Guests'}
          </p>
        </div>
      </div>
      <div>
        <div className="room-price-tag">
          {formatPriceINR(room.price)} <span>/ night</span>
        </div>
        <button
          type="button"
          className="btn-book-room"
          onClick={() => onBookRoom && onBookRoom(room)}
        >
          Book {room.type}
        </button>
      </div>
    </div>
  );
};

export default RoomCard;
