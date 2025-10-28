/**
 * Todo Controller
 * Handles HTTP requests and responses
 * Delegates business logic to the service layer
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
   * Get all todos
   */
  async getAllTodos(req, res) {
    try {
      const todos = await this.todoService.getAllTodos();
      res.status(200).json(todos);
    } catch (error) {
      console.error("Error in getAllTodos:", error.message);
      res.status(500).json({ error: "Failed to fetch todos" });
    }
  }

  /**
   * Get /api/todos/:id
   * Get a ginle todo by ID
   */
  async getTodoById(req, res) {
    try {
      const { id } = req.params;
      const todo = await this.todoService.getTodoById(id);
      res.status(200).json(todo);
    } catch (error) {
      console.error("Error in getTodoById:", error.message);
      if (
        error.message === "Todo not found" ||
        error.message === "Invalid todo Id"
      ) {
        return res.status(404).json({ error: error.message });
      }
      res.status(500).json({ error: "Failed to fetch todo" });
    }
  }

  /**
   * POST /api/todos
   * Create a new todo
   */
  async createTodo(req, res) {
    try {
      const { title, description } = req.body;
      const todo = await this.todoService.createTodo(title, description);
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
   * Update an existing todo
   */
  async updateTodo(req, res) {
    try {
      const { id } = req.params;
      const data = req.body;
      const todo = await this.todoService.updateTodo(id, data);
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
   * Delete a todo
   */
  async deleteTodo(req, res) {
    try {
      const { id } = req.params;
      await this.todoService.deleteTodo(id);
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
   * Toggle a todo's completed status
   */
  async toggleTodoCompleted(req, res) {
    try {
      const { id } = req.params;
      const todo = await this.todoService.toggleTodoCompleted(id);
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
