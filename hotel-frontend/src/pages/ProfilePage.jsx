import React, { useState, useEffect } from 'react';
import { Shield, User as UserIcon } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { getUserProfile } from '../api/users';
import PersonalInfoForm from '../components/profile/PersonalInfoForm';
import SecurityCard from '../components/profile/SecurityCard';

const ProfilePage = () => {
  const { user, isAdmin, updateUser } = useAuth();
  const [profileData, setProfileData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const data = await getUserProfile();
        setProfileData(data);
        updateUser(data);
      } catch (err) {
        console.error('Fetch profile error:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, []);

  const currentUser = profileData || user;
  const initial = currentUser?.name ? currentUser.name.charAt(0).toUpperCase() : 'U';

  return (
    <div style={{ maxWidth: '960px', margin: '0 auto', paddingBottom: '3rem' }}>
      {/* Account Hero Header */}
      <div
        style={{
          background: 'linear-gradient(135deg, #1a2b3c 0%, #111d28 100%)',
          color: '#ffffff',
          borderRadius: '16px',
          padding: '2rem',
          marginBottom: '2rem',
          display: 'flex',
          alignItems: 'center',
          gap: '1.5rem',
          boxShadow: '0 8px 30px rgba(26, 43, 60, 0.15)',
          border: '1px solid rgba(255, 255, 255, 0.1)',
          flexWrap: 'wrap',
        }}
      >
        <div className="avatar-circle large" style={{ width: '64px', height: '64px', fontSize: '1.6rem', border: '3px solid var(--accent-color)' }}>
          {currentUser?.avatarUrl ? (
            <img src={currentUser.avatarUrl} alt={currentUser.name} className="avatar-img" />
          ) : (
            <span className="avatar-initial">{initial}</span>
          )}
        </div>

        <div style={{ flex: 1 }}>
          <h1 style={{ fontSize: '1.6rem', fontWeight: 800, margin: '0 0 0.25rem 0', color: '#ffffff' }}>
            {currentUser?.name || 'Account Settings'}
          </h1>
          <p style={{ margin: 0, color: 'rgba(255, 255, 255, 0.7)', fontSize: '0.95rem' }}>
            {currentUser?.email}
          </p>
        </div>

        {isAdmin && (
          <span className="role-badge admin" style={{ fontSize: '0.8rem', padding: '0.3rem 0.8rem' }}>
            <Shield size={14} aria-hidden="true" style={{ verticalAlign: '-2px', marginRight: '4px' }} />
            Administrator
          </span>
        )}
      </div>

      {/* Main Profile Sections */}
      <PersonalInfoForm initialData={currentUser} />
      <SecurityCard />
    </div>
  );
};

export default ProfilePage;
