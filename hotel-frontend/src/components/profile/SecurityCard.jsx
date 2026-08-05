import React, { useState } from 'react';
import { KeyRound, Eye, EyeOff, ShieldCheck, CheckCircle2, AlertCircle } from 'lucide-react';
import { changePassword } from '../../api/users';

const SecurityCard = () => {
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const [loading, setLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  // Password strength logic
  const getPasswordStrength = (pass) => {
    if (!pass) return { score: 0, label: '', color: '#e2e8f0' };
    if (pass.length < 6) return { score: 1, label: 'Weak (min 6 characters)', color: '#ef4444' };
    
    let strength = 1;
    if (pass.length >= 8) strength++;
    if (/[A-Z]/.test(pass) && /[0-9]/.test(pass)) strength++;
    if (/[^A-Za-z0-9]/.test(pass)) strength++;

    if (strength <= 2) return { score: 2, label: 'Fair', color: '#eab308' };
    return { score: 3, label: 'Strong Password', color: '#22c55e' };
  };

  const strength = getPasswordStrength(newPassword);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSuccessMsg('');
    setErrorMsg('');

    if (!currentPassword || !newPassword || !confirmPassword) {
      setErrorMsg('Please fill in all password fields.');
      return;
    }

    if (newPassword.length < 6) {
      setErrorMsg('New password must be at least 6 characters long.');
      return;
    }

    if (newPassword !== confirmPassword) {
      setErrorMsg('New password and Confirmation do not match.');
      return;
    }

    setLoading(true);
    try {
      const res = await changePassword({ currentPassword, newPassword });
      setSuccessMsg(res.message || 'Password updated successfully.');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (err) {
      console.error('Change password error:', err);
      setErrorMsg(err.response?.data?.error || 'Failed to update password.');
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
      }}
    >
      <h2 style={{ fontSize: '1.25rem', color: 'var(--primary-color)', marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
        <KeyRound size={20} color="var(--accent-color)" /> Password & Security
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
        {/* Current Password */}
        <div className="form-group">
          <label htmlFor="currentPassword" style={{ fontWeight: 600, color: 'var(--text-main)' }}>Current Password *</label>
          <div style={{ position: 'relative' }}>
            <input
              type={showCurrent ? 'text' : 'password'}
              id="currentPassword"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              required
              placeholder="Enter current password"
              autoComplete="off"
            />
            <button
              type="button"
              onClick={() => setShowCurrent(!showCurrent)}
              style={{
                position: 'absolute',
                right: '12px',
                top: '50%',
                transform: 'translateY(-50%)',
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                color: '#64748b',
              }}
            >
              {showCurrent ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>
        </div>

        {/* New Password */}
        <div className="form-group">
          <label htmlFor="newPassword" style={{ fontWeight: 600, color: 'var(--text-main)' }}>New Password *</label>
          <div style={{ position: 'relative' }}>
            <input
              type={showNew ? 'text' : 'password'}
              id="newPassword"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              required
              placeholder="Minimum 6 characters"
              autoComplete="new-password"
            />
            <button
              type="button"
              onClick={() => setShowNew(!showNew)}
              style={{
                position: 'absolute',
                right: '12px',
                top: '50%',
                transform: 'translateY(-50%)',
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                color: '#64748b',
              }}
            >
              {showNew ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>

          {/* Strength Indicator Meter */}
          {newPassword && (
            <div style={{ marginTop: '0.4rem' }}>
              <div style={{ height: '4px', width: '100%', backgroundColor: '#e2e8f0', borderRadius: '2px', overflow: 'hidden' }}>
                <div
                  style={{
                    height: '100%',
                    width: `${(strength.score / 3) * 100}%`,
                    backgroundColor: strength.color,
                    transition: 'width 0.3s ease, background-color 0.3s ease',
                  }}
                />
              </div>
              <span style={{ fontSize: '0.78rem', color: strength.color, fontWeight: 600, marginTop: '0.2rem', display: 'block' }}>
                {strength.label}
              </span>
            </div>
          )}
        </div>

        {/* Confirm New Password */}
        <div className="form-group">
          <label htmlFor="confirmPassword" style={{ fontWeight: 600, color: 'var(--text-main)' }}>Confirm New Password *</label>
          <div style={{ position: 'relative' }}>
            <input
              type={showConfirm ? 'text' : 'password'}
              id="confirmPassword"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
              placeholder="Re-enter new password"
              autoComplete="new-password"
            />
            <button
              type="button"
              onClick={() => setShowConfirm(!showConfirm)}
              style={{
                position: 'absolute',
                right: '12px',
                top: '50%',
                transform: 'translateY(-50%)',
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                color: '#64748b',
              }}
            >
              {showConfirm ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>
        </div>

        <div style={{ marginTop: '1.25rem', textAlign: 'right' }}>
          <button
            type="submit"
            className="btn-submit"
            disabled={loading}
            style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', padding: '0.6rem 1.25rem' }}
          >
            <ShieldCheck size={16} />
            {loading ? 'Updating Password...' : 'Change Password'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default SecurityCard;
