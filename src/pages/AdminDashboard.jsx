import React, { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../services/api';
import { 
    Check, X, DollarSign, Users, Briefcase, Activity, AlertCircle, 
    ChevronRight, Search, ShieldCheck, ShieldX, UserCheck, Clock, 
    Wallet, AlertTriangle, BarChart3, ArrowRight, Eye, CheckCircle2,
    Building, UserPlus
} from 'lucide-react';
import './AdminDashboard.css';
import './admin/AdminSectionStyles.css';
import { useToast } from '../context/ToastContext';
import AdminKYCReviewModal from '../components/admin/AdminKYCReviewModal';
import ConfirmModal from '../components/ConfirmModal';

const AdminDashboard = () => {
    const [stats, setStats] = useState({ 
        totalUsers: 0, 
        totalVendors: 0, 
        totalOrders: 0, 
        totalAAP: 0, 
        pendingPayouts: 0, 
        pendingVendorVerifications: 0, 
        pendingRetailerVerifications: 0,
        pendingAAPCount: 0
    });
    const [urgentRetailers, setUrgentRetailers] = useState([]);
    const [urgentVendors, setUrgentVendors] = useState([]);
    const [urgentPayouts, setUrgentPayouts] = useState([]);
    const [agentsCount, setAgentsCount] = useState(0);

    const [loading, setLoading] = useState(true);
    const [selectedEntity, setSelectedEntity] = useState(null); // { type, data }
    const [isActionLoading, setIsActionLoading] = useState(false);
    const [confirmModal, setConfirmModal] = useState({ isOpen: false, title: '', message: '', onConfirm: null });

    const navigate = useNavigate();
    const { addToast } = useToast();

    useEffect(() => {
        loadDashboardData();
    }, []);

    const loadDashboardData = async () => {
        setLoading(true);
        try {
            const [statsRes, retailersRes, vendorsRes, withdrawalsRes, agentsRes] = await Promise.all([
                api.get('/admin/analytics'),
                api.get('/admin/retailers?status=pending&limit=5'),
                api.get('/admin/vendors?status=pending&limit=5'),
                api.get('/admin/withdrawals?status=pending&limit=5'),
                api.get('/admin/agents')
            ]);

            setStats(statsRes.data || {});
            setUrgentRetailers(retailersRes.data?.data || (Array.isArray(retailersRes.data) ? retailersRes.data.filter(r => r.verificationStatus === 'pending') : []));
            setUrgentVendors(vendorsRes.data?.data || (Array.isArray(vendorsRes.data) ? vendorsRes.data.filter(v => v.verificationStatus === 'pending') : []));
            setUrgentPayouts(withdrawalsRes.data?.data || (Array.isArray(withdrawalsRes.data) ? withdrawalsRes.data.filter(w => w.status === 'pending') : []));
            setAgentsCount(Array.isArray(agentsRes.data) ? agentsRes.data.length : (agentsRes.data?.total || 0));
        } catch (e) {
            console.error('Failed to load dashboard overview', e);
            addToast('Failed to load dashboard data', 'error');
        } finally {
            setLoading(false);
        }
    };

    const handleOpenReview = async (type, id) => {
        try {
            const res = await api.get(`/admin/${type}/${id}`);
            setSelectedEntity({ type, data: res.data });
        } catch (e) {
            addToast('Failed to load review details', 'error');
        }
    };

    const handleApproveRetailer = async (id, creditLimit, adminNote) => {
        setIsActionLoading(true);
        try {
            await api.put(`/admin/retailer/${id}/verify`, {
                approvedCreditLimit: creditLimit ? Number(creditLimit) : undefined,
                d1_validId: true,
                d2_noAdverseHistory: true,
                c1_peerReferral: { pass: true },
                c2_marketUnionAwareness: { pass: true },
                adminNote
            });
            addToast('Retailer Approved & Credit Limit Allocated!', 'success');
            setSelectedEntity(null);
            loadDashboardData();
        } catch (e) {
            const data = e.response?.data;
            if (data?.needsCorrection) {
                setConfirmModal({
                    isOpen: true,
                    title: 'Adjust Credit Limit?',
                    message: data.message,
                    onConfirm: () => {
                        setConfirmModal({ isOpen: false, title: '', message: '', onConfirm: null });
                        handleApproveRetailer(id, data.suggestedLimit, adminNote);
                    },
                    confirmText: `Use ₦${data.suggestedLimit.toLocaleString()}`
                });
            } else {
                addToast(data?.message || 'Verification failed', 'error');
            }
        } finally {
            setIsActionLoading(false);
        }
    };

    const handleRejectRetailer = async (id, rejectionReason) => {
        if (!rejectionReason) return addToast('Please provide a reason for rejection', 'error');
        setIsActionLoading(true);
        try {
            await api.put(`/admin/retailer/${id}/reject`, { reason: rejectionReason });
            addToast('Retailer KYC Rejected', 'info');
            setSelectedEntity(null);
            loadDashboardData();
        } catch (e) {
            addToast('Rejection failed', 'error');
        } finally {
            setIsActionLoading(false);
        }
    };

    const handleVerifyVendor = async (id) => {
        setIsActionLoading(true);
        try {
            await api.put(`/admin/vendor/${id}/verify`);
            addToast('Vendor Verified Successfully', 'success');
            setSelectedEntity(null);
            loadDashboardData();
        } catch (e) {
            addToast('Verification failed', 'error');
        } finally {
            setIsActionLoading(false);
        }
    };

    const handleRejectVendor = async (id, customLimit, reason) => {
        if (!reason) return addToast('Please provide a rejection reason', 'error');
        setIsActionLoading(true);
        try {
            await api.put(`/admin/vendor/${id}/reject`, { reason });
            addToast('Vendor Application Rejected', 'info');
            setSelectedEntity(null);
            loadDashboardData();
        } catch (e) {
            addToast('Rejection failed', 'error');
        } finally {
            setIsActionLoading(false);
        }
    };

    const handleConfirmPayout = (payout) => {
        setConfirmModal({
            isOpen: true,
            title: 'Confirm Vendor Transfer Disbursed?',
            message: `Please confirm that you have manually executed the bank transfer of ₦${payout.amount.toLocaleString()} to ${payout.vendor?.businessName || 'the vendor'}.\n\nAccount: ${payout.bankDetailsSnapshot?.accountNumber} (${payout.bankDetailsSnapshot?.bankName})`,
            confirmText: `Confirm ₦${payout.amount.toLocaleString()} Sent`,
            onConfirm: async () => {
                setConfirmModal({ isOpen: false, title: '', message: '', onConfirm: null });
                try {
                    await api.put(`/admin/withdrawals/${payout._id}/confirm`);
                    addToast('Payout confirmed & vendor ledger updated!', 'success');
                    loadDashboardData();
                } catch (e) {
                    addToast(e.response?.data?.message || 'Failed to confirm payout', 'error');
                }
            }
        });
    };

    if (loading) {
        return (
            <div className="loading-container" style={{ padding: '80px', display: 'flex', justifyContent: 'center' }}>
                <div className="loading-spinner"></div>
            </div>
        );
    }

    return (
        <div className="admin-page-container animate-fade-in">
            {/* ── Executive Hero ── */}
            <header className="page-hero" style={{ marginBottom: 0 }}>
                <div className="page-hero-icon">
                    <BarChart3 size={24} />
                </div>
                <div className="page-hero-body">
                    <h1 className="page-hero-title">Executive Command Center</h1>
                    <p className="page-hero-subtitle">Operational status, pending compliance queues, and verification triage</p>
                </div>
                <div className="page-hero-actions">
                    <div className="operational-badge">
                        <Activity size={14} /> Live Engine Active
                    </div>
                </div>
            </header>

            {/* ── Urgent Alert Banners ── */}
            {stats.pendingAAPCount > 0 && (
                <div className="urgent-notification-banner">
                    <div className="urgent-content">
                        <div className="urgent-icon-box">
                            <AlertTriangle size={24} />
                        </div>
                        <div className="urgent-text">
                            <h3>{stats.pendingAAPCount} Agent Purchase{stats.pendingAAPCount > 1 ? 's' : ''} Awaiting Funding</h3>
                            <p>Field agents have submitted new wholesale purchases that require administrative disbursement approval.</p>
                        </div>
                    </div>
                    <button className="urgent-action-btn" onClick={() => navigate('/admin/aap')}>
                        Review & Disburse <ChevronRight size={18} />
                    </button>
                </div>
            )}

            {/* ── Core Indicator Cards (Standalone Section Gateways) ── */}
            <div className="indicator-cards-grid">
                {/* Indicator 1: Retailers KYC */}
                <Link to="/admin/retailers" className="indicator-card retailers">
                    <div>
                        <div className="indicator-card-top">
                            <div className="indicator-badge-box">
                                <Users size={24} />
                            </div>
                            {stats.pendingRetailerVerifications > 0 && (
                                <span className="indicator-pending-pill purple">
                                    <Clock size={11} /> {stats.pendingRetailerVerifications} Pending
                                </span>
                            )}
                        </div>
                        <h3 className="indicator-stat-value">{stats.totalUsers}</h3>
                        <p className="indicator-stat-label">Retailer Community</p>
                        {stats.pendingAdminApprovals > 0 && (
                            <p style={{ fontSize: '11px', color: '#ea580c', fontWeight: 600, marginTop: '4px' }}>
                                • {stats.pendingAdminApprovals} waiting for your approval
                            </p>
                        )}
                        {stats.pendingAgentVisits > 0 && (
                            <p style={{ fontSize: '11px', color: '#2563eb', marginTop: '1px' }}>
                                • {stats.pendingAgentVisits} awaiting agent shop visit
                            </p>
                        )}
                    </div>
                    <div className="indicator-card-footer">
                        <span>Open Retailers Section</span>
                        <ArrowRight size={14} />
                    </div>
                </Link>

                {/* Indicator 2: Vendors Compliance */}
                <Link to="/admin/vendors" className="indicator-card vendors">
                    <div>
                        <div className="indicator-card-top">
                            <div className="indicator-badge-box">
                                <Briefcase size={24} />
                            </div>
                            {stats.pendingVendorVerifications > 0 && (
                                <span className="indicator-pending-pill teal">
                                    <Clock size={11} /> {stats.pendingVendorVerifications} Pending Verification
                                </span>
                            )}
                        </div>
                        <h3 className="indicator-stat-value">{stats.totalVendors}</h3>
                        <p className="indicator-stat-label">Active Wholesalers</p>
                    </div>
                    <div className="indicator-card-footer">
                        <span>Open Vendors Section</span>
                        <ArrowRight size={14} />
                    </div>
                </Link>

                {/* Indicator 3: Market Agents */}
                <Link to="/admin/agents" className="indicator-card agents">
                    <div>
                        <div className="indicator-card-top">
                            <div className="indicator-badge-box">
                                <ShieldCheck size={24} />
                            </div>
                            <span className="status-pill approved" style={{ fontSize: '11px', padding: '3px 8px' }}>
                                Authorized
                            </span>
                        </div>
                        <h3 className="indicator-stat-value">{agentsCount}</h3>
                        <p className="indicator-stat-label">Market Agents Assigned</p>
                    </div>
                    <div className="indicator-card-footer">
                        <span>Manage Field Agents</span>
                        <ArrowRight size={14} />
                    </div>
                </Link>

                {/* Indicator 4: Payouts & Withdrawals */}
                <Link to="/admin/payouts" className="indicator-card payouts">
                    <div>
                        <div className="indicator-card-top">
                            <div className="indicator-badge-box">
                                <Wallet size={24} />
                            </div>
                            {stats.pendingPayouts > 0 && (
                                <span className="indicator-pending-pill orange">
                                    <Clock size={11} /> {stats.pendingPayouts} Pending Payouts
                                </span>
                            )}
                        </div>
                        <h3 className="indicator-stat-value">{stats.pendingPayouts}</h3>
                        <p className="indicator-stat-label">Pending Payout Requests</p>
                    </div>
                    <div className="indicator-card-footer">
                        <span>Review & Disburse Payouts</span>
                        <ArrowRight size={14} />
                    </div>
                </Link>
            </div>

            {/* ── Secondary Platform Metrics ── */}
            <div className="admin-stats-grid" style={{ marginTop: 'var(--space-2)' }}>
                <div className="stat-card-wrapper gradient-blue">
                    <div className="admin-stat-card">
                        <div className="admin-stat-icon blue">
                            <DollarSign size={24} />
                        </div>
                        <div>
                            <h3 className="admin-stat-value">{stats.totalOrders}</h3>
                            <p className="admin-stat-label">Total Platform Orders</p>
                        </div>
                    </div>
                </div>

                <div className="stat-card-wrapper gradient-teal">
                    <div className="admin-stat-card">
                        <div className="admin-stat-icon accent">
                            <ShieldCheck size={24} />
                        </div>
                        <div>
                            <h3 className="admin-stat-value">{stats.totalAAP}</h3>
                            <p className="admin-stat-label">Assisted Purchases (AAP)</p>
                        </div>
                    </div>
                </div>

                <div className="stat-card-wrapper gradient-purple">
                    <div className="admin-stat-card">
                        <div className="admin-stat-icon purple">
                            <Activity size={24} />
                        </div>
                        <div>
                            <h3 className="admin-stat-value">99.9%</h3>
                            <p className="admin-stat-label">Underwriting Uptime</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* ── Urgent Triage Queues (Needs Immediate Attention) ── */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: 'var(--space-6)', marginTop: 'var(--space-2)' }}>
                {/* Queue 1: Pending Retailer KYC Reviews */}
                <div className="urgent-queue-panel">
                    <div className="urgent-queue-header">
                        <h3 className="urgent-queue-title">
                            <Users size={18} className="text-brand" /> Pending Retailer KYC ({urgentRetailers.length})
                        </h3>
                        <Link to="/admin/retailers?status=pending" className="btn btn-ghost btn-sm text-brand font-semibold">
                            View All <ArrowRight size={12} />
                        </Link>
                    </div>
                    {urgentRetailers.length === 0 ? (
                        <div style={{ padding: '30px', textAlign: 'center', color: 'var(--color-text-secondary)', fontSize: '13px' }}>
                            <CheckCircle2 size={28} className="text-brand" style={{ margin: '0 auto 8px', display: 'block' }} />
                            All clear! No pending retailer verifications.
                        </div>
                    ) : (
                        urgentRetailers.slice(0, 4).map(retailer => (
                            <div key={retailer._id} className="urgent-item-row">
                                <div className="entity-cell">
                                    <div className="entity-avatar">
                                        {retailer.kyc?.profilePicUrl ? <img src={retailer.kyc.profilePicUrl} alt={retailer.name} /> : retailer.name?.charAt(0)}
                                    </div>
                                    <div className="entity-details">
                                        <p className="entity-primary-text">{retailer.name}</p>
                                        <p className="entity-sub-text">{retailer.phone} • Score: {retailer.amanaScore || 0}</p>
                                    </div>
                                </div>
                                <button 
                                    className="btn btn-primary btn-sm"
                                    onClick={() => handleOpenReview('retailer', retailer._id)}
                                >
                                    <Eye size={12} /> Review
                                </button>
                            </div>
                        ))
                    )}
                </div>

                {/* Queue 2: Pending Vendor Document Checks */}
                <div className="urgent-queue-panel">
                    <div className="urgent-queue-header">
                        <h3 className="urgent-queue-title">
                            <Briefcase size={18} className="text-brand" /> Pending Vendor Reviews ({urgentVendors.length})
                        </h3>
                        <Link to="/admin/vendors?status=pending" className="btn btn-ghost btn-sm text-brand font-semibold">
                            View All <ArrowRight size={12} />
                        </Link>
                    </div>
                    {urgentVendors.length === 0 ? (
                        <div style={{ padding: '30px', textAlign: 'center', color: 'var(--color-text-secondary)', fontSize: '13px' }}>
                            <CheckCircle2 size={28} className="text-brand" style={{ margin: '0 auto 8px', display: 'block' }} />
                            All clear! No pending vendor approvals.
                        </div>
                    ) : (
                        urgentVendors.slice(0, 4).map(vendor => (
                            <div key={vendor._id} className="urgent-item-row">
                                <div className="entity-cell">
                                    <div className="entity-avatar">
                                        {vendor.profilePicUrl ? <img src={vendor.profilePicUrl} alt={vendor.businessName} /> : vendor.businessName?.charAt(0)}
                                    </div>
                                    <div className="entity-details">
                                        <p className="entity-primary-text">{vendor.businessName}</p>
                                        <p className="entity-sub-text">CAC: {vendor.cacNumber || 'N/A'} • {vendor.phones?.[0]}</p>
                                    </div>
                                </div>
                                <button 
                                    className="btn btn-primary btn-sm"
                                    onClick={() => handleOpenReview('vendor', vendor._id)}
                                >
                                    <Eye size={12} /> Review
                                </button>
                            </div>
                        ))
                    )}
                </div>
            </div>

            {/* ── Queue 3: Pending Payout Requests ── */}
            <div className="urgent-queue-panel" style={{ marginTop: 'var(--space-4)' }}>
                <div className="urgent-queue-header">
                    <h3 className="urgent-queue-title">
                        <DollarSign size={18} className="text-brand" /> Pending Payout Disbursements ({urgentPayouts.length})
                    </h3>
                    <Link to="/admin/payouts?status=pending" className="btn btn-ghost btn-sm text-brand font-semibold">
                        View All <ArrowRight size={12} />
                    </Link>
                </div>
                {urgentPayouts.length === 0 ? (
                    <div style={{ padding: '30px', textAlign: 'center', color: 'var(--color-text-secondary)', fontSize: '13px' }}>
                        <CheckCircle2 size={28} className="text-brand" style={{ margin: '0 auto 8px', display: 'block' }} />
                        No pending payouts to disburse.
                    </div>
                ) : (
                    urgentPayouts.slice(0, 4).map(payout => (
                        <div key={payout._id} className="urgent-item-row">
                            <div className="entity-cell">
                                <div className="entity-avatar">
                                    {payout.vendor?.businessName?.charAt(0) || 'V'}
                                </div>
                                <div className="entity-details">
                                    <p className="entity-primary-text">{payout.vendor?.businessName || 'Unknown Vendor'}</p>
                                    <p className="entity-sub-text">{payout.bankDetailsSnapshot?.bankName} - {payout.bankDetailsSnapshot?.accountNumber}</p>
                                </div>
                            </div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                                <span className="font-bold text-brand" style={{ fontSize: '15px' }}>
                                    ₦{(payout.amount || 0).toLocaleString()}
                                </span>
                                <button 
                                    className="btn btn-primary btn-sm"
                                    onClick={() => handleConfirmPayout(payout)}
                                >
                                    <Check size={12} /> Confirm Paid
                                </button>
                            </div>
                        </div>
                    ))
                )}
            </div>

            {/* ── KYC Review Workspace Modal ── */}
            {selectedEntity && (
                <AdminKYCReviewModal 
                    isOpen={Boolean(selectedEntity)}
                    onClose={() => setSelectedEntity(null)}
                    entityType={selectedEntity.type}
                    entityData={selectedEntity.data}
                    onApprove={selectedEntity.type === 'retailer' ? handleApproveRetailer : handleVerifyVendor}
                    onReject={selectedEntity.type === 'retailer' ? handleRejectRetailer : handleRejectVendor}
                    isLoading={isActionLoading}
                />
            )}

            <ConfirmModal 
                isOpen={confirmModal.isOpen}
                onClose={() => setConfirmModal({ ...confirmModal, isOpen: false })}
                onConfirm={confirmModal.onConfirm}
                title={confirmModal.title}
                message={confirmModal.message}
                confirmText={confirmModal.confirmText}
            />
        </div>
    );
};

export default AdminDashboard;
