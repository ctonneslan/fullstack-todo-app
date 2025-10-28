/**
 * Root Application Component
 * Main entry point for the React component tree
 */
import { useState, useEffect } from 'react';
import todoService from './services/todoService.js';

function App() {
  const [todos, setTodos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchTodos();
  }, []);

  const fetchTodos = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await todoService.getAllTodos();
      setTodos(data);
    } catch (err) {
      setError(err.message);
      console.error('Error fetching todos:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container" style={{ paddingTop: '2rem' }}>
      <h1>Todo App</h1>

      {loading && <p>Loading todos...</p>}

      {error && (
        <div style={{ color: 'red', padding: '1rem', backgroundColor: '#fee' }}>
          Error: {error}
        </div>
      )}

      {!loading && !error && (
        <div>
          <p>Total todos: {todos.length}</p>
          <ul>
            {todos.map(todo => (
              <li key={todo.id}>
                <strong>{todo.title}</strong>
                {todo.description && <p>{todo.description}</p>}
                <small>Completed: {todo.completed ? '✓' : '✗'}</small>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

export default App;
