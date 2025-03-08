import React, { useState, useEffect } from 'react';
import { useDrop } from 'react-dnd';
import DraggableItem from './DraggableItem';
import NewItemForm from './NewItemForm';
import Tooltip from '../common/Tooltip';
import '../../styles/TodoList.css';

const TodoList = ({ list, onUpdate, onItemMove }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [listName, setListName] = useState(list.name);
  const [isAddingItem, setIsAddingItem] = useState(false);
  const [dropIndicatorVisible, setDropIndicatorVisible] = useState(false);
  const [draggedItemInfo, setDraggedItemInfo] = useState(null);
  const [items, setItems] = useState(list.items || []);
  
  // Use effect to update items when list.items changes
  useEffect(() => {
    if (list.items) {
      // Apply saved collapse states to the items
      const itemsWithCollapseState = list.items.map(item => {
        try {
          const collapseStateKey = `collapse_state_${item.id}`;
          const savedState = localStorage.getItem(collapseStateKey);
          if (savedState !== null) {
            return { ...item, isCollapsed: JSON.parse(savedState) };
          }
        } catch (error) {
          console.error('Error loading collapse state:', error);
        }
        return item;
      });
      
      setItems(itemsWithCollapseState);
    }
  }, [list.items]);

  // Set up drop target
  const [{ isOver, canDrop }, drop] = useDrop(() => ({
    accept: 'TODO_ITEM',
    drop: (item) => handleItemDrop(item),
    hover: (item) => {
      setDropIndicatorVisible(true);
      setDraggedItemInfo(item);
    },
    canDrop: (item) => item.sourceListId !== list.id,
    collect: (monitor) => ({
      isOver: !!monitor.isOver(),
      canDrop: !!monitor.canDrop(),
    }),
  }));

  const handleItemDrop = async (item) => {
    setDropIndicatorVisible(false);
    
    if (onItemMove) {
      // Use the parent component's move function to preserve collapse states
      onItemMove(item, list.id);
    } else {
      try {
        const response = await fetch(`/item/${item.id}/move`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          credentials: 'include',
          body: JSON.stringify({ target_list_id: list.id }),
        });

        if (response.ok) {
          onUpdate();
        } else {
          console.error('Error moving item:', await response.json());
        }
      } catch (error) {
        console.error('Error moving item:', error);
        handleDragError(error);
      }
    }
  };

  const handleDragError = (error) => {
    console.error('Drag and drop error:', error);
    alert('There was an error moving the item. Please try again.');
    onUpdate(); // Refresh the lists to ensure UI is in sync with server
  };

  const handleUpdateName = async () => {
    try {
      const response = await fetch(`/list/${list.id}/edit`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({ name: listName }),
      });

      if (response.ok) {
        setIsEditing(false);
        onUpdate();
      } else {
        const errorData = await response.json();
        console.error('Error updating list:', errorData);
      }
    } catch (error) {
      console.error('Error updating list:', error);
    }
  };

  const handleDeleteList = async () => {
    if (!window.confirm('Are you sure you want to delete this list and all its items?')) {
      return;
    }
    
    try {
      const response = await fetch(`/list/${list.id}/delete`, {
        method: 'POST',
        credentials: 'include',
      });

      if (response.ok) {
        onUpdate();
      } else {
        const errorData = await response.json();
        console.error('Error deleting list:', errorData);
        alert(`Failed to delete list: ${errorData.error || 'Unknown error'}`);
      }
    } catch (error) {
      console.error('Error deleting list:', error);
      alert('Network error while trying to delete list. Please try again.');
    }
  };

  return (
    <div 
      ref={drop} 
      className={`todo-list ${isOver && canDrop ? 'drop-target' : ''} ${dropIndicatorVisible && canDrop ? 'drop-indicator' : ''}`}
      onDragLeave={() => {
        setDropIndicatorVisible(false);
        setDraggedItemInfo(null);
      }}
    >
      <div className="list-header">
        {isEditing ? (
          <div className="edit-form">
            <input
              type="text"
              value={listName}
              onChange={(e) => setListName(e.target.value)}
            />
            <button onClick={handleUpdateName}>Save</button>
            <button onClick={() => setIsEditing(false)}>Cancel</button>
          </div>
        ) : (
          <div>
            <h3>{list.name}</h3>
            <div className="list-actions">
              <Tooltip text="Edit list name" position="bottom">
                <button onClick={() => setIsEditing(true)}>Edit</button>
              </Tooltip>
              <Tooltip text="Delete this list" position="bottom">
                <button onClick={handleDeleteList} className="delete-button">Delete</button>
              </Tooltip>
            </div>
          </div>
        )}
      </div>
      
      {isOver && canDrop && draggedItemInfo && (
        <div className="drop-preview">
          <div className="drop-preview-content">
            <span className="drop-preview-icon">↓</span>
            <span className="drop-preview-text">
              Moving: <strong>{draggedItemInfo.description}</strong>
            </span>
          </div>
        </div>
      )}
      
      <div className="list-items">
        <div className="items-scroll-container">
          {items && items.length > 0 ? (
            items.map((item) => (
              <DraggableItem
                key={item.id}
                item={item}
                onUpdate={onUpdate}
                listId={list.id}
                depth={0}
              />
            ))
          ) : (
            <div className="empty-list">
              <p>This list is empty. Add your first item!</p>
            </div>
          )}
        </div>
        
        {isAddingItem ? (
          <NewItemForm 
            listId={list.id}
            onItemAdded={() => {
              setIsAddingItem(false);
              onUpdate();
            }}
            onCancel={() => setIsAddingItem(false)}
          />
        ) : (
          <button onClick={() => setIsAddingItem(true)}>Add Item</button>
        )}
      </div>
    </div>
  );
};

export default TodoList; 