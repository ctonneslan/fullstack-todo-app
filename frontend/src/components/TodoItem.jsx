/**
 * Todo Item Component
 * Displays a single todo item
 * Presentational component
 */

import { useState } from 'react';
import PropTypes from 'prop-types';
import '../styles/TodoItem.css';

function TodoItem({ todo, onToggle, onDelete, onUpdate }) {
  // Local state for edit mode
  const [isEditing, setIsEditing] = useState(false);

  // Local state for form fields when editing
  const [editTitle, setEditTitle] = useState(todo.title);
  const [editDescription, setEditDescription] = useState(
    todo.description || ''
  );

  const handleToggleComplete = () => {
    onToggle(todo.id);
  };

  const handleDelete = () => {
    onDelete(todo.id);
  };

  const handleStartEdit = () => {
    setIsEditing(true);
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
    setEditTitle(todo.title);
    setEditDescription(todo.description || '');
  };

  const handleSaveEdit = e => {
    e.preventDefault();

    if (!editTitle.trim()) {
      alert('Title cannot be empty');
      return;
    }

    onUpdate(todo.id, {
      title: editTitle,
      description: editDescription,
      completed: todo.completed,
    });

    setIsEditing(false);
  };

  if (isEditing) {
    return (
      <div className="todo-item editing">
        <form onSubmit={handleSaveEdit}>
          <div className="form-group">
            <input
              type="text"
              value={editTitle}
              onChange={e => setEditTitle(e.target.value)}
              placeholder="Todo title"
              className="edit-input"
              autoFocus
            />
          </div>

          <div className="form-group">
            <textarea
              value={editDescription}
              onChange={e => setEditDescription(e.target.value)}
              placeholder="Description (optional)"
              className="edit-textarea"
              rows="3"
            ></textarea>
          </div>

          <div className="edit-actions">
            <button type="submit" className="btn btn-primary">
              Save
            </button>
            <button
              type="button"
              onClick={handleCancelEdit}
              className="btn btn-secondary"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    );
  }

  return (
    <div className={`todo-item ${todo.completed ? 'completed' : ''}`}>
      <div className="todo-content">
        <div className="todo-checkbox">
          <input
            type="checkbox"
            checked={todo.completed}
            onChange={handleToggleComplete}
            id={`todo-${todo.id}`}
          />
          <label htmlFor={`todo-${todo.id}`}></label>
        </div>

        <div className="todo-text">
          <h3 className="todo-title">{todo.title}</h3>
          {todo.description && (
            <p className="todo-description">{todo.description}</p>
          )}
          <small className="todo-date">
            Created: {new Date(todo.created_at).toLocaleDateString()}
          </small>
        </div>
      </div>

      <div className="todo-actions">
        <button
          onClick={handleStartEdit}
          className="btn btn-icon"
          title="Edit todo"
        >
          ✏️
        </button>
        <button
          onClick={handleDelete}
          className="btn btn-icon btn-danger"
          title="Delete todo"
        >
          🗑️
        </button>
      </div>
    </div>
  );
}

TodoItem.propTypes = {
  todo: PropTypes.shape({
    id: PropTypes.number.isRequired,
    title: PropTypes.string.isRequired,
    description: PropTypes.string,
    completed: PropTypes.bool.isRequired,
    created_at: PropTypes.string.isRequired,
  }).isRequired,
  onToggle: PropTypes.func.isRequired,
  onDelete: PropTypes.func.isRequired,
  onUpdate: PropTypes.func.isRequired,
};

export default TodoItem;
