import React, { useState } from 'react';

const NewItemForm = ({ listId, onItemAdded, parentId = null, onCancel }) => {
  const [description, setDescription] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    
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
        }),
      });

      if (response.ok) {
        setDescription('');
        onItemAdded();
      } else {
        const errorData = await response.json();
        setError(errorData.error || 'Failed to add item');
        console.error('Error adding item:', errorData);
      }
    } catch (error) {
      setError('Network error. Please try again.');
      console.error('Error adding item:', error);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="new-item-form">
      {error && <div className="error-message">{error}</div>}
      <input
        type="text"
        value={description}
        onChange={(e) => setDescription(e.target.value)}
        placeholder="Enter item description"
        required
      />
      <button type="submit">Add</button>
      {onCancel && <button type="button" onClick={onCancel}>Cancel</button>}
    </form>
  );
};

export default NewItemForm; 