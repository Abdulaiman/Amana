import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import { 
    ShoppingBag, CheckCircle, Clock, AlertTriangle, X, Eye, 
    DollarSign, User, Calendar
} from 'lucide-react';
import './AdminAAPDashboard.css';

const AdminAAPDashboard = () => {
    const [aaps, setAAPs] = useState([]);
    const [stats, setStats] = useState({});
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState('pending_admin_approval');
    const [selectedAAP, setSelectedAAP] = useState(null);
    const [disbursementForm, setDisbursementForm] = useState({
        method: 'bank_transfer',
        reference: ''
    });
    const [actionLoading, setActionLoading] = useState(false);

    const fetchAAPs = async () => {
        try {
            const res = await api.get(`/aap/admin/dashboard${filter ? `?status=${filter}` : ''}`);
            setAAPs(res.data.aaps);
            setStats(res.data.stats);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchAAPs();
    }, [filter]);

    const handleApprove = async (aapId) => {
        if (!disbursementForm.method) {
            alert('Please select a disbursement method');
            return;
        }
        setActionLoading(true);
        try {
            await api.put(`/aap/${aapId}/approve`, {
                disbursementMethod: disbursementForm.method,
                disbursementReference: disbursementForm.reference
            });
            setSelectedAAP(null);
            fetchAAPs();
        } catch (err) {
            alert(err.response?.data?.message || 'Failed to approve');
        } finally {
            setActionLoading(false);
        }
    };

    const handleDecline = async (aapId, reason) => {
        setActionLoading(true);
        try {
            await api.put(`/aap/${aapId}/decline`, { reason });
            setSelectedAAP(null);
            fetchAAPs();
        } catch (err) {
            alert(err.response?.data?.message || 'Failed to decline');
        } finally {
            setActionLoading(false);
        }
    };

    const getStatusBadgeClass = (status) => {
        switch(status) {
            case 'pending_admin_approval': return 'badge-warning';
            case 'fund_disbursed':
            case 'received':
            case 'completed': return 'badge-success';
            case 'expired':
            case 'declined': return 'badge-danger';
            default: return 'badge-neutral';
        }
    };

    const getStatusLabel = (status) => {
        const labels = {
            draft: 'Draft',
            awaiting_retailer_confirm: 'Awaiting Retailer',
            pending_admin_approval: 'Pending Approval',
            fund_disbursed: 'Fund Disbursed',
            delivered: 'Delivered',
            received: 'Received',
            completed: 'Completed',
            expired: 'EXPIRED',
            declined: 'Declined'
        };
        return labels[status] || status;
    };

    return (
        <div className="admin-page">
            <div className="page-header">
                <div>
                    <h1 className="page-title">Agent Purchases</h1>
                    <p className="page-subtitle">Off-platform purchases via agents</p>
                </div>
            </div>

            {/* Stats Cards */}
            <div className="metrics-grid">
                <div 
                    className={`metric-card glass-panel aap-stat-card ${filter === 'pending_admin_approval' ? 'active' : ''}`}
                    onClick={() => setFilter('pending_admin_approval')}
                >
                    <div className="metric-header">
                        <div className="icon-box icon-warning">
                            <Clock size={20} />
                        </div>
                    </div>
                    <div className="metric-value">{stats.pending || 0}</div>
                    <div className="metric-sub">Pending Approval</div>
                </div>
                
                <div 
                    className={`metric-card glass-panel aap-stat-card ${filter === 'fund_disbursed' ? 'active' : ''}`}
                    onClick={() => setFilter('fund_disbursed')}
                >
                    <div className="metric-header">
                        <div className="icon-box icon-success">
                            <ShoppingBag size={20} />
                        </div>
                    </div>
                    <div className="metric-value">{stats.active || 0}</div>
                    <div className="metric-sub">Active (Disbursed)</div>
                </div>

                <div 
                    className={`metric-card glass-panel aap-stat-card ${filter === 'expired' ? 'active' : ''}`}
                    onClick={() => setFilter('expired')}
                >
                    <div className="metric-header">
                        <div className="icon-box icon-danger">
                            <AlertTriangle size={20} />
                        </div>
                    </div>
                    <div className="metric-value">{stats.expired || 0}</div>
                    <div className="metric-sub">Expired (Alert!)</div>
                </div>

                <div 
                    className={`metric-card glass-panel aap-stat-card ${filter === 'received' ? 'active' : ''}`}
                    onClick={() => setFilter('received')}
                >
                    <div className="metric-header">
                        <div className="icon-box icon-primary">
                            <CheckCircle size={20} />
                        </div>
                    </div>
                    <div className="metric-value">{stats.completed || 0}</div>
                    <div className="metric-sub">Completed</div>
                </div>
            </div>

            {/* Filter Tabs */}
            <div className="tab-nav aap-tabs">
                {['pending_admin_approval', 'fund_disbursed', 'delivered', 'received', 'expired', 'declined'].map(s => (
                    <button 
                        key={s}
                        className={`tab-btn ${filter === s ? 'active' : ''}`}
                        onClick={() => setFilter(s)}
                    >
                        {s.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                    </button>
                ))}
                <button className={`tab-btn ${!filter ? 'active' : ''}`} onClick={() => setFilter('')}>
                    All
                </button>
            </div>

            {/* AAP List */}
            {loading ? (
                <div className="aap-loading">Loading...</div>
            ) : aaps.length === 0 ? (
                <div className="aap-empty">
                    <ShoppingBag size={48} strokeWidth={1} />
                    <p>No purchases in this category</p>
                </div>
            ) : (
                <div className="aap-grid">
                    {aaps.map(aap => (
                        <div key={aap._id} className="glass-panel aap-card">
                            <div className="aap-card-header">
                                <div>
                                    <h3 className="aap-card-title">{aap.productName}</h3>
                                    <p className="aap-card-subtitle">Qty: {aap.quantity}</p>
                                </div>
                                <span className={`badge ${getStatusBadgeClass(aap.status)}`}>
                                    {getStatusLabel(aap.status)}
                                </span>
                            </div>

                            {aap.productPhotos?.[0] && (
                                <img 
                                    src={aap.productPhotos[0]} 
                                    alt={aap.productName}
                                    className="aap-product-image"
                                />
                            )}

                            <div className="aap-card-body">
                                <div className="aap-info-row">
                                    <DollarSign size={14} />
                                    <span>Product Price: <strong>₦{aap.purchasePrice?.toLocaleString()}</strong></span>
                                </div>
                                {aap.totalRetailerCost && (
                                    <div className="aap-info-row">
                                        <DollarSign size={14} />
                                        <span>Retailer Total: <strong className="text-primary">₦{aap.totalRetailerCost?.toLocaleString()}</strong></span>
                                    </div>
                                )}
                                <div className="aap-info-row">
                                    <User size={14} />
                                    <span>Retailer: <strong>{aap.retailer?.name}</strong></span>
                                </div>
                                <div className="aap-info-row">
                                    <User size={14} />
                                    <span>Agent: <strong>{aap.agent?.name}</strong></span>
                                </div>
                                <div className="aap-info-row">
                                    <Calendar size={14} />
                                    <span>Term: <strong>{aap.repaymentTerm} days</strong> ({aap.markupPercentage}% markup)</span>
                                </div>
                                {aap.status === 'fund_disbursed' && aap.expiresAt && (
                                    <div className="aap-info-row aap-danger">
                                        <Clock size={14} />
                                        <span>Expires: {new Date(aap.expiresAt).toLocaleTimeString()}</span>
                                    </div>
                                )}
                            </div>

                            <div className="aap-card-footer">
                                <button 
                                    className="btn btn-outline"
                                    onClick={() => setSelectedAAP(aap)}
                                >
                                    <Eye size={14} /> View Details
                                </button>
                                {aap.status === 'pending_admin_approval' && (
                                    <button 
                                        className="btn btn-primary"
                                        onClick={() => setSelectedAAP(aap)}
                                    >
                                        Approve & Disburse
                                    </button>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Detail Modal */}
            {selectedAAP && (
                <div className="aap-modal-overlay" onClick={() => setSelectedAAP(null)}>
                    <div className="aap-modal glass-panel" onClick={e => e.stopPropagation()}>
                        <div className="aap-modal-header">
                            <h2>AAP Details</h2>
                            <button className="btn-icon" onClick={() => setSelectedAAP(null)}>
                                <X size={20} />
                            </button>
                        </div>

                        <div className="aap-modal-body">
                            {/* Product Photos */}
                            {selectedAAP.productPhotos?.length > 0 && (
                                <div className="aap-photo-gallery">
                                    {selectedAAP.productPhotos.map((url, i) => (
                                        <img key={i} src={url} alt={`Product ${i+1}`} className="aap-gallery-img" />
                                    ))}
                                </div>
                            )}

                            {/* Proxy Verification Warning */}
                            {selectedAAP.proxyProofUrl && (
                                <div className="proxy-verification-box">
                                    <div className="proxy-header">
                                        <AlertTriangle size={18} className="text-warning" />
                                        <h4>Proxy Verification Required</h4>
                                    </div>
                                    <p className="proxy-desc">
                                        Agent <strong>{selectedAAP.agent?.name}</strong> confirmed this on behalf of the retailer. 
                                        Please verify the identity match below:
                                    </p>
                                    
                                    <div className="proxy-comparison">
                                        <div className="proxy-img-box">
                                            <span className="proxy-label">Retailer Profile</span>
                                            {selectedAAP.retailer?.kyc?.profilePicUrl ? (
                                                <img 
                                                    src={selectedAAP.retailer.kyc.profilePicUrl} 
                                                    alt="Retailer Profile" 
                                                    className="comparison-img"
                                                />
                                            ) : (
                                                <div className="placeholder-img">
                                                    <User size={32} />
                                                    <span>No Profile Pic</span>
                                                </div>
                                            )}
                                        </div>
                                        
                                        <div className="proxy-vs-badge">VS</div>
                                        
                                        <div className="proxy-img-box">
                                            <span className="proxy-label">Agent's Proof Photo</span>
                                            <img 
                                                src={selectedAAP.proxyProofUrl} 
                                                alt="Agent Proof" 
                                                className="comparison-img"
                                                onClick={() => window.open(selectedAAP.proxyProofUrl, '_blank')}
                                            />
                                        </div>
                                    </div>
                                    <div className="proxy-tip">
                                        <small>Does the person in the proof photo match the retailer profile? If not, investigate before approving.</small>
                                    </div>
                                </div>
                            )}

                            <h3 className="aap-modal-title">{selectedAAP.productName}</h3>
                            {selectedAAP.productDescription && (
                                <p className="aap-modal-desc">{selectedAAP.productDescription}</p>
                            )}

                            <div className="aap-detail-grid">
                                <div className="aap-detail-item">
                                    <label>Purchase Price</label>
                                    <span>₦{selectedAAP.purchasePrice?.toLocaleString()}</span>
                                </div>
                                <div className="aap-detail-item">
                                    <label>Markup ({selectedAAP.repaymentTerm}d)</label>
                                    <span>{selectedAAP.markupPercentage}% = ₦{selectedAAP.markupAmount?.toLocaleString()}</span>
                                </div>
                                <div className="aap-detail-item aap-highlight">
                                    <label>Retailer Total</label>
                                    <span>₦{selectedAAP.totalRetailerCost?.toLocaleString()}</span>
                                </div>
                            </div>

                            <div className="aap-section">
                                <h4>Retailer</h4>
                                <p><strong>{selectedAAP.retailer?.name}</strong></p>
                                <p>{selectedAAP.retailer?.phone} • {selectedAAP.retailer?.email}</p>
                                <p className="text-muted">
                                    Credit: ₦{(selectedAAP.retailer?.creditLimit - selectedAAP.retailer?.usedCredit)?.toLocaleString()} available
                                </p>
                            </div>

                            <div className="aap-section">
                                <h4>Agent</h4>
                                <p><strong>{selectedAAP.agent?.name}</strong></p>
                                <p>{selectedAAP.agent?.phone}</p>
                            </div>

                            {selectedAAP.sellerName && (
                                <div className="aap-section">
                                    <h4>Seller</h4>
                                    <p><strong>{selectedAAP.sellerName}</strong></p>
                                    <p>{selectedAAP.sellerPhone}</p>
                                    <p className="text-muted">{selectedAAP.sellerLocation}</p>
                                </div>
                            )}

                            {/* Approval Form */}
                            {selectedAAP.status === 'pending_admin_approval' && (
                                <div className="aap-approval-section">
                                    <h4>Disburse Funds</h4>
                                    <p className="text-muted">Send ₦{selectedAAP.purchasePrice?.toLocaleString()} to {selectedAAP.agent?.name}</p>
                                    
                                    <div className="form-group">
                                        <label className="form-label">Disbursement Method</label>
                                        <select 
                                            value={disbursementForm.method}
                                            onChange={e => setDisbursementForm({...disbursementForm, method: e.target.value})}
                                            className="form-control"
                                        >
                                            <option value="bank_transfer">Bank Transfer</option>
                                            <option value="cash">Cash</option>
                                            <option value="mobile_money">Mobile Money</option>
                                        </select>
                                    </div>

                                    <div className="form-group">
                                        <label className="form-label">Reference (optional)</label>
                                        <input 
                                            type="text"
                                            value={disbursementForm.reference}
                                            onChange={e => setDisbursementForm({...disbursementForm, reference: e.target.value})}
                                            placeholder="e.g. Transfer ref or receipt number"
                                            className="form-control"
                                        />
                                    </div>

                                    <div className="aap-btn-group">
                                        <button 
                                            className="btn btn-primary"
                                            onClick={() => handleApprove(selectedAAP._id)}
                                            disabled={actionLoading}
                                        >
                                            {actionLoading ? 'Processing...' : 'Approve & Disburse'}
                                        </button>
                                        <button 
                                            className="btn btn-danger"
                                            onClick={() => {
                                                const reason = prompt('Reason for declining:');
                                                if (reason) handleDecline(selectedAAP._id, reason);
                                            }}
                                            disabled={actionLoading}
                                        >
                                            Decline
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AdminAAPDashboard;
