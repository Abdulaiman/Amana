import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import { AlertCircle, Clock, CheckCircle, MessageCircle, AlertTriangle, Banknote, X, Loader, CreditCard, History, ChevronDown, ChevronUp } from 'lucide-react';

const DebtManager = () => {
    const [debtors, setDebtors] = useState([]);
    const [loading, setLoading] = useState(true);
    const [confirmModal, setConfirmModal] = useState({ open: false, item: null });
    const [paymentType, setPaymentType] = useState('full'); // 'full' | 'partial'
    const [customAmount, setCustomAmount] = useState('');
    const [channel, setChannel] = useState('cash'); // 'cash' | 'bank_transfer' | 'pos'
    const [showHistory, setShowHistory] = useState(false);
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
        setPaymentType('full');
        setCustomAmount(item.amount ? item.amount.toString() : '');
        setChannel('cash');
        setReason(`Manual payment confirmed for ${item.user?.name || 'trader'}`);
        setShowHistory(false);
        setSuccessMessage('');
    };

    const closeConfirmModal = () => {
        setConfirmModal({ open: false, item: null });
        setReason('');
        setShowHistory(false);
    };

    const handleConfirmPayment = async () => {
        const { item } = confirmModal;
        const currentRemaining = item.amount || 0;
        const paymentAmount = paymentType === 'full' ? currentRemaining : parseFloat(customAmount);

        if (isNaN(paymentAmount) || paymentAmount <= 0) {
            alert('Please enter a valid payment amount greater than ₦0.');
            return;
        }

        if (paymentAmount > currentRemaining + 0.5) {
            alert(`Payment amount (₦${paymentAmount.toLocaleString()}) cannot exceed remaining balance of ₦${currentRemaining.toLocaleString()}.`);
            return;
        }

        const effectiveReason = reason && reason.trim().length >= 10 
            ? reason.trim() 
            : `Manual payment confirmed for ${item.user?.name || 'trader'}`;

        setConfirming(true);

        try {
            const payload = {
                orderId: item.orderId,
                orderType: item.type === 'AAP' ? 'aap' : 'order',
                amount: Math.min(paymentAmount, currentRemaining),
                channel: channel,
                reason: effectiveReason
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
                                            {item.amountPaid > 0 && (
                                                <span style={{
                                                    fontSize: '0.65rem',
                                                    padding: '0.15rem 0.5rem',
                                                    borderRadius: '20px',
                                                    background: 'rgba(59, 130, 246, 0.15)',
                                                    color: '#60a5fa',
                                                    fontWeight: 600
                                                }}>
                                                    Partially Paid
                                                </span>
                                            )}
                                        </div>
                                        <div style={{ fontSize: '0.8rem', color: '#888', marginTop: '0.25rem' }}>
                                            {item.user?.phone} • {item.type === 'AAP' ? item.productName : `#${item.orderId.slice(-6).toUpperCase()}`}
                                        </div>
                                        {item.amountPaid > 0 && (
                                            <div style={{ fontSize: '0.75rem', color: '#10b981', marginTop: '0.25rem' }}>
                                                ₦{item.amountPaid.toLocaleString()} paid of ₦{item.totalDebt?.toLocaleString() || item.amount.toLocaleString()}
                                            </div>
                                        )}
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
                                        <div style={{ fontSize: '0.7rem', color: '#888', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                                            Remaining
                                        </div>
                                        <div style={{ 
                                            fontFamily: 'monospace', 
                                            fontWeight: 700, 
                                            fontSize: '1.1rem',
                                            color: item.isCritical ? '#ef4444' : '#fff'
                                        }}>
                                            ₦{item.amount.toLocaleString()}
                                        </div>
                                        {item.amountPaid > 0 && item.totalDebt && (
                                            <div style={{ width: '80px', height: '4px', background: 'rgba(255,255,255,0.1)', borderRadius: '2px', marginTop: '4px', overflow: 'hidden', marginLeft: 'auto' }}>
                                                <div style={{ 
                                                    width: `${Math.min(100, Math.round((item.amountPaid / item.totalDebt) * 100))}%`, 
                                                    height: '100%', 
                                                    background: 'var(--color-brand)' 
                                                }} />
                                            </div>
                                        )}
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
                                        Debt Settlement
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
                                    border: '1px solid rgba(16, 185, 129, 0.15)'
                                }}>
                                    <div style={{ display: 'grid', gap: '0.5rem', fontSize: '0.9rem' }}>
                                        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                            <span style={{ color: '#888' }}>Trader</span>
                                            <span style={{ fontWeight: 600 }}>{confirmModal.item?.user?.name}</span>
                                        </div>
                                        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                            <span style={{ color: '#888' }}>Phone</span>
                                            <span>{confirmModal.item?.user?.phone}</span>
                                        </div>
                                        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                            <span style={{ color: '#888' }}>Facility / Item</span>
                                            <span style={{ color: '#ccc' }}>
                                                {confirmModal.item?.type === 'AAP' ? confirmModal.item?.productName : `#${confirmModal.item?.orderId.slice(-6).toUpperCase()}`}
                                            </span>
                                        </div>
                                        {confirmModal.item?.totalDebt && confirmModal.item?.amountPaid > 0 && (
                                            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                                <span style={{ color: '#888' }}>Original Facility</span>
                                                <span>₦{confirmModal.item?.totalDebt?.toLocaleString()}</span>
                                            </div>
                                        )}
                                        {confirmModal.item?.amountPaid > 0 && (
                                            <div style={{ display: 'flex', justifyContent: 'space-between', color: '#10b981' }}>
                                                <span>Already Paid</span>
                                                <span>₦{confirmModal.item?.amountPaid?.toLocaleString()}</span>
                                            </div>
                                        )}
                                        <div style={{ 
                                            display: 'flex', 
                                            justifyContent: 'space-between', 
                                            alignItems: 'center',
                                            marginTop: '0.5rem',
                                            paddingTop: '0.75rem',
                                            borderTop: '1px solid rgba(255,255,255,0.05)'
                                        }}>
                                            <span style={{ color: '#888', fontWeight: 600 }}>Current Balance Due</span>
                                            <span style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--color-brand)' }}>
                                                ₦{confirmModal.item?.amount?.toLocaleString()}
                                            </span>
                                        </div>
                                    </div>
                                </div>

                                {/* Settlement Type Selector */}
                                <div style={{ marginBottom: '1.25rem' }}>
                                    <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600, fontSize: '0.85rem', color: '#aaa' }}>
                                        Settlement Type
                                    </label>
                                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem' }}>
                                        <button
                                            type="button"
                                            onClick={() => {
                                                setPaymentType('full');
                                                setCustomAmount(confirmModal.item?.amount?.toString() || '');
                                            }}
                                            style={{
                                                padding: '0.6rem 0.75rem',
                                                borderRadius: '8px',
                                                border: paymentType === 'full' ? '1px solid var(--color-brand)' : '1px solid rgba(255,255,255,0.1)',
                                                background: paymentType === 'full' ? 'rgba(16, 185, 129, 0.15)' : 'rgba(255,255,255,0.03)',
                                                color: paymentType === 'full' ? 'var(--color-brand)' : '#888',
                                                fontWeight: 600,
                                                fontSize: '0.85rem',
                                                cursor: 'pointer',
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                                gap: '0.35rem'
                                            }}
                                        >
                                            <CheckCircle size={14} />
                                            Full Settlement
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => {
                                                setPaymentType('partial');
                                                if (customAmount === confirmModal.item?.amount?.toString()) {
                                                    setCustomAmount(Math.round(confirmModal.item?.amount * 0.5).toString());
                                                }
                                            }}
                                            style={{
                                                padding: '0.6rem 0.75rem',
                                                borderRadius: '8px',
                                                border: paymentType === 'partial' ? '1px solid #3b82f6' : '1px solid rgba(255,255,255,0.1)',
                                                background: paymentType === 'partial' ? 'rgba(59, 130, 246, 0.15)' : 'rgba(255,255,255,0.03)',
                                                color: paymentType === 'partial' ? '#60a5fa' : '#888',
                                                fontWeight: 600,
                                                fontSize: '0.85rem',
                                                cursor: 'pointer',
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                                gap: '0.35rem'
                                            }}
                                        >
                                            <Banknote size={14} />
                                            Partial Payment
                                        </button>
                                    </div>
                                </div>

                                {/* Amount to Settle Input */}
                                <div style={{ marginBottom: '1.25rem' }}>
                                    <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600, fontSize: '0.85rem' }}>
                                        Amount to Settle <span style={{ color: '#ef4444' }}>*</span>
                                    </label>
                                    <div style={{ position: 'relative' }}>
                                        <input 
                                            type="number"
                                            min="1"
                                            max={confirmModal.item?.amount}
                                            value={paymentType === 'full' ? confirmModal.item?.amount : customAmount}
                                            readOnly={paymentType === 'full'}
                                            onChange={(e) => setCustomAmount(e.target.value)}
                                            style={{
                                                width: '100%',
                                                padding: '0.75rem',
                                                paddingLeft: '2rem',
                                                borderRadius: '10px',
                                                border: '1px solid rgba(255,255,255,0.15)',
                                                background: paymentType === 'full' ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.4)',
                                                color: '#fff',
                                                fontSize: '1.1rem',
                                                fontWeight: 700,
                                                fontFamily: 'monospace',
                                                boxSizing: 'border-box'
                                            }}
                                        />
                                        <span style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)', color: '#888', fontWeight: 700 }}>
                                            ₦
                                        </span>
                                    </div>

                                    {/* Quick percentage shortcuts for partial payment */}
                                    {paymentType === 'partial' && confirmModal.item?.amount && (
                                        <div style={{ display: 'flex', gap: '0.4rem', marginTop: '0.5rem' }}>
                                            {[0.25, 0.5, 0.75].map((ratio) => {
                                                const val = Math.round(confirmModal.item.amount * ratio);
                                                return (
                                                    <button
                                                        key={ratio}
                                                        type="button"
                                                        onClick={() => setCustomAmount(val.toString())}
                                                        style={{
                                                            flex: 1,
                                                            padding: '0.35rem 0.5rem',
                                                            fontSize: '0.75rem',
                                                            background: 'rgba(255,255,255,0.05)',
                                                            border: '1px solid rgba(255,255,255,0.1)',
                                                            borderRadius: '6px',
                                                            color: '#ccc',
                                                            cursor: 'pointer'
                                                        }}
                                                    >
                                                        {ratio * 100}% (₦{val.toLocaleString()})
                                                    </button>
                                                );
                                            })}
                                        </div>
                                    )}

                                    {/* Projected Balance Display */}
                                    <div style={{ 
                                        marginTop: '0.5rem', 
                                        fontSize: '0.8rem', 
                                        display: 'flex', 
                                        justifyContent: 'space-between',
                                        padding: '0.4rem 0.6rem',
                                        borderRadius: '6px',
                                        background: 'rgba(255,255,255,0.03)'
                                    }}>
                                        <span style={{ color: '#888' }}>Remaining balance after:</span>
                                        <span style={{ 
                                            fontWeight: 700, 
                                            color: (confirmModal.item?.amount - (paymentType === 'full' ? confirmModal.item?.amount : (parseFloat(customAmount) || 0))) <= 0 ? 'var(--color-brand)' : '#f59e0b'
                                        }}>
                                            ₦{Math.max(0, confirmModal.item?.amount - (paymentType === 'full' ? confirmModal.item?.amount : (parseFloat(customAmount) || 0))).toLocaleString()}
                                        </span>
                                    </div>
                                </div>

                                {/* Payment Method Selector */}
                                <div style={{ marginBottom: '1.25rem' }}>
                                    <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600, fontSize: '0.85rem' }}>
                                        Payment Method <span style={{ color: '#ef4444' }}>*</span>
                                    </label>
                                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.4rem' }}>
                                        {[
                                            { id: 'cash', label: 'Cash (Office)' },
                                            { id: 'bank_transfer', label: 'Bank Transfer' },
                                            { id: 'pos', label: 'POS Terminal' }
                                        ].map((ch) => (
                                            <button
                                                key={ch.id}
                                                type="button"
                                                onClick={() => setChannel(ch.id)}
                                                style={{
                                                    padding: '0.5rem 0.3rem',
                                                    borderRadius: '8px',
                                                    border: channel === ch.id ? '1px solid var(--color-brand)' : '1px solid rgba(255,255,255,0.1)',
                                                    background: channel === ch.id ? 'rgba(16, 185, 129, 0.15)' : 'rgba(255,255,255,0.03)',
                                                    color: channel === ch.id ? 'var(--color-brand)' : '#aaa',
                                                    fontSize: '0.78rem',
                                                    fontWeight: 600,
                                                    cursor: 'pointer',
                                                    textAlign: 'center'
                                                }}
                                            >
                                                {ch.label}
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                {/* Installment History Accordion if any */}
                                {confirmModal.item?.installments && confirmModal.item?.installments.length > 0 && (
                                    <div style={{ marginBottom: '1.25rem' }}>
                                        <button
                                            type="button"
                                            onClick={() => setShowHistory(!showHistory)}
                                            style={{
                                                width: '100%',
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'space-between',
                                                padding: '0.5rem 0.75rem',
                                                background: 'rgba(255,255,255,0.03)',
                                                border: '1px solid rgba(255,255,255,0.08)',
                                                borderRadius: '8px',
                                                color: '#aaa',
                                                fontSize: '0.8rem',
                                                cursor: 'pointer'
                                            }}
                                        >
                                            <span style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                                                <History size={14} />
                                                Previous Payments ({confirmModal.item.installments.length})
                                            </span>
                                            {showHistory ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                                        </button>
                                        {showHistory && (
                                            <div style={{ marginTop: '0.5rem', maxHeight: '120px', overflowY: 'auto', padding: '0.4rem', background: 'rgba(0,0,0,0.3)', borderRadius: '8px' }}>
                                                {confirmModal.item.installments.map((inst, idx) => (
                                                    <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', padding: '0.35rem 0', borderBottom: idx < confirmModal.item.installments.length - 1 ? '1px solid rgba(255,255,255,0.05)' : 'none', fontSize: '0.75rem' }}>
                                                        <div>
                                                            <span style={{ fontWeight: 600, color: '#fff' }}>₦{inst.amount?.toLocaleString()}</span>
                                                            <span style={{ color: '#888', marginLeft: '6px' }}>({inst.channel || 'cash'})</span>
                                                        </div>
                                                        <span style={{ color: '#888' }}>{new Date(inst.paidAt).toLocaleDateString()}</span>
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                )}

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
                                            minHeight: '75px',
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
                                    {/* Quick reason suggestions */}
                                    <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap', marginTop: '0.5rem' }}>
                                        {[
                                            'Cash received at office',
                                            'Bank transfer confirmed',
                                            'POS terminal payment',
                                            'Partial debt repayment'
                                        ].map((chip) => (
                                            <button
                                                key={chip}
                                                type="button"
                                                onClick={() => setReason(`${chip} for ${confirmModal.item?.user?.name || 'trader'}`)}
                                                style={{
                                                    padding: '0.3rem 0.6rem',
                                                    borderRadius: '6px',
                                                    border: '1px solid rgba(255,255,255,0.1)',
                                                    background: 'rgba(255,255,255,0.04)',
                                                    color: '#aaa',
                                                    fontSize: '0.725rem',
                                                    cursor: 'pointer'
                                                }}
                                            >
                                                + {chip}
                                            </button>
                                        ))}
                                    </div>
                                    <p style={{ fontSize: '0.75rem', color: reason.trim().length >= 10 ? '#10b981' : '#666', marginTop: '0.35rem' }}>
                                        {reason.trim().length}/10 characters minimum. Logged for audit purposes.
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
                                        <span>Ensure payment is physically received or verified in bank statement before confirming. Action cannot be undone.</span>
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
                                        disabled={confirming || (paymentType === 'partial' && (!customAmount || parseFloat(customAmount) <= 0))}
                                    >
                                        {confirming ? (
                                            <>
                                                <Loader size={16} className="spin" style={{ marginRight: '0.5rem' }} />
                                                Processing...
                                            </>
                                        ) : (
                                            <>
                                                <CheckCircle size={16} style={{ marginRight: '0.5rem' }} />
                                                Confirm ₦{(paymentType === 'full' ? confirmModal.item?.amount : (parseFloat(customAmount) || 0))?.toLocaleString()}
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

