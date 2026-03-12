const request = require("supertest");
const express = require("express");
const cors = require("cors");
const morgan = require("morgan");
const healthRouter = require("../src/routes/health");

// Create a minimal test app
const createTestApp = () => {
  const app = express();
  app.use(cors());
  app.use(morgan("dev"));
  app.use(express.json());
  app.use("/api/health", healthRouter);
  return app;
};

describe("Health Check Endpoints", () => {
  let app;

  beforeAll(() => {
    app = createTestApp();
  });

  describe("GET /api/health", () => {
    test("should return simple health status with 200", async () => {
      const response = await request(app).get("/api/health");
      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty("status");
      expect(response.body.status).toContain("Server is running");
      expect(response.body).toHaveProperty("timestamp");
      expect(response.body).toHaveProperty("uptime");
    });

    test("should return valid JSON response", async () => {
      const response = await request(app).get("/api/health");
      expect(response.type).toMatch(/json/);
    });

    test("should have uptime as a number", async () => {
      const response = await request(app).get("/api/health");
      expect(typeof response.body.uptime).toBe("number");
      expect(response.body.uptime).toBeGreaterThan(0);
    });
  });

  describe("GET /api/health/detailed", () => {
    test("should return detailed health status with service checks", async () => {
      const response = await request(app).get("/api/health/detailed");
      expect([200, 503]).toContain(response.status);
      expect(response.body).toHaveProperty("status");
      expect(response.body).toHaveProperty("services");
      expect(response.body).toHaveProperty("timestamp");
      expect(response.body).toHaveProperty("uptime");
    });

    test("should include database service health", async () => {
      const response = await request(app).get("/api/health/detailed");
      expect(response.body.services).toHaveProperty("database");
      expect(response.body.services.database).toHaveProperty("status");
      expect(response.body.services.database).toHaveProperty("message");
      expect(response.body.services.database).toHaveProperty("responseTime");
    });

    test("should include redis service health", async () => {
      const response = await request(app).get("/api/health/detailed");
      expect(response.body.services).toHaveProperty("redis");
      expect(response.body.services.redis).toHaveProperty("status");
    });

    test("should include server service health", async () => {
      const response = await request(app).get("/api/health/detailed");
      expect(response.body.services).toHaveProperty("server");
      expect(response.body.services.server.status).toBe("healthy");
    });
  });

  describe("GET /api/health/database", () => {
    test("should return database health status", async () => {
      const response = await request(app).get("/api/health/database");
      expect([200, 503]).toContain(response.status);
      expect(response.body).toHaveProperty("service");
      expect(response.body.service).toBe("database");
      expect(response.body).toHaveProperty("status");
      expect(response.body).toHaveProperty("message");
      expect(response.body).toHaveProperty("timestamp");
    });

    test("should return response time for database query", async () => {
      const response = await request(app).get("/api/health/database");
      expect(response.body).toHaveProperty("responseTime");
      expect(typeof response.body.responseTime).toBe("string");
      expect(response.body.responseTime).toMatch(/\d+ms/);
    });
  });
});
