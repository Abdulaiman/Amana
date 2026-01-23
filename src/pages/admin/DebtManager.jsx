import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import { AlertCircle, Clock, CheckCircle, MessageCircle, AlertTriangle, Banknote, X, Loader } from 'lucide-react';

const DebtManager = () => {
    const [debtors, setDebtors] = useState([]);
    const [loading, setLoading] = useState(true);
    const [confirmModal, setConfirmModal] = useState({ open: false, item: null });
    const [reason, setReason] = useState('');
    const [confirming, setConfirming] = useState(false);
    const [successMessage, setSuccessMessage] = useState('');

    const fetchDebtors = async () => {
        try {
            setLoading(true);
            const { data } = await api.get('/admin/debtors');
            setDebtors(data);
        } catch (error) {
            console.error('Failed to load debtors', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchDebtors();
    }, []);

    const sendReminder = (user) => {
        alert(`Reminder sent to ${user.name} via WhatsApp!`);
    };

    const openConfirmModal = (item) => {
        setConfirmModal({ open: true, item });
        setReason('');
        setSuccessMessage('');
    };

    const closeConfirmModal = () => {
        setConfirmModal({ open: false, item: null });
        setReason('');
    };

    const handleConfirmPayment = async () => {
        if (reason.length < 10) {
            alert('Please enter a reason with at least 10 characters for the audit trail.');
            return;
        }

        const { item } = confirmModal;
        setConfirming(true);

        try {
            const payload = {
                orderId: item.orderId,
                orderType: item.type === 'AAP' ? 'aap' : 'order',
                amount: item.amount,
                reason: reason
            };

            const { data } = await api.post('/admin/confirm-payment', payload);
            
            setSuccessMessage(data.message);
            
            // Refresh list after short delay
            setTimeout(() => {
                closeConfirmModal();
                fetchDebtors();
            }, 1500);

        } catch (error) {
            alert(error.response?.data?.message || 'Failed to confirm payment');
        } finally {
            setConfirming(false);
        }
    };

    if (loading) return <div className="text-center p-xl text-muted">Analyzing debt aging...</div>;

    const criticalDebts = debtors.filter(d => d.isCritical);

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
                            <th style={{ textAlign: 'right' }}>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {debtors.length === 0 ? (
                            <tr>
                                <td colSpan="7" className="text-center p-xl">
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
                                        <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end' }}>
                                            <button 
                                                onClick={() => sendReminder(item.user)}
                                                className="btn btn-outline"
                                                style={{ padding: '0.25rem 0.75rem', fontSize: '0.8rem' }}
                                            >
                                                <MessageCircle size={14} style={{ marginRight: '0.25rem' }} />
                                                Remind
                                            </button>
                                            <button 
                                                onClick={() => openConfirmModal(item)}
                                                className="btn btn-primary"
                                                style={{ padding: '0.25rem 0.75rem', fontSize: '0.8rem' }}
                                            >
                                                <Banknote size={14} style={{ marginRight: '0.25rem' }} />
                                                Cash Paid
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>

            {/* Confirm Cash Payment Modal */}
            {confirmModal.open && (
                <div className="modal-overlay" style={{
                    position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
                    background: 'rgba(0,0,0,0.8)', display: 'flex', alignItems: 'center',
                    justifyContent: 'center', zIndex: 1000, backdropFilter: 'blur(4px)'
                }}>
                    <div className="modal-content glass-panel" style={{
                        maxWidth: '480px', width: '90%', padding: '2rem', borderRadius: '16px',
                        border: '1px solid rgba(16, 185, 129, 0.2)'
                    }}>
                        {successMessage ? (
                            <div style={{ textAlign: 'center', padding: '2rem 0' }}>
                                <CheckCircle size={64} style={{ color: '#10b981', marginBottom: '1rem' }} />
                                <h3 style={{ color: '#10b981', marginBottom: '0.5rem' }}>Payment Confirmed!</h3>
                                <p className="text-muted">{successMessage}</p>
                            </div>
                        ) : (
                            <>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                                    <h2 style={{ fontSize: '1.3rem', fontWeight: 700 }}>
                                        <Banknote size={24} style={{ marginRight: '0.5rem', color: '#10b981', verticalAlign: 'middle' }} />
                                        Confirm Cash Payment
                                    </h2>
                                    <button onClick={closeConfirmModal} style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: '#888' }}>
                                        <X size={24} />
                                    </button>
                                </div>

                                <div style={{ background: 'rgba(255,255,255,0.03)', padding: '1rem', borderRadius: '8px', marginBottom: '1.5rem' }}>
                                    <p style={{ marginBottom: '0.5rem' }}><strong>Customer:</strong> {confirmModal.item?.user?.name}</p>
                                    <p style={{ marginBottom: '0.5rem' }}><strong>Phone:</strong> {confirmModal.item?.user?.phone}</p>
                                    <p style={{ marginBottom: '0.5rem' }}><strong>Type:</strong> {confirmModal.item?.type}</p>
                                    <p style={{ fontSize: '1.3rem', fontWeight: 700, color: '#10b981' }}>
                                        Amount: {new Intl.NumberFormat('en-NG', { style: 'currency', currency: 'NGN' }).format(confirmModal.item?.amount)}
                                    </p>
                                </div>

                                <div style={{ marginBottom: '1.5rem' }}>
                                    <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600 }}>
                                        Reason / Notes <span style={{ color: '#ef4444' }}>*</span>
                                    </label>
                                    <textarea
                                        value={reason}
                                        onChange={(e) => setReason(e.target.value)}
                                        placeholder="e.g., Cash received at office on 23rd January 2026. Handed to Admin by retailer in person."
                                        style={{
                                            width: '100%', minHeight: '100px', padding: '0.75rem',
                                            borderRadius: '8px', border: '1px solid rgba(255,255,255,0.1)',
                                            background: 'rgba(0,0,0,0.3)', color: '#fff', resize: 'vertical'
                                        }}
                                    />
                                    <p style={{ fontSize: '0.75rem', color: '#888', marginTop: '0.25rem' }}>
                                        Minimum 10 characters. This will be logged for audit purposes.
                                    </p>
                                </div>

                                <div style={{ background: 'rgba(239, 68, 68, 0.1)', border: '1px solid rgba(239, 68, 68, 0.2)', padding: '1rem', borderRadius: '8px', marginBottom: '1.5rem' }}>
                                    <p style={{ color: '#fca5a5', fontSize: '0.85rem' }}>
                                        <AlertTriangle size={16} style={{ marginRight: '0.5rem', verticalAlign: 'middle' }} />
                                        <strong>Warning:</strong> This action bypasses Paystack verification. Ensure you have physically received the cash before confirming. This action is logged and cannot be undone.
                                    </p>
                                </div>

                                <div style={{ display: 'flex', gap: '1rem' }}>
                                    <button 
                                        onClick={closeConfirmModal}
                                        className="btn btn-outline"
                                        style={{ flex: 1 }}
                                        disabled={confirming}
                                    >
                                        Cancel
                                    </button>
                                    <button 
                                        onClick={handleConfirmPayment}
                                        className="btn btn-primary"
                                        style={{ flex: 1 }}
                                        disabled={confirming || reason.length < 10}
                                    >
                                        {confirming ? (
                                            <>
                                                <Loader size={16} className="spin" style={{ marginRight: '0.5rem' }} />
                                                Processing...
                                            </>
                                        ) : (
                                            <>
                                                <CheckCircle size={16} style={{ marginRight: '0.5rem' }} />
                                                Confirm Payment
                                            </>
                                        )}
                                    </button>
                                </div>
                            </>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};

export default DebtManager;

