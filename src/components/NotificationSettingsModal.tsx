import React, { useState, useEffect } from 'react';
import { X, Bell, BellOff, Check } from 'lucide-react';
import { useNotifications } from '../hooks/useNotifications';
import { formatSlotTime, TIME_SLOTS } from '../utils/time';

interface NotificationSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function NotificationSettingsModal({ isOpen, onClose }: NotificationSettingsModalProps) {
  const { isSubscribed, settings, subscribe, unsubscribe, updateSettings, isLoading } = useNotifications();
  const [localSettings, setLocalSettings] = useState(settings);
  const [isSaving, setIsSaving] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  useEffect(() => {
    setLocalSettings(settings);
  }, [settings]);

  if (!isOpen) return null;

  const getSlotKey = (slot: string): keyof typeof localSettings => {
    return `slot_${slot.replace(':', '_')}` as keyof typeof localSettings;
  };

  const handleSlotToggle = (slot: string) => {
    if (!localSettings) return;
    const key = getSlotKey(slot);
    setLocalSettings({
      ...localSettings,
      [key]: !localSettings[key],
    });
  };

  const handleSave = async () => {
    if (!localSettings) return;

    setIsSaving(true);
    try {
      await updateSettings(localSettings);
      setShowSuccess(true);
      setTimeout(() => {
        setShowSuccess(false);
        onClose();
      }, 1500);
    } catch (error) {
      console.error('Error saving settings:', error);
      alert('Failed to save settings. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleEnableNotifications = async () => {
    setIsSaving(true);
    try {
      await subscribe();
      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 2000);
    } catch (error) {
      console.error('Error enabling notifications:', error);
      alert('Failed to enable notifications. Please check your browser settings and try again.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDisableNotifications = async () => {
    if (!confirm('Are you sure you want to disable all notifications?')) {
      return;
    }

    setIsSaving(true);
    try {
      await unsubscribe();
      onClose();
    } catch (error) {
      console.error('Error disabling notifications:', error);
      alert('Failed to disable notifications. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  return (
    <div
      className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
      onClick={handleBackdropClick}
    >
      <div className="glass-card max-w-md w-full p-6 rounded-2xl shadow-2xl animate-fade-in">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-yellow-100 flex items-center gap-2">
            <Bell className="h-6 w-6 text-yellow-400" />
            Notification Settings
          </h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-yellow-500/20 rounded-lg transition-colors"
            aria-label="Close"
          >
            <X className="h-5 w-5 text-yellow-400" />
          </button>
        </div>

        {!isSubscribed ? (
          <div className="text-center py-8">
            <BellOff className="h-16 w-16 text-yellow-600 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-yellow-100 mb-2">
              Enable Notifications
            </h3>
            <p className="text-yellow-600 mb-6">
              Get notified 15 minutes before each draw and when results are published.
            </p>
            <button
              onClick={handleEnableNotifications}
              disabled={isSaving}
              className="w-full bg-gradient-to-r from-yellow-500 to-amber-500 text-black font-semibold py-3 px-6 rounded-lg hover:from-yellow-400 hover:to-amber-400 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSaving ? 'Enabling...' : 'Enable Notifications'}
            </button>
          </div>
        ) : (
          <>
            <p className="text-yellow-600 mb-4">
              Choose which draw times you want to receive notifications for:
            </p>

            <div className="space-y-3 mb-6">
              {TIME_SLOTS.map((slot) => {
                const key = getSlotKey(slot);
                const isEnabled = localSettings?.[key] ?? true;

                return (
                  <button
                    key={slot}
                    onClick={() => handleSlotToggle(slot)}
                    className={`w-full flex items-center justify-between p-4 rounded-lg transition-all ${
                      isEnabled
                        ? 'bg-yellow-500/20 border-2 border-yellow-500/50'
                        : 'bg-gray-500/10 border-2 border-gray-500/30'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className={`w-5 h-5 rounded-md border-2 flex items-center justify-center transition-colors ${
                          isEnabled
                            ? 'bg-yellow-500 border-yellow-500'
                            : 'border-gray-500'
                        }`}
                      >
                        {isEnabled && <Check className="h-4 w-4 text-black" />}
                      </div>
                      <span className={`font-semibold ${
                        isEnabled ? 'text-yellow-100' : 'text-gray-500'
                      }`}>
                        {formatSlotTime(slot)} Draw
                      </span>
                    </div>
                    <span className={`text-sm ${
                      isEnabled ? 'text-yellow-400' : 'text-gray-600'
                    }`}>
                      {isEnabled ? 'Enabled' : 'Disabled'}
                    </span>
                  </button>
                );
              })}
            </div>

            {showSuccess && (
              <div className="mb-4 p-3 bg-green-500/20 border-2 border-green-500/50 rounded-lg text-green-400 text-center font-semibold flex items-center justify-center gap-2">
                <Check className="h-5 w-5" />
                Settings saved successfully!
              </div>
            )}

            <div className="flex gap-3">
              <button
                onClick={handleSave}
                disabled={isSaving || !localSettings}
                className="flex-1 bg-gradient-to-r from-yellow-500 to-amber-500 text-black font-semibold py-3 px-6 rounded-lg hover:from-yellow-400 hover:to-amber-400 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSaving ? 'Saving...' : 'Save Settings'}
              </button>
              <button
                onClick={handleDisableNotifications}
                disabled={isSaving}
                className="flex-1 bg-red-500/20 text-red-400 font-semibold py-3 px-6 rounded-lg hover:bg-red-500/30 transition-all disabled:opacity-50 disabled:cursor-not-allowed border-2 border-red-500/50"
              >
                Disable All
              </button>
            </div>

            <p className="text-xs text-yellow-600 mt-4 text-center">
              You'll receive notifications 15 minutes before each draw and when results are published.
            </p>
          </>
        )}
      </div>
    </div>
  );
}
