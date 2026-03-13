const pool = require("../config/database");
const { getCache, setCache, deleteCache, CACHE_KEYS, CACHE_TTL } = require("../utils/cache");

// GET all users
const getUsers = async (req, res) => {
  try {
    const adminId = req.admin.id;
    
    // Try to get from cache first (include admin_id in cache key for isolation)
    const cacheKey = `${CACHE_KEYS.USERS}:admin:${adminId}`;
    const cachedUsers = await getCache(cacheKey);
    if (cachedUsers) {
      return res.json(cachedUsers);
    }

    // If not in cache, query database - FILTER BY ADMIN_ID
    const result = await pool.query(
      "SELECT id, name, email, risk_level, plan_status, counsellor_id, admin_id, session_time, created_at, updated_at FROM users WHERE admin_id = $1 ORDER BY created_at DESC",
      [adminId]
    );
    
    // Store in cache
    await setCache(cacheKey, result.rows, CACHE_TTL.USERS);
    
    res.json(result.rows);
  } catch (error) {
    console.error("❌ Error fetching users:", error.message);
    res.status(500).json({ error: "Failed to fetch users" });
  }
};

// GET all completed users
const getCompletedUsers = async (req, res) => {
  try {
    const adminId = req.admin.id;
    
    // Try to get from cache first (include admin_id in cache key for isolation)
    const cacheKey = `${CACHE_KEYS.COMPLETED_USERS}:admin:${adminId}`;
    const cachedCompletedUsers = await getCache(cacheKey);
    if (cachedCompletedUsers) {
      return res.json(cachedCompletedUsers);
    }

    // If not in cache, query database - FILTER BY ADMIN_ID
    const result = await pool.query(
      "SELECT id, name, email, risk_level, plan_status, counsellor_id, admin_id, session_time, completed_at, created_at, updated_at FROM completed_users WHERE admin_id = $1 ORDER BY completed_at DESC",
      [adminId]
    );
    
    // Store in cache
    await setCache(cacheKey, result.rows, CACHE_TTL.USERS);
    
    res.json(result.rows);
  } catch (error) {
    console.error("❌ Error fetching completed users:", error.message);
    res.status(500).json({ error: "Failed to fetch completed users" });
  }
};

// CREATE user
const createUser = async (req, res) => {
  try {
    const adminId = req.admin.id;
    const { name, email, risk_level, plan_status, counsellor_id, session_time } = req.body;

    if (!name || !email) {
      return res.status(400).json({ error: "Name and email are required" });
    }

    const result = await pool.query(
      "INSERT INTO users (name, email, risk_level, plan_status, counsellor_id, admin_id, session_time, created_at, updated_at) VALUES ($1, $2, $3, $4, $5, $6, $7, NOW(), NOW()) RETURNING *",
      [name, email, risk_level || "medium", plan_status || "active", counsellor_id || null, adminId, session_time || null]
    );

    // Clear cache for this admin's users
    const cacheKey = `${CACHE_KEYS.USERS}:admin:${adminId}`;
    await deleteCache(cacheKey);

    console.log(`✅ User created: ${name} (Admin: ${adminId})`);
    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error("❌ Error creating user:", error.message);
    res.status(500).json({ error: "Failed to create user" });
  }
};

// UPDATE user
const updateUser = async (req, res) => {
  try {
    const adminId = req.admin.id;
    const { id } = req.params;
    const { name, email, risk_level, plan_status, counsellor_id, session_time } = req.body;

    // Get current user to check if status is being changed to "completed" and verify admin owns this user
    const currentUserResult = await pool.query("SELECT * FROM users WHERE id = $1 AND admin_id = $2", [id, adminId]);
    
    if (currentUserResult.rows.length === 0) {
      return res.status(404).json({ error: "User not found or unauthorized" });
    }

    const currentUser = currentUserResult.rows[0];
    const isMovingToCompleted = plan_status && plan_status.toLowerCase() === 'completed';
    const wasNotCompleted = !currentUser.plan_status || currentUser.plan_status.toLowerCase() !== 'completed';

    // Start transaction
    await pool.query("BEGIN");

    try {
      let result;

      if (isMovingToCompleted && wasNotCompleted) {
        // Move user to completed_users table - INCLUDE ADMIN_ID
        await pool.query(
          "INSERT INTO completed_users (name, email, risk_level, plan_status, counsellor_id, admin_id, session_time, created_at, updated_at) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)",
          [currentUser.name, currentUser.email, risk_level || currentUser.risk_level, 'completed', counsellor_id || currentUser.counsellor_id, adminId, session_time || currentUser.session_time, currentUser.created_at, new Date()]
        );
        console.log(`✅ User moved to completed_users: ${id} (Admin: ${adminId})`);

        // Delete user from users table
        await pool.query("DELETE FROM users WHERE id = $1", [id]);
        console.log(`🗑️  User deleted from users table: ${id}`);

        // If user had an assigned counsellor, decrement their assigned_users and update pending_reviews
        if (currentUser.counsellor_id) {
          await pool.query(
            "UPDATE counsellors SET assigned_users = GREATEST(0, assigned_users - 1), pending_reviews = GREATEST(0, pending_reviews - 1), updated_at = NOW() WHERE id = $1",
            [currentUser.counsellor_id]
          );
          console.log(`📉 Decremented assigned_users and pending_reviews for counsellor ${currentUser.counsellor_id}`);
        }

        result = {
          id: currentUser.id,
          name: currentUser.name,
          email: currentUser.email,
          risk_level: risk_level || currentUser.risk_level,
          plan_status: 'completed',
          counsellor_id: counsellor_id || currentUser.counsellor_id,
          session_time: session_time || currentUser.session_time,
          created_at: currentUser.created_at,
          updated_at: new Date(),
          completed: true
        };
      } else {
        // Regular update
        result = await pool.query(
          "UPDATE users SET name = $1, email = $2, risk_level = $3, plan_status = $4, counsellor_id = $5, session_time = $6, updated_at = NOW() WHERE id = $7 AND admin_id = $8 RETURNING *",
          [name, email, risk_level, plan_status, counsellor_id, session_time, id, adminId]
        );
        result = result.rows[0];
      }

      // Commit transaction
      await pool.query("COMMIT");

      // Clear cache for this admin's users and completed_users
      const userCacheKey = `${CACHE_KEYS.USERS}:admin:${adminId}`;
      const completedCacheKey = `${CACHE_KEYS.COMPLETED_USERS}:admin:${adminId}`;
      await deleteCache(userCacheKey);
      await deleteCache(completedCacheKey);
      await deleteCache(CACHE_KEYS.COUNSELLORS);

      console.log(`✅ User updated: ${id} (completed: ${isMovingToCompleted && wasNotCompleted})`);
      res.json(result);
    } catch (txError) {
      await pool.query("ROLLBACK");
      throw txError;
    }
  } catch (error) {
    console.error("❌ Error updating user:", error.message);
    res.status(500).json({ error: "Failed to update user" });
  }
};

