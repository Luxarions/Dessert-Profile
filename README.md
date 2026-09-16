# 🍰 DESSERT v2.0.0

> Lightweight UI Logic Library with the `DESSERT` / `dessert-*` prefix.

[![License: MIT](https://img.shields.io/badge/License-MIT-pink.svg)](https://opensource.org/licenses/MIT)

---

## ✨ Features

- Prefix-consistent — `DESSERT`, `dessert-*`, `--dessert-*`, `data-dessert-*`
- Zero dependencies — pure ES6+
- Modular components — modal, dropdown, tabs, accordion
- Multi-build — CJS + ESM + UMD (min & non-min)
- Plugin system — `register()`, `use()`, `install()`
- Asset Loader — CSS/JS/IMG/Font/JSON/HTML/Video/Audio
- Auto-init — scan `[data-dessert]` on DOM ready
- SSR-safe — guards for `document` and `window`

---

## 🌐 Live Demo & Showcase

- **Live Preview (Vercel)**: [https://dessert-profile.vercel.app](https://dessert-profile.vercel.app)

---

## 📦 Installation & CDN Usage

### ⚡ 1. Direct jsDelivr CDN (Instant Setup via GitHub)

Gunakan langsung di tag `<head>` HTML Anda tanpa perlu instalasi apa pun:

```html
<!-- DESSERT CSS v2.0 (Minified) -->
<link rel="stylesheet" href="https://cdn.jsdelivr.net/gh/Luxarions/Dessert-Profile@main/dist/dessert.min.css">

<!-- Core DESSERT Library (UMD Minified) -->
<script src="https://cdn.jsdelivr.net/gh/Luxarions/Dessert-Profile@main/dist/dessert.umd.min.js"></script>

<!-- Asset Loader Plugin (UMD Minified) -->
<script src="https://cdn.jsdelivr.net/gh/Luxarions/Dessert-Profile@main/dist/loader.umd.min.js"></script>

<script>
  // Aktifkan loader dan auto-init
  DESSERT.use(DESSERTLoader.loaderPlugin);
  DESSERT.init();
  DESSERT.alert('DESSERT CDN is Ready!', 'success');
</script>
```

#### Atau Menggunakan ES Module Langsung di Browser:
```html
<link rel="stylesheet" href="https://cdn.jsdelivr.net/gh/Luxarions/Dessert-Profile@main/dist/dessert.min.css">

<script type="module">
  import DESSERT from 'https://cdn.jsdelivr.net/gh/Luxarions/Dessert-Profile@main/dist/dessert.esm.min.js';
  import { loaderPlugin } from 'https://cdn.jsdelivr.net/gh/Luxarions/Dessert-Profile@main/dist/loader.esm.min.js';

  DESSERT.use(loaderPlugin);
  DESSERT.alert('ES Module loaded via jsDelivr CDN', 'info');
</script>
```

### 📦 2. Via NPM Registry

```bash
npm install dessert
```

```html
<link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/dessert/dist/dessert.min.css">
<script src="https://cdn.jsdelivr.net/npm/dessert/dist/dessert.umd.min.js"></script>
<script src="https://cdn.jsdelivr.net/npm/dessert/dist/loader.umd.min.js"></script>
```

---

## 🚀 Quick Start

ESM

```javascript
import DESSERT from 'dessert';
import { loaderPlugin } from 'dessert/loader';
import 'dessert/css';

DESSERT.use(loaderPlugin);
DESSERT.alert('Hello!', 'success');
```

CommonJS

```javascript
const DESSERT = require('dessert');
const { loaderPlugin } = require('dessert/loader');

DESSERT.use(loaderPlugin);
```

UMD

```html
<link rel="stylesheet" href="dist/dessert.css">
<script src="dist/dessert.umd.js"></script>
<script src="dist/loader.umd.js"></script>
<script>
  DESSERT.use(DESSERTLoader.loaderPlugin);
  DESSERT.init();
</script>
```

---

## 🧱 Components

### Modal

```html
<button data-dessert-open="myModal">Open</button>

<div class="dessert-modal" id="myModal" data-dessert="modal">
  <div class="dessert-modal-content">
    <h3>Title</h3>
    <button data-dessert-close>Close</button>
  </div>
</div>
```

### Dropdown

```html
<div class="dessert-dropdown" data-dessert="dropdown">
  <button class="dessert-btn" data-dessert-trigger>Menu ▾</button>
  <div class="dessert-dropdown-menu" data-dessert-menu>
    <a href="#">Item 1</a>
  </div>
</div>
```

### Tabs

```html
<div class="dessert-tabs" data-dessert="tabs">
  <div class="dessert-tabs-nav">
    <button class="dessert-tab dessert-active" data-dessert-tab="a">A</button>
    <button class="dessert-tab" data-dessert-tab="b">B</button>
  </div>
  <div class="dessert-panel dessert-active" data-dessert-panel="a">A</div>
  <div class="dessert-panel" data-dessert-panel="b">B</div>
</div>
```

### Accordion

```html
<div class="dessert-accordion" data-dessert="accordion">
  <div class="dessert-accordion-item">
    <div class="dessert-accordion-header">Header</div>
    <div class="dessert-accordion-body">Body</div>
  </div>
</div>
```

### Alert

```javascript
DESSERT.alert('Saved!', 'success');
```

---

## 📥 Asset Loader

```javascript
await DESSERT.load.css('/app.css');
const img = await DESSERT.load.img('/logo.png');
const data = await DESSERT.load.json('/config.json');

await DESSERT.load.parallel([
  { type: 'css',  url: '/app.css' },
  { type: 'json', url: '/config.json' },
], (done, total) => console.log(`${done}/${total}`));

await DESSERT.load.sequence(['/a.js', '/b.js']);

const assets = await DESSERT.load.all({
  css: '/app.css',
  config: '/config.json',
});

DESSERT.load.preload(['/hero.jpg', '/font.woff2']);
```

---

## 🛠 API

### Core

| Method | Description |
| --- | --- |
| `DESSERT.init(opts?)` | Initialize library |
| `DESSERT.use(plugin)` | Register + init plugin |
| `DESSERT.register(name, plugin)` | Register plugin only |
| `DESSERT.destroy(el)` | Teardown instance |

#### Options

```javascript
DESSERT.init({
  autoInit: true,
  debug: false,
  closeOnEscape: true,
});
```

### Utilities

| Method | Description |
| --- | --- |
| `DESSERT.addClass(el, name)` | Add prefixed class |
| `DESSERT.removeClass(el, name)` | Remove prefixed class |
| `DESSERT.toggleClass(el, name, force?)` | Toggle prefixed class |
| `DESSERT.setData(el, key, value)` | Set data-dessert-* |
| `DESSERT.getData(el, key)` | Get data-dessert-* |

### Controller (`DESSERT.controller`)

Centralized event bus (Pub/Sub), lifecycle manager, and global state hub:

| Method | Description |
| --- | --- |
| `DESSERT.controller.on(event, handler)` | Subscribe to events (returns unsubscribe function) |
| `DESSERT.controller.off(event, handler)` | Unsubscribe from events |
| `DESSERT.controller.emit(event, payload)` | Emit custom or lifecycle event |
| `DESSERT.controller.setState(key, val)` | Set global state (triggers `state:change`) |
| `DESSERT.controller.getState(key, fallback)` | Get state value |
| `DESSERT.controller.closeAll()` | Close all open modals & dropdown menus globally |
| `DESSERT.controller.refresh()` | Re-scan and bind dynamic DOM elements |

```javascript
// Example: Listen to modal events
DESSERT.controller.on('modal:open', ({ id }) => {
  console.log(`Modal opened: ${id}`);
});

// Example: Global dismiss
DESSERT.controller.closeAll();
```

---

## 🏗 Build

```bash
npm install
npm run build
```

Output in `dist/`:

```
dessert.cjs.js         dessert.esm.js         dessert.umd.js
dessert.cjs.min.js     dessert.esm.min.js     dessert.umd.min.js
loader.cjs.js          loader.esm.js          loader.umd.js
loader.cjs.min.js      loader.esm.min.js      loader.umd.min.js
dessert.css            dessert.min.css
```

---

## 🧪 Test

```bash
npm test
```

---

## 🌐 Serve Examples

```bash
npm run build     # required first
npm run serve
```

- `http://localhost:8000/example/index.html` — UMD/dist
- `http://localhost:8000/example/index-esm.html` — ESM/src
- `http://localhost:8000/example/index-loader.html` — Loader demo

---

## 🛡️ Vanity Proxy CDN (Origin Masking)

Untuk menyamarkan URL asli dan menghilangkan jejak hosting publik:

Script proxy tersedia di `proxy/worker.js`. Dapat di-deploy gratis di **Cloudflare Workers** (mendapatkan URL publik `https://dessert-ui.<user>.workers.dev` tanpa perlu domain sendiri).

- Otomatis menghapus header `x-vercel-id`, `x-vercel-cache`, dan `server: Vercel`.
- Mengganti identitas menjadi `Server: DESSERT-Engine/2.0`.
- Panduan lengkap: lihat [proxy/README.md](proxy/README.md).

---

## 📜 License

MIT © DESSERT contributors
