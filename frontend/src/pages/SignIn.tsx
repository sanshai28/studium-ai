import React, { useState, useCallback } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { getErrorMessage } from '../utils/errorHandler';
import '../styles/Auth.css';

const SignIn: React.FC = () => {
  const navigate = useNavigate();
  const { signin } = useAuth();

  // State
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      setError(null);
      setIsLoading(true);

      try {
        await signin(email, password);
        navigate('/notebooks');
      } catch (err) {
        setError(getErrorMessage(err, 'Failed to sign in. Please try again.'));
      } finally {
        setIsLoading(false);
      }
    },
    [email, password, signin, navigate]
  );

  return (
    <div className="auth-container">
      <div className="auth-card">
        <h1>Sign in</h1>
        <p className="auth-subtitle">to continue to Studium AI</p>

        {error && <div className="error-message">{error}</div>}

        <form onSubmit={handleSubmit} className="auth-form">
          <div className="form-group">
            <label htmlFor="email">Email</label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your email"
              required
              disabled={isLoading}
            />
          </div>

          <div className="form-group">
            <label htmlFor="password">Password</label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter your password"
              required
              disabled={isLoading}
            />
          </div>

          <p className="auth-link" style={{ margin: '0', textAlign: 'right', marginTop: '-8px' }}>
            <Link to="/request-password-reset">Forgot password?</Link>
          </p>

          <button type="submit" className="auth-button" disabled={isLoading}>
            {isLoading ? 'Signing in...' : 'Sign in'}
          </button>
        </form>

        <p className="auth-link">
          Don't have an account? <Link to="/signup">Create account</Link>
        </p>
      </div>
    </div>
  );
};

export default SignIn;
