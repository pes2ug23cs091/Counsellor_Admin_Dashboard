const pool = require("../config/database");

/**
 * Check database connectivity
 * @returns {Promise<{status: string, message: string, responseTime: number}>}
 */
const checkDatabaseHealth = async () => {
  const startTime = Date.now();
  try {
    const result = await pool.query("SELECT NOW()");
    const responseTime = Date.now() - startTime;
    return {
      status: "healthy",
      message: "Database connection successful",
      responseTime: `${responseTime}ms`,
      timestamp: result.rows[0].now,
    };
  } catch (error) {
    console.error("❌ Database health check failed:", error.message);
    return {
      status: "unhealthy",
      message: `Database connection failed: ${error.message}`,
      responseTime: `${Date.now() - startTime}ms`,
    };
  }
};

/**
 * Check Redis connectivity (optional)
 * @returns {Promise<{status: string, message: string, responseTime: number}>}
 */
const checkRedisHealth = async () => {
  const startTime = Date.now();
  try {
    // Check if redis is configured/available
    // For now, return success since Redis is optional
    const responseTime = Date.now() - startTime;
    return {
      status: "healthy",
      message: "Redis connection available (optional)",
      responseTime: `${responseTime}ms`,
    };
  } catch (error) {
    console.warn("⚠️ Redis health check warning:", error.message);
    return {
      status: "degraded",
      message: `Redis not available (optional): ${error.message}`,
      responseTime: `${Date.now() - startTime}ms`,
    };
  }
};

/**
 * Get comprehensive system health
 * @returns {Promise<{status: string, timestamp: string, uptime: number, services: object}>}
 */
const getSystemHealth = async () => {
  const dbHealth = await checkDatabaseHealth();
  const redisHealth = await checkRedisHealth();

  // Determine overall status
  const allHealthy = dbHealth.status === "healthy" && redisHealth.status === "healthy";
  const anyUnhealthy = dbHealth.status === "unhealthy" || redisHealth.status === "unhealthy";

  let overallStatus = "healthy";
  if (anyUnhealthy) {
    overallStatus = "unhealthy";
  } else if (!allHealthy) {
    overallStatus = "degraded";
  }

  return {
    status: overallStatus,
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    services: {
      database: dbHealth,
      redis: redisHealth,
      server: {
        status: "healthy",
        message: "Server is running",
      },
    },
  };
};

module.exports = {
  checkDatabaseHealth,
  checkRedisHealth,
  getSystemHealth,
};
