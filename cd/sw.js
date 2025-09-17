// Service Worker版本号
const CACHE_VERSION = 'v1';
const CACHE_NAME = `countdown-app-${CACHE_VERSION}`;

// 需要缓存的文件列表
const FILES_TO_CACHE = [
  './index.html',
  './manifest.json'
];

// 安装阶段：缓存文件
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('缓存文件中...');
        return cache.addAll(FILES_TO_CACHE);
      })
      .then(() => {
        console.log('安装完成');
        // 强制激活新的Service Worker
        return self.skipWaiting();
      })
  );
});

// 激活阶段：清理旧缓存
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys()
      .then((cacheNames) => {
        return Promise.all(
          cacheNames.map((cacheName) => {
            // 删除不是当前版本的缓存
            if (cacheName !== CACHE_NAME) {
              console.log(`删除旧缓存: ${cacheName}`);
              return caches.delete(cacheName);
            }
          })
        );
      })
      .then(() => {
        console.log('激活完成');
        // 控制所有打开的客户端
        return self.clients.claim();
      })
  );
});

// 拦截请求并返回缓存的响应
self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request)
      .then((response) => {
        // 如果缓存中有匹配的响应，则返回缓存的响应
        if (response) {
          return response;
        }
        
        // 克隆请求，因为请求是一个流，只能使用一次
        const fetchRequest = event.request.clone();
        
        // 如果缓存中没有匹配的响应，则发送网络请求
        return fetch(fetchRequest)
          .then((response) => {
            // 检查响应是否有效
            if (!response || response.status !== 200 || response.type !== 'basic') {
              return response;
            }
            
            // 克隆响应，因为响应是一个流，只能使用一次
            const responseToCache = response.clone();
            
            // 将响应添加到缓存中
            caches.open(CACHE_NAME)
              .then((cache) => {
                cache.put(event.request, responseToCache);
              });
            
            return response;
          })
          .catch((error) => {
            console.error('获取资源失败:', error);
            // 可以在这里返回一个自定义的离线页面
          });
      })
  );
});

// 监听message事件，用于接收来自页面的消息
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});