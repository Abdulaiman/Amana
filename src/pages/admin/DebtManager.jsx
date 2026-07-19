import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import { AlertCircle, Clock, CheckCircle, MessageCircle, AlertTriangle, Banknote, X, Loader, CreditCard } from 'lucide-react';

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
        <div className="fade-in" style={{ maxWidth: '1200px', margin: '0 auto' }}>
            <div className="page-hero" style={{ marginBottom: '1.5rem' }}>
                <div className="page-hero-icon">
                    <CreditCard size={24} />
                </div>
                <div className="page-hero-body">
                    <h1 className="page-hero-title">Debt Manager</h1>
                    <p className="page-hero-subtitle">Track and recover outstanding repayments</p>
                </div>
                <div className="page-hero-actions">
                    <span style={{ 
                        background: 'rgba(16, 185, 129, 0.1)', 
                        padding: '0.4rem 0.75rem', 
                        borderRadius: '20px',
                        color: 'var(--color-brand)',
                        fontSize: '0.85rem'
                    }}>
                        {debtors.length} Active
                    </span>
                    {criticalDebts.length > 0 && (
                        <span style={{ 
                            background: 'rgba(239, 68, 68, 0.1)', 
                            padding: '0.4rem 0.75rem', 
                            borderRadius: '20px',
                            color: '#ef4444',
                            fontSize: '0.85rem'
                        }}>
                            {criticalDebts.length} Critical
                        </span>
                    )}
                </div>
            </div>

            {/* Critical Alert Banner */}
            {criticalDebts.length > 0 && (
                <div style={{ 
                    background: 'rgba(239, 68, 68, 0.08)', 
                    border: '1px solid rgba(239, 68, 68, 0.15)', 
                    padding: '1rem 1.25rem', 
                    borderRadius: '12px', 
                    display: 'flex', 
                    alignItems: 'center',
                    gap: '0.75rem', 
                    marginBottom: '1.5rem' 
                }}>
                    <AlertTriangle size={20} style={{ color: '#ef4444', flexShrink: 0 }} />
                    <div>
                        <span style={{ fontWeight: 600, color: '#ef4444' }}>{criticalDebts.length} accounts</span>
                        <span style={{ color: '#fca5a5' }}> have less than 3 days to repay</span>
                    </div>
                </div>
            )}

            {/* Debt Cards */}
            {debtors.length === 0 ? (
                <div className="card" style={{ textAlign: 'center', padding: '3rem' }}>
                    <CheckCircle size={48} style={{ marginBottom: '1rem', color: 'var(--color-brand)' }} />
                    <p style={{ fontWeight: 600, marginBottom: '0.25rem' }}>All Clear!</p>
                    <p className="text-muted">No pending debts found.</p>
                </div>
            ) : (
                <div style={{ display: 'grid', gap: '0.75rem' }}>
                    {debtors.map((item) => (
                        <div 
                            key={item.orderId} 
                            className="card"
                            style={{ 
                                padding: '1rem 1.25rem',
                                borderRadius: '12px',
                                border: item.isCritical ? '1px solid rgba(239, 68, 68, 0.2)' : '1px solid rgba(255,255,255,0.05)',
                                background: item.isCritical ? 'rgba(239, 68, 68, 0.03)' : undefined
                            }}
                        >
                            <div className="debt-card-grid">
                                {/* Left: Info */}
                                <div style={{ display: 'flex', gap: '1rem', alignItems: 'center', minWidth: 0 }}>
                                    {/* Type Badge */}
                                    <div style={{ 
                                        width: '48px', 
                                        height: '48px', 
                                        borderRadius: '12px',
                                        background: item.type === 'AAP' ? 'rgba(16, 185, 129, 0.1)' : 'rgba(59, 130, 246, 0.1)',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        flexShrink: 0
                                    }}>
                                        <span style={{ 
                                            fontSize: '0.7rem', 
                                            fontWeight: 700, 
                                            color: item.type === 'AAP' ? 'var(--color-brand)' : '#3b82f6' 
                                        }}>
                                            {item.type}
                                        </span>
                                    </div>

                                    {/* Customer Details */}
                                    <div style={{ minWidth: 0, flex: 1 }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
                                            <span style={{ fontWeight: 600, fontSize: '0.95rem' }}>{item.user?.name}</span>
                                            <span className={`badge ${item.isCritical ? 'badge-danger' : item.daysRemaining < 7 ? 'badge-warning' : 'badge-success'}`} 
                                                  style={{ fontSize: '0.65rem', padding: '0.15rem 0.5rem' }}>
                                                <Clock size={10} style={{ marginRight: '3px' }} />
                                                {item.daysRemaining}d
                                            </span>
                                        </div>
                                        <div style={{ fontSize: '0.8rem', color: '#888', marginTop: '0.25rem' }}>
                                            {item.user?.phone} • {item.type === 'AAP' ? item.productName : `#${item.orderId.slice(-6).toUpperCase()}`}
                                        </div>
                                        <div style={{ 
                                            fontSize: '0.75rem', 
                                            color: '#666', 
                                            marginTop: '0.25rem' 
                                        }}>
                                            Due: {new Date(item.dueDate).toLocaleDateString('en-NG', { day: 'numeric', month: 'short' })}
                                        </div>
                                    </div>
                                </div>

                                {/* Right: Amount & Actions */}
                                <div style={{ 
                                    display: 'flex', 
                                    alignItems: 'center', 
                                    gap: '1rem',
                                    flexShrink: 0
                                }}>
                                    <div style={{ textAlign: 'right' }}>
                                        <div style={{ 
                                            fontFamily: 'monospace', 
                                            fontWeight: 700, 
                                            fontSize: '1.1rem',
                                            color: item.isCritical ? '#ef4444' : '#fff'
                                        }}>
                                            ₦{item.amount.toLocaleString()}
                                        </div>
                                    </div>
                                    
                                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                                        <button 
                                            onClick={() => sendReminder(item.user)}
                                            className="btn btn-outline"
                                            style={{ 
                                                padding: '0.5rem', 
                                                fontSize: '0.75rem',
                                                borderRadius: '8px',
                                                minWidth: 'unset'
                                            }}
                                            title="Send Reminder"
                                        >
                                            <MessageCircle size={16} />
                                        </button>
                                        <button 
                                            onClick={() => openConfirmModal(item)}
                                            className="btn btn-primary"
                                            style={{ 
                                                padding: '0.5rem 0.75rem', 
                                                fontSize: '0.75rem',
                                                borderRadius: '8px',
                                                display: 'flex',
                                                alignItems: 'center',
                                                gap: '0.35rem'
                                            }}
                                        >
                                            <Banknote size={14} />
                                            <span>Paid</span>
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Confirm Cash Payment Modal */}
            {confirmModal.open && (
                <div 
                    className="modal-overlay" 
                    onClick={(e) => e.target === e.currentTarget && closeConfirmModal()}
                    style={{
                        position: 'fixed',
                        top: 0,
                        left: 0,
                        right: 0,
                        bottom: 0,
                        background: 'rgba(0,0,0,0.75)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        zIndex: 9999,
                        backdropFilter: 'blur(8px)',
                        padding: '1rem',
                        overflow: 'auto'
                    }}
                >
                    <div 
                        className="card" 
                        style={{
                            width: '100%',
                            maxWidth: '420px',
                            maxHeight: '90vh',
                            overflow: 'auto',
                            padding: '1.5rem',
                            borderRadius: '16px',
                            border: '1px solid rgba(16, 185, 129, 0.3)',
                            background: 'linear-gradient(145deg, rgba(17, 17, 17, 0.98), rgba(10, 10, 10, 0.98))',
                            boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5), 0 0 40px rgba(16, 185, 129, 0.1)'
                        }}
                    >
                        {successMessage ? (
                            <div style={{ textAlign: 'center', padding: '1.5rem 0' }}>
                                <div style={{
                                    width: '64px',
                                    height: '64px',
                                    borderRadius: '50%',
                                    background: 'rgba(16, 185, 129, 0.15)',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    margin: '0 auto 1rem'
                                }}>
                                    <CheckCircle size={32} style={{ color: 'var(--color-brand)' }} />
                                </div>
                                <h3 style={{ color: 'var(--color-brand)', marginBottom: '0.5rem', fontSize: '1.25rem' }}>Payment Confirmed!</h3>
                                <p className="text-muted" style={{ fontSize: '0.9rem' }}>{successMessage}</p>
                            </div>
                        ) : (
                            <>
                                {/* Header */}
                                <div style={{ 
                                    display: 'flex', 
                                    justifyContent: 'space-between', 
                                    alignItems: 'center', 
                                    marginBottom: '1.25rem',
                                    paddingBottom: '1rem',
                                    borderBottom: '1px solid rgba(255,255,255,0.08)'
                                }}>
                                    <h2 style={{ fontSize: '1.1rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.5rem', margin: 0 }}>
                                        <Banknote size={20} style={{ color: 'var(--color-brand)' }} />
                                        Confirm Cash Payment
                                    </h2>
                                    <button 
                                        onClick={closeConfirmModal} 
                                        style={{ 
                                            background: 'rgba(255,255,255,0.05)', 
                                            border: 'none', 
                                            cursor: 'pointer', 
                                            color: '#888',
                                            borderRadius: '8px',
                                            padding: '0.4rem',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            transition: 'all 0.2s'
                                        }}
                                        onMouseOver={(e) => e.target.style.background = 'rgba(255,255,255,0.1)'}
                                        onMouseOut={(e) => e.target.style.background = 'rgba(255,255,255,0.05)'}
                                    >
                                        <X size={18} />
                                    </button>
                                </div>

                                {/* Customer Info Card */}
                                <div style={{ 
                                    background: 'rgba(16, 185, 129, 0.05)', 
                                    padding: '1rem', 
                                    borderRadius: '12px', 
                                    marginBottom: '1.25rem',
                                    border: '1px solid rgba(16, 185, 129, 0.1)'
                                }}>
                                    <div style={{ display: 'grid', gap: '0.5rem', fontSize: '0.9rem' }}>
                                        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                            <span style={{ color: '#888' }}>Customer</span>
                                            <span style={{ fontWeight: 600 }}>{confirmModal.item?.user?.name}</span>
                                        </div>
                                        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                            <span style={{ color: '#888' }}>Phone</span>
                                            <span>{confirmModal.item?.user?.phone}</span>
                                        </div>
                                        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                            <span style={{ color: '#888' }}>Type</span>
                                            <span className={`badge ${confirmModal.item?.type === 'AAP' ? 'badge-primary' : 'badge-info'}`} style={{ fontSize: '0.7rem' }}>
                                                {confirmModal.item?.type}
                                            </span>
                                        </div>
                                        <div style={{ 
                                            display: 'flex', 
                                            justifyContent: 'space-between', 
                                            alignItems: 'center',
                                            marginTop: '0.5rem',
                                            paddingTop: '0.75rem',
                                            borderTop: '1px solid rgba(255,255,255,0.05)'
                                        }}>
                                            <span style={{ color: '#888' }}>Amount</span>
                                            <span style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--color-brand)' }}>
                                                {new Intl.NumberFormat('en-NG', { style: 'currency', currency: 'NGN' }).format(confirmModal.item?.amount)}
                                            </span>
                                        </div>
                                    </div>
                                </div>

                                {/* Reason Input */}
                                <div style={{ marginBottom: '1.25rem' }}>
                                    <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600, fontSize: '0.9rem' }}>
                                        Reason / Notes <span style={{ color: '#ef4444' }}>*</span>
                                    </label>
                                    <textarea
                                        value={reason}
                                        onChange={(e) => setReason(e.target.value)}
                                        placeholder="e.g., Cash received at office on 23rd Jan. Handed by retailer in person."
                                        style={{
                                            width: '100%',
                                            minHeight: '80px',
                                            padding: '0.75rem',
                                            borderRadius: '10px',
                                            border: '1px solid rgba(255,255,255,0.1)',
                                            background: 'rgba(0,0,0,0.4)',
                                            color: '#fff',
                                            resize: 'vertical',
                                            fontSize: '0.9rem',
                                            fontFamily: 'inherit',
                                            boxSizing: 'border-box'
                                        }}
                                    />
                                    <p style={{ fontSize: '0.75rem', color: '#666', marginTop: '0.35rem' }}>
                                        Min 10 characters. Logged for audit purposes.
                                    </p>
                                </div>

                                {/* Warning */}
                                <div style={{ 
                                    background: 'rgba(239, 68, 68, 0.08)', 
                                    border: '1px solid rgba(239, 68, 68, 0.15)', 
                                    padding: '0.85rem', 
                                    borderRadius: '10px', 
                                    marginBottom: '1.25rem'
                                }}>
                                    <p style={{ color: '#f87171', fontSize: '0.8rem', margin: 0, display: 'flex', alignItems: 'flex-start', gap: '0.5rem' }}>
                                        <AlertTriangle size={16} style={{ flexShrink: 0, marginTop: '2px' }} />
                                        <span>This bypasses Paystack. Ensure cash is physically received. Action is logged and cannot be undone.</span>
                                    </p>
                                </div>

                                {/* Action Buttons */}
                                <div style={{ display: 'flex', gap: '0.75rem' }}>
                                    <button 
                                        onClick={closeConfirmModal}
                                        className="btn btn-outline"
                                        style={{ flex: 1, padding: '0.75rem' }}
                                        disabled={confirming}
                                    >
                                        Cancel
                                    </button>
                                    <button 
                                        onClick={handleConfirmPayment}
                                        className="btn btn-primary"
                                        style={{ flex: 1, padding: '0.75rem' }}
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
                                                Confirm
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

