/**
 * Server Entry Point
 * Starts the HTTP server
 */
import dotenv from "dotenv";
dotenv.config();
import pool from "./src/config/database.js";
import createApp from "./src/app.js";

const PORT = process.env.PORT || 3000;

const app = createApp(pool);

const server = app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
  console.log(`📝 API available at http://localhost:${PORT}/api/todos`);
});

process.on("SIGTERM", () => {
  console.log("SIGTERM signal received: closing HTTP server");
  server.close(() => {
    console.log("HTTP server closed");
    pool.end(() => {
      console.log("Database pool closed");
      process.exit(0);
    });
  });
});
