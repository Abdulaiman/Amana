import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import './RetailerDashboard.css';
import { CreditCard, TrendingUp, ShoppingBag, Clock, ChevronRight, AlertCircle, CheckCircle, X, Package, ShieldCheck, Lock } from 'lucide-react';

const RetailerDashboard = () => {
    const [profile, setProfile] = useState(null);
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [cancellingOrderId, setCancellingOrderId] = useState(null);
    const [selectedOrder, setSelectedOrder] = useState(null); // For order details modal
    
    // Payment State
    const [showRepaymentModal, setShowRepaymentModal] = useState(false);
    const [repaymentAmount, setRepaymentAmount] = useState('');
    const [targetOrderId, setTargetOrderId] = useState(null); // If paying specific order
    const [isPayLoading, setIsPayLoading] = useState(false);

    const navigate = useNavigate();

    useEffect(() => {
        const fetchData = async () => {
            try {
                const profileRes = await api.get('/retailer/profile');
                setProfile(profileRes.data);
                
                // Fetch orders
                const ordersRes = await api.get('/orders/myorders');
                setOrders(ordersRes.data);
            } catch (error) {
                console.error('Failed to fetch dashboard data', error);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    const handleCancelOrder = async (orderId) => {
        if (!window.confirm('Are you sure you want to cancel this order?')) return;
        
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
                alert('Order cancelled and credit refunded successfully!');
            } else {
                alert('Order cancelled successfully.');
            }
        } catch (error) {
            alert(error.response?.data?.message || 'Failed to cancel order');
        } finally {
            setCancellingOrderId(null);
        }
    };

    const handleConfirmGoodsReceived = async (orderId) => {
        if (!window.confirm('Have you received this order? By confirming, you acknowledge receipt of goods and your credit will be charged.')) return;

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
            alert('Goods received confirmed! Vendor has been paid and your repayment is now due.');
        } catch (error) {
            alert(error.response?.data?.message || 'Failed to confirm goods received');
        }
    };

    const handleInitiatePayment = async () => {
        if (!repaymentAmount || parseFloat(repaymentAmount) <= 0) {
            alert('Please enter a valid amount');
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
            alert('Payment initialization failed. Please try again.');
            setIsPayLoading(false);
        }
    };

    const openRepaymentModal = (orderId = null, amount = null) => {
        setTargetOrderId(orderId);
        if (amount) {
            setRepaymentAmount(amount.toString());
        } else {
            setRepaymentAmount(profile.usedCredit.toString());
        }
        setShowRepaymentModal(true);
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

    // GATEKEEPER: Force Profile Completion (KYC)
    if (profile && !profile.isProfileComplete && profile.hasTakenTest) {
        return (
            <div className="kyc-gatekeeper">
                <div className="kyc-card">
                    <div className="kyc-icon">
                        <Lock size={48} />
                    </div>
                    <h1 className="kyc-title">Unlock Your Credit 🚀</h1>
                    <p className="kyc-text">
                        You've passed the initial assessment! <br/>
                        Now, verify your business identity to unlock your credit limit up to <strong>₦30,000</strong>.
                    </p>
                    <button 
                        onClick={() => navigate('/complete-profile')}
                        className="kyc-btn"
                    >
                        Complete Verification <ChevronRight size={20} />
                    </button>
                    <p className="kyc-note">Takes less than 2 minutes • Secure & Private</p>
                </div>
            </div>
        );
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
            <div className="dashboard-header">
                <div>
                     <h1 className="welcome-title">
                        Hello, {profile.name}
                     </h1>
                     <p className="welcome-subtitle">Your financial command center.</p>
                </div>
                <button className="marketplace-btn group" onClick={() => navigate('/marketplace')}>
                     <div className="btn-content">
                        <ShoppingBag size={20} />
                        <span>Access Marketplace</span>
                     </div>
                     <div className="btn-glow"></div>
                </button>
            </div>

            {/* HUD Status Cards */}
            <div className="hud-grid">
                
                {/* Amana Score HUD */}
                <div className="hud-card-wrapper gradient-teal">
                     <div className="hud-card">
                        <div className="card-top">
                             <div>
                                <h3 className="card-label">Amana Score</h3>
                                <p className="card-sub-teal">Trust Metric</p>
                             </div>
                             <div className="card-icon-teal">
                                <TrendingUp size={24} />
                             </div>
                        </div>
                        <div className="card-stat">
                             <span className="stat-value">{profile.amanaScore}</span>
                             <span className="stat-max">/ 100</span>
                        </div>
                        
                        {/* Tier & Markup Badge */}
                        <div className="tier-badge-container">
                            <span className={`tier-badge ${
                                profile.tier === 'Gold' ? 'gold' :
                                profile.tier === 'Silver' ? 'silver' : 'bronze'
                            }`}>
                                {profile.tier} Tier
                            </span>
                            <span className="fee-badge">
                                {profile.markupTier}% Fee
                            </span>
                        </div>
                        {/* Futuristic Progress Segment */}
                        <div className="progress-segments">
                             {[...Array(10)].map((_, i) => (
                                <div key={i} className={`segment ${i < profile.amanaScore / 10 ? 'bg-teal' : 'bg-gray'}`}></div>
                             ))}
                        </div>
                     </div>
                </div>

                 {/* Balance HUD */}
                 <div className="hud-card-wrapper gradient-purple">
                     <div className="hud-card">
                        <div className="card-top">
                             <div>
                                <h3 className="card-label">Credit Limit</h3>
                                <p className="card-sub-purple">Available to Spend</p>
                             </div>
                             <div className="card-icon-purple">
                                <CreditCard size={24} />
                             </div>
                        </div>
                        <div className="card-stat">
                             <span className="currency-symbol">₦</span>
                             <span className="stat-value">{(profile.creditLimit - profile.usedCredit).toLocaleString()}</span>
                        </div>
                        <p className="card-footer">Max Limit: ₦{profile.creditLimit.toLocaleString()}</p>
                     </div>
                </div>

                {/* Orders HUD */}
                <div className="hud-card-wrapper gradient-blue">
                     <div className="hud-card">
                        <div className="card-top">
                             <div>
                                <h3 className="card-label">Active Orders</h3>
                                <p className="card-sub-blue">Pending / In Progress</p>
                             </div>
                             <div className="card-icon-blue">
                                <Clock size={24} />
                             </div>
                        </div>
                         <div className="card-stat">
                             <span className="stat-value">{orders.filter(o => o.status !== 'cancelled' && o.status !== 'completed').length}</span>
                             <span className="stat-max">Active</span>
                        </div>
                        <p className="card-footer">
                            {orders.filter(o => o.status === 'pending_vendor').length} awaiting vendor
                        </p>
                     </div>
                </div>
            </div>

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
                <div className="due-card glass-panel">
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
                        const earliestOrder = orders
                            .filter(o => !o.isPaid && ['ready_for_pickup', 'goods_received', 'completed', 'defaulted'].includes(o.status) && o.dueDate)
                            .sort((a,b) => new Date(a.dueDate) - new Date(b.dueDate))[0];
                        
                        if (earliestOrder) {
                            const diff = Math.ceil((new Date(earliestOrder.dueDate) - new Date()) / (1000 * 60 * 60 * 24));
                            const statusText = diff > 0 ? `Due in ${diff} days` : `Overdue by ${Math.abs(diff)} days`;
                            const statusClass = diff > 0 ? 'ok' : 'overdue';

                            return (
                                <div className="next-payment-card">
                                    <div className="payment-row mb-1">
                                        <span className="payment-label">Next Payment</span>
                                        <span className={`payment-status ${statusClass}`}>{statusText}</span>
                                    </div>
                                    <div className="payment-row">
                                        <span className="payment-amount">₦{earliestOrder.totalRepaymentAmount.toLocaleString()}</span>
                                        <span className="payment-id">#{earliestOrder._id.slice(-6)}</span>
                                    </div>
                                </div>
                            );
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


            {/* Recent Activity / Orders */}
            <div className="orders-section">
                <h2 className="section-title">Transaction History</h2>
                
                <div className="orders-table-container glass-panel">
                    {orders.length === 0 ? (
                        <div className="empty-state">
                            <div className="empty-icon-box">
                                <ShoppingBag className="empty-icon" size={32} />
                            </div>
                            <h3 className="empty-title">No orders yet</h3>
                            <p className="empty-text">Start building your credit history by making your first purchase on the marketplace.</p>
                            <button onClick={() => navigate('/marketplace')} className="btn btn-outline">
                                Browse Products
                            </button>
                        </div>
                    ) : (
                        <div className="table-responsive">
                            <table className="orders-table">
                                <thead>
                                    <tr className="table-header-row">
                                        <th className="th-cell pl">Order ID</th>
                                        <th className="th-cell">Date</th>
                                        <th className="th-cell">Items</th>
                                        <th className="th-cell">Total</th>
                                        <th className="th-cell">Status</th>
                                        <th className="th-cell pr">Action</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {orders.map(order => (
                                        <tr key={order._id} className="table-row group">
                                            <td className="td-cell pl font-mono">#{order._id.substring(order._id.length - 6).toUpperCase()}</td>
                                            <td className="td-cell">{new Date(order.createdAt).toLocaleDateString()}</td>
                                            <td className="td-cell">
                                                <div className="item-avatars">
                                                    {order.orderItems.map((item, idx) => (
                                                        <div key={idx} className="item-avatar" title={item.name}>
                                                            {item.name?.[0] || '?'}
                                                        </div>
                                                    ))}
                                                </div>
                                            </td>
                                            <td className="td-cell font-bold">₦{(order.totalPrice || order.totalRepaymentAmount || 0).toLocaleString()}</td>
                                            <td className="td-cell">
                                                <span className={`status-badge ${order.status?.replace(/_/g, '-') || 'pending'}`}>
                                                    {order.status === 'delivered' || order.status === 'completed' ? <CheckCircle size={12} /> : <AlertCircle size={12} />}
                                                    {order.status?.replace(/_/g, ' ') || 'Pending'}
                                                </span>
                                            </td>
                                            <td className="td-cell pr">
                                                <button 
                                                    className="action-icon-btn"
                                                    onClick={() => viewOrderDetails(order._id)}
                                                >
                                                    <ChevronRight size={20} />
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
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

                            {/* Actions */}
                            {(selectedOrder.status === 'pending_vendor' || selectedOrder.status === 'ready_for_pickup') && (
                                <div className="order-actions-section">
                                    {selectedOrder.status === 'ready_for_pickup' && (
                                        <>
                                            <button 
                                                className="confirm-pickup-btn"
                                                onClick={() => handleConfirmGoodsReceived(selectedOrder._id)}
                                            >
                                                ✓ Confirm Goods Received
                                            </button>
                                            <p className="pickup-instructions">
                                                Show your pickup code to the vendor, collect your goods, then confirm receipt above.
                                            </p>
                                        </>
                                    )}
                                    <button 
                                        className="cancel-order-btn-large"
                                        onClick={() => handleCancelOrder(selectedOrder._id)}
                                        disabled={cancellingOrderId === selectedOrder._id}
                                    >
                                        {cancellingOrderId === selectedOrder._id ? 'Cancelling...' : 'Cancel Order'}
                                    </button>
                                </div>
                            )}

                            {selectedOrder.status === 'ready_for_pickup' && selectedOrder.pickupCode && (
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
                                    Repay Loan
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
                           
                           {orders.filter(o => !o.isPaid && ['ready_for_pickup', 'goods_received', 'completed', 'defaulted'].includes(o.status)).length === 0 ? (
                               <div className="repayment-empty-state">
                                   <div style={{ marginBottom: '1rem', color: '#10b981' }}>
                                       <ShieldCheck size={48} />
                                   </div>
                                   <h3 style={{ fontSize: '1.125rem', fontWeight: 'bold', color: 'white', marginBottom: '0.5rem' }}>All Caught Up!</h3>
                                   <p>You have no active loans. Your credit health is looking great.</p>
                               </div>
                           ) : (
                               <div>
                                   {orders
                                   .filter(o => !o.isPaid && ['ready_for_pickup', 'goods_received', 'completed', 'defaulted'].includes(o.status))
                                   .sort((a,b) => new Date(a.dueDate) - new Date(b.dueDate))
                                   .map(order => {
                                       const isSelected = targetOrderId === order._id;
                                       const isOverdue = !order.dueDate || new Date(order.dueDate) < new Date();
                                       
                                       return (
                                           <div 
                                               key={order._id}
                                               onClick={() => {
                                                   setTargetOrderId(order._id);
                                                   setRepaymentAmount(order.totalRepaymentAmount.toString());
                                               }}
                                               className={`repayment-card ${isSelected ? 'selected' : ''}`}
                                           >
                                               <div className="selection-bar" />

                                               <div className="card-content">
                                                   <div className="card-row-top">
                                                       <div>
                                                           <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                                               <span className="card-id-badge">
                                                                   #{order._id.slice(-6)}
                                                               </span>
                                                               {isOverdue && 
                                                                   <span style={{ fontSize: '0.65rem', color: '#ef4444', fontWeight: 'bold', textTransform: 'uppercase', display: 'flex', gap: '4px', alignItems: 'center', background: 'rgba(239,68,68,0.1)', padding: '2px 6px', borderRadius: '4px' }}>
                                                                       <AlertCircle size={10} /> Overdue
                                                                   </span>
                                                               }
                                                           </div>
                                                           <h4 className="card-item-title">
                                                               {order.orderItems[0].name}
                                                               {order.orderItems.length > 1 && <span style={{ color: '#9ca3af', fontWeight: 'normal' }}> +{order.orderItems.length - 1} others</span>}
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
                                                               {order.dueDate ? new Date(order.dueDate).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' }) : 'Immediate'}
                                                           </p>
                                                       </div>
                                                       <div style={{ textAlign: 'right' }}>
                                                            <p className="amount-label">+Limit Bonus</p>
                                                            <p className="amount-value">₦{order.totalRepaymentAmount.toLocaleString()}</p>
                                                       </div>
                                                   </div>
                                               </div>
                                           </div>
                                       );
                                   })}
                               </div>
                           )}
                        </div>

                        {/* Footer */}
                        <div className="repayment-footer">
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
                                disabled={isPayLoading || !targetOrderId}
                            >
                                {isPayLoading ? (
                                    <>
                                        <div className="animate-spin" style={{ height: '20px', width: '20px', border: '2px solid white', borderTopColor: 'transparent', borderRadius: '50%' }}></div>
                                        <span>Processing...</span>
                                    </>
                                ) : targetOrderId ? (
                                    <>
                                        <Lock size={18} />
                                        <span>Pay ₦{parseFloat(repaymentAmount || 0).toLocaleString()} Now</span>
                                    </>
                                ) : (
                                    'Select an Order above'
                                )}
                            </button>
                            
                            <div className="paystack-brand">
                                Powered by Paystack
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default RetailerDashboard;
