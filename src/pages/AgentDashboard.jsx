import React, { useEffect, useState } from 'react';
import api from '../services/api';
import { Package, MapPin, ShieldCheck, User, PhoneOutgoing, Mail } from 'lucide-react';
import { useToast } from '../context/ToastContext';
import { useAuth } from '../context/AuthContext';
import './AgentDashboard.css';

const AgentDashboard = () => {
    const { user } = useAuth();
    const [tasks, setTasks] = useState([]);
    const [activeTab, setActiveTab] = useState('active'); // 'active' | 'history'
    const [loading, setLoading] = useState(true);
    const { addToast } = useToast();

    useEffect(() => {
        if (user) fetchTasks();
    }, [user]);

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

    const activeTasks = tasks.filter(t => !['cancelled', 'completed', 'goods_received', 'vendor_settled'].includes(t.status));
    const historyTasks = tasks.filter(t => ['vendor_settled', 'goods_received', 'completed'].includes(t.status));

    const handleSettleVendor = async (orderId) => {
        try {
            await api.put(`/orders/${orderId}/settle-vendor`);
            addToast('Vendor settled! You now have possession of these goods for Amana.', 'success');
            fetchTasks();
        } catch (error) {
            addToast(error.response?.data?.message || 'Settlement failed', 'error');
        }
    };

    if (loading) return (
        <div className="flex items-center justify-center min-h-screen">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[var(--color-primary)]"></div>
        </div>
    );

    const displayedTasks = activeTab === 'active' ? activeTasks : historyTasks;

    return (
        <div className="agent-dashboard-container animate-fade-in">
            <header className="agent-header">
                <div className="header-text-group">
                    <h1 className="agent-title">Agent Portal</h1>
                    <p className="agent-subtitle">Murabaha Fulfillment & Verification</p>
                </div>
                <div className="agent-badge">
                    <ShieldCheck size={20} /> <span style={{letterSpacing: '0.02em'}}>Verified Amana Agent</span>
                </div>
            </header>

            <section className="agent-role-card animate-slide-up">
                <div className="role-icon-box">🛡️</div>
                <div className="role-text">
                    <h3>Murabaha Facilitator Role</h3>
                    <p>You represent Amana in the purchase process. Securely visit the vendor, verify the presence and quality of goods, and settle payment. Once settled, you officially take possession of the goods on behalf of Amana before delivery to the buyer.</p>
                </div>
            </section>

            <section className="tasks-section">
                <div className="tasks-header-row">
                    <div className="flex items-center gap-4">
                        <div style={{ width: '6px', height: '32px', background: 'var(--color-primary)', borderRadius: '3px', boxShadow: '0 0 15px var(--color-primary)' }}></div>
                        <h2 style={{ fontSize: '1.85rem', fontWeight: 900, letterSpacing: '-0.03em' }}>
                            {activeTab === 'active' ? 'Active Assignments' : 'Task History'}
                        </h2>
                    </div>

                    <div className="tab-pill-container">
                        <button 
                            onClick={() => setActiveTab('active')}
                            className={`tab-pill ${activeTab === 'active' ? 'active' : ''}`}
                        >
                            Active <span className="tab-count">{activeTasks.length}</span>
                        </button>
                        <button 
                            onClick={() => setActiveTab('history')}
                            className={`tab-pill ${activeTab === 'history' ? 'active' : ''}`}
                        >
                            History <span className="tab-count">{historyTasks.length}</span>
                        </button>
                    </div>
                </div>
                
                {displayedTasks.length === 0 ? (
                    <div className="empty-tasks animate-fade-in" style={{ padding: '6rem 0' }}>
                        <div className="empty-icon-box" style={{ width: '120px', height: '120px', marginBottom: '2rem' }}>
                            <Package size={50} color="var(--color-text-muted)" />
                        </div>
                        <h2 style={{ fontSize: '2rem', fontWeight: 900, marginBottom: '0.5rem' }}>
                            {activeTab === 'active' ? 'No Assignments' : 'No History'}
                        </h2>
                        <p style={{ color: 'var(--color-text-muted)', fontSize: '1.1rem' }}>
                            {activeTab === 'active' ? 'Relax! There are no pickup assignments directed to you at this moment.' : 'You haven\'t completed any tasks yet.'}
                        </p>
                    </div>
                ) : (
                    <div className="tasks-grid">
                        {displayedTasks.map((order) => (
                            <div key={order._id} className="agent-task-card animate-scale-up">
                                <div className="task-card-header">
                                    <div className="task-id-tag">
                                        <span className="tag-label">TRANSACTION REF</span>
                                        <span className="tag-value">#AMN-{order._id.substring(order._id.length - 8).toUpperCase()}</span>
                                    </div>
                                    <div className={`status-pill ${order.status}`}>
                                        {order.status.replace(/_/g, ' ')}
                                    </div>
                                </div>

                                <div className="task-card-body">
                                    <div className="info-block-premium">
                                        <div className="block-header">
                                            <Package size={14} /> ORDER CONSIGNMENT
                                        </div>
                                        <div className="block-content">
                                            {order.orderItems.map((oi, idx) => (
                                                <div key={idx} className="mini-item-row">
                                                    <span className="item-name-text">{oi.name}</span>
                                                    <span className="item-qty-pill">{oi.qty}x</span>
                                                </div>
                                            ))}
                                            <div className="price-summary">
                                                <span className="price-label">Net Murabaha Value</span>
                                                <span className="price-value">₦{order.itemsPrice.toLocaleString()}</span>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="info-block-premium">
                                        <div className="block-header">
                                            <MapPin size={14} /> SETTLEMENT POINT
                                        </div>
                                        <div className="block-content">
                                            <div className="entity-name">{order.vendor?.businessName}</div>
                                            <div className="entity-detail">{order.vendor?.address || 'Verification required on site'}</div>
                                            <a href={`tel:${order.vendor?.phones?.[0]}`} className="contact-btn-premium">
                                                <PhoneOutgoing size={14} /> Contact Vendor
                                            </a>
                                        </div>
                                    </div>

                                    <div className="info-block-premium">
                                        <div className="block-header">
                                            <User size={14} /> TARGET RETAILER
                                        </div>
                                        <div className="block-content">
                                            <div className="entity-name">{order.retailer?.name}</div>
                                            <div className="entity-detail">Verified Buyer (Murabaha Recipient)</div>
                                            <a href={`mailto:${order.retailer?.email}`} className="contact-btn-premium">
                                                <Mail size={14} /> Message Buyer
                                            </a>
                                        </div>
                                    </div>
                                </div>

                                <div className="task-card-footer">
                                    {order.status === 'ready_for_pickup' ? (
                                        <button 
                                            className="settle-action-btn"
                                            onClick={() => handleSettleVendor(order._id)}
                                        >
                                            <ShieldCheck size={22} /> Authorize Vendor Settlement
                                        </button>
                                    ) : order.status === 'pending_vendor' ? (
                                        <div className="instruction-pill">
                                            Awaiting Vendor Confirmation
                                        </div>
                                    ) : (
                                        <div className="instruction-pill success">
                                            <ShieldCheck size={18} /> Transaction Verified & Settled
                                        </div>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </section>
        </div>
    );
};

export default AgentDashboard;
