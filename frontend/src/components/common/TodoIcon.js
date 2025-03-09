import React from 'react';

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