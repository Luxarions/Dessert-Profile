(function (root, factory) {
  if (typeof define === 'function' && define.amd) {
    define([], factory);
  } else if (typeof module === 'object' && module.exports) {
    module.exports = factory();
  } else {
    root.DESSERTLoader = factory();
  }
}(typeof self !== 'undefined' ? self : this, function () {
/*! DESSERT v2.0.0 | MIT License */
var DESSERTLoader = (() => {
  var __defProp = Object.defineProperty;
  var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
  var __getOwnPropNames = Object.getOwnPropertyNames;
  var __hasOwnProp = Object.prototype.hasOwnProperty;
  var __export = (target, all2) => {
    for (var name in all2)
      __defProp(target, name, { get: all2[name], enumerable: true });
  };
  var __copyProps = (to, from, except, desc) => {
    if (from && typeof from === "object" || typeof from === "function") {
      for (let key of __getOwnPropNames(from))
        if (!__hasOwnProp.call(to, key) && key !== except)
          __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
    }
    return to;
  };
  var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

  // src/plugins/loader/LoaderPlugin.js
  var LoaderPlugin_exports = {};
  __export(LoaderPlugin_exports, {
    LoaderPlugin: () => LoaderPlugin,
    loaderPlugin: () => loaderPlugin
  });

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
    }
  };
  var loaderPlugin = new LoaderPlugin();
  return __toCommonJS(LoaderPlugin_exports);
})();
//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAic291cmNlcyI6IFsic3JjL3BsdWdpbnMvbG9hZGVyL0xvYWRlclBsdWdpbi5qcyIsICJzcmMvcGx1Z2lucy9sb2FkZXIvZXh0LmpzIiwgInNyYy9wbHVnaW5zL2xvYWRlci9jYWNoZS5qcyIsICJzcmMvcGx1Z2lucy9sb2FkZXIvbG9hZGVycy9jc3MuanMiLCAic3JjL3BsdWdpbnMvbG9hZGVyL2xvYWRlcnMvanMuanMiLCAic3JjL3BsdWdpbnMvbG9hZGVyL2xvYWRlcnMvaW1nLmpzIiwgInNyYy9wbHVnaW5zL2xvYWRlci9sb2FkZXJzL2ZvbnQuanMiLCAic3JjL3BsdWdpbnMvbG9hZGVyL2xvYWRlcnMvanNvbi5qcyIsICJzcmMvcGx1Z2lucy9sb2FkZXIvbG9hZGVycy9odG1sLmpzIiwgInNyYy9wbHVnaW5zL2xvYWRlci9sb2FkZXJzL3ZpZGVvLmpzIiwgInNyYy9wbHVnaW5zL2xvYWRlci9sb2FkZXJzL2F1ZGlvLmpzIiwgInNyYy9wbHVnaW5zL2xvYWRlci9kaXNwYXRjaC5qcyIsICJzcmMvcGx1Z2lucy9sb2FkZXIvYmF0Y2gvcGFyYWxsZWwuanMiLCAic3JjL3BsdWdpbnMvbG9hZGVyL2JhdGNoL3NlcXVlbmNlLmpzIiwgInNyYy9wbHVnaW5zL2xvYWRlci9iYXRjaC9hbGwuanMiLCAic3JjL3BsdWdpbnMvbG9hZGVyL2JhdGNoL3ByZWxvYWQuanMiLCAic3JjL3BsdWdpbnMvbG9hZGVyL2luc3RhbGwuanMiXSwKICAic291cmNlc0NvbnRlbnQiOiBbIi8qKlxuICogQGZpbGUgREVTU0VSVCBMb2FkZXIgcGx1Z2luIGNsYXNzLlxuICovXG5cbmltcG9ydCB7IGRpc3BhdGNoIH0gZnJvbSAnLi9kaXNwYXRjaC5qcyc7XG5pbXBvcnQgeyBsb2FkQ1NTIH0gZnJvbSAnLi9sb2FkZXJzL2Nzcy5qcyc7XG5pbXBvcnQgeyBsb2FkSlMgfSBmcm9tICcuL2xvYWRlcnMvanMuanMnO1xuaW1wb3J0IHsgbG9hZEltZyB9IGZyb20gJy4vbG9hZGVycy9pbWcuanMnO1xuaW1wb3J0IHsgbG9hZEZvbnQgfSBmcm9tICcuL2xvYWRlcnMvZm9udC5qcyc7XG5pbXBvcnQgeyBsb2FkSlNPTiB9IGZyb20gJy4vbG9hZGVycy9qc29uLmpzJztcbmltcG9ydCB7IGxvYWRIVE1MIH0gZnJvbSAnLi9sb2FkZXJzL2h0bWwuanMnO1xuaW1wb3J0IHsgbG9hZFZpZGVvIH0gZnJvbSAnLi9sb2FkZXJzL3ZpZGVvLmpzJztcbmltcG9ydCB7IGxvYWRBdWRpbyB9IGZyb20gJy4vbG9hZGVycy9hdWRpby5qcyc7XG5pbXBvcnQgeyBwYXJhbGxlbCB9IGZyb20gJy4vYmF0Y2gvcGFyYWxsZWwuanMnO1xuaW1wb3J0IHsgc2VxdWVuY2UgfSBmcm9tICcuL2JhdGNoL3NlcXVlbmNlLmpzJztcbmltcG9ydCB7IGFsbCB9IGZyb20gJy4vYmF0Y2gvYWxsLmpzJztcbmltcG9ydCB7IHByZWxvYWQgfSBmcm9tICcuL2JhdGNoL3ByZWxvYWQuanMnO1xuaW1wb3J0IHsgX2NhY2hlLCBjbGVhckNhY2hlIH0gZnJvbSAnLi9jYWNoZS5qcyc7XG5pbXBvcnQgeyBpbnN0YWxsIH0gZnJvbSAnLi9pbnN0YWxsLmpzJztcblxuLyoqXG4gKiBAZGVzY3JpcHRpb24gTG9hZGVyIHBsdWdpbiB2ZXJzaW9uLlxuICogQHR5cGUge3N0cmluZ31cbiAqIEBjb25zdGFudFxuICovXG5jb25zdCBWRVJTSU9OID0gJzIuMC4wJztcblxuLyoqXG4gKiBAZGVzY3JpcHRpb24gREVTU0VSVCBMb2FkZXIgcGx1Z2luLlxuICovXG5jbGFzcyBMb2FkZXJQbHVnaW4ge1xuICAvKiogQHR5cGUge3N0cmluZ30gKi9cbiAgc3RhdGljIG5hbWUgPSAnbG9hZGVyJztcblxuICAvKiogQHR5cGUge3N0cmluZ30gKi9cbiAgc3RhdGljIHZlcnNpb24gPSBWRVJTSU9OO1xuXG4gIC8qKiBAcmV0dXJucyB7c3RyaW5nfSAqL1xuICBnZXQgbmFtZSgpIHsgcmV0dXJuIExvYWRlclBsdWdpbi5uYW1lOyB9XG5cbiAgLyoqIEByZXR1cm5zIHtzdHJpbmd9ICovXG4gIGdldCB2ZXJzaW9uKCkgeyByZXR1cm4gTG9hZGVyUGx1Z2luLnZlcnNpb247IH1cblxuICAvKipcbiAgICogQGRlc2NyaXB0aW9uIEluc3RhbGwgbG9hZGVyIEFQSSBvbnRvIGEgREVTU0VSVCBpbnN0YW5jZS5cbiAgICogQHBhcmFtIHsqfSBjb3JlXG4gICAqIEBwYXJhbSB7eyBsb2c/OiAoLi4uYXJnczogKikgPT4gdm9pZCB9fSBwcml2XG4gICAqIEByZXR1cm5zIHt2b2lkfVxuICAgKi9cbiAgaW5zdGFsbChjb3JlLCBwcml2KSB7XG4gICAgaW5zdGFsbChjb3JlLCBwcml2LCB7XG4gICAgICBkaXNwYXRjaCxcbiAgICAgIGxvYWRDU1MsIGxvYWRKUywgbG9hZEltZywgbG9hZEZvbnQsIGxvYWRKU09OLFxuICAgICAgbG9hZEhUTUwsIGxvYWRWaWRlbywgbG9hZEF1ZGlvLFxuICAgICAgcGFyYWxsZWwsIHNlcXVlbmNlLCBhbGwsIHByZWxvYWQsXG4gICAgICBjYWNoZTogX2NhY2hlLFxuICAgICAgY2xlYXJDYWNoZSxcbiAgICAgIHZlcnNpb246IFZFUlNJT04sXG4gICAgfSk7XG4gIH1cblxuICAvKipcbiAgICogQGRlc2NyaXB0aW9uIFBsdWdpbiBpbml0IGhvb2suXG4gICAqIEBwYXJhbSB7Kn0gY29yZVxuICAgKiBAcmV0dXJucyB7dm9pZH1cbiAgICovXG4gIGluaXQoY29yZSkge1xuICAgIC8vIG5vLW9wXG4gIH1cbn1cblxuLyoqXG4gKiBAZGVzY3JpcHRpb24gU2luZ2xldG9uIGxvYWRlciBwbHVnaW4uXG4gKiBAdHlwZSB7TG9hZGVyUGx1Z2lufVxuICovXG5jb25zdCBsb2FkZXJQbHVnaW4gPSBuZXcgTG9hZGVyUGx1Z2luKCk7XG5cbmV4cG9ydCB7IExvYWRlclBsdWdpbiwgbG9hZGVyUGx1Z2luIH07XG4iLCAiLyoqXG4gKiBAZmlsZSBGaWxlIGV4dGVuc2lvbiBoZWxwZXJzLlxuICovXG5cbi8qKlxuICogQGRlc2NyaXB0aW9uIEV4dHJhY3QgbG93ZXJjYXNlIGV4dGVuc2lvbiBmcm9tIFVSTC5cbiAqIEBwYXJhbSB7c3RyaW5nfSB1cmxcbiAqIEByZXR1cm5zIHtzdHJpbmd9XG4gKi9cbmZ1bmN0aW9uIGV4dCh1cmwpIHtcbiAgY29uc3QgY2xlYW4gPSB1cmwuc3BsaXQoJz8nKVswXS5zcGxpdCgnIycpWzBdO1xuICBjb25zdCBtID0gY2xlYW4ubWF0Y2goL1xcLihbYS16MC05XSspJC9pKTtcbiAgcmV0dXJuIG0gPyBtWzFdLnRvTG93ZXJDYXNlKCkgOiAnJztcbn1cblxuLyoqXG4gKiBAZGVzY3JpcHRpb24gRXh0ZW5zaW9uLXRvLWxvYWRlciBhbGlhcyBtYXAuXG4gKiBAdHlwZSB7UmVhZG9ubHk8T2JqZWN0PHN0cmluZywgc3RyaW5nPj59XG4gKi9cbmNvbnN0IEFMSUFTRVMgPSBPYmplY3QuZnJlZXplKHtcbiAganBnOiAnaW1nJywganBlZzogJ2ltZycsIHBuZzogJ2ltZycsIGdpZjogJ2ltZycsXG4gIHdlYnA6ICdpbWcnLCBzdmc6ICdpbWcnLCBhdmlmOiAnaW1nJyxcbiAgd29mZjogJ2ZvbnQnLCB3b2ZmMjogJ2ZvbnQnLCB0dGY6ICdmb250Jywgb3RmOiAnZm9udCcsXG4gIG1qczogJ2pzJywgaHRtOiAnaHRtbCcsXG4gIG1wNDogJ3ZpZGVvJywgd2VibTogJ3ZpZGVvJyxcbiAgbXAzOiAnYXVkaW8nLCBvZ2c6ICdhdWRpbycsIHdhdjogJ2F1ZGlvJyxcbn0pO1xuXG5leHBvcnQgeyBleHQsIEFMSUFTRVMgfTtcbiIsICIvKipcbiAqIEBmaWxlIExvYWRlciBwcm9taXNlIGNhY2hlLlxuICovXG5cbi8qKlxuICogQGRlc2NyaXB0aW9uIENhY2hlIG1hcCBmb3IgYXNzZXQgbG9hZGluZyBwcm9taXNlcy5cbiAqIEB0eXBlIHtNYXA8c3RyaW5nLCBQcm9taXNlPCo+Pn1cbiAqL1xuY29uc3QgX2NhY2hlID0gbmV3IE1hcCgpO1xuXG4vKipcbiAqIEBkZXNjcmlwdGlvbiBXcmFwIGEgZmFjdG9yeSB3aXRoIGNhY2hpbmcuXG4gKiBAdGVtcGxhdGUgVFxuICogQHBhcmFtIHtzdHJpbmd9IHVybFxuICogQHBhcmFtIHsoKSA9PiBQcm9taXNlPFQ+fSBmYWN0b3J5XG4gKiBAcmV0dXJucyB7UHJvbWlzZTxUPn1cbiAqL1xuZnVuY3Rpb24gY2FjaGVkKHVybCwgZmFjdG9yeSkge1xuICBpZiAoX2NhY2hlLmhhcyh1cmwpKSByZXR1cm4gX2NhY2hlLmdldCh1cmwpO1xuICBjb25zdCBwID0gZmFjdG9yeSgpLmNhdGNoKChlcnIpID0+IHtcbiAgICBfY2FjaGUuZGVsZXRlKHVybCk7XG4gICAgdGhyb3cgZXJyO1xuICB9KTtcbiAgX2NhY2hlLnNldCh1cmwsIHApO1xuICByZXR1cm4gcDtcbn1cblxuLyoqXG4gKiBAZGVzY3JpcHRpb24gQ2xlYXIgYXNzZXQgY2FjaGUuXG4gKiBAcmV0dXJucyB7dm9pZH1cbiAqL1xuZnVuY3Rpb24gY2xlYXJDYWNoZSgpIHtcbiAgX2NhY2hlLmNsZWFyKCk7XG59XG5cbmV4cG9ydCB7IF9jYWNoZSwgY2FjaGVkLCBjbGVhckNhY2hlIH07XG4iLCAiLyoqXG4gKiBAZmlsZSBDU1MgbG9hZGVyLlxuICovXG5cbmltcG9ydCB7IGNhY2hlZCB9IGZyb20gJy4uL2NhY2hlLmpzJztcblxuLyoqXG4gKiBAZGVzY3JpcHRpb24gTG9hZCBhIENTUyBmaWxlIHZpYSA8bGluaz4uXG4gKiBAcGFyYW0ge3N0cmluZ30gdXJsXG4gKiBAcmV0dXJucyB7UHJvbWlzZTxIVE1MTGlua0VsZW1lbnQ+fVxuICovXG5mdW5jdGlvbiBsb2FkQ1NTKHVybCkge1xuICByZXR1cm4gY2FjaGVkKHVybCwgKCkgPT4gbmV3IFByb21pc2UoKHJlc29sdmUsIHJlamVjdCkgPT4ge1xuICAgIGNvbnN0IGV4aXN0aW5nID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcihgbGlua1tocmVmPVwiJHt1cmx9XCJdYCk7XG4gICAgaWYgKGV4aXN0aW5nKSByZXR1cm4gcmVzb2x2ZSgvKiogQHR5cGUge0hUTUxMaW5rRWxlbWVudH0gKi8oZXhpc3RpbmcpKTtcblxuICAgIGNvbnN0IGxpbmsgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdsaW5rJyk7XG4gICAgbGluay5yZWwgPSAnc3R5bGVzaGVldCc7XG4gICAgbGluay5ocmVmID0gdXJsO1xuICAgIGxpbmsuc2V0QXR0cmlidXRlKCdkYXRhLWRlc3NlcnQtbG9hZGVkJywgJ2NzcycpO1xuICAgIGxpbmsub25sb2FkID0gKCkgPT4gcmVzb2x2ZShsaW5rKTtcbiAgICBsaW5rLm9uZXJyb3IgPSAoKSA9PiByZWplY3QobmV3IEVycm9yKGBDU1MgZmFpbGVkOiAke3VybH1gKSk7XG4gICAgZG9jdW1lbnQuaGVhZC5hcHBlbmRDaGlsZChsaW5rKTtcbiAgfSkpO1xufVxuXG5leHBvcnQgeyBsb2FkQ1NTIH07XG4iLCAiLyoqXG4gKiBAZmlsZSBKYXZhU2NyaXB0IGxvYWRlci5cbiAqL1xuXG5pbXBvcnQgeyBjYWNoZWQgfSBmcm9tICcuLi9jYWNoZS5qcyc7XG5cbi8qKlxuICogQHR5cGVkZWYge09iamVjdH0gSlNMb2FkZXJPcHRpb25zXG4gKiBAcHJvcGVydHkge2Jvb2xlYW59IFthc3luYz10cnVlXVxuICogQHByb3BlcnR5IHtib29sZWFufSBbbW9kdWxlPWZhbHNlXVxuICogQHByb3BlcnR5IHtIVE1MRWxlbWVudH0gW3RhcmdldF1cbiAqL1xuXG4vKipcbiAqIEBkZXNjcmlwdGlvbiBMb2FkIGEgSlMgZmlsZSB2aWEgPHNjcmlwdD4uXG4gKiBAcGFyYW0ge3N0cmluZ30gdXJsXG4gKiBAcGFyYW0ge0pTTG9hZGVyT3B0aW9uc30gW29wdHM9e31dXG4gKiBAcmV0dXJucyB7UHJvbWlzZTxIVE1MU2NyaXB0RWxlbWVudD59XG4gKi9cbmZ1bmN0aW9uIGxvYWRKUyh1cmwsIG9wdHMgPSB7fSkge1xuICByZXR1cm4gY2FjaGVkKHVybCwgKCkgPT4gbmV3IFByb21pc2UoKHJlc29sdmUsIHJlamVjdCkgPT4ge1xuICAgIGNvbnN0IGV4aXN0aW5nID0gZG9jdW1lbnQucXVlcnlTZWxlY3Rvcihgc2NyaXB0W3NyYz1cIiR7dXJsfVwiXWApO1xuICAgIGlmIChleGlzdGluZykgcmV0dXJuIHJlc29sdmUoLyoqIEB0eXBlIHtIVE1MU2NyaXB0RWxlbWVudH0gKi8oZXhpc3RpbmcpKTtcblxuICAgIGNvbnN0IHMgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdzY3JpcHQnKTtcbiAgICBzLnNyYyA9IHVybDtcbiAgICBzLmFzeW5jID0gb3B0cy5hc3luYyAhPT0gZmFsc2U7XG4gICAgaWYgKG9wdHMubW9kdWxlKSBzLnR5cGUgPSAnbW9kdWxlJztcbiAgICBzLm9ubG9hZCA9ICgpID0+IHJlc29sdmUocyk7XG4gICAgcy5vbmVycm9yID0gKCkgPT4gcmVqZWN0KG5ldyBFcnJvcihgSlMgZmFpbGVkOiAke3VybH1gKSk7XG4gICAgKG9wdHMudGFyZ2V0IHx8IGRvY3VtZW50LmhlYWQpLmFwcGVuZENoaWxkKHMpO1xuICB9KSk7XG59XG5cbmV4cG9ydCB7IGxvYWRKUyB9O1xuIiwgIi8qKlxuICogQGZpbGUgSW1hZ2UgbG9hZGVyLlxuICovXG5cbmltcG9ydCB7IGNhY2hlZCB9IGZyb20gJy4uL2NhY2hlLmpzJztcblxuLyoqXG4gKiBAZGVzY3JpcHRpb24gTG9hZCBhbiBpbWFnZS5cbiAqIEBwYXJhbSB7c3RyaW5nfSB1cmxcbiAqIEByZXR1cm5zIHtQcm9taXNlPEhUTUxJbWFnZUVsZW1lbnQ+fVxuICovXG5mdW5jdGlvbiBsb2FkSW1nKHVybCkge1xuICByZXR1cm4gY2FjaGVkKHVybCwgKCkgPT4gbmV3IFByb21pc2UoKHJlc29sdmUsIHJlamVjdCkgPT4ge1xuICAgIGNvbnN0IGltZyA9IG5ldyBJbWFnZSgpO1xuICAgIGltZy5vbmxvYWQgPSAoKSA9PiByZXNvbHZlKGltZyk7XG4gICAgaW1nLm9uZXJyb3IgPSAoKSA9PiByZWplY3QobmV3IEVycm9yKGBJTUcgZmFpbGVkOiAke3VybH1gKSk7XG4gICAgaW1nLnNyYyA9IHVybDtcbiAgfSkpO1xufVxuXG5leHBvcnQgeyBsb2FkSW1nIH07XG4iLCAiLyoqXG4gKiBAZmlsZSBGb250IHByZWxvYWQgbG9hZGVyLlxuICovXG5cbmltcG9ydCB7IGNhY2hlZCB9IGZyb20gJy4uL2NhY2hlLmpzJztcbmltcG9ydCB7IGV4dCB9IGZyb20gJy4uL2V4dC5qcyc7XG5cbi8qKlxuICogQGRlc2NyaXB0aW9uIFByZWxvYWQgYSBmb250IGZpbGUuXG4gKiBAcGFyYW0ge3N0cmluZ30gdXJsXG4gKiBAcmV0dXJucyB7UHJvbWlzZTxIVE1MTGlua0VsZW1lbnQ+fVxuICovXG5mdW5jdGlvbiBsb2FkRm9udCh1cmwpIHtcbiAgcmV0dXJuIGNhY2hlZCh1cmwsICgpID0+IG5ldyBQcm9taXNlKChyZXNvbHZlLCByZWplY3QpID0+IHtcbiAgICBjb25zdCBsaW5rID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnbGluaycpO1xuICAgIGxpbmsucmVsID0gJ3ByZWxvYWQnO1xuICAgIGxpbmsuYXMgPSAnZm9udCc7XG4gICAgbGluay50eXBlID0gYGZvbnQvJHtleHQodXJsKSA9PT0gJ3dvZmYyJyA/ICd3b2ZmMicgOiAnd29mZid9YDtcbiAgICBsaW5rLmhyZWYgPSB1cmw7XG4gICAgbGluay5jcm9zc09yaWdpbiA9ICdhbm9ueW1vdXMnO1xuICAgIGxpbmsub25sb2FkID0gKCkgPT4gcmVzb2x2ZShsaW5rKTtcbiAgICBsaW5rLm9uZXJyb3IgPSAoKSA9PiByZWplY3QobmV3IEVycm9yKGBGb250IGZhaWxlZDogJHt1cmx9YCkpO1xuICAgIGRvY3VtZW50LmhlYWQuYXBwZW5kQ2hpbGQobGluayk7XG4gIH0pKTtcbn1cblxuZXhwb3J0IHsgbG9hZEZvbnQgfTtcbiIsICIvKipcbiAqIEBmaWxlIEpTT04gbG9hZGVyLlxuICovXG5cbmltcG9ydCB7IGNhY2hlZCB9IGZyb20gJy4uL2NhY2hlLmpzJztcblxuLyoqXG4gKiBAZGVzY3JpcHRpb24gRmV0Y2ggYW5kIHBhcnNlIEpTT04uXG4gKiBAcGFyYW0ge3N0cmluZ30gdXJsXG4gKiBAcmV0dXJucyB7UHJvbWlzZTxPYmplY3Q+fVxuICovXG5mdW5jdGlvbiBsb2FkSlNPTih1cmwpIHtcbiAgcmV0dXJuIGNhY2hlZCh1cmwsICgpID0+XG4gICAgZmV0Y2godXJsKS50aGVuKChyKSA9PiB7XG4gICAgICBpZiAoIXIub2spIHRocm93IG5ldyBFcnJvcihgSlNPTiBmYWlsZWQ6ICR7dXJsfSAoJHtyLnN0YXR1c30pYCk7XG4gICAgICByZXR1cm4gci5qc29uKCk7XG4gICAgfSlcbiAgKTtcbn1cblxuZXhwb3J0IHsgbG9hZEpTT04gfTtcbiIsICIvKipcbiAqIEBmaWxlIEhUTUwgbG9hZGVyLlxuICovXG5cbmltcG9ydCB7IGNhY2hlZCB9IGZyb20gJy4uL2NhY2hlLmpzJztcblxuLyoqXG4gKiBAZGVzY3JpcHRpb24gRmV0Y2ggSFRNTCB0ZXh0LlxuICogQHBhcmFtIHtzdHJpbmd9IHVybFxuICogQHJldHVybnMge1Byb21pc2U8c3RyaW5nPn1cbiAqL1xuZnVuY3Rpb24gbG9hZEhUTUwodXJsKSB7XG4gIHJldHVybiBjYWNoZWQodXJsLCAoKSA9PlxuICAgIGZldGNoKHVybCkudGhlbigocikgPT4ge1xuICAgICAgaWYgKCFyLm9rKSB0aHJvdyBuZXcgRXJyb3IoYEhUTUwgZmFpbGVkOiAke3VybH1gKTtcbiAgICAgIHJldHVybiByLnRleHQoKTtcbiAgICB9KVxuICApO1xufVxuXG5leHBvcnQgeyBsb2FkSFRNTCB9O1xuIiwgIi8qKlxuICogQGZpbGUgVmlkZW8gbG9hZGVyLlxuICovXG5cbmltcG9ydCB7IGNhY2hlZCB9IGZyb20gJy4uL2NhY2hlLmpzJztcblxuLyoqXG4gKiBAZGVzY3JpcHRpb24gTG9hZCBhIHZpZGVvIGVsZW1lbnQgKG1ldGFkYXRhIHJlYWR5KS5cbiAqIEBwYXJhbSB7c3RyaW5nfSB1cmxcbiAqIEByZXR1cm5zIHtQcm9taXNlPEhUTUxWaWRlb0VsZW1lbnQ+fVxuICovXG5mdW5jdGlvbiBsb2FkVmlkZW8odXJsKSB7XG4gIHJldHVybiBjYWNoZWQodXJsLCAoKSA9PiBuZXcgUHJvbWlzZSgocmVzb2x2ZSwgcmVqZWN0KSA9PiB7XG4gICAgY29uc3QgdiA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ3ZpZGVvJyk7XG4gICAgdi5wcmVsb2FkID0gJ2F1dG8nO1xuICAgIHYub25sb2FkZWRtZXRhZGF0YSA9ICgpID0+IHJlc29sdmUodik7XG4gICAgdi5vbmVycm9yID0gKCkgPT4gcmVqZWN0KG5ldyBFcnJvcihgVmlkZW8gZmFpbGVkOiAke3VybH1gKSk7XG4gICAgdi5zcmMgPSB1cmw7XG4gIH0pKTtcbn1cblxuZXhwb3J0IHsgbG9hZFZpZGVvIH07XG4iLCAiLyoqXG4gKiBAZmlsZSBBdWRpbyBsb2FkZXIuXG4gKi9cblxuaW1wb3J0IHsgY2FjaGVkIH0gZnJvbSAnLi4vY2FjaGUuanMnO1xuXG4vKipcbiAqIEBkZXNjcmlwdGlvbiBMb2FkIGFuIGF1ZGlvIGVsZW1lbnQgKGNhbnBsYXl0aHJvdWdoKS5cbiAqIEBwYXJhbSB7c3RyaW5nfSB1cmxcbiAqIEByZXR1cm5zIHtQcm9taXNlPEhUTUxBdWRpb0VsZW1lbnQ+fVxuICovXG5mdW5jdGlvbiBsb2FkQXVkaW8odXJsKSB7XG4gIHJldHVybiBjYWNoZWQodXJsLCAoKSA9PiBuZXcgUHJvbWlzZSgocmVzb2x2ZSwgcmVqZWN0KSA9PiB7XG4gICAgY29uc3QgYSA9IG5ldyBBdWRpbygpO1xuICAgIGEucHJlbG9hZCA9ICdhdXRvJztcbiAgICBhLm9uY2FucGxheXRocm91Z2ggPSAoKSA9PiByZXNvbHZlKGEpO1xuICAgIGEub25lcnJvciA9ICgpID0+IHJlamVjdChuZXcgRXJyb3IoYEF1ZGlvIGZhaWxlZDogJHt1cmx9YCkpO1xuICAgIGEuc3JjID0gdXJsO1xuICB9KSk7XG59XG5cbmV4cG9ydCB7IGxvYWRBdWRpbyB9O1xuIiwgIi8qKlxuICogQGZpbGUgTG9hZGVyIGRpc3BhdGNoZXIuXG4gKi9cblxuaW1wb3J0IHsgZXh0LCBBTElBU0VTIH0gZnJvbSAnLi9leHQuanMnO1xuaW1wb3J0IHsgbG9hZENTUyB9IGZyb20gJy4vbG9hZGVycy9jc3MuanMnO1xuaW1wb3J0IHsgbG9hZEpTIH0gZnJvbSAnLi9sb2FkZXJzL2pzLmpzJztcbmltcG9ydCB7IGxvYWRJbWcgfSBmcm9tICcuL2xvYWRlcnMvaW1nLmpzJztcbmltcG9ydCB7IGxvYWRGb250IH0gZnJvbSAnLi9sb2FkZXJzL2ZvbnQuanMnO1xuaW1wb3J0IHsgbG9hZEpTT04gfSBmcm9tICcuL2xvYWRlcnMvanNvbi5qcyc7XG5pbXBvcnQgeyBsb2FkSFRNTCB9IGZyb20gJy4vbG9hZGVycy9odG1sLmpzJztcbmltcG9ydCB7IGxvYWRWaWRlbyB9IGZyb20gJy4vbG9hZGVycy92aWRlby5qcyc7XG5pbXBvcnQgeyBsb2FkQXVkaW8gfSBmcm9tICcuL2xvYWRlcnMvYXVkaW8uanMnO1xuXG4vKipcbiAqIEB0eXBlZGVmIHsodXJsOiBzdHJpbmcsIG9wdHM/OiAqKSA9PiBQcm9taXNlPCo+fSBMb2FkZXJGblxuICovXG5cbi8qKlxuICogQGRlc2NyaXB0aW9uIExvYWRlciBtYXAga2V5ZWQgYnkgY2Fub25pY2FsIHR5cGUuXG4gKiBAdHlwZSB7T2JqZWN0PHN0cmluZywgTG9hZGVyRm4+fVxuICovXG5jb25zdCBMT0FERVJTID0ge1xuICBjc3M6IGxvYWRDU1MsXG4gIGpzOiBsb2FkSlMsXG4gIGltZzogbG9hZEltZyxcbiAgZm9udDogbG9hZEZvbnQsXG4gIGpzb246IGxvYWRKU09OLFxuICBodG1sOiBsb2FkSFRNTCxcbiAgdmlkZW86IGxvYWRWaWRlbyxcbiAgYXVkaW86IGxvYWRBdWRpbyxcbn07XG5cbi8qKlxuICogQGRlc2NyaXB0aW9uIERpc3BhdGNoIHRvIHRoZSBjb3JyZWN0IGxvYWRlci5cbiAqIEBwYXJhbSB7c3RyaW5nfSB0eXBlT3JVcmxcbiAqIEBwYXJhbSB7c3RyaW5nfSBbbWF5YmVVcmxdXG4gKiBAcGFyYW0geyp9IFtvcHRzXVxuICogQHJldHVybnMge1Byb21pc2U8Kj59XG4gKi9cbmZ1bmN0aW9uIGRpc3BhdGNoKHR5cGVPclVybCwgbWF5YmVVcmwsIG9wdHMpIHtcbiAgbGV0IHR5cGUsIHVybDtcbiAgaWYgKG1heWJlVXJsID09PSB1bmRlZmluZWQpIHtcbiAgICB1cmwgPSB0eXBlT3JVcmw7XG4gICAgdHlwZSA9IGV4dCh1cmwpO1xuICB9IGVsc2Uge1xuICAgIHR5cGUgPSB0eXBlT3JVcmw7XG4gICAgdXJsID0gbWF5YmVVcmw7XG4gIH1cblxuICBjb25zdCBrZXkgPSBBTElBU0VTW3R5cGVdIHx8IHR5cGU7XG4gIGNvbnN0IGZuID0gTE9BREVSU1trZXldO1xuXG4gIGlmICh0eXBlb2YgZm4gIT09ICdmdW5jdGlvbicpIHtcbiAgICByZXR1cm4gUHJvbWlzZS5yZWplY3QobmV3IEVycm9yKGBVbnN1cHBvcnRlZCBhc3NldDogJHt0eXBlfSAoJHt1cmx9KWApKTtcbiAgfVxuICByZXR1cm4gZm4odXJsLCBvcHRzKTtcbn1cblxuZXhwb3J0IHsgZGlzcGF0Y2ggfTtcbiIsICIvKipcbiAqIEBmaWxlIFBhcmFsbGVsIGJhdGNoIGxvYWRlci5cbiAqL1xuXG5pbXBvcnQgeyBkaXNwYXRjaCB9IGZyb20gJy4uL2Rpc3BhdGNoLmpzJztcblxuLyoqXG4gKiBAdHlwZWRlZiB7T2JqZWN0fSBMb2FkSXRlbVxuICogQHByb3BlcnR5IHtzdHJpbmd9IHR5cGVcbiAqIEBwcm9wZXJ0eSB7c3RyaW5nfSB1cmxcbiAqIEBwcm9wZXJ0eSB7Kn0gW29wdHNdXG4gKi9cblxuLyoqXG4gKiBAdHlwZWRlZiB7KGRvbmU6IG51bWJlciwgdG90YWw6IG51bWJlciwgaXRlbTogc3RyaW5nfExvYWRJdGVtKSA9PiB2b2lkfSBQcm9ncmVzc0ZuXG4gKi9cblxuLyoqXG4gKiBAZGVzY3JpcHRpb24gTG9hZCBpdGVtcyBpbiBwYXJhbGxlbC5cbiAqIEBwYXJhbSB7QXJyYXk8c3RyaW5nfExvYWRJdGVtPn0gaXRlbXNcbiAqIEBwYXJhbSB7UHJvZ3Jlc3NGbn0gW29uUHJvZ3Jlc3NdXG4gKiBAcmV0dXJucyB7UHJvbWlzZTxBcnJheTwqPj59XG4gKi9cbmZ1bmN0aW9uIHBhcmFsbGVsKGl0ZW1zLCBvblByb2dyZXNzKSB7XG4gIGxldCBkb25lID0gMDtcbiAgY29uc3QgdG90YWwgPSBpdGVtcy5sZW5ndGg7XG4gIHJldHVybiBQcm9taXNlLmFsbChcbiAgICBpdGVtcy5tYXAoKGl0ZW0pID0+IHtcbiAgICAgIGNvbnN0IHAgPSB0eXBlb2YgaXRlbSA9PT0gJ3N0cmluZydcbiAgICAgICAgPyBkaXNwYXRjaChpdGVtKVxuICAgICAgICA6IGRpc3BhdGNoKGl0ZW0udHlwZSwgaXRlbS51cmwsIGl0ZW0ub3B0cyk7XG4gICAgICByZXR1cm4gcC50aGVuKChyZXMpID0+IHtcbiAgICAgICAgZG9uZSsrO1xuICAgICAgICBvblByb2dyZXNzPy4oZG9uZSwgdG90YWwsIGl0ZW0pO1xuICAgICAgICByZXR1cm4gcmVzO1xuICAgICAgfSk7XG4gICAgfSlcbiAgKTtcbn1cblxuZXhwb3J0IHsgcGFyYWxsZWwgfTtcbiIsICIvKipcbiAqIEBmaWxlIFNlcXVlbnRpYWwgYmF0Y2ggbG9hZGVyLlxuICovXG5cbmltcG9ydCB7IGRpc3BhdGNoIH0gZnJvbSAnLi4vZGlzcGF0Y2guanMnO1xuXG4vKipcbiAqIEB0eXBlZGVmIHtPYmplY3R9IFNlcXVlbmNlSXRlbVxuICogQHByb3BlcnR5IHtzdHJpbmd9IHR5cGVcbiAqIEBwcm9wZXJ0eSB7c3RyaW5nfSB1cmxcbiAqIEBwcm9wZXJ0eSB7Kn0gW29wdHNdXG4gKi9cblxuLyoqXG4gKiBAZGVzY3JpcHRpb24gTG9hZCBpdGVtcyBvbmUgYWZ0ZXIgYW5vdGhlci5cbiAqIEBwYXJhbSB7QXJyYXk8c3RyaW5nfFNlcXVlbmNlSXRlbT59IGl0ZW1zXG4gKiBAcGFyYW0geyhkb25lOiBudW1iZXIsIHRvdGFsOiBudW1iZXIsIGl0ZW06ICopID0+IHZvaWR9IFtvblByb2dyZXNzXVxuICogQHJldHVybnMge1Byb21pc2U8QXJyYXk8Kj4+fVxuICovXG5mdW5jdGlvbiBzZXF1ZW5jZShpdGVtcywgb25Qcm9ncmVzcykge1xuICBsZXQgZG9uZSA9IDA7XG4gIGNvbnN0IHRvdGFsID0gaXRlbXMubGVuZ3RoO1xuICBsZXQgY2hhaW4gPSBQcm9taXNlLnJlc29sdmUoW10pO1xuXG4gIGl0ZW1zLmZvckVhY2goKGl0ZW0pID0+IHtcbiAgICBjaGFpbiA9IGNoYWluLnRoZW4oKHJlc3VsdHMpID0+IHtcbiAgICAgIGNvbnN0IHAgPSB0eXBlb2YgaXRlbSA9PT0gJ3N0cmluZydcbiAgICAgICAgPyBkaXNwYXRjaChpdGVtKVxuICAgICAgICA6IGRpc3BhdGNoKGl0ZW0udHlwZSwgaXRlbS51cmwsIGl0ZW0ub3B0cyk7XG4gICAgICByZXR1cm4gcC50aGVuKChyZXMpID0+IHtcbiAgICAgICAgZG9uZSsrO1xuICAgICAgICBvblByb2dyZXNzPy4oZG9uZSwgdG90YWwsIGl0ZW0pO1xuICAgICAgICByZXN1bHRzLnB1c2gocmVzKTtcbiAgICAgICAgcmV0dXJuIHJlc3VsdHM7XG4gICAgICB9KTtcbiAgICB9KTtcbiAgfSk7XG5cbiAgcmV0dXJuIGNoYWluO1xufVxuXG5leHBvcnQgeyBzZXF1ZW5jZSB9O1xuIiwgIi8qKlxuICogQGZpbGUgS2V5ZWQgYmF0Y2ggbG9hZGVyLlxuICovXG5cbmltcG9ydCB7IHBhcmFsbGVsIH0gZnJvbSAnLi9wYXJhbGxlbC5qcyc7XG5cbi8qKlxuICogQGRlc2NyaXB0aW9uIExvYWQgYWxsIGVudHJpZXMgb2YgYSBtYXAgaW4gcGFyYWxsZWwuXG4gKiBAcGFyYW0ge09iamVjdDxzdHJpbmcsIHN0cmluZz59IG1hcFxuICogQHBhcmFtIHsoZG9uZTogbnVtYmVyLCB0b3RhbDogbnVtYmVyLCBpdGVtOiAqKSA9PiB2b2lkfSBbb25Qcm9ncmVzc11cbiAqIEByZXR1cm5zIHtQcm9taXNlPE9iamVjdDxzdHJpbmcsICo+Pn1cbiAqL1xuZnVuY3Rpb24gYWxsKG1hcCwgb25Qcm9ncmVzcykge1xuICBjb25zdCBrZXlzID0gT2JqZWN0LmtleXMobWFwKTtcbiAgcmV0dXJuIHBhcmFsbGVsKGtleXMubWFwKChrKSA9PiBtYXBba10pLCBvblByb2dyZXNzKVxuICAgIC50aGVuKChyZXN1bHRzKSA9PiB7XG4gICAgICBjb25zdCBvdXQgPSB7fTtcbiAgICAgIGtleXMuZm9yRWFjaCgoaywgaSkgPT4geyBvdXRba10gPSByZXN1bHRzW2ldOyB9KTtcbiAgICAgIHJldHVybiBvdXQ7XG4gICAgfSk7XG59XG5cbmV4cG9ydCB7IGFsbCB9O1xuIiwgIi8qKlxuICogQGZpbGUgUHJlbG9hZCBoaW50IGhlbHBlci5cbiAqL1xuXG5pbXBvcnQgeyBleHQgfSBmcm9tICcuLi9leHQuanMnO1xuXG4vKipcbiAqIEBkZXNjcmlwdGlvbiBFeHRlbnNpb24tdG8tYGFzYCBhdHRyaWJ1dGUgbWFwLlxuICogQHR5cGUge09iamVjdDxzdHJpbmcsIHN0cmluZz59XG4gKi9cbmNvbnN0IEFTX01BUCA9IHtcbiAgY3NzOiAnc3R5bGUnLCBqczogJ3NjcmlwdCcsIG1qczogJ3NjcmlwdCcsXG4gIHBuZzogJ2ltYWdlJywganBnOiAnaW1hZ2UnLCBqcGVnOiAnaW1hZ2UnLCBnaWY6ICdpbWFnZScsXG4gIHdlYnA6ICdpbWFnZScsIHN2ZzogJ2ltYWdlJywgYXZpZjogJ2ltYWdlJyxcbiAgd29mZjogJ2ZvbnQnLCB3b2ZmMjogJ2ZvbnQnLCB0dGY6ICdmb250Jywgb3RmOiAnZm9udCcsXG4gIGpzb246ICdmZXRjaCcsIG1wNDogJ3ZpZGVvJywgd2VibTogJ3ZpZGVvJyxcbiAgbXAzOiAnYXVkaW8nLCBvZ2c6ICdhdWRpbycsIHdhdjogJ2F1ZGlvJyxcbn07XG5cbi8qKlxuICogQGRlc2NyaXB0aW9uIEFkZCA8bGluayByZWw9XCJwcmVsb2FkXCI+IGhpbnRzIGZvciBVUkxzLlxuICogQHBhcmFtIHtzdHJpbmdbXX0gdXJsc1xuICogQHJldHVybnMge3ZvaWR9XG4gKi9cbmZ1bmN0aW9uIHByZWxvYWQodXJscykge1xuICB1cmxzLmZvckVhY2goKHVybCkgPT4ge1xuICAgIGNvbnN0IHR5cGUgPSBleHQodXJsKTtcbiAgICBjb25zdCBhcyA9IEFTX01BUFt0eXBlXTtcbiAgICBpZiAoIWFzKSByZXR1cm47XG5cbiAgICBjb25zdCBsaW5rID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnbGluaycpO1xuICAgIGxpbmsucmVsID0gJ3ByZWxvYWQnO1xuICAgIGxpbmsuaHJlZiA9IHVybDtcbiAgICBsaW5rLmFzID0gYXM7XG4gICAgaWYgKGFzID09PSAnZm9udCcgfHwgYXMgPT09ICdmZXRjaCcpIGxpbmsuY3Jvc3NPcmlnaW4gPSAnYW5vbnltb3VzJztcbiAgICBkb2N1bWVudC5oZWFkLmFwcGVuZENoaWxkKGxpbmspO1xuICB9KTtcbn1cblxuZXhwb3J0IHsgcHJlbG9hZCB9O1xuIiwgIi8qKlxuICogQGZpbGUgQXR0YWNoIGxvYWRlciBBUEkgb250byBhIERFU1NFUlQgaW5zdGFuY2UuXG4gKi9cblxuLyoqXG4gKiBAdHlwZWRlZiB7T2JqZWN0fSBMb2FkZXJBUElcbiAqIEBwcm9wZXJ0eSB7RnVuY3Rpb259IGRpc3BhdGNoXG4gKiBAcHJvcGVydHkge0Z1bmN0aW9ufSBsb2FkQ1NTXG4gKiBAcHJvcGVydHkge0Z1bmN0aW9ufSBsb2FkSlNcbiAqIEBwcm9wZXJ0eSB7RnVuY3Rpb259IGxvYWRJbWdcbiAqIEBwcm9wZXJ0eSB7RnVuY3Rpb259IGxvYWRGb250XG4gKiBAcHJvcGVydHkge0Z1bmN0aW9ufSBsb2FkSlNPTlxuICogQHByb3BlcnR5IHtGdW5jdGlvbn0gbG9hZEhUTUxcbiAqIEBwcm9wZXJ0eSB7RnVuY3Rpb259IGxvYWRWaWRlb1xuICogQHByb3BlcnR5IHtGdW5jdGlvbn0gbG9hZEF1ZGlvXG4gKiBAcHJvcGVydHkge0Z1bmN0aW9ufSBwYXJhbGxlbFxuICogQHByb3BlcnR5IHtGdW5jdGlvbn0gc2VxdWVuY2VcbiAqIEBwcm9wZXJ0eSB7RnVuY3Rpb259IGFsbFxuICogQHByb3BlcnR5IHtGdW5jdGlvbn0gcHJlbG9hZFxuICogQHByb3BlcnR5IHtNYXA8c3RyaW5nLCBQcm9taXNlPCo+Pn0gY2FjaGVcbiAqIEBwcm9wZXJ0eSB7RnVuY3Rpb259IGNsZWFyQ2FjaGVcbiAqIEBwcm9wZXJ0eSB7c3RyaW5nfSB2ZXJzaW9uXG4gKi9cblxuLyoqXG4gKiBAZGVzY3JpcHRpb24gQXR0YWNoIGxvYWRlciBtZXRob2RzIG9udG8gY29yZS5sb2FkLlxuICogQHBhcmFtIHsqfSBjb3JlIC0gREVTU0VSVCBpbnN0YW5jZS5cbiAqIEBwYXJhbSB7eyBsb2c/OiAoLi4uYXJnczogKikgPT4gdm9pZCB9fSBwcml2IC0gUHJpdmF0ZSBoZWxwZXJzLlxuICogQHBhcmFtIHtMb2FkZXJBUEl9IGFwaVxuICogQHJldHVybnMge3ZvaWR9XG4gKi9cbmZ1bmN0aW9uIGluc3RhbGwoY29yZSwgcHJpdiwgYXBpKSB7XG4gIGNvbnN0IGxvYWQgPSBhcGkuZGlzcGF0Y2g7XG4gIGxvYWQuY3NzICAgICAgICA9IGFwaS5sb2FkQ1NTO1xuICBsb2FkLmpzICAgICAgICAgPSBhcGkubG9hZEpTO1xuICBsb2FkLmltZyAgICAgICAgPSBhcGkubG9hZEltZztcbiAgbG9hZC5mb250ICAgICAgID0gYXBpLmxvYWRGb250O1xuICBsb2FkLmpzb24gICAgICAgPSBhcGkubG9hZEpTT047XG4gIGxvYWQuaHRtbCAgICAgICA9IGFwaS5sb2FkSFRNTDtcbiAgbG9hZC52aWRlbyAgICAgID0gYXBpLmxvYWRWaWRlbztcbiAgbG9hZC5hdWRpbyAgICAgID0gYXBpLmxvYWRBdWRpbztcbiAgbG9hZC5wYXJhbGxlbCAgID0gYXBpLnBhcmFsbGVsO1xuICBsb2FkLnNlcXVlbmNlICAgPSBhcGkuc2VxdWVuY2U7XG4gIGxvYWQuYWxsICAgICAgICA9IGFwaS5hbGw7XG4gIGxvYWQucHJlbG9hZCAgICA9IGFwaS5wcmVsb2FkO1xuICBsb2FkLmNsZWFyQ2FjaGUgPSBhcGkuY2xlYXJDYWNoZTtcbiAgbG9hZC5jYWNoZSAgICAgID0gYXBpLmNhY2hlO1xuICBsb2FkLnZlcnNpb24gICAgPSBhcGkudmVyc2lvbjtcblxuICBjb3JlLmxvYWQgPSBsb2FkO1xuICBwcml2LmxvZz8uKCdsb2FkZXIgaW5zdGFsbGVkJyk7XG59XG5cbmV4cG9y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

  return typeof DESSERTLoader !== 'undefined' ? DESSERTLoader : (typeof exports !== 'undefined' ? exports : {});
}));