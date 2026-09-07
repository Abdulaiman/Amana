import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import api from '../../services/api';
import { 
    Briefcase, Search, Filter, ShieldCheck, ShieldX, Clock, 
    ChevronLeft, ChevronRight, RefreshCw, Eye, Wallet, 
    Building, AlertCircle 
} from 'lucide-react';
import { useToast } from '../../context/ToastContext';
import AdminKYCReviewModal from '../../components/admin/AdminKYCReviewModal';
import './AdminSectionStyles.css';

const AdminVendors = () => {
    const [searchParams, setSearchParams] = useSearchParams();
    const initialStatus = searchParams.get('status') || 'all';

    const [vendors, setVendors] = useState([]);
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
    const [selectedVendor, setSelectedVendor] = useState(null);
    const [isActionLoading, setIsActionLoading] = useState(false);

    const { addToast } = useToast();

    useEffect(() => {
        fetchVendors();
    }, [statusFilter, sortBy, sortOrder, page, limit]);

    // Update if URL search param changes externally
    useEffect(() => {
        const paramStatus = searchParams.get('status');
        if (paramStatus && paramStatus !== statusFilter) {
            setStatusFilter(paramStatus);
            setPage(1);
        }
    }, [searchParams]);

    const fetchVendors = async () => {
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
            const res = await api.get(`/admin/vendors?${params.toString()}`);
            if (res.data && res.data.data) {
                setVendors(res.data.data);
                setTotal(res.data.total);
                setTotalPages(res.data.totalPages);
            } else if (Array.isArray(res.data)) {
                setVendors(res.data);
                setTotal(res.data.length);
                setTotalPages(1);
            }
        } catch (error) {
            console.error('Failed to fetch vendors', error);
            addToast('Failed to load vendors directory', 'error');
        } finally {
            setLoading(false);
        }
    };

    const handleSearchSubmit = (e) => {
        e.preventDefault();
        setPage(1);
        fetchVendors();
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
            const res = await api.get(`/admin/vendor/${id}`);
            setSelectedVendor(res.data);
        } catch (e) {
            addToast('Failed to load vendor details', 'error');
        }
    };

    const handleVerifyVendor = async (id) => {
        setIsActionLoading(true);
        try {
            await api.put(`/admin/vendor/${id}/verify`);
            addToast('Vendor Verified Successfully', 'success');
            setSelectedVendor(null);
            fetchVendors();
        } catch (e) {
            addToast('Vendor verification failed', 'error');
        } finally {
            setIsActionLoading(false);
        }
    };

    const handleRejectVendor = async (id, customLimit, adminNote) => {
        if (!adminNote) {
            return addToast('Please provide a reason or note for rejection', 'error');
        }
        setIsActionLoading(true);
        try {
            await api.put(`/admin/vendor/${id}/reject`, { reason: adminNote });
            addToast('Vendor Application Rejected', 'info');
            setSelectedVendor(null);
            fetchVendors();
        } catch (e) {
            addToast('Vendor rejection failed', 'error');
        } finally {
            setIsActionLoading(false);
        }
    };

    return (
        <div className="admin-page-container animate-fade-in">
            {/* ── Section Header ── */}
            <div className="admin-section-header">
                <div className="admin-section-header-left">
                    <div className="section-icon-badge teal">
                        <Briefcase size={28} />
                    </div>
                    <div>
                        <h1 className="admin-section-title">Vendors Directory & Compliance</h1>
                        <p className="admin-section-subtitle">
                            Verify wholesaler registrations, inspect CAC documents and bank details, and manage vendor access.
                        </p>
                    </div>
                </div>
                <div className="admin-section-header-actions">
                    <button className="btn btn-secondary btn-sm" onClick={fetchVendors} disabled={loading}>
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
                            placeholder="Search by business name, owner, email, phone, CAC..."
                            className="admin-search-input-main"
                            value={searchTerm}
                            onChange={e => setSearchTerm(e.target.value)}
                        />
                    </div>
                </form>

                <div className="control-bar-right">
                    <div className="filter-pills-group">
                        <button 
                            className={`filter-pill-btn ${statusFilter === 'all' ? 'active' : ''}`}
                            onClick={() => handleStatusFilterChange('all')}
                        >
                            All
                        </button>
                        <button 
                            className={`filter-pill-btn ${statusFilter === 'pending' ? 'active' : ''}`}
                            onClick={() => handleStatusFilterChange('pending')}
                        >
                            <Clock size={12} /> Pending Review
                        </button>
                        <button 
                            className={`filter-pill-btn ${statusFilter === 'verified' ? 'active' : ''}`}
                            onClick={() => handleStatusFilterChange('verified')}
                        >
                            <ShieldCheck size={12} /> Verified
                        </button>
                        <button 
                            className={`filter-pill-btn ${statusFilter === 'rejected' ? 'active' : ''}`}
                            onClick={() => handleStatusFilterChange('rejected')}
                        >
                            <ShieldX size={12} /> Rejected
                        </button>
                    </div>

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
                            <option value="date_desc">Newest Registered</option>
                            <option value="date_asc">Oldest Registered</option>
                            <option value="wallet_desc">Wallet: High to Low</option>
                            <option value="wallet_asc">Wallet: Low to High</option>
                            <option value="name_asc">Business Name: A to Z</option>
                        </select>
                    </div>
                </div>
            </div>

            {/* ── Vendors Table ── */}
            <div className="admin-table-card">
                <div className="table-responsive-container">
                    <table className="admin-modern-table">
                        <thead>
                            <tr>
                                <th style={{ width: '35%' }}>Business & Wholesaler</th>
                                <th style={{ width: '25%' }}>Owner & Contact</th>
                                <th style={{ width: '15%' }}>Wallet Balance</th>
                                <th style={{ width: '15%' }}>Compliance Status</th>
                                <th className="th-action-sticky" style={{ width: '10%' }}>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {loading ? (
                                <tr>
                                    <td colSpan={5} style={{ textAlign: 'center', padding: '40px' }}>
                                        <div className="loading-spinner" style={{ margin: '0 auto' }}></div>
                                    </td>
                                </tr>
                            ) : vendors.length === 0 ? (
                                <tr>
                                    <td colSpan={5} style={{ textAlign: 'center', padding: '40px' }}>
                                        <Briefcase size={36} className="text-tertiary mb-2" style={{ margin: '0 auto', display: 'block' }} />
                                        <p className="text-secondary">No vendors found matching criteria.</p>
                                    </td>
                                </tr>
                            ) : (
                                vendors.map(vendor => {
                                    const profilePic = vendor.profilePicUrl;
                                    return (
                                        <tr 
                                            key={vendor._id}
                                            className="clickable-row"
                                            onClick={() => handleOpenReview(vendor._id)}
                                            title="Click to review vendor documents"
                                        >
                                            <td>
                                                <div className="entity-cell">
                                                    <div className="entity-avatar">
                                                        {profilePic ? (
                                                            <img src={profilePic} alt={vendor.businessName} />
                                                        ) : (
                                                            vendor.businessName?.charAt(0) || 'V'
                                                        )}
                                                    </div>
                                                    <div className="entity-details">
                                                        <p className="entity-primary-text">{vendor.businessName}</p>
                                                        <p className="entity-sub-text">CAC: {vendor.cacNumber || 'N/A'}</p>
                                                    </div>
                                                </div>
                                            </td>
                                            <td>
                                                <p className="entity-primary-text" style={{ fontSize: '13px' }}>{vendor.ownerName || 'Unknown Owner'}</p>
                                                <p className="entity-sub-text">{vendor.phones?.[0] || vendor.email}</p>
                                            </td>
                                            <td>
                                                <span className="font-bold text-brand">₦{(vendor.walletBalance || 0).toLocaleString()}</span>
                                            </td>
                                            <td>
                                                <span className={`status-pill ${vendor.verificationStatus === 'verified' ? 'approved' : vendor.verificationStatus === 'rejected' ? 'rejected' : 'pending'}`}>
                                                    {vendor.verificationStatus === 'verified' ? <ShieldCheck size={12} /> : vendor.verificationStatus === 'rejected' ? <ShieldX size={12} /> : <Clock size={12} />}
                                                    {(vendor.verificationStatus || 'PENDING').toUpperCase()}
                                                </span>
                                            </td>
                                            <td className="td-action-sticky" onClick={e => e.stopPropagation()}>
                                                <button 
                                                    className="btn btn-secondary btn-sm"
                                                    onClick={() => handleOpenReview(vendor._id)}
                                                >
                                                    <Eye size={13} /> Inspect
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
                        Showing {vendors.length > 0 ? (page - 1) * limit + 1 : 0} to {Math.min(page * limit, total)} of {total} vendors
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
                isOpen={Boolean(selectedVendor)}
                onClose={() => setSelectedVendor(null)}
                entityType="vendor"
                entityData={selectedVendor}
                onApprove={(id) => handleVerifyVendor(id)}
                onReject={handleRejectVendor}
                isLoading={isActionLoading}
            />
        </div>
    );
};

export default AdminVendors;
