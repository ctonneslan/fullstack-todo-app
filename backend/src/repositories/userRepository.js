/**
 * User Repository
 * Handles all database operations for users
 */

class UserRepository {
  constructor(pool) {
    this.pool = pool;
  }

  /**
   * Find user by email
   * @param {string} email - User's email
   * @returns {Promise<Object|null>} User object or null
   */
  async findByEmail(email) {
    const query = "SELECT * FROM users WHERE email = $1";
    const result = await this.pool.query(query, [email]);
    return result.rows[0] || null;
  }

  /**
   * Find user by ID
   * @param {number} id - User ID
   * @returns {Promise<Object|null>} User object or null
   */
  async findById(id) {
    const query = "SELECT * FROM users WHERE id = $1";
    const result = await this.pool.query(query, [id]);
    return result.rows[0] || null;
  }

  /**
   * Create a new user
   * @param {string} email - User's email
   * @param {string} passwordHash - Hashed password
   * @param {string} name - User's name
   * @returns {Promise<Object>} Created user object
   */
  async create(email, passwordHash, name) {
    const query = `
      INSERT INTO users (email, password_hash, name)
      VALUES ($1, $2, $3)
      RETURNING id, email, name, created_at
    `;
    const result = await this.pool.query(query, [email, passwordHash, name]);
    return result.rows[0];
  }

  /**
   * Update user information
   * @param {number} id - User ID
   * @param {Object} data - Data to update
   * @returns {Promise<Object|null>} Updated user or null
   */
  async update(id, data) {
    const { name, email } = data;
    const query = `
      UPDATE users 
      SET name = $1, email = $2
      WHERE id = $3
      RETURNING id, email, name, created_at
    `;
    const result = await this.pool.query(query, [name, email, id]);
    return result.rows[0] || null;
  }

  /**
   * Delete user
   * @param {number} id - User ID
   * @returns {Promise<Object|null>} Deleted user or null
   */
  async delete(id) {
    const query = "DELETE FROM users WHERE id = $1 RETURNING id, email, name";
    const result = await this.pool.query(query, [id]);
    return result.rows[0] || null;
  }

  /**
   * Get user with password hash (for authentication)
   * Normally we don't return password_hash, but needed for login
   * @param {string} email - User's email
   * @returns {Promise<Object|null>} User with password_hash
   */
  async findByEmailWithPassword(email) {
    const query = "SELECT * FROM users WHERE email = $1";
    const result = await this.pool.query(query, [email]);
    return result.rows[0] || null;
  }
}

export default UserRepository;
