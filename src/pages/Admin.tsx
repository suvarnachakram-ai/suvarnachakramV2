import React, { useState } from 'react';
import { Routes, Route, Link, useLocation } from 'react-router-dom';
import {
  LayoutDashboard,
  Disc3,
  FileText,
  HelpCircle,
  Users,
  Activity,
  LogOut,
  Clock,
  Trophy,
  MessageSquare,
  Menu,
  X,
  Bell
} from 'lucide-react';
import { useAdmin } from '../hooks/useAdmin';
import AdminDraws from '../components/admin/AdminDraws';
import AdminNews from '../components/admin/AdminNews';
import AdminFAQ from '../components/admin/AdminFAQ';
import AdminDashboard from '../components/admin/AdminDashboard';
import AdminTimings from '../components/admin/AdminTimings';
import AdminContacts from '../components/admin/AdminContacts';
import AdminUsers from '../components/admin/AdminUsers';
import AdminActivity from '../components/admin/AdminActivity';
import AdminNotifications from '../components/admin/AdminNotifications';
import GlassCard from '../components/GlassCard';

export default function Admin() {
  const { user, logout } = useAdmin();
  const location = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const navigation = [
    { name: 'Dashboard', href: '/admin', icon: LayoutDashboard },
    { name: 'Draw Timings', href: '/admin/timings', icon: Clock },
    { name: 'Results', href: '/admin/draws', icon: Trophy },
    { name: 'Notifications', href: '/admin/notifications', icon: Bell },
    { name: 'News', href: '/admin/news', icon: FileText },
    { name: 'Help/FAQ', href: '/admin/faq', icon: HelpCircle },
    { name: 'Contacts', href: '/admin/contacts', icon: MessageSquare },
    { name: 'Users', href: '/admin/users', icon: Users },
    { name: 'Activity Log', href: '/admin/activity', icon: Activity },
  ];

  const isActive = (href: string) => {
    if (href === '/admin') return location.pathname === '/admin';
    return location.pathname.startsWith(href);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      {/* Mobile Menu Button */}
      <div className="lg:hidden fixed top-4 left-4 z-50">
        <button
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          className="p-2 rounded-lg bg-slate-800/90 backdrop-blur-sm border border-white/10 text-white hover:bg-slate-700/90 transition-colors"
        >
          {isMobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
      </div>

      <div className="flex">
        {/* Sidebar */}
        <div className={`
          fixed lg:static inset-y-0 left-0 z-40
          w-64 min-h-screen glass-card border-r border-white/10
          transform transition-transform duration-300 ease-in-out
          ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
        `}>
          <div className="p-6">
            <div className="flex items-center space-x-2 mb-8">
              <div className="relative h-6 w-6">
                <img 
                  src="/outer.png" 
                  alt="Suvarna Chakra Outer" 
                  className="absolute inset-0 h-6 w-6 object-contain animate-spin-slow"
                  style={{
                    filter: 'drop-shadow(0 0 6px rgba(251, 191, 36, 0.6))',
                    animation: 'spin 3s linear infinite'
                  }}
                />
                {/*<img 
                  src="/inner.png" 
                  alt="Suvarna Chakra Inner" 
                  className="absolute inset-0 h-6 w-6 object-contain animate-spin-slow"
                  style={{
                    filter: 'drop-shadow(0 0 8px rgba(251, 191, 36, 0.8))',
                    animation: 'spin 2s linear infinite reverse'
                  }}
                />*/}
              </div>
              <div className="flex flex-col">
                <span className="font-bold text-lg gradient-text">Admin Panel</span>
                <span className="text-xs text-yellow-400" style={{ fontFamily: 'serif' }}>സുവർണ്ണ ചക്രം</span>
              </div>
            </div>

            <nav className="space-y-2">
              {navigation.map((item) => {
                const Icon = item.icon;
                return (
                  <Link
                    key={item.name}
                    to={item.href}
                    onClick={() => setIsMobileMenuOpen(false)}
                    className={`flex items-center space-x-3 px-3 py-2 rounded-lg transition-all ${
                      isActive(item.href)
                        ? 'bg-yellow-500/20 text-yellow-400 border-l-2 border-yellow-400'
                        : 'text-gray-300 hover:text-yellow-400 hover:bg-white/5'
                    }`}
                  >
                    <Icon className="h-4 w-4" />
                    <span className="font-medium">{item.name}</span>
                  </Link>
                );
              })}
            </nav>
          </div>

          <div className="absolute bottom-0 left-0 right-0 p-6 border-t border-white/10">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-sm font-medium text-white">{user?.name}</div>
                <div className="text-xs text-gray-400">{user?.role}</div>
              </div>
              <button
                onClick={logout}
                className="text-gray-400 hover:text-red-400 transition-colors"
                title="Logout"
              >
                <LogOut className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Overlay */}
        {isMobileMenuOpen && (
          <div
            className="fixed inset-0 bg-black/50 z-30 lg:hidden"
            onClick={() => setIsMobileMenuOpen(false)}
          />
        )}

        {/* Main Content */}
        <div className="flex-1 p-4 sm:p-6 lg:p-8 pt-16 lg:pt-8">
          <Routes>
            <Route index element={<AdminDashboard />} />
            <Route path="timings" element={<AdminTimings />} />
            <Route path="draws" element={<AdminDraws />} />
            <Route path="notifications" element={<AdminNotifications />} />
            <Route path="news" element={<AdminNews />} />
            <Route path="faq" element={<AdminFAQ />} />
            <Route path="contacts" element={<AdminContacts />} />
            <Route path="users" element={<AdminUsers />} />
            <Route path="activity" element={<AdminActivity />} />
            <Route path="*" element={
              <GlassCard className="p-12 text-center">
                <h2 className="text-2xl font-bold text-white mb-4">Coming Soon</h2>
                <p className="text-gray-400">This feature is under development.</p>
              </GlassCard>
            } />
          </Routes>
        </div>
      </div>
    </div>
  );
}