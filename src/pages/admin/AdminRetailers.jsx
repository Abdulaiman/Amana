import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import api from '../../services/api';
import { 
    Users, Search, Filter, ShieldCheck, ShieldX, Clock, 
    ChevronLeft, ChevronRight, RefreshCw, UserCheck, Eye, 
    ArrowUpDown, AlertCircle, Store, FileText, CheckCircle2
} from 'lucide-react';
import { useToast } from '../../context/ToastContext';
import AdminKYCReviewModal from '../../components/admin/AdminKYCReviewModal';
import ConfirmModal from '../../components/ConfirmModal';
import './AdminSectionStyles.css';

const AdminRetailers = () => {
    const [searchParams, setSearchParams] = useSearchParams();
    const initialStatus = searchParams.get('status') || 'all';

    const [retailers, setRetailers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState(initialStatus);
    const [sortBy, setSortBy] = useState('date');
    const [sortOrder, setSortOrder] = useState('desc');
    const [page, setPage] = useState(1);
    const [limit, setLimit] = useState(10);
    const [total, setTotal] = useState(0);
    const [totalPages, setTotalPages] = useState(1);

    // Review Modal State
    const [selectedRetailer, setSelectedRetailer] = useState(null);
    const [isActionLoading, setIsActionLoading] = useState(false);
    const [confirmModal, setConfirmModal] = useState({ isOpen: false, title: '', message: '', onConfirm: null });

    const { addToast } = useToast();

    useEffect(() => {
        fetchRetailers();
    }, [statusFilter, sortBy, sortOrder, page, limit]);

    useEffect(() => {
        const paramStatus = searchParams.get('status');
        if (paramStatus && paramStatus !== statusFilter) {
            setStatusFilter(paramStatus);
            setPage(1);
        }
    }, [searchParams]);

    const fetchRetailers = async () => {
        setLoading(true);
        try {
            const params = new URLSearchParams({
                status: statusFilter,
                search: searchTerm,
                sortBy,
                sortOrder,
                page: page.toString(),
                limit: limit.toString()
            });
            const res = await api.get(`/admin/retailers?${params.toString()}`);
            if (res.data && res.data.data) {
                setRetailers(res.data.data);
                setTotal(res.data.total);
                setTotalPages(res.data.totalPages);
            } else if (Array.isArray(res.data)) {
                setRetailers(res.data);
                setTotal(res.data.length);
                setTotalPages(1);
            }
        } catch (error) {
            console.error('Failed to fetch retailers', error);
            addToast('Failed to load retailers directory', 'error');
        } finally {
            setLoading(false);
        }
    };

    const handleSearchSubmit = (e) => {
        e.preventDefault();
        setPage(1);
        fetchRetailers();
    };

    const handleStatusFilterChange = (status) => {
        setStatusFilter(status);
        setPage(1);
        if (status === 'all') {
            searchParams.delete('status');
        } else {
            searchParams.set('status', status);
        }
        setSearchParams(searchParams);
    };

    const handleOpenReview = async (id) => {
        try {
            const res = await api.get(`/admin/retailer/${id}`);
            setSelectedRetailer(res.data);
        } catch (e) {
            addToast('Failed to load retailer KYC details', 'error');
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
            setSelectedRetailer(null);
            fetchRetailers();
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
        if (!rejectionReason) {
            return addToast('Please provide a reason or note for rejection', 'error');
        }
        setIsActionLoading(true);
        try {
            await api.put(`/admin/retailer/${id}/reject`, { reason: rejectionReason });
            addToast('Retailer KYC Rejected', 'info');
            setSelectedRetailer(null);
            fetchRetailers();
        } catch (e) {
            addToast('Rejection failed', 'error');
        } finally {
            setIsActionLoading(false);
        }
    };

    const renderKYCStatusBadge = (user) => {
        const st = user.verificationStatus || 'unsubmitted';

        if (st === 'pending_admin_approval') {
            return (
                <div>
                    <span className="kyc-status-badge awaiting-admin">
                        <Clock size={12} /> Awaiting Admin Approval
                    </span>
                    {user.eligibilityChecklist?.fieldVisitDate && (
                        <p className="entity-sub-text" style={{ marginTop: '3px' }}>
                            ✓ Shop visited {new Date(user.eligibilityChecklist.fieldVisitDate).toLocaleDateString()}
                        </p>
                    )}
                </div>
            );
        }

        if (st === 'pending_agent_verification') {
            return (
                <div>
                    <span className="kyc-status-badge awaiting-agent">
                        <Store size={12} /> Awaiting Agent Visit
                    </span>
                    <p className="entity-sub-text" style={{ marginTop: '3px' }}>
                        Field visit pending
                    </p>
                </div>
            );
        }

        if (st === 'unsubmitted') {
            return (
                <span className="kyc-status-badge unsubmitted">
                    <AlertCircle size={12} /> Unsubmitted Profile
                </span>
            );
        }

        if (st === 'approved') {
            return (
                <span className="kyc-status-badge approved">
                    <CheckCircle2 size={12} /> Approved & Active
                </span>
            );
        }

        if (st === 'rejected') {
            return (
                <span className="kyc-status-badge rejected">
                    <ShieldX size={12} /> Rejected
                </span>
            );
        }

        return (
            <span className="kyc-status-badge pending">
                <Clock size={12} /> Pending Review
            </span>
        );
    };

    return (
        <div className="admin-page-container animate-fade-in">
            {/* ── Section Header ── */}
            <div className="admin-section-header">
                <div className="admin-section-header-left">
                    <div className="section-icon-badge purple">
                        <Users size={28} />
                    </div>
                    <div>
                        <h1 className="admin-section-title">Retailers Directory & KYC Verification</h1>
                        <p className="admin-section-subtitle">
                            Review trader applications across all compliance lifecycle stages and allocate financing limits.
                        </p>
                    </div>
                </div>
                <div className="admin-section-header-actions">
                    <button className="btn btn-secondary btn-sm" onClick={fetchRetailers} disabled={loading}>
                        <RefreshCw size={14} className={loading ? 'animate-spin' : ''} /> Refresh
                    </button>
                </div>
            </div>

            {/* ── Control Bar ── */}
            <div className="admin-control-bar">
                <form className="control-bar-left" onSubmit={handleSearchSubmit}>
                    <div className="search-field-wrapper">
                        <Search size={16} className="search-field-icon" />
                        <input 
                            type="text"
                            placeholder="Search by name, phone, email, store, or NIN..."
                            className="admin-search-input-main"
                            value={searchTerm}
                            onChange={e => setSearchTerm(e.target.value)}
                        />
                    </div>
                </form>

                <div className="control-bar-right">
                    <div className="sort-select-wrapper">
                        <span className="sort-select-label">Sort:</span>
                        <select 
                            className="admin-select-field"
                            value={`${sortBy}_${sortOrder}`}
                            onChange={e => {
                                const [by, ord] = e.target.value.split('_');
                                setSortBy(by);
                                setSortOrder(ord);
                                setPage(1);
                            }}
                        >
                            <option value="date_desc">Newest First</option>
                            <option value="date_asc">Oldest First</option>
                            <option value="score_desc">Amana Score: High to Low</option>
                            <option value="score_asc">Amana Score: Low to High</option>
                            <option value="name_asc">Name: A to Z</option>
                        </select>
                    </div>
                </div>
            </div>

            {/* ── Status Lifecycle Filter Pills ── */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                <button 
                    className={`filter-pill-btn ${statusFilter === 'all' ? 'active' : ''}`}
                    onClick={() => handleStatusFilterChange('all')}
                >
                    All Traders
                </button>
                <button 
                    className={`filter-pill-btn ${statusFilter === 'pending_admin_approval' ? 'active' : ''}`}
                    onClick={() => handleStatusFilterChange('pending_admin_approval')}
                >
                    <Clock size={12} /> Awaiting Admin Approval
                </button>
                <button 
                    className={`filter-pill-btn ${statusFilter === 'pending_agent_verification' ? 'active' : ''}`}
                    onClick={() => handleStatusFilterChange('pending_agent_verification')}
                >
                    <Store size={12} /> Awaiting Agent Visit
                </button>
                <button 
                    className={`filter-pill-btn ${statusFilter === 'unsubmitted' ? 'active' : ''}`}
                    onClick={() => handleStatusFilterChange('unsubmitted')}
                >
                    <AlertCircle size={12} /> Unsubmitted KYC
                </button>
                <button 
                    className={`filter-pill-btn ${statusFilter === 'approved' ? 'active' : ''}`}
                    onClick={() => handleStatusFilterChange('approved')}
                >
                    <CheckCircle2 size={12} /> Approved
                </button>
                <button 
                    className={`filter-pill-btn ${statusFilter === 'rejected' ? 'active' : ''}`}
                    onClick={() => handleStatusFilterChange('rejected')}
                >
                    <ShieldX size={12} /> Rejected
                </button>
            </div>

            {/* ── Retailers Table (Compact, No Horizontal Scrollbar Needed, Sticky Action) ── */}
            <div className="admin-table-card">
                <div className="table-responsive-container">
                    <table className="admin-modern-table">
                        <thead>
                            <tr>
                                <th style={{ width: '36%' }}>Trader & Business Details</th>
                                <th style={{ width: '28%' }}>KYC Lifecycle Status</th>
                                <th style={{ width: '20%' }}>Score & Limit</th>
                                <th className="th-action-sticky" style={{ width: '16%' }}>Review Action</th>
                            </tr>
                        </thead>
                        <tbody>
                            {loading ? (
                                <tr>
                                    <td colSpan={4} style={{ textAlign: 'center', padding: '40px' }}>
                                        <div className="loading-spinner" style={{ margin: '0 auto' }}></div>
                                    </td>
                                </tr>
                            ) : retailers.length === 0 ? (
                                <tr>
                                    <td colSpan={4} style={{ textAlign: 'center', padding: '40px' }}>
                                        <Users size={36} className="text-tertiary mb-2" style={{ margin: '0 auto', display: 'block' }} />
                                        <p className="text-secondary">No retailers found for this filter.</p>
                                    </td>
                                </tr>
                            ) : (
                                retailers.map(user => {
                                    const profilePic = user.kyc?.profilePicUrl || user.profilePicUrl;
                                    return (
                                        <tr 
                                            key={user._id}
                                            className="clickable-row"
                                            onClick={() => handleOpenReview(user._id)}
                                            title="Click anywhere to review trader KYC"
                                        >
                                            {/* Col 1: Trader, Store, Contact */}
                                            <td>
                                                <div className="entity-cell">
                                                    <div className="entity-avatar">
                                                        {profilePic ? (
                                                            <img src={profilePic} alt={user.name} />
                                                        ) : (
                                                            user.name?.charAt(0) || 'U'
                                                        )}
                                                    </div>
                                                    <div className="entity-details">
                                                        <p className="entity-primary-text">{user.name}</p>
                                                        <p className="entity-sub-text font-medium" style={{ color: 'var(--color-brand)' }}>
                                                            {user.businessInfo?.businessName || user.businessName || 'General Merchant'}
                                                        </p>
                                                        <p className="entity-sub-text">{user.phone} • {user.email}</p>
                                                    </div>
                                                </div>
                                            </td>

                                            {/* Col 2: KYC Status */}
                                            <td>
                                                {renderKYCStatusBadge(user)}
                                            </td>

                                            {/* Col 3: Score & Credit Limit */}
                                            <td>
                                                <div>
                                                    <span className="font-bold text-brand" style={{ fontSize: '14px' }}>
                                                        {user.amanaScore || 0} pts
                                                    </span>
                                                    <span className="entity-sub-text"> ({user.tier || 'Bronze'})</span>
                                                    <p className="entity-primary-text" style={{ fontSize: '12px', marginTop: '2px' }}>
                                                        Limit: ₦{(user.creditLimit || 0).toLocaleString()}
                                                    </p>
                                                </div>
                                            </td>

                                            {/* Col 4: Sticky Action Button */}
                                            <td className="td-action-sticky" onClick={e => e.stopPropagation()}>
                                                <button 
                                                    className="btn btn-primary btn-sm"
                                                    style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}
                                                    onClick={() => handleOpenReview(user._id)}
                                                >
                                                    <Eye size={13} /> Review KYC
                                                </button>
                                            </td>
                                        </tr>
                                    );
                                })
                            )}
                        </tbody>
                    </table>
                </div>

                {/* ── Pagination Bar ── */}
                <div className="admin-pagination-bar">
                    <div className="pagination-info">
                        Showing {retailers.length > 0 ? (page - 1) * limit + 1 : 0} to {Math.min(page * limit, total)} of {total} traders
                    </div>

                    <div className="pagination-controls">
                        <select 
                            className="admin-select-field"
                            value={limit}
                            onChange={e => {
                                setLimit(Number(e.target.value));
                                setPage(1);
                            }}
                            style={{ padding: '4px 8px' }}
                        >
                            <option value={10}>10 per page</option>
                            <option value={25}>25 per page</option>
                            <option value={50}>50 per page</option>
                        </select>

                        <button 
                            className="pagination-btn"
                            disabled={page <= 1 || loading}
                            onClick={() => setPage(prev => Math.max(prev - 1, 1))}
                        >
                            <ChevronLeft size={14} /> Prev
                        </button>

                        <span className="pagination-page-indicator">
                            Page {page} of {totalPages}
                        </span>

                        <button 
                            className="pagination-btn"
                            disabled={page >= totalPages || loading}
                            onClick={() => setPage(prev => Math.min(prev + 1, totalPages))}
                        >
                            Next <ChevronRight size={14} />
                        </button>
                    </div>
                </div>
            </div>

            {/* ── KYC Review Workspace Modal ── */}
            <AdminKYCReviewModal 
                isOpen={Boolean(selectedRetailer)}
                onClose={() => setSelectedRetailer(null)}
                entityType="retailer"
                entityData={selectedRetailer}
                onApprove={handleApproveRetailer}
                onReject={handleRejectRetailer}
                isLoading={isActionLoading}
            />

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

export default AdminRetailers;
