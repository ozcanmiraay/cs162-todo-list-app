import React, { useState } from 'react';

/**
 * NewItemForm component that provides a form for adding new todo items
 * or sub-items.
 * 
 * @param {Function} onSubmit - Function to handle form submission with the item description
 * @param {Function} onCancel - Function to handle cancellation of the form
 */
const NewItemForm = ({ onSubmit, onCancel }) => {
  // State for the item description input
  const [description, setDescription] = useState('');

  /**
   * Handle form submission
   * @param {Event} e - Form submission event
   */
  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (description.trim()) {
      onSubmit(description);
      setDescription('');
    }
  };

  return (
    <form className="form-container" onSubmit={handleSubmit}>
      <input
        type="text"
        className="form-input"
        placeholder="Enter item description"
        value={description}
        onChange={(e) => setDescription(e.target.value)}
        autoFocus
      />
      
      <div className="form-actions">
        <button 
          type="button" 
          className="form-cancel-button"
          onClick={onCancel}
        >
          Cancel
        </button>
        
        <button 
          type="submit" 
          className="form-submit-button"
          disabled={!description.trim()}
        >
          Add
        </button>
      </div>
    </form>
  );
};

export default NewItemForm; 