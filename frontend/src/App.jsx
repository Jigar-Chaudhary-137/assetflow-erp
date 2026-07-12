import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { NotificationProvider } from './context/NotificationContext';
import { ProtectedRoute } from './components/ProtectedRoute';
import { Layout } from './components/Layout';

// Screen Pages
import { Login } from './pages/Login';
import { Register } from './pages/Register';
import { Dashboard } from './pages/Dashboard';
import { Assets } from './pages/Assets';
import { Allocations } from './pages/Allocations';
import { Bookings } from './pages/Bookings';
import { Maintenance } from './pages/Maintenance';
import { Employees } from './pages/Employees';
import { Departments } from './pages/Departments';
import { Categories } from './pages/Categories';
import { AuditLogs } from './pages/AuditLogs';
import { Reports } from './pages/Reports';
import { Notifications } from './pages/Notifications';
import { Audit } from './pages/Audit';
import { ReportsAnalytics } from './pages/ReportsAnalytics';
import { OrganizationSetup } from './pages/OrganizationSetup';

function App() {
  return (
    <Router>
      <AuthProvider>
        <NotificationProvider>
          <Routes>
            {/* Public Auth routes */}
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />

            {/* Protected ERP system routes */}
            <Route 
              path="/" 
              element={
                <ProtectedRoute>
                  <Layout>
                    <Dashboard />
                  </Layout>
                </ProtectedRoute>
              } 
            />
            
            <Route 
              path="/assets" 
              element={
                <ProtectedRoute>
                  <Layout>
                    <Assets />
                  </Layout>
                </ProtectedRoute>
              } 
            />

            <Route 
              path="/allocations" 
              element={
                <ProtectedRoute allowedRoles={['Admin', 'Asset Manager', 'Department Head']}>
                  <Layout>
                    <Allocations />
                  </Layout>
                </ProtectedRoute>
              } 
            />

            <Route 
              path="/bookings" 
              element={
                <ProtectedRoute allowedRoles={['Admin', 'Asset Manager', 'Department Head', 'Employee']}>
                  <Layout>
                    <Bookings />
                  </Layout>
                </ProtectedRoute>
              } 
            />

            <Route 
              path="/maintenance" 
              element={
                <ProtectedRoute allowedRoles={['Admin', 'Asset Manager', 'Department Head', 'Employee']}>
                  <Layout>
                    <Maintenance />
                  </Layout>
                </ProtectedRoute>
              } 
            />

            <Route 
              path="/employees" 
              element={
                <ProtectedRoute allowedRoles={['Admin']}>
                  <Layout>
                    <Employees />
                  </Layout>
                </ProtectedRoute>
              } 
            />

            <Route 
              path="/organization-setup" 
              element={
                <ProtectedRoute allowedRoles={['Admin']}>
                  <Layout>
                    <OrganizationSetup />
                  </Layout>
                </ProtectedRoute>
              } 
            />

            <Route 
              path="/departments" 
              element={
                <ProtectedRoute allowedRoles={['Admin']}>
                  <Layout>
                    <Departments />
                  </Layout>
                </ProtectedRoute>
              } 
            />

            <Route 
              path="/categories" 
              element={
                <ProtectedRoute allowedRoles={['Admin']}>
                  <Layout>
                    <Categories />
                  </Layout>
                </ProtectedRoute>
              } 
            />

            <Route 
              path="/audit-logs" 
              element={
                <ProtectedRoute allowedRoles={['Admin']}>
                  <Layout>
                    <AuditLogs />
                  </Layout>
                </ProtectedRoute>
              } 
            />

            <Route 
              path="/audit" 
              element={
                <ProtectedRoute allowedRoles={['Admin', 'Asset Manager', 'Department Head', 'Employee']}>
                  <Layout>
                    <Audit />
                  </Layout>
                </ProtectedRoute>
              } 
            />

            <Route 
              path="/reports" 
              element={
                <ProtectedRoute allowedRoles={['Admin', 'Asset Manager', 'Department Head', 'Employee']}>
                  <Layout>
                    <Reports />
                  </Layout>
                </ProtectedRoute>
              } 
            />

            <Route 
              path="/notifications" 
              element={
                <ProtectedRoute allowedRoles={['Admin', 'Asset Manager', 'Department Head', 'Employee']}>
                  <Layout>
                    <Notifications />
                  </Layout>
                </ProtectedRoute>
              } 
            />

            {/* Catch-all route */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </NotificationProvider>
      </AuthProvider>
    </Router>
  );
}

export default App;
