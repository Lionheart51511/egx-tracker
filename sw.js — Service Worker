// Service Worker بسيط: تخزين مؤقت لملفات التطبيق + إشعارات
var CACHE = 'egx-investors-v1';
var FILES = ['./', './index.html', './manifest.json'];

self.addEventListener('install', function (e) {
  e.waitUntil(
    caches.open(CACHE).then(function (c) { return c.addAll(FILES); })
  );
  self.skipWaiting();
});

self.addEventListener('activate', function (e) {
  e.waitUntil(self.clients.claim());
});

self.addEventListener('fetch', function (e) {
  e.respondWith(
    caches.match(e.request).then(function (hit) {
      return hit || fetch(e.request);
    })
  );
});

// عند وصول إشعار Push (اختياري — يحتاج خادم Push أو OneSignal)
self.addEventListener('push', function (e) {
  var data = {};
  try { data = e.data ? e.data.json() : {}; } catch (err) {}
  e.waitUntil(
    self.registration.showNotification(
      data.title || 'تحديث فئات المستثمرين',
      { body: data.body || 'وصل تحديث جديد من البورصة المصرية', dir: 'rtl' }
    )
  );
});

self.addEventListener('notificationclick', function (e) {
  e.notification.close();
  e.waitUntil(clients.openWindow('./'));
});
