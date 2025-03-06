import React from 'react';
import Header from './Header';

const Dashboard = ({ onLogout }) => {
  return (
    <div className="dashboard-container">
      <Header onLogout={onLogout} />
      <div className="dashboard-content">
        {/* Your todo lists will go here */}
        <p>Welcome to your Todo Dashboard!</p>
      </div>
    </div>
  );
};

export default Dashboard; 