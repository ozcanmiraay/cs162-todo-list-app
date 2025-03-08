import React, { useState, useEffect } from 'react';
import TodoList from '../TodoList/TodoList';
import '../../styles/Dashboard.css';

const TodoDashboard = ({ 
  lists, 
  loading, 
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
  const [newListName, setNewListName] = useState('');
  const [error, setError] = useState('');
  const [showCreateForm, setShowCreateForm] = useState(false);

  const fetchLists = async () => {
    setError('');
    try {
      const response = await fetch('/api/lists', {
        method: 'GET',
        credentials: 'include',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
        }
      });

      if (response.ok) {
        const data = await response.json();
        onUpdateList(data.lists);
        setError('');
      } else {
        const errorData = await response.json();
        setError(errorData.error || 'Failed to fetch lists');
      }
    } catch (error) {
      setError('Network error. Please try again.');
      console.error('Error fetching lists:', error);
    }
  };

  useEffect(() => {
    fetchLists();
  }, []);

  const handleCreateList = async (e) => {
    e.preventDefault();
    setError('');
  
    if (!newListName.trim()) {
      setError('List name cannot be empty');
      return;
    }
  
    try {
      const response = await fetch('/api/lists', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({ name: newListName }),
      });

      if (response.ok) {
        setNewListName('');
        setShowCreateForm(false);
        fetchLists();
      } else {
        const errorData = await response.json();
        setError(errorData.error || 'Failed to create list');
      }
    } catch (error) {
      setError('Network error. Please try again.');
      console.error('Error creating list:', error);
    }
  };

  // This function is used by the DraggableItem component
  const handleItemMove = async (item, targetListId) => {
    try {
      // Save the collapse state of all items before the move
      const allCollapseStates = {};
      lists.forEach(list => {
        list.items.forEach(item => {
          const collapseStateKey = `collapse_state_${item.id}`;
          const savedState = localStorage.getItem(collapseStateKey);
          if (savedState !== null) {
            allCollapseStates[item.id] = JSON.parse(savedState);
          }
        });
      });
      
      const response = await fetch(`/item/${item.id}/move`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({ target_list_id: targetListId }),
      });

      if (response.ok) {
        // After successful move, fetch all lists again
        fetchLists();
        
        // After a short delay to ensure lists are fetched, restore collapse states
        setTimeout(() => {
          // Restore collapse states from our saved object
          Object.entries(allCollapseStates).forEach(([itemId, isCollapsed]) => {
            const collapseStateKey = `collapse_state_${itemId}`;
            localStorage.setItem(collapseStateKey, JSON.stringify(isCollapsed));
          });
        }, 500);
      } else {
        console.error('Error moving item:', await response.json());
      }
    } catch (error) {
      console.error('Error moving item:', error);
    }
  };

  if (loading) {
    return (
      <div className="loading-state">
        <div className="loading-spinner"></div>
        <p>Loading your todo lists...</p>
      </div>
    );
  }

  if (lists.length === 0) {
    return (
      <div className="empty-state">
        <div className="empty-state-icon">📋</div>
        <p className="empty-state-text">You don't have any todo lists yet.</p>
      </div>
    );
  }

  return (
    <div className="lists-container">
      {lists.map(list => (
        <TodoList
          key={list.id}
          list={list}
          onUpdateList={onUpdateList}
          onDeleteList={onDeleteList}
          onAddItem={onAddItem}
          onToggleComplete={onToggleComplete}
          onUpdateItem={onUpdateItem}
          onDeleteItem={onDeleteItem}
          onAddSubItem={onAddSubItem}
          onMoveItem={onMoveItem}
          allLists={allLists}
        />
      ))}
    </div>
  );
};

export default TodoDashboard; 