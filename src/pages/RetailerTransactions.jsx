import React, { useState, useEffect, useMemo } from 'react';
import { createPortal } from 'react-dom';
import api from '../services/api';
import './RetailerTransactions.css';
import { 
    Search, 
    Filter, 
    TrendingUp, 
    Clock, 
    ChevronRight, 
    DollarSign, 
    CreditCard, 
    ShoppingBag,
    ArrowDownLeft,
    ArrowUpRight,
    Zap,
    Receipt,
    X,
    Package,
    ShieldCheck,
    CheckCircle,
    AlertCircle,
    Phone,
    MapPin,
    Store,
    Check,
    User,
    Calendar,
    Key,
    Lock,
    Eye,
    ChevronDown,
    SlidersHorizontal,
    Scale,
    BookOpen,
    PackageCheck,
    Award,
    Camera,
    MessageSquare,
    Wallet,
    FileText,
    Trash2
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useToast } from '../context/ToastContext';
import ContractModal from '../components/ContractModal';
import { generateDeedOfUndertaking, generateMurabahaContract } from '../utils/contractTemplates';

const RetailerTransactions = () => {
    const navigate = useNavigate();
    const { addToast } = useToast();

    // Data States
    const [orders, setOrders] = useState([]);
    const [aaps, setAAPs] = useState([]);
    const [transactions, setTransactions] = useState([]);
    const [profile, setProfile] = useState(null);
    const [loading, setLoading] = useState(true);

    // Filter & Search States
    const [activeTab, setActiveTab] = useState('all'); // 'all', 'orders', 'aap', 'ledger'
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('all'); // 'all', 'active', 'completed', 'cancelled'
    const [sortBy, setSortBy] = useState('newest'); // 'newest', 'oldest', 'amount_high', 'amount_low'

    // Details Modal State
    const [selectedItem, setSelectedItem] = useState(null);
    const [modalLoading, setModalLoading] = useState(false);
    const [otpInput, setOtpInput] = useState('');
    const [contractModalOpen, setContractModalOpen] = useState(false);
    const [contractType, setContractType] = useState('undertaking');
    const [activeContractData, setActiveContractData] = useState(null);
    const [signingContract, setSigningContract] = useState(false);
    const [cancellingContract, setCancellingContract] = useState(false);
    const [actionLoadingId, setActionLoadingId] = useState(null);

    const fetchData = async () => {
        setLoading(true);
        try {
            const [ordersRes, aapRes, txRes, profileRes] = await Promise.all([
                api.get('/orders/myorders').catch(() => ({ data: [] })),
                api.get('/aap/retailer/mine').catch(() => ({ data: [] })),
                api.get('/transactions/retailer').catch(() => ({ data: [] })),
                api.get('/retailer/profile').catch(() => ({ data: null }))
            ]);

            setOrders(ordersRes.data || []);
            setAAPs(aapRes.data || []);
            setTransactions(txRes.data || []);
            setProfile(profileRes.data || null);
        } catch (error) {
            console.error('Failed to fetch history data', error);
            addToast('Failed to load complete activity history', 'error');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    // Summary KPIs
    const stats = useMemo(() => {
        const totalRepaid = transactions
            .filter(t => ['repayment', 'admin_partial_payment', 'admin_cash_confirmation'].includes(t.type) && (t.status === 'success' || !t.status))
            .reduce((acc, t) => acc + (t.amount || 0), 0);

        const activeDebt = profile?.usedCredit || 0;

        const activeOrdersCount = orders.filter(o => 
            !o.isPaid && ['pending_vendor', 'ready_for_pickup', 'vendor_settled', 'goods_received'].includes(o.status)
        ).length;

        const activeAAPsCount = aaps.filter(a => 
            !a.isPaid && ['trader_initiated', 'awaiting_retailer_confirm', 'pending_admin_approval', 'fund_disbursed', 'pending_murabaha_acceptance', 'murabaha_accepted', 'delivered', 'received'].includes(a.status)
        ).length;

        return {
            totalOrders: orders.length + aaps.length,
            activeCount: activeOrdersCount + activeAAPsCount,
            totalRepaid,
            activeDebt
        };
    }, [orders, aaps, transactions, profile]);

    // Unified Normalized List
    const unifiedList = useMemo(() => {
        let items = [];

        if (activeTab === 'all' || activeTab === 'orders') {
            const normalizedOrders = orders.map(o => {
                const total = o.totalRepaymentAmount || o.itemsPrice || 0;
                const paid = o.amountPaid || 0;
                const rem = (o.remainingBalance !== undefined && o.remainingBalance !== null)
                    ? o.remainingBalance
                    : Math.max(0, total - paid);
                const isPartiallyPaid = !o.isPaid && paid > 0 && rem > 0;
                return {
                    id: o._id,
                    type: 'order',
                    typeLabel: 'Marketplace Order',
                    date: new Date(o.createdAt),
                    title: o.orderItems?.[0]?.name ? `${o.orderItems[0].name}${o.orderItems.length > 1 ? ` + ${o.orderItems.length - 1} more` : ''}` : 'Bulk Purchase',
                    subtitle: o.vendor?.businessName || 'Amana Vendor',
                    status: o.status,
                    amount: total,
                    totalDebt: total,
                    amountPaid: paid,
                    remainingBalance: rem,
                    isPartiallyPaid,
                    isPaid: o.isPaid,
                    dueDate: o.dueDate,
                    pickupCode: o.pickupCode,
                    installments: o.installments || [],
                    raw: o
                };
            });
            items = items.concat(normalizedOrders);
        }

        if (activeTab === 'all' || activeTab === 'aap') {
            const normalizedAAPs = aaps.map(a => {
                const isPreMurabaha = ['trader_initiated', 'draft', 'awaiting_retailer_confirm', 'pending_admin_approval', 'fund_disbursed'].includes(a.status);
                const total = isPreMurabaha ? (a.purchasePrice || a.estimatedAgentBudget || 0) : (a.totalRetailerCost || a.purchasePrice || 0);
                const paid = a.amountPaid || 0;
                const rem = (a.remainingBalance !== undefined && a.remainingBalance !== null)
                    ? a.remainingBalance
                    : Math.max(0, total - paid);
                const isPartiallyPaid = !a.isPaid && paid > 0 && rem > 0;
                return {
                    id: a._id,
                    type: 'aap',
                    typeLabel: 'Assisted Purchase',
                    date: new Date(a.createdAt),
                    title: a.productName || a.traderRequestNote || 'Goods Purchase Request',
                    subtitle: a.agent?.name ? `Agent: ${a.agent.name}` : 'Assigned Market Agent',
                    status: a.status,
                    isPreMurabaha,
                    amount: total,
                    totalDebt: total,
                    amountPaid: paid,
                    remainingBalance: rem,
                    isPartiallyPaid,
                    amountLabel: isPreMurabaha ? 'Wholesale Price' : (isPartiallyPaid ? 'Remaining Due' : 'Total Amount'),
                    isPaid: a.isPaid,
                    dueDate: a.dueDate,
                    pickupCode: a.pickupCode,
                    installments: a.installments || [],
                    raw: a
                };
            });
            items = items.concat(normalizedAAPs);
        }

        if (activeTab === 'all' || activeTab === 'ledger') {
            const normalizedTxs = transactions.map(t => {
                const isPartial = t.type === 'admin_partial_payment' || t.metadata?.isPartial;
                const isCash = t.type === 'admin_cash_confirmation' || t.channel === 'cash';
                const isRepay = ['repayment', 'admin_partial_payment', 'admin_cash_confirmation'].includes(t.type);
                let typeLabel = isPartial ? 'Partial Repayment' : (isCash ? 'Cash Settlement' : (isRepay ? 'Repayment' : (['inventory_financing_disbursement', 'aap_credit_lock'].includes(t.type) ? 'Financing Disbursement' : 'Ledger Event')));
                return {
                    id: t._id,
                    type: 'tx',
                    typeLabel,
                    date: new Date(t.date || t.createdAt),
                    title: t.description || 'Ledger Transaction',
                    subtitle: t.reference ? `Ref: #${t.reference.slice(-8).toUpperCase()}` : 'Financial Event',
                    status: t.status,
                    amount: t.amount || 0,
                    isCredit: isRepay,
                    isPaid: true,
                    raw: t
                };
            });
            items = items.concat(normalizedTxs);
        }

        // Apply Status Filter
        if (statusFilter !== 'all') {
            items = items.filter(item => {
                if (statusFilter === 'active') {
                    if (item.type === 'order') {
                        return !item.isPaid && ['pending_vendor', 'ready_for_pickup', 'vendor_settled', 'goods_received'].includes(item.status);
                    }
                    if (item.type === 'aap') {
                        return !item.isPaid && ['trader_initiated', 'awaiting_retailer_confirm', 'pending_admin_approval', 'fund_disbursed', 'pending_murabaha_acceptance', 'murabaha_accepted', 'delivered', 'received'].includes(item.status);
                    }
                    return item.status === 'pending';
                }
                if (statusFilter === 'completed') {
                    if (item.type === 'order') {
                        return item.isPaid || ['completed', 'repaid'].includes(item.status);
                    }
                    if (item.type === 'aap') {
                        return item.isPaid || ['completed', 'received'].includes(item.status);
                    }
                    return ['success', 'completed'].includes(item.status);
                }
                if (statusFilter === 'cancelled') {
                    if (item.type === 'order') {
                        return item.status === 'cancelled';
                    }
                    if (item.type === 'aap') {
                        return ['cancelled', 'declined', 'cancellation_requested'].includes(item.status);
                    }
                    return ['failed', 'cancelled'].includes(item.status);
                }
                return true;
            });
        }

        // Apply Search Term
        if (searchTerm.trim()) {
            const q = searchTerm.toLowerCase().trim();
            items = items.filter(item => {
                const titleMatch = item.title?.toLowerCase().includes(q);
                const subtitleMatch = item.subtitle?.toLowerCase().includes(q);
                const idMatch = item.id?.toLowerCase().includes(q);
                const statusMatch = item.status?.toLowerCase().includes(q);
                return titleMatch || subtitleMatch || idMatch || statusMatch;
            });
        }

        // Apply Sorting
        items.sort((a, b) => {
            if (sortBy === 'newest') return b.date - a.date;
            if (sortBy === 'oldest') return a.date - b.date;
            if (sortBy === 'amount_high') return b.amount - a.amount;
            if (sortBy === 'amount_low') return a.amount - b.amount;
            return b.date - a.date;
        });

        return items;
    }, [orders, aaps, transactions, activeTab, statusFilter, searchTerm, sortBy]);

    // View Details handler
    const handleOpenDetails = async (item) => {
        setSelectedItem(item);
        setOtpInput('');
        if (item.type === 'order') {
            setModalLoading(true);
            try {
                const res = await api.get(`/orders/${item.id}`);
                setSelectedItem(prev => prev && prev.id === item.id ? { ...prev, raw: res.data } : prev);
            } catch (err) {
                console.warn('Could not refresh latest order payload', err);
            } finally {
                setModalLoading(false);
            }
        } else if (item.type === 'aap') {
            setModalLoading(true);
            try {
                const res = await api.get(`/aap/${item.id}`);
                setSelectedItem(prev => prev && prev.id === item.id ? { ...prev, raw: res.data } : prev);
            } catch (err) {
                console.warn('Could not refresh latest AAP payload', err);
            } finally {
                setModalLoading(false);
            }
        }
    };

    // Modal Actions
    const handleConfirmOrderReceipt = async (orderId) => {
        try {
            await api.put(`/orders/${orderId}/received`);
            addToast('Goods confirmed as received! Added to your repayment balance.', 'success');
            setSelectedItem(null);
            fetchData();
        } catch (error) {
            addToast(error.response?.data?.message || 'Failed to confirm receipt', 'error');
        }
    };

    const handleCancelOrder = async (orderId) => {
        if (!window.confirm('Are you sure you want to cancel this order? Goods will be released back to the vendor and your credit limit will be restored immediately.')) {
            return;
        }
        try {
            await api.put(`/orders/${orderId}/cancel`, { reason: 'Cancelled by trader before pickup' });
            addToast('Order cancelled successfully. Credit restored.', 'info');
            setSelectedItem(null);
            fetchData();
        } catch (error) {
            addToast(error.response?.data?.message || 'Failed to cancel order', 'error');
        }
    };

    const openContractModal = (type, item) => {
        setSelectedItem(item);
        setContractType(type);
        const source = item.raw || item;
        const data = type === 'undertaking' 
            ? generateDeedOfUndertaking({
                ...source,
                productName: source.productName || source.items?.map(i => `${i.name} (x${i.qty})`).join(', ') || source.orderItems?.map(i => `${i.name} (x${i.qty})`).join(', ') || 'Wholesale Stock',
                purchasePrice: source.purchasePrice || source.itemsPrice,
                undertakingSignedAt: source.undertakingSignedAt || source.retailerConfirmedAt || source.createdAt
              })
            : generateMurabahaContract({
                ...source,
                productName: source.productName || source.items?.map(i => `${i.name} (x${i.qty})`).join(', ') || source.orderItems?.map(i => `${i.name} (x${i.qty})`).join(', ') || 'Wholesale Stock',
                purchasePrice: source.purchasePrice || source.itemsPrice,
                totalRetailerCost: source.totalRetailerCost || source.totalRepaymentAmount,
                murabahaSignedAt: source.murabahaSignedAt || source.murabahaAcceptedAt || source.vendorSettledAt,
                receivedAt: source.receivedAt || source.goodsReceivedAt
              });
        setActiveContractData(data);
        setContractModalOpen(true);
    };

    const handleSignAAPUndertaking = async (aapId) => {
        setSigningContract(true);
        try {
            await api.put(`/aap/${aapId}/confirm`);
            addToast("Deed of Undertaking (Wa'd) executed successfully!", 'success');
            setContractModalOpen(false);
            setSelectedItem(null);
            fetchData();
        } catch (error) {
            addToast(error.response?.data?.message || 'Action failed', 'error');
        } finally {
            setSigningContract(false);
        }
    };

    const handleAcceptAAPSale = async (aapId) => {
        setSigningContract(true);
        try {
            await api.put(`/aap/${aapId}/accept-murabaha`);
            addToast('Murabaha Contract concluded! Awaiting delivery.', 'success');
            setContractModalOpen(false);
            setSelectedItem(null);
            fetchData();
        } catch (error) {
            addToast(error.response?.data?.message || 'Action failed', 'error');
        } finally {
            setSigningContract(false);
        }
    };

    const handleConfirmAAPReceipt = async (aapId) => {
        if (!otpInput || otpInput.trim().length !== 6) {
            addToast('Please enter the 6-digit OTP provided by the agent', 'warning');
            return;
        }
        try {
            await api.put(`/aap/${aapId}/receive`, { pickupCode: otpInput.trim() });
            addToast('Goods received successfully!', 'success');
            setSelectedItem(null);
            fetchData();
        } catch (error) {
            addToast(error.response?.data?.message || 'Invalid or expired OTP', 'error');
        }
    };

    const handleCancelAAP = async (aapId) => {
        setActionLoadingId(aapId);
        setCancellingContract(true);
        try {
            await api.put(`/aap/${aapId}/cancel`, { reason: 'Cancelled by trader' });
            addToast('Purchase request cancelled', 'info');
            setContractModalOpen(false);
            setSelectedItem(null);
            fetchData();
        } catch (error) {
            addToast(error.response?.data?.message || 'Failed to cancel request', 'error');
        } finally {
            setActionLoadingId(null);
            setCancellingContract(false);
        }
    };

    const handleDeclineAAP = async (aapId) => {
        if (!window.confirm('Are you sure you want to decline this purchase offer?')) return;
        setActionLoadingId(aapId);
        setCancellingContract(true);
        try {
            await api.put(`/aap/${aapId}/decline`, { reason: 'Declined by retailer' });
            addToast('Offer declined', 'info');
            setContractModalOpen(false);
            setSelectedItem(null);
            fetchData();
        } catch (error) {
            addToast(error.response?.data?.message || 'Failed to decline offer', 'error');
        } finally {
            setActionLoadingId(null);
            setCancellingContract(false);
        }
    };

    const getStatusBadge = (item) => {
        const { status, type, isPaid, isPartiallyPaid, amountPaid } = item;

        if (status === 'cancelled' || status === 'declined' || status === 'failed') {
            return <span className="status-chip chip-danger">Cancelled</span>;
        }
        if (isPaid || status === 'completed' || status === 'repaid') {
            return <span className="status-chip chip-success">Completed</span>;
        }
        if (isPartiallyPaid || (amountPaid > 0 && !isPaid)) {
            return (
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '3px' }}>
                    <span className="status-chip chip-info" style={{ background: 'rgba(59, 130, 246, 0.14)', color: '#3b82f6', border: '1px solid rgba(59, 130, 246, 0.3)', fontWeight: 700 }}>
                        Partially Paid
                    </span>
                    <span style={{ fontSize: '0.68rem', color: '#10b981', fontWeight: 700 }}>
                        ₦{(amountPaid || 0).toLocaleString()} paid
                    </span>
                </div>
            );
        }
        if (type === 'order') {
            switch (status) {
                case 'pending_vendor': return <span className="status-chip chip-warning">Pending Vendor</span>;
                case 'ready_for_pickup': return <span className="status-chip chip-info">Ready for Pickup</span>;
                case 'vendor_settled': return <span className="status-chip chip-accent">With Agent</span>;
                case 'goods_received': return <span className="status-chip chip-primary">Goods Received</span>;
                default: return <span className="status-chip chip-neutral">{status?.replace(/_/g, ' ')}</span>;
            }
        }
        if (type === 'aap') {
            switch (status) {
                case 'trader_initiated': return <span className="status-chip chip-info">Dispatched to Agent</span>;
                case 'awaiting_retailer_confirm': return <span className="status-chip chip-warning">Sign Undertaking</span>;
                case 'pending_admin_approval': return <span className="status-chip chip-info">Admin Review</span>;
                case 'fund_disbursed': return <span className="status-chip chip-accent">Purchasing Goods</span>;
                case 'pending_murabaha_acceptance': return <span className="status-chip chip-warning">Sign Murabaha</span>;
                case 'murabaha_accepted': return <span className="status-chip chip-accent">Murabaha Concluded</span>;
                case 'delivered': return <span className="status-chip chip-primary">Delivered (Enter OTP)</span>;
                case 'received': return <span className="status-chip chip-success">Goods Received</span>;
                default: return <span className="status-chip chip-neutral">{status?.replace(/_/g, ' ')}</span>;
            }
        }
        return <span className="status-chip chip-neutral">{status}</span>;
    };

    const getTypeIcon = (type, txType) => {
        if (type === 'order') {
            return <div className="type-icon-box bg-blue"><ShoppingBag size={20} /></div>;
        }
        if (type === 'aap') {
            return <div className="type-icon-box bg-amber"><Zap size={20} /></div>;
        }
        if (txType === 'repayment') {
            return <div className="type-icon-box bg-green"><ArrowUpRight size={20} /></div>;
        }
        return <div className="type-icon-box bg-purple"><ArrowDownLeft size={20} /></div>;
    };

    return (
        <div className="history-hub-container animate-fade-in">
            {/* Header Area */}
            <div className="history-header">
                <div className="header-left">
                    <div className="header-icon-badge">
                        <Receipt size={24} />
                    </div>
                    <div>
                        <h1 className="header-title">Orders & Activity History</h1>
                        <p className="header-subtitle">
                            Track all marketplace orders, agent purchases, repayments, and contract lifecycle.
                        </p>
                    </div>
                </div>
                <div className="header-actions">
                    <button className="new-purchase-btn" onClick={() => navigate('/marketplace')}>
                        <ShoppingBag size={18} />
                        <span>Marketplace</span>
                    </button>
                </div>
            </div>

            {/* KPI Summary Row */}
            <div className="kpi-grid">
                <div className="kpi-card">
                    <div className="kpi-icon-box bg-blue">
                        <Package size={22} />
                    </div>
                    <div className="kpi-content">
                        <span className="kpi-label">Total Purchases</span>
                        <span className="kpi-val">{stats.totalOrders}</span>
                    </div>
                </div>

                <div className="kpi-card">
                    <div className="kpi-icon-box bg-amber">
                        <Clock size={22} />
                    </div>
                    <div className="kpi-content">
                        <span className="kpi-label">Active / In Progress</span>
                        <span className="kpi-val text-amber">{stats.activeCount}</span>
                    </div>
                </div>

                <div className="kpi-card">
                    <div className="kpi-icon-box bg-green">
                        <CheckCircle size={22} />
                    </div>
                    <div className="kpi-content">
                        <span className="kpi-label">Total Repaid</span>
                        <span className="kpi-val text-green">₦{stats.totalRepaid.toLocaleString()}</span>
                    </div>
                </div>

                <div className="kpi-card">
                    <div className="kpi-icon-box bg-red">
                        <CreditCard size={22} />
                    </div>
                    <div className="kpi-content">
                        <span className="kpi-label">Outstanding Balance</span>
                        <span className="kpi-val text-red">₦{stats.activeDebt.toLocaleString()}</span>
                    </div>
                </div>
            </div>

            {/* Main Tabs Navigation */}
            <div className="history-tabs-container">
                <div className="history-tabs">
                    <button 
                        className={`tab-btn ${activeTab === 'all' ? 'active' : ''}`}
                        onClick={() => setActiveTab('all')}
                    >
                        <span>All Activity</span>
                        <span className="tab-count">{orders.length + aaps.length + transactions.length}</span>
                    </button>
                    <button 
                        className={`tab-btn ${activeTab === 'orders' ? 'active' : ''}`}
                        onClick={() => setActiveTab('orders')}
                    >
                        <ShoppingBag size={15} />
                        <span>Marketplace Orders</span>
                        <span className="tab-count">{orders.length}</span>
                    </button>
                    <button 
                        className={`tab-btn ${activeTab === 'aap' ? 'active' : ''}`}
                        onClick={() => setActiveTab('aap')}
                    >
                        <Zap size={15} />
                        <span>Assisted Purchases</span>
                        <span className="tab-count">{aaps.length}</span>
                    </button>
                    <button 
                        className={`tab-btn ${activeTab === 'ledger' ? 'active' : ''}`}
                        onClick={() => setActiveTab('ledger')}
                    >
                        <DollarSign size={15} />
                        <span>Payments & Ledger</span>
                        <span className="tab-count">{transactions.length}</span>
                    </button>
                </div>
            </div>

            {/* Filter & Search Bar */}
            <div className="controls-bar">
                <div className="search-input-wrapper">
                    <Search size={18} className="search-icon" />
                    <input 
                        type="text" 
                        placeholder="Search by product, vendor, agent, or transaction ID..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                    {searchTerm && (
                        <button className="clear-search-btn" onClick={() => setSearchTerm('')}>
                            <X size={16} />
                        </button>
                    )}
                </div>

                <div className="filter-dropdowns">
                    <div className="select-wrapper">
                        <select 
                            value={statusFilter} 
                            onChange={(e) => setStatusFilter(e.target.value)}
                            className="styled-select"
                        >
                            <option value="all">All Statuses</option>
                            <option value="active">Active / In Progress</option>
                            <option value="completed">Completed / Settled</option>
                            <option value="cancelled">Cancelled / Declined</option>
                        </select>
                    </div>

                    <div className="select-wrapper">
                        <select 
                            value={sortBy} 
                            onChange={(e) => setSortBy(e.target.value)}
                            className="styled-select"
                        >
                            <option value="newest">Newest First</option>
                            <option value="oldest">Oldest First</option>
                            <option value="amount_high">Amount: High to Low</option>
                            <option value="amount_low">Amount: Low to High</option>
                        </select>
                    </div>
                </div>
            </div>

            {/* Items List */}
            <div className="history-content-list">
                {loading ? (
                    <div className="history-loading-box">
                        <div className="spinner-large" />
                        <p>Loading your activity records...</p>
                    </div>
                ) : unifiedList.length > 0 ? (
                    <div className="history-items-grid">
                        {unifiedList.map((item) => (
                            <div 
                                key={`${item.type}-${item.id}`} 
                                className="history-card hover-glow"
                                onClick={() => handleOpenDetails(item)}
                            >
                                <div className="card-top-row">
                                    <div className="card-type-row">
                                        {getTypeIcon(item.type, item.raw?.type)}
                                        <div className="type-meta">
                                            <span className="type-tag">{item.typeLabel}</span>
                                            <span className="ref-number">#{item.id.slice(-8).toUpperCase()}</span>
                                        </div>
                                    </div>
                                    <div className="card-status-col">
                                        {getStatusBadge(item)}
                                    </div>
                                </div>

                                <div className="card-body-row">
                                    <div className="card-main-info">
                                        <h3 className="item-title">{item.title}</h3>
                                        <p className="item-subtitle">{item.subtitle}</p>
                                        
                                        {item.pickupCode && ['ready_for_pickup', 'vendor_settled', 'delivered'].includes(item.status) && (
                                            <div className="pickup-otp-pill">
                                                <Key size={13} />
                                                <span>Pickup OTP: <strong>{item.pickupCode}</strong></span>
                                            </div>
                                        )}
                                    </div>

                                    <div className="card-price-info">
                                        <span className="amount-label">
                                            {item.type === 'tx' 
                                                ? (item.isCredit ? 'Amount Repaid' : 'Disbursement')
                                                : (item.isPartiallyPaid ? 'Remaining Balance' : (item.amountLabel || 'Total Cost'))}
                                        </span>
                                        <span className={`amount-value ${item.type === 'tx' && item.isCredit ? 'text-green' : 'text-primary'}`}>
                                            {item.type === 'tx' && item.isCredit ? '-' : ''}₦{(item.isPartiallyPaid ? item.remainingBalance : item.amount).toLocaleString()}
                                        </span>
                                        {item.isPartiallyPaid && item.totalDebt && (
                                            <div style={{ fontSize: '0.72rem', color: 'var(--color-text-secondary)', marginTop: '2px' }}>
                                                of ₦{item.totalDebt.toLocaleString()} facility
                                            </div>
                                        )}

                                        {item.dueDate && !item.isPaid && (
                                            <div className={`due-countdown ${new Date(item.dueDate) < new Date() ? 'overdue' : ''}`}>
                                                <Calendar size={12} />
                                                <span>{new Date(item.dueDate) < new Date() ? 'Overdue: ' : 'Due: '}{new Date(item.dueDate).toLocaleDateString()}</span>
                                            </div>
                                        )}
                                    </div>
                                </div>

                                <div className="card-footer-row">
                                    <span className="card-date">
                                        <Clock size={13} />
                                        <span>{item.date.toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })}</span>
                                    </span>

                                    <div className="card-action-group">
                                        {/* High-priority quick actions */}
                                        {item.type === 'aap' && item.status === 'awaiting_retailer_confirm' && (
                                            <button 
                                                className="quick-action-pill pill-undertaking"
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    openContractModal('undertaking', item);
                                                }}
                                            >
                                                <Scale size={13} />
                                                <span>Sign Undertaking</span>
                                            </button>
                                        )}

                                        {item.type === 'aap' && item.status === 'pending_murabaha_acceptance' && (
                                            <button 
                                                className="quick-action-pill pill-murabaha"
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    openContractModal('murabaha', item);
                                                }}
                                            >
                                                <BookOpen size={13} />
                                                <span>Sign Murabaha</span>
                                            </button>
                                        )}

                                        {item.type === 'aap' && item.status === 'delivered' && (
                                            <button 
                                                className="quick-action-pill pill-otp"
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    handleOpenDetails(item);
                                                }}
                                            >
                                                <Key size={13} />
                                                <span>Enter OTP</span>
                                            </button>
                                        )}

                                        {item.type === 'order' && item.status === 'vendor_settled' && (
                                            <button 
                                                className="quick-action-pill pill-receive"
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    handleOpenDetails(item);
                                                }}
                                            >
                                                <CheckCircle size={13} />
                                                <span>Confirm Receipt</span>
                                            </button>
                                        )}

                                        <button 
                                            className="view-details-btn"
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                handleOpenDetails(item);
                                            }}
                                        >
                                            <span>Details</span>
                                            <ChevronRight size={14} />
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="empty-history-box">
                        <ShoppingBag size={54} className="empty-icon" />
                        <h3>No activity records found</h3>
                        <p>No orders or transactions matched your current search and filter settings.</p>
                        <button 
                            className="reset-filters-btn"
                            onClick={() => {
                                setSearchTerm('');
                                setStatusFilter('all');
                                setActiveTab('all');
                            }}
                        >
                            Reset Filters
                        </button>
                    </div>
                )}
            </div>

            {/* ========================================================= */}
            {/* RICH DETAILS MODAL */}
            {/* ========================================================= */}
            {selectedItem && createPortal(
                <div className="modal-backdrop-luxury animate-fade-in" onClick={() => setSelectedItem(null)}>
                    <div className="modal-card-luxury animate-scale-up" onClick={e => e.stopPropagation()}>
                        <div className="mobile-sheet-handle" />
                        
                        {/* Modal Header */}
                        <div className="modal-luxury-header">
                            <div>
                                <div className="modal-badge-row">
                                    <span className="type-badge-pill">{selectedItem.typeLabel}</span>
                                    <span className="modal-ref-id">#{selectedItem.id.toUpperCase()}</span>
                                </div>
                                <h2 className="modal-item-title">{selectedItem.title}</h2>
                            </div>
                            <button className="modal-close-btn" onClick={() => setSelectedItem(null)}>
                                <X size={20} />
                            </button>
                        </div>

                        {/* Modal Body */}
                        <div className="modal-luxury-body custom-scrollbar">
                            
                            {/* Status Banner */}
                            <div className="modal-status-banner">
                                <div className="banner-left">
                                    {getStatusBadge(selectedItem)}
                                    <span className="banner-date">
                                        Placed on {selectedItem.date.toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' })}
                                    </span>
                                </div>
                            </div>

                            {/* Detailed Cancellation Dossier Banner */}
                            {(selectedItem.status === 'cancelled' || selectedItem.status === 'declined' || selectedItem.status === 'cancellation_requested') && (
                                <div className="cancellation-dossier-card">
                                    <div className="dossier-header">
                                        <div className="dossier-icon-bg">
                                            <AlertCircle size={24} color={selectedItem.status === 'cancellation_requested' ? '#f59e0b' : '#ef4444'} />
                                        </div>
                                        <div className="dossier-header-text">
                                            <h4>{selectedItem.status === 'cancellation_requested' ? 'Cancellation Under Admin Review' : selectedItem.status === 'declined' ? 'Request Declined' : 'Transaction Cancelled & Voided'}</h4>
                                            <span className="dossier-timestamp">
                                                {selectedItem.status === 'cancellation_requested' ? 'Requested on ' : 'Cancelled on '}
                                                {new Date(selectedItem.raw.cancelledAt || selectedItem.raw.declinedAt || selectedItem.raw.updatedAt || selectedItem.date).toLocaleString(undefined, { dateStyle: 'medium', timeStyle: 'short' })}
                                            </span>
                                        </div>
                                    </div>

                                    {/* Initiated By Row */}
                                    <div className="dossier-meta-row">
                                        <span className="d-label">Initiated By:</span>
                                        <span className="d-val">
                                            {selectedItem.raw.cancelledBy?.name 
                                                ? `${selectedItem.raw.cancelledBy.name} (${selectedItem.raw.cancelledBy.role ? (selectedItem.raw.cancelledBy.role.charAt(0).toUpperCase() + selectedItem.raw.cancelledBy.role.slice(1)) : 'Authorized'})`
                                                : (selectedItem.raw.declinedBy?.name 
                                                    ? `${selectedItem.raw.declinedBy.name} (${selectedItem.raw.declinedBy.role ? (selectedItem.raw.declinedBy.role.charAt(0).toUpperCase() + selectedItem.raw.declinedBy.role.slice(1)) : 'Authorized'})`
                                                    : 'Trader (You)')}
                                        </span>
                                    </div>

                                    {/* Stated Reason Callout */}
                                    <div className="dossier-reason-callout">
                                        <span className="d-reason-title">{selectedItem.status === 'declined' ? 'Stated Reason for Declining' : 'Stated Reason for Cancellation'}</span>
                                        <p className="d-reason-quote">
                                            "{selectedItem.raw.cancelReason || selectedItem.raw.declineReason || selectedItem.raw.rejectionReason || 'Order was cancelled prior to physical stock collection. Zero funds were disbursed and no liability exists.'}"
                                        </p>
                                    </div>

                                    {/* Resolution Pillars */}
                                    <div className="dossier-resolution-grid">
                                        <div className="dossier-pillar">
                                            <div className="pillar-icon text-emerald bg-emerald-light">
                                                <CreditCard size={18} />
                                            </div>
                                            <div className="pillar-body">
                                                <h5>Credit Line Restored</h5>
                                                <p>₦{(selectedItem.raw.totalRepaymentAmount || selectedItem.raw.totalRetailerCost || selectedItem.amount)?.toLocaleString()} credit allocation unlocked and restored to your available credit balance.</p>
                                            </div>
                                        </div>

                                        <div className="dossier-pillar">
                                            <div className="pillar-icon text-blue bg-blue-light">
                                                <Package size={18} />
                                            </div>
                                            <div className="pillar-body">
                                                <h5>Inventory Released</h5>
                                                <p>Reserved goods safely returned to vendor stock catalog. Any verification OTP is invalidated.</p>
                                            </div>
                                        </div>

                                        <div className="dossier-pillar">
                                            <div className="pillar-icon text-purple bg-purple-light">
                                                <ShieldCheck size={18} />
                                            </div>
                                            <div className="pillar-body">
                                                <h5>Sharia Dissolution</h5>
                                                <p>Murabaha dissolved prior to physical transfer (Qabd). ₦0 profit markup, zero debt, and zero penalty.</p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}

                         

                            {/* ================================================= */}
                            {/* MARKETPLACE ORDER SPECIFICS */}
                            {/* ================================================= */}
                            {selectedItem.type === 'order' && selectedItem.raw && (
                                <>
                                    {/* Visual Stepper (only if active) */}
                                    {selectedItem.status !== 'cancelled' && (
                                        <div className="stepper-section">
                                            <h4 className="section-subtitle">Order Lifecycle Progression</h4>
                                            <div className="stepper-track">
                                                {[
                                                    { label: 'Order Placed', desc: 'Received' },
                                                    { label: 'Vendor Confirmed', desc: 'Ready for Pickup' },
                                                    { label: 'Settled by Agent', desc: 'Goods with Agent' },
                                                    { label: 'Goods Received', desc: 'Delivered to Shop' },
                                                    { label: 'Fully Repaid', desc: 'Contract Settled' }
                                                ].map((step, idx) => {
                                                    const currentIdx = (() => {
                                                        if (selectedItem.isPaid || selectedItem.status === 'completed' || selectedItem.status === 'repaid') return 4;
                                                        if (selectedItem.status === 'goods_received') return 3;
                                                        if (selectedItem.status === 'vendor_settled') return 2;
                                                        if (selectedItem.status === 'ready_for_pickup') return 1;
                                                        return 0;
                                                    })();
                                                    const isPassed = idx <= currentIdx;
                                                    const isCurrent = idx === currentIdx;

                                                    return (
                                                        <div key={idx} className={`step-item ${isPassed ? 'passed' : ''} ${isCurrent ? 'current' : ''}`}>
                                                            <div className="step-circle">
                                                                {isPassed ? <Check size={14} /> : <span>{idx + 1}</span>}
                                                            </div>
                                                            <div className="step-info">
                                                                <span className="step-title">{step.label}</span>
                                                                <span className="step-desc">{step.desc}</span>
                                                            </div>
                                                        </div>
                                                    );
                                                })}
                                            </div>
                                        </div>
                                    )}

                                    {/* Order Items Table */}
                                    <div className="modal-items-section">
                                        <h4 className="section-subtitle">Purchased Items ({selectedItem.raw.items?.length || 0})</h4>
                                        <div className="modal-items-list">
                                            {(selectedItem.raw.items || []).map((item, idx) => (
                                                <div key={idx} className="modal-item-row">
                                                    <div className="item-row-left">
                                                        <div className="item-thumb-box">
                                                            {item.product?.image ? (
                                                                <img src={item.product.image} alt={item.product?.name || item.name} />
                                                            ) : (
                                                                <Package size={20} />
                                                            )}
                                                        </div>
                                                        <div className="item-meta">
                                                            <span className="item-name">{item.product?.name || item.name}</span>
                                                            <span className="item-qty-price">
                                                                Qty: {item.quantity} × ₦{(item.price || 0).toLocaleString()}
                                                            </span>
                                                        </div>
                                                    </div>
                                                    <div className="item-row-right">
                                                        <span className="item-subtotal">₦{((item.price || 0) * (item.quantity || 1)).toLocaleString()}</span>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>

                                    {/* Financial Breakdown */}
                                    {(selectedItem.status === 'cancelled' || selectedItem.status === 'declined' || selectedItem.status === 'cancellation_requested') ? (
                                        <div className="financial-breakdown-card nullified-card">
                                            <div className="breakdown-header-flex">
                                                <h4 className="section-subtitle">Financial Statement (Nullified)</h4>
                                                <span className="nullified-tag">ZERO LIABILITY</span>
                                            </div>
                                            <div className="breakdown-rows">
                                                <div className="b-row">
                                                    <span>Wholesale Goods Value</span>
                                                    <span className="text-strike">₦{(selectedItem.raw.itemsPrice || selectedItem.amount).toLocaleString()}</span>
                                                </div>
                                                <div className="b-row">
                                                    <span>Murabaha Markup Tier</span>
                                                    <span className="text-green">Waived (₦0.00)</span>
                                                </div>
                                                <div className="b-row">
                                                    <span>Repayment Schedule</span>
                                                    <span className="text-danger">Nullified</span>
                                                </div>
                                                <div className="b-divider" />
                                                <div className="b-row total">
                                                    <div>
                                                        <span>Total Repayment Liability</span>
                                                        <span className="sub-note">Zero obligation recorded</span>
                                                    </div>
                                                    <span className="text-green font-bold">₦0.00</span>
                                                </div>
                                            </div>
                                            <div className="nullified-guarantee-note">
                                                <CheckCircle size={16} color="#10b981" />
                                                <span>Order cancelled. No funds or credit hold remains on your account.</span>
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="financial-breakdown-card">
                                            <h4 className="section-subtitle">Financial Breakdown</h4>
                                            <div className="breakdown-rows">
                                                <div className="b-row">
                                                    <span>Subtotal (Items)</span>
                                                    <span>₦{(selectedItem.raw.itemsPrice || 0).toLocaleString()}</span>
                                                </div>
                                                <div className="b-row">
                                                    <span>Delivery Fee</span>
                                                    <span>₦{(selectedItem.raw.deliveryFee || 0).toLocaleString()}</span>
                                                </div>
                                                {selectedItem.raw.markupAmount > 0 && (
                                                    <div className="b-row">
                                                        <span>Murabaha Markup ({selectedItem.raw.markupPercentage || 0}%)</span>
                                                        <span className="text-green">+ ₦{(selectedItem.raw.markupAmount || 0).toLocaleString()}</span>
                                                    </div>
                                                )}
                                                <div className="b-divider" />
                                                <div className="b-row total">
                                                    <span>Total Facility Cost</span>
                                                    <span className="text-primary">₦{(selectedItem.raw.totalAmount || selectedItem.amount).toLocaleString()}</span>
                                                </div>
                                            </div>
                                        </div>
                                    )}

                                    {/* Stakeholders & Fulfillment */}
                                    <div className="stakeholders-section">
                                        <h4 className="section-subtitle">Fulfillment & Verification</h4>
                                        <div className="stakeholders-grid">
                                            {selectedItem.raw.vendor && (
                                                <div className="stakeholder-card">
                                                    <div className="st-icon-box bg-purple">
                                                        <Store size={20} />
                                                    </div>
                                                    <div className="st-info">
                                                        <span className="st-role">Wholesale Vendor</span>
                                                        <h5 className="st-name">{selectedItem.raw.vendor.businessName || selectedItem.raw.vendor.name}</h5>
                                                        {selectedItem.raw.vendor.phone && (
                                                            <a href={`tel:${selectedItem.raw.vendor.phone}`} className="st-phone-link">
                                                                <Phone size={12} /> {selectedItem.raw.vendor.phone}
                                                            </a>
                                                        )}
                                                    </div>
                                                </div>
                                            )}

                                            {selectedItem.raw.agent && (
                                                <div className="stakeholder-card">
                                                    <div className="st-icon-box bg-green">
                                                        <ShieldCheck size={20} />
                                                    </div>
                                                    <div className="st-info">
                                                        <span className="st-role">Verifying Agent</span>
                                                        <h5 className="st-name">{selectedItem.raw.agent.name}</h5>
                                                        {selectedItem.raw.agent.phone && (
                                                            <a href={`tel:${selectedItem.raw.agent.phone}`} className="st-phone-link">
                                                                <Phone size={12} /> {selectedItem.raw.agent.phone}
                                                            </a>
                                                        )}
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </>
                            )}

                            {/* ================================================= */}
                            {/* AGENT-ASSISTED PURCHASE (AAP) SPECIFICS */}
                            {/* STRICT SHARIAH COMPLIANT 2-STAGE FLOW (MATCHING MOBILE) */}
                            {/* ================================================= */}
                            {selectedItem.type === 'aap' && selectedItem.raw && (
                                <>
                                    {/* Product Photos or Sourcing Placeholder */}
                                    {selectedItem.raw.productPhotos && selectedItem.raw.productPhotos.length > 0 ? (
                                        <div className="aap-photos-gallery">
                                            <h4 className="section-subtitle">Sourced Goods Physical Inspection</h4>
                                            <div className="aap-photos-scroll custom-scrollbar">
                                                {selectedItem.raw.productPhotos.map((photoUri, idx) => (
                                                    <a key={idx} href={photoUri} target="_blank" rel="noopener noreferrer" className="aap-photo-wrapper">
                                                        <img src={photoUri} alt={`Sourced item ${idx + 1}`} className="aap-photo-img" />
                                                    </a>
                                                ))}
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="aap-sourcing-placeholder">
                                            <div className="aap-placeholder-icon">
                                                <Camera size={26} />
                                            </div>
                                            <div className="aap-placeholder-content">
                                                <h5>{selectedItem.raw.status === 'trader_initiated' ? 'Live Camera Sourcing in Progress' : 'Physical Photos Pending'}</h5>
                                                <p>Your market agent will capture live camera photos of physical goods at the market.</p>
                                            </div>
                                        </div>
                                    )}

                                    {/* STAGE A: TRADER INITIATED (AWAITING AGENT SOURCING) */}
                                    {selectedItem.raw.status === 'trader_initiated' && (
                                        <div className="aap-status-card trader-initiated-card">
                                            <div className="aap-card-badge-row">
                                                <span className="aap-status-pill pill-amber">
                                                    <Clock size={12} />
                                                    <span>AWAITING AGENT SOURCING</span>
                                                </span>
                                            </div>
                                            <h3 className="aap-product-headline">{selectedItem.raw.productName || 'Stock Purchase Request'}</h3>
                                            {selectedItem.raw.traderRequestNote && (
                                                <div className="aap-note-box">
                                                    <MessageSquare size={16} className="text-amber" />
                                                    <div>
                                                        <strong>Your Note:</strong>
                                                        <p>"{selectedItem.raw.traderRequestNote}"</p>
                                                    </div>
                                                </div>
                                            )}
                                            <p className="aap-status-explanation">
                                                Your request has been dispatched to <strong>{selectedItem.raw.agent?.name || 'your market agent'}</strong>. 
                                                The agent is inspecting items at the wholesale market, capturing live photos, and confirming the wholesale price.
                                            </p>
                                            <div className="aap-card-actions">
                                                <button 
                                                    className="action-btn-danger outline"
                                                    onClick={() => handleCancelAAP(selectedItem.id)}
                                                    disabled={actionLoadingId === selectedItem.id || cancellingContract}
                                                >
                                                    {actionLoadingId === selectedItem.id ? (
                                                        <>
                                                            <span className="btn-spinner-sm" />
                                                            <span>Cancelling Request...</span>
                                                        </>
                                                    ) : (
                                                        <>
                                                            <Trash2 size={15} />
                                                            <span>Cancel Purchase Request</span>
                                                        </>
                                                    )}
                                                </button>
                                            </div>
                                        </div>
                                    )}

                                    {/* SOURCED GOODS DETAILS (When past trader_initiated) */}
                                    {selectedItem.raw.productName && selectedItem.raw.status !== 'trader_initiated' && (
                                        <div className="aap-details-section">
                                            <h4 className="section-subtitle">Sourced Goods</h4>
                                            <div className="aap-spec-card">
                                                <div className="spec-row">
                                                    <span className="spec-label">Items Sourced:</span>
                                                    <p className="spec-text font-bold">{selectedItem.raw.productName}</p>
                                                </div>
                                                {selectedItem.raw.productDescription && (
                                                    <div className="spec-row">
                                                        <span className="spec-label">Agent Notes:</span>
                                                        <p className="spec-text">{selectedItem.raw.productDescription}</p>
                                                    </div>
                                                )}
                                                {selectedItem.raw.traderRequestNote && (
                                                    <div className="spec-row">
                                                        <span className="spec-label">Your Initial Request:</span>
                                                        <p className="spec-text text-muted">"{selectedItem.raw.traderRequestNote}"</p>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    )}

                                    {/* VERIFIED MARKET AGENT */}
                                    <div className="stakeholders-section">
                                        <h4 className="section-subtitle">Verified Market Agent</h4>
                                        <div className="stakeholder-card">
                                            <div className="st-icon-box bg-green">
                                                <ShieldCheck size={20} />
                                            </div>
                                            <div className="st-info">
                                                <span className="st-role">Authorized Purchasing Agent</span>
                                                <h5 className="st-name">{selectedItem.raw.agent?.name || 'Assigned Market Agent'}</h5>
                                                <div className="st-meta-row">
                                                    {selectedItem.raw.agent?.phone && (
                                                        <a href={`tel:${selectedItem.raw.agent.phone}`} className="st-phone-link">
                                                            <Phone size={12} /> {selectedItem.raw.agent.phone}
                                                        </a>
                                                    )}
                                                    {selectedItem.raw.agent?.market && (
                                                        <span className="st-market-location">
                                                            <MapPin size={12} /> {selectedItem.raw.agent.market}
                                                        </span>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    {/* STAGE 1: SIGN DEED OF UNDERTAKING (WA'D) */}
                                    {selectedItem.raw.status === 'awaiting_retailer_confirm' && (
                                        <div className="aap-step-card undertaking-step-card">
                                            <div className="step-card-header">
                                                <div className="step-badge-circle undertaking">
                                                    <Scale size={20} />
                                                </div>
                                                <div>
                                                    <span className="step-tag undertaking">Step 1 • Sharia Undertaking</span>
                                                    <h4 className="step-title">Deed of Undertaking (Wa'd)</h4>
                                                </div>
                                            </div>
                                            <p className="step-description">
                                                Your agent sourced and verified these goods at the wholesale market. Review key terms below and sign the unilateral binding undertaking (Wa'd Mulzim) to purchase under Murabaha once Amana acquires the goods.
                                            </p>
                                            
                                            <div className="contract-summary-pill">
                                                <div className="summary-pill-row">
                                                    <span className="summary-pill-label">Estimated Wholesale Cost</span>
                                                    <span className="summary-pill-val text-primary font-bold">₦{(selectedItem.raw.purchasePrice || 0).toLocaleString()}</span>
                                                </div>
                                                <div className="summary-pill-row">
                                                    <span className="summary-pill-label">Security Deposit (Wa'd)</span>
                                                    <span className="summary-pill-val text-green font-bold">₦0.00 · Waived</span>
                                                </div>
                                                <div className="summary-pill-row no-border">
                                                    <span className="summary-pill-label">Withdrawal Rights</span>
                                                    <span className="summary-pill-val">Free Before Approval</span>
                                                </div>
                                            </div>

                                            <button 
                                                className="read-contract-inline-btn undertaking"
                                                onClick={() => openContractModal('undertaking', selectedItem)}
                                            >
                                                <FileText size={16} />
                                                <span>Read Full Deed of Undertaking (12 Clauses)</span>
                                            </button>
                                        </div>
                                    )}

                                    {/* STAGE: UNDERTAKING EXECUTED - AWAITING WHOLESALE PROCUREMENT */}
                                    {['pending_admin_approval', 'approved', 'fund_disbursed'].includes(selectedItem.raw.status) && (
                                        <div className="aap-step-card procurement-in-progress-card">
                                            <div className="step-card-header">
                                                <div className="step-badge-circle info">
                                                    <Clock size={20} />
                                                </div>
                                                <div>
                                                    <span className="step-tag info">Stage 1 Executed • Procurement</span>
                                                    <h4 className="step-title">Deed of Undertaking Active</h4>
                                                </div>
                                            </div>
                                            <p className="step-description">
                                                Amana has approved your undertaking and is financing and procuring the goods from the wholesale market.
                                                You will be invited to execute the Murabaha Sale Contract once physical possession (Qabd) is established.
                                            </p>
                                            <div className="contract-summary-pill">
                                                <div className="summary-pill-row">
                                                    <span className="summary-pill-label">Wholesale Financing Cost</span>
                                                    <span className="summary-pill-val font-bold">₦{(selectedItem.raw.purchasePrice || 0).toLocaleString()}</span>
                                                </div>
                                                <div className="summary-pill-row no-border">
                                                    <span className="summary-pill-label">Procurement Status</span>
                                                    <span className="summary-pill-val text-amber font-bold">
                                                        {selectedItem.raw.status === 'pending_admin_approval' ? 'Pending Admin Review' : 'Funds Disbursed / Sourcing Goods'}
                                                    </span>
                                                </div>
                                            </div>
                                            {selectedItem.raw.status === 'pending_admin_approval' && (
                                                <div className="aap-card-actions">
                                                    <button 
                                                        className="action-btn-danger outline"
                                                        onClick={() => handleCancelAAP(selectedItem.id)}
                                                        disabled={actionLoadingId === selectedItem.id || cancellingContract}
                                                    >
                                                        {actionLoadingId === selectedItem.id ? (
                                                            <>
                                                                <span className="btn-spinner-sm" />
                                                                <span>Cancelling Request...</span>
                                                            </>
                                                        ) : (
                                                            <>
                                                                <Trash2 size={15} />
                                                                <span>Cancel Request Before Approval</span>
                                                            </>
                                                        )}
                                                    </button>
                                                </div>
                                            )}
                                        </div>
                                    )}

                                    {/* STAGE 2: MURABAHA SALE CONTRACT EXECUTION */}
                                    {selectedItem.raw.status === 'pending_murabaha_acceptance' && (
                                        <div className="aap-step-card murabaha-step-card">
                                            <div className="step-card-header">
                                                <div className="step-badge-circle murabaha">
                                                    <BookOpen size={20} />
                                                </div>
                                                <div>
                                                    <span className="step-tag murabaha">Step 2 • Cost-Plus Sale Contract</span>
                                                    <h4 className="step-title">Murabaha Sale Contract</h4>
                                                </div>
                                            </div>
                                            <p className="step-description">
                                                Amana has acquired physical possession of <strong>{selectedItem.raw.productName || 'the goods'}</strong> through its agent. 
                                                Review the disclosed cost, profit margin, and repayment terms below:
                                            </p>

                                            <div className="financial-breakdown-card">
                                                <h4 className="section-subtitle">Disclosed Murabaha Terms</h4>
                                                <div className="breakdown-rows">
                                                    <div className="b-row">
                                                        <span>Disclosed Actual Cost Price</span>
                                                        <span>₦{(selectedItem.raw.purchasePrice || 0).toLocaleString()}</span>
                                                    </div>
                                                    <div className="b-row">
                                                        <span>Agreed Profit Margin ({selectedItem.raw.markupPercentage ?? 0}%)</span>
                                                        <span className="text-green">+ ₦{(selectedItem.raw.markupAmount || 0).toLocaleString()}</span>
                                                    </div>
                                                    <div className="b-row">
                                                        <span>Repayment Term</span>
                                                        <span>{selectedItem.raw.repaymentTerm || 14} Days</span>
                                                    </div>
                                                    <div className="b-divider" />
                                                    <div className="b-row total">
                                                        <span>Total Murabaha Price</span>
                                                        <span className="text-primary font-bold">₦{(selectedItem.raw.totalRetailerCost || selectedItem.amount).toLocaleString()}</span>
                                                    </div>
                                                </div>
                                            </div>

                                            <button 
                                                className="read-contract-inline-btn murabaha"
                                                onClick={() => openContractModal('murabaha', selectedItem)}
                                            >
                                                <BookOpen size={16} />
                                                <span>Read Full Murabaha Contract (15 Clauses)</span>
                                            </button>
                                        </div>
                                    )}

                                    {/* MURABAHA ACCEPTED - AWAITING DELIVERY */}
                                    {selectedItem.raw.status === 'murabaha_accepted' && (
                                        <div className="aap-success-banner murabaha-accepted">
                                            <div className="success-banner-icon">
                                                <CheckCircle size={28} />
                                            </div>
                                            <div>
                                                <h4 className="success-title">Murabaha Sale Concluded!</h4>
                                                <p className="success-subtitle">
                                                    Ownership & risk transferred to you at <strong>₦{(selectedItem.raw.totalRetailerCost || selectedItem.amount).toLocaleString()}</strong>.
                                                    Your agent is preparing to deliver the physical goods for your inspection.
                                                </p>
                                            </div>
                                        </div>
                                    )}

                                    {/* DELIVERY OTP CONFIRMATION */}
                                    {selectedItem.raw.status === 'delivered' && (
                                        <div className="otp-input-section">
                                            <div className="otp-header-row">
                                                <div className="otp-badge-icon">
                                                    <Key size={22} />
                                                </div>
                                                <div>
                                                    <h4>Enter Delivery OTP</h4>
                                                    <p>Inspect the goods physically, then ask your agent for their 6-digit confirmation code:</p>
                                                </div>
                                            </div>
                                            <div className="otp-input-box">
                                                <input 
                                                    type="text" 
                                                    maxLength={6} 
                                                    className="otp-input-field"
                                                    placeholder="000000"
                                                    value={otpInput}
                                                    onChange={e => setOtpInput(e.target.value)}
                                                />
                                                <button 
                                                    className="action-btn-primary"
                                                    onClick={() => handleConfirmAAPReceipt(selectedItem.id)}
                                                    disabled={otpInput.trim().length !== 6}
                                                >
                                                    <CheckCircle size={16} />
                                                    <span>Confirm Receipt of Goods</span>
                                                </button>
                                            </div>
                                        </div>
                                    )}

                                    {/* GOODS RECEIVED / COMPLETED */}
                                    {['received', 'completed'].includes(selectedItem.raw.status) && (
                                        <div className="aap-success-banner goods-received">
                                            <div className="success-banner-icon">
                                                <PackageCheck size={28} />
                                            </div>
                                            <div>
                                                <h4 className="success-title">Goods Received!</h4>
                                                <p className="success-subtitle">
                                                    ₦{(selectedItem.raw.totalRetailerCost || selectedItem.amount).toLocaleString()} added to your repayment ledger.
                                                    {selectedItem.dueDate && ` Due by: ${new Date(selectedItem.dueDate).toLocaleDateString()}`}
                                                </p>
                                            </div>
                                        </div>
                                    )}

                                    {/* POST-ACCEPTANCE MURABAHA SUMMARY */}
                                    {(['murabaha_accepted', 'delivered', 'received', 'completed'].includes(selectedItem.raw.status)) && selectedItem.raw.purchasePrice > 0 && (
                                        <div className="financial-breakdown-card">
                                            <h4 className="section-subtitle">Murabaha Contract Summary</h4>
                                            <div className="breakdown-rows">
                                                <div className="b-row">
                                                    <span>Disclosed Actual Cost</span>
                                                    <span>₦{(selectedItem.raw.purchasePrice || 0).toLocaleString()}</span>
                                                </div>
                                                <div className="b-row">
                                                    <span>Agreed Profit Margin ({selectedItem.raw.markupPercentage ?? 0}%)</span>
                                                    <span className="text-green">+ ₦{(selectedItem.raw.markupAmount || 0).toLocaleString()}</span>
                                                </div>
                                                <div className="b-row">
                                                    <span>Repayment Term</span>
                                                    <span>{selectedItem.raw.repaymentTerm || 14} Days</span>
                                                </div>
                                                <div className="b-divider" />
                                                <div className="b-row total">
                                                    <span>Total Murabaha Price</span>
                                                    <span className="text-primary font-bold">₦{(selectedItem.raw.totalRetailerCost || selectedItem.amount).toLocaleString()}</span>
                                                </div>
                                            </div>
                                        </div>
                                    )}

                                    {/* TERMINATED FINANCIAL STATEMENT */}
                                    {(selectedItem.status === 'cancelled' || selectedItem.status === 'declined' || selectedItem.status === 'cancellation_requested') && (
                                        <div className="financial-breakdown-card nullified-card">
                                            <div className="breakdown-header-flex">
                                                <h4 className="section-subtitle">Financial Statement (Nullified)</h4>
                                                <span className="nullified-tag">ZERO LIABILITY</span>
                                            </div>
                                            <div className="breakdown-rows">
                                                <div className="b-row">
                                                    <span>Wholesale Goods Value</span>
                                                    <span className="text-strike">₦{(selectedItem.raw.purchasePrice || 0).toLocaleString()}</span>
                                                </div>
                                                <div className="b-row">
                                                    <span>Murabaha Markup</span>
                                                    <span className="text-green">Waived (₦0.00)</span>
                                                </div>
                                                <div className="b-row">
                                                    <span>Repayment Term</span>
                                                    <span className="text-danger">Nullified</span>
                                                </div>
                                                <div className="b-divider" />
                                                <div className="b-row total">
                                                    <div>
                                                        <span>Total Repayment Liability</span>
                                                        <span className="sub-note">Zero obligation recorded</span>
                                                    </div>
                                                    <span className="text-green font-bold">₦0.00</span>
                                                </div>
                                            </div>
                                            <div className="nullified-guarantee-note">
                                                <CheckCircle size={16} color="#10b981" />
                                                <span>Request closed with zero financial liability. No funds or credit locked.</span>
                                            </div>
                                        </div>
                                    )}
                                </>
                            )}

                            {/* ================================================= */}
                            {/* LEDGER SPECIFICS */}
                            {/* ================================================= */}
                            {selectedItem.type === 'tx' && selectedItem.raw && (
                                <div className="ledger-receipt-section">
                                    <h4 className="section-subtitle">Receipt Details</h4>
                                    <div className="ledger-card">
                                        <div className="l-row">
                                            <span>Transaction Reference</span>
                                            <span className="font-mono">{selectedItem.raw.reference || selectedItem.id}</span>
                                        </div>
                                        <div className="l-row">
                                            <span>Transaction Type</span>
                                            <span>{selectedItem.raw.type?.replace(/_/g, ' ').toUpperCase()}</span>
                                        </div>
                                        <div className="l-row">
                                            <span>Description</span>
                                            <span>{selectedItem.raw.description}</span>
                                        </div>
                                        <div className="l-row">
                                            <span>Status</span>
                                            <span className="text-green uppercase font-bold">{selectedItem.raw.status}</span>
                                        </div>
                                        <div className="b-divider" />
                                        <div className="l-row total">
                                            <span>Total Amount</span>
                                            <span className={selectedItem.raw.type === 'repayment' ? 'text-green' : 'text-primary'}>
                                                {selectedItem.raw.type === 'repayment' ? '-' : '+'}₦{(selectedItem.raw.amount || 0).toLocaleString()}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Legal Documents Section for Order / AAP */}
                            {(selectedItem.type === 'order' || selectedItem.type === 'aap') && (() => {
                                const isUndertakingSigned = Boolean(
                                    selectedItem.raw.undertakingSigned || 
                                    selectedItem.raw.undertakingSignedAt || 
                                    selectedItem.raw.retailerConfirmedAt ||
                                    (selectedItem.type === 'order' && selectedItem.raw.createdAt)
                                );
                                const undertakingDate = selectedItem.raw.undertakingSignedAt || selectedItem.raw.retailerConfirmedAt || selectedItem.raw.createdAt;
                                
                                const isMurabahaSigned = Boolean(
                                    selectedItem.raw.murabahaSigned || 
                                    selectedItem.raw.murabahaSignedAt || 
                                    selectedItem.raw.murabahaAcceptedAt ||
                                    selectedItem.raw.vendorSettledAt
                                );
                                const murabahaDate = selectedItem.raw.murabahaSignedAt || selectedItem.raw.murabahaAcceptedAt || selectedItem.raw.vendorSettledAt;

                                const isAwaitingUndertaking = selectedItem.type === 'aap' && selectedItem.status === 'awaiting_retailer_confirm';
                                const isAwaitingMurabaha = selectedItem.type === 'aap' && selectedItem.status === 'pending_murabaha_acceptance';

                                const hasDelivery = Boolean(
                                    selectedItem.raw.receivedAt || 
                                    selectedItem.raw.goodsReceivedAt || 
                                    ['received', 'goods_received', 'completed', 'repaid'].includes(selectedItem.status)
                                );
                                const deliveryDate = selectedItem.raw.receivedAt || selectedItem.raw.goodsReceivedAt;

                                const totalFacility = selectedItem.totalDebt || selectedItem.amount || (selectedItem.type === 'aap' ? selectedItem.raw.totalRetailerCost : selectedItem.raw.totalRepaymentAmount) || 0;
                                const totalPaid = selectedItem.amountPaid || selectedItem.raw.amountPaid || 0;
                                const balanceDue = selectedItem.remainingBalance !== undefined ? selectedItem.remainingBalance : Math.max(0, totalFacility - totalPaid);
                                const paymentPercentage = totalFacility > 0 ? Math.min(100, Math.round((totalPaid / totalFacility) * 100)) : 0;
                                const installmentList = selectedItem.installments || selectedItem.raw.installments || [];

                                const isMurabahaLocked = selectedItem.type === 'aap' && !isMurabahaSigned && !isAwaitingMurabaha && !hasDelivery;

                                return (
                                    <div className="contracts-dossier-wrapper">
                                        <div className="contracts-dossier-header">
                                            <div className="dossier-header-left">
                                                <div className="dossier-icon-seal">
                                                    <ShieldCheck size={20} />
                                                </div>
                                                <div>
                                                    <h4 className="dossier-main-title">Sharia Legal Contracts Dossier</h4>
                                                    <p className="dossier-sub-title">AAOIFI Standard No. 8 Bilateral Legal Architecture</p>
                                                </div>
                                            </div>
                                            <span className="sharia-verified-stamp">
                                                <Award size={13} />
                                                <span>Legally Enforceable</span>
                                            </span>
                                        </div>

                                        <div className="contracts-cards-grid">
                                            {/* 1. Deed of Undertaking Card */}
                                            <div 
                                                className={`contract-dossier-card undertaking-card ${isAwaitingUndertaking ? 'awaiting-action' : ''}`}
                                                onClick={() => openContractModal('undertaking', selectedItem)}
                                                role="button"
                                                tabIndex={0}
                                            >
                                                <div className="card-top-row">
                                                    <span className="card-stage-tag stage-undertaking">Stage 1 • Promise to Buy (Wa'd)</span>
                                                    {isUndertakingSigned ? (
                                                        <span className="card-status-badge badge-signed">
                                                            <CheckCircle size={12} />
                                                            <span>Executed</span>
                                                        </span>
                                                    ) : isAwaitingUndertaking ? (
                                                        <span className="card-status-badge badge-action">
                                                            <Clock size={12} />
                                                            <span>Action Required</span>
                                                        </span>
                                                    ) : (
                                                        <span className="card-status-badge badge-neutral">
                                                            <span>Procurement Stage</span>
                                                        </span>
                                                    )}
                                                </div>

                                                <div className="card-main-content">
                                                    <div className="card-contract-icon undertaking-icon">
                                                        <Scale size={20} />
                                                    </div>
                                                    <div className="card-contract-info">
                                                        <h5 className="card-contract-title">Deed of Undertaking (Wa'd)</h5>
                                                        <p className="card-contract-desc">
                                                            Unilateral binding commitment to enter Murabaha upon stock acquisition
                                                        </p>
                                                        <span className="card-date-meta">
                                                            {undertakingDate ? (
                                                                <>📅 Executed: <strong>{new Date(undertakingDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</strong></>
                                                            ) : (
                                                                <>Awaiting execution prior to wholesale funding</>
                                                            )}
                                                        </span>
                                                    </div>
                                                </div>

                                                <div className="card-bottom-action">
                                                    <span className="card-action-link undertaking-link">
                                                        {isAwaitingUndertaking ? 'Review & Sign Undertaking ✍️' : 'View Sealed Agreement →'}
                                                    </span>
                                                </div>
                                            </div>

                                            {/* 2. Murabaha Sale Contract Card */}
                                            <div 
                                                className={`contract-dossier-card murabaha-card ${isAwaitingMurabaha ? 'awaiting-action' : ''} ${isMurabahaLocked ? 'card-locked' : ''}`}
                                                onClick={() => {
                                                    if (isMurabahaLocked) {
                                                        addToast("The Murabaha Sale Contract unlocks only after Amana acquires physical possession of the goods.", "info");
                                                        return;
                                                    }
                                                    openContractModal('murabaha', selectedItem);
                                                }}
                                                role="button"
                                                tabIndex={0}
                                            >
                                                <div className="card-top-row">
                                                    <span className="card-stage-tag stage-murabaha">Stage 2 • Cost-Plus Sale</span>
                                                    {isMurabahaSigned ? (
                                                        <span className="card-status-badge badge-signed">
                                                            <CheckCircle size={12} />
                                                            <span>Executed</span>
                                                        </span>
                                                    ) : isAwaitingMurabaha ? (
                                                        <span className="card-status-badge badge-action">
                                                            <Clock size={12} />
                                                            <span>Action Required</span>
                                                        </span>
                                                    ) : isMurabahaLocked ? (
                                                        <span className="card-status-badge badge-locked">
                                                            <Lock size={12} />
                                                            <span>Post-Possession</span>
                                                        </span>
                                                    ) : (
                                                        <span className="card-status-badge badge-neutral">
                                                            <span>Post-Handover</span>
                                                        </span>
                                                    )}
                                                </div>

                                                <div className="card-main-content">
                                                    <div className={`card-contract-icon murabaha-icon ${isMurabahaLocked ? 'locked-icon' : ''}`}>
                                                        {isMurabahaLocked ? <Lock size={20} /> : <BookOpen size={20} />}
                                                    </div>
                                                    <div className="card-contract-info">
                                                        <h5 className="card-contract-title">Murabaha Sale Contract</h5>
                                                        <p className="card-contract-desc">
                                                            {isMurabahaLocked
                                                                ? "Transparent acquisition cost + fixed profit markup concluded only post-possession"
                                                                : "Transparent acquisition cost + fixed profit markup concluded post-possession"}
                                                        </p>
                                                        <span className="card-date-meta">
                                                            {murabahaDate ? (
                                                                <>📅 Executed: <strong>{new Date(murabahaDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</strong></>
                                                            ) : isMurabahaLocked ? (
                                                                <>🔒 Unlocks after agent physical acquisition (Qabd)</>
                                                            ) : (
                                                                <>Concluded upon agent physical possession & pricing disclosure</>
                                                            )}
                                                        </span>
                                                    </div>
                                                </div>

                                                <div className="card-bottom-action">
                                                    <span className={`card-action-link murabaha-link ${isMurabahaLocked ? 'locked-link' : ''}`}>
                                                        {isMurabahaSigned 
                                                            ? 'View Sealed Agreement →' 
                                                            : isAwaitingMurabaha 
                                                                ? 'Review & Sign Murabaha ✍️' 
                                                                : 'Locked until physical possession 🔒'}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Delivery & Qabd Verification Banner */}
                                        {hasDelivery && (
                                            <div className="delivery-confirmation-banner">
                                                <div className="delivery-banner-left">
                                                    <div className="delivery-icon-seal">
                                                        <PackageCheck size={22} />
                                                    </div>
                                                    <div>
                                                        <div className="delivery-banner-title">
                                                            <span>Physical Inspection & Possession (Qabd) Confirmed</span>
                                                            <span className="delivery-badge-pill">AAOIFI Aligned</span>
                                                        </div>
                                                        <p className="delivery-banner-subtitle">
                                                            {deliveryDate
                                                                ? `Receipt verified via authenticated OTP on ${new Date(deliveryDate).toLocaleString('en-US', { dateStyle: 'medium', timeStyle: 'short' })}`
                                                                : 'Goods delivered, inspected and confirmed received via platform OTP.'}
                                                        </p>
                                                    </div>
                                                </div>
                                                <div className="delivery-status-indicator">
                                                    <CheckCircle size={20} />
                                                    <span>VERIFIED</span>
                                                </div>
                                            </div>
                                        )}

                                        {/* Settlement & Repayment Ledger */}
                                        {totalFacility > 0 && (
                                            <div className="settlement-dossier-section">
                                                <div className="section-subtitle">
                                                    <CreditCard size={15} />
                                                    <span>Facility Settlement & Repayment Ledger</span>
                                                </div>

                                                <div className="settlement-overview-card">
                                                    <div className="settlement-stats-row">
                                                        <div className="settlement-stat-col">
                                                            <span className="stat-label">Total Facility Cost</span>
                                                            <span className="stat-value">₦{totalFacility.toLocaleString()}</span>
                                                        </div>
                                                        <div className="settlement-stat-col">
                                                            <span className="stat-label">Total Amount Paid</span>
                                                            <span className="stat-value text-green">₦{totalPaid.toLocaleString()}</span>
                                                        </div>
                                                        <div className="settlement-stat-col">
                                                            <span className="stat-label">Outstanding Balance</span>
                                                            <span className={`stat-value ${balanceDue > 0 ? 'text-brand' : 'text-green'}`}>
                                                                ₦{balanceDue.toLocaleString()}
                                                            </span>
                                                        </div>
                                                        <div className="settlement-stat-col stat-badge-col">
                                                            <span className={`repayment-status-badge ${balanceDue <= 0.5 ? 'settled' : totalPaid > 0 ? 'partial' : 'unpaid'}`}>
                                                                {balanceDue <= 0.5 ? 'Fully Settled' : totalPaid > 0 ? `Partially Paid (${paymentPercentage}%)` : 'Payment Pending'}
                                                            </span>
                                                        </div>
                                                    </div>

                                                    <div className="settlement-progress-wrapper">
                                                        <div className="settlement-progress-track">
                                                            <div 
                                                                className="settlement-progress-fill" 
                                                                style={{ width: `${paymentPercentage}%` }}
                                                            />
                                                        </div>
                                                        <div className="settlement-progress-labels">
                                                            <span>{paymentPercentage}% Settled</span>
                                                            <span>₦{balanceDue.toLocaleString()} remaining</span>
                                                        </div>
                                                    </div>

                                                    {installmentList.length > 0 && (
                                                        <div className="installments-history-block">
                                                            <div className="installments-header">
                                                                <Receipt size={14} />
                                                                <span>Recorded Installments ({installmentList.length})</span>
                                                            </div>
                                                            <div className="installments-list">
                                                                {installmentList.map((inst, idx) => (
                                                                    <div key={idx} className="installment-item-row">
                                                                        <div className="inst-left">
                                                                            <span className="inst-num">#{idx + 1}</span>
                                                                            <div>
                                                                                <div className="inst-amount">₦{(inst.amount || 0).toLocaleString()}</div>
                                                                                <div className="inst-date">
                                                                                    {inst.date ? new Date(inst.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit' }) : 'Confirmed'}
                                                                                </div>
                                                                            </div>
                                                                        </div>
                                                                        <div className="inst-right">
                                                                            <span className="inst-channel-badge">{inst.channel || 'Manual Payment'}</span>
                                                                            {inst.reference && <span className="inst-ref font-mono">Ref: {inst.reference.slice(-6)}</span>}
                                                                        </div>
                                                                    </div>
                                                                ))}
                                                            </div>
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                );
                            })()}
                        </div>

                        {/* Modal Footer Actions */}
                        <div className="modal-luxury-footer">
                            {(selectedItem.status === 'cancelled' || selectedItem.status === 'declined' || selectedItem.status === 'cancellation_requested') ? (
                                <>
                                    <button 
                                        className="action-btn-primary"
                                        onClick={() => {
                                            setSelectedItem(null);
                                            navigate('/marketplace');
                                        }}
                                    >
                                        <ShoppingBag size={18} />
                                        <span>Browse Marketplace to Reorder</span>
                                    </button>
                                    <button 
                                        className="action-btn-secondary"
                                        onClick={() => {
                                            setSelectedItem(null);
                                            navigate('/dashboard');
                                        }}
                                    >
                                        <Zap size={18} />
                                        <span>Request via Agent (AAP)</span>
                                    </button>
                                </>
                            ) : (
                                <>
                                    {selectedItem.type === 'order' && (
                                        <>
                                            {selectedItem.status === 'vendor_settled' && (
                                                <button 
                                                    className="action-btn-primary"
                                                    onClick={() => handleConfirmOrderReceipt(selectedItem.id)}
                                                >
                                                    <CheckCircle size={18} />
                                                    <span>Confirm Goods Received</span>
                                                </button>
                                            )}
                                            {selectedItem.status === 'pending_vendor' && (
                                                <button 
                                                    className="action-btn-danger"
                                                    onClick={() => handleCancelOrder(selectedItem.id)}
                                                >
                                                    <X size={18} />
                                                    <span>Cancel Order</span>
                                                </button>
                                            )}
                                            {selectedItem.status === 'goods_received' && !selectedItem.isPaid && (
                                                <button 
                                                    className="action-btn-primary"
                                                    onClick={() => {
                                                        setSelectedItem(null);
                                                        navigate(`/dashboard?repay=${selectedItem.id}`);
                                                    }}
                                                >
                                                    <CreditCard size={18} />
                                                    <span>Repay via Dashboard</span>
                                                </button>
                                            )}
                                        </>
                                    )}

                                    {selectedItem.type === 'aap' && (
                                        <>
                                            {selectedItem.status === 'awaiting_retailer_confirm' && (
                                                <>
                                                    <button 
                                                        className="action-btn-undertaking"
                                                        onClick={() => openContractModal('undertaking', selectedItem)}
                                                        disabled={signingContract || cancellingContract || actionLoadingId === selectedItem.id}
                                                    >
                                                        <Scale size={18} />
                                                        <span>Review & Sign Deed of Undertaking</span>
                                                    </button>
                                                    <button 
                                                        className="action-btn-danger"
                                                        onClick={() => handleCancelAAP(selectedItem.id)}
                                                        disabled={signingContract || cancellingContract || actionLoadingId === selectedItem.id}
                                                    >
                                                        {actionLoadingId === selectedItem.id || cancellingContract ? (
                                                            <>
                                                                <span className="btn-spinner-sm danger" />
                                                                <span>Cancelling Request...</span>
                                                            </>
                                                        ) : (
                                                            <>
                                                                <X size={18} />
                                                                <span>Cancel Request</span>
                                                            </>
                                                        )}
                                                    </button>
                                                </>
                                            )}
                                            {selectedItem.status === 'pending_murabaha_acceptance' && (
                                                <>
                                                    <button 
                                                        className="action-btn-murabaha"
                                                        onClick={() => openContractModal('murabaha', selectedItem)}
                                                        disabled={signingContract || cancellingContract || actionLoadingId === selectedItem.id}
                                                    >
                                                        <BookOpen size={18} />
                                                        <span>Review & Sign Murabaha Contract</span>
                                                    </button>
                                                    <button 
                                                        className="action-btn-danger"
                                                        onClick={() => handleDeclineAAP(selectedItem.id)}
                                                        disabled={signingContract || cancellingContract || actionLoadingId === selectedItem.id}
                                                    >
                                                        {actionLoadingId === selectedItem.id || cancellingContract ? (
                                                            <>
                                                                <span className="btn-spinner-sm danger" />
                                                                <span>Declining Offer...</span>
                                                            </>
                                                        ) : (
                                                            <>
                                                                <X size={18} />
                                                                <span>Decline Offer</span>
                                                            </>
                                                        )}
                                                    </button>
                                                </>
                                            )}
                                            {selectedItem.status === 'delivered' && (
                                                <button 
                                                    className="action-btn-primary"
                                                    onClick={() => handleConfirmAAPReceipt(selectedItem.id)}
                                                    disabled={otpInput.trim().length !== 6}
                                                >
                                                    <Key size={18} />
                                                    <span>Submit OTP & Confirm Receipt</span>
                                                </button>
                                            )}
                                            {['received', 'completed'].includes(selectedItem.status) && !selectedItem.isPaid && (
                                                <button 
                                                    className="action-btn-primary"
                                                    onClick={() => {
                                                        setSelectedItem(null);
                                                        navigate(`/dashboard?repay=${selectedItem.id}`);
                                                    }}
                                                >
                                                    <CreditCard size={18} />
                                                    <span>Repay via Dashboard</span>
                                                </button>
                                            )}
                                            {['trader_initiated', 'pending_admin_approval'].includes(selectedItem.status) && (
                                                <button 
                                                    className="action-btn-danger"
                                                    onClick={() => handleCancelAAP(selectedItem.id)}
                                                    disabled={signingContract || cancellingContract || actionLoadingId === selectedItem.id}
                                                >
                                                    {actionLoadingId === selectedItem.id || cancellingContract ? (
                                                        <>
                                                            <span className="btn-spinner-sm danger" />
                                                            <span>Cancelling Request...</span>
                                                        </>
                                                    ) : (
                                                        <>
                                                            <Trash2 size={18} />
                                                            <span>Cancel Purchase Request</span>
                                                        </>
                                                    )}
                                                </button>
                                            )}
                                        </>
                                    )}
                                </>
                            )}

                            <button className="action-btn-secondary" onClick={() => setSelectedItem(null)}>
                                Close
                            </button>
                        </div>
                    </div>
                </div>,
                document.body
            )}

            <ContractModal
                isOpen={contractModalOpen}
                onClose={() => !signingContract && !cancellingContract && setContractModalOpen(false)}
                contractData={activeContractData}
                onSign={() => {
                    const targetId = selectedItem?.id || selectedItem?._id || activeContractData?.refCode;
                    if (contractType === 'undertaking') {
                        handleSignAAPUndertaking(targetId);
                    } else {
                        handleAcceptAAPSale(targetId);
                    }
                }}
                onDecline={() => {
                    const targetId = selectedItem?.id || selectedItem?._id || activeContractData?.refCode;
                    if (contractType === 'undertaking') {
                        handleCancelAAP(targetId);
                    } else {
                        handleDeclineAAP(targetId);
                    }
                }}
                isSigning={signingContract}
                isDeclining={cancellingContract}
                canSign={
                    (contractType === 'undertaking' && selectedItem?.status === 'awaiting_retailer_confirm') ||
                    (contractType === 'murabaha' && selectedItem?.status === 'pending_murabaha_acceptance')
                }
                signButtonText={
                    contractType === 'undertaking'
                        ? "Sign Deed of Undertaking (Wa'd)"
                        : "Accept Sale & Sign Murabaha Contract"
                }
                declineButtonText={
                    contractType === 'undertaking'
                        ? "Cancel Purchase Request"
                        : "Decline Murabaha Offer"
                }
            />
        </div>
    );
};

export default RetailerTransactions;
