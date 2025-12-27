import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import { TrendingUp, TrendingDown, DollarSign, Wallet, ArrowUpRight, ArrowDownRight, Download, RefreshCw, Activity, AlertTriangle } from 'lucide-react';

const AdminAnalytics = () => {
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchStats = async () => {
            try {
                const { data } = await api.get('/admin/financials');
                setStats(data);
            } catch (error) {
                console.error('Failed to fetch financials', error);
            } finally {
                setLoading(false);
            }
        };
        fetchStats();
    }, []);

    if (loading) return <div className="text-center p-xl text-muted">Calculating financial data...</div>;
    if (!stats) return <div className="text-center p-xl text-danger">Failed to load financial data. Please try refreshing.</div>;

    return (
        <div className="fade-in">
            <div className="page-header">
                <div>
                    <h1 className="page-title">Financial Intelligence</h1>
                    <p className="page-subtitle">Real-time breakdown of Amana's cash flow</p>
                </div>
                <button className="btn btn-primary">
                    <Download size={18} />
                    Export Report
                </button>
            </div>

            {/* Core Metrics */}
            <div className="metrics-grid">
                <MetricCard 
                    label="Total Volume" 
                    amount={stats.volume} 
                    sub="Gross Transaction Value"
                    icon={<TrendingUp className="text-primary" size={24} />}
                    tooltip="The total sum of all orders processed through the platform, including Principal + Markup."
                />
                <MetricCard 
                    label="Money Out (Principal)" 
                    amount={stats.principal} 
                    sub="Disbursed to Vendors"
                    icon={<ArrowUpRight style={{ color: '#f59e0b' }} size={24} />}
                    tooltip="The total actual capital sent to Vendors. This is the company's financial exposure."
                />
                 <MetricCard 
                    label="Manual Adjustments" 
                    amount={stats.manualAdjustments} 
                    sub="Admin Ledger Entries"
                    icon={<AlertTriangle style={{ color: '#fca5a5' }} size={24} />}
                    tooltip="Net value of manual credits/debits applied to wallets by Admins. Explains discrepancies between Orders and Payouts."
                />
                <MetricCard 
                    label="Net Revenue" 
                    amount={stats.profit} 
                    sub="Total Markup Earned"
                    icon={<DollarSign className="text-success" size={24} />}
                    isHighlight
                    tooltip="The total markup fees (Profit) generated from all completed transactions."
                />
                <MetricCard 
                    label="Outstanding Debt" 
                    amount={stats.activeDebt} 
                    sub="Pending Repayments"
                    icon={<Wallet style={{ color: '#a855f7' }} size={24} />}
                    tooltip="The total amount currently owed by Retailers. This includes both Principal and Markup."
                />
                <MetricCard 
                    label="Credit Capacity" 
                    amount={stats.totalCreditLimit} 
                    sub="Total Approved Limits"
                    icon={<Activity style={{ color: '#3b82f6' }} size={24} />}
                    tooltip="The sum of all credit limits assigned to verified Retailers. This is the max potential exposure."
                />
                <MetricCard 
                    label="Total Credit Spent" 
                    amount={stats.totalUsedCredit} 
                    sub="Currently In Use"
                    icon={<TrendingUp style={{ color: '#fba5a5' }} size={24} />}
                    tooltip="The total amount of credit retailers have currently drawn against their limits."
                />
                <MetricCard 
                    label="Available Liquidity" 
                    amount={stats.availableCredit} 
                    sub="Unused Credit Lines"
                    icon={<ArrowDownRight style={{ color: '#10b981' }} size={24} />}
                    tooltip="How much more credit is currently available for retailers to use for new orders."
                />
                 <MetricCard 
                    label="Total Payouts" 
                    amount={stats.totalPayouts} 
                    sub="Withdrawn by Vendors"
                    icon={<RefreshCw style={{ color: '#06b6d4' }} size={24} />}
                    tooltip="Total actual cash that has been transferred out of the system to Vendors' bank accounts."
                />
                <MetricCard 
                    label="Vendor Liabilities" 
                    amount={stats.pendingPayouts} 
                    sub="Held in Vendor Wallets"
                    icon={<Activity style={{ color: '#f43f5e' }} size={24} />}
                    tooltip="Money currently held in Vendor wallets that they have earned but not yet requested to withdraw."
                />
            </div>

            {/* Analysis Grid */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))', gap: '1.5rem' }}>
                 <div className="glass-panel p-lg">
                    <h3 style={{ marginBottom: '1rem' }}>Profit & Loss Overview</h3>
                    <div style={{ height: '200px', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--color-bg-soft)', borderRadius: '12px', border: '1px dashed var(--color-border)' }}>
                        <span className="text-muted">Revenue vs Principal Chart Component</span>
                    </div>
                 </div>

                 <div className="glass-panel p-lg">
                    <h3 style={{ marginBottom: '1rem' }}>Liabilities Breakdown</h3>
                     <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                        <div className="flex justify-between items-center p-md rounded" style={{ background: 'rgba(239, 68, 68, 0.1)' }}>
                            <div>
                                <p style={{ fontWeight: 600, color: '#ef4444' }}>Overdue Debt</p>
                                <p className="text-muted" style={{ fontSize: '0.8rem' }}>Orders past due date</p>
                            </div>
                            <span style={{ fontSize: '1.25rem', fontWeight: 700, color: '#ef4444' }}>
                                {new Intl.NumberFormat('en-NG', { style: 'currency', currency: 'NGN' }).format(stats.overdueDebt)}
                            </span>
                        </div>
                        <div className="flex justify-between items-center p-md rounded" style={{ background: 'rgba(245, 158, 11, 0.1)' }}>
                            <div>
                                <p style={{ fontWeight: 600, color: '#f59e0b' }}>Pending Vendor Payouts</p>
                                <p className="text-muted" style={{ fontSize: '0.8rem' }}>Withdrawal requests</p>
                            </div>
                            <span style={{ fontSize: '1.25rem', fontWeight: 700, color: '#f59e0b' }}>
                                {new Intl.NumberFormat('en-NG', { style: 'currency', currency: 'NGN' }).format(stats.pendingPayouts)}
                            </span>
                        </div>
                     </div>
                 </div>
            </div>
        </div>
    );
};

const MetricCard = ({ label, amount, sub, icon, isHighlight, tooltip }) => {
    const formattedAmount = new Intl.NumberFormat('en-NG', { style: 'currency', currency: 'NGN' }).format(amount || 0);
    
    return (
        <div className="glass-panel metric-card" style={isHighlight ? { borderColor: 'var(--color-primary)', boxShadow: '0 0 20px var(--color-primary-glow)' } : {}}>
            <div className="metric-header">
                <div className="icon-box">
                    {icon}
                </div>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', marginBottom: '0.25rem' }}>
                <p className="text-muted" style={{ fontSize: '0.9rem' }}>{label}</p>
                {tooltip && <Tooltip text={tooltip} />}
            </div>
            <h3 className="metric-value">{formattedAmount}</h3>
            <p className="metric-sub">{sub}</p>
        </div>
    );
};

const Tooltip = ({ text }) => (
    <div className="tooltip-container">
        <span className="tooltip-icon">!</span>
        <div className="tooltip-text">{text}</div>
    </div>
);

export default AdminAnalytics;
