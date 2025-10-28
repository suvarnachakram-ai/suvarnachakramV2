import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Trophy, FileText, Clock, MessageSquare, Menu, X } from 'lucide-react';
import { useData } from '../../context/DataContext';
import { isDrawToday } from '../../utils/time';
import GlassCard from '../GlassCard';

export default function AdminDashboard() {
  const { draws, news, contacts } = useData();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const todaysDraws = draws.filter(draw => isDrawToday(draw.date));
  const publishedToday = todaysDraws.filter(draw => draw.published).length;
  const pendingToday = Math.max(0, 5 - publishedToday); // 3 total daily draws (12:00 PM, 2:00 PM, 5:00 PM)

  const stats = [
    {
      title: 'Today\'s Results',
      value: publishedToday.toString(),
      subtitle: 'Published',
      icon: Trophy,
      color: 'text-yellow-400',
      bgColor: 'bg-yellow-400/10',
    },
    {
      title: 'Pending Results',
      value: pendingToday.toString(),
      subtitle: 'Awaiting publication',
      icon: Clock,
      color: 'text-orange-400',
      bgColor: 'bg-orange-400/10',
    },
    /*{
      title: 'Total Results',
      value: draws.filter(d => d.true).length.toString(),
      subtitle: 'All time',
      icon: TrendingUp,
      color: 'text-green-400',
      bgColor: 'bg-green-400/10',
    },*/
    {
      title: 'News Articles',
      value: news.length.toString(),
      subtitle: 'Published',
      icon: FileText,
      color: 'text-yellow-400',
      bgColor: 'bg-yellow-400/10',
    },
    {
      title: 'Contact Messages',
      value: contacts.length.toString(),
      subtitle: 'Received',
      icon: MessageSquare,
      color: 'text-yellow-400',
      bgColor: 'bg-yellow-400/10',
    },
  ];

  const recentDraws = draws
    .filter(draw => draw.published)
    .sort((a, b) => new Date(b.date + ' ' + b.slot).getTime() - new Date(a.date + ' ' + a.slot).getTime())
    .slice(0, 5);

  return (
    <div className="relative">
      {/* Mobile sidebar overlay 
      {sidebarOpen && (
        <div className="fixed inset-0 z-50 flex">
          <div className="w-64 bg-[#0b1220] p-4 border-r border-white/5 shadow-lg">
            <div className="flex items-center justify-between mb-6">
              <div className="font-bold text-white">Admin Menu</div>
              <button
                onClick={() => setSidebarOpen(false)}
                className="text-gray-400 hover:text-white"
                aria-label="Close menu"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <nav className="space-y-3 text-sm">
              <Link to="/admin/draws" onClick={() => setSidebarOpen(false)} className="block text-gray-300 hover:text-cyan-400">Manage Results</Link>
              <Link to="/admin/news" onClick={() => setSidebarOpen(false)} className="block text-gray-300 hover:text-cyan-400">News</Link>
              <Link to="/admin/faq" onClick={() => setSidebarOpen(false)} className="block text-gray-300 hover:text-cyan-400">FAQ</Link>
              <Link to="/admin/contacts" onClick={() => setSidebarOpen(false)} className="block text-gray-300 hover:text-cyan-400">Contacts</Link>
            </nav>
          </div>
          <div className="flex-1 bg-black/40" onClick={() => setSidebarOpen(false)} />
        </div>
      )}

      <div className="mb-8 flex items-start justify-between">
        <div className="flex items-center space-x-3">
          <button
            onClick={() => setSidebarOpen(true)}
            className="md:hidden p-2 bg-white/5 rounded-md text-gray-300 hover:text-white"
            aria-label="Open menu"
          >
            <Menu className="h-5 w-5" />
          </button>
          <div>*/}
            <h1 className="text-3xl font-bold gradient-text mb-2">Dashboard</h1>
            <p className="text-gray-300">Overview of lottery system status and recent activity</p>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-8">
        {stats.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <GlassCard key={index} className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-400 text-sm">{stat.title}</p>
                  <p className="text-2xl font-bold text-white">{stat.value}</p>
                  <p className="text-xs text-gray-500">{stat.subtitle}</p>
                </div>
                <div className={`p-3 rounded-xl ${stat.bgColor}`}>
                  <Icon className={`h-6 w-6 ${stat.color}`} />
                </div>
              </div>
            </GlassCard>
          );
        })}
      </div>

      {/* Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <GlassCard className="p-6">
          <h2 className="text-xl font-bold text-white mb-4">Recent Results</h2>
          <div className="space-y-3">
            {recentDraws.map((draw) => (
              <div key={draw.id} className="flex items-center justify-between p-3 glass-card">
                <div>
                  <div className="font-medium text-white">{draw.drawNo}</div>
                  <div className="text-sm text-gray-400">
                    {new Date(draw.date).toLocaleDateString()} • {draw.slot}
                  </div>
                </div>
                <div className="flex space-x-2">
                  <span className="text-xs bg-cyan-400/20 text-cyan-400 px-2 py-1 rounded">
                    {draw.digit1}
                  </span>
                  <span className="text-xs bg-yellow-400/20 text-yellow-400 px-2 py-1 rounded">
                    {draw.digit2}
                  </span>
                  <span className="text-xs bg-green-400/20 text-green-400 px-2 py-1 rounded">
                    {draw.digit3}
                  </span>
                  <span className="text-xs bg-purple-400/20 text-purple-400 px-2 py-1 rounded">
                    {draw.digit4}
                  </span>
                  <span className="text-xs bg-pink-400/20 text-pink-400 px-2 py-1 rounded">
                    {draw.digit5}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </GlassCard>

        <GlassCard className="p-6">
          <h2 className="text-xl font-bold text-white mb-4">Quick Actions</h2>
          <div className="space-y-3">
            <Link
              to="/admin/draws"
              className="block p-4 glass-card hover:bg-white/10 transition-all rounded-xl"
            >
              <div className="font-medium text-white">Add New Result</div>
              <div className="text-sm text-gray-400">Publish lottery draw results</div>
            </Link>
            <Link
              to="/admin/news"
              className="block p-4 glass-card hover:bg-white/10 transition-all rounded-xl"
            >
              <div className="font-medium text-white">Create News Post</div>
              <div className="text-sm text-gray-400">Share important updates</div>
            </Link>
            <Link
              to="/admin/faq"
              className="block p-4 glass-card hover:bg-white/10 transition-all rounded-xl"
            >
              <div className="font-medium text-white">Manage FAQ</div>
              <div className="text-sm text-gray-400">Update help content</div>
            </Link>
            <Link
              to="/admin/contacts"
              className="block p-4 glass-card hover:bg-white/10 transition-all rounded-xl"
            >
              <div className="font-medium text-white">View Messages</div>
              <div className="text-sm text-gray-400">Customer inquiries</div>
            </Link>
          </div>
        </GlassCard>

        <GlassCard className="p-6">
          <h2 className="text-xl font-bold text-white mb-4">System Overview</h2>
          <div className="space-y-4">
            <div className="flex justify-between items-center p-3 glass-card">
              <span className="text-gray-300">System Status</span>
              <span className="text-green-400 text-sm">Online</span>
            </div>
            <div className="flex justify-between items-center p-3 glass-card">
              <span className="text-gray-300">Database</span>
              <span className="text-green-400 text-sm">Connected</span>
            </div>
            <div className="flex justify-between items-center p-3 glass-card">
              <span className="text-gray-300">Last Backup</span>
              <span className="text-gray-400 text-sm">2h ago</span>
            </div>
            <div className="flex justify-between items-center p-3 glass-card">
              <span className="text-gray-300">Active Users</span>
              <span className="text-cyan-400 text-sm">1,247</span>
            </div>
          </div>
        </GlassCard>
      </div>
    </div>
  );
}