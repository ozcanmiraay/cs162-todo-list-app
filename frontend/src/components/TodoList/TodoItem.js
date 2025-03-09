import React, { useState, useRef, useEffect } from 'react';
import { useDrag } from 'react-dnd';
import NewItemForm from './NewItemForm';
import Tooltip from '../common/Tooltip';
import TodoIcon from '../common/TodoIcon';

const TodoItem = ({ 
  item, 
  listId, 
  onToggleComplete, 
  onUpdateItem, 
  onDeleteItem,
  onAddSubItem,
  onMoveItem,
  allLists
}) => {
  const [isCollapsed, setIsCollapsed] = useState(item.isCollapsed || false);
  const [isEditing, setIsEditing] = useState(false);
  const [editedDescription, setEditedDescription] = useState(item.description);
  const [isAddingSubItem, setIsAddingSubItem] = useState(false);
  const [showMoveOptions, setShowMoveOptions] = useState(false);
  const moveMenuRef = useRef(null);

  // Set up drag functionality
  const [{ isDragging }, drag] = useDrag({
    type: 'TODO_ITEM',
    item: { 
      id: item.id, 
      sourceListId: listId,
      depth: item.depth || 0
    },
    collect: (monitor) => ({
      isDragging: !!monitor.isDragging(),
    }),
    canDrag: () => item.depth === 0, // Only allow dragging top-level items
  });

  // Load collapse state from localStorage
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

  // Save collapse state to localStorage when it changes
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

  const handleEditSubmit = () => {
    if (editedDescription.trim() && editedDescription !== item.description) {
      onUpdateItem(listId, item.id, editedDescription);
    }
    setIsEditing(false);
  };

  const handleAddSubItem = (description) => {
    onAddSubItem(listId, item.id, description);
    setIsAddingSubItem(false);
  };

  const handleMoveItem = (targetListId) => {
    onMoveItem(item, targetListId);
    setShowMoveOptions(false);
  };

  const hasChildren = item.children && item.children.length > 0;
  const canAddSubItems = item.depth < 2; // Limit hierarchy to 3 levels (0, 1, 2)
  const isTopLevel = item.depth === 0; // Only top-level items can be moved

  return (
    <div 
      ref={drag}
      className={`todo-item ${item.complete ? 'completed' : ''} ${isDragging ? 'dragging' : ''}`}
      style={{ 
        opacity: isDragging ? 0.5 : 1,
        cursor: item.depth === 0 ? 'grab' : 'default'
      }}
      data-depth={item.depth || 0}
    >
      <div className="todo-item-container">
        {isEditing ? (
          <>
            <div className="edit-input-container">
              <input
                type="checkbox"
                className="todo-checkbox"
                checked={item.complete || false}
                onChange={() => onToggleComplete(listId, item.id)}
              />
              <input
                type="text"
                className="todo-edit-input"
                value={editedDescription}
                onChange={(e) => setEditedDescription(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleEditSubmit()}
                autoFocus
              />
              <button 
                className="save-edit-button"
                onClick={handleEditSubmit}
              >
                Save
              </button>
            </div>
            <div className="todo-actions">
              <Tooltip text="Cancel">
                <button 
                  className="todo-action-button"
                  onClick={() => setIsEditing(false)}
                >
                  ❌
                </button>
              </Tooltip>
            </div>
          </>
        ) : (
          <>
            <div className="todo-item-content">
              {hasChildren && (
                <Tooltip text={isCollapsed ? "Expand" : "Collapse"}>
                  <button 
                    className="collapse-button"
                    onClick={() => setIsCollapsed(!isCollapsed)}
                  >
                    {isCollapsed ? '▶' : '▼'}
                  </button>
                </Tooltip>
              )}
              
              <TodoIcon 
                item={item} 
                onToggleComplete={onToggleComplete} 
                listId={listId} 
              />
            </div>
            
            <div className="todo-actions">
              {isTopLevel && allLists && allLists.length > 1 && (
                <div className="move-item-container" ref={moveMenuRef}>
                  <Tooltip text="Move to another list">
                    <button 
                      className="todo-action-button"
                      onClick={() => setShowMoveOptions(!showMoveOptions)}
                    >
                      ↗️
                    </button>
                  </Tooltip>
                  
                  {showMoveOptions && (
                    <div className="move-options-menu">
                      <div className="move-options-header">Move to:</div>
                      {allLists
                        .filter(list => list.id !== listId)
                        .map(list => (
                          <button
                            key={list.id}
                            className="move-option"
                            onClick={() => handleMoveItem(list.id)}
                          >
                            {list.name}
                          </button>
                        ))
                      }
                    </div>
                  )}
                </div>
              )}
              
              {canAddSubItems && (
                <Tooltip text="Add sub-item">
                  <button 
                    className="todo-action-button"
                    onClick={() => setIsAddingSubItem(!isAddingSubItem)}
                  >
                    ➕
                  </button>
                </Tooltip>
              )}
              
              <Tooltip text="Edit item">
                <button 
                  className="todo-action-button"
                  onClick={() => {
                    setIsEditing(true);
                    setEditedDescription(item.description);
                  }}
                >
                  ✏️
                </button>
              </Tooltip>
              
              <Tooltip text="Delete item">
                <button 
                  className="todo-action-button"
                  onClick={() => onDeleteItem(listId, item.id)}
                >
                  🗑️
                </button>
              </Tooltip>
            </div>
          </>
        )}
      </div>
      
      {isAddingSubItem && (
        <div className="sub-item-form">
          <NewItemForm 
            onSubmit={handleAddSubItem}
            onCancel={() => setIsAddingSubItem(false)}
          />
        </div>
      )}
      
      {hasChildren && !isCollapsed && (
        <div className="nested-items">
          {item.children.map(child => (
            <TodoItem
              key={child.id}
              item={{...child, depth: (item.depth || 0) + 1}}
              listId={listId}
              onToggleComplete={onToggleComplete}
              onUpdateItem={onUpdateItem}
              onDeleteItem={onDeleteItem}
              onAddSubItem={onAddSubItem}
              onMoveItem={onMoveItem}
              allLists={allLists}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default TodoItem; 