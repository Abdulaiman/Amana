import React, { useState, useEffect } from 'react';
import api from '../services/api';
import './AdminDashboard.css'; // Reusing admin dashboard styles
import './Transactions.css';
import { Search, Filter, TrendingUp, TrendingDown, Clock, CheckCircle, XCircle, ChevronLeft, ChevronRight, DollarSign, PieChart, BarChart2, Receipt } from 'lucide-react';

const AdminTransactions = () => {
    const [transactions, setTransactions] = useState([]);
    const [filteredTransactions, setFilteredTransactions] = useState([]);
    const [analytics, setAnalytics] = useState(null);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');
    const [typeFilter, setTypeFilter] = useState('all');

    // Pagination
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 15;

    useEffect(() => {
        fetchTransactions();
    }, []);

    const fetchTransactions = async () => {
        try {
            const res = await api.get('/transactions/admin');
            setTransactions(res.data.transactions);
            setFilteredTransactions(res.data.transactions);
            setAnalytics(res.data.analytics);
        } catch (error) {
            console.error('Failed to fetch transactions', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        let result = transactions;

        if (statusFilter !== 'all') {
            result = result.filter(t => t.status === statusFilter);
        }

        if (typeFilter !== 'all') {
             if (typeFilter === 'payout') {
                result = result.filter(t => t.type === 'payout');
             } else if (typeFilter === 'order') {
                result = result.filter(t => t.type === 'order_payment');
             } else if (typeFilter === 'repayment') {
                result = result.filter(t => t.type === 'repayment' || t.type === 'partial_repayment');
             } else if (typeFilter === 'partial') {
                result = result.filter(t => t.type === 'partial_repayment');
             }
        }

        if (searchTerm) {
            result = result.filter(t => 
                t.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                t._id?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                (t.reference && t.reference.toLowerCase().includes(searchTerm.toLowerCase())) ||
                (t.user && (t.user.businessName?.toLowerCase().includes(searchTerm.toLowerCase()) || t.user.name?.toLowerCase().includes(searchTerm.toLowerCase())))
            );
        }

        setFilteredTransactions(result);
        setCurrentPage(1);
    }, [searchTerm, statusFilter, typeFilter, transactions]);

    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    const currentItems = filteredTransactions.slice(indexOfFirstItem, indexOfLastItem);
    const totalPages = Math.ceil(filteredTransactions.length / itemsPerPage);

    const getStatusBadge = (status) => {
        switch (status) { // Reusing CSS classes from dashboard
            case 'completed': 
            case 'approved':
            case 'delivered':
                return <span className="status-badge-pill completed">{status}</span>;
            case 'pending': 
            case 'pending_vendor':
                return <span className="status-badge-pill pending">{status}</span>;
            case 'rejected': 
            case 'cancelled':
                return <span className="status-badge-pill cancelled">{status}</span>;
            default: return <span className="status-badge-pill">{status}</span>;
        }
    };

    return (
        <div className="transactions-container">
            <div className="page-hero">
                <div className="page-hero-icon">
                    <Receipt size={24} />
                </div>
                <div className="page-hero-body">
                    <h1 className="page-hero-title">Financial Overview</h1>
                    <p className="page-hero-subtitle">Global transaction history and payout management.</p>
                </div>
            </div>

            {/* Analytics Cards */}
            {analytics && (
                <div className="summary-card-row" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))' }}>
                    <div className="summary-card">
                        <span className="summary-label">Total Volume</span>
                        <span className="summary-value">₦{analytics.totalVolume.toLocaleString()}</span>
                    </div>
                    <div className="summary-card">
                         <span className="summary-label">Total Payouts</span>
                         <span className="summary-value">₦{analytics.totalPayouts.toLocaleString()}</span>
                    </div>
                    <div className="summary-card">
                         <span className="summary-label">Total Repayments</span>
                         <span className="summary-value" style={{ color: '#10b981' }}>₦{(analytics.totalRepayments || 0).toLocaleString()}</span>
                    </div>
                    <div className="summary-card">
                         <span className="summary-label">Pending Payouts</span>
                         <span className="summary-value" style={{ color: '#fbbf24' }}>₦{analytics.pendingPayoutsVolume.toLocaleString()}</span>
                    </div>
                </div>
            )}

            {/* Filters */}
            <div className="filters-bar">
                <div className="search-input-wrapper">
                    <Search size={18} className="search-icon" />
                    <input 
                        type="text" 
                        placeholder="Search by ID, Description, Trader, or Vendor..." 
                        value={searchTerm}
                        onChange={e => setSearchTerm(e.target.value)}
                    />
                </div>
                
                <select className="filter-select" value={statusFilter} onChange={e => setStatusFilter(e.target.value)}>
                    <option value="all">All Status</option>
                    <option value="pending">Pending</option>
                    <option value="approved">Approved/Completed</option>
                    <option value="rejected">Rejected/Cancelled</option>
                </select>

                <select className="filter-select" value={typeFilter} onChange={e => setTypeFilter(e.target.value)}>
                    <option value="all">All Types</option>
                    <option value="payout">Payouts</option>
                    <option value="order">Orders</option>
                    <option value="repayment">All Repayments</option>
                    <option value="partial">Partial Repayments</option>
                </select>
            </div>

            {/* Table */}
            <div className="transactions-table-container">
                <div className="table-wrapper">
                    <table className="transactions-table">
                        <thead>
                            <tr>
                                <th>Type</th>
                                <th>Description</th>
                                <th>Party / User</th>
                                <th>Date</th>
                                <th>Amount</th>
                                <th>Status</th>
                            </tr>
                        </thead>
                        <tbody>
                            {loading ? (
                                <tr><td colSpan="6" className="empty-state">Loading transactions...</td></tr>
                            ) : currentItems.length > 0 ? (
                                currentItems.map((tx) => {
                                    const isRepay = tx.type === 'repayment' || tx.type === 'partial_repayment';
                                    const isPartial = tx.type === 'partial_repayment';
                                    return (
                                        <tr key={tx._id}>
                                            <td>
                                                 <div className={`tx-type-badge ${tx.type === 'payout' ? 'payout' : (isPartial ? 'warning' : isRepay ? 'completed' : 'order')}`} style={isPartial ? { background: 'rgba(59, 130, 246, 0.15)', color: '#60a5fa' } : isRepay ? { background: 'rgba(16, 185, 129, 0.15)', color: '#10b981' } : {}}>
                                                    <div className="tx-icon-wrapper">
                                                        {tx.type === 'payout' ? <TrendingDown size={18} /> : <TrendingUp size={18} />}
                                                    </div>
                                                    <span>{isPartial ? 'Partial Repay' : isRepay ? 'Repayment' : (tx.type === 'payout' ? 'Payout' : 'Order')}</span>
                                                </div>
                                            </td>
                                            <td>
                                                <span className="tx-description-main">{tx.description}</span>
                                                <span className="tx-description-sub">Ref: {tx.reference} {tx.channel ? `• ${tx.channel.toUpperCase()}` : ''}</span>
                                            </td>
                                            <td>
                                                <span style={{ color: '#d1d5db' }}>{tx.user?.businessName || tx.user?.name || 'N/A'}</span>
                                            </td>
                                            <td>
                                                <div className="tx-date-cell">
                                                    {new Date(tx.date).toLocaleDateString()}
                                                </div>
                                            </td>
                                            <td>
                                                <span className={`tx-amount ${tx.type === 'payout' ? 'negative' : 'positive'}`}>
                                                    {tx.type === 'payout' ? '-' : '+'} ₦{tx.amount.toLocaleString()}
                                                </span>
                                            </td>
                                            <td>
                                                <span className={`status-pill ${tx.status}`}>
                                                    {tx.status}
                                                </span>
                                            </td>
                                        </tr>
                                    );
                                })
                            ) : (
                                <tr>
                                    <td colSpan="6" className="empty-state">
                                        <p>No transactions found.</p>
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

             {/* Pagination */}
             {totalPages > 1 && (
                <div className="pagination-controls">
                    <button 
                        className="pagination-btn"
                        onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                        disabled={currentPage === 1}
                    >
                        <ChevronLeft size={16} /> Previous
                    </button>
                    <span className="page-info">
                        Page <strong>{currentPage}</strong> of <strong>{totalPages}</strong>
                    </span>
                    <button 
                        className="pagination-btn"
                        onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                        disabled={currentPage === totalPages}
                    >
                        Next <ChevronRight size={16} />
                    </button>
                </div>
            )}
        </div>
    );
};

export default AdminTransactions;
