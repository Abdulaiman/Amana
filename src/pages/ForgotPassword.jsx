import React, { useState, useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Mail, ArrowLeft, Lock } from 'lucide-react';
import api from '../services/api';
import { useToast } from '../context/ToastContext';
import './Login.css';

const ForgotPassword = () => {
    const [email, setEmail] = useState('');
    const [step, setStep] = useState('email');
    const [digits, setDigits] = useState(['', '', '', '', '', '']);
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const { addToast } = useToast();
    const inputRefs = useRef([]);

    useEffect(() => {
      if (step === 'code' && inputRefs.current[0]) {
        setTimeout(() => inputRefs.current[0]?.focus(), 100);
      }
    }, [step]);

    const handleSendCode = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        try {
            await api.post('/auth/forgot-password', { email });
            setStep('code');
        } catch (err) {
            setError(err.response?.data?.message || 'Something went wrong.');
        } finally {
            setLoading(false);
        }
    };

    const handleDigitChange = (index, value) => {
      if (value && !/^\d$/.test(value)) return;
      const newDigits = [...digits];
      newDigits[index] = value;
      setDigits(newDigits);
      setError('');
      if (value && index < 5) inputRefs.current[index + 1]?.focus();
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
      for (let i = 0; i < pasted.length; i++) newDigits[i] = pasted[i];
      setDigits(newDigits);
    };

    const handleReset = async (e) => {
      e.preventDefault();
      const code = digits.join('');
      if (code.length !== 6) {
        setError('Please enter the 6-digit code');
        return;
      }
      if (!password || password.length < 8) {
        setError('Password must be at least 8 characters');
        return;
      }
      if (!/[a-zA-Z]/.test(password) || !/\d/.test(password)) {
        setError('Password must contain both letters and numbers');
        return;
      }
      if (password !== confirmPassword) {
        setError('Passwords do not match');
        return;
      }

      setLoading(true);
      setError('');
      try {
        await api.post('/auth/reset-password', { email, code, password });
        addToast('Password reset successful! You can now log in.', 'success');
        setStep('done');
      } catch (err) {
        setError(err.response?.data?.message || 'Invalid or expired code');
        setDigits(['', '', '', '', '', '']);
        inputRefs.current[0]?.focus();
      } finally {
        setLoading(false);
      }
    };

    return (
        <div className="login-page">
            <div className="auth-card">
                <Link to="/login" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', color: 'var(--color-text-secondary)', textDecoration: 'none', marginBottom: '1.5rem', fontSize: '0.9rem' }}>
                    <ArrowLeft size={16} /> Back to Login
                </Link>

                {step === 'done' ? (
                  <>
                    <h2 className="auth-title" style={{ textAlign: 'center' }}>Password Reset!</h2>
                    <p style={{ textAlign: 'center', color: '#6B7280', marginTop: 8 }}>
                      Your password has been reset successfully. <Link to="/login" style={{ color: '#0F766E', fontWeight: 600 }}>Log in</Link>
                    </p>
                  </>
                ) : step === 'email' ? (
                  <>
                    <h2 className="auth-title" style={{ fontSize: '1.75rem' }}>Reset Password</h2>
                    <p className="auth-subtitle" style={{ marginBottom: '2rem' }}>Enter your email and we'll send you a 6-digit code.</p>
                    <form onSubmit={handleSendCode}>
                        {error && <div className="error-message">{error}</div>}
                        <div className="form-group">
                            <label className="form-label">Email Address</label>
                            <div style={{ position: 'relative' }}>
                                <Mail size={18} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--color-text-secondary)' }} />
                                <input type="email" className="form-input" style={{ paddingLeft: '2.75rem' }} placeholder="name@example.com" value={email} onChange={(e) => setEmail(e.target.value)} required />
                            </div>
                        </div>
                        <div className="form-actions">
                            <button type="submit" className="btn-auth" disabled={loading}>
                                {loading ? 'Sending Code...' : 'Send Code'}
                            </button>
                        </div>
                    </form>
                  </>
                ) : (
                  <>
                    <h2 className="auth-title" style={{ fontSize: '1.75rem' }}>Enter Code</h2>
                    <p className="auth-subtitle" style={{ marginBottom: '1.5rem' }}>
                      We sent a 6-digit code to <b style={{ color: '#0F766E' }}>{email}</b>
                    </p>
                    <form onSubmit={handleReset}>
                      {error && <div className="error-message">{error}</div>}

                      <div style={{ display: 'flex', gap: 8, justifyContent: 'center', marginBottom: 24 }}>
                        {digits.map((d, i) => (
                          <input
                            key={i}
                            ref={(el) => (inputRefs.current[i] = el)}
                            type="text" inputMode="numeric" maxLength={1}
                            value={d}
                            onChange={(e) => handleDigitChange(i, e.target.value)}
                            onKeyDown={(e) => handleKeyDown(i, e)}
                            onPaste={i === 0 ? handlePaste : undefined}
                            style={{
                              width: 44, height: 52, textAlign: 'center', fontSize: 22, fontWeight: 700,
                              border: `2px solid ${error ? '#EF4444' : d ? '#0F766E' : '#D1D5DB'}`,
                              borderRadius: 10, outline: 'none', color: '#111827', background: '#fff',
                            }}
                          />
                        ))}
                      </div>

                      <div className="form-group">
                        <label className="form-label">New Password</label>
                        <div style={{ position: 'relative' }}>
                          <Lock size={18} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--color-text-secondary)' }} />
                          <input type="password" className="form-input" style={{ paddingLeft: '2.75rem' }} placeholder="At least 8 characters" value={password} onChange={(e) => setPassword(e.target.value)} required />
                        </div>
                      </div>

                      <div className="form-group">
                        <label className="form-label">Confirm Password</label>
                        <div style={{ position: 'relative' }}>
                          <Lock size={18} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--color-text-secondary)' }} />
                          <input type="password" className="form-input" style={{ paddingLeft: '2.75rem' }} placeholder="Re-enter password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} required />
                        </div>
                      </div>

                      <div className="form-actions">
                        <button type="submit" className="btn-auth" disabled={loading}>
                          {loading ? 'Resetting...' : 'Reset Password'}
                        </button>
                      </div>

                      <p style={{ textAlign: 'center', marginTop: 16, fontSize: 14, color: '#6B7280' }}>
                        Didn't get the code?{' '}
                        <button type="button" onClick={() => { setStep('email'); setError(''); }} style={{ background: 'none', border: 'none', color: '#0F766E', cursor: 'pointer', fontWeight: 600, textDecoration: 'underline', fontSize: 14, padding: 0 }}>
                          Send again
                        </button>
                      </p>
                    </form>
                  </>
                )}
            </div>
        </div>
    );
};

export default ForgotPassword;