// DELETE user
const deleteUser = async (req, res) => {
  try {
    const adminId = req.admin.id;
    const { id } = req.params;

    // Get user to check if they have an assigned counsellor and verify admin owns this user
    const userResult = await pool.query("SELECT counsellor_id FROM users WHERE id = $1 AND admin_id = $2", [id, adminId]);
    
    if (userResult.rows.length === 0) {
      return res.status(404).json({ error: "User not found or unauthorized" });
    }

    const counsellorId = userResult.rows[0].counsellor_id;

    // Start transaction
    await pool.query("BEGIN");

    try {
      // If user had an assigned counsellor, decrement their assigned_users
      if (counsellorId) {
        await pool.query(
          "UPDATE counsellors SET assigned_users = GREATEST(0, assigned_users - 1), updated_at = NOW() WHERE id = $1",
          [counsellorId]
        );
        console.log(`📉 Decremented assigned_users for counsellor ${counsellorId} (user deleted)`);
      }

      // Delete the user
      const result = await pool.query("DELETE FROM users WHERE id = $1 AND admin_id = $2 RETURNING *", [id, adminId]);

      // Commit transaction
      await pool.query("COMMIT");

      // Clear cache when user is deleted
      await deleteCache(CACHE_KEYS.USERS);

      console.log(`✅ User deleted: ${id}`);
      res.json({ message: "User deleted successfully", user: result.rows[0] });
    } catch (txError) {
      await pool.query("ROLLBACK");
      throw txError;
    }
  } catch (error) {
    console.error("❌ Error deleting user:", error.message);
    res.status(500).json({ error: "Failed to delete user" });
  }
};

// ASSIGN COUNSELLOR to user
const assignCounsellor = async (req, res) => {
  try {
    const { id } = req.params;
    const { counsellor_id, session_time } = req.body;

    if (!counsellor_id) {
      return res.status(400).json({ error: "Counsellor ID is required" });
    }

    // Get current user to check if they already have a counsellor
    const currentUserResult = await pool.query("SELECT counsellor_id FROM users WHERE id = $1", [id]);
    
    if (currentUserResult.rows.length === 0) {
      return res.status(404).json({ error: "User not found" });
    }

    const oldCounsellorId = currentUserResult.rows[0].counsellor_id;

    // Start transaction
    await pool.query("BEGIN");

    try {
      // If user had a previous counsellor, decrement their assigned_users
      if (oldCounsellorId && oldCounsellorId !== counsellor_id) {
        await pool.query(
          "UPDATE counsellors SET assigned_users = GREATEST(0, assigned_users - 1), updated_at = NOW() WHERE id = $1",
          [oldCounsellorId]
        );
        console.log(`📉 Decremented assigned_users for counsellor ${oldCounsellorId}`);
      }

      // Increment assigned_users for new counsellor (only if not already assigned)
      if (!oldCounsellorId || oldCounsellorId !== counsellor_id) {
        await pool.query(
          "UPDATE counsellors SET assigned_users = assigned_users + 1, updated_at = NOW() WHERE id = $1",
          [counsellor_id]
        );
        console.log(`📈 Incremented assigned_users for counsellor ${counsellor_id}`);
      }

      // Update user with new counsellor
      const result = await pool.query(
        "UPDATE users SET counsellor_id = $1, session_time = $2, updated_at = NOW() WHERE id = $3 RETURNING *",
        [counsellor_id, session_time || null, id]
      );

      // Commit transaction
      await pool.query("COMMIT");

      // Clear cache for both users and counsellors (since assigned_users changed)
      await deleteCache(CACHE_KEYS.USERS);
      await deleteCache(CACHE_KEYS.COUNSELLORS);

      console.log(`✅ Counsellor ${counsellor_id} assigned to user ${id}, session time: ${session_time || "Not set"}`);
      res.json(result.rows[0]);
    } catch (txError) {
      await pool.query("ROLLBACK");
      throw txError;
    }
  } catch (error) {
    console.error("❌ Error assigning counsellor:", error.message);
    res.status(500).json({ error: "Failed to assign counsellor" });
  }
};

module.exports = {
  getUsers,
  getCompletedUsers,
  createUser,
  updateUser,
  deleteUser,
  assignCounsellor,
};
