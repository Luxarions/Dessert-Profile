/*! DESSERT v2.0.0 | MIT License */

// src/plugins/loader/ext.js
function ext(url) {
  const clean = url.split("?")[0].split("#")[0];
  const m = clean.match(/\.([a-z0-9]+)$/i);
  return m ? m[1].toLowerCase() : "";
}
var ALIASES = Object.freeze({
  jpg: "img",
  jpeg: "img",
  png: "img",
  gif: "img",
  webp: "img",
  svg: "img",
  avif: "img",
  woff: "font",
  woff2: "font",
  ttf: "font",
  otf: "font",
  mjs: "js",
  htm: "html",
  mp4: "video",
  webm: "video",
  mp3: "audio",
  ogg: "audio",
  wav: "audio"
});

// src/plugins/loader/cache.js
var _cache = /* @__PURE__ */ new Map();
function cached(url, factory) {
  if (_cache.has(url)) return _cache.get(url);
  const p = factory().catch((err) => {
    _cache.delete(url);
    throw err;
  });
  _cache.set(url, p);
  return p;
}
function clearCache() {
  _cache.clear();
}

// src/plugins/loader/loaders/css.js
function loadCSS(url) {
  return cached(url, () => new Promise((resolve, reject) => {
    const existing = document.querySelector(`link[href="${url}"]`);
    if (existing) return resolve(
      /** @type {HTMLLinkElement} */
      existing
    );
    const link = document.createElement("link");
    link.rel = "stylesheet";
    link.href = url;
    link.setAttribute("data-dessert-loaded", "css");
    link.onload = () => resolve(link);
    link.onerror = () => reject(new Error(`CSS failed: ${url}`));
    document.head.appendChild(link);
  }));
}

// src/plugins/loader/loaders/js.js
function loadJS(url, opts = {}) {
  return cached(url, () => new Promise((resolve, reject) => {
    const existing = document.querySelector(`script[src="${url}"]`);
    if (existing) return resolve(
      /** @type {HTMLScriptElement} */
      existing
    );
    const s = document.createElement("script");
    s.src = url;
    s.async = opts.async !== false;
    if (opts.module) s.type = "module";
    s.onload = () => resolve(s);
    s.onerror = () => reject(new Error(`JS failed: ${url}`));
    (opts.target || document.head).appendChild(s);
  }));
}

// src/plugins/loader/loaders/img.js
function loadImg(url) {
  return cached(url, () => new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error(`IMG failed: ${url}`));
    img.src = url;
  }));
}

// src/plugins/loader/loaders/font.js
function loadFont(url) {
  return cached(url, () => new Promise((resolve, reject) => {
    const link = document.createElement("link");
    link.rel = "preload";
    link.as = "font";
    link.type = `font/${ext(url) === "woff2" ? "woff2" : "woff"}`;
    link.href = url;
    link.crossOrigin = "anonymous";
    link.onload = () => resolve(link);
    link.onerror = () => reject(new Error(`Font failed: ${url}`));
    document.head.appendChild(link);
  }));
}

// src/plugins/loader/loaders/json.js
function loadJSON(url) {
  return cached(
    url,
    () => fetch(url).then((r) => {
      if (!r.ok) throw new Error(`JSON failed: ${url} (${r.status})`);
      return r.json();
    })
  );
}

// src/plugins/loader/loaders/html.js
function loadHTML(url) {
  return cached(
    url,
    () => fetch(url).then((r) => {
      if (!r.ok) throw new Error(`HTML failed: ${url}`);
      return r.text();
    })
  );
}

// src/plugins/loader/loaders/video.js
function loadVideo(url) {
  return cached(url, () => new Promise((resolve, reject) => {
    const v = document.createElement("video");
    v.preload = "auto";
    v.onloadedmetadata = () => resolve(v);
    v.onerror = () => reject(new Error(`Video failed: ${url}`));
    v.src = url;
  }));
}

// src/plugins/loader/loaders/audio.js
function loadAudio(url) {
  return cached(url, () => new Promise((resolve, reject) => {
    const a = new Audio();
    a.preload = "auto";
    a.oncanplaythrough = () => resolve(a);
    a.onerror = () => reject(new Error(`Audio failed: ${url}`));
    a.src = url;
  }));
}

