import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import { Camera, Package, Store, Calendar, ArrowLeft, Phone, MapPin, Upload, X, User, DollarSign } from 'lucide-react';
import { useToast } from '../context/ToastContext';
import { useAuth } from '../context/AuthContext';
import './AgentAAPCreate.css';

const AgentAAPCreate = () => {
    const navigate = useNavigate();
    const { addToast } = useToast();
    const { user: currentUser } = useAuth();
    const [loading, setLoading] = useState(false);
    const [step, setStep] = useState(1); // 1: Product, 2: Seller, 3: Term & Submit
    const [photos, setPhotos] = useState([]);
    const [form, setForm] = useState({
        productName: '',
        productDescription: '',
        quantity: 1,
        purchasePrice: '',
        sellerName: '',
        sellerPhone: '',
        sellerLocation: '',
        repaymentTerm: 14,
        retailerId: null
    });

    const [phone, setPhone] = useState('');
    const [retailer, setRetailer] = useState(null);
    const [searching, setSearching] = useState(false);
    const [lookupError, setLookupError] = useState(false);

    const determineMarkup = (score, termDays = 14) => {
        let baseMarkup = 15.0;
        if (score >= 80) baseMarkup = 5.0;
        else if (score >= 60) baseMarkup = 8.0;
        else if (score >= 40) baseMarkup = 12.0;

        let termMultiplier = 1.0;
        if (termDays <= 3) termMultiplier = 0.5;
        else if (termDays <= 7) termMultiplier = 0.75;

        return Math.max(baseMarkup * termMultiplier, 4.0);
    };

    const handlePhoneChange = async (val) => {
        setPhone(val);
        setLookupError(false);
        if (val.length >= 10) {
            setSearching(true);
            try {
                const res = await api.get(`/aap/find-retailer?phone=${val}`);
                
                if (res.data._id === currentUser?._id) {
                    setRetailer(null);
                    setForm(prev => ({ ...prev, retailerId: null }));
                    addToast('You cannot create an Agent-Assisted Purchase for yourself.', 'error');
                    return;
                }

                setRetailer(res.data);
                setForm(prev => ({ ...prev, retailerId: res.data._id }));
                addToast('Retailer found!', 'success');
            } catch (err) {
                setRetailer(null);
                setForm(prev => ({ ...prev, retailerId: null }));
                if (err.response?.status === 404) {
                    setLookupError(true);
                }
            } finally {
                setSearching(false);
            }
        } else {
            setRetailer(null);
            setForm(prev => ({ ...prev, retailerId: null }));
        }
    };

    const handlePhotoUpload = async (e) => {
        const files = Array.from(e.target.files);
        if (photos.length + files.length > 10) {
            addToast('Maximum 10 photos allowed', 'warning');
            return;
        }

        // Add placeholders with loading state
        const startingIndex = photos.length;
        const placeholders = files.map((_, i) => ({
            id: `temp-${startingIndex + i}`,
            url: null,
            loading: true
        }));
        setPhotos(prev => [...prev, ...placeholders]);

        // Upload each file immediately
        for (let i = 0; i < files.length; i++) {
            const formData = new FormData();
            formData.append('image', files[i]);

            try {
                const res = await api.post('/upload', formData, {
                    headers: { 'Content-Type': 'multipart/form-data' }
                });
                
                const uploadedUrl = res.data.url;
                setPhotos(prev => prev.map(p => 
                    p.id === `temp-${startingIndex + i}` ? { id: res.data.url, url: res.data.url, loading: false } : p
                ));
            } catch (error) {
                addToast(`Failed to upload photo ${i + 1}`, 'error');
                setPhotos(prev => prev.filter(p => p.id !== `temp-${startingIndex + i}`));
            }
        }
    };

    const removePhoto = (photoId) => {
        setPhotos(photos.filter(p => (p.url || p.id) !== photoId));
    };

    const handleSubmit = async () => {
        if (!form.productName.trim() || !form.purchasePrice) {
            addToast('Please fill in required fields', 'error');
            return;
        }

        const uploadedPhotos = photos.filter(p => !p.loading).map(p => p.url);
        if (uploadedPhotos.length === 0) {
            addToast('At least one photo is required', 'error');
            return;
        }

        setLoading(true);
        try {
            const res = await api.post('/aap', {
                ...form,
                productPhotos: uploadedPhotos,
                quantity: parseInt(form.quantity),
                purchasePrice: parseFloat(form.purchasePrice),
                sellerName: form.sellerName.trim(),
                sellerPhone: form.sellerPhone.trim(),
                sellerLocation: form.sellerLocation.trim(),
                repaymentTerm: form.repaymentTerm,
                retailerId: form.retailerId
            });

            addToast('Purchase created and linked successfully!', 'success');
            navigate(`/agent/aap/${res.data._id}`);
        } catch (error) {
            addToast(error.response?.data?.message || 'Failed to create', 'error');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="aap-create-container">
            <header className="aap-create-header">
                <button className="back-btn" onClick={() => navigate('/agent/tasks')}>
                    <ArrowLeft size={20} />
                </button>
                <div>
                    <h1>New Agent Purchase</h1>
                    <p>Capture product for off-platform purchase</p>
                </div>
            </header>

            {/* Progress Steps */}
            <div className="step-progress">
                <div className={`step ${step >= 1 ? 'active' : ''}`}>
                    <span className="step-num">1</span>
                    <span className="step-label">Product</span>
                </div>
                <div className="step-line"></div>
                <div className={`step ${step >= 2 ? 'active' : ''}`}>
                    <span className="step-num">2</span>
                    <span className="step-label">Seller</span>
                </div>
                <div className="step-line"></div>
                <div className={`step ${step >= 3 ? 'active' : ''}`}>
                    <span className="step-num">3</span>
                    <span className="step-label">Terms</span>
                </div>
            </div>

            {/* Step 1: Product Details */}
            {step === 1 && (
                <div className="step-content">
                    <div className="form-section">
                        <div className="section-header">
                            <Camera size={18} />
                            <h3>Product Photos</h3>
                        </div>
                        <p className="section-hint">Add 1-10 photos of the product</p>

                        <div className="photo-grid">
                    {photos.map((photo, index) => (
                        <div key={photo.id || index} className="photo-item">
                            {photo.loading ? (
                                <div className="photo-skeleton animate-pulse">
                                    <Upload size={20} className="animate-bounce" />
                                </div>
                            ) : (
                                <img src={photo.url} alt="Product" />
                            )}
                            <button 
                                className="remove-photo" 
                                onClick={() => removePhoto(photo.url || photo.id)}
                                type="button"
                            >
                                <X size={14} />
                            </button>
                        </div>
                    ))}
                    {photos.length < 10 && (
                        <label className="photo-upload-btn">
                            <Upload size={24} />
                            <span>Add Photo</span>
                            <input
                                type="file"
                                accept="image/*"
                                multiple
                                onChange={handlePhotoUpload}
                                style={{ display: 'none' }}
                                disabled={loading}
                            />
                        </label>
                    )}
                </div>
                    </div>

                    <div className="form-section">
                        <div className="section-header">
                            <Package size={18} />
                            <h3>Product Details</h3>
                        </div>

                        <div className="form-group">
                            <label className="form-label">Product Name *</label>
                            <input
                                type="text"
                                className="form-control"
                                value={form.productName}
                                onChange={(e) => setForm({ ...form, productName: e.target.value })}
                                placeholder="e.g. Bag of Rice 50kg"
                            />
                        </div>

                        <div className="form-group">
                            <label className="form-label">Description</label>
                            <textarea
                                className="form-control"
                                value={form.productDescription}
                                onChange={(e) => setForm({ ...form, productDescription: e.target.value })}
                                placeholder="Optional product details"
                                rows={3}
                            />
                        </div>

                        <div className="form-row">
                            <div className="form-group">
                                <label className="form-label">Quantity</label>
                                <input
                                    type="number"
                                    className="form-control"
                                    value={form.quantity}
                                    onChange={(e) => setForm({ ...form, quantity: e.target.value })}
                                    min={1}
                                />
                            </div>
                            <div className="form-group">
                                <label className="form-label">Price (₦) *</label>
                                <input
                                    type="number"
                                    className="form-control"
                                    value={form.purchasePrice}
                                    onChange={(e) => setForm({ ...form, purchasePrice: e.target.value })}
                                    placeholder="e.g. 25000"
                                />
                            </div>
                        </div>
                    </div>

                    <button 
                        className="btn-primary" 
                        onClick={() => {
                            if (!form.productName.trim() || !form.purchasePrice) {
                                addToast('Product name and price are required', 'warning');
                                return;
                            }
                            if (photos.length === 0) {
                                addToast('At least one product photo is required', 'warning');
                                return;
                            }
                            setStep(2);
                        }}
                    >
                        Continue to Seller Info
                    </button>
                </div>
            )}

            {/* Step 2: Buyer & Seller Info */}
            {step === 2 && (
                <div className="step-content">
                    <div className="form-section">
                        <div className="section-header">
                            <User size={18} />
                            <h3>Retailer (Buyer)</h3>
                        </div>
                        <p className="section-hint">Enter the retailer's phone number to link this purchase</p>
                        
                        <div className="form-group">
                            <label className="form-label">Retailer Phone Number</label>
                            <div className="input-icon-wrapper">
                                <Phone size={16} className="input-icon" />
                                <input
                                    type="tel"
                                    className="form-control with-icon"
                                    value={phone}
                                    onChange={(e) => handlePhoneChange(e.target.value)}
                                    placeholder="08012345678"
                                />
                                {searching ? (
                                    <div className="input-loader"></div>
                                ) : lookupError ? (
                                    <X size={16} className="input-icon-right text-error" />
                                ) : retailer ? (
                                    <Package size={16} className="input-icon-right text-primary" />
                                ) : null}
                            </div>
                        </div>

                        {lookupError && (
                            <div className="lookup-error-box animate-scale-in">
                                <p>No approved retailer found with this number</p>
                            </div>
                        )}

                        {retailer && (
                            <div className="retailer-preview animate-scale-in">
                                <div className="retailer-avatar">
                                    {retailer.name.charAt(0)}
                                </div>
                                <div className="retailer-info">
                                    <h4>{retailer.name}</h4>
                                    <p>{retailer.businessInfo?.businessName || 'Independent Retailer'}</p>
                                    <div className="retailer-stats-mini">
                                        <span className="score">Score: {retailer.amanaScore}</span>
                                        <span className="credit">Limit: ₦{(retailer.creditLimit - retailer.usedCredit).toLocaleString()}</span>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>

                    <div className="form-section">
                        <div className="section-header">
                            <Store size={18} />
                            <h3>Seller Information</h3>
                        </div>

                        <div className="form-group">
                            <label className="form-label">Seller Name</label>
                            <input
                                type="text"
                                className="form-control"
                                value={form.sellerName}
                                onChange={(e) => setForm({ ...form, sellerName: e.target.value })}
                                placeholder="e.g. Alhaji Musa"
                            />
                        </div>

                        <div className="form-row">
                            <div className="form-group">
                                <label className="form-label">Seller Phone</label>
                                <input
                                    type="tel"
                                    className="form-control"
                                    value={form.sellerPhone}
                                    onChange={(e) => setForm({ ...form, sellerPhone: e.target.value })}
                                    placeholder="08012345678"
                                />
                            </div>
                            <div className="form-group">
                                <label className="form-label">Location</label>
                                <input
                                    type="text"
                                    className="form-control"
                                    value={form.sellerLocation}
                                    onChange={(e) => setForm({ ...form, sellerLocation: e.target.value })}
                                    placeholder="e.g. Wuse Market"
                                />
                            </div>
                        </div>
                    </div>

                    <div className="btn-row">
                        <button className="btn-secondary" onClick={() => setStep(1)}>
                            Back
                        </button>
                        <button 
                            className="btn-primary" 
                            onClick={() => {
                                if (!form.retailerId) {
                                    addToast('Please find a valid retailer first', 'warning');
                                    return;
                                }
                                if (!form.sellerName.trim() || !form.sellerLocation.trim()) {
                                    addToast('Seller name and location are required', 'warning');
                                    return;
                                }
                                setStep(3);
                            }}
                        >
                            Continue to Terms
                        </button>
                    </div>
                </div>
            )}

            {/* Step 3: Repayment & Cost Review */}
            {step === 3 && (
                <div className="step-content">
                    <div className="form-section">
                        <div className="section-header">
                            <Calendar size={18} />
                            <h3>Repayment Term</h3>
                        </div>
                        <p className="section-hint">Select the repayment period. Markup adjusts based on term.</p>

                        <div className="term-options">
                            {[3, 7, 14].map((term) => (
                                <button
                                    key={term}
                                    className={`term-btn ${form.repaymentTerm === term ? 'active' : ''}`}
                                    onClick={() => setForm({ ...form, repaymentTerm: term })}
                                >
                                    <span className="term-days">{term}</span>
                                    <span className="term-label">Days</span>
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Logic Integration: Cost Breakdown */}
                    <div className="form-section cost-breakdown-section animate-slide-up">
                        <div className="section-header">
                            <DollarSign size={18} />
                            <h3>Cost Breakdown</h3>
                        </div>
                        
                        <div className="breakdown-card">
                            <div className="breakdown-line">
                                <span>Product Price</span>
                                <span>₦{parseFloat(form.purchasePrice).toLocaleString()}</span>
                            </div>
                            <div className="breakdown-line">
                                <span>Murabaha Markup ({determineMarkup(retailer.amanaScore, form.repaymentTerm)}%)</span>
                                <span className="text-primary">+ ₦{(parseFloat(form.purchasePrice) * determineMarkup(retailer.amanaScore, form.repaymentTerm) / 100).toLocaleString()}</span>
                            </div>
                            <div className="breakdown-line total">
                                <span>Total Retailer Cost</span>
                                <span>₦{(parseFloat(form.purchasePrice) * (1 + determineMarkup(retailer.amanaScore, form.repaymentTerm) / 100)).toLocaleString()}</span>
                            </div>
                        </div>

                        <div className="credit-check-status">
                            { (parseFloat(form.purchasePrice) * (1 + determineMarkup(retailer.amanaScore, form.repaymentTerm) / 100)) <= (retailer.creditLimit - retailer.usedCredit) ? (
                                <p className="credit-ok">✓ Retailer has sufficient credit</p>
                            ) : (
                                <p className="credit-error">⚠ Insufficient credit (Available: ₦{(retailer.creditLimit - retailer.usedCredit).toLocaleString()})</p>
                            )}
                        </div>
                    </div>

                    <div className="btn-row">
                        <button className="btn-secondary" onClick={() => setStep(2)}>
                            Back
                        </button>
                        <button 
                            className="btn-primary" 
                            onClick={handleSubmit}
                            disabled={loading || (parseFloat(form.purchasePrice) * (1 + determineMarkup(retailer.amanaScore, form.repaymentTerm) / 100)) > (retailer.creditLimit - retailer.usedCredit)}
                        >
                            {loading ? 'Creating...' : 'Finalize & Request Purchase'}
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AgentAAPCreate;
