import React, { useState } from 'react';
import NewItemForm from './NewItemForm';

const TodoItem = ({ item, onUpdate, listId, depth = 0 }) => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [description, setDescription] = useState(item.description);
  const [isAddingSubItem, setIsAddingSubItem] = useState(false);
  const [availableLists, setAvailableLists] = useState([]);
  const [showMoveOptions, setShowMoveOptions] = useState(false);
  const [targetListId, setTargetListId] = useState('');

  const handleComplete = async () => {
    try {
      const response = await fetch(`/item/${item.id}/complete`, {
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
      const response = await fetch(`/item/${item.id}/edit`, {
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

  const handleDelete = async () => {
    if (!window.confirm('Are you sure you want to delete this item and all its sub-items?')) {
      return;
    }
    
    try {
      const response = await fetch(`/item/${item.id}/delete`, {
        method: 'POST',
        credentials: 'include',
      });

      if (response.ok) {
        onUpdate();
      } else {
        console.error('Error deleting item:', await response.json());
      }
    } catch (error) {
      console.error('Error deleting item:', error);
    }
  };

  const handleShowMoveOptions = async () => {
    try {
      const response = await fetch('/api/lists', {
        credentials: 'include'
      });
      
      if (response.ok) {
        const data = await response.json();
        setAvailableLists(data.lists.filter(l => l.id !== listId));
        setShowMoveOptions(true);
      }
    } catch (error) {
      console.error('Error fetching lists:', error);
    }
  };

  const handleMoveItem = async () => {
    if (!targetListId) return;
    
    try {
      const response = await fetch(`/item/${item.id}/move`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({ target_list_id: targetListId }),
      });

      if (response.ok) {
        setShowMoveOptions(false);
        onUpdate();
      }
    } catch (error) {
      console.error('Error moving item:', error);
    }
  };

  const hasChildren = item.children && item.children.length > 0;
  const canAddSubItems = depth < 2; // Limit hierarchy to 3 levels

  return (
    <div className={`todo-item depth-${depth} ${item.complete ? 'completed' : ''}`}>
      <div className="item-content">
        {hasChildren && (
          <button 
            className="collapse-button"
            onClick={() => setIsCollapsed(!isCollapsed)}
            aria-label={isCollapsed ? "Expand" : "Collapse"}
          >
            {isCollapsed ? '▶' : '▼'}
          </button>
        )}
        
        {isEditing ? (
          <div className="edit-form">
            <input
              type="text"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
            <button onClick={handleUpdateDescription}>Save</button>
            <button onClick={() => setIsEditing(false)}>Cancel</button>
          </div>
        ) : (
          <div className="item-details">
            <span 
              className={item.complete ? 'completed-task' : ''}
              onClick={() => setIsEditing(true)}
            >
              {item.description}
            </span>
          </div>
        )}

        <div className="item-actions">
          <button onClick={handleComplete}>
            {item.complete ? 'Undo' : 'Complete'}
          </button>
          <button onClick={() => setIsEditing(true)}>Edit</button>
          <button onClick={handleDelete} className="delete-button">
            Delete
          </button>
          {canAddSubItems && !isAddingSubItem && (
            <button onClick={() => setIsAddingSubItem(true)}>
              Add Sub-item
            </button>
          )}
          
          {depth === 0 && (
            <button onClick={handleShowMoveOptions}>Move</button>
          )}
        </div>

        {depth === 0 && showMoveOptions && (
          <div className="move-options">
            <select 
              value={targetListId} 
              onChange={(e) => setTargetListId(e.target.value)}
            >
              <option value="">Select a list</option>
              {availableLists.map(list => (
                <option key={list.id} value={list.id}>{list.name}</option>
              ))}
            </select>
            <button onClick={handleMoveItem}>Move</button>
            <button onClick={() => setShowMoveOptions(false)}>Cancel</button>
          </div>
        )}
      </div>

      {isAddingSubItem && (
        <div className="sub-item-form">
          <NewItemForm 
            listId={listId}
            parentId={item.id}
            onItemAdded={() => {
              setIsAddingSubItem(false);
              onUpdate();
            }}
            onCancel={() => setIsAddingSubItem(false)}
          />
        </div>
      )}

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