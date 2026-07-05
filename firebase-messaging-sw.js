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

// 重要：不實作 onBackgroundMessage，讓 Firebase SDK 自己處理通知顯示。
// 原因：在 iOS PWA 上，若同時有 Firebase 自動顯示通知 + onBackgroundMessage 手動 showNotification，
// 會導致同一則通知被顯示兩次（Firebase Issue #8002）。
// 解決方式：完全不呼叫 showNotification，由 Firebase SDK 統一處理，只會顯示一次。

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
