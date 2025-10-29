/**
 * Test Factories
 * Reusable functions to create test data
 */

export function createTodoData(overrides = {}) {
  return {
    title: "Test Todo",
    description: "Test Description",
    completed: false,
    ...overrides, // Override defaults with custom values
  };
}

export function createMultipleTodos(count) {
  return Array.from({ length: count }, (_, i) => ({
    title: `Todo ${i + 1}`,
    description: `Description ${i + 1}`,
    completed: i % 2 === 0, // Alternate completed status
  }));
}

/**
 * Creates a todo in the database for testing
 */
export async function createTestTodo(pool, data = {}) {
  const todoData = createTodoData(data);
  const result = await pool.query(
    "INSERT INTO todos (title, description, completed) VALUES ($1, $2, $3) RETURNING *",
    [todoData.title, todoData.description, todoData.completed]
  );
  return result.rows[0];
}
