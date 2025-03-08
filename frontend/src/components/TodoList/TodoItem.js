import React, { useState, useRef, useEffect } from 'react';
import NewItemForm from './NewItemForm';
import DraggableItem from './DraggableItem';
import Tooltip from '../common/Tooltip';

const TodoItem = ({ item, onUpdate, listId, depth = 0 }) => {
  const [isCollapsed, setIsCollapsed] = useState(item.isCollapsed || false);
  const [isEditing, setIsEditing] = useState(false);
  const [description, setDescription] = useState(item.description);
  const [isAddingSubItem, setIsAddingSubItem] = useState(false);
  const [availableLists, setAvailableLists] = useState([]);
  const [showMoveOptions, setShowMoveOptions] = useState(false);
  const moveMenuRef = useRef(null);

  useEffect(() => {
    if (item.isCollapsed !== isCollapsed) {
      const updateCollapseState = async () => {
        try {
          const collapseStateKey = `collapse_state_${item.id}`;
          localStorage.setItem(collapseStateKey, JSON.stringify(isCollapsed));
        } catch (error) {
          console.error('Error saving collapse state:', error);
        }
      };
      
      updateCollapseState();
    }
  }, [isCollapsed, item.id, item.isCollapsed]);
  
  useEffect(() => {
    try {
      const collapseStateKey = `collapse_state_${item.id}`;
      const savedState = localStorage.getItem(collapseStateKey);
      if (savedState !== null) {
        setIsCollapsed(JSON.parse(savedState));
      }
    } catch (error) {
      console.error('Error loading collapse state:', error);
    }
  }, [item.id]);

  // Close the move menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (moveMenuRef.current && !moveMenuRef.current.contains(event.target)) {
        setShowMoveOptions(false);
      }
    };

    if (showMoveOptions) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showMoveOptions]);

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

  const handleMoveItem = async (targetListId) => {
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
      } else {
        console.error('Error moving item:', await response.json());
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
          <Tooltip text={isCollapsed ? "Expand sub-items" : "Collapse sub-items"}>
            <button 
              className="collapse-button"
              onClick={() => setIsCollapsed(!isCollapsed)}
              aria-label={isCollapsed ? "Expand" : "Collapse"}
            >
              {isCollapsed ? '▶' : '▼'}
            </button>
          </Tooltip>
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
            {depth === 0 && (
              <Tooltip text="Drag to move to another list">
                <span className="drag-handle">
                  ⋮⋮
                </span>
              </Tooltip>
            )}
          </div>
        )}

        <div className="item-actions">
          <Tooltip text="Complete this item" position="bottom">
            <button 
              className="action-button complete-button" 
              onClick={handleComplete}
            >
              {item.complete ? '✓' : '○'}
            </button>
          </Tooltip>
          
          <Tooltip text="Edit item">
            <button 
              className="action-button edit-button" 
              onClick={() => setIsEditing(true)}
            >
              ✎
            </button>
          </Tooltip>
          
          <Tooltip text="Delete item">
            <button 
              className="action-button delete-button" 
              onClick={handleDelete}
            >
              🗑
            </button>
          </Tooltip>
          
          {canAddSubItems && !isAddingSubItem && (
            <Tooltip text="Add sub-item">
              <button 
                className="action-button add-sub-button" 
                onClick={() => setIsAddingSubItem(true)}
              >
                +
              </button>
            </Tooltip>
          )}
          
          {depth === 0 && (
            <div className="move-dropdown" ref={moveMenuRef}>
              <Tooltip text="Move to another list" position="left">
                <button 
                  className="action-button move-button" 
                  onClick={handleShowMoveOptions}
                >
                  ↗
                </button>
              </Tooltip>
              
              {showMoveOptions && (
                <div className="move-menu">
                  <div className="move-menu-header">Move to list:</div>
                  {availableLists.length > 0 ? (
                    <ul className="move-menu-list">
                      {availableLists.map(list => (
                        <li 
                          key={list.id} 
                          className="move-menu-item"
                          onClick={() => handleMoveItem(list.id)}
                        >
                          {list.name}
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <div className="move-menu-empty">No other lists available</div>
                  )}
                </div>
              )}
            </div>
          )}
        </div>
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
            <DraggableItem
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