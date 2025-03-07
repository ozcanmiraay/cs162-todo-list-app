import React from 'react';
import Header from './Header';
import TodoDashboard from './TodoDashboard';

const Dashboard = ({ onLogout, user }) => {
  return (
    <div className="dashboard-container">
      <Header onLogout={onLogout} username={user?.username} />
      <TodoDashboard />
    </div>
  );
};

export default Dashboard; 