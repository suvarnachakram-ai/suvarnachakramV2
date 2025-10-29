import React, { useState, useEffect } from 'react';
import { Bell, Users, Send, TrendingUp, AlertCircle } from 'lucide-react';
import supabase from '../../lib/supabase';
import { TIME_SLOTS, formatSlotTime } from '../../utils/time';

interface NotificationStats {
  totalSubscriptions: number;
  activeSubscriptions: number;
  totalNotificationsSent: number;
  successRate: number;
  subscriptionsBySlot: Record<string, number>;
}

export default function AdminNotifications() {
  const [stats, setStats] = useState<NotificationStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSendingTest, setIsSendingTest] = useState(false);
  const [testResult, setTestResult] = useState<string | null>(null);

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    setIsLoading(true);
    try {
      const { data: subscriptions } = await supabase
        .from('notification_subscriptions')
        .select('id, is_active, notification_settings(*)');

      const { data: logs } = await supabase
        .from('notification_logs')
        .select('success');

      const totalSubscriptions = subscriptions?.length || 0;
      const activeSubscriptions = subscriptions?.filter((s: any) => s.is_active).length || 0;
      const totalNotificationsSent = logs?.length || 0;
      const successfulSends = logs?.filter((l: any) => l.success).length || 0;
      const successRate = totalNotificationsSent > 0
        ? (successfulSends / totalNotificationsSent) * 100
        : 0;

      const subscriptionsBySlot: Record<string, number> = {};
      TIME_SLOTS.forEach(slot => {
        const slotKey = `slot_${slot.replace(':', '_')}`;
        const count = subscriptions?.filter((s: any) => {
          const settings = s.notification_settings?.[0];
          return s.is_active && settings?.[slotKey] === true;
        }).length || 0;
        subscriptionsBySlot[slot] = count;
      });

      setStats({
        totalSubscriptions,
        activeSubscriptions,
        totalNotificationsSent,
        successRate,
        subscriptionsBySlot,
      });
    } catch (error) {
      console.error('Error loading notification stats:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const sendTestNotification = async (slot: string) => {
    setIsSendingTest(true);
    setTestResult(null);

    try {
      const today = new Date().toISOString().split('T')[0];
      const { data: draw } = await supabase
        .from('draws')
        .select('id')
        .eq('date', today)
        .eq('slot', slot)
        .maybeSingle();

      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/send-notifications`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
          },
          body: JSON.stringify({
            type: 'pre_draw',
            slot,
            drawId: draw?.id,
          }),
        }
      );

      if (response.ok) {
        const result = await response.json();
        setTestResult(`Success! Sent to ${result.successful || 0} subscriber(s)`);
      } else {
        setTestResult('Failed to send test notification');
      }
    } catch (error) {
      console.error('Error sending test notification:', error);
      setTestResult('Error sending test notification');
    } finally {
      setIsSendingTest(false);
      setTimeout(() => setTestResult(null), 5000);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-yellow-400"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-yellow-100 mb-2">Notification System</h2>
        <p className="text-yellow-600">Manage push notifications and view delivery statistics</p>
      </div>

      {testResult && (
        <div className={`p-4 rounded-lg ${
          testResult.includes('Success')
            ? 'bg-green-500/20 border-2 border-green-500/50 text-green-400'
            : 'bg-red-500/20 border-2 border-red-500/50 text-red-400'
        }`}>
          {testResult}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="glass-card p-6">
          <div className="flex items-center justify-between mb-2">
            <Users className="h-8 w-8 text-blue-400" />
            <span className="text-3xl font-bold text-yellow-100">
              {stats?.totalSubscriptions || 0}
            </span>
          </div>
          <h3 className="text-yellow-600 text-sm">Total Subscriptions</h3>
        </div>

        <div className="glass-card p-6">
          <div className="flex items-center justify-between mb-2">
            <Bell className="h-8 w-8 text-green-400" />
            <span className="text-3xl font-bold text-yellow-100">
              {stats?.activeSubscriptions || 0}
            </span>
          </div>
          <h3 className="text-yellow-600 text-sm">Active Subscribers</h3>
        </div>

        <div className="glass-card p-6">
          <div className="flex items-center justify-between mb-2">
            <Send className="h-8 w-8 text-purple-400" />
            <span className="text-3xl font-bold text-yellow-100">
              {stats?.totalNotificationsSent || 0}
            </span>
          </div>
          <h3 className="text-yellow-600 text-sm">Notifications Sent</h3>
        </div>

        <div className="glass-card p-6">
          <div className="flex items-center justify-between mb-2">
            <TrendingUp className="h-8 w-8 text-yellow-400" />
            <span className="text-3xl font-bold text-yellow-100">
              {stats?.successRate.toFixed(1)}%
            </span>
          </div>
          <h3 className="text-yellow-600 text-sm">Success Rate</h3>
        </div>
      </div>

      <div className="glass-card p-6">
        <h3 className="text-xl font-bold text-yellow-100 mb-4 flex items-center gap-2">
          <Bell className="h-5 w-5" />
          Subscriptions by Time Slot
        </h3>
        <div className="space-y-3">
          {TIME_SLOTS.map((slot) => {
            const count = stats?.subscriptionsBySlot[slot] || 0;
            const percentage = stats?.activeSubscriptions
              ? (count / stats.activeSubscriptions) * 100
              : 0;

            return (
              <div key={slot} className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-yellow-100 font-semibold">
                    {formatSlotTime(slot)} Draw
                  </span>
                  <span className="text-yellow-400">
                    {count} subscriber{count !== 1 ? 's' : ''}
                  </span>
                </div>
                <div className="w-full bg-gray-700 rounded-full h-2">
                  <div
                    className="bg-gradient-to-r from-yellow-500 to-amber-500 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${percentage}%` }}
                  ></div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <div className="glass-card p-6">
        <h3 className="text-xl font-bold text-yellow-100 mb-4 flex items-center gap-2">
          <Send className="h-5 w-5" />
          Test Notifications
        </h3>
        <p className="text-yellow-600 mb-4">
          Send a test notification to all subscribers for a specific time slot
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
          {TIME_SLOTS.map((slot) => (
            <button
              key={slot}
              onClick={() => sendTestNotification(slot)}
              disabled={isSendingTest}
              className="bg-gradient-to-r from-yellow-500 to-amber-500 text-black font-semibold py-3 px-4 rounded-lg hover:from-yellow-400 hover:to-amber-400 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {formatSlotTime(slot)}
            </button>
          ))}
        </div>
      </div>

      <div className="glass-card p-6 bg-blue-500/10 border-2 border-blue-500/30">
        <div className="flex items-start gap-3">
          <AlertCircle className="h-6 w-6 text-blue-400 flex-shrink-0 mt-1" />
          <div>
            <h4 className="text-blue-300 font-semibold mb-2">How Notifications Work</h4>
            <ul className="text-blue-200 text-sm space-y-1">
              <li>• Pre-draw notifications are sent 15 minutes before each draw time</li>
              <li>• Result notifications are sent when draws are published (15 minutes after draw time)</li>
              <li>• Users can customize which time slots they want notifications for</li>
              <li>• Notifications are sent via browser push (works even when browser is closed)</li>
              <li>• The automation Edge Function runs every minute to check for scheduled notifications</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
