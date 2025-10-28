/**
 * Todo Repository
 * Handles all database operations for todos
 */
class TodoRepository {
  constructor(pool) {
    this.pool = pool;
  }

  /**
   * Get all todos from the database
   * @returns {Promise<Array>} Array of todo objects
   */
  async findAll() {
    const query = "SELECT * FROM todos ORDER BY created_at DESC";
    const result = await this.pool.query(query);
    return result.rows;
  }

  /**
   * Find a single todo by ID
   * @param {number} id - The todo ID
   * @returns {Promise<Object|null>} Todo object or null if not found
   */
  async findById(id) {
    const query = "SELECT * FROM todos WHERE id = $1";
    const result = await this.pool.query(query, [id]);
    return result.rows[0] || null;
  }

  /**
   * Create a new todo
   * @param {string} title - Todo title
   * @param {string} description - Todo description
   * @returns {Promise<Object>} The created todo object
   */
  async create(title, description) {
    const query = `
        INSERT INTO todos (title, description)
        VALUES ($1, $2)
        RETURNING *
    `;
    const result = await this.pool.query(query, [title, description]);
    return result.rows[0];
  }

  /**
   * Update an existing todo
   * @param {number} id - The todo id
   * @param {Object} data - Object containing title, description, and/or completed
   * @returns {Promise<Object|null>} Updated todo object or null if not found
   */
  async update(id, data) {
    const { title, description, completed } = data;
    const query = `
        UPDATE todos
        SET title = $1, description = $2, completed = $3
        WHERE id = $4
        RETURNING *
    `;
    const result = await this.pool.query(query, [
      title,
      description,
      completed,
      id,
    ]);
    return result.rows[0] || null;
  }

  /**
   * Delete a todo
   * @param {number} id - The todo ID
   * @returns {Promise<Object|null>} Deleted todo object or null if not found
   */
  async delete(id) {
    const query = "DELETE FROM todos WHERE id = $1 RETURNING *";
    const result = await this.pool.query(query, [id]);
    return result.rows[0] || null;
  }

  /**
   * Toggle the completed status of a todo
   * @param {number} id - The todo ID
   * @returns {Promise<Object|null>} Updated todo object or null if not found
   */
  async toggleCompleted(id) {
    const query = `
        UPDATE todos
        SET completed = NOT COMPLETED
        WHERE id = $1
        RETURNING *
    `;
    const result = await this.pool.query(query, [id]);
    return result.rows[0] || null;
  }
}

export default TodoRepository;
