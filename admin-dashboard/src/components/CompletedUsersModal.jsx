import { useEffect, useState } from "react";
import { getCounsellors } from "../utils/services";

export default function CompletedUsersModal({ isOpen, completedUsers, onClose }) {
  const [counsellors, setCounsellors] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (isOpen) {
      const fetchCounsellors = async () => {
        try {
          const data = await getCounsellors();
          setCounsellors(data);
        } catch (error) {
          console.error("Error fetching counsellors:", error);
        } finally {
          setLoading(false);
        }
      };
      fetchCounsellors();
    }
  }, [isOpen]);

  const getCounsellorName = (counsellorId) => {
    if (!counsellorId) return "Unassigned";
    const counsellor = counsellors.find(c => c.id === counsellorId);
    return counsellor ? counsellor.name : "Unassigned";
  };

  const getRiskColor = (level) => {
    switch (level) {
      case 'low': return '#10b981';
      case 'medium': return '#f59e0b';
      case 'high': return '#ef4444';
      default: return '#667eea';
    }
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay active" onClick={onClose}>
      <div className="modal completed-users-modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2 className="modal-title">Completed Users</h2>
          <button className="modal-close" onClick={onClose}>
            ✕
          </button>
        </div>
        <div className="modal-content">
          {loading ? (
            <div style={{ textAlign: 'center', padding: '20px' }}>Loading...</div>
          ) : completedUsers && completedUsers.length > 0 ? (
            <div className="completed-users-table">
              <table>
                <thead>
                  <tr>
                    <th>User Name</th>
                    <th>Email</th>
                    <th>Risk Level</th>
                    <th>Assigned Counsellor</th>
                    <th>Session Time</th>
                    <th>Completed Date</th>
                  </tr>
                </thead>
                <tbody>
                  {completedUsers.map((user, idx) => (
                    <tr key={idx}>
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center' }}>
                          <div
                            style={{
                              width: '32px',
                              height: '32px',
                              borderRadius: '50%',
                              background: '#667eea',
                              color: 'white',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              marginRight: '8px',
                              fontSize: '12px',
                              fontWeight: 'bold'
                            }}
                          >
                            {user.name.split(" ").map(word => word[0]).join("").toUpperCase()}
                          </div>
                          <span>{user.name}</span>
                        </div>
                      </td>
                      <td>{user.email}</td>
                      <td>
                        <span
                          style={{
                            backgroundColor: getRiskColor(user.risk_level) + '20',
                            color: getRiskColor(user.risk_level),
                            padding: '4px 8px',
                            borderRadius: '4px',
                            fontSize: '12px',
                            fontWeight: '500'
                          }}
                        >
                          {user.risk_level ? user.risk_level.charAt(0).toUpperCase() + user.risk_level.slice(1) : 'N/A'}
                        </span>
                      </td>
                      <td>{getCounsellorName(user.counsellor_id)}</td>
                      <td>{user.session_time || 'Not scheduled'}</td>
                      <td>
                        {user.completed_at 
                          ? new Date(user.completed_at).toLocaleDateString("en-US", { 
                              year: "numeric", 
                              month: "short", 
                              day: "numeric",
                              hour: "2-digit",
                              minute: "2-digit"
                            })
                          : 'N/A'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div style={{ textAlign: 'center', padding: '20px', color: '#999' }}>
              <p>No completed users found</p>
            </div>
          )}
        </div>
        <div className="modal-footer">
          <button className="btn btn-secondary" onClick={onClose}>
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
