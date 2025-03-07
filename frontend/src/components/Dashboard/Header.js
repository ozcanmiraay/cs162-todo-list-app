import React from 'react';

const Header = ({ onLogout, username }) => {
  return (
    <header className="dashboard-header">
      <h1>Todo Dashboard</h1>
      <div className="header-actions">
        <span className="username">Welcome, {username}!</span>
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