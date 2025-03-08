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
              />
            ))
          )}
        </div>
      )}
    </div>
  );
};

export default TodoDashboard; 