import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import { 
    ShoppingBag, CheckCircle, Clock, AlertTriangle, X, Eye, 
    DollarSign, User, Calendar, ClipboardList, Search
} from 'lucide-react';
import './AdminAAPDashboard.css';

const AdminAAPDashboard = () => {
    const [aaps, setAAPs] = useState([]);
    const [stats, setStats] = useState({});
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState('pending_admin_approval');
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedAAP, setSelectedAAP] = useState(null);
    const [disbursementForm, setDisbursementForm] = useState({
        method: 'bank_transfer',
        reference: '',
        duration: null
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
            const duration = disbursementForm.duration ? Number(disbursementForm.duration) : undefined;
            await api.put(`/aap/${aapId}/approve`, {
                disbursementMethod: disbursementForm.method,
                disbursementReference: disbursementForm.reference,
                duration
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
            case 'pending_murabaha_acceptance': return 'badge-warning';
            case 'murabaha_accepted': return 'badge-primary';
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
            pending_murabaha_acceptance: 'Murabaha Offer Sent',
            murabaha_accepted: 'Murabaha Accepted',
            delivered: 'Delivered',
            received: 'Received',
            completed: 'Completed',
            expired: 'EXPIRED',
            declined: 'Declined'
        };
        return labels[status] || status;
    };

    const filteredAAPs = aaps.filter(aap => {
        if (!searchTerm) return true;
        const term = searchTerm.toLowerCase();
        return (
            aap.productName?.toLowerCase().includes(term) ||
            aap.retailer?.name?.toLowerCase().includes(term) ||
            aap.agent?.name?.toLowerCase().includes(term)
        );
    });

    return (
        <div className="admin-page">
            <div className="page-hero">
                <div className="page-hero-icon">
                    <ClipboardList size={24} />
                </div>
                <div className="page-hero-body">
                    <h1 className="page-hero-title">Agent Purchases</h1>
                    <p className="page-hero-subtitle">Off-platform purchases via agents</p>
                </div>
            </div>

            {/* Stats Cards */}
            <div className="metrics-grid">
                <div 
                    className={`metric-card card aap-stat-card ${filter === 'pending_admin_approval' ? 'active' : ''}`}
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
                    className={`metric-card card aap-stat-card ${filter === 'fund_disbursed' ? 'active' : ''}`}
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
                    className={`metric-card card aap-stat-card ${filter === 'murabaha_accepted' ? 'active' : ''}`}
                    onClick={() => setFilter('murabaha_accepted')}
                >
                    <div className="metric-header">
                        <div className="icon-box icon-primary">
                            <CheckCircle size={20} />
                        </div>
                    </div>
                    <div className="metric-value">{stats.murabahaAccepted || 0}</div>
                    <div className="metric-sub">Accepted</div>
                </div>

                <div 
                    className={`metric-card card aap-stat-card ${filter === 'expired' ? 'active' : ''}`}
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
                    className={`metric-card card aap-stat-card ${filter === 'received' ? 'active' : ''}`}
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

            {/* Controls Bar */}
            <div className="aap-controls-bar">
                <div className="aap-search-wrapper">
                    <Search size={18} className="search-icon" />
                    <input 
                        type="text"
                        placeholder="Search by product, retailer, or agent..."
                        value={searchTerm}
                        onChange={e => setSearchTerm(e.target.value)}
                        className="form-control aap-search-input"
                    />
                    {searchTerm && (
                        <button className="clear-search-btn" onClick={() => setSearchTerm('')}>
                            <X size={14} />
                        </button>
                    )}
                </div>

                <div className="aap-filter-select-container">
                    <span className="filter-label">Status Filter</span>
                    <select 
                        value={filter}
                        onChange={e => setFilter(e.target.value)}
                        className="form-select aap-filter-select"
                    >
                        <option value="">All Purchases</option>
                        <option value="pending_admin_approval">Pending Approval</option>
                        <option value="pending_murabaha_acceptance">Murabaha Offer Sent</option>
                        <option value="murabaha_accepted">Murabaha Accepted</option>
                        <option value="fund_disbursed">Fund Disbursed</option>
                        <option value="delivered">Delivered</option>
                        <option value="received">Received / Completed</option>
                        <option value="expired">Expired</option>
                        <option value="declined">Declined</option>
                    </select>
                </div>
            </div>

            {/* AAP List */}
            {loading ? (
                <div className="aap-loading">Loading...</div>
            ) : filteredAAPs.length === 0 ? (
                <div className="aap-empty">
                    <ShoppingBag size={48} strokeWidth={1} />
                    <p>{searchTerm ? "No matching purchases found." : "No purchases in this category."}</p>
                </div>
            ) : (
                <div className="aap-grid">
                    {filteredAAPs.map(aap => (
                        <div key={aap._id} className="card aap-card">
                            <div className="aap-card-header">
                                <div>
                                    <h3 className="aap-card-title">{aap.productName}</h3>
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
                                {aap.requestedDuration && (
                                    <div className="aap-info-row">
                                        <Clock size={14} />
                                        <span>Agent Requested: <strong>{aap.requestedDuration}h</strong> {aap.adminAdjustedDuration ? `(Admin set: ${aap.adminAdjustedDuration}h)` : ''}</span>
                                    </div>
                                )}
                                {['fund_disbursed', 'pending_murabaha_acceptance', 'murabaha_accepted'].includes(aap.status) && aap.expiresAt && (
                                    <div className="aap-info-row aap-danger">
                                        <Clock size={14} />
                                        <span>Expires: {new Date(aap.expiresAt).toLocaleString()}</span>
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
                    <div className="aap-modal card" onClick={e => e.stopPropagation()}>
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
                                        <h4>{selectedAAP.proxyMurabahaAcceptance ? 'Proxy Murabaha Acceptance' : 'Proxy Verification Required'}</h4>
                                    </div>
                                    <p className="proxy-desc">
                                        Agent <strong>{selectedAAP.agent?.name}</strong> {selectedAAP.proxyMurabahaAcceptance ? 'confirmed Murabaha acceptance' : selectedAAP.proxyReceipt ? 'confirmed delivery' : 'confirmed interest'} on behalf of the retailer. 
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

                            {/* Murabaha Offer Info (post-disbursement) */}
                            {(selectedAAP.status === 'pending_murabaha_acceptance' || selectedAAP.status === 'murabaha_accepted') && (
                                <div className="aap-section" style={{ border: '1px solid var(--primary)', borderRadius: 12, padding: 16, marginBottom: 16 }}>
                                    <h4 style={{ color: 'var(--primary)' }}>
                                        <CheckCircle size={16} style={{ marginRight: 6 }} />
                                        Murabaha Sale {selectedAAP.status === 'murabaha_accepted' ? 'Accepted' : 'Offer Sent'}
                                    </h4>
                                    <div className="aap-detail-grid" style={{ marginTop: 12 }}>
                                        <div className="aap-detail-item">
                                            <label>Amana Purchase Price</label>
                                            <span>₦{selectedAAP.purchasePrice?.toLocaleString()}</span>
                                        </div>
                                        <div className="aap-detail-item">
                                            <label>Markup ({selectedAAP.repaymentTerm}d)</label>
                                            <span>{selectedAAP.markupPercentage}% = +₦{selectedAAP.markupAmount?.toLocaleString()}</span>
                                        </div>
                                        <div className="aap-detail-item aap-highlight">
                                            <label>Retailer Pays</label>
                                            <span>₦{selectedAAP.totalRetailerCost?.toLocaleString()}</span>
                                        </div>
                                    </div>
                                    <p className="text-muted" style={{ marginTop: 8 }}>
                                        Due in {selectedAAP.repaymentTerm} days after delivery
                                    </p>
                                    {selectedAAP.murabahaOfferSentAt && (
                                        <p className="text-muted" style={{ fontSize: 12 }}>
                                            Offer sent: {new Date(selectedAAP.murabahaOfferSentAt).toLocaleString()}
                                        </p>
                                    )}
                                    {selectedAAP.murabahaAcceptedAt && (
                                        <p className="text-muted" style={{ fontSize: 12 }}>
                                            Accepted: {new Date(selectedAAP.murabahaAcceptedAt).toLocaleString()}
                                        </p>
                                    )}
                                    {selectedAAP.proxyMurabahaAcceptance && (
                                        <p className="text-warning" style={{ fontSize: 12, marginTop: 4 }}>
                                            Accepted via agent proxy
                                        </p>
                                    )}
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
                                        <label className="form-label">Duration (hours)</label>
                                        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                                            {[1, 2, 4, 8, 12, 24, 48, 72].map(h => (
                                                <button
                                                    key={h}
                                                    type="button"
                                                    className={`btn ${disbursementForm.duration === h ? 'btn-primary' : 'btn-outline'}`}
                                                    style={{ padding: '4px 12px', fontSize: 12 }}
                                                    onClick={() => setDisbursementForm({...disbursementForm, duration: h})}
                                                >
                                                    {h >= 24 ? `${h / 24}d` : `${h}h`}
                                                </button>
                                            ))}
                                        </div>
                                        {selectedAAP?.requestedDuration && (
                                            <small className="text-muted" style={{ display: 'block', marginTop: 4 }}>
                                                Agent requested {selectedAAP.requestedDuration}h. Default: {selectedAAP.requestedDuration}h (click a button above to override).
                                            </small>
                                        )}
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
