const redis = require("redis");

// Support multiple Redis URL formats:
// 1. REDIS_URL from environment (Render, Upstash, etc.)
// 2. REDIS_HOST:REDIS_PORT for local development
// 3. Default to Docker service name for local Docker
const redisUrl = process.env.REDIS_URL || 
  (process.env.REDIS_HOST && process.env.REDIS_PORT 
    ? `redis://${process.env.REDIS_HOST}:${process.env.REDIS_PORT}`
    : `redis://admin-dashboard-redis:6379`);

// Create Redis client
const redisClient = redis.createClient({
  url: redisUrl,
  socket: {
    reconnectStrategy: (retries) => {
      if (retries > 5) {
        console.log("❌ Redis max retries exceeded - caching disabled");
        return false; // Don't retry after this
      }
      return Math.min(retries * 100, 1000);
    },
    connectTimeout: 10000,
  }
});

// Handle connection events
redisClient.on("error", (err) => {
  console.error("❌ Redis Client Error:", err.message);
});

redisClient.on("connect", () => {
  console.log("✅ Redis Client Connected");
});

redisClient.on("ready", () => {
  console.log("✅ Redis Client Ready");
});

// Connect to Redis
redisClient.connect().catch((err) => {
  console.warn("⚠️ Redis connection warning:", err.message);
  console.warn("⚠️ Application will continue without caching");
});

// Cache keys
const CACHE_KEYS = {
  USERS: "cache:users",
  COUNSELLORS: "cache:counsellors",
  USER: (id) => `cache:user:${id}`,
  COUNSELLOR: (id) => `cache:counsellor:${id}`,
};

// TTL (Time To Live) in seconds
const CACHE_TTL = {
  USERS: 300, // 5 minutes
  COUNSELLORS: 300, // 5 minutes
  SINGLE: 600, // 10 minutes
};

/**
 * Get cached data
 * @param {string} key - Cache key
 * @returns {Promise<any>} - Cached data or null
 */
const getCache = async (key) => {
  try {
    if (!redisClient.isOpen) {
      return null;
    }
    const cachedData = await redisClient.get(key);
    if (cachedData) {
      console.log(`✅ Cache HIT: ${key}`);
      return JSON.parse(cachedData);
    }
    console.log(`⚠️ Cache MISS: ${key}`);
    return null;
  } catch (error) {
    console.error(`❌ Error getting cache for ${key}:`, error.message);
    return null;
  }
};

/**
 * Set cached data with TTL
 * @param {string} key - Cache key
 * @param {any} data - Data to cache
 * @param {number} ttl - Time to live in seconds
 * @returns {Promise<void>}
 */
const setCache = async (key, data, ttl = 300) => {
  try {
    if (!redisClient.isOpen) {
      return;
    }
    await redisClient.setEx(key, ttl, JSON.stringify(data));
    console.log(`💾 Cache SET: ${key} (TTL: ${ttl}s)`);
  } catch (error) {
    console.error(`❌ Error setting cache for ${key}:`, error.message);
  }
};

/**
 * Delete cached data
 * @param {string} key - Cache key
 * @returns {Promise<void>}
 */
const deleteCache = async (key) => {
  try {
    if (!redisClient.isOpen) {
      return;
    }
    const result = await redisClient.del(key);
    if (result > 0) {
      console.log(`🗑️ Cache DELETED: ${key}`);
    }
  } catch (error) {
    console.error(`❌ Error deleting cache for ${key}:`, error.message);
  }
};

/**
 * Clear all caches matching pattern
 * @param {string} pattern - Pattern to match (e.g., "cache:users*")
 * @returns {Promise<void>}
 */
const clearCachePattern = async (pattern) => {
  try {
    if (!redisClient.isOpen) {
      return;
    }
    const keys = await redisClient.keys(pattern);
    if (keys.length > 0) {
      await redisClient.del(keys);
      console.log(`🗑️ Cache CLEARED: ${keys.length} keys matching pattern "${pattern}"`);
    }
  } catch (error) {
    console.error(`❌ Error clearing cache pattern ${pattern}:`, error.message);
  }
};

/**
 * Clear all caches
 * @returns {Promise<void>}
 */
const clearAllCache = async () => {
  try {
    if (!redisClient.isOpen) {
      return;
    }
    await redisClient.flushDb();
    console.log("🗑️ All caches CLEARED");
  } catch (error) {
    console.error("❌ Error clearing all caches:", error.message);
  }
};

module.exports = {
  redisClient,
  CACHE_KEYS,
  CACHE_TTL,
  getCache,
  setCache,
  deleteCache,
  clearCachePattern,
  clearAllCache,
};
