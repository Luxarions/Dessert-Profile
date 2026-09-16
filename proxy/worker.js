/**
 * ============================================================
 * DESSERT Cloudflare Worker — Privacy & Vanity Reverse Proxy
 * ============================================================
 * 
 * Fungsi:
 * 1. Menyamarkan URL Vercel (Origin Masking).
 * 2. Menghapus semua HTTP header bawaan Vercel (x-vercel-id, x-vercel-cache, server).
 * 3. Menambahkan branding HTTP kustom (Server: DESSERT-Cloud-Engine/2.0).
 * 4. Mendukung CORS penuh dan caching asset otomatis untuk performa kilat.
 * 
 * Target Origin: https://dessert-profile.vercel.app
 */

const TARGET_HOST = 'dessert-profile.vercel.app';

export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);

    // Salin request dan arahkan ke Vercel di background
    const targetUrl = new URL(request.url);
    targetUrl.hostname = TARGET_HOST;
    targetUrl.protocol = 'https:';

    // Modifikasi request headers
    const reqHeaders = new Headers(request.headers);
    reqHeaders.set('Host', TARGET_HOST);
    reqHeaders.set('X-Forwarded-Host', url.hostname);
    reqHeaders.set('X-Real-IP', request.headers.get('cf-connecting-ip') || '');

    // Fetch konten dari Vercel secara diam-diam (silent proxy)
    const response = await fetch(targetUrl.toString(), {
      method: request.method,
      headers: reqHeaders,
      body: request.method !== 'GET' && request.method !== 'HEAD' ? request.body : undefined,
      redirect: 'follow',
    });

    // Buat response baru untuk menyaring header Vercel
    const resHeaders = new Headers(response.headers);

    // HAPUS SEMUA JEJAK VERCEL
    resHeaders.delete('x-vercel-id');
    resHeaders.delete('x-vercel-cache');
    resHeaders.delete('x-vercel-execution-region');
    resHeaders.delete('x-matched-path');
    resHeaders.delete('server');

    // TAMBAHKAN IDENTITAS KUSTOM DESSERT
    resHeaders.set('Server', 'DESSERT-Engine/2.0 (High-Performance Edge)');
    resHeaders.set('X-Powered-By', 'DESSERT Framework');
    resHeaders.set('Access-Control-Allow-Origin', '*');
    resHeaders.set('Access-Control-Allow-Methods', 'GET, HEAD, OPTIONS');
    resHeaders.set('Access-Control-Allow-Headers', '*');

    // Jika ini adalah request file asset (JS, CSS, SVG, JSON), aktifkan edge caching
    if (url.pathname.match(/\.(js|css|svg|png|jpg|json|woff2)$/i)) {
      resHeaders.set('Cache-Control', 'public, max-age=86400, s-maxage=604800, stale-while-revalidate=86400');
    }

    return new Response(response.body, {
      status: response.status,
      statusText: response.statusText,
      headers: resHeaders,
    });
  },
};
