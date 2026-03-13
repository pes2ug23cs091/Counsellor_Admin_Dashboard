// Use environment variable for API URL, fallback to relative path for local dev
const API_BASE_URL = import.meta.env.VITE_API_URL 
  ? `${import.meta.env.VITE_API_URL}/api`
  : "/api";

console.log("🔗 API Base URL:", API_BASE_URL);

// Helper function to get authorization headers with JWT token
const getAuthHeaders = () => {
  const token = localStorage.getItem('authToken');
  return {
    'Content-Type': 'application/json',
    ...(token && { 'Authorization': `Bearer ${token}` })
  };
};

// Helper function to generate avatar color
const generateColor = (id) => {
  const colors = ["#4F46E5", "#0891b2", "#059669", "#7c3aed", "#be123c", "#d97706"];
  return colors[id % colors.length];
};

// Helper function to generate avatar initials
const getInitials = (name) => {
  return name
    .split(" ")
    .map((word) => word[0])
    .join("")
    .toUpperCase();
};

export const getDashboardMetrics = async () => {
  try {
    const usersResponse = await fetch(`${API_BASE_URL}/users`, {
      headers: getAuthHeaders()
    });
    const counsellorsResponse = await fetch(`${API_BASE_URL}/counsellors`, {
      headers: getAuthHeaders()
    });
    
    const users = await usersResponse.json();
    const counsellors = await counsellorsResponse.json();
    
    // Count users with "active" status
    const activeUsers = users.filter((u) => u.plan_status && String(u.plan_status).toLowerCase() === "active").length;
    
    // Count users with "pending" status (these are pending sessions)
    const pendingReviews = users.filter((u) => u.plan_status && String(u.plan_status).toLowerCase() === "pending").length;
    
    console.log('✅ Dashboard metrics calculated:', { 
      totalUsers: users.length, 
      activeUsers,
      pendingUsers: pendingReviews,
      counsellors: counsellors.length,
      pendingReviews 
    });
    
    return {
      totalUsers: users.length,
      activeUsers: activeUsers,
      counsellors: counsellors.length,
      pendingReviews: pendingReviews,
    };
  } catch (error) {
    console.error("❌ Error fetching dashboard metrics:", error);
    return {
      totalUsers: 0,
      activeUsers: 0,
      counsellors: 0,
      pendingReviews: 0,
    };
  }
};

export const getUsers = async () => {
  try {
    const response = await fetch(`${API_BASE_URL}/users`, {
      headers: getAuthHeaders()
    });
    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Error fetching users:", error);
    return [];
  }
};

export const getCompletedUsers = async () => {
  try {
    const response = await fetch(`${API_BASE_URL}/users/completed-users`, {
      headers: getAuthHeaders()
    });
    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Error fetching completed users:", error);
    return [];
  }
};

export const getCounsellors = async () => {
  try {
    const response = await fetch(`${API_BASE_URL}/counsellors`, {
      headers: getAuthHeaders()
    });
    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Error fetching counsellors:", error);
    return [];
  }
};

// CREATE USER
export const createUser = async (userData) => {
  try {
    const response = await fetch(`${API_BASE_URL}/users`, {
      method: "POST",
      headers: getAuthHeaders(),
      body: JSON.stringify({
        name: userData.name,
        email: userData.email,
        risk_level: userData.riskLevel ? userData.riskLevel.toLowerCase() : (userData.risk_level ? userData.risk_level.toLowerCase() : "low"),
        plan_status: "active",
      }),
    });
    if (!response.ok) throw new Error("Failed to create user");
    return await response.json();
  } catch (error) {
    console.error("Error creating user:", error);
    throw error;
  }
};

// UPDATE USER
export const updateUser = async (userId, userData) => {
  try {
    const body = {
      name: userData.name || userData.originalName,
      email: userData.email || userData.originalEmail,
      risk_level: userData.riskLevel ? userData.riskLevel.toLowerCase() : (userData.risk_level || "low"),
    };
    if (userData.plan_status) {
      body.plan_status = userData.plan_status.toLowerCase();
    }
    const response = await fetch(`${API_BASE_URL}/users/${userId}`, {
      method: "PUT",
      headers: getAuthHeaders(),
      body: JSON.stringify(body),
    });
    if (!response.ok) throw new Error("Failed to update user");
    return await response.json();
  } catch (error) {
    console.error("Error updating user:", error);
    throw error;
  }
};

// DELETE USER
export const deleteUser = async (userId) => {
  try {
    const response = await fetch(`${API_BASE_URL}/users/${userId}`, {
      method: "DELETE",
      headers: getAuthHeaders()
    });
    if (!response.ok) throw new Error("Failed to delete user");
    return await response.json();
  } catch (error) {
    console.error("Error deleting user:", error);
    throw error;
  }
};

// CREATE COUNSELLOR
export const createCounsellor = async (counsellorData) => {
  try {
    const response = await fetch(`${API_BASE_URL}/counsellors`, {
      method: "POST",
      headers: getAuthHeaders(),
      body: JSON.stringify({
        name: counsellorData.name,
        specialty: counsellorData.specialty,
        status: "active",
      }),
    });
    if (!response.ok) throw new Error("Failed to create counsellor");
    return await response.json();
  } catch (error) {
    console.error("Error creating counsellor:", error);
    throw error;
  }
};

// UPDATE COUNSELLOR
export const updateCounsellor = async (counsellorId, counsellorData) => {
  try {
    const body = {};
    
    // Only include fields that are provided
    if (counsellorData.name !== undefined) body.name = counsellorData.name;
    if (counsellorData.email !== undefined) body.email = counsellorData.email;
    if (counsellorData.specialty !== undefined) body.specialty = counsellorData.specialty;
    if (counsellorData.availability !== undefined) body.availability = counsellorData.availability;
    if (counsellorData.phone !== undefined) body.phone = counsellorData.phone;
    if (counsellorData.status !== undefined) body.status = counsellorData.status.toLowerCase();
    if (counsellorData.assigned_users !== undefined) body.assigned_users = counsellorData.assigned_users;
    if (counsellorData.pending_reviews !== undefined) body.pending_reviews = counsellorData.pending_reviews;

    const response = await fetch(`${API_BASE_URL}/counsellors/${counsellorId}`, {
      method: "PUT",
      headers: getAuthHeaders(),
      body: JSON.stringify(body),
    });
    if (!response.ok) throw new Error("Failed to update counsellor");
    return await response.json();
  } catch (error) {
    console.error("Error updating counsellor:", error);
    throw error;
  }
};

// DELETE COUNSELLOR
export const deleteCounsellor = async (counsellorId) => {
  try {
    const response = await fetch(`${API_BASE_URL}/counsellors/${counsellorId}`, {
      method: "DELETE",
      headers: getAuthHeaders()
    });
    if (!response.ok) throw new Error("Failed to delete counsellor");
    return await response.json();
  } catch (error) {
    console.error("Error deleting counsellor:", error);
    throw error;
  }
};

// ASSIGN COUNSELLOR TO USER
export const assignCounsellor = async (userId, counsellorId, sessionTiming) => {
  try {
    const body = {
      counsellor_id: counsellorId,
    };
    if (sessionTiming) {
      body.session_time = sessionTiming;
    }
    const response = await fetch(`${API_BASE_URL}/users/${userId}/assign-counsellor`, {
      method: "POST",
      headers: getAuthHeaders(),
      body: JSON.stringify(body),
    });
    if (!response.ok) throw new Error("Failed to assign counsellor");
    return await response.json();
  } catch (error) {
    console.error("Error assigning counsellor:", error);
    throw error;
  }
};
