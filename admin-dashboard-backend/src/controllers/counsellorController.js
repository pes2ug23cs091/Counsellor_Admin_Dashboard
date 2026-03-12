const pool = require("../config/database");
const { getCache, setCache, deleteCache, CACHE_KEYS, CACHE_TTL } = require("../utils/cache");

// GET all counsellors
const getCounsellors = async (req, res) => {
  try {
    // Try to get from cache first
    const cachedCounsellors = await getCache(CACHE_KEYS.COUNSELLORS);
    if (cachedCounsellors) {
      return res.json(cachedCounsellors);
    }

    // If not in cache, query database
    const result = await pool.query(
      "SELECT id, name, email, specialty, availability, phone, status, assigned_users, pending_reviews, created_at, updated_at FROM counsellors ORDER BY created_at DESC"
    );
    
    // Store in cache
    await setCache(CACHE_KEYS.COUNSELLORS, result.rows, CACHE_TTL.COUNSELLORS);
    
    res.json(result.rows);
  } catch (error) {
    console.error("❌ Error fetching counsellors:", error.message);
    res.status(500).json({ error: "Failed to fetch counsellors" });
  }
};

// CREATE counsellor
const createCounsellor = async (req, res) => {
  try {
    const { name, email, specialty, availability, phone, status } = req.body;

    if (!name || !specialty) {
      return res.status(400).json({ error: "Name and specialty are required" });
    }

    // Auto-generate email if not provided
    const counsellorEmail = email || `${name.toLowerCase().replace(/\s+/g, '.')}.counsellor@example.com`;

    const result = await pool.query(
      "INSERT INTO counsellors (name, email, specialty, availability, phone, status, assigned_users, pending_reviews, created_at, updated_at) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, NOW(), NOW()) RETURNING *",
      [name, counsellorEmail, specialty, availability || "Available", phone || "", status || "active", 0, 0]
    );

    // Clear cache when new counsellor is created
    await deleteCache(CACHE_KEYS.COUNSELLORS);

    console.log(`✅ Counsellor created: ${name}`);
    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error("❌ Error creating counsellor:", error.message);
    res.status(500).json({ error: "Failed to create counsellor" });
  }
};

// UPDATE counsellor
const updateCounsellor = async (req, res) => {
  try {
    const { id } = req.params;
    
    // Get current counsellor
    const current = await pool.query("SELECT * FROM counsellors WHERE id = $1", [id]);
    if (current.rows.length === 0) {
      return res.status(404).json({ error: "Counsellor not found" });
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

    // Build dynamic query
    const query = `UPDATE counsellors SET ${updateFields.join(", ")} WHERE id = $${paramIndex} RETURNING *`;
    updateValues.push(id);

    const result = await pool.query(query, updateValues);

    // Clear cache when counsellor is updated
    await deleteCache(CACHE_KEYS.COUNSELLORS);

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
    const { id } = req.params;

    const result = await pool.query("DELETE FROM counsellors WHERE id = $1 RETURNING *", [id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Counsellor not found" });
    }

    // Clear cache when counsellor is deleted
    await deleteCache(CACHE_KEYS.COUNSELLORS);

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