// src/plugins/loader/dispatch.js
var LOADERS = {
  css: loadCSS,
  js: loadJS,
  img: loadImg,
  font: loadFont,
  json: loadJSON,
  html: loadHTML,
  video: loadVideo,
  audio: loadAudio
};
function dispatch(typeOrUrl, maybeUrl, opts) {
  let type, url;
  if (maybeUrl === void 0) {
    url = typeOrUrl;
    type = ext(url);
  } else {
    type = typeOrUrl;
    url = maybeUrl;
  }
  const key = ALIASES[type] || type;
  const fn = LOADERS[key];
  if (typeof fn !== "function") {
    return Promise.reject(new Error(`Unsupported asset: ${type} (${url})`));
  }
  return fn(url, opts);
}

// src/plugins/loader/batch/parallel.js
function parallel(items, onProgress) {
  let done = 0;
  const total = items.length;
  return Promise.all(
    items.map((item) => {
      const p = typeof item === "string" ? dispatch(item) : dispatch(item.type, item.url, item.opts);
      return p.then((res) => {
        done++;
        onProgress?.(done, total, item);
        return res;
      });
    })
  );
}

// src/plugins/loader/batch/sequence.js
function sequence(items, onProgress) {
  let done = 0;
  const total = items.length;
  let chain = Promise.resolve([]);
  items.forEach((item) => {
    chain = chain.then((results) => {
      const p = typeof item === "string" ? dispatch(item) : dispatch(item.type, item.url, item.opts);
      return p.then((res) => {
        done++;
        onProgress?.(done, total, item);
        results.push(res);
        return results;
      });
    });
  });
  return chain;
}

// src/plugins/loader/batch/all.js
function all(map, onProgress) {
  const keys = Object.keys(map);
  return parallel(keys.map((k) => map[k]), onProgress).then((results) => {
    const out = {};
    keys.forEach((k, i) => {
      out[k] = results[i];
    });
    return out;
  });
}

// src/plugins/loader/batch/preload.js
var AS_MAP = {
  css: "style",
  js: "script",
  mjs: "script",
  png: "image",
  jpg: "image",
  jpeg: "image",
  gif: "image",
  webp: "image",
  svg: "image",
  avif: "image",
  woff: "font",
  woff2: "font",
  ttf: "font",
  otf: "font",
  json: "fetch",
  mp4: "video",
  webm: "video",
  mp3: "audio",
  ogg: "audio",
  wav: "audio"
};
function preload(urls) {
  urls.forEach((url) => {
    const type = ext(url);
    const as = AS_MAP[type];
    if (!as) return;
    const link = document.createElement("link");
    link.rel = "preload";
    link.href = url;
    link.as = as;
    if (as === "font" || as === "fetch") link.crossOrigin = "anonymous";
    document.head.appendChild(link);
  });
}

// src/plugins/loader/install.js
function install(core, priv, api) {
  const load = api.dispatch;
  load.css = api.loadCSS;
  load.js = api.loadJS;
  load.img = api.loadImg;
  load.font = api.loadFont;
  load.json = api.loadJSON;
  load.html = api.loadHTML;
  load.video = api.loadVideo;
  load.audio = api.loadAudio;
  load.parallel = api.parallel;
  load.sequence = api.sequence;
  load.all = api.all;
  load.preload = api.preload;
  load.clearCache = api.clearCache;
  load.cache = api.cache;
  load.version = api.version;
  core.load = load;
  priv.log?.("loader installed");
}

// src/plugins/loader/LoaderPlugin.js
var VERSION = "2.0.0";
var LoaderPlugin = class _LoaderPlugin {
  /** @type {string} */
  static name = "loader";
  /** @type {string} */
  static version = VERSION;
  /** @returns {string} */
  get name() {
    return _LoaderPlugin.name;
  }
  /** @returns {string} */
  get version() {
    return _LoaderPlugin.version;
  }
  /**
   * @description Install loader API onto a DESSERT instance.
   * @param {*} core
   * @param {{ log?: (...args: *) => void }} priv
   * @returns {void}
   */
  install(core, priv) {
    install(core, priv, {
      dispatch,
      loadCSS,
      loadJS,
      loadImg,
      loadFont,
      loadJSON,
      loadHTML,
      loadVideo,
      loadAudio,
      parallel,
      sequence,
      all,
      preload,
      cache: _cache,
      clearCache,
      version: VERSION
    });
  }
  /**
   * @description Plugin init hook.
   * @param {*} core
   * @returns {void}
   */
  init(core) {
    core?.controller?.emit("plugin:loader:ready", { version: VERSION });
  }
};
var loaderPlugin = new LoaderPlugin();
export {
  LoaderPlugin,
  loaderPlugin
};
//# sourceMappingURL=loader.esm.js.map
