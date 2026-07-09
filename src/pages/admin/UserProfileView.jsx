import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../../services/api';
import { User, Phone, Mail, MapPin, Shield, CreditCard, FileText, Activity, AlertTriangle, Save, ArrowLeft } from 'lucide-react';
// Import dedicated styles
import './AdminConsole.css';

const UserProfileView = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [profile, setProfile] = useState(null);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('overview');

    // Action States
    const [statusLoading, setStatusLoading] = useState(false);
    const [scoreInput, setScoreInput] = useState('');
    const [overrideReason, setOverrideReason] = useState('');
    const [updatingScore, setUpdatingScore] = useState(false);
    const [updatingAgent, setUpdatingAgent] = useState(false);

    useEffect(() => {
        fetchProfile();
    }, [id]);

    const fetchProfile = async () => {
        try {
            const { data } = await api.get(`/admin/user/${id}/full`);
            setProfile(data);
        } catch (error) {
            alert('Failed to load user profile');
            navigate('/admin/users');
        } finally {
            setLoading(false);
        }
    };

    const toggleStatus = async () => {
        if (!window.confirm(`Are you sure you want to ${profile.user.isActive ? 'BAN' : 'ACTIVATE'} this user?`)) return;
        
        setStatusLoading(true);
        try {
            const { data } = await api.put(`/admin/user/${id}/status`, { 
                isActive: !profile.user.isActive,
                note: `Manual status change by Admin`
            });
            setProfile({ ...profile, user: { ...profile.user, isActive: data.isActive } });
        } catch (error) {
            alert('Failed to update status');
        } finally {
            setStatusLoading(false);
        }
    };

    const handleToggleAgent = async () => {
        if (!window.confirm(`Are you sure you want to toggle Agent status for this user?`)) return;

        setUpdatingAgent(true);
        try {
            const { data } = await api.put(`/admin/retailer/${id}/agent`);
            setProfile(prev => ({
                ...prev,
                user: { ...prev.user, isAgent: data.isAgent }
            }));
            alert(data.message);
        } catch (error) {
            alert(error.response?.data?.message || 'Failed to update agent status');
        } finally {
            setUpdatingAgent(false);
        }
    };

    const handleOverrideScore = async (e) => {
        e.preventDefault();
        if (!scoreInput) return alert('Please enter a new score');
        if (!overrideReason) return alert('Please provide a reason for the override');

        setUpdatingScore(true);
        try {
            const { data } = await api.put(`/admin/retailer/${id}/score`, {
                score: Number(scoreInput),
                reason: overrideReason
            });
            setProfile(prev => ({
                ...prev,
                user: { 
                    ...prev.user, 
                    amanaScore: data.user.amanaScore,
                    creditLimit: data.user.creditLimit,
                    tier: data.user.tier
                }
            }));
            alert(data.message);
            setScoreInput('');
            setOverrideReason('');
        } catch (error) {
            alert(error.response?.data?.message || 'Failed to override score');
        } finally {
            setUpdatingScore(false);
        }
    };

    if (loading) return <div className="text-center p-xl text-muted">Loading User Profile...</div>;
    if (!profile) return null;

    const { user, orders, notes, stats } = profile;

    return (
        <div className="fade-in">
            <button onClick={() => navigate(-1)} className="btn btn-ghost" style={{ marginBottom: '1.5rem' }}>
                <ArrowLeft size={16} /> Back to List
            </button>

            {/* Header Card */}
            <div className="glass-panel profile-header" style={{ borderColor: user.isActive ? '#10b981' : '#ef4444' }}>
                <div className="profile-container">
                    <div className="profile-identity">
                        <div className="profile-avatar">
                            {user.name?.charAt(0)}
                        </div>
                        <div>
                            <h1 className="profile-name">{user.name}</h1>
                            <div className="profile-meta">
                                <span className="meta-item"><Mail size={14} /> {user.email}</span>
                                <span className="meta-item"><Phone size={14} /> {user.phone}</span>
                                <span className="meta-item">
                                    <Shield size={14} /> Amana Score: <b style={{ color: 'var(--color-text)' }}>{user.amanaScore || 0}</b>
                                </span>
                            </div>
                            <div className="profile-badges">
                                <span className={`badge ${user.isActive ? 'badge-success' : 'badge-danger'}`}>
                                    {user.isActive ? 'Active Account' : 'BANNED'}
                                </span>
                                <span className="badge badge-neutral">{user.role?.toUpperCase()}</span>
                                {user.isAgent && <span className="badge badge-warning">AGENT</span>}
                            </div>
                        </div>
                    </div>

                    <div className="profile-actions">
                         <button 
                            onClick={toggleStatus}
                            disabled={statusLoading}
                            className={`btn ${user.isActive ? 'btn-danger' : 'btn-primary'}`}
                        >
                            <AlertTriangle size={16} />
                            {user.isActive ? 'Ban User' : 'Activate User'}
                        </button>
                    </div>
                </div>
            </div>

            {/* Navigation Tabs */}
            <div className="tab-nav">
                {['overview', 'orders', 'financials', 'logs'].map(tab => (
                    <button 
                        key={tab}
                        onClick={() => setActiveTab(tab)}
                        className={`tab-btn ${activeTab === tab ? 'active' : ''}`}
                    >
                        {tab}
                    </button>
                ))}
            </div>

            {/* Tab Content */}
            <div className="tab-content">
                
                {/* OVERVIEW */}
                {activeTab === 'overview' && (
                    <div className="info-grid">
                        <div className="glass-panel p-lg">
                            <h3 className="section-title mb-4"><CreditCard size={18} style={{ display: 'inline', marginRight: '8px' }} /> Financial Snapshot</h3>
                            <div className="space-y-4">
                                <div className="info-card-row">
                                    <span className="info-label">Wallet Balance</span>
                                    <span className="info-value">₦{user.walletBalance?.toLocaleString()}</span>
                                </div>
                                <div className="info-card-row">
                                    <span className="info-label">Credit Limit</span>
                                    <span className="info-value highlight">₦{user.creditLimit?.toLocaleString()}</span>
                                </div>
                                <div className="info-card-row">
                                    <span className="info-label">Used Credit</span>
                                    <span className="info-value warning">₦{user.usedCredit?.toLocaleString()}</span>
                                </div>
                                <div className="info-card-row">
                                    <span className="info-label">Total Spent (Lifetime)</span>
                                    <span className="info-value">₦{stats.totalSpent?.toLocaleString()}</span>
                                </div>
                            </div>
                        </div>

                        <div className="glass-panel p-lg">
                            <h3 className="section-title mb-4"><FileText size={18} style={{ display: 'inline', marginRight: '8px' }} /> Business Info</h3>
                             <div className="space-y-4">
                                {user.businessInfo ? (
                                    <>
                                        <div className="info-card-row">
                                            <span className="info-label">Business Name</span>
                                            <span className="info-value" style={{ fontSize: '1rem' }}>{user.businessInfo.businessName}</span>
                                        </div>
                                        <div className="info-card-row">
                                            <span className="info-label">Address</span>
                                            <span className="info-value" style={{ fontSize: '1rem' }}>{user.businessInfo.address}</span>
                                        </div>
                                        <div className="info-card-row">
                                            <span className="info-label">CAC Number</span>
                                            <span className="info-value" style={{ fontSize: '1rem' }}>{user.businessInfo.cacNumber}</span>
                                        </div>
                                    </>
                                ) : (
                                    <div className="text-muted italic">No business info provided.</div>
                                )}
                            </div>
                        </div>

                        {/* Admin Tools Panel */}
                        <div className="glass-panel p-lg" style={{ gridColumn: 'span 2' }}>
                            <h3 className="section-title mb-4">⚙️ Admin Controls & Overrides</h3>
                            <div className="ops-grid">
                                {/* Score Override Form */}
                                <form onSubmit={handleOverrideScore} style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                                    <h4 style={{ margin: 0, fontSize: '1rem', color: 'var(--color-primary)' }}>Override Trust Score & Credit Limit</h4>
                                    <p className="text-muted" style={{ fontSize: '0.85rem', margin: 0 }}>
                                        Setting a custom score will automatically recalculate the retailer's credit limit and tier (Linear multiplier of 600, capped at 180k).
                                    </p>
                                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                                        <input 
                                            type="number" 
                                            placeholder={`New Score (Current: ${user.amanaScore || 0})`}
                                            value={scoreInput}
                                            onChange={e => setScoreInput(e.target.value)}
                                            min="0"
                                            max="300"
                                            className="form-input"
                                            style={{ flex: 1, padding: '0.5rem', borderRadius: '6px', background: '#222', border: '1px solid #444', color: 'white' }}
                                        />
                                    </div>
                                    <input 
                                        type="text" 
                                        placeholder="Reason for audit trail (required)..."
                                        value={overrideReason}
                                        onChange={e => setOverrideReason(e.target.value)}
                                        className="form-input"
                                        style={{ padding: '0.5rem', borderRadius: '6px', background: '#222', border: '1px solid #444', color: 'white' }}
                                    />
                                    <button 
                                        type="submit" 
                                        className="btn btn-primary" 
                                        disabled={updatingScore}
                                        style={{ marginTop: '0.25rem' }}
                                    >
                                        {updatingScore ? 'Updating...' : 'Apply Score Override'}
                                    </button>
                                </form>

                                {/* Toggle Options & Quick Status Adjustments */}
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                                    <h4 style={{ margin: 0, fontSize: '1rem', color: 'var(--color-primary)' }}>System Role Management</h4>
                                    <p className="text-muted" style={{ fontSize: '0.85rem', margin: 0 }}>
                                        Manage role permissions and status flags for this retailer. Action changes are logged in the system audit logs.
                                    </p>
                                    
                                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0.75rem', background: 'rgba(255,255,255,0.02)', borderRadius: '8px', border: '1px solid var(--color-border)' }}>
                                        <div>
                                            <div style={{ fontWeight: 600 }}>Agent Status</div>
                                            <div className="text-muted" style={{ fontSize: '0.8rem' }}>
                                                {user.isAgent ? 'User is an Agent (can disburse AAPs)' : 'User is a standard Retailer'}
                                            </div>
                                        </div>
                                        <button 
                                            type="button"
                                            onClick={handleToggleAgent} 
                                            className={`btn ${user.isAgent ? 'btn-danger' : 'btn-primary'}`}
                                            disabled={updatingAgent}
                                            style={{ padding: '0.5rem 1rem', fontSize: '0.85rem' }}
                                        >
                                            {user.isAgent ? 'Revoke Agent' : 'Make Agent'}
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* ORDERS */}
                {activeTab === 'orders' && (
                    <div className="glass-panel table-container">
                        <div className="table-wrapper">
                            <table className="data-table">
                                <thead>
                                    <tr>
                                        <th>Ref</th>
                                        <th>Date</th>
                                        <th>Vendor</th>
                                        <th>Amount</th>
                                        <th>Status</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {orders.map(order => (
                                        <tr key={order._id}>
                                            <td style={{ fontFamily: 'monospace' }}>{order._id.substring(0,8)}...</td>
                                            <td>{new Date(order.createdAt).toLocaleDateString()}</td>
                                            <td>{order.vendor ? order.vendor._id?.substring(0,8) : 'N/A'}</td>
                                            <td>₦{order.totalRepaymentAmount.toLocaleString()}</td>
                                            <td><span className="badge badge-neutral">{order.status}</span></td>
                                        </tr>
                                    ))}
                                    {orders.length === 0 && <tr><td colSpan="5" className="text-center p-xl text-muted">No orders found.</td></tr>}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}

                {/* LOGS / NOTES */}
                {activeTab === 'logs' && (
                    <div className="glass-panel p-lg">
                        <h3 className="section-title mb-4">Admin Notes & Logs</h3>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                            {notes.map((note, idx) => (
                                <div key={idx} className="log-item">
                                    <p className="log-content">{note.content}</p>
                                    <div className="log-date">
                                        Recorded on {new Date(note.createdAt).toLocaleString()} 
                                        {note.adminId && <span> by Admin</span>}
                                    </div>
                                </div>
                            ))}
                            {notes.length === 0 && <p className="text-muted">No admin notes on file.</p>}
                        </div>
                    </div>
                )}
                
                {activeTab === 'financials' && (
                    <div className="p-xl text-center text-muted" style={{ border: '1px dashed var(--color-border)', borderRadius: 'var(--radius-lg)' }}>
                        Detailed Financial Ledger coming soon (See Database Transactions).
                    </div>
                )}
            </div>
        </div>
    );
};

export default UserProfileView;
