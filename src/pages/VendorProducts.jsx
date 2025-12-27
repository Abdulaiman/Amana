import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import './VendorDashboard.css'; // Reuse vendor styling
import './AdminDashboard.css'; // Reuse admin table styling
import { Plus, Search, Edit2, Trash2, Package, AlertTriangle, Check, X, ChevronLeft, Filter, ToggleLeft, ToggleRight, UploadCloud, Image as ImageIcon } from 'lucide-react';
import { useToast } from '../context/ToastContext';
import ConfirmModal from '../components/ConfirmModal';

const VendorProducts = () => {
    const navigate = useNavigate();
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterStatus, setFilterStatus] = useState('all'); // 'all', 'active', 'outofstock'
    const { addToast } = useToast();
    const [confirmModal, setConfirmModal] = useState({ isOpen: false, title: '', message: '', onConfirm: null, isDestructive: false });

    // Modal State
    const [showModal, setShowModal] = useState(false);
    const [editingProduct, setEditingProduct] = useState(null);
    const [formData, setFormData] = useState({
        name: '', price: '', description: '', countInStock: 10, category: 'General', images: []
    });
    
    // Image State
    const [imageFiles, setImageFiles] = useState([]);
    const [uploading, setUploading] = useState(false);

    useEffect(() => {
        fetchProducts();
    }, []);

    const fetchProducts = async () => {
        try {
            const { data } = await api.get('/vendor/products');
            setProducts(data);
        } catch (e) {
            console.error('Failed to load products', e);
        } finally {
            setLoading(false);
        }
    };

    const handleToggleActive = async (product) => {
        try {
            const newStatus = !product.isActive;
            await api.put(`/products/${product._id}`, { 
                isActive: newStatus,
                countInStock: newStatus ? (product.countInStock > 0 ? product.countInStock : 1) : 0
            });
            fetchProducts();
            addToast('Product status updated', 'success');
        } catch (e) {
            addToast('Failed to update product', 'error');
        }
    };

    const executeDeleteProduct = async (id) => {
        try {
            await api.delete(`/products/${id}`);
            fetchProducts();
            addToast('Product deleted', 'success');
        } catch (e) {
            addToast('Failed to delete', 'error');
        }
    };

    const handleDeleteProduct = (id) => {
        setConfirmModal({
            isOpen: true,
            title: 'Delete Product',
            message: 'Are you sure you want to delete this product?',
            onConfirm: () => executeDeleteProduct(id),
            isDestructive: true,
            confirmText: 'Delete'
        });
    };

    const openAddModal = () => {
        setEditingProduct(null);
        setFormData({ name: '', price: '', description: '', countInStock: 10, category: 'General', images: [] });
        setImageFiles([]);
        setShowModal(true);
    };

    const openEditModal = (product) => {
        setEditingProduct(product);
        setFormData({
            name: product.name,
            price: product.price,
            description: product.description,
            countInStock: product.countInStock,
            category: product.category,
            images: product.images || []
        });
        setImageFiles([]);
        setShowModal(true);
    };

    const handleFileChange = (e) => {
        const files = Array.from(e.target.files);
        if (files.length === 0) return;

        // Prevent exceeding limit
        const totalImages = (formData.images?.length || 0) + imageFiles.length + files.length;
        if (totalImages > 10) {
            addToast('You can only have up to 10 images per product.', 'error');
            return;
        }

        setImageFiles(prev => [...prev, ...files]);
        // Reset input to allow re-selecting same file if needed in future
        e.target.value = null; 
    };

    const removeNewImage = (index) => {
        setImageFiles(prev => prev.filter((_, i) => i !== index));
    };

    const removeExistingImage = (index) => {
        setFormData(prev => ({
            ...prev,
            images: prev.images.filter((_, i) => i !== index)
        }));
    };

    const uploadImages = async () => {
        if (imageFiles.length === 0) return [];
        const formDataUpload = new FormData();
        imageFiles.forEach(file => formDataUpload.append('files', file));
        
        try {
            const { data } = await api.post('/upload', formDataUpload, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            return data;
        } catch (error) {
            console.error("Upload failed", error);
            throw new Error("Image upload failed");
        }
    };

    const handleSaveProduct = async (e) => {
        e.preventDefault();
        setUploading(true);

        try {
            let newImageUrls = [];
            if (imageFiles.length > 0) {
                newImageUrls = await uploadImages();
            }

            const payload = {
                ...formData,
                images: [...formData.images, ...newImageUrls], // Combine existing + new
                isActive: Number(formData.countInStock) > 0
            };

            if (editingProduct) {
                await api.put(`/products/${editingProduct._id}`, payload);
            } else {
                await api.post('/products', payload);
            }

            setShowModal(false);
            fetchProducts();
            addToast(editingProduct ? 'Product Updated' : 'Product Created', 'success');
        } catch (e) {
            console.error(e);
            addToast('Failed to save product', 'error');
        } finally {
            setUploading(false);
        }
    };

    // Filtering Logic
    const filteredProducts = products.filter(p => {
        const matchesSearch = p.name.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesFilter = 
            filterStatus === 'all' || 
            (filterStatus === 'active' && p.isActive && p.countInStock > 0) ||
            (filterStatus === 'outofstock' && (!p.isActive || p.countInStock <= 0));
        return matchesSearch && matchesFilter;
    });

    const stats = {
        total: products.length,
        active: products.filter(p => p.isActive && p.countInStock > 0).length,
        outOfStock: products.filter(p => !p.isActive || p.countInStock <= 0).length
    };

    if (loading) return (
        <div className="loading-container">
            <div className="loading-spinner"></div>
        </div>
    );

    const totalImageCount = (formData.images?.length || 0) + imageFiles.length;

    return (
        <div className="admin-dashboard-container animate-fade-in">
            <div className="admin-max-width">
                {/* Header */}
                <header className="vendor-header" style={{ marginBottom: '2rem' }}>
                    <div>
                        <button onClick={() => navigate('/vendor')} className="back-btn" style={{ 
                            marginBottom: '1rem', 
                            display: 'flex', 
                            alignItems: 'center', 
                            gap: '0.5rem', 
                            background: 'rgba(255,255,255,0.05)', 
                            border: '1px solid rgba(255,255,255,0.1)',
                            padding: '0.4rem 0.8rem',
                            borderRadius: '0.5rem',
                            color: '#9ca3af',
                            cursor: 'pointer',
                            fontSize: '0.85rem'
                        }}>
                            <ChevronLeft size={16} /> Back
                        </button>
                        <h1 className="admin-title">Product Management</h1>
                        <p className="admin-subtitle">Manage your inventory</p>
                    </div>
                    <button onClick={openAddModal} className="add-product-main-btn">
                        <Plus size={20} /> Add Product
                    </button>
                </header>

                {/* Stats */}
                <div className="admin-stats-grid" style={{ marginBottom: '2rem' }}>
                    <div className="stat-card-wrapper gradient-teal" onClick={() => setFilterStatus('all')} style={{ cursor: 'pointer' }}>
                        <div className={`admin-stat-card ${filterStatus === 'all' ? 'ring-active' : ''}`}>
                            <div className="admin-stat-icon accent"><Package size={28} /></div>
                            <div>
                                <h3 className="admin-stat-value">{stats.total}</h3>
                                <p className="admin-stat-label">All Products</p>
                            </div>
                        </div>
                    </div>
                    <div className="stat-card-wrapper gradient-purple" onClick={() => setFilterStatus('active')} style={{ cursor: 'pointer' }}>
                        <div className={`admin-stat-card ${filterStatus === 'active' ? 'ring-active' : ''}`}>
                            <div className="admin-stat-icon purple"><Check size={28} /></div>
                            <div>
                                <h3 className="admin-stat-value">{stats.active}</h3>
                                <p className="admin-stat-label">Active</p>
                            </div>
                        </div>
                    </div>
                    <div className="stat-card-wrapper gradient-blue" onClick={() => setFilterStatus('outofstock')} style={{ cursor: 'pointer' }}>
                        <div className={`admin-stat-card ${filterStatus === 'outofstock' ? 'ring-active' : ''}`}>
                            <div className="admin-stat-icon orange"><AlertTriangle size={28} /></div>
                            <div>
                                <h3 className="admin-stat-value">{stats.outOfStock}</h3>
                                <p className="admin-stat-label">Out of Stock</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Table Panel */}
                <div className="product-management-content">
                    <div className="content-filters-bar glass-panel">
                        <div className="filter-pills">
                            <button 
                                onClick={() => setFilterStatus('all')} 
                                className={`filter-pill ${filterStatus === 'all' ? 'active' : ''}`}
                            >
                                All Products
                            </button>
                            <button 
                                onClick={() => setFilterStatus('active')} 
                                className={`filter-pill ${filterStatus === 'active' ? 'active' : ''}`}
                            >
                                Active
                            </button>
                            <button 
                                onClick={() => setFilterStatus('outofstock')} 
                                className={`filter-pill ${filterStatus === 'outofstock' ? 'active' : ''}`}
                            >
                                Out of Stock
                            </button>
                        </div>
                        <div className="search-box-premium">
                            <Search size={18} />
                            <input 
                                type="text" 
                                placeholder="Search products..." 
                                value={searchTerm}
                                onChange={e => setSearchTerm(e.target.value)}
                            />
                        </div>
                    </div>

                    {filteredProducts.length === 0 ? (
                        <div className="empty-state-card glass-panel">
                            <div className="empty-illustration">
                                <Package size={64} strokeWidth={1} />
                            </div>
                            <h3>No Products Found</h3>
                            <p>Try adjusting your search or filters to find what you're looking for.</p>
                            <button onClick={openAddModal} className="add-product-main-btn">
                                <Plus size={20} /> Add Your First Product
                            </button>
                        </div>
                    ) : (
                        <div className="products-grid">
                            {filteredProducts.map(product => (
                                <div key={product._id} className="modern-product-card glass-panel group">
                                    <div className="product-card-image">
                                        {product.images?.[0] ? (
                                            <img src={product.images[0]} alt={product.name} />
                                        ) : (
                                            <div className="no-image-visual">
                                                <ImageIcon size={40} />
                                            </div>
                                        )}
                                        <div className="product-status-tag">
                                            <span className={`status-pill ${product.isActive && product.countInStock > 0 ? 'active' : 'inactive'}`}>
                                                {product.isActive && product.countInStock > 0 ? 'In Stock' : 'Out of Stock'}
                                            </span>
                                        </div>
                                        <div className="product-price-tag">
                                            ₦{product.price.toLocaleString()}
                                        </div>
                                        <div className="product-card-actions-overlay">
                                            <button className="overlay-action-btn edit" onClick={() => openEditModal(product)} title="Edit Product">
                                                <Edit2 size={18} />
                                            </button>
                                            <button className="overlay-action-btn delete" onClick={() => handleDeleteProduct(product._id)} title="Delete Product">
                                                <Trash2 size={18} />
                                            </button>
                                        </div>
                                    </div>
                                    <div className="product-card-info">
                                        <div className="product-card-top">
                                            <span className="product-category-label">{product.category}</span>
                                            <div className="product-stock-counter">
                                                <span className="count">{product.countInStock}</span>
                                                <span className="label">available</span>
                                            </div>
                                        </div>
                                        <h4 className="product-name-title">{product.name}</h4>
                                        <div className="product-card-footer">
                                            <button 
                                                onClick={() => handleToggleActive(product)}
                                                className={`toggle-status-bar ${product.isActive && product.countInStock > 0 ? 'active' : 'inactive'}`}
                                            >
                                                {product.isActive && product.countInStock > 0 ? (
                                                  <><Check size={14} /> Active on Marketplace</>
                                                ) : (
                                                  <><X size={14} /> Hidden from Shop</>
                                                )}
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>

            {/* Premium Glass Modal */}
            {showModal && (
                <div className="glass-modal-overlay">
                    <div className="glass-modal-content animate-zoom-in">
                        <div className="modal-header" style={{ margin: 0, padding: '1.5rem', borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
                            <h2 className="modal-title">{editingProduct ? 'Edit Product' : 'Add New Product'}</h2>
                            <button type="button" onClick={() => setShowModal(false)} className="close-modal-btn">
                                <X size={24} />
                            </button>
                        </div>
                        
                        <form onSubmit={handleSaveProduct} className="modal-body">
                            <div className="form-group" style={{ marginBottom: '1.25rem' }}>
                                <label className="form-label">Product Name</label>
                                <input className="glass-input" 
                                    placeholder="e.g. iPhone 15 Pro" 
                                    value={formData.name} 
                                    onChange={e => setFormData({...formData, name: e.target.value})} 
                                    required 
                                />
                            </div>

                            <div className="form-grid-2" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1.25rem' }}>
                                <div className="form-group">
                                    <label className="form-label">Price (₦)</label>
                                    <input className="glass-input" 
                                        type="number" 
                                        placeholder="0.00" 
                                        value={formData.price} 
                                        onChange={e => setFormData({...formData, price: e.target.value})} 
                                        required 
                                    />
                                </div>
                                <div className="form-group">
                                    <label className="form-label">Stock Quantity</label>
                                    <input className="glass-input" 
                                        type="number" 
                                        placeholder="10" 
                                        value={formData.countInStock} 
                                        onChange={e => setFormData({...formData, countInStock: e.target.value})} 
                                        required 
                                    />
                                </div>
                            </div>
                            
                            <div className="form-group" style={{ marginBottom: '1.25rem' }}>
                                <label className="form-label">Category</label>
                                <select className="glass-input"
                                    value={formData.category} 
                                    onChange={e => setFormData({...formData, category: e.target.value})}
                                >
                                    <option value="General">General</option>
                                    <option value="Electronics">Electronics</option>
                                    <option value="Phones">Phones</option>
                                    <option value="Fashion">Fashion</option>
                                    <option value="Beauty">Beauty</option>
                                    <option value="Home">Home</option>
                                </select>
                            </div>

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
                                        <UploadCloud size={24} color={totalImageCount >= 10 ? '#6b7280' : '#fff'} />
                                    </div>
                                    <p className="upload-instruction" style={{ margin: 0 }}>
                                        {totalImageCount >= 10 ? 'Image limit reached' : 'Click to upload images'}
                                    </p>
                                </label>

                                <div className="preview-grid-glass">
                                    {/* Existing Images */}
                                    {formData.images.map((url, idx) => (
                                        <div key={`existing-${idx}`} className="preview-item">
                                            <img src={url} alt="preview" className="preview-img-glass" />
                                            <button type="button" onClick={() => removeExistingImage(idx)} className="remove-btn">
                                                <X size={12} />
                                            </button>
                                        </div>
                                    ))}
                                    {/* New Images */}
                                    {imageFiles.map((file, idx) => (
                                        <div key={`new-${idx}`} className="preview-item">
                                            <img src={URL.createObjectURL(file)} alt="preview" className="preview-img-glass" />
                                            <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, background: 'rgba(0,0,0,0.6)', color: 'white', fontSize: '10px', padding: '2px 4px', textAlign: 'center' }}>NEW</div>
                                            <button type="button" onClick={() => removeNewImage(idx)} className="remove-btn">
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
                                    placeholder="Describe your product..." 
                                    value={formData.description} 
                                    onChange={e => setFormData({...formData, description: e.target.value})} 
                                    required 
                                />
                            </div>

                            <div className="form-actions" style={{ marginTop: '1rem', borderTop: 'none', display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '1rem' }}>
                                <button type="button" className="cancel-btn" onClick={() => setShowModal(false)}>Cancel</button>
                                <button type="submit" className="save-btn" disabled={uploading}>
                                    {uploading ? 'Saving Product...' : (editingProduct ? 'Update Product' : 'Save Product')}
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
        </div>
    );
};

export default VendorProducts;
