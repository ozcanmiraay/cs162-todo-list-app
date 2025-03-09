import React, { useState, useEffect } from 'react';
import { DndProvider } from 'react-dnd';
import CustomHTML5Backend from '../../utils/CustomHTML5Backend';
import Header from './Header';
import TodoDashboard from './TodoDashboard';
import '../../styles/Dashboard.css';
import CustomDragLayer from '../DragLayer/CustomDragLayer';

const Dashboard = ({ user, onLogout }) => {
  const [lists, setLists] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showNewListModal, setShowNewListModal] = useState(false);
  const [newListName, setNewListName] = useState('');

  useEffect(() => {
    fetchLists();
  }, []);

  const fetchLists = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/lists', {
        credentials: 'include'
      });
      
      if (!response.ok) {
        throw new Error('Failed to fetch lists');
      }
      
      const data = await response.json();
      setLists(data.lists || []);
      setError(null);
    } catch (err) {
      console.error('Error fetching lists:', err);
      setError('Failed to load your todo lists. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateList = async (e) => {
    e.preventDefault();
    
    if (!newListName.trim()) {
      return;
    }
    
    try {
      const response = await fetch('/api/lists', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({ name: newListName })
      });
      
      if (!response.ok) {
        throw new Error('Failed to create list');
      }
      
      fetchLists();
      setNewListName('');
      setShowNewListModal(false);
    } catch (err) {
      console.error('Error creating list:', err);
      setError('Failed to create list. Please try again.');
    }
  };

  const handleUpdateList = async (listId, newName) => {
    // More robust guard against automatic calls
    if (listId === lists || 
        (Array.isArray(listId) && listId.length === lists.length) || 
        !newName) {
      console.warn('Ignoring automatic call to handleUpdateList with lists array or missing name');
      return;
    }

    console.log('Valid handleUpdateList call with:', { listId, newName });
    
    // Handle different types of listId input
    let id = listId;
    
    // If it's an array, take the first element
    if (Array.isArray(listId)) {
      console.warn('listId is an array, using first element:', listId);
      id = listId[0];
    }
    
    // If it's an object with an id property, use that
    if (typeof id === 'object' && id !== null && 'id' in id) {
      console.log('Converting object to ID:', id);
      id = id.id;
    }
    
    // Final check to ensure we have a valid ID and name
    if (typeof id !== 'number' && typeof id !== 'string') {
      console.error('Invalid list ID after conversion:', id);
      setError('Failed to update list: Invalid list ID');
      return;
    }
    
    if (!newName || typeof newName !== 'string' || !newName.trim()) {
      console.error('Invalid list name:', newName);
      setError('Failed to update list: Invalid list name');
      return;
    }
    
    try {
      console.log(`Sending PUT request to /api/lists/${id} with name: ${newName}`);
      const response = await fetch(`/api/lists/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({ name: newName })
      });
      
      const responseData = await response.json();
      console.log('Update list response:', responseData);
      
      if (!response.ok) {
        throw new Error(`Failed to update list: ${response.status} ${responseData.error || response.statusText}`);
      }
      
      // Update the list in the state
      setLists(lists.map(list => 
        list.id === id ? { ...list, name: newName } : list
      ));
      
    } catch (error) {
      console.error('Error updating list:', error);
      setError('Failed to update list. Please try again.');
    }
  };

  const handleDeleteList = async (listId) => {
    if (!window.confirm('Are you sure you want to delete this list and all its items?')) {
      return;
    }
    
    try {
      const response = await fetch(`/list/${listId}/delete`, {
        method: 'POST',
        credentials: 'include'
      });
      
      if (!response.ok) {
        throw new Error('Failed to delete list');
      }
      
      fetchLists();
    } catch (err) {
      console.error('Error deleting list:', err);
      setError('Failed to delete list. Please try again.');
    }
  };

  const handleAddItem = async (listId, description) => {
    try {
      const response = await fetch(`/list/${listId}/item/new`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({ description })
      });
      
      if (!response.ok) {
        throw new Error('Failed to add item');
      }
      
      fetchLists();
    } catch (err) {
      console.error('Error adding item:', err);
      setError('Failed to add item. Please try again.');
    }
  };

  const handleAddSubItem = async (listId, parentId, description) => {
    try {
      const response = await fetch(`/list/${listId}/item/new`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({ 
          description,
          parent_id: parentId
        })
      });
      
      if (!response.ok) {
        throw new Error('Failed to add sub-item');
      }
      
      fetchLists();
    } catch (err) {
      console.error('Error adding sub-item:', err);
      setError('Failed to add sub-item. Please try again.');
    }
  };

  const handleToggleComplete = async (listId, itemId) => {
    try {
      const response = await fetch(`/item/${itemId}/complete`, {
        method: 'POST',
        credentials: 'include',
      });
      
      if (!response.ok) {
        throw new Error('Failed to update item');
      }
      
      fetchLists();
    } catch (err) {
      console.error('Error toggling item completion:', err);
      setError('Failed to update item. Please try again.');
    }
  };

  const handleUpdateItem = async (listId, itemId, newDescription) => {
    try {
      const response = await fetch(`/item/${itemId}/edit`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({ description: newDescription })
      });
      
      if (!response.ok) {
        throw new Error('Failed to update item');
      }
      
      fetchLists();
    } catch (err) {
      console.error('Error updating item:', err);
      setError('Failed to update item. Please try again.');
    }
  };

  const handleDeleteItem = async (listId, itemId) => {
    if (!window.confirm('Are you sure you want to delete this item and all its sub-items?')) {
      return;
    }
    
    try {
      const response = await fetch(`/item/${itemId}/delete`, {
        method: 'POST',
        credentials: 'include',
      });
      
      if (!response.ok) {
        throw new Error('Failed to delete item');
      }
      
      fetchLists();
    } catch (err) {
      console.error('Error deleting item:', err);
      setError('Failed to delete item. Please try again.');
    }
  };

  const handleMoveItem = async (item, targetListId) => {
    try {
      const response = await fetch(`/item/${item.id}/move`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({ target_list_id: targetListId }),
      });
      
      if (!response.ok) {
        throw new Error('Failed to move item');
      }
      
      fetchLists();
    } catch (err) {
      console.error('Error moving item:', err);
      setError('Failed to move item. Please try again.');
    }
  };

  return (
    <DndProvider backend={CustomHTML5Backend}>
      <div className="dashboard-container">
        <CustomDragLayer />
        <Header user={user} onLogout={onLogout} />
        
        {error && (
          <div className="error-message">
            <span>{error}</span>
            <button onClick={() => setError(null)}>×</button>
          </div>
        )}
        
        <div className="dashboard-content">
          <div className="dashboard-header">
            <h2 className="dashboard-section-title">My Todo Lists</h2>
            <button 
              className="create-list-button"
              onClick={() => setShowNewListModal(true)}
            >
              <span className="create-list-button-icon">+</span>
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
        </div>
        
        {/* New list modal */}
        {showNewListModal && (
          <div className="modal-overlay">
            <div className="modal-content">
              <div className="modal-header">
                <h2 className="modal-title">Create New List</h2>
              </div>
              <form onSubmit={handleCreateList} className="form-container">
                <input
                  type="text"
                  className="form-input"
                  placeholder="List name"
                  value={newListName}
                  onChange={(e) => setNewListName(e.target.value)}
                  autoFocus
                  required
                />
                <div className="form-actions">
                  <button 
                    type="button" 
                    className="form-cancel-button"
                    onClick={() => {
                      setShowNewListModal(false);
                      setNewListName('');
                    }}
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