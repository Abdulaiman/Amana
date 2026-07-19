import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import {
    ShoppingBag, CheckCircle, Clock, AlertTriangle, X, User, Calendar, MessageSquare, DollarSign, ArrowLeft, XCircle
} from 'lucide-react';
import './AdminCancellations.css';

const AdminCancellations = () => {
    const [requests, setRequests] = useState([]);
    const [stats, setStats] = useState({});
    const [loading, setLoading] = useState(true);
    const [actionLoading, setActionLoading] = useState(null);
    const [selectedRequest, setSelectedRequest] = useState(null);
    const [confirmModal, setConfirmModal] = useState(null);

    const fetchRequests = async () => {
        setLoading(true);
        try {
            const res = await api.get('/aap/admin/cancellation-requests');
            setRequests(res.data.requests);
            setStats(res.data.stats);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchRequests();
    }, []);

    const handleApprove = async (aapId) => {
        setActionLoading(aapId);
        try {
            await api.put(`/aap/${aapId}/approve-cancellation`);
            setConfirmModal(null);
            setSelectedRequest(null);
            fetchRequests();
        } catch (err) {
            alert(err.response?.data?.message || 'Failed to approve cancellation');
        } finally {
            setActionLoading(null);
        }
    };

    const formatDate = (date) => {
        if (!date) return '—';
        return new Date(date).toLocaleDateString('en-NG', {
            day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit'
        });
    };

    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('en-NG', { style: 'currency', currency: 'NGN' }).format(amount || 0);
    };

    return (
        <div className="admin-page">
            <div className="page-hero">
                <div className="page-hero-icon">
                    <XCircle size={24} />
                </div>
                <div className="page-hero-body">
                    <h1 className="page-hero-title">Cancellation Requests</h1>
                    <p className="page-hero-subtitle">
                        {stats.total > 0
                            ? `${stats.total} pending cancellation${stats.total !== 1 ? 's' : ''}`
                            : 'No pending cancellation requests'}
                    </p>
                </div>
            </div>

            {loading ? (
                <div className="loading-state">
                    <div className="spinner" />
                    <p>Loading cancellation requests...</p>
                </div>
            ) : requests.length === 0 ? (
                <div className="empty-state">
                    <CheckCircle size={48} className="icon-success" />
                    <h3>All Clear</h3>
                    <p className="text-muted">No pending cancellation requests at this time.</p>
                </div>
            ) : (
                <div className="cancel-grid">
                    {requests.map((req) => (
                        <div
                            key={req._id}
                            className={`cancel-card ${selectedRequest?._id === req._id ? 'expanded' : ''}`}
                            onClick={() => setSelectedRequest(selectedRequest?._id === req._id ? null : req)}
                        >
                            <div className="cancel-card-header">
                                <div className="cancel-card-title-row">
                                    <ShoppingBag size={18} className="icon-warning" />
                                    <div>
                                        <h3 className="cancel-card-title">{req.productName}</h3>
                                        <span className="cancel-card-id">#{req._id.slice(-6).toUpperCase()}</span>
                                    </div>
                                </div>
                                <span className="badge badge-danger">Cancellation Requested</span>
                            </div>

                            <div className="cancel-card-body">
                                <div className="cancel-info-row">
                                    <User size={14} />
                                    <span><strong>Agent:</strong> {req.agent?.name || 'Unknown'}</span>
                                </div>
                                <div className="cancel-info-row">
                                    <User size={14} />
                                    <span><strong>Retailer:</strong> {req.retailer?.name || 'Unknown'}</span>
                                </div>
                                <div className="cancel-info-row">
                                    <DollarSign size={14} />
                                    <span><strong>Amount:</strong> {formatCurrency(req.purchasePrice)}</span>
                                </div>
                                <div className="cancel-info-row">
                                    <Calendar size={14} />
                                    <span><strong>Requested:</strong> {formatDate(req.cancelledAt)}</span>
                                </div>
                                {req.cancelReason && (
                                    <div className="cancel-info-row cancel-reason">
                                        <MessageSquare size={14} />
                                        <span><strong>Reason:</strong> {req.cancelReason}</span>
                                    </div>
                                )}
                            </div>

                            {selectedRequest?._id === req._id && (
                                <div className="cancel-card-actions">
                                    {req.refundProofUrl && (
                                        <div className="cancel-proof-section">
                                            <strong>Refund Receipt (Agent uploaded):</strong>
                                            <img 
                                                src={req.refundProofUrl} 
                                                alt="Refund Receipt" 
                                                className="cancel-proof-img"
                                                onClick={() => window.open(req.refundProofUrl, '_blank')}
                                            />
                                        </div>
                                    )}
                                    <div className="cancel-bank-info">
                                        <strong>Admin Account (for reference):</strong>
                                        <p>🏦 Moniepoint Bank</p>
                                        <p>👤 Amana Murabaha Global Enterprise</p>
                                        <p>🔢 6042197639</p>
                                    </div>
                                    <div className="cancel-action-notice">
                                        <AlertTriangle size={16} />
                                        <span>Confirming this means the agent has returned the cash to you.</span>
                                    </div>
                                    <button
                                        className="btn btn-primary"
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            setConfirmModal(req._id);
                                        }}
                                        disabled={actionLoading === req._id}
                                    >
                                        {actionLoading === req._id ? 'Processing...' : 'Confirm Cash Returned & Approve'}
                                    </button>
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            )}

            {confirmModal && (
                <div className="modal-overlay" onClick={() => setConfirmModal(null)}>
                    <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                        <div className="modal-header">
                            <h2>Confirm Cancellation</h2>
                            <button className="modal-close" onClick={() => setConfirmModal(null)}>
                                <X size={20} />
                            </button>
                        </div>
                        <div className="modal-body">
                            <AlertTriangle size={48} style={{ color: '#f59e0b', marginBottom: '1rem' }} />
                            <p>Have you received the cash back from the agent?</p>
                            <p className="text-muted" style={{ fontSize: '0.9rem' }}>
                                Verify the refund receipt below, then confirm to mark the AAP as cancelled.
                            </p>
                            {selectedRequest?.refundProofUrl && (
                                <div style={{ marginTop: 16 }}>
                                    <strong>Refund Receipt:</strong>
                                    <img 
                                        src={selectedRequest.refundProofUrl} 
                                        alt="Refund Receipt" 
                                        style={{ width: '100%', borderRadius: 10, marginTop: 8, cursor: 'pointer' }}
                                        onClick={() => window.open(selectedRequest.refundProofUrl, '_blank')}
                                    />
                                </div>
                            )}
                            {selectedRequest?.cancelReason && (
                                <p style={{ marginTop: 12, fontSize: '0.9rem', color: '#6b7280' }}>
                                    <strong>Reason:</strong> {selectedRequest.cancelReason}
                                </p>
                            )}
                            <div style={{ marginTop: 12, padding: 12, background: 'rgba(245,158,11,0.1)', borderRadius: 10, fontSize: '0.85rem' }}>
                                <strong>Admin Account:</strong><br />
                                🏦 Moniepoint Bank<br />
                                👤 Amana Murabaha Global Enterprise<br />
                                🔢 6042197639
                            </div>
                            <p className="text-muted" style={{ fontSize: '0.9rem', marginTop: 12 }}>
                                This action will mark the AAP as cancelled and confirm that the funds have been returned.
                                This cannot be undone.
                            </p>
                        </div>
                        <div className="modal-footer">
                            <button className="btn btn-outline" onClick={() => setConfirmModal(null)}>
                                Cancel
                            </button>
                            <button
                                className="btn btn-danger"
                                onClick={() => handleApprove(confirmModal)}
                                disabled={actionLoading === confirmModal}
                            >
                                {actionLoading === confirmModal ? 'Processing...' : 'Yes, Cash Returned'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AdminCancellations;
