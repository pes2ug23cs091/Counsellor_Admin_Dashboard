const { getSystemHealth, checkDatabaseHealth } = require("../utils/health");

/**
 * Simple health check - returns basic server status
 * GET /api/health
 */
const simpleHealthCheck = (req, res) => {
  res.json({
    status: "✅ Server is running",
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
  });
};

/**
 * Comprehensive health check - checks all services
 * GET /api/health/detailed
 */
const detailedHealthCheck = async (req, res) => {
  try {
    const systemHealth = await getSystemHealth();
    // Return 200 if healthy, 503 if unhealthy
    const statusCode = systemHealth.status === "healthy" ? 200 : 503;
    res.status(statusCode).json(systemHealth);
  } catch (error) {
    console.error("❌ Health check error:", error.message);
    res.status(500).json({
      status: "error",
      message: "Health check failed",
      error: error.message,
      timestamp: new Date().toISOString(),
    });
  }
};

/**
 * Database-only health check
 * GET /api/health/database
 */
const databaseHealthCheck = async (req, res) => {
  try {
    const dbHealth = await checkDatabaseHealth();
    const statusCode = dbHealth.status === "healthy" ? 200 : 503;
    res.status(statusCode).json({
      service: "database",
      ...dbHealth,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error("❌ Database health check error:", error.message);
    res.status(500).json({
      service: "database",
      status: "error",
      message: "Database health check failed",
      error: error.message,
      timestamp: new Date().toISOString(),
    });
  }
};

module.exports = {
  simpleHealthCheck,
  detailedHealthCheck,
  databaseHealthCheck,
};
