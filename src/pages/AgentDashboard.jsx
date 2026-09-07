import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import { Package, MapPin, ShieldCheck, User, PhoneOutgoing, Mail, Plus, CheckCircle, ClipboardList, ChevronRight, ShoppingBag, ArrowRight, AlertTriangle, CreditCard, Store, Search, Filter, ArrowUpDown, Calendar, ExternalLink, X, RefreshCw, Eye, Check, XCircle } from 'lucide-react';
import { useToast } from '../context/ToastContext';
import { useAuth } from '../context/AuthContext';
import TraderCreditCard from '../components/TraderCreditCard';
import './AgentDashboard.css';

const AgentDashboard = () => {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [tasks, setTasks] = useState([]);
    const [aapQueue, setAapQueue] = useState([]);
    const [pendingVisits, setPendingVisits] = useState([]);
    const [showVisits, setShowVisits] = useState(false);
    const [activeTab, setActiveTab] = useState('active'); // 'active' | 'history'
    const [loading, setLoading] = useState(true);
    const { addToast } = useToast();

    // ── Dedicated Agent History State ──
    const [historyData, setHistoryData] = useState({
        items: [],
        pagination: { page: 1, limit: 10, totalItems: 0, totalPages: 1 },
        stats: {}
    });
    const [historyLoading, setHistoryLoading] = useState(false);
    const [historyType, setHistoryType] = useState('all');
    const [historyStatus, setHistoryStatus] = useState('all');
    const [historySearch, setHistorySearch] = useState('');
    const [historySort, setHistorySort] = useState('newest');
    const [historyPage, setHistoryPage] = useState(1);
    const [selectedHistoryInspection, setSelectedHistoryInspection] = useState(null);

    const fetchAAPQueue = async () => {
        try {
            const res = await api.get('/aap/agent/queue');
            setAapQueue(res.data);
        } catch (err) {
            console.error('Failed to load AAP queue', err);
        }
    };

    const fetchPendingVisits = async () => {
        try {
            const res = await api.get('/agent/field-visits/pending');
            setPendingVisits(res.data);
        } catch { /* silently fail */ }
    };

    const fetchAgentHistory = async () => {
        setHistoryLoading(true);
        try {
            const params = new URLSearchParams({
                type: historyType,
                status: historyStatus,
                sortBy: historySort,
                page: historyPage,
                limit: 10
            });
            if (historySearch.trim()) {
                params.append('search', historySearch.trim());
            }
            const res = await api.get(`/agent/history?${params.toString()}`);
            setHistoryData(res.data);
        } catch (err) {
            console.error('Failed to load agent history', err);
        } finally {
            setHistoryLoading(false);
        }
    };

    useEffect(() => {
        if (user) {
            fetchTasks();
            fetchAAPQueue();
            fetchPendingVisits();
            fetchAgentHistory();
        }
    }, [user]);

    useEffect(() => {
        if (user && activeTab === 'history') {
            fetchAgentHistory();
        }
    }, [user, activeTab, historyType, historyStatus, historySort, historyPage]);

    const handleSearchSubmit = (e) => {
        e.preventDefault();
        setHistoryPage(1);
        fetchAgentHistory();
    };

    const fetchTasks = async () => {
        try {
            const res = await api.get('/orders/myorders');
            // Store all my orders to filter locally
            const myTasks = res.data.filter(order => order.agent && order.agent._id === user._id);
            setTasks(myTasks);
        } catch (error) {
            addToast('Failed to load agent tasks', 'error');
        } finally {
            setLoading(false);
        }
    };

    const activeTasks = tasks.filter(t => !t.isPaid && !['cancelled', 'completed', 'goods_received', 'vendor_settled'].includes(t.status));
    const historyTasks = [
        ...tasks.filter(t => t.isPaid || ['vendor_settled', 'goods_received', 'completed'].includes(t.status)),
        ...aapQueue.filter(a => ['received', 'completed', 'declined', 'expired', 'cancelled', 'cancellation_requested'].includes(a.status))
    ].sort((a, b) => new Date(b.updatedAt || b.createdAt) - new Date(a.updatedAt || a.createdAt));

    const activeAap = aapQueue.filter(a => !['received', 'completed', 'declined', 'expired', 'cancelled', 'cancellation_requested'].includes(a.status));
    const pendingTraderRequests = aapQueue.filter(a => a.status === 'trader_initiated');

    const handleSettleVendor = async (orderId) => {
        try {
            await api.put(`/orders/${orderId}/settle-vendor`);
            addToast('Vendor settled! You now have possession of these goods for Amana.', 'success');
            fetchTasks();
        } catch (error) {
            addToast(error.response?.data?.message || 'Settlement failed', 'error');
        }
    };

    const handleSendMurabahaOffer = async (aapId) => {
        try {
            const res = await api.put(`/aap/${aapId}/send-murabaha-offer`);
            addToast(res.data.message || 'Murabaha offer sent!', 'success');
            fetchAAPQueue();
        } catch (error) {
            addToast(error.response?.data?.message || 'Failed to send Murabaha offer', 'error');
        }
    };

    const handleMarkDelivered = async (aapId) => {
        try {
            const res = await api.put(`/aap/${aapId}/deliver`);
            addToast(`Success! Share this OTP: ${res.data.pickupCode}`, 'success');
            fetchAAPQueue();
        } catch (error) {
            addToast(error.response?.data?.message || 'Failed to mark delivered', 'error');
        }
    };

    const renderHistoryView = () => {
        const { items = [], pagination = {}, stats = {} } = historyData;

        return (
            <div className="agent-history-view animate-fade-in">
                {/* ── Stats Summary KPI Cards ── */}
                <div className="history-stats-grid">
                    <div className="hstat-card">
                        <div className="hstat-icon-wrap" style={{ background: 'rgba(59, 130, 246, 0.12)', color: 'var(--color-primary)' }}>
                            <ClipboardList size={20} />
                        </div>
                        <div className="hstat-info">
                            <span className="hstat-label">Total Activities</span>
                            <span className="hstat-val">{stats.totalActivities || 0}</span>
                            <span className="hstat-sub">Across all agent actions</span>
                        </div>
                    </div>

                    <div className="hstat-card">
                        <div className="hstat-icon-wrap" style={{ background: 'rgba(16, 185, 129, 0.12)', color: 'var(--color-success)' }}>
                            <Store size={20} />
                        </div>
                        <div className="hstat-info">
                            <span className="hstat-label">Store Inspections</span>
                            <span className="hstat-val">{stats.totalVerifications || 0}</span>
                            <span className="hstat-sub" style={{ color: (stats.verificationDeclined || 0) > 0 ? 'var(--color-danger)' : 'var(--color-success)' }}>
                                {stats.verificationPassed || 0} passed • {stats.verificationDeclined || 0} declined
                            </span>
                        </div>
                    </div>

                    <div className="hstat-card">
                        <div className="hstat-icon-wrap" style={{ background: 'rgba(245, 158, 11, 0.12)', color: 'var(--color-warning)' }}>
                            <ShoppingBag size={20} />
                        </div>
                        <div className="hstat-info">
                            <span className="hstat-label">Purchases (AAP)</span>
                            <span className="hstat-val">{stats.totalAaps || 0}</span>
                            <span className="hstat-sub">{stats.aapCompleted || 0} completed</span>
                        </div>
                    </div>

                    <div className="hstat-card">
                        <div className="hstat-icon-wrap" style={{ background: 'rgba(139, 92, 246, 0.12)', color: '#8b5cf6' }}>
                            <CreditCard size={20} />
                        </div>
                        <div className="hstat-info">
                            <span className="hstat-label">Total Volume</span>
                            <span className="hstat-val">₦{(stats.totalAapVolume || 0).toLocaleString()}</span>
                            <span className="hstat-sub">Completed purchases only</span>
                        </div>
                    </div>
                </div>

                {/* ── Filter Toolbar ── */}
                <div className="history-toolbar">
                    <div className="history-type-pills">
                        <button
                            type="button"
                            className={`hist-type-pill ${historyType === 'all' ? 'active' : ''}`}
                            onClick={() => { setHistoryType('all'); setHistoryPage(1); }}
                        >
                            All ({stats.totalActivities || 0})
                        </button>
                        <button
                            type="button"
                            className={`hist-type-pill ${historyType === 'verification' ? 'active' : ''}`}
                            onClick={() => { setHistoryType('verification'); setHistoryPage(1); }}
                        >
                            <Store size={14} /> Store Visits ({stats.totalVerifications || 0})
                        </button>
                        <button
                            type="button"
                            className={`hist-type-pill ${historyType === 'aap' ? 'active' : ''}`}
                            onClick={() => { setHistoryType('aap'); setHistoryPage(1); }}
                        >
                            <ShoppingBag size={14} /> Purchases ({stats.totalAaps || 0})
                        </button>
                        <button
                            type="button"
                            className={`hist-type-pill ${historyType === 'order' ? 'active' : ''}`}
                            onClick={() => { setHistoryType('order'); setHistoryPage(1); }}
                        >
                            <Package size={14} /> Consignments ({stats.totalOrders || 0})
                        </button>
                    </div>

                    <div className="history-filters-bar">
                        <form onSubmit={handleSearchSubmit} className="hist-search-wrap">
                            <Search size={16} className="hist-search-icon" />
                            <input
                                type="text"
                                className="hist-search-input"
                                placeholder="Search by trader, shop, ref, notes..."
                                value={historySearch}
                                onChange={(e) => setHistorySearch(e.target.value)}
                            />
                            {historySearch ? (
                                <button
                                    type="button"
                                    className="hist-search-clear"
                                    onClick={() => { setHistorySearch(''); setHistoryPage(1); }}
                                >
                                    <X size={14} />
                                </button>
                            ) : null}
                        </form>

                        <div className="hist-selects-row">
                            <div className="hist-select-wrap">
                                <Filter size={14} className="hist-select-icon" />
                                <select
                                    value={historyStatus}
                                    onChange={(e) => { setHistoryStatus(e.target.value); setHistoryPage(1); }}
                                    className="hist-select"
                                >
                                    <option value="all">All Statuses</option>
                                    <option value="completed">Completed / Approved</option>
                                    <option value="in_progress">In Progress / Review</option>
                                    <option value="declined">Declined</option>
                                    <option value="cancelled">Cancelled</option>
                                </select>
                            </div>

                            <div className="hist-select-wrap">
                                <ArrowUpDown size={14} className="hist-select-icon" />
                                <select
                                    value={historySort}
                                    onChange={(e) => { setHistorySort(e.target.value); setHistoryPage(1); }}
                                    className="hist-select"
                                >
                                    <option value="newest">Newest First</option>
                                    <option value="oldest">Oldest First</option>
                                    <option value="amount_high">Amount: High to Low</option>
                                    <option value="amount_low">Amount: Low to High</option>
                                </select>
                            </div>

                            <button
                                type="button"
                                className="hist-refresh-btn"
                                onClick={fetchAgentHistory}
                                title="Refresh History"
                            >
                                <RefreshCw size={15} className={historyLoading ? 'animate-spin' : ''} />
                            </button>
                        </div>
                    </div>
                </div>

                {/* ── Items List ── */}
                {historyLoading ? (
                    <div className="hist-loading-box">
                        <div className="fv-spinner-sm" />
                        <p>Loading activity history…</p>
                    </div>
                ) : items.length === 0 ? (
                    <div className="empty-tasks animate-fade-in" style={{ padding: '4rem 1rem' }}>
                        <div className="empty-icon-box" style={{ width: '80px', height: '80px', marginBottom: '1.5rem' }}>
                            <Package size={36} color="var(--color-text-secondary)" />
                        </div>
                        <h3 style={{ fontSize: '1.4rem', fontWeight: 800, marginBottom: '0.5rem' }}>
                            No Records Found
                        </h3>
                        <p style={{ color: 'var(--color-text-secondary)', fontSize: '0.95rem', maxWidth: '420px', margin: '0 auto 1.5rem' }}>
                            {historySearch || historyType !== 'all' || historyStatus !== 'all'
                                ? 'No activities matched your current filters. Try changing or clearing your search filters.'
                                : 'You have not completed any store visits, proxy purchases, or orders yet.'}
                        </p>
                        {(historySearch || historyType !== 'all' || historyStatus !== 'all') && (
                            <button
                                type="button"
                                className="btn btn-outline btn-sm"
                                onClick={() => {
                                    setHistoryType('all');
                                    setHistoryStatus('all');
                                    setHistorySearch('');
                                    setHistorySort('newest');
                                    setHistoryPage(1);
                                }}
                            >
                                Reset All Filters
                            </button>
                        )}
                    </div>
                ) : (
                    <div className="history-cards-grid">
                        {items.map((item) => {
                            const isVerification = item.type === 'verification';
                            const isAAP = item.type === 'aap';
                            const isOrder = item.type === 'order';

                            return (
                                <div
                                    key={`${item.type}-${item.id}`}
                                    className={`hist-card status-${item.statusBadge} animate-fade-in`}
                                >
                                    <div className="hist-card-head">
                                        <div className="hist-type-badge">
                                            {isVerification && <Store size={14} />}
                                            {isAAP && <ShoppingBag size={14} />}
                                            {isOrder && <Package size={14} />}
                                            <span>{item.typeLabel}</span>
                                        </div>
                                        <span className="hist-ref-pill">#{item.reference}</span>
                                        <span className={`hist-status-pill badge-${item.statusBadge}`}>
                                            {item.statusLabel}
                                        </span>
                                    </div>

                                    <div className="hist-card-body">
                                        <h4 className="hist-card-title">{item.title}</h4>

                                        <div className="hist-trader-row">
                                            <div className="hist-trader-chip">
                                                <User size={13} />
                                                <span className="hist-trader-name">{item.trader?.name || 'Trader'}</span>
                                                {item.trader?.phone && (
                                                    <span className="hist-trader-phone">• {item.trader.phone}</span>
                                                )}
                                            </div>
                                            {item.trader?.businessName && (
                                                <span className="hist-business-chip">
                                                    <Store size={12} /> {item.trader.businessName}
                                                </span>
                                            )}
                                        </div>

                                        {item.amount > 0 && (
                                            <div className="hist-amount-row">
                                                <span className="hist-amount-label">{item.amountLabel}:</span>
                                                <span className="hist-amount-val">₦{item.amount.toLocaleString()}</span>
                                            </div>
                                        )}

                                        {/* Rejection Note */}
                                        {item.reason && (
                                            <div className="hist-alert-box declined">
                                                <AlertTriangle size={15} className="hist-alert-icon" />
                                                <div>
                                                    <span className="hist-alert-title">
                                                        {item.rejectedByRole === 'agent' ? 'Field Agent Declined Reason:' : 'Rejection Reason:'}
                                                    </span>
                                                    <p className="hist-alert-text">"{item.reason}"</p>
                                                </div>
                                            </div>
                                        )}

                                        {/* Cancellation Note */}
                                        {item.cancellation && (
                                            <div className="hist-alert-box cancelled">
                                                <XCircle size={15} className="hist-alert-icon" />
                                                <div>
                                                    <span className="hist-alert-title">
                                                        Cancelled by {item.cancellation.cancelledBy}:
                                                    </span>
                                                    <p className="hist-alert-text">"{item.cancellation.reason}"</p>
                                                </div>
                                            </div>
                                        )}
                                    </div>

                                    <div className="hist-card-footer">
                                        <span className="hist-date-text">
                                            <Calendar size={13} />
                                            {new Date(item.date).toLocaleDateString('en-US', {
                                                month: 'short',
                                                day: 'numeric',
                                                year: 'numeric',
                                                hour: '2-digit',
                                                minute: '2-digit'
                                            })}
                                        </span>

                                        <div className="hist-card-actions">
                                            {isVerification ? (
                                                <button
                                                    type="button"
                                                    className="hist-action-btn"
                                                    onClick={() => setSelectedHistoryInspection(item)}
                                                >
                                                    <Eye size={14} /> View Inspection
                                                </button>
                                            ) : isAAP ? (
                                                <button
                                                    type="button"
                                                    className="hist-action-btn"
                                                    onClick={() => navigate(`/agent/aap/${item.id}`)}
                                                >
                                                    <ExternalLink size={14} /> View Purchase
                                                </button>
                                            ) : (
                                                <span className="hist-order-tag">Consignment Fulfilled</span>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}

                {/* ── Pagination Controls ── */}
                {pagination.totalPages > 1 && (
                    <div className="history-pagination">
                        <span className="hist-page-summary">
                            Page {pagination.page} of {pagination.totalPages} ({pagination.totalItems} total)
                        </span>

                        <div className="hist-page-buttons">
                            <button
                                type="button"
                                className="hist-page-btn"
                                onClick={() => setHistoryPage(p => Math.max(1, p - 1))}
                                disabled={!pagination.hasPrevPage}
                            >
                                Previous
                            </button>

                            {Array.from({ length: pagination.totalPages }, (_, i) => i + 1)
                                .filter(p => p === 1 || p === pagination.totalPages || Math.abs(p - pagination.page) <= 1)
                                .map((p, idx, arr) => {
                                    const showEllipsis = idx > 0 && p - arr[idx - 1] > 1;
                                    return (
                                        <React.Fragment key={p}>
                                            {showEllipsis && <span className="hist-ellipsis">…</span>}
                                            <button
                                                type="button"
                                                className={`hist-page-num ${p === pagination.page ? 'active' : ''}`}
                                                onClick={() => setHistoryPage(p)}
                                            >
                                                {p}
                                            </button>
                                        </React.Fragment>
                                    );
                                })}

                            <button
                                type="button"
                                className="hist-page-btn"
                                onClick={() => setHistoryPage(p => Math.min(pagination.totalPages, p + 1))}
                                disabled={!pagination.hasNextPage}
                            >
                                Next
                            </button>
                        </div>
                    </div>
                )}

                {/* ── Inspection Details Lightbox Modal ── */}
                {selectedHistoryInspection && (
                    <div className="fv-modal-overlay" onClick={() => setSelectedHistoryInspection(null)}>
                        <div className="fv-modal-card hist-modal-card" onClick={e => e.stopPropagation()}>
                            <div className="fv-modal-header">
                                <div className="fv-modal-icon-wrap" style={{ background: selectedHistoryInspection.statusBadge === 'danger' ? 'rgba(239, 68, 68, 0.12)' : 'rgba(16, 185, 129, 0.12)' }}>
                                    <Store size={22} color={selectedHistoryInspection.statusBadge === 'danger' ? 'var(--color-danger)' : 'var(--color-success)'} />
                                </div>
                                <div style={{ flex: 1 }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                        <h3 className="fv-modal-title">Store Verification Record</h3>
                                        <span className="hist-ref-pill">#{selectedHistoryInspection.reference}</span>
                                    </div>
                                    <p className="fv-modal-sub">
                                        Conducted on {new Date(selectedHistoryInspection.date).toLocaleDateString('en-US', { dateStyle: 'long' })}
                                    </p>
                                </div>
                                <button type="button" className="fv-modal-close" onClick={() => setSelectedHistoryInspection(null)}>
                                    <X size={18} />
                                </button>
                            </div>

                            <div className="hist-modal-body">
                                <div className="hist-modal-trader-box">
                                    <h4>{selectedHistoryInspection.trader?.name}</h4>
                                    <p>{selectedHistoryInspection.trader?.businessName} • {selectedHistoryInspection.trader?.phone}</p>
                                    <p className="hist-modal-address"><MapPin size={13} /> {selectedHistoryInspection.trader?.address}</p>
                                </div>

                                <div className="hist-modal-stats-row">
                                    <div className="hist-modal-stat">
                                        <span>Inspection Result</span>
                                        <strong className={`color-${selectedHistoryInspection.statusBadge}`}>
                                            {selectedHistoryInspection.statusLabel}
                                        </strong>
                                    </div>
                                    <div className="hist-modal-stat">
                                        <span>Verified Capital</span>
                                        <strong>₦{selectedHistoryInspection.amount?.toLocaleString() || 0}</strong>
                                    </div>
                                </div>

                                {selectedHistoryInspection.reason && (
                                    <div className="hist-alert-box declined" style={{ marginTop: '12px' }}>
                                        <AlertTriangle size={16} />
                                        <div>
                                            <strong>Declined Reason:</strong>
                                            <p style={{ margin: '4px 0 0', fontStyle: 'italic' }}>"{selectedHistoryInspection.reason}"</p>
                                        </div>
                                    </div>
                                )}

                                {selectedHistoryInspection.details?.storePhotoUrl && (
                                    <div className="hist-modal-photo-wrap">
                                        <span className="hist-modal-photo-label">Premises Photo Evidence</span>
                                        <img
                                            src={selectedHistoryInspection.details.storePhotoUrl}
                                            alt="Store premises inspection"
                                            className="hist-modal-photo"
                                        />
                                    </div>
                                )}
                            </div>

                            <div className="fv-modal-footer">
                                <button
                                    type="button"
                                    className="btn btn-primary btn-sm"
                                    onClick={() => setSelectedHistoryInspection(null)}
                                >
                                    Close Inspection Record
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        );
    };

    if (loading) return (
        <div className="flex items-center justify-center min-h-screen">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2" style={{ borderColor: 'var(--color-brand)' }}></div>
        </div>
    );

    const displayedTasks = activeTab === 'active' ? [...activeTasks, ...activeAap] : historyTasks;

    return (
        <div className="agent-dashboard-container animate-fade-in">
            <header className="page-hero">
                <div className="page-hero-icon">
                    <ShieldCheck size={24} />
                </div>
                <div className="page-hero-body">
                    <h1 className="page-hero-title">Agent Portal</h1>
                    <p className="page-hero-subtitle">Murabaha Fulfillment & Verification</p>
                    <p style={{fontSize: '0.85rem', color: 'var(--color-text-secondary)', marginTop: '0.25rem'}}>Hello, {user?.name}</p>
                </div>
                <div className="page-hero-actions">
                    <div className="agent-badge">
                        <ShieldCheck size={20} /> <span style={{letterSpacing: '0.02em'}}>Verified Amana Agent</span>
                    </div>
                </div>
            </header>

            <section className="agent-role-card animate-slide-up">
                <div className="role-icon-box">🛡️</div>
                <div className="role-text">
                    <h3>Murabaha Facilitator Role</h3>
                    <p>You represent Amana in the purchase process. Securely visit the vendor, verify the presence and quality of goods, and settle payment. Once settled, you officially take possession of the goods on behalf of Amana before delivery to the buyer.</p>
                </div>
            </section>

            {pendingVisits.length > 0 && (
                <section className="pending-visits-section animate-slide-up">
                    <div className="pending-visits-header" onClick={() => setShowVisits(!showVisits)} style={{ cursor: 'pointer' }}>
                        <div className="pending-visits-left">
                            <ClipboardList size={20} style={{ color: 'var(--color-brand)' }} />
                            <h3>Trader Onboarding Field Visits</h3>
                            <span className="pending-visits-badge">{pendingVisits.length}</span>
                        </div>
                        <ChevronRight size={18} style={{ transform: showVisits ? 'rotate(90deg)' : 'none', transition: 'transform 0.2s', color: 'var(--color-text-tertiary)' }} />
                    </div>
                    {showVisits && (
                        <div className="pending-visits-list">
                            {pendingVisits.map(trader => (
                                <div key={trader._id} className="pending-visit-item" onClick={() => navigate(`/agent/field-visit/${trader._id}`)}>
                                    <div className="visit-item-avatar">
                                        {trader.name?.charAt(0)?.toUpperCase() || 'T'}
                                    </div>
                                    <div className="visit-item-info">
                                        <span className="visit-item-name">{trader.name}</span>
                                        <span className="visit-item-detail">{trader.phone} — {trader.businessInfo?.businessName || 'No business name'}</span>
                                        <span className="visit-item-date">Registered {new Date(trader.createdAt).toLocaleDateString()}</span>
                                    </div>
                                    <ChevronRight size={16} style={{ color: 'var(--color-text-tertiary)', flexShrink: 0 }} />
                                </div>
                            ))}
                        </div>
                    )}
                </section>
            )}

            {pendingTraderRequests.length > 0 && (
                <section className="trader-requests-alert-section animate-slide-up">
                    <div className="trader-requests-alert-card">
                        <div className="tra-icon">
                            <ShoppingBag size={24} />
                        </div>
                        <div className="tra-body">
                            <div className="tra-pill">
                                <span>ACTION REQUIRED</span>
                            </div>
                            <h3>{pendingTraderRequests.length} Trader Purchase Request{pendingTraderRequests.length > 1 ? 's' : ''}</h3>
                            <p>
                                <strong>{pendingTraderRequests[0]?.retailer?.name || 'A trader'}</strong> requested you to buy inventory: <em>"{pendingTraderRequests[0]?.traderRequestNote || 'Goods purchase'}"</em>
                            </p>
                        </div>
                        <button 
                            className="tra-fulfill-btn"
                            onClick={() => navigate(`/agent/aap/new?aapId=${pendingTraderRequests[0]._id}`)}
                        >
                            <span>Fulfill Request</span>
                            <ArrowRight size={16} />
                        </button>
                    </div>
                </section>
            )}

            <section className="tasks-section">
                <div className="tasks-header-row">
                    <div className="flex items-center gap-4">
                        <div style={{ width: '6px', height: '32px', background: 'var(--color-brand)', borderRadius: '3px', boxShadow: '0 0 15px var(--color-brand)' }}></div>
                        <h2 style={{ fontSize: '1.85rem', fontWeight: 900, letterSpacing: '-0.03em' }}>
                            {activeTab === 'active' ? 'Active Assignments' : 'Task History'}
                        </h2>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)' }}>
                        <div className="tab-pill-container">
                            <button 
                                onClick={() => setActiveTab('active')}
                                className={`tab-pill ${activeTab === 'active' ? 'active' : ''}`}
                            >
                                Active <span className="tab-count">{activeTasks.length + activeAap.length}</span>
                            </button>
                            <button 
                                onClick={() => setActiveTab('history')}
                                className={`tab-pill ${activeTab === 'history' ? 'active' : ''}`}
                            >
                                History <span className="tab-count">{historyData.stats?.totalActivities ?? historyTasks.length}</span>
                            </button>
                        </div>
                    </div>
                </div>
                
                {activeTab === 'history' ? (
                    renderHistoryView()
                ) : displayedTasks.length === 0 ? (
                    <div className="empty-tasks animate-fade-in" style={{ padding: '6rem 0' }}>
                        <div className="empty-icon-box" style={{ width: '120px', height: '120px', marginBottom: '2rem' }}>
                            <Package size={50} color="var(--color-text-secondary)" />
                        </div>
                        <h2 style={{ fontSize: '2rem', fontWeight: 900, marginBottom: '0.5rem' }}>
                            No Assignments
                        </h2>
                        <p style={{ color: 'var(--color-text-secondary)', fontSize: '1.1rem' }}>
                            No active assignments or proxy purchases at this moment.
                        </p>
                    </div>
                ) : (
                    <div className="tasks-grid">
                        {displayedTasks.map((item) => {
                            const isAAP = item.productName !== undefined; // Detect AAP vs Order
                            const isTraderInitiated = isAAP && item.status === 'trader_initiated';
                            const isCancelled = item.status === 'cancelled';
                            const availableTraderCredit = item.retailer 
                                ? Math.max(0, (item.retailer.creditLimit || 0) - (item.retailer.usedCredit || 0))
                                : 0;
                            
                            return (
                                <div 
                                    key={item._id} 
                                    className={`agent-task-card animate-scale-up ${isTraderInitiated ? 'trader-req-card' : ''} ${isCancelled ? 'cancelled-card' : ''}`}
                                    onClick={() => isAAP ? navigate(`/agent/aap/${item._id}`) : null}
                                    style={{ cursor: isAAP ? 'pointer' : 'default' }}
                                >
                                    <div className="task-card-header">
                                        <div className="task-id-tag">
                                            <span className="tag-label">
                                                {isTraderInitiated ? 'DIRECT TRADER REQUEST' : isCancelled ? 'CANCELLED RECORD' : isAAP ? 'AAP REF' : 'TRANSACTION REF'}
                                            </span>
                                            <span className="tag-value">#AMN-{item._id.substring(item._id.length - 8).toUpperCase()}</span>
                                        </div>
                                        <div className={`status-pill ${item.isPaid ? 'repaid' : item.status}`}>
                                            {isTraderInitiated ? 'NEW REQUEST' : (item.isPaid ? 'repaid' : item.status).replace(/_/g, ' ')}
                                        </div>
                                    </div>

                                    <div className="task-card-body">
                                        {/* CASE 1: Trader Initiated AAP - Clean, specialized request view */}
                                        {isTraderInitiated ? (
                                            <>
                                                <div className="info-block-premium trader-req-block">
                                                    <div className="block-header">
                                                        <ShoppingBag size={14} /> REQUESTED INVENTORY
                                                    </div>
                                                    <div className="block-content">
                                                        <p className="trader-req-goods-text">
                                                            "{item.traderRequestNote || item.productName || 'Inventory purchase request'}"
                                                        </p>
                                                        <span className="trader-req-timestamp">
                                                            Requested on {new Date(item.createdAt).toLocaleDateString()} at {new Date(item.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                        </span>
                                                    </div>
                                                </div>

                                                <div className="info-block-premium">
                                                    <div className="block-header">
                                                        <User size={14} /> TRADER (BUYER)
                                                    </div>
                                                    <div className="block-content">
                                                        <div className="entity-name">{item.retailer?.name || 'Verified Trader'}</div>
                                                        <div className="entity-detail">
                                                            {item.retailer?.phone} {item.retailer?.businessInfo?.businessName ? `• ${item.retailer.businessInfo.businessName}` : ''}
                                                        </div>
                                                        {item.retailer && (
                                                            <TraderCreditCard 
                                                                retailer={item.retailer} 
                                                                variant="compact"
                                                                title="TRADER AVAILABLE CREDIT"
                                                            />
                                                        )}
                                                    </div>
                                                </div>
                                            </>
                                        ) : isCancelled ? (
                                            /* CASE 2: Cancelled Card - Rich Cancellation Report */
                                            <>
                                                <div className="info-block-premium cancellation-report-block">
                                                    <div className="block-header text-danger">
                                                        <AlertTriangle size={14} color="#ef4444" /> CANCELLATION DETAILS
                                                    </div>
                                                    <div className="block-content">
                                                        <div className="cancel-meta-row">
                                                            <span className="cancel-meta-label">Cancelled By:</span>
                                                            <strong className="cancel-meta-val">
                                                                {item.cancelledBy?.name || (item.cancelReason?.toLowerCase().includes('trader') ? 'Trader' : 'Agent / Admin')}
                                                            </strong>
                                                        </div>
                                                        <div className="cancel-meta-row">
                                                            <span className="cancel-meta-label">Reason:</span>
                                                            <span className="cancel-reason-quote">
                                                                "{item.cancelReason || 'Cancelled before approval'}"
                                                            </span>
                                                        </div>
                                                        {item.cancelledAt && (
                                                            <div className="cancel-meta-row">
                                                                <span className="cancel-meta-label">Date:</span>
                                                                <span className="cancel-meta-date">
                                                                    {new Date(item.cancelledAt).toLocaleString()}
                                                                </span>
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>

                                                <div className="info-block-premium">
                                                    <div className="block-header">
                                                        <Package size={14} /> RECORDED PRODUCT
                                                    </div>
                                                    <div className="block-content">
                                                        <div className="entity-name">
                                                            {item.productName || item.traderRequestNote || item.orderItems?.[0]?.name || 'Consignment'}
                                                        </div>
                                                        {item.purchasePrice > 0 && (
                                                            <div className="entity-detail">
                                                                Estimated Price: ₦{item.purchasePrice.toLocaleString()}
                                                            </div>
                                                        )}
                                                        <div className="entity-detail">
                                                            Trader: {item.retailer?.name || 'Retailer'} ({item.retailer?.phone || 'N/A'})
                                                        </div>
                                                    </div>
                                                </div>
                                            </>
                                        ) : (
                                            /* CASE 3: Standard Active / Completed AAP or Order */
                                            <>
                                                <div className="info-block-premium">
                                                    <div className="block-header">
                                                        <Package size={14} /> {isAAP ? 'PRODUCT' : 'ORDER CONSIGNMENT'}
                                                    </div>
                                                    <div className="block-content">
                                                        {isAAP ? (
                                                            <div className="mini-item-row">
                                                                <span className="item-name-text">{item.productName || item.traderRequestNote || 'Goods purchase'}</span>
                                                            </div>
                                                        ) : (
                                                            item.orderItems.map((oi, idx) => (
                                                                <div key={idx} className="mini-item-row">
                                                                    <span className="item-name-text">{oi.name}</span>
                                                                    <span className="item-qty-pill">{oi.qty}x</span>
                                                                </div>
                                                            ))
                                                        )}
                                                        <div className="price-summary">
                                                            <span className="price-label">{isAAP ? 'Purchase Price' : 'Net Murabaha Value'}</span>
                                                            <span className="price-value">₦{(isAAP ? (item.purchasePrice || 0) : item.itemsPrice).toLocaleString()}</span>
                                                        </div>
                                                    </div>
                                                </div>

                                                {/* Only render Seller block if seller name actually exists */}
                                                {(isAAP ? item.sellerName : item.vendor?.businessName) && (
                                                    <div className="info-block-premium">
                                                        <div className="block-header">
                                                            <MapPin size={14} /> {isAAP ? 'SELLER' : 'SETTLEMENT POINT'}
                                                        </div>
                                                        <div className="block-content">
                                                            <div className="entity-name">{isAAP ? item.sellerName : item.vendor?.businessName}</div>
                                                            <div className="entity-detail">{isAAP ? item.sellerLocation : (item.vendor?.address || 'Verification required on site')}</div>
                                                            {isAAP ? (
                                                                item.sellerPhone && (
                                                                    <a href={`tel:${item.sellerPhone}`} className="contact-btn-premium" onClick={e => e.stopPropagation()}>
                                                                        <PhoneOutgoing size={14} /> Contact Seller
                                                                    </a>
                                                                )
                                                            ) : (
                                                                <a href={`tel:${item.vendor?.phones?.[0]}`} className="contact-btn-premium" onClick={e => e.stopPropagation()}>
                                                                    <PhoneOutgoing size={14} /> Contact Vendor
                                                                </a>
                                                            )}
                                                        </div>
                                                    </div>
                                                )}

                                                <div className="info-block-premium">
                                                    <div className="block-header">
                                                        <User size={14} /> {isAAP ? 'RETAILER' : 'TARGET RETAILER'}
                                                    </div>
                                                    <div className="block-content">
                                                        <div className="entity-name">{item.retailer?.name || 'Unlinked'}</div>
                                                        <div className="entity-detail">{item.retailer?.phone || 'Verified Buyer'}</div>
                                                        {item.retailer && (
                                                            <TraderCreditCard 
                                                                retailer={item.retailer} 
                                                                variant="compact"
                                                                title="BUYER CREDIT LIMIT"
                                                            />
                                                        )}
                                                        {item.retailer?.email && (
                                                            <a href={`mailto:${item.retailer.email}`} className="contact-btn-premium" onClick={e => e.stopPropagation()}>
                                                                <Mail size={14} /> Message Buyer
                                                            </a>
                                                        )}
                                                    </div>
                                                </div>
                                            </>
                                        )}
                                    </div>

                                    <div className="task-card-footer">
                                        {isAAP ? (
                                            isTraderInitiated ? (
                                                <button 
                                                    className="settle-action-btn fulfill-btn"
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        navigate(`/agent/aap/new?aapId=${item._id}`);
                                                    }}
                                                >
                                                    <ShoppingBag size={18} /> Fulfill Request & Buy Goods
                                                </button>
                                            ) : isCancelled ? (
                                                <div className="instruction-pill danger">
                                                    <AlertTriangle size={14} /> Cancelled — No Funds Disbursed
                                                </div>
                                            ) : item.status === 'fund_disbursed' ? (
                                                <button 
                                                    className="settle-action-btn"
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        handleSendMurabahaOffer(item._id);
                                                    }}
                                                >
                                                    <CheckCircle size={20} /> Send Murabaha Offer
                                                </button>
                                            ) : item.status === 'pending_murabaha_acceptance' ? (
                                                <div className="instruction-pill" style={{ borderColor: '#f59e0b', color: '#f59e0b' }}>
                                                    Murabaha Offer Sent - Awaiting Acceptance
                                                </div>
                                            ) : item.status === 'murabaha_accepted' ? (
                                                <button 
                                                    className="settle-action-btn"
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        handleMarkDelivered(item._id);
                                                    }}
                                                >
                                                    <CheckCircle size={20} /> Mark as Delivered (Get OTP)
                                                </button>
                                            ) : (
                                                <div className="instruction-pill">
                                                    Status: {item.status.replace(/_/g, ' ')}
                                                </div>
                                            )
                                        ) : (
                                            item.status === 'ready_for_pickup' ? (
                                                <button 
                                                    className="settle-action-btn"
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        handleSettleVendor(item._id);
                                                    }}
                                                >
                                                    <ShieldCheck size={20} /> Authorize Vendor Settlement
                                                </button>
                                            ) : item.status === 'pending_vendor' ? (
                                                <div className="instruction-pill">
                                                    Awaiting Vendor Confirmation
                                                </div>
                                            ) : (
                                                <div className="instruction-pill success">
                                                    <ShieldCheck size={16} /> Transaction Verified & Settled
                                                </div>
                                            )
                                        )}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </section>
        </div>
    );
};

export default AgentDashboard;
