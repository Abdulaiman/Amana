import React, { useState, useEffect } from 'react';
import { 
    X, Check, AlertCircle, ShieldCheck, ShieldX, ZoomIn, 
    ExternalLink, Camera, FileText, User, Building, MapPin, 
    Calendar, Phone, Mail, Award, DollarSign, CheckCircle2, XCircle
} from 'lucide-react';
import '../../pages/admin/AdminSectionStyles.css';

const AdminKYCReviewModal = ({
    isOpen,
    onClose,
    entityType, // 'retailer' | 'vendor'
    entityData,
    onApprove,
    onReject,
    isLoading
}) => {
    const [lightboxImage, setLightboxImage] = useState(null);
    const [customCreditLimit, setCustomCreditLimit] = useState(
        entityData?.creditLimit || 
        entityData?.eligibilityChecklist?.calculatedCeilingAmount || 
        ''
    );
    const [adminNote, setAdminNote] = useState('');

    // Close lightbox on Escape key without closing the KYC review modal
    useEffect(() => {
        const handleKeyDown = (e) => {
            if (e.key === 'Escape') {
                if (lightboxImage) {
                    e.stopPropagation();
                    e.stopImmediatePropagation?.();
                    setLightboxImage(null);
                } else if (isOpen) {
                    onClose();
                }
            }
        };
        if (isOpen) {
            window.addEventListener('keydown', handleKeyDown);
            return () => window.removeEventListener('keydown', handleKeyDown);
        }
    }, [lightboxImage, isOpen, onClose]);

    // Reset/sync state when entityData changes
    useEffect(() => {
        if (entityData) {
            setCustomCreditLimit(
                entityData?.creditLimit || 
                entityData?.eligibilityChecklist?.calculatedCeilingAmount || 
                ''
            );
            setAdminNote('');
            setLightboxImage(null);
        }
    }, [entityData]);

    if (!isOpen || !entityData) return null;

    const isRetailer = entityType === 'retailer';
    const ceiling = entityData.eligibilityChecklist?.calculatedCeilingAmount || 100000;
    const verifiedCapital = entityData.eligibilityChecklist?.verifiedCapitalAmount || 0;

    // Profile picture can be in kyc.profilePicUrl or profilePicUrl or avatar
    const profilePic = isRetailer 
        ? (entityData.kyc?.profilePicUrl || entityData.profilePicUrl || null)
        : (entityData.profilePicUrl || null);

    const idCardDoc = entityData.kyc?.idCardUrl || null;
    const unionCardDoc = entityData.kyc?.marketMembershipCardUrl || null;
    const storePhoto = entityData.eligibilityChecklist?.storePhotoUrl || null;
    const cacDoc = entityData.cacDocumentUrl || null;

    const quickReasons = [
        'Document photo is blurry or unreadable',
        'Physical store location could not be verified',
        'Government ID does not match applicant name',
        'CAC registration number mismatch or expired',
        'Does not meet minimum 6-month trading history',
        'Verified capital is below required threshold'
    ];

    const applyCeilingPct = (pct) => {
        const amt = Math.round(ceiling * pct);
        setCustomCreditLimit(amt);
    };

    const handleQuickReason = (reason) => {
        setAdminNote(prev => prev ? `${prev}. ${reason}` : reason);
    };

    return (
        <>
            <div className="kyc-workspace-overlay" onClick={onClose}>
                <div className="kyc-workspace-container" onClick={e => e.stopPropagation()}>
                {/* ── Top Bar ── */}
                <div className="kyc-workspace-topbar">
                    <div className="topbar-entity-meta">
                        <div className="workspace-entity-avatar">
                            {profilePic ? (
                                <img src={profilePic} alt={entityData.name || entityData.businessName} />
                            ) : (
                                (entityData.name?.charAt(0) || entityData.businessName?.charAt(0) || '?').toUpperCase()
                            )}
                        </div>
                        <div className="topbar-entity-info">
                            <div className="workspace-entity-heading">
                                <h2 className="workspace-title" title={isRetailer ? entityData.name : entityData.businessName}>
                                    {isRetailer ? entityData.name : entityData.businessName}
                                </h2>
                                <span className={`status-pill ${entityData.verificationStatus === 'approved' || entityData.verificationStatus === 'verified' ? 'approved' : entityData.verificationStatus === 'rejected' ? 'rejected' : 'pending'}`}>
                                    {(entityData.verificationStatus || 'PENDING').toUpperCase()}
                                </span>
                            </div>
                            <div className="workspace-meta-line">
                                <span>{isRetailer ? 'Retailer' : 'Vendor'}</span>
                                <span>•</span>
                                <span className="hide-on-mobile">ID: {entityData._id?.substring(0, 8)}...</span>
                                <span className="hide-on-mobile">•</span>
                                <span>Reg {new Date(entityData.createdAt || Date.now()).toLocaleDateString()}</span>
                            </div>
                        </div>
                    </div>
                    <button className="workspace-close-btn" onClick={onClose} aria-label="Close Review">
                        <X size={18} />
                    </button>
                </div>

                {/* ── Dual-Pane Review Workspace ── */}
                <div className="kyc-workspace-split">
                    {/* ── Left Pane: Visual Documents & Field Checklist ── */}
                    <div className="kyc-pane-inspection">
                        {/* Facial Verification & Identity Banner */}
                        <div className="facial-verification-banner">
                            <ShieldCheck size={20} className="text-brand" />
                            <div>
                                <strong>Visual Identity Check:</strong> Compare applicant profile photo with official Government ID to confirm identity authenticity.
                            </div>
                        </div>

                        {/* Document Inspection Gallery */}
                        <div className="inspection-card">
                            <h3 className="inspection-card-title">
                                <Camera size={18} /> Official Documents & Photo Inspection
                            </h3>
                            <div className="doc-inspection-grid">
                                {/* Profile Picture (Applicant Selfie) */}
                                <div className="doc-preview-box">
                                    <div className="doc-preview-header">
                                        <span>Applicant Profile Photo</span>
                                        <User size={14} />
                                    </div>
                                    {profilePic ? (
                                        <div className="doc-preview-image-wrap" onClick={() => setLightboxImage(profilePic)}>
                                            <img src={profilePic} alt="Profile" />
                                            <div className="doc-zoom-hint"><ZoomIn size={12} /> Inspect</div>
                                        </div>
                                    ) : (
                                        <div className="doc-missing-placeholder">
                                            <User size={28} />
                                            <span>No profile photo uploaded</span>
                                        </div>
                                    )}
                                </div>

                                {/* Government ID Card (D1) */}
                                {isRetailer && (
                                    <div className="doc-preview-box">
                                        <div className="doc-preview-header">
                                            <span>Valid ID Card (D1)</span>
                                            <FileText size={14} />
                                        </div>
                                        {idCardDoc ? (
                                            <div className="doc-preview-image-wrap" onClick={() => setLightboxImage(idCardDoc)}>
                                                <img src={idCardDoc} alt="Govt ID Card" />
                                                <div className="doc-zoom-hint"><ZoomIn size={12} /> Inspect</div>
                                            </div>
                                        ) : (
                                            <div className="doc-missing-placeholder">
                                                <FileText size={28} />
                                                <span>No ID card uploaded</span>
                                            </div>
                                        )}
                                    </div>
                                )}

                                {/* Market Union Card (C2) */}
                                {isRetailer && (
                                    <div className="doc-preview-box">
                                        <div className="doc-preview-header">
                                            <span>Market Union Card (C2)</span>
                                            <Award size={14} />
                                        </div>
                                        {unionCardDoc ? (
                                            <div className="doc-preview-image-wrap" onClick={() => setLightboxImage(unionCardDoc)}>
                                                <img src={unionCardDoc} alt="Union Card" />
                                                <div className="doc-zoom-hint"><ZoomIn size={12} /> Inspect</div>
                                            </div>
                                        ) : (
                                            <div className="doc-missing-placeholder">
                                                <Award size={28} />
                                                <span>No union card uploaded</span>
                                            </div>
                                        )}
                                    </div>
                                )}

                                {/* Store Photo from Field Visit */}
                                {isRetailer && (
                                    <div className="doc-preview-box">
                                        <div className="doc-preview-header">
                                            <span>Store Front (Agent Photo)</span>
                                            <Building size={14} />
                                        </div>
                                        {storePhoto ? (
                                            <div className="doc-preview-image-wrap" onClick={() => setLightboxImage(storePhoto)}>
                                                <img src={storePhoto} alt="Store Front" />
                                                <div className="doc-zoom-hint"><ZoomIn size={12} /> Inspect</div>
                                            </div>
                                        ) : (
                                            <div className="doc-missing-placeholder">
                                                <Building size={28} />
                                                <span>No store visit photo yet</span>
                                            </div>
                                        )}
                                    </div>
                                )}

                                {/* CAC Document for Vendors */}
                                {!isRetailer && (
                                    <div className="doc-preview-box">
                                        <div className="doc-preview-header">
                                            <span>CAC Certificate</span>
                                            <FileText size={14} />
                                        </div>
                                        {cacDoc ? (
                                            <div className="doc-preview-image-wrap" onClick={() => setLightboxImage(cacDoc)}>
                                                <img src={cacDoc} alt="CAC Document" />
                                                <div className="doc-zoom-hint"><ZoomIn size={12} /> Inspect</div>
                                            </div>
                                        ) : (
                                            <div className="doc-missing-placeholder">
                                                <FileText size={28} />
                                                <span>No CAC certificate uploaded</span>
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Retailer Field Visit Checkpoints */}
                        {isRetailer ? (
                            <>
                                <div className="inspection-card">
                                    <h3 className="inspection-card-title">
                                        <CheckCircle2 size={18} /> Field Audit Checkpoints (Agent Report)
                                    </h3>
                                    <div className="checkpoints-grid">
                                        <div className={`checkpoint-card ${entityData.eligibilityChecklist?.a1_physicalStore?.pass ? 'pass' : 'fail'}`}>
                                            <div className="checkpoint-card-top">
                                                <span className="checkpoint-name">A1 Physical Store</span>
                                                <span className={`checkpoint-pill ${entityData.eligibilityChecklist?.a1_physicalStore?.pass ? 'pass' : 'fail'}`}>
                                                    {entityData.eligibilityChecklist?.a1_physicalStore?.pass ? 'PASS' : 'FAIL'}
                                                </span>
                                            </div>
                                            <p className="checkpoint-note">
                                                {entityData.eligibilityChecklist?.a1_physicalStore?.notes || 'Agent verified physical premises.'}
                                            </p>
                                        </div>

                                        <div className={`checkpoint-card ${entityData.eligibilityChecklist?.a2_minTradingHistory?.pass ? 'pass' : 'fail'}`}>
                                            <div className="checkpoint-card-top">
                                                <span className="checkpoint-name">A2 Trading (≥6 mo)</span>
                                                <span className={`checkpoint-pill ${entityData.eligibilityChecklist?.a2_minTradingHistory?.pass ? 'pass' : 'fail'}`}>
                                                    {entityData.eligibilityChecklist?.a2_minTradingHistory?.pass ? 'PASS' : 'FAIL'}
                                                </span>
                                            </div>
                                            <p className="checkpoint-note">
                                                {entityData.eligibilityChecklist?.a2_minTradingHistory?.notes || 'Minimum operational history met.'}
                                            </p>
                                        </div>

                                        <div className={`checkpoint-card ${entityData.eligibilityChecklist?.a3_goodsResaleOnly?.pass ? 'pass' : 'fail'}`}>
                                            <div className="checkpoint-card-top">
                                                <span className="checkpoint-name">A3 Resale Goods</span>
                                                <span className={`checkpoint-pill ${entityData.eligibilityChecklist?.a3_goodsResaleOnly?.pass ? 'pass' : 'fail'}`}>
                                                    {entityData.eligibilityChecklist?.a3_goodsResaleOnly?.pass ? 'PASS' : 'FAIL'}
                                                </span>
                                            </div>
                                            <p className="checkpoint-note">
                                                {entityData.eligibilityChecklist?.a3_goodsResaleOnly?.notes || 'Eligible goods for wholesale resale.'}
                                            </p>
                                        </div>

                                        <div className={`checkpoint-card ${entityData.eligibilityChecklist?.b2_minCapitalMet ? 'pass' : 'fail'}`}>
                                            <div className="checkpoint-card-top">
                                                <span className="checkpoint-name">B2 Capital (≥₦500k)</span>
                                                <span className={`checkpoint-pill ${entityData.eligibilityChecklist?.b2_minCapitalMet ? 'pass' : 'fail'}`}>
                                                    {entityData.eligibilityChecklist?.b2_minCapitalMet ? 'PASS' : 'FAIL'}
                                                </span>
                                            </div>
                                            <p className="checkpoint-note">
                                                Verified capital: ₦{verifiedCapital.toLocaleString()}
                                            </p>
                                        </div>
                                    </div>
                                </div>

                                {/* Personal & Business Information */}
                                <div className="inspection-card">
                                    <h3 className="inspection-card-title">
                                        <User size={18} /> Personal & Business Metadata
                                    </h3>
                                    <div className="info-grid">
                                        <div className="info-card-row">
                                            <span className="info-label">Full Name</span>
                                            <span className="info-value">{entityData.name}</span>
                                        </div>
                                        <div className="info-card-row">
                                            <span className="info-label">Phone</span>
                                            <span className="info-value">{entityData.phone}</span>
                                        </div>
                                        <div className="info-card-row">
                                            <span className="info-label">Email</span>
                                            <span className="info-value">{entityData.email}</span>
                                        </div>
                                        <div className="info-card-row">
                                            <span className="info-label">NIN</span>
                                            <span className="info-value">{entityData.kyc?.nin || 'N/A'}</span>
                                        </div>
                                        <div className="info-card-row">
                                            <span className="info-label">BVN</span>
                                            <span className="info-value">{entityData.kyc?.bvn || 'N/A'}</span>
                                        </div>
                                        <div className="info-card-row">
                                            <span className="info-label">Business Store</span>
                                            <span className="info-value">{entityData.businessInfo?.businessName || entityData.businessName || 'N/A'}</span>
                                        </div>
                                        <div className="info-card-row">
                                            <span className="info-label">Business Address</span>
                                            <span className="info-value">{entityData.address || 'N/A'}</span>
                                        </div>
                                        <div className="info-card-row">
                                            <span className="info-label">Amana Score</span>
                                            <span className="info-value text-brand font-bold">{entityData.amanaScore || 0} pts</span>
                                        </div>
                                    </div>
                                </div>
                            </>
                        ) : (
                            /* Vendor Information */
                            <div className="inspection-card">
                                <h3 className="inspection-card-title">
                                    <Building size={18} /> Vendor Registration Details
                                </h3>
                                <div className="info-grid">
                                    <div className="info-card-row">
                                        <span className="info-label">Business Name</span>
                                        <span className="info-value">{entityData.businessName}</span>
                                    </div>
                                    <div className="info-card-row">
                                        <span className="info-label">CAC Number</span>
                                        <span className="info-value">{entityData.cacNumber || 'N/A'}</span>
                                    </div>
                                    <div className="info-card-row">
                                        <span className="info-label">Owner Name</span>
                                        <span className="info-value">{entityData.ownerName}</span>
                                    </div>
                                    <div className="info-card-row">
                                        <span className="info-label">Contact Phone</span>
                                        <span className="info-value">{entityData.phones?.[0] || entityData.ownerPhone || 'N/A'}</span>
                                    </div>
                                    <div className="info-card-row">
                                        <span className="info-label">Email</span>
                                        <span className="info-value">{entityData.email}</span>
                                    </div>
                                    <div className="info-card-row">
                                        <span className="info-label">Wallet Balance</span>
                                        <span className="info-value text-brand">₦{(entityData.walletBalance || 0).toLocaleString()}</span>
                                    </div>
                                    <div className="info-card-row">
                                        <span className="info-label">Bank Payout</span>
                                        <span className="info-value">{entityData.bankDetails?.bankName || 'N/A'} - {entityData.bankDetails?.accountNumber || 'N/A'}</span>
                                    </div>
                                    <div className="info-card-row">
                                        <span className="info-label">Address</span>
                                        <span className="info-value">{entityData.address}</span>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* ── Right Pane: Compliance Decision Console ── */}
                    <div className="kyc-pane-decision">
                        <div className="decision-card">
                            <h3 className="inspection-card-title">
                                <ShieldCheck size={18} /> Verification Decision
                            </h3>

                            {isRetailer && (
                                <div className="ceiling-calc-box">
                                    <div className="calc-metric-row">
                                        <span className="text-secondary">Verified Store Capital:</span>
                                        <strong>₦{verifiedCapital.toLocaleString()}</strong>
                                    </div>
                                    <div className="calc-metric-row">
                                        <span className="text-secondary">Max Ceiling (20%):</span>
                                        <strong className="text-brand">₦{ceiling.toLocaleString()}</strong>
                                    </div>

                                    <div className="mt-3">
                                        <label className="text-xs font-semibold text-secondary block mb-1">
                                            Allocated Credit Limit (₦)
                                        </label>
                                        <input 
                                            type="number" 
                                            className="admin-search-input-main"
                                            placeholder="Enter credit limit"
                                            value={customCreditLimit}
                                            onChange={e => setCustomCreditLimit(e.target.value)}
                                        />
                                        <div className="preset-percentages-row">
                                            <button type="button" className="preset-pct-btn" onClick={() => applyCeilingPct(0.25)}>25%</button>
                                            <button type="button" className="preset-pct-btn" onClick={() => applyCeilingPct(0.50)}>50%</button>
                                            <button type="button" className="preset-pct-btn" onClick={() => applyCeilingPct(0.75)}>75%</button>
                                            <button type="button" className="preset-pct-btn" onClick={() => applyCeilingPct(1.00)}>100%</button>
                                        </div>
                                    </div>
                                </div>
                            )}

                            <div>
                                <label className="text-xs font-semibold text-secondary block mb-1">
                                    Decision Note / Feedback
                                </label>
                                <textarea
                                    className="admin-search-input-main"
                                    rows={3}
                                    placeholder="Enter administrative review notes or specific reasons if rejecting..."
                                    value={adminNote}
                                    onChange={e => setAdminNote(e.target.value)}
                                />
                                
                                <label className="text-xs text-tertiary block mt-2 mb-1">Quick Rejection Reasons:</label>
                                <div className="quick-reason-tags">
                                    {quickReasons.map((reason, idx) => (
                                        <button 
                                            key={idx}
                                            type="button" 
                                            className="quick-reason-tag"
                                            onClick={() => handleQuickReason(reason)}
                                        >
                                            + {reason}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </div>

                        {/* Action Buttons */}
                        <div className="decision-actions-row">
                            <button
                                type="button"
                                className="btn-reject-full"
                                disabled={isLoading}
                                onClick={() => onReject(entityData._id, adminNote)}
                            >
                                <XCircle size={18} />
                                {isLoading ? 'Processing...' : 'Reject Application'}
                            </button>
                            <button
                                type="button"
                                className="btn-approve-full"
                                disabled={isLoading || (isRetailer && !customCreditLimit)}
                                onClick={() => onApprove(entityData._id, customCreditLimit, adminNote)}
                            >
                                <CheckCircle2 size={18} />
                                {isLoading ? 'Processing...' : isRetailer ? 'Approve & Allocate Limit' : 'Verify Vendor'}
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>

        {/* ── Document Lightbox Preview Modal (Rendered outside workspace overlay so clicks never bubble to onClose) ── */}
            {lightboxImage && (
                <div 
                    className="doc-lightbox-overlay" 
                    onClick={(e) => {
                        e.stopPropagation();
                        setLightboxImage(null);
                    }}
                >
                    <div className="lightbox-top-bar" onClick={e => e.stopPropagation()}>
                        <div className="lightbox-title-wrap">
                            <ZoomIn size={16} color="#fff" />
                            <span>Document Inspection</span>
                        </div>
                        <div className="lightbox-actions-wrap">
                            <a 
                                href={lightboxImage} 
                                target="_blank" 
                                rel="noreferrer" 
                                className="lightbox-external-link"
                                onClick={e => e.stopPropagation()}
                            >
                                <ExternalLink size={14} /> Open Original
                            </a>
                            <button 
                                type="button" 
                                className="lightbox-close-btn" 
                                onClick={(e) => {
                                    e.stopPropagation();
                                    setLightboxImage(null);
                                }}
                                title="Close inspection and return to KYC review"
                            >
                                <X size={18} />
                                <span>Back to Review</span>
                            </button>
                        </div>
                    </div>

                    <div className="lightbox-image-container" onClick={e => e.stopPropagation()}>
                        <img 
                            src={lightboxImage} 
                            alt="Document Preview" 
                            className="lightbox-img" 
                            onClick={e => e.stopPropagation()} 
                        />
                    </div>
                </div>
            )}
        </>
    );
};

export default AdminKYCReviewModal;
