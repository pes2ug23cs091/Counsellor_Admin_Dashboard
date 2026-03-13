import { useState } from 'react';

export default function Sidebar({ currentPage, onNavigate, adminUser, onLogout }) {
  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: '📊' },
    { id: 'users', label: 'Users', icon: '👥' },
    { id: 'counsellors', label: 'Counsellors', icon: '💼' },
    { id: 'settings', label: 'Settings', icon: '⚙️' },
  ];

  const getInitials = (username) => {
    return (username || 'A').substring(0, 2).toUpperCase();
  };

  return (
    <aside className="sidebar">
      <div className="sidebar-header">
        <div className="logo">📊</div>
        <div className="brand">
          <h2>MonitorAI</h2>
          <p>Admin Console</p>
        </div>
      </div>

      <nav className="sidebar-nav">
        <div className="nav-section">
          <p className="nav-label">MAIN</p>
          {menuItems.slice(0, 3).map((item) => (
            <button
              key={item.id}
              className={`nav-item ${currentPage === item.id ? 'active' : ''}`}
              onClick={() => onNavigate(item.id)}
            >
              <span className="nav-icon">{item.icon}</span>
              <span className="nav-text">{item.label}</span>
              {item.badge && <span className="nav-badge">{item.badge}</span>}
            </button>
          ))}
        </div>

        <div className="nav-section">
          <p className="nav-label">SYSTEM</p>
          {menuItems.slice(3).map((item) => (
            <button
              key={item.id}
              className={`nav-item ${currentPage === item.id ? 'active' : ''}`}
              onClick={() => onNavigate(item.id)}
            >
              <span className="nav-icon">{item.icon}</span>
              <span className="nav-text">{item.label}</span>
            </button>
          ))}
        </div>
      </nav>

      <div className="sidebar-footer">
        <div 
          className="user-info"
          style={{ background: 'none', border: 'none', cursor: 'default', width: '100%' }}
        >
          <div className="user-avatar">{getInitials(adminUser?.username)}</div>
          <div className="user-details">
            <p className="user-name">{adminUser?.username || 'Admin'}</p>
            <p className="user-role">{adminUser?.role || 'Admin'}</p>
          </div>
        </div>
        <button
          className="logout-btn"
          onClick={onLogout}
          style={{
            width: '100%',
            padding: '10px 12px',
            marginTop: '12px',
            backgroundColor: '#fee2e2',
            color: '#991b1b',
            border: 'none',
            borderRadius: '6px',
            fontSize: '13px',
            fontWeight: '600',
            cursor: 'pointer',
            transition: 'all 0.2s ease'
          }}
          onMouseEnter={(e) => e.target.style.backgroundColor = '#fecaca'}
          onMouseLeave={(e) => e.target.style.backgroundColor = '#fee2e2'}
        >
          🚪 Logout
        </button>
      </div>
    </aside>
  );
}
