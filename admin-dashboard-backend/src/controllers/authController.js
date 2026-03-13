const pool = require("../config/database");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const JWT_SECRET = process.env.JWT_SECRET || "your-super-secret-jwt-key-change-in-production";
const JWT_EXPIRY = "7d";

// Register new admin
exports.register = async (req, res) => {
  try {
    const { username, email, password, role = "admin" } = req.body;

    // Validate input
    if (!username || !email || !password) {
      return res
        .status(400)
        .json({ error: "Username, email, and password are required" });
    }

    // Check if admin already exists
    const existingAdmin = await pool.query(
      "SELECT * FROM admin_users WHERE username = $1 OR email = $2",
      [username, email]
    );

    if (existingAdmin.rows.length > 0) {
      return res.status(400).json({ error: "Username or email already exists" });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create admin user
    const result = await pool.query(
      "INSERT INTO admin_users (username, email, password, role, status) VALUES ($1, $2, $3, $4, $5) RETURNING id, username, email, role, created_at",
      [username, email, hashedPassword, role, "active"]
    );

    const admin = result.rows[0];

    // Generate JWT token
    const token = jwt.sign(
      { id: admin.id, username: admin.username, email: admin.email, role: admin.role },
      JWT_SECRET,
      { expiresIn: JWT_EXPIRY }
    );

    console.log("✅ Admin registered:", admin.username);

    res.status(201).json({
      message: "Admin registered successfully",
      token,
      admin: {
        id: admin.id,
        username: admin.username,
        email: admin.email,
        role: admin.role,
      },
    });
  } catch (error) {
    console.error("❌ Registration error:", error.message);
    res.status(500).json({ error: "Failed to register admin" });
  }
};

// Login admin
exports.login = async (req, res) => {
  try {
    const { username, password } = req.body;

    // Validate input
    if (!username || !password) {
      return res.status(400).json({ error: "Username and password are required" });
    }

    // Get admin from database
    const result = await pool.query(
      "SELECT * FROM admin_users WHERE username = $1",
      [username]
    );

    if (result.rows.length === 0) {
      return res.status(401).json({ error: "Invalid username or password" });
    }

    const admin = result.rows[0];

    // Check if admin is active
    if (admin.status !== "active") {
      return res.status(401).json({ error: "Admin account is inactive" });
    }

    // Compare passwords
    const passwordMatch = await bcrypt.compare(password, admin.password);

    if (!passwordMatch) {
      return res.status(401).json({ error: "Invalid username or password" });
    }

    // Generate JWT token
    const token = jwt.sign(
      { id: admin.id, username: admin.username, email: admin.email, role: admin.role },
      JWT_SECRET,
      { expiresIn: JWT_EXPIRY }
    );

    console.log("✅ Admin logged in:", admin.username);

    res.json({
      message: "Login successful",
      token,
      admin: {
        id: admin.id,
        username: admin.username,
        email: admin.email,
        role: admin.role,
      },
    });
  } catch (error) {
    console.error("❌ Login error:", error.message);
    res.status(500).json({ error: "Failed to login" });
  }
};

// Get current admin profile
exports.getProfile = async (req, res) => {
  try {
    const adminId = req.admin.id;

    const result = await pool.query(
      "SELECT id, username, email, role, status, created_at FROM admin_users WHERE id = $1",
      [adminId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Admin not found" });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error("❌ Get profile error:", error.message);
    res.status(500).json({ error: "Failed to get profile" });
  }
};

// Logout (token is invalidated on client side by clearing localStorage)
exports.logout = (req, res) => {
  res.json({ message: "Logout successful" });
};
