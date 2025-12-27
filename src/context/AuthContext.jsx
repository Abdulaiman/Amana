import React, { createContext, useState, useEffect, useContext } from 'react';
import api from '../services/api';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check local storage on mount
    const storedUser = JSON.parse(localStorage.getItem('user'));
    if (storedUser) {
      setUser(storedUser);
    }
    setLoading(false);
  }, []);

  // Login Function
  const login = async (email, password) => {
    try {
      const { data } = await api.post('/auth/login', { email, password });
      setUser(data);
      localStorage.setItem('user', JSON.stringify(data));
      return data;
    } catch (error) {
      throw error.response?.data?.message || 'Login failed';
    }
  };

  // Register Retailer
  const registerRetailer = async (userData) => {
    try {
      const { data } = await api.post('/auth/register', userData);
      setUser(data);
      localStorage.setItem('user', JSON.stringify(data));
      return data;
    } catch (error) {
      throw error.response?.data?.message || 'Registration failed';
    }
  };

  // Register Vendor
  const registerVendor = async (vendorData) => {
    try {
      const { data } = await api.post('/auth/register-vendor', vendorData);
      setUser(data);
      localStorage.setItem('user', JSON.stringify(data));
      return data;
    } catch (error) {
       throw error.response?.data?.message || 'Registration failed';
    }
  };

  // Switch Role
  const switchRole = async () => {
    try {
      const { data } = await api.post('/auth/switch-role');
      setUser(data);
      localStorage.setItem('user', JSON.stringify(data));
      // Refresh to clear any role-specific state if needed 
      // or just redirect to dashboard
      window.location.href = data.role === 'vendor' ? '/vendor' : '/dashboard';
      return data;
    } catch (error) {
       throw error.response?.data?.message || 'Role switch failed';
    }
  };

  // Logout
  const logout = () => {
    setUser(null);
    localStorage.removeItem('user');
    window.location.href = '/login';
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        login,
        registerRetailer,
        registerVendor,
        switchRole,
        logout,
        isAuthenticated: !!user,
        isVendor: user?.role === 'vendor',
        hasOtherRole: user?.hasOtherRole,
        isAdmin: user?.role === 'admin'
      }}
    >
      {!loading && children}
    </AuthContext.Provider>
  );
};
