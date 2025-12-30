import React, { useState, useEffect } from 'react';
import api from '../services/api';
import './RetailerTransactions.css';
import { 
    Search, 
    Filter, 
    TrendingUp, 
    TrendingDown, 
    Clock, 
    ChevronRight, 
    Search as SearchIcon, 
    DollarSign, 
    CreditCard, 
    ShoppingBag,
    ArrowDownLeft,
    ArrowUpRight,
    Zap
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const RetailerTransactions = () => {
    const navigate = useNavigate();
    const [transactions, setTransactions] = useState([]);
    const [filteredTransactions, setFilteredTransactions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [typeFilter, setTypeFilter] = useState('all');
    const [statusFilter, setStatusFilter] = useState('all');
    const [stats, setStats] = useState({
        totalRepaid: 0,
        activeDebt: 0,
        totalPurchases: 0
    });

    useEffect(() => {
        fetchTransactions();
        fetchProfile();
    }, []);

    const fetchTransactions = async () => {
        try {
            const res = await api.get('/transactions/retailer');
            setTransactions(res.data);
            setFilteredTransactions(res.data);
            
            // Basic aggregation for local stats if needed (or use profile)
            const repaid = res.data
                .filter(t => t.type === 'repayment' && t.status === 'success')
                .reduce((acc, t) => acc + t.amount, 0);
            
            setStats(prev => ({ ...prev, totalRepaid: repaid }));
        } catch (error) {
            console.error('Failed to fetch transactions', error);
        } finally {
            setLoading(false);
        }
    };

    const fetchProfile = async () => {
        try {
            const res = await api.get('/retailer/profile');
            setStats(prev => ({ 
                ...prev, 
                activeDebt: res.data.usedCredit 
            }));
        } catch (error) {
            console.error('Failed to fetch profile', error);
        }
    };

    useEffect(() => {
        let result = transactions;

        if (searchTerm) {
            const q = searchTerm.toLowerCase();
            result = result.filter(t => 
                t.description.toLowerCase().includes(q) ||
                t._id.toLowerCase().includes(q)
            );
        }

        if (typeFilter !== 'all') {
            result = result.filter(t => t.type === typeFilter);
        }

        if (statusFilter !== 'all') {
            result = result.filter(t => t.status === statusFilter);
        }

        setFilteredTransactions(result);
    }, [searchTerm, typeFilter, statusFilter, transactions]);

    const getTxIcon = (type) => {
        switch (type) {
            case 'repayment': 
                return { icon: <ArrowUpRight size={24} />, color: '#10b981', bg: 'rgba(16, 185, 129, 0.1)' };
            case 'loan_disbursement': 
                return { icon: <ArrowDownLeft size={24} />, color: '#3b82f6', bg: 'rgba(59, 130, 246, 0.1)' };
            case 'aap_credit_lock':
                return { icon: <Zap size={24} />, color: '#f59e0b', bg: 'rgba(245, 158, 11, 0.1)' };
            default: 
                return { icon: <Clock size={24} />, color: '#6b7280', bg: 'rgba(107, 114, 128, 0.1)' };
        }
    };

    const getStatusStyle = (status) => {
        switch (status) {
            case 'success':
            case 'completed': return { backgroundColor: 'rgba(16, 185, 129, 0.1)', color: '#10b981' };
            case 'pending': return { backgroundColor: 'rgba(245, 158, 11, 0.1)', color: '#f59e0b' };
            case 'failed': return { backgroundColor: 'rgba(239, 68, 68, 0.1)', color: '#ef4444' };
            default: return { backgroundColor: 'rgba(107, 114, 128, 0.1)', color: '#6b7280' };
        }
    };

    return (
        <div className="transactions-page-container animate-fade-in">
            <header className="transactions-header">
                <h1 className="page-title">Ledger</h1>
                <p className="page-subtitle">Detailed record of your credit usage, repayments, and disbursements.</p>
            </header>

            <div className="summary-grid">
                <div className="summary-card-premium">
                    <div className="summary-card-icon">
                        <DollarSign size={24} />
                    </div>
                    <div className="summary-info">
                        <span className="summary-label">Total Repaid</span>
                        <span className="summary-value">₦{stats.totalRepaid.toLocaleString()}</span>
                    </div>
                </div>
                
                <div className="summary-card-premium">
                    <div className="summary-card-icon" style={{ color: '#ef4444', background: 'rgba(239, 68, 68, 0.1)' }}>
                        <CreditCard size={24} />
                    </div>
                    <div className="summary-info">
                        <span className="summary-label">Active Debt</span>
                        <span className="summary-value">₦{stats.activeDebt.toLocaleString()}</span>
                    </div>
                </div>

                <div className="summary-card-premium">
                    <div className="summary-card-icon" style={{ color: '#3b82f6', background: 'rgba(59, 130, 246, 0.1)' }}>
                        <ShoppingBag size={24} />
                    </div>
                    <div className="summary-info">
                        <span className="summary-label">Total Ledger Events</span>
                        <span className="summary-value">{transactions.length}</span>
                    </div>
                </div>
            </div>

            <section className="history-section">
                <div className="section-controls">
                    <div className="search-wrapper">
                        <SearchIcon className="search-icon" size={18} />
                        <input 
                            type="text" 
                            placeholder="Search by description or reference..." 
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                    
                    <div className="filter-group">
                        <select 
                            className="filter-select"
                            value={typeFilter}
                            onChange={(e) => setTypeFilter(e.target.value)}
                        >
                            <option value="all">All Types</option>
                            <option value="repayment">Repayments</option>
                            <option value="loan_disbursement">Disbursements</option>
                            <option value="aap_credit_lock">AAP Locks</option>
                        </select>

                        <select 
                            className="filter-select"
                            value={statusFilter}
                            onChange={(e) => setStatusFilter(e.target.value)}
                        >
                            <option value="all">All Status</option>
                            <option value="success">Success</option>
                            <option value="pending">Pending</option>
                            <option value="failed">Failed</option>
                        </select>
                    </div>
                </div>

                <div className="tx-list-container">
                    {loading ? (
                        <div className="tx-empty">Loading your transaction history...</div>
                    ) : filteredTransactions.length > 0 ? (
                        filteredTransactions.map((tx) => {
                            const { icon, color, bg } = getTxIcon(tx.type);
                            return (
                                <div key={tx._id} className="tx-item-row">
                                    <div className="tx-left">
                                        <div className="tx-icon-box" style={{ backgroundColor: bg, color: color }}>
                                            {icon}
                                        </div>
                                        <div className="tx-details">
                                            <span className="tx-desc">{tx.description}</span>
                                            <div className="tx-meta">
                                                <small className="tx-date">
                                                    {new Date(tx.date).toLocaleDateString(undefined, { 
                                                        year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' 
                                                    })}
                                                </small>
                                                <span>•</span>
                                                <small className="tx-ref">Ref: {tx.reference.slice(-8).toUpperCase()}</small>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="tx-center">
                                        <span className="status-chip" style={getStatusStyle(tx.status)}>
                                            {tx.status}
                                        </span>
                                    </div>

                                    <div className="tx-right">
                                        <span className={`tx-amount-text ${tx.type === 'repayment' ? 'text-success' : ''}`}>
                                            {tx.type === 'repayment' ? '-' : '+'}₦{tx.amount.toLocaleString()}
                                        </span>
                                        <span className="tx-type-text">{tx.type.replace(/_/g, ' ')}</span>
                                    </div>
                                </div>
                            );
                        })
                    ) : (
                        <div className="tx-empty">
                            <Clock size={48} opacity={0.2} />
                            <h3>No transactions found</h3>
                            <p>Try adjusting your search or filters.</p>
                        </div>
                    )}
                </div>
            </section>
        </div>
    );
};

export default RetailerTransactions;
