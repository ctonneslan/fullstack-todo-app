/**
 * Todo Service
 * Contains business logic and orchestrates repository calls
 */
class TodoService {
  constructor(todoRepository) {
    this.todoRepository = todoRepository;
  }

  /**
   * Get all todos
   * @returns {Promise<Array>} Array of todos
   */
  async getAllTodos() {
    return await this.todoRepository.findAll();
  }

  /**
   * Find a single todo by ID
   * @param {number} id - The todo ID
   * @returns {Promise<Object>} Todo object
   * @throws {Error} If todo not found
   */
  async getTodoById(id) {
    const todoId = parseInt(id);
    if (isNaN(todoId) || todoId < 1) {
      throw new Error("Invalid todo ID");
    }

    const todo = await this.todoRepository.findById(todoId);

    if (!todo) {
      throw new Error("Todo not found");
    }

    return todo;
  }

  /**
   * Create a new todo
   * @param {string} title - Todo title
   * @param {string} description - Todo description
   * @returns {Promise<Object>} Created todo
   * @throws {Error} If validation fails
   */
  async createTodo(title, description) {
    // Validate data types
    if (typeof title !== 'string' && title !== null && title !== undefined) {
      throw new Error("Title must be a string");
    }

    if (!title || title.trim().length === 0) {
      throw new Error("Title is required and cannot be empty");
    }

    if (title.trim().length > 255) {
      throw new Error("Title cannot exceed 255 characters");
    }

    const sanitizedTitle = title.trim();
    const sanitizedDescription = description ? description.trim() : "";

    const todo = await this.todoRepository.create(
      sanitizedTitle,
      sanitizedDescription
    );

    return todo;
  }

  /**
   * Update an existing todo
   * @param {number} id - Todo ID
   * @param {Object} data - Object with title, description, and/or completed
   * @returns {Promise<Object>} Updated todo
   * @throws {Error} If validation fails or todo not found
   */
  async updateTodo(id, data) {
    const todoId = parseInt(id);
    if (isNaN(todoId) || todoId < 1) {
      throw new Error("Invalid todo ID");
    }

    const existingTodo = await this.todoRepository.findById(todoId);
    if (!existingTodo) {
      throw new Error("Todo not found");
    }

    const updateData = {
      title: data.title !== undefined ? data.title.trim() : existingTodo.title,
      description:
        data.description !== undefined
          ? data.description.trim()
          : existingTodo.description,
      completed:
        data.completed !== undefined
          ? Boolean(data.completed)
          : existingTodo.completed,
    };

    if (!updateData.title || updateData.title.length === 0) {
      throw new Error("Title is required and cannot be empty");
    }

    if (updateData.title.length > 255) {
      throw new Error("Title cannot exceed 255 characters");
    }

    const updatedTodo = await this.todoRepository.update(todoId, updateData);

    return updatedTodo;
  }

  /**
   * Delete a todo
   * @param {number} id - Todo ID
   * @returns {Promise<Object>} Deleted todo
   * @throws {Error} If todo not found
   */
  async deleteTodo(id) {
    const todoId = parseInt(id);
    if (isNaN(todoId) || todoId < 1) {
      throw new Error("Invalid todo ID");
    }

    const deletedTodo = await this.todoRepository.delete(todoId);

    if (!deletedTodo) {
      throw new Error("Todo not found");
    }

    return deletedTodo;
  }

  /**
   * Toggle a todo's completed status
   * @param {number} id - Todo ID
   * @returns {Promise<Object>} Updated todo
   * @throws {Error} If todo not found
   */
  async toggleTodoCompleted(id) {
    const todoId = parseInt(id);
    if (isNaN(todoId) || todoId < 1) {
      throw new Error("Invalid todo ID");
    }

    const updatedTodo = await this.todoRepository.toggleCompleted(todoId);

    if (!updatedTodo) {
      throw new Error("Todo not found");
    }

    return updatedTodo;
  }
}

export default TodoService;
