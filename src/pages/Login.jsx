import React, { useState, useRef, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import api from '../services/api';
import './Login.css';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [unverifiedEmail, setUnverifiedEmail] = useState(null);
  const [resending, setResending] = useState(false);
  const [digits, setDigits] = useState(['', '', '', '', '', '']);
  const [verifying, setVerifying] = useState(false);
  const [verifyError, setVerifyError] = useState('');
  const [verifySuccess, setVerifySuccess] = useState(false);
  const inputRefs = useRef([]);

  const { login } = useAuth();
  const navigate = useNavigate();
  const { addToast } = useToast();

  useEffect(() => {
    if (unverifiedEmail && inputRefs.current[0]) {
      inputRefs.current[0].focus();
    }
  }, [unverifiedEmail]);

  const handleDigitChange = (index, value) => {
    if (value && !/^\d$/.test(value)) return;
    const newDigits = [...digits];
    newDigits[index] = value;
    setDigits(newDigits);
    setVerifyError('');
    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
    const fullCode = newDigits.join('');
    if (fullCode.length === 6) {
      handleVerify(fullCode);
    }
  };

  const handleKeyDown = (index, e) => {
    if (e.key === 'Backspace' && !digits[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handlePaste = (e) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);
    if (!pasted) return;
    const newDigits = [...digits];
    for (let i = 0; i < pasted.length; i++) {
      newDigits[i] = pasted[i];
    }
    setDigits(newDigits);
    if (pasted.length === 6) {
      handleVerify(pasted);
    }
  };

  const handleVerify = async (code) => {
    if (verifying) return;
    setVerifying(true);
    setVerifyError('');
    try {
      await api.post('/auth/verify-code', { email: unverifiedEmail, code });
      setVerifySuccess(true);
      addToast('Email verified! You can now log in.', 'success');
      setTimeout(() => {
        setUnverifiedEmail(null);
        setVerifySuccess(false);
        setDigits(['', '', '', '', '', '']);
      }, 2000);
    } catch (err) {
      setVerifyError(err.response?.data?.message || 'Invalid code. Try again.');
      setDigits(['', '', '', '', '', '']);
      inputRefs.current[0]?.focus();
    } finally {
      setVerifying(false);
    }
  };

  const handleResend = async () => {
    setResending(true);
    try {
      await api.post('/auth/resend-verification', { email: unverifiedEmail });
      addToast('Verification code sent!', 'success');
      setDigits(['', '', '', '', '', '']);
      setVerifyError('');
      inputRefs.current[0]?.focus();
    } catch (err) {
      addToast(err.response?.data?.message || 'Failed to resend', 'error');
    } finally {
      setResending(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setUnverifiedEmail(null);
    try {
      const user = await login(email, password);
      addToast('Welcome back!', 'success');
      if (user.role === 'vendor') navigate('/vendor');
      else if (user.role === 'admin') navigate('/admin');
      else navigate('/dashboard');
    } catch (err) {
      if (err?.includes?.('verify your email')) {
        setUnverifiedEmail(email);
      } else {
        addToast(err || 'Invalid credentials', 'error');
      }
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
            <label className="form-label">Email or Phone Number</label>
            <input 
              type="text" 
              className="form-input"
              placeholder="name@example.com or 08012345678"
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
            <div className="password-input-wrapper">
              <input 
                type={showPassword ? 'text' : 'password'}
                className="form-input"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
              <button
                type="button"
                className="password-toggle-btn"
                onClick={() => setShowPassword((p) => !p)}
                tabIndex={-1}
              >
                {showPassword ? '🙈' : '👁️'}
              </button>
            </div>
          </div>

          {unverifiedEmail && (
            <div style={{ background: '#FEF3C7', border: '1px solid #F59E0B', borderRadius: 10, padding: '16px 20px', marginBottom: 12 }}>
              {verifySuccess ? (
                <p style={{ color: '#065F46', fontWeight: 600, fontSize: 15, textAlign: 'center' }}>
                  ✓ Email verified! You can now log in.
                </p>
              ) : (
                <>
                  <p style={{ color: '#92400E', fontSize: 14, fontWeight: 600, marginBottom: 4 }}>
                    Verify your email
                  </p>
                  <p style={{ color: '#92400E', fontSize: 13, marginBottom: 16 }}>
                    Enter the 6-digit code sent to <strong>{unverifiedEmail}</strong>
                  </p>

                  <div style={{ display: 'flex', gap: 8, justifyContent: 'center', marginBottom: 12 }}>
                    {digits.map((d, i) => (
                      <input
                        key={i}
                        ref={(el) => (inputRefs.current[i] = el)}
                        type="text"
                        inputMode="numeric"
                        maxLength={1}
                        value={d}
                        onChange={(e) => handleDigitChange(i, e.target.value)}
                        onKeyDown={(e) => handleKeyDown(i, e)}
                        onPaste={i === 0 ? handlePaste : undefined}
                        style={{
                          width: 44,
                          height: 50,
                          textAlign: 'center',
                          fontSize: 22,
                          fontWeight: 700,
                          border: `2px solid ${verifyError ? '#EF4444' : digits[i] ? '#0F766E' : '#D1D5DB'}`,
                          borderRadius: 8,
                          outline: 'none',
                          color: '#111827',
                          background: '#fff',
                        }}
                      />
                    ))}
                  </div>

                  {verifyError && (
                    <p style={{ color: '#EF4444', fontSize: 13, fontWeight: 500, textAlign: 'center', marginBottom: 8 }}>{verifyError}</p>
                  )}

                  <div style={{ display: 'flex', gap: 10, justifyContent: 'center' }}>
                    <button
                      type="button"
                      onClick={handleResend}
                      disabled={resending}
                      style={{ background: 'transparent', color: '#92400E', border: '1px solid #F59E0B', padding: '7px 16px', borderRadius: 6, cursor: 'pointer', fontSize: 13, fontWeight: 600 }}
                    >
                      {resending ? 'Sending...' : 'Resend Code'}
                    </button>
                    <button
                      type="button"
                      onClick={() => { setUnverifiedEmail(null); setDigits(['', '', '', '', '', '']); setVerifyError(''); }}
                      style={{ background: 'transparent', color: '#92400E', border: '1px solid #D1D5DB', padding: '7px 16px', borderRadius: 6, cursor: 'pointer', fontSize: 13, fontWeight: 600 }}
                    >
                      Cancel
                    </button>
                  </div>
                </>
              )}
            </div>
          )}
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
