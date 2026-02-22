// src/services/api/notificationService.ts
import apiClient from './apiClient';

export interface PushSubscriptionDTO {
  endpoint: string;
  keys: {
    p256dh: string;
    auth: string;
  };
}

export interface PushStatusDTO {
  subscribed: boolean;
  count: number;
}

export type NotificationType =
  | 'budget_alert'
  | 'goal_progress'
  | 'large_transaction'
  | 'monthly_report'
  | 'security_alert';

export interface NotificationLogDTO {
  id: string;
  type: NotificationType;
  channel: 'email' | 'push' | 'sms';
  subject: string;
  status: 'pending' | 'sent' | 'failed';
  isRead: boolean;
  createdAt: string;
}

class NotificationService {
  private baseUrl = '/api/notifications';

  /** Fetch the server's VAPID public key */
  async getVapidPublicKey(): Promise<string> {
    const res = await apiClient.get<{ vapidPublicKey: string }>(`${this.baseUrl}/vapid-public-key`);
    return res.vapidPublicKey;
  }

  /** Register a push subscription with the backend */
  async subscribe(subscription: PushSubscriptionDTO): Promise<void> {
    await apiClient.post(`${this.baseUrl}/push/subscribe`, subscription);
  }

  /** Remove a push subscription from the backend */
  async unsubscribe(endpoint: string): Promise<void> {
    await apiClient.delete(`${this.baseUrl}/push/subscribe`, { data: { endpoint } });
  }

  /** Check whether the current user has any active subscriptions */
  async getStatus(): Promise<PushStatusDTO> {
    return apiClient.get<PushStatusDTO>(`${this.baseUrl}/push/status`);
  }

  // ── Notification log endpoints ───────────────────────────────────────────

  /** Fetch notification logs for the current user */
  async getLogs(limit = 50): Promise<NotificationLogDTO[]> {
    const res = await apiClient.get<{ data: NotificationLogDTO[] }>(
      `${this.baseUrl}/logs?limit=${limit}`,
    );
    return res.data;
  }

  /** Mark a single notification log as read */
  async markRead(id: string): Promise<void> {
    await apiClient.patch(`${this.baseUrl}/logs/${id}/read`, {});
  }

  /** Mark all notification logs as read */
  async markAllRead(): Promise<void> {
    await apiClient.patch(`${this.baseUrl}/logs/read-all`, {});
  }

  // ── Service Worker helpers ───────────────────────────────────────────────

  /** Register the service worker and return its registration */
  async registerServiceWorker(): Promise<ServiceWorkerRegistration> {
    if (!('serviceWorker' in navigator)) {
      throw new Error('Service workers are not supported in this browser');
    }
    return navigator.serviceWorker.register('/sw.js', { scope: '/' });
  }

  /** Convert a base64url VAPID key to a Uint8Array */
  urlBase64ToUint8Array(base64String: string): Uint8Array {
    const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
    const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');
    const rawData = atob(base64);
    return Uint8Array.from([...rawData].map((char) => char.charCodeAt(0)));
  }

  /**
   * Subscribe this browser to push notifications.
   * Handles SW registration, permission prompt, and backend save in one call.
   */
  async enablePushNotifications(): Promise<PushSubscription> {
    if (!('PushManager' in window)) {
      throw new Error('Push notifications are not supported in this browser');
    }

    const permission = await Notification.requestPermission();
    if (permission !== 'granted') {
      throw new Error('Notification permission denied');
    }

    const registration = await this.registerServiceWorker();
    const vapidKey = await this.getVapidPublicKey();

    const subscription = await registration.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: this.urlBase64ToUint8Array(vapidKey),
    });

    const json = subscription.toJSON() as PushSubscriptionDTO;
    await this.subscribe(json);

    return subscription;
  }

  /**
   * Unsubscribe this browser from push notifications.
   * Removes from both the browser PushManager and the backend.
   */
  async disablePushNotifications(): Promise<void> {
    if (!('serviceWorker' in navigator)) return;

    const registration = await navigator.serviceWorker.getRegistration('/');
    if (!registration) return;

    const subscription = await registration.pushManager.getSubscription();
    if (!subscription) return;

    await this.unsubscribe(subscription.endpoint);
    await subscription.unsubscribe();
  }

  /**
   * Returns the current browser subscription state (without contacting the backend).
   */
  async getBrowserSubscription(): Promise<PushSubscription | null> {
    if (!('serviceWorker' in navigator)) return null;
    const registration = await navigator.serviceWorker.getRegistration('/');
    if (!registration) return null;
    return registration.pushManager.getSubscription();
  }
}

export default new NotificationService();
