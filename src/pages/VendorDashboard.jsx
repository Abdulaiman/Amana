import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import './VendorDashboard.css';
import { useToast } from '../context/ToastContext';
import ConfirmModal from '../components/ConfirmModal';

import { Plus, DollarSign, Package, TrendingUp, Search, Edit2, Trash2, X, ChevronRight, Lock, Wallet, ArrowRight, Building, AlertTriangle, UploadCloud, Clock } from 'lucide-react';
import KYCStatusGate from '../components/KYCStatusGate';

const VendorDashboard = () => {
    const navigate = useNavigate();
    const [profile, setProfile] = useState(null);
    const [products, setProducts] = useState([]);
    const [showAddProduct, setShowAddProduct] = useState(false);
    
    // Notification System
    const { addToast } = useToast();
    const [confirmModal, setConfirmModal] = useState({ isOpen: false, title: '', message: '', onConfirm: null, isDestructive: false });
    
    // State for Tabs
    const [activeTab, setActiveTab] = useState('inventory'); // 'inventory' | 'orders'
    const [orders, setOrders] = useState([]);

    // Payout Modal State
    const [showPayoutModal, setShowPayoutModal] = useState(false);
    const [payoutAmount, setPayoutAmount] = useState('');
    const [payoutLoading, setPayoutLoading] = useState(false);

    // Product Form State
    const [editingId, setEditingId] = useState(null); 
    const [newProduct, setNewProduct] = useState({ 
        name: '', price: '', description: '', countInStock: 10, category: 'General', 
        images: [] 
    });
    const [imageFiles, setImageFiles] = useState([]); 
    const [uploading, setUploading] = useState(false);

    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        fetchDashboardData();
        fetchOrders(); // Also fetch orders on initial load for counts
    }, []);

    const fetchDashboardData = async () => {
        try {
            const profileRes = await api.get('/vendor/profile');
            setProfile(profileRes.data);
            
            const productsRes = await api.get('/products'); 
            const myProducts = productsRes.data.filter(p => p.vendor._id === profileRes.data._id);
            setProducts(myProducts);
        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
        }
    };

    const fetchOrders = async () => {
        try {
            const res = await api.get('/orders/myorders');
            setOrders(res.data);
        } catch (e) {
            console.error('Failed to fetch orders', e);
        }
    };

    const executeConfirmOrder = async (orderId) => {
        try {
            await api.put(`/orders/${orderId}/ready`);
            addToast('Order Confirmed! User will pick up goods.', 'success');
            fetchOrders(); // Refresh
            fetchDashboardData(); // Update wallet balance
        } catch (e) {
            addToast(e.response?.data?.message || 'Failed to confirm order', 'error');
        }
    };

    const handleConfirmOrderClick = (orderId) => {
        setConfirmModal({
            isOpen: true,
            title: 'Confirm Order Readiness',
            message: 'Are you sure this order is ready for pickup? The user will be notified.',
            onConfirm: () => executeConfirmOrder(orderId),
            isDestructive: false,
            confirmText: 'Confirm Ready'
        });
    };

    const handleRequestPayout = async (e) => {
        if (e) e.preventDefault(); 
        const amount = parseFloat(payoutAmount);
        if (!amount || amount <= 0) {
            addToast('Enter a valid amount', 'error');
            return;
        }
        if (amount > profile.walletBalance) {
            addToast('Amount exceeds wallet balance', 'error');
            return;
        }
        
        setPayoutLoading(true);
        try {
            await api.post('/vendor/payout/request', { amount });
            addToast('Payout request submitted! Admin will process within 24-48 hours.', 'success');
            setShowPayoutModal(false);
            setPayoutAmount('');
        } catch (e) {
            addToast(e.response?.data?.message || 'Failed to submit payout request', 'error');
        } finally {
            setPayoutLoading(false);
        }
    };

    const handleFileChange = (e) => {
        const files = Array.from(e.target.files);
        if (files.length === 0) return;

        const totalImages = (newProduct.images?.length || 0) + imageFiles.length + files.length;
        if (totalImages > 10) {
            addToast('You can only have up to 10 images per product.', 'error');
            return;
        }

        setImageFiles([...imageFiles, ...files]);
        e.target.value = null;
    };

    const removeFile = (index) => {
        setImageFiles(imageFiles.filter((_, i) => i !== index));
    };

    const removeExistingImage = (index) => {
        const updatedImages = newProduct.images.filter((_, i) => i !== index);
        setNewProduct({ ...newProduct, images: updatedImages });
    };

    const uploadImages = async () => {
        const formData = new FormData();
        imageFiles.forEach(file => {
            formData.append('files', file);
        });

        const res = await api.post('/upload', formData, {
            headers: { 'Content-Type': 'multipart/form-data' },
        });
        return res.data;
    };

    const openAddModal = () => {
        setEditingId(null);
        setNewProduct({ name: '', price: '', description: '', countInStock: 10, category: 'General', images: [] });
        setImageFiles([]);
        setShowAddProduct(true);
    };

    const handleEditClick = (product) => {
        setEditingId(product._id);
        setNewProduct({
            name: product.name,
            price: product.price,
            description: product.description,
            countInStock: product.countInStock,
            category: product.category,
            images: product.images || []
        });
        setImageFiles([]);
        setShowAddProduct(true);
    };

    const executeDeleteProduct = async (id) => {
        try {
            await api.delete(`/products/${id}`);
            setProducts(products.filter(p => p._id !== id));
            addToast('Product deleted successfully', 'success');
        } catch (e) {
            addToast('Failed to delete product', 'error');
        }
    };

    const handleDeleteClick = (id) => {
        setConfirmModal({
            isOpen: true,
            title: 'Delete Product',
            message: 'Are you sure you want to delete this product? This action cannot be undone.',
            onConfirm: () => executeDeleteProduct(id),
            isDestructive: true,
            confirmText: 'Delete Product'
        });
    };

    const handleSaveProduct = async (e) => {
        e.preventDefault();
        setUploading(true);

        try {
            let newImageUrls = [];
            if (imageFiles.length > 0) {
                newImageUrls = await uploadImages();
            }

            const finalImages = [...newProduct.images, ...newImageUrls];

            const productPayload = {
                ...newProduct,
                images: finalImages,
                // Sync isActive with countInStock: active if stock > 0
                isActive: Number(newProduct.countInStock) > 0
            };

            if (editingId) {
                await api.put(`/products/${editingId}`, productPayload);
                addToast('Product Updated Successfully', 'success');
            } else {
                await api.post('/products', productPayload);
                addToast('Product Added Successfully', 'success');
            }
            
            setShowAddProduct(false);
            setUploading(false);
            fetchDashboardData(); 

        } catch (e) {
            console.error(e);
            setUploading(false);
            addToast('Failed to save product', 'error');
        }
    };

    if (loading) return (
        <div className="loading-container">
            <div className="loading-spinner"></div>
        </div>
    );

    const totalImageCount = (newProduct.images?.length || 0) + imageFiles.length;

    if (!profile) return <div className="dashboard-error">Error loading dashboard.</div>;

    const isVerified = profile?.verificationStatus === 'verified';

    const filteredProducts = products.filter(p => p.name.toLowerCase().includes(searchTerm.toLowerCase()));

    return (
        <>
            <div className="vendor-dashboard-container animate-fade-in">
                
            {/* Onboarding / Verification Guidance */}
            {profile.verificationStatus !== 'verified' && (
                <div className="dashboard-guidance-section" style={{ marginBottom: '2rem' }}>
                    {!profile.isProfileComplete ? (
                        <div className="onboarding-card-wrapper">
                            <div className="onboarding-card-glow"></div>
                            <div className="onboarding-card-content">
                                <div className="onboarding-icon-box">
                                    <Building size={32} />
                                </div>
                                <div className="onboarding-text">
                                    <h3>Complete Your Vendor Profile</h3>
                                    <p>Tell us more about your business and add bank details to start receiving orders and payouts.</p>
                                </div>
                                <button onClick={() => navigate('/vendor/complete-profile')} className="onboarding-action-btn">
                                    Complete Profile <ArrowRight size={18} />
                                </button>
                            </div>
                        </div>
                    ) : profile.verificationStatus === 'pending' ? (
                        <div className="verification-pending-card">
                            <Clock className="spin-slow" size={24} />
                            <div className="verification-text">
                                <h3>Account Verification Pending</h3>
                                <p>We're currently reviewing your business documents. This usually takes less than 24 hours.</p>
                            </div>
                        </div>
                    ) : profile.verificationStatus === 'rejected' && (
                        <div className="verification-rejected-card">
                            <AlertTriangle size={24} />
                            <div className="verification-text">
                                <h3>Verification Declined</h3>
                                <p>Reason: <span className="rejection-reason-text">"{profile.rejectionReason}"</span></p>
                                <button onClick={() => navigate('/vendor/complete-profile')} className="re-verify-btn">
                                    Update Documents
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            )}
            {/* Header */}
            {isVerified && (
                <header className="vendor-header">
                    <div>
                        <h1 className="business-name">{profile.businessName}</h1>
                        <div className="vendor-badges">
                            <span className="verified-badge">Verified Vendor</span>
                            <span className="portal-access">Portal Access</span>
                        </div>
                    </div>
                    <div className={`segmented-tabs-container ${activeTab === 'orders' ? 'orders-active' : ''}`}>
                        <div className="tabs-slider"></div>
                        <button 
                            onClick={() => setActiveTab('inventory')}
                            className={`segmented-tab-btn ${activeTab === 'inventory' ? 'active' : ''}`}
                        >
                            <Package size={16} /> Inventory
                        </button>
                        <button 
                            onClick={() => setActiveTab('orders')}
                            className={`segmented-tab-btn ${activeTab === 'orders' ? 'active' : ''}`}
                        >
                            <TrendingUp size={16} /> Orders
                        </button>
                    </div>
                    {activeTab === 'inventory' && (
                        <button onClick={openAddModal} className="add-product-main-btn">
                            <Plus size={20} /> Add Product
                        </button>
                    )}
                </header>
            )}

            {/* Stats Grid */}
            {isVerified && (
                <div className="stats-grid">
                    {/* Wallet Balance Card */}
                    <div className="stat-card">
                        <div className="stat-card-header">
                            <div className="stat-card-icon">
                                <DollarSign size={22} />
                            </div>
                            <div className="stat-card-title">
                                <h3>Wallet Balance</h3>
                                <span>Verified Funds</span>
                            </div>
                        </div>
                        <div className="stat-card-body">
                            <div className="stat-card-value currency">
                                <span className="currency-sign">₦</span>
                                <span className="value-main">{profile.walletBalance.toLocaleString()}</span>
                            </div>
                            <div style={{ marginTop: '0.5rem' }}>
                            {profile.walletBalance > 0 && (
                                <button
                                    onClick={() => {
                                        if (!isVerified) {
                                            addToast('Please complete verification to request payouts', 'error');
                                            return;
                                        }
                                        setShowPayoutModal(true);
                                    }}
                                    className={`payout-btn ${!isVerified ? 'disabled' : ''}`}
                                >
                                    <Wallet size={14} /> Request Payout
                                </button>
                            )}
                            </div>
                        </div>
                    </div>

                    {/* Live Inventory Card */}
                    <div className="stat-card">
                        <div className="stat-card-header">
                            <div className="stat-card-icon">
                                <Package size={22} />
                            </div>
                            <div className="stat-card-title">
                                <h3>Live Inventory</h3>
                                <span>Active Records</span>
                            </div>
                        </div>
                        <div className="stat-card-body">
                            <div className="stat-card-value">
                                <span className="value-main">{products.length}</span>
                                <span className="value-suffix">Items</span>
                            </div>
                        </div>
                    </div>

                    {/* Orders Card */}
                    <div className="stat-card">
                        <div className="stat-card-header">
                            <div className="stat-card-icon">
                                <TrendingUp size={22} />
                            </div>
                            <div className="stat-card-title">
                                <h3>Orders</h3>
                                <span>Pending Actions</span>
                            </div>
                        </div>
                        <div className="stat-card-body">
                            <div className="stat-card-value">
                                <span className="value-main">{orders.filter(o => o.status === 'pending_vendor').length}</span>
                                <span className="value-suffix">Pending</span>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Main Content Area */}
            {isVerified && (
                <>
                    {activeTab === 'inventory' ? (
                        <div className="inventory-panel glass-panel">
                            {/* ... Existing Inventory Table Logic ... */}
                            <div className="inventory-header">
                                <h3 className="inventory-title">Product Inventory</h3>
                                <div className="inventory-actions">
                                    <div className="search-wrapper">
                                        <Search className="search-icon-sm" size={16} />
                                        <input 
                                            type="text" 
                                            placeholder="Search inventory..." 
                                            className="search-input-sm"
                                            value={searchTerm}
                                            onChange={(e) => setSearchTerm(e.target.value)}
                                        />
                                    </div>
                                </div>
                            </div>

                            <div className="inventory-table-wrapper">
                                <table className="inventory-table">
                                    <thead>
                                        <tr className="table-head-row">
                                            <th className="th-cell pl">Product</th>
                                            <th className="th-cell">Category</th>
                                            <th className="th-cell">Price</th>
                                            <th className="th-cell">Stock</th>
                                            <th className="th-cell pr text-right">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {filteredProducts.map(p => (
                                            <tr key={p._id} className="table-body-row">
                                                <td className="td-cell pl" data-label="Product">
                                                    <div className="product-cell">
                                                        <div className="product-thumb">
                                                            {p.images && p.images.length > 0 ? (
                                                                <img src={p.images[0]} alt="" className="thumb-img" />
                                                            ) : (
                                                                <div className="no-img-placeholder">No Img</div>
                                                            )}
                                                        </div>
                                                        <span className="product-name-text">{p.name}</span>
                                                    </div>
                                                </td>
                                                <td className="td-cell" data-label="Category">{p.category}</td>
                                                <td className="td-cell font-mono" data-label="Price">₦{p.price.toLocaleString()}</td>
                                                <td className="td-cell" data-label="Stock">
                                                    <span className={`stock-badge ${p.countInStock > 5 ? 'in-stock' : 'low-stock'}`}>
                                                        {p.countInStock} Units
                                                    </span>
                                                </td>
                                                <td className="td-cell pr text-right" data-label="Actions">
                                                    <div className="action-buttons">
                                                        <button className="action-btn edit" onClick={() => handleEditClick(p)}><Edit2 size={16} /></button>
                                                        <button className="action-btn delete" onClick={() => handleDeleteClick(p._id)}><Trash2 size={16} /></button>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    ) : (
                        <div className="inventory-panel glass-panel">
                            <div className="inventory-header">
                                <h3 className="inventory-title">Order Management</h3>
                            </div>
                            <div className="inventory-table-wrapper">
                                <table className="inventory-table">
                                    <thead>
                                        <tr className="table-head-row">
                                            <th className="th-cell pl">Order ID</th>
                                            <th className="th-cell">Item</th>
                                            <th className="th-cell">Price</th>
                                            <th className="th-cell">Status</th>
                                            <th className="th-cell pr text-right">Action</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {orders.map(order => (
                                            <tr key={order._id} className="table-body-row">
                                                <td className="td-cell pl font-mono text-xs" data-label="Order ID">{order._id.substring(0, 8)}...</td>
                                                <td className="td-cell" data-label="Item">{order.orderItems[0]?.name || 'Unknown Item'}</td>
                                                <td className="td-cell font-mono" data-label="Price">₦{order.itemsPrice.toLocaleString()}</td>
                                                <td className="td-cell" data-label="Status">
                                                    <span className={`status-badge-pill ${
                                                        order.status === 'pending_vendor' ? 'pending' :
                                                        order.status === 'ready_for_pickup' ? 'pickup' :
                                                        order.status === 'goods_received' ? 'completed' : 'completed'
                                                    }`}>
                                                        {order.status === 'goods_received' ? 'RECEIVED' : order.status.replace('_', ' ').toUpperCase()}
                                                    </span>
                                                </td>
                                                <td className="td-cell pr text-right" data-label="Action">
                                                    {order.status === 'pending_vendor' && (
                                                        <button 
                                                            onClick={() => {
                                                                if (!isVerified) {
                                                                    addToast('Complete verification to confirm orders', 'error');
                                                                    return;
                                                                }
                                                                handleConfirmOrderClick(order._id);
                                                            }}
                                                            className={`confirm-btn ${!isVerified ? 'disabled' : ''}`}
                                                        >
                                                            Confirm Order
                                                        </button>
                                                    )}
                                                    {order.status === 'ready_for_pickup' && (
                                                        <div style={{ textAlign: 'right' }}>
                                                            <span className="pickup-wait-text">Code: {order.pickupCode}</span>
                                                            <p className="payment-pending-note" style={{ margin: 0 }}>💰 Payment on user confirmation</p>
                                                        </div>
                                                    )}
                                                    {order.status === 'goods_received' && (
                                                        <span className="paid-badge">✓ Paid</span>
                                                    )}
                                                </td>
                                            </tr>
                                        ))}
                                        {orders.length === 0 && (
                                            <tr><td colSpan="5" className="table-empty-message">No orders found.</td></tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )}
                </>
            )}

            {!isVerified && (
                <div className="restricted-overlay-message" style={{ textAlign: 'center', padding: '4rem 2rem', color: '#6b7280' }}>
                    <Lock size={48} style={{ marginBottom: '1rem', opacity: 0.5 }} />
                    <p style={{ fontSize: '1.1rem' }}>Dashboard content is locked until your account is verified.</p>
                </div>
            )}
            </div>


            {/* Add/Edit Product Modal */}
            {showAddProduct && (
                 <div className="glass-modal-overlay">
                    <div className="glass-modal-content animate-zoom-in">
                        <div className="modal-header" style={{ margin: 0, padding: '1.5rem', borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
                            <h2 className="modal-title">{editingId ? 'Edit Product' : 'Add New Product'}</h2>
                            <button type="button" onClick={() => setShowAddProduct(false)} className="close-modal-btn">
                                <X size={24} />
                            </button>
                        </div>
                        
                        <form onSubmit={handleSaveProduct} className="modal-body">
                            <div className="form-group" style={{ marginBottom: '1.25rem' }}>
                                <label className="form-label">Product Name</label>
                                <input className="glass-input" 
                                    placeholder="e.g. iPhone 15 Pro Screen Guard" value={newProduct.name} onChange={e => setNewProduct({...newProduct, name: e.target.value})} required />
                            </div>

                            <div className="form-grid-2" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1.25rem' }}>
                                <div className="form-group">
                                    <label className="form-label">Price (₦)</label>
                                    <input className="glass-input" 
                                        type="number" placeholder="0.00" value={newProduct.price} onChange={e => setNewProduct({...newProduct, price: e.target.value})} required />
                                </div>
                                <div className="form-group">
                                    <label className="form-label">Stock Quantity</label>
                                    <input className="glass-input" 
                                        type="number" placeholder="10" value={newProduct.countInStock} onChange={e => setNewProduct({...newProduct, countInStock: e.target.value})} required />
                                </div>
                            </div>
                            
                            <div className="form-group" style={{ marginBottom: '1.25rem' }}>
                                <label className="form-label">Category</label>
                                <select className="glass-input"
                                    value={newProduct.category} onChange={e => setNewProduct({...newProduct, category: e.target.value})}>
                                    <option value="General">General</option>
                                    <option value="Electronics">Electronics</option>
                                    <option value="Phones">Phones</option>
                                    <option value="Fashion">Fashion</option>
                                    <option value="Beauty">Beauty</option>
                                    <option value="Home">Home</option>
                                </select>
                            </div>

                            {/* Image Upload Area */}
                            <div className="form-group" style={{ marginBottom: '1.25rem' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                    <label className="form-label">Product Images</label>
                                    <span className="image-counter">{totalImageCount}/10</span>
                                </div>
                                <label className="upload-area-glass">
                                    <input 
                                        type="file" 
                                        multiple 
                                        accept="image/*"
                                        onChange={handleFileChange}
                                        className="file-input-hidden"
                                        disabled={totalImageCount >= 10}
                                    />
                                    <div style={{ background: 'rgba(255,255,255,0.1)', borderRadius: '50%', padding: '12px', display: 'inline-block', marginBottom: '0.5rem' }}>
                                        <UploadCloud color={totalImageCount >= 10 ? '#6b7280' : '#fff'} size={24} />
                                    </div>
                                    <p className="upload-instruction" style={{ margin: 0 }}>
                                        {totalImageCount >= 10 ? 'Image limit reached' : 'Click to upload images'}
                                    </p>
                                </label>
                                <div className="preview-grid-glass">
                                    {/* Existing Images */}
                                    {newProduct.images.map((url, idx) => (
                                        <div key={`existing-${idx}`} className="preview-item">
                                            <img src={url} alt="preview" className="preview-img-glass" />
                                            <button 
                                                type="button"
                                                onClick={() => removeExistingImage(idx)}
                                                className="remove-btn"
                                            >
                                                <X size={12} />
                                            </button>
                                        </div>
                                    ))}
                                    {/* New File Previews */}
                                    {imageFiles.map((file, idx) => (
                                        <div key={`new-${idx}`} className="preview-item">
                                            <img src={URL.createObjectURL(file)} alt="preview" className="preview-img-glass" />
                                            <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, background: 'rgba(0,0,0,0.6)', color: 'white', fontSize: '10px', padding: '2px 4px', textAlign: 'center' }}>NEW</div>
                                            <button 
                                                type="button"
                                                onClick={() => removeFile(idx)}
                                                className="remove-btn"
                                            >
                                                <X size={12} />
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            </div>
                            
                            <div className="form-group" style={{ marginBottom: '1.25rem' }}>
                                <label className="form-label">Description</label>
                                <textarea className="glass-input textarea-resize-none" 
                                    style={{ minHeight: '100px' }}
                                    placeholder="Describe your product..." value={newProduct.description} onChange={e => setNewProduct({...newProduct, description: e.target.value})} required />
                            </div>

                            <div className="form-actions" style={{ marginTop: '1rem', borderTop: 'none', display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '1rem' }}>
                                <button type="button" className="cancel-btn" onClick={() => setShowAddProduct(false)}>Cancel</button>
                                <button type="submit" className="save-btn" disabled={uploading}>
                                    {uploading ? (editingId ? 'Updating...' : 'Uploading...') : (editingId ? 'Update Product' : 'Save Product')}
                                </button>
                            </div>
                        </form>
                    </div>
                 </div>
            )}

            {/* Payout Request Modal */}
            {showPayoutModal && (
                <div className="modal-overlay">
                    <div className="modal-backdrop" onClick={() => setShowPayoutModal(false)}></div>
                    <div className="modal-form glass-panel animate-zoom-in" style={{ 
                        maxWidth: '420px', 
                        background: 'rgba(10, 10, 10, 0.95)', 
                        border: '1px solid rgba(255, 255, 255, 0.1)',
                        boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)' 
                    }}>
                        <div className="modal-header">
                            <h2 className="modal-title" style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                                <Wallet size={24} className="text-primary" /> Request Payout
                            </h2>
                            <button className="close-modal-btn" onClick={() => setShowPayoutModal(false)}>
                                <X size={20} />
                            </button>
                        </div>
                        
                        <form className="modal-body" onSubmit={handleRequestPayout} style={{ padding: '0' }}>
                            {/* Balance Card */}
                            <div className="balance-display-card" style={{ 
                                background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.15) 0%, rgba(255,255,255,0.03) 100%)',
                                borderRadius: '1rem', padding: '1.5rem', textAlign: 'center', marginBottom: '1.5rem',
                                border: '1px solid rgba(16, 185, 129, 0.3)'
                            }}>
                                <span style={{ fontSize: '0.75rem', color: '#9ca3af', textTransform: 'uppercase', letterSpacing: '0.1em', fontWeight: 600 }}>Available Balance</span>
                                <h3 style={{ fontSize: '2.5rem', fontWeight: '700', color: 'white', margin: '0.25rem 0', fontFamily: 'monospace' }}>
                                    ₦{profile.walletBalance.toLocaleString()}
                                </h3>
                            </div>

                            <div className="form-group">
                                <label className="form-label">Amount to Withdraw</label>
                                <div className="input-group" style={{ position: 'relative' }}>
                                    <span style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: '#9ca3af', fontWeight: 'bold' }}>₦</span>
                                    <input 
                                        type="number" 
                                        className="form-input" 
                                        style={{ paddingLeft: '2.5rem' }}
                                        placeholder="0.00" 
                                        value={payoutAmount}
                                        onChange={e => setPayoutAmount(e.target.value)}
                                        max={profile.walletBalance}
                                        required
                                    />
                                </div>
                                {/* Preset Buttons */}
                                <div className="preset-amounts" style={{ display: 'flex', gap: '0.5rem', marginTop: '0.75rem' }}>
                                    {[25, 50, 100].map(percent => (
                                        <button 
                                            key={percent}
                                            type="button"
                                            onClick={() => setPayoutAmount(Math.floor(profile.walletBalance * (percent / 100)))}
                                            style={{ 
                                                flex: 1, padding: '0.5rem', borderRadius: '0.5rem', 
                                                background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)',
                                                color: 'white', fontSize: '0.8rem', cursor: 'pointer', transition: 'all 0.2s', fontWeight: 500
                                            }}
                                            onMouseOver={e => e.currentTarget.style.background = 'rgba(255,255,255,0.1)'}
                                            onMouseOut={e => e.currentTarget.style.background = 'rgba(255,255,255,0.05)'}
                                        >
                                            {percent}%
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Bank Confirmation */}
                            {profile.bankDetails?.accountNumber ? (
                                <div className="bank-confirm-box" style={{ 
                                    padding: '1rem', background: 'rgba(255,255,255,0.03)', borderRadius: '0.75rem',
                                    border: '1px dashed rgba(255,255,255,0.1)', marginTop: '1.5rem', display: 'flex', alignItems: 'center', gap: '1rem'
                                }}>
                                    <div style={{ padding: '0.75rem', background: 'rgba(16, 185, 129, 0.1)', borderRadius: '50%', color: '#34d399' }}>
                                        <Building size={20} />
                                    </div>
                                    <div>
                                        <p style={{ fontSize: '0.75rem', color: '#9ca3af', marginBottom: '0.1rem' }}>Sending funds to:</p>
                                        <p style={{ fontSize: '0.9rem', fontWeight: '600', color: 'white' }}>{profile.bankDetails.bankName}</p>
                                        <p style={{ fontSize: '0.8rem', color: '#d1d5db', fontFamily: 'monospace' }}>{profile.bankDetails.accountNumber}</p>
                                    </div>
                                </div>
                            ) : (
                                <div className="alert-box warning" style={{ marginTop: '1.5rem', padding: '1rem', background: 'rgba(234, 179, 8, 0.1)', border: '1px solid rgba(234, 179, 8, 0.2)', borderRadius: '0.5rem', color: '#fcd34d', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                    <AlertTriangle size={18} />
                                    <span style={{ fontSize: '0.85rem' }}>Please add bank details in your profile first.</span>
                                </div>
                            )}

                            <div className="form-actions" style={{ marginTop: '2rem' }}>
                                <button type="button" className="cancel-btn" onClick={() => setShowPayoutModal(false)}>Cancel</button>
                                <button 
                                    type="submit" 
                                    className="save-btn" 
                                    disabled={!payoutAmount || payoutAmount <= 0 || Number(payoutAmount) > profile.walletBalance || !profile.bankDetails?.accountNumber}
                                    style={{ flex: 1 }}
                                >
                                    Confirm Withdrawal
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
            <ConfirmModal 
                isOpen={confirmModal.isOpen}
                onClose={() => setConfirmModal({ ...confirmModal, isOpen: false })}
                onConfirm={confirmModal.onConfirm}
                title={confirmModal.title}
                message={confirmModal.message}
                isDestructive={confirmModal.isDestructive}
                confirmText={confirmModal.confirmText}
            />
        </>
    );
};

export default VendorDashboard;
