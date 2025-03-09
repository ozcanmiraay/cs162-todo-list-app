import React from 'react';

const TodoIcon = ({ item, onToggleComplete, listId }) => {
  return (
    <div className="todo-icon-container">
      <input
        type="checkbox"
        className="todo-checkbox"
        checked={item.complete || false}
        onChange={() => onToggleComplete(listId, item.id)}
        aria-label={`Mark "${item.description}" as ${item.complete ? 'incomplete' : 'complete'}`}
      />
      <span className={`todo-text ${item.complete ? 'completed-text' : ''}`}>
        {item.description}
      </span>
    </div>
  );
};

export default TodoIcon; 