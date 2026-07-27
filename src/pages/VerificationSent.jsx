import React, { useState, useEffect, useRef } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import api from '../services/api';
import { useToast } from '../context/ToastContext';
import './Login.css';

const VerificationSent = () => {
  const [searchParams] = useSearchParams();
  const email = searchParams.get('email') || '';
  const [digits, setDigits] = useState(['', '', '', '', '', '']);
  const [verifying, setVerifying] = useState(false);
  const [resending, setResending] = useState(false);
  const [cancelling, setCancelling] = useState(false);
  const [countdown, setCountdown] = useState(0);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const { addToast } = useToast();
  const navigate = useNavigate();
  const inputRefs = useRef([]);

  useEffect(() => {
    if (countdown > 0) {
      const t = setInterval(() => setCountdown(c => c - 1), 1000);
      return () => clearInterval(t);
    }
  }, [countdown]);

  useEffect(() => {
    if (inputRefs.current[0]) inputRefs.current[0].focus();
  }, []);

  const handleDigitChange = (index, value) => {
    if (value && !/^\d$/.test(value)) return;
    const newDigits = [...digits];
    newDigits[index] = value;
    setDigits(newDigits);
    setError('');

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
    setError('');
    try {
      await api.post('/auth/verify-code', { email, code });
      setSuccess(true);
      addToast('Email verified! You can now log in.', 'success');
      setTimeout(() => navigate('/login'), 2000);
    } catch (err) {
      setError(err.response?.data?.message || 'Invalid code. Please try again.');
      setDigits(['', '', '', '', '', '']);
      inputRefs.current[0]?.focus();
    } finally {
      setVerifying(false);
    }
  };

  const handleResend = async () => {
    setResending(true);
    try {
      await api.post('/auth/resend-verification', { email });
      addToast('Verification code sent!', 'success');
      setCountdown(60);
      setDigits(['', '', '', '', '', '']);
      setError('');
      inputRefs.current[0]?.focus();
    } catch (err) {
      addToast(err.response?.data?.message || 'Failed to resend', 'error');
    } finally {
      setResending(false);
    }
  };

  const handleWrongEmail = async () => {
    setCancelling(true);
    try {
      await api.post('/auth/cancel-registration', { email });
      addToast('Registration cancelled. You can sign up again with the correct email.', 'info');
      navigate('/register');
    } catch (err) {
      addToast(err.response?.data?.message || 'Failed to cancel registration', 'error');
    } finally {
      setCancelling(false);
    }
  };

  if (success) {
    return (
      <div className="login-page">
        <div className="auth-card" style={{ textAlign: 'center' }}>
          <div style={{ fontSize: 48, marginBottom: 16, color: '#10B981' }}>✓</div>
          <h2>Email Verified!</h2>
          <p style={{ color: '#6B7280' }}>Redirecting to login...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="login-page">
      <div className="auth-card" style={{ textAlign: 'center' }}>
        <div style={{ fontSize: 48, marginBottom: 16 }}>✉️</div>
        <h2>Check Your Email</h2>
        <p style={{ color: '#6B7280', marginBottom: 8 }}>We sent a verification code to</p>
        <p style={{ fontWeight: 600, fontSize: 16, color: '#0F766E' }}>{email || 'your email'}</p>
        <p style={{ color: '#6B7280', fontSize: 14, marginTop: 16, marginBottom: 24 }}>
          Enter the 6-digit code to activate your account.
        </p>

        <div style={{ display: 'flex', gap: 8, justifyContent: 'center', marginBottom: 16 }}>
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
                width: 48,
                height: 56,
                textAlign: 'center',
                fontSize: 24,
                fontWeight: 700,
                border: `2px solid ${error ? '#EF4444' : digits[i] ? '#0F766E' : '#D1D5DB'}`,
                borderRadius: 10,
                outline: 'none',
                transition: 'border-color 0.15s',
                color: '#111827',
                background: '#fff',
              }}
            />
          ))}
        </div>

        {error && (
          <p style={{ color: '#EF4444', fontSize: 14, fontWeight: 500, marginBottom: 8 }}>{error}</p>
        )}

        <div style={{ display: 'flex', gap: 12, justifyContent: 'center', marginTop: 8 }}>
          <button
            onClick={handleResend}
            disabled={resending || countdown > 0}
            className="btn-auth"
            style={{ opacity: resending || countdown > 0 ? 0.6 : 1, padding: '10px 24px', fontSize: 14, flex: 1 }}
          >
            {resending ? 'Sending...' : countdown > 0 ? `Resend in ${countdown}s` : 'Resend Code'}
          </button>
        </div>

        <p style={{ marginTop: 20, fontSize: 14, color: '#6B7280' }}>
          Wrong email?{' '}
          <button
            onClick={handleWrongEmail}
            disabled={cancelling}
            style={{ background: 'none', border: 'none', color: '#0F766E', cursor: 'pointer', fontSize: 14, fontWeight: 600, textDecoration: 'underline', padding: 0 }}
          >
            {cancelling ? 'Cancelling...' : 'Cancel & try again'}
          </button>
        </p>
      </div>
    </div>
  );
};

export default VerificationSent;
