import { useState, useMemo, useEffect } from "react";
import { Icons } from "../utils/icons";
import { 
  getUsers, 
  getCounsellors, 
  createUser, 
  updateUser, 
  deleteUser, 
  assignCounsellor 
} from "../utils/services";
import Badge from "../components/Badge";
import SearchBar from "../components/SearchBar";
import AssignmentModal from "../components/AssignmentModal";
import EditUserModal from "../components/EditUserModal";
import DeleteConfirmationModal from "../components/DeleteConfirmationModal";
import AddUserModal from "../components/AddUserModal";

export default function UsersPage({ assignments = {}, onAssign = () => {} }) {
  const [users, setUsers] = useState([]);
  const [counsellors, setCounsellors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [userToDelete, setUserToDelete] = useState(null);
  const [addModalOpen, setAddModalOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [riskFilter, setRiskFilter] = useState("All");
  const [planFilter, setPlanFilter] = useState("All");

  // Fetch data from backend
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const [usersData, counsellorsData] = await Promise.all([
          getUsers(),
          getCounsellors(),
        ]);
        // Transform raw API data to match frontend format
        const transformedUsers = usersData.map((user) => ({
          id: user.id,
          name: user.name,
          email: user.email,
          riskLevel: user.risk_level ? user.risk_level.charAt(0).toUpperCase() + user.risk_level.slice(1) : "Low",
          counsellor: user.counsellor_id ? counsellorsData.find(c => c.id === user.counsellor_id)?.name || "Unassigned" : "Unassigned",
          sessionTime: user.session_time || "Not Scheduled",
          planStatus: user.plan_status ? user.plan_status.charAt(0).toUpperCase() + user.plan_status.slice(1) : "Active",
          joinDate: new Date(user.created_at).toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" }),
          avatar: user.name.split(" ").map(word => word[0]).join("").toUpperCase(),
          color: "#6366f1",
        }));
        setUsers(transformedUsers);
        setCounsellors(counsellorsData);
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const filtered = useMemo(() => {
    return users.filter((u) => {
      const matchSearch =
        u.name.toLowerCase().includes(search.toLowerCase()) ||
        u.email.toLowerCase().includes(search.toLowerCase()) ||
        u.counsellor.toLowerCase().includes(search.toLowerCase());
      const matchRisk = riskFilter === "All" || u.riskLevel === riskFilter;
      const matchPlan = planFilter === "All" || u.planStatus === planFilter;
      return matchSearch && matchRisk && matchPlan;
    });
  }, [search, riskFilter, planFilter, assignments, users]);

  const getCounsellorName = (user) => {
    if (assignments[user.id]) {
      return counsellors.find((c) => c.id === assignments[user.id])?.name || user.counsellor;
    }
    return user.counsellor;
  };

  const handleEditUser = async (userId, updatedData) => {
    try {
      await updateUser(userId, updatedData);
      setUsers((prev) =>
        prev.map((u) =>
          u.id === userId
            ? { ...u, name: updatedData.name, email: updatedData.email, riskLevel: updatedData.riskLevel }
            : u
        )
      );
      setEditingUser(null);
      setEditModalOpen(false);
    } catch (error) {
      console.error("Failed to update user:", error);
      alert("Failed to update user. Please try again.");
    }
  };

  const handleUpdatePlanStatus = async (userId, newStatus) => {
    try {
      // Get the user to update
      const userToUpdate = users.find(u => u.id === userId);
      if (!userToUpdate) return;

      // Include all required fields for API
      const updateData = {
        name: userToUpdate.name,
        email: userToUpdate.email,
        riskLevel: userToUpdate.riskLevel,
        plan_status: newStatus.toLowerCase()
      };
      
      await updateUser(userId, updateData);
      
      // Update local state
      setUsers((prev) =>
        prev.map((u) =>
          u.id === userId
            ? { ...u, planStatus: newStatus }
            : u
        )
      );
    } catch (error) {
      console.error("Failed to update plan status:", error);
      alert("Failed to update plan status. Please try again.");
    }
  };

  const handleDeleteUser = async (userId) => {
    try {
      await deleteUser(userId);
      setUsers((prev) => prev.filter((u) => u.id !== userId));
      setUserToDelete(null);
      setDeleteModalOpen(false);
    } catch (error) {
      console.error("Failed to delete user:", error);
      alert("Failed to delete user. Please try again.");
    }
  };

  const handleAddUser = async (newUserData) => {
    try {
      const createdUser = await createUser(newUserData);
      const newUser = {
        id: createdUser.id,
        name: createdUser.name,
        email: createdUser.email,
        riskLevel: createdUser.risk_level ? createdUser.risk_level.charAt(0).toUpperCase() + createdUser.risk_level.slice(1) : "Low",
        planStatus: "Active",
        joinDate: new Date().toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" }),
        counsellor: "Unassigned",
        color: "#6366f1",
        avatar: "👤",
      };
      setUsers((prev) => [...prev, newUser]);
      setAddModalOpen(false);
    } catch (error) {
      console.error("Failed to add user:", error);
      alert("Failed to add user. Please try again.");
    }
  };

  const handleAssignCounsellor = async (userId, counsellorId, counsellorName, sessionTiming = "") => {
    try {
      // Use assignCounsellor which now accepts sessionTiming
      const updateData = {
        counsellor_id: counsellorId,
      };
      if (sessionTiming) {
        updateData.session_time = sessionTiming;
      }
      
      await assignCounsellor(userId, counsellorId, sessionTiming);
      
      setUsers((prev) =>
        prev.map((u) => 
          u.id === userId 
            ? { 
                ...u, 
                counsellor: counsellorName,
                sessionTime: sessionTiming || u.sessionTime
              } 
            : u
        )
      );
      setModalOpen(false);
      setSelectedUser(null);
    } catch (error) {
      console.error("Failed to assign counsellor:", error);
      alert("Failed to assign counsellor. Please try again.");
    }
  };

  if (loading) {
    return (
      <div className="fade-in">
        <div className="page-header">
          <div>
            <div className="page-title">Users</div>
            <div className="page-breadcrumb">Loading users...</div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="page-container">
      <div className="page-header">
        <div>
          <h1 className="page-header-title">Users Management</h1>
          <p className="page-header-desc">Manage and monitor all registered users in the system</p>
        </div>
      </div>

      <div className="page-header-actions">
        <div></div>
        <button className="btn btn-primary" onClick={() => setAddModalOpen(true)}>
          {Icons.plus} Add New User
        </button>
      </div>

      <div className="table-card">
        <div className="table-header">
          <div className="table-header-top">
            <div className="table-search">
              <span className="table-search-icon">🔍</span>
              <input
                type="text"
                className="table-search-input"
                placeholder="Search users, emails, counsellors..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            <div className="table-filters">
              <select
                className="filter-select"
                value={riskFilter}
                onChange={(e) => setRiskFilter(e.target.value)}
              >
                <option value="All">All Risk Levels</option>
                <option value="Low">Low Risk</option>
                <option value="Medium">Medium Risk</option>
                <option value="High">High Risk</option>
              </select>
              <select
                className="filter-select"
                value={planFilter}
                onChange={(e) => setPlanFilter(e.target.value)}
              >
                <option value="All">All Statuses</option>
                <option value="Active">Active</option>
                <option value="Expired">Expired</option>
              </select>
            </div>
            <span className="results-count">
              <strong>{filtered.length}</strong> users found
            </span>
          </div>
        </div>

        <div className="table-wrapper">
          <table>
            <thead>
              <tr>
                <th>User</th>
                <th>Risk Level</th>
                <th>Assigned Counsellor</th>
                <th>Session Time</th>
                <th>Status</th>
                <th>Joined</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan="7" className="no-data">
                    No users found matching your filters.
                  </td>
                </tr>
              ) : (
                filtered.map((u) => (
                  <tr key={u.id}>
                    <td>
                      <div className="user-cell">
                        <div
                          className="cell-avatar"
                          style={{ background: u.color }}
                        >
                          {u.avatar}
                        </div>
                        <div className="cell-info">
                          <div className="cell-name">{u.name}</div>
                          <div className="cell-email">{u.email}</div>
                        </div>
                      </div>
                    </td>
                    <td>
                      <Badge type={u.riskLevel}>{u.riskLevel}</Badge>
                    </td>
                    <td>
                      {getCounsellorName(u)}
                    </td>
                    <td>
                      {u.sessionTime || "Not scheduled"}
                    </td>
                    <td>
                      <select
                        className="status-select"
                        value={u.planStatus}
                        onChange={(e) => handleUpdatePlanStatus(u.id, e.target.value)}
                        title="Change status"
                      >
                        <option value="Active">Active</option>
                        <option value="Pending">Pending</option>
                        <option value="Completed">Completed</option>
                      </select>
                    </td>
                    <td>
                      {u.joinDate}
                    </td>
                    <td>
                      <div className="action-buttons">
                        <button
                          className="action-btn"
                          title="Assign Counsellor"
                          onClick={() => {
                            setSelectedUser(u);
                            setModalOpen(true);
                          }}
                        >
                          👤
                        </button>
                        <button
                          className="action-btn"
                          title="Edit"
                          onClick={() => {
                            setEditingUser(u);
                            setEditModalOpen(true);
                          }}
                        >
                          ✏️
                        </button>
                        <button
                          className="action-btn delete"
                          title="Delete"
                          onClick={() => {
                            setUserToDelete(u);
                            setDeleteModalOpen(true);
                            }}
                        >
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          width="20"
                          height="20"
                          viewBox="0 0 24 24"
                          fill="currentColor"
                        >
                        <path d="M9 3h6l1 2h5v2H3V5h5l1-2z"/>
                        <path d="M6 9h12l-1 12H7L6 9z"/>
                        </svg>
                      </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        <div className="pagination-container">
          <div className="pagination-info">
            Showing <strong>{Math.min(10, filtered.length)}</strong> of <strong>{filtered.length}</strong> users
          </div>
          <div className="pagination-controls">
            <button className="page-btn">Prev</button>
            <button className="page-btn active">1</button>
            <button className="page-btn">2</button>
            <button className="page-btn">Next</button>
          </div>
        </div>
      </div>

      <AssignmentModal
        isOpen={modalOpen}
        user={selectedUser}
        currentCounsellor={selectedUser ? getCounsellorName(selectedUser) : ""}
        onAssign={handleAssignCounsellor}
        onClose={() => {
          setModalOpen(false);
          setSelectedUser(null);
        }}
      />

      <EditUserModal
        isOpen={editModalOpen}
        user={editingUser}
        onSave={handleEditUser}
        onClose={() => {
          setEditModalOpen(false);
          setEditingUser(null);
        }}
      />

      <DeleteConfirmationModal
        isOpen={deleteModalOpen}
        title="Delete User"
        item={userToDelete}
        message={`Are you sure you want to delete ${userToDelete?.name}? This action cannot be undone.`}
        onConfirm={() => handleDeleteUser(userToDelete.id)}
        onClose={() => {
          setDeleteModalOpen(false);
          setUserToDelete(null);
        }}
      />

      <AddUserModal
        isOpen={addModalOpen}
        onAdd={handleAddUser}
        onClose={() => setAddModalOpen(false)}
      />
    </div>
  );
}
