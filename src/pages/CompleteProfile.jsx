import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import './CompleteProfile.css';
import { Upload, Building, User, CreditCard, MapPin, CheckCircle, ShieldCheck, ArrowRight, Loader, UserCheck, XCircle, AlertCircle } from 'lucide-react';
import { useToast } from '../context/ToastContext';

const CompleteProfile = () => {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [step, setStep] = useState(1);
    const { addToast } = useToast();
    
    // Form States
    const [formData, setFormData] = useState({
        businessName: '',
        businessType: 'Retail',
        description: '',
        address: '',
        bvn: '',
        nin: '',
        
        // Peer Referrals & Agent
        refereePhone1: '',
        refereePhone2: '',
        agentPhone: '',

        // Next of Kin
        nokName: '',
        nokPhone: '',
        nokRelationship: '',
        nokAddress: ''
    });

    // Referee verification
    const [refereeStatus, setRefereeStatus] = useState({
        refereePhone1: { checking: false, verified: null, data: null },
        refereePhone2: { checking: false, verified: null, data: null }
    });
    const verifyTimer = useRef({});

    const verifyReferee = useCallback(async (phone, key) => {
        if (phone.length < 11) {
            setRefereeStatus(prev => ({ ...prev, [key]: { checking: false, verified: null, data: null, error: null } }));
            return;
        }
        setRefereeStatus(prev => ({ ...prev, [key]: { ...prev[key], checking: true, verified: null, error: null } }));
        try {
            const res = await api.get(`/retailer/verify-referee?phone=${phone}`);
            setRefereeStatus(prev => ({ ...prev, [key]: { checking: false, verified: true, data: res.data, error: null } }));
        } catch (err) {
            const msg = err.response?.data?.message || 'Unable to verify referee';
            setRefereeStatus(prev => ({ ...prev, [key]: { checking: false, verified: false, data: null, error: msg } }));
        }
    }, []);

    const handleRefereeChange = (e, key) => {
        handleInputChange(e);
        const phone = e.target.value;
        if (verifyTimer.current[key]) clearTimeout(verifyTimer.current[key]);
        if (phone.length < 11) {
            setRefereeStatus(prev => ({ ...prev, [key]: { checking: false, verified: null, data: null } }));
            return;
        }
        setRefereeStatus(prev => ({ ...prev, [key]: { ...prev[key], checking: true } }));
        verifyTimer.current[key] = setTimeout(() => verifyReferee(phone, key), 500);
    };

    // File States (URLs after upload)
    const [files, setFiles] = useState({
        profilePicUrl: '',
        idCardUrl: '',
        locationProofUrl: '',
        marketMembershipCardUrl: ''
    });

    const [uploading, setUploading] = useState({
        profilePic: false,
        idCard: false,
        locationProof: false,
        marketMembershipCard: false
    });
    
    // Agent selection (dropdown + manual verify)
    const [agents, setAgents] = useState([]);
    const [agentLoading, setAgentLoading] = useState(false);
    const [selectedAgent, setSelectedAgent] = useState(null);
    const [showAgentPicker, setShowAgentPicker] = useState(false);
    const [agentPhoneInput, setAgentPhoneInput] = useState('');
    const [agentVerifying, setAgentVerifying] = useState(false);
    const [agentFound, setAgentFound] = useState(null);
    const [agentConfirmed, setAgentConfirmed] = useState(false);
    const agentTimer = useRef(null);

    useEffect(() => {
        const fetchAgents = async () => {
            setAgentLoading(true);
            try {
                const res = await api.get('/retailer/agents');
                setAgents(res.data);
            } catch { /* ignore */ }
            setAgentLoading(false);
        };
        fetchAgents();
    }, []);

    const verifyAgent = useCallback(async (phone) => {
        if (phone.length < 11) {
            setAgentFound(null);
            setAgentConfirmed(false);
            return;
        }
        setAgentVerifying(true);
        setAgentFound(null);
        setAgentConfirmed(false);
        try {
            const res = await api.get(`/retailer/verify-agent?phone=${phone}`);
            setAgentFound(res.data);
        } catch (err) {
            setAgentFound(null);
            const msg = err.response?.data?.message || 'Unable to verify agent';
            addToast(msg, 'error');
        } finally {
            setAgentVerifying(false);
        }
    }, [addToast]);

    const handleAgentPhoneChange = (e) => {
        const val = e.target.value;
        setAgentPhoneInput(val);
        setAgentConfirmed(false);
        clearTimeout(agentTimer.current);
        if (val.length < 11) { setAgentFound(null); return; }
        agentTimer.current = setTimeout(() => verifyAgent(val), 500);
    };

    // New State for Locking
    const [isLocked, setIsLocked] = useState(false);
    const [pageLoading, setPageLoading] = useState(true);

    useEffect(() => {
        const checkProfileStatus = async () => {
            try {
                const res = await api.get('/retailer/profile');
                if (res.data.isProfileComplete || res.data.sensitiveDataLocked) {
                    setIsLocked(true);
                }
                
                // Pre-fill existing data
                setFormData(prev => ({
                    ...prev,
                    businessName: res.data.businessInfo?.businessName || '',
                    businessType: res.data.businessInfo?.businessType || 'Retail',
                    description: res.data.businessInfo?.description || '',
                    address: res.data.address || '',
                    nin: res.data.kyc?.nin || '',
                    bvn: res.data.kyc?.bvn || ''
                }));

                if (res.data.kyc) {
                    setFiles({
                        profilePicUrl: res.data.kyc.profilePicUrl || '',
                        idCardUrl: res.data.kyc.idCardUrl || '',
                        locationProofUrl: res.data.kyc.locationProofUrl || '',
                        marketMembershipCardUrl: res.data.kyc.marketMembershipCardUrl || ''
                    });
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
            setFiles({ ...files, [`${type}Url`]: res.data[0] });
            addToast('File uploaded successfully', 'success');
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


    if (pageLoading) return (
        <div className="loading-container">
            <Loader className="animate-spin" style={{ color: 'var(--color-brand)' }} />
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
                        <h1 className="locked-title">Application Submitted</h1>
                        <p className="locked-text">
                            Your trader financing application has been submitted. <br/>
                            An assigned Market Agent will visit your store for physical verification.
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
        setLoading(true);
        try {
            const payload = {
                ...formData,
                profilePicUrl: files.profilePicUrl,
                idCardUrl: files.idCardUrl,
                locationProofUrl: files.locationProofUrl,
                marketMembershipCardUrl: files.marketMembershipCardUrl,
                peerReferrals: [
                    ...(refereeStatus.refereePhone1.verified ? [{
                        refereePhone: formData.refereePhone1,
                        refereeName: refereeStatus.refereePhone1.data.name,
                        refereeTraderId: refereeStatus.refereePhone1.data._id || refereeStatus.refereePhone1.data.phone,
                        isVerified: true
                    }] : []),
                    ...(refereeStatus.refereePhone2.verified ? [{
                        refereePhone: formData.refereePhone2,
                        refereeName: refereeStatus.refereePhone2.data.name,
                        refereeTraderId: refereeStatus.refereePhone2.data._id || refereeStatus.refereePhone2.data.phone,
                        isVerified: true
                    }] : [])
                ],
                agentId: selectedAgent?._id || (agentConfirmed && agentFound ? agentFound._id : null),
                agentPhone: selectedAgent ? '' : (agentConfirmed && agentFound ? '' : agentPhoneInput),
                nextOfKin: {
                    name: formData.nokName,
                    phone: formData.nokPhone,
                    relationship: formData.nokRelationship,
                    address: formData.nokAddress
                },
                nin: formData.nin,
                bvn: formData.bvn
            };

            await api.put('/retailer/profile/complete', payload);
            addToast('Application submitted! Assigned Agent will perform a physical store verification.', 'success');
            navigate('/dashboard');
        } catch (error) {
            console.error('Submission Error', error);
            addToast(error.response?.data?.message || 'Failed to complete profile.', 'error');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="complete-profile-page">
            <div className="complete-profile-container">
                
                <div className="page-hero">
                    <div className="page-hero-icon">
                        <UserCheck size={24} />
                    </div>
                    <div className="page-hero-body">
                        <h1 className="page-hero-title">Trader Onboarding Application</h1>
                        <p className="page-hero-subtitle">Complete your details to request field verification and credit allocation.</p>
                    </div>
                    <div className="page-hero-actions">
                        <div className="step-indicator-wrapper">
                            {[1, 2, 3].map(i => (
                                <div key={i} className={`step-dot ${step >= i ? 'active' : ''}`} />
                            ))}
                        </div>
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

                    {/* STEP 2: Identity & Market Card Uploads */}
                    {step === 2 && (
                        <div className="section-wrapper animate-fade-in">
                            <h2 className="section-title">
                                <ShieldCheck size={20} /> Identity & Social Proof Uploads
                            </h2>
                            <p className="section-note">Upload valid documents. Market Membership Card is required for Criterion C2.</p>

                            {/* Profile Pic */}
                            <div className="upload-card">
                                <div className="upload-row">
                                    <div className="upload-info">
                                        <User style={{ color: 'var(--color-brand)' }} />
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
                                        <CreditCard style={{ color: 'var(--color-brand)' }} />
                                        <div>
                                            <p className="upload-text-main">Government ID Card</p>
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

                            {/* Market Union Card (Criterion C2) */}
                            <div className="upload-card">
                                <div className="upload-row">
                                    <div className="upload-info">
                                        <ShieldCheck style={{ color: 'var(--color-brand)' }} />
                                        <div>
                                            <p className="upload-text-main">Market Union Membership Card</p>
                                            <p className="upload-text-sub">Criterion C2: Proof of Market Membership</p>
                                        </div>
                                    </div>
                                    <label className="upload-btn-label">
                                        {uploading.marketMembershipCard ? (
                                            <Loader className="animate-spin" size={16} />
                                        ) : files.marketMembershipCardUrl ? (
                                            <div className="preview-container">
                                                <img src={files.marketMembershipCardUrl} alt="Preview" className="upload-preview-img" />
                                                <div className="preview-overlay">Change</div>
                                            </div>
                                        ) : (
                                            'Upload'
                                        )}
                                        <input type="file" className="hidden" onChange={(e) => handleFileUpload(e, 'marketMembershipCard')} accept="image/*" />
                                    </label>
                                </div>
                            </div>

                            <div className="form-group mt-4">
                                <label className="form-label">NIN</label>
                                <input name="nin" value={formData.nin} onChange={handleInputChange} className="input-field font-mono tracking-wide" placeholder="Enter 11-digit NIN" maxLength={11} />
                            </div>
                            <div className="form-group">
                                <label className="form-label">BVN</label>
                                <input name="bvn" value={formData.bvn} onChange={handleInputChange} className="input-field font-mono tracking-wide" placeholder="Enter BVN" maxLength={11} />
                            </div>

                            <div className="btn-row">
                                <button onClick={() => setStep(1)} className="btn btn-outline btn-lg">Back</button>
                                <button 
                                    onClick={() => setStep(3)} 
                                    disabled={!files.idCardUrl}
                                    className="btn btn-primary btn-lg flex-center"
                                >
                                    Next Step <ArrowRight size={20} />
                                </button>
                            </div>
                        </div>
                    )}

                    {/* STEP 3: Referrals, Market Agent & Next of Kin */}
                    {step === 3 && (
                        <div className="section-wrapper animate-fade-in">
                            <h2 className="section-title">
                                <User size={20} /> Peer Referrals & Market Agent
                            </h2>
                            
                            <h3 className="text-sm font-bold text-brand mt-4 mb-2">1. Peer Referrals (Criterion C1)</h3>
                            <div className="form-grid">
                                <div className="form-group">
                                    <label className="form-label">Referee 1 Phone (Existing Amana Trader)</label>
                                    <input name="refereePhone1" value={formData.refereePhone1} onChange={(e) => handleRefereeChange(e, 'refereePhone1')} className="input-field" placeholder="e.g. 08012345678" maxLength={11} />
                                    {refereeStatus.refereePhone1.checking && <small className="text-muted mt-1 d-block">Checking...</small>}
                                    {refereeStatus.refereePhone1.verified === true && (
                                        <small className="text-success mt-1 d-block">
                                            <CheckCircle size={14} /> {refereeStatus.refereePhone1.data.name} — {refereeStatus.refereePhone1.data.businessName}
                                        </small>
                                    )}
                                    {refereeStatus.refereePhone1.verified === false && (
                                        <small className="text-danger mt-1 d-block">
                                            <XCircle size={14} /> {refereeStatus.refereePhone1.error}
                                        </small>
                                    )}
                                </div>
                                <div className="form-group">
                                    <label className="form-label">Referee 2 Phone (Optional)</label>
                                    <input name="refereePhone2" value={formData.refereePhone2} onChange={(e) => handleRefereeChange(e, 'refereePhone2')} className="input-field" placeholder="e.g. 08087654321" maxLength={11} />
                                    {refereeStatus.refereePhone2.checking && <small className="text-muted mt-1 d-block">Checking...</small>}
                                    {refereeStatus.refereePhone2.verified === true && (
                                        <small className="text-success mt-1 d-block">
                                            <CheckCircle size={14} /> {refereeStatus.refereePhone2.data.name} — {refereeStatus.refereePhone2.data.businessName}
                                        </small>
                                    )}
                                    {refereeStatus.refereePhone2.verified === false && (
                                        <small className="text-danger mt-1 d-block">
                                            <XCircle size={14} /> {refereeStatus.refereePhone2.error}
                                        </small>
                                    )}
                                </div>
                            </div>

                            <h3 className="text-sm font-bold text-brand mt-4 mb-2">2. Assigned Market Agent</h3>
                            <div className="form-group">
                                <label className="form-label">Select Market Agent</label>
                                <div className="agent-picker-trigger" onClick={() => setShowAgentPicker(!showAgentPicker)} style={{ cursor: 'pointer', padding: '12px 16px', border: '1.5px solid var(--color-border)', borderRadius: '12px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                    {selectedAgent ? (
                                        <span>{selectedAgent.name} — {selectedAgent.market || selectedAgent.phone}</span>
                                    ) : (
                                        <span style={{ opacity: 0.5 }}>{agentLoading ? 'Loading agents...' : 'Choose a Market Agent or type number below'}</span>
                                    )}
                                    <span style={{ transform: showAgentPicker ? 'rotate(180deg)' : 'none' }}>▼</span>
                                </div>
                                {showAgentPicker && (
                                    <div className="agent-picker-dropdown" style={{ border: '1.5px solid var(--color-border)', borderRadius: '12px', marginTop: '8px', maxHeight: '200px', overflowY: 'auto' }}>
                                        {agents.map(agent => (
                                            <div key={agent._id} onClick={() => { setSelectedAgent(agent); setShowAgentPicker(false); setAgentPhoneInput(''); setAgentFound(null); setAgentConfirmed(false); }} style={{ padding: '12px 16px', cursor: 'pointer', borderBottom: '1px solid var(--color-border)' }}>
                                                <div style={{ fontWeight: 600 }}>{agent.name}</div>
                                                <div style={{ opacity: 0.6, fontSize: '0.875rem' }}>{agent.market} — {agent.phone}</div>
                                            </div>
                                        ))}
                                        {agents.length === 0 && !agentLoading && (
                                            <div style={{ padding: '12px 16px', opacity: 0.5 }}>No agents available</div>
                                        )}
                                    </div>
                                )}
                            </div>
                            {!selectedAgent && (
                                <div className="form-group">
                                    <label className="form-label">Or enter Agent Phone Number</label>
                                    <input
                                        value={agentPhoneInput}
                                        onChange={handleAgentPhoneChange}
                                        className="input-field"
                                        placeholder="Enter nearest Market Agent phone..."
                                        disabled={agentConfirmed}
                                    />
                                    {agentVerifying && <small className="text-muted mt-1 d-block">Verifying agent...</small>}
                                    {agentFound && !agentConfirmed && (
                                        <div style={{ marginTop: 8, padding: 12, border: '1.5px solid var(--color-border)', borderRadius: 12, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                            <div>
                                                <div style={{ fontWeight: 600 }}>{agentFound.name}</div>
                                                <div style={{ opacity: 0.6, fontSize: '0.875rem' }}>{agentFound.market} — {agentFound.phone}</div>
                                            </div>
                                            <button type="button" onClick={() => setAgentConfirmed(true)} className="btn btn-sm btn-brand" style={{ padding: '6px 16px', borderRadius: 8, background: 'var(--color-brand)', color: '#fff', border: 'none', fontWeight: 600, cursor: 'pointer' }}>
                                                Confirm
                                            </button>
                                        </div>
                                    )}
                                    {agentConfirmed && agentFound && (
                                        <p style={{ fontSize: '0.8rem', marginTop: 8 }}>
                                            <CheckCircle size={14} style={{ color: 'var(--color-brand)' }} /> {agentFound.name} confirmed as your market agent{' '}
                                            <button type="button" onClick={() => { setAgentConfirmed(false); setAgentFound(null); setAgentPhoneInput(''); }} style={{ background: 'none', border: 'none', color: 'var(--color-brand)', cursor: 'pointer', fontWeight: 600, textDecoration: 'underline', padding: 0, fontFamily: 'inherit' }}>
                                                Change
                                            </button>
                                        </p>
                                    )}
                                </div>
                            )}
                            {selectedAgent && (
                                <p style={{ fontSize: '0.8rem', marginTop: '-12px' }}>
                                    <CheckCircle size={14} style={{ color: 'var(--color-brand)' }} /> {selectedAgent.name} will be assigned for your verification{' '}
                                    <button type="button" onClick={() => { setSelectedAgent(null); }} style={{ background: 'none', border: 'none', color: 'var(--color-brand)', cursor: 'pointer', fontWeight: 600, textDecoration: 'underline', padding: 0, fontFamily: 'inherit' }}>
                                        Clear
                                    </button>
                                </p>
                            )}

                            <h3 className="text-sm font-bold text-brand mt-4 mb-2">3. Next of Kin</h3>
                            <div className="form-grid">
                                <div className="form-group">
                                    <label className="form-label">NOK Name</label>
                                    <input name="nokName" value={formData.nokName} onChange={handleInputChange} className="input-field" placeholder="Full Name" />
                                </div>
                                <div className="form-group">
                                    <label className="form-label">NOK Phone</label>
                                    <input name="nokPhone" value={formData.nokPhone} onChange={handleInputChange} className="input-field" placeholder="080..." />
                                </div>
                            </div>

                            <div className="btn-row">
                                <button onClick={() => setStep(2)} className="btn btn-outline btn-lg">Back</button>
                                <button 
                                    onClick={handleSubmit} 
                                    disabled={loading || formData.refereePhone1.length >= 11 && !refereeStatus.refereePhone1.verified}
                                    className="btn btn-primary btn-lg flex-center"
                                >
                                    {loading ? <Loader className="animate-spin" /> : 'Submit Application'}
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

