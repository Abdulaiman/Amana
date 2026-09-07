import React from 'react';
import { CreditCard, ShieldCheck, Zap } from 'lucide-react';
import './TraderCreditCard.css';

/**
 * Reusable Luxury Trader Credit Card component for Web
 * Displays trader's available credit limit with premium financial glassmorphism styling,
 * trust score, utilization progress bar, and ceiling/used breakdowns.
 */
const TraderCreditCard = ({
    retailer,
    variant = 'full', // 'full' | 'compact' | 'mini'
    title = 'AVAILABLE CREDIT LIMIT',
    showProgress = true,
    showScore = true,
    className = '',
    style = {}
}) => {
    if (!retailer) return null;

    const limit = Number(retailer.creditLimit) || 0;
    const used = Number(retailer.usedCredit) || 0;
    const reserved = Number(retailer.reservedCredit) || 0;
    const available = retailer.availableCredit !== undefined 
        ? Math.max(0, Number(retailer.availableCredit)) 
        : Math.max(0, limit - used - reserved);
    const score = retailer.amanaScore || null;
    
    // Total exposure percentage (used + reserved)
    const totalCommitted = used + reserved;
    const utilizationPercent = limit > 0 ? Math.min(100, Math.round((totalCommitted / limit) * 100)) : 0;
    
    // Determine tone based on remaining balance & utilization
    let toneClass = 'tone-emerald';
    if (utilizationPercent >= 90) {
        toneClass = 'tone-danger';
    } else if (utilizationPercent >= 75) {
        toneClass = 'tone-warning';
    }

    if (variant === 'mini') {
        return (
            <div className={`trader-credit-card-luxury mini ${toneClass} ${className}`} style={style}>
                <div className="tc-mini-row">
                    <div className="tc-mini-left">
                        <CreditCard size={12} className="tc-icon-mini" />
                        <span className="tc-mini-label">Credit:</span>
                    </div>
                    <strong className="tc-mini-val">₦{available.toLocaleString()}</strong>
                    {showScore && score && (
                        <span className="tc-mini-score">
                            <ShieldCheck size={11} /> {score}
                        </span>
                    )}
                </div>
            </div>
        );
    }

    if (variant === 'compact') {
        return (
            <div className={`trader-credit-card-luxury compact ${toneClass} ${className}`} style={style}>
                <div className="tc-shimmer-accent"></div>
                <div className="tc-header">
                    <div className="tc-chip">
                        <CreditCard size={13} />
                        <span className="tc-chip-title">{title}</span>
                    </div>
                    {showScore && score && (
                        <div className="tc-score-pill">
                            <ShieldCheck size={11} />
                            <span>Score {score}</span>
                        </div>
                    )}
                </div>
                
                <div className="tc-amount-row">
                    <div className="tc-amount-group">
                        <span className="tc-curr">₦</span>
                        <span className="tc-amount">{available.toLocaleString()}</span>
                    </div>
                    <span className="tc-status-badge">Available</span>
                </div>

                <div className="tc-compact-meta">
                    <span>Ceiling: <strong>₦{limit.toLocaleString()}</strong></span>
                    {reserved > 0 ? (
                        <span>Reserved: <strong style={{ color: '#059669' }}>₦{reserved.toLocaleString()}</strong></span>
                    ) : (
                        <span>Used: <strong>₦{used.toLocaleString()}</strong></span>
                    )}
                </div>
            </div>
        );
    }

    // Default: 'full' luxury card
    return (
        <div className={`trader-credit-card-luxury full ${toneClass} ${className}`} style={style}>
            <div className="tc-shimmer-accent"></div>
            
            <div className="tc-header">
                <div className="tc-chip">
                    <div className="tc-chip-icon-box">
                        <CreditCard size={14} />
                    </div>
                    <span className="tc-chip-title">{title}</span>
                </div>
                {showScore && score && (
                    <div className="tc-score-pill">
                        <ShieldCheck size={13} />
                        <span>Amana Trust: <strong>{score}</strong></span>
                    </div>
                )}
            </div>

            <div className="tc-amount-row">
                <div className="tc-amount-group">
                    <span className="tc-curr">₦</span>
                    <span className="tc-amount">{available.toLocaleString()}</span>
                </div>
                <div className="tc-verified-pill">
                    <Zap size={12} /> Active Limit
                </div>
            </div>

            {showProgress && limit > 0 && (
                <div className="tc-progress-section">
                    <div className="tc-progress-bar-bg">
                        <div 
                            className="tc-progress-bar-fill" 
                            style={{ width: `${utilizationPercent}%` }}
                        ></div>
                    </div>
                    <div className="tc-progress-labels">
                        <span className="tc-progress-sub">Approved Ceiling: ₦{limit.toLocaleString()}</span>
                        {reserved > 0 ? (
                            <span className="tc-progress-sub">
                                In-Flight: <strong>₦{reserved.toLocaleString()}</strong> • Debt: ₦{used.toLocaleString()}
                            </span>
                        ) : (
                            <span className="tc-progress-sub">
                                Utilized: ₦{used.toLocaleString()} ({utilizationPercent}%)
                            </span>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};

export default TraderCreditCard;
