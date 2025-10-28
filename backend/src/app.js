/**
 * Express App Factory
 * Creates and configures the Express application
 * Wires together all layers of the application
 */
import express from "express";
import cors from "cors";

import TodoRepository from "./repositories/todoRepository.js";
import TodoService from "./services/todoService.js";
import TodoController from "./controllers/todoController.js";
import createTodoRoutes from "./routes/todoRoutes.js";

function createApp(pool) {
  const app = express();

  // Middleware
  app.use(cors());
  app.use(express.json());

  // Dependency Injections
  const todoRepository = new TodoRepository(pool);
  const todoService = new TodoService(todoRepository);
  const todoController = new TodoController(todoService);
  const todoRoutes = createTodoRoutes(todoController);

  // Root endpoint
  app.get("/", (req, res) => {
    res.json({
      message: "Todo API is running",
      version: "1.0.0",
      timestamp: new Date().toISOString(),
    });
  });

  // Mount API routes
  app.use("/api", todoRoutes);

  // 404 handler
  app.use((req, res) => {
    res.status(404).json({ error: "Route not found" });
  });

  // Global error handler
  app.use((err, req, res, next) => {
    console.error("Unhandled error:", err);
    res.status(500).json({
      error: "Internal server error",
      message: process.env.NODE_ENV === "development" ? err.message : undefined,
    });
  });

  return app;
}

export default createApp;
