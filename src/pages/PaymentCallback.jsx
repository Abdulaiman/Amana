import React, { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import api from '../services/api';
import { Check, X, Loader } from 'lucide-react';

const PaymentCallback = () => {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const [status, setStatus] = useState('verifying'); // verifying, success, error
    const [message, setMessage] = useState('Verifying your payment...');
    const reference = searchParams.get('reference');

    useEffect(() => {
        const verify = async () => {
            if (!reference) {
                setStatus('error');
                setMessage('No payment reference found.');
                return;
            }

            try {
                const res = await api.get(`/payment/verify?reference=${reference}`);
                setStatus('success');
                setMessage(`Payment Successful! Paid: ₦${res.data.amountPaid.toLocaleString()}. Your credit limit has been updated.`);
            } catch (error) {
                console.error(error);
                setStatus('error');
                setMessage(error.response?.data?.message || 'Payment verification failed.');
            }
        };

        verify();
    }, [reference]);

    // Inline styles for this specific page to match "Premium Dark" without Tailwind
    const containerStyle = {
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '80vh',
        textAlign: 'center',
        padding: '2rem'
    };

    const cardStyle = {
        maxWidth: '450px',
        width: '100%',
        padding: '3rem',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: '1.5rem'
    };

    const iconWrapperStyle = (color) => ({
        width: '64px',
        height: '64px',
        borderRadius: '50%',
        background: color === 'green' ? 'rgba(16, 185, 129, 0.1)' : 'rgba(239, 68, 68, 0.1)',
        color: color === 'green' ? '#10b981' : '#ef4444',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: '1rem'
    });

    return (
        <div style={containerStyle} className="animate-fade-in">
            <div className="glass-panel" style={cardStyle}>
                {status === 'verifying' && (
                    <>
                        <div className="loading-spinner" style={{ width: '48px', height: '48px', marginBottom: '1rem' }}></div>
                        <h2 style={{ fontSize: '1.5rem', fontWeight: 'bold', color: 'var(--color-text)' }}>Verifying Payment</h2>
                        <p style={{ color: 'var(--color-text-muted)' }}>Please wait while we confirm your transaction...</p>
                    </>
                )}

                {status === 'success' && (
                    <>
                        <div style={iconWrapperStyle('green')}>
                            <Check size={32} />
                        </div>
                        <h2 style={{ fontSize: '1.75rem', fontWeight: 'bold', color: 'white' }}>Payment Successful!</h2>
                        <p style={{ color: '#d1d5db', lineHeight: '1.6' }}>{message}</p>
                        <button 
                            onClick={() => navigate('/dashboard')}
                            className="btn-primary"
                            style={{ width: '100%', padding: '1rem', marginTop: '1rem', display: 'flex', justifyContent: 'center' }}
                        >
                            Back to Dashboard
                        </button>
                    </>
                )}

                {status === 'error' && (
                    <>
                        <div style={iconWrapperStyle('red')}>
                            <X size={32} />
                        </div>
                        <h2 style={{ fontSize: '1.75rem', fontWeight: 'bold', color: 'white' }}>Payment Failed</h2>
                        <p style={{ color: '#f87171', lineHeight: '1.6' }}>{message}</p>
                        <button 
                            onClick={() => navigate('/dashboard')}
                            className="btn-secondary"
                            style={{ width: '100%', padding: '1rem', marginTop: '1rem', display: 'flex', justifyContent: 'center' }}
                        >
                            Return to Dashboard
                        </button>
                    </>
                )}
            </div>
        </div>
    );
};

export default PaymentCallback;
