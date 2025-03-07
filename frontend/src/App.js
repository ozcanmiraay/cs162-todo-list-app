import React, { useState, useEffect } from 'react';
import Login from './components/Auth/Login';
import Dashboard from './components/Dashboard/Dashboard';
import './styles/Auth.css';
import './styles/Dashboard.css';

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  const checkSession = async () => {
    try {
      console.log("Checking session, current cookies:", document.cookie);
      const response = await fetch('/check-session', {
        method: 'GET',
        credentials: 'include',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        }
      });

      console.log("Session check response:", response);

      if (response.ok) {
        const data = await response.json();
        console.log('Session check successful:', data);
        setUser(data.user);
        setIsLoggedIn(true);
      } else {
        console.log('Session check failed:', response.status);
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

  useEffect(() => {
    checkSession();
  }, []);

  const handleLogin = async (userData) => {
    console.log('Login successful, setting user data:', userData);
    setUser(userData);
    setIsLoggedIn(true);
    // Check session immediately after login
    await checkSession();
  };

  const handleLogout = async () => {
    try {
      const response = await fetch('/logout', {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        setUser(null);
        setIsLoggedIn(false);
      } else {
        console.error('Logout failed');
      }
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  if (isLoading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="app">
      {isLoggedIn && user ? (
        <Dashboard onLogout={handleLogout} user={user} />
      ) : (
        <Login onLogin={handleLogin} />
      )}
    </div>
  );
}

export default App;
