import React, { useEffect, useState } from 'react';
import api from '../services/api';
import { ShoppingCart, Search, Filter, X, Check, ChevronRight } from 'lucide-react';
import './Marketplace.css';

const Marketplace = () => {
    const [products, setProducts] = useState([]);
    const [filteredProducts, setFilteredProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('All');
    const [selectedProduct, setSelectedProduct] = useState(null);
    const [purchaseLoading, setPurchaseLoading] = useState(false);
    const [user, setUser] = useState(null);
    const [viewMode, setViewMode] = useState('details'); // 'details' | 'checkout'
    const [acceptedTerms, setAcceptedTerms] = useState(false); // Murabaha agreement state

    const categories = ['All', 'Electronics', 'Phones', 'Laptops', 'Fashion', 'Home'];

    useEffect(() => {
        const fetchProducts = async () => {
             try {
                 const { data } = await api.get('/products');
                 setProducts(data);
                 setFilteredProducts(data);
             } catch (e) {
                 console.error(e);
             } finally {
                 setLoading(false);
             }
        };
        fetchProducts();
        fetchUserProfile();
    }, []);

    const fetchUserProfile = async () => {
        try {
            const { data } = await api.get('/retailer/profile');
            setUser(data);
        } catch (e) {
            console.error('Failed to load user profile', e);
        }
    };

    useEffect(() => {
        let result = products;
        if (selectedCategory !== 'All') {
            result = result.filter(p => p.category === selectedCategory);
        }
        if (searchTerm) {
            result = result.filter(p => p.name.toLowerCase().includes(searchTerm.toLowerCase()));
        }
        setFilteredProducts(result);
    }, [searchTerm, selectedCategory, products]);

    const [activeImage, setActiveImage] = useState(null);

    // Reset active image when product changes
    useEffect(() => {
        if (selectedProduct && selectedProduct.images?.length > 0) {
            setActiveImage(selectedProduct.images[0]);
        }
    }, [selectedProduct]);

    const handleProductClick = (product) => {
        setSelectedProduct(product);
        setViewMode('details');
    };

    const handleBackToMarketplace = () => {
        setSelectedProduct(null);
        setActiveImage(null);
    };

    const confirmPurchase = async () => {
        setPurchaseLoading(true);
        try {
            await api.post('/orders', {
                orderItems: [{
                    name: selectedProduct.name,
                    qty: 1,
                    image: selectedProduct.images[0] || 'placeholder.jpg',
                    price: selectedProduct.price,
                    product: selectedProduct._id,
                    vendor: selectedProduct.vendor._id
                }],
                itemsPrice: selectedProduct.price,
                markupPercentage: user ? getMarkupPercentage(user.amanaScore) : 5,
                markupAmount: calculateFinance(selectedProduct.price).markup,
                totalRepaymentAmount: calculateFinance(selectedProduct.price).total,
                totalPrice: selectedProduct.price // Base price for reference
            });
            alert('Order Placed! The vendor will process it shortly.');
            setSelectedProduct(null);
        } catch (error) {
            alert(error.response?.data?.message || 'Purchase Failed');
        } finally {
            setPurchaseLoading(false);
        }
    };

    const getMarkupPercentage = (score) => {
        if (!score) return 5;
        if (score >= 80) return 2.5;
        if (score >= 60) return 3.5;
        return 5;
    };

    const calculateFinance = (price) => {
        const rate = user ? getMarkupPercentage(user.amanaScore) : 5;
        // Logic: Markup is calculated on the base price
        const markup = price * (rate / 100);
        const total = price + markup;
        return { markup, total, rate };
    };

    if (loading) return (
        <div className="flex items-center justify-center min-h-screen bg-[var(--color-bg)]">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[var(--color-primary)]"></div>
        </div>
    );

    return (
        <div className="marketplace-container">
            <div className="marketplace-content">
                {/* Conditional Header - Hide Search when in Details Mode for cleaner look */}
                {!selectedProduct && (
                    <div className="mp-header animate-fade-in">
                        <div>
                            <h1 className="mp-title">Marketplace</h1>
                            <p className="mp-subtitle">Browse premium products from verified vendors</p>
                        </div>
                        <div className="search-bar-wrapper">
                            <Search className="search-icon" size={18} />
                            <input 
                                type="text" 
                                placeholder="Search products..." 
                                className="search-input"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>
                    </div>
                )}

                {/* Main Content Area - Swaps between Grid and Details Page */}
                {!selectedProduct ? (
                    <div className="mp-layout animate-fade-in">
                        {/* Sidebar Filters */}
                        <aside className="filter-sidebar">
                            <div className="glass-panel filter-panel">
                                <div className="filter-header">
                                    <Filter size={18} /> Filters
                                </div>
                                
                                <div className="filter-group">
                                    <h4 className="filter-group-title">Categories</h4>
                                    <div className="category-list">
                                        {categories.map(cat => (
                                            <button 
                                                key={cat}
                                                onClick={() => setSelectedCategory(cat)}
                                                className={`category-btn ${selectedCategory === cat ? 'active' : ''}`}
                                            >
                                                {cat}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </aside>

                        {/* Product Grid */}
                        <main className="product-main">
                            {filteredProducts.length === 0 ? (
                                <div className="no-products">
                                    <p className="no-results-text">No products found matching your criteria.</p>
                                    <button onClick={() => {setSearchTerm(''); setSelectedCategory('All');}} className="clear-filter-btn">
                                        Clear Filters
                                    </button>
                                </div>
                            ) : (
                                <div className="product-grid">
                                    {filteredProducts.map(product => (
                                        <div key={product._id} className="product-card group" onClick={() => handleProductClick(product)}>
                                            <div className="product-image-box">
                                                {product.images[0] ? (
                                                    <img src={product.images[0]} alt={product.name} className="product-img" />
                                                ) : (
                                                    <div className="no-image-placeholder">
                                                        No Image
                                                    </div>
                                                )}
                                                {/* Quick Actions */}
                                                <div className="product-overlay">
                                                    <span className="text-xs font-bold text-white bg-black/50 px-2 py-1 rounded backdrop-blur-sm">View Details</span>
                                                </div>
                                            </div>

                                            <div className="product-info">
                                                <div className="product-header">
                                                    <span className="product-category">{product.category}</span>
                                                    <h3 className="product-name">{product.name}</h3>
                                                </div>
                                                
                                                <p className="product-desc">{product.description}</p>
                                                
                                                <div className="product-footer">
                                                    <span className="product-price">₦{product.price.toLocaleString()}</span>
                                                    <button 
                                                        className="add-cart-btn"
                                                        onClick={(e) => {
                                                            e.stopPropagation(); // Prevent card click
                                                            setSelectedProduct(product);
                                                            setActiveImage(product.images[0]);
                                                            setViewMode('checkout'); // Direct to checkout
                                                        }}
                                                    >
                                                        <ShoppingCart size={18} />
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </main>
                    </div>
                ) : (
                    // --- FULL PAGE PRODUCT DETAILS VIEW ---
                    <div className="product-details-page animate-zoom-in">
                        {/* Navigation Header */}
                        {/* Navigation Header - Only show if NOT in checkout mode to avoid double back buttons */ }
                        {viewMode === 'details' && (
                            <div className="details-page-header">
                                <button onClick={handleBackToMarketplace} className="back-btn">
                                    &larr; Back to Marketplace
                                </button>
                            </div>
                        )}

                        {viewMode === 'details' ? (
                            <div className="product-details-container glass-panel p-6">
                                <div className="details-header-section">
                                    <div className="product-category-tag">{selectedProduct.category}</div>
                                    <h1 className="details-product-title">{selectedProduct.name}</h1>
                                </div>

                                <div className="details-main-grid">
                                    {/* Left Column: Gallery */}
                                    <div className="details-left">
                                        <div className="detail-image-box main-gallery-image">
                                            {activeImage ? (
                                                <img src={activeImage} className="detail-main-img" alt={selectedProduct.name} />
                                            ) : (
                                                <div className="detail-no-img">No Image Available</div>
                                            )}
                                        </div>
                                        
                                        {/* Thumbnail Strip */}
                                        {selectedProduct.images && selectedProduct.images.length > 1 && (
                                            <div className="thumbnail-strip">
                                                {selectedProduct.images.map((img, idx) => (
                                                    <button 
                                                        key={idx} 
                                                        onClick={() => setActiveImage(img)}
                                                        className={`thumb-btn ${activeImage === img ? 'active' : ''}`}
                                                    >
                                                        <img src={img} alt={`thumb-${idx}`} className="thumb-img" />
                                                    </button>
                                                ))}
                                            </div>
                                        )}
                                        
                                        {/* Vendor Card */}
                                        <div className="vendor-card mt-4">
                                            <div className="vendor-avatar">
                                                {selectedProduct.vendor?.businessName?.charAt(0) || 'V'}
                                            </div>
                                            <div>
                                                <p className="vendor-label">Sold/Fulfilled by</p>
                                                <h4 className="vendor-name-large">{selectedProduct.vendor?.businessName || 'Verified Vendor'}</h4>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Right Column: Specs & Actions */}
                                    <div className="details-right">
                                        <div className="info-panel glass-panel">
                                            <div className="price-tag-large">
                                                ₦{selectedProduct.price.toLocaleString()}
                                            </div>
                                            
                                            <div className="specs-grid">
                                                <div className="spec-item">
                                                    <span className="spec-label">Condition</span>
                                                    <span className="spec-value">Brand New</span>
                                                </div>
                                                <div className="spec-item">
                                                    <span className="spec-label">Review Status</span>
                                                    <span className="spec-value">Verified</span>
                                                </div>
                                            </div>

                                            <button 
                                                onClick={() => setViewMode('checkout')}
                                                className="buy-now-main-btn"
                                            >
                                                Start Purchase <ChevronRight size={24} />
                                            </button>
                                            <p className="finance-note text-center mt-3 text-sm text-gray-400">
                                                Murabaha Financing Available
                                            </p>
                                        </div>

                                        {/* Description Section */}
                                        <div className="description-section">
                                            <h3 className="section-heading">Product Description</h3>
                                            <div className="description-content">
                                                {selectedProduct.description || "No specific description provided by the vendor."}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ) : (
                            // --- CHECKOUT / FINANCING VIEW ---
                            <div className="checkout-view animate-fade-in">
                                <div className="details-page-header">
                                    <button 
                                        onClick={() => setViewMode('details')} 
                                        className="back-btn"
                                    >
                                        &larr; Return to Product
                                    </button>
                                </div>
                                
                                <div className="text-center mb-8">
                                    <h2 className="checkout-header-title">Financing Agreement</h2>
                                    <p className="text-gray-400 text-sm">Review the Murabaha terms and confirm your purchase.</p>
                                </div>

                                {/* Financing Offer Card */}
                                <div className="financing-offer-card">
                                    <div className="offer-header">
                                        <div className="flex justify-between items-center mb-4">
                                            <div className="flex items-center gap-3">
                                                 <div className="modal-product-img-box">
                                                    {selectedProduct.images[0] && <img src={selectedProduct.images[0]} className="modal-product-img" />}
                                                </div>
                                                <div>
                                                    <h3 className="modal-product-name">{selectedProduct.name}</h3>
                                                    <span className="finance-badge">Murabaha Financing</span>
                                                </div>
                                            </div>
                                        </div>

                                        {user && (
                                            <div className="credit-health-row">
                                                <div className="health-stat">
                                                    <span className="stat-label">Your Amana Score</span>
                                                    <span className="stat-value text-blue-400">{user.amanaScore || 0}/100</span>
                                                </div>
                                                <div className="health-stat border-l border-gray-700 pl-4">
                                                    <span className="stat-label">Quality Tier</span>
                                                    <span className="stat-value text-white">
                                                        {(user.amanaScore || 0) >= 80 ? 'Premium (2.5%)' : (user.amanaScore || 0) >= 60 ? 'Standard (3.5%)' : 'Basic (5.0%)'}
                                                    </span>
                                                </div>
                                            </div>
                                        )}
                                    </div>

                                    {/* Financial Breakdown (Contract Style) */}
                                    <div className="contract-breakdown">
                                        <div className="contract-row">
                                            <span>Principal Amount (Item Price)</span>
                                            <span className="font-mono">₦{selectedProduct.price.toLocaleString()}</span>
                                        </div>
                                        <div className="contract-row">
                                            <span>Profit Markup ({(user ? getMarkupPercentage(user.amanaScore) : 5)}%)</span>
                                            <span className="font-mono text-green-400">+ ₦{calculateFinance(selectedProduct.price).markup.toLocaleString()}</span>
                                        </div>
                                        <div className="contract-divider"></div>
                                        <div className="contract-total-row">
                                            <span>Total Repayment Consignment</span>
                                            <span className="total-mono">₦{calculateFinance(selectedProduct.price).total.toLocaleString()}</span>
                                        </div>
                                    </div>

                                    {/* Credit Check Warning */}
                                    {user && (user.creditLimit - user.usedCredit) < calculateFinance(selectedProduct.price).total && (
                                        <div className="credit-warning-box">
                                            ⚠️ Insufficient Credit Limit. Available: ₦{(user.creditLimit - user.usedCredit).toLocaleString()}
                                        </div>
                                    )}

                                    {/* Agreement Section */}
                                    <div className="agreement-section">
                                        <label className="agreement-checkbox-wrapper">
                                            <input 
                                                type="checkbox" 
                                                className="agreement-checkbox"
                                                checked={acceptedTerms}
                                                onChange={(e) => setAcceptedTerms(e.target.checked)}
                                            />
                                            <span className="agreement-text">
                                                I agree to the <strong>Murabaha Financing</strong> terms. I understand that the item is purchased by Amana and resold to me at the agreed markup rate of <strong>{(user ? getMarkupPercentage(user.amanaScore) : 5)}%</strong>.
                                            </span>
                                        </label>
                                    </div>

                                    <button 
                                        onClick={confirmPurchase} 
                                        disabled={!acceptedTerms || purchaseLoading || (user && (user.creditLimit - user.usedCredit) < calculateFinance(selectedProduct.price).total)}
                                        className="confirm-purchase-btn"
                                    >
                                        {purchaseLoading ? 'Processing Agreement...' : 'Accept Offer & Confirm Order'}
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};

export default Marketplace;
