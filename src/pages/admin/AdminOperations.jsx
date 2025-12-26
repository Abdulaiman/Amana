import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import { Activity, Shield, Save, RefreshCw, MessageSquare, Send, AlertTriangle, Search, Info } from 'lucide-react';

const AdminOperations = () => {
    const [logs, setLogs] = useState([]);
    const [loading, setLoading] = useState(true);
    
    // Ledger Form
    const [ledgerForm, setLedgerForm] = useState({ email: '', amount: '', type: 'credit', reason: '' });
    const [ledgerLoading, setLedgerLoading] = useState(false);

    useEffect(() => {
        fetchLogs();
    }, []);

    const fetchLogs = async () => {
        try {
            const { data } = await api.get('/admin/audit-logs');
            setLogs(data);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const handleLedgerSubmit = async (e) => {
        e.preventDefault();
        if (!ledgerForm.email || !ledgerForm.amount || !ledgerForm.reason) return;
        
        setLedgerLoading(true);
        try {
            const { data } = await api.post('/admin/ledger', ledgerForm);
            alert(`Success! Updated balance for ${data.userName}. New Balance: ₦${data.newBalance}`);
            setLedgerForm({ email: '', amount: '', type: 'credit', reason: '' });
            fetchLogs(); // Refresh logs
        } catch (error) {
            alert(error.response?.data?.message || 'Action failed. Check email and try again.');
        } finally {
            setLedgerLoading(false);
        }
    };

    return (
        <div className="fade-in">
            <div className="ops-grid">
                {/* Main Content (Logs) */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                         <div>
                            <h2 style={{ fontSize: '1.5rem', fontWeight: 700, display: 'flex', alignItems: 'center' }}>
                                <Activity size={24} style={{ marginRight: '10px', color: 'var(--color-primary)' }} />
                                System Activity Feed
                            </h2>
                            <p className="text-muted">Real-time audit trail of all administrative actions.</p>
                        </div>
                        <button onClick={fetchLogs} className="btn-icon text-muted hover:text-white" style={{ background: 'var(--color-bg-soft)', borderRadius: '50%', padding: '0.75rem' }}>
                            <RefreshCw size={20} />
                        </button>
                    </div>
                    
                    <div className="glass-panel" style={{ padding: '1.5rem' }}>
                        {logs.length === 0 ? (
                            <div className="text-center text-muted" style={{ padding: '2rem' }}>No activity recorded yet.</div>
                        ) : (
                            <div className="audit-timeline">
                                {logs.map((log, index) => (
                                    <div key={log._id} className="timeline-item" style={{ 
                                        display: 'flex', 
                                        gap: '1rem', 
                                        paddingBottom: '1.5rem',
                                        position: 'relative',
                                        borderLeft: index !== logs.length - 1 ? '2px solid var(--color-border)' : 'none',
                                        marginLeft: '0.5rem',
                                        paddingLeft: '1.5rem'
                                    }}>
                                        <div style={{ 
                                            position: 'absolute', 
                                            left: '-5px', 
                                            top: '0', 
                                            width: '12px', 
                                            height: '12px', 
                                            borderRadius: '50%', 
                                            background: getColorForAction(log.action),
                                            border: '2px solid var(--color-bg)'
                                        }}></div>
                                        
                                        <div style={{ width: '100%' }}>
                                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.25rem' }}>
                                                <span style={{ fontWeight: 600, color: 'var(--color-text)', fontSize: '0.95rem' }}>
                                                    {formatAction(log.action)}
                                                </span>
                                                <span style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>
                                                    {new Date(log.createdAt).toLocaleString()}
                                                </span>
                                            </div>
                                            <p style={{ fontSize: '0.85rem', color: 'var(--color-text-muted)', marginBottom: '0.5rem', lineHeight: '1.4' }}>
                                                Performed by <span style={{ color: 'var(--color-primary)' }}>{log.admin?.name || 'System'}</span>. 
                                                {log.note && <span style={{ marginLeft: '5px', fontStyle: 'italic' }}>"{log.note}"</span>}
                                            </p>
                                            {/* Details Accordion / Block */}
                                            {log.details && Object.keys(log.details).length > 0 && (
                                                <div style={{ background: 'var(--color-bg-soft)', padding: '0.75rem', borderRadius: '0.5rem', fontSize: '0.8rem', fontFamily: 'monospace' }}>
                                                    {Object.entries(log.details).map(([key, value]) => (
                                                        <div key={key} style={{ display: 'flex', justifyContent: 'space-between' }}>
                                                            <span style={{ color: 'var(--color-text-muted)' }}>{key}:</span>
                                                            <span>{value?.toString()}</span>
                                                        </div>
                                                    ))}
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>

                {/* Side Panel (Tools) */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
                    
                    {/* Manual Ledger - DANGER ZONE */}
                    <div className="glass-panel p-lg danger-zone">
                        <div className="form-section-title" style={{ color: '#ef4444' }}>
                            <Shield size={22} />
                            Manual Ledger Entry
                            <Tooltip text="Directly modifies a user's wallet balance. Bypasses payment gateways. Use only for corrections or manual deposits." />
                        </div>
                        <p className="text-muted" style={{ fontSize: '0.85rem', marginBottom: '1.5rem', borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '1rem' }}>
                            <AlertTriangle size={14} style={{ display: 'inline', marginRight: '4px', verticalAlign: 'middle' }} />
                            <b>Warning:</b> This action creates a permanent financial record. Ensure you have authorization.
                        </p>
                        
                        <form onSubmit={handleLedgerSubmit} className="space-y-4">
                            <div className="form-group">
                                <label className="form-label">
                                    User Email Address
                                    <Tooltip text="The exact email address used by the retailer or vendor." />
                                </label>
                                <div style={{ position: 'relative' }}>
                                    <Search size={16} style={{ position: 'absolute', top: '12px', left: '12px', color: '#6b7280' }} />
                                    <input 
                                        type="email" 
                                        className="form-control"
                                        style={{ paddingLeft: '2.5rem' }}
                                        placeholder="customer@example.com"
                                        value={ledgerForm.email}
                                        onChange={e => setLedgerForm({...ledgerForm, email: e.target.value})}
                                        required
                                    />
                                </div>
                            </div>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                                <div className="form-group">
                                    <label className="form-label">Adjustment Type</label>
                                    <select 
                                        className="form-control"
                                        value={ledgerForm.type}
                                        onChange={e => setLedgerForm({...ledgerForm, type: e.target.value})}
                                    >
                                        <option value="credit">Credit (Deposit +)</option>
                                        <option value="debit">Debit (Charge -)</option>
                                    </select>
                                </div>
                                <div className="form-group">
                                    <label className="form-label">Amount (₦)</label>
                                    <input 
                                        type="number" 
                                        className="form-control"
                                        placeholder="0.00"
                                        min="0"
                                        value={ledgerForm.amount}
                                        onChange={e => setLedgerForm({...ledgerForm, amount: e.target.value})}
                                        required
                                    />
                                </div>
                            </div>
                            <div className="form-group">
                                <label className="form-label">
                                    Audit Reason
                                    <Tooltip text="This note will appear in the system logs and cannot be edited later." />
                                </label>
                                <textarea 
                                    className="form-control"
                                    style={{ height: '80px', resize: 'none' }}
                                    placeholder="Reference ID, authorized by, or reason for correction..."
                                    value={ledgerForm.reason}
                                    onChange={e => setLedgerForm({...ledgerForm, reason: e.target.value})}
                                    required
                                ></textarea>
                            </div>
                            <button 
                                type="submit" 
                                disabled={ledgerLoading}
                                className="btn btn-primary"
                                style={{ 
                                    width: '100%', 
                                    justifyContent: 'center', 
                                    background: ledgerLoading ? '#374151' : '#ef4444', 
                                    borderColor: '#ef4444',
                                    fontWeight: 700
                                }}
                            >
                                {ledgerLoading ? 'Processing Transaction...' : <><Save size={18} /> Execute Adjustment</>}
                            </button>
                        </form>
                    </div>

                    {/* Broadcast System */}
                    <div className="glass-panel p-lg" style={{ borderTop: '4px solid #3b82f6' }}>
                        <div className="form-section-title" style={{ color: '#3b82f6' }}>
                            <MessageSquare size={22} />
                            Broadcast Center
                             <Tooltip text="Sends a mass email to all users in the selected group via the configured SMTP server." />
                        </div>
                        <p className="text-muted" style={{ fontSize: '0.85rem', marginBottom: '1.5rem' }}>
                            Send system-wide announcements or targeted updates.
                        </p>
                        
                        <BroadcastForm />
                    </div>
                </div>
            </div>
        </div>
    );
};

const BroadcastForm = () => {
    const [form, setForm] = useState({ subject: '', message: '', target: 'all' });
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!form.subject || !form.message) return;

        setLoading(true);
        try {
            await api.post('/admin/broadcast', form);
            alert('Broadcast sent successfully!');
            setForm({ subject: '', message: '', target: 'all' });
        } catch (error) {
            alert('Failed to send broadcast');
        } finally {
            setLoading(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
             <div className="form-group">
                <label className="form-label">Target Audience</label>
                <select 
                    className="form-control"
                    value={form.target}
                    onChange={e => setForm({...form, target: e.target.value})}
                >
                    <option value="all">Everyone (Retailers & Vendors)</option>
                    <option value="retailers">Retailers Only</option>
                    <option value="vendors">Vendors Only</option>
                </select>
            </div>
            <div className="form-group">
                <label className="form-label">Subject Line</label>
                <input 
                    type="text" 
                    className="form-control"
                    placeholder="e.g. Important Maintenance Update"
                    value={form.subject}
                    onChange={e => setForm({...form, subject: e.target.value})}
                    required
                />
            </div>
            <div className="form-group">
                <label className="form-label">
                    Message Body
                     <Tooltip text="Supports HTML content. Newlines are automatically converted to breaks." />
                </label>
                <textarea 
                    className="form-control"
                    style={{ height: '140px', resize: 'none' }}
                    placeholder="Type your message here..."
                    value={form.message}
                    onChange={e => setForm({...form, message: e.target.value})}
                    required
                ></textarea>
            </div>
            <button 
                type="submit" 
                disabled={loading}
                className="btn btn-primary"
                style={{ width: '100%',  justifyContent: 'center', background: '#3b82f6', boxShadow: '0 4px 15px rgba(59, 130, 246, 0.4)' }}
            >
                {loading ? 'Transmitting...' : <><Send size={18} /> Send Broadcast</>}
            </button>
        </form>
    );
};

const Tooltip = ({ text }) => (
    <div className="tooltip-container">
        <span className="tooltip-icon">!</span>
        <div className="tooltip-text">{text}</div>
    </div>
);

const formatAction = (action) => {
    return action.replace(/_/g, ' ').toLowerCase().replace(/\b\w/g, l => l.toUpperCase());
};

const getColorForAction = (action) => {
    if (action.includes('MANUAL')) return '#ef4444'; // Red for danger
    if (action.includes('BROADCAST')) return '#3b82f6'; // Blue for comms
    if (action.includes('ACTIVATE')) return '#10b981'; // Green for status
    if (action.includes('BAN')) return '#f59e0b'; // Amber for ban
    return '#6b7280'; // Gray default
};

export default AdminOperations;
