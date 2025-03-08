import React from 'react';

const Header = ({ user, onLogout }) => {
  const handleLogout = async () => {
    try {
      const response = await fetch('/logout', {
        method: 'POST',
        credentials: 'include'
      });
      
      if (response.ok) {
        onLogout();
      } else {
        console.error('Logout failed');
      }
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  return (
    <header className="app-header">
      <div className="app-title">
        <span className="app-title-icon">📋</span>
        <h1>Task<span className="app-title-highlight">Master</span></h1>
      </div>
      <div className="user-controls">
        <div className="username-display">
          Welcome, <span className="username-highlight">{user.username}</span>
        </div>
        <button onClick={handleLogout} className="logout-button">
          Logout
        </button>
      </div>
    </header>
  );
};

export default Header; 