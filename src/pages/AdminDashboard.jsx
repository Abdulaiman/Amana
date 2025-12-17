import React, { useEffect, useState } from 'react';
import api from '../services/api';
import { Check, X, DollarSign, Users, Briefcase, Activity, AlertCircle, ChevronRight, Search, ShieldCheck, ShieldX, UserCheck, Clock, Wallet } from 'lucide-react';
import './AdminDashboard.css';
import './RetailerDashboard.css'; // Shared styles
import { useToast } from '../context/ToastContext';
import ConfirmModal from '../components/ConfirmModal';

const AdminDashboard = () => {
    const [stats, setStats] = useState({ totalUsers: 0, totalVendors: 0, totalOrders: 0, pendingPayouts: 0, pendingVendorVerifications: 0 });
    const [withdrawals, setWithdrawals] = useState([]);
    const [vendors, setVendors] = useState([]);
    const [retailers, setRetailers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('payouts');
    const [searchTerm, setSearchTerm] = useState('');

    const [confirmModal, setConfirmModal] = useState({ isOpen: false, title: '', message: '', onConfirm: null, isDestructive: false });
    const { addToast } = useToast();

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        try {
            const [statsRes, withdrawalsRes, vendorsRes, retailersRes] = await Promise.all([
                api.get('/admin/analytics'),
                api.get('/admin/withdrawals'),
                api.get('/admin/vendors'),
                api.get('/admin/retailers')
            ]);
            setStats(statsRes.data);
            setWithdrawals(withdrawalsRes.data);
            setVendors(vendorsRes.data);
            setRetailers(retailersRes.data);
        } catch (e) {
            console.error(e);
            addToast('Failed to load dashboard data', 'error');
        } finally {
            setLoading(false);
        }
    };

    const executeConfirmPayout = async (id) => {
        try {
            await api.put(`/admin/withdrawals/${id}/confirm`);
            loadData();
            addToast('Payout Confirmed & Wallet Deducted', 'success');
        } catch (e) {
            console.error(e);
            addToast('Payout Confirmation Failed', 'error');
        }
    };

    const handleConfirmPayoutClick = (id) => {
        setConfirmModal({
            isOpen: true,
            title: 'Confirm Payout Transfer',
            message: 'Are you sure this payout has been manually transferred? This will deduct the amount from the vendor\'s wallet.',
            onConfirm: () => executeConfirmPayout(id),
            isDestructive: false,
            confirmText: 'Confirm Transfer'
        });
    };

    const executeVerifyVendor = async (id) => {
        try {
            await api.put(`/admin/vendor/${id}/verify`);
            loadData();
            addToast('Vendor Verified Successfully', 'success');
        } catch (e) {
            console.error(e);
            addToast('Verification Failed', 'error');
        }
    };

    const handleVerifyVendorClick = (id) => {
        setConfirmModal({
            isOpen: true,
            title: 'Verify Vendor',
            message: 'Are you sure you want to verify this vendor? They will be able to start selling immediately.',
            onConfirm: () => executeVerifyVendor(id),
            isDestructive: false,
            confirmText: 'Verify Vendor'
        });
    };

    const executeRejectVendor = async (id) => {
        try {
            await api.put(`/admin/vendor/${id}/reject`);
            loadData();
            addToast('Vendor Rejected', 'info');
        } catch (e) {
            console.error(e);
            addToast('Rejection Failed', 'error');
        }
    };

    const handleRejectVendorClick = (id) => {
        setConfirmModal({
            isOpen: true,
            title: 'Reject Vendor',
            message: 'Are you sure you want to reject this vendor application? This action cannot be undone.',
            onConfirm: () => executeRejectVendor(id),
            isDestructive: true,
            confirmText: 'Reject Application'
        });
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

                {/* Stats Overview */}
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
                </div>

                {/* Main Content Area */}
                <div className="admin-panel glass-panel">
                    {/* Tabs */}
                    <div className="admin-tabs-header">
                        <div className="admin-tabs-list">
                            <button 
                                className={`tab-btn ${activeTab === 'payouts' ? 'active' : ''}`} 
                                onClick={() => setActiveTab('payouts')}
                            >
                                <Wallet size={16} /> Payouts {stats.pendingPayouts > 0 && <span className="badge">{stats.pendingPayouts}</span>}
                            </button>
                            <button 
                                className={`tab-btn ${activeTab === 'vendors' ? 'active' : ''}`} 
                                onClick={() => setActiveTab('vendors')}
                            >
                                <Briefcase size={16} /> Vendors {stats.pendingVendorVerifications > 0 && <span className="badge">{stats.pendingVendorVerifications}</span>}
                            </button>
                            <button 
                                className={`tab-btn ${activeTab === 'retailers' ? 'active' : ''}`} 
                                onClick={() => setActiveTab('retailers')}
                            >
                                <Users size={16} /> Retailers
                            </button>
                        </div>
                        <div className="admin-search-wrapper">
                            <Search className="admin-search-icon" size={16} />
                            <input 
                                type="text" 
                                placeholder="Filter records..." 
                                className="admin-search-input"
                                value={searchTerm}
                                onChange={e => setSearchTerm(e.target.value)}
                            />
                        </div>
                    </div>

                    <div className="admin-content-area">
                        {/* PAYOUTS TAB */}
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
                                                    <td className="td-cell pl">
                                                        <div>
                                                            <p className="vendor-name-text">{req.vendor?.businessName || 'Unknown'}</p>
                                                            <p className="vendor-id-text">ID: {req.vendor?._id?.substring(0,8)}</p>
                                                        </div>
                                                    </td>
                                                    <td className="td-cell">
                                                        <span className="amount-text">₦{req.amount.toLocaleString()}</span>
                                                    </td>
                                                    <td className="td-cell">
                                                        <div className="bank-details-box">
                                                            <p className="bank-name">{req.bankDetailsSnapshot?.bankName}</p>
                                                            <p className="account-number">{req.bankDetailsSnapshot?.accountNumber}</p>
                                                            <p className="account-name">{req.bankDetailsSnapshot?.accountName}</p>
                                                        </div>
                                                    </td>
                                                    <td className="td-cell">
                                                        <span className={`status-pill ${req.status}`}>
                                                            {req.status === 'approved' ? <Check size={12} /> : <AlertCircle size={12} />}
                                                            {req.status.toUpperCase()}
                                                        </span>
                                                    </td>
                                                    <td className="td-cell pr text-right">
                                                        {req.status === 'pending' && (
                                                            <button 
                                                                onClick={() => handleConfirmPayoutClick(req._id)}
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

                        {/* VENDORS TAB */}
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
                                                    <td className="td-cell pl">
                                                        <div>
                                                            <p className="vendor-name-text">{vendor.businessName}</p>
                                                            <p className="vendor-id-text">{vendor.address}</p>
                                                        </div>
                                                    </td>
                                                    <td className="td-cell">
                                                        <p className="vendor-id-text">{vendor.email}</p>
                                                        <p className="vendor-id-text">{vendor.phones?.[0]}</p>
                                                    </td>
                                                    <td className="td-cell">
                                                        <span className="amount-text">₦{(vendor.walletBalance || 0).toLocaleString()}</span>
                                                    </td>
                                                    <td className="td-cell">
                                                        <span className={`status-pill ${vendor.verificationStatus}`}>
                                                            {vendor.verificationStatus === 'verified' ? <ShieldCheck size={12} /> : 
                                                             vendor.verificationStatus === 'rejected' ? <ShieldX size={12} /> : 
                                                             <Clock size={12} />}
                                                            {vendor.verificationStatus?.toUpperCase() || 'PENDING'}
                                                        </span>
                                                    </td>
                                                    <td className="td-cell pr text-right">
                                                        {vendor.verificationStatus === 'pending' && vendor.isProfileComplete && (
                                                            <div className="action-btns">
                                                                <button onClick={() => handleVerifyVendorClick(vendor._id)} className="confirm-transfer-btn">
                                                                    <Check size={14} /> Verify
                                                                </button>
                                                                <button onClick={() => handleRejectVendorClick(vendor._id)} className="reject-btn">
                                                                    <X size={14} /> Reject
                                                                </button>
                                                            </div>
                                                        )}
                                                        {!vendor.isProfileComplete && (
                                                            <span className="vendor-id-text">Profile Incomplete</span>
                                                        )}
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                )}
                            </div>
                        )}

                        {/* RETAILERS TAB */}
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
                                                <th className="th-cell">Amana Score</th>
                                                <th className="th-cell">Credit</th>
                                                <th className="th-cell pr">Status</th>
                                            </tr>
                                        </thead>
                                        <tbody className="payouts-body">
                                            {filteredRetailers.map(user => (
                                                <tr key={user._id} className="payouts-row group">
                                                    <td className="td-cell pl">
                                                        <div>
                                                            <p className="vendor-name-text">{user.name}</p>
                                                            <p className="vendor-id-text">{user.businessName || 'N/A'}</p>
                                                        </div>
                                                    </td>
                                                    <td className="td-cell">
                                                        <p className="vendor-id-text">{user.email}</p>
                                                        <p className="vendor-id-text">{user.phone}</p>
                                                    </td>
                                                    <td className="td-cell">
                                                        <span className="amount-text">{user.amanaScore || 0}</span>
                                                        <p className="vendor-id-text">{user.tier || 'Bronze'}</p>
                                                    </td>
                                                    <td className="td-cell">
                                                        <p className="amount-text">₦{(user.creditLimit || 0).toLocaleString()}</p>
                                                        <p className="vendor-id-text">Used: ₦{(user.usedCredit || 0).toLocaleString()}</p>
                                                    </td>
                                                    <td className="td-cell pr">
                                                        <span className={`status-pill ${user.isProfileComplete ? 'approved' : 'pending'}`}>
                                                            {user.isProfileComplete ? <UserCheck size={12} /> : <Clock size={12} />}
                                                            {user.isProfileComplete ? 'VERIFIED' : 'INCOMPLETE'}
                                                        </span>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                )}
                            </div>
                        )}
                    </div>
                </div>
            </div>
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
