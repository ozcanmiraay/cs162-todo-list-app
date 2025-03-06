import React from 'react';

const Header = ({ onLogout }) => {
  return (
    <header className="dashboard-header">
      <h1>Todo Dashboard</h1>
      <div className="header-actions">
        <button 
          className="header-button"
          onClick={onLogout}
        >
          Logout
        </button>
      </div>
    </header>
  );
};

export default Header; 