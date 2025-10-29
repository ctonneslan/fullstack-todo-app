/**
 * TodoService Unit Tests
 * Tests business logic layer using mocked repository
 */

import { jest } from "@jest/globals";
import TodoService from "../todoService.js";
import { createTodoData, createMultipleTodos } from "../../__tests__/helpers/factories.js";

describe("TodoService", () => {
  let service;
  let mockRepository;

  beforeEach(() => {
    mockRepository = {
      findAll: jest.fn(),
      findById: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
      toggleCompleted: jest.fn(),
    };

    // Create service with mock repository
    service = new TodoService(mockRepository);
  });

  describe("getAllTodos()", () => {
    test("should return all todos from repository", async () => {
      const mockTodos = createMultipleTodos(2).map((todo, index) => ({
        id: index + 1,
        ...todo,
      }));
      mockRepository.findAll.mockResolvedValue(mockTodos);

      const result = await service.getAllTodos();

      expect(result).toEqual(mockTodos);
      expect(mockRepository.findAll).toHaveBeenCalledTimes(1);
    });
  });

  describe("getTodoById()", () => {
    test("should return todo when found", async () => {
      const mockTodo = { id: 1, ...createTodoData({ title: "Test" }) };
      mockRepository.findById.mockResolvedValue(mockTodo);

      const result = await service.getTodoById(1);

      expect(result).toEqual(mockTodo);
      expect(mockRepository.findById).toHaveBeenCalledWith(1);
    });

    test("should throw error for invalid id (NaN)", async () => {
      // Act & Assert
      await expect(service.getTodoById("invalid")).rejects.toThrow(
        "Invalid todo ID"
      );
    });

    test("should throw error for negative id", async () => {
      await expect(service.getTodoById(-1)).rejects.toThrow("Invalid todo ID");
    });

    test("should throw error when todo not found", async () => {
      // Arrange: Repository returns null
      mockRepository.findById.mockResolvedValue(null);

      // Act & Assert
      await expect(service.getTodoById(999)).rejects.toThrow("Todo not found");
    });
  });

  describe("createTodo()", () => {
    test("should create todo with valid data", async () => {
      // Arrange
      const todoData = createTodoData({ title: "New Todo", description: "Description" });
      const mockCreated = {
        id: 1,
        ...todoData,
      };
      mockRepository.create.mockResolvedValue(mockCreated);

      // Act
      const result = await service.createTodo(todoData.title, todoData.description);

      // Assert
      expect(result).toEqual(mockCreated);
      expect(mockRepository.create).toHaveBeenCalledWith(
        todoData.title,
        todoData.description
      );
    });

    test("should trim whitespace from title and description", async () => {
      const trimmedData = createTodoData({ title: "Trimmed", description: "Trimmed desc" });
      mockRepository.create.mockResolvedValue({
        id: 1,
        ...trimmedData,
      });

      await service.createTodo("  Trimmed  ", "  Trimmed desc  ");

      // Verify repository was called with trimmed values
      expect(mockRepository.create).toHaveBeenCalledWith(
        trimmedData.title,
        trimmedData.description
      );
    });

    test("should throw error for empty title", async () => {
      const todoData = createTodoData({ description: "desc" });
      await expect(service.createTodo("", todoData.description)).rejects.toThrow(
        "Title is required and cannot be empty"
      );
    });

    test("should throw error for whitespace-only title", async () => {
      const todoData = createTodoData({ description: "desc" });
      await expect(service.createTodo("   ", todoData.description)).rejects.toThrow(
        "Title is required and cannot be empty"
      );
    });

    test("should throw error for title > 255 characters", async () => {
      const longTitle = "a".repeat(256);
      const todoData = createTodoData({ description: "desc" });

      await expect(service.createTodo(longTitle, todoData.description)).rejects.toThrow(
        "Title cannot exceed 255 characters"
      );
    });

    test("should create todo with empty description", async () => {
      const todoData = createTodoData({ title: "Title", description: "" });
      mockRepository.create.mockResolvedValue({
        id: 1,
        ...todoData,
      });

      await service.createTodo(todoData.title, todoData.description);

      expect(mockRepository.create).toHaveBeenCalledWith(todoData.title, todoData.description);
    });
  });

  describe("updateTodo()", () => {
    test("should update todo successfully", async () => {
      // Arrange
      const existingTodo = {
        id: 1,
        ...createTodoData({ title: "Old", description: "Old desc", completed: false }),
      };
      const updateData = createTodoData({
        title: "New",
        description: "New desc",
        completed: true,
      });
      const updatedTodo = {
        id: 1,
        ...updateData,
      };

      mockRepository.findById.mockResolvedValue(existingTodo);
      mockRepository.update.mockResolvedValue(updatedTodo);

      // Act
      const result = await service.updateTodo(1, updateData);

      // Assert
      expect(result).toEqual(updatedTodo);
      expect(mockRepository.findById).toHaveBeenCalledWith(1);
      expect(mockRepository.update).toHaveBeenCalled();
    });

    test("should throw error for invalid id", async () => {
      await expect(service.updateTodo("invalid", {})).rejects.toThrow(
        "Invalid todo ID"
      );
    });

    test("should throw error when todo not found", async () => {
      mockRepository.findById.mockResolvedValue(null);
      const updateData = createTodoData({ title: "Test" });

      await expect(service.updateTodo(999, updateData)).rejects.toThrow(
        "Todo not found"
      );
    });

    test("should preserve existing values when not provided", async () => {
      const existingTodo = {
        id: 1,
        ...createTodoData({
          title: "Original",
          description: "Original desc",
          completed: false,
        }),
      };

      mockRepository.findById.mockResolvedValue(existingTodo);
      mockRepository.update.mockResolvedValue({
        ...existingTodo,
        title: "Updated",
      });

      // Only update title
      await service.updateTodo(1, { title: "Updated" });

      // Should call update with existing description and completed
      expect(mockRepository.update).toHaveBeenCalledWith(1, {
        title: "Updated",
        description: "Original desc",
        completed: false,
      });
    });

    test("should throw error for empty title", async () => {
      const existingTodo = {
        id: 1,
        ...createTodoData({ title: "Existing", description: "", completed: false }),
      };
      mockRepository.findById.mockResolvedValue(existingTodo);

      await expect(service.updateTodo(1, { title: "" })).rejects.toThrow(
        "Title is required and cannot be empty"
      );
    });
  });

  describe("deleteTodo()", () => {
    test("should delete todo successfully", async () => {
      const deletedTodo = { id: 1, ...createTodoData({ title: "Deleted" }) };
      mockRepository.delete.mockResolvedValue(deletedTodo);

      const result = await service.deleteTodo(1);

      expect(result).toEqual(deletedTodo);
      expect(mockRepository.delete).toHaveBeenCalledWith(1);
    });

    test("should throw error for invalid id", async () => {
      await expect(service.deleteTodo("invalid")).rejects.toThrow(
        "Invalid todo ID"
      );
    });

    test("should throw error when todo not found", async () => {
      mockRepository.delete.mockResolvedValue(null);

      await expect(service.deleteTodo(999)).rejects.toThrow("Todo not found");
    });
  });

  describe("toggleTodoCompleted()", () => {
    test("should toggle todo successfully", async () => {
      const toggledTodo = { id: 1, ...createTodoData({ completed: true }) };
      mockRepository.toggleCompleted.mockResolvedValue(toggledTodo);

      const result = await service.toggleTodoCompleted(1);

      expect(result).toEqual(toggledTodo);
      expect(mockRepository.toggleCompleted).toHaveBeenCalledWith(1);
    });

    test("should throw error for invalid id", async () => {
      await expect(service.toggleTodoCompleted("invalid")).rejects.toThrow(
        "Invalid todo ID"
      );
    });

    test("should throw error when todo not found", async () => {
      mockRepository.toggleCompleted.mockResolvedValue(null);

      await expect(service.toggleTodoCompleted(999)).rejects.toThrow(
        "Todo not found"
      );
    });
  });
});
