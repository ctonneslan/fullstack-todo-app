/**
 * Todo API Integration Tests
 * Tests the complete request/response flow through the API
 */

import request from "supertest";
import { getTestApp, getTestPool } from "../helpers/testApp.js";
import { createTodoData } from "../helpers/factories.js";

describe("Todo API Integration Tests", () => {
  let app;
  let pool;

  beforeAll(() => {
    app = getTestApp();
    pool = getTestPool();
  });

  beforeEach(async () => {
    await pool.query("DELETE FROM todos");
  });

  describe("GET /", () => {
    test("should return API status", async () => {
      const response = await request(app)
        .get("/")
        .expect("Content-Type", /json/)
        .expect(200);

      expect(response.body.message).toBe("Todo API is running");
      expect(response.body.version).toBeDefined();
      expect(response.body.timestamp).toBeDefined();
    });
  });

  describe("POST /api/todos", () => {
    test("should create a new todo", async () => {
      const newTodo = createTodoData({
        title: "Integration Test Todo",
        description: "Testing the full API stack",
      });

      const response = await request(app)
        .post("/api/todos")
        .send(newTodo)
        .expect("Content-Type", /json/)
        .expect(201);

      expect(response.body).toMatchObject({
        title: newTodo.title,
        description: newTodo.description,
        completed: false,
      });
      expect(response.body.id).toBeDefined();
      expect(response.body.created_at).toBeDefined();

      const result = await pool.query("SELECT * FROM todos WHERE id = $1", [
        response.body.id,
      ]);
      expect(result.rows[0].title).toBe(newTodo.title);
    });

    test("should create todo without description", async () => {
      const todoData = createTodoData({ title: "Title only", description: "" });

      const response = await request(app)
        .post("/api/todos")
        .send(todoData)
        .expect(201);

      expect(response.body.title).toBe(todoData.title);
      expect(response.body.description).toBe("");
    });

    test("should return 400 for missing title", async () => {
      const todoData = createTodoData({ description: "No title" });
      delete todoData.title;

      const response = await request(app)
        .post("/api/todos")
        .send(todoData)
        .expect(400);

      expect(response.body.error).toContain("required");
    });

    test("should return 400 for empty title", async () => {
      const todoData = createTodoData({ title: "   ", description: "Empty title" });

      const response = await request(app)
        .post("/api/todos")
        .send(todoData)
        .expect(400);

      expect(response.body.error).toContain("required");
    });

    test("should return 400 for title exceeding 255 characters", async () => {
      const longTitle = "a".repeat(256);
      const todoData = createTodoData({ title: longTitle });

      const response = await request(app)
        .post("/api/todos")
        .send(todoData)
        .expect(400);

      expect(response.body.error).toContain("cannot exceed 255 characters");
    });

    test("should trim whitespace from title and description", async () => {
      const todoData = createTodoData({
        title: "  Trimmed Title  ",
        description: "  Trimmed Description  ",
      });

      const response = await request(app)
        .post("/api/todos")
        .send(todoData)
        .expect(201);

      expect(response.body.title).toBe("Trimmed Title");
      expect(response.body.description).toBe("Trimmed Description");
    });
  });

  describe("GET /api/todos", () => {
    test("should return empty array when no todos", async () => {
      const response = await request(app)
        .get("/api/todos")
        .expect("Content-Type", /json/)
        .expect(200);

      expect(Array.isArray(response.body)).toBe(true);
      expect(response.body.length).toBe(0);
    });

    test("should return all todos ordered by created_at DESC", async () => {
      // Create multiple todos
      const todo1 = createTodoData({ title: "First" });
      const todo2 = createTodoData({ title: "Second" });
      const todo3 = createTodoData({ title: "Third" });

      await request(app).post("/api/todos").send(todo1);
      await request(app).post("/api/todos").send(todo2);
      await request(app).post("/api/todos").send(todo3);

      const response = await request(app).get("/api/todos").expect(200);

      expect(response.body.length).toBe(3);
      // Most recent first
      expect(response.body[0].title).toBe("Third");
      expect(response.body[1].title).toBe("Second");
      expect(response.body[2].title).toBe("First");
    });

    test("should include all todo properties", async () => {
      const todoData = createTodoData({ title: "Complete Todo", description: "With description" });

      await request(app)
        .post("/api/todos")
        .send(todoData);

      const response = await request(app).get("/api/todos").expect(200);

      const todo = response.body[0];
      expect(todo).toHaveProperty("id");
      expect(todo).toHaveProperty("title");
      expect(todo).toHaveProperty("description");
      expect(todo).toHaveProperty("completed");
      expect(todo).toHaveProperty("created_at");
    });
  });

  describe("GET /api/todos/:id", () => {
    test("should return todo by id", async () => {
      // Create a todo
      const todoData = createTodoData({ title: "Find me", description: "Test" });
      const createResponse = await request(app)
        .post("/api/todos")
        .send(todoData);

      const todoId = createResponse.body.id;

      // Get by ID
      const response = await request(app)
        .get(`/api/todos/${todoId}`)
        .expect(200);

      expect(response.body.id).toBe(todoId);
      expect(response.body.title).toBe(todoData.title);
      expect(response.body.description).toBe(todoData.description);
    });

    test("should return 404 for non-existent id", async () => {
      const response = await request(app).get("/api/todos/99999").expect(404);

      expect(response.body.error).toContain("not found");
    });

    test("should return 404 for invalid id", async () => {
      const response = await request(app).get("/api/todos/invalid").expect(404);

      expect(response.body.error).toBeDefined();
    });
  });

  describe("PUT /api/todos/:id", () => {
    test("should update todo completely", async () => {
      // Create todo
      const originalData = createTodoData({ title: "Original", description: "Original desc" });
      const createResponse = await request(app)
        .post("/api/todos")
        .send(originalData);

      const todoId = createResponse.body.id;

      // Update todo
      const updateData = createTodoData({
        title: "Updated Title",
        description: "Updated Description",
        completed: true,
      });

      const response = await request(app)
        .put(`/api/todos/${todoId}`)
        .send(updateData)
        .expect(200);

      expect(response.body.id).toBe(todoId);
      expect(response.body.title).toBe(updateData.title);
      expect(response.body.description).toBe(updateData.description);
      expect(response.body.completed).toBe(updateData.completed);

      // Verify in database
      const dbResult = await pool.query("SELECT * FROM todos WHERE id = $1", [
        todoId,
      ]);
      expect(dbResult.rows[0].title).toBe(updateData.title);
      expect(dbResult.rows[0].completed).toBe(updateData.completed);
    });

    test("should update only title", async () => {
      const originalData = createTodoData({ title: "Original", description: "Keep this" });
      const createResponse = await request(app)
        .post("/api/todos")
        .send(originalData);

      const todoId = createResponse.body.id;

      // Only send title in update to test partial update
      const response = await request(app)
        .put(`/api/todos/${todoId}`)
        .send({ title: "New Title" })
        .expect(200);

      expect(response.body.title).toBe("New Title");
      expect(response.body.description).toBe(originalData.description);
      expect(response.body.completed).toBe(false);
    });

    test("should return 404 for non-existent id", async () => {
      const updateData = createTodoData({ title: "Update" });

      const response = await request(app)
        .put("/api/todos/99999")
        .send(updateData)
        .expect(404);

      expect(response.body.error).toContain("not found");
    });

    test("should return 400 for empty title", async () => {
      const originalData = createTodoData({ title: "Original" });
      const createResponse = await request(app)
        .post("/api/todos")
        .send(originalData);

      const updateData = createTodoData({ title: "" });

      const response = await request(app)
        .put(`/api/todos/${createResponse.body.id}`)
        .send(updateData)
        .expect(400);

      expect(response.body.error).toContain("required");
    });
  });

  describe("PATCH /api/todos/:id/toggle", () => {
    test("should toggle completed from false to true", async () => {
      const todoData = createTodoData({ title: "Toggle me" });
      const createResponse = await request(app)
        .post("/api/todos")
        .send(todoData);

      const todoId = createResponse.body.id;
      expect(createResponse.body.completed).toBe(false);

      const response = await request(app)
        .patch(`/api/todos/${todoId}/toggle`)
        .expect(200);

      expect(response.body.completed).toBe(true);
    });

    test("should toggle completed from true to false", async () => {
      // Create and mark as completed
      const todoData = createTodoData({ title: "Toggle me" });
      const createResponse = await request(app)
        .post("/api/todos")
        .send(todoData);

      const todoId = createResponse.body.id;

      const completedData = createTodoData({ title: "Toggle me", description: "", completed: true });
      await request(app)
        .put(`/api/todos/${todoId}`)
        .send(completedData);

      // Toggle back to false
      const response = await request(app)
        .patch(`/api/todos/${todoId}/toggle`)
        .expect(200);

      expect(response.body.completed).toBe(false);
    });

    test("should return 404 for non-existent id", async () => {
      const response = await request(app)
        .patch("/api/todos/99999/toggle")
        .expect(404);

      expect(response.body.error).toContain("not found");
    });
  });

  describe("DELETE /api/todos/:id", () => {
    test("should delete todo", async () => {
      // Create todo
      const todoData = createTodoData({ title: "Delete me" });
      const createResponse = await request(app)
        .post("/api/todos")
        .send(todoData);

      const todoId = createResponse.body.id;

      // Delete todo
      const response = await request(app)
        .delete(`/api/todos/${todoId}`)
        .expect(200);

      expect(response.body.message).toContain("deleted successfully");

      // Verify it's gone
      await request(app).get(`/api/todos/${todoId}`).expect(404);

      // Verify in database
      const dbResult = await pool.query("SELECT * FROM todos WHERE id = $1", [
        todoId,
      ]);
      expect(dbResult.rows.length).toBe(0);
    });

    test("should return 404 for non-existent id", async () => {
      const response = await request(app)
        .delete("/api/todos/99999")
        .expect(404);

      expect(response.body.error).toContain("not found");
    });
  });

  describe("Error handling", () => {
    test("should return 404 for undefined routes", async () => {
      const response = await request(app).get("/api/nonexistent").expect(404);

      expect(response.body.error).toContain("not found");
    });

    test("should handle malformed JSON", async () => {
      const response = await request(app)
        .post("/api/todos")
        .set("Content-Type", "application/json")
        .send("invalid json{")
        .expect(400);
    });
  });

  describe("CORS headers", () => {
    test("should include CORS headers", async () => {
      const response = await request(app).get("/api/todos").expect(200);

      expect(response.headers["access-control-allow-origin"]).toBeDefined();
    });
  });
});
