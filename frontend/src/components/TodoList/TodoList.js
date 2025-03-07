import React, { useState } from 'react';
import TodoItem from './TodoItem';
import NewItemForm from './NewItemForm';

const TodoList = ({ list, onUpdateList }) => {
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
        onUpdateList();
      }
    } catch (error) {
      console.error('Error updating list:', error);
    }
  };

  return (
    <div className="todo-list">
      <div className="list-header">
        {isEditing ? (
          <div>
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
            <button onClick={() => setIsEditing(true)}>Edit</button>
          </div>
        )}
      </div>
      <div className="list-items">
        {list.items?.map((item) => (
          <TodoItem 
            key={item.id} 
            item={item} 
            onUpdate={onUpdateList}
            listId={list.id}
          />
        ))}
        
        {isAddingItem ? (
          <NewItemForm 
            listId={list.id}
            onItemAdded={() => {
              setIsAddingItem(false);
              onUpdateList();
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