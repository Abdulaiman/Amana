import React, { useState } from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { LayoutDashboard, Users, Calculator, Briefcase, Settings, LogOut, Search, Activity, AlertTriangle, ShoppingBag, XCircle, Menu, X } from 'lucide-react';
import './AdminConsole.css';

const AdminLayout = () => {
    const { logout, user } = useAuth();
    const navigate = useNavigate();
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    const toggleSidebar = () => {
        setIsSidebarOpen(!isSidebarOpen);
    };

    const closeSidebar = () => {
        setIsSidebarOpen(false);
    };

    return (
        <div className="admin-layout">
            {/* Sidebar Overlay for Mobile */}
            {isSidebarOpen && (
                <div className="admin-sidebar-overlay" onClick={closeSidebar}></div>
            )}

            {/* Sidebar */}
            <aside className={`admin-sidebar ${isSidebarOpen ? 'open' : ''}`}>
                <div className="sidebar-header">
                    <span className="brand-text">
                        Amana Admin Console
                    </span>
                    <button className="sidebar-close-btn" onClick={closeSidebar} aria-label="Close menu">
                        <X size={20} />
                    </button>
                </div>

                <nav className="sidebar-nav">
                    <div className="nav-section-label">Overview</div>
                    <NavItem to="/admin/dashboard" icon={<LayoutDashboard size={20} />} label="Dashboard" onClick={closeSidebar} />
                    <NavItem to="/admin/analytics" icon={<Calculator size={20} />} label="Financials" onClick={closeSidebar} />
                    
                    <div className="nav-section-label">Management</div>
                    <NavItem to="/admin/users" icon={<Users size={20} />} label="User Universe" onClick={closeSidebar} />
                    <NavItem to="/admin/aap" icon={<ShoppingBag size={20} />} label="Agent Purchases" onClick={closeSidebar} />
                    <NavItem to="/admin/cancellations" icon={<XCircle size={20} />} label="Cancellations" onClick={closeSidebar} />
                    <NavItem to="/admin/debt" icon={<AlertTriangle size={20} />} label="Debt Manager" onClick={closeSidebar} />
                    
                    <div className="nav-section-label">Operations</div>
                    <NavItem to="/admin/audit" icon={<Activity size={20} />} label="Audit Logs" onClick={closeSidebar} />
                    <NavItem to="/admin/ops" icon={<Settings size={20} />} label="System Ops" onClick={closeSidebar} />
                </nav>

                <div className="sidebar-footer">
                    <div className="user-profile-mini">
                        <div className="avatar-circle">
                            {user?.name?.charAt(0) || 'A'}
                        </div>
                        <div style={{ flex: 1, minWidth: 0 }}>
                            <p style={{ fontWeight: 600, fontSize: '0.9rem' }} className="truncate">{user?.name}</p>
                            <p style={{ fontSize: '0.75rem' }} className="text-muted truncate">Super Admin</p>
                        </div>
                    </div>
                    <button 
                        onClick={handleLogout}
                        className="btn btn-outline logout-btn"
                    >
                        <LogOut size={18} />
                        Sign Out
                    </button>
                </div>
            </aside>

            {/* Main Content */}
            <main className="admin-main">
                <header className="admin-header">
                    <button className="sidebar-toggle-btn" onClick={toggleSidebar} aria-label="Open menu">
                        <Menu size={24} />
                    </button>
                    <h1 className="admin-header-title">Console</h1>
                    <div className="search-container">
                        <Search className="search-icon" size={18} />
                        <input 
                            type="text" 
                            placeholder="Universal Search (Name, Phone, ID)..." 
                            className="search-input"
                            onKeyDown={(e) => {
                                if (e.key === 'Enter') {
                                    navigate(`/admin/users?search=${e.target.value}`);
                                }
                            }}
                        />
                    </div>
                </header>
                <div className="admin-content">
                    <Outlet />
                </div>
            </main>
        </div>
    );
};

const NavItem = ({ to, icon, label, onClick }) => (
    <NavLink 
        to={to} 
        className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
        onClick={onClick}
    >
        {icon}
        {label}
    </NavLink>
);

export default AdminLayout;
