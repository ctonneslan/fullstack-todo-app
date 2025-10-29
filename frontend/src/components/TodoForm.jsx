/**
 * TodoForm Component
 * Form for creating new todos
 * Presentational component
 */

import { useState } from 'react';
import PropTypes from 'prop-types';
import '../styles/TodoForm.css';

function TodoForm({ onSubmit }) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async e => {
    e.preventDefault();

    if (!title.trim()) {
      alert('Please enter a todo title');
      return;
    }

    try {
      setIsSubmitting(true);

      await onSubmit({
        title: title.trim(),
        description: description.trim(),
      });

      setTitle('');
      setDescription('');
    } catch (error) {
      console.error('Error submitting form:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="todo-form">
      <h2 className="form-title">Add New Todo</h2>
      <div className="form-group">
        <label htmlFor="title" className="form-label">
          Title *
        </label>
        <input
          type="text"
          id="title"
          value={title}
          onChange={e => setTitle(e.target.value)}
          placeholder="Enter todo title..."
          className="form-input"
          disabled={isSubmitting}
        />
      </div>

      <div className="form-group">
        <label htmlFor="description" className="form-label">
          Description
        </label>
        <textarea
          id="description"
          value={description}
          onChange={e => setDescription(e.target.value)}
          placeholder="Enter description (optional)..."
          className="form-textarea"
          rows="4"
          disabled={isSubmitting}
        ></textarea>
      </div>

      <button
        type="submit"
        className="btn btn-primary btn-block"
        disabled={isSubmitting}
      >
        {isSubmitting ? 'Adding...' : 'Add todo'}
      </button>
    </form>
  );
}

TodoForm.propTypes = {
  onSubmit: PropTypes.func.isRequired,
};

export default TodoForm;
