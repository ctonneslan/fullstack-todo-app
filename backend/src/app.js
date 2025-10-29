/**
 * Express App Factory
 * Creates and configures the Express application
 * Wires together all layers including authentication
 */

import express from "express";
import cors from "cors";

// Import repositories
import TodoRepository from "./repositories/todoRepository.js";
import UserRepository from "./repositories/userRepository.js";

// Import services
import TodoService from "./services/todoService.js";
import AuthService from "./services/authService.js";

// Import controllers
import TodoController from "./controllers/todoController.js";
import AuthController from "./controllers/authController.js";

// Import routes
import createTodoRoutes from "./routes/todoRoutes.js";
import createAuthRoutes from "./routes/authRoutes.js";

function createApp(pool) {
  const app = express();

  // Middleware
  app.use(cors());
  app.use(express.json());

  // Create repository instances
  const todoRepository = new TodoRepository(pool);
  const userRepository = new UserRepository(pool);

  // Create service instances
  const todoService = new TodoService(todoRepository);
  const authService = new AuthService(userRepository);

  // Create controller instances
  const todoController = new TodoController(todoService);
  const authController = new AuthController(authService);

  // Create route instances
  const todoRoutes = createTodoRoutes(todoController);
  const authRoutes = createAuthRoutes(authController);

  // Health check route
  app.get("/", (req, res) => {
    res.json({
      message: "Todo API is running",
      version: "2.0.0", // Updated version with auth
      timestamp: new Date().toISOString(),
      endpoints: {
        auth: "/api/auth",
        todos: "/api/todos",
      },
    });
  });

  app.use("/api/auth", authRoutes);
  app.use("/api", todoRoutes);

  // 404 handler for undefined routes
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
