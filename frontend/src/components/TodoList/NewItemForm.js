import React, { useState } from 'react';

const NewItemForm = ({ listId, onItemAdded, parentId = null, onCancel }) => {
  const [description, setDescription] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch(`http://localhost:5000/list/${listId}/item/new`, {
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
        if (onCancel) onCancel();
      }
    } catch (error) {
      console.error('Error adding item:', error);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="new-item-form">
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