/**
 * Root Application Component
 * Main entry point for the React component tree
 */
import { useState, useEffect } from 'react';
import todoService from './services/todoService.js';
import TodoForm from './components/TodoForm.jsx';
import TodoList from './components/TodoList.jsx';
import './styles/App.css';

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

  const handleCreateTodo = async todoData => {
    try {
      const newTodo = await todoService.createTodo(todoData);
      setTodos([newTodo, ...todos]);
    } catch (err) {
      alert(`Error creating todo: ${err.message}`);
      console.error('Error creating todo:', err);
    }
  };

  const handleToggleTodo = async id => {
    try {
      const updatedTodo = await todoService.toggleTodoCompleted(id);
      setTodos(todos.map(todo => (todo.id === id ? updatedTodo : todo)));
    } catch (err) {
      alert(`Error toggling todo: ${err.message}`);
      console.error('Error toggling todo:', err);
    }
  };

  const handleUpdateTodo = async (id, updates) => {
    try {
      const updatedTodo = await todoService.updateTodo(id, updates);
      setTodos(todos.map(todo => (todo.id === id ? updatedTodo : todo)));
    } catch (err) {
      alert(`Error updating todo: ${err.message}`);
      console.error('Error updating todo:', err);
    }
  };

  const handleDeleteTodo = async id => {
    if (!confirm('Are you sure you want to delete this todo?')) {
      return;
    }
    try {
      await todoService.deleteTodo(id);
      setTodos(todos.filter(todo => todo.id !== id));
    } catch (err) {
      alert(`Error deleting todo: ${err.message}`);
      console.error('Error deleting todo:', err);
    }
  };

  if (loading) {
    return (
      <div className="container">
        <div className="loading">
          <div className="spinner"></div>
          <p>Loading todos...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container">
        <div className="error">
          <h2>⚠️ Error</h2>
          <p>{error}</p>
          <button onClick={fetchTodos} className="btn btn-primary">
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="container">
      <header className="app-header">
        <h1>📝 My Todo App</h1>
        <p className="app-subtitle">Stay organized, get things done!</p>
      </header>

      <main className="app-main">
        <TodoForm onSubmit={handleCreateTodo} />

        <TodoList
          todos={todos}
          onToggle={handleToggleTodo}
          onDelete={handleDeleteTodo}
          onUpdate={handleUpdateTodo}
        />
      </main>

      <footer className="app-footer">
        <p>Built with React + Vite</p>
      </footer>
    </div>
  );
}

export default App;
