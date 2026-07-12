import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useNotifications } from '../context/NotificationContext';
import { 
  LayoutDashboard, 
  Package, 
  Repeat, 
  Calendar, 
  Wrench, 
  Users, 
  Building2, 
  Tags, 
  FileCheck2, 
  BarChart3, 
  Bell, 
  LogOut, 
  Menu, 
  X, 
  User, 
  ShieldAlert,
  ChevronDown
} from 'lucide-react';

export const Layout = ({ children }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);
  const [notifDropdownOpen, setNotifDropdownOpen] = useState(false);
  const { user, logout, switchRole } = useAuth();
  const { notifications, unreadCount, markAsRead, clearAll } = useNotifications();
  
  const location = useLocation();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  // Define sidebar links based on role permissions
  const menuItems = [
    { name: 'Dashboard', path: '/', icon: LayoutDashboard, roles: ['Admin', 'Asset Manager', 'Department Head', 'Employee'] },
    { name: 'Organization', path: '/organization-setup', icon: Building2, roles: ['Admin', 'Asset Manager', 'Department Head', 'Employee'] },
    { name: 'Assets', path: '/assets', icon: Package, roles: ['Admin', 'Asset Manager', 'Department Head', 'Employee'] },
    { name: 'Allocation & Transfer', path: '/allocations', icon: Repeat, roles: ['Admin', 'Asset Manager', 'Department Head', 'Employee'] },
    { name: 'Resource Booking', path: '/bookings', icon: Calendar, roles: ['Admin', 'Asset Manager', 'Department Head', 'Employee'] },
    { name: 'Maintenance', path: '/maintenance', icon: Wrench, roles: ['Admin', 'Asset Manager', 'Department Head', 'Employee'] },
    { name: 'Employees Registry', path: '/employees', icon: Users, roles: ['Admin', 'Asset Manager', 'Department Head'] },
    { name: 'Departments', path: '/departments', icon: Building2, roles: ['Admin', 'Asset Manager'] },
    { name: 'Categories', path: '/categories', icon: Tags, roles: ['Admin', 'Asset Manager'] },
    { name: 'System Audit Logs', path: '/audit-logs', icon: FileCheck2, roles: ['Admin', 'Asset Manager'] },
    { name: 'Audit', path: '/audit', icon: FileCheck2, roles: ['Admin', 'Asset Manager', 'Department Head', 'Employee'] },
    { name: 'Reports', path: '/reports', icon: BarChart3, roles: ['Admin', 'Asset Manager', 'Department Head'] },
    { name: 'Notifications', path: '/notifications', icon: Bell, roles: ['Admin', 'Asset Manager', 'Department Head', 'Employee'] },
  ];

  const filteredMenuItems = menuItems.filter(item => item.roles.includes(user?.role));

  return (
    <div className="flex h-screen overflow-hidden bg-brand-bg font-sans">
      
      {/* 1. Mobile Sidebar Backdrop */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 z-40 bg-slate-900/40 backdrop-blur-sm lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* 2. Sidebar Navigation */}
      <aside className={`fixed inset-y-0 left-0 z-40 flex w-64 flex-col border-r border-brand-border bg-brand-card transition-transform duration-300 lg:static lg:translate-x-0 ${
        sidebarOpen ? 'translate-x-0' : '-translate-x-full'
      }`}>
        
        {/* Sidebar Header */}
        <div className="flex h-16 items-center justify-between px-6 border-b border-brand-border">
          <Link to="/" className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary text-white shadow-md shadow-primary/20">
              <Package className="h-5 w-5" />
            </div>
            <span className="text-xl font-bold tracking-tight text-brand-text">AssetFlow</span>
          </Link>
          <button 
            className="rounded-lg p-1 text-slate-400 hover:bg-slate-50 hover:text-slate-600 lg:hidden"
            onClick={() => setSidebarOpen(false)}
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Sidebar Links */}
        <nav className="flex-1 space-y-1 px-4 py-6 overflow-y-auto">
          {filteredMenuItems.map((item) => {
            const isActive = location.pathname === item.path;
            return (
              <Link
                key={item.name}
                to={item.path}
                onClick={() => setSidebarOpen(false)}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 ${
                  isActive 
                    ? 'bg-blue-50 text-primary' 
                    : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                }`}
              >
                <item.icon className={`h-5 w-5 ${isActive ? 'text-primary' : 'text-slate-400'}`} />
                {item.name}
              </Link>
            );
          })}
        </nav>

        {/* Sidebar Footer User Details */}
        <div className="border-t border-brand-border p-4 bg-slate-50/50">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-slate-200 text-slate-700 font-bold">
              {user?.name?.split(' ').map(n => n[0]).join('')}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-brand-text truncate">{user?.name}</p>
              <p className="text-xs text-slate-400 truncate">{user?.role}</p>
            </div>
          </div>
        </div>
      </aside>

      {/* 3. Main Page Content Window */}
      <div className="flex flex-1 flex-col overflow-hidden">
        
        {/* Navbar */}
        <header className="flex h-16 items-center justify-between border-b border-brand-border bg-brand-card px-6">
          
          {/* Burger menu & title */}
          <div className="flex items-center gap-4">
            <button 
              className="rounded-lg p-1.5 text-slate-500 hover:bg-slate-50 lg:hidden"
              onClick={() => setSidebarOpen(true)}
            >
              <Menu className="h-6 w-6" />
            </button>
            <h1 className="text-lg font-bold text-brand-text hidden sm:block">
              {menuItems.find(item => item.path === location.pathname)?.name || 'AssetFlow ERP'}
            </h1>
          </div>

          {/* Right Header actions */}
          <div className="flex items-center gap-4">

            {/* Notifications Popover */}
            <div className="relative">
              <button 
                onClick={() => {
                  setNotifDropdownOpen(!notifDropdownOpen);
                  setProfileDropdownOpen(false);
                }}
                className="relative rounded-lg p-2 text-slate-500 hover:bg-slate-50 hover:text-slate-800 transition-colors"
              >
                <Bell className="h-5 w-5" />
                {unreadCount > 0 && (
                  <span className="absolute top-1.5 right-1.5 flex h-4 w-4 items-center justify-center rounded-full bg-rose-500 text-[10px] font-bold text-white">
                    {unreadCount}
                  </span>
                )}
              </button>

              {notifDropdownOpen && (
                <div className="absolute right-0 mt-2.5 w-80 rounded-xl border border-brand-border bg-brand-card p-4 shadow-xl ring-1 ring-black/5 z-50">
                  <div className="flex items-center justify-between border-b border-brand-border pb-2 mb-2">
                    <span className="font-semibold text-brand-text">Notifications</span>
                    <button 
                      onClick={clearAll}
                      className="text-xs text-slate-400 hover:text-primary transition-colors"
                    >
                      Clear all
                    </button>
                  </div>
                  <div className="max-h-60 overflow-y-auto space-y-2.5">
                    {notifications.length === 0 ? (
                      <p className="text-center py-4 text-sm text-slate-400">No new notifications</p>
                    ) : (
                      notifications.map(n => (
                        <div 
                          key={n.id} 
                          onClick={() => markAsRead(n.id)}
                          className={`p-2.5 rounded-lg text-xs cursor-pointer transition-colors ${
                            n.read ? 'bg-slate-50 text-slate-500' : 'bg-blue-50/50 text-slate-700 font-medium'
                          }`}
                        >
                          <p className="font-semibold">{n.title}</p>
                          <p className="mt-0.5">{n.message}</p>
                          <p className="mt-1 text-[10px] text-slate-400">{new Date(n.createdAt).toLocaleTimeString()}</p>
                        </div>
                      ))
                    )}
                  </div>
                  <div className="border-t border-brand-border mt-3 pt-2 text-center">
                    <Link 
                      to="/notifications" 
                      onClick={() => setNotifDropdownOpen(false)}
                      className="text-xs font-semibold text-primary hover:underline"
                    >
                      View all notifications
                    </Link>
                  </div>
                </div>
              )}
            </div>

            {/* Profile Dropdown */}
            <div className="relative">
              <button 
                onClick={() => {
                  setProfileDropdownOpen(!profileDropdownOpen);
                  setNotifDropdownOpen(false);
                }}
                className="flex items-center gap-1.5 rounded-lg p-1 hover:bg-slate-50 transition-colors"
              >
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-slate-200 text-slate-700 font-bold text-sm">
                  {user?.name?.split(' ').map(n => n[0]).join('')}
                </div>
                <ChevronDown className="h-4 w-4 text-slate-400 hidden sm:block" />
              </button>

              {profileDropdownOpen && (
                <div className="absolute right-0 mt-2.5 w-48 rounded-xl border border-brand-border bg-brand-card py-1.5 shadow-xl ring-1 ring-black/5 z-50">
                  <div className="border-b border-brand-border px-4 py-2 text-xs text-slate-500">
                    Signed in as <span className="font-semibold text-slate-800 block truncate">{user?.email}</span>
                  </div>
                  <button 
                    onClick={handleLogout}
                    className="flex w-full items-center gap-2.5 px-4 py-2 text-left text-sm text-rose-600 hover:bg-rose-50 transition-colors"
                  >
                    <LogOut className="h-4 w-4" />
                    Sign out
                  </button>
                </div>
              )}
            </div>

          </div>
        </header>

        {/* Content Body */}
        <main className="flex-1 overflow-y-auto p-6 bg-brand-bg">
          {children}
        </main>
      </div>

    </div>
  );
};
