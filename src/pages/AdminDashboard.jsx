import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import { Check, X, DollarSign, Users, Briefcase, Activity, AlertCircle, ChevronRight, Search, ShieldCheck, ShieldX, UserCheck, Clock, Wallet, AlertTriangle } from 'lucide-react';
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

    const handleVerifyRetailer = async (id) => {
        setIsActionLoading(true);
        try {
            await api.put(`/admin/retailer/${id}/verify`);
            await loadData();
            addToast('Retailer Verified & Credit Assigned', 'success');
            setSelectedEntity(null);
        } catch (e) {
            addToast('Verification Failed', 'error');
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
                 <header className="admin-header">
                    <div>
                         <h1 className="admin-title">Mission Control</h1>
                         <p className="admin-subtitle">Platform Overview</p>
                    </div>
                     <div className="header-status">
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

                <div className="admin-panel glass-panel">
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
                                                    <div key={res._id} className="search-result-card glass-panel">
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
                            <div>
                                <h2 className="modal-title">Review {selectedEntity.type === 'vendor' ? 'Vendor' : 'Retailer'}</h2>
                                <p className="modal-subtitle">ID: {selectedEntity.data._id}</p>
                            </div>
                            <button className="close-btn" onClick={() => setSelectedEntity(null)}><X size={20} /></button>
                        </div>
                        
                        <div className="admin-modal-body">
                            <div className="review-comprehensive-grid">
                                {/* Left Column: Info Sections */}
                                <div className="info-column">
                                    <section className="modal-section">
                                        <h3 className="section-title">👤 Personal / Owner Information</h3>
                                        <div className="info-card-grid">
                                            {selectedEntity.type === 'vendor' ? (
                                                <>
                                                    <div className="info-item"><label>Owner Name</label><p>{selectedEntity.data.ownerName}</p></div>
                                                    <div className="info-item"><label>Owner Phone</label><p>{selectedEntity.data.ownerPhone}</p></div>
                                                    <div className="info-item"><label>Business Email</label><p>{selectedEntity.data.email}</p></div>
                                                    <div className="info-item"><label>Business Address</label><p>{selectedEntity.data.address}</p></div>
                                                </>
                                            ) : (
                                                <>
                                                    <div className="info-item"><label>Full Name</label><p>{selectedEntity.data.name}</p></div>
                                                    <div className="info-item"><label>Email</label><p>{selectedEntity.data.email}</p></div>
                                                    <div className="info-item"><label>Phone</label><p>{selectedEntity.data.phone}</p></div>
                                                    <div className="info-item"><label>NIN</label><p>{selectedEntity.data.kyc?.nin}</p></div>
                                                    <div className="info-item"><label>BVN</label><p>{selectedEntity.data.kyc?.bvn}</p></div>
                                                    <div className="info-item full-width"><label>Home Address</label><p>{selectedEntity.data.address}</p></div>
                                                </>
                                            )}
                                        </div>
                                    </section>

                                    <section className="modal-section mt-6">
                                        <h3 className="section-title">🏢 Business Operations</h3>
                                        <div className="info-card-grid">
                                            {selectedEntity.type === 'vendor' ? (
                                                <>
                                                    <div className="info-item"><label>Business Name</label><p>{selectedEntity.data.businessName}</p></div>
                                                    <div className="info-item"><label>CAC Number</label><p>{selectedEntity.data.cacNumber}</p></div>
                                                    <div className="info-item full-width"><label>Description</label><p>{selectedEntity.data.description}</p></div>
                                                </>
                                            ) : (
                                                <>
                                                    <div className="info-item"><label>Business Name</label><p>{selectedEntity.data.businessInfo?.businessName}</p></div>
                                                    <div className="info-item"><label>Industry</label><p>{selectedEntity.data.businessInfo?.businessType}</p></div>
                                                    <div className="info-item"><label>Years in Biz</label><p>{selectedEntity.data.businessInfo?.yearsInBusiness} Yrs</p></div>
                                                    <div className="info-item"><label>Initial Capital</label><p>{selectedEntity.data.businessInfo?.startingCapital}</p></div>
                                                    <div className="info-item full-width"><label>Business Description</label><p>{selectedEntity.data.businessInfo?.description}</p></div>
                                                </>
                                            )}
                                        </div>
                                    </section>

                                    <section className="modal-section mt-6">
                                        <h3 className="section-title">📋 Supplemental Records</h3>
                                        <div className="info-card-grid">
                                            {selectedEntity.type === 'vendor' ? (
                                                <>
                                                    <div className="info-item"><label>Bank Name</label><p>{selectedEntity.data.bankDetails?.bankName}</p></div>
                                                    <div className="info-item"><label>Account Number</label><p>{selectedEntity.data.bankDetails?.accountNumber}</p></div>
                                                    <div className="info-item full-width"><label>Account Name</label><p>{selectedEntity.data.bankDetails?.accountName}</p></div>
                                                </>
                                            ) : (
                                                <>
                                                    <div className="info-item"><label>Next of Kin</label><p>{selectedEntity.data.nextOfKin?.name}</p></div>
                                                    <div className="info-item"><label>NOK Relationship</label><p>{selectedEntity.data.nextOfKin?.relationship}</p></div>
                                                    <div className="info-item"><label>NOK Phone</label><p>{selectedEntity.data.nextOfKin?.phone}</p></div>
                                                    <div className="info-item"><label>Assessment Score</label><p className="highlight-score">{selectedEntity.data.testScore}/75</p></div>
                                                </>
                                            )}
                                        </div>
                                    </section>
                                </div>
                                
                                {/* Right Column: Documents */}
                                <div className="docs-column">
                                    <h3 className="section-title">📂 Document Verification</h3>
                                    <div className="docs-scroll-grid">
                                        {selectedEntity.type === 'vendor' ? (
                                            <>
                                                <div className="doc-review-card">
                                                    <label>CAC Documents</label>
                                                    <a href={selectedEntity.data.cacDocumentUrl} target="_blank" rel="noreferrer" className="doc-viewer-link">
                                                        <img src={selectedEntity.data.cacDocumentUrl} alt="CAC" className="doc-preview" />
                                                        <div className="viewer-overlay">View Full Document</div>
                                                    </a>
                                                </div>
                                                <div className="doc-review-card">
                                                    <label>Owner Profile Pic</label>
                                                    <a href={selectedEntity.data.profilePicUrl} target="_blank" rel="noreferrer" className="doc-viewer-link">
                                                        <img src={selectedEntity.data.profilePicUrl} alt="Profile" className="doc-preview" />
                                                    </a>
                                                </div>
                                            </>
                                        ) : (
                                            <>
                                                <div className="doc-review-card">
                                                    <label>ID Card (Front/Back)</label>
                                                    <a href={selectedEntity.data.kyc?.idCardUrl} target="_blank" rel="noreferrer" className="doc-viewer-link">
                                                        <img src={selectedEntity.data.kyc?.idCardUrl} alt="ID" className="doc-preview" />
                                                    </a>
                                                </div>
                                                <div className="doc-review-card">
                                                    <label>Proof of Location</label>
                                                    <a href={selectedEntity.data.kyc?.locationProofUrl} target="_blank" rel="noreferrer" className="doc-viewer-link">
                                                        <img src={selectedEntity.data.kyc?.locationProofUrl} alt="Location" className="doc-preview" />
                                                    </a>
                                                </div>
                                                <div className="doc-review-card">
                                                    <label>Profile Picture</label>
                                                    <a href={selectedEntity.data.kyc?.profilePicUrl} target="_blank" rel="noreferrer" className="doc-viewer-link">
                                                        <img src={selectedEntity.data.kyc?.profilePicUrl} alt="Profile" className="doc-preview" />
                                                    </a>
                                                </div>
                                                
                                                {/* BANK STATEMENT PDF */}
                                                <div className="doc-review-card">
                                                    <label>Bank Statement (PDF)</label>
                                                    {selectedEntity.data.kyc?.bankStatementUrl ? (
                                                        <a href={selectedEntity.data.kyc.bankStatementUrl} target="_blank" rel="noreferrer" className="pdf-doc-viewer">
                                                            <div className="pdf-icon-box">
                                                                <FileText size={48} className="pdf-icon" />
                                                                <span>Click to view PDF</span>
                                                            </div>
                                                        </a>
                                                    ) : (
                                                        <div className="no-doc-fallback">Not Uploaded</div>
                                                    )}
                                                </div>
                                            </>
                                        )}
                                    </div>

                                    <div className="rejection-card mt-6">
                                        <label className="rejection-label">Admin Decision Note</label>
                                        <textarea 
                                            placeholder="Provide reason if rejecting, or notes for internal use..."
                                            value={rejectionReason}
                                            onChange={e => setRejectionReason(e.target.value)}
                                            className="admin-decision-input"
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>
                        
                        <div className="admin-modal-footer">
                            <button className="cancel-pill" onClick={() => setSelectedEntity(null)}>Cancel</button>
                            <div className="action-pills">
                                <button 
                                    className="reject-pill" 
                                    onClick={() => selectedEntity.type === 'vendor' ? handleRejectVendor(selectedEntity.data._id) : handleRejectRetailer(selectedEntity.data._id)}
                                    disabled={isActionLoading}
                                >
                                    Reject Application
                                </button>
                                <button 
                                    className="approve-pill" 
                                    onClick={() => selectedEntity.type === 'vendor' ? handleVerifyVendor(selectedEntity.data._id) : handleVerifyRetailer(selectedEntity.data._id)}
                                    disabled={isActionLoading}
                                >
                                    {isActionLoading ? 'Processing...' : 'Approve & Verify'}
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
