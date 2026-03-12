const express = require("express");
const {
  simpleHealthCheck,
  detailedHealthCheck,
  databaseHealthCheck,
} = require("../controllers/healthController");

const router = express.Router();

/**
 * Simple health check - basic server status
 * Returns: { status: string, timestamp: string, uptime: number }
 */
router.get("/", simpleHealthCheck);

/**
 * Detailed health check - all services
 * Returns: { status: string, services: { database, redis, server }, timestamp: string, uptime: number }
 */
router.get("/detailed", detailedHealthCheck);

/**
 * Database health check only
 * Returns: { service: string, status: string, message: string, responseTime: string, timestamp: string }
 */
router.get("/database", databaseHealthCheck);

module.exports = router;
