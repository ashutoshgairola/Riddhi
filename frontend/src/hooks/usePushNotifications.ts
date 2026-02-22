// src/hooks/usePushNotifications.ts
import { useCallback, useEffect, useState } from 'react';

import notificationService from '../services/api/notificationService';
import { useToast } from './useToast';

export type PushPermission = 'default' | 'granted' | 'denied' | 'unsupported';

interface UsePushNotificationsReturn {
  /** Whether push is supported by this browser */
  isSupported: boolean;
  /** Current Notification.permission value */
  permission: PushPermission;
  /** Whether this browser is currently subscribed */
  isSubscribed: boolean;
  /** Whether an async operation is in progress */
  loading: boolean;
  /** Subscribe this browser to push notifications */
  subscribe: () => Promise<void>;
  /** Unsubscribe this browser from push notifications */
  unsubscribe: () => Promise<void>;
}

export function usePushNotifications(): UsePushNotificationsReturn {
  const { success, error: toastError, info } = useToast();

  const isSupported =
    typeof window !== 'undefined' && 'Notification' in window && 'PushManager' in window;

  const [permission, setPermission] = useState<PushPermission>(
    isSupported ? (Notification.permission as PushPermission) : 'unsupported',
  );
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [loading, setLoading] = useState(true);

  // Check current subscription state on mount
  useEffect(() => {
    if (!isSupported) {
      setLoading(false);
      return;
    }

    notificationService
      .getBrowserSubscription()
      .then((sub) => {
        setIsSubscribed(!!sub);
        setPermission(Notification.permission as PushPermission);
      })
      .catch(() => setIsSubscribed(false))
      .finally(() => setLoading(false));
  }, [isSupported]);

  const subscribe = useCallback(async () => {
    if (!isSupported) {
      toastError('Push notifications are not supported in this browser.');
      return;
    }

    setLoading(true);
    try {
      await notificationService.enablePushNotifications();
      setIsSubscribed(true);
      setPermission('granted');
      success('Push notifications enabled!', 'Notifications on');
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to enable push notifications';
      if (msg.toLowerCase().includes('denied') || msg.toLowerCase().includes('permission')) {
        setPermission('denied');
        info(
          'Notification permission was denied. Enable it in your browser settings.',
          'Permission required',
        );
      } else {
        toastError(msg, 'Could not enable notifications');
      }
    } finally {
      setLoading(false);
    }
  }, [isSupported, success, toastError, info]);

  const unsubscribe = useCallback(async () => {
    setLoading(true);
    try {
      await notificationService.disablePushNotifications();
      setIsSubscribed(false);
      success('Push notifications disabled.', 'Notifications off');
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to disable push notifications';
      toastError(msg, 'Could not disable notifications');
    } finally {
      setLoading(false);
    }
  }, [success, toastError]);

  return { isSupported, permission, isSubscribed, loading, subscribe, unsubscribe };
}
