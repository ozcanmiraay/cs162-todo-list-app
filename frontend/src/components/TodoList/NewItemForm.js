import React, { useState } from 'react';

const NewItemForm = ({ onSubmit, onCancel }) => {
  const [description, setDescription] = useState('');

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