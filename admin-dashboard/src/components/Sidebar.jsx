import { useState } from 'react';

export default function Sidebar({ currentPage, onNavigate }) {
  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: '📊' },
    { id: 'users', label: 'Users', icon: '👥' },
    { id: 'counsellors', label: 'Counsellors', icon: '💼' },
    { id: 'settings', label: 'Settings', icon: '⚙️' },
  ];

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
        <button 
          className="user-info"
          onClick={() => onNavigate('profile')}
          style={{ background: 'none', border: 'none', cursor: 'pointer', width: '100%' }}
        >
          <div className="user-avatar">A</div>
          <div className="user-details">
            <p className="user-name">Admin User</p>
            <p className="user-role">Super Admin</p>
          </div>
        </button>
      </div>
    </aside>
  );
}
