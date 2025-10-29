/**
 * Todo Controller
 * Handles HTTP requests and responses for todos
 * Includes user authentication
 */

class TodoController {
  constructor(todoService) {
    this.todoService = todoService;

    this.getAllTodos = this.getAllTodos.bind(this);
    this.getTodoById = this.getTodoById.bind(this);
    this.createTodo = this.createTodo.bind(this);
    this.updateTodo = this.updateTodo.bind(this);
    this.deleteTodo = this.deleteTodo.bind(this);
    this.toggleTodoCompleted = this.toggleTodoCompleted.bind(this);
  }

  /**
   * GET /api/todos
   * Get all todos for the authenticated user
   */
  async getAllTodos(req, res) {
    try {
      const userId = req.user.userId;

      const todos = await this.todoService.getAllTodos(userId);
      res.status(200).json(todos);
    } catch (error) {
      console.error("Error in getAllTodos:", error.message);
      res.status(500).json({ error: "Failed to fetch todos" });
    }
  }

  /**
   * GET /api/todos/:id
   * Get a single todo by ID (only if owned by user)
   */
  async getTodoById(req, res) {
    try {
      const { id } = req.params;
      const userId = req.user.userId;

      const todo = await this.todoService.getTodoById(id, userId);
      res.status(200).json(todo);
    } catch (error) {
      console.error("Error in getTodoById:", error.message);

      if (
        error.message === "Todo not found" ||
        error.message === "Invalid todo ID"
      ) {
        return res.status(404).json({ error: error.message });
      }

      res.status(500).json({ error: "Failed to fetch todo" });
    }
  }

  /**
   * POST /api/todos
   * Create a new todo for the authenticated user
   */
  async createTodo(req, res) {
    try {
      const { title, description } = req.body;
      const userId = req.user.userId;

      const todo = await this.todoService.createTodo(
        title,
        description,
        userId
      );
      res.status(201).json(todo);
    } catch (error) {
      console.error("Error in createTodo:", error.message);

      if (
        error.message.includes("required") ||
        error.message.includes("cannot")
      ) {
        return res.status(400).json({ error: error.message });
      }

      res.status(500).json({ error: "Failed to create todo" });
    }
  }

  /**
   * PUT /api/todos/:id
   * Update an existing todo (only if owned by user)
   */
  async updateTodo(req, res) {
    try {
      const { id } = req.params;
      const userId = req.user.userId;
      const data = req.body;

      const todo = await this.todoService.updateTodo(id, userId, data);
      res.status(200).json(todo);
    } catch (error) {
      console.error("Error in updateTodo:", error.message);

      if (
        error.message === "Todo not found" ||
        error.message === "Invalid todo ID"
      ) {
        return res.status(404).json({ error: error.message });
      }

      if (
        error.message.includes("required") ||
        error.message.includes("cannot")
      ) {
        return res.status(400).json({ error: error.message });
      }

      res.status(500).json({ error: "Failed to update todo" });
    }
  }

  /**
   * DELETE /api/todos/:id
   * Delete a todo (only if owned by user)
   */
  async deleteTodo(req, res) {
    try {
      const { id } = req.params;
      const userId = req.user.userId;

      await this.todoService.deleteTodo(id, userId);
      res.status(200).json({ message: "Todo deleted successfully" });
    } catch (error) {
      console.error("Error in deleteTodo:", error.message);

      if (
        error.message === "Todo not found" ||
        error.message === "Invalid todo ID"
      ) {
        return res.status(404).json({ error: error.message });
      }

      res.status(500).json({ error: "Failed to delete todo" });
    }
  }

  /**
   * PATCH /api/todos/:id/toggle
   * Toggle a todo's completed status (only if owned by user)
   */
  async toggleTodoCompleted(req, res) {
    try {
      const { id } = req.params;
      const userId = req.user.userId;

      const todo = await this.todoService.toggleTodoCompleted(id, userId);
      res.status(200).json(todo);
    } catch (error) {
      console.error("Error in toggleTodoCompleted:", error.message);

      if (
        error.message === "Todo not found" ||
        error.message === "Invalid todo ID"
      ) {
        return res.status(404).json({ error: error.message });
      }

      res.status(500).json({ error: "Failed to toggle todo" });
    }
  }
}

export default TodoController;
