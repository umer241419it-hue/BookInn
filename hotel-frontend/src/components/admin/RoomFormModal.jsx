import React, { useState, useEffect, useRef } from 'react';
import ReactDOM from 'react-dom';
import { X, Save, AlertCircle, Image as ImageIcon, Plus, Trash2, Star, Upload, Loader2 } from 'lucide-react';
import { uploadRoomImages } from '../../api/rooms';
import { getFullImageUrl } from '../../utils/imageHelper';

const PRESET_IMAGES = [
  { name: 'Interior', url: 'https://images.unsplash.com/photo-1618773928121-c32242e63f39?auto=format&fit=crop&w=800&q=80' },
  { name: 'Balcony/View', url: 'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?auto=format&fit=crop&w=800&q=80' },
  { name: 'Bed/Sleeping', url: 'https://images.unsplash.com/photo-1590490360182-c33d57733427?auto=format&fit=crop&w=800&q=80' },
  { name: 'Bathroom', url: 'https://images.unsplash.com/photo-1584622650111-993a426fbf0a?auto=format&fit=crop&w=800&q=80' },
  { name: 'Exterior/Lobby', url: 'https://images.unsplash.com/photo-1566665797739-1674de7a421a?auto=format&fit=crop&w=800&q=80' },
];

const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/jpg'];
const ALLOWED_EXTENSIONS = ['.jpg', '.jpeg', '.png', '.webp'];
const MAX_FILE_SIZE_BYTES = 5 * 1024 * 1024; // 5MB limit per photo

