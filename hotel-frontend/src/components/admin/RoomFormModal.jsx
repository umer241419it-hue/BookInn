import React, { useState, useEffect } from 'react';
import ReactDOM from 'react-dom';
import { X, Save, AlertCircle } from 'lucide-react';

const RoomFormModal = ({ isOpen, onClose, onSubmit, initialData = null }) => {
  const isEditing = Boolean(initialData);

  const [type, setType] = useState('');
  const [price, setPrice] = useState('');
  const [capacity, setCapacity] = useState('2');
  const [totalRooms, setTotalRooms] = useState('5');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (initialData) {
      setType(initialData.type || '');
      setPrice(initialData.price || '');
      setCapacity(initialData.capacity || '2');
      setTotalRooms(initialData.count || initialData.totalRooms || '5');
    } else {
      setType('');
      setPrice('');
      setCapacity('2');
      setTotalRooms('5');
    }
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
      <div className="modal-card" style={{ maxWidth: '520px', padding: '1.75rem' }}>
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
