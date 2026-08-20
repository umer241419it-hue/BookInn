import React, { useState } from 'react';
import { Pencil, Trash2, Users, CheckCircle2, Ban, ChevronLeft, ChevronRight, Hotel, Calendar } from 'lucide-react';
import { formatPriceINR } from '../utils/formatCurrency';
import { useAuth } from '../context/AuthContext';
import { getFullImageUrl } from '../utils/imageHelper';

const DEFAULT_ROOM_IMAGES = {
  suite: 'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?auto=format&fit=crop&w=800&q=80',
  deluxe: 'https://images.unsplash.com/photo-1618773928121-c32242e63f39?auto=format&fit=crop&w=800&q=80',
  standard: 'https://images.unsplash.com/photo-1590490360182-c33d57733427?auto=format&fit=crop&w=800&q=80',
  fallback: 'https://images.unsplash.com/photo-1566665797739-1674de7a421a?auto=format&fit=crop&w=800&q=80',
};

const getFallbackImage = (type = '') => {
  const lower = type.toLowerCase();
  if (lower.includes('suite') || lower.includes('executive')) return DEFAULT_ROOM_IMAGES.suite;
  if (lower.includes('deluxe') || lower.includes('luxury')) return DEFAULT_ROOM_IMAGES.deluxe;
  if (lower.includes('standard') || lower.includes('classic')) return DEFAULT_ROOM_IMAGES.standard;
  return DEFAULT_ROOM_IMAGES.fallback;
};

