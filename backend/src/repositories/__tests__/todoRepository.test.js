/**
 * TodoRepository Unit Tests
 * Tests the data access layer
 */

import TodoRepository from "../todoRepository.js";
import pool from "../../config/database.js";
import { createTodoData } from "../../__tests__/helpers/factories.js";

describe("TodoRepository", () => {
  let repository;

  beforeEach(() => {
    repository = new TodoRepository(pool);
  });

  describe("create()", () => {
    test("should create a new todo", async () => {
      const todoData = createTodoData();

      const todo = await repository.create(todoData.title, todoData.description);

      expect(todo).toBeDefined();
      expect(todo.id).toBeDefined();
      expect(todo.title).toBe(todoData.title);
      expect(todo.description).toBe(todoData.description);
      expect(todo.completed).toBe(false);
      expect(todo.created_at).toBeDefined();
    });

    test("should create todo without description", async () => {
      const todoData = createTodoData({ title: "Title only", description: "" });

      const todo = await repository.create(todoData.title, todoData.description);

      expect(todo.title).toBe(todoData.title);
      expect(todo.description).toBe("");
    });
  });

  describe("findAll()", () => {
    test("should return empty array when no todos", async () => {
      const todos = await repository.findAll();

      expect(Array.isArray(todos)).toBe(true);
      expect(todos.length).toBe(0);
    });

    test("should return all todos ordered by created_at DESC", async () => {
      const todo1 = createTodoData({ title: "First", description: "desc1" });
      const todo2 = createTodoData({ title: "Second", description: "desc2" });
      const todo3 = createTodoData({ title: "Third", description: "desc3" });

      await repository.create(todo1.title, todo1.description);
      await repository.create(todo2.title, todo2.description);
      await repository.create(todo3.title, todo3.description);

      const todos = await repository.findAll();

      expect(todos.length).toBe(3);
      expect(todos[0].title).toBe("Third");
      expect(todos[1].title).toBe("Second");
      expect(todos[2].title).toBe("First");
    });
  });

  describe("findById()", () => {
    test("should return todo by id", async () => {
      const todoData = createTodoData({ title: "Find me", description: "desc" });
      const created = await repository.create(todoData.title, todoData.description);

      const found = await repository.findById(created.id);

      expect(found).toBeDefined();
      expect(found.id).toBe(created.id);
      expect(found.title).toBe(todoData.title);
    });

    test("should return null for non-existent id", async () => {
      const found = await repository.findById(99999);

      expect(found).toBeNull();
    });
  });

  describe("update()", () => {
    test("should update todo", async () => {
      const originalData = createTodoData({ title: "Original", description: "desc" });
      const created = await repository.create(originalData.title, originalData.description);

      const updateData = createTodoData({
        title: "Updated",
        description: "new desc",
        completed: true,
      });

      const updated = await repository.update(created.id, updateData);

      expect(updated).toBeDefined();
      expect(updated.id).toBe(created.id);
      expect(updated.title).toBe(updateData.title);
      expect(updated.description).toBe(updateData.description);
      expect(updated.completed).toBe(updateData.completed);
    });

    test("should return null for non-existent id", async () => {
      const updateData = createTodoData();

      const updated = await repository.update(99999, updateData);

      expect(updated).toBeNull();
    });
  });

  describe("delete()", () => {
    test("should delete todo and return it", async () => {
      const todoData = createTodoData({ title: "Delete me", description: "desc" });
      const created = await repository.create(todoData.title, todoData.description);

      const deleted = await repository.delete(created.id);

      expect(deleted).toBeDefined();
      expect(deleted.id).toBe(created.id);

      const found = await repository.findById(created.id);
      expect(found).toBeNull();
    });

    test("should return null for non-existent id", async () => {
      const deleted = await repository.delete(99999);

      expect(deleted).toBeNull();
    });
  });

  describe("toggleCompleted()", () => {
    test("should toggle completed from false to true", async () => {
      const todoData = createTodoData({ title: "Toggle me", description: "desc" });
      const created = await repository.create(todoData.title, todoData.description);
      expect(created.completed).toBe(false);

      const toggled = await repository.toggleCompleted(created.id);

      expect(toggled.completed).toBe(true);
    });

    test("should toggle completed from true to false", async () => {
      const todoData = createTodoData({ title: "Toggle me", description: "desc" });
      const created = await repository.create(todoData.title, todoData.description);

      const completedData = createTodoData({
        title: created.title,
        description: created.description,
        completed: true,
      });
      await repository.update(created.id, completedData);

      const toggled = await repository.toggleCompleted(created.id);

      expect(toggled.completed).toBe(false);
    });

    test("should return null for non-existent id", async () => {
      const toggled = await repository.toggleCompleted(99999);

      expect(toggled).toBeNull();
    });
  });
});
