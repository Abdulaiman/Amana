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
        <div className="kyc-gatekeeper">
            <div className="kyc-card">
                <div className={`kyc-icon ${isRejected ? 'rejected' : isPending ? 'pending' : ''}`}>
                    {isRejected ? <AlertTriangle size={48} /> : isPending ? <Clock size={48} /> : <Lock size={48} />}
                </div>
                
                <h1 className="kyc-title">
                    {isRejected ? 'Action Required' : isPending ? 'Verification Pending' : isRetailer ? 'Unlock Your Credit 🚀' : 'Complete Your Profile 🏪'}
                </h1>
                
                <p className="kyc-text">
                    {isRejected ? (
                        <>
                            Your {isRetailer ? 'verification' : 'business verification'} was declined: <br/>
                            <strong className="rejection-text">"{profile.rejectionReason}"</strong>
                        </>
                    ) : isPending ? (
                        isRetailer 
                            ? "We're reviewing your documents. This usually takes less than 24 hours. You'll have full access once approved."
                            : "We're reviewing your business documents and CAC details. This usually takes less than 24 hours. You'll be notified once verified."
                    ) : (
                        isRetailer
                            ? <>You've passed the initial assessment! <br/> Now, verify your business identity to unlock your credit limit.</>
                            : "To start receiving orders and request payouts, please complete your vendor profile with business and bank details."
                    )}
                </p>

                {(isRejected || !isPending) && (
                    <button 
                        onClick={() => navigate(isRetailer ? '/complete-profile' : '/vendor/complete-profile')}
                        className="kyc-btn"
                    >
                        {isRejected ? (isRetailer ? 'Update Documents' : 'Update Business Info') : (isRetailer ? 'Complete Verification' : 'Complete Profile')} <ChevronRight size={20} />
                    </button>
                )}
                
                {isPending ? (
                    <div className="pending-badge">
                        {isRetailer ? 'Processing Submission...' : 'Verification in Progress...'}
                    </div>
                ) : (
                    <p className="kyc-note">Takes less than {isRetailer ? '2' : '3'} minutes • Secure & Private</p>
                )}
            </div>
        </div>
    );
};

export default KYCStatusGate;
