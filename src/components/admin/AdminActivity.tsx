import React, { useState, useEffect } from 'react';
import { Activity, User, FileText, Trophy, Calendar, Filter } from 'lucide-react';
import GlassCard from '../GlassCard';

interface ActivityLog {
  id: string;
  action: string;
  user: string;
  target: string;
  timestamp: string;
  type: 'draw' | 'news' | 'faq' | 'user' | 'system';
}

export default function AdminActivity() {
  const [activities, setActivities] = useState<ActivityLog[]>([]);
  const [filter, setFilter] = useState<string>('all');

  useEffect(() => {
    // Generate sample activity logs
    const sampleActivities: ActivityLog[] = [
      {
        id: '1',
        action: 'Published draw result',
        user: 'Admin User',
        target: 'Draw SC12345 (10:30 AM)',
        timestamp: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
        type: 'draw',
      },
      {
        id: '2',
        action: 'Created news article',
        user: 'Admin User',
        target: 'Festival Season Special Draws',
        timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
        type: 'news',
      },
      {
        id: '3',
        action: 'Updated FAQ',
        user: 'Editor User',
        target: 'How to claim prizes',
        timestamp: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(),
        type: 'faq',
      },
      {
        id: '4',
        action: 'Added new user',
        user: 'Admin User',
        target: 'editor@swarnachakra.com',
        timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
        type: 'user',
      },
      {
        id: '5',
        action: 'System backup completed',
        user: 'System',
        target: 'Daily backup',
        timestamp: new Date(Date.now() - 25 * 60 * 60 * 1000).toISOString(),
        type: 'system',
      },
    ];
    setActivities(sampleActivities);
  }, []);

  const filteredActivities = filter === 'all' 
    ? activities 
    : activities.filter(activity => activity.type === filter);

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'draw': return Trophy;
      case 'news': return FileText;
      case 'faq': return FileText;
      case 'user': return User;
      case 'system': return Activity;
      default: return Activity;
    }
  };

  const getActivityColor = (type: string) => {
    switch (type) {
      case 'draw': return 'text-cyan-400';
      case 'news': return 'text-yellow-400';
      case 'faq': return 'text-green-400';
      case 'user': return 'text-yellow-400';
      case 'system': return 'text-gray-400';
      default: return 'text-gray-400';
    }
  };

  const formatTimeAgo = (timestamp: string) => {
    const now = new Date();
    const time = new Date(timestamp);
    const diffInMinutes = Math.floor((now.getTime() - time.getTime()) / (1000 * 60));
    
    if (diffInMinutes < 1) return 'Just now';
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
    
    const diffInHours = Math.floor(diffInMinutes / 60);
    if (diffInHours < 24) return `${diffInHours}h ago`;
    
    const diffInDays = Math.floor(diffInHours / 24);
    return `${diffInDays}d ago`;
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold gradient-text mb-2">Activity Log</h1>
          <p className="text-gray-300">Monitor system activities and user actions</p>
        </div>
      </div>

      {/* Filters */}
      <GlassCard className="p-4 mb-6">
        <div className="flex items-center space-x-4">
          <Filter className="h-5 w-5 text-gray-400" />
          <div className="flex flex-wrap gap-2">
            {[
              { value: 'all', label: 'All Activities' },
              { value: 'draw', label: 'Draw Results' },
              { value: 'news', label: 'News' },
              { value: 'faq', label: 'FAQ' },
              { value: 'user', label: 'Users' },
              { value: 'system', label: 'System' },
            ].map((option) => (
              <button
                key={option.value}
                onClick={() => setFilter(option.value)}
                className={`px-3 py-1 rounded-lg text-sm font-medium transition-all ${
                  filter === option.value
                    ? 'bg-cyan-500 text-white'
                    : 'glass-card text-gray-300 hover:text-cyan-400'
                }`}
              >
                {option.label}
              </button>
            ))}
          </div>
        </div>
      </GlassCard>

      {/* Activity List */}
      <GlassCard className="overflow-hidden">
        <div className="divide-y divide-white/10">
          {filteredActivities.map((activity) => {
            const Icon = getActivityIcon(activity.type);
            const colorClass = getActivityColor(activity.type);
            
            return (
              <div key={activity.id} className="p-6 hover:bg-white/5 transition-colors">
                <div className="flex items-start space-x-4">
                  <div className={`p-2 rounded-lg bg-white/5 ${colorClass}`}>
                    <Icon className="h-4 w-4" />
                  </div>
                  
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-medium text-white">{activity.action}</span>
                      <span className="text-sm text-gray-400">{formatTimeAgo(activity.timestamp)}</span>
                    </div>
                    
                    <div className="text-sm text-gray-300 mb-1">
                      Target: <span className="text-yellow-400">{activity.target}</span>
                    </div>
                    
                    <div className="text-xs text-gray-400">
                      By: {activity.user} • {new Date(activity.timestamp).toLocaleString()}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </GlassCard>
    </div>
  );
}