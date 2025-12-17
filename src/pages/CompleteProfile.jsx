import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import './CompleteProfile.css';
import { Upload, Building, User, CreditCard, MapPin, CheckCircle, ShieldCheck, ArrowRight, Loader } from 'lucide-react';

const CompleteProfile = () => {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [step, setStep] = useState(1);
    
    // Form States
    const [formData, setFormData] = useState({
        businessName: '',
        businessType: 'Retail',
        yearsInBusiness: '',
        startingCapital: '50k-200k',
        description: '',
        address: '',
        bvn: '',
        
        // Next of Kin
        nokName: '',
        nokPhone: '',
        nokRelationship: '',
        nokAddress: ''
    });

    // File States (URLs after upload)
    const [files, setFiles] = useState({
        profilePicUrl: '',
        idCardUrl: '',
        locationProofUrl: ''
    });

    const [uploading, setUploading] = useState({
        profilePic: false,
        idCard: false,
        locationProof: false
    });
    
    // New State for Locking
    const [isLocked, setIsLocked] = useState(false);
    const [pageLoading, setPageLoading] = useState(true);

    useEffect(() => {
        const checkProfileStatus = async () => {
            try {
                const res = await api.get('/retailer/profile');
                if (res.data.isProfileComplete || res.data.sensitiveDataLocked) {
                    setIsLocked(true);
                    // Pre-fill data for display (optional) or just show locked state
                }
            } catch (error) {
                console.error('Profile check failed', error);
            } finally {
                setPageLoading(false);
            }
        };
        checkProfileStatus();
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
            // Returns array of URLs
            setFiles({ ...files, [`${type}Url`]: res.data[0] });
        } catch (error) {
            console.error('Upload Error', error);
            alert('File upload failed. Please try again.');
        } finally {
            setUploading({ ...uploading, [type]: false });
        }
    };

    const handleInputChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };


    if (pageLoading) return (
        <div className="loading-container">
            <Loader className="animate-spin" style={{ color: 'var(--color-primary)' }} />
        </div>
    );

    if (isLocked) {
        return (
            <div className="complete-profile-page">
                <div className="locked-container animate-fade-in">
                    <div className="locked-bg-glow" />
                    <div className="locked-content">
                        <div className="locked-icon-wrapper">
                            <ShieldCheck size={48} />
                        </div>
                        <h1 className="locked-title">Profile Verified</h1>
                        <p className="locked-text">
                            Your business identity has been verified and your credit limit is active. <br/>
                            Sensitive data is now locked for security.
                        </p>
                        <button onClick={() => navigate('/dashboard')} className="btn-dashboard">
                            Go to Dashboard <ArrowRight size={20} />
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    const handleSubmit = async () => {
        // Validation needed here...
        setLoading(true);
        try {
            const payload = {
                ...formData,
                yearsInBusiness: Number(formData.yearsInBusiness),
                profilePicUrl: files.profilePicUrl,
                idCardUrl: files.idCardUrl,
                locationProofUrl: files.locationProofUrl,
                nextOfKin: {
                    name: formData.nokName,
                    phone: formData.nokPhone,
                    relationship: formData.nokRelationship,
                    address: formData.nokAddress
                }
            };

            const res = await api.put('/retailer/profile/complete', payload);
            
            // Success!
            alert(`Success! Profile Verified. Your Score is ${res.data.amanaScore} and Limit is ₦${res.data.creditLimit.toLocaleString()}.`);
            navigate('/dashboard');
        } catch (error) {
            console.error('Submission Error', error);
            alert(error.response?.data?.message || 'Failed to complete profile.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="complete-profile-page">
            <div className="complete-profile-container">
                
                {/* Header */}
                <div className="form-header">
                    <h1 className="header-title">Complete Your Profile</h1>
                    <p className="header-subtitle">Unlock your Amana Credit Limit by verifying your business.</p>
                    
                    {/* Steps Indicator */}
                    <div className="step-indicator-wrapper">
                        {[1, 2, 3].map(i => (
                            <div key={i} className={`step-dot ${step >= i ? 'active' : ''}`} />
                        ))}
                    </div>
                </div>

                <div className="form-content">
                    {/* STEP 1: Business Info */}
                    {step === 1 && (
                        <div className="section-wrapper animate-fade-in">
                            <h2 className="section-title">
                                <Building size={20} /> Business Details
                            </h2>
                            
                            <div className="form-grid">
                                <div className="form-group">
                                    <label className="form-label">Business Name</label>
                                    <input name="businessName" value={formData.businessName} onChange={handleInputChange} className="input-field" placeholder="e.g. Ade Ventures" />
                                </div>
                                <div className="form-group">
                                    <label className="form-label">Business Type</label>
                                    <select name="businessType" value={formData.businessType} onChange={handleInputChange} className="input-field">
                                        <option>Retail</option>
                                        <option>FMCG</option>
                                        <option>Electronics</option>
                                        <option>Fashion</option>
                                    </select>
                                </div>
                                <div className="form-group">
                                    <label className="form-label">Years in Business</label>
                                    <input type="number" name="yearsInBusiness" value={formData.yearsInBusiness} onChange={handleInputChange} className="input-field" placeholder="e.g. 5" />
                                </div>
                                <div className="form-group">
                                    <label className="form-label">Starting Capital Estimate</label>
                                    <select name="startingCapital" value={formData.startingCapital} onChange={handleInputChange} className="input-field">
                                        <option value="low">Under ₦200,000</option>
                                        <option value="high">Above ₦200,000</option>
                                    </select>
                                </div>
                            </div>
                            
                            <div className="form-group">
                                <label className="form-label">Business Address</label>
                                <textarea name="address" value={formData.address} onChange={handleInputChange} className="input-field textarea-field" placeholder="Full shop address..."></textarea>
                            </div>

                            <button onClick={() => setStep(2)} className="btn btn-primary btn-block">
                                Next Step <ArrowRight size={20} />
                            </button>
                        </div>
                    )}

                    {/* STEP 2: KYC Uploads */}
                    {step === 2 && (
                        <div className="section-wrapper animate-fade-in">
                            <h2 className="section-title">
                                <ShieldCheck size={20} /> Identity Verification
                            </h2>
                            <p className="section-note">Please provide valid documents. This data is encrypted and locked after submission.</p>

                            {/* Profile Pic */}
                            <div className="upload-card">
                                <div className="upload-row">
                                    <div className="upload-info">
                                        <User className="text-[var(--color-primary)]" style={{ color: 'var(--color-primary)' }} />
                                        <div>
                                            <p className="upload-text-main">Profile Picture</p>
                                            <p className="upload-text-sub">Clear face photo</p>
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

                            {/* ID Card */}
                            <div className="upload-card">
                                <div className="upload-row">
                                    <div className="upload-info">
                                        <CreditCard style={{ color: 'var(--color-primary)' }} />
                                        <div>
                                            <p className="upload-text-main">Valid ID Card</p>
                                            <p className="upload-text-sub">NIN, Voter's Card, or Passport</p>
                                        </div>
                                    </div>
                                    <label className="upload-btn-label">
                                        {uploading.idCard ? (
                                            <Loader className="animate-spin" size={16} />
                                        ) : files.idCardUrl ? (
                                            <div className="preview-container">
                                                <img src={files.idCardUrl} alt="Preview" className="upload-preview-img" />
                                                <div className="preview-overlay">Change</div>
                                            </div>
                                        ) : (
                                            'Upload'
                                        )}
                                        <input type="file" className="hidden" onChange={(e) => handleFileUpload(e, 'idCard')} accept="image/*" />
                                    </label>
                                </div>
                            </div>

                            {/* Location Proof */}
                            <div className="upload-card">
                                <div className="upload-row">
                                    <div className="upload-info">
                                        <MapPin style={{ color: 'var(--color-primary)' }} />
                                        <div>
                                            <p className="upload-text-main">Proof of Business Location</p>
                                            <p className="upload-text-sub">Photo of shop front or utility bill</p>
                                        </div>
                                    </div>
                                    <label className="upload-btn-label">
                                        {uploading.locationProof ? (
                                            <Loader className="animate-spin" size={16} />
                                        ) : files.locationProofUrl ? (
                                            <div className="preview-container">
                                                <img src={files.locationProofUrl} alt="Preview" className="upload-preview-img" />
                                                <div className="preview-overlay">Change</div>
                                            </div>
                                        ) : (
                                            'Upload'
                                        )}
                                        <input type="file" className="hidden" onChange={(e) => handleFileUpload(e, 'locationProof')} accept="image/*" />
                                    </label>
                                </div>
                            </div>

                            <div className="form-group mt-4">
                                <label className="form-label">BVN (Bank Verification Number)</label>
                                <input name="bvn" value={formData.bvn} onChange={handleInputChange} className="input-field font-mono tracking-wide" placeholder="2222..." maxLength={11} />
                            </div>

                            <div className="btn-row">
                                <button onClick={() => setStep(1)} className="btn btn-outline btn-lg">Back</button>
                                <button 
                                    onClick={() => setStep(3)} 
                                    disabled={!files.idCardUrl || !files.locationProofUrl || !formData.bvn}
                                    className="btn btn-primary btn-lg flex-center"
                                >
                                    Next Step <ArrowRight size={20} />
                                </button>
                            </div>
                        </div>
                    )}

                    {/* STEP 3: Next of Kin & Finish */}
                    {step === 3 && (
                        <div className="section-wrapper animate-fade-in">
                            <h2 className="section-title">
                                <User size={20} /> Next of Kin
                            </h2>
                            
                            <div className="form-grid">
                                <div className="form-group">
                                    <label className="form-label">Name</label>
                                    <input name="nokName" value={formData.nokName} onChange={handleInputChange} className="input-field" placeholder="Full Name" />
                                </div>
                                <div className="form-group">
                                    <label className="form-label">Relationship</label>
                                    <input name="nokRelationship" value={formData.nokRelationship} onChange={handleInputChange} className="input-field" placeholder="e.g. Brother" />
                                </div>
                                <div className="form-group">
                                    <label className="form-label">Phone Number</label>
                                    <input name="nokPhone" value={formData.nokPhone} onChange={handleInputChange} className="input-field" placeholder="080..." />
                                </div>
                                <div className="form-group">
                                    <label className="form-label">Address</label>
                                    <input name="nokAddress" value={formData.nokAddress} onChange={handleInputChange} className="input-field" placeholder="Full Address" />
                                </div>
                            </div>

                            <div className="btn-row">
                                <button onClick={() => setStep(2)} className="btn btn-outline btn-lg">Back</button>
                                <button 
                                    onClick={handleSubmit} 
                                    disabled={loading}
                                    className="btn btn-primary btn-lg flex-center"
                                >
                                    {loading ? <Loader className="animate-spin" /> : 'Submit & Unlock Credit'}
                                </button>
                            </div>
                        </div>
                    )}

                </div>
            </div>
            

        </div>
    );
};

export default CompleteProfile;
