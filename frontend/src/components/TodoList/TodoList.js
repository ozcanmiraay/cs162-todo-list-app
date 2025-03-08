import React, { useState } from 'react';
import TodoItem from './TodoItem';
import NewItemForm from './NewItemForm';
import '../../styles/TodoList.css';

const TodoList = ({ list, onUpdate }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [listName, setListName] = useState(list.name);
  const [isAddingItem, setIsAddingItem] = useState(false);

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
    <div className="todo-list">
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
              <button onClick={() => setIsEditing(true)}>Edit</button>
              <button onClick={handleDeleteList} className="delete-button">Delete</button>
            </div>
          </div>
        )}
      </div>
      <div className="list-items">
        {list.items && list.items.length > 0 ? (
          list.items.map((item) => (
            <TodoItem 
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