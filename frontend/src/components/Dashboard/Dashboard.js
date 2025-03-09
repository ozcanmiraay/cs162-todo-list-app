import React, { useState, useEffect } from 'react';
import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import Header from './Header';
import TodoDashboard from './TodoDashboard';
import '../../styles/Dashboard.css';

/**
 * Dashboard component that displays the user's todo lists and provides
 * functionality to manage lists and their items.
 * 
 * @param {Object} user - The current user object
 * @param {Function} onLogout - Function to handle user logout
 */
const Dashboard = ({ user, onLogout }) => {
  // State for todo lists and UI controls
  const [lists, setLists] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showNewListModal, setShowNewListModal] = useState(false);
  const [newListName, setNewListName] = useState('');

  // Fetch user's todo lists on component mount
  useEffect(() => {
    fetchLists();
  }, []);

  /**
   * Fetches all todo lists for the current user from the backend
   */
  const fetchLists = async () => {
    try {
      setLoading(true);
      const response = await fetch('/lists', {
        method: 'GET',
        credentials: 'include',
      });
      
      if (!response.ok) {
        throw new Error('Failed to fetch lists');
      }
      
      const data = await response.json();
      setLists(data.lists);
      setError(null);
    } catch (err) {
      console.error('Error fetching lists:', err);
      setError('Failed to load your todo lists. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  /**
   * Creates a new todo list with the provided name
   * @param {Event} e - Form submission event
   */
  const handleCreateList = async (e) => {
    e.preventDefault();
    
    if (!newListName.trim()) {
      return;
    }
    
    try {
      const response = await fetch('/lists/new', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ name: newListName }),
        credentials: 'include',
      });
      
      if (!response.ok) {
        throw new Error('Failed to create list');
      }
      
      // Refresh lists and reset form
      fetchLists();
      setNewListName('');
      setShowNewListModal(false);
    } catch (err) {
      console.error('Error creating list:', err);
      setError('Failed to create list. Please try again.');
    }
  };

  /**
   * Updates a todo list's name
   * @param {number} listId - ID of the list to update
   * @param {string} newName - New name for the list
   */
  const handleUpdateList = async (listId, newName) => {
    try {
      const response = await fetch(`/list/${listId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ name: newName }),
        credentials: 'include',
      });
      
      if (!response.ok) {
        throw new Error('Failed to update list');
      }
      
      // Update the list in state
      setLists(lists.map(list => 
        list.id === listId ? { ...list, name: newName } : list
      ));
    } catch (err) {
      console.error('Error updating list:', err);
      setError('Failed to update list. Please try again.');
    }
  };

  /**
   * Deletes a todo list
   * @param {number} listId - ID of the list to delete
   */
  const handleDeleteList = async (listId) => {
    if (!window.confirm('Are you sure you want to delete this list?')) {
      return;
    }
    
    try {
      const response = await fetch(`/list/${listId}`, {
        method: 'DELETE',
        credentials: 'include',
      });
      
      if (!response.ok) {
        throw new Error('Failed to delete list');
      }
      
      // Remove the list from state
      setLists(lists.filter(list => list.id !== listId));
    } catch (err) {
      console.error('Error deleting list:', err);
      setError('Failed to delete list. Please try again.');
    }
  };

  /**
   * Adds a new item to a todo list
   * @param {number} listId - ID of the list to add the item to
   * @param {string} description - Description of the new item
   */
  const handleAddItem = async (listId, description) => {
    try {
      const response = await fetch(`/list/${listId}/item/new`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ description }),
        credentials: 'include',
      });
      
      if (!response.ok) {
        throw new Error('Failed to add item');
      }
      
      // Refresh lists to show the new item
      fetchLists();
    } catch (err) {
      console.error('Error adding item:', err);
      setError('Failed to add item. Please try again.');
    }
  };

  /**
   * Toggles the completion status of a todo item
   * @param {number} listId - ID of the list containing the item
   * @param {number} itemId - ID of the item to toggle
   */
  const handleToggleComplete = async (listId, itemId) => {
    try {
      const response = await fetch(`/item/${itemId}/complete`, {
        method: 'POST',
        credentials: 'include',
      });
      
      if (!response.ok) {
        throw new Error('Failed to update item');
      }
      
      // Refresh lists to show updated completion status
      fetchLists();
    } catch (err) {
      console.error('Error toggling item completion:', err);
      setError('Failed to update item. Please try again.');
    }
  };

  /**
   * Updates a todo item's description
   * @param {number} listId - ID of the list containing the item
   * @param {number} itemId - ID of the item to update
   * @param {string} description - New description for the item
   */
  const handleUpdateItem = async (listId, itemId, description) => {
    try {
      const response = await fetch(`/item/${itemId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ description }),
        credentials: 'include',
      });
      
      if (!response.ok) {
        throw new Error('Failed to update item');
      }
      
      // Refresh lists to show the updated item
      fetchLists();
    } catch (err) {
      console.error('Error updating item:', err);
      setError('Failed to update item. Please try again.');
    }
  };

  /**
   * Deletes a todo item
   * @param {number} listId - ID of the list containing the item
   * @param {number} itemId - ID of the item to delete
   */
  const handleDeleteItem = async (listId, itemId) => {
    try {
      const response = await fetch(`/item/${itemId}`, {
        method: 'DELETE',
        credentials: 'include',
      });
      
      if (!response.ok) {
        throw new Error('Failed to delete item');
      }
      
      // Refresh lists to remove the deleted item
      fetchLists();
    } catch (err) {
      console.error('Error deleting item:', err);
      setError('Failed to delete item. Please try again.');
    }
  };

  /**
   * Adds a sub-item to a parent todo item
   * @param {number} listId - ID of the list containing the parent item
   * @param {number} parentId - ID of the parent item
   * @param {string} description - Description of the new sub-item
   */
  const handleAddSubItem = async (listId, parentId, description) => {
    try {
      const response = await fetch(`/item/${parentId}/subitem/new`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ description }),
        credentials: 'include',
      });
      
      if (!response.ok) {
        throw new Error('Failed to add sub-item');
      }
      
      // Refresh lists to show the new sub-item
      fetchLists();
    } catch (err) {
      console.error('Error adding sub-item:', err);
      setError('Failed to add sub-item. Please try again.');
    }
  };

  /**
   * Moves a todo item to a different list
   * @param {Object} item - The item to move
   * @param {number} targetListId - ID of the destination list
   */
  const handleMoveItem = async (item, targetListId) => {
    try {
      const response = await fetch(`/item/${item.id}/move/${targetListId}`, {
        method: 'POST',
        credentials: 'include',
      });
      
      if (!response.ok) {
        throw new Error('Failed to move item');
      }
      
      // Refresh lists to show the moved item
      fetchLists();
    } catch (err) {
      console.error('Error moving item:', err);
      setError('Failed to move item. Please try again.');
    }
  };

  return (
    <DndProvider backend={HTML5Backend}>
      <div className="dashboard-container">
        <Header user={user} onLogout={onLogout} />
        
        {error && (
          <div className="error-message">
            {error}
            <button onClick={() => setError(null)}>×</button>
          </div>
        )}
        
        <div className="dashboard-actions">
          <button 
            className="create-list-button"
            onClick={() => setShowNewListModal(true)}
          >
            Create New List
          </button>
        </div>
        
        <TodoDashboard 
          lists={lists}
          loading={loading}
          onUpdateList={handleUpdateList}
          onDeleteList={handleDeleteList}
          onAddItem={handleAddItem}
          onToggleComplete={handleToggleComplete}
          onUpdateItem={handleUpdateItem}
          onDeleteItem={handleDeleteItem}
          onAddSubItem={handleAddSubItem}
          onMoveItem={handleMoveItem}
          allLists={lists}
        />
        
        {showNewListModal && (
          <div className="modal-overlay">
            <div className="modal-content">
              <h2>Create New List</h2>
              <form onSubmit={handleCreateList}>
                <input
                  type="text"
                  placeholder="List Name"
                  value={newListName}
                  onChange={(e) => setNewListName(e.target.value)}
                  autoFocus
                />
                <div className="modal-actions">
                  <button 
                    type="button" 
                    className="cancel-button"
                    onClick={() => setShowNewListModal(false)}
                  >
                    Cancel
                  </button>
                  <button 
                    type="submit" 
                    className="form-submit-button"
                    disabled={!newListName.trim()}
                  >
                    Create List
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </DndProvider>
  );
};

export default Dashboard; 