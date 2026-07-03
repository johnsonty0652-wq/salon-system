// ============================================================
// 分人沙龍內部系統 - Firebase 推播通知 Service Worker
// 此檔案必須放在網站根目錄（與 index.html 同層）
// ============================================================

importScripts('https://www.gstatic.com/firebasejs/10.13.2/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/10.13.2/firebase-messaging-compat.js');

firebase.initializeApp({
  apiKey: "AIzaSyD0Lez6mjt9LXIJl0759l5k3GjJQLczDds",
  authDomain: "dutysystem-1a2b8.firebaseapp.com",
  projectId: "dutysystem-1a2b8",
  storageBucket: "dutysystem-1a2b8.firebasestorage.app",
  messagingSenderId: "140288685379",
  appId: "1:140288685379:web:2592099868f9c0e7db6bf6"
});

const messaging = firebase.messaging();

// 處理背景通知（App 未在前景時）
messaging.onBackgroundMessage(function(payload) {
  console.log('[SW] 收到背景通知：', payload);
  const notification = payload.notification || {};
  const title = notification.title || '分人沙龍';
  const body = notification.body || '您有一則新通知';
  self.registration.showNotification(title, {
    body: body,
    icon: '/icon-192.png',
    badge: '/icon-192.png',
    data: payload.data || {},
    vibrate: [200, 100, 200]
  });
});

// 點擊通知後，跳轉回系統
self.addEventListener('notificationclick', function(event) {
  event.notification.close();
  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then(function(clientList) {
      for (var i = 0; i < clientList.length; i++) {
        var client = clientList[i];
        if (client.focus) {
          return client.focus();
        }
      }
      if (clients.openWindow) {
        return clients.openWindow('/');
      }
    })
  );
});
