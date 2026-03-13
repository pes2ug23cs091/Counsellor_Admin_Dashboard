// Load dotenv only in development
if (process.env.NODE_ENV !== "production") {
  require("dotenv").config();
}

const express = require("express");
const cors = require("cors");
const morgan = require("morgan");

// Import routes
const usersRouter = require("./routes/users");
const counsellorsRouter = require("./routes/counsellors");
const healthRouter = require("./routes/health");
const authRouter = require("./routes/auth");

// Import middleware
const authMiddleware = require("./middleware/authMiddleware");

// Import database initialization
const initializeDatabase = require("./config/init-db");
const seedDatabase = require("./config/seed-db");

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(morgan("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.use("/api/health", healthRouter);
app.use("/api/auth", authRouter); // Auth routes (no protection)

// Protected routes (require authentication)
app.use("/api/users", authMiddleware, usersRouter);
app.use("/api/counsellors", authMiddleware, counsellorsRouter);

// Error handling middleware
app.use((err, req, res, next) => {
  console.error("❌ Error:", err.message);
  res.status(err.status || 500).json({
    error: err.message || "Internal Server Error",
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: "Route not found" });
});

// Start server
app.listen(PORT, async () => {
  try {
    await initializeDatabase();
    await seedDatabase();
  } catch (error) {
    console.error("❌ Failed to initialize database:", error);
    process.exit(1);
  }
  
  console.log(`✅ Server running on http://localhost:${PORT}`);
  console.log(`📍 Environment: ${process.env.NODE_ENV || "development"}`);
  console.log(`\n📚 API Documentation:`);
  console.log(`\n   🔐 AUTH ENDPOINTS (Public):`);
  console.log(`   POST /api/auth/register - Register new admin`);
  console.log(`   POST /api/auth/login - Login admin (returns JWT token)`);
  console.log(`\n   🔐 AUTH ENDPOINTS (Protected):`);
  console.log(`   GET  /api/auth/profile - Get current admin profile`);
  console.log(`   GET  /api/auth/verify - Verify token validity`);
  console.log(`   POST /api/auth/logout - Logout admin`);
  console.log(`\n   🏥 HEALTH ENDPOINTS:`);
  console.log(`   GET  /api/health - Simple health check`);
  console.log(`   GET  /api/health/detailed - Comprehensive health check (DB + Redis + Server)`);
  console.log(`   GET  /api/health/database - Database connectivity check`);
  console.log(`\n   👥 USER ENDPOINTS (Protected):`);
  console.log(`   GET  /api/users - Get all users`);
  console.log(`   POST /api/users - Create user`);
  console.log(`   PUT  /api/users/:id - Update user`);
  console.log(`   DELETE /api/users/:id - Delete user`);
  console.log(`   POST /api/users/:id/assign-counsellor - Assign counsellor`);
  console.log(`\n   👨‍⚕️  COUNSELLOR ENDPOINTS (Protected):`);
  console.log(`   GET  /api/counsellors - Get all counsellors`);
  console.log(`   POST /api/counsellors - Create counsellor`);
  console.log(`   PUT  /api/counsellors/:id - Update counsellor`);
  console.log(`   DELETE /api/counsellors/:id - Delete counsellor\n`);
});
