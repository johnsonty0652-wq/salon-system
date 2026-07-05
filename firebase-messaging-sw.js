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

// 背景通知去重複機制：
// Firebase compat SDK 有時會同時觸發「自動系統通知」與「onBackgroundMessage 手動通知」
// 導致同一則訊息顯示兩次。解決方式：記錄最近一次通知的 messageId，
// 若在 5 秒內收到相同訊息，略過手動顯示，只保留系統自動顯示的那一則。
const _shownMessageIds = new Map();

messaging.onBackgroundMessage(function(payload) {
  console.log('[SW] 收到背景通知：', payload);

  // 取得唯一識別碼（優先用 messageId，其次用標題+時間組合）
  const msgId = (payload.messageId || payload.collapseKey ||
    ((payload.notification && payload.notification.title) || '') + '_' + Math.floor(Date.now() / 5000));

  // 5 秒內相同訊息只顯示一次
  if (_shownMessageIds.has(msgId)) {
    console.log('[SW] 去重複攔截，略過重複通知：', msgId);
    return;
  }
  _shownMessageIds.set(msgId, Date.now());

  // 清理超過 30 秒的舊記錄，避免 Map 無限增長
  const cutoff = Date.now() - 30000;
  _shownMessageIds.forEach(function(ts, key) {
    if (ts < cutoff) _shownMessageIds.delete(key);
  });

  const notification = payload.notification || {};
  const title = notification.title || '分人沙龍';
  const body = notification.body || '您有一則新通知';

  // 只手動顯示一次，不依賴 Firebase 自動顯示
  self.registration.showNotification(title, {
    body: body,
    icon: '/salon-system/icon-192.png',
    badge: '/salon-system/icon-192.png',
    tag: msgId,          // tag 相同的通知會自動合併，這是瀏覽器層面的去重複保護
    renotify: false,
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
        return clients.openWindow('/salon-system/');
      }
    })
  );
});
