import React, { useState, useEffect } from 'react';
import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import Login from './components/Auth/Login';
import Dashboard from './components/Dashboard/Dashboard';
import './styles/Reset.css';
import './styles/Auth.css';
import './styles/Dashboard.css';
import './styles/TodoList.css';
import './styles/Responsive.css';

/**
 * Main App component that handles authentication state and renders either
 * the Login screen or the Dashboard based on authentication status.
 * 
 * Uses React DnD for drag and drop functionality in the todo lists.
 */
function App() {
  // Authentication and user state
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  /**
   * Checks if the user has an active session on component mount
   * by making a request to the backend's /check-session endpoint.
   */
  const checkSession = async () => {
    try {
      console.log("Checking session, current cookies:", document.cookie);
      const response = await fetch('/check-session', {
        method: 'GET',
        credentials: 'include', // Important for sending cookies with the request
      });
      
      if (response.ok) {
        const data = await response.json();
        if (data.authenticated) {
          setIsLoggedIn(true);
          setUser(data.user);
        } else {
          setIsLoggedIn(false);
          setUser(null);
        }
      } else {
        setIsLoggedIn(false);
        setUser(null);
      }
    } catch (error) {
      console.error('Session check error:', error);
      setIsLoggedIn(false);
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  };

  // Check for an existing session when the component mounts
  useEffect(() => {
    checkSession();
  }, []);

  /**
   * Handles successful login by updating state with user data
   * @param {Object} userData - User information returned from the server
   */
  const handleLogin = (userData) => {
    setIsLoggedIn(true);
    setUser(userData);
  };

  /**
   * Handles user logout by clearing authentication state
   */
  const handleLogout = () => {
    setIsLoggedIn(false);
    setUser(null);
  };

  // Show loading indicator while checking session
  if (isLoading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="app">
      {isLoggedIn && user ? (
        // Wrap Dashboard in DndProvider to enable drag and drop functionality
        <DndProvider backend={HTML5Backend}>
          <Dashboard onLogout={handleLogout} user={user} />
        </DndProvider>
      ) : (
        <Login onLogin={handleLogin} />
      )}
    </div>
  );
}

export default App;
