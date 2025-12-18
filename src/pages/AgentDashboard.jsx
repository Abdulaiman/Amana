import React, { useEffect, useState } from 'react';
import api from '../services/api';
import { Package, MapPin, Phone, CreditCard, CheckCircle, Clock, AlertTriangle, ShieldCheck } from 'lucide-react';
import { useToast } from '../context/ToastContext';
import { useAuth } from '../context/AuthContext';
import './VendorDashboard.css'; // Reusing similar table styles

const AgentDashboard = () => {
    const { user } = useAuth();
    const [tasks, setTasks] = useState([]);
    const [loading, setLoading] = useState(true);
    const { addToast } = useToast();

    useEffect(() => {
        if (user) fetchTasks();
    }, [user]);

    const fetchTasks = async () => {
        try {
            const res = await api.get('/orders/myorders');
            // Filter orders where I am specifically the agent and status is relevant
            const agentTasks = res.data.filter(order => 
                order.agent && 
                order.agent._id === user._id && 
                !['cancelled', 'completed', 'goods_received'].includes(order.status)
            );
            setTasks(agentTasks);
        } catch (error) {
            addToast('Failed to load agent tasks', 'error');
        } finally {
            setLoading(false);
        }
    };

    const handleSettleVendor = async (orderId) => {
        try {
            await api.put(`/orders/${orderId}/settle-vendor`);
            addToast('Vendor settled! You now have possession of these goods for Amana.', 'success');
            fetchTasks();
        } catch (error) {
            addToast(error.response?.data?.message || 'Settlement failed', 'error');
        }
    };

    if (loading) return <div className="loading-spinner"></div>;

    return (
        <div className="vendor-dashboard-container animate-fade-in">
            <header className="vendor-header">
                <div>
                    <h1 className="vendor-title">Agent Portal</h1>
                    <p className="vendor-subtitle">Murabaha Fulfillment Tasks</p>
                </div>
                <div className="operational-badge">
                    <ShieldCheck size={16} /> Certified Agent
                </div>
            </header>

            <div className="onboarding-card highlight mb-8">
                <div className="onboarding-icon">🛡️</div>
                <div className="onboarding-content">
                    <h3>Your Role as an Agent</h3>
                    <p>You represent Amana in the Murabaha process. Your task is to visit the vendor, confirm the goods exist, and click "Settle Vendor". This pays the vendor and officially transfers ownership of the goods to Amana before they reach the buyer.</p>
                </div>
            </div>

            <div className="inventory-section">
                <h2 className="section-title">Assigned Pickups</h2>
                
                {tasks.length === 0 ? (
                    <div className="empty-state">
                        <Package size={48} />
                        <p>No active pickup tasks assigned to you right now.</p>
                    </div>
                ) : (
                <div className="compact-task-list">
                    {tasks.map((order) => (
                        <div key={order._id} className="premium-task-card glass-panel">
                            <div className="task-header">
                                <div className="task-id-group">
                                    <span className="task-label">ORDER ID</span>
                                    <span className="task-id">#{order._id.substring(order._id.length - 8).toUpperCase()}</span>
                                </div>
                                <div className={`task-status-badge ${order.status}`}>
                                    {order.status.replace(/_/g, ' ').toUpperCase()}
                                </div>
                            </div>

                            <div className="task-body-grid">
                                <div className="task-info-block">
                                    <h4 className="block-title"><Package size={14} /> Goods to Verify</h4>
                                    <div className="items-list-compact">
                                        {order.orderItems.map(item => (
                                            <div key={item._id} className="item-mini-row">
                                                <span className="item-qty">{item.qty}x</span>
                                                <span className="item-name">{item.name}</span>
                                            </div>
                                        ))}
                                    </div>
                                    <p className="total-val">Total Value: ₦{order.itemsPrice.toLocaleString()}</p>
                                </div>

                                <div className="task-info-block">
                                    <h4 className="block-title"><MapPin size={14} /> Vendor Location</h4>
                                    <p className="vendor-biz-name">{order.vendor?.businessName}</p>
                                    <p className="vendor-loc-text">{order.vendor?.address || 'Location pending'}</p>
                                    <a href={`tel:${order.vendor?.phones?.[0]}`} className="contact-link">
                                        <Phone size={12} /> {order.vendor?.phones?.[0]}
                                    </a>
                                </div>

                                <div className="task-info-block">
                                    <h4 className="block-title"><CheckCircle size={14} /> Buyer Information</h4>
                                    <p className="buyer-name-text">{order.retailer?.name}</p>
                                    <a href={`tel:${order.retailer?.phone}`} className="contact-link">
                                        <Phone size={12} /> {order.retailer?.phone}
                                    </a>
                                </div>
                            </div>

                            <div className="task-footer-actions">
                                {order.status === 'ready_for_pickup' && (
                                    <button 
                                        onClick={() => handleSettleVendor(order._id)}
                                        className="settle-btn-premium"
                                    >
                                        <CreditCard size={18} /> Settle Vendor & Pickup
                                    </button>
                                )}
                                {order.status === 'pending_vendor' && (
                                    <div className="waiting-pill">
                                        <Clock size={16} /> Waiting for vendor to prepare goods
                                    </div>
                                )}
                                {order.status === 'vendor_settled' && (
                                    <div className="waiting-pill success">
                                        <CheckCircle size={16} /> Vendor settled. Waiting for buyer receipt.
                                    </div>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
                )}
            </div>
        </div>
    );
};

export default AgentDashboard;
