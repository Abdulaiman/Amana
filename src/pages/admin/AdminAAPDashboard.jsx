import React, { useState, useEffect, useMemo } from 'react';
import { createPortal } from 'react-dom';
import api from '../../services/api';
import { useToast } from '../../context/ToastContext';
import { 
    ShoppingBag, CheckCircle, Clock, AlertTriangle, X, Eye, 
    DollarSign, User, Calendar, ClipboardList, Search, FileText, 
    ShieldCheck, Scale, BookOpen, ExternalLink, ZoomIn, Phone, 
    Store, Building2, Check, ArrowRight, Filter, ChevronRight, 
    XCircle, RefreshCw, AlertCircle, ArrowUpRight, Award, 
    ShieldAlert, Sparkles, SlidersHorizontal, Trash2, CheckCircle2,
    LayoutGrid, List, Copy, CheckCheck
} from 'lucide-react';
import ContractModal from '../../components/ContractModal';
import { generateDeedOfUndertaking, generateMurabahaContract } from '../../utils/contractTemplates';
import './AdminAAPDashboard.css';

const AdminAAPDashboard = () => {
    const { addToast } = useToast();
    const [aaps, setAAPs] = useState([]);
    const [stats, setStats] = useState({});
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState(''); // Default to all requests so user sees records immediately
    const [searchTerm, setSearchTerm] = useState('');
    const [sortBy, setSortBy] = useState('newest');
    const [viewMode, setViewMode] = useState('grid'); // 'grid' | 'table'
    const [copiedRef, setCopiedRef] = useState(null);
    const [selectedAAP, setSelectedAAP] = useState(null);
    const [disbursementForm, setDisbursementForm] = useState({
        method: 'bank_transfer',
        reference: '',
        duration: null
    });
    const [actionLoading, setActionLoading] = useState(false);
    const [contractModalDoc, setContractModalDoc] = useState(null);
    const [showContractModal, setShowContractModal] = useState(false);

    // Decline dialog state
    const [showDeclineModal, setShowDeclineModal] = useState(false);
    const [declineReason, setDeclineReason] = useState('');
    const [declineTargetId, setDeclineTargetId] = useState(null);

    // Lightbox / Image inspection state
    const [inspectImage, setInspectImage] = useState(null);
    const [inspectTitle, setInspectTitle] = useState('');

    // Handle ESC key to dismiss modal stack in reverse order and lock body scroll
    useEffect(() => {
        const anyModalOpen = !!(selectedAAP || showDeclineModal || inspectImage);
        if (!anyModalOpen) return;

        const handleKeyDown = (e) => {
            if (e.key === 'Escape') {
                if (inspectImage) {
                    setInspectImage(null);
                } else if (showDeclineModal) {
                    if (!actionLoading) setShowDeclineModal(false);
                } else if (selectedAAP && !showContractModal) {
                    setSelectedAAP(null);
                }
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        const origOverflow = document.body.style.overflow;
        document.body.style.overflow = 'hidden';

        return () => {
            window.removeEventListener('keydown', handleKeyDown);
            document.body.style.overflow = origOverflow;
        };
    }, [selectedAAP, showDeclineModal, inspectImage, actionLoading, showContractModal]);

    // Fetch all AAP orders for instant snappy local filtering & zero-wait tab switches
    const fetchAAPs = async () => {
        try {
            setLoading(true);
            const res = await api.get('/aap/admin/dashboard');
            setAAPs(res.data.aaps || []);
            setStats(res.data.stats || {});
        } catch (err) {
            console.error('Failed to fetch AAP dashboard data', err);
            addToast('Could not load agent purchase requests', 'error');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchAAPs();
    }, []);

    // Keep selectedAAP in sync if aaps array refreshes
    useEffect(() => {
        if (selectedAAP) {
            const updated = aaps.find(a => a._id === selectedAAP._id);
            if (updated) {
                setSelectedAAP(updated);
            }
        }
    }, [aaps]);

    const handleCopyRef = (e, refCode) => {
        e.stopPropagation();
        if (!refCode) return;
        navigator.clipboard.writeText(refCode);
        setCopiedRef(refCode);
        addToast(`Copied ${refCode} to clipboard`, 'success');
        setTimeout(() => setCopiedRef(null), 2000);
    };

    // Calculate dynamic tab counts from full aaps set
    const tabCounts = useMemo(() => {
        return {
            all: aaps.length,
            pending_admin_approval: aaps.filter(a => a.status === 'pending_admin_approval').length,
            fund_disbursed: aaps.filter(a => a.status === 'fund_disbursed').length,
            pending_murabaha_acceptance: aaps.filter(a => a.status === 'pending_murabaha_acceptance').length,
            murabaha_accepted: aaps.filter(a => a.status === 'murabaha_accepted').length,
            delivered: aaps.filter(a => a.status === 'delivered').length,
            completed: aaps.filter(a => ['received', 'completed'].includes(a.status)).length,
            cancellation_requested: aaps.filter(a => a.status === 'cancellation_requested').length,
            declined: aaps.filter(a => a.status === 'declined').length,
            cancelled: aaps.filter(a => a.status === 'cancelled').length,
            expired: aaps.filter(a => a.status === 'expired').length
        };
    }, [aaps]);

    // Calculate financial volume analytics
    const financialMetrics = useMemo(() => {
        let totalProcuredVolume = 0;
        let totalRetailerFinanced = 0;
        let activeDisbursedVolume = 0;
        let completedVolume = 0;

        aaps.forEach(aap => {
            const cost = aap.purchasePrice || 0;
            const retTotal = aap.totalRetailerCost || 0;
            totalProcuredVolume += cost;
            totalRetailerFinanced += retTotal;

            if (['fund_disbursed', 'pending_murabaha_acceptance', 'murabaha_accepted'].includes(aap.status)) {
                activeDisbursedVolume += cost;
            }
            if (['received', 'completed'].includes(aap.status)) {
                completedVolume += retTotal;
            }
        });

        return {
            totalProcuredVolume,
            totalRetailerFinanced,
            activeDisbursedVolume,
            completedVolume
        };
    }, [aaps]);

    const handleApprove = async (aapId) => {
        if (!disbursementForm.method) {
            addToast('Please select a disbursement method', 'warning');
            return;
        }
        setActionLoading(true);
        try {
            const duration = disbursementForm.duration ? Number(disbursementForm.duration) : undefined;
            await api.put(`/aap/${aapId}/approve`, {
                disbursementMethod: disbursementForm.method,
                disbursementReference: disbursementForm.reference,
                duration
            });
            addToast('AAP Approved! Funds disbursed to field agent.', 'success');
            setSelectedAAP(null);
            fetchAAPs();
        } catch (err) {
            addToast(err.response?.data?.message || 'Failed to approve', 'error');
        } finally {
            setActionLoading(false);
        }
    };

    const promptDecline = (aapId) => {
        setDeclineTargetId(aapId);
        setDeclineReason('');
        setShowDeclineModal(true);
    };

    const handleConfirmDecline = async () => {
        const targetId = declineTargetId || selectedAAP?._id;
        if (!targetId) return;

        setActionLoading(true);
        try {
            const reason = declineReason.trim() || 'Declined by admin';
            await api.put(`/aap/${targetId}/decline`, { reason });
            addToast('Purchase request declined successfully', 'info');
            setShowDeclineModal(false);
            setDeclineReason('');
            setDeclineTargetId(null);
            setSelectedAAP(null);
            fetchAAPs();
        } catch (err) {
            addToast(err.response?.data?.message || 'Failed to decline purchase request', 'error');
        } finally {
            setActionLoading(false);
        }
    };

    const handleApproveCancellation = async (aapId) => {
        if (!window.confirm('Have you verified the refund receipt and confirmed that the funds have been returned to the Amana account?')) return;

        setActionLoading(true);
        try {
            await api.put(`/aap/${aapId}/approve-cancellation`);
            addToast('Cancellation approved! Treasury cash return verified.', 'success');
            setSelectedAAP(null);
            fetchAAPs();
        } catch (err) {
            addToast(err.response?.data?.message || 'Failed to approve cancellation', 'error');
        } finally {
            setActionLoading(false);
        }
    };

    const getStatusMeta = (status) => {
        switch (status) {
            case 'draft': 
                return { label: 'Draft', badgeClass: 'badge-neutral', bg: 'rgba(148, 163, 184, 0.12)', color: '#64748b', dotColor: '#94a3b8' };
            case 'awaiting_retailer_confirm': 
                return { label: 'Awaiting Undertaking', badgeClass: 'badge-warning', bg: 'rgba(245, 158, 11, 0.12)', color: '#d97706', dotColor: '#f59e0b' };
            case 'pending_admin_approval': 
                return { label: 'Pending Approval', badgeClass: 'badge-warning', bg: 'rgba(245, 158, 11, 0.15)', color: '#b45309', dotColor: '#f59e0b' };
            case 'fund_disbursed': 
                return { label: 'Funds Disbursed', badgeClass: 'badge-info', bg: 'rgba(37, 99, 235, 0.12)', color: '#1d4ed8', dotColor: '#3b82f6' };
            case 'pending_murabaha_acceptance': 
                return { label: 'Murabaha Pending', badgeClass: 'badge-primary', bg: 'rgba(124, 58, 237, 0.12)', color: '#6d28d9', dotColor: '#8b5cf6' };
            case 'murabaha_accepted': 
                return { label: 'Murabaha Signed', badgeClass: 'badge-success', bg: 'rgba(16, 185, 129, 0.12)', color: '#047857', dotColor: '#10b981' };
            case 'delivered': 
                return { label: 'Delivered (OTP)', badgeClass: 'badge-info', bg: 'rgba(13, 148, 136, 0.12)', color: '#0f766e', dotColor: '#14b8a6' };
            case 'cancellation_requested': 
                return { label: 'Refund Requested', badgeClass: 'badge-danger', bg: 'rgba(239, 68, 68, 0.15)', color: '#b91c1c', dotColor: '#ef4444' };
            case 'received':
            case 'completed': 
                return { label: 'Completed', badgeClass: 'badge-success', bg: 'rgba(16, 185, 129, 0.15)', color: '#047857', dotColor: '#10b981' };
            case 'expired': 
                return { label: 'Expired (Alert)', badgeClass: 'badge-danger', bg: 'rgba(239, 68, 68, 0.15)', color: '#b91c1c', dotColor: '#ef4444' };
            case 'declined': 
                return { label: 'Declined', badgeClass: 'badge-danger', bg: 'rgba(100, 116, 139, 0.15)', color: '#475569', dotColor: '#94a3b8' };
            case 'cancelled': 
                return { label: 'Cancelled', badgeClass: 'badge-danger', bg: 'rgba(239, 68, 68, 0.15)', color: '#b91c1c', dotColor: '#ef4444' };
            default: 
                return { label: status || 'Unknown', badgeClass: 'badge-neutral', bg: 'rgba(148, 163, 184, 0.12)', color: '#64748b', dotColor: '#94a3b8' };
        }
    };

    // Instant local Filter & Sort
    const filteredAAPs = useMemo(() => {
        let result = aaps.filter(aap => {
            // Status Tab Filtering
            if (filter) {
                if (filter === 'completed') {
                    if (!['received', 'completed'].includes(aap.status)) return false;
                } else if (aap.status !== filter) {
                    return false;
                }
            }

            // Search Term Filtering
            if (searchTerm) {
                const term = searchTerm.toLowerCase().trim();
                const refCode = aap._id ? `AMN-${aap._id.slice(-8).toUpperCase()}` : '';
                const retPhone = aap.retailer?.phone || '';
                const agentPhone = aap.agent?.phone || '';
                const matches = (
                    aap.productName?.toLowerCase().includes(term) ||
                    aap.retailer?.name?.toLowerCase().includes(term) ||
                    retPhone.includes(term) ||
                    aap.agent?.name?.toLowerCase().includes(term) ||
                    agentPhone.includes(term) ||
                    aap.sellerName?.toLowerCase().includes(term) ||
                    refCode.toLowerCase().includes(term)
                );
                if (!matches) return false;
            }

            return true;
        });

        // Apply Sorting
        result = [...result].sort((a, b) => {
            if (sortBy === 'newest') return new Date(b.createdAt || 0) - new Date(a.createdAt || 0);
            if (sortBy === 'oldest') return new Date(a.createdAt || 0) - new Date(b.createdAt || 0);
            if (sortBy === 'amount_high') return (b.purchasePrice || 0) - (a.purchasePrice || 0);
            if (sortBy === 'amount_low') return (a.purchasePrice || 0) - (b.purchasePrice || 0);
            if (sortBy === 'retailer_total_high') return (b.totalRetailerCost || 0) - (a.totalRetailerCost || 0);
            if (sortBy === 'expiring_soon') {
                if (!a.expiresAt) return 1;
                if (!b.expiresAt) return -1;
                return new Date(a.expiresAt) - new Date(b.expiresAt);
            }
            return 0;
        });

        return result;
    }, [aaps, filter, searchTerm, sortBy]);

    return (
        <div className="admin-page-container aap-dashboard-container animate-fade-in">
            {/* ── Executive Section Header ── */}
            <div className="admin-section-header aap-main-header">
                <div className="admin-section-header-left">
                    <div className="section-icon-badge aap-header-badge">
                        <ShoppingBag size={28} />
                    </div>
                    <div>
                        <div className="aap-header-eyebrow">
                            <span className="aap-eyebrow-pill">SHARIA PROTOCOL</span>
                            <span className="aap-eyebrow-text">AAP COMMAND</span>
                        </div>
                        <h1 className="admin-section-title">Procurement & Sharia Contracts Center</h1>
                        <p className="admin-section-subtitle">
                            Oversee off-platform inventory sourcing, execute Deeds of Undertaking (Wa'd), approve agent disbursements, and verify Murabaha handoffs.
                        </p>
                    </div>
                </div>

                <div className="admin-section-header-actions aap-header-actions">
                    {tabCounts.pending_admin_approval > 0 && (
                        <button 
                            className="aap-urgent-action-btn animate-pulse"
                            onClick={() => setFilter('pending_admin_approval')}
                            title="Filter to orders requiring immediate disbursement"
                        >
                            <AlertCircle size={15} />
                            <span>{tabCounts.pending_admin_approval} Needs Action</span>
                        </button>
                    )}

                    <div className="aap-header-volume-chip" title="Total procurement volume across Nigeria">
                        <span className="volume-label">Total Volume:</span>
                        <span className="volume-val">₦{financialMetrics.totalProcuredVolume.toLocaleString()}</span>
                    </div>

                    <button 
                        className="btn btn-secondary btn-sm aap-refresh-btn" 
                        onClick={fetchAAPs}
                        disabled={loading}
                        title="Reload latest records from database"
                    >
                        <RefreshCw size={14} className={loading ? 'spin-icon' : ''} />
                        <span>Refresh</span>
                    </button>
                </div>
            </div>

            {/* ── Executive Financial & Operational KPI Ribbon ── */}
            <div className="aap-kpi-grid">
                {/* Total Orders */}
                <div 
                    className={`aap-stat-card ${filter === '' ? 'active' : ''}`}
                    onClick={() => setFilter('')}
                >
                    <div className="stat-card-top">
                        <div className="stat-icon-wrap neutral">
                            <ClipboardList size={20} />
                        </div>
                        <span className="stat-card-tag neutral">All Orders</span>
                    </div>
                    <div className="stat-card-body">
                        <div className="stat-card-num">{tabCounts.all}</div>
                        <div className="stat-card-label">Total Purchases</div>
                        <div className="stat-card-sub">₦{financialMetrics.totalProcuredVolume.toLocaleString()} Procured</div>
                    </div>
                </div>

                {/* Pending Approval */}
                <div 
                    className={`aap-stat-card ${filter === 'pending_admin_approval' ? 'active' : ''} ${tabCounts.pending_admin_approval > 0 ? 'highlight-warning' : ''}`}
                    onClick={() => setFilter('pending_admin_approval')}
                >
                    <div className="stat-card-top">
                        <div className="stat-icon-wrap warning">
                            <Clock size={20} />
                        </div>
                        <span className="stat-card-tag warning">
                            {tabCounts.pending_admin_approval > 0 ? 'Action' : 'Awaiting'}
                        </span>
                    </div>
                    <div className="stat-card-body">
                        <div className="stat-card-num warning-text">{tabCounts.pending_admin_approval}</div>
                        <div className="stat-card-label">Pending Approval</div>
                        <div className="stat-card-sub">Requires Fund Release</div>
                    </div>
                </div>

                {/* Active Sourcing */}
                <div 
                    className={`aap-stat-card ${filter === 'fund_disbursed' ? 'active' : ''}`}
                    onClick={() => setFilter('fund_disbursed')}
                >
                    <div className="stat-card-top">
                        <div className="stat-icon-wrap info">
                            <ShoppingBag size={20} />
                        </div>
                        <span className="stat-card-tag info">In Field</span>
                    </div>
                    <div className="stat-card-body">
                        <div className="stat-card-num info-text">{tabCounts.fund_disbursed}</div>
                        <div className="stat-card-label">Active Sourcing</div>
                        <div className="stat-card-sub">₦{financialMetrics.activeDisbursedVolume.toLocaleString()} in Market</div>
                    </div>
                </div>

                {/* Contract Stage */}
                <div 
                    className={`aap-stat-card ${['pending_murabaha_acceptance', 'murabaha_accepted'].includes(filter) ? 'active' : ''}`}
                    onClick={() => setFilter('pending_murabaha_acceptance')}
                >
                    <div className="stat-card-top">
                        <div className="stat-icon-wrap primary">
                            <Scale size={20} />
                        </div>
                        <span className="stat-card-tag primary">Contracts</span>
                    </div>
                    <div className="stat-card-body">
                        <div className="stat-card-num primary-text">{tabCounts.pending_murabaha_acceptance + tabCounts.murabaha_accepted}</div>
                        <div className="stat-card-label">Murabaha Contracts</div>
                        <div className="stat-card-sub">{tabCounts.murabaha_accepted} Signed • {tabCounts.pending_murabaha_acceptance} Pending</div>
                    </div>
                </div>

                {/* Settled & Completed */}
                <div 
                    className={`aap-stat-card ${filter === 'completed' ? 'active' : ''}`}
                    onClick={() => setFilter('completed')}
                >
                    <div className="stat-card-top">
                        <div className="stat-icon-wrap success">
                            <CheckCircle2 size={20} />
                        </div>
                        <span className="stat-card-tag success">Settled</span>
                    </div>
                    <div className="stat-card-body">
                        <div className="stat-card-num success-text">{tabCounts.completed}</div>
                        <div className="stat-card-label">Completed Orders</div>
                        <div className="stat-card-sub">₦{financialMetrics.completedVolume.toLocaleString()} Finalized</div>
                    </div>
                </div>

                {/* Refunds / Alerts */}
                <div 
                    className={`aap-stat-card ${['cancellation_requested', 'expired', 'declined'].includes(filter) ? 'active' : ''} ${(tabCounts.cancellation_requested > 0 || tabCounts.expired > 0) ? 'highlight-danger' : ''}`}
                    onClick={() => setFilter(tabCounts.cancellation_requested > 0 ? 'cancellation_requested' : 'declined')}
                >
                    <div className="stat-card-top">
                        <div className="stat-icon-wrap danger">
                            <AlertTriangle size={20} />
                        </div>
                        <span className="stat-card-tag danger">Alerts</span>
                    </div>
                    <div className="stat-card-body">
                        <div className="stat-card-num danger-text">{tabCounts.cancellation_requested + tabCounts.expired + tabCounts.declined}</div>
                        <div className="stat-card-label">Attention Needed</div>
                        <div className="stat-card-sub">{tabCounts.cancellation_requested} Refund • {tabCounts.declined} Declined</div>
                    </div>
                </div>
            </div>

            {/* ── Segmented Navigation Filter Tabs ── */}
            <div className="aap-filter-segmented-bar">
                <div className="segmented-scroll custom-scrollbar">
                    {[
                        { id: '', label: 'All Orders', count: tabCounts.all },
                        { id: 'pending_admin_approval', label: 'Pending Approval', count: tabCounts.pending_admin_approval, highlight: true },
                        { id: 'fund_disbursed', label: 'Funds Disbursed', count: tabCounts.fund_disbursed },
                        { id: 'pending_murabaha_acceptance', label: 'Murabaha Pending', count: tabCounts.pending_murabaha_acceptance },
                        { id: 'murabaha_accepted', label: 'Murabaha Signed', count: tabCounts.murabaha_accepted },
                        { id: 'delivered', label: 'Delivered (OTP)', count: tabCounts.delivered },
                        { id: 'completed', label: 'Completed', count: tabCounts.completed },
                        { id: 'cancellation_requested', label: 'Refund Requested', count: tabCounts.cancellation_requested, danger: true },
                        { id: 'declined', label: 'Declined', count: tabCounts.declined },
                        { id: 'cancelled', label: 'Cancelled', count: tabCounts.cancelled }
                    ].map(tab => (
                        <button
                            key={tab.id}
                            className={`segmented-pill ${filter === tab.id ? 'active' : ''} ${tab.highlight && tab.count > 0 ? 'pill-highlight' : ''} ${tab.danger && tab.count > 0 ? 'pill-danger' : ''}`}
                            onClick={() => setFilter(tab.id)}
                        >
                            <span>{tab.label}</span>
                            {tab.count !== undefined && (
                                <span className={`pill-badge ${filter === tab.id ? 'badge-active' : ''}`}>
                                    {tab.count}
                                </span>
                            )}
                        </button>
                    ))}
                </div>
            </div>

            {/* ── Unified Control Bar (Search + Sort + View Mode) ── */}
            <div className="admin-control-bar aap-control-bar">
                {/* Search Box */}
                <div className="aap-search-box">
                    <Search size={18} className="search-icon" />
                    <input 
                        type="text"
                        placeholder="Search by product, retailer, agent, phone, wholesaler, or #AMN ref..."
                        value={searchTerm}
                        onChange={e => setSearchTerm(e.target.value)}
                        className="form-control aap-search-input"
                    />
                    {searchTerm && (
                        <button 
                            className="clear-search-btn" 
                            onClick={() => setSearchTerm('')}
                            title="Clear search"
                        >
                            <X size={15} />
                        </button>
                    )}
                </div>

                {/* Right Controls: Sort & View Mode */}
                <div className="aap-control-actions">
                    <div className="aap-sort-wrapper">
                        <SlidersHorizontal size={15} className="sort-icon" />
                        <span className="sort-label">Sort:</span>
                        <select 
                            value={sortBy} 
                            onChange={e => setSortBy(e.target.value)}
                            className="form-select aap-sort-select"
                        >
                            <option value="newest">Newest First</option>
                            <option value="oldest">Oldest First</option>
                            <option value="amount_high">Highest Cost (₦)</option>
                            <option value="amount_low">Lowest Cost (₦)</option>
                            <option value="retailer_total_high">Highest Retailer Total (₦)</option>
                            <option value="expiring_soon">Expiring Soonest</option>
                        </select>
                    </div>

                    {/* View Mode Toggle */}
                    <div className="aap-view-toggle">
                        <button
                            className={`view-mode-btn ${viewMode === 'grid' ? 'active' : ''}`}
                            onClick={() => setViewMode('grid')}
                            title="Rich Cards View"
                        >
                            <LayoutGrid size={16} />
                            <span className="view-btn-text">Cards</span>
                        </button>
                        <button
                            className={`view-mode-btn ${viewMode === 'table' ? 'active' : ''}`}
                            onClick={() => setViewMode('table')}
                            title="Executive Table View"
                        >
                            <List size={16} />
                            <span className="view-btn-text">Table</span>
                        </button>
                    </div>
                </div>
            </div>

            {/* Active Filter Indicators */}
            {(filter || searchTerm) && (
                <div className="aap-active-filter-strip">
                    <span className="filter-summary-text">
                        Showing <strong>{filteredAAPs.length}</strong> of <strong>{aaps.length}</strong> purchase orders
                        {filter ? ` matching "${getStatusMeta(filter).label}"` : ''}
                        {searchTerm ? ` for "${searchTerm}"` : ''}
                    </span>
                    <button 
                        className="btn-clear-filters"
                        onClick={() => { setFilter(''); setSearchTerm(''); }}
                    >
                        <X size={13} /> Reset Filters
                    </button>
                </div>
            )}

            {/* ── Main Orders Presentation (Grid or Table) ── */}
            {loading ? (
                <div className="aap-loading-card card">
                    <div className="loading-spinner-ring" />
                    <p>Loading Agent Purchase records...</p>
                </div>
            ) : filteredAAPs.length === 0 ? (
                <div className="aap-empty card">
                    <div className="empty-icon-wrap">
                        <ShoppingBag size={48} strokeWidth={1.5} />
                    </div>
                    <h3>No Purchase Requests Found</h3>
                    <p>
                        {searchTerm 
                            ? `No records match "${searchTerm}". Try adjusting your keywords or clearing the filter.` 
                            : filter
                                ? `There are currently no orders under the "${getStatusMeta(filter).label}" tab.`
                                : "There are currently no purchase records in the system."}
                    </p>
                    {(searchTerm || filter) && (
                        <button 
                            className="btn btn-outline btn-sm aap-empty-reset-btn"
                            onClick={() => { setSearchTerm(''); setFilter(''); }}
                        >
                            Clear Filters & View All ({aaps.length})
                        </button>
                    )}
                </div>
            ) : viewMode === 'grid' ? (
                /* ══════════════════════════════════════════════════════════
                   RICH CARDS VIEW (GRID)
                   ══════════════════════════════════════════════════════════ */
                <div className="aap-grid">
                    {filteredAAPs.map(aap => {
                        const statusMeta = getStatusMeta(aap.status);
                        const refCode = aap._id ? `AMN-${aap._id.slice(-8).toUpperCase()}` : 'AMN-DOC';
                        const photosCount = aap.productPhotos?.length || 0;
                        const firstPhoto = aap.productPhotos?.[0];
                        const availableCredit = (aap.retailer?.creditLimit || 0) - (aap.retailer?.usedCredit || 0);

                        return (
                            <div key={aap._id} className="card aap-card animate-card-fade">
                                {/* Card Header */}
                                <div className="aap-card-header">
                                    <div className="aap-ref-col">
                                        <button 
                                            className="aap-ref-pill-interactive"
                                            onClick={(e) => handleCopyRef(e, refCode)}
                                            title="Click to copy Reference ID"
                                        >
                                            <span className="mono-ref">#{refCode}</span>
                                            {copiedRef === refCode ? (
                                                <CheckCheck size={12} className="copy-icon-success" />
                                            ) : (
                                                <Copy size={11} className="copy-icon-idle" />
                                            )}
                                        </button>
                                        <span className="aap-date-label">
                                            {aap.createdAt ? new Date(aap.createdAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }) : ''}
                                        </span>
                                    </div>
                                    <div className="aap-status-badge-wrap" style={{ backgroundColor: statusMeta.bg, color: statusMeta.color }}>
                                        <span className="status-dot-pulse" style={{ backgroundColor: statusMeta.dotColor }} />
                                        <span className="status-badge-text">{statusMeta.label}</span>
                                    </div>
                                </div>

                                {/* Product Showcase: Photo & Description */}
                                <div className="aap-card-product-showcase">
                                    {firstPhoto ? (
                                        <div 
                                            className="aap-card-image-wrap"
                                            onClick={() => {
                                                setInspectImage(firstPhoto);
                                                setInspectTitle(`${aap.productName} (Photo 1/${photosCount})`);
                                            }}
                                            title="Click to zoom in full photo"
                                        >
                                            <img 
                                                src={firstPhoto} 
                                                alt={aap.productName}
                                                className="aap-card-img"
                                            />
                                            {photosCount > 1 && (
                                                <div className="aap-photo-count-badge">
                                                    <span>📷 {photosCount}</span>
                                                </div>
                                            )}
                                            <div className="aap-card-zoom-hint">
                                                <ZoomIn size={14} />
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="aap-card-no-image">
                                            <ShoppingBag size={24} className="no-img-icon" />
                                            <span>No Photo</span>
                                        </div>
                                    )}

                                    <div className="aap-card-product-meta">
                                        <h3 className="aap-card-title" title={aap.productName}>
                                            {aap.productName}
                                        </h3>
                                        {aap.productDescription && (
                                            <p className="aap-card-desc-snippet">{aap.productDescription}</p>
                                        )}
                                        <div className="aap-card-supplier-line">
                                            <Building2 size={12} />
                                            <span>Wholesaler: <strong>{aap.sellerName || 'Market Vendor'}</strong></span>
                                        </div>
                                    </div>
                                </div>

                                {/* Financial Spec Pill Grid */}
                                <div className="aap-card-finance-row">
                                    <div className="finance-col">
                                        <span className="finance-label">Cost Price</span>
                                        <span className="finance-val">₦{(aap.purchasePrice || 0).toLocaleString()}</span>
                                    </div>
                                    <div className="finance-col">
                                        <span className="finance-label">Markup</span>
                                        <span className="finance-val markup-text">+{aap.markupPercentage || 0}% ({aap.repaymentTerm || 14}d)</span>
                                    </div>
                                    <div className="finance-col align-right">
                                        <span className="finance-label">Retailer Total</span>
                                        <span className="finance-val total-text">₦{(aap.totalRetailerCost || 0).toLocaleString()}</span>
                                    </div>
                                </div>

                                {/* Split Commercial Parties: Retailer & Field Agent */}
                                <div className="aap-card-parties-box">
                                    <div className="party-sub-col">
                                        <div className="party-tag-row">
                                            <span className="party-col-tag">RETAILER</span>
                                            <span className="party-score-badge">★ {aap.retailer?.amanaScore || 700}</span>
                                        </div>
                                        <span className="party-col-name" title={aap.retailer?.name}>{aap.retailer?.name || 'Retailer Trader'}</span>
                                        <span className="party-col-phone">{aap.retailer?.phone || 'No phone'}</span>
                                        <span className="party-col-credit">Avail: ₦{Math.max(0, availableCredit).toLocaleString()}</span>
                                    </div>

                                    <div className="party-sub-divider" />

                                    <div className="party-sub-col">
                                        <div className="party-tag-row">
                                            <span className="party-col-tag">FIELD AGENT</span>
                                        </div>
                                        <span className="party-col-name" title={aap.agent?.name}>{aap.agent?.name || 'Market Agent'}</span>
                                        <span className="party-col-phone">{aap.agent?.phone || 'No phone'}</span>
                                        {aap.agent?.phone ? (
                                            <a href={`tel:${aap.agent.phone}`} className="party-call-link">
                                                <Phone size={11} />
                                                <span>Call Agent</span>
                                            </a>
                                        ) : (
                                            <span className="party-col-sub">Verified Agent</span>
                                        )}
                                    </div>
                                </div>

                                {/* Sharia Legal Badges */}
                                <div className="aap-contracts-preview-row">
                                    <div className={`contract-mini-badge ${aap.undertakingSigned ? 'signed' : 'pending'}`}>
                                        <Scale size={12} />
                                        <span>Wa'd: {aap.undertakingSigned ? 'Signed ✓' : 'Pending ⏳'}</span>
                                    </div>
                                    <div className={`contract-mini-badge ${aap.murabahaSigned ? 'signed' : 'pending'}`}>
                                        <BookOpen size={12} />
                                        <span>Murabaha: {aap.murabahaSigned ? 'Signed ✓' : 'Pending ⏳'}</span>
                                    </div>
                                </div>

                                {/* Notice Banners (Conditional) */}
                                {aap.proxyProofUrl && (
                                    <div className="aap-card-notice-pill proxy">
                                        <ShieldAlert size={13} />
                                        <span>Agent Proxy Photo Attached</span>
                                    </div>
                                )}

                                {['fund_disbursed', 'pending_murabaha_acceptance', 'murabaha_accepted'].includes(aap.status) && aap.expiresAt && (
                                    <div className="aap-card-notice-pill warning">
                                        <Clock size={13} />
                                        <span>Sourcing Window: Expires {new Date(aap.expiresAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                                    </div>
                                )}

                                {aap.status === 'declined' && (
                                    <div className="aap-card-notice-pill danger">
                                        <XCircle size={13} />
                                        <span>Declined: "{aap.declineReason || 'Declined by admin'}"</span>
                                    </div>
                                )}

                                {aap.status === 'cancellation_requested' && (
                                    <div className="aap-card-notice-pill warning">
                                        <AlertTriangle size={13} />
                                        <span>Refund Requested: "{aap.cancelReason || 'Agent initiated return'}"</span>
                                    </div>
                                )}

                                {/* Card Actions Footer */}
                                <div className="aap-card-footer">
                                    <button 
                                        className="btn btn-outline aap-view-btn"
                                        onClick={() => setSelectedAAP(aap)}
                                    >
                                        <Eye size={14} />
                                        <span>View Dossier</span>
                                    </button>

                                    {aap.status === 'pending_admin_approval' && (
                                        <button 
                                            className="btn btn-primary aap-approve-quick-btn"
                                            onClick={() => setSelectedAAP(aap)}
                                        >
                                            <Sparkles size={14} />
                                            <span>Approve & Disburse</span>
                                        </button>
                                    )}

                                    {aap.status === 'cancellation_requested' && (
                                        <button 
                                            className="btn btn-warning aap-refund-quick-btn"
                                            onClick={() => setSelectedAAP(aap)}
                                        >
                                            <AlertCircle size={14} />
                                            <span>Verify Refund</span>
                                        </button>
                                    )}
                                </div>
                            </div>
                        );
                    })}
                </div>
            ) : (
                /* ══════════════════════════════════════════════════════════
                   EXECUTIVE DATA TABLE VIEW
                   ══════════════════════════════════════════════════════════ */
                <div className="card aap-table-container custom-scrollbar">
                    <table className="aap-data-table">
                        <thead>
                            <tr>
                                <th>Reference & Date</th>
                                <th>Item / Wholesaler</th>
                                <th>Retailer (Trader)</th>
                                <th>Field Agent</th>
                                <th>Cost Price</th>
                                <th>Retailer Total</th>
                                <th>Sharia Contracts</th>
                                <th>Status</th>
                                <th style={{ textAlign: 'right' }}>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredAAPs.map(aap => {
                                const statusMeta = getStatusMeta(aap.status);
                                const refCode = aap._id ? `AMN-${aap._id.slice(-8).toUpperCase()}` : 'AMN-DOC';
                                const firstPhoto = aap.productPhotos?.[0];

                                return (
                                    <tr 
                                        key={aap._id} 
                                        className="aap-table-row"
                                        onClick={() => setSelectedAAP(aap)}
                                    >
                                        {/* Ref & Date */}
                                        <td className="cell-ref">
                                            <button 
                                                className="table-mono-ref-btn"
                                                onClick={(e) => handleCopyRef(e, refCode)}
                                                title="Click to copy Reference"
                                            >
                                                #{refCode}
                                                {copiedRef === refCode ? <CheckCheck size={11} className="copied-tick" /> : <Copy size={10} />}
                                            </button>
                                            <span className="table-date-sub">
                                                {aap.createdAt ? new Date(aap.createdAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' }) : ''}
                                            </span>
                                        </td>

                                        {/* Product */}
                                        <td className="cell-product">
                                            <div className="table-product-wrap">
                                                {firstPhoto ? (
                                                    <img 
                                                        src={firstPhoto} 
                                                        alt={aap.productName} 
                                                        className="table-product-thumb"
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            setInspectImage(firstPhoto);
                                                            setInspectTitle(aap.productName);
                                                        }}
                                                    />
                                                ) : (
                                                    <div className="table-product-nophoto">
                                                        <ShoppingBag size={14} />
                                                    </div>
                                                )}
                                                <div className="table-product-info">
                                                    <span className="table-product-name">{aap.productName}</span>
                                                    <span className="table-product-seller">{aap.sellerName || 'Wholesaler'}</span>
                                                </div>
                                            </div>
                                        </td>

                                        {/* Retailer */}
                                        <td className="cell-retailer">
                                            <div className="table-party-info">
                                                <span className="table-party-name">{aap.retailer?.name || 'Retailer'}</span>
                                                <span className="table-party-phone">{aap.retailer?.phone || 'No phone'}</span>
                                            </div>
                                        </td>

                                        {/* Agent */}
                                        <td className="cell-agent">
                                            <div className="table-party-info">
                                                <span className="table-party-name">{aap.agent?.name || 'Agent'}</span>
                                                <span className="table-party-phone">{aap.agent?.phone || 'No phone'}</span>
                                            </div>
                                        </td>

                                        {/* Pricing */}
                                        <td className="cell-cost">
                                            <span className="table-cost-val">₦{(aap.purchasePrice || 0).toLocaleString()}</span>
                                            <span className="table-markup-sub">+{aap.markupPercentage || 0}% ({aap.repaymentTerm || 14}d)</span>
                                        </td>

                                        <td className="cell-retailer-total">
                                            <span className="table-total-val">₦{(aap.totalRetailerCost || 0).toLocaleString()}</span>
                                        </td>

                                        {/* Sharia Badges */}
                                        <td className="cell-contracts">
                                            <div className="table-contract-tags">
                                                <span className={`table-contract-pill ${aap.undertakingSigned ? 'signed' : 'pending'}`}>
                                                    Wa'd: {aap.undertakingSigned ? '✓' : '⏳'}
                                                </span>
                                                <span className={`table-contract-pill ${aap.murabahaSigned ? 'signed' : 'pending'}`}>
                                                    Murabaha: {aap.murabahaSigned ? '✓' : '⏳'}
                                                </span>
                                            </div>
                                        </td>

                                        {/* Status */}
                                        <td className="cell-status">
                                            <span 
                                                className="table-status-badge"
                                                style={{ backgroundColor: statusMeta.bg, color: statusMeta.color }}
                                            >
                                                <span className="status-dot-pulse" style={{ backgroundColor: statusMeta.dotColor }} />
                                                {statusMeta.label}
                                            </span>
                                        </td>

                                        {/* Actions */}
                                        <td className="cell-actions" style={{ textAlign: 'right' }}>
                                            <button 
                                                className="btn btn-outline btn-sm table-inspect-btn"
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    setSelectedAAP(aap);
                                                }}
                                            >
                                                <Eye size={13} />
                                                <span>Inspect</span>
                                            </button>
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            )}

            {/* ══════════════════════════════════════════════════════════
               COMPREHENSIVE AAP DETAIL & DISBURSEMENT MODAL
               ══════════════════════════════════════════════════════════ */}
            {selectedAAP && typeof document !== 'undefined' && createPortal(
                <div className="aap-modal-overlay" onClick={() => setSelectedAAP(null)}>
                    <div className="aap-modal card" onClick={e => e.stopPropagation()}>
                        {/* Modal Header */}
                        <div className="aap-modal-header">
                            <div className="modal-header-info">
                                <div className="modal-ref-strip">
                                    <span className="modal-ref-pill">#{selectedAAP._id ? `AMN-${selectedAAP._id.slice(-8).toUpperCase()}` : 'AMN-DOC'}</span>
                                    <span className={`badge ${getStatusMeta(selectedAAP.status).badgeClass}`}>
                                        {getStatusMeta(selectedAAP.status).label}
                                    </span>
                                </div>
                                <h2 className="modal-heading-title">{selectedAAP.productName}</h2>
                                <span className="modal-timestamp-sub">
                                    Created on {selectedAAP.createdAt ? new Date(selectedAAP.createdAt).toLocaleString('en-US', { dateStyle: 'medium', timeStyle: 'short' }) : 'Unknown Date'}
                                </span>
                            </div>

                            <button className="btn-icon aap-modal-close" onClick={() => setSelectedAAP(null)} aria-label="Close modal">
                                <X size={20} />
                            </button>
                        </div>

                        <div className="aap-modal-body custom-scrollbar">
                            {/* ── 1. Sharia Lifecycle Stepper Timeline ── */}
                            <div className="aap-lifecycle-stepper">
                                <div className="stepper-title-row">
                                    <Sparkles size={14} className="text-primary" />
                                    <span>Sharia Murabaha Audit Milestones</span>
                                </div>
                                <div className="stepper-track">
                                    {/* Step 1: Agent Sourcing */}
                                    <div className="stepper-step completed">
                                        <div className="stepper-circle">✓</div>
                                        <div className="stepper-text">
                                            <span className="step-name">1. Verified at Market</span>
                                            <span className="step-time">Agent Checked</span>
                                        </div>
                                    </div>
                                    <div className={`stepper-line ${selectedAAP.undertakingSigned ? 'active' : ''}`} />

                                    {/* Step 2: Deed of Undertaking */}
                                    <div className={`stepper-step ${selectedAAP.undertakingSigned ? 'completed' : 'current'}`}>
                                        <div className="stepper-circle">
                                            {selectedAAP.undertakingSigned ? '✓' : '2'}
                                        </div>
                                        <div className="stepper-text">
                                            <span className="step-name">2. Deed of Undertaking</span>
                                            <span className="step-time">{selectedAAP.undertakingSigned ? 'Wa\'d Executed' : 'Awaiting Trader'}</span>
                                        </div>
                                    </div>
                                    <div className={`stepper-line ${['fund_disbursed', 'pending_murabaha_acceptance', 'murabaha_accepted', 'delivered', 'received', 'completed'].includes(selectedAAP.status) ? 'active' : ''}`} />

                                    {/* Step 3: Admin Disbursement */}
                                    <div className={`stepper-step ${['fund_disbursed', 'pending_murabaha_acceptance', 'murabaha_accepted', 'delivered', 'received', 'completed'].includes(selectedAAP.status) ? 'completed' : selectedAAP.status === 'pending_admin_approval' ? 'current' : ''}`}>
                                        <div className="stepper-circle">
                                            {['fund_disbursed', 'pending_murabaha_acceptance', 'murabaha_accepted', 'delivered', 'received', 'completed'].includes(selectedAAP.status) ? '✓' : '3'}
                                        </div>
                                        <div className="stepper-text">
                                            <span className="step-name">3. Fund Disbursed</span>
                                            <span className="step-time">{['fund_disbursed', 'pending_murabaha_acceptance', 'murabaha_accepted', 'delivered', 'received', 'completed'].includes(selectedAAP.status) ? 'Capital Sent' : 'Admin Review'}</span>
                                        </div>
                                    </div>
                                    <div className={`stepper-line ${selectedAAP.murabahaSigned ? 'active' : ''}`} />

                                    {/* Step 4: Murabaha Contract */}
                                    <div className={`stepper-step ${selectedAAP.murabahaSigned ? 'completed' : selectedAAP.status === 'pending_murabaha_acceptance' ? 'current' : ''}`}>
                                        <div className="stepper-circle">
                                            {selectedAAP.murabahaSigned ? '✓' : '4'}
                                        </div>
                                        <div className="stepper-text">
                                            <span className="step-name">4. Murabaha Contract</span>
                                            <span className="step-time">{selectedAAP.murabahaSigned ? 'Contract Sealed' : 'Post-Possession'}</span>
                                        </div>
                                    </div>
                                    <div className={`stepper-line ${['received', 'completed'].includes(selectedAAP.status) ? 'active' : ''}`} />

                                    {/* Step 5: Goods Received / OTP */}
                                    <div className={`stepper-step ${['received', 'completed'].includes(selectedAAP.status) ? 'completed' : selectedAAP.status === 'delivered' ? 'current' : ''}`}>
                                        <div className="stepper-circle">
                                            {['received', 'completed'].includes(selectedAAP.status) ? '✓' : '5'}
                                        </div>
                                        <div className="stepper-text">
                                            <span className="step-name">5. Qabd & Receipt</span>
                                            <span className="step-time">{['received', 'completed'].includes(selectedAAP.status) ? 'OTP Verified' : 'Handover'}</span>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* ── 2. Prominent Declined Information Card ── */}
                            {selectedAAP.status === 'declined' && (
                                <div className="aap-declined-dossier-card">
                                    <div className="declined-header-row">
                                        <div className="declined-title-group">
                                            <XCircle size={22} className="declined-icon" />
                                            <div>
                                                <h4 className="declined-title">Purchase Request Declined</h4>
                                                <span className="declined-meta-sub">
                                                    Declined on: {new Date(selectedAAP.declinedAt || selectedAAP.updatedAt).toLocaleString('en-US', { dateStyle: 'medium', timeStyle: 'short' })}
                                                    {selectedAAP.declinedBy?.name ? ` by ${selectedAAP.declinedBy.name}` : ''}
                                                </span>
                                            </div>
                                        </div>
                                        <span className="declined-badge-pill">Declined</span>
                                    </div>

                                    <div className="declined-reason-box">
                                        <span className="reason-label">Official Rejection Reason:</span>
                                        <p className="reason-quote">
                                            "{selectedAAP.declineReason || 'Declined by admin.'}"
                                        </p>
                                    </div>
                                </div>
                            )}

                            {/* ── 3. Cancellation & Refund Evidence Section ── */}
                            {(selectedAAP.status === 'cancellation_requested' || (selectedAAP.status === 'cancelled' && (selectedAAP.cancelReason || selectedAAP.refundProofUrl))) && (
                                <div className="aap-cancellation-audit-card">
                                    <div className="cancel-audit-header">
                                        <div className="cancel-title-wrap">
                                            <AlertTriangle size={22} className={selectedAAP.status === 'cancellation_requested' ? "text-amber" : "text-danger"} />
                                            <div>
                                                <h4 className="cancel-audit-title">
                                                    {selectedAAP.status === 'cancellation_requested' ? 'Cancellation & Refund Requested' : 'Transaction Cancelled & Cash Returned'}
                                                </h4>
                                                <span className="cancel-audit-sub">
                                                    {selectedAAP.status === 'cancellation_requested' 
                                                        ? 'The agent requested cancellation after fund disbursement and uploaded refund payment receipt evidence.'
                                                        : 'Funds returned to Amana. Purchase closed without retailer liability.'}
                                                </span>
                                            </div>
                                        </div>
                                        <span className={`badge ${selectedAAP.status === 'cancellation_requested' ? 'badge-warning' : 'badge-danger'}`}>
                                            {selectedAAP.status === 'cancellation_requested' ? 'Pending Admin Review' : 'Cancelled'}
                                        </span>
                                    </div>

                                    {/* Stated Reason */}
                                    <div className="cancel-stated-reason">
                                        <span className="reason-tag">Agent's Stated Reason:</span>
                                        <p className="reason-text">"{selectedAAP.cancelReason || 'No written reason specified'}"</p>
                                    </div>

                                    {/* Receipt Evidence Photo */}
                                    {selectedAAP.refundProofUrl ? (
                                        <div className="cancel-receipt-evidence">
                                            <span className="receipt-label">Refund Payment Receipt Evidence:</span>
                                            <div 
                                                className="receipt-preview-wrap"
                                                onClick={() => {
                                                    setInspectImage(selectedAAP.refundProofUrl);
                                                    setInspectTitle("Refund Payment Receipt Evidence");
                                                }}
                                            >
                                                <img 
                                                    src={selectedAAP.refundProofUrl} 
                                                    alt="Refund Receipt Proof" 
                                                    className="receipt-img"
                                                />
                                                <div className="receipt-zoom-badge">
                                                    <ZoomIn size={13} />
                                                    <span>Click to inspect full receipt</span>
                                                </div>
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="no-receipt-box">
                                            <span>No refund receipt image uploaded.</span>
                                        </div>
                                    )}

                                    {/* Metadata timestamps */}
                                    <div className="cancel-timestamps">
                                        {selectedAAP.cancelledAt && (
                                            <span>Requested on: <strong>{new Date(selectedAAP.cancelledAt).toLocaleString()}</strong> {selectedAAP.cancelledBy?.name ? `by ${selectedAAP.cancelledBy.name} (Agent)` : ''}</span>
                                        )}
                                        {selectedAAP.cashReturnConfirmedAt && (
                                            <span className="confirmed-text">Cash return confirmed on: <strong>{new Date(selectedAAP.cashReturnConfirmedAt).toLocaleString()}</strong> {selectedAAP.cashReturnConfirmedBy?.name ? `by ${selectedAAP.cashReturnConfirmedBy.name}` : ''}</span>
                                        )}
                                    </div>

                                    {/* Action Button for cancellation_requested */}
                                    {selectedAAP.status === 'cancellation_requested' && (
                                        <button
                                            className="btn btn-primary cancel-verify-btn"
                                            onClick={() => handleApproveCancellation(selectedAAP._id)}
                                            disabled={actionLoading}
                                        >
                                            <CheckCircle2 size={16} />
                                            <span>{actionLoading ? 'Processing...' : 'Verify Cash Return & Approve Cancellation'}</span>
                                        </button>
                                    )}
                                </div>
                            )}

                            {/* ── 4. Product Photos Gallery ── */}
                            {selectedAAP.productPhotos?.length > 0 && (
                                <div className="modal-section-card">
                                    <div className="section-header-row">
                                        <Eye size={16} className="text-primary" />
                                        <h4>Product Sourcing Photos ({selectedAAP.productPhotos.length})</h4>
                                    </div>
                                    <div className="aap-photo-gallery">
                                        {selectedAAP.productPhotos.map((url, i) => (
                                            <div 
                                                key={i} 
                                                className="gallery-thumb-wrap"
                                                onClick={() => {
                                                    setInspectImage(url);
                                                    setInspectTitle(`Product Photo ${i + 1} of ${selectedAAP.productPhotos.length}`);
                                                }}
                                                title="Click to view full photo"
                                            >
                                                <img 
                                                    src={url} 
                                                    alt={`Product ${i+1}`} 
                                                    className="aap-gallery-img"
                                                />
                                                <div className="thumb-zoom-icon">
                                                    <ZoomIn size={12} />
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                    <small className="gallery-hint">Click any photo above to inspect in high resolution.</small>
                                </div>
                            )}

                            {/* ── 5. Proxy Identity Verification Comparison ── */}
                            {selectedAAP.proxyProofUrl && (
                                <div className="proxy-verification-box">
                                    <div className="proxy-header">
                                        <AlertTriangle size={20} className="text-warning" />
                                        <div>
                                            <h4>{selectedAAP.proxyMurabahaAcceptance ? 'Proxy Murabaha Acceptance' : 'Proxy Verification Required'}</h4>
                                            <p className="proxy-desc">
                                                Agent <strong>{selectedAAP.agent?.name}</strong> {selectedAAP.proxyMurabahaAcceptance ? 'confirmed Murabaha acceptance' : selectedAAP.proxyReceipt ? 'confirmed delivery' : 'executed Deed of Undertaking'} on behalf of the retailer. Please verify identity match:
                                            </p>
                                        </div>
                                    </div>
                                    
                                    <div className="proxy-comparison">
                                        <div className="proxy-img-box">
                                            <span className="proxy-label">Retailer Profile</span>
                                            {selectedAAP.retailer?.kyc?.profilePicUrl ? (
                                                <div 
                                                    className="comparison-img-wrap"
                                                    onClick={() => {
                                                        setInspectImage(selectedAAP.retailer.kyc.profilePicUrl);
                                                        setInspectTitle("Retailer Profile Photo");
                                                    }}
                                                    title="Inspect Profile Photo"
                                                >
                                                    <img 
                                                        src={selectedAAP.retailer.kyc.profilePicUrl} 
                                                        alt="Retailer Profile" 
                                                        className="comparison-img"
                                                    />
                                                    <div className="zoom-chip"><ZoomIn size={11} /></div>
                                                </div>
                                            ) : (
                                                <div className="placeholder-img">
                                                    <User size={32} />
                                                    <span>No Profile Pic</span>
                                                </div>
                                            )}
                                        </div>
                                        
                                        <div className="proxy-vs-badge">VS</div>
                                        
                                        <div className="proxy-img-box">
                                            <span className="proxy-label">Agent's Proof Photo</span>
                                            <div 
                                                className="comparison-img-wrap"
                                                onClick={() => {
                                                    setInspectImage(selectedAAP.proxyProofUrl);
                                                    setInspectTitle("Agent Verification Proof Photo");
                                                }}
                                                title="Inspect Proof Photo"
                                            >
                                                <img 
                                                    src={selectedAAP.proxyProofUrl} 
                                                    alt="Agent Proof" 
                                                    className="comparison-img"
                                                />
                                                <div className="zoom-chip"><ZoomIn size={11} /></div>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="proxy-tip">
                                        <small>⚠️ Does the person in the proof photo match the retailer profile? If not, investigate before approving.</small>
                                    </div>
                                </div>
                            )}

                            {/* ── 6. Product & Financial Breakdown ── */}
                            <div className="modal-section-card">
                                <div className="product-spec-header">
                                    <h3 className="aap-modal-title">{selectedAAP.productName}</h3>
                                    {selectedAAP.productDescription && (
                                        <p className="aap-modal-desc">{selectedAAP.productDescription}</p>
                                    )}
                                </div>

                                <div className="aap-detail-grid">
                                    <div className="aap-detail-item">
                                        <label>Purchase Price</label>
                                        <span className="item-val">₦{(selectedAAP.purchasePrice || 0).toLocaleString()}</span>
                                    </div>
                                    <div className="aap-detail-item">
                                        <label>Markup ({selectedAAP.repaymentTerm || 14}d)</label>
                                        <span className="item-val text-green">
                                            +{selectedAAP.markupPercentage || 0}% = ₦{(selectedAAP.markupAmount || 0).toLocaleString()}
                                        </span>
                                    </div>
                                    <div className="aap-detail-item aap-highlight">
                                        <label>Retailer Repayment Total</label>
                                        <span className="item-val text-primary">₦{(selectedAAP.totalRetailerCost || 0).toLocaleString()}</span>
                                    </div>
                                </div>

                                {selectedAAP.sellerName && (
                                    <div className="seller-spec-bar">
                                        <Store size={15} className="text-primary" />
                                        <div>
                                            <span className="seller-name">{selectedAAP.sellerName}</span>
                                            <span className="seller-meta">
                                                {selectedAAP.sellerPhone ? ` • 📞 ${selectedAAP.sellerPhone}` : ''}
                                                {selectedAAP.sellerLocation ? ` • 📍 ${selectedAAP.sellerLocation}` : ''}
                                            </span>
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* ── 7. Commercial Parties Dossier ── */}
                            <div className="modal-section-card parties-dossier-card">
                                <div className="section-header-row">
                                    <Building2 size={16} className="text-primary" />
                                    <h4>Parties & Commercial Verification</h4>
                                </div>

                                <div className="parties-split-grid">
                                    {/* Retailer Info */}
                                    <div className="party-card-box">
                                        <div className="party-header-row">
                                            <span className="party-badge buyer">RETAILER (BUYER)</span>
                                            {selectedAAP.retailer?.amanaScore && (
                                                <span className="amana-score-badge">Score: {selectedAAP.retailer.amanaScore}</span>
                                            )}
                                        </div>
                                        <h5 className="party-person-name">{selectedAAP.retailer?.name || 'Registered Trader'}</h5>
                                        <div className="party-contact-lines">
                                            <span>📞 {selectedAAP.retailer?.phone || 'No phone'}</span>
                                            <span>✉️ {selectedAAP.retailer?.email || 'No email'}</span>
                                        </div>
                                        <div className="party-credit-footer">
                                            <span>Available Credit: <strong>₦{Math.max(0, (selectedAAP.retailer?.creditLimit || 0) - (selectedAAP.retailer?.usedCredit || 0)).toLocaleString()}</strong></span>
                                            <span className="limit-sub">(Limit: ₦{(selectedAAP.retailer?.creditLimit || 0).toLocaleString()})</span>
                                        </div>
                                    </div>

                                    {/* Field Agent Info */}
                                    <div className="party-card-box">
                                        <div className="party-header-row">
                                            <span className="party-badge agent">FIELD AGENT</span>
                                            {selectedAAP.agent?.phone && (
                                                <a href={`tel:${selectedAAP.agent.phone}`} className="call-agent-badge">
                                                    <Phone size={11} /> Call
                                                </a>
                                            )}
                                        </div>
                                        <h5 className="party-person-name">{selectedAAP.agent?.name || 'Assigned Agent'}</h5>
                                        <div className="party-contact-lines">
                                            <span>📞 {selectedAAP.agent?.phone || 'No phone'}</span>
                                            <span>✉️ {selectedAAP.agent?.email || 'No email'}</span>
                                        </div>
                                        <div className="party-agent-footer">
                                            <span>Market Inspection & Quality Verification Assigned</span>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* ── 8. Sharia Legal Contracts Dossier ── */}
                            <div className="modal-section-card contracts-dossier-card">
                                <div className="contracts-dossier-header">
                                    <div className="contracts-title-wrap">
                                        <ShieldCheck size={18} className="text-primary" />
                                        <h4>Sharia Legal Documentation Dossier</h4>
                                    </div>
                                    <span className="aaoifi-seal">AAOIFI Sharia Standard No. 8 Aligned</span>
                                </div>

                                <div className="contracts-interactive-grid">
                                    {/* 1. Deed of Undertaking (Wa'd) */}
                                    <div 
                                        className="contract-dossier-button undertaking-box"
                                        onClick={() => {
                                            const doc = generateDeedOfUndertaking({
                                                ...selectedAAP,
                                                retailer: selectedAAP.retailer,
                                                agent: selectedAAP.agent
                                            });
                                            setContractModalDoc(doc);
                                            setShowContractModal(true);
                                        }}
                                        title="Click to view Deed of Undertaking"
                                    >
                                        <div className="dossier-button-top">
                                            <span className="stage-pill undertaking">STAGE 1 • WA'D MULZIM</span>
                                            {selectedAAP.undertakingSigned ? (
                                                <span className="status-seal signed">✓ Executed</span>
                                            ) : (
                                                <span className="status-seal pending">Awaiting Execution</span>
                                            )}
                                        </div>
                                        <div className="dossier-button-title-row">
                                            <Scale size={18} className="icon-undertaking" />
                                            <h5>Deed of Undertaking (Wa'd)</h5>
                                        </div>
                                        <p className="dossier-date-text">
                                            {selectedAAP.undertakingSignedAt || selectedAAP.retailerConfirmedAt
                                                ? `Executed on ${new Date(selectedAAP.undertakingSignedAt || selectedAAP.retailerConfirmedAt).toLocaleString('en-US', { dateStyle: 'medium', timeStyle: 'short' })}`
                                                : 'Awaiting Trader Signature Before Procurement'}
                                        </p>
                                        <div className="dossier-inspect-cta">
                                            <span>Read Full Agreement (12 Clauses) →</span>
                                        </div>
                                    </div>

                                    {/* 2. Murabaha Sale Contract */}
                                    <div 
                                        className="contract-dossier-button murabaha-box"
                                        onClick={() => {
                                            const doc = generateMurabahaContract({
                                                ...selectedAAP,
                                                retailer: selectedAAP.retailer,
                                                agent: selectedAAP.agent,
                                                receivedAt: selectedAAP.receivedAt
                                            });
                                            setContractModalDoc(doc);
                                            setShowContractModal(true);
                                        }}
                                        title="Click to view Murabaha Contract"
                                    >
                                        <div className="dossier-button-top">
                                            <span className="stage-pill murabaha">STAGE 2 • MURABAHA SALE</span>
                                            {selectedAAP.murabahaSigned ? (
                                                <span className="status-seal signed">✓ Executed</span>
                                            ) : (
                                                <span className="status-seal pending">Pending Possession</span>
                                            )}
                                        </div>
                                        <div className="dossier-button-title-row">
                                            <BookOpen size={18} className="icon-murabaha" />
                                            <h5>Murabaha Sale Contract</h5>
                                        </div>
                                        <p className="dossier-date-text">
                                            {selectedAAP.murabahaSignedAt || selectedAAP.murabahaAcceptedAt
                                                ? `Concluded on ${new Date(selectedAAP.murabahaSignedAt || selectedAAP.murabahaAcceptedAt).toLocaleString('en-US', { dateStyle: 'medium', timeStyle: 'short' })}`
                                                : 'Requires physical possession (Qabd) prior to signature'}
                                        </p>
                                        <div className="dossier-inspect-cta">
                                            <span>Read Full Agreement (12 Clauses) →</span>
                                        </div>
                                    </div>
                                </div>

                                {/* Delivery & Qabd Confirmation */}
                                {(selectedAAP.receivedAt || ['received', 'completed'].includes(selectedAAP.status)) && (
                                    <div className="delivery-confirmed-strip">
                                        <CheckCircle2 size={18} color="#10b981" />
                                        <div className="delivery-text-wrap">
                                            <span className="delivery-title">Delivery & Physical Possession (Qabd) Verified</span>
                                            <span className="delivery-meta">
                                                {selectedAAP.receivedAt
                                                    ? `Confirmed on ${new Date(selectedAAP.receivedAt).toLocaleString('en-US', { dateStyle: 'medium', timeStyle: 'short' })} via 6-digit OTP Handover`
                                                    : 'Confirmed Received (OTP Verified)'}
                                            </span>
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* ── 9. Early Decline Option (For Pre-Disbursement Requests) ── */}
                            {['trader_initiated', 'draft', 'awaiting_retailer_confirm'].includes(selectedAAP.status) && (
                                <div className="modal-section-card early-decline-card">
                                    <div className="early-decline-row">
                                        <div>
                                            <h5 className="early-decline-title">Reject Purchase Request</h5>
                                            <p className="early-decline-sub">
                                                Admin can decline this purchase request before funds are disbursed to the agent.
                                            </p>
                                        </div>
                                        <button 
                                            className="btn btn-outline btn-danger early-decline-btn"
                                            onClick={() => promptDecline(selectedAAP._id)}
                                            disabled={actionLoading}
                                        >
                                            <XCircle size={15} /> Decline Request
                                        </button>
                                    </div>
                                </div>
                            )}

                            {/* ── 10. Disbursement Configuration Form (Only when pending_admin_approval) ── */}
                            {selectedAAP.status === 'pending_admin_approval' && (
                                <div className="modal-section-card disbursement-approval-card">
                                    <div className="disbursement-header">
                                        <DollarSign size={22} className="text-primary" />
                                        <div>
                                            <h4>Authorize Capital & Disburse Funds</h4>
                                            <p>Disburse ₦{(selectedAAP.purchasePrice || 0).toLocaleString()} to field agent {selectedAAP.agent?.name || ''}</p>
                                        </div>
                                    </div>
                                    
                                    {/* Method selector */}
                                    <div className="form-group">
                                        <label className="form-label font-bold">Disbursement Method *</label>
                                        <div className="disbursement-method-pills">
                                            {[
                                                { id: 'bank_transfer', label: 'Bank Transfer' },
                                                { id: 'cash', label: 'Cash Handover' },
                                                { id: 'mobile_money', label: 'Mobile Money' }
                                            ].map(m => (
                                                <button
                                                    key={m.id}
                                                    type="button"
                                                    className={`method-pill-btn ${disbursementForm.method === m.id ? 'active' : ''}`}
                                                    onClick={() => setDisbursementForm({ ...disbursementForm, method: m.id })}
                                                >
                                                    {m.label}
                                                </button>
                                            ))}
                                        </div>
                                    </div>

                                    {/* Duration selector */}
                                    <div className="form-group">
                                        <label className="form-label font-bold">Execution Duration (Hours)</label>
                                        <div className="duration-pills-row">
                                            {[1, 2, 4, 8, 12, 24, 48, 72].map(h => (
                                                <button
                                                    key={h}
                                                    type="button"
                                                    className={`duration-pill-btn ${disbursementForm.duration === h ? 'active' : ''}`}
                                                    onClick={() => setDisbursementForm({...disbursementForm, duration: h})}
                                                >
                                                    {h >= 24 ? `${h / 24}d` : `${h}h`}
                                                </button>
                                            ))}
                                        </div>
                                        {selectedAAP?.requestedDuration && (
                                            <small className="duration-hint">
                                                Agent requested {selectedAAP.requestedDuration}h. Default: {selectedAAP.requestedDuration}h (click above to override).
                                            </small>
                                        )}
                                    </div>

                                    {/* Reference input */}
                                    <div className="form-group">
                                        <label className="form-label font-bold">Disbursement Reference (Optional)</label>
                                        <input 
                                            type="text"
                                            value={disbursementForm.reference}
                                            onChange={e => setDisbursementForm({...disbursementForm, reference: e.target.value})}
                                            placeholder="e.g. Bank transfer ref or transaction receipt number"
                                            className="form-control"
                                        />
                                    </div>

                                    {/* Action Buttons */}
                                    <div className="disbursement-actions-cluster">
                                        <button 
                                            className="btn btn-outline btn-danger disbursement-decline-btn"
                                            onClick={() => promptDecline(selectedAAP._id)}
                                            disabled={actionLoading}
                                        >
                                            <XCircle size={16} />
                                            <span>Decline</span>
                                        </button>
                                        <button 
                                            className="btn btn-primary approve-disburse-btn"
                                            onClick={() => handleApprove(selectedAAP._id)}
                                            disabled={actionLoading}
                                        >
                                            <Check size={16} />
                                            <span>{actionLoading ? 'Processing...' : 'Approve & Disburse Funds'}</span>
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>,
                document.body
            )}

            {/* ══════════════════════════════════════════════════════════
               DECLINE CONFIRMATION MODAL (PORTALED)
               ══════════════════════════════════════════════════════════ */}
            {showDeclineModal && typeof document !== 'undefined' && createPortal(
                <div className="aap-modal-overlay aap-decline-overlay" onClick={() => !actionLoading && setShowDeclineModal(false)}>
                    <div className="aap-modal aap-decline-card card" onClick={e => e.stopPropagation()}>
                        <div className="aap-modal-header">
                            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                                <div className="icon-box icon-danger" style={{ width: 36, height: 36, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(239, 68, 68, 0.1)', color: '#ef4444' }}>
                                    <AlertTriangle size={20} />
                                </div>
                                <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 700 }}>Decline Purchase Request</h3>
                            </div>
                            <button 
                                className="btn-icon" 
                                onClick={() => !actionLoading && setShowDeclineModal(false)}
                                disabled={actionLoading}
                            >
                                <X size={20} />
                            </button>
                        </div>

                        <div className="aap-modal-body">
                            <p style={{ color: 'var(--color-text-secondary)', fontSize: '0.9rem', lineHeight: 1.5, margin: 0 }}>
                                Are you sure you want to decline this purchase request? The field agent and retailer will be notified immediately with your stated reason.
                            </p>

                            <div className="form-group" style={{ marginTop: 12 }}>
                                <label className="form-label" style={{ fontWeight: 600, fontSize: '0.85rem' }}>
                                    Reason for Rejection *
                                </label>
                                <textarea
                                    rows={3}
                                    className="form-control"
                                    placeholder="e.g. Purchase price does not match market rate, item unavailable in market, retailer credit mismatch, unverified supplier..."
                                    value={declineReason}
                                    onChange={e => setDeclineReason(e.target.value)}
                                    disabled={actionLoading}
                                    style={{ resize: 'vertical', minHeight: 80 }}
                                />
                            </div>

                            <div className="aap-btn-group" style={{ marginTop: 8, justifyContent: 'flex-end', display: 'flex', gap: 10 }}>
                                <button
                                    type="button"
                                    className="btn btn-outline"
                                    onClick={() => setShowDeclineModal(false)}
                                    disabled={actionLoading}
                                >
                                    Cancel
                                </button>
                                <button
                                    type="button"
                                    className="btn btn-danger"
                                    onClick={handleConfirmDecline}
                                    disabled={actionLoading}
                                    style={{ display: 'flex', alignItems: 'center', gap: 6 }}
                                >
                                    {actionLoading ? (
                                        <>
                                            <span className="btn-spinner-sm danger" />
                                            <span>Declining...</span>
                                        </>
                                    ) : (
                                        'Confirm Decline'
                                    )}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>,
                document.body
            )}

            {/* ══════════════════════════════════════════════════════════
               LIGHTBOX INSPECTION MODAL (PORTALED)
               ══════════════════════════════════════════════════════════ */}
            {inspectImage && typeof document !== 'undefined' && createPortal(
                <div 
                    className="aap-lightbox-overlay"
                    onClick={(e) => {
                        e.stopPropagation();
                        setInspectImage(null);
                    }}
                >
                    <div className="lightbox-top-bar" onClick={e => e.stopPropagation()}>
                        <div className="lightbox-title-wrap">
                            <Eye size={15} color="#fff" />
                            <span>{inspectTitle || 'Document Inspection'}</span>
                        </div>
                        <div className="lightbox-actions-wrap">
                            <a 
                                href={inspectImage} 
                                target="_blank" 
                                rel="noreferrer" 
                                className="lightbox-external-link"
                                onClick={e => e.stopPropagation()}
                            >
                                <ExternalLink size={14} /> Open Original
                            </a>
                            <button 
                                type="button" 
                                className="lightbox-close-btn" 
                                onClick={(e) => {
                                    e.stopPropagation();
                                    setInspectImage(null);
                                }}
                                title="Close inspection and return to AAP details"
                            >
                                <X size={18} />
                                <span>Back to AAP Details</span>
                            </button>
                        </div>
                    </div>

                    <div className="lightbox-image-container" onClick={e => e.stopPropagation()}>
                        <img 
                            src={inspectImage} 
                            alt="Document Preview" 
                            className="lightbox-img" 
                            onClick={e => e.stopPropagation()} 
                        />
                    </div>
                </div>,
                document.body
            )}

            {/* ══════════════════════════════════════════════════════════
               CONTRACT MODAL (LEGAL INSPECTION)
               ══════════════════════════════════════════════════════════ */}
            {showContractModal && contractModalDoc && (
                <ContractModal 
                    isOpen={showContractModal}
                    onClose={() => {
                        setShowContractModal(false);
                        setContractModalDoc(null);
                    }}
                    contractData={contractModalDoc}
                    canSign={false}
                />
            )}
        </div>
    );
};

export default AdminAAPDashboard;
