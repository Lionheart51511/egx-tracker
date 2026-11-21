// Service Worker واحد مدمج: OneSignal + تخزين مؤقت — ملف واحد ونطاق واحد فقط.
// السطر الأول يستورد كود إشعارات OneSignal إلى داخل هذا الملف نفسه،
// وصفحة index.html تُشير بـ OneSignal إلى هذا الملف (sw.js) نفسه كعامل
// إشعاراتها. لا تنشئ ملف OneSignalSDKWorker.js منفصلاً أبداً: عاملان
// مختلفان على نفس النطاق يلغي أحدهما تسجيل الآخر، فيظهر الاشتراك
// «مشترك» على الجهاز بينما لا يصل أي جهاز إلى خادم OneSignal فعلياً.
importScripts("https://cdn.onesignal.com/sdks/web/v16/OneSignalSDK.sw.js");

var CACHE = 'egx-investors-v3';
var FILES = ['./', './index.html', './manifest.json'];

self.addEventListener('install', function (e) {
  e.waitUntil(
    caches.open(CACHE).then(function (c) { return c.addAll(FILES); })
  );
  self.skipWaiting();
});

self.addEventListener('activate', function (e) {
  // حذف كاش النسخ القديمة كلها حتى لا تبقى نسخة محبوسة على الجهاز
  e.waitUntil(
    caches.keys().then(function (keys) {
      return Promise.all(keys.map(function (k) {
        return k === CACHE ? null : caches.delete(k);
      }));
    }).then(function () { return self.clients.claim(); })
  );
});

self.addEventListener('fetch', function (e) {
  // الصفحات (تنقّل/HTML): الشبكة أولاً حتى تصل أي نسخة جديدة فور نشرها،
  // والكاش بديل عند انقطاع الاتصال فقط — «الكاش أولاً» كان يحبس النسخ
  // القديمة على الجهاز حتى بعد تعديل الملفات في المستودع.
  var accept = (e.request.headers && e.request.headers.get('accept')) || '';
  if (e.request.mode === 'navigate' || accept.indexOf('text/html') >= 0) {
    e.respondWith(
      fetch(e.request).then(function (res) {
        var copy = res.clone();
        caches.open(CACHE).then(function (c) { c.put(e.request, copy); });
        return res;
      }).catch(function () { return caches.match(e.request); })
    );
    return;
  }
  e.respondWith(
    caches.match(e.request).then(function (hit) {
      return hit || fetch(e.request);
    })
  );
});

// إشعارات Push نفسها يتولاها كود OneSignal المستورَد في أول الملف —
// لا تضف معالج push آخر هنا حتى لا تصل الإشعارات مكررة.
