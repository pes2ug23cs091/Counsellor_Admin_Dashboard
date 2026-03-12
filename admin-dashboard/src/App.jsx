import { useState } from 'react';
import Sidebar from './components/Sidebar';
import DashboardPage from './pages/DashboardPage';
import UsersPage from './pages/UsersPage';
import CounsellorsPage from './pages/CounsellorsPage';
import SettingsPage from './pages/SettingsPage';
import ProfilePage from './pages/ProfilePage';
import './styles/index.css';
import './styles/layout.css';
import './styles/tables.css';
import './styles/modals.css';

function App() {
  const [currentPage, setCurrentPage] = useState('dashboard');

  return (
    <div className="app-layout">
      <Sidebar currentPage={currentPage} onNavigate={setCurrentPage} />
      <main className="app-main">
        {currentPage === 'dashboard' && <DashboardPage />}
        {currentPage === 'users' && <UsersPage />}
        {currentPage === 'counsellors' && <CounsellorsPage />}
        {currentPage === 'settings' && <SettingsPage />}
        {currentPage === 'profile' && <ProfilePage />}
      </main>
    </div>
  );
}

export default App;

