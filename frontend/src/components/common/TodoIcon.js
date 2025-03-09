import React from 'react';

/**
 * TodoIcon component that renders a checkbox and the item description text.
 * Handles the visual representation of a todo item's completion status.
 * 
 * @param {Object} item - The todo item data
 * @param {Function} onToggleComplete - Function to toggle completion status
 * @param {number} listId - ID of the list containing this item
 */
const TodoIcon = ({ item, onToggleComplete, listId }) => {
  // Ensure we're using the item's own complete status, not inheriting from parent
  const isCompleted = item.complete || false;
  
  return (
    <div className="todo-icon-container">
      <input
        type="checkbox"
        className="todo-checkbox"
        checked={isCompleted}
        onChange={(e) => onToggleComplete(e)}
        aria-label={`Mark "${item.description}" as ${isCompleted ? 'incomplete' : 'complete'}`}
      />
      <span className={`todo-text ${isCompleted ? 'completed-text' : ''}`}>
        {item.description}
      </span>
    </div>
  );
};

export default TodoIcon; 