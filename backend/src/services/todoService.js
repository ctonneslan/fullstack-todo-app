/**
 * Todo Service
 * Contains business logic and orchestrates repository calls
 * Now includes user ownership for multi-tenant support
 */

class TodoService {
  constructor(todoRepository) {
    this.todoRepository = todoRepository;
  }

  /**
   * Get all todos for a specific user
   * @param {number} userId - User ID
   * @returns {Promise<Array>} Array of todos
   */
  async getAllTodos(userId) {
    if (!userId || isNaN(parseInt(userId))) {
      throw new Error("Valid user ID is required");
    }

    return await this.todoRepository.findAllByUserId(userId);
  }

  /**
   * Get a single todo by ID (with ownership check)
   * @param {number} id - Todo ID
   * @param {number} userId - User ID
   * @returns {Promise<Object>} Todo object
   * @throws {Error} If todo not found or doesn't belong to user
   */
  async getTodoById(id, userId) {
    // Validate IDs
    const todoId = parseInt(id);
    const userIdInt = parseInt(userId);

    if (isNaN(todoId) || todoId < 1) {
      throw new Error("Invalid todo ID");
    }

    if (isNaN(userIdInt) || userIdInt < 1) {
      throw new Error("Invalid user ID");
    }

    const todo = await this.todoRepository.findByIdAndUserId(todoId, userIdInt);

    if (!todo) {
      throw new Error("Todo not found");
    }

    return todo;
  }

  /**
   * Create a new todo for a user
   * @param {string} title - Todo title
   * @param {string} description - Todo description
   * @param {number} userId - User ID
   * @returns {Promise<Object>} Created todo
   * @throws {Error} If validation fails
   */
  async createTodo(title, description, userId) {
    // Validate user ID
    const userIdInt = parseInt(userId);
    if (isNaN(userIdInt) || userIdInt < 1) {
      throw new Error("Valid user ID is required");
    }

    // Business logic: validation
    if (!title || title.trim().length === 0) {
      throw new Error("Title is required and cannot be empty");
    }

    if (title.trim().length > 255) {
      throw new Error("Title cannot exceed 255 characters");
    }

    // Sanitize input
    const sanitizedTitle = title.trim();
    const sanitizedDescription = description ? description.trim() : "";

    // Call repository to persist data with user association
    const todo = await this.todoRepository.create(
      sanitizedTitle,
      sanitizedDescription,
      userIdInt
    );

    return todo;
  }

  /**
   * Update an existing todo (with ownership check)
   * @param {number} id - Todo ID
   * @param {number} userId - User ID
   * @param {Object} data - Object with title, description, and/or completed
   * @returns {Promise<Object>} Updated todo
   * @throws {Error} If validation fails or todo not found
   */
  async updateTodo(id, userId, data) {
    // Validate IDs
    const todoId = parseInt(id);
    const userIdInt = parseInt(userId);

    if (isNaN(todoId) || todoId < 1) {
      throw new Error("Invalid todo ID");
    }

    if (isNaN(userIdInt) || userIdInt < 1) {
      throw new Error("Invalid user ID");
    }

    const existingTodo = await this.todoRepository.findByIdAndUserId(
      todoId,
      userIdInt
    );
    if (!existingTodo) {
      throw new Error("Todo not found");
    }

    // Validate and sanitize data
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

    // Update in database
    const updatedTodo = await this.todoRepository.update(
      todoId,
      userIdInt,
      updateData
    );

    return updatedTodo;
  }

  /**
   * Delete a todo (with ownership check)
   * @param {number} id - Todo ID
   * @param {number} userId - User ID
   * @returns {Promise<Object>} Deleted todo
   * @throws {Error} If todo not found or doesn't belong to user
   */
  async deleteTodo(id, userId) {
    // Validate IDs
    const todoId = parseInt(id);
    const userIdInt = parseInt(userId);

    if (isNaN(todoId) || todoId < 1) {
      throw new Error("Invalid todo ID");
    }

    if (isNaN(userIdInt) || userIdInt < 1) {
      throw new Error("Invalid user ID");
    }

    const deletedTodo = await this.todoRepository.delete(todoId, userIdInt);

    if (!deletedTodo) {
      throw new Error("Todo not found");
    }

    return deletedTodo;
  }

  /**
   * Toggle a todo's completed status (with ownership check)
   * @param {number} id - Todo ID
   * @param {number} userId - User ID
   * @returns {Promise<Object>} Updated todo
   * @throws {Error} If todo not found or doesn't belong to user
   */
  async toggleTodoCompleted(id, userId) {
    // Validate IDs
    const todoId = parseInt(id);
    const userIdInt = parseInt(userId);

    if (isNaN(todoId) || todoId < 1) {
      throw new Error("Invalid todo ID");
    }

    if (isNaN(userIdInt) || userIdInt < 1) {
      throw new Error("Invalid user ID");
    }

    const updatedTodo = await this.todoRepository.toggleCompleted(
      todoId,
      userIdInt
    );

    if (!updatedTodo) {
      throw new Error("Todo not found");
    }

    return updatedTodo;
  }
}

export default TodoService;
