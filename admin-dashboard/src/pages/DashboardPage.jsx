import { useState, useEffect } from 'react';
import { getDashboardMetrics, getUsers, getCounsellors, getCompletedUsers } from '../utils/services';
import CompletedUsersModal from '../components/CompletedUsersModal';

export default function DashboardPage() {
  const [metrics, setMetrics] = useState({
    totalUsers: 0,
    activeUsers: 0,
    counsellors: 0,
    pendingReviews: 0,
    completedUsers: 0,
  });
  const [activeCounsellings, setActiveCounsellings] = useState([]);
  const [completedUsersList, setCompletedUsersList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [completedUsersModalOpen, setCompletedUsersModalOpen] = useState(false);

  const fetchData = async () => {
    try {
      setRefreshing(true);
      const metricsData = await getDashboardMetrics();
      
      const usersData = await getUsers();
      const counsellorsData = await getCounsellors();
      const completedUsersData = await getCompletedUsers();
      
      // Set completed users count
      setMetrics({
        ...metricsData,
        completedUsers: completedUsersData.length
      });
      
      setCompletedUsersList(completedUsersData);
      
      const modelMap = {};
      counsellorsData.forEach(c => {
        modelMap[c.id] = c;
      });
      
      // Filter for users with active plan status and assigned counsellor
      const active = usersData
        .filter(u => {
          // Check if user has active status (handle various formats)
          const status = u.plan_status ? String(u.plan_status).toLowerCase() : '';
          const isActive = status === 'active';
          
          // Check if user has assigned counsellor
          const hasAssignedCounsellor = u.counsellor_id && modelMap[u.counsellor_id];
          
          console.log(`${u.name}: status=${status}, isActive=${isActive}, hasAssignedCounsellor=${hasAssignedCounsellor}`);
          return isActive && hasAssignedCounsellor;
        })
        .slice(0, 10)
        .map(u => ({
          userName: u.name,
          counsellorName: modelMap[u.counsellor_id]?.name || 'N/A',
          counsellorSpecialty: modelMap[u.counsellor_id]?.specialty || 'General',
          sessionTime: u.session_time || 'Not scheduled',
          riskLevel: u.risk_level,
          status: 'Active',
        }));
      
      console.log('Active counsellings found:', active.length, 'pendingReviews:', metricsData.pendingReviews);
      setActiveCounsellings(active);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchData();
    
    // Auto-refresh every 15 seconds for faster updates
    const interval = setInterval(fetchData, 15000);
    
    // Refresh when page becomes visible (tab switch)
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        fetchData();
      }
    };
    
    document.addEventListener('visibilitychange', handleVisibilityChange);
    
    return () => {
      clearInterval(interval);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, []);

  const cards = [
    { title: 'Total Users', value: metrics.totalUsers, icon: '👤', color: '#667eea' },
    { title: 'Active Users', value: metrics.activeUsers, icon: '🟢', color: '#10b981' },
    { title: 'Total Counsellors', value: metrics.counsellors, icon: '🧑‍⚕️', color: '#f59e0b' },
    { title: 'Pending Sessions', value: metrics.pendingReviews, icon: '🔴', color: '#ef4444' },
    { title: 'Completed Users', value: metrics.completedUsers, icon: '✅', color: '#8b5cf6', hasButton: true },
  ];

  const getRiskColor = (level) => {
    switch (level?.toLowerCase()) {
      case 'low': return '#10b981';
      case 'medium': return '#f59e0b';
      case 'high': return '#ef4444';
      default: return '#667eea';
    }
  };

  return (
    <div className="dashboard-page">
      <div className="page-header">
        <h1>Dashboard</h1>
        <p>Welcome back, Admin</p>
        <button 
          className="btn btn-primary" 
          onClick={fetchData}
          disabled={refreshing}
          style={{marginLeft: 'auto'}}
        >
          {refreshing ? '⏳ Refreshing...' : '🔄 Refresh'}
        </button>
      </div>

      <div className="metrics-grid">
        {cards.map((card, idx) => (
          <div key={idx} className="metric-card" style={{ position: 'relative' }}>
            <div className="metric-header">
              <div className="metric-icon" style={{ color: card.color }}>
                {card.icon}
              </div>
              <p className="metric-label">{card.title}</p>
            </div>
            <p className="metric-value">{loading ? '...' : (card.value || 0)}</p>
            {card.hasButton && (
              <button
                className="btn btn-primary"
                style={{
                  marginTop: '10px',
                  width: '100%',
                  padding: '8px 12px',
                  fontSize: '12px',
                  height: 'auto',
                  minHeight: '32px'
                }}
                onClick={() => setCompletedUsersModalOpen(true)}
                title="View all completed users"
              >
                View
              </button>
            )}
          </div>
        ))}
      </div>

      <div className="active-counsellings-section">
        <div className="section-header">
          <h2>Active Counsellings</h2>
          <p className="section-subtitle">Currently active counselling sessions</p>
        </div>
        <div className="counsellings-container">
          {activeCounsellings.length > 0 ? (
            <table className="counsellings-table">
              <thead>
                <tr>
                  <th>User Name</th>
                  <th>Counsellor (Speciality)</th>
                  <th>Session Timings</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {activeCounsellings.map((item, idx) => (
                  <tr key={idx}>
                    <td className="user-name-col">
                      {item.userName}
                    </td>
                    <td className="counsellor-col">
                      <p className="counsellor-name">{item.counsellorName}</p>
                      <p className="counsellor-specialty">{item.counsellorSpecialty}</p>
                    </td>
                    <td className="timing-col">
                      <p className="session-time">📅 {item.sessionTime}</p>
                    </td>
                    <td className="status-col">
                      <div className="status-badge" style={{ backgroundColor: '#10b98120', color: '#10b981' }}>
                        {item.status}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <p className="no-active-sessions">No active counselling sessions</p>
          )}
        </div>
      </div>

      <CompletedUsersModal
        isOpen={completedUsersModalOpen}
        completedUsers={completedUsersList}
        onClose={() => setCompletedUsersModalOpen(false)}
      />
    </div>
  );
}
