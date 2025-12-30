import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import api from '../services/api';
import { Search, User, ArrowLeft, Shield, AlertCircle, CheckCircle } from 'lucide-react';
import { useToast } from '../context/ToastContext';
import { useAuth } from '../context/AuthContext';
import './AgentAAPLink.css';

const AgentAAPLink = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { addToast } = useToast();
    const { user: currentUser } = useAuth();
    const [aap, setAAP] = useState(null);
    const [phone, setPhone] = useState('');
    const [retailer, setRetailer] = useState(null);
    const [loading, setLoading] = useState(true);
    const [searching, setSearching] = useState(false);
    const [linking, setLinking] = useState(false);
    const [selectedTerm, setSelectedTerm] = useState(14);
    const [step, setStep] = useState(1); // 1: Search, 2: Review

    const fetchData = async () => {
        setLoading(true);
        try {
            const res = await api.get(`/aap/${id}`);
            setAAP(res.data);
            if (res.data.repaymentTerm) setSelectedTerm(res.data.repaymentTerm);
        } catch (error) {
            addToast('Failed to load purchase details', 'error');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, [id]);

    const handlePhoneSearch = async (val) => {
        setPhone(val);
        if (val.length >= 10) {
            setSearching(true);
            try {
                const res = await api.get(`/aap/find-retailer?phone=${val}`);
                
                if (res.data._id === currentUser?._id) {
                    setRetailer(null);
                    addToast('You cannot link yourself as the retailer for a purchase.', 'error');
                    return;
                }

                setRetailer(res.data);
            } catch (error) {
                setRetailer(null);
            } finally {
                setSearching(false);
            }
        } else {
            setRetailer(null);
        }
    };

    const calculateMarkupPreview = () => {
        if (!retailer || !aap) return { percentage: 0, amount: 0, total: 0 };
        
        // Mirror server-side determineMarkup logic
        const score = retailer.amanaScore;
        let baseMarkup = 15.0;
        if (score >= 80) baseMarkup = 5.0;
        else if (score >= 60) baseMarkup = 8.0;
        else if (score >= 40) baseMarkup = 12.0;

        let termMultiplier = 1.0;
        if (selectedTerm <= 3) termMultiplier = 0.5;
        else if (selectedTerm <= 7) termMultiplier = 0.75;

        const percentage = Math.max(baseMarkup * termMultiplier, 4.0);
        const amount = aap.purchasePrice * (percentage / 100);
        const total = aap.purchasePrice + amount;

        return { percentage, amount, total };
    };

    const handleLink = async () => {
        if (!retailer) return;
        
        setLinking(true);
        try {
            await api.put(`/aap/${id}/link-retailer`, {
                retailerId: retailer._id,
                repaymentTerm: selectedTerm
            });
            addToast('Retailer linked! Awaiting their confirmation.', 'success');
            navigate('/agent/tasks');
        } catch (error) {
            addToast(error.response?.data?.message || 'Failed to link retailer', 'error');
        } finally {
            setLinking(false);
        }
    };

    const breakdown = calculateMarkupPreview();

    if (loading) return <div className="loading-state">Loading purchase details...</div>;

    return (
        <div className="aap-link-container animate-fade-in">
            <header className="aap-link-header">
                <button className="back-btn" onClick={() => navigate('/agent/tasks')}>
                    <ArrowLeft size={20} />
                </button>
                <div>
                    <h1>Step 2: Link Retailer</h1>
                    <p>Assign a retailer to this purchase request</p>
                </div>
            </header>

            <div className="aap-link-content">
                {step === 1 ? (
                    <div className="lookup-section">
                        <h2 className="step-title">Who is buying this?</h2>
                        <p className="step-desc">Enter the retailer's phone number to pull their profile and check credit eligibility.</p>

                        <div className="search-box-premium glass-panel">
                            <Phone className="search-icon" size={20} />
                            <input
                                type="text"
                                placeholder="Retailer Phone Number"
                                value={phone}
                                onChange={(e) => handlePhoneSearch(e.target.value)}
                                className="search-input"
                                autoFocus
                            />
                            {searching && <div className="spinner-small"></div>}
                        </div>

                        {retailer ? (
                            <div className="retailer-preview-card glass-panel animate-slide-up">
                                <div className="retailer-main">
                                    <div className="retailer-avatar">
                                        {retailer.kyc?.profilePicUrl ? (
                                            <img src={retailer.kyc.profilePicUrl} alt={retailer.name} />
                                        ) : (
                                            retailer.name.charAt(0)
                                        )}
                                    </div>
                                    <div className="retailer-info">
                                        <h3>{retailer.name}</h3>
                                        <p>{retailer.businessInfo?.businessName || 'Verified Retailer'}</p>
                                        <div className="score-badge-small">
                                            <Shield size={12} />
                                            <span>Trust Score: {retailer.amanaScore}</span>
                                        </div>
                                    </div>
                                </div>
                                <div className="retailer-stats">
                                    <div className="stat-item">
                                        <label>Available Credit</label>
                                        <span>₦{(retailer.creditLimit - retailer.usedCredit).toLocaleString()}</span>
                                    </div>
                                </div>
                                <button className="btn-next" onClick={() => setStep(2)}>
                                    Proceed to Review <ArrowLeft size={16} className="rotate-180" />
                                </button>
                            </div>
                        ) : phone.length >= 10 && !searching && (
                            <div className="not-found-state animate-fade-in">
                                <AlertCircle size={32} />
                                <p>No approved retailer found with this number.</p>
                                <span className="helper-text">Make sure the retailer is verified by Amana.</span>
                            </div>
                        )}
                    </div>
                ) : (
                    <div className="review-section animate-slide-up">
                        <div className="review-header">
                            <h2 className="step-title">Cost Review</h2>
                            <button className="btn-edit-retailer" onClick={() => setStep(1)}>
                                Change Retailer
                            </button>
                        </div>

                        <div className="breakdown-card-premium glass-panel">
                            <div className="breakdown-row">
                                <span className="label">Actual Product Price</span>
                                <span className="value">₦{aap.purchasePrice?.toLocaleString()}</span>
                            </div>

                            <div className="term-selector-group">
                                <label>Repayment Term</label>
                                <div className="term-pills">
                                    {[3, 7, 14].map(t => (
                                        <button 
                                            key={t}
                                            className={`term-pill ${selectedTerm === t ? 'active' : ''}`}
                                            onClick={() => setSelectedTerm(t)}
                                        >
                                            {t} Days
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <div className="markup-highlight">
                                <div className="breakdown-row">
                                    <span className="label">Murabaha Markup ({breakdown.percentage}%)</span>
                                    <span className="value text-primary">+ ₦{breakdown.amount.toLocaleString()}</span>
                                </div>
                                <p className="markup-note">Based on {retailer.name}'s score and {selectedTerm}-day term.</p>
                            </div>

                            <div className="breakdown-divider"></div>

                            <div className="breakdown-row total">
                                <span className="label">Retailer Total</span>
                                <span className="value text-primary">₦{breakdown.total.toLocaleString()}</span>
                            </div>
                        </div>

                        <div className="action-buttons">
                            <button 
                                className="btn-confirm-link"
                                onClick={handleLink}
                                disabled={linking}
                            >
                                {linking ? 'Processing...' : 'Confirm & Request Purchase'}
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default AgentAAPLink;
