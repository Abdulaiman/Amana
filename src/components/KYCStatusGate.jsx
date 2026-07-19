import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Lock, Clock, AlertTriangle, ChevronRight } from 'lucide-react';

const KYCStatusGate = ({ profile, role }) => {
    const navigate = useNavigate();

    if (!profile) return null;

    const isPending = profile.verificationStatus === 'pending';
    const isRejected = profile.verificationStatus === 'rejected';
    const isRetailer = role === 'retailer';

    return (
        <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            minHeight: '60vh',
            padding: 'var(--space-6)'
        }}>
            <div className="card" style={{
                maxWidth: '480px',
                width: '100%',
                textAlign: 'center',
                padding: 'var(--space-8)'
            }}>
                <div style={{
                    width: '64px',
                    height: '64px',
                    borderRadius: '50%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    margin: '0 auto var(--space-5)',
                    backgroundColor: isRejected ? 'var(--color-danger-subtle)' :
                        isPending ? 'var(--color-warning-subtle)' : 'var(--color-brand-subtle)',
                    color: isRejected ? 'var(--color-danger)' :
                        isPending ? 'var(--color-warning)' : 'var(--color-brand-text)'
                }}>
                    {isRejected ? <AlertTriangle size={32} /> :
                        isPending ? <Clock size={32} /> : <Lock size={32} />}
                </div>

                <h2 style={{
                    fontSize: 'var(--text-xl)',
                    fontWeight: 'var(--font-weight-bold)',
                    color: 'var(--color-text-primary)',
                    marginBottom: 'var(--space-3)'
                }}>
                    {isRejected ? 'Action Required' :
                        isPending ? 'Verification Pending' :
                        isRetailer ? 'Unlock Your Credit' : 'Complete Your Profile'}
                </h2>

                <p style={{
                    color: 'var(--color-text-secondary)',
                    fontSize: 'var(--text-base)',
                    lineHeight: 1.6,
                    marginBottom: 'var(--space-6)'
                }}>
                    {isRejected ? (
                        <>
                            Your {isRetailer ? 'verification' : 'business verification'} was declined:
                            <br />
                            <strong style={{ color: 'var(--color-danger)' }}>"{profile.rejectionReason}"</strong>
                        </>
                    ) : isPending ? (
                        isRetailer
                            ? "We're reviewing your documents. This usually takes less than 24 hours."
                            : "We're reviewing your business documents. This usually takes less than 24 hours."
                    ) : (
                        isRetailer
                            ? "You've passed the initial assessment! Now, verify your business identity to unlock your credit limit."
                            : "To start receiving orders and request payouts, please complete your vendor profile."
                    )}
                </p>

                {(isRejected || !isPending) && (
                    <button
                        onClick={() => navigate(isRetailer ? '/complete-profile' : '/vendor/complete-profile')}
                        className="btn btn-primary"
                    >
                        {isRejected ? (isRetailer ? 'Update Documents' : 'Update Business Info') :
                            (isRetailer ? 'Complete Verification' : 'Complete Profile')}
                        <ChevronRight size={18} />
                    </button>
                )}

                {isPending ? (
                    <div className="badge badge-warning" style={{ marginTop: 'var(--space-4)' }}>
                        Processing Submission...
                    </div>
                ) : (
                    <p style={{
                        fontSize: 'var(--text-xs)',
                        color: 'var(--color-text-tertiary)',
                        marginTop: 'var(--space-4)'
                    }}>
                        Takes less than {isRetailer ? '2' : '3'} minutes • Secure & Private
                    </p>
                )}
            </div>
        </div>
    );
};

export default KYCStatusGate;
