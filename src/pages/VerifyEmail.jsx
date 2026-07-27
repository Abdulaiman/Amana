import React, { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import api from '../services/api';
import './Login.css';

const VerifyEmail = () => {
  const { token } = useParams();
  const navigate = useNavigate();
  const [status, setStatus] = useState('loading');

  useEffect(() => {
    const verify = async () => {
      try {
        await api.get(`/auth/verify-email/${token}`);
        setStatus('success');
        setTimeout(() => navigate('/login'), 4000);
      } catch {
        setStatus('error');
      }
    };
    if (token) verify();
  }, [token, navigate]);

  if (status === 'loading') {
    return (
      <div className="login-page">
        <div className="auth-card" style={{ textAlign: 'center' }}>
          <h2>Verifying your email...</h2>
        </div>
      </div>
    );
  }

  return (
    <div className="login-page">
      <div className="auth-card" style={{ textAlign: 'center' }}>
        {status === 'success' ? (
          <>
            <div style={{ fontSize: 48, marginBottom: 16, color: '#10B981' }}>✓</div>
            <h2>Email Verified!</h2>
            <p style={{ color: '#6B7280' }}>Your email has been successfully verified. Redirecting to login...</p>
            <Link to="/login" style={{ display: 'inline-block', marginTop: 16, color: '#0F766E' }}>
              Go to Login
            </Link>
          </>
        ) : (
          <>
            <div style={{ fontSize: 48, marginBottom: 16, color: '#EF4444' }}>✕</div>
            <h2>Invalid or Expired Link</h2>
            <p style={{ color: '#6B7280' }}>This verification link is invalid or has expired.</p>
            <Link to="/login" style={{ display: 'inline-block', marginTop: 16, color: '#0F766E' }}>
              Back to Login
            </Link>
          </>
        )}
      </div>
    </div>
  );
};

export default VerifyEmail;
