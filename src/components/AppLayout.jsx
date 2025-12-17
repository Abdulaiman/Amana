import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { Home, ShoppingBag, User, LayoutDashboard, Settings, LogOut, Package, Zap, DollarSign } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import './AppLayout.css';
import ThemeToggle from './ThemeToggle';

const AppLayout = ({ children }) => {
    const { user, isVendor, isAdmin, logout } = useAuth();
    const location = useLocation();

    // Bottom Nav Items (Mobile)
    const navItems = [
        { path: isVendor ? '/vendor' : (isAdmin ? '/admin' : '/dashboard'), icon: <Home size={22} />, label: 'Home' },
        ...(isVendor ? [
            { path: '/products', icon: <Package size={22} />, label: 'Products' },
            { path: '/vendor/transactions', icon: <DollarSign size={22} />, label: 'History' } 
        ] : []),
        ...(!isVendor && !isAdmin ? [
            { path: '/marketplace', icon: <ShoppingBag size={22} />, label: 'Shop' }
        ] : []),
        ...(isAdmin ? [
            { path: '/admin/transactions', icon: <DollarSign size={22} />, label: 'Finance' }
        ] : []),
        { path: isVendor ? '/vendor/profile' : '/profile', icon: <User size={22} />, label: 'Me' }, 
    ];

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
                    {children}
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
                        <div className={`active-dot ${window.location.pathname === item.path ? 'visible' : ''}`}></div>
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
