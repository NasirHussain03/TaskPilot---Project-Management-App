import React, { useState, useEffect, useRef } from 'react';
import { Link, useLocation, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  FiHome, FiFolder, FiCheckSquare, FiUsers, FiUser,
  FiLogOut, FiMessageSquare, FiCalendar, FiBell,
  FiMail, FiCheck, FiMenu, FiX, FiChevronRight
} from 'react-icons/fi';
import API from '../services/api';

const Layout = () => {
  const { user, logout } = useAuth();
  const location = useLocation();
  const [notifications, setNotifications] = useState([]);
  const [showNotifDropdown, setShowNotifDropdown] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const dropdownRef = useRef(null);

  const navigation = [
    { name: 'Dashboard',       href: '/',         icon: FiHome },
    { name: 'Projects',        href: '/projects', icon: FiFolder },
    { name: 'Tasks',           href: '/tasks',    icon: FiCheckSquare },
    { name: 'Calendar',        href: '/calendar', icon: FiCalendar },
    { name: 'Team Chat',       href: '/chat',     icon: FiMessageSquare },
    { name: 'Team Management', href: '/team',     icon: FiUsers },
    { name: 'My Profile',      href: '/profile',  icon: FiUser },
  ];

  const fetchNotifications = async () => {
    try {
      const { data } = await API.get('/notifications');
      setNotifications(Array.isArray(data) ? data : []);
    } catch (e) {
      console.error('Error fetching notifications:', e);
    }
  };

  useEffect(() => {
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 10000);

    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowNotifDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);

    return () => {
      clearInterval(interval);
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Close sidebar on route change (mobile)
  useEffect(() => {
    setSidebarOpen(false);
  }, [location.pathname]);

  const handleMarkAllRead = async () => {
    try {
      await API.put('/notifications/read-all');
      setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
    } catch (e) {
      console.error(e);
    }
  };

  const unreadCount = notifications.filter((n) => !n.read).length;

  const pageName = location.pathname === '/'
    ? 'Dashboard'
    : location.pathname.substring(1).replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase());

  const SidebarContent = () => (
    <div className="flex flex-col h-full">
      {/* Brand */}
      <div className="p-5 border-b border-slate-800/60">
        <div className="flex items-center justify-between">
          <Link to="/" className="flex items-center gap-3" onClick={() => setSidebarOpen(false)}>
            <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-violet-600 to-indigo-700 flex items-center justify-center shadow-lg">
              <svg viewBox="0 0 24 24" className="w-4 h-4 text-white fill-none stroke-current stroke-2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M22 2L11 13" /><path d="M22 2L15 22L11 13L2 9L22 2Z" />
              </svg>
            </div>
            <span className="text-lg font-black shimmer-text">TaskPilot</span>
          </Link>
          {/* Close button (mobile only) */}
          <button
            onClick={() => setSidebarOpen(false)}
            className="md:hidden p-1.5 text-slate-500 hover:text-slate-300 hover:bg-slate-800 rounded-xl transition-all"
          >
            <FiX className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
        <p className="text-[10px] text-slate-600 font-bold uppercase tracking-widest px-3 pb-2 pt-1">Navigation</p>
        {navigation.map((item) => {
          const isActive = location.pathname === item.href;
          const Icon = item.icon;
          return (
            <Link
              key={item.name}
              to={item.href}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold transition-all duration-200 group ${
                isActive
                  ? 'bg-violet-600/15 text-violet-400 border border-violet-500/20'
                  : 'text-slate-500 hover:text-slate-200 hover:bg-slate-800/50 border border-transparent'
              }`}
            >
              <div className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 transition-colors ${
                isActive ? 'bg-violet-600/20' : 'bg-slate-800/50 group-hover:bg-slate-800'
              }`}>
                <Icon className="w-3.5 h-3.5" />
              </div>
              <span className="flex-1">{item.name}</span>
              {isActive && <FiChevronRight className="w-3.5 h-3.5 text-violet-400/60" />}
            </Link>
          );
        })}
      </nav>

      {/* User Card & Logout */}
      <div className="p-3 border-t border-slate-800/60">
        <div className="flex items-center gap-3 p-3 rounded-xl bg-slate-900/60 border border-slate-800/60 mb-2">
          <div className="h-9 w-9 rounded-xl bg-gradient-to-br from-violet-600/40 to-indigo-600/30 border border-violet-500/20 flex items-center justify-center font-bold text-violet-400 uppercase text-sm shrink-0">
            {user?.name?.[0] || 'U'}
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-sm font-bold text-slate-200 truncate">{user?.name}</p>
            <span className={`text-[9px] uppercase font-bold tracking-widest px-1.5 py-0.5 rounded-md ${
              user?.role === 'Admin'
                ? 'bg-violet-600/20 text-violet-400 border border-violet-500/20'
                : 'bg-slate-800 text-slate-500 border border-slate-700/50'
            }`}>
              {user?.role}
            </span>
          </div>
        </div>
        <button
          onClick={logout}
          className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-rose-600/8 hover:bg-rose-600/15 text-rose-400/80 hover:text-rose-400 border border-rose-500/10 hover:border-rose-500/20 rounded-xl text-xs font-bold uppercase tracking-wider transition-all cursor-pointer"
        >
          <FiLogOut className="w-3.5 h-3.5" />
          Sign Out
        </button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#020817] text-slate-100 flex">
      {/* ── Mobile Overlay ────────────────────────────────── */}
      {sidebarOpen && (
        <div
          className="md:hidden fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-40"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* ── Sidebar (Desktop: fixed, Mobile: slide-in drawer) */}
      <aside
        className={`
          fixed md:sticky md:top-0 top-0 left-0 h-screen md:h-screen z-50 md:z-auto
          w-64 bg-slate-950/95 md:bg-slate-950/60 backdrop-blur-xl
          border-r border-slate-800/60
          transition-transform duration-300 ease-out shrink-0
          ${sidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
        `}
      >
        <SidebarContent />
      </aside>

      {/* ── Main Content ──────────────────────────────────── */}
      <div className="flex-1 flex flex-col min-w-0 min-h-screen">
        {/* Top Header */}
        <header className="sticky top-0 z-30 h-14 border-b border-slate-800/60 bg-[#020817]/80 backdrop-blur-xl flex items-center justify-between px-4 sm:px-6 shrink-0">
          <div className="flex items-center gap-3">
            {/* Hamburger (mobile) */}
            <button
              onClick={() => setSidebarOpen(true)}
              className="md:hidden p-2 text-slate-400 hover:text-slate-200 hover:bg-slate-800/60 rounded-xl transition-all cursor-pointer"
            >
              <FiMenu className="w-5 h-5" />
            </button>

            {/* Breadcrumb */}
            <div className="flex items-center gap-2 text-sm">
              <span className="text-slate-600 font-medium hidden sm:block">Workspace</span>
              <span className="text-slate-700 hidden sm:block">/</span>
              <span className="font-semibold text-slate-200">{pageName}</span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Notification Bell */}
            <div className="relative" ref={dropdownRef}>
              <button
                onClick={() => {
                  setShowNotifDropdown(!showNotifDropdown);
                  if (!showNotifDropdown) fetchNotifications();
                }}
                className="relative p-2 text-slate-400 hover:text-slate-200 hover:bg-slate-800/60 rounded-xl transition-all cursor-pointer"
                title="Notifications"
              >
                <FiBell className="w-4.5 h-4.5" />
                {unreadCount > 0 && (
                  <span className="notification-badge" />
                )}
              </button>

              {/* Dropdown */}
              {showNotifDropdown && (
                <div className="absolute right-0 mt-2 w-80 sm:w-96 glass-card rounded-2xl shadow-2xl z-50 animate-fade-in flex flex-col max-h-[420px] overflow-hidden">
                  {/* Header */}
                  <div className="p-4 border-b border-slate-800/60 flex items-center justify-between shrink-0">
                    <div className="flex items-center gap-2">
                      <div className="w-7 h-7 rounded-lg bg-violet-600/20 border border-violet-500/20 flex items-center justify-center">
                        <FiMail className="w-3.5 h-3.5 text-violet-400" />
                      </div>
                      <div>
                        <h4 className="text-xs font-bold text-slate-100">Mail Simulator Log</h4>
                        <p className="text-[10px] text-slate-500">Dispatched workspace emails</p>
                      </div>
                    </div>
                    {unreadCount > 0 && (
                      <button
                        onClick={handleMarkAllRead}
                        className="text-[10px] font-bold text-violet-400 hover:text-violet-300 flex items-center gap-1 transition-colors cursor-pointer px-2 py-1 rounded-lg hover:bg-violet-600/10"
                      >
                        <FiCheck className="w-3 h-3" />
                        Mark all read
                      </button>
                    )}
                  </div>

                  {/* Items */}
                  <div className="flex-1 overflow-y-auto divide-y divide-slate-800/40">
                    {notifications.length > 0 ? (
                      notifications.map((n) => (
                        <div
                          key={n._id}
                          className={`p-3 hover:bg-slate-800/20 transition-all ${!n.read ? 'bg-violet-950/10' : ''}`}
                        >
                          {!n.read && (
                            <div className="flex items-center gap-1.5 mb-1.5">
                              <div className="w-1.5 h-1.5 rounded-full bg-violet-500 shrink-0" />
                              <span className="text-[9px] font-bold text-violet-400 uppercase tracking-wider">New</span>
                            </div>
                          )}
                          <div className="flex justify-between items-start gap-2 mb-0.5">
                            <p className="text-[11px] font-bold text-slate-200 leading-tight flex-1">{n.subject}</p>
                            <span className="text-[9px] text-slate-600 shrink-0 font-medium">
                              {new Date(n.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </span>
                          </div>
                          <p className="text-[10px] text-slate-500 truncate">To: {n.recipient}</p>
                        </div>
                      ))
                    ) : (
                      <div className="p-8 text-center space-y-2">
                        <FiMail className="w-8 h-8 text-slate-700 mx-auto" />
                        <p className="text-xs text-slate-500">No emails dispatched yet.</p>
                        <p className="text-[10px] text-slate-600">Create tasks or add comments to trigger emails.</p>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* User avatar (header shortcut) */}
            <Link to="/profile" className="flex items-center gap-2 py-1 px-2 rounded-xl hover:bg-slate-800/50 transition-all">
              <div className="h-7 w-7 rounded-lg bg-gradient-to-br from-violet-600/40 to-indigo-600/30 border border-violet-500/20 flex items-center justify-center font-bold text-violet-400 uppercase text-xs">
                {user?.name?.[0] || 'U'}
              </div>
              <span className="hidden sm:block text-xs font-semibold text-slate-400">{user?.name?.split(' ')[0]}</span>
            </Link>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 bg-[#020817]">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default Layout;
