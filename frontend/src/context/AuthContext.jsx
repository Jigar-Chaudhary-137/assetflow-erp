import React, { createContext, useContext, useState, useEffect } from 'react';
import { authService } from '../services/authService';
import { getMockData } from '../services/api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const initializeAuth = async () => {
      try {
        const storedToken = localStorage.getItem('assetflow_token');
        const storedUser = localStorage.getItem('assetflow_user');
        
        if (storedToken && storedUser) {
          setToken(storedToken);
          setUser(JSON.parse(storedUser));
        }
      } catch (err) {
        console.error('Failed to initialize authentication', err);
      } finally {
        setLoading(false);
      }
    };
    initializeAuth();
  }, []);

  const login = async (email, password) => {
    setError(null);
    setLoading(true);
    try {
      const data = await authService.login(email, password);
      setUser(data.user);
      setToken(data.token);
      return data.user;
    } catch (err) {
      setError(err.message || 'Authentication failed');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    setLoading(true);
    try {
      await authService.logout();
      setUser(null);
      setToken(null);
    } catch (err) {
      console.error('Logout error', err);
    } finally {
      setLoading(false);
    }
  };

  // Switch role utility helper for quick testing during hackathon evaluations
  const switchRole = (roleName) => {
    const employees = getMockData('employees');
    const matchedUser = employees.find(e => e.role === roleName);
    
    if (matchedUser) {
      localStorage.setItem('assetflow_user', JSON.stringify(matchedUser));
      setUser(matchedUser);
      
      const newToken = `mock-jwt-token-for-${roleName.replace(' ', '_')}-${matchedUser.id}`;
      localStorage.setItem('assetflow_token', newToken);
      setToken(newToken);
      
      // Reload page or trigger context update to refresh lists
      window.location.reload();
    }
  };

  const value = {
    user,
    token,
    isAuthenticated: !!token,
    loading,
    error,
    login,
    logout,
    switchRole,
    isAdmin: user?.role === 'Admin',
    isAssetManager: user?.role === 'Asset Manager' || user?.role === 'Admin',
    isDeptHead: user?.role === 'Department Head' || user?.role === 'Admin',
    isEmployee: user?.role === 'Employee'
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
