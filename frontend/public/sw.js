// public/sw.js — Riddhi Push Notification Service Worker

self.addEventListener('push', (event) => {
  let data = {};

  try {
    data = event.data ? event.data.json() : {};
  } catch {
    data = { title: 'Riddhi', body: event.data ? event.data.text() : 'New notification' };
  }

  const title = data.title || 'Riddhi';
  const options = {
    body: data.body || '',
    icon: data.icon || '/riddhi-logo.svg',
    badge: data.badge || '/riddhi-logo.svg',
    data: { url: data.data?.url || '/' },
    vibrate: [200, 100, 200],
  };

  event.waitUntil(self.registration.showNotification(title, options));
});

self.addEventListener('notificationclick', (event) => {
  event.notification.close();

  const url = event.notification.data?.url || '/';

  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
      // Focus existing window if already open
      for (const client of clientList) {
        if (client.url.includes(self.location.origin) && 'focus' in client) {
          client.navigate(url);
          return client.focus();
        }
      }
      // Otherwise open a new window
      if (clients.openWindow) {
        return clients.openWindow(url);
      }
    }),
  );
});
