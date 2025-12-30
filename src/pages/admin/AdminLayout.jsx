import React from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { LayoutDashboard, Users, Calculator, Briefcase, Settings, LogOut, Search, Activity, AlertTriangle, ShoppingBag } from 'lucide-react';
import './AdminConsole.css';

const AdminLayout = () => {
    const { logout, user } = useAuth();
    const navigate = useNavigate();

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    return (
        <div className="admin-layout">
            {/* Sidebar */}
            <aside className="admin-sidebar">
                <div className="sidebar-header">
                    <span className="brand-text">
                        Amana God Mode
                    </span>
                </div>

                <nav className="sidebar-nav">
                    <div className="nav-section-label">Overview</div>
                    <NavItem to="/admin/dashboard" icon={<LayoutDashboard size={20} />} label="Dashboard" />
                    <NavItem to="/admin/analytics" icon={<Calculator size={20} />} label="Financials" />
                    
                    <div className="nav-section-label">Management</div>
                    <NavItem to="/admin/users" icon={<Users size={20} />} label="User Universe" />
                    <NavItem to="/admin/aap" icon={<ShoppingBag size={20} />} label="Agent Purchases" />
                    <NavItem to="/admin/debt" icon={<AlertTriangle size={20} />} label="Debt Manager" />
                    
                    <div className="nav-section-label">Operations</div>
                    <NavItem to="/admin/audit" icon={<Activity size={20} />} label="Audit Logs" />
                    <NavItem to="/admin/ops" icon={<Settings size={20} />} label="System Ops" />
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
                    <h1 style={{ fontSize: '1.1rem', fontWeight: 600 }}>Console</h1>
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

const NavItem = ({ to, icon, label }) => (
    <NavLink 
        to={to} 
        className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
    >
        {icon}
        {label}
    </NavLink>
);

export default AdminLayout;
