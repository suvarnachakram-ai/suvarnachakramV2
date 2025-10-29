import supabase from '../lib/supabase';

export const VAPID_PUBLIC_KEY = 'BPrcoQEm_bIOM06VSCyuiW4qEgeBDiA1tzWpm6zH8JRaUFxjhRzW4iB6kTbiJNHSefesqZbluFZvNinapwhU4qA';

export interface NotificationSettings {
  slot_10_00: boolean;
  slot_12_00: boolean;
  slot_14_00: boolean;
  slot_17_00: boolean;
  slot_19_00: boolean;
}

export function urlBase64ToUint8Array(base64String: string): Uint8Array {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding)
    .replace(/-/g, '+')
    .replace(/_/g, '/');

  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);

  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}

export async function requestNotificationPermission(): Promise<NotificationPermission> {
  if (!('Notification' in window)) {
    throw new Error('This browser does not support notifications');
  }

  if (!('serviceWorker' in navigator)) {
    throw new Error('This browser does not support service workers');
  }

  return await Notification.requestPermission();
}

export async function registerServiceWorker(): Promise<ServiceWorkerRegistration> {
  if (!('serviceWorker' in navigator)) {
    throw new Error('Service workers not supported');
  }

  try {
    const registration = await navigator.serviceWorker.register('/sw.js', {
      scope: '/',
    });

    await navigator.serviceWorker.ready;
    return registration;
  } catch (error) {
    console.error('Service worker registration failed:', error);
    throw error;
  }
}

export async function subscribeToPushNotifications(): Promise<PushSubscription> {
  const registration = await registerServiceWorker();

  const convertedVapidKey = urlBase64ToUint8Array(VAPID_PUBLIC_KEY);

  const subscription = await registration.pushManager.subscribe({
    userVisibleOnly: true,
    applicationServerKey: convertedVapidKey,
  });

  return subscription;
}

export async function saveSubscriptionToDatabase(
  subscription: PushSubscription
): Promise<{ id: string; settings: NotificationSettings }> {
  const subscriptionData = subscription.toJSON();

  const payload = {
    endpoint: subscription.endpoint,
    p256dh_key: subscriptionData.keys?.p256dh || '',
    auth_key: subscriptionData.keys?.auth || '',
    user_agent: navigator.userAgent,
    is_active: true,
  };

  const { data: existingSub, error: checkError } = await supabase
    .from('notification_subscriptions')
    .select('id, notification_settings(*)')
    .eq('endpoint', subscription.endpoint)
    .maybeSingle();

  if (checkError) throw checkError;

  if (existingSub) {
    const { error: updateError } = await supabase
      .from('notification_subscriptions')
      .update({ is_active: true, user_agent: navigator.userAgent })
      .eq('id', existingSub.id);

    if (updateError) throw updateError;

    return {
      id: existingSub.id,
      settings: (existingSub as any).notification_settings[0] as NotificationSettings,
    };
  }

  const { data: newSub, error: insertError } = await supabase
    .from('notification_subscriptions')
    .insert(payload)
    .select('id, notification_settings(*)')
    .single();

  if (insertError) throw insertError;

  return {
    id: newSub.id,
    settings: (newSub as any).notification_settings[0] as NotificationSettings,
  };
}

export async function unsubscribeFromPushNotifications(): Promise<void> {
  const registration = await navigator.serviceWorker.ready;
  const subscription = await registration.pushManager.getSubscription();

  if (subscription) {
    await subscription.unsubscribe();

    const { error } = await supabase
      .from('notification_subscriptions')
      .update({ is_active: false })
      .eq('endpoint', subscription.endpoint);

    if (error) throw error;
  }
}

export async function getSubscriptionStatus(): Promise<{
  isSupported: boolean;
  isSubscribed: boolean;
  permission: NotificationPermission;
  subscription?: PushSubscription;
}> {
  const isSupported = 'Notification' in window && 'serviceWorker' in navigator;

  if (!isSupported) {
    return {
      isSupported: false,
      isSubscribed: false,
      permission: 'default',
    };
  }

  const permission = Notification.permission;

  try {
    const registration = await navigator.serviceWorker.ready;
    const subscription = await registration.pushManager.getSubscription();

    return {
      isSupported: true,
      isSubscribed: !!subscription,
      permission,
      subscription: subscription || undefined,
    };
  } catch {
    return {
      isSupported: true,
      isSubscribed: false,
      permission,
    };
  }
}

export async function updateNotificationSettings(
  subscriptionId: string,
  settings: Partial<NotificationSettings>
): Promise<void> {
  const { error } = await supabase
    .from('notification_settings')
    .update({ ...settings, updated_at: new Date().toISOString() })
    .eq('subscription_id', subscriptionId);

  if (error) throw error;
}

export async function getNotificationSettings(
  endpoint: string
): Promise<NotificationSettings | null> {
  const { data, error } = await supabase
    .from('notification_subscriptions')
    .select('notification_settings(*)')
    .eq('endpoint', endpoint)
    .maybeSingle();

  if (error) throw error;
  if (!data) return null;

  return (data as any).notification_settings[0] as NotificationSettings;
}
