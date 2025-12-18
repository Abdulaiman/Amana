import React, { useState, useEffect } from 'react';
import api from '../services/api';
import './VendorDashboard.css'; // Reusing dashboard styles
import './Transactions.css';
import { Search, Filter, TrendingUp, TrendingDown, Clock, CheckCircle, XCircle, ChevronLeft, ChevronRight, DollarSign } from 'lucide-react';

const VendorTransactions = () => {
    const [transactions, setTransactions] = useState([]);
    const [filteredTransactions, setFilteredTransactions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('all'); // all, pending, completed
    const [typeFilter, setTypeFilter] = useState('all'); // all, order_payment (earning), payout

    // Pagination
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 10;

    useEffect(() => {
        fetchTransactions();
    }, []);

    const fetchTransactions = async () => {
        try {
            const res = await api.get('/transactions/vendor');
            setTransactions(res.data);
            setFilteredTransactions(res.data);
        } catch (error) {
            console.error('Failed to fetch transactions', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        let result = transactions;

        // Filter by Status
        if (statusFilter !== 'all') {
            result = result.filter(t => t.status === statusFilter);
        }

        // Filter by Type
        if (typeFilter !== 'all') {
            if (typeFilter === 'earning') {
                result = result.filter(t => t.type === 'earning' || t.type === 'order_payment');
            } else {
                result = result.filter(t => t.type === 'payout');
            }
        }

        // Search
        if (searchTerm) {
            result = result.filter(t => 
                t.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                t._id.toLowerCase().includes(searchTerm.toLowerCase())
            );
        }

        setFilteredTransactions(result);
        setCurrentPage(1); // Reset to page 1 on filter change
    }, [searchTerm, statusFilter, typeFilter, transactions]);

    // Pagination Logic
    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    const currentItems = filteredTransactions.slice(indexOfFirstItem, indexOfLastItem);
    const totalPages = Math.ceil(filteredTransactions.length / itemsPerPage);

    const getStatusBadge = (status) => {
        switch (status) {
            case 'completed': return <span className="status-badge-pill completed">Completed</span>;
            case 'pending': return <span className="status-badge-pill pending">Pending</span>;
            case 'rejected': return <span className="status-badge-pill cancelled">Rejected</span>;
            default: return <span className="status-badge-pill">{status}</span>;
        }
    };

    return (
        <div className="transactions-container">
            <div className="transactions-header">
                <div>
                    <h1 className="dashboard-title">Transaction History</h1>
                    <p className="dashboard-subtitle">Track your earnings and payouts</p>
                </div>
            </div>

            {/* Summary Cards */}
            <div className="summary-card-row">
                 <div className="summary-card">
                    <span className="summary-label">Total Transactions</span>
                    <span className="summary-value">{filteredTransactions.length}</span>
                </div>
                {/* You could add more stats here in future */}
            </div>

            {/* Filters */}
            <div className="filters-bar">
                <div className="search-input-wrapper">
                    <Search size={18} className="search-icon" />
                    <input 
                        type="text" 
                        placeholder="Search transactions..." 
                        value={searchTerm}
                        onChange={e => setSearchTerm(e.target.value)}
                    />
                </div>
                
                <select 
                    className="filter-select" 
                    value={statusFilter} 
                    onChange={e => setStatusFilter(e.target.value)}
                >
                    <option value="all">All Status</option>
                    <option value="completed">Completed</option>
                    <option value="pending">Pending</option>
                    <option value="rejected">Rejected</option>
                </select>

                <select 
                    className="filter-select" 
                    value={typeFilter} 
                    onChange={e => setTypeFilter(e.target.value)}
                >
                    <option value="all">All Types</option>
                    <option value="earning">Earnings</option>
                    <option value="payout">Payouts</option>
                </select>
            </div>

            {/* Table */}
            <div className="transactions-table-container">
                <table className="transactions-table inventory-table">
                    <thead>
                        <tr className="table-head-row">
                            <th className="th-cell">Type</th>
                            <th className="th-cell">Description</th>
                            <th className="th-cell">Date</th>
                            <th className="th-cell">Amount</th>
                            <th className="th-cell">Status</th>
                        </tr>
                    </thead>
                    <tbody>
                        {loading ? (
                            <tr><td colSpan="5" className="empty-state">Loading transactions...</td></tr>
                        ) : currentItems.length > 0 ? (
                            currentItems.map((tx) => (
                                <tr key={tx._id} className="table-body-row">
                                    <td className="td-cell" data-label="Type">
                                        <div className={`tx-type-badge ${tx.type === 'payout' ? 'payout' : 'earning'}`}>
                                            <div className="tx-icon-wrapper">
                                                {tx.type === 'payout' ? <TrendingDown size={18} /> : <TrendingUp size={18} />}
                                            </div>
                                            <span>{tx.type === 'payout' ? 'Payout' : 'Earning'}</span>
                                        </div>
                                    </td>
                                    <td className="td-cell" data-label="Description">
                                        <span className="tx-description-main">{tx.description}</span>
                                        <span className="tx-description-sub">Ref: {tx.reference}</span>
                                    </td>
                                    <td className="td-cell" data-label="Date">
                                        <div className="tx-date-cell">
                                            <Clock size={14} />
                                            {new Date(tx.date).toLocaleDateString()}
                                        </div>
                                    </td>
                                    <td className="td-cell" data-label="Amount">
                                        <span className={`tx-amount ${tx.type === 'payout' ? 'negative' : 'positive'}`}>
                                            {tx.type === 'payout' ? '-' : '+'} ₦{tx.amount.toLocaleString()}
                                        </span>
                                    </td>
                                    <td className="td-cell" data-label="Status">
                                        <span className={`status-pill ${tx.status}`}>
                                            {tx.status}
                                        </span>
                                    </td>
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan="5" className="empty-state">
                                    <DollarSign size={48} style={{ opacity: 0.2, margin: '0 auto 1rem', display: 'block' }} />
                                    <p>No transactions found matching your filters.</p>
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
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

export default VendorTransactions;
