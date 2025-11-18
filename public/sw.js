// DisneyAi Service Worker - 简化版
const CACHE_NAME = 'disneyai-v1';

// 安装 Service Worker
self.addEventListener('install', (event) => {
  console.log('Service Worker: 安装中...');
  self.skipWaiting();
});

// 激活 Service Worker
self.addEventListener('activate', (event) => {
  console.log('Service Worker: 激活中...');
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            console.log('Service Worker: 清除旧缓存', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
  self.clients.claim();
});

// 拦截请求 - 简化版，只处理基本的网络请求
self.addEventListener('fetch', (event) => {
  const { request } = event;
  
  // 只处理 GET 请求
  if (request.method !== 'GET') {
    return;
  }
  
  // 跳过 chrome-extension 和其他非 http(s) 协议
  if (!request.url.startsWith('http')) {
    return;
  }
  
  // 跳过 API 请求，让它们直接走网络
  if (request.url.includes('/api/')) {
    return;
  }
  
  // 对于页面和静态资源，使用网络优先策略
  event.respondWith(
    fetch(request)
      .then((response) => {
        // 检查是否是有效响应
        if (!response || response.status !== 200 || response.type === 'error') {
          return response;
        }
        
        // 克隆响应（响应只能读取一次）
        const responseToCache = response.clone();
        
        // 异步缓存，不阻塞返回
        caches.open(CACHE_NAME).then((cache) => {
          cache.put(request, responseToCache);
        });
        
        return response;
      })
      .catch(() => {
        // 网络失败时，尝试从缓存读取
        return caches.match(request);
      })
  );
});
