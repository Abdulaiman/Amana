import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import { 
    Building, CreditCard, MapPin, ShieldCheck, Mail, Phone, Loader, 
    Wallet, Edit2, X, Save, ChevronLeft, CheckCircle, AlertCircle, Clock
} from 'lucide-react';
import './UserProfile.css'; // Reuse retailer profile styles

const VendorProfile = () => {
    const navigate = useNavigate();
    const [profile, setProfile] = useState(null);
    const [loading, setLoading] = useState(true);
    const [editMode, setEditMode] = useState(false);
    const [saving, setSaving] = useState(false);
    const [formData, setFormData] = useState({
        businessName: '',
        phones: ['', ''],
        address: '',
        description: '',
        bankDetails: {
            bankName: '',
            accountNumber: '',
            accountName: ''
        }
    });

    useEffect(() => {
        fetchProfile();
    }, []);

    const fetchProfile = async () => {
        try {
            const res = await api.get('/vendor/profile');
            setProfile(res.data);
            setFormData({
                businessName: res.data.businessName || '',
                phones: res.data.phones || ['', ''],
                address: res.data.address || '',
                description: res.data.description || '',
                bankDetails: res.data.bankDetails || {
                    bankName: '',
                    accountNumber: '',
                    accountName: ''
                }
            });
        } catch (error) {
            console.error('Failed to load profile', error);
        } finally {
            setLoading(false);
        }
    };

    const handleSave = async () => {
        setSaving(true);
        try {
            await api.put('/vendor/profile', formData);
            await fetchProfile();
            setEditMode(false);
        } catch (error) {
            alert('Failed to update profile');
        } finally {
            setSaving(false);
        }
    };

    const getVerificationIcon = (status) => {
        switch (status) {
            case 'verified': return <CheckCircle size={18} className="text-success" />;
            case 'rejected': return <AlertCircle size={18} className="text-danger" />;
            default: return <Clock size={18} className="text-warning" />;
        }
    };

    const getVerificationColor = (status) => {
        switch (status) {
            case 'verified': return 'status-verified';
            case 'rejected': return 'status-rejected';
            default: return 'status-pending';
        }
    };

    if (loading) return (
        <div className="loading-container">
            <Loader className="animate-spin" style={{ color: 'var(--color-primary)' }} />
        </div>
    );

    if (!profile) return <div className="error-message">Failed to load profile.</div>;

    return (
        <div className="user-profile-container user-profile-content animate-fade-in">
            {/* Back Button */}
            <button onClick={() => navigate('/vendor')} className="back-btn" style={{ marginBottom: '1rem' }}>
                <ChevronLeft size={18} /> Back to Dashboard
            </button>

            {/* Header / ID Card Style */}
            <div className="profile-header-card vendor-header-card">
                <div className="profile-avatar-section">
                    <div className="profile-avatar vendor-avatar">
                        {profile.profilePicUrl ? (
                            <img src={profile.profilePicUrl} alt="Profile" className="avatar-img" />
                        ) : (
                            <Building size={40} className="icon-white" />
                        )}
                    </div>
                    <div>
                        <h1 className="profile-name">{profile.businessName}</h1>
                        <p className="profile-tier">
                            {getVerificationIcon(profile.verificationStatus)}
                            <span style={{ marginLeft: '0.5rem' }}>
                                {profile.verificationStatus === 'verified' ? 'Verified Vendor' : 
                                 profile.verificationStatus === 'rejected' ? 'Verification Rejected' : 'Pending Verification'}
                            </span>
                        </p>
                    </div>
                </div>
                <div className="profile-stats">
                    <div className="stat-item">
                        <span className="stat-label">Wallet Balance</span>
                        <span className="stat-value">₦{(profile.walletBalance || 0).toLocaleString()}</span>
                    </div>
                    <div className="stat-item">
                        <span className="stat-label">Rating</span>
                        <span className="stat-value">{profile.rating || 'N/A'} ⭐</span>
                    </div>
                </div>
            </div>

            {/* Edit Toggle */}
            <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '1rem' }}>
                {!editMode ? (
                    <button className="edit-profile-btn" onClick={() => setEditMode(true)}>
                        <Edit2 size={16} /> Edit Profile
                    </button>
                ) : (
                    <div className="edit-actions">
                        <button className="cancel-edit-btn" onClick={() => setEditMode(false)}>
                            <X size={16} /> Cancel
                        </button>
                        <button className="save-profile-btn" onClick={handleSave} disabled={saving}>
                            <Save size={16} /> {saving ? 'Saving...' : 'Save Changes'}
                        </button>
                    </div>
                )}
            </div>

            {/* Details Grid */}
            <div className="profile-grid">
                
                {/* Business Info */}
                <div className="profile-section glass-panel">
                    <h2 className="section-header">
                        <Building size={18} /> Business Details
                    </h2>
                    <div className="details-list">
                        <div className="detail-row">
                            <span className="detail-label">Business Name</span>
                            {editMode ? (
                                <input 
                                    className="profile-edit-input"
                                    value={formData.businessName}
                                    onChange={e => setFormData({...formData, businessName: e.target.value})}
                                />
                            ) : (
                                <p className="detail-value highlight">{profile.businessName}</p>
                            )}
                        </div>
                        <div className="detail-row">
                            <span className="detail-label">Email</span>
                            <p className="detail-value"><Mail size={14} /> {profile.email}</p>
                        </div>
                        <div className="detail-row">
                            <span className="detail-label">Phone 1</span>
                            {editMode ? (
                                <input 
                                    className="profile-edit-input"
                                    value={formData.phones[0]}
                                    onChange={e => setFormData({...formData, phones: [e.target.value, formData.phones[1]]})}
                                />
                            ) : (
                                <p className="detail-value"><Phone size={14} /> {profile.phones?.[0] || 'N/A'}</p>
                            )}
                        </div>
                        <div className="detail-row">
                            <span className="detail-label">Phone 2</span>
                            {editMode ? (
                                <input 
                                    className="profile-edit-input"
                                    value={formData.phones[1]}
                                    onChange={e => setFormData({...formData, phones: [formData.phones[0], e.target.value]})}
                                />
                            ) : (
                                <p className="detail-value"><Phone size={14} /> {profile.phones?.[1] || 'N/A'}</p>
                            )}
                        </div>
                        <div className="detail-row">
                            <span className="detail-label">Address</span>
                            {editMode ? (
                                <input 
                                    className="profile-edit-input"
                                    value={formData.address}
                                    onChange={e => setFormData({...formData, address: e.target.value})}
                                />
                            ) : (
                                <p className="detail-value"><MapPin size={14} /> {profile.address || 'N/A'}</p>
                            )}
                        </div>
                        <div className="detail-row">
                            <span className="detail-label">Description</span>
                            {editMode ? (
                                <textarea 
                                    className="profile-edit-input textarea"
                                    value={formData.description}
                                    onChange={e => setFormData({...formData, description: e.target.value})}
                                />
                            ) : (
                                <p className="detail-value">{profile.description || 'No description provided.'}</p>
                            )}
                        </div>
                    </div>
                </div>

                {/* Bank Details */}
                <div className="profile-section glass-panel">
                    <h2 className="section-header">
                        <CreditCard size={18} /> Bank Details
                    </h2>
                    <div className="details-list">
                        <div className="detail-row">
                            <span className="detail-label">Bank Name</span>
                            {editMode ? (
                                <input 
                                    className="profile-edit-input"
                                    value={formData.bankDetails.bankName}
                                    onChange={e => setFormData({...formData, bankDetails: {...formData.bankDetails, bankName: e.target.value}})}
                                />
                            ) : (
                                <p className="detail-value">{profile.bankDetails?.bankName || 'Not set'}</p>
                            )}
                        </div>
                        <div className="detail-row">
                            <span className="detail-label">Account Number</span>
                            {editMode ? (
                                <input 
                                    className="profile-edit-input"
                                    value={formData.bankDetails.accountNumber}
                                    onChange={e => setFormData({...formData, bankDetails: {...formData.bankDetails, accountNumber: e.target.value}})}
                                />
                            ) : (
                                <p className="detail-value font-mono">{profile.bankDetails?.accountNumber || 'Not set'}</p>
                            )}
                        </div>
                        <div className="detail-row">
                            <span className="detail-label">Account Name</span>
                            {editMode ? (
                                <input 
                                    className="profile-edit-input"
                                    value={formData.bankDetails.accountName}
                                    onChange={e => setFormData({...formData, bankDetails: {...formData.bankDetails, accountName: e.target.value}})}
                                />
                            ) : (
                                <p className="detail-value">{profile.bankDetails?.accountName || 'Not set'}</p>
                            )}
                        </div>
                    </div>
                    <p className="bank-note">
                        <Wallet size={12} /> Payouts will be sent to this account.
                    </p>
                </div>

                {/* Verification & KYC Status */}
                <div className="profile-section glass-panel full-width">
                    <h2 className="section-header">
                        <ShieldCheck size={18} /> Verification Status
                    </h2>
                    <div className="verification-status-card">
                        <div>
                            <p className="verification-title">Business Verification</p>
                            <p className="verification-subtitle">CAC Document, Owner ID</p>
                        </div>
                        <span className={`status-badge ${getVerificationColor(profile.verificationStatus)}`}>
                            {profile.verificationStatus === 'verified' ? 'Verified' : 
                             profile.verificationStatus === 'rejected' ? 'Rejected' : 'Pending Review'}
                        </span>
                    </div>
                    {profile.verificationStatus === 'pending' && (
                        <p className="pending-message">
                            <Clock size={12} /> Your documents are under review. This usually takes 1-2 business days.
                        </p>
                    )}
                    {profile.verificationStatus === 'rejected' && (
                        <p className="rejected-message">
                            <AlertCircle size={12} /> Your verification was rejected. Please contact support or resubmit documents.
                        </p>
                    )}
                    {profile.cacNumber && (
                        <div className="detail-row" style={{ marginTop: '1rem' }}>
                            <span className="detail-label">CAC Number</span>
                            <p className="detail-value font-mono">{profile.cacNumber}</p>
                        </div>
                    )}
                </div>

            </div>
        </div>
    );
};

export default VendorProfile;
