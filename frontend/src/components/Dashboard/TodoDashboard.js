import React, { useState, useEffect } from 'react';
import TodoList from '../TodoList/TodoList';
import '../../styles/Dashboard.css';

const TodoDashboard = () => {
  const [lists, setLists] = useState([]);
  const [newListName, setNewListName] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  const fetchLists = async () => {
    setIsLoading(true);
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
        setLists(data.lists);
        setError('');
      } else {
        const errorData = await response.json();
        setError(errorData.error || 'Failed to fetch lists');
      }
    } catch (error) {
      setError('Network error. Please try again.');
      console.error('Error fetching lists:', error);
    } finally {
      setIsLoading(false);
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

  return (
    <div className="dashboard">
      <div className="dashboard-header">
        <h1 className="dashboard-title">My Todo Lists</h1>
      </div>
      
      <form className="new-list-form" onSubmit={handleCreateList}>
        <input
          type="text"
          value={newListName}
          onChange={(e) => setNewListName(e.target.value)}
          placeholder="Enter new list name"
          required
        />
        <button type="submit">Create List</button>
      </form>
      
      {error && <div className="error-message">{error}</div>}
      
      {isLoading ? (
        <div className="loading-spinner"></div>
      ) : (
        <div className="lists-container">
          {lists.length === 0 ? (
            <div className="empty-state">
              <p>You don't have any lists yet. Create your first list above!</p>
            </div>
          ) : (
            lists.map(list => (
              <TodoList
                key={list.id}
                list={list}
                onUpdate={fetchLists}
                onItemMove={handleItemMove}
              />
            ))
          )}
        </div>
      )}
    </div>
  );
};

export default TodoDashboard; 