import React, { useState, useEffect } from 'react';
import Register from './Register';

const Login = ({ onLogin }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [showRegister, setShowRegister] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Clear messages when switching views
  useEffect(() => {
    setError('');
    setSuccess('');
  }, [showRegister]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setIsLoading(true);
    
    if (!username.trim() || !password.trim()) {
      setError('Username and password are required');
      setIsLoading(false);
      return;
    }

    try {
      console.log("Sending login request...");
      const response = await fetch('/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({ username, password })
      });

      console.log("Login response:", response);
      console.log("Response headers:", response.headers);
      
      const data = await response.json();
      console.log("Login response data:", data);
      
      if (!response.ok) {
        switch (data.code) {
          case 'USER_NOT_FOUND':
            setError(
              <div className="error-content">
                User not found.{' '}
                <button 
                  className="inline-button"
                  onClick={() => setShowRegister(true)}
                >
                  Register
                </button>
              </div>
            );
            break;
          case 'INVALID_PASSWORD':
            setError('Incorrect password. Please try again.');
            break;
          default:
            setError(data.error || 'Login failed');
        }
        setIsLoading(false);
        return;
      }
      
      console.log("After login, cookies:", document.cookie);
      // If login is successful, call onLogin with the user data
      onLogin(data.user);
    } catch (error) {
      console.error('Login error:', error);
      setError('Login failed. Please try again later.');
      setIsLoading(false);
    }
  };

  const handleRegisterSuccess = () => {
    setShowRegister(false);
    setError('');
    setSuccess('Registration successful! Please login.');
    setUsername('');
    setPassword('');
  };

  if (showRegister) {
    return (
      <div className="auth-page">
        <div className="title-container">
          <h1 className="app-title">Task<span>Master</span></h1>
          <p className="app-subtitle">Organize your life, one task at a time</p>
        </div>
        <Register onRegisterSuccess={handleRegisterSuccess} />
      </div>
    );
  }

  return (
    <div className="auth-page">
      <div className="title-container">
        <h1 className="app-title">Task<span>Master</span></h1>
        <p className="app-subtitle">Organize your life, one task at a time</p>
      </div>
      <div className="auth-container">
        <h2>Welcome Back</h2>
        {error && <div className="error-message">{error}</div>}
        {success && <div className="success-message">{success}</div>}
        <form onSubmit={handleSubmit} className="auth-form">
          <div className="form-group">
            <input
              type="text"
              placeholder="Username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
            />
          </div>
          <div className="form-group">
            <input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          <button type="submit" disabled={isLoading}>
            {isLoading ? 'Logging in...' : 'Login'}
          </button>
        </form>
        <p className="auth-switch">
          Don't have an account?{' '}
          <button 
            className="link-button"
            onClick={() => setShowRegister(true)}
          >
            Register
          </button>
        </p>
      </div>
    </div>
  );
};

export default Login; 