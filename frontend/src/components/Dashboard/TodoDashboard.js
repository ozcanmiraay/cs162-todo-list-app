import React, { useState, useEffect } from 'react';
import TodoList from '../TodoList/TodoList';

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
      
      console.log('Fetch lists response:', response);
      console.log('Fetch lists cookies:', document.cookie);
      
      if (response.ok) {
        const data = await response.json();
        setLists(data.lists || []);
        setError('');
      } else if (response.status === 401) {
        // Handle unauthorized access
        console.error('Unauthorized access to lists');
        setError('Please log in to view your lists');
      } else {
        throw new Error('Failed to fetch lists');
      }
    } catch (error) {
      console.error('Error fetching lists:', error);
      setError('Failed to load todo lists');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchLists();
  }, []);

  const handleCreateList = async (e) => {
    e.preventDefault();
    if (!newListName.trim()) return;

    try {
      const response = await fetch('/api/lists', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({ name: newListName })
      });

      if (response.ok) {
        setNewListName('');
        fetchLists();
      } else {
        const data = await response.json();
        setError(data.error || 'Failed to create list');
      }
    } catch (error) {
      console.error('Error creating list:', error);
      setError('Failed to create new list');
    }
  };

  return (
    <div className="todo-dashboard">
      {isLoading ? (
        <div>Loading...</div>
      ) : (
        <>
          <div className="create-list-form">
            <form onSubmit={handleCreateList}>
              <input
                type="text"
                value={newListName}
                onChange={(e) => setNewListName(e.target.value)}
                placeholder="New List Name"
              />
              <button type="submit">Create List</button>
            </form>
          </div>
          
          {error && <div className="error-message">{error}</div>}
          
          <div className="lists-container">
            {lists.map(list => (
              <TodoList
                key={list.id}
                list={list}
                onUpdate={fetchLists}
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
};

export default TodoDashboard; 