/**
 * Auth API Integration Tests
 * Tests the complete authentication flow
 */

import request from "supertest";
import { getTestApp, getTestPool } from "../helpers/testApp.js";
import bcrypt from "bcrypt";

describe("Auth API Integration Tests", () => {
  let app;
  let pool;

  beforeAll(() => {
    app = getTestApp();
    pool = getTestPool();
  });

  beforeEach(async () => {
    // Clean up users and todos
    await pool.query("DELETE FROM todos");
    await pool.query("DELETE FROM users");
  });

  describe("POST /api/auth/register", () => {
    test("should register a new user", async () => {
      const userData = {
        email: "newuser@test.com",
        password: "password123",
        name: "New User",
      };

      const response = await request(app)
        .post("/api/auth/register")
        .send(userData)
        .expect(201);

      expect(response.body).toHaveProperty("user");
      expect(response.body).toHaveProperty("token");
      expect(response.body.user.email).toBe("newuser@test.com");
      expect(response.body.user.name).toBe("New User");
      expect(response.body.user).not.toHaveProperty("password");
      expect(response.body.user).not.toHaveProperty("password_hash");

      // Verify user in database
      const dbResult = await pool.query(
        "SELECT * FROM users WHERE email = $1",
        ["newuser@test.com"]
      );
      expect(dbResult.rows.length).toBe(1);
      expect(dbResult.rows[0].email).toBe("newuser@test.com");

      // Verify password is hashed
      const isHashed = dbResult.rows[0].password_hash.startsWith("$2b$");
      expect(isHashed).toBe(true);
    });

    test("should return 400 for invalid email", async () => {
      const response = await request(app)
        .post("/api/auth/register")
        .send({
          email: "invalid-email",
          password: "password123",
          name: "Test",
        })
        .expect(400);

      expect(response.body.error).toContain("email");
    });

    test("should return 400 for short password", async () => {
      const response = await request(app)
        .post("/api/auth/register")
        .send({
          email: "test@test.com",
          password: "12345", // Too short
          name: "Test",
        })
        .expect(400);

      expect(response.body.error).toContain("6 characters");
    });

    test("should return 400 for missing name", async () => {
      const response = await request(app)
        .post("/api/auth/register")
        .send({
          email: "test@test.com",
          password: "password123",
          name: "",
        })
        .expect(400);

      expect(response.body.error).toContain("required");
    });

    test("should return 409 for duplicate email", async () => {
      const userData = {
        email: "duplicate@test.com",
        password: "password123",
        name: "Test",
      };

      // Register first time
      await request(app).post("/api/auth/register").send(userData).expect(201);

      // Try to register again
      const response = await request(app)
        .post("/api/auth/register")
        .send(userData)
        .expect(409);

      expect(response.body.error).toContain("already registered");
    });

    test("should normalize email to lowercase", async () => {
      const response = await request(app)
        .post("/api/auth/register")
        .send({
          email: "TEST@TEST.COM",
          password: "password123",
          name: "Test",
        })
        .expect(201);

      expect(response.body.user.email).toBe("test@test.com");
    });
  });

  describe("POST /api/auth/login", () => {
    let testUser;

    beforeEach(async () => {
      // Create a test user
      const passwordHash = await bcrypt.hash("password123", 10);
      const result = await pool.query(
        "INSERT INTO users (email, password_hash, name) VALUES ($1, $2, $3) RETURNING *",
        ["testuser@test.com", passwordHash, "Test User"]
      );
      testUser = result.rows[0];
    });

    test("should login with valid credentials", async () => {
      const response = await request(app)
        .post("/api/auth/login")
        .send({
          email: "testuser@test.com",
          password: "password123",
        })
        .expect(200);

      expect(response.body).toHaveProperty("user");
      expect(response.body).toHaveProperty("token");
      expect(response.body.user.email).toBe("testuser@test.com");
      expect(response.body.user).not.toHaveProperty("password_hash");
    });

    test("should login with case-insensitive email", async () => {
      const response = await request(app)
        .post("/api/auth/login")
        .send({
          email: "TESTUSER@TEST.COM",
          password: "password123",
        })
        .expect(200);

      expect(response.body.user.email).toBe("testuser@test.com");
    });

    test("should return 401 for wrong password", async () => {
      const response = await request(app)
        .post("/api/auth/login")
        .send({
          email: "testuser@test.com",
          password: "wrongpassword",
        })
        .expect(401);

      expect(response.body.error).toContain("Invalid email or password");
    });

    test("should return 401 for non-existent user", async () => {
      const response = await request(app)
        .post("/api/auth/login")
        .send({
          email: "nonexistent@test.com",
          password: "password123",
        })
        .expect(401);

      expect(response.body.error).toContain("Invalid email or password");
    });

    test("should return 400 for missing email", async () => {
      const response = await request(app)
        .post("/api/auth/login")
        .send({
          password: "password123",
        })
        .expect(400);

      expect(response.body.error).toContain("required");
    });

    test("should return 400 for missing password", async () => {
      const response = await request(app)
        .post("/api/auth/login")
        .send({
          email: "testuser@test.com",
        })
        .expect(400);

      expect(response.body.error).toContain("required");
    });
  });

  describe("GET /api/auth/me", () => {
    let token;

    beforeEach(async () => {
      // Register and get token
      const response = await request(app).post("/api/auth/register").send({
        email: "authuser@test.com",
        password: "password123",
        name: "Auth User",
      });

      token = response.body.token;
    });

    test("should get current user with valid token", async () => {
      const response = await request(app)
        .get("/api/auth/me")
        .set("Authorization", `Bearer ${token}`)
        .expect(200);

      expect(response.body.user.email).toBe("authuser@test.com");
      expect(response.body.user.name).toBe("Auth User");
      expect(response.body.user).not.toHaveProperty("password_hash");
    });

    test("should return 401 without token", async () => {
      const response = await request(app).get("/api/auth/me").expect(401);

      expect(response.body.error).toContain("Authentication required");
    });

    test("should return 401 with invalid token", async () => {
      const response = await request(app)
        .get("/api/auth/me")
        .set("Authorization", "Bearer invalid-token")
        .expect(401);

      expect(response.body.error).toContain("Invalid token");
    });

    test("should return 401 with malformed authorization header", async () => {
      const response = await request(app)
        .get("/api/auth/me")
        .set("Authorization", "InvalidFormat")
        .expect(401);

      expect(response.body.error).toContain("Invalid authorization format");
    });
  });

  describe("Protected Todo Routes", () => {
    let user1Token;
    let user2Token;
    let user1Id;
    let user2Id;

    beforeEach(async () => {
      // Create two users
      const user1Response = await request(app).post("/api/auth/register").send({
        email: "user1@test.com",
        password: "password123",
        name: "User 1",
      });

      user1Token = user1Response.body.token;
      user1Id = user1Response.body.user.id;

      const user2Response = await request(app).post("/api/auth/register").send({
        email: "user2@test.com",
        password: "password123",
        name: "User 2",
      });

      user2Token = user2Response.body.token;
      user2Id = user2Response.body.user.id;
    });

    test("should create todo for authenticated user", async () => {
      const response = await request(app)
        .post("/api/todos")
        .set("Authorization", `Bearer ${user1Token}`)
        .send({
          title: "User 1 Todo",
          description: "Belongs to user 1",
        })
        .expect(201);

      expect(response.body.title).toBe("User 1 Todo");
      expect(response.body.user_id).toBe(user1Id);
    });

    test("should only see own todos", async () => {
      // User 1 creates a todo
      await request(app)
        .post("/api/todos")
        .set("Authorization", `Bearer ${user1Token}`)
        .send({ title: "User 1 Todo" });

      // User 2 creates a todo
      await request(app)
        .post("/api/todos")
        .set("Authorization", `Bearer ${user2Token}`)
        .send({ title: "User 2 Todo" });

      // User 1 gets todos
      const user1Response = await request(app)
        .get("/api/todos")
        .set("Authorization", `Bearer ${user1Token}`)
        .expect(200);

      expect(user1Response.body.length).toBe(1);
      expect(user1Response.body[0].title).toBe("User 1 Todo");

      // User 2 gets todos
      const user2Response = await request(app)
        .get("/api/todos")
        .set("Authorization", `Bearer ${user2Token}`)
        .expect(200);

      expect(user2Response.body.length).toBe(1);
      expect(user2Response.body[0].title).toBe("User 2 Todo");
    });

    test("should not access another user's todo", async () => {
      // User 1 creates a todo
      const createResponse = await request(app)
        .post("/api/todos")
        .set("Authorization", `Bearer ${user1Token}`)
        .send({ title: "User 1 Todo" });

      const todoId = createResponse.body.id;

      // User 2 tries to get User 1's todo
      const response = await request(app)
        .get(`/api/todos/${todoId}`)
        .set("Authorization", `Bearer ${user2Token}`)
        .expect(404);

      expect(response.body.error).toContain("not found");
    });

    test("should not update another user's todo", async () => {
      // User 1 creates a todo
      const createResponse = await request(app)
        .post("/api/todos")
        .set("Authorization", `Bearer ${user1Token}`)
        .send({ title: "User 1 Todo" });

      const todoId = createResponse.body.id;

      // User 2 tries to update User 1's todo
      const response = await request(app)
        .put(`/api/todos/${todoId}`)
        .set("Authorization", `Bearer ${user2Token}`)
        .send({ title: "Hacked!" })
        .expect(404);

      expect(response.body.error).toContain("not found");
    });

    test("should not delete another user's todo", async () => {
      // User 1 creates a todo
      const createResponse = await request(app)
        .post("/api/todos")
        .set("Authorization", `Bearer ${user1Token}`)
        .send({ title: "User 1 Todo" });

      const todoId = createResponse.body.id;

      // User 2 tries to delete User 1's todo
      const response = await request(app)
        .delete(`/api/todos/${todoId}`)
        .set("Authorization", `Bearer ${user2Token}`)
        .expect(404);

      expect(response.body.error).toContain("not found");

      // Verify todo still exists for user 1
      const getTodoResponse = await request(app)
        .get(`/api/todos/${todoId}`)
        .set("Authorization", `Bearer ${user1Token}`)
        .expect(200);

      expect(getTodoResponse.body.title).toBe("User 1 Todo");
    });

    test("should return 401 for todo requests without token", async () => {
      await request(app).get("/api/todos").expect(401);

      await request(app).post("/api/todos").send({ title: "Test" }).expect(401);
    });
  });
});
