const CACHE_NAME = 'todo-app-cache-v1';
const ASSETS_TO_CACHE = [
  '/',
  '.',
  './',
  './index.html',
  './manifest.json',
  './vite.svg',
  '/index.html',
  '/src/main.jsx',
  '/src/App.jsx',
  '/src/App.css',
  '/src/index.css',
  '/manifest.json',
  '/vite.svg',
  '/src/assets/react.svg'
];

// 安装 Service Worker
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log('缓存文件中...');
      return cache.addAll(ASSETS_TO_CACHE);
    })
  );
  // 立即激活新的service worker
  self.skipWaiting();
});

// 激活 Service Worker
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            console.log('删除旧缓存:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
  // 接管所有客户端
  self.clients.claim();
});

// 拦截网络请求
self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request).then((response) => {
      // 如果缓存中有匹配的响应，则返回缓存的响应
      if (response) {
        return response;
      }
      
      // 否则，发送网络请求
      return fetch(event.request).then((networkResponse) => {
        // 如果请求失败或状态不是200，则返回网络响应
        if (!networkResponse || networkResponse.status !== 200 || networkResponse.type !== 'basic') {
          return networkResponse;
        }
        
        // 克隆响应，因为响应流只能被读取一次
        const responseToCache = networkResponse.clone();
        
        // 将新的响应添加到缓存中
        caches.open(CACHE_NAME).then((cache) => {
          cache.put(event.request, responseToCache);
        });
        
        return networkResponse;
      }).catch(() => {
        // 网络请求失败时，如果请求的是HTML文件，返回缓存的index.html
        if (event.request.mode === 'navigate') {
          return caches.match('./index.html');
        }
      });
    })
  );
});