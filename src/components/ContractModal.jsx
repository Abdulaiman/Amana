import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { 
  X, 
  ShieldCheck, 
  CheckCircle, 
  FileText, 
  Scale, 
  BookOpen, 
  Lock, 
  PackageCheck, 
  Calendar, 
  Clock, 
  Check, 
  AlertCircle,
  ExternalLink,
  Building2,
  FileCheck2,
  Coins,
  Percent,
  Plus,
  Equal,
  Sparkles,
  Award,
  ChevronRight,
  XCircle
} from 'lucide-react';
import { AMANA_CORPORATE_INFO } from '../utils/contractTemplates';
import './ContractModal.css';

const ContractModal = ({
  isOpen,
  onClose,
  contractData,
  onSign,
  onDecline,
  isSigning = false,
  isDeclining = false,
  canSign = true,
  signButtonText = 'Sign & Accept Agreement',
  declineButtonText
}) => {
  const [activeTab, setActiveTab] = useState('summary');
  const [agreed, setAgreed] = useState(false);

  // Reset agreement state and tab when a new contract is opened
  useEffect(() => {
    if (isOpen) {
      setAgreed(false);
      setActiveTab('summary');
    }
  }, [isOpen, contractData?.refCode]);

  // Handle ESC key to close modal & prevent body scroll
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && !isSigning && !isDeclining) {
        onClose();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = originalOverflow;
    };
  }, [isOpen, isSigning, isDeclining, onClose]);

  if (!isOpen || !contractData) return null;

  const isUndertaking = contractData.title?.toUpperCase().includes('UNDERTAKING');
  const isSigned = Boolean(contractData.isSigned);

  const toggleAgreement = () => {
    if (isSigning || isDeclining || isSigned || !canSign) return;
    setAgreed(prev => !prev);
  };

  const handleSignClick = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (!agreed || isSigning || isDeclining || !canSign) return;
    if (onSign) {
      onSign();
    }
  };

  const handleDeclineClick = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (isSigning || isDeclining) return;
    if (onDecline) {
      onDecline();
    }
  };

  const modalNode = (
    <div 
      className="contract-modal-backdrop" 
      onClick={(e) => {
        if (e.target === e.currentTarget && !isSigning && !isDeclining) {
          onClose();
        }
      }}
    >
      <div 
        className={`contract-modal-card animate-scale-up ${isUndertaking ? 'type-undertaking' : 'type-murabaha'}`} 
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-labelledby="contract-modal-title"
      >
        {/* Header Bar */}
        <div className="contract-modal-header">
          <div className="contract-header-main">
            <div className="contract-meta-row">
              <div className={`contract-category-badge ${isUndertaking ? 'undertaking' : 'murabaha'}`}>
                {isUndertaking ? (
                  <>
                    <Scale size={14} />
                    <span>Stage 1: Sharia Wa'd Mulzim</span>
                  </>
                ) : (
                  <>
                    <BookOpen size={14} />
                    <span>Stage 2: Murabaha Sale Contract</span>
                  </>
                )}
              </div>

              <span className="contract-ref-pill">
                #{contractData.refCode || 'AMN-DOC'}
              </span>

              {isSigning ? (
                <span className="contract-status-pill status-signing">
                  <div className="contract-spinner" style={{ width: 12, height: 12, borderWidth: 1.5 }} />
                  <span>Signing in progress...</span>
                </span>
              ) : isDeclining ? (
                <span className="contract-status-pill status-declining">
                  <div className="contract-spinner danger" style={{ width: 12, height: 12, borderWidth: 1.5 }} />
                  <span>Cancelling in progress...</span>
                </span>
              ) : isSigned ? (
                <span className="contract-status-pill status-signed">
                  <CheckCircle size={13} />
                  <span>Executed & Sealed</span>
                </span>
              ) : (
                <span className="contract-status-pill status-pending">
                  <Clock size={13} />
                  <span>{canSign ? 'Action Required: Review & Sign' : 'Pending Signature'}</span>
                </span>
              )}
            </div>

            <h2 id="contract-modal-title" className="contract-main-title">
              {contractData.title || (isUndertaking ? "Deed of Undertaking (Wa'd)" : "Murabaha Contract")}
            </h2>
            <p className="contract-subtitle">
              {contractData.subtitle || (isUndertaking ? "Unilateral binding promise prior to wholesale goods acquisition" : "Cost-plus Sharia sale contract with transparent markup")}
            </p>
          </div>

          <button 
            type="button"
            className="contract-modal-close" 
            onClick={onClose}
            disabled={isSigning || isDeclining}
            aria-label="Close document modal"
          >
            <X size={20} />
          </button>
        </div>

        {/* Segmented Navigation Tabs */}
        <div className="contract-modal-tabs">
          <button
            type="button"
            className={`contract-tab ${activeTab === 'summary' ? 'active' : ''}`}
            onClick={() => setActiveTab('summary')}
          >
            <FileText size={15} />
            <span>Key Terms & Financial Schedule</span>
          </button>
          <button
            type="button"
            className={`contract-tab ${activeTab === 'full' ? 'active' : ''}`}
            onClick={() => setActiveTab('full')}
          >
            <BookOpen size={15} />
            <span>Legal Text ({contractData.clauses?.length || 0} Clauses)</span>
          </button>
        </div>

        {/* Scrollable Body Content */}
        <div className="contract-modal-body custom-scrollbar">
          {/* Corporate Compliance Seal Bar */}
          <div className="contract-corporate-bar">
            <div className="corporate-left">
              <div className="corporate-icon-wrapper">
                <Building2 size={18} />
              </div>
              <div className="corporate-text-stack">
                <div className="corporate-legal-name">
                  <span>{AMANA_CORPORATE_INFO.legalName}</span>
                  <span className="corporate-rc">{AMANA_CORPORATE_INFO.rcNumber}</span>
                </div>
                <div className="corporate-address">
                  <span>📍 {AMANA_CORPORATE_INFO.address}</span>
                  <span className="bullet-sep">•</span>
                  <span>{AMANA_CORPORATE_INFO.jurisdiction}</span>
                </div>
              </div>
            </div>

            <div className="corporate-sharia-badge">
              <ShieldCheck size={15} />
              <span>AAOIFI Sharia Standard No. 8 Aligned</span>
            </div>
          </div>

          {/* TAB 1: SUMMARY VIEW */}
          {activeTab === 'summary' ? (
            <div className="contract-summary-view">
              
              {/* HERO FINANCIAL SPECIFICATION CARD */}
              {isUndertaking ? (
                /* Undertaking Hero Banner */
                <div className="contract-hero-card undertaking-hero">
                  <div className="hero-top-row">
                    <div className="hero-badge">
                      <Scale size={14} />
                      <span>Pre-Purchase Binding Commitment</span>
                    </div>
                    <span className="hero-sharia-tag">Zero Pre-Sale Liability</span>
                  </div>

                  <div className="hero-main-metric">
                    <div className="metric-col">
                      <span className="hero-metric-label">Disclosed Wholesale Acquisition Budget</span>
                      <span className="hero-metric-value">{contractData.summary?.estimatedCost || '₦0.00'}</span>
                    </div>
                    <div className="hero-divider-vert" />
                    <div className="metric-col">
                      <span className="hero-metric-label">Security Deposit (Hamish Jiddiyyah)</span>
                      <span className="hero-metric-pill-success">
                        <Check size={13} strokeWidth={3} />
                        <span>Waived (₦0.00 Required)</span>
                      </span>
                    </div>
                  </div>

                  <div className="hero-subtext-bar">
                    <Sparkles size={14} />
                    <span>Free withdrawal without penalty prior to vendor funding approval (Clause 4.1).</span>
                  </div>
                </div>
              ) : (
                /* Murabaha Hero Equation Banner */
                <div className="contract-hero-card murabaha-hero">
                  <div className="hero-top-row">
                    <div className="hero-badge">
                      <ShieldCheck size={14} />
                      <span>Transparent Cost-Plus (Murabaha) Structure</span>
                    </div>
                    <span className="hero-sharia-tag">100% Fixed • Zero Compounding Riba</span>
                  </div>

                  {/* Financial Equation Bar */}
                  <div className="murabaha-equation-grid">
                    <div className="equation-block">
                      <span className="eq-label">Disclosed Cost Price</span>
                      <span className="eq-val">{contractData.schedule?.actualCost || '₦0.00'}</span>
                      <span className="eq-caption">Vendor Acquisition Cost</span>
                    </div>

                    <div className="equation-operator">
                      <Plus size={18} strokeWidth={3} />
                    </div>

                    <div className="equation-block highlight-margin">
                      <span className="eq-label">Agreed Profit Margin</span>
                      <span className="eq-val text-brand">{contractData.schedule?.profitMargin || '₦0.00'}</span>
                      <span className="eq-caption">Fixed Commercial Markup</span>
                    </div>

                    <div className="equation-operator">
                      <Equal size={18} strokeWidth={3} />
                    </div>

                    <div className="equation-block highlight-total">
                      <span className="eq-label">Total Sale Price</span>
                      <span className="eq-val text-total">{contractData.schedule?.totalPrice || '₦0.00'}</span>
                      <span className="eq-caption">Repayable Over {contractData.schedule?.repaymentTerm || '14 Days'}</span>
                    </div>
                  </div>
                </div>
              )}

              {/* SPECIFICATION GRID */}
              <div className="contract-specs-section">
                <div className="section-card-header">
                  <FileCheck2 size={16} className="text-accent" />
                  <h3>Transaction Schedule & Operational Specifications</h3>
                </div>

                {isUndertaking ? (
                  <div className="specs-grid">
                    <div className="spec-card">
                      <span className="spec-key">Goods / Commodity Description</span>
                      <span className="spec-val font-semibold">{contractData.summary?.goods || 'Wholesale Goods'}</span>
                    </div>

                    <div className="spec-card">
                      <span className="spec-key">Assigned Market Purchasing Agent</span>
                      <span className="spec-val">{contractData.summary?.agent || 'Amana Appointed Agent'}</span>
                    </div>

                    <div className="spec-card full-span">
                      <span className="spec-key">Trader Withdrawal Rights</span>
                      <span className="spec-val text-success font-medium">
                        {contractData.summary?.withdrawalRight || 'Free withdrawal without liability prior to purchase approval (Clause 4.1)'}
                      </span>
                    </div>

                    <div className="spec-card full-span">
                      <span className="spec-key">Sharia Nature of Commitment</span>
                      <span className="spec-val text-secondary">
                        {contractData.summary?.natureOfCommitment || "Wa'd Mulzim (Unilateral binding promise to enter Murabaha once Amana acquires possession)"}
                      </span>
                    </div>
                  </div>
                ) : (
                  <div className="specs-grid">
                    <div className="spec-card full-span">
                      <span className="spec-key">Purchased Goods Specification</span>
                      <span className="spec-val font-semibold">{contractData.schedule?.goods || 'Wholesale Inventory'}</span>
                    </div>

                    <div className="spec-card">
                      <span className="spec-key">Repayment Term & Schedule</span>
                      <span className="spec-val font-semibold">{contractData.schedule?.repaymentTerm || '14 Days'}</span>
                    </div>

                    <div className="spec-card">
                      <span className="spec-key">Repayment Due Maturity Date</span>
                      <span className="spec-val text-danger font-semibold">
                        📅 {contractData.schedule?.repaymentDate || 'Upon invoice maturity'}
                      </span>
                    </div>

                    {contractData.schedule?.agent && (
                      <div className="spec-card full-span">
                        <span className="spec-key">Purchasing Agent & Sourcing Market</span>
                        <span className="spec-val text-secondary">{contractData.schedule.agent}</span>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* SHARIA GOVERNANCE & PROTECTIONS CARD */}
              <div className={`sharia-framework-card ${isUndertaking ? 'theme-amber' : 'theme-emerald'}`}>
                <div className="framework-header">
                  <div className="framework-icon-box">
                    {isUndertaking ? <Scale size={18} /> : <ShieldCheck size={18} />}
                  </div>
                  <div>
                    <h4>{isUndertaking ? "Sharia Wa'd Governance & Protections" : "Sharia Murabaha Sale Safeguards"}</h4>
                    <span className="framework-sub">Governed in strict compliance with Islamic jurisprudence</span>
                  </div>
                </div>

                <div className="framework-points">
                  {isUndertaking ? (
                    <>
                      <div className="framework-point">
                        <span className="point-number">1</span>
                        <div className="point-body">
                          <strong>Unilateral Promise (Wa'd Mulzim) — Not a Sale:</strong>
                          <p>This Deed constitutes a binding promise to purchase goods once Amana acquires physical possession. No ownership transfers at this stage (Clause 3.3).</p>
                        </div>
                      </div>
                      <div className="framework-point">
                        <span className="point-number">2</span>
                        <div className="point-body">
                          <strong>Zero-Penalty Trader Withdrawal:</strong>
                          <p>You retain the absolute right to withdraw without any penalty or liability prior to Amana approving and funding the market acquisition (Clause 4.1).</p>
                        </div>
                      </div>
                      <div className="framework-point">
                        <span className="point-number">3</span>
                        <div className="point-body">
                          <strong>Mandatory Pre-Murabaha Possession:</strong>
                          <p>The definitive Murabaha Sale Contract is only executed AFTER Amana physically acquires and holds the goods (Clause 9.2).</p>
                        </div>
                      </div>
                    </>
                  ) : (
                    <>
                      <div className="framework-point">
                        <span className="point-number">1</span>
                        <div className="point-body">
                          <strong>Prior Physical Possession (Qabd) Fulfilled:</strong>
                          <p>Amana, via its authorized market agent, purchased and took possession of the stock prior to concluding this contract with you (Clause 3.1).</p>
                        </div>
                      </div>
                      <div className="framework-point">
                        <span className="point-number">2</span>
                        <div className="point-body">
                          <strong>100% Disclosed Cost & Fixed Margin:</strong>
                          <p>Zero compounding interest, zero late payment penalties, and zero Riba. Cost price and profit margin are explicitly declared and fixed.</p>
                        </div>
                      </div>
                      <div className="framework-point">
                        <span className="point-number">3</span>
                        <div className="point-body">
                          <strong>Physical Inspection & Handover (Qabd):</strong>
                          <p>Ownership and risk pass to you upon physical inspection and authenticated OTP delivery receipt confirmation (Clauses 5 & 6.2).</p>
                        </div>
                      </div>
                    </>
                  )}
                </div>
              </div>
            </div>
          ) : (
            /* TAB 2: FULL LEGAL TEXT */
            <div className="contract-clauses-view">
              <div className="clauses-header-banner">
                <BookOpen size={16} />
                <span>Complete text of agreement pursuant to Nigerian Commercial Law and the Arbitration & Mediation Act 2023.</span>
              </div>

              <div className="clauses-accordion-stack">
                {contractData.clauses?.map((clause, idx) => (
                  <div key={idx} className="contract-clause-card">
                    <div className="clause-header">
                      <span className="clause-num">{clause.number}.0</span>
                      <h4 className="clause-title">{clause.title}</h4>
                    </div>
                    <div className="clause-content">
                      {clause.subclauses?.map((sub, sIdx) => (
                        <p key={sIdx} className="clause-paragraph">{sub}</p>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Execution & Digital Seal Section */}
          <div className="contract-execution-section">
            {isSigned ? (
              <div className="execution-seal-certificate signed">
                <div className="seal-cert-left">
                  <div className="seal-cert-icon">
                    <CheckCircle size={28} />
                  </div>
                  <div className="seal-cert-details">
                    <div className="seal-cert-badge">
                      <Award size={13} />
                      <span>Legally Enforceable Digital Execution</span>
                    </div>
                    <h4>Electronic Acceptance Formally Recorded</h4>
                    <p className="seal-cert-meta">
                      Authenticated electronic acceptance under the Nigerian Arbitration and Mediation Act 2023.
                    </p>
                    <div className="seal-cert-timestamp">
                      <span>📅 Executed: <strong>{contractData.dateStr}</strong></span>
                      <span className="bullet-sep">•</span>
                      <span>Ref: <strong className="font-mono">{contractData.refCode}</strong></span>
                    </div>
                  </div>
                </div>

                <div className="seal-cert-stamp">
                  <ShieldCheck size={22} />
                  <span>SEALED</span>
                </div>
              </div>
            ) : null}

            {(contractData.isReceived || contractData.receivedAt || contractData.receivedDateStr) && (
              <div className="execution-seal-certificate delivery-seal">
                <div className="seal-cert-left">
                  <div className="seal-cert-icon delivery">
                    <PackageCheck size={28} />
                  </div>
                  <div className="seal-cert-details">
                    <div className="seal-cert-badge delivery">
                      <Check size={13} strokeWidth={3} />
                      <span>Physical Possession (Qabd) Confirmed</span>
                    </div>
                    <h4>Goods Delivered, Inspected & Received</h4>
                    <p className="seal-cert-meta">
                      Physical inspection verified by trader and receipt confirmed via authenticated platform OTP.
                    </p>
                    <div className="seal-cert-timestamp">
                      <span>📦 Verified: <strong>{contractData.receivedDateStr || (contractData.receivedAt ? new Date(contractData.receivedAt).toLocaleString() : 'Verified')}</strong></span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Redesigned Bulletproof Acceptance Card */}
            {!isSigned && canSign && (
              <div 
                className={`signature-interactive-card ${agreed ? 'is-checked' : ''} ${isUndertaking ? 'theme-undertaking' : 'theme-murabaha'}`}
                onClick={toggleAgreement}
                role="checkbox"
                aria-checked={agreed}
                tabIndex={0}
                onKeyDown={(e) => {
                  if (e.key === ' ' || e.key === 'Enter') {
                    e.preventDefault();
                    toggleAgreement();
                  }
                }}
              >
                <div className="sig-check-box-col">
                  <div className={`sig-custom-checkbox ${agreed ? 'checked' : ''}`}>
                    {agreed && <Check size={16} strokeWidth={3} className="sig-check-icon" />}
                  </div>
                </div>
                
                <div className="sig-details-col">
                  <div className="sig-header-row">
                    <span className="sig-main-declaration">
                      I hereby accept and electronically execute this {isUndertaking ? "Deed of Undertaking (Wa'd)" : "Murabaha Sale Contract"}.
                    </span>
                    {agreed ? (
                      <span className="sig-state-badge accepted">
                        <CheckCircle size={13} />
                        <span>Accepted</span>
                      </span>
                    ) : (
                      <span className="sig-state-badge pending">
                        Click to Accept
                      </span>
                    )}
                  </div>

                  <p className="sig-legal-notice">
                    By checking this box, I confirm that I am authorized to bind this business. Authenticated electronic acceptance constitutes an enforceable signature under the Nigerian Arbitration and Mediation Act 2023 and Islamic Commercial Law.
                  </p>

                  {isSigning ? (
                    <div className="sig-signing-progress-banner">
                      <div className="contract-spinner" />
                      <span>Recording cryptographic legal signature into transaction record...</span>
                    </div>
                  ) : isDeclining ? (
                    <div className="sig-signing-progress-banner declining">
                      <div className="contract-spinner danger" />
                      <span>Submitting cancellation to system...</span>
                    </div>
                  ) : agreed ? (
                    <div className="sig-confirmation-banner">
                      <ShieldCheck size={15} />
                      <span>Declaration accepted. Click below to conclude this contract.</span>
                    </div>
                  ) : null}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Modal Sticky Footer */}
        <div className="contract-modal-footer">
          <div className="footer-security-note">
            <Lock size={14} />
            <span>256-Bit Encrypted Platform Audit Trail</span>
          </div>

          <div className="footer-actions-cluster">
            {onDecline && !isSigned && canSign && (
              <button 
                type="button"
                className="btn-contract-danger" 
                onClick={handleDeclineClick}
                disabled={isSigning || isDeclining}
                title="Decline or cancel this purchase request"
              >
                {isDeclining ? (
                  <>
                    <div className="contract-spinner danger" />
                    <span>{declineButtonText ? `${declineButtonText}...` : (isUndertaking ? 'Cancelling Request...' : 'Declining Offer...')}</span>
                  </>
                ) : (
                  <>
                    <XCircle size={16} />
                    <span>{declineButtonText || (isUndertaking ? 'Cancel Request' : 'Decline Offer')}</span>
                  </>
                )}
              </button>
            )}

            <button 
              type="button"
              className="btn-contract-secondary" 
              onClick={onClose}
              disabled={isSigning || isDeclining}
            >
              {isSigned ? 'Close Document' : 'Keep & Close'}
            </button>

            {!isSigned && canSign && (
              <button
                type="button"
                className={`btn-contract-primary ${isUndertaking ? 'theme-undertaking' : 'theme-murabaha'} ${!agreed ? 'is-pending-acceptance' : ''}`}
                disabled={isSigning || isDeclining || !agreed}
                onClick={handleSignClick}
                title={!agreed ? 'Please check the acceptance box above before signing' : ''}
              >
                {isSigning ? (
                  <>
                    <div className="contract-spinner" />
                    <span>
                      {isUndertaking ? "Executing Undertaking (Wa'd)..." : "Concluding Murabaha Contract..."}
                    </span>
                  </>
                ) : (
                  <>
                    <ShieldCheck size={18} />
                    <span>{agreed ? signButtonText : `Check box above to sign`}</span>
                  </>
                )}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );

  return typeof document !== 'undefined' ? createPortal(modalNode, document.body) : modalNode;
};

export default ContractModal;
