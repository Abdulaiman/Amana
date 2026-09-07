import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import { 
    ShieldCheck, Search, Users, ChevronLeft, ChevronRight, 
    RefreshCw, UserPlus, UserMinus, Phone, Mail, Award, Check 
} from 'lucide-react';
import { useToast } from '../../context/ToastContext';
import ConfirmModal from '../../components/ConfirmModal';
import './AdminSectionStyles.css';

const AdminAgents = () => {
    const [agents, setAgents] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [sortBy, setSortBy] = useState('date');
    const [sortOrder, setSortOrder] = useState('desc');
    const [page, setPage] = useState(1);
    const [limit, setLimit] = useState(10);
    const [total, setTotal] = useState(0);
    const [totalPages, setTotalPages] = useState(1);

    // Search & Assign Widget State
    const [assignQuery, setAssignQuery] = useState('');
    const [assignResults, setAssignResults] = useState([]);
    const [isSearchingAssign, setIsSearchingAssign] = useState(false);

    const [confirmModal, setConfirmModal] = useState({ isOpen: false, title: '', message: '', onConfirm: null, isDestructive: false });
    const { addToast } = useToast();

    useEffect(() => {
        fetchAgents();
    }, [sortBy, sortOrder, page, limit]);

    const fetchAgents = async () => {
        setLoading(true);
        try {
            const params = new URLSearchParams({
                search: searchTerm,
                sortBy,
                sortOrder,
                page: page.toString(),
                limit: limit.toString()
            });
            const res = await api.get(`/admin/agents?${params.toString()}`);
            if (res.data && res.data.data) {
                setAgents(res.data.data);
                setTotal(res.data.total);
                setTotalPages(res.data.totalPages);
            } else if (Array.isArray(res.data)) {
                setAgents(res.data);
                setTotal(res.data.length);
                setTotalPages(1);
            }
        } catch (error) {
            console.error('Failed to fetch agents', error);
            addToast('Failed to load agents directory', 'error');
        } finally {
            setLoading(false);
        }
    };

    const handleSearchSubmit = (e) => {
        e.preventDefault();
        setPage(1);
        fetchAgents();
    };

    const handleAssignSearch = async (e) => {
        e.preventDefault();
        if (!assignQuery.trim()) return;
        setIsSearchingAssign(true);
        try {
            const res = await api.get(`/admin/retailers/search?query=${encodeURIComponent(assignQuery.trim())}`);
            setAssignResults(res.data || []);
            if (!res.data || res.data.length === 0) {
                addToast('No verified retailer found with this Phone or NIN', 'info');
            }
        } catch (error) {
            addToast('Search failed', 'error');
        } finally {
            setIsSearchingAssign(false);
        }
    };

    const handleToggleAgent = async (retailerId, currentIsAgent, retailerName) => {
        setConfirmModal({
            isOpen: true,
            title: currentIsAgent ? 'Revoke Agent Status?' : 'Promote to Market Agent?',
            message: currentIsAgent 
                ? `Are you sure you want to revoke Market Agent privileges from ${retailerName}? They will no longer be able to perform field verifications.`
                : `Are you sure you want to grant Market Agent status to ${retailerName}? They will be authorized to conduct field audits and earn commissions.`,
            isDestructive: currentIsAgent,
            confirmText: currentIsAgent ? 'Revoke Privileges' : 'Authorize as Agent',
            onConfirm: async () => {
                setConfirmModal({ isOpen: false, title: '', message: '', onConfirm: null });
                try {
                    await api.put(`/admin/retailer/${retailerId}/agent`);
                    addToast(currentIsAgent ? 'Agent privileges revoked' : 'Retailer successfully promoted to Agent!', 'success');
                    fetchAgents();
                    // Update in search results if present
                    setAssignResults(prev => prev.map(r => r._id === retailerId ? { ...r, isAgent: !r.isAgent } : r));
                } catch (e) {
                    addToast('Failed to update agent status', 'error');
                }
            }
        });
    };

    return (
        <div className="admin-page-container animate-fade-in">
            {/* ── Section Header ── */}
            <div className="admin-section-header">
                <div className="admin-section-header-left">
                    <div className="section-icon-badge blue">
                        <ShieldCheck size={28} />
                    </div>
                    <div>
                        <h1 className="admin-section-title">Market Agents Directory & Assignments</h1>
                        <p className="admin-section-subtitle">
                            Authorize trusted local traders as Field Agents to conduct store visits, verify eligibility, and assist purchases.
                        </p>
                    </div>
                </div>
                <div className="admin-section-header-actions">
                    <button className="btn btn-secondary btn-sm" onClick={fetchAgents} disabled={loading}>
                        <RefreshCw size={14} className={loading ? 'animate-spin' : ''} /> Refresh
                    </button>
                </div>
            </div>

            {/* ── Interactive Search & Assign Box ── */}
            <div className="admin-section-header" style={{ padding: '20px 24px', background: 'var(--color-surface)' }}>
                <div style={{ width: '100%' }}>
                    <h3 style={{ fontSize: '15px', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                        <UserPlus size={18} className="text-brand" /> Promote Verified Retailer to Agent
                    </h3>
                    <p className="admin-section-subtitle" style={{ marginBottom: '14px' }}>
                        Look up any verified trader by Phone Number or National Identity Number (NIN) to grant Agent privileges.
                    </p>

                    <form onSubmit={handleAssignSearch} style={{ display: 'flex', gap: '10px', maxWidth: '600px' }}>
                        <div className="search-field-wrapper" style={{ flex: 1 }}>
                            <Search size={16} className="search-field-icon" />
                            <input 
                                type="text"
                                placeholder="Enter retailer Phone (e.g. 08012345678) or NIN..."
                                className="admin-search-input-main"
                                value={assignQuery}
                                onChange={e => setAssignQuery(e.target.value)}
                            />
                        </div>
                        <button type="submit" className="btn btn-primary btn-sm" disabled={isSearchingAssign}>
                            {isSearchingAssign ? 'Searching...' : 'Find Retailer'}
                        </button>
                    </form>

                    {/* Search Results Preview */}
                    {assignResults.length > 0 && (
                        <div style={{ marginTop: '16px', display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '12px' }}>
                            {assignResults.map(res => (
                                <div key={res._id} style={{ 
                                    background: 'var(--color-bg-secondary)', 
                                    padding: '12px 16px', 
                                    borderRadius: 'var(--radius-lg)', 
                                    border: '1px solid var(--color-border)',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'space-between',
                                    gap: '12px'
                                }}>
                                    <div className="entity-cell">
                                        <div className="entity-avatar">
                                            {res.kyc?.profilePicUrl ? <img src={res.kyc.profilePicUrl} alt={res.name} /> : res.name?.charAt(0)}
                                        </div>
                                        <div>
                                            <p className="entity-primary-text">{res.name}</p>
                                            <p className="entity-sub-text">{res.phone} • NIN: {res.kyc?.nin || 'N/A'}</p>
                                        </div>
                                    </div>
                                    <button 
                                        className={`btn btn-sm ${res.isAgent ? 'btn-outline' : 'btn-primary'}`}
                                        onClick={() => handleToggleAgent(res._id, res.isAgent, res.name)}
                                    >
                                        {res.isAgent ? 'Revoke' : 'Promote'}
                                    </button>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>

            {/* ── Control Bar ── */}
            <div className="admin-control-bar">
                <form className="control-bar-left" onSubmit={handleSearchSubmit}>
                    <div className="search-field-wrapper">
                        <Search size={16} className="search-field-icon" />
                        <input 
                            type="text"
                            placeholder="Search active agents by name, phone, email..."
                            className="admin-search-input-main"
                            value={searchTerm}
                            onChange={e => setSearchTerm(e.target.value)}
                        />
                    </div>
                </form>

                <div className="control-bar-right">
                    <div className="sort-select-wrapper">
                        <span className="sort-select-label">Sort:</span>
                        <select 
                            className="admin-select-field"
                            value={`${sortBy}_${sortOrder}`}
                            onChange={e => {
                                const [by, ord] = e.target.value.split('_');
                                setSortBy(by);
                                setSortOrder(ord);
                                setPage(1);
                            }}
                        >
                            <option value="date_desc">Newest Added</option>
                            <option value="date_asc">Oldest Added</option>
                            <option value="score_desc">Amana Score: High to Low</option>
                            <option value="name_asc">Name: A to Z</option>
                        </select>
                    </div>
                </div>
            </div>

            {/* ── Active Agents Table ── */}
            <div className="admin-table-card">
                <div className="table-responsive-container">
                    <table className="admin-modern-table">
                        <thead>
                            <tr>
                                <th>Agent Name</th>
                                <th>Contact Details</th>
                                <th>Amana Score</th>
                                <th>Privilege Status</th>
                                <th>Agent Since</th>
                                <th style={{ textAlign: 'right' }}>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {loading ? (
                                <tr>
                                    <td colSpan={6} style={{ textAlign: 'center', padding: '40px' }}>
                                        <div className="loading-spinner" style={{ margin: '0 auto' }}></div>
                                    </td>
                                </tr>
                            ) : agents.length === 0 ? (
                                <tr>
                                    <td colSpan={6} style={{ textAlign: 'center', padding: '40px' }}>
                                        <ShieldCheck size={36} className="text-tertiary mb-2" style={{ margin: '0 auto', display: 'block' }} />
                                        <p className="text-secondary">No active agents found.</p>
                                    </td>
                                </tr>
                            ) : (
                                agents.map(agent => {
                                    const profilePic = agent.kyc?.profilePicUrl || agent.profilePicUrl;
                                    return (
                                        <tr key={agent._id}>
                                            <td>
                                                <div className="entity-cell">
                                                    <div className="entity-avatar">
                                                        {profilePic ? (
                                                            <img src={profilePic} alt={agent.name} />
                                                        ) : (
                                                            agent.name?.charAt(0) || 'A'
                                                        )}
                                                    </div>
                                                    <div className="entity-details">
                                                        <p className="entity-primary-text">{agent.name}</p>
                                                        <p className="entity-sub-text">ID: {agent._id.substring(0, 8)}</p>
                                                    </div>
                                                </div>
                                            </td>
                                            <td>
                                                <p className="entity-primary-text" style={{ fontSize: '13px' }}>{agent.phone}</p>
                                                <p className="entity-sub-text">{agent.email}</p>
                                            </td>
                                            <td>
                                                <span className="font-bold text-brand">{agent.amanaScore || 0} pts</span>
                                            </td>
                                            <td>
                                                <span className="status-pill approved">
                                                    <Check size={12} /> ACTIVE AGENT
                                                </span>
                                            </td>
                                            <td>
                                                <span className="text-secondary" style={{ fontSize: '12px' }}>
                                                    {new Date(agent.updatedAt || agent.createdAt).toLocaleDateString()}
                                                </span>
                                            </td>
                                            <td style={{ textAlign: 'right' }}>
                                                <button 
                                                    className="btn btn-outline btn-sm"
                                                    style={{ color: 'var(--color-danger)', borderColor: 'var(--color-danger)' }}
                                                    onClick={() => handleToggleAgent(agent._id, true, agent.name)}
                                                >
                                                    <UserMinus size={14} /> Revoke Agent
                                                </button>
                                            </td>
                                        </tr>
                                    );
                                })
                            )}
                        </tbody>
                    </table>
                </div>

                {/* ── Pagination Bar ── */}
                <div className="admin-pagination-bar">
                    <div className="pagination-info">
                        Showing {agents.length > 0 ? (page - 1) * limit + 1 : 0} to {Math.min(page * limit, total)} of {total} agents
                    </div>

                    <div className="pagination-controls">
                        <select 
                            className="admin-select-field"
                            value={limit}
                            onChange={e => {
                                setLimit(Number(e.target.value));
                                setPage(1);
                            }}
                            style={{ padding: '4px 8px' }}
                        >
                            <option value={10}>10 per page</option>
                            <option value={25}>25 per page</option>
                            <option value={50}>50 per page</option>
                        </select>

                        <button 
                            className="pagination-btn"
                            disabled={page <= 1 || loading}
                            onClick={() => setPage(prev => Math.max(prev - 1, 1))}
                        >
                            <ChevronLeft size={14} /> Prev
                        </button>

                        <span className="pagination-page-indicator">
                            Page {page} of {totalPages}
                        </span>

                        <button 
                            className="pagination-btn"
                            disabled={page >= totalPages || loading}
                            onClick={() => setPage(prev => Math.min(prev + 1, totalPages))}
                        >
                            Next <ChevronRight size={14} />
                        </button>
                    </div>
                </div>
            </div>

            <ConfirmModal 
                isOpen={confirmModal.isOpen}
                onClose={() => setConfirmModal({ ...confirmModal, isOpen: false })}
                onConfirm={confirmModal.onConfirm}
                title={confirmModal.title}
                message={confirmModal.message}
                isDestructive={confirmModal.isDestructive}
                confirmText={confirmModal.confirmText}
            />
        </div>
    );
};

export default AdminAgents;
