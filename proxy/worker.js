/**
 * ============================================================
 * DESSERT Cloudflare Worker — Privacy & Vanity Reverse Proxy
 * ============================================================
 * 
 * Features:
 * 1. Origin Masking (hides upstream Vercel host).
 * 2. Strips all upstream fingerprint headers (x-vercel-id, x-vercel-cache, server).
 * 3. Injects custom branding headers (Server: DESSERT-Engine/2.0).
 * 4. Enables universal CORS and edge asset caching for fast delivery.
 * 
 * Target Origin: https://dessert-profile.vercel.app
 */

const TARGET_HOST = 'dessert-profile.vercel.app';

export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);

    // Clone request and silently forward to upstream origin
    const targetUrl = new URL(request.url);
    targetUrl.hostname = TARGET_HOST;
    targetUrl.protocol = 'https:';

    // Modify request headers
    const reqHeaders = new Headers(request.headers);
    reqHeaders.set('Host', TARGET_HOST);
    reqHeaders.set('X-Forwarded-Host', url.hostname);
    reqHeaders.set('X-Real-IP', request.headers.get('cf-connecting-ip') || '');

    // Fetch upstream content silently (reverse proxy)
    let response = await fetch(targetUrl.toString(), {
      method: request.method,
      headers: reqHeaders,
      body: request.method !== 'GET' && request.method !== 'HEAD' ? request.body : undefined,
      redirect: 'follow',
    });

    // Smart fallback: if /dist/<file> is requested and origin returns 404, fallback to /<file>
    if (response.status === 404 && url.pathname.startsWith('/dist/')) {
      const fallbackUrl = new URL(targetUrl.toString());
      fallbackUrl.pathname = url.pathname.replace(/^\/dist/, '');
      const fallbackResponse = await fetch(fallbackUrl.toString(), {
        method: request.method,
        headers: reqHeaders,
        body: request.method !== 'GET' && request.method !== 'HEAD' ? request.body : undefined,
        redirect: 'follow',
      });
      if (fallbackResponse.status === 200) {
        response = fallbackResponse;
      }
    }

    // Create a mutable response headers object
    const resHeaders = new Headers(response.headers);

    // STRIP ALL UPSTREAM VERCEL FINGERPRINTS
    resHeaders.delete('x-vercel-id');
    resHeaders.delete('x-vercel-cache');
    resHeaders.delete('x-vercel-execution-region');
    resHeaders.delete('x-matched-path');
    resHeaders.delete('server');

    // INJECT CUSTOM DESSERT BRANDING & PERMISSIVE CORS
    resHeaders.set('Server', 'DESSERT-Engine/2.0 (High-Performance Edge)');
    resHeaders.set('X-Powered-By', 'DESSERT Framework');
    resHeaders.set('Access-Control-Allow-Origin', '*');
    resHeaders.set('Access-Control-Allow-Methods', 'GET, HEAD, OPTIONS');
    resHeaders.set('Access-Control-Allow-Headers', '*');

    // Edge cache static assets (JS, CSS, SVG, images, fonts)
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
