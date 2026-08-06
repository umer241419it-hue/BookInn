import React, { useState, useEffect } from 'react';
import ReactDOM from 'react-dom';
import { AlertTriangle, Trash2, X } from 'lucide-react';

const DeleteRoomDialog = ({ isOpen, onClose, onConfirm, roomType }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Lock background scroll and handle Escape key while dialog is active
  useEffect(() => {
    if (!isOpen || !roomType) return;

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
  }, [isOpen, roomType, onClose]);

  if (!isOpen || !roomType) return null;

  const handleConfirm = async () => {
    setError('');
    setLoading(true);
    try {
      await onConfirm(roomType.type);
      onClose();
    } catch (err) {
      console.error('Delete room type error:', err);
      setError(err.response?.data?.error || 'Failed to delete room type.');
    } finally {
      setLoading(false);
    }
  };

  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  const dialogContent = (
    <div
      className="modal-overlay"
      onClick={handleBackdropClick}
      tabIndex={-1}
      role="dialog"
      aria-modal="true"
      aria-labelledby="delete-dialog-title"
    >
      <div className="modal-card" style={{ maxWidth: '460px', padding: '1.75rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
          <h2 id="delete-dialog-title" style={{ fontSize: '1.2rem', color: '#dc2626', margin: 0, display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
            <AlertTriangle size={20} /> Delete Room Type
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

        <p style={{ color: 'var(--text-main)', fontSize: '0.95rem', lineHeight: 1.5, marginBottom: '1rem' }}>
          Are you sure you want to delete the <strong>{roomType.type}</strong> room type? This will delete all physical room inventory associated with this category.
        </p>

        {error && (
          <div className="error-banner" style={{ marginBottom: '1rem', fontSize: '0.85rem' }}>
            {error}
          </div>
        )}

        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1.25rem' }}>
          <button
            type="button"
            onClick={onClose}
            disabled={loading}
            style={{
              padding: '0.55rem 1.1rem',
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
            type="button"
            onClick={handleConfirm}
            disabled={loading}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.4rem',
              padding: '0.55rem 1.1rem',
              borderRadius: '8px',
              border: 'none',
              backgroundColor: '#dc2626',
              color: '#ffffff',
              cursor: 'pointer',
              fontWeight: 600,
            }}
          >
            <Trash2 size={16} />
            {loading ? 'Deleting...' : 'Delete Room Type'}
          </button>
        </div>
      </div>
    </div>
  );

  return ReactDOM.createPortal(dialogContent, document.body);
};

export default DeleteRoomDialog;
