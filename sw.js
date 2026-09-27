self.addEventListener('push', event => {
  const data = event.data ? event.data.json() : {};
  event.waitUntil(
    self.registration.showNotification(data.title || '张玲的夸夸机', {
      body: data.body || '',
      icon: '/avatar.png',
      badge: '/avatar.png',
      lang: 'zh-CN',
    })
  );
});

self.addEventListener('notificationclick', event => {
  event.notification.close();
  event.waitUntil(clients.openWindow('/'));
});
