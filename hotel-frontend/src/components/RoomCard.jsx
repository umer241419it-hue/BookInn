import React from 'react';
import { Pencil, Trash2 } from 'lucide-react';
import { formatPriceINR } from '../utils/formatCurrency';
import { useAuth } from '../context/AuthContext';

const RoomCard = ({ room, onBookRoom, onEditRoom, onDeleteRoom }) => {
  const { isAdmin } = useAuth();

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
        {isAdmin ? (
          <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.5rem' }}>
            <button
              type="button"
              className="btn-edit-room"
              onClick={() => onEditRoom && onEditRoom(room)}
              style={{
                flex: 1,
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '0.3rem',
                padding: '0.45rem 0.75rem',
                borderRadius: '6px',
                border: '1px solid var(--border-color)',
                backgroundColor: '#ffffff',
                color: 'var(--primary-color)',
                fontWeight: 600,
                fontSize: '0.85rem',
                cursor: 'pointer',
              }}
            >
              <Pencil size={14} /> Edit
            </button>
            <button
              type="button"
              className="btn-delete-room"
              onClick={() => onDeleteRoom && onDeleteRoom(room)}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '0.3rem',
                padding: '0.45rem 0.75rem',
                borderRadius: '6px',
                border: '1px solid #fca5a5',
                backgroundColor: '#fef2f2',
                color: '#dc2626',
                fontWeight: 600,
                fontSize: '0.85rem',
                cursor: 'pointer',
              }}
            >
              <Trash2 size={14} /> Delete
            </button>
          </div>
        ) : (
          <button
            type="button"
            className="btn-book-room"
            onClick={() => onBookRoom && onBookRoom(room)}
          >
            Book {room.type}
          </button>
        )}
      </div>
    </div>
  );
};

export default RoomCard;
