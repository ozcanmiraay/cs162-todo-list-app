import React, { useState, useEffect } from 'react';
import { useDrop } from 'react-dnd';
import TodoItem from './TodoItem';
import NewItemForm from './NewItemForm';
import Tooltip from '../common/Tooltip';

/**
 * TodoList component that renders a single todo list with its items.
 * Provides functionality for managing the list and its items.
 * 
 * @param {Object} list - The todo list data
 * @param {Function} onUpdateList - Function to update list name
 * @param {Function} onDeleteList - Function to delete the list
 * @param {Function} onAddItem - Function to add a new item to the list
 * @param {Function} onToggleComplete - Function to toggle item completion
 * @param {Function} onUpdateItem - Function to update item description
 * @param {Function} onDeleteItem - Function to delete an item
 * @param {Function} onAddSubItem - Function to add a sub-item
 * @param {Function} onMoveItem - Function to move an item to another list
 * @param {Array} allLists - All available lists for move operations
 */
const TodoList = ({ 
  list, 
  onUpdateList, 
  onDeleteList, 
  onAddItem,
  onToggleComplete,
  onUpdateItem,
  onDeleteItem,
  onAddSubItem,
  onMoveItem,
  allLists
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editedName, setEditedName] = useState(list.name);
  const [isAddingItem, setIsAddingItem] = useState(false);
  const [isOver, setIsOver] = useState(false);

  /**
   * Set up drop functionality using React DnD
   * Allows dropping todo items into this list
   */
  const [{ isOverCurrent }, drop] = useDrop({
    accept: 'TODO_ITEM',
    drop: (item) => {
      if (item.sourceListId !== list.id) {
        onMoveItem({ id: item.id }, list.id);
      }
    },
    collect: (monitor) => ({
      isOverCurrent: monitor.isOver({ shallow: true }),
    }),
    hover: () => {
      setIsOver(true);
    },
    canDrop: (item) => item.sourceListId !== list.id && item.depth === 0,
  });

  // Reset isOver when not hovering
  useEffect(() => {
    if (!isOverCurrent) {
      setIsOver(false);
    }
  }, [isOverCurrent]);

  // Add a useEffect to log when the component mounts or updates
  useEffect(() => {
    console.log('TodoList component mounted/updated with list:', list);
    // Make sure we're not calling onUpdateList here
  }, [list]);

  /**
   * Handle submission of edited list name
   */
  const handleEditSubmit = () => {
    const trimmedName = editedName.trim();
    
    if (trimmedName && trimmedName !== list.name) {
      const listId = list.id;
      console.log('Updating list with ID:', listId, 'and new name:', trimmedName);
      onUpdateList(listId, trimmedName);
    }
    setIsEditing(false);
  };

  /**
   * Handle adding a new item to the list
   * @param {string} description - Description of the new item
   */
  const handleAddItem = (description) => {
    onAddItem(list.id, description);
    setIsAddingItem(false);
  };

  return (
    <div 
      ref={drop} 
      className={`list-card ${isOver ? 'drop-target' : ''}`}
    >
      <div className={`list-header ${isEditing ? 'editing' : ''}`}>
        {isEditing ? (
          <>
            <div className="list-edit-container">
              <input
                type="text"
                className="list-title-input"
                value={editedName}
                onChange={(e) => setEditedName(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleEditSubmit()}
                autoFocus
              />
              <div className="list-actions">
                <Tooltip text="Save">
                  <button 
                    className="list-action-button"
                    onClick={handleEditSubmit}
                  >
                    ✓
                  </button>
                </Tooltip>
                <Tooltip text="Cancel">
                  <button 
                    className="list-action-button"
                    onClick={() => setIsEditing(false)}
                  >
                    ✕
                  </button>
                </Tooltip>
              </div>
            </div>
          </>
        ) : (
          <>
            <h3 className="list-title">{list.name}</h3>
            <div className="list-actions">
              <Tooltip text="Edit list">
                <button 
                  className="list-action-button"
                  onClick={() => {
                    setIsEditing(true);
                    setEditedName(list.name);
                  }}
                >
                  ✏️
                </button>
              </Tooltip>
              <Tooltip text="Delete list">
                <button 
                  className="list-action-button"
                  onClick={() => onDeleteList(list.id)}
                >
                  🗑️
                </button>
              </Tooltip>
            </div>
          </>
        )}
      </div>
      
      <div className="list-items">
        {/* Form for adding new items */}
        {isAddingItem ? (
          <div className="new-item-form">
            <NewItemForm 
              onSubmit={handleAddItem}
              onCancel={() => setIsAddingItem(false)}
            />
          </div>
        ) : (
          <button 
            className="add-item-button"
            onClick={() => setIsAddingItem(true)}
          >
            + Add Item
          </button>
        )}
        
        {/* Render all top-level items */}
        {list.items && list.items.length > 0 ? (
          list.items.map(item => (
            <TodoItem
              key={item.id}
              item={{...item, depth: 0}} // Top level items have depth 0
              listId={list.id}
              onToggleComplete={onToggleComplete}
              onUpdateItem={onUpdateItem}
              onDeleteItem={onDeleteItem}
              onAddSubItem={onAddSubItem}
              onMoveItem={onMoveItem}
              allLists={allLists}
            />
          ))
        ) : (
          <div className="empty-items-message">
            No items in this list yet.
          </div>
        )}
      </div>
    </div>
  );
};

export default TodoList; 