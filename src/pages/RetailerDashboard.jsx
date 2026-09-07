import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import api from '../services/api';
import './RetailerDashboard.css';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import ConfirmModal from '../components/ConfirmModal';
import ContractModal from '../components/ContractModal';
import { generateDeedOfUndertaking, generateMurabahaContract } from '../utils/contractTemplates';
import { CreditCard, TrendingUp, ShoppingBag, Clock, ChevronRight, AlertCircle, CheckCircle, X, Package, ShieldCheck, Lock, Phone, User, LayoutDashboard, Zap, Search, ArrowRight, Scale, BookOpen } from 'lucide-react';
import KYCStatusGate from '../components/KYCStatusGate';

const RetailerDashboard = () => {
    const { user } = useAuth();
    const [profile, setProfile] = useState(null);
    const [orders, setOrders] = useState([]);
    const [aaps, setAAPs] = useState([]);
    const [transactions, setTransactions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [cancellingOrderId, setCancellingOrderId] = useState(null);
    const [selectedOrder, setSelectedOrder] = useState(null); // For order details modal
    const [selectedAAP, setSelectedAAP] = useState(null); // For AAP details modal
    const [contractModalOpen, setContractModalOpen] = useState(false);
    const [contractType, setContractType] = useState('undertaking');
    const [activeContractData, setActiveContractData] = useState(null);
    const [activeContractAAPId, setActiveContractAAPId] = useState(null);
    const [signingContract, setSigningContract] = useState(false);
    const [decliningContract, setDecliningContract] = useState(false);
    const [aapActionLoadingId, setAapActionLoadingId] = useState(null);
    
    // Payment State
    const [showRepaymentModal, setShowRepaymentModal] = useState(false);
    const [repaymentAmount, setRepaymentAmount] = useState('');
    const [repaymentMode, setRepaymentMode] = useState('full'); // 'full' | 'partial'
    const [targetOrderId, setTargetOrderId] = useState(null); // If paying specific order
    const [isPayLoading, setIsPayLoading] = useState(false);

    // Request Goods (AAP) State
    const [showRequestGoodsModal, setShowRequestGoodsModal] = useState(false);
    const [agents, setAgents] = useState([]);
    const [agentsLoading, setAgentsLoading] = useState(false);
    const [selectedAgent, setSelectedAgent] = useState(null);
    const [agentSearch, setAgentSearch] = useState('');
    const [traderNote, setTraderNote] = useState('');
    const [submittingRequest, setSubmittingRequest] = useState(false);

    // Notification System
    const { addToast } = useToast();
    const [confirmModal, setConfirmModal] = useState({ isOpen: false, title: '', message: '', onConfirm: null, isDestructive: false });

    const navigate = useNavigate();
    const [searchParams] = useSearchParams();

    const fetchData = async () => {
        try {
            const [profileRes, ordersRes, aapRes, txRes] = await Promise.all([
                api.get('/retailer/profile'),
                api.get('/orders/myorders'),
                api.get('/aap/retailer/mine'),
                api.get('/transactions/retailer')
            ]);
            setProfile(profileRes.data);
            setOrders(ordersRes.data);
            setAAPs(aapRes.data);
            setTransactions(txRes.data);
        } catch (error) {
            console.error('Failed to fetch dashboard data', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    // Check if navigated from Transactions page with a specific order/AAP to repay
    useEffect(() => {
        const repayId = searchParams.get('repay');
        if (repayId && (orders.length > 0 || aaps.length > 0)) {
            openRepaymentModal(repayId);
        }
    }, [searchParams, orders, aaps]);

    const executeCancelOrder = async (orderId) => {
        setCancellingOrderId(orderId);
        try {
            const cancelRes = await api.put(`/orders/${orderId}/cancel`);
            
            // Refresh orders list
            const ordersRes = await api.get('/orders/myorders');
            setOrders(ordersRes.data);
            
            // Refresh profile data (credit balance may have changed)
            const profileRes = await api.get('/retailer/profile');
            setProfile(profileRes.data);
            
            setSelectedOrder(null); // Close modal after cancel
            
            // Show appropriate message
            if (cancelRes.data.refunded) {
                addToast('Order cancelled and credit refunded successfully!', 'success');
            } else {
                addToast('Order cancelled successfully.', 'success');
            }
        } catch (error) {
            addToast(error.response?.data?.message || 'Failed to cancel order', 'error');
        } finally {
            setCancellingOrderId(null);
        }
    };

    const handleCancelOrder = (orderId) => {
        setConfirmModal({
            isOpen: true,
            title: 'Cancel Order',
            message: 'Are you sure you want to cancel this order? Item will be returned to stock.',
            onConfirm: () => executeCancelOrder(orderId),
            isDestructive: true,
            confirmText: 'Cancel Order'
        });
    };

    const executeConfirmGoodsReceived = async (orderId) => {
        try {
            await api.put(`/orders/${orderId}/received`);
            
            // Refresh data
            const [profileRes, ordersRes] = await Promise.all([
                api.get('/retailer/profile'),
                api.get('/orders/myorders')
            ]);
            setProfile(profileRes.data);
            setOrders(ordersRes.data);
            setSelectedOrder(null); 
            addToast('Goods received confirmed! Vendor has been paid.', 'success');
        } catch (error) {
            addToast(error.response?.data?.message || 'Failed to confirm goods received', 'error');
        }
    };

    const handleConfirmGoodsReceived = (orderId) => {
        setConfirmModal({
            isOpen: true,
            title: 'Confirm Goods Received',
            message: 'Have you inspected the goods? By confirming, you acknowledge receipt and the vendor will be paid from your credit wallet.',
            onConfirm: () => executeConfirmGoodsReceived(orderId),
            isDestructive: false,
            confirmText: 'Confirm Receipt'
        });
    };

    const handleInitiatePayment = async () => {
        if (!repaymentAmount || parseFloat(repaymentAmount) <= 0) {
            addToast('Please enter a valid amount', 'error');
            return;
        }

        setIsPayLoading(true);
        try {
            const payload = {
                amount: parseFloat(repaymentAmount),
                email: profile.email,
                orderId: targetOrderId // Optional: specific order
            };
            
            const res = await api.post('/payment/initialize', payload);
            window.location.href = res.data.authorization_url; // Redirect to Paystack
        } catch (error) {
            console.error(error);
            addToast('Payment initialization failed. Please try again.', 'error');
            setIsPayLoading(false);
        }
    };

    const openRepaymentModal = (orderId = null, amount = null) => {
        const getRemaining = (doc, totalField) => {
            const total = doc[totalField] || 0;
            if (doc.remainingBalance !== undefined && doc.remainingBalance !== null) return doc.remainingBalance;
            return Math.max(0, total - (doc.amountPaid || 0));
        };

        if (orderId) {
            setTargetOrderId(orderId);
            setRepaymentMode('full');
            if (amount) {
                setRepaymentAmount(amount.toString());
            } else {
                const allItems = [
                    ...orders.map(o => ({ _id: o._id, rem: getRemaining(o, 'totalRepaymentAmount') })),
                    ...aaps.map(a => ({ _id: a._id, rem: getRemaining(a, 'totalRetailerCost') }))
                ];
                const matched = allItems.find(i => i._id === orderId);
                setRepaymentAmount(matched ? matched.rem.toString() : (profile?.usedCredit || 0).toString());
            }
        } else {
            const activeOrders = orders.filter(o => !o.isPaid && ['ready_for_pickup', 'goods_received', 'completed', 'defaulted'].includes(o.status));
            const activeAAPs = aaps.filter(a => !a.isPaid && a.status === 'received');
            const combined = [
                ...activeOrders.map(o => ({ _id: o._id, dueDate: o.dueDate, rem: getRemaining(o, 'totalRepaymentAmount') })),
                ...activeAAPs.map(a => ({ _id: a._id, dueDate: a.dueDate, rem: getRemaining(a, 'totalRetailerCost') }))
            ].filter(i => i.rem > 0).sort((a, b) => {
                if (!a.dueDate) return 1;
                if (!b.dueDate) return -1;
                return new Date(a.dueDate) - new Date(b.dueDate);
            });

            if (combined.length > 0) {
                setTargetOrderId(combined[0]._id);
                setRepaymentAmount(combined[0].rem.toString());
            } else {
                setTargetOrderId(null);
                setRepaymentAmount((profile?.usedCredit || 0).toString());
            }
            setRepaymentMode('full');
        }
        setShowRepaymentModal(true);
    };

    const openContractModal = (type, aap) => {
        setContractType(type);
        setActiveContractAAPId(aap._id);
        const data = type === 'undertaking' ? generateDeedOfUndertaking(aap) : generateMurabahaContract(aap);
        setActiveContractData(data);
        setContractModalOpen(true);
    };

    const handleAAPConfirm = async (aapId) => {
        setSigningContract(true);
        try {
            await api.put(`/aap/${aapId}/confirm`);
            addToast("Deed of Undertaking (Wa'd) executed successfully!", 'success');
            setContractModalOpen(false);
            fetchData();
        } catch (error) {
            addToast(error.response?.data?.message || 'Confirmation failed', 'error');
        } finally {
            setSigningContract(false);
        }
    };

    const handleAcceptMurabaha = async (aapId) => {
        setSigningContract(true);
        try {
            await api.put(`/aap/${aapId}/accept-murabaha`);
            addToast('Murabaha Contract concluded! Awaiting delivery.', 'success');
            setContractModalOpen(false);
            fetchData();
        } catch (error) {
            addToast(error.response?.data?.message || 'Acceptance failed', 'error');
        } finally {
            setSigningContract(false);
        }
    };

    const handleAAPDecline = async (aapId) => {
        const reason = prompt('Why are you declining this purchase?');
        if (!reason) return;
        setAapActionLoadingId(aapId);
        setDecliningContract(true);
        try {
            await api.put(`/aap/${aapId}/decline`, { reason });
            addToast('Purchase declined.', 'info');
            setContractModalOpen(false);
            fetchData();
        } catch (error) {
            addToast(error.response?.data?.message || 'Decline failed', 'error');
        } finally {
            setAapActionLoadingId(null);
            setDecliningContract(false);
        }
    };

    const handleAAPReceive = async (aapId) => {
        const pickupCode = prompt('Enter the 6-digit OTP from your agent to confirm you received the goods:');
        if (!pickupCode) return;
        try {
            await api.put(`/aap/${aapId}/receive`, { pickupCode });
            addToast('Goods received! Amount added to your repayment balance.', 'success');
            fetchData();
        } catch (error) {
            addToast(error.response?.data?.message || 'Receipt confirmation failed', 'error');
        }
    };

    const openRequestGoodsModal = async () => {
        setShowRequestGoodsModal(true);
        setAgentsLoading(true);
        setSelectedAgent(null);
        setTraderNote('');
        setAgentSearch('');
        try {
            const res = await api.get('/retailer/agents');
            const currentUserId = profile?._id || user?._id;
            const availableAgents = (res.data || []).filter(ag => !currentUserId || ag._id !== currentUserId);
            setAgents(availableAgents);
        } catch (err) {
            console.error('Failed to load agents:', err);
            addToast('Could not load market agents', 'error');
        } finally {
            setAgentsLoading(false);
        }
    };

    const handleSendAAPRequest = async () => {
        if (!selectedAgent) {
            addToast('Please select a market agent first', 'warning');
            return;
        }

        const currentUserId = profile?._id || user?._id;
        if (currentUserId && selectedAgent._id === currentUserId) {
            addToast('You cannot select yourself as the agent for goods purchase', 'error');
            return;
        }

        setSubmittingRequest(true);
        try {
            const res = await api.post('/aap/trader/initiate', {
                agentId: selectedAgent._id,
                traderRequestNote: traderNote.trim()
            });
            addToast(`Purchase request dispatched to ${selectedAgent.name}!`, 'success');
            setShowRequestGoodsModal(false);
            fetchData();
        } catch (err) {
            addToast(err.response?.data?.message || 'Failed to submit request', 'error');
        } finally {
            setSubmittingRequest(false);
        }
    };

    const handleCancelAAPRequest = (aapId) => {
        setConfirmModal({
            isOpen: true,
            title: 'Cancel Purchase Request',
            message: 'Are you sure you want to cancel this purchase request? The agent will be notified.',
            isDestructive: true,
            onConfirm: async () => {
                setAapActionLoadingId(aapId);
                setDecliningContract(true);
                try {
                    await api.put(`/aap/${aapId}/cancel`, { reason: 'Cancelled by trader' });
                    addToast('Purchase request cancelled', 'success');
                    setContractModalOpen(false);
                    fetchData();
                } catch (err) {
                    addToast(err.response?.data?.message || 'Failed to cancel request', 'error');
                } finally {
                    setAapActionLoadingId(null);
                    setDecliningContract(false);
                }
            }
        });
    };

    const viewOrderDetails = async (orderId) => {
        try {
            const res = await api.get(`/orders/${orderId}`);
            setSelectedOrder(res.data);
        } catch (error) {
            console.error('Failed to fetch order details', error);
            // Fallback to local data if API fails
            const localOrder = orders.find(o => o._id === orderId);
            if (localOrder) setSelectedOrder(localOrder);
        }
    };


    if (loading) return (
        <div className="loading-overlay">
            <div className="loading-text">Loading Dashboard...</div>
        </div>
    );

    if (!profile) return <div className="error-container">Error loading profile. Please refresh.</div>;

    if (profile && !profile.isProfileComplete && profile.hasTakenTest) {
        return <KYCStatusGate profile={profile} role="retailer" />;
    }

    if (!profile.hasTakenTest) {
        return (
            <div className="onboarding-wrapper">
                <div className="onboarding-card">
                    <div className="onboarding-bar" />
                    <h2 className="onboarding-title">Welcome, {profile.name}</h2>
                    <p className="onboarding-subtitle">
                        Unlock your credit limit by completing our quick trust assessment.
                    </p>
                    <button onClick={() => navigate('/onboarding')} className="onboarding-btn">
                        Start Assessment
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="dashboard-container animate-fade-in">
            {/* Header Area */}
            <header className="page-hero">
                <div className="page-hero-icon">
                    <LayoutDashboard size={24} />
                </div>
                <div className="page-hero-body">
                    <h1 className="page-hero-title">Hello, {profile.name}</h1>
                    <p className="page-hero-subtitle">Your financial command center.</p>
                </div>
                <div className="page-hero-actions">
                    <button className="marketplace-btn group" onClick={() => navigate('/marketplace')}>
                        <div className="btn-content">
                            <ShoppingBag size={20} />
                            <span>Access Marketplace</span>
                        </div>
                        <div className="btn-glow"></div>
                    </button>
                </div>
            </header>

            {/* HUD Status Cards */}
            <div className="hud-grid">
                
                {/* Amana Score Card */}
                <div className="stat-card">
                    <div className="stat-card-header">
                        <div className="stat-card-icon">
                            <TrendingUp size={22} />
                        </div>
                        <div className="stat-card-title">
                            <h3>Amana Score</h3>
                            <span>Trust Metric</span>
                        </div>
                    </div>
                    <div className="stat-card-body">
                        <div className="stat-card-value">
                            <span className="value-main">{profile.amanaScore}</span>
                            <span className="value-suffix">/ 100</span>
                        </div>
                        <div className="tier-badges">
                            <span className={`tier-badge ${
                                profile.tier === 'Gold' ? 'gold' :
                                profile.tier === 'Silver' ? 'silver' : 'bronze'
                            }`}>
                                {profile.tier} Tier
                            </span>
                            <span className="fee-badge">
                                Markup from 4%
                            </span>
                        </div>
                    </div>
                    <div className="stat-card-progress">
                        <div className="progress-track">
                            <div 
                                className="progress-fill" 
                                style={{ width: `${profile.amanaScore}%` }}
                            ></div>
                        </div>
                    </div>
                </div>

                {/* Credit Limit Card */}
                <div className="stat-card">
                    <div className="stat-card-header">
                        <div className="stat-card-icon">
                            <CreditCard size={22} />
                        </div>
                        <div className="stat-card-title">
                            <h3>Credit Limit</h3>
                            <span>Available to Spend</span>
                        </div>
                    </div>
                    <div className="stat-card-body">
                        <div className="stat-card-value currency">
                            <span className="currency-sign">₦</span>
                            <span className="value-main">{(profile.availableCredit !== undefined ? Math.max(0, profile.availableCredit) : Math.max(0, profile.creditLimit - profile.usedCredit - (profile.reservedCredit || 0))).toLocaleString()}</span>
                        </div>
                        <p className="stat-card-note">
                            Max Limit: ₦{profile.creditLimit.toLocaleString()}
                            {profile.reservedCredit > 0 && ` (₦${profile.reservedCredit.toLocaleString()} in-flight)`}
                        </p>
                    </div>
                    <div className="stat-card-progress">
                        <div className="progress-track">
                            <div 
                                className="progress-fill" 
                                style={{ width: `${Math.min(100, ((profile.availableCredit !== undefined ? profile.availableCredit : (profile.creditLimit - profile.usedCredit)) / (profile.creditLimit || 1)) * 100)}%` }}
                            ></div>
                        </div>
                    </div>
                </div>

                {/* Active Orders Card */}
                <div className="stat-card">
                    <div className="stat-card-header">
                        <div className="stat-card-icon">
                            <Clock size={22} />
                        </div>
                        <div className="stat-card-title">
                            <h3>Active Orders</h3>
                            <span>Pending / In Progress</span>
                        </div>
                    </div>
                    <div className="stat-card-body">
                        <div className="stat-card-value">
                            <span className="value-main">{orders.filter(o => o.status !== 'cancelled' && o.status !== 'completed').length}</span>
                            <span className="value-suffix">Active</span>
                        </div>
                        <p className="stat-card-note">
                            {orders.filter(o => o.status === 'pending_vendor').length} awaiting vendor
                        </p>
                    </div>
                </div>
            </div>
            
            {/* Request Goods (AAP) Banner */}
            <div className="request-goods-banner card animate-slide-up">
                <div className="rgb-pill-row">
                    <div className="rgb-super-pill">
                        <Zap size={11} className="fill-current" />
                        <span>DIRECT AGENT PURCHASE</span>
                    </div>
                    <div className="rgb-credit-pill">
                        <CreditCard size={13} />
                        <span>Available: <strong>₦{(profile.availableCredit !== undefined ? Math.max(0, profile.availableCredit) : Math.max(0, profile.creditLimit - (profile.usedCredit || 0) - (profile.reservedCredit || 0))).toLocaleString()}</strong></span>
                    </div>
                </div>

                <div className="rgb-main-row">
                    <div className="rgb-icon-glow">
                        <ShoppingBag size={24} />
                    </div>

                    <div className="rgb-text-group">
                        <h3 className="rgb-title">Request Goods</h3>
                        <p className="rgb-desc">
                            Send a trusted agent to buy inventory directly for your shop with instant Amana credit.
                        </p>
                    </div>

                    <button className="rgb-action-btn" onClick={openRequestGoodsModal}>
                        <span>Request Now</span>
                        <ArrowRight size={14} />
                    </button>
                </div>

                <div className="rgb-perks-row">
                    <div className="rgb-perk-item">
                        <CheckCircle size={13} />
                        <span>Verified Agents</span>
                    </div>
                    <div className="rgb-perk-divider" />
                    <div className="rgb-perk-item">
                        <ShieldCheck size={13} />
                        <span>Murabaha Based</span>
                    </div>
                    <div className="rgb-perk-divider" />
                    <div className="rgb-perk-item">
                        <Clock size={13} />
                        <span>Fast Dispatch</span>
                    </div>
                </div>
            </div>

            {/* Agent Assisted Purchases (AAP) Section */}
            {aaps.filter(a => ['trader_initiated', 'awaiting_retailer_confirm', 'pending_admin_approval', 'fund_disbursed', 'pending_murabaha_acceptance', 'murabaha_accepted', 'delivered'].includes(a.status)).length > 0 && (
                <div className="aap-retailer-section animate-slide-up">
                    <h2 className="section-title">Agent-Assisted Purchases</h2>
                    <div className="aap-retailer-grid">
                        {aaps.filter(a => ['trader_initiated', 'awaiting_retailer_confirm', 'pending_admin_approval', 'fund_disbursed', 'pending_murabaha_acceptance', 'murabaha_accepted', 'delivered'].includes(a.status)).map(aap => (
                            <div key={aap._id} className="aap-retailer-card card">
                                <div className="aap-header">
                                    <div className="aap-title-group">
                                        <h3 className="aap-product-name">{aap.productName || aap.traderRequestNote || 'Goods Purchase'}</h3>
                                        <span className={`status-pill-small ${aap.status.replace(/_/g, '-')}`}>
                                            {aap.status === 'trader_initiated' ? 'Agent Assigned' :
                                             aap.status === 'awaiting_retailer_confirm' ? 'Sign Undertaking' : 
                                             aap.status === 'pending_murabaha_acceptance' ? 'Sign Murabaha' :
                                             aap.status === 'murabaha_accepted' ? 'Awaiting Delivery' :
                                             aap.status.replace(/_/g, ' ')}
                                        </span>
                                    </div>
                                </div>
                                <div className="aap-body">
                                    {aap.status === 'trader_initiated' ? (
                                        <div className="aap-trader-initiated-info">
                                            <p className="aap-goods-note">
                                                <strong>Items Requested:</strong> {aap.traderRequestNote || 'Inventory to be purchased'}
                                            </p>
                                            <div className="aap-meta-footer">
                                                <div className="aap-meta-row">
                                                    <User size={14} /> <span>Assigned Agent: {aap.agent?.name || 'Assigned'}</span>
                                                </div>
                                                {aap.agent?.phone && (
                                                    <div className="aap-meta-row">
                                                        <Phone size={14} /> <span>{aap.agent?.phone}</span>
                                                    </div>
                                                )}
                                            </div>
                                            <p className="aap-instruction" style={{ color: 'var(--color-brand)' }}>
                                                Request dispatched. Your agent will source and verify the goods for your review.
                                            </p>
                                        </div>
                                    ) : (
                                        <>
                                            <div className="aap-breakdown-mini">
                                                <div className="breakdown-item">
                                                    <span className="label">{['awaiting_retailer_confirm', 'pending_admin_approval', 'fund_disbursed'].includes(aap.status) ? 'Estimated Wholesale Cost' : 'Disclosed Cost'}</span>
                                                    <span className="value">₦{aap.purchasePrice?.toLocaleString()}</span>
                                                </div>
                                                {['pending_murabaha_acceptance', 'murabaha_accepted', 'delivered', 'received', 'completed'].includes(aap.status) && (
                                                    <>
                                                        <div className="breakdown-item">
                                                            <span className="label">Markup ({aap.markupPercentage}%)</span>
                                                            <span className="value">+ ₦{aap.markupAmount?.toLocaleString()}</span>
                                                        </div>
                                                        <div className="breakdown-item total">
                                                            <span className="label">Your Total</span>
                                                            <span className="value text-primary">₦{aap.totalRetailerCost?.toLocaleString()}</span>
                                                        </div>
                                                    </>
                                                )}
                                            </div>
                                            <div className="aap-meta-footer">
                                                <div className="aap-meta-row">
                                                    <User size={14} /> <span>Agent: {aap.agent?.name}</span>
                                                </div>
                                                <div className="aap-meta-row">
                                                    <Clock size={14} /> <span>Term: {aap.repaymentTerm} days</span>
                                                </div>
                                            </div>
                                            {aap.status === 'awaiting_retailer_confirm' ? (
                                                <p className="aap-instruction">Your agent has sourced and verified these goods. Review and sign the Deed of Undertaking (Wa'd) to commit to purchase under Murabaha once Amana acquires the goods.</p>
                                            ) : aap.status === 'pending_murabaha_acceptance' ? (
                                                <p className="aap-instruction" style={{ color: 'var(--color-brand)' }}>Amana has acquired possession of the goods. Review and sign the Murabaha Contract below.</p>
                                            ) : aap.status === 'murabaha_accepted' ? (
                                                <p className="aap-instruction" style={{ color: 'var(--color-brand)' }}>Murabaha sale concluded! Awaiting physical delivery from your agent.</p>
                                            ) : aap.status === 'delivered' ? (
                                                <p className="aap-instruction success">Goods delivered! Inspect physically and enter OTP to confirm receipt.</p>
                                            ) : (
                                                <p className="aap-instruction muted">
                                                    Status: {aap.status.replace(/_/g, ' ')}
                                                </p>
                                            )}
                                        </>
                                    )}
                                </div>

                                <div className="aap-actions">
                                    {aap.status === 'trader_initiated' && (
                                        <button 
                                            className="btn-decline" 
                                            onClick={() => handleCancelAAPRequest(aap._id)}
                                            disabled={aapActionLoadingId === aap._id || (decliningContract && activeContractAAPId === aap._id)}
                                        >
                                            {aapActionLoadingId === aap._id || (decliningContract && activeContractAAPId === aap._id) ? (
                                                <>
                                                    <span className="btn-spinner-sm danger" />
                                                    <span>Cancelling...</span>
                                                </>
                                            ) : (
                                                'Cancel Request'
                                            )}
                                        </button>
                                    )}
                                    {aap.status === 'awaiting_retailer_confirm' && (
                                        <>
                                            <button 
                                                className="btn-undertaking" 
                                                onClick={() => openContractModal('undertaking', aap)}
                                                disabled={(signingContract && activeContractAAPId === aap._id) || (decliningContract && activeContractAAPId === aap._id) || aapActionLoadingId === aap._id}
                                            >
                                                <Scale size={14} style={{ marginRight: 6 }} /> Review & Sign Undertaking
                                            </button>
                                            <button 
                                                className="btn-decline" 
                                                onClick={() => handleCancelAAPRequest(aap._id)}
                                                disabled={aapActionLoadingId === aap._id || (decliningContract && activeContractAAPId === aap._id)}
                                            >
                                                {aapActionLoadingId === aap._id || (decliningContract && activeContractAAPId === aap._id) ? (
                                                    <>
                                                        <span className="btn-spinner-sm danger" />
                                                        <span>Cancelling...</span>
                                                    </>
                                                ) : (
                                                    'Cancel Request'
                                                )}
                                            </button>
                                        </>
                                    )}
                                    {aap.status === 'pending_murabaha_acceptance' && (
                                        <button 
                                            className="btn-murabaha" 
                                            onClick={() => openContractModal('murabaha', aap)}
                                        >
                                            <BookOpen size={14} style={{ marginRight: 6 }} /> Review & Sign Murabaha
                                        </button>
                                    )}
                                    {aap.status === 'delivered' && (
                                        <button className="btn-approve" onClick={() => handleAAPReceive(aap._id)}>Confirm Receipt (Enter OTP)</button>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            <div className="credit-utilization-section">
                 <div className="utilization-header">
                    <p className="util-label">Total Limit: ₦{profile.creditLimit.toLocaleString()}</p>
                 </div>
                 <div className="utilization-track">
                      <div className="utilization-bg">
                        <div className="utilization-fill" style={{ width: `${((profile.creditLimit - profile.usedCredit) / profile.creditLimit) * 100}%` }}></div>
                      </div>
                 </div>
            </div>

            {/* Used Credit / Due - Only show if there's credit actually used (from confirmed orders) */}
            {profile.usedCredit > 0 && (
                <div className="due-card card">
                    <div className="due-header">
                        <div>
                            <p className="due-label">Total Outstanding Balance</p>
                            <h3 className="due-amount">₦{profile.usedCredit.toLocaleString()}</h3>
                        </div>
                        <div className="due-icon">
                            <Clock size={24} />
                        </div>
                    </div>

                    {/* Next Payment Specifics */}
                    {(() => {
                        const activeOrders = orders.filter(o => !o.isPaid && ['ready_for_pickup', 'goods_received', 'completed', 'defaulted'].includes(o.status) && o.dueDate);
                        const activeAAPs = aaps.filter(a => !a.isPaid && a.status === 'received' && a.dueDate);
                        
                        const combined = [
                            ...activeOrders.map(o => {
                                const total = o.totalRepaymentAmount || o.itemsPrice || 0;
                                const paid = o.amountPaid || 0;
                                const remaining = (o.remainingBalance !== undefined && o.remainingBalance !== null) ? o.remainingBalance : Math.max(0, total - paid);
                                return { ...o, _type: 'order', _total: total, _paid: paid, _amount: remaining, _name: o.orderItems[0]?.name || 'Order' };
                            }),
                            ...activeAAPs.map(a => {
                                const total = a.totalRetailerCost || a.purchasePrice || 0;
                                const paid = a.amountPaid || 0;
                                const remaining = (a.remainingBalance !== undefined && a.remainingBalance !== null) ? a.remainingBalance : Math.max(0, total - paid);
                                return { ...a, _type: 'aap', _total: total, _paid: paid, _amount: remaining, _name: a.productName || 'Assisted Purchase' };
                            })
                        ].filter(item => item._amount > 0)
                         .sort((a, b) => new Date(a.dueDate) - new Date(b.dueDate));

                        const earliestItem = combined[0];
                        
                        if (earliestItem) {
                            const diff = Math.ceil((new Date(earliestItem.dueDate) - new Date()) / (1000 * 60 * 60 * 24));
                            const statusText = diff > 0 ? `Due in ${diff} days` : `Overdue by ${Math.abs(diff)} days`;
                            const statusClass = diff > 0 ? 'ok' : 'overdue';

                            return (
                                <div className="next-payment-card">
                                    <div className="payment-row mb-1">
                                        <span className="payment-label">Next Payment</span>
                                        <span className={`payment-status ${statusClass}`}>{statusText}</span>
                                    </div>
                                    <div className="payment-row">
                                        <span className="payment-amount">₦{earliestItem._amount.toLocaleString()}</span>
                                        <span className="payment-id">
                                            {earliestItem._type === 'aap' && <span style={{ color: 'var(--color-brand)', marginRight: '4px' }}>AAP</span>}
                                            #{earliestItem._id.slice(-6)}
                                        </span>
                                    </div>
                                    {earliestItem._paid > 0 && (
                                        <div style={{ fontSize: '0.75rem', color: '#10b981', marginTop: '4px', fontWeight: 600 }}>
                                            ₦{earliestItem._paid.toLocaleString()} paid of ₦{earliestItem._total.toLocaleString()} (Partially Paid)
                                        </div>
                                    )}
                                </div>
                            );
                        } else if (profile.usedCredit > 0) {
                            // If user has balance but no specific due dates found (unlikely but safe)
                            return <p className="due-status">Balance due soon</p>;
                        } else {
                            return <p className="due-status">No immediate payments due</p>;
                        }
                    })()}

                    <button 
                        className="pay-btn"
                        onClick={() => openRepaymentModal()}
                    >
                        Pay Now
                    </button>
                </div>
            )}


            {/* Recent Activity / Transactions */}
            <div className="orders-section">
                <div className="section-header-flex">
                    <h2 className="section-title">Recent Activity</h2>
                    <button onClick={() => navigate('/transactions')} className="see-all-btn">
                        See All <ChevronRight size={16} />
                    </button>
                </div>
                
                <div className="orders-table-container card">
                    {(() => {
                        const recentTxs = transactions.slice(0, 5);
                        if (recentTxs.length === 0) {
                            return (
                                <div className="empty-state">
                                    <div className="empty-icon-box">
                                        <ShoppingBag className="empty-icon" size={32} />
                                    </div>
                                    <h3 className="empty-title">No activity yet</h3>
                                    <p className="empty-text">Start building your credit history by making your first purchase on the marketplace.</p>
                                    <button onClick={() => navigate('/marketplace')} className="btn btn-outline">
                                        Browse Products
                                    </button>
                                </div>
                            );
                        }

                        return (
                            <div className="compact-transaction-list">
                                {recentTxs.map(tx => {
                                    const isRepay = ['repayment', 'admin_partial_payment', 'admin_cash_confirmation'].includes(tx.type);
                                    const typeTitle = tx.type === 'admin_partial_payment' 
                                        ? 'Partial Repayment' 
                                        : tx.type === 'admin_cash_confirmation' 
                                            ? 'Cash Settlement' 
                                            : tx.type === 'repayment' 
                                                ? 'Repayment' 
                                                : tx.type?.replace(/_/g, ' ');

                                    return (
                                        <div key={tx._id} className="premium-tx-card card" onClick={() => navigate('/transactions')}>
                                            <div className="tx-date-col">
                                                <span className="tx-day">{new Date(tx.date || tx.createdAt).getDate()}</span>
                                                <span className="tx-month">{new Date(tx.date || tx.createdAt).toLocaleString('default', { month: 'short' }).toUpperCase()}</span>
                                            </div>
                                            <div className="tx-main-info">
                                                <div className="tx-row-top">
                                                    <span className="tx-id">{tx.description || typeTitle}</span>
                                                    <span className={`status-pill-small ${tx.status || 'success'}`}>
                                                        {tx.status || 'success'}
                                                    </span>
                                                </div>
                                                <div className="tx-items-preview">
                                                    <span className="items-text">
                                                        Ref: {(tx.reference || tx._id || '').slice(-8).toUpperCase()}
                                                    </span>
                                                </div>
                                            </div>
                                            <div className="tx-amount-col">
                                                <span className={`tx-amount ${isRepay ? 'text-green' : ''}`}>
                                                    {isRepay ? '-' : '+'}₦{(tx.amount || 0).toLocaleString()}
                                                </span>
                                                <span className="tx-type">{typeTitle}</span>
                                            </div>
                                            <div className="tx-arrow">
                                                <ChevronRight size={20} />
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        );
                    })()}
                </div>
            </div>

            {/* Order Details Modal */}
            {selectedOrder && (
                <div className="order-modal-backdrop" onClick={() => setSelectedOrder(null)}>
                    <div className="order-modal" onClick={(e) => e.stopPropagation()}>
                        <div className="order-modal-header">
                            <h3 className="order-modal-title">Order Details</h3>
                            <button className="close-modal-btn" onClick={() => setSelectedOrder(null)}>
                                <X size={24} />
                            </button>
                        </div>
                        
                        <div className="order-modal-body">
                            {/* Status Banner */}
                            <div className={`order-status-banner status-${selectedOrder.status?.replace(/_/g, '-')}`}>
                                {selectedOrder.status === 'pending_vendor' && <Clock size={20} />}
                                {selectedOrder.status === 'cancelled' && <X size={20} />}
                                {(selectedOrder.status === 'completed' || selectedOrder.status === 'delivered') && <CheckCircle size={20} />}
                                <span>{selectedOrder.status?.replace(/_/g, ' ').toUpperCase() || 'PENDING'}</span>
                            </div>

                            {/* Order Info */}
                            <div className="order-info-grid">
                                <div className="order-info-item">
                                    <span className="info-label">Order ID</span>
                                    <span className="info-value font-mono">#{selectedOrder._id?.substring(selectedOrder._id.length - 8).toUpperCase()}</span>
                                </div>
                                <div className="order-info-item">
                                    <span className="info-label">Date Placed</span>
                                    <span className="info-value">{new Date(selectedOrder.createdAt).toLocaleDateString('en-NG', { year: 'numeric', month: 'long', day: 'numeric' })}</span>
                                </div>
                                <div className="order-info-item">
                                    <span className="info-label">Chosen Term</span>
                                    <span className="info-value">{selectedOrder.repaymentTerm || 14} Days</span>
                                </div>
                            </div>

                            {/* Products List */}
                            <div className="order-products-section">
                                <h4 className="section-label">Products Ordered</h4>
                                {selectedOrder.orderItems?.map((item, idx) => (
                                    <div key={idx} className="order-product-card-enhanced">
                                        {/* Product Image */}
                                        <div className="product-image-box">
                                            {item.image ? (
                                                <img src={item.image} alt={item.name} className="product-img" />
                                            ) : (
                                                <Package size={32} className="text-muted" />
                                            )}
                                        </div>
                                        
                                        {/* Product Details */}
                                        <div className="product-details-col">
                                            <h5 className="product-title">{item.name || 'Product'}</h5>
                                            <div className="product-meta">
                                                <span className="meta-item">Qty: {item.qty || 1}</span>
                                                <span className="meta-divider">•</span>
                                                <span className="meta-item">Unit Price: ₦{(item.price || 0).toLocaleString()}</span>
                                            </div>
                                        </div>
                                        
                                        {/* Line Total */}
                                        <div className="product-line-total">
                                            <span className="line-total-label">Subtotal</span>
                                            <span className="line-total-value">₦{((item.price || 0) * (item.qty || 1)).toLocaleString()}</span>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            {/* Financial Breakdown */}
                            <div className="order-financial-breakdown">
                                <div className="breakdown-line">
                                    <span>Item Price</span>
                                    <span>₦{(selectedOrder.itemsPrice || 0).toLocaleString()}</span>
                                </div>
                                <div className="breakdown-line">
                                    <span>Murabaha Markup ({selectedOrder.markupPercentage ?? 0}%)</span>
                                    <span className="text-green">+ ₦{(selectedOrder.markupAmount || 0).toLocaleString()}</span>
                                </div>
                                <div className="breakdown-line total">
                                    <span>Total Repayment</span>
                                    <span>₦{(selectedOrder.totalRepaymentAmount || selectedOrder.totalPrice || 0).toLocaleString()}</span>
                                </div>
                            </div>

                            {/* Agent Information (if Murabaha Flow) */}
                            {selectedOrder.agent && (
                                <div className="order-agent-info-card mt-6">
                                    <h4 className="section-label">Your Assigned Agent</h4>
                                    <div className="agent-card-mini">
                                        <div className="agent-avatar-mini">
                                            {selectedOrder.agent.kyc?.profilePicUrl ? <img src={selectedOrder.agent.kyc.profilePicUrl} alt={selectedOrder.agent.name} /> : <User size={20} />}
                                        </div>
                                        <div className="agent-details-mini">
                                            <p className="agent-name-mini">{selectedOrder.agent.name}</p>
                                            <p className="agent-phone-mini"><Phone size={12} /> {selectedOrder.agent.phone}</p>
                                        </div>
                                        <div className={`agent-status-tag ${selectedOrder.status === 'vendor_settled' ? 'verified' : 'pending'}`}>
                                            {selectedOrder.status === 'vendor_settled' ? 'Goods with Agent' : 'Meeting with Agent'}
                                        </div>
                                    </div>
                                    {selectedOrder.status === 'ready_for_pickup' && (
                                        <p className="agent-instruction-text">
                                            Meet with <strong>{selectedOrder.agent.name}</strong> at the vendor's location. The agent will settle the vendor and take possession of the goods for you.
                                        </p>
                                    )}
                                    {selectedOrder.status === 'vendor_settled' && (
                                        <p className="agent-instruction-text success">
                                            The agent has settled the vendor. You can now take the goods from the agent and confirm receipt below.
                                        </p>
                                    )}
                                </div>
                            )}

                            {/* Actions */}
                            {(selectedOrder.status === 'pending_vendor' || selectedOrder.status === 'ready_for_pickup' || selectedOrder.status === 'vendor_settled') && (
                                <div className="order-actions-section">
                                    {(selectedOrder.status === 'ready_for_pickup' || selectedOrder.status === 'vendor_settled') && (
                                        <>
                                            <button 
                                                className={`confirm-pickup-btn ${selectedOrder.status !== 'vendor_settled' ? 'disabled' : ''}`}
                                                onClick={() => handleConfirmGoodsReceived(selectedOrder._id)}
                                                disabled={selectedOrder.status !== 'vendor_settled'}
                                            >
                                                {selectedOrder.status === 'vendor_settled' ? '✓ I have received the goods' : 'Waiting for Agent to Settle'}
                                            </button>
                                            {selectedOrder.status === 'ready_for_pickup' && (
                                                <p className="pickup-instructions">
                                                    Once you meet the agent and they settle the vendor, you can confirm receipt here.
                                                </p>
                                            )}
                                        </>
                                    )}
                                    {selectedOrder.status === 'pending_vendor' && (
                                        <button 
                                            className="cancel-order-btn-large"
                                            onClick={() => handleCancelOrder(selectedOrder._id)}
                                            disabled={cancellingOrderId === selectedOrder._id}
                                        >
                                            {cancellingOrderId === selectedOrder._id ? 'Cancelling...' : 'Cancel Order'}
                                        </button>
                                    )}
                                </div>
                            )}

                            {selectedOrder.status === 'vendor_settled' && selectedOrder.pickupCode && (
                                <div className="pickup-code-box">
                                    <span className="pickup-label">Pickup Code</span>
                                    <span className="pickup-code">{selectedOrder.pickupCode}</span>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}

            {/* Repayment Modal - Premium Redesign (Plain CSS) */}
            {showRepaymentModal && (
                <div className="repayment-modal-overlay" onClick={() => setShowRepaymentModal(false)}>
                    <div className="repayment-modal-container" onClick={e => e.stopPropagation()}>
                        
                        {/* Header */}
                        <div className="repayment-header">
                            <div className="repayment-title-group">
                                <h2>
                                    <CreditCard size={24} color="#10b981" />
                                    Settle Murabaha Facility
                                </h2>
                                <p className="repayment-subtitle">Select a contract to settle securely.</p>
                            </div>
                            <button 
                                className="repayment-close-btn"
                                onClick={() => setShowRepaymentModal(false)}
                            >
                                <X size={20} />
                            </button>
                        </div>

                        {/* Body */}
                        <div className="repayment-body custom-scrollbar">
                                           
                                           {(() => {
                                               const activeOrders = orders.filter(o => !o.isPaid && ['ready_for_pickup', 'goods_received', 'completed', 'defaulted'].includes(o.status));
                                               const activeAAPs = aaps.filter(a => !a.isPaid && a.status === 'received');
                                               
                                               // Helper: compute remaining balance (same logic as backend)
                                               const getRemaining = (doc, totalField) => {
                                                   const total = doc[totalField] || 0;
                                                   if (doc.remainingBalance !== undefined && doc.remainingBalance !== null) return doc.remainingBalance;
                                                   return Math.max(0, total - (doc.amountPaid || 0));
                                               };

                                               const combined = [
                                                   ...activeOrders.map(o => {
                                                       const totalDebt = o.totalRepaymentAmount || o.itemsPrice || 0;
                                                       const remaining = getRemaining(o, 'totalRepaymentAmount');
                                                       return { ...o, _isAAP: false, _totalDebt: totalDebt, _amount: remaining, _amountPaid: o.amountPaid || 0, _name: o.orderItems[0]?.name || 'Order', _others: o.orderItems.length - 1 };
                                                   }),
                                                   ...activeAAPs.map(a => {
                                                       const totalDebt = a.totalRetailerCost || a.purchasePrice || 0;
                                                       const remaining = getRemaining(a, 'totalRetailerCost');
                                                       return { ...a, _isAAP: true, _totalDebt: totalDebt, _amount: remaining, _amountPaid: a.amountPaid || 0, _name: a.productName, _others: 0 };
                                                   })
                                               ].filter(item => item._amount > 0).sort((a, b) => {
                                                   if (!a.dueDate) return -1;
                                                   if (!b.dueDate) return 1;
                                                   return new Date(a.dueDate) - new Date(b.dueDate);
                                               });

                                               if (combined.length === 0) {
                                                   return (
                                                       <div className="repayment-empty-state">
                                                           <div style={{ marginBottom: '1rem', color: 'var(--color-brand)' }}>
                                                               <ShieldCheck size={48} />
                                                           </div>
                                                           <h3 style={{ fontSize: '1.125rem', fontWeight: 'bold', color: 'white', marginBottom: '0.5rem' }}>All Caught Up!</h3>
                                                           <p>You have no active financing balances. Your Sharia credit standing is in excellent shape.</p>
                                                       </div>
                                                   );
                                               }

                                               return (
                                                   <div>
                                                       {combined.map(item => {
                                                           const isSelected = targetOrderId === item._id;
                                                           const isOverdue = !item.dueDate || new Date(item.dueDate) < new Date();
                                                           
                                                           return (
                                                               <div 
                                                                   key={item._id}
                                                                   onClick={() => {
                                                                       setTargetOrderId(item._id);
                                                                       setRepaymentAmount(item._amount.toString());
                                                                   }}
                                                                   className={`repayment-card ${isSelected ? 'selected' : ''}`}
                                                               >
                                                                   <div className="selection-bar" />

                                                                   <div className="card-content">
                                                                       <div className="card-row-top">
                                                                           <div>
                                                                               <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                                                                   <span className="card-id-badge">
                                                                                       #{item._id.slice(-6)}
                                                                                   </span>
                                                                                   {item._isAAP && 
                                                                                       <span className="premium-badge-aap">
                                                                                           AAP
                                                                                       </span>
                                                                                   }
                                                                                   {isOverdue && 
                                                                                       <span style={{ fontSize: '0.65rem', color: '#ef4444', fontWeight: 'bold', textTransform: 'uppercase', display: 'flex', gap: '4px', alignItems: 'center', background: 'rgba(239,68,68,0.1)', padding: '2px 6px', borderRadius: '4px' }}>
                                                                                           <AlertCircle size={10} /> Overdue
                                                                                       </span>
                                                                                   }
                                                                               </div>
                                                                               <h4 className="card-item-title">
                                                                                   {item._name}
                                                                                   {item._others > 0 && <span style={{ color: '#9ca3af', fontWeight: 'normal' }}> +{item._others} others</span>}
                                                                               </h4>
                                                                           </div>
                                                                           <div className="check-indicator">
                                                                               {isSelected && <CheckCircle size={14} strokeWidth={3} />}
                                                                           </div>
                                                                       </div>

                                                                       <div className="card-row-bottom">
                                                                           <div>
                                                                               <p className="due-label">Due Date</p>
                                                                               <p className={`due-date ${isOverdue ? 'overdue' : ''}`}>
                                                                                   {item.dueDate ? new Date(item.dueDate).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' }) : 'Immediate'}
                                                                               </p>
                                                                           </div>
                                                                           <div style={{ textAlign: 'right' }}>
                                                                                <p className="amount-label">Balance Due</p>
                                                                                <p className="amount-value">₦{item._amount.toLocaleString()}</p>
                                                                                {item._amountPaid > 0 && (
                                                                                    <div style={{ marginTop: '4px' }}>
                                                                                        <p style={{ fontSize: '0.65rem', color: '#10b981', margin: 0, fontWeight: 600 }}>₦{item._amountPaid.toLocaleString()} paid of ₦{item._totalDebt.toLocaleString()}</p>
                                                                                        <div style={{ width: '80px', height: '3px', background: 'rgba(255,255,255,0.1)', borderRadius: '2px', marginTop: '3px', overflow: 'hidden', marginLeft: 'auto' }}>
                                                                                            <div style={{ width: `${Math.min(100, Math.round((item._amountPaid / item._totalDebt) * 100))}%`, height: '100%', background: 'var(--color-brand)', borderRadius: '2px' }} />
                                                                                        </div>
                                                                                    </div>
                                                                                )}
                                                                           </div>
                                                                       </div>
                                                                   </div>
                                                               </div>
                                                           );
                                                       })}
                                                    </div>
                                               );
                                           })()}
                        </div>

                        {/* Footer */}
                        <div className="repayment-footer">
                            {/* Locked Full Settlement Amount Display */}
                            {targetOrderId && (() => {
                                const allItems = [...orders, ...aaps];
                                const selectedItem = allItems.find(i => i._id === targetOrderId);
                                const totalDebt = selectedItem?.totalRepaymentAmount || selectedItem?.totalRetailerCost || 0;
                                const amountPaid = selectedItem?.amountPaid || 0;
                                const remaining = selectedItem?.remainingBalance !== undefined && selectedItem?.remainingBalance !== null
                                    ? selectedItem.remainingBalance
                                    : Math.max(0, totalDebt - amountPaid);

                                return (
                                    <div style={{
                                        background: 'rgba(255, 255, 255, 0.04)',
                                        border: '1px solid rgba(255, 255, 255, 0.1)',
                                        borderRadius: '12px',
                                        padding: '12px 16px',
                                        marginBottom: '1rem'
                                    }}>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                            <div>
                                                <span style={{ fontSize: '0.8rem', color: '#9ca3af', fontWeight: 600, display: 'block' }}>
                                                    {amountPaid > 0 ? 'Price Left to Settle (In Full)' : 'Full Settlement Amount'}
                                                </span>
                                                {amountPaid > 0 && (
                                                    <span style={{ fontSize: '0.7rem', color: '#10b981', marginTop: '2px', display: 'block' }}>
                                                        ₦{amountPaid.toLocaleString()} paid of ₦{totalDebt.toLocaleString()}
                                                    </span>
                                                )}
                                            </div>
                                            <span style={{ fontSize: '1.25rem', fontWeight: 800, color: '#10b981' }}>
                                                ₦{remaining.toLocaleString()}
                                            </span>
                                        </div>
                                    </div>
                                );
                            })()}

                            <div className="security-badges">
                                <span className="sec-badge">
                                    <ShieldCheck size={14} color="#10b981" />
                                    Bank Grade Security
                                </span>
                                <span className="sec-badge">
                                    <Lock size={14} color="#10b981" />
                                    End-to-End Encrypted
                                </span>
                            </div>

                            <button 
                                className="pay-secure-btn"
                                onClick={handleInitiatePayment}
                                disabled={isPayLoading || !targetOrderId || !repaymentAmount || parseFloat(repaymentAmount) <= 0}
                            >
                                {isPayLoading ? (
                                    <>
                                        <div className="animate-spin" style={{ height: '20px', width: '20px', border: '2px solid white', borderTopColor: 'transparent', borderRadius: '50%' }}></div>
                                        <span>Processing...</span>
                                    </>
                                ) : targetOrderId ? (
                                    <>
                                        <Lock size={18} />
                                        <span>Pay ₦{parseFloat(repaymentAmount || 0).toLocaleString()} in Full</span>
                                    </>
                                ) : (
                                    'Select a contract above'
                                )}
                            </button>
                            
                            <div className="paystack-brand">
                                Powered by Paystack
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Request Goods Modal */}
            {showRequestGoodsModal && (
                <div className="modal-overlay request-goods-overlay animate-fade-in" onClick={() => setShowRequestGoodsModal(false)}>
                    <div className="request-goods-modal animate-scale-up" onClick={e => e.stopPropagation()}>
                        <div className="rgm-drag-handle" />
                        
                        <div className="rgm-header">
                            <div>
                                <div className="rgm-badge">
                                    <ShieldCheck size={12} />
                                    <span>SHARIA-COMPLIANT CREDIT</span>
                                </div>
                                <h2 className="rgm-title">Request Goods Purchase</h2>
                                <p className="rgm-subtitle">Select a verified agent to buy stock in the market for your shop.</p>
                            </div>
                            <button className="rgm-close-btn" onClick={() => setShowRequestGoodsModal(false)}>
                                <X size={18} />
                            </button>
                        </div>

                        {/* Credit Status */}
                        <div className="rgm-credit-card">
                            <div className="rgm-credit-icon">
                                <CreditCard size={18} />
                            </div>
                            <div className="rgm-credit-info">
                                <span className="rgm-credit-label">Available Credit Line</span>
                                <span className="rgm-credit-amount">₦{(profile.availableCredit !== undefined ? Math.max(0, profile.availableCredit) : Math.max(0, profile.creditLimit - (profile.usedCredit || 0) - (profile.reservedCredit || 0))).toLocaleString()}</span>
                            </div>
                            <div className="rgm-credit-pill">
                                <span className="rgm-dot" />
                                <span>Ready to spend</span>
                            </div>
                        </div>

                        {/* Agent Search */}
                        <div className="rgm-search-bar">
                            <Search size={16} />
                            <input 
                                type="text" 
                                placeholder="Search agent name or market (e.g. Mile 12)..." 
                                value={agentSearch} 
                                onChange={e => setAgentSearch(e.target.value)}
                            />
                            {agentSearch && (
                                <button className="rgm-clear-search" onClick={() => setAgentSearch('')}>
                                    <X size={14} />
                                </button>
                            )}
                        </div>

                        {/* Agent List */}
                        <div className="rgm-list-header">
                            <span>Verified Market Agents</span>
                            <span className="rgm-agent-count">{agents.length} Available</span>
                        </div>

                        {agentsLoading ? (
                            <div className="rgm-loading-state">
                                <div className="spinner-mini" />
                                <span>Finding available market agents...</span>
                            </div>
                        ) : (
                            <div className="rgm-agent-list">
                                {agents
                                    .filter(ag => {
                                        const currentUserId = profile?._id || user?._id;
                                        if (currentUserId && ag._id === currentUserId) return false;
                                        const q = agentSearch.toLowerCase();
                                        return !q || ag.name?.toLowerCase().includes(q) || ag.market?.toLowerCase().includes(q);
                                    })
                                    .map(ag => {
                                        const isSelected = selectedAgent?._id === ag._id;
                                        return (
                                            <div 
                                                key={ag._id} 
                                                className={`rgm-agent-item ${isSelected ? 'selected' : ''}`}
                                                onClick={() => setSelectedAgent(ag)}
                                            >
                                                <div className="rgm-agent-avatar">
                                                    <span>{ag.name?.charAt(0)?.toUpperCase()}</span>
                                                    <span className="rgm-online-indicator" />
                                                </div>
                                                <div className="rgm-agent-details">
                                                    <div className="rgm-agent-name-row">
                                                        <span className="rgm-agent-name">{ag.name}</span>
                                                        <CheckCircle size={13} className="text-primary" />
                                                    </div>
                                                    <span className="rgm-agent-sub">
                                                        {ag.market ? `📍 ${ag.market}` : 'Verified Market Agent'} · {ag.phone}
                                                    </span>
                                                </div>
                                                <div className={`rgm-radio ${isSelected ? 'active' : ''}`}>
                                                    {isSelected && <CheckCircle size={14} />}
                                                </div>
                                            </div>
                                        );
                                    })
                                }
                                {agents.length === 0 && !agentsLoading && (
                                    <div className="rgm-empty-agents">No market agents currently available.</div>
                                )}
                            </div>
                        )}

                        {/* Goods Note Input */}
                        <div className="rgm-note-section">
                            <div className="rgm-note-header">
                                <label>What goods do you need?</label>
                                <span className="rgm-optional-badge">Optional</span>
                            </div>
                            <textarea 
                                className="rgm-textarea"
                                rows={2}
                                placeholder="e.g. 5 bags of Mama Gold 50kg rice, 2 cartons vegetable oil..."
                                value={traderNote}
                                onChange={e => setTraderNote(e.target.value)}
                            />
                            <p className="rgm-note-tip">
                                💡 The agent will buy the items, verify quality, and input price for your approval.
                            </p>
                        </div>

                        {/* Action CTA */}
                        <button 
                            className="rgm-submit-btn" 
                            disabled={!selectedAgent || submittingRequest}
                            onClick={handleSendAAPRequest}
                        >
                            {submittingRequest ? "Dispatching Agent..." : selectedAgent ? `Request ${selectedAgent.name.split(' ')[0]} to Buy Goods →` : "Select an Agent to Continue"}
                        </button>
                    </div>
                </div>
            )}

            <ConfirmModal 
                isOpen={confirmModal.isOpen}
                onClose={() => setConfirmModal({ ...confirmModal, isOpen: false })}
                onConfirm={confirmModal.onConfirm}
                title={confirmModal.title}
                message={confirmModal.message}
                isDestructive={confirmModal.isDestructive}
                confirmText={confirmModal.confirmText}
            />

            <ContractModal
                isOpen={contractModalOpen}
                onClose={() => !signingContract && !decliningContract && setContractModalOpen(false)}
                contractData={activeContractData}
                onSign={() => {
                    if (contractType === 'undertaking') {
                        handleAAPConfirm(activeContractAAPId);
                    } else {
                        handleAcceptMurabaha(activeContractAAPId);
                    }
                }}
                onDecline={() => {
                    if (contractType === 'undertaking') {
                        handleCancelAAPRequest(activeContractAAPId);
                    } else {
                        handleAAPDecline(activeContractAAPId);
                    }
                }}
                isSigning={signingContract}
                isDeclining={decliningContract}
                canSign={true}
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

export default RetailerDashboard;
