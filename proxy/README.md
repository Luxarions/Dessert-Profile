# 🛡️ DESSERT Vanity Proxy (Cloudflare Worker)

Setup guide for a free reverse proxy endpoint to mask the upstream origin host without needing a custom domain.

---

## 🎯 Key Benefits:

* **Active Production Endpoint**: [https://dessert-studios.bay-nisdhilla7.workers.dev](https://dessert-studios.bay-nisdhilla7.workers.dev)
* **100% Upstream Origin Masking**: Automatically removes headers such as `x-vercel-id`, `x-vercel-cache`, and `server: Vercel`.
* **Custom Brand Headers**: Replaces server identity with `Server: DESSERT-Engine/2.0`.
* **Universal CORS Enabled**: Assets and scripts can be requested by external websites without CORS friction.
* **Edge Caching**: Assets (`.js`, `.css`, `.svg`, `.png`) are cached globally across Cloudflare edge nodes.

---

## 🔗 Live Public Endpoints:

| Usage | Public Proxy URL |
| :--- | :--- |
| **Showcase & Interactive Demo** | `https://dessert-studios.bay-nisdhilla7.workers.dev/` |
| **Framework CSS Bundle** | `https://dessert-studios.bay-nisdhilla7.workers.dev/dist/dessert.min.css` |
| **Core JS Bundle (UMD)** | `https://dessert-studios.bay-nisdhilla7.workers.dev/dist/dessert.umd.min.js` |
| **Asset Loader Plugin (UMD)** | `https://dessert-studios.bay-nisdhilla7.workers.dev/dist/loader.umd.min.js` |

---

## 🚀 Quick Setup Guide (Free Cloudflare Worker)

1. Open [https://dash.cloudflare.com/](https://dash.cloudflare.com/) (sign up for a free account if you haven't already).
2. On the left navigation, navigate to **Workers & Pages** ➔ **Create Application**.
3. Click the **Create Worker** button.
4. Name your Worker (e.g. `dessert-studios` or `dessert-cdn`).
5. Click **Deploy**.
6. After creation, click **Edit Code** (Quick Editor).
7. Replace the default placeholder code with the contents of `proxy/worker.js`.
8. Click **Save and Deploy**.

Done! Your clean vanity proxy URL is now live at:
`https://<your-worker-name>.<your-subdomain>.workers.dev`

---

## 💻 HTML Integration Example:

```html
<!-- DESSERT Framework Stylesheet via Edge Proxy -->
<link rel="stylesheet" href="https://dessert-studios.bay-nisdhilla7.workers.dev/dist/dessert.min.css" />

<!-- DESSERT Core Library via Edge Proxy -->
<script src="https://dessert-studios.bay-nisdhilla7.workers.dev/dist/dessert.umd.min.js"></script>

<!-- Optional Asset Loader Plugin -->
<script src="https://dessert-studios.bay-nisdhilla7.workers.dev/dist/loader.umd.min.js"></script>
```
