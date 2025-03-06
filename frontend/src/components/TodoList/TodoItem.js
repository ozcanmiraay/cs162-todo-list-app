import React, { useState } from 'react';
import NewItemForm from './NewItemForm';

const TodoItem = ({ item, onUpdate, listId, depth = 0 }) => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [description, setDescription] = useState(item.description);
  const [isAddingSubItem, setIsAddingSubItem] = useState(false);

  const handleComplete = async () => {
    try {
      const response = await fetch(`http://localhost:5000/item/${item.id}/complete`, {
        method: 'POST',
        credentials: 'include',
      });

      if (response.ok) {
        onUpdate();
      }
    } catch (error) {
      console.error('Error completing item:', error);
    }
  };

  const handleUpdateDescription = async () => {
    try {
      const response = await fetch(`http://localhost:5000/item/${item.id}/edit`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({ description }),
      });

      if (response.ok) {
        setIsEditing(false);
        onUpdate();
      }
    } catch (error) {
      console.error('Error updating item:', error);
    }
  };

  const hasChildren = item.children && item.children.length > 0;
  const canAddSubItems = depth < 2; // Limit hierarchy to 3 levels

  return (
    <div className="todo-item" style={{ marginLeft: `${depth * 20}px` }}>
      <div className="item-content">
        {hasChildren && (
          <button onClick={() => setIsCollapsed(!isCollapsed)}>
            {isCollapsed ? '►' : '▼'}
          </button>
        )}
        
        {isEditing ? (
          <div>
            <input
              type="text"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
            <button onClick={handleUpdateDescription}>Save</button>
            <button onClick={() => setIsEditing(false)}>Cancel</button>
          </div>
        ) : (
          <div>
            <span className={item.complete ? 'completed' : ''}>
              {item.description}
            </span>
            <button onClick={() => setIsEditing(true)}>Edit</button>
          </div>
        )}

        <div className="item-actions">
          <button onClick={handleComplete}>
            {item.complete ? 'Undo' : 'Complete'}
          </button>
          {canAddSubItems && (
            isAddingSubItem ? (
              <NewItemForm 
                listId={listId}
                parentId={item.id}
                onItemAdded={() => {
                  setIsAddingSubItem(false);
                  onUpdate();
                }}
                onCancel={() => setIsAddingSubItem(false)}
              />
            ) : (
              <button onClick={() => setIsAddingSubItem(true)}>
                Add Sub-item
              </button>
            )
          )}
        </div>
      </div>

      {!isCollapsed && hasChildren && (
        <div className="sub-items">
          {item.children.map((child) => (
            <TodoItem
              key={child.id}
              item={child}
              onUpdate={onUpdate}
              listId={listId}
              depth={depth + 1}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default TodoItem; 