import React, { useState, useEffect } from 'react';
import { NavLink, useLocation, Navigate } from 'react-router-dom';
import { Home, ShoppingBag, User, LayoutDashboard, Settings, LogOut, Package, Zap, DollarSign, ShieldCheck } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import './AppLayout.css';
import ThemeToggle from './ThemeToggle';
import KYCStatusGate from './KYCStatusGate';

const AppLayout = ({ children }) => {
    const { user, isVendor, isAdmin, logout } = useAuth();
    const [profile, setProfile] = useState(null);
    const [loading, setLoading] = useState(true);
    const location = useLocation();

    useEffect(() => {
        const fetchProfile = async () => {
            try {
                const endpoint = isVendor ? '/vendor/profile' : '/retailer/profile';
                const { data } = await api.get(endpoint);
                setProfile(data);
            } catch (error) {
                console.error('Failed to load profile in layout', error);
            } finally {
                setLoading(false);
            }
        };
        if (user && !isAdmin) {
            fetchProfile();
        } else {
            setLoading(false);
        }
    }, [user, isVendor, isAdmin]);

    const isVerified = isAdmin || 
        (isVendor && profile?.verificationStatus === 'verified') || 
        (!isVendor && profile?.verificationStatus === 'approved');

    const isRestrictedPath = (path) => {
        if (isAdmin) return false;
        if (isVendor) {
            // Vendors can see their dashboard home and profile, but not products or transactions until verified
            const restricted = ['/products', '/vendor/transactions'];
            return restricted.some(r => path.startsWith(r));
        }
        // Retailers are restricted from marketplace
        return path.startsWith('/marketplace');
    };

    // Bottom Nav Items (Mobile)
    const navItems = [
        { path: isVendor ? '/vendor' : (isAdmin ? '/admin' : '/dashboard'), icon: <Home size={22} />, label: 'Home' },
        ...(isVendor ? [
            { path: '/products', icon: <Package size={22} />, label: 'Products' },
            { path: '/vendor/transactions', icon: <DollarSign size={22} />, label: 'History', hidden: !isVerified } 
        ] : []),
        ...(!isVendor && !isAdmin ? [
            { path: '/marketplace', icon: <ShoppingBag size={22} />, label: 'Shop', hidden: !isVerified }
        ] : []),
        ...(isAdmin ? [
            { path: '/admin/transactions', icon: <DollarSign size={22} />, label: 'Finance' }
        ] : []),
        ...(profile?.isAgent ? [
            { path: '/agent/tasks', icon: <ShieldCheck size={22} />, label: 'Agent Tasks' }
        ] : []),
        { path: isVendor ? '/vendor/profile' : '/profile', icon: <User size={22} />, label: 'Me' }, 
    ].filter(item => !item.hidden);

    if (loading) return <div className="loading-overlay"><div className="loading-spinner"></div></div>;

    const showGate = !isVerified && !isAdmin && isRestrictedPath(location.pathname);

    return (
        <div className="layout-root">
            
            {/* Background Ambience */}
            <div className="ambient-background">
                 <div className="glow-orb blue-glow"></div>
                 <div className="glow-orb teal-glow"></div>
            </div>

            {/* Desktop Sidebar */}
            <aside className="app-sidebar">
                <div className="sidebar-header">
                    <div className="logo-container">
                        <img src="/logo.png" alt="Amana" className="logo-img" style={{ width: '28px', height: '28px' }} />
                    </div>
                    <span className="brand-name">Amana</span>
                </div>

                <nav className="sidebar-nav">
                    {navItems.map((item) => (
                         <NavLink 
                            key={item.label} to={item.path}
                            className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
                         >
                            <span className="nav-icon">{item.icon}</span>
                            <span className="nav-label">{item.label}</span>
                            <div className="nav-glow"></div>
                         </NavLink>
                    ))}
                </nav>

                <div className="sidebar-footer">
                     <div className="footer-actions">
                        <ThemeToggle />
                        <button onClick={logout} className="logout-btn">
                            <LogOut size={20} />
                            <span className="btn-text">Logout</span>
                        </button>
                     </div>
                </div>
            </aside>

            {/* Main Content */}
            <main className="main-content">
                {/* Mobile Header */}
                <header className="mobile-header">
                    <div className="mobile-brand">
                         <div className="logo-container small">
                            <img src="/logo.png" alt="Amana" className="logo-img" style={{ width: '24px', height: '24px' }} />
                        </div>
                        <span className="brand-name">Amana</span>
                    </div>
                    <ThemeToggle />
                </header>
                
                <div className="page-container animate-fade-in">
                    {showGate ? (
                        <KYCStatusGate profile={profile} role={user.role} />
                    ) : (
                        children
                    )}
                </div>
            </main>

            {/* Mobile Bottom Nav */}
            <nav className="mobile-nav">
                {navItems.map((item) => (
                    <NavLink 
                        key={item.label} to={item.path}
                        className={({ isActive }) => `mobile-nav-item ${isActive ? 'active' : ''}`}
                    >
                        <div className="mobile-icon">
                            {item.icon}
                        </div>
                        {/* Active Indicator Dot */}
                        <div className={`active-dot ${location.pathname === item.path ? 'visible' : ''}`}></div>
                    </NavLink>
                ))}
                 <button onClick={logout} className="mobile-nav-item logout">
                    <LogOut size={22} />
                </button>
            </nav>
        </div>
    );
};

export default AppLayout;
