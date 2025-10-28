/**
 * Todo Routes
 * Defines URL endpoints and maps them to controller methods
 */
import express from "express";

function createTodoRoutes(todoController) {
  const router = express.Router();

  // GET /api/todos - Get all todos
  router.get("/todos", todoController.getAllTodos);

  // GET /api/todos/:id - Get a single todo
  router.get("/todos/:id", todoController.getTodoById);

  // POST /api/todos - Create a new todo
  router.post("/todos", todoController.createTodo);

  // PUT /api/todos/:id - Update a todo
  router.put("/todos/:id", todoController.updateTodo);

  // DELETE /api/todos/:id - Delete a todo
  router.delete("/todos/:id", todoController.deleteTodo);

  // PATCH /api/todos/:id/toggle - Toggle todo completed status
  router.patch("/todos/:id/toggle", todoController.toggleTodoCompleted);

  return router;
}

export default createTodoRoutes;
