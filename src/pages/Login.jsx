import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import './Login.css';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  
  const { login } = useAuth();
  const navigate = useNavigate();
  const { addToast } = useToast();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const user = await login(email, password);
      addToast('Welcome back!', 'success');
      if (user.role === 'vendor') navigate('/vendor');
      else if (user.role === 'admin') navigate('/admin');
      else navigate('/dashboard'); // Retailer
    } catch (err) {
      addToast(err?.message || 'Invalid credentials', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-page">
      <div className="auth-card">
        <div className="auth-header">
            <img src="/logo.png" alt="Amana" className="auth-logo" style={{ width: '48px', height: '48px', marginBottom: '1rem' }} />
            <h2 className="auth-title">Welcome Back</h2>
            <p className="auth-subtitle">Sign in to your Amana account</p>
        </div>
        

        
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">Email Address</label>
            <input 
              type="email" 
              className="form-input"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          
          <div className="form-group">
            <div className="form-label-row">
                <label className="form-label" style={{ marginBottom: 0 }}>Password</label>
                <Link to="/forgot-password" className="forgot-password-link">Forgot Password?</Link>
            </div>
            <input 
              type="password" 
              className="form-input"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          <div className="form-actions">
            <button type="submit" className="btn-auth" disabled={loading}>
                {loading ? 'Logging in...' : 'Login'}
            </button>
          </div>
        </form>
        
        <p className="auth-footer">
          Don't have an account? <Link to="/register" className="link-primary">Sign Up</Link>
        </p>
      </div>
    </div>
  );
};

export default Login;
