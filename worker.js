/**
 * DESSERT Cloudflare Worker — Privacy & Vanity Reverse Proxy
 * Target: https://dessert-profile.vercel.app
 */

const TARGET_HOST = 'dessert-profile.vercel.app';

export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);

    const targetUrl = new URL(request.url);
    targetUrl.hostname = TARGET_HOST;
    targetUrl.protocol = 'https:';

    const reqHeaders = new Headers(request.headers);
    reqHeaders.set('Host', TARGET_HOST);
    reqHeaders.set('X-Forwarded-Host', url.hostname);
    reqHeaders.set('X-Real-IP', request.headers.get('cf-connecting-ip') || '');

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

    const resHeaders = new Headers(response.headers);

    // Strip all upstream Vercel fingerprint headers
    resHeaders.delete('x-vercel-id');
    resHeaders.delete('x-vercel-cache');
    resHeaders.delete('x-vercel-execution-region');
    resHeaders.delete('x-matched-path');
    resHeaders.delete('server');

    // Inject custom DESSERT server headers & permissive CORS
    resHeaders.set('Server', 'DESSERT-Engine/2.0 (High-Performance Edge)');
    resHeaders.set('X-Powered-By', 'DESSERT Framework');
    resHeaders.set('Access-Control-Allow-Origin', '*');
    resHeaders.set('Access-Control-Allow-Methods', 'GET, HEAD, OPTIONS');
    resHeaders.set('Access-Control-Allow-Headers', '*');

    // Edge cache static assets (JS, CSS, images, fonts)
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
