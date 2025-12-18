import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import './CompleteProfile.css'; // Reuse retailer styling
import { Upload, Building, User, CreditCard, ShieldCheck, ArrowRight, Loader, Briefcase, Landmark } from 'lucide-react';
import { useToast } from '../context/ToastContext';

const VendorCompleteProfile = () => {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [step, setStep] = useState(1);
    const [pageLoading, setPageLoading] = useState(true);
    const [isComplete, setIsComplete] = useState(false);
    const { addToast } = useToast();
    
    const [formData, setFormData] = useState({
        ownerName: '',
        ownerPhone: '',
        description: '',
        cacNumber: '',
        // Bank Details
        bankName: '',
        accountNumber: '',
        accountName: ''
    });

    const [files, setFiles] = useState({
        profilePicUrl: '',
        cacDocumentUrl: ''
    });

    const [uploading, setUploading] = useState({
        profilePic: false,
        cacDocument: false
    });

    useEffect(() => {
        const checkProfile = async () => {
            try {
                const res = await api.get('/vendor/profile');
                const profile = res.data;
                
                if (profile) {
                    setFormData({
                        ownerName: profile.ownerName || '',
                        ownerPhone: profile.ownerPhone || '',
                        description: profile.description || '',
                        cacNumber: profile.cacNumber || '',
                        bankName: profile.bankDetails?.bankName || '',
                        accountNumber: profile.bankDetails?.accountNumber || '',
                        accountName: profile.bankDetails?.accountName || ''
                    });
                    setFiles({
                        profilePicUrl: profile.profilePicUrl || '',
                        cacDocumentUrl: profile.cacDocumentUrl || ''
                    });

                    // Only block if complete AND NOT rejected
                    if (profile.isProfileComplete && profile.verificationStatus !== 'rejected') {
                        setIsComplete(true);
                    }
                }
            } catch (error) {
                console.error('Profile check failed', error);
            } finally {
                setPageLoading(false);
            }
        };
        checkProfile();
    }, []);

    const handleFileUpload = async (e, type) => {
        const file = e.target.files[0];
        if (!file) return;

        setUploading({ ...uploading, [type]: true });
        const data = new FormData();
        data.append('files', file);

        try {
            const res = await api.post('/upload', data, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            setFiles({ ...files, [`${type}Url`]: res.data[0] });
        } catch (error) {
            console.error('Upload Error', error);
            addToast('File upload failed. Please try again.', 'error');
        } finally {
            setUploading({ ...uploading, [type]: false });
        }
    };

    const handleInputChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async () => {
        setLoading(true);
        try {
            const payload = {
                ownerName: formData.ownerName,
                ownerPhone: formData.ownerPhone,
                description: formData.description,
                cacNumber: formData.cacNumber,
                profilePicUrl: files.profilePicUrl,
                cacDocumentUrl: files.cacDocumentUrl,
                bankDetails: {
                    bankName: formData.bankName,
                    accountNumber: formData.accountNumber,
                    accountName: formData.accountName
                }
            };

            await api.put('/vendor/profile/complete', payload);
            addToast('Profile completed! Your account is now pending verification.', 'success');
            navigate('/vendor');
        } catch (error) {
            console.error('Submission Error', error);
            addToast(error.response?.data?.message || 'Failed to complete profile.', 'error');
        } finally {
            setLoading(false);
        }
    };

    if (pageLoading) return (
        <div className="loading-container">
            <Loader className="animate-spin" style={{ color: 'var(--color-primary)' }} />
        </div>
    );

    if (isComplete) {
        return (
            <div className="complete-profile-page">
                <div className="locked-container animate-fade-in">
                    <div className="locked-bg-glow" />
                    <div className="locked-content">
                        <div className="locked-icon-wrapper">
                            <ShieldCheck size={48} />
                        </div>
                        <h1 className="locked-title">Profile Complete</h1>
                        <p className="locked-text">
                            Your vendor profile is complete. <br/>
                            You can now receive orders and request payouts.
                        </p>
                        <button onClick={() => navigate('/vendor')} className="btn-dashboard">
                            Go to Dashboard <ArrowRight size={20} />
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="complete-profile-page">
            <div className="complete-profile-container">
                
                <div className="form-header">
                    <h1 className="header-title">{formData.ownerName ? 'Update Your Vendor Profile' : 'Complete Your Vendor Profile'}</h1>
                    <p className="header-subtitle">{formData.ownerName ? 'Revise your details and documents for verification.' : 'Add your business details to start receiving orders.'}</p>
                    
                    <div className="step-indicator-wrapper">
                        {[1, 2, 3].map(i => (
                            <div key={i} className={`step-dot ${step >= i ? 'active' : ''}`} />
                        ))}
                    </div>
                </div>

                <div className="form-content">
                    {/* STEP 1: Business Owner Info */}
                    {step === 1 && (
                        <div className="section-wrapper animate-fade-in">
                            <h2 className="section-title">
                                <User size={20} /> Owner Details
                            </h2>
                            
                            <div className="form-grid">
                                <div className="form-group">
                                    <label className="form-label">Owner Name</label>
                                    <input name="ownerName" value={formData.ownerName} onChange={handleInputChange} className="input-field" placeholder="Full Name" />
                                </div>
                                <div className="form-group">
                                    <label className="form-label">Owner Phone</label>
                                    <input name="ownerPhone" value={formData.ownerPhone} onChange={handleInputChange} className="input-field" placeholder="080..." />
                                </div>
                            </div>
                            
                            <div className="form-group">
                                <label className="form-label">Business Description</label>
                                <textarea name="description" value={formData.description} onChange={handleInputChange} className="input-field textarea-field" placeholder="Describe your products..."></textarea>
                            </div>

                            <button onClick={() => setStep(2)} className="btn btn-primary btn-block">
                                Next Step <ArrowRight size={20} />
                            </button>
                        </div>
                    )}

                    {/* STEP 2: Documents */}
                    {step === 2 && (
                        <div className="section-wrapper animate-fade-in">
                            <h2 className="section-title">
                                <ShieldCheck size={20} /> Verification Documents
                            </h2>
                            <p className="section-note">Upload documents to verify your business.</p>

                            <div className="upload-card">
                                <div className="upload-row">
                                    <div className="upload-info">
                                        <User style={{ color: 'var(--color-primary)' }} />
                                        <div>
                                            <p className="upload-text-main">Profile Picture</p>
                                            <p className="upload-text-sub">Clear photo of yourself</p>
                                        </div>
                                    </div>
                                    <label className="upload-btn-label">
                                        {uploading.profilePic ? (
                                            <Loader className="animate-spin" size={16} />
                                        ) : files.profilePicUrl ? (
                                            <div className="preview-container">
                                                <img src={files.profilePicUrl} alt="Preview" className="upload-preview-img" />
                                                <div className="preview-overlay">Change</div>
                                            </div>
                                        ) : (
                                            'Upload'
                                        )}
                                        <input type="file" className="hidden" onChange={(e) => handleFileUpload(e, 'profilePic')} accept="image/*" />
                                    </label>
                                </div>
                            </div>

                            <div className="upload-card">
                                <div className="upload-row">
                                    <div className="upload-info">
                                        <Briefcase style={{ color: 'var(--color-primary)' }} />
                                        <div>
                                            <p className="upload-text-main">CAC Document</p>
                                            <p className="upload-text-sub">Business registration certificate</p>
                                        </div>
                                    </div>
                                    <label className="upload-btn-label">
                                        {uploading.cacDocument ? (
                                            <Loader className="animate-spin" size={16} />
                                        ) : files.cacDocumentUrl ? (
                                            <div className="preview-container">
                                                <img src={files.cacDocumentUrl} alt="Preview" className="upload-preview-img" />
                                                <div className="preview-overlay">Change</div>
                                            </div>
                                        ) : (
                                            'Upload'
                                        )}
                                        <input type="file" className="hidden" onChange={(e) => handleFileUpload(e, 'cacDocument')} accept="image/*" />
                                    </label>
                                </div>
                            </div>

                            <div className="form-group mt-4">
                                <label className="form-label">CAC Registration Number</label>
                                <input name="cacNumber" value={formData.cacNumber} onChange={handleInputChange} className="input-field font-mono tracking-wide" placeholder="RC-XXXXXX" />
                            </div>

                            <div className="btn-row">
                                <button onClick={() => setStep(1)} className="btn btn-outline btn-lg">Back</button>
                                <button onClick={() => setStep(3)} className="btn btn-primary btn-lg flex-center">
                                    Next Step <ArrowRight size={20} />
                                </button>
                            </div>
                        </div>
                    )}

                    {/* STEP 3: Bank Details */}
                    {step === 3 && (
                        <div className="section-wrapper animate-fade-in">
                            <h2 className="section-title">
                                <Landmark size={20} /> Bank Details
                            </h2>
                            <p className="section-note">Where should we send your payouts?</p>
                            
                            <div className="form-grid">
                                <div className="form-group">
                                    <label className="form-label">Bank Name</label>
                                    <select name="bankName" value={formData.bankName} onChange={handleInputChange} className="input-field">
                                        <option value="">Select Bank</option>
                                        <option>Access Bank</option>
                                        <option>First Bank</option>
                                        <option>GTBank</option>
                                        <option>UBA</option>
                                        <option>Zenith Bank</option>
                                        <option>Kuda Bank</option>
                                        <option>Opay</option>
                                        <option>Moniepoint</option>
                                        <option>Other</option>
                                    </select>
                                </div>
                                <div className="form-group">
                                    <label className="form-label">Account Number</label>
                                    <input name="accountNumber" value={formData.accountNumber} onChange={handleInputChange} className="input-field font-mono" placeholder="0123456789" maxLength={10} />
                                </div>
                                <div className="form-group" style={{ gridColumn: 'span 2' }}>
                                    <label className="form-label">Account Name</label>
                                    <input name="accountName" value={formData.accountName} onChange={handleInputChange} className="input-field" placeholder="As shown on your bank account" />
                                </div>
                            </div>

                            <div className="btn-row">
                                <button onClick={() => setStep(2)} className="btn btn-outline btn-lg">Back</button>
                                <button 
                                    onClick={handleSubmit} 
                                    disabled={loading || !formData.bankName || !formData.accountNumber || !formData.accountName}
                                    className="btn btn-primary btn-lg flex-center"
                                >
                                    {loading ? <Loader className="animate-spin" /> : 'Complete Profile'}
                                </button>
                            </div>
                        </div>
                    )}

                </div>
            </div>
        </div>
    );
};

export default VendorCompleteProfile;
