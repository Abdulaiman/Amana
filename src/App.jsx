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
import Banned from './pages/Banned';
import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword';
import RetailerDashboard from './pages/RetailerDashboard';
import RetailerTransactions from './pages/RetailerTransactions';
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
import AgentAAPCreate from './pages/AgentAAPCreate';
import AgentAAPLink from './pages/AgentAAPLink';
import AgentAAPDetail from './pages/AgentAAPDetail';
import AdminLayout from './pages/admin/AdminLayout';
import UserManagement from './pages/admin/UserManagement';
import AdminAnalytics from './pages/admin/AdminAnalytics';
import DebtManager from './pages/admin/DebtManager';
import AdminOperations from './pages/admin/AdminOperations';
import UserProfileView from './pages/admin/UserProfileView';
import AdminAAPDashboard from './pages/admin/AdminAAPDashboard';

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
                <Route path="/banned" element={<Banned />} />
                <Route path="/forgot-password" element={<ForgotPassword />} />
                <Route path="/reset-password/:token" element={<ResetPassword />} />
            </Route>

            {/* Protected Dashboard Routes with AppLayout */}
            <Route element={<ProtectedRoute />}>
                <Route element={<AppLayout><Outlet /></AppLayout>}>
                    {/* Retailer Routes */}
                    <Route path="/dashboard" element={<RetailerDashboard />} />
                    <Route path="/transactions" element={<RetailerTransactions />} />
                    <Route path="/profile" element={<UserProfile />} />
                    <Route path="/complete-profile" element={<CompleteProfile />} />
                    <Route path="/onboarding" element={<PsychometricTest />} />
                    <Route path="/marketplace" element={<Marketplace />} />
                    <Route path="/agent/tasks" element={<AgentDashboard />} />
                    <Route path="/agent/aap/new" element={<AgentAAPCreate />} />
                    <Route path="/agent/aap/:id" element={<AgentAAPDetail />} />
                    <Route path="/agent/aap/:id/link" element={<AgentAAPLink />} />

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

                </Route>
            </Route>

            {/* Admin Console (Dedicated Layout) */}
            <Route path="/admin" element={<ProtectedRoute allowedRoles={['admin']}><AdminLayout /></ProtectedRoute>}>
                <Route index element={<Navigate to="dashboard" replace />} />
                <Route path="dashboard" element={<AdminDashboard />} />
                <Route path="users" element={<UserManagement />} />
                <Route path="user/:id" element={<UserProfileView />} />
                <Route path="analytics" element={<AdminAnalytics />} />
                <Route path="debt" element={<DebtManager />} />
                <Route path="aap" element={<AdminAAPDashboard />} />
                <Route path="ops" element={<AdminOperations />} />
                <Route path="audit" element={<AdminOperations />} />
                {/* Legacy redirects or specific sub-pages can go here */}
            </Route>
        </Routes>
      </div>
    </Router>
  );
}

export default App;
