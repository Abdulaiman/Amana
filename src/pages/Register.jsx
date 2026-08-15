import React, { useState, useCallback, useRef } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import api from '../services/api';
import { termsData } from './TermsAndConditions';
import './Login.css';

const getPasswordStrength = (pw) => {
  if (!pw) return null;
  const hasLetter = /[a-zA-Z]/.test(pw);
  const hasNumber = /\d/.test(pw);
  if (pw.length < 8 || !hasLetter || !hasNumber) return 'weak';
  return 'strong';
};

const Register = () => {
    const { search } = useLocation();
    const queryParams = new URLSearchParams(search);
    const initialRole = queryParams.get('role') || 'retailer';

    const { user, registerRetailer, registerVendor } = useAuth();
    const [role, setRole] = useState(initialRole);
    const [formData, setFormData] = useState({
        name: user?.name || '', 
        email: user?.email || '', 
        password: '', 
        phone: user?.phone || '',
        businessName: '', 
        address: '', 
        description: '', 
        phones: [user?.phone || '', '']
    });
    const [confirmPassword, setConfirmPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [loading, setLoading] = useState(false);

    const [emailTaken, setEmailTaken] = useState(false);
    const [phoneTaken, setPhoneTaken] = useState(false);
    const [emailChecking, setEmailChecking] = useState(false);
    const [phoneChecking, setPhoneChecking] = useState(false);
    const [acceptedTerms, setAcceptedTerms] = useState(false);
    const [showTermsModal, setShowTermsModal] = useState(false);

    const navigate = useNavigate();
    const { addToast } = useToast();
    const emailTimer = useRef(null);
    const phoneTimer = useRef(null);

    const checkUniqueness = useCallback(async (fields) => {
      try {
        const { data } = await api.post('/auth/check-uniqueness', fields);
        if (data.emailTaken !== undefined) setEmailTaken(data.emailTaken);
        if (data.phoneTaken !== undefined) setPhoneTaken(data.phoneTaken);
      } catch {
        // silently fail
      }
    }, []);

    const handleEmailBlur = () => {
      if (!formData.email) return;
      setEmailChecking(true);
      clearTimeout(emailTimer.current);
      emailTimer.current = setTimeout(async () => {
        await checkUniqueness({ email: formData.email });
        setEmailChecking(false);
      }, 400);
    };

    const handlePhoneBlur = () => {
      if (!formData.phone) return;
      setPhoneChecking(true);
      clearTimeout(phoneTimer.current);
      phoneTimer.current = setTimeout(async () => {
        await checkUniqueness({ phone: formData.phone });
        setPhoneChecking(false);
      }, 400);
    };

    const strength = getPasswordStrength(formData.password);
    const passwordsMatch = formData.password === confirmPassword;

    const handleChange = (e) => {
        if (e.target.name.startsWith('phone_')) {
            const index = parseInt(e.target.name.split('_')[1]);
            const newPhones = [...formData.phones];
            newPhones[index] = e.target.value;
            setFormData({ ...formData, phones: newPhones });
        } else {
            setFormData({ ...formData, [e.target.name]: e.target.value });
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (formData.password && formData.password.length < 8) {
          addToast('Password must be at least 8 characters', 'error');
          return;
        }
        if (formData.password && !/[a-zA-Z]/.test(formData.password)) {
          addToast('Password must contain at least one letter', 'error');
          return;
        }
        if (formData.password && !/\d/.test(formData.password)) {
          addToast('Password must contain at least one number', 'error');
          return;
        }
        if (formData.password && confirmPassword !== formData.password) {
          addToast('Passwords do not match', 'error');
          return;
        }
        if (strength === 'weak') {
          addToast('Password must be at least 8 characters and contain both letters and numbers', 'error');
          return;
        }
        if (emailTaken) {
          addToast('This email is already registered. Please log in instead.', 'error');
          return;
        }
        if (phoneTaken) {
          addToast('This phone number is already registered. Please log in instead.', 'error');
          return;
        }

        if (!acceptedTerms) {
          addToast('Please read and agree to the Terms & Conditions to proceed.', 'error');
          setShowTermsModal(true);
          return;
        }

        setLoading(true);

        try {
            if (role === 'retailer') {
                await registerRetailer({
                    name: formData.name, email: formData.email,
                    password: formData.password, phone: formData.phone
                });
                addToast('Account created! Check your email to verify.', 'success');
                navigate('/verify-email-sent?email=' + encodeURIComponent(formData.email));
            } else {
                await registerVendor({
                    businessName: formData.businessName, email: formData.email,
                    password: formData.password, phones: formData.phones,
                    address: formData.address, description: formData.description
                });
                addToast('Account created! Check your email to verify.', 'success');
                navigate('/verify-email-sent?email=' + encodeURIComponent(formData.email));
            }
        } catch (err) {
            addToast(err || 'Registration failed', 'error');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="login-page">
            <div className="auth-card" style={{ maxWidth: '500px' }}>
                <div className="auth-header">
                    <img src="/logo.png" alt="Amana" className="auth-logo" style={{ width: '48px', height: '48px', marginBottom: '1rem' }} />
                    <h2 className="auth-title">Create Account</h2>
                    <p className="auth-subtitle">Join Amana today</p>
                </div>
                
                <div className="role-switcher">
                    <button 
                        className={`role-btn ${role === 'retailer' ? 'active' : ''}`}
                        onClick={() => setRole('retailer')}
                        type="button"
                    >
                        Retailer
                    </button>
                    <button 
                         className={`role-btn ${role === 'vendor' ? 'active' : ''}`}
                         onClick={() => setRole('vendor')}
                         type="button"
                    >
                        Vendor
                    </button>
                </div>

                <form onSubmit={handleSubmit}>
                    {role === 'retailer' ? (
                        <>
                            <div className="form-group">
                                <label className="form-label">Full Name</label>
                                <input name="name" type="text" className="form-input" onChange={handleChange} required />
                            </div>
                            <div className="form-group">
                                <label className="form-label">Phone Number</label>
                                <input name="phone" type="tel" className="form-input" onChange={handleChange} onBlur={handlePhoneBlur} required />
                                {phoneChecking && <div className="uniqueness-message checking">Checking...</div>}
                                {phoneTaken && !phoneChecking && (
                                  <div className="uniqueness-message taken">
                                    This phone is already registered. <Link to="/login">Log in instead</Link>
                                  </div>
                                )}
                            </div>
                        </>
                    ) : (
                         <>
                            <div className="form-group">
                                <label className="form-label">Business Name</label>
                                <input name="businessName" type="text" className="form-input" onChange={handleChange} required />
                            </div>
                            <div className="grid-cols-2">
                                <div>
                                    <label className="form-label">Phone 1</label>
                                    <input name="phone_0" type="tel" className="form-input" onChange={handleChange} onBlur={handlePhoneBlur} required />
                                </div>
                                <div>
                                    <label className="form-label">Phone 2</label>
                                    <input name="phone_1" type="tel" className="form-input" onChange={handleChange} />
                                </div>
                            </div>
                            {phoneChecking && <div className="uniqueness-message checking">Checking...</div>}
                            {phoneTaken && !phoneChecking && (
                              <div className="uniqueness-message taken" style={{ marginBottom: 'var(--space-5)' }}>
                                This phone is already registered. <Link to="/login">Log in instead</Link>
                              </div>
                            )}
                            <div className="form-group">
                                <label className="form-label">Address</label>
                                <input name="address" type="text" className="form-input" onChange={handleChange} required />
                            </div>
                         </>
                    )}

                    {!user && (
                        <>
                            <div className="form-group">
                                <label className="form-label">Email Address</label>
                                <input name="email" type="email" className="form-input" value={formData.email} onChange={handleChange} onBlur={handleEmailBlur} required />
                                {emailChecking && <div className="uniqueness-message checking">Checking...</div>}
                                {emailTaken && !emailChecking && (
                                  <div className="uniqueness-message taken">
                                    This email is already registered. <Link to="/login">Log in instead</Link>
                                  </div>
                                )}
                            </div>
                            <div className="form-group">
                                <label className="form-label">Password</label>
                                <div className="password-input-wrapper">
                                  <input
                                    name="password"
                                    type={showPassword ? 'text' : 'password'}
                                    className="form-input"
                                    onChange={handleChange}
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
                                {strength && (
                                  <div className="password-strength">
                                    <div className="strength-bars">
                                      <div className={`strength-bar active ${strength}`} />
                                      <div className={`strength-bar ${strength === 'strong' ? 'active strong' : ''}`} />
                                    </div>
                                    <span className={`strength-label ${strength}`}>
                                    {strength === 'weak' && 'At least 8 characters with letters and numbers'}
                                    {strength === 'strong' && 'Strong password'}
                                    </span>
                                  </div>
                                )}
                            </div>
                            <div className="form-group">
                                <label className="form-label">Confirm Password</label>
                                <div className="password-input-wrapper">
                                  <input
                                    type={showConfirmPassword ? 'text' : 'password'}
                                    className="form-input"
                                    value={confirmPassword}
                                    onChange={(e) => setConfirmPassword(e.target.value)}
                                    required
                                  />
                                  <button
                                    type="button"
                                    className="password-toggle-btn"
                                    onClick={() => setShowConfirmPassword((p) => !p)}
                                    tabIndex={-1}
                                  >
                                    {showConfirmPassword ? '🙈' : '👁️'}
                                  </button>
                                </div>
                                {confirmPassword && !passwordsMatch && (
                                  <span style={{ fontSize: 'var(--text-xs)', color: 'var(--color-danger)', fontWeight: 'var(--font-weight-medium)', marginTop: 4, display: 'block' }}>
                                    Passwords do not match
                                  </span>
                                )}
                            </div>
                        </>
                    )}
                    {user && (
                        <p style={{ fontSize: '0.85rem', color: 'var(--color-text-secondary)', marginBottom: '1.5rem', background: 'rgba(255,255,255,0.05)', padding: '12px', borderRadius: '12px', textAlign: 'center' }}>
                            We'll use your existing <b>{user.email}</b> login for your {role} profile.
                        </p>
                    )}

                    <div className="terms-checkbox-row">
                      <input
                        type="checkbox"
                        id="acceptTermsWeb"
                        checked={acceptedTerms}
                        onChange={(e) => setAcceptedTerms(e.target.checked)}
                      />
                      <label htmlFor="acceptTermsWeb" className="terms-checkbox-label">
                        I agree to the{' '}
                        <span 
                          className="terms-link"
                          onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            setShowTermsModal(true);
                          }}
                        >
                          Terms &amp; Conditions
                        </span>
                      </label>
                    </div>

                    <div className="form-actions">
                        <button type="submit" className="btn-auth" disabled={loading || !passwordsMatch}>
                            {loading ? 'Creating Account...' : 'Sign Up'}
                        </button>
                    </div>
                </form>
                
                <p className="auth-footer">
                    Already have an account? <span className="link-primary" onClick={() => navigate('/login')} style={{cursor: 'pointer'}}>Login</span>
                </p>
            </div>

            {showTermsModal && (
              <div className="web-terms-modal-overlay" onClick={() => setShowTermsModal(false)}>
                <div className="web-terms-modal-card" onClick={(e) => e.stopPropagation()}>
                  <div className="web-terms-modal-header">
                    <h3>Terms &amp; Conditions</h3>
                    <button 
                      type="button" 
                      className="web-terms-modal-close"
                      onClick={() => setShowTermsModal(false)}
                    >
                      &times;
                    </button>
                  </div>
                  <div className="web-terms-modal-body">
                    <p style={{ color: 'var(--color-text-secondary)', marginBottom: '1.25rem', fontSize: '0.875rem' }}>
                      Please read and review the Amana platform Terms and Conditions below.
                    </p>
                    {termsData.map((section) => (
                      <div key={section.id || section.number} className="web-terms-modal-section">
                        <h4>{section.number}. {section.title}</h4>
                        {section.clauses ? (
                          section.clauses.map((c) => (
                            <p key={c.num}>
                              <strong>{c.num}</strong> {c.text}
                            </p>
                          ))
                        ) : (
                          <p>{section.content}</p>
                        )}
                      </div>
                    ))}
                  </div>
                  <div className="web-terms-modal-footer">
                    <button
                      type="button"
                      className="btn-auth"
                      onClick={() => {
                        setAcceptedTerms(true);
                        setShowTermsModal(false);
                      }}
                    >
                      I Agree to Terms &amp; Conditions
                    </button>
                  </div>
                </div>
              </div>
            )}
        </div>
    );
};

export default Register;
