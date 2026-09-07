import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import api from '../../services/api';
import { 
    DollarSign, Search, Filter, Check, AlertCircle, Clock, 
    ChevronLeft, ChevronRight, RefreshCw, Wallet, Building, 
    CreditCard, ArrowUpRight 
} from 'lucide-react';
import { useToast } from '../../context/ToastContext';
import ConfirmModal from '../../components/ConfirmModal';
import './AdminSectionStyles.css';

const AdminPayouts = () => {
    const [searchParams, setSearchParams] = useSearchParams();
    const initialStatus = searchParams.get('status') || 'all';

    const [withdrawals, setWithdrawals] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState(initialStatus);
    const [sortBy, setSortBy] = useState('date');
    const [sortOrder, setSortOrder] = useState('desc');
    const [page, setPage] = useState(1);
    const [limit, setLimit] = useState(10);
    const [total, setTotal] = useState(0);
    const [totalPages, setTotalPages] = useState(1);

    const [confirmModal, setConfirmModal] = useState({ isOpen: false, title: '', message: '', onConfirm: null });
    const { addToast } = useToast();

    useEffect(() => {
        fetchWithdrawals();
    }, [statusFilter, sortBy, sortOrder, page, limit]);

    useEffect(() => {
        const paramStatus = searchParams.get('status');
        if (paramStatus && paramStatus !== statusFilter) {
            setStatusFilter(paramStatus);
            setPage(1);
        }
    }, [searchParams]);

    const fetchWithdrawals = async () => {
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
            const res = await api.get(`/admin/withdrawals?${params.toString()}`);
            if (res.data && res.data.data) {
                setWithdrawals(res.data.data);
                setTotal(res.data.total);
                setTotalPages(res.data.totalPages);
            } else if (Array.isArray(res.data)) {
                setWithdrawals(res.data);
                setTotal(res.data.length);
                setTotalPages(1);
            }
        } catch (error) {
            console.error('Failed to fetch payouts', error);
            addToast('Failed to load payouts directory', 'error');
        } finally {
            setLoading(false);
        }
    };

    const handleSearchSubmit = (e) => {
        e.preventDefault();
        setPage(1);
        fetchWithdrawals();
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

    const handleConfirmPayout = (payout) => {
        setConfirmModal({
            isOpen: true,
            title: 'Confirm Vendor Transfer Disbursed?',
            message: `Please confirm that you have manually executed the bank transfer of ₦${payout.amount.toLocaleString()} to ${payout.vendor?.businessName || 'the vendor'}.\n\nAccount: ${payout.bankDetailsSnapshot?.accountNumber} (${payout.bankDetailsSnapshot?.bankName})\nBeneficiary: ${payout.bankDetailsSnapshot?.accountName}`,
            confirmText: `Confirm ₦${payout.amount.toLocaleString()} Sent`,
            onConfirm: async () => {
                setConfirmModal({ isOpen: false, title: '', message: '', onConfirm: null });
                try {
                    await api.put(`/admin/withdrawals/${payout._id}/confirm`);
                    addToast('Payout confirmed & vendor ledger updated!', 'success');
                    fetchWithdrawals();
                } catch (e) {
                    addToast(e.response?.data?.message || 'Failed to confirm payout', 'error');
                }
            }
        });
    };

    return (
        <div className="admin-page-container animate-fade-in">
            {/* ── Section Header ── */}
            <div className="admin-section-header">
                <div className="admin-section-header-left">
                    <div className="section-icon-badge orange">
                        <DollarSign size={28} />
                    </div>
                    <div>
                        <h1 className="admin-section-title">Payouts & Vendor Withdrawals</h1>
                        <p className="admin-section-subtitle">
                            Disburse settled vendor earnings, inspect recipient bank accounts, and reconcile manual bank transfers.
                        </p>
                    </div>
                </div>
                <div className="admin-section-header-actions">
                    <button className="btn btn-secondary btn-sm" onClick={fetchWithdrawals} disabled={loading}>
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
                            placeholder="Search by vendor, bank name, account number, or name..."
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
                            <Clock size={12} /> Pending Transfer
                        </button>
                        <button 
                            className={`filter-pill-btn ${statusFilter === 'approved' ? 'active' : ''}`}
                            onClick={() => handleStatusFilterChange('approved')}
                        >
                            <Check size={12} /> Disbursed / Paid
                        </button>
                        <button 
                            className={`filter-pill-btn ${statusFilter === 'rejected' ? 'active' : ''}`}
                            onClick={() => handleStatusFilterChange('rejected')}
                        >
                            <AlertCircle size={12} /> Rejected
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
                            <option value="date_desc">Newest Requested</option>
                            <option value="date_asc">Oldest Requested</option>
                            <option value="amount_desc">Amount: High to Low</option>
                            <option value="amount_asc">Amount: Low to High</option>
                        </select>
                    </div>
                </div>
            </div>

            {/* ── Payouts Table ── */}
            <div className="admin-table-card">
                <div className="table-responsive-container">
                    <table className="admin-modern-table">
                        <thead>
                            <tr>
                                <th style={{ width: '30%' }}>Vendor Business</th>
                                <th style={{ width: '18%' }}>Amount</th>
                                <th style={{ width: '30%' }}>Target Bank Details</th>
                                <th style={{ width: '10%' }}>Status</th>
                                <th className="th-action-sticky" style={{ width: '12%' }}>Action</th>
                            </tr>
                        </thead>
                        <tbody>
                            {loading ? (
                                <tr>
                                    <td colSpan={5} style={{ textAlign: 'center', padding: '40px' }}>
                                        <div className="loading-spinner" style={{ margin: '0 auto' }}></div>
                                    </td>
                                </tr>
                            ) : withdrawals.length === 0 ? (
                                <tr>
                                    <td colSpan={5} style={{ textAlign: 'center', padding: '40px' }}>
                                        <DollarSign size={36} className="text-tertiary mb-2" style={{ margin: '0 auto', display: 'block' }} />
                                        <p className="text-secondary">No payout requests found matching criteria.</p>
                                    </td>
                                </tr>
                            ) : (
                                withdrawals.map(payout => (
                                    <tr key={payout._id}>
                                        <td>
                                            <div className="entity-cell">
                                                <div className="entity-avatar">
                                                    {payout.vendor?.businessName?.charAt(0) || 'V'}
                                                </div>
                                                <div className="entity-details">
                                                    <p className="entity-primary-text">{payout.vendor?.businessName || 'Unknown Vendor'}</p>
                                                    <p className="entity-sub-text">Balance: ₦{(payout.vendor?.walletBalance || 0).toLocaleString()}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td>
                                            <span className="font-bold text-brand" style={{ fontSize: '15px' }}>
                                                ₦{(payout.amount || 0).toLocaleString()}
                                            </span>
                                        </td>
                                        <td>
                                            <div style={{ fontSize: '12px' }}>
                                                <p className="font-semibold text-primary">{payout.bankDetailsSnapshot?.bankName || 'N/A'}</p>
                                                <p className="text-secondary font-mono">{payout.bankDetailsSnapshot?.accountNumber || 'N/A'}</p>
                                                <p className="text-tertiary">{payout.bankDetailsSnapshot?.accountName || 'N/A'}</p>
                                            </div>
                                        </td>
                                        <td>
                                            <span className={`status-pill ${payout.status === 'approved' ? 'approved' : payout.status === 'rejected' ? 'rejected' : 'pending'}`}>
                                                {payout.status === 'approved' ? <Check size={12} /> : payout.status === 'rejected' ? <AlertCircle size={12} /> : <Clock size={12} />}
                                                {payout.status?.toUpperCase()}
                                            </span>
                                        </td>
                                        <td className="td-action-sticky">
                                            {payout.status === 'pending' ? (
                                                <button 
                                                    className="btn btn-primary btn-sm"
                                                    onClick={() => handleConfirmPayout(payout)}
                                                >
                                                    <Check size={14} /> Confirm Paid
                                                </button>
                                            ) : (
                                                <span className="text-tertiary" style={{ fontSize: '12px' }}>
                                                    {payout.status === 'approved' ? 'Settled' : 'Closed'}
                                                </span>
                                            )}
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>

                {/* ── Pagination Bar ── */}
                <div className="admin-pagination-bar">
                    <div className="pagination-info">
                        Showing {withdrawals.length > 0 ? (page - 1) * limit + 1 : 0} to {Math.min(page * limit, total)} of {total} payout requests
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

export default AdminPayouts;
