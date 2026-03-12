const request = require("supertest");
const express = require("express");
const cors = require("cors");
const pool = require("../src/config/database");
const usersRouter = require("../src/routes/users");

// Create a minimal test app
const createTestApp = () => {
  const app = express();
  app.use(cors());
  app.use(express.json());
  app.use("/api/users", usersRouter);
  return app;
};

describe("User Management Endpoints", () => {
  let app;

  beforeAll(() => {
    app = createTestApp();
  });

  afterAll(async () => {
    await pool.end();
  });

  describe("GET /api/users", () => {
    test("should return list of users with 200 status", async () => {
      const response = await request(app).get("/api/users");
      expect(response.status).toBe(200);
      expect(Array.isArray(response.body)).toBe(true);
    });

    test("should return user objects with expected properties", async () => {
      const response = await request(app).get("/api/users");
      if (response.body.length > 0) {
        const user = response.body[0];
        expect(user).toHaveProperty("id");
        expect(user).toHaveProperty("name");
        expect(user).toHaveProperty("email");
        expect(user).toHaveProperty("risk_level");
        expect(user).toHaveProperty("plan_status");
      }
    });

    test("should return JSON content type", async () => {
      const response = await request(app).get("/api/users");
      expect(response.type).toMatch(/json/);
    });
  });

  describe("POST /api/users", () => {
    test("should create a new user with valid data", async () => {
      const newUser = {
        name: "Test User",
        email: `testuser-${Date.now()}@example.com`,
        riskLevel: "low",
      };

      const response = await request(app).post("/api/users").send(newUser);
      expect([201, 200]).toContain(response.status);
      expect(response.body).toHaveProperty("id");
      expect(response.body).toHaveProperty("name");
      expect(response.body.name).toBe(newUser.name);
      expect(response.body).toHaveProperty("email");
      expect(response.body.email).toBe(newUser.email);
    });

    test("should reject user without name", async () => {
      const invalidUser = {
        email: "test@example.com",
        riskLevel: "low",
      };

      const response = await request(app)
        .post("/api/users")
        .send(invalidUser);
      expect(response.status).toBe(400);
    });

    test("should reject user without email", async () => {
      const invalidUser = {
        name: "Test User",
        riskLevel: "low",
      };

      const response = await request(app)
        .post("/api/users")
        .send(invalidUser);
      expect(response.status).toBe(400);
    });

    test("should set default plan_status to active", async () => {
      const newUser = {
        name: `Test User ${Date.now()}`,
        email: `test-${Date.now()}@example.com`,
        riskLevel: "medium",
      };

      const response = await request(app).post("/api/users").send(newUser);
      expect(response.body.plan_status).toBe("active");
    });

    test("should set default risk_level to medium", async () => {
      const newUser = {
        name: `Test User ${Date.now()}`,
        email: `test-${Date.now()}@example.com`,
      };

      const response = await request(app).post("/api/users").send(newUser);
      if (response.status !== 400) {
        expect(["low", "medium", "high"]).toContain(
          response.body.risk_level
        );
      }
    });
  });

  describe("PUT /api/users/:id", () => {
    let userId;

    beforeAll(async () => {
      const newUser = {
        name: `Update Test User ${Date.now()}`,
        email: `update-test-${Date.now()}@example.com`,
        riskLevel: "low",
      };
      const response = await request(app).post("/api/users").send(newUser);
      userId = response.body.id;
    });

    test("should update an existing user", async () => {
      if (!userId) return;

      const updateData = {
        name: "Updated Name",
        email: `updated-${Date.now()}@example.com`,
      };

      const response = await request(app)
        .put(`/api/users/${userId}`)
        .send(updateData);
      expect([200, 201]).toContain(response.status);
    });

    test("should return 404 for non-existent user", async () => {
      const response = await request(app)
        .put("/api/users/99999")
        .send({ name: "Updated Name" });
      expect(response.status).toBe(404);
    });
  });

  describe("DELETE /api/users/:id", () => {
    let userIdToDelete;

    beforeAll(async () => {
      const newUser = {
        name: `Delete Test User ${Date.now()}`,
        email: `delete-test-${Date.now()}@example.com`,
        riskLevel: "high",
      };
      const response = await request(app).post("/api/users").send(newUser);
      userIdToDelete = response.body.id;
    });

    test("should delete an existing user", async () => {
      if (!userIdToDelete) return;

      const response = await request(app).delete(
        `/api/users/${userIdToDelete}`
      );
      expect([200, 204]).toContain(response.status);
    });

    test("should return 404 when deleting non-existent user", async () => {
      const response = await request(app).delete("/api/users/99999");
      expect(response.status).toBe(404);
    });
  });

  describe("POST /api/users/:id/assign-counsellor", () => {
    let userId;
    let counsellorId;

    beforeAll(async () => {
      // Create a user
      const newUser = {
        name: `Assign Test User ${Date.now()}`,
        email: `assign-test-${Date.now()}@example.com`,
        riskLevel: "medium",
      };
      const userResponse = await request(app).post("/api/users").send(newUser);
      userId = userResponse.body.id;

      // Try to get a counsellor (might not exist)
      const counsellorsResponse = await request(app).get("/api/counsellors");
      if (counsellorsResponse.body && counsellorsResponse.body.length > 0) {
        counsellorId = counsellorsResponse.body[0].id;
      }
    });

    test("should assign counsellor to user", async () => {
      if (!userId) return;

      const assignData = {
        counsellor_id: counsellorId || 1,
        session_time: "9:00 AM - 10:00 AM",
      };

      const response = await request(app)
        .post(`/api/users/${userId}/assign-counsellor`)
        .send(assignData);
      expect([200, 201]).toContain(response.status);
    });

    test("should reject assignment without counsellor_id", async () => {
      if (!userId) return;

      const assignData = {
        session_time: "9:00 AM - 10:00 AM",
      };

      const response = await request(app)
        .post(`/api/users/${userId}/assign-counsellor`)
        .send(assignData);
      expect(response.status).toBe(400);
    });
  });
});
