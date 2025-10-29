import { useState, useEffect, useCallback } from 'react';
import {
  requestNotificationPermission,
  subscribeToPushNotifications,
  saveSubscriptionToDatabase,
  unsubscribeFromPushNotifications,
  getSubscriptionStatus,
  updateNotificationSettings,
  getNotificationSettings,
  type NotificationSettings,
} from '../utils/notifications';

export function useNotifications() {
  const [isSupported, setIsSupported] = useState(false);
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [permission, setPermission] = useState<NotificationPermission>('default');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [subscriptionId, setSubscriptionId] = useState<string | null>(null);
  const [settings, setSettings] = useState<NotificationSettings | null>(null);

  const checkStatus = useCallback(async () => {
    try {
      const status = await getSubscriptionStatus();
      setIsSupported(status.isSupported);
      setIsSubscribed(status.isSubscribed);
      setPermission(status.permission);

      if (status.isSubscribed && status.subscription) {
        const storedSettings = await getNotificationSettings(status.subscription.endpoint);
        setSettings(storedSettings);

        const { data } = await import('../lib/supabase').then(m => m.default)
          .then(supabase =>
            supabase
              .from('notification_subscriptions')
              .select('id')
              .eq('endpoint', status.subscription!.endpoint)
              .maybeSingle()
          );

        if (data) {
          setSubscriptionId(data.id);
        }
      }
    } catch (err) {
      console.error('Error checking notification status:', err);
      setError(err instanceof Error ? err.message : 'Failed to check notification status');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    checkStatus();
  }, [checkStatus]);

  const subscribe = useCallback(async (): Promise<void> => {
    setIsLoading(true);
    setError(null);

    try {
      const permissionResult = await requestNotificationPermission();
      setPermission(permissionResult);

      if (permissionResult !== 'granted') {
        throw new Error('Notification permission denied');
      }

      const subscription = await subscribeToPushNotifications();
      const { id, settings: newSettings } = await saveSubscriptionToDatabase(subscription);

      setSubscriptionId(id);
      setSettings(newSettings);
      setIsSubscribed(true);

      await new Promise(resolve => setTimeout(resolve, 500));
      await checkStatus();
    } catch (err) {
      console.error('Error subscribing to notifications:', err);
      setError(err instanceof Error ? err.message : 'Failed to subscribe');
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [checkStatus]);

  const unsubscribe = useCallback(async (): Promise<void> => {
    setIsLoading(true);
    setError(null);

    try {
      await unsubscribeFromPushNotifications();
      setIsSubscribed(false);
      setSubscriptionId(null);
      setSettings(null);
      await checkStatus();
    } catch (err) {
      console.error('Error unsubscribing from notifications:', err);
      setError(err instanceof Error ? err.message : 'Failed to unsubscribe');
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [checkStatus]);

  const updateSettings = useCallback(async (newSettings: Partial<NotificationSettings>): Promise<void> => {
    if (!subscriptionId) {
      throw new Error('No active subscription');
    }

    setIsLoading(true);
    setError(null);

    try {
      await updateNotificationSettings(subscriptionId, newSettings);
      setSettings(prev => (prev ? { ...prev, ...newSettings } : null));
      await checkStatus();
    } catch (err) {
      console.error('Error updating notification settings:', err);
      setError(err instanceof Error ? err.message : 'Failed to update settings');
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [subscriptionId, checkStatus]);

  return {
    isSupported,
    isSubscribed,
    permission,
    isLoading,
    error,
    settings,
    subscribe,
    unsubscribe,
    updateSettings,
    refresh: checkStatus,
  };
}
