import React, { useEffect, useState } from 'react';
import api from '../services/api';
import { User, Building, CreditCard, MapPin, ShieldCheck, Mail, Phone, Loader } from 'lucide-react';
import './UserProfile.css';

const UserProfile = () => {
    const [profile, setProfile] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchProfile = async () => {
            try {
                const res = await api.get('/retailer/profile');
                setProfile(res.data);
            } catch (error) {
                console.error('Failed to load profile', error);
            } finally {
                setLoading(false);
            }
        };
        fetchProfile();
    }, []);


    if (loading) return (
        <div className="loading-container">
            <Loader className="animate-spin" style={{ color: 'var(--color-brand)' }} />
        </div>
    );

    if (!profile) return <div className="error-message">Failed to load profile.</div>;

    return (
        <div className="user-profile-container user-profile-content">
            <div className="page-hero">
                <div className="page-hero-icon">
                    <User size={24} />
                </div>
                <div className="page-hero-body">
                    <h1 className="page-hero-title">{profile.name}</h1>
                    <p className="page-hero-subtitle">{profile.tier} Member</p>
                </div>
                <div className="page-hero-actions">
                    <div className="stat-item">
                        <span className="stat-label">Amana Score</span>
                        <span className="stat-value">{profile.amanaScore}</span>
                    </div>
                    <div className="stat-item">
                        <span className="stat-label">Credit Limit</span>
                        <span className="stat-value">₦{profile.creditLimit.toLocaleString()}</span>
                    </div>
                </div>
            </div>

            {/* Details Grid */}
            <div className="profile-grid">
                
                {/* Contact Info */}
                <div className="profile-section card">
                    <h2 className="section-header">
                        <User size={18} /> Personal Details
                    </h2>
                    <div className="details-list">
                        <div className="detail-row">
                            <span className="detail-label">Email</span>
                            <p className="detail-value"><Mail size={14} /> {profile.email}</p>
                        </div>
                        <div className="detail-row">
                            <span className="detail-label">Phone</span>
                            <p className="detail-value"><Phone size={14} /> {profile.phone || 'N/A'}</p>
                        </div>
                    </div>
                </div>

                {/* Business Info */}
                <div className="profile-section card">
                    <h2 className="section-header">
                        <Building size={18} /> Business Info
                    </h2>
                    {profile.businessInfo ? (
                        <div className="details-list">
                            <div className="detail-row">
                                <span className="detail-label">Business Name</span>
                                <p className="detail-value highlight">{profile.businessInfo.businessName}</p>
                            </div>
                            <div className="detail-row">
                                <span className="detail-label">Type</span>
                                <p className="detail-value">{profile.businessInfo.businessType}</p>
                            </div>
                            <div className="detail-row">
                                <span className="detail-label">Address</span>
                                <p className="detail-value">
                                    <MapPin size={14} className="shrink-0" /> 
                                    {profile.address || "Address not listed"}
                                </p>
                            </div>
                        </div>
                    ) : (
                        <p style={{ color: '#6b7280', fontStyle: 'italic' }}>No business info provided.</p>
                    )}
                </div>

                {/* KYC Status */}
                <div className="profile-section card full-width">
                    <h2 className="section-header">
                        <ShieldCheck size={18} /> Verification Status
                    </h2>
                    <div className="verification-status-card">
                        <div>
                            <p className="verification-title">Identity Verification</p>
                            <p className="verification-subtitle">BVN, ID, and Location</p>
                        </div>
                        <span className={`status-badge ${profile.isProfileComplete ? 'status-verified' : 'status-pending'}`}>
                            {profile.isProfileComplete ? 'Verified' : 'Pending'}
                        </span>
                    </div>
                    {profile.sensitiveDataLocked && (
                         <p className="locked-message">
                            <ShieldCheck size={12} /> Sensitive data is locked for your security. Contact support to update.
                         </p>
                    )}
                </div>

            </div>
        </div>
    );
};

export default UserProfile;
