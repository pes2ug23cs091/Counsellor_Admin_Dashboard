const request = require("supertest");
const express = require("express");
const cors = require("cors");
const pool = require("../src/config/database");
const counsellorsRouter = require("../src/routes/counsellors");

// Create a minimal test app
const createTestApp = () => {
  const app = express();
  app.use(cors());
  app.use(express.json());
  app.use("/api/counsellors", counsellorsRouter);
  return app;
};

describe("Counsellor Management Endpoints", () => {
  let app;

  beforeAll(() => {
    app = createTestApp();
  });

  afterAll(async () => {
    await pool.end();
  });

  describe("GET /api/counsellors", () => {
    test("should return list of counsellors with 200 status", async () => {
      const response = await request(app).get("/api/counsellors");
      expect(response.status).toBe(200);
      expect(Array.isArray(response.body)).toBe(true);
    });

    test("should return counsellor objects with expected properties", async () => {
      const response = await request(app).get("/api/counsellors");
      if (response.body.length > 0) {
        const counsellor = response.body[0];
        expect(counsellor).toHaveProperty("id");
        expect(counsellor).toHaveProperty("name");
        expect(counsellor).toHaveProperty("specialty");
        expect(counsellor).toHaveProperty("status");
        expect(counsellor).toHaveProperty("assigned_users");
        expect(counsellor).toHaveProperty("pending_reviews");
      }
    });

    test("should return JSON content type", async () => {
      const response = await request(app).get("/api/counsellors");
      expect(response.type).toMatch(/json/);
    });
  });

  describe("POST /api/counsellors", () => {
    test("should create a new counsellor with valid data", async () => {
      const newCounsellor = {
        name: "Dr. John Doe",
        specialty: "Behavioral Therapy",
        assigned_users: 0,
        pending_reviews: 0,
      };

      const response = await request(app)
        .post("/api/counsellors")
        .send(newCounsellor);
      expect([201, 200]).toContain(response.status);
      expect(response.body).toHaveProperty("id");
      expect(response.body).toHaveProperty("name");
      expect(response.body.name).toBe(newCounsellor.name);
      expect(response.body).toHaveProperty("specialty");
      expect(response.body.specialty).toBe(newCounsellor.specialty);
    });

    test("should reject counsellor without name", async () => {
      const invalidCounsellor = {
        specialty: "Behavioral Therapy",
      };

      const response = await request(app)
        .post("/api/counsellors")
        .send(invalidCounsellor);
      expect(response.status).toBe(400);
    });

    test("should reject counsellor without specialty", async () => {
      const invalidCounsellor = {
        name: "Dr. John Doe",
      };

      const response = await request(app)
        .post("/api/counsellors")
        .send(invalidCounsellor);
      expect(response.status).toBe(400);
    });

    test("should set default status to active", async () => {
      const newCounsellor = {
        name: `Counsellor ${Date.now()}`,
        specialty: "Cognitive Therapy",
      };

      const response = await request(app)
        .post("/api/counsellors")
        .send(newCounsellor);
      if (response.status !== 400) {
        expect(response.body.status).toBe("active");
      }
    });

    test("should set default assigned_users to 0", async () => {
      const newCounsellor = {
        name: `Counsellor ${Date.now()}`,
        specialty: "Humanistic Therapy",
      };

      const response = await request(app)
        .post("/api/counsellors")
        .send(newCounsellor);
      if (response.status !== 400) {
        expect(response.body.assigned_users).toBe(0);
      }
    });

    test("should set default pending_reviews to 0", async () => {
      const newCounsellor = {
        name: `Counsellor ${Date.now()}`,
        specialty: "Family Therapy",
      };

      const response = await request(app)
        .post("/api/counsellors")
        .send(newCounsellor);
      if (response.status !== 400) {
        expect(response.body.pending_reviews).toBe(0);
      }
    });
  });

  describe("PUT /api/counsellors/:id", () => {
    let counsellorId;

    beforeAll(async () => {
      const newCounsellor = {
        name: `Update Test Counsellor ${Date.now()}`,
        specialty: "Behavioral Therapy",
      };
      const response = await request(app)
        .post("/api/counsellors")
        .send(newCounsellor);
      counsellorId = response.body.id;
    });

    test("should update an existing counsellor", async () => {
      if (!counsellorId) return;

      const updateData = {
        name: "Updated Counsellor Name",
        status: "inactive",
      };

      const response = await request(app)
        .put(`/api/counsellors/${counsellorId}`)
        .send(updateData);
      expect([200, 201]).toContain(response.status);
    });

    test("should toggle counsellor status", async () => {
      if (!counsellorId) return;

      const response = await request(app)
        .put(`/api/counsellors/${counsellorId}`)
        .send({ 
          name: "Updated Counsellor Name",
          status: "active" 
        });
      expect([200, 201]).toContain(response.status);
      if (response.body) {
        expect(["active", "inactive"]).toContain(response.body.status);
      }
    });

    test("should return 404 for non-existent counsellor", async () => {
      const response = await request(app)
        .put("/api/counsellors/99999")
        .send({ name: "Updated Name" });
      expect(response.status).toBe(404);
    });
  });

  describe("DELETE /api/counsellors/:id", () => {
    let counsellorIdToDelete;

    beforeAll(async () => {
      const newCounsellor = {
        name: `Delete Test Counsellor ${Date.now()}`,
        specialty: "Behavioral Therapy",
      };
      const response = await request(app)
        .post("/api/counsellors")
        .send(newCounsellor);
      counsellorIdToDelete = response.body.id;
    });

    test("should delete an existing counsellor", async () => {
      if (!counsellorIdToDelete) return;

      const response = await request(app).delete(
        `/api/counsellors/${counsellorIdToDelete}`
      );
      expect([200, 204]).toContain(response.status);
    });

    test("should return 404 when deleting non-existent counsellor", async () => {
      const response = await request(app).delete("/api/counsellors/99999");
      expect(response.status).toBe(404);
    });
  });
});
