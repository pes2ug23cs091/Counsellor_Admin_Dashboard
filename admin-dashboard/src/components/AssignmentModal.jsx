import { useState, useEffect } from "react";
import { getCounsellors } from "../utils/services";
import { Icons } from "../utils/icons";

export default function AssignmentModal({ isOpen, user, onClose, onAssign }) {
  const [counsellors, setCounsellors] = useState([]);
  const [selectedCounsellor, setSelectedCounsellor] = useState(null);
  const [sessionTiming, setSessionTiming] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen) {
      const fetchCounsellors = async () => {
        setLoading(true);
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

  const handleAssign = () => {
    if (selectedCounsellor) {
      onAssign(user.id, selectedCounsellor.id, selectedCounsellor.name, sessionTiming);
      setSelectedCounsellor(null);
      setSessionTiming("");
    }
  };

  if (!isOpen || !user) return null;

  return (
    <div className="modal-overlay active" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2 className="modal-title">Assign Counsellor to User</h2>
          <button className="modal-close" onClick={onClose}>
            ✕
          </button>
        </div>
        <div className="modal-content">
          <div style={{ marginBottom: "18px" }}>
            <label className="form-label" style={{ marginBottom: "6px" }}>
              User
            </label>
            <div style={{
              padding: "12px 14px",
              background: "#f8f9fa",
              borderRadius: "8px",
              fontWeight: "600",
              color: "#2c3e50"
            }}>
              {user.name}
            </div>
          </div>

          <div>
            <label className="form-label">Select Counsellor</label>
            {loading ? (
              <div className="no-data">Loading counsellors...</div>
            ) : counsellors.length === 0 ? (
              <div className="no-data">No counsellors available</div>
            ) : (
              <div className="counsellor-list">
                {counsellors.map((c) => (
                  <div
                    key={c.id}
                    className="counsellor-item"
                    onClick={() => setSelectedCounsellor(c)}
                    style={{
                      background: selectedCounsellor?.id === c.id ? "#f0f4ff" : "white",
                      borderLeft: selectedCounsellor?.id === c.id ? "4px solid #3498db" : "4px solid transparent",
                    }}
                  >
                    <input
                      type="radio"
                      className="counsellor-radio"
                      name="counsellor"
                      checked={selectedCounsellor?.id === c.id}
                      onChange={() => setSelectedCounsellor(c)}
                    />
                    <div className="counsellor-info">
                      <div className="counsellor-name">{c.name}</div>
                      <div className="counsellor-specialty">{c.specialty}</div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div style={{ marginBottom: "18px", marginTop: "20px" }}>
            <label className="form-label" style={{ marginBottom: "6px" }}>
              Session Timing (Optional)
            </label>
            <input
              type="text"
              className="form-input"
              placeholder="e.g., 9:00 AM - 10:00 AM"
              value={sessionTiming}
              onChange={(e) => setSessionTiming(e.target.value)}
              style={{
                padding: "10px 12px",
                border: "1px solid #e0e0e0",
                borderRadius: "8px",
                fontSize: "14px",
                fontFamily: "inherit",
                width: "100%",
                boxSizing: "border-box"
              }}
            />
          </div>
        </div>
        <div className="modal-footer">
          <button className="btn btn-secondary" onClick={onClose}>
            Cancel
          </button>
          <button
            className="btn btn-primary"
            onClick={handleAssign}
            disabled={!selectedCounsellor}
          >
            Assign Counsellor
          </button>
        </div>
      </div>
    </div>
  );
}
