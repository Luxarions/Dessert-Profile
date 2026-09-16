(function (root, factory) {
  if (typeof define === 'function' && define.amd) {
    define([], factory);
  } else if (typeof module === 'object' && module.exports) {
    module.exports = factory();
  } else {
    root.DESSERT = factory();
  }
}(typeof self !== 'undefined' ? self : this, function () {
/*! DESSERT v2.0.0 | MIT License */
var DESSERT = (() => {
  var __defProp = Object.defineProperty;
  var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
  var __getOwnPropNames = Object.getOwnPropertyNames;
  var __hasOwnProp = Object.prototype.hasOwnProperty;
  var __export = (target, all) => {
    for (var name in all)
      __defProp(target, name, { get: all[name], enumerable: true });
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

  // src/index.js
  var index_exports = {};
  __export(index_exports, {
    DESSERT: () => DESSERT,
    DESSERT_INSTANCE: () => DESSERT_INSTANCE,
    default: () => DESSERT_INSTANCE
  });

  // src/core/constants.js
  var VERSION = "2.0.0";
  var PREFIX = "dessert";
  var DATA_ATTR = "data-dessert";
  var DEFAULT_OPTIONS = Object.freeze({
    autoInit: true,
    debug: false,
    closeOnEscape: true
  });

  // src/core/state.js
  var state = {
    escBound: false,
    lastFocused: null
  };
  var options = {};

  // src/core/registry.js
  var registry = {
    plugins: /* @__PURE__ */ new Map(),
    instances: /* @__PURE__ */ new WeakMap()
  };

  // src/utils/bridge.js
  var _ctx = null;
  var helpers = {
    /**
     * @description Bind private context once from the DESSERT constructor.
     * @param {HelperContext} ctx
     * @returns {void}
     */
    bind(ctx) {
      _ctx = ctx;
    },
    /**
     * @description Retrieve the current helper context.
     * @returns {HelperContext}
     */
    get ctx() {
      if (!_ctx) throw new Error("[DESSERT] helpers not bound yet");
      return _ctx;
    },
    /** @returns {*} */
    get core() {
      return helpers.ctx.core;
    },
    /** @returns {Object<string, *>} */
    get options() {
      return helpers.ctx.options;
    },
    /** @returns {*} */
    get state() {
      return helpers.ctx.state;
    },
    /** @returns {*} */
    get registry() {
      return helpers.ctx.registry;
    }
  };

  // src/utils/logger.js
  function log(...args) {
    if (helpers.options?.debug) console.log("[DESSERT]", ...args);
  }

  // src/core/DESSERT.js
  var DESSERT = class _DESSERT {
    /**
     * @private
     * @type {DESSERT|null}
     */
    static #instance = null;
    /**
     * @description Library version.
     * @returns {string}
     */
    static get version() {
      return VERSION;
    }
    /**
     * @description Create a fresh instance bypassing singleton.
     * @param {DessertConfig} [cfg={}]
     * @returns {DESSERT}
     */
    static create(cfg = {}) {
      return new _DESSERT({ ...cfg, force: true });
    }
    /**
     * @param {DessertConfig} [cfg={}]
     */
    constructor(cfg = {}) {
      if (_DESSERT.#instance && !cfg.force) return _DESSERT.#instance;
      Object.assign(options, DEFAULT_OPTIONS, cfg);
      this.version = VERSION;
      this.prefix = PREFIX;
      helpers.bind({ core: this, options, state, registry });
      _DESSERT.#instance = this;
    }
    /**
     * @description Initialize the library.
     * @param {DessertConfig} [extra={}]
     * @returns {DESSERT}
     */
    init(extra = {}) {
      Object.assign(options, extra);
      if (options.autoInit) this.autoInit();
      registry.plugins.forEach((plugin) => plugin.init?.(this));
      log(`DESSERT v${VERSION} initialized`);
      return this;
    }
    /**
     * @description Register a plugin.
     * @param {string} name
     * @param {*} plugin
     * @returns {DESSERT}
     */
    register(name, plugin) {
      if (registry.plugins.has(name)) return this;
      registry.plugins.set(name, plugin);
      plugin.install?.(this, helpers);
      log("plugin registered:", name);
      return this;
    }
    /**
     * @description Register and init a plugin.
     * @param {*} plugin
     * @returns {DESSERT}
     */
    use(plugin) {
      if (!plugin?.name) return this;
      this.register(plugin.name, plugin);
      plugin.init?.(this);
      return this;
    }
  };

  // src/utils/escape.js
  function esc(s) {
    return globalThis.CSS?.escape ? CSS.escape(s) : String(s).replace(/"/g, '\\"');
  }

  // src/components/modal.js
  function modalComponent(el) {
    const core = this;
    const openBtns = document.querySelectorAll(
      `[data-dessert-open="${esc(el.id)}"]`
    );
    const closeBtns = el.querySelectorAll("[data-dessert-close]");
    const handlers = [];
    openBtns.forEach((btn) => {
      const h = () => core.modal.open(el);
      btn.addEventListener("click", h);
      handlers.push([btn, "click", h]);
    });
    closeBtns.forEach((btn) => {
      const h = () => core.modal.close(el);
      btn.addEventListener("click", h);
      handlers.push([btn, "click", h]);
    });
    const overlayH = (e) => {
      if (e.target === el) core.modal.close(el);
    };
    el.addEventListener("click", overlayH);
    handlers.push([el, "click", overlayH]);
    registry.instances.set(el, { type: "modal", handlers });
    log("modal init:", el.id);
  }

  // src/utils/classNames.js
  function addClass(el, name) {
    el.classList.add(`${PREFIX}-${name}`);
    return el;
  }
  function removeClass(el, name) {
    el.classList.remove(`${PREFIX}-${name}`);
    return el;
  }
  function toggleClass(el, name, force) {
    const cls = `${PREFIX}-${name}`;
    typeof force === "boolean" ? el.classList.toggle(cls, force) : el.classList.toggle(cls);
    return el;
  }

  // src/components/dropdown.js
  function dropdownComponent(el) {
    const trigger = el.querySelector("[data-dessert-trigger]");
    const menu = el.querySelector("[data-dessert-menu]");
    if (!trigger || !menu) return;
    const handlers = [];
    const onTrigger = (e) => {
      e.stopPropagation();
      toggleClass(el, "open");
      toggleClass(menu, "show");
    };
    trigger.addEventListener("click", onTrigger);
    handlers.push([trigger, "click", onTrigger]);
    const onOutside = (e) => {
      if (!el.contains(
        /** @type {Node} */
        e.target
      )) {
        removeClass(el, "open");
        removeClass(menu, "show");
      }
    };
    document.addEventListener("click", onOutside);
    handlers.push([document, "click", onOutside]);
    registry.instances.set(el, { type: "dropdown", handlers });
    log("dropdown init");
  }

  // src/components/tabs.js
  function tabsComponent(el) {
    const buttons = el.querySelectorAll("[data-dessert-tab]");
    const panels = el.querySelectorAll("[data-dessert-panel]");
    if (!buttons.length) return;
    const handlers = [];
    const activate = (target) => {
      buttons.forEach((b) => removeClass(b, "active"));
      panels.forEach((p) => removeClass(p, "active"));
      const btn = el.querySelector(`[data-dessert-tab="${esc(target)}"]`);
      const panel = el.querySelector(`[data-dessert-panel="${esc(target)}"]`);
      if (btn) addClass(btn, "active");
      if (panel) addClass(panel, "active");
    };
    buttons.forEach((btn) => {
      const h = () => activate(btn.getAttribute("data-dessert-tab"));
      btn.addEventListener("click", h);
      handlers.push([btn, "click", h]);
    });
    const initial = el.querySelector(".dessert-tab.dessert-active");
    if (initial) activate(initial.getAttribute("data-dessert-tab"));
    registry.instances.set(el, { type: "tabs", handlers });
    log("tabs init");
  }

  // src/components/accordion.js
  function accordionComponent(el) {
    const items = el.querySelectorAll(".dessert-accordion-item");
    const handlers = [];
    items.forEach((item) => {
      const header = item.querySelector(".dessert-accordion-header");
      const body = item.querySelector(".dessert-accordion-body");
      if (!header) return;
      const h = () => {
        const isOpen = item.classList.contains("dessert-open");
        items.forEach((i) => {
          removeClass(i, "open");
          const b = i.querySelector(".dessert-accordion-body");
          if (b) b.style.maxHeight = "";
        });
        if (!isOpen) {
          addClass(item, "open");
          if (body) body.style.maxHeight = `${body.scrollHeight}px`;
        }
      };
      header.addEventListener("click", h);
      handlers.push([header, "click", h]);
    });
    registry.instances.set(el, { type: "accordion", handlers });
    log("accordion init");
  }

  // src/components/components.js
  var components = {
    modal: modalComponent,
    dropdown: dropdownComponent,
    tabs: tabsComponent,
    accordion: accordionComponent
  };

  // src/autoinit/autoInit.js
  function autoInit(root = document) {
    root.querySelectorAll(`[${DATA_ATTR}]`).forEach((node) => {
      if (node._dessertInitialized) return;
      const type = node.getAttribute(DATA_ATTR);
      const fn = this.components[type];
      if (typeof fn === "function") {
        fn.call(this, node);
        node._dessertInitialized = true;
      }
    });
  }

  // src/autoinit/escapeKey.js
  function bindEscapeKey(core) {
    if (state.escBound) return;
    document.addEventListener("keydown", (e) => {
      if (e.key !== "Escape") return;
      document.querySelectorAll(`.${core.prefix}-modal.${core.prefix}-show`).forEach((m) => core.modal.close(m));
    });
    state.escBound = true;
  }

  // src/utils/url.js
  function getScriptBase(scriptEl) {
    if (!scriptEl?.src) return null;
    const m = scriptEl.src.match(/^(.*?)\/src\/[^/]+$/);
    return m ? m[1] : scriptEl.src.replace(/\/[^/]+$/, "");
  }
  function currentScript() {
    return document.currentScript || (() => {
      const s = document.getElementsByTagName("script");
      return s[s.length - 1];
    })();
  }

  // src/inject/injectCSS.js
  function injectCSS() {
    if (document.querySelector("link[data-dessert-css]")) return;
    const base = getScriptBase(currentScript());
    const href = base ? `${base}/src/styles/dessert.css` : "dist/dessert.css";
    const link = document.createElement("link");
    link.rel = "stylesheet";
    link.href = href;
    link.setAttribute("data-dessert-css", "");
    link.onerror = () => log("CSS load failed:", href);
    document.head.appendChild(link);
  }

  // src/inject/injectLoader.js
  function injectLoader() {
    if (registry.plugins.has("loader")) return;
    if (document.querySelector("script[data-dessert-loader]")) return;
    const base = getScriptBase(currentScript());
    const src = base ? `${base}/src/plugins/loader/LoaderPlugin.js` : "loader.umd.js";
    const s = document.createElement("script");
    s.type = base ? "module" : "text/javascript";
    s.src = src;
    s.async = false;
    s.setAttribute("data-dessert-loader", "");
    s.onerror = () => log("loader inject failed:", src);
    document.head.appendChild(s);
  }

  // src/api/modalAPI.js
  var modalAPI = {
    /**
     * @description Open a modal element.
     * @param {HTMLElement} el
     * @returns {void}
     */
    open(el) {
      state.lastFocused = document.activeElement;
      el.style.display = "flex";
      document.body.style.overflow = "hidden";
      requestAnimationFrame(() => addClass(el, "show"));
      setTimeout(() => {
        const f = el.querySelector(
          'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
        );
        f?.focus();
      }, 100);
      log("modal open:", el.id);
    },
    /**
     * @description Close a modal element.
     * @param {HTMLElement} el
     * @returns {void}
     */
    close(el) {
      removeClass(el, "show");
      setTimeout(() => {
        el.style.display = "none";
        document.body.style.overflow = "";
        state.lastFocused?.focus();
      }, 300);
      log("modal close:", el.id);
    }
  };

  // src/api/alertAPI.js
  function alertAPI(msg, type = "info", duration = 3e3) {
    let container = document.querySelector(".dessert-alert-container");
    if (!container) {
      container = document.createElement("div");
      container.className = "dessert-alert-container";
      document.body.appendChild(container);
    }
    const box = document.createElement("div");
    box.className = `dessert-alert dessert-alert-${type}`;
    box.textContent = msg;
    container.appendChild(box);
    requestAnimationFrame(() => addClass(box, "show"));
    setTimeout(() => {
      removeClass(box, "show");
      setTimeout(() => {
        box.remove();
        if (!container.children.length) container.remove();
      }, 300);
    }, duration);
  }

  // src/api/destroyAPI.js
  function destroyAPI(el) {
    const inst = registry.instances.get(el);
    if (!inst) return;
    inst.handlers.forEach(([target, type, handler]) => {
      target.removeEventListener(type, handler);
    });
    el._dessertInitialized = false;
    registry.instances.delete(el);
    log("destroyed:", inst.type);
  }

  // src/utils/attributes.js
  function setData(el, key, value) {
    el.setAttribute(`data-${PREFIX}-${key}`, value);
    return el;
  }
  function getData(el, key) {
    return el.getAttribute(`data-${PREFIX}-${key}`);
  }

  // src/index.js
  DESSERT.prototype.components = components;
  DESSERT.prototype.modal = modalAPI;
  DESSERT.prototype.alert = alertAPI;
  DESSERT.prototype.destroy = destroyAPI;
  DESSERT.prototype.autoInit = autoInit;
  DESSERT.prototype.addClass = addClass;
  DESSERT.prototype.removeClass = removeClass;
  DESSERT.prototype.toggleClass = toggleClass;
  DESSERT.prototype.setData = setData;
  DESSERT.prototype.getData = getData;
  var DESSERT_INSTANCE = new DESSERT();
  if (typeof document !== "undefined") {
    injectCSS();
    injectLoader();
    const boot = () => {
      DESSERT_INSTANCE.init();
      bindEscapeKey(DESSERT_INSTANCE);
    };
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", boot);
    } else {
      boot();
    }
  }
  return __toCommonJS(index_exports);
})();
//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAic291cmNlcyI6IFsic3JjL2luZGV4LmpzIiwgInNyYy9jb3JlL2NvbnN0YW50cy5qcyIsICJzcmMvY29yZS9zdGF0ZS5qcyIsICJzcmMvY29yZS9yZWdpc3RyeS5qcyIsICJzcmMvdXRpbHMvYnJpZGdlLmpzIiwgInNyYy91dGlscy9sb2dnZXIuanMiLCAic3JjL2NvcmUvREVTU0VSVC5qcyIsICJzcmMvdXRpbHMvZXNjYXBlLmpzIiwgInNyYy9jb21wb25lbnRzL21vZGFsLmpzIiwgInNyYy91dGlscy9jbGFzc05hbWVzLmpzIiwgInNyYy9jb21wb25lbnRzL2Ryb3Bkb3duLmpzIiwgInNyYy9jb21wb25lbnRzL3RhYnMuanMiLCAic3JjL2NvbXBvbmVudHMvYWNjb3JkaW9uLmpzIiwgInNyYy9jb21wb25lbnRzL2NvbXBvbmVudHMuanMiLCAic3JjL2F1dG9pbml0L2F1dG9Jbml0LmpzIiwgInNyYy9hdXRvaW5pdC9lc2NhcGVLZXkuanMiLCAic3JjL3V0aWxzL3VybC5qcyIsICJzcmMvaW5qZWN0L2luamVjdENTUy5qcyIsICJzcmMvaW5qZWN0L2luamVjdExvYWRlci5qcyIsICJzcmMvYXBpL21vZGFsQVBJLmpzIiwgInNyYy9hcGkvYWxlcnRBUEkuanMiLCAic3JjL2FwaS9kZXN0cm95QVBJLmpzIiwgInNyYy91dGlscy9hdHRyaWJ1dGVzLmpzIl0sCiAgInNvdXJjZXNDb250ZW50IjogWyIvKipcbiAqIEBmaWxlIERFU1NFUlQgbWFpbiBlbnRyeSBcdTIwMTQgdGhlIG9ubHkgaW5kZXguanMgaW4gdGhlIHByb2plY3QuXG4gKi9cblxuaW1wb3J0IHsgREVTU0VSVCB9IGZyb20gJy4vY29yZS9ERVNTRVJULmpzJztcbmltcG9ydCB7IGNvbXBvbmVudHMgfSBmcm9tICcuL2NvbXBvbmVudHMvY29tcG9uZW50cy5qcyc7XG5pbXBvcnQgeyBhdXRvSW5pdCB9IGZyb20gJy4vYXV0b2luaXQvYXV0b0luaXQuanMnO1xuaW1wb3J0IHsgYmluZEVzY2FwZUtleSB9IGZyb20gJy4vYXV0b2luaXQvZXNjYXBlS2V5LmpzJztcbmltcG9ydCB7IGluamVjdENTUyB9IGZyb20gJy4vaW5qZWN0L2luamVjdENTUy5qcyc7XG5pbXBvcnQgeyBpbmplY3RMb2FkZXIgfSBmcm9tICcuL2luamVjdC9pbmplY3RMb2FkZXIuanMnO1xuaW1wb3J0IHsgbW9kYWxBUEkgfSBmcm9tICcuL2FwaS9tb2RhbEFQSS5qcyc7XG5pbXBvcnQgeyBhbGVydEFQSSB9IGZyb20gJy4vYXBpL2FsZXJ0QVBJLmpzJztcbmltcG9ydCB7IGRlc3Ryb3lBUEkgfSBmcm9tICcuL2FwaS9kZXN0cm95QVBJLmpzJztcbmltcG9ydCB7IGFkZENsYXNzLCByZW1vdmVDbGFzcywgdG9nZ2xlQ2xhc3MgfSBmcm9tICcuL3V0aWxzL2NsYXNzTmFtZXMuanMnO1xuaW1wb3J0IHsgc2V0RGF0YSwgZ2V0RGF0YSB9IGZyb20gJy4vdXRpbHMvYXR0cmlidXRlcy5qcyc7XG5cbi8qIDEuIGF0dGFjaCBwdWJsaWMgQVBJIG9udG8gcHJvdG90eXBlICovXG5ERVNTRVJULnByb3RvdHlwZS5jb21wb25lbnRzICA9IGNvbXBvbmVudHM7XG5ERVNTRVJULnByb3RvdHlwZS5tb2RhbCAgICAgICA9IG1vZGFsQVBJO1xuREVTU0VSVC5wcm90b3R5cGUuYWxlcnQgICAgICAgPSBhbGVydEFQSTtcbkRFU1NFUlQucHJvdG90eXBlLmRlc3Ryb3kgICAgID0gZGVzdHJveUFQSTtcbkRFU1NFUlQucHJvdG90eXBlLmF1dG9Jbml0ICAgID0gYXV0b0luaXQ7XG5ERVNTRVJULnByb3RvdHlwZS5hZGRDbGFzcyAgICA9IGFkZENsYXNzO1xuREVTU0VSVC5wcm90b3R5cGUucmVtb3ZlQ2xhc3MgPSByZW1vdmVDbGFzcztcbkRFU1NFUlQucHJvdG90eXBlLnRvZ2dsZUNsYXNzID0gdG9nZ2xlQ2xhc3M7XG5ERVNTRVJULnByb3RvdHlwZS5zZXREYXRhICAgICA9IHNldERhdGE7XG5ERVNTRVJULnByb3RvdHlwZS5nZXREYXRhICAgICA9IGdldERhdGE7XG5cbi8qKlxuICogQGRlc2NyaXB0aW9uIFNpbmdsZXRvbiBERVNTRVJUIGluc3RhbmNlLlxuICogQHR5cGUge0RFU1NFUlR9XG4gKi9cbmNvbnN0IERFU1NFUlRfSU5TVEFOQ0UgPSBuZXcgREVTU0VSVCgpO1xuXG4vKiAyLiBzaWRlIGVmZmVjdHM6IGluamVjdCBhc3NldHMgJiBhdXRvLWJvb3QgKi9cbmlmICh0eXBlb2YgZG9jdW1lbnQgIT09ICd1bmRlZmluZWQnKSB7XG4gIGluamVjdENTUygpO1xuICBpbmplY3RMb2FkZXIoKTtcblxuICBjb25zdCBib290ID0gKCkgPT4ge1xuICAgIERFU1NFUlRfSU5TVEFOQ0UuaW5pdCgpO1xuICAgIGJpbmRFc2NhcGVLZXkoREVTU0VSVF9JTlNUQU5DRSk7XG4gIH07XG5cbiAgaWYgKGRvY3VtZW50LnJlYWR5U3RhdGUgPT09ICdsb2FkaW5nJykge1xuICAgIGRvY3VtZW50LmFkZEV2ZW50TGlzdGVuZXIoJ0RPTUNvbnRlbnRMb2FkZWQnLCBib290KTtcbiAgfSBlbHNlIHtcbiAgICBib290KCk7XG4gIH1cbn1cblxuZXhwb3J0IHsgREVTU0VSVCwgREVTU0VSVF9JTlNUQU5DRSB9O1xuZXhwb3J0IHsgREVTU0VSVF9JTlNUQU5DRSBhcyBkZWZhdWx0IH07XG4iLCAiLyoqXG4gKiBAZmlsZSBDb25zdGFudHMgZm9yIERFU1NFUlQgY29yZS5cbiAqL1xuXG4vKipcbiAqIEBkZXNjcmlwdGlvbiBMaWJyYXJ5IHZlcnNpb24uXG4gKiBAdHlwZSB7c3RyaW5nfVxuICogQGNvbnN0YW50XG4gKi9cbmNvbnN0IFZFUlNJT04gPSAnMi4wLjAnO1xuXG4vKipcbiAqIEBkZXNjcmlwdGlvbiBDU1MgcHJlZml4IHVzZWQgYWNyb3NzIHRoZSBsaWJyYXJ5LlxuICogQHR5cGUge3N0cmluZ31cbiAqIEBjb25zdGFudFxuICovXG5jb25zdCBQUkVGSVggPSAnZGVzc2VydCc7XG5cbi8qKlxuICogQGRlc2NyaXB0aW9uIERhdGEgYXR0cmlidXRlIHVzZWQgZm9yIGF1dG8taW5pdC5cbiAqIEB0eXBlIHtzdHJpbmd9XG4gKiBAY29uc3RhbnRcbiAqL1xuY29uc3QgREFUQV9BVFRSID0gJ2RhdGEtZGVzc2VydCc7XG5cbi8qKlxuICogQHR5cGVkZWYge09iamVjdH0gRGVzc2VydE9wdGlvbnNcbiAqIEBwcm9wZXJ0eSB7Ym9vbGVhbn0gW2F1dG9Jbml0PXRydWVdXG4gKiBAcHJvcGVydHkge2Jvb2xlYW59IFtkZWJ1Zz1mYWxzZV1cbiAqIEBwcm9wZXJ0eSB7Ym9vbGVhbn0gW2Nsb3NlT25Fc2NhcGU9dHJ1ZV1cbiAqL1xuXG4vKipcbiAqIEBkZXNjcmlwdGlvbiBEZWZhdWx0IG9wdGlvbnMgZm9yIERFU1NFUlQuXG4gKiBAdHlwZSB7UmVhZG9ubHk8RGVzc2VydE9wdGlvbnM+fVxuICogQGNvbnN0YW50XG4gKi9cbmNvbnN0IERFRkFVTFRfT1BUSU9OUyA9IE9iamVjdC5mcmVlemUoe1xuICBhdXRvSW5pdDogdHJ1ZSxcbiAgZGVidWc6IGZhbHNlLFxuICBjbG9zZU9uRXNjYXBlOiB0cnVlLFxufSk7XG5cbmV4cG9ydCB7IFZFUlNJT04sIFBSRUZJWCwgREFUQV9BVFRSLCBERUZBVUxUX09QVElPTlMgfTtcbiIsICIvKipcbiAqIEBmaWxlIFNoYXJlZCBtdXRhYmxlIHN0YXRlLlxuICovXG5cbi8qKlxuICogQHR5cGVkZWYge09iamVjdH0gRGVzc2VydFN0YXRlXG4gKiBAcHJvcGVydHkge2Jvb2xlYW59IGVzY0JvdW5kXG4gKiBAcHJvcGVydHkge0hUTUxFbGVtZW50fG51bGx9IGxhc3RGb2N1c2VkXG4gKi9cblxuLyoqXG4gKiBAZGVzY3JpcHRpb24gR2xvYmFsIHJ1bnRpbWUgc3RhdGUuXG4gKiBAdHlwZSB7RGVzc2VydFN0YXRlfVxuICovXG5jb25zdCBzdGF0ZSA9IHtcbiAgZXNjQm91bmQ6IGZhbHNlLFxuICBsYXN0Rm9jdXNlZDogbnVsbCxcbn07XG5cbi8qKlxuICogQGRlc2NyaXB0aW9uIEdsb2JhbCBvcHRpb25zIG11dGF0ZWQgYnkgREVTU0VSVC5pbml0KCkuXG4gKiBAdHlwZSB7T2JqZWN0PHN0cmluZywgKj59XG4gKi9cbmNvbnN0IG9wdGlvbnMgPSB7fTtcblxuZXhwb3J0IHsgc3RhdGUsIG9wdGlvbnMgfTtcbiIsICIvKipcbiAqIEBmaWxlIEludGVybmFsIHBsdWdpbiBhbmQgaW5zdGFuY2UgcmVnaXN0cmllcy5cbiAqL1xuXG4vKipcbiAqIEB0eXBlZGVmIHtPYmplY3R9IEluc3RhbmNlUmVjb3JkXG4gKiBAcHJvcGVydHkge3N0cmluZ30gdHlwZVxuICogQHByb3BlcnR5IHtBcnJheTxbRXZlbnRUYXJnZXQsIHN0cmluZywgRXZlbnRMaXN0ZW5lcl0+fSBoYW5kbGVyc1xuICovXG5cbi8qKlxuICogQHR5cGVkZWYge09iamVjdH0gRGVzc2VydFJlZ2lzdHJ5XG4gKiBAcHJvcGVydHkge01hcDxzdHJpbmcsICo+fSBwbHVnaW5zXG4gKiBAcHJvcGVydHkge1dlYWtNYXA8SFRNTEVsZW1lbnQsIEluc3RhbmNlUmVjb3JkPn0gaW5zdGFuY2VzXG4gKi9cblxuLyoqXG4gKiBAZGVzY3JpcHRpb24gUGx1Z2luIGFuZCBpbnN0YW5jZSByZWdpc3RyaWVzLlxuICogQHR5cGUge0Rlc3NlcnRSZWdpc3RyeX1cbiAqL1xuY29uc3QgcmVnaXN0cnkgPSB7XG4gIHBsdWdpbnM6IG5ldyBNYXAoKSxcbiAgaW5zdGFuY2VzOiBuZXcgV2Vha01hcCgpLFxufTtcblxuZXhwb3J0IHsgcmVnaXN0cnkgfTtcbiIsICIvKipcbiAqIEBmaWxlIEludGVybmFsIERJIGJyaWRnZSBmb3IgcHJpdmF0ZSBzdGF0ZSBhY2Nlc3MuXG4gKi9cblxuLyoqXG4gKiBAdHlwZWRlZiB7T2JqZWN0fSBIZWxwZXJDb250ZXh0XG4gKiBAcHJvcGVydHkgeyp9IGNvcmVcbiAqIEBwcm9wZXJ0eSB7T2JqZWN0PHN0cmluZywgKj59IG9wdGlvbnNcbiAqIEBwcm9wZXJ0eSB7Kn0gc3RhdGVcbiAqIEBwcm9wZXJ0eSB7Kn0gcmVnaXN0cnlcbiAqL1xuXG4vKipcbiAqIEBwcml2YXRlXG4gKiBAdHlwZSB7SGVscGVyQ29udGV4dHxudWxsfVxuICovXG5sZXQgX2N0eCA9IG51bGw7XG5cbmNvbnN0IGhlbHBlcnMgPSB7XG4gIC8qKlxuICAgKiBAZGVzY3JpcHRpb24gQmluZCBwcml2YXRlIGNvbnRleHQgb25jZSBmcm9tIHRoZSBERVNTRVJUIGNvbnN0cnVjdG9yLlxuICAgKiBAcGFyYW0ge0hlbHBlckNvbnRleHR9IGN0eFxuICAgKiBAcmV0dXJucyB7dm9pZH1cbiAgICovXG4gIGJpbmQoY3R4KSB7IF9jdHggPSBjdHg7IH0sXG5cbiAgLyoqXG4gICAqIEBkZXNjcmlwdGlvbiBSZXRyaWV2ZSB0aGUgY3VycmVudCBoZWxwZXIgY29udGV4dC5cbiAgICogQHJldHVybnMge0hlbHBlckNvbnRleHR9XG4gICAqL1xuICBnZXQgY3R4KCkge1xuICAgIGlmICghX2N0eCkgdGhyb3cgbmV3IEVycm9yKCdbREVTU0VSVF0gaGVscGVycyBub3QgYm91bmQgeWV0Jyk7XG4gICAgcmV0dXJuIF9jdHg7XG4gIH0sXG5cbiAgLyoqIEByZXR1cm5zIHsqfSAqL1xuICBnZXQgY29yZSgpICAgICB7IHJldHVybiBoZWxwZXJzLmN0eC5jb3JlOyB9LFxuXG4gIC8qKiBAcmV0dXJucyB7T2JqZWN0PHN0cmluZywgKj59ICovXG4gIGdldCBvcHRpb25zKCkgIHsgcmV0dXJuIGhlbHBlcnMuY3R4Lm9wdGlvbnM7IH0sXG5cbiAgLyoqIEByZXR1cm5zIHsqfSAqL1xuICBnZXQgc3RhdGUoKSAgICB7IHJldHVybiBoZWxwZXJzLmN0eC5zdGF0ZTsgfSxcblxuICAvKiogQHJldHVybnMgeyp9ICovXG4gIGdldCByZWdpc3RyeSgpIHsgcmV0dXJuIGhlbHBlcnMuY3R4LnJlZ2lzdHJ5OyB9LFxufTtcblxuZXhwb3J0IHsgaGVscGVycyB9O1xuIiwgIi8qKlxuICogQGZpbGUgRGVidWcgbG9nZ2VyLlxuICovXG5cbmltcG9ydCB7IGhlbHBlcnMgfSBmcm9tICcuL2JyaWRnZS5qcyc7XG5cbi8qKlxuICogQGRlc2NyaXB0aW9uIExvZyBhIG1lc3NhZ2Ugd2hlbiBkZWJ1ZyBtb2RlIGlzIGVuYWJsZWQuXG4gKiBAcGFyYW0gey4uLip9IGFyZ3NcbiAqIEByZXR1cm5zIHt2b2lkfVxuICovXG5mdW5jdGlvbiBsb2coLi4uYXJncykge1xuICBpZiAoaGVscGVycy5vcHRpb25zPy5kZWJ1ZykgY29uc29sZS5sb2coJ1tERVNTRVJUXScsIC4uLmFyZ3MpO1xufVxuXG5leHBvcnQgeyBsb2cgfTtcbiIsICIvKipcbiAqIEBmaWxlIENvcmUgREVTU0VSVCBjbGFzcy5cbiAqL1xuXG5pbXBvcnQgeyBWRVJTSU9OLCBQUkVGSVgsIERFRkFVTFRfT1BUSU9OUyB9IGZyb20gJy4vY29uc3RhbnRzLmpzJztcbmltcG9ydCB7IHN0YXRlLCBvcHRpb25zIH0gZnJvbSAnLi9zdGF0ZS5qcyc7XG5pbXBvcnQgeyByZWdpc3RyeSB9IGZyb20gJy4vcmVnaXN0cnkuanMnO1xuaW1wb3J0IHsgaGVscGVycyB9IGZyb20gJy4uL3V0aWxzL2JyaWRnZS5qcyc7XG5pbXBvcnQgeyBsb2cgfSBmcm9tICcuLi91dGlscy9sb2dnZXIuanMnO1xuXG4vKipcbiAqIEB0eXBlZGVmIHtPYmplY3R9IERlc3NlcnRDb25maWdcbiAqIEBwcm9wZXJ0eSB7Ym9vbGVhbn0gW2F1dG9Jbml0XVxuICogQHByb3BlcnR5IHtib29sZWFufSBbZGVidWddXG4gKiBAcHJvcGVydHkge2Jvb2xlYW59IFtjbG9zZU9uRXNjYXBlXVxuICogQHByb3BlcnR5IHtib29sZWFufSBbZm9yY2VdXG4gKi9cblxuLyoqXG4gKiBAZGVzY3JpcHRpb24gQ29yZSBERVNTRVJUIGNsYXNzLlxuICovXG5jbGFzcyBERVNTRVJUIHtcbiAgLyoqXG4gICAqIEBwcml2YXRlXG4gICAqIEB0eXBlIHtERVNTRVJUfG51bGx9XG4gICAqL1xuICBzdGF0aWMgI2luc3RhbmNlID0gbnVsbDtcblxuICAvKipcbiAgICogQGRlc2NyaXB0aW9uIExpYnJhcnkgdmVyc2lvbi5cbiAgICogQHJldHVybnMge3N0cmluZ31cbiAgICovXG4gIHN0YXRpYyBnZXQgdmVyc2lvbigpIHsgcmV0dXJuIFZFUlNJT047IH1cblxuICAvKipcbiAgICogQGRlc2NyaXB0aW9uIENyZWF0ZSBhIGZyZXNoIGluc3RhbmNlIGJ5cGFzc2luZyBzaW5nbGV0b24uXG4gICAqIEBwYXJhbSB7RGVzc2VydENvbmZpZ30gW2NmZz17fV1cbiAgICogQHJldHVybnMge0RFU1NFUlR9XG4gICAqL1xuICBzdGF0aWMgY3JlYXRlKGNmZyA9IHt9KSB7XG4gICAgcmV0dXJuIG5ldyBERVNTRVJUKHsgLi4uY2ZnLCBmb3JjZTogdHJ1ZSB9KTtcbiAgfVxuXG4gIC8qKlxuICAgKiBAcGFyYW0ge0Rlc3NlcnRDb25maWd9IFtjZmc9e31dXG4gICAqL1xuICBjb25zdHJ1Y3RvcihjZmcgPSB7fSkge1xuICAgIGlmIChERVNTRVJULiNpbnN0YW5jZSAmJiAhY2ZnLmZvcmNlKSByZXR1cm4gREVTU0VSVC4jaW5zdGFuY2U7XG5cbiAgICBPYmplY3QuYXNzaWduKG9wdGlvbnMsIERFRkFVTFRfT1BUSU9OUywgY2ZnKTtcblxuICAgIC8qKlxuICAgICAqIEBkZXNjcmlwdGlvbiBMaWJyYXJ5IHZlcnNpb24uXG4gICAgICogQHR5cGUge3N0cmluZ31cbiAgICAgKi9cbiAgICB0aGlzLnZlcnNpb24gPSBWRVJTSU9OO1xuXG4gICAgLyoqXG4gICAgICogQGRlc2NyaXB0aW9uIENTUyBwcmVmaXguXG4gICAgICogQHR5cGUge3N0cmluZ31cbiAgICAgKi9cbiAgICB0aGlzLnByZWZpeCA9IFBSRUZJWDtcblxuICAgIGhlbHBlcnMuYmluZCh7IGNvcmU6IHRoaXMsIG9wdGlvbnMsIHN0YXRlLCByZWdpc3RyeSB9KTtcblxuICAgIERFU1NFUlQuI2luc3RhbmNlID0gdGhpcztcbiAgfVxuXG4gIC8qKlxuICAgKiBAZGVzY3JpcHRpb24gSW5pdGlhbGl6ZSB0aGUgbGlicmFyeS5cbiAgICogQHBhcmFtIHtEZXNzZXJ0Q29uZmlnfSBbZXh0cmE9e31dXG4gICAqIEByZXR1cm5zIHtERVNTRVJUfVxuICAgKi9cbiAgaW5pdChleHRyYSA9IHt9KSB7XG4gICAgT2JqZWN0LmFzc2lnbihvcHRpb25zLCBleHRyYSk7XG5cbiAgICBpZiAob3B0aW9ucy5hdXRvSW5pdCkgdGhpcy5hdXRvSW5pdCgpO1xuXG4gICAgcmVnaXN0cnkucGx1Z2lucy5mb3JFYWNoKChwbHVnaW4pID0+IHBsdWdpbi5pbml0Py4odGhpcykpO1xuXG4gICAgbG9nKGBERVNTRVJUIHYke1ZFUlNJT059IGluaXRpYWxpemVkYCk7XG4gICAgcmV0dXJuIHRoaXM7XG4gIH1cblxuICAvKipcbiAgICogQGRlc2NyaXB0aW9uIFJlZ2lzdGVyIGEgcGx1Z2luLlxuICAgKiBAcGFyYW0ge3N0cmluZ30gbmFtZVxuICAgKiBAcGFyYW0geyp9IHBsdWdpblxuICAgKiBAcmV0dXJucyB7REVTU0VSVH1cbiAgICovXG4gIHJlZ2lzdGVyKG5hbWUsIHBsdWdpbikge1xuICAgIGlmIChyZWdpc3RyeS5wbHVnaW5zLmhhcyhuYW1lKSkgcmV0dXJuIHRoaXM7XG4gICAgcmVnaXN0cnkucGx1Z2lucy5zZXQobmFtZSwgcGx1Z2luKTtcbiAgICBwbHVnaW4uaW5zdGFsbD8uKHRoaXMsIGhlbHBlcnMpO1xuICAgIGxvZygncGx1Z2luIHJlZ2lzdGVyZWQ6JywgbmFtZSk7XG4gICAgcmV0dXJuIHRoaXM7XG4gIH1cblxuICAvKipcbiAgICogQGRlc2NyaXB0aW9uIFJlZ2lzdGVyIGFuZCBpbml0IGEgcGx1Z2luLlxuICAgKiBAcGFyYW0geyp9IHBsdWdpblxuICAgKiBAcmV0dXJucyB7REVTU0VSVH1cbiAgICovXG4gIHVzZShwbHVnaW4pIHtcbiAgICBpZiAoIXBsdWdpbj8ubmFtZSkgcmV0dXJuIHRoaXM7XG4gICAgdGhpcy5yZWdpc3RlcihwbHVnaW4ubmFtZSwgcGx1Z2luKTtcbiAgICBwbHVnaW4uaW5pdD8uKHRoaXMpO1xuICAgIHJldHVybiB0aGlzO1xuICB9XG59XG5cbmV4cG9ydCB7IERFU1NFUlQgfTtcbiIsICIvKipcbiAqIEBmaWxlIENTUyBzZWxlY3RvciBlc2NhcGluZy5cbiAqL1xuXG4vKipcbiAqIEBkZXNjcmlwdGlvbiBFc2NhcGUgYSBzdHJpbmcgZm9yIENTUyBzZWxlY3RvcnMuXG4gKiBAcGFyYW0ge3N0cmluZ30gc1xuICogQHJldHVybnMge3N0cmluZ31cbiAqL1xuZnVuY3Rpb24gZXNjKHMpIHtcbiAgcmV0dXJuIGdsb2JhbFRoaXMuQ1NTPy5lc2NhcGVcbiAgICA/IENTUy5lc2NhcGUocylcbiAgICA6IFN0cmluZyhzKS5yZXBsYWNlKC9cIi9nLCAnXFxcXFwiJyk7XG59XG5cbmV4cG9ydCB7IGVzYyB9O1xuIiwgIi8qKlxuICogQGZpbGUgTW9kYWwgY29tcG9uZW50LlxuICovXG5cbmltcG9ydCB7IGVzYyB9IGZyb20gJy4uL3V0aWxzL2VzY2FwZS5qcyc7XG5pbXBvcnQgeyByZWdpc3RyeSB9IGZyb20gJy4uL2NvcmUvcmVnaXN0cnkuanMnO1xuaW1wb3J0IHsgbG9nIH0gZnJvbSAnLi4vdXRpbHMvbG9nZ2VyLmpzJztcblxuLyoqXG4gKiBAdHlwZWRlZiB7T2JqZWN0fSBNb2RhbENvcmVcbiAqIEBwcm9wZXJ0eSB7eyBvcGVuOiAoZWw6IEhUTUxFbGVtZW50KSA9PiB2b2lkLCBjbG9zZTogKGVsOiBIVE1MRWxlbWVudCkgPT4gdm9pZCB9fSBtb2RhbFxuICovXG5cbi8qKlxuICogQGRlc2NyaXB0aW9uIEluaXRpYWxpemUgbW9kYWwgZWxlbWVudC5cbiAqIEB0aGlzIHtNb2RhbENvcmV9XG4gKiBAcGFyYW0ge0hUTUxFbGVtZW50fSBlbFxuICogQHJldHVybnMge3ZvaWR9XG4gKi9cbmZ1bmN0aW9uIG1vZGFsQ29tcG9uZW50KGVsKSB7XG4gIGNvbnN0IGNvcmUgPSB0aGlzO1xuICBjb25zdCBvcGVuQnRucyA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3JBbGwoXG4gICAgYFtkYXRhLWRlc3NlcnQtb3Blbj1cIiR7ZXNjKGVsLmlkKX1cIl1gXG4gICk7XG4gIGNvbnN0IGNsb3NlQnRucyA9IGVsLnF1ZXJ5U2VsZWN0b3JBbGwoJ1tkYXRhLWRlc3NlcnQtY2xvc2VdJyk7XG4gIC8qKiBAdHlwZSB7QXJyYXk8W0V2ZW50VGFyZ2V0LCBzdHJpbmcsIEV2ZW50TGlzdGVuZXJdPn0gKi9cbiAgY29uc3QgaGFuZGxlcnMgPSBbXTtcblxuICBvcGVuQnRucy5mb3JFYWNoKChidG4pID0+IHtcbiAgICBjb25zdCBoID0gKCkgPT4gY29yZS5tb2RhbC5vcGVuKGVsKTtcbiAgICBidG4uYWRkRXZlbnRMaXN0ZW5lcignY2xpY2snLCBoKTtcbiAgICBoYW5kbGVycy5wdXNoKFtidG4sICdjbGljaycsIGhdKTtcbiAgfSk7XG5cbiAgY2xvc2VCdG5zLmZvckVhY2goKGJ0bikgPT4ge1xuICAgIGNvbnN0IGggPSAoKSA9PiBjb3JlLm1vZGFsLmNsb3NlKGVsKTtcbiAgICBidG4uYWRkRXZlbnRMaXN0ZW5lcignY2xpY2snLCBoKTtcbiAgICBoYW5kbGVycy5wdXNoKFtidG4sICdjbGljaycsIGhdKTtcbiAgfSk7XG5cbiAgY29uc3Qgb3ZlcmxheUggPSAoZSkgPT4geyBpZiAoZS50YXJnZXQgPT09IGVsKSBjb3JlLm1vZGFsLmNsb3NlKGVsKTsgfTtcbiAgZWwuYWRkRXZlbnRMaXN0ZW5lcignY2xpY2snLCBvdmVybGF5SCk7XG4gIGhhbmRsZXJzLnB1c2goW2VsLCAnY2xpY2snLCBvdmVybGF5SF0pO1xuXG4gIHJlZ2lzdHJ5Lmluc3RhbmNlcy5zZXQoZWwsIHsgdHlwZTogJ21vZGFsJywgaGFuZGxlcnMgfSk7XG4gIGxvZygnbW9kYWwgaW5pdDonLCBlbC5pZCk7XG59XG5cbmV4cG9ydCB7IG1vZGFsQ29tcG9uZW50IH07XG4iLCAiLyoqXG4gKiBAZmlsZSBQcmVmaXhlZCBjbGFzcyBoZWxwZXJzLlxuICovXG5cbmltcG9ydCB7IFBSRUZJWCB9IGZyb20gJy4uL2NvcmUvY29uc3RhbnRzLmpzJztcblxuLyoqXG4gKiBAZGVzY3JpcHRpb24gQWRkIGEgcHJlZml4ZWQgY2xhc3MuXG4gKiBAcGFyYW0ge0hUTUxFbGVtZW50fSBlbFxuICogQHBhcmFtIHtzdHJpbmd9IG5hbWVcbiAqIEByZXR1cm5zIHtIVE1MRWxlbWVudH1cbiAqL1xuZnVuY3Rpb24gYWRkQ2xhc3MoZWwsIG5hbWUpIHtcbiAgZWwuY2xhc3NMaXN0LmFkZChgJHtQUkVGSVh9LSR7bmFtZX1gKTtcbiAgcmV0dXJuIGVsO1xufVxuXG4vKipcbiAqIEBkZXNjcmlwdGlvbiBSZW1vdmUgYSBwcmVmaXhlZCBjbGFzcy5cbiAqIEBwYXJhbSB7SFRNTEVsZW1lbnR9IGVsXG4gKiBAcGFyYW0ge3N0cmluZ30gbmFtZVxuICogQHJldHVybnMge0hUTUxFbGVtZW50fVxuICovXG5mdW5jdGlvbiByZW1vdmVDbGFzcyhlbCwgbmFtZSkge1xuICBlbC5jbGFzc0xpc3QucmVtb3ZlKGAke1BSRUZJWH0tJHtuYW1lfWApO1xuICByZXR1cm4gZWw7XG59XG5cbi8qKlxuICogQGRlc2NyaXB0aW9uIFRvZ2dsZSBhIHByZWZpeGVkIGNsYXNzLlxuICogQHBhcmFtIHtIVE1MRWxlbWVudH0gZWxcbiAqIEBwYXJhbSB7c3RyaW5nfSBuYW1lXG4gKiBAcGFyYW0ge2Jvb2xlYW59IFtmb3JjZV1cbiAqIEByZXR1cm5zIHtIVE1MRWxlbWVudH1cbiAqL1xuZnVuY3Rpb24gdG9nZ2xlQ2xhc3MoZWwsIG5hbWUsIGZvcmNlKSB7XG4gIGNvbnN0IGNscyA9IGAke1BSRUZJWH0tJHtuYW1lfWA7XG4gIHR5cGVvZiBmb3JjZSA9PT0gJ2Jvb2xlYW4nXG4gICAgPyBlbC5jbGFzc0xpc3QudG9nZ2xlKGNscywgZm9yY2UpXG4gICAgOiBlbC5jbGFzc0xpc3QudG9nZ2xlKGNscyk7XG4gIHJldHVybiBlbDtcbn1cblxuZXhwb3J0IHsgYWRkQ2xhc3MsIHJlbW92ZUNsYXNzLCB0b2dnbGVDbGFzcyB9O1xuIiwgIi8qKlxuICogQGZpbGUgRHJvcGRvd24gY29tcG9uZW50LlxuICovXG5cbmltcG9ydCB7IHJlbW92ZUNsYXNzLCB0b2dnbGVDbGFzcyB9IGZyb20gJy4uL3V0aWxzL2NsYXNzTmFtZXMuanMnO1xuaW1wb3J0IHsgcmVnaXN0cnkgfSBmcm9tICcuLi9jb3JlL3JlZ2lzdHJ5LmpzJztcbmltcG9ydCB7IGxvZyB9IGZyb20gJy4uL3V0aWxzL2xvZ2dlci5qcyc7XG5cbi8qKlxuICogQGRlc2NyaXB0aW9uIEluaXRpYWxpemUgZHJvcGRvd24gZWxlbWVudC5cbiAqIEBwYXJhbSB7SFRNTEVsZW1lbnR9IGVsXG4gKiBAcmV0dXJucyB7dm9pZH1cbiAqL1xuZnVuY3Rpb24gZHJvcGRvd25Db21wb25lbnQoZWwpIHtcbiAgY29uc3QgdHJpZ2dlciA9IGVsLnF1ZXJ5U2VsZWN0b3IoJ1tkYXRhLWRlc3NlcnQtdHJpZ2dlcl0nKTtcbiAgY29uc3QgbWVudSA9IGVsLnF1ZXJ5U2VsZWN0b3IoJ1tkYXRhLWRlc3NlcnQtbWVudV0nKTtcbiAgaWYgKCF0cmlnZ2VyIHx8ICFtZW51KSByZXR1cm47XG5cbiAgLyoqIEB0eXBlIHtBcnJheTxbRXZlbnRUYXJnZXQsIHN0cmluZywgRXZlbnRMaXN0ZW5lcl0+fSAqL1xuICBjb25zdCBoYW5kbGVycyA9IFtdO1xuXG4gIGNvbnN0IG9uVHJpZ2dlciA9IChlKSA9PiB7XG4gICAgZS5zdG9wUHJvcGFnYXRpb24oKTtcbiAgICB0b2dnbGVDbGFzcyhlbCwgJ29wZW4nKTtcbiAgICB0b2dnbGVDbGFzcyhtZW51LCAnc2hvdycpO1xuICB9O1xuICB0cmlnZ2VyLmFkZEV2ZW50TGlzdGVuZXIoJ2NsaWNrJywgb25UcmlnZ2VyKTtcbiAgaGFuZGxlcnMucHVzaChbdHJpZ2dlciwgJ2NsaWNrJywgb25UcmlnZ2VyXSk7XG5cbiAgY29uc3Qgb25PdXRzaWRlID0gKGUpID0+IHtcbiAgICBpZiAoIWVsLmNvbnRhaW5zKC8qKiBAdHlwZSB7Tm9kZX0gKi8oZS50YXJnZXQpKSkge1xuICAgICAgcmVtb3ZlQ2xhc3MoZWwsICdvcGVuJyk7XG4gICAgICByZW1vdmVDbGFzcyhtZW51LCAnc2hvdycpO1xuICAgIH1cbiAgfTtcbiAgZG9jdW1lbnQuYWRkRXZlbnRMaXN0ZW5lcignY2xpY2snLCBvbk91dHNpZGUpO1xuICBoYW5kbGVycy5wdXNoKFtkb2N1bWVudCwgJ2NsaWNrJywgb25PdXRzaWRlXSk7XG5cbiAgcmVnaXN0cnkuaW5zdGFuY2VzLnNldChlbCwgeyB0eXBlOiAnZHJvcGRvd24nLCBoYW5kbGVycyB9KTtcbiAgbG9nKCdkcm9wZG93biBpbml0Jyk7XG59XG5cbmV4cG9ydCB7IGRyb3Bkb3duQ29tcG9uZW50IH07XG4iLCAiLyoqXG4gKiBAZmlsZSBUYWJzIGNvbXBvbmVudC5cbiAqL1xuXG5pbXBvcnQgeyBhZGRDbGFzcywgcmVtb3ZlQ2xhc3MgfSBmcm9tICcuLi91dGlscy9jbGFzc05hbWVzLmpzJztcbmltcG9ydCB7IGVzYyB9IGZyb20gJy4uL3V0aWxzL2VzY2FwZS5qcyc7XG5pbXBvcnQgeyByZWdpc3RyeSB9IGZyb20gJy4uL2NvcmUvcmVnaXN0cnkuanMnO1xuaW1wb3J0IHsgbG9nIH0gZnJvbSAnLi4vdXRpbHMvbG9nZ2VyLmpzJztcblxuLyoqXG4gKiBAZGVzY3JpcHRpb24gSW5pdGlhbGl6ZSB0YWJzIGVsZW1lbnQuXG4gKiBAcGFyYW0ge0hUTUxFbGVtZW50fSBlbFxuICogQHJldHVybnMge3ZvaWR9XG4gKi9cbmZ1bmN0aW9uIHRhYnNDb21wb25lbnQoZWwpIHtcbiAgY29uc3QgYnV0dG9ucyA9IGVsLnF1ZXJ5U2VsZWN0b3JBbGwoJ1tkYXRhLWRlc3NlcnQtdGFiXScpO1xuICBjb25zdCBwYW5lbHMgPSBlbC5xdWVyeVNlbGVjdG9yQWxsKCdbZGF0YS1kZXNzZXJ0LXBhbmVsXScpO1xuICBpZiAoIWJ1dHRvbnMubGVuZ3RoKSByZXR1cm47XG5cbiAgLyoqIEB0eXBlIHtBcnJheTxbRXZlbnRUYXJnZXQsIHN0cmluZywgRXZlbnRMaXN0ZW5lcl0+fSAqL1xuICBjb25zdCBoYW5kbGVycyA9IFtdO1xuXG4gIC8qKlxuICAgKiBAZGVzY3JpcHRpb24gQWN0aXZhdGUgYSB0YWIgYW5kIGl0cyBwYW5lbC5cbiAgICogQHBhcmFtIHtzdHJpbmd9IHRhcmdldFxuICAgKiBAcmV0dXJucyB7dm9pZH1cbiAgICovXG4gIGNvbnN0IGFjdGl2YXRlID0gKHRhcmdldCkgPT4ge1xuICAgIGJ1dHRvbnMuZm9yRWFjaCgoYikgPT4gcmVtb3ZlQ2xhc3MoYiwgJ2FjdGl2ZScpKTtcbiAgICBwYW5lbHMuZm9yRWFjaCgocCkgPT4gcmVtb3ZlQ2xhc3MocCwgJ2FjdGl2ZScpKTtcblxuICAgIGNvbnN0IGJ0biA9IGVsLnF1ZXJ5U2VsZWN0b3IoYFtkYXRhLWRlc3NlcnQtdGFiPVwiJHtlc2ModGFyZ2V0KX1cIl1gKTtcbiAgICBjb25zdCBwYW5lbCA9IGVsLnF1ZXJ5U2VsZWN0b3IoYFtkYXRhLWRlc3NlcnQtcGFuZWw9XCIke2VzYyh0YXJnZXQpfVwiXWApO1xuICAgIGlmIChidG4pIGFkZENsYXNzKGJ0biwgJ2FjdGl2ZScpO1xuICAgIGlmIChwYW5lbCkgYWRkQ2xhc3MocGFuZWwsICdhY3RpdmUnKTtcbiAgfTtcblxuICBidXR0b25zLmZvckVhY2goKGJ0bikgPT4ge1xuICAgIGNvbnN0IGggPSAoKSA9PiBhY3RpdmF0ZShidG4uZ2V0QXR0cmlidXRlKCdkYXRhLWRlc3NlcnQtdGFiJykpO1xuICAgIGJ0bi5hZGRFdmVudExpc3RlbmVyKCdjbGljaycsIGgpO1xuICAgIGhhbmRsZXJzLnB1c2goW2J0biwgJ2NsaWNrJywgaF0pO1xuICB9KTtcblxuICBjb25zdCBpbml0aWFsID0gZWwucXVlcnlTZWxlY3RvcignLmRlc3NlcnQtdGFiLmRlc3NlcnQtYWN0aXZlJyk7XG4gIGlmIChpbml0aWFsKSBhY3RpdmF0ZShpbml0aWFsLmdldEF0dHJpYnV0ZSgnZGF0YS1kZXNzZXJ0LXRhYicpKTtcblxuICByZWdpc3RyeS5pbnN0YW5jZXMuc2V0KGVsLCB7IHR5cGU6ICd0YWJzJywgaGFuZGxlcnMgfSk7XG4gIGxvZygndGFicyBpbml0Jyk7XG59XG5cbmV4cG9ydCB7IHRhYnNDb21wb25lbnQgfTtcbiIsICIvKipcbiAqIEBmaWxlIEFjY29yZGlvbiBjb21wb25lbnQuXG4gKi9cblxuaW1wb3J0IHsgYWRkQ2xhc3MsIHJlbW92ZUNsYXNzIH0gZnJvbSAnLi4vdXRpbHMvY2xhc3NOYW1lcy5qcyc7XG5pbXBvcnQgeyByZWdpc3RyeSB9IGZyb20gJy4uL2NvcmUvcmVnaXN0cnkuanMnO1xuaW1wb3J0IHsgbG9nIH0gZnJvbSAnLi4vdXRpbHMvbG9nZ2VyLmpzJztcblxuLyoqXG4gKiBAZGVzY3JpcHRpb24gSW5pdGlhbGl6ZSBhY2NvcmRpb24gZWxlbWVudC5cbiAqIEBwYXJhbSB7SFRNTEVsZW1lbnR9IGVsXG4gKiBAcmV0dXJucyB7dm9pZH1cbiAqL1xuZnVuY3Rpb24gYWNjb3JkaW9uQ29tcG9uZW50KGVsKSB7XG4gIGNvbnN0IGl0ZW1zID0gZWwucXVlcnlTZWxlY3RvckFsbCgnLmRlc3NlcnQtYWNjb3JkaW9uLWl0ZW0nKTtcbiAgLyoqIEB0eXBlIHtBcnJheTxbRXZlbnRUYXJnZXQsIHN0cmluZywgRXZlbnRMaXN0ZW5lcl0+fSAqL1xuICBjb25zdCBoYW5kbGVycyA9IFtdO1xuXG4gIGl0ZW1zLmZvckVhY2goKGl0ZW0pID0+IHtcbiAgICBjb25zdCBoZWFkZXIgPSBpdGVtLnF1ZXJ5U2VsZWN0b3IoJy5kZXNzZXJ0LWFjY29yZGlvbi1oZWFkZXInKTtcbiAgICBjb25zdCBib2R5ID0gaXRlbS5xdWVyeVNlbGVjdG9yKCcuZGVzc2VydC1hY2NvcmRpb24tYm9keScpO1xuICAgIGlmICghaGVhZGVyKSByZXR1cm47XG5cbiAgICBjb25zdCBoID0gKCkgPT4ge1xuICAgICAgY29uc3QgaXNPcGVuID0gaXRlbS5jbGFzc0xpc3QuY29udGFpbnMoJ2Rlc3NlcnQtb3BlbicpO1xuXG4gICAgICBpdGVtcy5mb3JFYWNoKChpKSA9PiB7XG4gICAgICAgIHJlbW92ZUNsYXNzKGksICdvcGVuJyk7XG4gICAgICAgIGNvbnN0IGIgPSBpLnF1ZXJ5U2VsZWN0b3IoJy5kZXNzZXJ0LWFjY29yZGlvbi1ib2R5Jyk7XG4gICAgICAgIGlmIChiKSBiLnN0eWxlLm1heEhlaWdodCA9ICcnO1xuICAgICAgfSk7XG5cbiAgICAgIGlmICghaXNPcGVuKSB7XG4gICAgICAgIGFkZENsYXNzKGl0ZW0sICdvcGVuJyk7XG4gICAgICAgIGlmIChib2R5KSBib2R5LnN0eWxlLm1heEhlaWdodCA9IGAke2JvZHkuc2Nyb2xsSGVpZ2h0fXB4YDtcbiAgICAgIH1cbiAgICB9O1xuXG4gICAgaGVhZGVyLmFkZEV2ZW50TGlzdGVuZXIoJ2NsaWNrJywgaCk7XG4gICAgaGFuZGxlcnMucHVzaChbaGVhZGVyLCAnY2xpY2snLCBoXSk7XG4gIH0pO1xuXG4gIHJlZ2lzdHJ5Lmluc3RhbmNlcy5zZXQoZWwsIHsgdHlwZTogJ2FjY29yZGlvbicsIGhhbmRsZXJzIH0pO1xuICBsb2coJ2FjY29yZGlvbiBpbml0Jyk7XG59XG5cbmV4cG9ydCB7IGFjY29yZGlvbkNvbXBvbmVudCB9O1xuIiwgIi8qKlxuICogQGZpbGUgQ29tcG9uZW50IHJlZ2lzdHJ5IGJhcnJlbC5cbiAqL1xuXG5pbXBvcnQgeyBtb2RhbENvbXBvbmVudCB9IGZyb20gJy4vbW9kYWwuanMnO1xuaW1wb3J0IHsgZHJvcGRvd25Db21wb25lbnQgfSBmcm9tICcuL2Ryb3Bkb3duLmpzJztcbmltcG9ydCB7IHRhYnNDb21wb25lbnQgfSBmcm9tICcuL3RhYnMuanMnO1xuaW1wb3J0IHsgYWNjb3JkaW9uQ29tcG9uZW50IH0gZnJvbSAnLi9hY2NvcmRpb24uanMnO1xuXG4vKipcbiAqIEB0eXBlZGVmIHtPYmplY3R9IENvbXBvbmVudHNcbiAqIEBwcm9wZXJ0eSB7KGVsOiBIVE1MRWxlbWVudCkgPT4gdm9pZH0gbW9kYWxcbiAqIEBwcm9wZXJ0eSB7KGVsOiBIVE1MRWxlbWVudCkgPT4gdm9pZH0gZHJvcGRvd25cbiAqIEBwcm9wZXJ0eSB7KGVsOiBIVE1MRWxlbWVudCkgPT4gdm9pZH0gdGFic1xuICogQHByb3BlcnR5IHsoZWw6IEhUTUxFbGVtZW50KSA9PiB2b2lkfSBhY2NvcmRpb25cbiAqL1xuXG4vKipcbiAqIEBkZXNjcmlwdGlvbiBDb21wb25lbnQgcmVnaXN0cnkgbWFwLlxuICogQHR5cGUge0NvbXBvbmVudHN9XG4gKi9cbmNvbnN0IGNvbXBvbmVudHMgPSB7XG4gIG1vZGFsOiBtb2RhbENvbXBvbmVudCxcbiAgZHJvcGRvd246IGRyb3Bkb3duQ29tcG9uZW50LFxuICB0YWJzOiB0YWJzQ29tcG9uZW50LFxuICBhY2NvcmRpb246IGFjY29yZGlvbkNvbXBvbmVudCxcbn07XG5cbmV4cG9ydCB7IGNvbXBvbmVudHMgfTtcbiIsICIvKipcbiAqIEBmaWxlIFNjYW4gRE9NIGFuZCBpbml0aWFsaXplIGNvbXBvbmVudHMuXG4gKi9cblxuaW1wb3J0IHsgREFUQV9BVFRSIH0gZnJvbSAnLi4vY29yZS9jb25zdGFudHMuanMnO1xuXG4vKipcbiAqIEB0eXBlZGVmIHtPYmplY3R9IENvbXBvbmVudHNNYXBcbiAqIEBwcm9wZXJ0eSB7Kn0gW2tleV1cbiAqL1xuXG4vKipcbiAqIEBkZXNjcmlwdGlvbiBBdXRvLWluaXQgYWxsIGVsZW1lbnRzIHdpdGggZGF0YS1kZXNzZXJ0IGF0dHJpYnV0ZS5cbiAqIEB0aGlzIHt7IGNvbXBvbmVudHM6IENvbXBvbmVudHNNYXAgfX1cbiAqIEBwYXJhbSB7UGFyZW50Tm9kZX0gW3Jvb3Q9ZG9jdW1lbnRdXG4gKiBAcmV0dXJucyB7dm9pZH1cbiAqL1xuZnVuY3Rpb24gYXV0b0luaXQocm9vdCA9IGRvY3VtZW50KSB7XG4gIHJvb3QucXVlcnlTZWxlY3RvckFsbChgWyR7REFUQV9BVFRSfV1gKS5mb3JFYWNoKChub2RlKSA9PiB7XG4gICAgaWYgKG5vZGUuX2Rlc3NlcnRJbml0aWFsaXplZCkgcmV0dXJuO1xuICAgIGNvbnN0IHR5cGUgPSBub2RlLmdldEF0dHJpYnV0ZShEQVRBX0FUVFIpO1xuICAgIGNvbnN0IGZuID0gdGhpcy5jb21wb25lbnRzW3R5cGVdO1xuICAgIGlmICh0eXBlb2YgZm4gPT09ICdmdW5jdGlvbicpIHtcbiAgICAgIGZuLmNhbGwodGhpcywgbm9kZSk7XG4gICAgICBub2RlLl9kZXNzZXJ0SW5pdGlhbGl6ZWQgPSB0cnVlO1xuICAgIH1cbiAgfSk7XG59XG5cbmV4cG9ydCB7IGF1dG9Jbml0IH07XG4iLCAiLyoqXG4gKiBAZmlsZSBHbG9iYWwgRVNDIGtleSBoYW5kbGVyLlxuICovXG5cbmltcG9ydCB7IHN0YXRlIH0gZnJvbSAnLi4vY29yZS9zdGF0ZS5qcyc7XG5cbi8qKlxuICogQHR5cGVkZWYge09iamVjdH0gQ29yZUxpa2VcbiAqIEBwcm9wZXJ0eSB7c3RyaW5nfSBwcmVmaXhcbiAqIEBwcm9wZXJ0eSB7eyBjbG9zZTogKGVsOiBIVE1MRWxlbWVudCkgPT4gdm9pZCB9fSBtb2RhbFxuICovXG5cbi8qKlxuICogQGRlc2NyaXB0aW9uIEJpbmQgZ2xvYmFsIEVTQyBoYW5kbGVyIHRvIGNsb3NlIHZpc2libGUgbW9kYWxzLlxuICogQHBhcmFtIHtDb3JlTGlrZX0gY29yZVxuICogQHJldHVybnMge3ZvaWR9XG4gKi9cbmZ1bmN0aW9uIGJpbmRFc2NhcGVLZXkoY29yZSkge1xuICBpZiAoc3RhdGUuZXNjQm91bmQpIHJldHVybjtcblxuICBkb2N1bWVudC5hZGRFdmVudExpc3RlbmVyKCdrZXlkb3duJywgKGUpID0+IHtcbiAgICBpZiAoZS5rZXkgIT09ICdFc2NhcGUnKSByZXR1cm47XG4gICAgZG9jdW1lbnRcbiAgICAgIC5xdWVyeVNlbGVjdG9yQWxsKGAuJHtjb3JlLnByZWZpeH0tbW9kYWwuJHtjb3JlLnByZWZpeH0tc2hvd2ApXG4gICAgICAuZm9yRWFjaCgobSkgPT4gY29yZS5tb2RhbC5jbG9zZShtKSk7XG4gIH0pO1xuXG4gIHN0YXRlLmVzY0JvdW5kID0gdHJ1ZTtcbn1cblxuZXhwb3J0IHsgYmluZEVzY2FwZUtleSB9O1xuIiwgIi8qKlxuICogQGZpbGUgVVJMIHJlc29sdXRpb24gaGVscGVycy5cbiAqL1xuXG4vKipcbiAqIEBkZXNjcmlwdGlvbiBSZXNvbHZlIGEgcGF0aCByZWxhdGl2ZSB0byBhIGJhc2UuXG4gKiBAcGFyYW0ge3N0cmluZ30gYmFzZVxuICogQHBhcmFtIHtzdHJpbmd9IHBhdGhcbiAqIEByZXR1cm5zIHtzdHJpbmd9XG4gKi9cbmZ1bmN0aW9uIHJlc29sdmVVUkwoYmFzZSwgcGF0aCkge1xuICB0cnkgeyByZXR1cm4gbmV3IFVSTChwYXRoLCBiYXNlKS5ocmVmOyB9XG4gIGNhdGNoIHsgcmV0dXJuIHBhdGg7IH1cbn1cblxuLyoqXG4gKiBAZGVzY3JpcHRpb24gRGVyaXZlIGJhc2UgVVJMIGZyb20gYSBzY3JpcHQgZWxlbWVudCAoYXNzdW1lcyAvc3JjLyBsYXlvdXQpLlxuICogQHBhcmFtIHtIVE1MU2NyaXB0RWxlbWVudH0gc2NyaXB0RWxcbiAqIEByZXR1cm5zIHs/c3RyaW5nfVxuICovXG5mdW5jdGlvbiBnZXRTY3JpcHRCYXNlKHNjcmlwdEVsKSB7XG4gIGlmICghc2NyaXB0RWw/LnNyYykgcmV0dXJuIG51bGw7XG4gIGNvbnN0IG0gPSBzY3JpcHRFbC5zcmMubWF0Y2goL14oLio/KVxcL3NyY1xcL1teL10rJC8pO1xuICByZXR1cm4gbSA/IG1bMV0gOiBzY3JpcHRFbC5zcmMucmVwbGFjZSgvXFwvW14vXSskLywgJycpO1xufVxuXG4vKipcbiAqIEBkZXNjcmlwdGlvbiBHZXQgdGhlIGN1cnJlbnRseSBleGVjdXRpbmcgc2NyaXB0IGVsZW1lbnQuXG4gKiBAcmV0dXJucyB7SFRNTFNjcmlwdEVsZW1lbnR8dW5kZWZpbmVkfVxuICovXG5mdW5jdGlvbiBjdXJyZW50U2NyaXB0KCkge1xuICByZXR1cm4gZG9jdW1lbnQuY3VycmVudFNjcmlwdFxuICAgIHx8ICgoKSA9PiB7XG4gICAgICBjb25zdCBzID0gZG9jdW1lbnQuZ2V0RWxlbWVudHNCeVRhZ05hbWUoJ3NjcmlwdCcpO1xuICAgICAgcmV0dXJuIHNbcy5sZW5ndGggLSAxXTtcbiAgICB9KSgpO1xufVxuXG5leHBvcnQgeyByZXNvbHZlVVJMLCBnZXRTY3JpcHRCYXNlLCBjdXJyZW50U2NyaXB0IH07XG4iLCAiLyoqXG4gKiBAZmlsZSBBdXRvLWluamVjdCBkZXNzZXJ0LmNzcy5cbiAqL1xuXG5pbXBvcnQgeyBjdXJyZW50U2NyaXB0LCBnZXRTY3JpcHRCYXNlIH0gZnJvbSAnLi4vdXRpbHMvdXJsLmpzJztcbmltcG9ydCB7IGxvZyB9IGZyb20gJy4uL3V0aWxzL2xvZ2dlci5qcyc7XG5cbi8qKlxuICogQGRlc2NyaXB0aW9uIEluamVjdCBkZXNzZXJ0LmNzcyBpZiBub3QgYWxyZWFkeSBwcmVzZW50LlxuICogQHJldHVybnMge3ZvaWR9XG4gKi9cbmZ1bmN0aW9uIGluamVjdENTUygpIHtcbiAgaWYgKGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoJ2xpbmtbZGF0YS1kZXNzZXJ0LWNzc10nKSkgcmV0dXJuO1xuXG4gIGNvbnN0IGJhc2UgPSBnZXRTY3JpcHRCYXNlKGN1cnJlbnRTY3JpcHQoKSk7XG4gIGNvbnN0IGhyZWYgPSBiYXNlXG4gICAgPyBgJHtiYXNlfS9zcmMvc3R5bGVzL2Rlc3NlcnQuY3NzYFxuICAgIDogJ2Rpc3QvZGVzc2VydC5jc3MnO1xuXG4gIGNvbnN0IGxpbmsgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdsaW5rJyk7XG4gIGxpbmsucmVsID0gJ3N0eWxlc2hlZXQnO1xuICBsaW5rLmhyZWYgPSBocmVmO1xuICBsaW5rLnNldEF0dHJpYnV0ZSgnZGF0YS1kZXNzZXJ0LWNzcycsICcnKTtcbiAgbGluay5vbmVycm9yID0gKCkgPT4gbG9nKCdDU1MgbG9hZCBmYWlsZWQ6JywgaHJlZik7XG4gIGRvY3VtZW50LmhlYWQuYXBwZW5kQ2hpbGQobGluayk7XG59XG5cbmV4cG9ydCB7IGluamVjdENTUyB9O1xuIiwgIi8qKlxuICogQGZpbGUgQXV0by1pbmplY3QgbG9hZGVyIHBsdWdpbi5cbiAqL1xuXG5pbXBvcnQgeyByZWdpc3RyeSB9IGZyb20gJy4uL2NvcmUvcmVnaXN0cnkuanMnO1xuaW1wb3J0IHsgY3VycmVudFNjcmlwdCwgZ2V0U2NyaXB0QmFzZSB9IGZyb20gJy4uL3V0aWxzL3VybC5qcyc7XG5pbXBvcnQgeyBsb2cgfSBmcm9tICcuLi91dGlscy9sb2dnZXIuanMnO1xuXG4vKipcbiAqIEBkZXNjcmlwdGlvbiBJbmplY3QgbG9hZGVyIHBsdWdpbiBpZiBub3QgcmVnaXN0ZXJlZC5cbiAqIEByZXR1cm5zIHt2b2lkfVxuICovXG5mdW5jdGlvbiBpbmplY3RMb2FkZXIoKSB7XG4gIGlmIChyZWdpc3RyeS5wbHVnaW5zLmhhcygnbG9hZGVyJykpIHJldHVybjtcbiAgaWYgKGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoJ3NjcmlwdFtkYXRhLWRlc3NlcnQtbG9hZGVyXScpKSByZXR1cm47XG5cbiAgY29uc3QgYmFzZSA9IGdldFNjcmlwdEJhc2UoY3VycmVudFNjcmlwdCgpKTtcbiAgY29uc3Qgc3JjID0gYmFzZVxuICAgID8gYCR7YmFzZX0vc3JjL3BsdWdpbnMvbG9hZGVyL0xvYWRlclBsdWdpbi5qc2BcbiAgICA6ICdsb2FkZXIudW1kLmpzJztcblxuICBjb25zdCBzID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnc2NyaXB0Jyk7XG4gIHMudHlwZSA9IGJhc2UgPyAnbW9kdWxlJyA6ICd0ZXh0L2phdmFzY3JpcHQnO1xuICBzLnNyYyA9IHNyYztcbiAgcy5hc3luYyA9IGZhbHNlO1xuICBzLnNldEF0dHJpYnV0ZSgnZGF0YS1kZXNzZXJ0LWxvYWRlcicsICcnKTtcbiAgcy5vbmVycm9yID0gKCkgPT4gbG9nKCdsb2FkZXIgaW5qZWN0IGZhaWxlZDonLCBzcmMpO1xuICBkb2N1bWVudC5oZWFkLmFwcGVuZENoaWxkKHMpO1xufVxuXG5leHBvcnQgeyBpbmplY3RMb2FkZXIgfTtcbiIsICIvKipcbiAqIEBmaWxlIE1vZGFsIG9wZW4vY2xvc2UgY29udHJvbGxlci5cbiAqL1xuXG5pbXBvcnQgeyBhZGRDbGFzcywgcmVtb3ZlQ2xhc3MgfSBmcm9tICcuLi91dGlscy9jbGFzc05hbWVzLmpzJztcbmltcG9ydCB7IHN0YXRlIH0gZnJvbSAnLi4vY29yZS9zdGF0ZS5qcyc7XG5pbXBvcnQgeyBsb2cgfSBmcm9tICcuLi91dGlscy9sb2dnZXIuanMnO1xuXG4vKipcbiAqIEB0eXBlZGVmIHtPYmplY3R9IE1vZGFsQVBJXG4gKiBAcHJvcGVydHkgeyhlbDogSFRNTEVsZW1lbnQpID0+IHZvaWR9IG9wZW5cbiAqIEBwcm9wZXJ0eSB7KGVsOiBIVE1MRWxlbWVudCkgPT4gdm9pZH0gY2xvc2VcbiAqL1xuXG4vKipcbiAqIEBkZXNjcmlwdGlvbiBNb2RhbCBjb250cm9sbGVyLlxuICogQHR5cGUge01vZGFsQVBJfVxuICovXG5jb25zdCBtb2RhbEFQSSA9IHtcbiAgLyoqXG4gICAqIEBkZXNjcmlwdGlvbiBPcGVuIGEgbW9kYWwgZWxlbWVudC5cbiAgICogQHBhcmFtIHtIVE1MRWxlbWVudH0gZWxcbiAgICogQHJldHVybnMge3ZvaWR9XG4gICAqL1xuICBvcGVuKGVsKSB7XG4gICAgc3RhdGUubGFzdEZvY3VzZWQgPSBkb2N1bWVudC5hY3RpdmVFbGVtZW50O1xuXG4gICAgZWwuc3R5bGUuZGlzcGxheSA9ICdmbGV4JztcbiAgICBkb2N1bWVudC5ib2R5LnN0eWxlLm92ZXJmbG93ID0gJ2hpZGRlbic7XG4gICAgcmVxdWVzdEFuaW1hdGlvbkZyYW1lKCgpID0+IGFkZENsYXNzKGVsLCAnc2hvdycpKTtcblxuICAgIHNldFRpbWVvdXQoKCkgPT4ge1xuICAgICAgY29uc3QgZiA9IGVsLnF1ZXJ5U2VsZWN0b3IoXG4gICAgICAgICdidXR0b24sIFtocmVmXSwgaW5wdXQsIHNlbGVjdCwgdGV4dGFyZWEsIFt0YWJpbmRleF06bm90KFt0YWJpbmRleD1cIi0xXCJdKSdcbiAgICAgICk7XG4gICAgICAvKiogQHR5cGUge0hUTUxFbGVtZW50fG51bGx9ICovKGYpPy5mb2N1cygpO1xuICAgIH0sIDEwMCk7XG5cbiAgICBsb2coJ21vZGFsIG9wZW46JywgZWwuaWQpO1xuICB9LFxuXG4gIC8qKlxuICAgKiBAZGVzY3JpcHRpb24gQ2xvc2UgYSBtb2RhbCBlbGVtZW50LlxuICAgKiBAcGFyYW0ge0hUTUxFbGVtZW50fSBlbFxuICAgKiBAcmV0dXJucyB7dm9pZH1cbiAgICovXG4gIGNsb3NlKGVsKSB7XG4gICAgcmVtb3ZlQ2xhc3MoZWwsICdzaG93Jyk7XG5cbiAgICBzZXRUaW1lb3V0KCgpID0+IHtcbiAgICAgIGVsLnN0eWxlLmRpc3BsYXkgPSAnbm9uZSc7XG4gICAgICBkb2N1bWVudC5ib2R5LnN0eWxlLm92ZXJmbG93ID0gJyc7XG4gICAgICBzdGF0ZS5sYXN0Rm9jdXNlZD8uZm9jdXMoKTtcbiAgICB9LCAzMDApO1xuXG4gICAgbG9nKCdtb2RhbCBjbG9zZTonLCBlbC5pZCk7XG4gIH0sXG59O1xuXG5leHBvcnQgeyBtb2RhbEFQSSB9O1xuIiwgIi8qKlxuICogQGZpbGUgU3RhY2tlZCBhbGVydC90b2FzdCBBUEkuXG4gKi9cblxuaW1wb3J0IHsgYWRkQ2xhc3MsIHJlbW92ZUNsYXNzIH0gZnJvbSAnLi4vdXRpbHMvY2xhc3NOYW1lcy5qcyc7XG5cbi8qKlxuICogQHR5cGVkZWYgeydpbmZvJ3wnc3VjY2Vzcyd8J3dhcm5pbmcnfCdkYW5nZXInfSBBbGVydFR5cGVcbiAqL1xuXG4vKipcbiAqIEBkZXNjcmlwdGlvbiBTaG93IGEgc3RhY2tlZCBhbGVydC5cbiAqIEBwYXJhbSB7c3RyaW5nfSBtc2dcbiAqIEBwYXJhbSB7QWxlcnRUeXBlfSBbdHlwZT0naW5mbyddXG4gKiBAcGFyYW0ge251bWJlcn0gW2R1cmF0aW9uPTMwMDBdXG4gKiBAcmV0dXJucyB7dm9pZH1cbiAqL1xuZnVuY3Rpb24gYWxlcnRBUEkobXNnLCB0eXBlID0gJ2luZm8nLCBkdXJhdGlvbiA9IDMwMDApIHtcbiAgbGV0IGNvbnRhaW5lciA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoJy5kZXNzZXJ0LWFsZXJ0LWNvbnRhaW5lcicpO1xuICBpZiAoIWNvbnRhaW5lcikge1xuICAgIGNvbnRhaW5lciA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2RpdicpO1xuICAgIGNvbnRhaW5lci5jbGFzc05hbWUgPSAnZGVzc2VydC1hbGVydC1jb250YWluZXInO1xuICAgIGRvY3VtZW50LmJvZHkuYXBwZW5kQ2hpbGQoY29udGFpbmVyKTtcbiAgfVxuXG4gIGNvbnN0IGJveCA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2RpdicpO1xuICBib3guY2xhc3NOYW1lID0gYGRlc3NlcnQtYWxlcnQgZGVzc2VydC1hbGVydC0ke3R5cGV9YDtcbiAgYm94LnRleHRDb250ZW50ID0gbXNnO1xuICBjb250YWluZXIuYXBwZW5kQ2hpbGQoYm94KTtcblxuICByZXF1ZXN0QW5pbWF0aW9uRnJhbWUoKCkgPT4gYWRkQ2xhc3MoYm94LCAnc2hvdycpKTtcblxuICBzZXRUaW1lb3V0KCgpID0+IHtcbiAgICByZW1vdmVDbGFzcyhib3gsICdzaG93Jyk7XG4gICAgc2V0VGltZW91dCgoKSA9PiB7XG4gICAgICBib3gucmVtb3ZlKCk7XG4gICAgICBpZiAoIWNvbnRhaW5lci5jaGlsZHJlbi5sZW5ndGgpIGNvbnRhaW5lci5yZW1vdmUoKTtcbiAgICB9LCAzMDApO1xuICB9LCBkdXJhdGlvbik7XG59XG5cbmV4cG9ydCB7IGFsZXJ0QVBJIH07XG4iLCAiLyoqXG4gKiBAZmlsZSBDb21wb25lbnQgdGVhcmRvd24gQVBJLlxuICovXG5cbmltcG9ydCB7IHJlZ2lzdHJ5IH0gZnJvbSAnLi4vY29yZS9yZWdpc3RyeS5qcyc7XG5pbXBvcnQgeyBsb2cgfSBmcm9tICcuLi91dGlscy9sb2dnZXIuanMnO1xuXG4vKipcbiAqIEBkZXNjcmlwdGlvbiBEZXN0cm95IGFuIGluaXRpYWxpemVkIGVsZW1lbnQgYW5kIHJlbW92ZSBsaXN0ZW5lcnMuXG4gKiBAcGFyYW0ge0hUTUxFbGVtZW50fSBlbFxuICogQHJldHVybnMge3ZvaWR9XG4gKi9cbmZ1bmN0aW9uIGRlc3Ryb3lBUEkoZWwpIHtcbiAgY29uc3QgaW5zdCA9IHJlZ2lzdHJ5Lmluc3RhbmNlcy5nZXQoZWwpO1xuICBpZiAoIWluc3QpIHJldHVybjtcblxuICBpbnN0LmhhbmRsZXJzLmZvckVhY2goKFt0YXJnZXQsIHR5cGUsIGhhbmRsZXJdKSA9PiB7XG4gICAgdGFyZ2V0LnJlbW92ZUV2ZW50TGlzdGVuZXIodHlwZSwgaGFuZGxlcik7XG4gIH0pO1xuXG4gIGVsLl9kZXNzZXJ0SW5pdGlhbGl6ZWQgPSBmYWxzZTtcbiAgcmVnaXN0cnkuaW5zdGFuY2VzLmRlbGV0ZShlbCk7XG4gIGxvZygnZGVzdHJveWVkOicsIGluc3QudHlwZSk7XG59XG5cbmV4cG9ydCB7IGRlc3Ryb3lBUEkgfTtcbiIsICIvKipcbiAqIEBmaWxlIFByZWZpeGVkIGRhdGEgYXR0cmlidXRlIGhlbHBlcnMuXG4gKi9cblxuaW1wb3J0IHsgUFJFRklYIH0gZnJvbSAnLi4vY29yZS9jb25zdGFudHMuanMnO1xuXG4vKipcbiAqIEBkZXNjcmlwdGlvbiBTZXQgYSBwcmVmaXhlZCBkYXRhIGF0dHJpYnV0ZS5cbiAqIEBwYXJhbSB7SFRNTEVsZW1lbnR9IGVsXG4gKiBAcGFyYW0ge3N0cmluZ30ga2V5XG4gKiBAcGFyYW0ge3N0cmluZ30gdmFsdWVcbiAqIEByZXR1cm5zIHtIVE1MRWxlbWVudH1cbiAqL1xuZnVuY3Rpb24gc2V0RGF0YShlbCwga2V5LCB2YWx1ZSkge1xuICBlbC5zZXRBdHRyaWJ1dGUoYGRhdGEtJHtQUkVGSVh9LSR7a2V5fWAsIHZhbHVlKTtcbiAgcmV0dXJuIGVsO1xufVxuXG4vKipcbiAqIEBkZXNjcmlwdGlvbiBHZXQgYSBwcmVmaXhlZCBkYXRhIGF0dHJpYnV0ZS5cbiAqIEBwYXJhbSB7SFRNTEVsZW1lbnR9IGVsXG4gKiBAcGFyYW0ge3N0cmluZ30ga2V5XG4gKiBAcmV0dXJucyB7P3N0cmluZ31cbiAqL1xuZnVuY3Rpb24gZ2V0RGF0YShlbCwga2V5KSB7XG4gIHJldHVybiBlbC5nZXRBdHRyaWJ1dGUoYGRhdGEtJHtQUkVGSVh9LSR7a2V5fWApO1xufVxuXG5leHBvcnQgeyBzZXREYXRhLCBnZXREYXRhIH07XG4iXSwKICAibWFwcGluZ3MiOiAiOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7OztBQ1NBLE1BQU0sVUFBVTtBQU9oQixNQUFNLFNBQVM7QUFP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

  return typeof DESSERT !== 'undefined' ? DESSERT : (typeof exports !== 'undefined' ? exports : {});
}));