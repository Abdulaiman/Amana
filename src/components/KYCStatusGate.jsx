import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Lock, Clock, AlertTriangle, ChevronRight, UserCheck, Store } from 'lucide-react';

const KYCStatusGate = ({ profile, role }) => {
    const navigate = useNavigate();

    if (!profile) return null;

    const isAgentVerification = profile.verificationStatus === 'pending_agent_verification';
    const isAdminReview = profile.verificationStatus === 'pending_admin_approval' || profile.verificationStatus === 'pending';
    const isPending = isAgentVerification || isAdminReview;
    const isRejected = profile.verificationStatus === 'rejected';
    const isAgentRejected = isRejected && profile.rejectedByRole === 'agent';
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
                padding: 'var(--space-8)',
                textAlign: 'center',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                border: '1px solid var(--color-border)',
                borderRadius: 'var(--radius-2xl)',
                background: 'var(--color-surface)',
                boxShadow: 'var(--shadow-lg)'
            }}>
                <div style={{
                    width: '72px',
                    height: '72px',
                    borderRadius: 'var(--radius-full)',
                    backgroundColor: isRejected ? 'rgba(239, 68, 68, 0.12)' :
                        isPending ? 'rgba(245, 158, 11, 0.12)' : 'rgba(59, 130, 246, 0.12)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    marginBottom: 'var(--space-6)'
                }}>
                    {isRejected ? (
                        isAgentRejected ? <Store size={36} color="var(--color-danger)" /> : <AlertTriangle size={36} color="var(--color-danger)" />
                    ) : isPending ? (
                        <Clock size={36} color="var(--color-warning)" />
                    ) : (
                        <Lock size={36} color="var(--color-primary)" />
                    )}
                </div>

                <h2 style={{
                    fontSize: 'var(--text-2xl)',
                    fontWeight: 800,
                    marginBottom: 'var(--space-2)',
                    color: 'var(--color-text-primary)'
                }}>
                    {isRejected ? (isAgentRejected ? 'Store Verification Declined' : 'Action Required') :
                        isAgentVerification ? 'Field Verification Scheduled' :
                        isPending ? 'Final Admin Review' :
                        isRetailer ? 'Unlock Your Credit' : 'Complete Your Profile'}
                </h2>

                {isRejected ? (
                    <div style={{
                        width: '100%',
                        backgroundColor: 'rgba(239, 68, 68, 0.08)',
                        border: '1px solid rgba(239, 68, 68, 0.35)',
                        borderRadius: 'var(--radius-xl)',
                        padding: 'var(--space-4) var(--space-5)',
                        textAlign: 'left',
                        marginBottom: 'var(--space-6)'
                    }}>
                        <div style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '8px',
                            color: 'var(--color-danger)',
                            fontWeight: 800,
                            fontSize: 'var(--text-xs)',
                            letterSpacing: '0.5px',
                            textTransform: 'uppercase',
                            marginBottom: '6px'
                        }}>
                            {isAgentRejected ? (
                                <><Store size={15} /> Field Verification Declined by Agent</>
                            ) : (
                                <><AlertTriangle size={15} /> Admin Rejection Reason</>
                            )}
                        </div>
                        <p style={{
                            color: 'var(--color-text-primary)',
                            fontStyle: 'italic',
                            fontSize: 'var(--text-base)',
                            lineHeight: 1.5,
                            margin: '0 0 var(--space-2) 0',
                            fontWeight: 600
                        }}>
                            "{profile?.rejectionReason || 'Information provided was incomplete or requires correction.'}"
                        </p>
                        <p style={{
                            color: 'var(--color-text-secondary)',
                            fontSize: 'var(--text-xs)',
                            margin: 0
                        }}>
                            {isAgentRejected
                                ? 'Your store did not meet physical verification criteria. When you believe you have met the requirements, you can re-apply below for an agent to re-inspect.'
                                : 'Please update the required details and resubmit for review.'}
                        </p>
                    </div>
                ) : (
                    <p style={{
                        color: 'var(--color-text-secondary)',
                        fontSize: 'var(--text-base)',
                        lineHeight: 1.6,
                        marginBottom: 'var(--space-6)'
                    }}>
                        {isAgentVerification ? (
                            "Application submitted! Your assigned Market Agent will visit your store premises for physical verification."
                        ) : isPending ? (
                            isRetailer
                                ? "Field verification complete! Admin is performing final review and setting your credit limit."
                                : "We're reviewing your business documents. This usually takes less than 24 hours."
                        ) : (
                            isRetailer
                                ? "Complete your trader onboarding application to unlock your credit limit."
                                : "To start receiving orders and request payouts, please complete your vendor profile."
                        )}
                    </p>
                )}

                {(isRejected || !isPending) && (
                    <button
                        onClick={() => navigate(isRetailer ? '/complete-profile' : '/vendor/complete-profile')}
                        className="btn btn-primary"
                    >
                        {isRejected ? (isAgentRejected ? 'Re-apply for Verification' : (isRetailer ? 'Update Application & Resubmit' : 'Update Business Info')) :
                            (isRetailer ? 'Start Onboarding' : 'Complete Profile')}
                        <ChevronRight size={18} />
                    </button>
                )}

                {isPending ? (
                    <div className="badge badge-warning" style={{ marginTop: 'var(--space-4)' }}>
                        {isAgentVerification ? 'Agent Visit Pending...' : 'Processing Submission...'}
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
