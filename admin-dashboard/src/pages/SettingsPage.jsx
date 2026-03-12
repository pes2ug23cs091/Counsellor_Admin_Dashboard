export default function SettingsPage() {
  return (
    <div className="settings-page">
      <div className="page-header">
        <h1>Settings</h1>
        <p>System configuration</p>
      </div>

      <div className="settings-card">
        <h2>Notifications</h2>
        <div className="settings-content">
          <div className="setting-item">
            <div className="setting-info">
              <p className="setting-title">Email Notifications</p>
              <p className="setting-desc">Receive email updates about important events</p>
            </div>
            <div className="toggle-switch">
              <input type="checkbox" id="email-notif" />
              <label htmlFor="email-notif"></label>
            </div>
          </div>
          <div className="setting-item">
            <div className="setting-info">
              <p className="setting-title">Push Notifications</p>
              <p className="setting-desc">Receive push notifications on your devices</p>
            </div>
            <div className="toggle-switch">
              <input type="checkbox" id="push-notif" />
              <label htmlFor="push-notif"></label>
            </div>
          </div>
        </div>
      </div>

      <div className="settings-card">
        <h2>Data & Privacy</h2>
        <div className="settings-content">
          <div className="setting-item">
            <div className="setting-info">
              <p className="setting-title">Automatic Data Backup</p>
              <p className="setting-desc">Automatically backup your data weekly</p>
            </div>
            <div className="toggle-switch">
              <input type="checkbox" id="auto-backup" />
              <label htmlFor="auto-backup"></label>
            </div>
          </div>
          <div className="setting-item">
            <div className="setting-info">
              <p className="setting-title">Two-Factor Authentication</p>
              <p className="setting-desc">Add extra layer of security</p>
            </div>
            <div className="toggle-switch">
              <input type="checkbox" id="2fa" />
              <label htmlFor="2fa"></label>
            </div>
          </div>
        </div>
      </div>

      <div className="settings-card">
        <h2>Display</h2>
        <div className="settings-content">
          <div className="setting-item">
            <div className="setting-info">
              <p className="setting-title">Dark Mode</p>
              <p className="setting-desc">Switch to dark theme</p>
            </div>
            <div className="toggle-switch">
              <input type="checkbox" id="dark-mode" />
              <label htmlFor="dark-mode"></label>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
