/**
 * TodoList Component
 * Container component that manages the list of todos
 * Handles state and passes data/functions to child components
 */
import PropTypes from 'prop-types';
import TodoItem from './TodoItem.jsx';
import '../styles/TodoList.css';

function TodoList({ todos, onToggle, onDelete, onUpdate }) {
  if (todos.length === 0) {
    return (
      <div className="todo-list-empty">
        <p className="empty-message">🎉 No todos yet!</p>
        <p className="empty-hint">Add your first todo above to get started.</p>
      </div>
    );
  }

  return (
    <div className="todo-list">
      <div className="todo-list-header">
        <h2>Your Todos</h2>
        <span className="todo-count">
          {todos.filter(todo => !todo.completed).length} active
        </span>
      </div>

      <div className="todo-list-items">
        {todos.map(todo => (
          <TodoItem
            key={todo.id}
            todo={todo}
            onToggle={onToggle}
            onDelete={onDelete}
            onUpdate={onUpdate}
          />
        ))}
      </div>
    </div>
  );
}

TodoList.propTypes = {
  todos: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.number.isRequired,
      title: PropTypes.string.isRequired,
      completed: PropTypes.bool.isRequired,
    })
  ).isRequired,
  onToggle: PropTypes.func.isRequired,
  onDelete: PropTypes.func.isRequired,
  onUpdate: PropTypes.func.isRequired,
};

export default TodoList;
