import { useState, useMemo, useEffect } from "react";
import { Icons } from "../utils/icons";
import {
  getCounsellors,
  createCounsellor,
  updateCounsellor,
  deleteCounsellor,
} from "../utils/services";
import Badge from "../components/Badge";
import SearchBar from "../components/SearchBar";
import AddCounsellorModal from "../components/AddCounsellorModal";
import DeleteConfirmationModal from "../components/DeleteConfirmationModal";

export default function CounsellorsPage() {
  const [counsellors, setCounsellors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [addModalOpen, setAddModalOpen] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [counsellorToDelete, setCounsellorToDelete] = useState(null);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");

  // Fetch data from backend
  useEffect(() => {
    const fetchData = async () => {
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
    fetchData();
  }, []);

  const filtered = useMemo(() => {
    return counsellors.filter((c) => {
      const matchSearch =
        c.name.toLowerCase().includes(search.toLowerCase()) ||
        (c.specialty && c.specialty.toLowerCase().includes(search.toLowerCase()));
      const matchStatus = statusFilter === "All" || c.status === statusFilter;
      return matchSearch && matchStatus;
    });
  }, [search, statusFilter, counsellors]);

  const handleAddCounsellor = async (newCounsellorData) => {
    try {
      const createdCounsellor = await createCounsellor(newCounsellorData);
      // Ensure the counsellor has all required fields
      const newCounsellor = {
        id: createdCounsellor.id,
        name: createdCounsellor.name,
        specialty: createdCounsellor.specialty || newCounsellorData.specialty,
        status: createdCounsellor.status || "active",
        assigned_users: createdCounsellor.assigned_users || 0,
        pending_reviews: createdCounsellor.pending_reviews || 0,
      };
      setCounsellors((prev) => [...prev, newCounsellor]);
      setAddModalOpen(false);
    } catch (error) {
      console.error("Failed to add counsellor:", error);
      alert("Failed to add counsellor. Please try again.");
    }
  };

  const toggleStatus = async (counsellorId, updatedCounsellor) => {
    try {
      // updatedCounsellor already has the correct status set by onChange
      await updateCounsellor(counsellorId, updatedCounsellor);
      setCounsellors((prev) =>
        prev.map((c) => (c.id === counsellorId ? updatedCounsellor : c))
      );
      console.log(`Counsellor status updated to: ${updatedCounsellor.status}`);
    } catch (error) {
      console.error("Failed to update status:", error);
      alert("Failed to update status. Please try again.");
    }
  };

  const handleDeleteCounsellor = async (counsellorId) => {
    try {
      await deleteCounsellor(counsellorId);
      setCounsellors((prev) => prev.filter((c) => c.id !== counsellorId));
      setCounsellorToDelete(null);
      setDeleteModalOpen(false);
    } catch (error) {
      console.error("Failed to delete counsellor:", error);
      alert("Failed to delete counsellor. Please try again.");
    }
  };

  if (loading) {
    return (
      <div className="fade-in">
        <div className="page-header">
          <div>
            <div className="page-title">Counsellors</div>
            <div className="page-breadcrumb">Loading counsellors...</div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="page-container">
      <div className="page-header">
        <div>
          <h1 className="page-header-title">Counsellors Management</h1>
          <p className="page-header-desc">Manage and monitor all registered counsellors in the system</p>
        </div>
      </div>

      <div className="page-header-actions">
        <div></div>
        <button className="btn btn-primary" onClick={() => setAddModalOpen(true)}>
          {Icons.plus} Add New Counsellor
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
                placeholder="Search counsellors, specialties..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            <div className="table-filters">
              <select
                className="filter-select"
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
              >
                <option value="All">All Status</option>
                <option value="Active">Active</option>
                <option value="Inactive">Inactive</option>
              </select>
            </div>
            <span className="results-count">
              <strong>{filtered.length}</strong> counsellors found
            </span>
          </div>
        </div>

        <div className="table-wrapper">
          <table>
            <thead>
              <tr>
                <th>Counsellor</th>
                <th>Specialty</th>
                <th>Status</th>
                <th>Assigned Users</th>
                <th>Pending Reviews</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan="6" className="no-data">
                    No counsellors found matching your filters.
                  </td>
                </tr>
              ) : (
                filtered.map((c) => {
                  // Generate initials and color for avatar
                  const initials = c.name
                    .split(" ")
                    .map((word) => word[0])
                    .join("")
                    .toUpperCase();
                  const colors = ["#4F46E5", "#0891b2", "#059669", "#7c3aed", "#be123c", "#d97706"];
                  const avatarColor = colors[c.id % colors.length];

                  return (
                    <tr key={c.id}>
                      <td>
                        <div className="user-cell">
                          <div
                            className="cell-avatar"
                            style={{ background: avatarColor }}
                          >
                            {initials}
                          </div>
                          <div className="cell-info">
                            <div className="cell-name">{c.name}</div>
                            <div className="cell-email">Dr. {c.name.split(" ")[1]}</div>
                          </div>
                        </div>
                      </td>
                      <td>
                        {c.specialty || "General Counselling"}
                      </td>
                      <td>
                        <select
                          className="status-select"
                          value={String(c.status || "active").toLowerCase() === "active" ? "Active" : "Inactive"}
                          onChange={(e) => {
                            const newStatus = e.target.value === "Active" ? "active" : "inactive";
                            const updatedCounsellor = {
                              ...c,
                              status: newStatus,
                              email: c.email || "",
                              specialty: c.specialty || "",
                              availability: c.availability || "Available",
                              phone: c.phone || "",
                              assigned_users: parseInt(c.assigned_users) || 0,
                              pending_reviews: parseInt(c.pending_reviews) || 0,
                            };
                            toggleStatus(c.id, updatedCounsellor);
                          }}
                        >
                          <option value="Active">Active</option>
                          <option value="Inactive">Inactive</option>
                        </select>
                      </td>
                      <td>
                        {String(parseInt(c.assigned_users) || 0)}
                      </td>
                      <td>
                        {String(parseInt(c.pending_reviews) || 0)}
                      </td>
                      <td>
                        <button
                          className="action-btn delete"
                          onClick={() => {
                            setCounsellorToDelete(c);
                            setDeleteModalOpen(true);
                          }}
                          title="Delete"
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
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        <div className="pagination-container">
          <div className="pagination-info">
            Showing <strong>{Math.min(10, filtered.length)}</strong> of <strong>{filtered.length}</strong> counsellors
          </div>
          <div className="pagination-controls">
            <button className="page-btn">Prev</button>
            <button className="page-btn active">1</button>
            <button className="page-btn">2</button>
            <button className="page-btn">Next</button>
          </div>
        </div>
      </div>

      <AddCounsellorModal
        isOpen={addModalOpen}
        onClose={() => setAddModalOpen(false)}
        onAdd={handleAddCounsellor}
      />

      <DeleteConfirmationModal
        isOpen={deleteModalOpen}
        title="Delete Counsellor"
        item={counsellorToDelete}
        onClose={() => {
          setDeleteModalOpen(false);
          setCounsellorToDelete(null);
        }}
        onConfirm={handleDeleteCounsellor}
      />
    </div>
  );
}
