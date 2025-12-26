import React from 'react';
import { Phone, Mail, Lock } from 'lucide-react';
import './Login.css'; // Reusing auth styles

const Banned = () => {
    return (
        <div className="banned-container fade-in">
            <div className="banned-panel">
                <div className="banned-icon-container">
                    <div className="banned-icon-box">
                        <Lock size={40} strokeWidth={2.5} />
                    </div>
                </div>
                
                <h1 className="banned-title">Account Suspended</h1>
                <p className="banned-text">
                    Your account has been deactivated due to a violation of our terms or suspicious activity. You are currently restricted from accessing the platform.
                </p>

                <div className="contact-card">
                    <span className="contact-label">Contact Support</span>
                    <div className="contact-row">
                        <Phone size={18} className="contact-icon" />
                        <span className="contact-value">07016774535</span>
                    </div>
                    <div className="contact-row">
                        <Mail size={18} className="contact-icon" />
                        <span style={{ fontSize: '0.9rem' }}>service.amanafinance@gmail.com</span>
                    </div>
                </div>

                <button 
                    onClick={() => {
                        localStorage.removeItem('user');
                        window.location.href = '/login';
                    }}
                    className="btn-outline"
                >
                    Return to Login
                </button>
            </div>
        </div>
    );
};

export default Banned;
