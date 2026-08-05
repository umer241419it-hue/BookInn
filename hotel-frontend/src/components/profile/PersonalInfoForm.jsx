import React, { useState, useEffect } from 'react';
import { User, Mail, Phone, Lock, Save, CheckCircle2, AlertCircle } from 'lucide-react';
import { updateUserProfile } from '../../api/users';
import { useAuth } from '../../context/AuthContext';

const PersonalInfoForm = ({ initialData }) => {
  const { user, updateUser } = useAuth();
  const [name, setName] = useState(user?.name || initialData?.name || '');
  const [email, setEmail] = useState(user?.email || initialData?.email || '');
  const [phoneNumber, setPhoneNumber] = useState(user?.phoneNumber || initialData?.phoneNumber || '+91 9876543210');
  const [loading, setLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    if (user) {
      setName(user.name || '');
      setEmail(user.email || '');
      setPhoneNumber(user.phoneNumber || '+91 9876543210');
    }
  }, [user]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSuccessMsg('');
    setErrorMsg('');

    if (!name.trim()) {
      setErrorMsg('Full Name cannot be empty.');
      return;
    }

    setLoading(true);
    try {
      const res = await updateUserProfile({ name: name.trim() });
      updateUser({ name: name.trim() });
      setSuccessMsg(res.message || 'Personal details updated successfully.');
    } catch (err) {
      console.error('Update profile error:', err);
      setErrorMsg(err.response?.data?.error || 'Failed to update personal details.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="profile-card"
      style={{
        background: '#ffffff',
        borderRadius: '14px',
        padding: '1.75rem',
        border: '1px solid var(--border-color)',
        boxShadow: '0 4px 16px rgba(0, 0, 0, 0.04)',
        marginBottom: '2rem',
      }}
    >
      <h2 style={{ fontSize: '1.25rem', color: 'var(--primary-color)', marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
        <User size={20} color="var(--accent-color)" /> Personal Information
      </h2>

      {errorMsg && (
        <div className="error-banner" style={{ marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
          <AlertCircle size={16} /> {errorMsg}
        </div>
      )}

      {successMsg && (
        <div className="success-banner" style={{ marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
          <CheckCircle2 size={16} /> {successMsg}
        </div>
      )}

      <form onSubmit={handleSubmit} className="auth-form">
        {/* Editable Name */}
        <div className="form-group">
          <label htmlFor="profileName" style={{ fontWeight: 600, color: 'var(--text-main)' }}>Full Name</label>
          <input
            type="text"
            id="profileName"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            placeholder="e.g. Rahul Sharma"
          />
        </div>

        {/* Read-Only Email */}
        <div className="form-group">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.35rem' }}>
            <label htmlFor="profileEmail" style={{ fontWeight: 600, color: 'var(--text-main)', margin: 0 }}>Email Address</label>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'inline-flex', alignItems: 'center', gap: '0.2rem' }}>
              <Lock size={12} /> Verification required to change
            </span>
          </div>
          <input
            type="email"
            id="profileEmail"
            value={email}
            disabled
            style={{
              backgroundColor: '#f1f5f9',
              color: '#64748b',
              cursor: 'not-allowed',
              borderColor: '#cbd5e1',
            }}
          />
        </div>

        {/* Read-Only Mobile Number */}
        <div className="form-group">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.35rem' }}>
            <label htmlFor="profilePhone" style={{ fontWeight: 600, color: 'var(--text-main)', margin: 0 }}>Mobile Number</label>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'inline-flex', alignItems: 'center', gap: '0.2rem' }}>
              <Lock size={12} /> Verification required to change
            </span>
          </div>
          <input
            type="text"
            id="profilePhone"
            value={phoneNumber}
            disabled
            style={{
              backgroundColor: '#f1f5f9',
              color: '#64748b',
              cursor: 'not-allowed',
              borderColor: '#cbd5e1',
            }}
          />
        </div>

        <div style={{ marginTop: '1.25rem', textAlign: 'right' }}>
          <button
            type="submit"
            className="btn-submit"
            disabled={loading}
            style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', padding: '0.6rem 1.25rem' }}
          >
            <Save size={16} />
            {loading ? 'Saving Changes...' : 'Save Changes'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default PersonalInfoForm;