const RoomCard = ({ room, hasDates = false, onBookRoom, onEditRoom, onDeleteRoom }) => {
  const { isAdmin } = useAuth();
  const [currentImgIndex, setCurrentImgIndex] = useState(0);

  if (!room) return null;

  // Compute room image gallery
  const rawImages = room.images && room.images.length > 0 ? room.images : [getFallbackImage(room.type)];
  const displayImages = rawImages.filter(Boolean);

  const handlePrevImg = (e) => {
    e.stopPropagation();
    setCurrentImgIndex((prev) => (prev === 0 ? displayImages.length - 1 : prev - 1));
  };

  const handleNextImg = (e) => {
    e.stopPropagation();
    setCurrentImgIndex((prev) => (prev === displayImages.length - 1 ? 0 : prev + 1));
  };

  // Availability computations
  const total = room.totalCount || room.count || 0;
  const available = room.availableCount !== undefined ? room.availableCount : room.count;
  const isAvailable = room.isAvailable !== undefined ? room.isAvailable : available > 0;

  return (
    <div className="room-card" style={{ display: 'flex', flexDirection: 'column', overflow: 'hidden', borderRadius: '12px', background: '#ffffff', border: '1px solid var(--border-color)', boxShadow: '0 4px 12px rgba(0,0,0,0.05)' }}>
      {/* ROOM IMAGE CAROUSEL / COVER */}
      <div style={{ position: 'relative', width: '100%', height: '210px', backgroundColor: '#f1f5f9', overflow: 'hidden' }}>
        <img
          src={getFullImageUrl(displayImages[currentImgIndex]) || getFallbackImage(room.type)}
          alt={`${room.type} Room`}
          style={{ width: '100%', height: '100%', objectFit: 'cover', transition: 'all 0.3s ease' }}
          onError={(e) => {
            e.target.src = getFallbackImage(room.type);
          }}
        />


        {/* Carousel Navigation Arrows if multiple images */}
        {displayImages.length > 1 && (
          <>
            <button
              type="button"
              onClick={handlePrevImg}
              aria-label="Previous Image"
              style={{
                position: 'absolute',
                left: '8px',
                top: '50%',
                transform: 'translateY(-50%)',
                background: 'rgba(0, 0, 0, 0.5)',
                color: '#ffffff',
                border: 'none',
                borderRadius: '50%',
                width: '30px',
                height: '30px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
              }}
            >
              <ChevronLeft size={18} />
            </button>

            <button
              type="button"
              onClick={handleNextImg}
              aria-label="Next Image"
              style={{
                position: 'absolute',
                right: '8px',
                top: '50%',
                transform: 'translateY(-50%)',
                background: 'rgba(0, 0, 0, 0.5)',
                color: '#ffffff',
                border: 'none',
                borderRadius: '50%',
                width: '30px',
                height: '30px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
              }}
            >
              <ChevronRight size={18} />
            </button>

            {/* Indicator Dots */}
            <div style={{ position: 'absolute', bottom: '8px', left: 0, right: 0, display: 'flex', justifyContent: 'center', gap: '4px' }}>
              {displayImages.map((_, idx) => (
                <span
                  key={idx}
                  style={{
                    width: idx === currentImgIndex ? '16px' : '6px',
                    height: '6px',
                    borderRadius: '3px',
                    background: idx === currentImgIndex ? '#ffffff' : 'rgba(255, 255, 255, 0.5)',
                    transition: 'all 0.2s ease',
                  }}
                />
              ))}
            </div>
          </>
        )}

        {/* AVAILABILITY BADGE TOP-LEFT */}
        <div style={{ position: 'absolute', top: '12px', left: '12px' }}>
          {hasDates ? (
            isAvailable ? (
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', background: 'rgba(34, 197, 94, 0.95)', color: '#ffffff', fontSize: '0.75rem', fontWeight: 700, padding: '4px 10px', borderRadius: '20px', backdropFilter: 'blur(4px)' }}>
                <CheckCircle2 size={13} /> Available ({available} left)
              </span>
            ) : (
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', background: 'rgba(239, 68, 68, 0.95)', color: '#ffffff', fontSize: '0.75rem', fontWeight: 700, padding: '4px 10px', borderRadius: '20px', backdropFilter: 'blur(4px)' }}>
                <Ban size={13} /> Booked for Dates
              </span>
            )
          ) : (
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', background: 'rgba(99, 102, 241, 0.9)', color: '#ffffff', fontSize: '0.75rem', fontWeight: 700, padding: '4px 10px', borderRadius: '20px', backdropFilter: 'blur(4px)' }}>
              <Hotel size={13} /> {total} {total === 1 ? 'Room' : 'Rooms Total'}
            </span>
          )}
        </div>
      </div>

      {/* CARD BODY */}
      <div style={{ padding: '1.25rem', display: 'flex', flexDirection: 'column', flex: 1, justifyContent: 'space-between' }}>
        <div>
          <div className="room-card-header" style={{ marginBottom: '0.5rem' }}>
            <span className="room-title" style={{ fontSize: '1.2rem', fontWeight: 700, color: 'var(--primary-color)' }}>
              {room.type} Room
            </span>
          </div>

          <div className="room-details" style={{ display: 'flex', alignItems: 'center', gap: '1rem', color: '#64748b', fontSize: '0.9rem', marginBottom: '1rem' }}>
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
              <Users size={15} /> Up to {room.capacity} {room.capacity === 1 ? 'Guest' : 'Guests'}
            </span>
          </div>
        </div>

        <div>
          <div className="room-price-tag" style={{ marginBottom: '1rem' }}>
            <strong style={{ fontSize: '1.4rem', color: '#0f172a' }}>{formatPriceINR(room.price)}</strong>
            <span style={{ color: '#64748b', fontSize: '0.85rem' }}> / night</span>
          </div>

          {isAdmin ? (
            <div style={{ display: 'flex', gap: '0.5rem' }}>
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
                  padding: '0.6rem 0.85rem',
                  borderRadius: '8px',
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
                  padding: '0.6rem 0.85rem',
                  borderRadius: '8px',
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
              disabled={hasDates && !isAvailable}
              onClick={() => onBookRoom && onBookRoom(room)}
              style={{
                width: '100%',
                padding: '0.7rem',
                borderRadius: '8px',
                fontWeight: 600,
                fontSize: '0.95rem',
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '0.4rem',
                backgroundColor: hasDates && !isAvailable ? '#cbd5e1' : '#6366f1',
                color: '#ffffff',
                border: 'none',
                cursor: hasDates && !isAvailable ? 'not-allowed' : 'pointer',
                opacity: hasDates && !isAvailable ? 0.7 : 1,
              }}
            >
              {hasDates && !isAvailable ? (
                <>
                  <Ban size={16} /> Booked for Dates
                </>
              ) : hasDates ? (
                <>
                  <CheckCircle2 size={16} /> Book {room.type}
                </>
              ) : (
                <>
                  <Calendar size={16} /> Select Dates & Book
                </>
              )}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default RoomCard;

