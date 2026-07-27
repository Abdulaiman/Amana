import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import { Check, X, DollarSign, Users, Briefcase, Activity, AlertCircle, ChevronRight, Search, ShieldCheck, ShieldX, UserCheck, Clock, Wallet, AlertTriangle, BarChart3 } from 'lucide-react';
import './AdminDashboard.css';
import './RetailerDashboard.css'; // Shared styles
import { useToast } from '../context/ToastContext';
import ConfirmModal from '../components/ConfirmModal';

const AdminDashboard = () => {
    const [stats, setStats] = useState({ totalUsers: 0, totalVendors: 0, totalOrders: 0, totalAAP: 0, pendingPayouts: 0, pendingVendorVerifications: 0, pendingRetailerVerifications: 0 });
    const [withdrawals, setWithdrawals] = useState([]);
    const [vendors, setVendors] = useState([]);
    const [retailers, setRetailers] = useState([]);
    const [agents, setAgents] = useState([]);
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('payouts');
    const [searchTerm, setSearchTerm] = useState('');
    const [agentSearchQuery, setAgentSearchQuery] = useState('');
    const [agentSearchResults, setAgentSearchResults] = useState([]);

    // Detail Modal State
    const [selectedEntity, setSelectedEntity] = useState(null); // { type: 'vendor'|'retailer', data: {} }
    const [rejectionReason, setRejectionReason] = useState('');
    const [isActionLoading, setIsActionLoading] = useState(false);

    const [confirmModal, setConfirmModal] = useState({ isOpen: false, title: '', message: '', onConfirm: null, isDestructive: false });
    const { addToast } = useToast();

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        try {
            const [statsRes, withdrawalsRes, vendorsRes, retailersRes, agentsRes] = await Promise.all([
                api.get('/admin/analytics'),
                api.get('/admin/withdrawals'),
                api.get('/admin/vendors'),
                api.get('/admin/retailers'),
                api.get('/admin/agents')
            ]);
            setStats(statsRes.data);
            setWithdrawals(withdrawalsRes.data);
            setVendors(vendorsRes.data);
            setRetailers(retailersRes.data);
            setAgents(agentsRes.data);
        } catch (e) {
            console.error(e);
            addToast('Failed to load dashboard data', 'error');
        } finally {
            setLoading(false);
        }
    };

    const handleVerifyVendor = async (id) => {
        setIsActionLoading(true);
        try {
            await api.put(`/admin/vendor/${id}/verify`);
            await loadData();
            addToast('Vendor Verified Successfully', 'success');
            setSelectedEntity(null);
        } catch (e) {
            addToast('Verification Failed', 'error');
        } finally {
            setIsActionLoading(false);
        }
    };

    const handleRejectVendor = async (id) => {
        if (!rejectionReason) return addToast('Please provide a reason for rejection', 'error');
        setIsActionLoading(true);
        try {
            await api.put(`/admin/vendor/${id}/reject`, { reason: rejectionReason });
            await loadData();
            addToast('Vendor Application Rejected', 'info');
            setSelectedEntity(null);
            setRejectionReason('');
        } catch (e) {
            addToast('Rejection Failed', 'error');
        } finally {
            setIsActionLoading(false);
        }
    };

    const [customCreditLimit, setCustomCreditLimit] = useState('');

    const handleVerifyRetailer = async (id, overrideLimit) => {
        setIsActionLoading(true);
        try {
            const limit = overrideLimit !== undefined ? overrideLimit : (customCreditLimit ? Number(customCreditLimit) : undefined);
            await api.put(`/admin/retailer/${id}/verify`, {
                approvedCreditLimit: limit,
                d1_validId: true,
                d2_noAdverseHistory: true,
                c1_peerReferral: { pass: true },
                c2_marketUnionAwareness: { pass: true },
                adminNote: rejectionReason
            });
            await loadData();
            addToast('Retailer Approved & Credit Limit Allocated!', 'success');
            setSelectedEntity(null);
            setCustomCreditLimit('');
            setRejectionReason('');
        } catch (e) {
            const data = e.response?.data;
            if (data?.needsCorrection) {
                setConfirmModal({
                    isOpen: true,
                    title: 'Adjust Credit Limit?',
                    message: data.message,
                    onConfirm: () => {
                        setConfirmModal({ isOpen: false, title: '', message: '', onConfirm: null });
                        handleVerifyRetailer(id, data.suggestedLimit);
                    },
                    confirmText: `Use ₦${data.suggestedLimit.toLocaleString()}`
                });
            } else {
                addToast(data?.message || 'Verification Failed', 'error');
            }
        } finally {
            setIsActionLoading(false);
        }
    };


    const handleRejectRetailer = async (id) => {
        if (!rejectionReason) return addToast('Please provide a reason for rejection', 'error');
        setIsActionLoading(true);
        try {
            await api.put(`/admin/retailer/${id}/reject`, { reason: rejectionReason });
            await loadData();
            addToast('Retailer KYC Rejected', 'info');
            setSelectedEntity(null);
            setRejectionReason('');
        } catch (e) {
            addToast('Rejection Failed', 'error');
        } finally {
            setIsActionLoading(false);
        }
    };

    const handleToggleAgent = async (id) => {
        try {
            await api.put(`/admin/retailer/${id}/agent`);
            await loadData();
            addToast('Agent status updated', 'success');
        } catch (e) {
            addToast('Failed to update agent status', 'error');
        }
    };

    const handleAgentSearch = async (e) => {
        e.preventDefault();
        if (!agentSearchQuery) return;
        setLoading(true);
        try {
            const res = await api.get(`/admin/retailers/search?query=${agentSearchQuery}`);
            setAgentSearchResults(res.data);
        } catch (e) {
            addToast('Search failed', 'error');
        } finally {
            setLoading(false);
        }
    };

    const openReviewModal = async (type, id) => {
        try {
            const res = await api.get(`/admin/${type}/${id}`);
            setSelectedEntity({ type, data: res.data });
        } catch (e) {
            addToast('Failed to fetch details', 'error');
        }
    };

    const filteredWithdrawals = withdrawals.filter(w => 
        w.vendor?.businessName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        w.status.includes(searchTerm.toLowerCase())
    );

    const filteredVendors = vendors.filter(v => 
        v.businessName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        v.email?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const filteredRetailers = retailers.filter(r => 
        r.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        r.email?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    if (loading) return (
        <div className="loading-container">
            <div className="loading-spinner"></div>
        </div>
    );

    return (
        <div className="admin-dashboard-container animate-fade-in">
            <div className="admin-max-width">
                 <header className="page-hero">
                    <div className="page-hero-icon">
                        <BarChart3 size={24} />
                    </div>
                    <div className="page-hero-body">
                        <h1 className="page-hero-title">Dashboard Overview</h1>
                        <p className="page-hero-subtitle">Platform Status & Activity</p>
                    </div>
                    <div className="page-hero-actions">
                        <div className="operational-badge">
                            <Activity size={14} /> Operational
                        </div>
                    </div>
                </header>
 
                {stats.pendingAAPCount > 0 && (
                    <div className="urgent-notification-banner">
                        <div className="urgent-content">
                            <div className="urgent-icon-box">
                                <AlertTriangle size={24} />
                            </div>
                            <div className="urgent-text">
                                <h3>{stats.pendingAAPCount} New Agent Purchase{stats.pendingAAPCount > 1 ? 's' : ''}</h3>
                                <p>There are new agent-assisted purchases waiting for your review and fund disbursement.</p>
                            </div>
                        </div>
                        <button className="urgent-action-btn" onClick={() => navigate('/admin/aap')}>
                            Review & Disburse Funds
                            <ChevronRight size={18} />
                        </button>
                    </div>
                )}
 
                <div className="admin-stats-grid">
                    <div className="stat-card-wrapper gradient-purple">
                        <div className="admin-stat-card group">
                            <div className="admin-stat-icon purple group-hover-scale">
                                <Users size={28} />
                            </div>
                            <div>
                                <h3 className="admin-stat-value">{stats.totalUsers}</h3>
                                <p className="admin-stat-label">Total Retailers</p>
                            </div>
                        </div>
                    </div>
                    
                    <div className="stat-card-wrapper gradient-teal">
                        <div className="admin-stat-card group">
                            <div className="admin-stat-icon accent group-hover-scale">
                                <Briefcase size={28} />
                            </div>
                            <div>
                                <h3 className="admin-stat-value">{stats.totalVendors}</h3>
                                <p className="admin-stat-label">Active Vendors</p>
                            </div>
                        </div>
                    </div>
                    
                    <div className="stat-card-wrapper gradient-blue">
                         <div className="admin-stat-card group">
                            <div className="admin-stat-icon blue group-hover-scale">
                                <DollarSign size={28} />
                            </div>
                            <div>
                                <h3 className="admin-stat-value">{stats.totalOrders}</h3>
                                <p className="admin-stat-label">Total Orders</p>
                            </div>
                        </div>
                    </div>

                    <div className="stat-card-wrapper gradient-orange">
                         <div className="admin-stat-card group">
                            <div className="admin-stat-icon orange group-hover-scale">
                                <Clock size={28} />
                            </div>
                            <div>
                                <h3 className="admin-stat-value">{stats.pendingPayouts}</h3>
                                <p className="admin-stat-label">Pending Payouts</p>
                            </div>
                        </div>
                    </div>

                    <div className="stat-card-wrapper gradient-teal">
                         <div className="admin-stat-card group">
                            <div className="admin-stat-icon accent group-hover-scale">
                                <ShieldCheck size={28} />
                            </div>
                            <div>
                                <h3 className="admin-stat-value">{stats.totalAAP}</h3>
                                <p className="admin-stat-label">Total AAPs</p>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="admin-panel card">
                    <div className="admin-tabs-header">
                        <div className="admin-tabs-list">
                            <button className={`tab-btn ${activeTab === 'payouts' ? 'active' : ''}`} onClick={() => setActiveTab('payouts')}>
                                <Wallet size={16} /> Payouts {stats.pendingPayouts > 0 && <span className="badge">{stats.pendingPayouts}</span>}
                            </button>
                            <button className={`tab-btn ${activeTab === 'vendors' ? 'active' : ''}`} onClick={() => setActiveTab('vendors')}>
                                <Briefcase size={16} /> Vendors {stats.pendingVendorVerifications > 0 && <span className="badge">{stats.pendingVendorVerifications}</span>}
                            </button>
                            <button className={`tab-btn ${activeTab === 'retailers' ? 'active' : ''}`} onClick={() => setActiveTab('retailers')}>
                                <Users size={16} /> Retailers {stats.pendingRetailerVerifications > 0 && <span className="badge">{stats.pendingRetailerVerifications}</span>}
                            </button>
                            <button className={`tab-btn ${activeTab === 'agents' ? 'active' : ''}`} onClick={() => setActiveTab('agents')}>
                                <ShieldCheck size={16} /> Agents
                            </button>
                        </div>
                        <div className="admin-search-wrapper">
                            <Search className="admin-search-icon" size={16} />
                            <input type="text" placeholder="Filter records..." className="admin-search-input" value={searchTerm} onChange={e => setSearchTerm(e.target.value)} />
                        </div>
                    </div>

                    <div className="admin-content-area">
                        {activeTab === 'payouts' && (
                            <div className="w-full">
                                {filteredWithdrawals.length === 0 ? (
                                    <div className="empty-state">
                                        <Check size={48} className="empty-icon" />
                                        <p>All cleared! No pending payouts.</p>
                                    </div>
                                ) : (
                                    <div className="table-wrapper">
                                        <table className="payouts-table">
                                            <thead>
                                                <tr className="payouts-head-row">
                                                    <th className="th-cell pl">Vendor Information</th>
                                                    <th className="th-cell">Amount</th>
                                                    <th className="th-cell">Bank Details</th>
                                                    <th className="th-cell">Status</th>
                                                    <th className="th-cell pr text-right">Actions</th>
                                                </tr>
                                            </thead>
                                            <tbody className="payouts-body">
                                                {filteredWithdrawals.map(req => (
                                                    <tr key={req._id} className="payouts-row group">
                                                        <td className="td-cell pl" data-label="Vendor">
                                                            <div>
                                                                <p className="vendor-name-text">{req.vendor?.businessName || 'Unknown'}</p>
                                                                <p className="vendor-id-text">ID: {req.vendor?._id?.substring(0,8)}</p>
                                                            </div>
                                                        </td>
                                                        <td className="td-cell" data-label="Amount">
                                                            <span className="amount-text">₦{req.amount.toLocaleString()}</span>
                                                        </td>
                                                        <td className="td-cell" data-label="Bank Details">
                                                            <div className="bank-details-box">
                                                                <p className="bank-name">{req.bankDetailsSnapshot?.bankName}</p>
                                                                <p className="account-number">{req.bankDetailsSnapshot?.accountNumber}</p>
                                                                <p className="account-name">{req.bankDetailsSnapshot?.accountName}</p>
                                                            </div>
                                                        </td>
                                                        <td className="td-cell" data-label="Status">
                                                            <span className={`status-pill ${req.status}`}>
                                                                {req.status === 'approved' ? <Check size={12} /> : <AlertCircle size={12} />}
                                                                {req.status.toUpperCase()}
                                                            </span>
                                                        </td>
                                                        <td className="td-cell pr text-right" data-label="Action">
                                                            {req.status === 'pending' && (
                                                                <button 
                                                                    onClick={() => {
                                                                        setConfirmModal({
                                                                            isOpen: true,
                                                                            title: 'Confirm Payout',
                                                                            message: `Are you sure you have paid ₦${req.amount.toLocaleString()} to ${req.vendor.businessName}?`,
                                                                            onConfirm: () => {
                                                                                api.put(`/admin/withdrawals/${req._id}/confirm`).then(() => {
                                                                                    loadData();
                                                                                    addToast('Payout confirmed', 'success');
                                                                                });
                                                                            }
                                                                        });
                                                                    }}
                                                                    className="confirm-transfer-btn"
                                                                >
                                                                    Confirm Paid
                                                                </button>
                                                            )}
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                )}
                            </div>
                        )}

                        {activeTab === 'vendors' && (
                            <div className="w-full">
                                {filteredVendors.length === 0 ? (
                                    <div className="empty-state">
                                        <Briefcase size={48} className="empty-icon" />
                                        <p>No vendors found.</p>
                                    </div>
                                ) : (
                                    <div className="table-wrapper">
                                        <table className="payouts-table">
                                            <thead>
                                                <tr className="payouts-head-row">
                                                    <th className="th-cell pl">Business</th>
                                                    <th className="th-cell">Contact</th>
                                                    <th className="th-cell">Wallet</th>
                                                    <th className="th-cell">Status</th>
                                                    <th className="th-cell pr text-right">Actions</th>
                                                </tr>
                                            </thead>
                                            <tbody className="payouts-body">
                                                {filteredVendors.map(vendor => (
                                                    <tr key={vendor._id} className="payouts-row group">
                                                        <td className="td-cell pl" data-label="Business">
                                                            <div>
                                                                <div className="flex-align-center gap-2">
                                                                    <p className="vendor-name-text">{vendor.businessName}</p>
                                                                    {vendor.linkedProfileId && <span className="linked-badge" title="Linked to Retailer Account">Linked</span>}
                                                                </div>
                                                                <p className="vendor-id-text">{vendor.address}</p>
                                                            </div>
                                                        </td>
                                                        <td className="td-cell" data-label="Contact">
                                                            <p className="vendor-id-text">{vendor.email}</p>
                                                            <p className="vendor-id-text">{vendor.phones?.[0]}</p>
                                                        </td>
                                                        <td className="td-cell" data-label="Wallet">
                                                            <span className="amount-text">₦{(vendor.walletBalance || 0).toLocaleString()}</span>
                                                        </td>
                                                        <td className="td-cell" data-label="Status">
                                                            <span className={`status-pill ${vendor.verificationStatus}`}>
                                                                {vendor.verificationStatus === 'verified' ? <ShieldCheck size={12} /> : 
                                                                 vendor.verificationStatus === 'rejected' ? <ShieldX size={12} /> : 
                                                                 <Clock size={12} />}
                                                                {vendor.verificationStatus?.toUpperCase() || 'PENDING'}
                                                            </span>
                                                        </td>
                                                        <td className="td-cell pr text-right" data-label="Action">
                                                            <button 
                                                                onClick={() => openReviewModal('vendor', vendor._id)}
                                                                className="review-btn"
                                                            >
                                                                Review Documents
                                                            </button>
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                )}
                            </div>
                        )}

                        {activeTab === 'retailers' && (
                            <div className="w-full">
                                {filteredRetailers.length === 0 ? (
                                    <div className="empty-state">
                                        <Users size={48} className="empty-icon" />
                                        <p>No retailers found.</p>
                                    </div>
                                ) : (
                                    <div className="table-wrapper">
                                        <table className="payouts-table">
                                            <thead>
                                                <tr className="payouts-head-row">
                                                    <th className="th-cell pl">Name</th>
                                                    <th className="th-cell">Contact</th>
                                                    <th className="th-cell">Score/Tier</th>
                                                    <th className="th-cell">Status</th>
                                                    <th className="th-cell pr text-right">Actions</th>
                                                </tr>
                                            </thead>
                                            <tbody className="payouts-body">
                                                {filteredRetailers.map(user => (
                                                    <tr key={user._id} className="payouts-row group">
                                                        <td className="td-cell pl" data-label="Name">
                                                            <div>
                                                                <div className="flex-align-center gap-2">
                                                                    <p className="vendor-name-text">{user.name}</p>
                                                                    {user.linkedProfileId && <span className="linked-badge" title="Linked to Vendor Account">Linked</span>}
                                                                </div>
                                                                <p className="vendor-id-text">{user.businessName || 'N/A'}</p>
                                                            </div>
                                                        </td>
                                                        <td className="td-cell" data-label="Contact">
                                                            <p className="vendor-id-text">{user.email}</p>
                                                            <p className="vendor-id-text">{user.phone}</p>
                                                        </td>
                                                        <td className="td-cell" data-label="Score/Tier">
                                                            <p className="amount-text">{user.amanaScore || 0}</p>
                                                            <p className="vendor-id-text">{user.tier || 'Bronze'}</p>
                                                        </td>
                                                        <td className="td-cell" data-label="Status">
                                                            <span className={`status-pill ${user.verificationStatus === 'approved' ? 'approved' : user.verificationStatus === 'rejected' ? 'rejected' : 'pending'}`}>
                                                                {user.verificationStatus === 'approved' ? <UserCheck size={12} /> : user.verificationStatus === 'rejected' ? <ShieldX size={12} /> : <Clock size={12} />}
                                                                {(user.verificationStatus || 'PENDING').toUpperCase()}
                                                            </span>
                                                        </td>
                                                        <td className="td-cell pr text-right" data-label="Action">
                                                            <button 
                                                                onClick={() => openReviewModal('retailer', user._id)}
                                                                className="review-btn"
                                                            >
                                                                Review KYC
                                                            </button>
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                )}
                            </div>
                        )}

                        {activeTab === 'agents' && (
                            <div className="w-full">
                                <section className="agent-search-section">
                                    <div className="section-header-inline">
                                        <h3 className="sub-panel-title">Search & Assign Agents</h3>
                                        <p className="sub-panel-desc">Search for verified retailers by Phone or NIN to grant them Agent status.</p>
                                    </div>
                                    <form onSubmit={handleAgentSearch} className="agent-search-form mt-4">
                                        <div className="search-input-group">
                                            <Search size={18} className="search-icon-abs" />
                                            <input 
                                                type="text" 
                                                placeholder="Enter Phone Number or NIN..." 
                                                className="agent-search-input-field"
                                                value={agentSearchQuery}
                                                onChange={e => setAgentSearchQuery(e.target.value)}
                                            />
                                            <button type="submit" className="agent-search-submit">Search</button>
                                        </div>
                                    </form>

                                    {agentSearchResults.length > 0 && (
                                        <div className="search-results-mini mt-6">
                                            <h4 className="results-label">Search Results</h4>
                                            <div className="results-grid">
                                                {agentSearchResults.map(res => (
                                                    <div key={res._id} className="search-result-card card">
                                                        <div className="res-info">
                                                            <div className="res-avatar">
                                                                {res.kyc?.profilePicUrl ? <img src={res.kyc.profilePicUrl} alt={res.name} /> : <Users size={20} />}
                                                            </div>
                                                            <div>
                                                                <p className="res-name">{res.name}</p>
                                                                <p className="res-sub">{res.phone} | NIN: {res.kyc?.nin || 'N/A'}</p>
                                                            </div>
                                                        </div>
                                                        <button 
                                                            onClick={() => handleToggleAgent(res._id)}
                                                            className={`agent-toggle-btn ${res.isAgent ? 'remove' : 'add'}`}
                                                        >
                                                            {res.isAgent ? 'Remove Agent' : 'Add as Agent'}
                                                        </button>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                </section>

                                <div className="active-agents-section mt-10">
                                    <h3 className="sub-panel-title">Active Agents</h3>
                                    {agents.length === 0 ? (
                                        <div className="empty-state">
                                            <ShieldCheck size={48} className="empty-icon" />
                                            <p>No active agents assigned yet.</p>
                                        </div>
                                    ) : (
                                        <div className="table-wrapper">
                                            <table className="payouts-table mt-4">
                                                <thead>
                                                    <tr className="payouts-head-row">
                                                        <th className="th-cell pl">Agent</th>
                                                        <th className="th-cell">Contact</th>
                                                        <th className="th-cell">Score</th>
                                                        <th className="th-cell pr text-right">Actions</th>
                                                    </tr>
                                                </thead>
                                                <tbody className="payouts-body">
                                                    {agents.map(agent => (
                                                        <tr key={agent._id} className="payouts-row group">
                                                            <td className="td-cell pl" data-label="Agent">
                                                                <div className="agent-info-cell">
                                                                    <div className="mini-avatar">
                                                                        {agent.kyc?.profilePicUrl ? <img src={agent.kyc.profilePicUrl} alt={agent.name} /> : <Users size={14} />}
                                                                    </div>
                                                                    <div>
                                                                        <p className="vendor-name-text">{agent.name}</p>
                                                                        <p className="vendor-id-text">ID: {agent._id.substring(0,8)}</p>
                                                                    </div>
                                                                </div>
                                                            </td>
                                                            <td className="td-cell" data-label="Contact">
                                                                <p className="vendor-id-text">{agent.phone}</p>
                                                                <p className="vendor-id-text">{agent.email}</p>
                                                            </td>
                                                            <td className="td-cell" data-label="Score">
                                                                <span className="amount-text">{agent.amanaScore || 0}</span>
                                                            </td>
                                                            <td className="td-cell pr text-right" data-label="Actions">
                                                                <button 
                                                                    onClick={() => handleToggleAgent(agent._id)}
                                                                    className="remove-agent-btn"
                                                                >
                                                                    Revoke Agent Status
                                                                </button>
                                                            </td>
                                                        </tr>
                                                    ))}
                                                </tbody>
                                            </table>
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* REVIEW MODAL */}
            {selectedEntity && (
                <div className="admin-modal-overlay">
                    <div className="admin-modal-content animate-slide-up">
                        <div className="admin-modal-header">
                            <div className="modal-header-left">
                                <div className="modal-entity-avatar">
                                    {selectedEntity.data.name?.charAt(0) || selectedEntity.data.businessName?.charAt(0) || '?'}
                                </div>
                                <div>
                                    <h2 className="modal-title">
                                        {selectedEntity.data.businessName || selectedEntity.data.name}
                                        <span className={`modal-status-badge ${selectedEntity.data.verificationStatus || 'pending'}`}>
                                            {(selectedEntity.data.verificationStatus || 'PENDING').replace(/_/g, ' ')}
                                        </span>
                                    </h2>
                                    <p className="modal-subtitle">
                                        {selectedEntity.type === 'vendor' ? 'Vendor' : 'Retailer'} · ID: {selectedEntity.data._id?.substring(0, 10)}...
                                    </p>
                                </div>
                            </div>
                            <button className="close-btn" onClick={() => setSelectedEntity(null)}><X size={20} /></button>
                        </div>

                        <div className="admin-modal-body">
                            {selectedEntity.type === 'retailer' ? (
                                <div className="review-tab-content">
                                    {/* ===== TAB 1: PROFILE ===== */}
                                    <details className="review-section" open>
                                        <summary className="review-section-header">
                                            <span className="review-section-icon">👤</span>
                                            <span>Personal & Business Profile</span>
                                            <span className="review-section-toggle">▼</span>
                                        </summary>
                                        <div className="review-section-body">
                                            <div className="profile-two-col">
                                                <div className="profile-col">
                                                    <h4 className="profile-col-title">Personal Information</h4>
                                                    <div className="profile-field"><span className="profile-field-label">Full Name</span><span className="profile-field-value">{selectedEntity.data.name}</span></div>
                                                    <div className="profile-field"><span className="profile-field-label">Email</span><span className="profile-field-value">{selectedEntity.data.email}</span></div>
                                                    <div className="profile-field"><span className="profile-field-label">Phone</span><span className="profile-field-value">{selectedEntity.data.phone}</span></div>
                                                    <div className="profile-field"><span className="profile-field-label">NIN</span><span className="profile-field-value">{selectedEntity.data.kyc?.nin || 'N/A'}</span></div>
                                                    <div className="profile-field"><span className="profile-field-label">BVN</span><span className="profile-field-value">{selectedEntity.data.kyc?.bvn || 'N/A'}</span></div>
                                                    <div className="profile-field"><span className="profile-field-label">Home Address</span><span className="profile-field-value">{selectedEntity.data.address || 'N/A'}</span></div>
                                                </div>
                                                <div className="profile-col">
                                                    <h4 className="profile-col-title">Business Information</h4>
                                                    <div className="profile-field"><span className="profile-field-label">Business Name</span><span className="profile-field-value">{selectedEntity.data.businessInfo?.businessName || 'N/A'}</span></div>
                                                    <div className="profile-field"><span className="profile-field-label">Industry</span><span className="profile-field-value">{selectedEntity.data.businessInfo?.businessType || 'N/A'}</span></div>
                                                    <div className="profile-field"><span className="profile-field-label">Years in Business</span><span className="profile-field-value">{selectedEntity.data.businessInfo?.yearsInBusiness || 'N/A'} yrs</span></div>
                                                    <div className="profile-field"><span className="profile-field-label">Starting Capital</span><span className="profile-field-value">₦{selectedEntity.data.businessInfo?.startingCapital || 'N/A'}</span></div>
                                                    <div className="profile-field full-width"><span className="profile-field-label">Description</span><span className="profile-field-value">{selectedEntity.data.businessInfo?.description || 'N/A'}</span></div>
                                                    <div className="profile-field full-width"><span className="profile-field-label">Peer Referrals</span><span className="profile-field-value">{selectedEntity.data.peerReferrals?.map(r => r.refereePhone).join(', ') || 'None'}</span></div>
                                                </div>
                                            </div>
                                        </div>
                                    </details>

                                    {/* ===== TAB 2: AGENT FIELD VISIT REPORT ===== */}
                                    <details className="review-section" open>
                                        <summary className="review-section-header">
                                            <span className="review-section-icon">📋</span>
                                            <span>Agent Field Visit Report</span>
                                            {selectedEntity.data.eligibilityChecklist?.fieldVisitDate && (
                                                <span className="visit-date-badge">
                                                    Visited {new Date(selectedEntity.data.eligibilityChecklist.fieldVisitDate).toLocaleDateString()}
                                                </span>
                                            )}
                                            <span className="review-section-toggle">▼</span>
                                        </summary>
                                        <div className="review-section-body">
                                            {/* Section A: Business Legitimacy */}
                                            <div className="checklist-group">
                                                <h4 className="checklist-group-title">Section A — Business Legitimacy</h4>
                                                <div className="checklist-cards">
                                                    <div className={`checklist-card ${selectedEntity.data.eligibilityChecklist?.a1_physicalStore?.pass ? 'pass' : 'fail'}`}>
                                                        <div className="checklist-card-header">
                                                            <span className={`checklist-badge ${selectedEntity.data.eligibilityChecklist?.a1_physicalStore?.pass ? 'pass' : 'fail'}`}>
                                                                {selectedEntity.data.eligibilityChecklist?.a1_physicalStore?.pass ? 'PASS' : 'FAIL'}
                                                            </span>
                                                            <span className="checklist-card-title">A1 Physical Store</span>
                                                        </div>
                                                        {selectedEntity.data.eligibilityChecklist?.a1_physicalStore?.notes && (
                                                            <p className="checklist-agent-note">“{selectedEntity.data.eligibilityChecklist.a1_physicalStore.notes}”</p>
                                                        )}
                                                    </div>
                                                    <div className={`checklist-card ${selectedEntity.data.eligibilityChecklist?.a2_minTradingHistory?.pass ? 'pass' : 'fail'}`}>
                                                        <div className="checklist-card-header">
                                                            <span className={`checklist-badge ${selectedEntity.data.eligibilityChecklist?.a2_minTradingHistory?.pass ? 'pass' : 'fail'}`}>
                                                                {selectedEntity.data.eligibilityChecklist?.a2_minTradingHistory?.pass ? 'PASS' : 'FAIL'}
                                                            </span>
                                                            <span className="checklist-card-title">A2 Trading History (≥6mo)</span>
                                                        </div>
                                                        {selectedEntity.data.eligibilityChecklist?.a2_minTradingHistory?.notes && (
                                                            <p className="checklist-agent-note">“{selectedEntity.data.eligibilityChecklist.a2_minTradingHistory.notes}”</p>
                                                        )}
                                                    </div>
                                                    <div className={`checklist-card ${selectedEntity.data.eligibilityChecklist?.a3_goodsResaleOnly?.pass ? 'pass' : 'fail'}`}>
                                                        <div className="checklist-card-header">
                                                            <span className={`checklist-badge ${selectedEntity.data.eligibilityChecklist?.a3_goodsResaleOnly?.pass ? 'pass' : 'fail'}`}>
                                                                {selectedEntity.data.eligibilityChecklist?.a3_goodsResaleOnly?.pass ? 'PASS' : 'FAIL'}
                                                            </span>
                                                            <span className="checklist-card-title">A3 Goods for Resale Only</span>
                                                        </div>
                                                        {selectedEntity.data.eligibilityChecklist?.a3_goodsResaleOnly?.notes && (
                                                            <p className="checklist-agent-note">“{selectedEntity.data.eligibilityChecklist.a3_goodsResaleOnly.notes}”</p>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Section B: Financial Capacity */}
                                            <div className="checklist-group">
                                                <h4 className="checklist-group-title">Section B — Financial Capacity</h4>
                                                <div className="financial-summary">
                                                    <div className="financial-metric">
                                                        <span className="financial-label">B1 Verified Capital</span>
                                                        <span className="financial-value">₦{(selectedEntity.data.eligibilityChecklist?.verifiedCapitalAmount || 0).toLocaleString()}</span>
                                                    </div>
                                                    <div className={`financial-metric ${selectedEntity.data.eligibilityChecklist?.b2_minCapitalMet ? 'pass' : 'fail'}`}>
                                                        <span className="financial-label">B2 Minimum Capital ≥₦500,000</span>
                                                        <span className="financial-value">
                                                            {selectedEntity.data.eligibilityChecklist?.b2_minCapitalMet ? 'PASS ✓' : 'FAIL ✕'}
                                                        </span>
                                                    </div>
                                                    <div className="financial-metric highlight">
                                                        <span className="financial-label">B3 Financing Ceiling (20%)</span>
                                                        <span className="financial-value">₦{(selectedEntity.data.eligibilityChecklist?.calculatedCeilingAmount || 0).toLocaleString()}</span>
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Section C2: Social Vetting */}
                                            <div className="checklist-group">
                                                <h4 className="checklist-group-title">Section C2 — Market Union Awareness</h4>
                                                <div className={`checklist-card ${selectedEntity.data.eligibilityChecklist?.c2_marketUnionAwareness?.pass ? 'pass' : 'fail'}`}>
                                                    <div className="checklist-card-header">
                                                        <span className={`checklist-badge ${selectedEntity.data.eligibilityChecklist?.c2_marketUnionAwareness?.pass ? 'pass' : 'fail'}`}>
                                                            {selectedEntity.data.eligibilityChecklist?.c2_marketUnionAwareness?.pass ? 'PASS' : 'FAIL'}
                                                        </span>
                                                        <span className="checklist-card-title">C2 Market Union Awareness</span>
                                                    </div>
                                                    {selectedEntity.data.eligibilityChecklist?.c2_marketUnionAwareness?.notes && (
                                                        <p className="checklist-agent-note">“{selectedEntity.data.eligibilityChecklist.c2_marketUnionAwareness.notes}”</p>
                                                    )}
                                                </div>
                                            </div>

                                            {/* Agent Notes */}
                                            {selectedEntity.data.adminNotes?.filter(n => n.content?.startsWith('Agent Field Visit Note')).length > 0 && (
                                                <div className="checklist-group">
                                                    <h4 className="checklist-group-title">Agent Notes</h4>
                                                    <div className="agent-notes-box">
                                                        {selectedEntity.data.adminNotes
                                                            .filter(n => n.content?.startsWith('Agent Field Visit Note'))
                                                            .map((note, i) => (
                                                                <p key={i} className="agent-note-item">
                                                                    <span className="agent-note-bullet">📝</span>
                                                                    {note.content.replace('Agent Field Visit Note: ', '')}
                                                                    <span className="agent-note-date">{new Date(note.createdAt).toLocaleDateString()}</span>
                                                                </p>
                                                            ))}
                                                    </div>
                                                </div>
                                            )}

                                            {/* Store Photo from Field Visit */}
                                            {selectedEntity.data.eligibilityChecklist?.storePhotoUrl && (
                                                <div className="checklist-group">
                                                    <h4 className="checklist-group-title">Store Photo (Agent Upload)</h4>
                                                    <a href={selectedEntity.data.eligibilityChecklist.storePhotoUrl} target="_blank" rel="noreferrer" className="store-photo-link">
                                                        <img src={selectedEntity.data.eligibilityChecklist.storePhotoUrl} alt="Store" className="store-photo-preview" />
                                                    </a>
                                                </div>
                                            )}
                                        </div>
                                    </details>

                                    {/* ===== TAB 3: DOCUMENTS ===== */}
                                    <details className="review-section">
                                        <summary className="review-section-header">
                                            <span className="review-section-icon">📂</span>
                                            <span>Uploaded Documents</span>
                                            <span className="review-section-toggle">▼</span>
                                        </summary>
                                        <div className="review-section-body">
                                            <div className="docs-grid">
                                                <div className="doc-card">
                                                    <div className="doc-card-label">ID Card (D1)</div>
                                                    {selectedEntity.data.kyc?.idCardUrl ? (
                                                        <a href={selectedEntity.data.kyc.idCardUrl} target="_blank" rel="noreferrer" className="doc-thumb-link">
                                                            <img src={selectedEntity.data.kyc.idCardUrl} alt="ID Card" className="doc-thumb" />
                                                            <span className="doc-view-label">Click to view</span>
                                                        </a>
                                                    ) : (
                                                        <div className="doc-missing">Not uploaded</div>
                                                    )}
                                                </div>
                                                <div className="doc-card">
                                                    <div className="doc-card-label">Market Union Card (C2)</div>
                                                    {selectedEntity.data.kyc?.marketMembershipCardUrl ? (
                                                        <a href={selectedEntity.data.kyc.marketMembershipCardUrl} target="_blank" rel="noreferrer" className="doc-thumb-link">
                                                            <img src={selectedEntity.data.kyc.marketMembershipCardUrl} alt="Market Union Card" className="doc-thumb" />
                                                            <span className="doc-view-label">Click to view</span>
                                                        </a>
                                                    ) : (
                                                        <div className="doc-missing">Not uploaded</div>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    </details>
                                </div>
                            ) : (
                                /* ===== VENDOR REVIEW ===== */
                                <div className="review-tab-content">
                                    <details className="review-section" open>
                                        <summary className="review-section-header">
                                            <span className="review-section-icon">👤</span>
                                            <span>Owner & Business Information</span>
                                            <span className="review-section-toggle">▼</span>
                                        </summary>
                                        <div className="review-section-body">
                                            <div className="profile-two-col">
                                                <div className="profile-col">
                                                    <h4 className="profile-col-title">Owner Details</h4>
                                                    <div className="profile-field"><span className="profile-field-label">Owner Name</span><span className="profile-field-value">{selectedEntity.data.ownerName}</span></div>
                                                    <div className="profile-field"><span className="profile-field-label">Owner Phone</span><span className="profile-field-value">{selectedEntity.data.ownerPhone}</span></div>
                                                    <div className="profile-field"><span className="profile-field-label">Email</span><span className="profile-field-value">{selectedEntity.data.email}</span></div>
                                                </div>
                                                <div className="profile-col">
                                                    <h4 className="profile-col-title">Business Details</h4>
                                                    <div className="profile-field"><span className="profile-field-label">Business Name</span><span className="profile-field-value">{selectedEntity.data.businessName}</span></div>
                                                    <div className="profile-field"><span className="profile-field-label">CAC Number</span><span className="profile-field-value">{selectedEntity.data.cacNumber || 'N/A'}</span></div>
                                                    <div className="profile-field full-width"><span className="profile-field-label">Address</span><span className="profile-field-value">{selectedEntity.data.address}</span></div>
                                                    <div className="profile-field full-width"><span className="profile-field-label">Description</span><span className="profile-field-value">{selectedEntity.data.description}</span></div>
                                                </div>
                                            </div>
                                        </div>
                                    </details>
                                    <details className="review-section">
                                        <summary className="review-section-header">
                                            <span className="review-section-icon">🏦</span>
                                            <span>Bank & Payout Details</span>
                                            <span className="review-section-toggle">▼</span>
                                        </summary>
                                        <div className="review-section-body">
                                            <div className="bank-details-display">
                                                <div className="bank-detail-row"><span>Bank</span><strong>{selectedEntity.data.bankDetails?.bankName || 'N/A'}</strong></div>
                                                <div className="bank-detail-row"><span>Account Number</span><strong>{selectedEntity.data.bankDetails?.accountNumber || selectedEntity.data.accountNumber || 'N/A'}</strong></div>
                                                <div className="bank-detail-row"><span>Account Name</span><strong>{selectedEntity.data.bankDetails?.accountName || 'N/A'}</strong></div>
                                            </div>
                                        </div>
                                    </details>
                                    <details className="review-section">
                                        <summary className="review-section-header">
                                            <span className="review-section-icon">📂</span>
                                            <span>Documents</span>
                                            <span className="review-section-toggle">▼</span>
                                        </summary>
                                        <div className="review-section-body">
                                            <div className="docs-grid">
                                                <div className="doc-card">
                                                    <div className="doc-card-label">CAC Document</div>
                                                    {selectedEntity.data.cacDocumentUrl ? (
                                                        <a href={selectedEntity.data.cacDocumentUrl} target="_blank" rel="noreferrer" className="doc-thumb-link">
                                                            <img src={selectedEntity.data.cacDocumentUrl} alt="CAC" className="doc-thumb" />
                                                            <span className="doc-view-label">Click to view</span>
                                                        </a>
                                                    ) : (
                                                        <div className="doc-missing">Not uploaded</div>
                                                    )}
                                                </div>
                                                <div className="doc-card">
                                                    <div className="doc-card-label">Profile Picture</div>
                                                    {selectedEntity.data.profilePicUrl ? (
                                                        <a href={selectedEntity.data.profilePicUrl} target="_blank" rel="noreferrer" className="doc-thumb-link">
                                                            <img src={selectedEntity.data.profilePicUrl} alt="Profile" className="doc-thumb" />
                                                            <span className="doc-view-label">Click to view</span>
                                                        </a>
                                                    ) : (
                                                        <div className="doc-missing">Not uploaded</div>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    </details>
                                </div>
                            )}
                        </div>

                        {/* ===== DECISION PANEL (FOOTER) ===== */}
                        <div className="admin-modal-decision">
                            <div className="decision-credit-row">
                                {selectedEntity.type === 'retailer' && (
                                    <div className="decision-credit-field">
                                        <label className="decision-label">
                                            Credit Limit <span className="decision-ceiling-hint">(max: ₦{(selectedEntity.data.eligibilityChecklist?.calculatedCeilingAmount || 100000).toLocaleString()})</span>
                                        </label>
                                        <div className="credit-input-wrapper">
                                            <span className="credit-currency">₦</span>
                                            <input
                                                type="number"
                                                placeholder="Enter amount"
                                                value={customCreditLimit}
                                                onChange={e => setCustomCreditLimit(e.target.value)}
                                                className="decision-credit-input"
                                            />
                                        </div>
                                    </div>
                                )}
                                <div className="decision-note-field">
                                    <label className="decision-label">Admin Note</label>
                                    <textarea
                                        placeholder="Decision note, rejection reason, or internal remark..."
                                        value={rejectionReason}
                                        onChange={e => setRejectionReason(e.target.value)}
                                        className="decision-note-input"
                                        rows={2}
                                    />
                                </div>
                            </div>
                            <div className="decision-actions">
                                <button className="decision-cancel" onClick={() => setSelectedEntity(null)}>Cancel</button>
                                <button
                                    className="decision-reject"
                                    onClick={() => selectedEntity.type === 'vendor' ? handleRejectVendor(selectedEntity.data._id) : handleRejectRetailer(selectedEntity.data._id)}
                                    disabled={isActionLoading}
                                >
                                    {isActionLoading ? 'Processing...' : 'Reject'}
                                </button>
                                <button
                                    className="decision-approve"
                                    onClick={() => selectedEntity.type === 'vendor' ? handleVerifyVendor(selectedEntity.data._id) : handleVerifyRetailer(selectedEntity.data._id)}
                                    disabled={isActionLoading || (selectedEntity.type === 'retailer' && !customCreditLimit)}
                                >
                                    {isActionLoading ? 'Processing...' : selectedEntity.type === 'vendor' ? 'Verify Vendor' : 'Approve & Set Limit'}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            <ConfirmModal 
                isOpen={confirmModal.isOpen}
                onClose={() => setConfirmModal({ ...confirmModal, isOpen: false })}
                onConfirm={confirmModal.onConfirm}
                title={confirmModal.title}
                message={confirmModal.message}
                isDestructive={confirmModal.isDestructive}
                confirmText={confirmModal.confirmText}
            />
        </div>
    );
};

export default AdminDashboard;
