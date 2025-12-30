import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../services/api';
import { 
    Package, MapPin, Store, Calendar, ArrowLeft, 
    CheckCircle, Clock, AlertCircle, ShieldCheck, DollarSign, User,
    Phone, Mail
} from 'lucide-react';
import { useToast } from '../context/ToastContext';
import { useAuth } from '../context/AuthContext';
import './AgentAAPDetail.css';

const AgentAAPDetail = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { addToast } = useToast();
    const { user } = useAuth();
    
    const [aap, setAAP] = useState(null);
    const [loading, setLoading] = useState(true);
    const [actionLoading, setActionLoading] = useState(false);

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

    const handleMarkDelivered = async () => {
        if (!window.confirm('Mark goods as delivered and generate pickup OTP for retailer?')) return;
        
        setActionLoading(true);
        try {
            const res = await api.put(`/aap/${id}/deliver`);
            addToast('Successfully marked as delivered!', 'success');
            // Show OTP clearly
            alert(`SHARE THIS OTP WITH RETAILER: ${res.data.pickupCode}`);
            fetchAAP();
        } catch (error) {
            addToast(error.response?.data?.message || 'Failed to update status', 'error');
        } finally {
            setActionLoading(false);
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
            awaiting_retailer_confirm: { color: '#f59e0b', label: 'Awaiting Retailer', icon: <Clock size={14} /> },
            pending_admin_approval: { color: '#8b5cf6', label: 'Pending Admin Approval', icon: <ShieldCheck size={14} /> },
            fund_disbursed: { color: '#10b981', label: 'Funds Disbursed', icon: <DollarSign size={14} /> },
            delivered: { color: '#3b82f6', label: 'Delivered', icon: <Package size={14} /> },
            received: { color: '#10b981', label: 'Received', icon: <CheckCircle size={14} /> },
            completed: { color: '#10b981', label: 'Completed', icon: <CheckCircle size={14} /> },
            declined: { color: '#ef4444', label: 'Declined', icon: <AlertCircle size={14} /> },
            expired: { color: '#ef4444', label: 'Expired', icon: <Clock size={14} /> }
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
                                    <span className="label">Quantity</span>
                                    <span className="value">{aap.quantity} Units</span>
                                </div>
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
                            
                            {aap.status === 'fund_disbursed' && (
                                <div className="action-box">
                                    <p>Funds have been disbursed. Visit the seller, verify goods, and pay. Once done, mark as delivered.</p>
                                    <button 
                                        className="btn-primary-action" 
                                        onClick={handleMarkDelivered}
                                        disabled={actionLoading}
                                    >
                                        Mark as Delivered
                                    </button>
                                </div>
                            )}

                            {aap.status === 'delivered' && aap.pickupCode && (
                                <div className="otp-display-card">
                                    <span className="otp-label">RETAILER PICKUP OTP</span>
                                    <span className="otp-value">{aap.pickupCode}</span>
                                    <p>Share this code with the retailer to confirm receipt.</p>
                                </div>
                            )}

                            {['pending_admin_approval', 'awaiting_retailer_confirm', 'draft'].includes(aap.status) && (
                                <div className="waiting-box">
                                    <Clock size={24} />
                                    <p>Awaiting next step in Murabaha lifecycle. No actions required right now.</p>
                                </div>
                            )}
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
        </div>
    );
};

export default AgentAAPDetail;
