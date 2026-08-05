import React from 'react';
import { Plus, Hotel } from 'lucide-react';

const RoomManagementToolbar = ({ onAddRoomType, totalTypes, totalInventory }) => {
  return (
    <div
      style={{
        background: 'linear-gradient(135deg, #1a2b3c 0%, #111d28 100%)',
        color: '#ffffff',
        borderRadius: '14px',
        padding: '1.25rem 1.5rem',
        marginBottom: '1.75rem',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '1rem',
        border: '1px solid rgba(255, 255, 255, 0.1)',
        boxShadow: '0 4px 20px rgba(26, 43, 60, 0.2)',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem', flexWrap: 'wrap' }}>
        <div>
          <h2 style={{ fontSize: '1.25rem', fontWeight: 800, margin: 0, color: '#ffffff', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Hotel size={22} color="var(--accent-color)" /> Room Type Management
          </h2>
          <p style={{ margin: '0.2rem 0 0 0', fontSize: '0.85rem', color: 'rgba(255, 255, 255, 0.7)' }}>
            Admin Dashboard Control & Inventory Configuration
          </p>
        </div>

        <div style={{ display: 'flex', gap: '1rem', borderLeft: '1px solid rgba(255, 255, 255, 0.15)', paddingLeft: '1.25rem' }}>
          <div style={{ fontSize: '0.85rem', color: 'rgba(255, 255, 255, 0.8)' }}>
            Categories: <strong style={{ color: 'var(--accent-color)', fontSize: '1rem' }}>{totalTypes || 0}</strong>
          </div>
          <div style={{ fontSize: '0.85rem', color: 'rgba(255, 255, 255, 0.8)' }}>
            Physical Inventory: <strong style={{ color: 'var(--accent-color)', fontSize: '1rem' }}>{totalInventory || 0}</strong>
          </div>
        </div>
      </div>

      <button
        type="button"
        onClick={onAddRoomType}
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '0.4rem',
          backgroundColor: 'var(--accent-color)',
          color: 'var(--primary-color)',
          fontWeight: 700,
          fontSize: '0.9rem',
          padding: '0.65rem 1.25rem',
          borderRadius: '8px',
          border: 'none',
          cursor: 'pointer',
          boxShadow: '0 2px 8px rgba(201, 163, 93, 0.3)',
          transition: 'all 0.2s ease',
        }}
        onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = 'var(--accent-hover)')}
        onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'var(--accent-color)')}
      >
        <Plus size={18} /> + Add Room Type
      </button>
    </div>
  );
};

export default RoomManagementToolbar;
