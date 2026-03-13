const pool = require("../config/database");
const { getCache, setCache, deleteCache, CACHE_KEYS, CACHE_TTL } = require("../utils/cache");

// GET all counsellors
const getCounsellors = async (req, res) => {
  try {
    const adminId = req.admin.id;
    
    // Try to get from cache first (include admin_id in cache key for isolation)
    const cacheKey = `${CACHE_KEYS.COUNSELLORS}:admin:${adminId}`;
    const cachedCounsellors = await getCache(cacheKey);
    if (cachedCounsellors) {
      return res.json(cachedCounsellors);
    }

    // If not in cache, query database - FILTER BY ADMIN_ID
    const result = await pool.query(
      "SELECT id, name, email, specialty, availability, phone, status, assigned_users, pending_reviews, admin_id, created_at, updated_at FROM counsellors WHERE admin_id = $1 ORDER BY created_at DESC",
      [adminId]
    );
    
    // Store in cache
    await setCache(cacheKey, result.rows, CACHE_TTL.COUNSELLORS);
    
    res.json(result.rows);
  } catch (error) {
    console.error("❌ Error fetching counsellors:", error.message);
    res.status(500).json({ error: "Failed to fetch counsellors" });
  }
};

// CREATE counsellor
const createCounsellor = async (req, res) => {
  try {
    const adminId = req.admin.id;
    const { name, email, specialty, availability, phone, status } = req.body;

    if (!name || !specialty) {
      return res.status(400).json({ error: "Name and specialty are required" });
    }

    // Auto-generate email if not provided
    const counsellorEmail = email || `${name.toLowerCase().replace(/\s+/g, '.')}.counsellor@example.com`;

    const result = await pool.query(
      "INSERT INTO counsellors (name, email, specialty, availability, phone, status, assigned_users, pending_reviews, admin_id, created_at, updated_at) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, NOW(), NOW()) RETURNING *",
      [name, counsellorEmail, specialty, availability || "Available", phone || "", status || "active", 0, 0, adminId]
    );

    // Clear cache for this admin's counsellors
    const cacheKey = `${CACHE_KEYS.COUNSELLORS}:admin:${adminId}`;
    await deleteCache(cacheKey);

    console.log(`✅ Counsellor created: ${name} (Admin: ${adminId})`);
    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error("❌ Error creating counsellor:", error.message);
    res.status(500).json({ error: "Failed to create counsellor" });
  }
};

// UPDATE counsellor
const updateCounsellor = async (req, res) => {
  try {
    const adminId = req.admin.id;
    const { id } = req.params;
    
    // Get current counsellor and verify admin ownership
    const current = await pool.query("SELECT * FROM counsellors WHERE id = $1 AND admin_id = $2", [id, adminId]);
    if (current.rows.length === 0) {
      return res.status(404).json({ error: "Counsellor not found or unauthorized" });
    }

    const counsellor = current.rows[0];
    const { name, email, specialty, availability, phone, status, assigned_users, pending_reviews } = req.body;

    // Only include fields that are provided in request
    const updateFields = [];
    const updateValues = [];
    let paramIndex = 1;

    if (name !== undefined) {
      updateFields.push(`name = $${paramIndex}`);
      updateValues.push(name);
      paramIndex++;
    }
    if (email !== undefined) {
      updateFields.push(`email = $${paramIndex}`);
      updateValues.push(email);
      paramIndex++;
    }
    if (specialty !== undefined) {
      updateFields.push(`specialty = $${paramIndex}`);
      updateValues.push(specialty);
      paramIndex++;
    }
    if (availability !== undefined) {
      updateFields.push(`availability = $${paramIndex}`);
      updateValues.push(availability);
      paramIndex++;
    }
    if (phone !== undefined) {
      updateFields.push(`phone = $${paramIndex}`);
      updateValues.push(phone);
      paramIndex++;
    }
    if (status !== undefined) {
      updateFields.push(`status = $${paramIndex}`);
      updateValues.push(String(status).toLowerCase());
      paramIndex++;
    }
    if (assigned_users !== undefined) {
      updateFields.push(`assigned_users = $${paramIndex}`);
      updateValues.push(parseInt(assigned_users) || 0);
      paramIndex++;
    }
    if (pending_reviews !== undefined) {
      updateFields.push(`pending_reviews = $${paramIndex}`);
      updateValues.push(parseInt(pending_reviews) || 0);
      paramIndex++;
    }

    // Always update updated_at
    updateFields.push(`updated_at = NOW()`);

    if (updateFields.length === 1 && updateFields[0] === `updated_at = NOW()`) {
      // No fields to update, just return current
      return res.json(counsellor);
    }

    // Build dynamic query - ADD ADMIN_ID CHECK
    const query = `UPDATE counsellors SET ${updateFields.join(", ")} WHERE id = $${paramIndex} AND admin_id = $${paramIndex + 1} RETURNING *`;
    updateValues.push(id);
    updateValues.push(adminId);

    const result = await pool.query(query, updateValues);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Counsellor not found or unauthorized" });
    }

    // Clear cache for this admin's counsellors
    const cacheKey = `${CACHE_KEYS.COUNSELLORS}:admin:${adminId}`;
    await deleteCache(cacheKey);

    console.log(`✅ Counsellor updated: ${id}`, { fields: updateFields });
    res.json(result.rows[0]);
  } catch (error) {
    console.error("❌ Error updating counsellor:", error.message);
    res.status(500).json({ error: "Failed to update counsellor" });
  }
};

// DELETE counsellor
const deleteCounsellor = async (req, res) => {
  try {
    const adminId = req.admin.id;
    const { id } = req.params;

    const result = await pool.query("DELETE FROM counsellors WHERE id = $1 AND admin_id = $2 RETURNING *", [id, adminId]);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Counsellor not found or unauthorized" });
    }

    // Clear cache for this admin's counsellors
    const cacheKey = `${CACHE_KEYS.COUNSELLORS}:admin:${adminId}`;
    await deleteCache(cacheKey);

    console.log(`✅ Counsellor deleted: ${id}`);
    res.json({ message: "Counsellor deleted successfully", counsellor: result.rows[0] });
  } catch (error) {
    console.error("❌ Error deleting counsellor:", error.message);
    res.status(500).json({ error: "Failed to delete counsellor" });
  }
};

module.exports = {
  getCounsellors,
  createCounsellor,
  updateCounsellor,
  deleteCounsellor,
};
