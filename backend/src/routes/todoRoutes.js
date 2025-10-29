/**
 * Todo Routes
 * Defines URL endpoints and maps them to controller methods
 * Now includes authentication middleware
 */

import express from "express";
import { authenticate } from "../middleware/auth.js";

function createTodoRoutes(todoController) {
  const router = express.Router();

  router.use(authenticate);

  // GET /api/todos - Get all todos (for authenticated user)
  router.get("/todos", todoController.getAllTodos);

  // GET /api/todos/:id - Get a single todo (if owned by user)
  router.get("/todos/:id", todoController.getTodoById);

  // POST /api/todos - Create a new todo (for authenticated user)
  router.post("/todos", todoController.createTodo);

  // PUT /api/todos/:id - Update a todo (if owned by user)
  router.put("/todos/:id", todoController.updateTodo);

  // DELETE /api/todos/:id - Delete a todo (if owned by user)
  router.delete("/todos/:id", todoController.deleteTodo);

  // PATCH /api/todos/:id/toggle - Toggle todo completed status
  router.patch("/todos/:id/toggle", todoController.toggleTodoCompleted);

  return router;
}

export default createTodoRoutes;
