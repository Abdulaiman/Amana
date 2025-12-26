import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../services/api';
import { Search, Filter, MoreVertical, Shield, Store, User as UserIcon, Ban, CheckCircle, Eye } from 'lucide-react';

const UserManagement = () => {
    const navigate = useNavigate();
    const [users, setUsers] = useState([]);
    const [vendors, setVendors] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [activeTab, setActiveTab] = useState('all'); // 'all', 'retailers', 'vendors'

    useEffect(() => {
        fetchUniverse();
    }, []);

    const fetchUniverse = async () => {
        try {
            const [usersRes, vendorsRes] = await Promise.all([
                api.get('/admin/retailers'),
                api.get('/admin/vendors')
            ]);
            setUsers(usersRes.data);
            setVendors(vendorsRes.data);
        } catch (error) {
            console.error('Failed to load universe', error);
        } finally {
            setLoading(false);
        }
    };

    const handleSearch = async (e) => {
        if (e.key === 'Enter') {
            setLoading(true);
            try {
                const { data } = await api.get(`/admin/search?query=${searchTerm}`);
                setUsers(data.users);
                setVendors(data.vendors);
            } catch (error) {
                console.error('Search failed', error);
            } finally {
                setLoading(false);
            }
        }
    };

    const getAllItems = () => {
        const vendorItems = vendors.map(v => ({ ...v, type: 'vendor' }));
        const userItems = users.map(u => ({ ...u, type: 'retailer' }));
        
        let all = [...vendorItems, ...userItems];

        if (activeTab === 'retailers') all = userItems;
        if (activeTab === 'vendors') all = vendorItems;

        if (searchTerm && !searchTerm.includes('@')) { 
            const lower = searchTerm.toLowerCase();
            return all.filter(item => 
                (item.name || item.businessName || '').toLowerCase().includes(lower) ||
                (item.email || '').toLowerCase().includes(lower) ||
                (item.phone || item.ownerPhone || '').includes(lower)
            );
        }
        
        return all;
    };

    const items = getAllItems();

    return (
        <div className="fade-in">
            <div className="page-header">
                <div>
                    <h1 className="page-title">User Universe</h1>
                    <p className="page-subtitle">Manage all accounts across the platform</p>
                </div>
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                    {['all', 'retailers', 'vendors'].map(tab => (
                        <button 
                            key={tab}
                            onClick={() => setActiveTab(tab)}
                            className={`btn ${activeTab === tab ? 'btn-primary' : 'btn-outline'}`}
                            style={{ padding: '0.5rem 1rem', fontSize: '0.85rem', textTransform: 'capitalize' }}
                        >
                            {tab}
                        </button>
                    ))}
                </div>
            </div>

            <div className="glass-panel table-container">
                <table className="data-table">
                    <thead>
                        <tr>
                            <th>Identity</th>
                            <th>Role</th>
                            <th>Verification</th>
                            <th>Status</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {loading ? (
                            <tr><td colSpan="5" className="text-center p-xl">Loading universe...</td></tr>
                        ) : items.length === 0 ? (
                            <tr><td colSpan="5" className="text-center p-xl text-muted">No users found match your query.</td></tr>
                        ) : (
                            items.map((item) => (
                                <tr key={item._id}>
                                    <td>
                                        <div className="flex items-center gap-4">
                                            <div className="avatar-circle">
                                                {(item.name || item.businessName || '?').charAt(0)}
                                            </div>
                                            <div>
                                                <p style={{ fontWeight: 600 }}>{item.name || item.businessName}</p>
                                                <p className="text-muted" style={{ fontSize: '0.8rem' }}>{item.email}</p>
                                                <p className="text-muted" style={{ fontSize: '0.8rem' }}>{item.phone || item.phones?.[0]}</p>
                                            </div>
                                        </div>
                                    </td>
                                    <td>
                                        <div className={`badge ${item.type === 'vendor' ? 'badge-neutral' : 'badge-neutral'}`}>
                                            {item.type === 'vendor' ? <Store size={12} /> : <UserIcon size={12} />}
                                            {item.type === 'vendor' ? 'Vendor' : 'Retailer'}
                                        </div>
                                    </td>
                                    <td>
                                        <StatusBadge status={item.verificationStatus} />
                                    </td>
                                    <td>
                                        <span className={`badge ${item.isActive !== false ? 'badge-success' : 'badge-danger'}`}>
                                            {item.isActive !== false ? <CheckCircle size={12} /> : <Ban size={12} />}
                                            {item.isActive !== false ? 'Active' : 'Banned'}
                                        </span>
                                    </td>
                                    <td>
                                        <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end' }}>
                                            <button 
                                                className="btn btn-sm btn-ghost"
                                                onClick={() => navigate(`/admin/user/${item._id}`)}
                                                title="God View (Deep Dive)"
                                            >
                                                <Eye size={16} />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

const StatusBadge = ({ status }) => {
    const styles = {
        verified: 'badge-success',
        approved: 'badge-success',
        pending: 'badge-warning',
        rejected: 'badge-danger',
        unsubmitted: 'badge-neutral'
    };

    const label = status ? status.charAt(0).toUpperCase() + status.slice(1) : 'Unknown';
    const style = styles[status] || styles.unsubmitted;

    return (
        <span className={`badge ${style}`}>
            {label}
        </span>
    );
};

export default UserManagement;
