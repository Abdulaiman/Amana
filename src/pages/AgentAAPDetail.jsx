import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import api from '../services/api';
import { 
    Package, MapPin, Store, Calendar, ArrowLeft, 
    CheckCircle, Clock, AlertCircle, ShieldCheck, DollarSign, User,
    Phone, Mail, Camera, CreditCard, UploadCloud, XCircle
} from 'lucide-react';
import { useToast } from '../context/ToastContext';
import { useAuth } from '../context/AuthContext';
import RepayModal from '../components/RepayModal';
import './AgentAAPDetail.css';

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
    const fileInputRef = React.useRef(null);
    const refundInputRef = React.useRef(null);
    const [pendingAction, setPendingAction] = useState(null); // 'confirm' or 'deliver'
    const [showCancelModal, setShowCancelModal] = useState(false);
    const [cancelReason, setCancelReason] = useState('');
    const [refundProofFile, setRefundProofFile] = useState(null);
    const [refundProofPreview, setRefundProofPreview] = useState(null);

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
        setShowCancelModal(true);
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

    const triggerProxyAction = (action) => {
        setPendingAction(action);
        fileInputRef.current.click();
    };

    const handleFileChange = async (e) => {
        const file = e.target.files[0];
        if (!file || !pendingAction) return;

        if (file.size > 5 * 1024 * 1024) {
             addToast('File too large (Max 5MB)', 'warning');
             return;
        }

        setActionLoading(true);
        try {
            const proofUrl = await handleUploadProof(file);
            const endpoints = {
                'confirm': `/aap/${id}/proxy-confirm`,
                'accept-murabaha': `/aap/${id}/proxy-accept-murabaha`,
                'deliver': `/aap/${id}/proxy-deliver`
            };
            const endpoint = endpoints[pendingAction] || `/aap/${id}/proxy-deliver`;
            const messages = {
                'confirm': 'Interest confirmed via agent!',
                'accept-murabaha': 'Murabaha accepted via agent!',
                'deliver': 'Proxy Delivered & Received!'
            };
            
            await api.put(endpoint, { photoProof: proofUrl });
            
            addToast(messages[pendingAction] || 'Action completed!', 'success');
            fetchAAP();
        } catch (error) {
            console.error(error);
            addToast('Action failed', 'error');
        } finally {
            setActionLoading(false);
            setPendingAction(null);
            e.target.value = ''; // Reset input
        }
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
            awaiting_retailer_confirm: { color: '#f59e0b', label: 'Awaiting Retailer Interest', icon: <Clock size={14} /> },
            pending_admin_approval: { color: '#8b5cf6', label: 'Pending Admin Approval', icon: <ShieldCheck size={14} /> },
            fund_disbursed: { color: '#10b981', label: 'Funds Disbursed', icon: <DollarSign size={14} /> },
            pending_murabaha_acceptance: { color: '#f59e0b', label: 'Murabaha Offer Sent', icon: <Clock size={14} /> },
            murabaha_accepted: { color: '#10b981', label: 'Murabaha Accepted', icon: <CheckCircle size={14} /> },
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
            <header className="aap-detail-header">
                <button onClick={() => navigate(-1)} className="back-btn-ghost">
                    <ArrowLeft size={20} />
                </button>
                <div className="header-info">
                    <h1>Purchase Details</h1>
                    <p className="ref-tag">REF: #AMN-{aap._id.substring(aap._id.length - 8).toUpperCase()}</p>
                </div>
                <div className="header-status">
                    <div className="status-pill" style={{ color: statusConfig.color, background: `${statusConfig.color}15`, borderColor: `${statusConfig.color}30` }}>
                        {statusConfig.icon}
                        <span>{statusConfig.label}</span>
                    </div>
                </div>
            </header>

            <div className="aap-detail-grid">
                <div className="main-info">
                    {/* Photos Section */}
                    <div className="detail-card photo-section">
                        <div className="photo-stagger">
                            {aap.productPhotos?.map((url, i) => (
                                <div key={i} className="photo-frame">
                                    <img src={url} alt={`Product ${i+1}`} onClick={() => window.open(url, '_blank')} />
                                </div>
                            ))}
                        </div>
                    </div>

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
                            
                            {/* Hidden File Input for Proxy Actions */}
                            <input 
                                type="file" 
                                ref={fileInputRef} 
                                style={{ display: 'none' }} 
                                accept="image/*" 
                                capture="environment"
                                onChange={handleFileChange} 
                            />

                            {/* Proxy Confirm Action */}
                            {aap.status === 'awaiting_retailer_confirm' && (
                                <div className="action-box warning-box">
                                    <p>Let's verify together! Take a quick photo of the retailer consenting.</p>
                                    <button 
                                        className="btn-warning-action" 
                                        onClick={() => triggerProxyAction('confirm')}
                                        disabled={actionLoading}
                                    >
                                        <Camera size={16} />
                                        {actionLoading && pendingAction === 'confirm' ? 'Opening Camera...' : 'Proxy Confirm (Take Photo)'}
                                    </button>
                                </div>
                            )}

                            {aap.status === 'fund_disbursed' && (
                                <div className="action-box success-box">
                                    <p style={{ fontWeight: 600, marginBottom: 8 }}>
                                        <DollarSign size={16} style={{ marginRight: 6 }} />
                                        Funds Disbursed — Purchase the goods from the seller
                                    </p>
                                    <p style={{ fontSize: '0.85rem', opacity: 0.8, marginBottom: 12 }}>
                                        After purchasing, send the Murabaha offer to the retailer.
                                    </p>
                                    {aap.expiresAt && (
                                        <p style={{ fontSize: '0.8rem', color: '#f59e0b', marginBottom: 12 }}>
                                            <Clock size={14} style={{ marginRight: 4 }} />
                                            Time remaining: {Math.max(0, Math.floor((new Date(aap.expiresAt) - new Date()) / 3600000))}h {Math.max(0, Math.floor(((new Date(aap.expiresAt) - new Date()) % 3600000) / 60000))}m
                                        </p>
                                    )}
                                    <div className="action-row">
                                        <button 
                                            className="btn-primary-action" 
                                            onClick={handleSendMurabahaOffer}
                                            disabled={actionLoading}
                                        >
                                            Send Murabaha Offer
                                        </button>
                                        <button 
                                            className="btn-outline-action" 
                                            onClick={() => triggerProxyAction('accept-murabaha')}
                                            disabled={actionLoading}
                                        >
                                            <Camera size={16} />
                                            {actionLoading && pendingAction === 'accept-murabaha' ? 'Opening Camera...' : 'Proxy Accept Murabaha'}
                                        </button>
                                    </div>
                                </div>
                            )}

                            {aap.status === 'murabaha_accepted' && (
                                <div className="action-box success-box">
                                    <p style={{ fontWeight: 600, marginBottom: 8 }}>
                                        <CheckCircle size={16} style={{ marginRight: 6 }} />
                                        Murabaha Accepted — Deliver the Goods
                                    </p>
                                    <p style={{ fontSize: '0.85rem', opacity: 0.8, marginBottom: 12 }}>
                                        Retailer agreed to purchase at ₦{aap.totalRetailerCost?.toLocaleString()} (₦{aap.purchasePrice?.toLocaleString()} + {aap.markupPercentage}% markup). Choose delivery method:
                                    </p>
                                    <div className="action-row">
                                        <button 
                                            className="btn-primary-action" 
                                            onClick={handleMarkDelivered}
                                            disabled={actionLoading}
                                        >
                                            Generate OTP (Retailer App)
                                        </button>
                                        <button 
                                            className="btn-outline-action" 
                                            onClick={() => triggerProxyAction('deliver')}
                                            disabled={actionLoading}
                                        >
                                            <Camera size={16} />
                                            {actionLoading && pendingAction === 'deliver' ? 'Opening Camera...' : 'Proxy Deliver (Photo)'}
                                        </button>
                                    </div>
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

                            {aap.status === 'delivered' && aap.pickupCode && (
                                <div className="otp-display-card">
                                    <span className="otp-label">RETAILER PICKUP OTP</span>
                                    <span className="otp-value">{aap.pickupCode}</span>
                                    <p>Share this code with the retailer to confirm receipt.</p>
                                    
                                    <div className="otp-divider"></div>
                                    <p className="description" style={{ fontSize: '0.9rem', margin: '0 0 8px 0', opacity: 0.8 }}>Retailer unable to verify?</p>
                                    <button 
                                        className="btn-inverse-action" 
                                        onClick={() => triggerProxyAction('deliver')}
                                        disabled={actionLoading}
                                        style={{ width: '100%', justifyContent: 'center', padding: '1rem', borderRadius: '12px' }}
                                    >
                                        <Camera size={16} />
                                        {actionLoading && pendingAction === 'deliver' ? 'Opening Camera...' : 'Use Proxy Deliver (Photo)'}
                                    </button>
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
                                onClick={() => window.open(aap.refundProofUrl, '_blank')} 
                                style={{ width: '100%', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.1)' }}
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
                                onClick={() => window.open(aap.proxyProofUrl, '_blank')} 
                                style={{ width: '100%', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.1)' }}
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
                    <div className="detail-card entity-card">
                        <div className="card-header">
                            <Store size={18} />
                            <h3>Seller Information</h3>
                        </div>


                        <div className="entity-content">
                            <h4>{aap.sellerName}</h4>
                            <div className="contact-item">
                                <MapPin size={14} />
                                <span>{aap.sellerLocation}</span>
                            </div>
                            {aap.sellerPhone && (
                                <a href={`tel:${aap.sellerPhone}`} className="contact-link">
                                    <Phone size={14} />
                                    <span>{aap.sellerPhone}</span>
                                </a>
                            )}
                        </div>
                    </div>

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
                                {aap.retailer.email && (
                                    <a href={`mailto:${aap.retailer.email}`} className="contact-link">
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
            {showCancelModal && (
                <div className="modal-overlay" onClick={() => !actionLoading && setShowCancelModal(false)}>
                    <div className="modal-content" onClick={e => e.stopPropagation()}>
                        <h3 style={{ marginTop: 0 }}>Request Cancellation</h3>

                        <div style={{ background: 'rgba(245,158,11,0.1)', border: '1px solid rgba(245,158,11,0.3)', borderRadius: 12, padding: 14, marginBottom: 16 }}>
                            <strong style={{ color: '#f59e0b', fontSize: '0.85rem' }}>Send refund to:</strong>
                            <p style={{ margin: '4px 0', fontSize: '0.95rem' }}>🏦 Moniepoint Bank</p>
                            <p style={{ margin: '4px 0', fontSize: '0.95rem' }}>👤 Amana Murabaha Global Enterprise</p>
                            <p style={{ margin: '4px 0', fontSize: '0.95rem', fontWeight: 800 }}>🔢 6042197639</p>
                        </div>

                        <label style={{ fontWeight: 600, fontSize: '0.9rem', display: 'block', marginBottom: 6 }}>
                            Upload Receipt / Proof of Refund *
                        </label>
                        <input
                            type="file"
                            ref={refundInputRef}
                            accept="image/*"
                            capture="environment"
                            onChange={handleRefundFileChange}
                            style={{ marginBottom: 12 }}
                        />
                        {refundProofPreview && (
                            <div style={{ marginBottom: 12 }}>
                                <img src={refundProofPreview} alt="Receipt preview" style={{ width: '100%', maxHeight: 180, borderRadius: 8, objectFit: 'cover' }} />
                            </div>
                        )}

                        <label style={{ fontWeight: 600, fontSize: '0.9rem', display: 'block', marginBottom: 6 }}>
                            Reason for Cancellation *
                        </label>
                        <textarea
                            value={cancelReason}
                            onChange={e => setCancelReason(e.target.value)}
                            placeholder="e.g. Trader changed their mind..."
                            rows={3}
                            style={{ width: '100%', borderRadius: 10, border: '1px solid rgba(255,255,255,0.2)', padding: 12, fontSize: '0.95rem', resize: 'vertical', marginBottom: 16, boxSizing: 'border-box' }}
                        />

                        <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
                            <button
                                className="btn-secondary"
                                onClick={() => setShowCancelModal(false)}
                                disabled={actionLoading}
                            >
                                Cancel
                            </button>
                            <button
                                className="btn-primary"
                                onClick={submitCancellationRequest}
                                disabled={actionLoading || !refundProofFile || !cancelReason.trim() || cancelReason.trim().length < 5}
                                style={{ background: '#ef4444', color: '#fff', opacity: (!refundProofFile || !cancelReason.trim() || cancelReason.trim().length < 5) ? 0.5 : 1 }}
                            >
                                {actionLoading ? 'Submitting...' : 'Submit Request'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AgentAAPDetail;
