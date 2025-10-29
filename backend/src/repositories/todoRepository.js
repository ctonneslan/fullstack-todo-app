/**
 * Todo Repository
 * Handles all database operations for todos
 */

class TodoRepository {
  constructor(pool) {
    this.pool = pool;
  }

  /**
   * Get all todos for a specific user
   * @param {number} userId - User ID
   * @returns {Promise<Array>} Array of todo objects
   */
  async findAllByUserId(userId) {
    const query =
      "SELECT * FROM todos WHERE user_id = $1 ORDER BY created_at DESC";
    const result = await this.pool.query(query, [userId]);
    return result.rows;
  }

  /**
   * Find a single todo by ID and user ID (security check)
   * @param {number} id - Todo ID
   * @param {number} userId - User ID
   * @returns {Promise<Object|null>} Todo object or null
   */
  async findByIdAndUserId(id, userId) {
    const query = "SELECT * FROM todos WHERE id = $1 AND user_id = $2";
    const result = await this.pool.query(query, [id, userId]);
    return result.rows[0] || null;
  }

  /**
   * Create a new todo for a user
   * @param {string} title - Todo title
   * @param {string} description - Todo description
   * @param {number} userId - User ID
   * @returns {Promise<Object>} The created todo object
   */
  async create(title, description, userId) {
    const query = `
      INSERT INTO todos (title, description, user_id) 
      VALUES ($1, $2, $3) 
      RETURNING *
    `;
    const result = await this.pool.query(query, [title, description, userId]);
    return result.rows[0];
  }

  /**
   * Update an existing todo (with user ownership check)
   * @param {number} id - Todo ID
   * @param {number} userId - User ID
   * @param {Object} data - Object containing title, description, and/or completed
   * @returns {Promise<Object|null>} Updated todo object or null
   */
  async update(id, userId, data) {
    const { title, description, completed } = data;
    const query = `
      UPDATE todos 
      SET title = $1, description = $2, completed = $3 
      WHERE id = $4 AND user_id = $5
      RETURNING *
    `;
    const result = await this.pool.query(query, [
      title,
      description,
      completed,
      id,
      userId,
    ]);
    return result.rows[0] || null;
  }

  /**
   * Delete a todo (with user ownership check)
   * @param {number} id - Todo ID
   * @param {number} userId - User ID
   * @returns {Promise<Object|null>} Deleted todo object or null
   */
  async delete(id, userId) {
    const query =
      "DELETE FROM todos WHERE id = $1 AND user_id = $2 RETURNING *";
    const result = await this.pool.query(query, [id, userId]);
    return result.rows[0] || null;
  }

  /**
   * Toggle the completed status of a todo (with user ownership check)
   * @param {number} id - Todo ID
   * @param {number} userId - User ID
   * @returns {Promise<Object|null>} Updated todo object or null
   */
  async toggleCompleted(id, userId) {
    const query = `
      UPDATE todos 
      SET completed = NOT completed 
      WHERE id = $1 AND user_id = $2
      RETURNING *
    `;
    const result = await this.pool.query(query, [id, userId]);
    return result.rows[0] || null;
  }

  // Keep old methods for backward compatibility with tests
  // These will be deprecated once tests are updated

  async findAll() {
    const query = "SELECT * FROM todos ORDER BY created_at DESC";
    const result = await this.pool.query(query);
    return result.rows;
  }

  async findById(id) {
    const query = "SELECT * FROM todos WHERE id = $1";
    const result = await this.pool.query(query, [id]);
    return result.rows[0] || null;
  }
}

export default TodoRepository;
