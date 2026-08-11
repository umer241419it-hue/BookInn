import React, { useState, useEffect } from 'react';
import ReactDOM from 'react-dom';
import { X, Save, AlertCircle, Image as ImageIcon, Plus, Trash2, Star } from 'lucide-react';

const PRESET_IMAGES = [
  { name: 'Interior', url: 'https://images.unsplash.com/photo-1618773928121-c32242e63f39?auto=format&fit=crop&w=800&q=80' },
  { name: 'Balcony/View', url: 'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?auto=format&fit=crop&w=800&q=80' },
  { name: 'Bed/Sleeping', url: 'https://images.unsplash.com/photo-1590490360182-c33d57733427?auto=format&fit=crop&w=800&q=80' },
  { name: 'Bathroom', url: 'https://images.unsplash.com/photo-1584622650111-993a426fbf0a?auto=format&fit=crop&w=800&q=80' },
  { name: 'Exterior/Lobby', url: 'https://images.unsplash.com/photo-1566665797739-1674de7a421a?auto=format&fit=crop&w=800&q=80' },
];

const RoomFormModal = ({ isOpen, onClose, onSubmit, initialData = null }) => {
  const isEditing = Boolean(initialData);

  const [type, setType] = useState('');
  const [price, setPrice] = useState('');
  const [capacity, setCapacity] = useState('2');
  const [totalRooms, setTotalRooms] = useState('5');
  const [images, setImages] = useState([]);
  const [newImageUrl, setNewImageUrl] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (initialData) {
      setType(initialData.type || '');
      setPrice(initialData.price || '');
      setCapacity(initialData.capacity || '2');
      setTotalRooms(initialData.count || initialData.totalRooms || '5');
      setImages(Array.isArray(initialData.images) ? [...initialData.images] : []);
    } else {
      setType('');
      setPrice('');
      setCapacity('2');
      setTotalRooms('5');
      setImages([]);
    }
    setNewImageUrl('');
    setError('');
  }, [initialData, isOpen]);

  // Lock background scroll and handle Escape key while modal is open
  useEffect(() => {
    if (!isOpen) return;

    document.body.style.overflow = 'hidden';

    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    window.addEventListener('keydown', handleKeyDown);

    return () => {
      document.body.style.overflow = '';
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleAddImageUrl = (urlToAdd) => {
    const url = (urlToAdd || newImageUrl).trim();
    if (!url) return;
    if (images.includes(url)) {
      setError('This image URL is already in the list.');
      return;
    }
    setImages((prev) => [...prev, url]);
    if (!urlToAdd) setNewImageUrl('');
    setError('');
  };

  const handleRemoveImage = (indexToRemove) => {
    setImages((prev) => prev.filter((_, idx) => idx !== indexToRemove));
  };

  const handleSetPrimary = (indexToSet) => {
    if (indexToSet === 0) return;
    setImages((prev) => {
      const copy = [...prev];
      const [selected] = copy.splice(indexToSet, 1);
      return [selected, ...copy];
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!type.trim()) {
      setError('Room Type name is required.');
      return;
    }

    const priceNum = Number(price);
    const capacityNum = Number(capacity);
    const totalRoomsNum = Number(totalRooms);

    if (isNaN(priceNum) || priceNum <= 0) {
      setError('Price per night must be greater than 0.');
      return;
    }

    if (isNaN(capacityNum) || capacityNum < 1) {
      setError('Guest capacity must be at least 1.');
      return;
    }

    if (isNaN(totalRoomsNum) || totalRoomsNum < 1) {
      setError('Total rooms available must be at least 1.');
      return;
    }

    setLoading(true);
    try {
      await onSubmit({
        type: type.trim(),
        price: priceNum,
        capacity: capacityNum,
        totalRooms: totalRoomsNum,
        images,
      });
      onClose();
    } catch (err) {
      console.error('Room form error:', err);
      setError(err.response?.data?.error || 'Failed to save room type.');
    } finally {
      setLoading(false);
    }
  };

  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  const modalContent = (
    <div
      className="modal-overlay"
      onClick={handleBackdropClick}
      tabIndex={-1}
      role="dialog"
      aria-modal="true"
      aria-labelledby="room-form-modal-title"
    >
      <div className="modal-card" style={{ maxWidth: '640px', padding: '1.75rem', maxHeight: '90vh', overflowY: 'auto' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
          <h2 id="room-form-modal-title" style={{ fontSize: '1.3rem', color: 'var(--primary-color)', margin: 0 }}>
            {isEditing ? `Edit ${initialData.type} Room` : 'Add New Room Type'}
          </h2>
          <button
            type="button"
            className="btn-modal-close"
            onClick={onClose}
            aria-label="Close modal"
            style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}
          >
            <X size={20} />
          </button>
        </div>

        {error && (
          <div className="error-banner" style={{ marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
            <AlertCircle size={16} /> {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="auth-form">
          <div className="form-group">
            <label htmlFor="roomType">Room Type Name *</label>
            <input
              type="text"
              id="roomType"
              placeholder="e.g. Executive Suite"
              value={type}
              onChange={(e) => setType(e.target.value)}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="roomPrice">Price per Night (₹ INR) *</label>
            <input
              type="number"
              id="roomPrice"
              placeholder="e.g. 4500"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              min="1"
              required
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div className="form-group">
              <label htmlFor="roomCapacity">Guest Capacity *</label>
              <input
                type="number"
                id="roomCapacity"
                placeholder="e.g. 2"
                value={capacity}
                onChange={(e) => setCapacity(e.target.value)}
                min="1"
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="roomTotal">Total Rooms *</label>
              <input
                type="number"
                id="roomTotal"
                placeholder="e.g. 5"
                value={totalRooms}
                onChange={(e) => setTotalRooms(e.target.value)}
                min="1"
                required
              />
            </div>
          </div>

          {/* ROOM IMAGES SECTION */}
          <div style={{ marginTop: '1.25rem', paddingTop: '1rem', borderTop: '1px solid var(--border-color)' }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontWeight: 600, color: 'var(--primary-color)', marginBottom: '0.5rem' }}>
              <ImageIcon size={16} /> Room Imagery (Multiple URLs supported)
            </label>
            <p style={{ fontSize: '0.8rem', color: '#64748b', margin: '0 0 0.75rem 0' }}>
              The first image acts as the primary card image. Add custom URLs or pick sample hotel photos.
            </p>

            <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.75rem' }}>
              <input
                type="url"
                placeholder="https://example.com/room-photo.jpg"
                value={newImageUrl}
                onChange={(e) => setNewImageUrl(e.target.value)}
                style={{ flex: 1, padding: '0.5rem', borderRadius: '6px', border: '1px solid var(--border-color)', fontSize: '0.85rem' }}
              />
              <button
                type="button"
                onClick={() => handleAddImageUrl()}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.3rem',
                  padding: '0.5rem 0.9rem',
                  borderRadius: '6px',
                  backgroundColor: '#6366f1',
                  color: '#ffffff',
                  fontWeight: 600,
                  fontSize: '0.85rem',
                  border: 'none',
                  cursor: 'pointer',
                }}
              >
                <Plus size={14} /> Add
              </button>
            </div>

            {/* Quick Sample Image Helper Buttons */}
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem', marginBottom: '1rem' }}>
              <span style={{ fontSize: '0.75rem', color: '#64748b', alignSelf: 'center', marginRight: '0.25rem' }}>
                Quick Presets:
              </span>
              {PRESET_IMAGES.map((preset) => (
                <button
                  key={preset.name}
                  type="button"
                  onClick={() => handleAddImageUrl(preset.url)}
                  style={{
                    padding: '0.25rem 0.55rem',
                    fontSize: '0.75rem',
                    borderRadius: '4px',
                    border: '1px dashed #cbd5e1',
                    background: '#f8fafc',
                    color: '#475569',
                    cursor: 'pointer',
                  }}
                >
                  + {preset.name}
                </button>
              ))}
            </div>

            {/* Thumbnail Preview Grid */}
            {images.length > 0 ? (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(110px, 1fr))', gap: '0.75rem' }}>
                {images.map((imgUrl, index) => (
                  <div
                    key={index}
                    style={{
                      position: 'relative',
                      borderRadius: '8px',
                      overflow: 'hidden',
                      border: index === 0 ? '2px solid #6366f1' : '1px solid #e2e8f0',
                      background: '#f1f5f9',
                      aspectRatio: '4/3',
                    }}
                  >
                    <img
                      src={imgUrl}
                      alt={`Room photo ${index + 1}`}
                      style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                      onError={(e) => {
                        e.target.src = 'https://images.unsplash.com/photo-1590490360182-c33d57733427?auto=format&fit=crop&w=400&q=80';
                      }}
                    />
                    {index === 0 ? (
                      <span
                        style={{
                          position: 'absolute',
                          top: '4px',
                          left: '4px',
                          background: '#6366f1',
                          color: '#fff',
                          fontSize: '0.65rem',
                          fontWeight: 700,
                          padding: '2px 5px',
                          borderRadius: '4px',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '2px',
                        }}
                      >
                        <Star size={10} fill="#fff" /> Primary
                      </span>
                    ) : (
                      <button
                        type="button"
                        onClick={() => handleSetPrimary(index)}
                        title="Set as Primary Image"
                        style={{
                          position: 'absolute',
                          top: '4px',
                          left: '4px',
                          background: 'rgba(0,0,0,0.6)',
                          color: '#fff',
                          fontSize: '0.65rem',
                          border: 'none',
                          padding: '2px 5px',
                          borderRadius: '4px',
                          cursor: 'pointer',
                        }}
                      >
                        Make Primary
                      </button>
                    )}
                    <button
                      type="button"
                      onClick={() => handleRemoveImage(index)}
                      title="Remove Image"
                      style={{
                        position: 'absolute',
                        top: '4px',
                        right: '4px',
                        background: '#ef4444',
                        color: '#fff',
                        border: 'none',
                        borderRadius: '50%',
                        width: '20px',
                        height: '20px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        cursor: 'pointer',
                      }}
                    >
                      <Trash2 size={12} />
                    </button>
                  </div>
                ))}
              </div>
            ) : (
              <div
                style={{
                  padding: '1.25rem',
                  textAlign: 'center',
                  background: '#f8fafc',
                  border: '1px dashed #cbd5e1',
                  borderRadius: '8px',
                  color: '#64748b',
                  fontSize: '0.85rem',
                }}
              >
                No images added yet. Add custom image URLs above or click a sample preset.
              </div>
            )}
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1.5rem' }}>
            <button
              type="button"
              className="btn-cancel"
              onClick={onClose}
              disabled={loading}
              style={{
                padding: '0.6rem 1.25rem',
                borderRadius: '8px',
                border: '1px solid var(--border-color)',
                backgroundColor: '#ffffff',
                color: 'var(--text-main)',
                cursor: 'pointer',
                fontWeight: 600,
              }}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn-submit"
              disabled={loading}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.4rem',
                padding: '0.6rem 1.25rem',
              }}
            >
              <Save size={16} />
              {loading ? 'Saving...' : isEditing ? 'Save Changes' : 'Create Room Type'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );

  return ReactDOM.createPortal(modalContent, document.body);
};

export default RoomFormModal;

