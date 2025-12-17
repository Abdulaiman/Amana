import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import './Login.css'; // Shared Auth Styles

const Register = () => {
    const [role, setRole] = useState('retailer');
    const [formData, setFormData] = useState({
        name: '', email: '', password: '', phone: '',
        businessName: '', address: '', description: '', phones: ['', '']
    });
    const [loading, setLoading] = useState(false);

    const { registerRetailer, registerVendor } = useAuth();
    const navigate = useNavigate();
    const { addToast } = useToast();

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
        setLoading(true);

        try {
            if (role === 'retailer') {
                await registerRetailer({
                    name: formData.name, email: formData.email,
                    password: formData.password, phone: formData.phone
                });
                addToast('Registration successful!', 'success');
                navigate('/dashboard');
            } else {
                await registerVendor({
                    businessName: formData.businessName, email: formData.email,
                    password: formData.password, phones: formData.phones,
                    address: formData.address, description: formData.description
                });
                addToast('Registration successful!', 'success');
                navigate('/vendor');
            }
        } catch (err) {
            addToast(err?.message || 'Registration failed', 'error');
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
                                <input name="phone" type="tel" className="form-input" onChange={handleChange} required />
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
                                    <input name="phone_0" type="tel" className="form-input" onChange={handleChange} required />
                                </div>
                                <div>
                                    <label className="form-label">Phone 2</label>
                                    <input name="phone_1" type="tel" className="form-input" onChange={handleChange} required />
                                </div>
                            </div>
                            <div className="form-group">
                                <label className="form-label">Address</label>
                                <input name="address" type="text" className="form-input" onChange={handleChange} required />
                            </div>
                         </>
                    )}

                    <div className="form-group">
                        <label className="form-label">Email Address</label>
                        <input name="email" type="email" className="form-input" onChange={handleChange} required />
                    </div>
                    <div className="form-group">
                        <label className="form-label">Password</label>
                        <input name="password" type="password" className="form-input" onChange={handleChange} required />
                    </div>

                    <div className="form-actions">
                        <button type="submit" className="btn-auth" disabled={loading}>
                            {loading ? 'Creating Account...' : 'Sign Up'}
                        </button>
                    </div>
                </form>
                
                <p className="auth-footer">
                    Already have an account? <span className="link-primary" onClick={() => navigate('/login')} style={{cursor: 'pointer'}}>Login</span>
                </p>
            </div>
        </div>
    );
};

export default Register;
