import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import { AlertCircle, Clock, CheckCircle, MessageCircle, AlertTriangle } from 'lucide-react';

const DebtManager = () => {
    const [debtors, setDebtors] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchDebtors = async () => {
            try {
                const { data } = await api.get('/admin/debtors');
                setDebtors(data);
            } catch (error) {
                console.error('Failed to load debtors', error);
            } finally {
                setLoading(false);
            }
        };
        fetchDebtors();
    }, []);

    const sendReminder = (user) => {
        // Mock sending reminder
        alert(`Reminder sent to ${user.name} via WhatsApp!`);
    };

    if (loading) return <div className="text-center p-xl text-muted">Analyzing debt aging...</div>;

    const criticalDebts = debtors.filter(d => d.isCritical);
    const safeDebts = debtors.filter(d => !d.isCritical);

    return (
        <div className="fade-in">
            <div className="page-header">
                <div>
                    <h1 className="page-title">Debt Manager</h1>
                    <p className="page-subtitle">Track and recover outstanding repayments</p>
                </div>
            </div>

            {/* Critical Alert Banner */}
            {criticalDebts.length > 0 && (
                <div style={{ background: 'rgba(239, 68, 68, 0.1)', border: '1px solid rgba(239, 68, 68, 0.2)', padding: '1.5rem', borderRadius: '12px', display: 'flex', gap: '1rem', marginBottom: '2rem' }}>
                    <div style={{ color: '#ef4444' }}>
                        <AlertTriangle size={32} />
                    </div>
                    <div>
                        <h3 style={{ fontSize: '1.2rem', fontWeight: 700, color: '#ef4444' }}>{criticalDebts.length} Critical Accounts</h3>
                        <p style={{ color: '#fca5a5' }}>These users have less than 3 days to repay. Immediate action recommended.</p>
                    </div>
                </div>
            )}

            {/* List */}
            <div className="glass-panel table-container">
                <table className="data-table">
                    <thead>
                        <tr>
                            <th>Type</th>
                            <th>Customer</th>
                            <th>Item/Detail</th>
                            <th>Debt Amount</th>
                            <th>Due Date</th>
                            <th>Health</th>
                            <th style={{ textAlign: 'right' }}>Recovery</th>
                        </tr>
                    </thead>
                    <tbody>
                        {debtors.length === 0 ? (
                            <tr>
                                <td colSpan="5" className="text-center p-xl">
                                    <div className="flex flex-col items-center text-success">
                                        <CheckCircle size={48} style={{ marginBottom: '1rem' }} />
                                        <p style={{ fontWeight: 600 }}>All Clear!</p>
                                        <p className="text-muted">No pending debts found.</p>
                                    </div>
                                </td>
                            </tr>
                        ) : (
                            debtors.map((item) => (
                                <tr key={item.orderId} style={item.isCritical ? { background: 'rgba(239, 68, 68, 0.05)' } : {}}>
                                    <td>
                                        <span className={`badge ${item.type === 'AAP' ? 'badge-primary' : 'badge-info'}`} style={{ fontSize: '0.7rem' }}>
                                            {item.type}
                                        </span>
                                    </td>
                                    <td>
                                        <div>
                                            <p style={{ fontWeight: 600 }}>{item.user?.name}</p>
                                            <p className="text-muted" style={{ fontSize: '0.8rem' }}>{item.user?.phone}</p>
                                        </div>
                                    </td>
                                    <td>
                                        <p className="text-muted" style={{ fontSize: '0.85rem' }}>
                                            {item.type === 'AAP' ? item.productName : `Order #${item.orderId.slice(-6).toUpperCase()}`}
                                        </p>
                                    </td>
                                    <td style={{ fontFamily: 'monospace', fontWeight: 600 }}>
                                        {new Intl.NumberFormat('en-NG', { style: 'currency', currency: 'NGN' }).format(item.amount)}
                                    </td>
                                    <td className="text-muted">
                                        {new Date(item.dueDate).toLocaleDateString()}
                                    </td>
                                    <td>
                                        <span className={`badge ${item.isCritical ? 'badge-danger' : item.daysRemaining < 7 ? 'badge-warning' : 'badge-success'}`}>
                                            <Clock size={12} />
                                            {item.daysRemaining} days left
                                        </span>
                                    </td>
                                    <td style={{ textAlign: 'right' }}>
                                        <button 
                                            onClick={() => sendReminder(item.user)}
                                            className="btn btn-outline"
                                            style={{ padding: '0.25rem 0.75rem', fontSize: '0.8rem' }}
                                        >
                                            <MessageCircle size={14} style={{ marginRight: '0.25rem' }} />
                                            Remind
                                        </button>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default DebtManager;
