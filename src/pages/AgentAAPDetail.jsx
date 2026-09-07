import React, { useState, useEffect, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import api from '../services/api';
import { 
    Package, MapPin, Store, Calendar, ArrowLeft, 
    CheckCircle, Clock, AlertCircle, ShieldCheck, DollarSign, User,
    Phone, Mail, Smartphone, CreditCard, UploadCloud, XCircle, FileText,
    AlertTriangle, X, Copy, Check, Camera, Building, Trash2,
    ExternalLink, Eye, ZoomIn
} from 'lucide-react';
import { useToast } from '../context/ToastContext';
import { useAuth } from '../context/AuthContext';
import RepayModal from '../components/RepayModal';
import TraderCreditCard from '../components/TraderCreditCard';
import './AgentAAPDetail.css';

const CANCELLATION_PRESETS = [
    'Trader changed their mind',
    'Goods unavailable / out of stock',
    'Supplier price changed unexpectedly',
    'Duplicate purchase order',
    'Trader requested order alteration'
];

const AgentAAPDetail = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const location = useLocation();
    const { addToast } = useToast();
    const { user } = useAuth();
    
    const [aap, setAAP] = useState(null);
    const [loading, setLoading] = useState(true);
    const [actionLoading, setActionLoading] = useState(false);
    const [repayModalOpen, setRepayModalOpen] = useState(false);
    const refundInputRef = React.useRef(null);
    const [showCancelModal, setShowCancelModal] = useState(false);
    const [cancelReason, setCancelReason] = useState('');
    const [refundProofFile, setRefundProofFile] = useState(null);
    const [refundProofPreview, setRefundProofPreview] = useState(null);
    const [copiedAccount, setCopiedAccount] = useState(false);

    // Lightbox / Image inspection state
    const [inspectImage, setInspectImage] = useState(null);
    const [inspectTitle, setInspectTitle] = useState('');

    // Handle ESC key to dismiss modal stack in reverse order and lock body scroll
    useEffect(() => {
        const anyModalOpen = !!(showCancelModal || inspectImage);
        if (!anyModalOpen) return;

        const handleKeyDown = (e) => {
            if (e.key === 'Escape') {
                if (inspectImage) {
                    setInspectImage(null);
                } else if (showCancelModal) {
                    if (!actionLoading) setShowCancelModal(false);
                }
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        const origOverflow = document.body.style.overflow;
        document.body.style.overflow = 'hidden';

        return () => {
            window.removeEventListener('keydown', handleKeyDown);
            document.body.style.overflow = origOverflow;
        };
    }, [showCancelModal, inspectImage, actionLoading]);

    const fetchAAP = useCallback(async () => {
        try {
            const res = await api.get(`/aap/${id}`);
            setAAP(res.data);
        } catch (error) {
            addToast('Failed to load purchase details', 'error');
            console.error(error);
        } finally {
            setLoading(false);
        }
    }, [id, addToast]);

    useEffect(() => {
        fetchAAP();
    }, [fetchAAP]);

    // Auto-verify payment if redirected with a reference
    useEffect(() => {
        const params = new URLSearchParams(location.search);
        const reference = params.get('reference');
        
        if (reference) {
            const verifyPayment = async () => {
                try {
                    const { data } = await api.get(`/payment/verify?reference=${reference}`);
                    if (data.status === 'success') {
                        addToast('Payment verified successfully!', 'success');
                        fetchAAP(); // Refresh AAP data
                    }
                } catch (error) {
                    console.error('Auto-verify failed:', error);
                }
                // Clean up URL
                navigate(location.pathname, { replace: true });
            };
            verifyPayment();
        }
    }, [location.search, addToast, fetchAAP, navigate, location.pathname]);

    const handleSendMurabahaOffer = async () => {
        const confirmMsg = `Send Murabaha offer to ${aap?.retailer?.name || 'retailer'}?\n\n━━━━━━━━━━━━━━━━\nAmana Purchased: ₦${(aap?.purchasePrice || 0).toLocaleString()}\nMarkup (${aap?.markupPercentage || 0}%): +₦${(aap?.markupAmount || 0).toLocaleString()}\nSelling Price: ₦${(aap?.totalRetailerCost || 0).toLocaleString()}\nRepayment: ${aap?.repaymentTerm || 0} days\n━━━━━━━━━━━━━━━━\n\nThe retailer must accept on their app, or use Proxy Accept.`;
        if (!window.confirm(confirmMsg)) return;
        
        setActionLoading(true);
        try {
            const res = await api.put(`/aap/${id}/send-murabaha-offer`);
            addToast(res.data.message || 'Murabaha offer sent!', 'success');
            fetchAAP();
        } catch (error) {
            addToast(error.response?.data?.message || 'Failed to send Murabaha offer', 'error');
        } finally {
            setActionLoading(false);
        }
    };

    const handleMarkDelivered = async () => {
        if (!window.confirm('Mark goods as delivered and generate pickup OTP for retailer to enter?')) return;
        
        setActionLoading(true);
        try {
            const res = await api.put(`/aap/${id}/deliver`);
            addToast('Successfully marked as delivered!', 'success');
            alert(`SHARE THIS OTP WITH RETAILER: ${res.data.pickupCode}`);
            fetchAAP();
        } catch (error) {
            addToast(error.response?.data?.message || 'Failed to update status', 'error');
        } finally {
            setActionLoading(false);
        }
    };

    const handleCancel = async () => {
        if (!window.confirm('Are you sure you want to cancel this purchase? This action cannot be undone.')) return;
        setActionLoading(true);
        try {
            await api.put(`/aap/${id}/cancel`, { reason: 'Cancelled by agent' });
            addToast('Purchase cancelled', 'info');
            fetchAAP();
        } catch (error) {
            addToast(error.response?.data?.message || 'Failed to cancel', 'error');
        } finally {
            setActionLoading(false);
        }
    };

    const handleRequestCancellation = () => {
        setCancelReason('');
        setRefundProofFile(null);
        setRefundProofPreview(null);
        setCopiedAccount(false);
        if (refundInputRef.current) {
            refundInputRef.current.value = '';
        }
        setShowCancelModal(true);
    };

    const handleCopyAccount = (accountNum = '6042197639') => {
        navigator.clipboard.writeText(accountNum);
        setCopiedAccount(true);
        addToast('Treasury account copied to clipboard', 'info');
        setTimeout(() => setCopiedAccount(false), 2500);
    };

    const handleClearRefundProof = (e) => {
        e?.stopPropagation();
        setRefundProofFile(null);
        setRefundProofPreview(null);
        if (refundInputRef.current) {
            refundInputRef.current.value = '';
        }
    };

    const handleRefundFileChange = (e) => {
        const file = e.target.files[0];
        if (!file) return;
        if (file.size > 5 * 1024 * 1024) {
            addToast('File too large (Max 5MB)', 'warning');
            return;
        }
        setRefundProofFile(file);
        setRefundProofPreview(URL.createObjectURL(file));
    };

    const submitCancellationRequest = async () => {
        if (!cancelReason.trim() || cancelReason.trim().length < 5) {
            addToast('Please provide a reason (at least 5 characters)', 'error');
            return;
        }
        if (!refundProofFile) {
            addToast('Please upload the receipt/proof of refund', 'error');
            return;
        }
        setActionLoading(true);
        try {
            const proofUrl = await handleUploadProof(refundProofFile);
            await api.put(`/aap/${id}/request-cancellation`, {
                reason: cancelReason.trim(),
                refundProofUrl: proofUrl
            });
            addToast('Cancellation request submitted. Admin will confirm shortly.', 'success');
            setShowCancelModal(false);
            fetchAAP();
        } catch (error) {
            addToast(error.response?.data?.message || 'Failed to request cancellation', 'error');
        } finally {
            setActionLoading(false);
        }
    };

    const handleUploadProof = async (file) => {
        const formData = new FormData();
        formData.append('image', file);
        const res = await api.post('/upload', formData, {
            headers: { 'Content-Type': 'multipart/form-data' }
        });
        return res.data.url;
    };

    if (loading) return (
        <div className="aap-detail-loading">
            <div className="spinner"></div>
            <p>Loading purchase records...</p>
        </div>
    );

    if (!aap) return (
        <div className="aap-detail-error">
            <AlertCircle size={48} />
            <h2>Purchase Not Found</h2>
            <button onClick={() => navigate('/agent/tasks')} className="btn-secondary">
                Back to Dashboard
            </button>
        </div>
    );

    const isAgent = user?.isAgent && aap.agent?._id === user?._id;

    const getStatusConfig = (status) => {
        const configs = {
            draft: { color: '#94a3b8', label: 'Draft', icon: <Clock size={14} /> },
            awaiting_retailer_confirm: { color: '#f59e0b', label: 'Awaiting Deed of Undertaking', icon: <Clock size={14} /> },
            pending_admin_approval: { color: '#8b5cf6', label: 'Undertaking Signed · Admin Review', icon: <ShieldCheck size={14} /> },
            fund_disbursed: { color: '#10b981', label: 'Funds Disbursed · Sourcing Goods', icon: <DollarSign size={14} /> },
            pending_murabaha_acceptance: { color: '#f59e0b', label: 'Murabaha Contract Pending', icon: <Clock size={14} /> },
            murabaha_accepted: { color: '#10b981', label: 'Murabaha Contract Concluded', icon: <CheckCircle size={14} /> },
            delivered: { color: '#3b82f6', label: 'Delivered', icon: <Package size={14} /> },
            received: { color: '#10b981', label: 'Received', icon: <CheckCircle size={14} /> },
            completed: { color: '#10b981', label: 'Completed', icon: <CheckCircle size={14} /> },
            declined: { color: '#ef4444', label: 'Declined', icon: <AlertCircle size={14} /> },
            expired: { color: '#ef4444', label: 'Expired', icon: <Clock size={14} /> },
            cancelled: { color: '#6b7280', label: 'Cancelled', icon: <XCircle size={14} /> },
            cancellation_requested: { color: '#f59e0b', label: 'Cancellation Pending', icon: <Clock size={14} /> }
        };
        return configs[status] || configs.draft;
    };

    const statusConfig = getStatusConfig(aap.status);

    return (
        <div className="aap-detail-container animate-fade-in">
            <div className="page-hero">
                <button onClick={() => navigate(-1)} className="back-btn-ghost">
                    <ArrowLeft size={20} />
                </button>
                <div className="page-hero-icon">
                    <FileText size={24} />
                </div>
                <div className="page-hero-body">
                    <h1 className="page-hero-title">Purchase Details</h1>
                    <p className="page-hero-subtitle">REF: #AMN-{aap._id.substring(aap._id.length - 8).toUpperCase()}</p>
                </div>
                <div className="page-hero-actions">
                    <div className="status-pill" style={{ color: statusConfig.color, background: `${statusConfig.color}15`, borderColor: `${statusConfig.color}30` }}>
                        {statusConfig.icon}
                        <span>{statusConfig.label}</span>
                    </div>
                </div>
            </div>

            <div className="aap-detail-grid">
                <div className="main-info">
                    {/* Cancellation Report Card */}
                    {aap.status === 'cancelled' && (
                        <div className="detail-card cancellation-card animate-slide-up">
                            <div className="cancellation-header">
                                <div className="cancellation-icon-glow">
                                    <XCircle size={24} color="#ef4444" />
                                </div>
                                <div>
                                    <span className="cancellation-badge">TRANSACTION CANCELLED</span>
                                    <h3 className="cancellation-title">This purchase was cancelled</h3>
                                    <p className="cancellation-sub">
                                        Cancelled on {new Date(aap.cancelledAt || aap.updatedAt).toLocaleString()}
                                    </p>
                                </div>
                            </div>
                            <div className="cancellation-body">
                                <div className="cancellation-meta-grid">
                                    <div className="cancellation-meta-item">
                                        <span className="cm-label">Cancelled By:</span>
                                        <span className="cm-val">
                                            {aap.cancelledBy?.name || (aap.cancelReason?.toLowerCase().includes('trader') ? 'Trader' : 'Agent / Admin')}
                                            {aap.cancelledBy?.role && <span className="cm-role-tag">({aap.cancelledBy.role})</span>}
                                        </span>
                                    </div>
                                    <div className="cancellation-meta-item">
                                        <span className="cm-label">Cancellation Reason:</span>
                                        <p className="cm-reason-quote">"{aap.cancelReason || 'No specific cancellation reason provided.'}"</p>
                                    </div>
                                </div>
                                {aap.traderRequestNote && (
                                    <div className="cancellation-note-item" style={{ marginTop: '0.75rem', paddingTop: '0.75rem', borderTop: '1px solid rgba(255,255,255,0.08)' }}>
                                        <span className="cm-label" style={{ display: 'block', marginBottom: '0.25rem', color: 'var(--color-text-tertiary)', fontSize: '0.75rem', textTransform: 'uppercase', fontWeight: 700 }}>Original Trader Request:</span>
                                        <p style={{ margin: 0, fontStyle: 'italic', color: 'var(--color-text-secondary)', fontSize: '0.88rem' }}>"{aap.traderRequestNote}"</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}

                    {/* Photos Section */}
                    {aap.productPhotos && aap.productPhotos.length > 0 && (
                        <div className="detail-card photo-section">
                            <div className="photo-stagger">
                                {aap.productPhotos?.map((url, i) => (
                                    <div key={i} className="photo-frame">
                                        <img 
                                            src={url} 
                                            alt={`Product ${i+1}`} 
                                            style={{ cursor: 'pointer' }}
                                            onClick={() => {
                                                setInspectImage(url);
                                                setInspectTitle(`Product Photo ${i+1}`);
                                            }} 
                                            title="Click to inspect photo"
                                        />
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Product & Terms */}
                    <div className="detail-card product-card">
                        <div className="card-header">
                            <Package size={18} className="text-primary" />
                            <h3>Product & Terms</h3>
                        </div>
                        <div className="product-info-box">
                            <h2>{aap.productName}</h2>
                            <p className="description">{aap.productDescription || 'No description provided.'}</p>
                            
                            <div className="info-row-grid">
                                <div className="info-cell">
                                    <span className="label">Term</span>
                                    <span className="value">{aap.repaymentTerm} Days</span>
                                </div>
                                <div className="info-cell">
                                    <span className="label">Created At</span>
                                    <span className="value">{new Date(aap.createdAt).toLocaleDateString()}</span>
                                </div>
                            </div>

                            <div className="cost-breakdown-web">
                                <div className="breakdown-line">
                                    <span>Purchase Price</span>
                                    <strong>₦{aap.purchasePrice?.toLocaleString()}</strong>
                                </div>
                                {aap.markupAmount && (
                                    <div className="breakdown-line markup">
                                        <span>Amana Markup ({aap.markupPercentage}%)</span>
                                        <strong>+ ₦{aap.markupAmount?.toLocaleString()}</strong>
                                    </div>
                                )}
                                <div className="breakdown-line total">
                                    <span>Retailer Total</span>
                                    <strong className="text-primary">₦{aap.totalRetailerCost?.toLocaleString()}</strong>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Delivery / OTP Actions */}
                    {isAgent && (
                        <div className="detail-card actions-card">
                            <div className="card-header">
                                <ShieldCheck size={18} className="text-primary" />
                                <h3>Agent Operations</h3>
                            </div>
                            
                            {/* Step 1: Awaiting Trader Deed of Undertaking */}
                            {aap.status === 'awaiting_retailer_confirm' && (
                                 <div className="action-box warning-box">
                                     <p style={{ fontWeight: 600, marginBottom: 4 }}>
                                         <Clock size={16} style={{ marginRight: 6 }} />
                                         Awaiting Trader Deed of Undertaking (Wa'd)
                                     </p>
                                     <p style={{ fontSize: '0.85rem', opacity: 0.8, marginBottom: 12 }}>
                                         The trader must log into their Amana app and review & execute the Deed of Undertaking (Wa'd) to commit to purchase under Murabaha once goods are acquired.
                                     </p>
                                     <div className="direct-mobile-notice">
                                         <Smartphone size={14} />
                                         <span>Trader signs the Deed of Undertaking directly on their smartphone or Amana app.</span>
                                     </div>
                                 </div>
                            )}

                            {/* Step 2: Send Murabaha Contract */}
                            {aap.status === 'fund_disbursed' && (
                                <div className="action-box success-box">
                                    <p style={{ fontWeight: 600, marginBottom: 8 }}>
                                        <DollarSign size={16} style={{ marginRight: 6 }} />
                                        Funds Disbursed — Purchase Goods & Send Murabaha Contract
                                    </p>
                                    <p style={{ fontSize: '0.85rem', opacity: 0.8, marginBottom: 12 }}>
                                        Purchase the requested goods from the seller, then issue the Murabaha Contract for the trader to review and sign on their app.
                                    </p>
                                    {aap.expiresAt && (
                                        <p style={{ fontSize: '0.8rem', color: '#f59e0b', marginBottom: 12 }}>
                                            <Clock size={14} style={{ marginRight: 4 }} />
                                            Time remaining: {Math.max(0, Math.floor((new Date(aap.expiresAt) - new Date()) / 3600000))}h {Math.max(0, Math.floor(((new Date(aap.expiresAt) - new Date()) % 3600000) / 60000))}m
                                        </p>
                                    )}
                                    <button 
                                        className="btn-primary-action" 
                                        onClick={handleSendMurabahaOffer}
                                        disabled={actionLoading}
                                        style={{ width: '100%' }}
                                    >
                                        Issue Murabaha Contract (Trader App)
                                    </button>
                                    <div className="direct-mobile-notice" style={{ marginTop: 10 }}>
                                        <Smartphone size={14} />
                                        <span>Trader reviews and signs the Murabaha Contract directly on their app.</span>
                                    </div>
                                </div>
                            )}

                            {/* Step 3: Deliver Goods */}
                            {aap.status === 'murabaha_accepted' && (
                                <div className="action-box success-box">
                                    <p style={{ fontWeight: 600, marginBottom: 8 }}>
                                        <CheckCircle size={16} style={{ marginRight: 6 }} />
                                        Murabaha Accepted — Deliver Goods
                                    </p>
                                    <p style={{ fontSize: '0.85rem', opacity: 0.8, marginBottom: 12 }}>
                                        Trader agreed to terms (₦{aap.totalRetailerCost?.toLocaleString()}). Generate a pickup OTP for them to enter on their app.
                                    </p>
                                    <button 
                                        className="btn-primary-action" 
                                        onClick={handleMarkDelivered}
                                        disabled={actionLoading}
                                        style={{ width: '100%' }}
                                    >
                                        Generate Pickup OTP (Trader App)
                                    </button>
                                </div>
                            )}

                            {/* Settle Debt (Proxy) */}
                            {aap.status === 'received' && !aap.isPaid && (
                                <div className="action-box success-box">
                                    <p>Accept cash and settle debt for the retailer. You will get a receipt.</p>
                                    <button 
                                        className="btn-success-action"
                                        onClick={() => setRepayModalOpen(true)}
                                    >
                                        <CreditCard size={16} />
                                        Settle Debt for Retailer
                                    </button>
                                </div>
                            )}

                            {/* OTP Display Card */}
                            {aap.status === 'delivered' && aap.pickupCode && (
                                <div className="otp-display-card">
                                    <span className="otp-label">TRADER PICKUP OTP</span>
                                    <span className="otp-value">{aap.pickupCode}</span>
                                    <p>Share this code with the trader to enter on their app to confirm receipt.</p>
                                </div>
                            )}

                            {/* Cancel before payment */}
                            {['draft', 'awaiting_retailer_confirm', 'pending_admin_approval'].includes(aap.status) && (
                                <div className="action-box" style={{ borderColor: '#ef4444', background: 'rgba(239,68,68,0.05)' }}>
                                    <p>Change of plans? Cancel this purchase before payment is made.</p>
                                    <button 
                                        className="btn-outline-action" 
                                        onClick={handleCancel}
                                        disabled={actionLoading}
                                        style={{ borderColor: '#ef4444', color: '#ef4444' }}
                                    >
                                        <XCircle size={16} />
                                        Cancel Purchase
                                    </button>
                                </div>
                            )}

                            {/* Request cancellation after payment */}
                            {['fund_disbursed', 'pending_murabaha_acceptance', 'murabaha_accepted', 'delivered'].includes(aap.status) && (
                                <div className="action-box" style={{ borderColor: '#f59e0b', background: 'rgba(245,158,11,0.05)' }}>
                                    <p>Funds have been disbursed. To cancel, return the cash to admin first.</p>
                                    <button 
                                        className="btn-outline-action" 
                                        onClick={handleRequestCancellation}
                                        disabled={actionLoading}
                                        style={{ borderColor: '#f59e0b', color: '#f59e0b' }}
                                    >
                                        <AlertCircle size={16} />
                                        Request Cancellation
                                    </button>
                                </div>
                            )}

                            {/* Cancellation pending message */}
                            {aap.status === 'cancellation_requested' && (
                                <div className="waiting-box" style={{ background: 'rgba(245,158,11,0.1)', borderColor: 'rgba(245,158,11,0.3)' }}>
                                    <Clock size={24} style={{ color: '#f59e0b' }} />
                                    <div>
                                        <p style={{ fontWeight: 700, color: '#f59e0b', margin: 0 }}>Cancellation Pending</p>
                                        <p style={{ fontSize: '0.85rem', opacity: 0.7, margin: '4px 0 0 0' }}>
                                            Awaiting admin confirmation.
                                        </p>
                                        <div style={{ marginTop: 12, padding: 10, background: 'rgba(0,0,0,0.05)', borderRadius: 8, fontSize: '0.85rem' }}>
                                            <strong>Funds returned to:</strong><br />
                                            🏦 Moniepoint Bank<br />
                                            👤 Amana Murabaha Global Enterprise<br />
                                            🔢 6042197639
                                        </div>
                                    </div>
                                </div>
                            )}
                            
                            {/* Waiting message for statuses with no actions */}
                            {['draft', 'pending_admin_approval'].includes(aap.status) && (
                                <div className="waiting-box">
                                    <Clock size={24} />
                                    <p>Awaiting next step in Murabaha lifecycle. No actions required right now.</p>
                                </div>
                            )}
                        </div>
                    )}
                {/* Refund Proof (Cancellation) */}
                {aap.refundProofUrl && (
                    <div className="detail-card proof-card">
                        <div className="card-header">
                            <XCircle size={18} className="text-secondary" />
                            <h3>Refund Receipt</h3>
                        </div>
                        <div className="proxy-proof-display" style={{ marginTop: 0, background: 'transparent', padding: 0 }}>
                            <img 
                                src={aap.refundProofUrl} 
                                alt="Refund Receipt" 
                                onClick={() => {
                                    setInspectImage(aap.refundProofUrl);
                                    setInspectTitle('Refund Receipt Evidence');
                                }} 
                                style={{ width: '100%', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.1)', cursor: 'pointer' }}
                                title="Click to inspect refund receipt"
                            />
                            {aap.cancelReason && (
                                <p className="description" style={{ marginTop: '12px', fontSize: '0.9rem' }}>
                                    Reason: <strong>{aap.cancelReason}</strong>
                                </p>
                            )}
                        </div>
                    </div>
                )}

                {/* Proof of Delivery / Consent / Murabaha Acceptance (Universal View) */}
                {aap.proxyProofUrl && (
                    <div className="detail-card proof-card">
                         <div className="card-header">
                            <ShieldCheck size={18} className="text-secondary" />
                            <h3>{aap.proxyMurabahaAcceptance ? 'Proof of Murabaha Acceptance' : (['received', 'completed'].includes(aap.status) ? 'Proof of Delivery' : 'Proxy Verification Proof')}</h3>
                        </div>
                        <div className="proxy-proof-display" style={{ marginTop: 0, background: 'transparent', padding: 0 }}>
                            <img 
                                src={aap.proxyProofUrl} 
                                alt="Proof" 
                                onClick={() => {
                                    setInspectImage(aap.proxyProofUrl);
                                    setInspectTitle(aap.proxyMurabahaAcceptance ? 'Proof of Murabaha Acceptance' : 'Verification Proof');
                                }} 
                                style={{ width: '100%', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.1)', cursor: 'pointer' }}
                                title="Click to inspect proof photo"
                            />
                            <p className="description" style={{ marginTop: '12px', fontSize: '0.9rem' }}>
                                Verified by Agent <strong>{aap.agent?.name}</strong> via Camera
                            </p>
                        </div>
                    </div>
                )}
                </div>

                <aside className="side-info">
                   {/* Seller Details */}
                    {aap.sellerName ? (
                        <div className="detail-card entity-card">
                            <div className="card-header">
                                <Store size={18} />
                                <h3>Seller Information</h3>
                            </div>
                            <div className="entity-content">
                                <h4>{aap.sellerName}</h4>
                                {aap.sellerLocation && (
                                    <div className="contact-item">
                                        <MapPin size={14} />
                                        <span>{aap.sellerLocation}</span>
                                    </div>
                                )}
                                {aap.sellerPhone && (
                                    <a href={`tel:${aap.sellerPhone}`} className="contact-link">
                                        <Phone size={14} />
                                        <span>{aap.sellerPhone}</span>
                                    </a>
                                )}
                            </div>
                        </div>
                    ) : (
                        <div className="detail-card entity-card">
                            <div className="card-header">
                                <Store size={18} />
                                <h3>Seller Information</h3>
                            </div>
                            <p style={{ color: 'var(--color-text-secondary)', fontSize: '0.85rem', margin: '0.5rem 0 0 0' }}>
                                Not recorded yet (captured upon goods purchase).
                            </p>
                        </div>
                    )}

                    {/* Retailer Details */}
                    <div className="detail-card entity-card">
                        <div className="card-header">
                            <User size={18} />
                            <h3>Target Retailer</h3>
                        </div>
                        {aap.retailer ? (
                            <div className="entity-content">
                                <h4>{aap.retailer.name}</h4>
                                <div className="contact-item">
                                    <Phone size={14} />
                                    <span>{aap.retailer.phone}</span>
                                </div>
                                <TraderCreditCard retailer={aap.retailer} variant="full" />
                                {aap.retailer.email && (
                                    <a href={`mailto:${aap.retailer.email}`} className="contact-link" style={{ marginTop: '0.5rem' }}>
                                        <Mail size={14} />
                                        <span>{aap.retailer.email}</span>
                                    </a>
                                )}
                            </div>
                        ) : (
                            <div className="unlinked-box">
                                <p>No retailer linked yet.</p>
                                <button onClick={() => navigate(`/agent/aap/${aap._id}/link`)} className="btn-link-action">
                                    Link Retailer
                                </button>
                            </div>
                        )}
                    </div>

                    {/* Agent Details */}
                    <div className="detail-card entity-card">
                        <div className="card-header">
                            <ShieldCheck size={18} />
                            <h3>Assigned Agent</h3>
                        </div>
                        <div className="entity-content">
                            <h4>{aap.agent?.name}</h4>
                            <p className="agent-tag">Amana Certified Agent</p>
                        </div>
                    </div>
                </aside>
            </div>

            {aap && (
                <RepayModal 
                    isOpen={repayModalOpen}
                    onClose={() => setRepayModalOpen(false)}
                    order={aap}
                    user={aap.retailer} 
                    isAgentProxy={true}
                    onSuccess={() => {
                        fetchAAP();
                    }}
                />
            )}

            {/* Cancellation Request Modal */}
            {showCancelModal && typeof document !== 'undefined' && createPortal(
                <div className="aap-cancel-modal-overlay" onClick={() => !actionLoading && setShowCancelModal(false)}>
                    <div className="aap-cancel-modal-card" onClick={e => e.stopPropagation()}>
                        <div className="aap-cancel-stripe" />
                        
                        {/* Header */}
                        <div className="aap-cancel-header">
                            <div className="aap-cancel-icon-glow">
                                <AlertTriangle size={22} />
                            </div>
                            <div className="aap-cancel-header-text">
                                <div className="aap-cancel-badge">CANCELLATION REQUEST</div>
                                <h3 className="aap-cancel-title">Request Purchase Cancellation</h3>
                                <p className="aap-cancel-subtitle">
                                    Disbursed funds must be refunded to Amana Treasury before admin can approve this cancellation.
                                </p>
                            </div>
                            <button 
                                type="button"
                                className="aap-cancel-close-x" 
                                onClick={() => !actionLoading && setShowCancelModal(false)}
                                title="Close"
                                disabled={actionLoading}
                            >
                                <X size={18} />
                            </button>
                        </div>

                        <div className="aap-cancel-body">
                            {/* Treasury Bank Details Card */}
                            <div className="aap-treasury-card">
                                <div className="aap-treasury-card-header">
                                    <div className="aap-treasury-title-wrap">
                                        <Building size={15} />
                                        <span>AMANA TREASURY ACCOUNT</span>
                                    </div>
                                    <span className="aap-treasury-status-tag">REFUND TARGET</span>
                                </div>
                                <div className="aap-treasury-details">
                                    <div className="aap-treasury-row">
                                        <span className="aap-tr-label">Bank Name</span>
                                        <span className="aap-tr-value">Moniepoint MFB</span>
                                    </div>
                                    <div className="aap-treasury-row">
                                        <span className="aap-tr-label">Account Name</span>
                                        <span className="aap-tr-value">Amana Murabaha Global Enterprise</span>
                                    </div>
                                    <div className="aap-treasury-row aap-treasury-acc-row">
                                        <div>
                                            <span className="aap-tr-label">Account Number</span>
                                            <div className="aap-treasury-acc-num">6042197639</div>
                                        </div>
                                        <button 
                                            type="button"
                                            className={`aap-copy-acc-btn ${copiedAccount ? 'copied' : ''}`}
                                            onClick={() => handleCopyAccount('6042197639')}
                                            title="Copy Account Number"
                                        >
                                            {copiedAccount ? <Check size={14} /> : <Copy size={14} />}
                                            <span>{copiedAccount ? 'Copied' : 'Copy Number'}</span>
                                        </button>
                                    </div>
                                    {aap.purchasePrice && (
                                        <div className="aap-treasury-refund-amt">
                                            <span>Required Refund Amount:</span>
                                            <strong>₦{aap.purchasePrice.toLocaleString()}</strong>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Proof of Refund Upload Section */}
                            <div className="aap-form-group">
                                <div className="aap-field-header">
                                    <label className="aap-form-label">
                                        Upload Receipt / Proof of Refund <span className="required-star">*</span>
                                    </label>
                                    <span className="aap-field-hint">Transfer receipt or bank alert</span>
                                </div>

                                <input
                                    type="file"
                                    ref={refundInputRef}
                                    accept="image/*"
                                    capture="environment"
                                    onChange={handleRefundFileChange}
                                    style={{ display: 'none' }}
                                />

                                {!refundProofPreview ? (
                                    <div 
                                        className="aap-upload-dropzone"
                                        onClick={() => refundInputRef.current?.click()}
                                        role="button"
                                        tabIndex={0}
                                        onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') refundInputRef.current?.click(); }}
                                    >
                                        <div className="aap-dropzone-icon-ring">
                                            <UploadCloud size={22} />
                                        </div>
                                        <div className="aap-dropzone-text">
                                            <span className="aap-dropzone-primary">Click to upload refund receipt</span>
                                            <span className="aap-dropzone-secondary">PNG, JPG or WEBP (Max 5MB)</span>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="aap-receipt-preview-card">
                                        <div className="aap-receipt-thumb-wrap">
                                            <img src={refundProofPreview} alt="Receipt preview" className="aap-receipt-thumb" />
                                        </div>
                                        <div className="aap-receipt-info">
                                            <div className="aap-receipt-status">
                                                <CheckCircle size={14} />
                                                <span>Receipt attached</span>
                                            </div>
                                            <div className="aap-receipt-filename">
                                                {refundProofFile?.name || 'receipt_document.jpg'}
                                            </div>
                                            <div className="aap-receipt-filesize">
                                                {refundProofFile?.size ? `${(refundProofFile.size / 1024).toFixed(1)} KB` : 'Attached file'}
                                            </div>
                                            <div className="aap-receipt-actions">
                                                <button 
                                                    type="button" 
                                                    className="aap-receipt-btn-change"
                                                    onClick={() => refundInputRef.current?.click()}
                                                >
                                                    <Camera size={13} /> Change
                                                </button>
                                                <button 
                                                    type="button" 
                                                    className="aap-receipt-btn-remove"
                                                    onClick={handleClearRefundProof}
                                                >
                                                    <Trash2 size={13} /> Remove
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* Reason for Cancellation */}
                            <div className="aap-form-group">
                                <div className="aap-field-header">
                                    <label className="aap-form-label">
                                        Reason for Cancellation <span className="required-star">*</span>
                                    </label>
                                    <span className="aap-field-hint">Quick presets or write details</span>
                                </div>
                                
                                <div className="aap-preset-chips">
                                    {CANCELLATION_PRESETS.map((preset, idx) => (
                                        <button
                                            key={idx}
                                            type="button"
                                            className={`aap-preset-chip ${cancelReason === preset ? 'active' : ''}`}
                                            onClick={() => setCancelReason(preset)}
                                        >
                                            {preset}
                                        </button>
                                    ))}
                                </div>

                                <textarea
                                    className="aap-cancel-textarea"
                                    value={cancelReason}
                                    onChange={e => setCancelReason(e.target.value)}
                                    placeholder="Explain why this purchase is being cancelled (minimum 5 characters)..."
                                    rows={3}
                                />
                                <div className="aap-textarea-footer">
                                    <span className="aap-textarea-hint">
                                        Submitted for admin approval and logged
                                    </span>
                                    <span className={`aap-char-counter ${cancelReason.trim().length >= 5 ? 'valid' : ''}`}>
                                        {cancelReason.trim().length} / 5 min chars
                                    </span>
                                </div>
                            </div>
                        </div>

                        {/* Footer Actions */}
                        <div className="aap-cancel-footer">
                            <button
                                type="button"
                                className="aap-btn-secondary"
                                onClick={() => setShowCancelModal(false)}
                                disabled={actionLoading}
                            >
                                Discard
                            </button>
                            <button
                                type="button"
                                className="aap-btn-submit-danger"
                                onClick={submitCancellationRequest}
                                disabled={actionLoading || !refundProofFile || !cancelReason.trim() || cancelReason.trim().length < 5}
                            >
                                {actionLoading ? (
                                    <>
                                        <span className="aap-btn-spinner" />
                                        Submitting Request...
                                    </>
                                ) : (
                                    <>
                                        <AlertTriangle size={15} />
                                        Submit Cancellation Request
                                    </>
                                )}
                            </button>
                        </div>
                    </div>
                </div>,
                document.body
            )}

            {/* Lightbox Modal for Photo Inspection in AgentAAPDetail */}
            {inspectImage && typeof document !== 'undefined' && createPortal(
                <div 
                    className="aap-lightbox-overlay"
                    onClick={(e) => {
                        e.stopPropagation();
                        setInspectImage(null);
                    }}
                >
                    <div className="lightbox-top-bar" onClick={e => e.stopPropagation()}>
                        <div className="lightbox-title-wrap">
                            <Eye size={15} color="#fff" />
                            <span>{inspectTitle || 'Document Inspection'}</span>
                        </div>
                        <div className="lightbox-actions-wrap">
                            <a 
                                href={inspectImage} 
                                target="_blank" 
                                rel="noreferrer" 
                                className="lightbox-external-link"
                                onClick={e => e.stopPropagation()}
                            >
                                <ExternalLink size={14} /> Open Original
                            </a>
                            <button 
                                type="button" 
                                className="lightbox-close-btn" 
                                onClick={(e) => {
                                    e.stopPropagation();
                                    setInspectImage(null);
                                }}
                                title="Close inspection"
                            >
                                <X size={18} />
                                <span>Back to Details</span>
                            </button>
                        </div>
                    </div>

                    <div className="lightbox-image-container" onClick={e => e.stopPropagation()}>
                        <img 
                            src={inspectImage} 
                            alt="Document Preview" 
                            className="lightbox-img" 
                            onClick={e => e.stopPropagation()} 
                        />
                    </div>
                </div>,
                document.body
            )}
        </div>
    );
};

export default AgentAAPDetail;
