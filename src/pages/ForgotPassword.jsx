import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Mail, ArrowLeft, Loader2, CheckCircle } from 'lucide-react';
import api from '../services/api';
import './Login.css';

const ForgotPassword = () => {
    const [email, setEmail] = useState('');
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);
    const [error, setError] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        setSuccess(false);

        try {
            await api.post('/auth/forgot-password', { email });
            setSuccess(true);
        } catch (err) {
            setError(err.response?.data?.message || 'Something went wrong. Please check your email.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="login-page">
            <div className="auth-card">
                <Link to="/login" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', color: 'var(--color-text-muted)', textDecoration: 'none', marginBottom: '1.5rem', fontSize: '0.9rem' }}>
                    <ArrowLeft size={16} /> Back to Login
                </Link>
                
                <h2 className="auth-title" style={{ fontSize: '1.75rem' }}>Reset Password</h2>
                <p className="auth-subtitle" style={{ marginBottom: '2rem' }}>Enter your email address and we'll send you a link to reset your password.</p>

                {success ? (
                    <div className="success-message">
                        <CheckCircle className="success-icon" size={24} />
                        <div>
                            <span className="success-title">Check your email</span>
                            <p className="success-text">
                                We've sent a password reset link to <b>{email}</b>.
                            </p>
                        </div>
                    </div>
                ) : (
                    <form onSubmit={handleSubmit}>
                        {error && <div className="error-message">{error}</div>}

                        <div className="form-group">
                            <label className="form-label">Email Address</label>
                            <div style={{ position: 'relative' }}>
                                <Mail size={18} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--color-text-muted)' }} />
                                <input 
                                    type="email" 
                                    className="form-input" 
                                    style={{ paddingLeft: '2.75rem' }}
                                    placeholder="name@example.com"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    required
                                />
                            </div>
                        </div>

                        <div className="form-actions">
                            <button type="submit" className="btn-auth" disabled={loading}>
                                {loading && <Loader2 className="spin" size={18} style={{ display: 'inline', marginRight: '8px', verticalAlign: 'middle' }} />}
                                {loading ? 'Sending Link...' : 'Send Reset Link'}
                            </button>
                        </div>
                    </form>
                )}
            </div>
        </div>
    );
};

export default ForgotPassword;
