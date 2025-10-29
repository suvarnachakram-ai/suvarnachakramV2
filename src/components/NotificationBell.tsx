import React, { useState } from 'react';
import { Bell, BellOff, Settings } from 'lucide-react';
import { useNotifications } from '../hooks/useNotifications';
import NotificationSettingsModal from './NotificationSettingsModal';

export default function NotificationBell() {
  const { isSupported, isSubscribed, isLoading, subscribe, unsubscribe } = useNotifications();
  const [showSettings, setShowSettings] = useState(false);
  const [showTooltip, setShowTooltip] = useState(false);

  if (!isSupported) {
    return null;
  }

  const handleToggle = async () => {
    try {
      if (isSubscribed) {
        setShowSettings(true);
      } else {
        await subscribe();
        setShowSettings(true);
      }
    } catch (error) {
      console.error('Error toggling notifications:', error);
    }
  };

  return (
    <>
      <div className="relative">
        <button
          onClick={handleToggle}
          onMouseEnter={() => setShowTooltip(true)}
          onMouseLeave={() => setShowTooltip(false)}
          disabled={isLoading}
          className={`relative p-2 rounded-lg transition-all ${
            isSubscribed
              ? 'text-yellow-400 hover:text-yellow-300 hover:bg-yellow-400/10'
              : 'text-yellow-600 hover:text-yellow-500 hover:bg-yellow-500/10'
          } ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
          aria-label={isSubscribed ? 'Notification settings' : 'Enable notifications'}
        >
          {isSubscribed ? (
            <>
              <Bell className="h-5 w-5" />
              <span className="absolute top-1 right-1 h-2 w-2 bg-green-500 rounded-full animate-pulse"></span>
            </>
          ) : (
            <BellOff className="h-5 w-5" />
          )}
        </button>

        {showTooltip && (
          <div className="absolute top-full right-0 mt-2 px-3 py-2 bg-gray-900 text-white text-xs rounded-lg whitespace-nowrap z-50">
            {isSubscribed ? 'Notification Settings' : 'Enable Notifications'}
            <div className="absolute -top-1 right-3 w-2 h-2 bg-gray-900 transform rotate-45"></div>
          </div>
        )}
      </div>

      {showSettings && (
        <NotificationSettingsModal
          isOpen={showSettings}
          onClose={() => setShowSettings(false)}
        />
      )}
    </>
  );
}