const RoomFormModal = ({ isOpen, onClose, onSubmit, initialData = null }) => {
  const isEditing = Boolean(initialData);

  const [type, setType] = useState('');
  const [price, setPrice] = useState('');
  const [capacity, setCapacity] = useState('2');
  const [totalRooms, setTotalRooms] = useState('5');
  
  // Array of image objects: { id, isFile: boolean, url?: string, file?: File, previewUrl: string }
  const [imageItems, setImageItems] = useState([]);
  const [newImageUrl, setNewImageUrl] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [loadingStatus, setLoadingStatus] = useState('');

  const fileInputRef = useRef(null);

  // Initialize form data when opening or when initialData changes
  useEffect(() => {
    if (initialData) {
      setType(initialData.type || '');
      setPrice(initialData.price || '');
      setCapacity(initialData.capacity || '2');
      setTotalRooms(initialData.count || initialData.totalRooms || '5');
      
      const existingUrls = Array.isArray(initialData.images) ? initialData.images : [];
      setImageItems(
        existingUrls.map((url, idx) => ({
          id: `existing_${idx}_${Date.now()}`,
          isFile: false,
          url,
          previewUrl: getFullImageUrl(url),
        }))
      );
    } else {
      setType('');
      setPrice('');
      setCapacity('2');
      setTotalRooms('5');
      setImageItems([]);
    }
    setNewImageUrl('');
    setError('');
    setLoading(false);
    setLoadingStatus('');
  }, [initialData, isOpen]);

  // Clean up object URLs when modal unmounts
  useEffect(() => {
    return () => {
      imageItems.forEach((item) => {
        if (item.isFile && item.previewUrl && item.previewUrl.startsWith('blob:')) {
          URL.revokeObjectURL(item.previewUrl);
        }
      });
    };
  }, [imageItems]);

  // Lock background scroll and handle Escape key while modal is open
  useEffect(() => {
    if (!isOpen) return;

    document.body.style.overflow = 'hidden';

    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && !loading) {
        onClose();
      }
    };

    window.addEventListener('keydown', handleKeyDown);

    return () => {
      document.body.style.overflow = '';
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, loading, onClose]);

  if (!isOpen) return null;

  // Handle selecting files from local device
  const handleFileSelect = (e) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    setError('');
    const newItems = [];

    for (const file of files) {
      const ext = '.' + file.name.split('.').pop().toLowerCase();
      const mime = file.type.toLowerCase();

      // Validate format
      if (!ALLOWED_IMAGE_TYPES.includes(mime) && !ALLOWED_EXTENSIONS.includes(ext)) {
        setError(`"${file.name}" is not a supported image format. Please upload JPG, PNG, or WEBP.`);
        if (fileInputRef.current) fileInputRef.current.value = '';
        return;
      }

      // Validate size
      if (file.size > MAX_FILE_SIZE_BYTES) {
        const sizeMb = (file.size / (1024 * 1024)).toFixed(1);
        setError(`"${file.name}" (${sizeMb} MB) exceeds the 5MB maximum file size limit.`);
        if (fileInputRef.current) fileInputRef.current.value = '';
        return;
      }

      const previewUrl = URL.createObjectURL(file);
      newItems.push({
        id: `file_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`,
        isFile: true,
        file,
        previewUrl,
        name: file.name,
      });
    }

    setImageItems((prev) => [...prev, ...newItems]);
    // Reset file input so user can pick the same file again if desired
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleAddImageUrl = (urlToAdd) => {
    const url = (urlToAdd || newImageUrl).trim();
    if (!url) return;

    const alreadyExists = imageItems.some(
      (item) => !item.isFile && item.url.toLowerCase() === url.toLowerCase()
    );

    if (alreadyExists) {
      setError('This image URL is already added.');
      return;
    }

    setImageItems((prev) => [
      ...prev,
      {
        id: `url_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`,
        isFile: false,
        url,
        previewUrl: getFullImageUrl(url),
      },
    ]);

    if (!urlToAdd) setNewImageUrl('');
    setError('');
  };

  const handleRemoveImage = (indexToRemove) => {
    setImageItems((prev) => {
      const target = prev[indexToRemove];
      if (target && target.isFile && target.previewUrl.startsWith('blob:')) {
        URL.revokeObjectURL(target.previewUrl);
      }
      return prev.filter((_, idx) => idx !== indexToRemove);
    });
  };

  const handleSetPrimary = (indexToSet) => {
    if (indexToSet === 0) return;
    setImageItems((prev) => {
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
      // 1. Separate new device files that need uploading vs existing URLs
      const filesToUpload = imageItems.filter((item) => item.isFile && item.file);
      let uploadedUrlsMap = new Map();

      if (filesToUpload.length > 0) {
        setLoadingStatus(`Uploading ${filesToUpload.length} device photo(s)...`);
        const formData = new FormData();
        filesToUpload.forEach((item) => {
          formData.append('images', item.file);
        });

        const uploadRes = await uploadRoomImages(formData);
        if (uploadRes && Array.isArray(uploadRes.imageUrls)) {
          filesToUpload.forEach((item, index) => {
            uploadedUrlsMap.set(item.id, uploadRes.imageUrls[index]);
          });
        }
      }

      // 2. Assemble the final image URLs list in the exact order defined by the admin
      setLoadingStatus('Saving room details...');
      const finalImages = imageItems
        .map((item) => {
          if (item.isFile) {
            return uploadedUrlsMap.get(item.id) || null;
          }
          return item.url;
        })
        .filter(Boolean);

      // 3. Submit room details
      await onSubmit({
        type: type.trim(),
        price: priceNum,
        capacity: capacityNum,
        totalRooms: totalRoomsNum,
        images: finalImages,
      });

      onClose();
    } catch (err) {
      console.error('Room form submission error:', err);
      setError(err.response?.data?.error || err.message || 'Failed to save room type.');
    } finally {
      setLoading(false);
      setLoadingStatus('');
    }
  };

  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget && !loading) {
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
      <div className="modal-card" style={{ maxWidth: '680px', padding: '1.75rem', maxHeight: '90vh', overflowY: 'auto' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
          <h2 id="room-form-modal-title" style={{ fontSize: '1.3rem', color: 'var(--primary-color)', margin: 0 }}>
            {isEditing ? `Edit ${initialData.type} Room` : 'Add New Room Type'}
          </h2>
          <button
            type="button"
            className="btn-modal-close"
            onClick={onClose}
            disabled={loading}
            aria-label="Close modal"
            style={{ background: 'none', border: 'none', cursor: loading ? 'not-allowed' : 'pointer', color: 'var(--text-muted)' }}
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
              disabled={loading}
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
              disabled={loading}
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
                disabled={loading}
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="roomTotal">Total Rooms Available *</label>
              <input
                type="number"
                id="roomTotal"
                placeholder="e.g. 5"
                value={totalRooms}
                onChange={(e) => setTotalRooms(e.target.value)}
                min="1"
                disabled={loading}
                required
              />
            </div>
          </div>

          {/* ROOM IMAGES SECTION WITH DEVICE FILE PICKER */}
          <div style={{ marginTop: '1.25rem', paddingTop: '1rem', borderTop: '1px solid var(--border-color)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem', flexWrap: 'wrap', gap: '0.5rem' }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontWeight: 600, color: 'var(--primary-color)', margin: 0 }}>
                <ImageIcon size={16} /> Room Photos ({imageItems.length})
              </label>

              {/* Upload Photos from Device Button */}
              <div>
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileSelect}
                  multiple
                  accept="image/jpeg,image/png,image/webp,image/jpg"
                  style={{ display: 'none' }}
                  disabled={loading}
                />
                <button
                  type="button"
                  onClick={() => fileInputRef.current && fileInputRef.current.click()}
                  disabled={loading}
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '0.4rem',
                    padding: '0.45rem 0.9rem',
                    borderRadius: '6px',
                    backgroundColor: '#4f46e5',
                    color: '#ffffff',
                    fontWeight: 600,
                    fontSize: '0.85rem',
                    border: 'none',
                    cursor: loading ? 'not-allowed' : 'pointer',
                    boxShadow: '0 1px 2px rgba(0,0,0,0.05)',
                  }}
                >
                  <Upload size={15} /> Upload Photos from Device
                </button>
              </div>
            </div>

            <p style={{ fontSize: '0.8rem', color: '#64748b', margin: '0 0 0.75rem 0' }}>
              Select JPG, PNG, or WEBP photos from your computer (max 5MB each). The top-left image acts as the primary cover photo.
            </p>

            {/* Optional URL Input */}
            <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.75rem' }}>
              <input
                type="url"
                placeholder="Or paste an image URL (e.g. https://...)"
                value={newImageUrl}
                onChange={(e) => setNewImageUrl(e.target.value)}
                disabled={loading}
                style={{ flex: 1, padding: '0.5rem', borderRadius: '6px', border: '1px solid var(--border-color)', fontSize: '0.85rem' }}
              />
              <button
                type="button"
                onClick={() => handleAddImageUrl()}
                disabled={loading || !newImageUrl.trim()}
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
                  cursor: loading || !newImageUrl.trim() ? 'not-allowed' : 'pointer',
                  opacity: loading || !newImageUrl.trim() ? 0.6 : 1,
                }}
              >
                <Plus size={14} /> Add URL
              </button>
            </div>

            {/* Quick Sample Image Presets */}
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem', marginBottom: '1rem' }}>
              <span style={{ fontSize: '0.75rem', color: '#64748b', alignSelf: 'center', marginRight: '0.25rem' }}>
                Quick Presets:
              </span>
              {PRESET_IMAGES.map((preset) => (
                <button
                  key={preset.name}
                  type="button"
                  disabled={loading}
                  onClick={() => handleAddImageUrl(preset.url)}
                  style={{
                    padding: '0.25rem 0.55rem',
                    fontSize: '0.75rem',
                    borderRadius: '4px',
                    border: '1px dashed #cbd5e1',
                    background: '#f8fafc',
                    color: '#475569',
                    cursor: loading ? 'not-allowed' : 'pointer',
                  }}
                >
                  + {preset.name}
                </button>
              ))}
            </div>

            {/* Thumbnail Preview Grid */}
            {imageItems.length > 0 ? (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(120px, 1fr))', gap: '0.75rem' }}>
                {imageItems.map((item, index) => (
                  <div
                    key={item.id}
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
                      src={item.previewUrl}
                      alt={item.isFile ? item.name || `Photo ${index + 1}` : `Room photo ${index + 1}`}
                      style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                      onError={(e) => {
                        e.target.src = 'https://images.unsplash.com/photo-1590490360182-c33d57733427?auto=format&fit=crop&w=400&q=80';
                      }}
                    />

                    {/* New Upload Badge */}
                    {item.isFile && (
                      <span
                        style={{
                          position: 'absolute',
                          bottom: '4px',
                          left: '4px',
                          background: 'rgba(15, 23, 42, 0.8)',
                          color: '#fff',
                          fontSize: '0.65rem',
                          fontWeight: 600,
                          padding: '1px 4px',
                          borderRadius: '3px',
                        }}
                      >
                        Device
                      </span>
                    )}

                    {/* Primary Badge or Make Primary Button */}
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
                        disabled={loading}
                        title="Set as Primary Image"
                        style={{
                          position: 'absolute',
                          top: '4px',
                          left: '4px',
                          background: 'rgba(0,0,0,0.65)',
                          color: '#fff',
                          fontSize: '0.65rem',
                          border: 'none',
                          padding: '2px 5px',
                          borderRadius: '4px',
                          cursor: loading ? 'not-allowed' : 'pointer',
                        }}
                      >
                        Make Primary
                      </button>
                    )}

                    {/* Remove Photo Button */}
                    <button
                      type="button"
                      onClick={() => handleRemoveImage(index)}
                      disabled={loading}
                      title="Remove Image"
                      style={{
                        position: 'absolute',
                        top: '4px',
                        right: '4px',
                        background: '#ef4444',
                        color: '#fff',
                        border: 'none',
                        borderRadius: '50%',
                        width: '22px',
                        height: '22px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        cursor: loading ? 'not-allowed' : 'pointer',
                        boxShadow: '0 1px 3px rgba(0,0,0,0.2)',
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
                  padding: '1.5rem',
                  textAlign: 'center',
                  background: '#f8fafc',
                  border: '1px dashed #cbd5e1',
                  borderRadius: '8px',
                  color: '#64748b',
                  fontSize: '0.85rem',
                }}
              >
                No images added yet. Click <strong>Upload Photos from Device</strong> or select presets above.
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
                cursor: loading ? 'not-allowed' : 'pointer',
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
                cursor: loading ? 'not-allowed' : 'pointer',
                opacity: loading ? 0.8 : 1,
              }}
            >
              {loading ? (
                <>
                  <Loader2 size={16} className="spin-animation" style={{ animation: 'spin 1s linear infinite' }} />
                  <span>{loadingStatus || 'Saving...'}</span>
                </>
              ) : (
                <>
                  <Save size={16} />
                  <span>{isEditing ? 'Save Changes' : 'Create Room Type'}</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );

  return ReactDOM.createPortal(modalContent, document.body);
};

export default RoomFormModal;
