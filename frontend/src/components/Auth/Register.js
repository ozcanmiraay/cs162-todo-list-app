import React, { useState } from 'react';

const Register = ({ onRegisterSuccess }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess(false);
    setIsLoading(true);

    // Client-side validations
    if (!username.trim() || !password.trim()) {
      setError('Username and password are required');
      setIsLoading(false);
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      setIsLoading(false);
      return;
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters long');
      setIsLoading(false);
      return;
    }

    try {
      const response = await fetch('/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        credentials: 'include',
        mode: 'cors',
        body: JSON.stringify({ username, password })
      });

      const data = await response.json();
      
      if (!response.ok) {
        switch (response.status) {
          case 409: // Conflict - User exists
            setError(
              <div>
                Username already exists.{' '}
                <button 
                  className="inline-button" 
                  onClick={() => onRegisterSuccess()}
                >
                  Back to Login
                </button>
              </div>
            );
            break;
          case 400: // Bad request - Validation error
            setError(data.error || 'Invalid registration data');
            break;
          default:
            throw new Error(data.error || `Registration failed (${response.status})`);
        }
        setIsLoading(false);
        return;
      }

      // Show success message instead of redirecting
      setSuccess(true);
      setUsername('');
      setPassword('');
      setConfirmPassword('');
    } catch (error) {
      console.error('Registration error:', error);
      setError('Registration failed. Please try again later.');
      setIsLoading(false);
    }
  };

  if (success) {
    return (
      <div className="auth-container">
        <h2 className="success-title">Registration Successful!</h2>
        <div className="registration-success">
          <div className="success-message">
            Your account has been created successfully!
          </div>
          <button 
            className="proceed-button"
            onClick={() => onRegisterSuccess()}
          >
            Proceed to Login
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="auth-container">
      <h2>Create Account</h2>
      {error && <div className="error-message">{error}</div>}
      <form onSubmit={handleSubmit} className="auth-form">
        <div className="form-group">
          <input
            type="text"
            placeholder="Username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
            minLength={3}
            maxLength={50}
          />
        </div>
        <div className="form-group">
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            minLength={6}
          />
        </div>
        <div className="form-group">
          <input
            type="password"
            placeholder="Confirm Password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            required
          />
        </div>
        <button type="submit" disabled={isLoading}>
          {isLoading ? 'Creating Account...' : 'Register'}
        </button>
      </form>
      <p className="auth-switch">
        Already have an account?{' '}
        <button 
          className="link-button" 
          onClick={() => onRegisterSuccess()}
        >
          Back to Login
        </button>
      </p>
    </div>
  );
};

export default Register; 