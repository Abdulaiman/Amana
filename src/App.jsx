import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, Outlet } from 'react-router-dom';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import AppLayout from './components/AppLayout';
import ProtectedRoute from './components/ProtectedRoute';

// Pages
import Landing from './pages/Landing';
import Problem from './pages/Problem';
import Solution from './pages/Solution';
import HowItWorks from './pages/HowItWorks';
import Demo from './pages/Demo';
import VendorDemo from './pages/VendorDemo';
import Analytics from './pages/Analytics';
import TechSecurity from './pages/TechSecurity';
import Impact from './pages/Impact';
import Team from './pages/Team';
import FAQ from './pages/FAQ';
import Contact from './pages/Contact';

// Auth & Dashboards
import Login from './pages/Login';
import Register from './pages/Register';
import RetailerDashboard from './pages/RetailerDashboard';
import VendorDashboard from './pages/VendorDashboard';
import AdminDashboard from './pages/AdminDashboard';
import UserProfile from './pages/UserProfile';
import VendorProfile from './pages/VendorProfile';
import VendorProducts from './pages/VendorProducts';
import VendorTransactions from './pages/VendorTransactions';
import AdminTransactions from './pages/AdminTransactions';
import PaymentCallback from './pages/PaymentCallback';
import CompleteProfile from './pages/CompleteProfile';
import VendorCompleteProfile from './pages/VendorCompleteProfile';
import PsychometricTest from './pages/PsychometricTest';
import AdminPlayground from './pages/AdminPlayground';
import Marketplace from './pages/Marketplace';
import AgentDashboard from './pages/AgentDashboard';

function App() {
  return (
    <Router>
      <div className="app-container">
        <Routes>
            <Route path="/payment/callback" element={<PaymentCallback />} />
            
            {/* Public Routes with Standard Navbar/Footer */}
            <Route element={
                <>
                    <Navbar />
                    <main className="main-content">
                        <div className="page-container">
                            <Outlet />
                        </div>
                    </main>
                    <Footer />
                </>
            }>
                <Route path="/" element={<Landing />} />
                <Route path="/problem" element={<Problem />} />
                <Route path="/solution" element={<Solution />} />
                <Route path="/how-it-works" element={<HowItWorks />} />
                <Route path="/demo" element={<Demo />} />
                <Route path="/vendor-demo" element={<VendorDemo />} />
                <Route path="/analytics" element={<Analytics />} />
                <Route path="/tech-and-security" element={<TechSecurity />} />
                <Route path="/impact" element={<Impact />} />
                <Route path="/team" element={<Team />} />
                <Route path="/faq" element={<FAQ />} />
                <Route path="/contact" element={<Contact />} />
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />
            </Route>

            {/* Protected Dashboard Routes with AppLayout */}
            <Route element={<ProtectedRoute />}>
                <Route element={<AppLayout><Outlet /></AppLayout>}>
                    {/* Retailer Routes */}
                    <Route path="/dashboard" element={<RetailerDashboard />} />
                    <Route path="/profile" element={<UserProfile />} />
                    <Route path="/complete-profile" element={<CompleteProfile />} />
                    <Route path="/onboarding" element={<PsychometricTest />} />
                    <Route path="/marketplace" element={<Marketplace />} />
                    <Route path="/agent/tasks" element={<AgentDashboard />} />

                    {/* Vendor Routes */}
                    <Route path="/vendor" element={<ProtectedRoute allowedRoles={['vendor']} />}>
                        <Route index element={<VendorDashboard />} />
                    </Route>
                    <Route path="/products" element={<ProtectedRoute allowedRoles={['vendor']} />}>
                         <Route index element={<VendorProducts />} />
                    </Route>
                     <Route path="/vendor/transactions" element={<ProtectedRoute allowedRoles={['vendor']} />}>
                         <Route index element={<VendorTransactions />} />
                    </Route>
                    <Route path="/vendor/profile" element={<ProtectedRoute allowedRoles={['vendor']} />}>
                        <Route index element={<VendorProfile />} />
                    </Route>
                     <Route path="/vendor/complete-profile" element={<ProtectedRoute allowedRoles={['vendor']} />}>
                        <Route index element={<VendorCompleteProfile />} />
                    </Route>

                    {/* Admin Routes */}
                     <Route path="/admin" element={<ProtectedRoute allowedRoles={['admin']} />}>
                        <Route index element={<AdminDashboard />} />
                    </Route>
                     <Route path="/admin/transactions" element={<ProtectedRoute allowedRoles={['admin']} />}>
                        <Route index element={<AdminTransactions />} />
                    </Route>
                    <Route path="/admin-playground" element={<ProtectedRoute allowedRoles={['admin']} />}>
                        <Route index element={<AdminPlayground />} />
                    </Route>
                </Route>
            </Route>
        </Routes>
      </div>
    </Router>
  );
}

export default App;
