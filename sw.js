const staticCacheName = 's-app-v3';
const dynamicCacheName = 'd-app-v3';

const assetsUrl = [
    'index.html',
    'offline.html',
    '/js/app.js',
    './css/styles.css',
]

self.addEventListener('install', async e => {
    const cache = await caches.open(staticCacheName)
    await cache.addAll(assetsUrl)

    // e.waitUntil(
    //     caches.open(staticCacheName)
    //         .then(cache => cache.addAll(assetsUrl))
    // )
})

self.addEventListener('activate', async e => {
    console.log('sw: activate')
    const cacheNames = await caches.keys()
    await Promise.all(
        cacheNames
            .filter(name => name !== staticCacheName)
            .filter(name => name !== dynamicCacheName)
            .map(name => caches.delete(name))
    )
})


self.addEventListener('fetch', e => {
    // console.log('sw: fetch', e.request.url)
    const {request} = e
    const url = new URL(request.url)
    if(url.origin === location.origin) {
        e.respondWith(cacheFirst(e.request))
    } else {
        e.respondWith(networkFirst(request))
    }
})

async function cacheFirst(request) {
    const cached = await caches.match(request)
    return cached ?? await fetch(request)
}

async function networkFirst(request) {
    const cache = await caches.open(dynamicCacheName)
    try {
        const response = await fetch(request)
        await cache.put(request, response.clone())
        return response
    } catch (e) {
        const cached = await caches.match(request)
        return cached ?? await cached.match('/offline.html')
    }
}