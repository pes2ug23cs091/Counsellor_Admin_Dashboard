import { useState, useEffect } from 'react';

const API_BASE_URL = import.meta.env.VITE_API_URL 
  ? `${import.meta.env.VITE_API_URL}/api`
  : "/api";

const getAuthHeaders = () => {
  const token = localStorage.getItem('authToken');
  return {
    'Content-Type': 'application/json',
    ...(token && { 'Authorization': `Bearer ${token}` })
  };
};

export default function ProfilePage() {
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [profile, setProfile] = useState({
    username: 'Admin User',
    email: 'admin@example.com',
    phone: '',
    role: 'admin',
    status: 'active',
    created_at: new Date().toISOString(),
  });

  const [formData, setFormData] = useState(profile);

  // Fetch admin profile on component mount
  useEffect(() => {
    fetchAdminProfile();
  }, []);

  const fetchAdminProfile = async () => {
    try {
      setIsLoading(true);
      const response = await fetch(`${API_BASE_URL}/auth/profile`, {
        headers: getAuthHeaders()
      });
      
      if (!response.ok) throw new Error('Failed to fetch profile');
      
      const data = await response.json();
      setProfile(data);
      setFormData(data);
      console.log('✅ Profile loaded:', data.username);
    } catch (error) {
      console.error('❌ Error fetching profile:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleEdit = () => {
    setIsEditing(true);
  };

  const handleCancel = () => {
    setFormData(profile);
    setIsEditing(false);
  };

  const handleSave = () => {
    setProfile(formData);
    setIsEditing(false);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  if (isLoading) {
    return (
      <div className="page-container">
        <div style={{ textAlign: 'center', padding: '40px' }}>Loading profile...</div>
      </div>
    );
  }

  const getInitials = (username) => {
    return (username || 'A').substring(0, 2).toUpperCase();
  };

  return (
    <div className="page-container">
      <div className="page-header">
        <div>
          <h1 className="page-header-title">Admin Profile</h1>
          <p className="page-header-desc">Manage your profile information</p>
        </div>
      </div>

      <div className="profile-wrapper">
        <div className="profile-card">
          <div className="profile-header">
            <div className="profile-avatar">{getInitials(profile.username)}</div>
            <div className="profile-info">
              <h2>{profile.username}</h2>
              <p className="profile-role">{profile.role}</p>
              <span className="profile-status-badge" style={{
                backgroundColor: profile.status === 'active' ? '#d1fae5' : '#fee2e2',
                color: profile.status === 'active' ? '#065f46' : '#991b1b'
              }}>
                {profile.status === 'active' ? '🟢 Active' : '🔴 Inactive'}
              </span>
            </div>
          </div>

          <div className="profile-stats">
            <div className="stat-item">
              <p className="stat-label">Email</p>
              <p className="stat-value">{profile.email}</p>
            </div>
            <div className="stat-item">
              <p className="stat-label">Member Since</p>
              <p className="stat-value">{formatDate(profile.created_at)}</p>
            </div>
            <div className="stat-item">
              <p className="stat-label">Account Type</p>
              <p className="stat-value">{profile.role.charAt(0).toUpperCase() + profile.role.slice(1)}</p>
            </div>
          </div>
        </div>

        <div className="profile-details-card">
          <div className="card-header">
            <h3>Account Information</h3>
            {!isEditing && (
              <button className="btn btn-secondary" onClick={handleEdit}>
                ✏️ Edit Profile
              </button>
            )}
          </div>

          {isEditing ? (
            <form className="profile-form">
              <div className="form-group">
                <label htmlFor="username">Username</label>
                <input
                  type="text"
                  id="username"
                  name="username"
                  value={formData.username}
                  onChange={handleInputChange}
                  className="form-input"
                  disabled
                />
              </div>

              <div className="form-group">
                <label htmlFor="email">Email Address</label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  className="form-input"
                />
              </div>

              <div className="form-actions">
                <button type="button" className="btn btn-primary" onClick={handleSave}>
                  ✅ Save Changes
                </button>
                <button type="button" className="btn btn-secondary" onClick={handleCancel}>
                  ❌ Cancel
                </button>
              </div>
            </form>
          ) : (
            <div className="profile-info-display">
              <div className="info-item">
                <span className="info-label">Full Name</span>
                <span className="info-value">{profile.name}</span>
              </div>
              <div className="info-item">
                <span className="info-label">Email Address</span>
                <span className="info-value">{profile.email}</span>
              </div>
              <div className="info-item">
                <span className="info-label">Phone Number</span>
                <span className="info-value">{profile.phone}</span>
              </div>
              <div className="info-item">
                <span className="info-label">Department</span>
                <span className="info-value">{profile.department}</span>
              </div>
              <div className="info-item">
                <span className="info-label">Role</span>
                <span className="info-value">{profile.role}</span>
              </div>
            </div>
          )}
        </div>

        <div className="security-card">
          <div className="card-header">
            <h3>Security Settings</h3>
          </div>
          <div className="security-items">
            <div className="security-item">
              <div className="security-info">
                <p className="security-title">Two-Factor Authentication</p>
                <p className="security-desc">Add an extra layer of security to your account</p>
              </div>
              <button className="btn btn-secondary">Enable 2FA</button>
            </div>
            <div className="security-item">
              <div className="security-info">
                <p className="security-title">Change Password</p>
                <p className="security-desc">Update your password regularly for better security</p>
              </div>
              <button className="btn btn-secondary">Change</button>
            </div>
            <div className="security-item">
              <div className="security-info">
                <p className="security-title">Active Sessions</p>
                <p className="security-desc">Manage your active login sessions</p>
              </div>
              <button className="btn btn-secondary">View Sessions</button>
            </div>
          </div>
        </div>
      </div>

      <style jsx>{`
        .profile-wrapper {
          display: grid;
          gap: 24px;
          max-width: 1200px;
        }

        .profile-card {
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          border-radius: 12px;
          padding: 32px;
          color: white;
        }

        .profile-header {
          display: flex;
          align-items: center;
          gap: 24px;
          margin-bottom: 32px;
        }

        .profile-avatar {
          width: 80px;
          height: 80px;
          border-radius: 50%;
          background: rgba(255, 255, 255, 0.3);
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 32px;
          font-weight: bold;
          border: 3px solid white;
        }

        .profile-info h2 {
          margin: 0;
          font-size: 28px;
          font-weight: 700;
        }

        .profile-role {
          margin: 4px 0 8px 0;
          opacity: 0.9;
          font-size: 14px;
        }

        .profile-status-badge {
          display: inline-block;
          background: rgba(255, 255, 255, 0.2);
          padding: 4px 12px;
          border-radius: 20px;
          font-size: 12px;
          font-weight: 600;
        }

        .profile-stats {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
          gap: 24px;
          border-top: 1px solid rgba(255, 255, 255, 0.1);
          padding-top: 24px;
        }

        .stat-item {
          text-align: center;
        }

        .stat-label {
          margin: 0;
          opacity: 0.8;
          font-size: 12px;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }

        .stat-value {
          margin: 8px 0 0 0;
          font-size: 16px;
          font-weight: 600;
        }

        .profile-details-card,
        .security-card {
          background: white;
          border: 1px solid #e5e7eb;
          border-radius: 12px;
          padding: 24px;
        }

        .card-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 24px;
          padding-bottom: 16px;
          border-bottom: 1px solid #e5e7eb;
        }

        .card-header h3 {
          margin: 0;
          font-size: 18px;
          font-weight: 600;
          color: #1f2937;
        }

        .profile-form {
          display: grid;
          gap: 20px;
        }

        .form-group {
          display: flex;
          flex-direction: column;
        }

        .form-group label {
          margin-bottom: 8px;
          font-size: 14px;
          font-weight: 500;
          color: #374151;
        }

        .form-input {
          padding: 10px 12px;
          border: 1px solid #d1d5db;
          border-radius: 6px;
          font-size: 14px;
          font-family: inherit;
          transition: all 0.2s;
        }

        .form-input:focus {
          outline: none;
          border-color: #667eea;
          box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
        }

        .form-input:disabled {
          background: #f3f4f6;
          color: #9ca3af;
          cursor: not-allowed;
        }

        .form-actions {
          display: flex;
          gap: 12px;
          margin-top: 20px;
        }

        .profile-info-display {
          display: grid;
          gap: 16px;
        }

        .info-item {
          display: flex;
          justify-content: space-between;
          padding-bottom: 12px;
          border-bottom: 1px solid #f3f4f6;
        }

        .info-label {
          font-weight: 500;
          color: #6b7280;
          font-size: 14px;
        }

        .info-value {
          font-weight: 600;
          color: #1f2937;
          font-size: 14px;
        }

        .security-items {
          display: grid;
          gap: 24px;
        }

        .security-item {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 20px;
          border: 1px solid #e5e7eb;
          border-radius: 8px;
          background: #f9fafb;
        }

        .security-info {
          flex: 1;
        }

        .security-title {
          margin: 0;
          font-weight: 600;
          color: #1f2937;
          font-size: 14px;
        }

        .security-desc {
          margin: 4px 0 0 0;
          color: #6b7280;
          font-size: 13px;
        }
      `}</style>
    </div>
  );
}
