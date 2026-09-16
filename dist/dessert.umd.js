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
    DessertController: () => DessertController,
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
    },
    /** @returns {*} */
    get controller() {
      return helpers.ctx.core?.controller;
    }
  };

  // src/utils/logger.js
  function log(...args) {
    if (helpers.options?.debug) console.log("[DESSERT]", ...args);
  }

  // src/core/controller.js
  var DessertController = class {
    /**
     * @param {Object} [ctx={}]
     */
    constructor(ctx = {}) {
      this.core = ctx.core || null;
      this._listeners = /* @__PURE__ */ new Map();
      this._state = /* @__PURE__ */ new Map();
      this._activeInstances = /* @__PURE__ */ new Set();
    }
    /**
     * Bind core instance reference.
     * @param {Object} core
     */
    bindCore(core) {
      this.core = core;
    }
    /**
     * Register an event listener (Pub/Sub).
     * @param {string} event
     * @param {Function} handler
     * @returns {() => void} Unsubscribe function
     */
    on(event, handler) {
      if (!this._listeners.has(event)) {
        this._listeners.set(event, /* @__PURE__ */ new Set());
      }
      this._listeners.get(event).add(handler);
      return () => this.off(event, handler);
    }
    /**
     * Remove an event listener.
     * @param {string} event
     * @param {Function} handler
     */
    off(event, handler) {
      const handlers = this._listeners.get(event);
      if (handlers) {
        handlers.delete(handler);
        if (handlers.size === 0) this._listeners.delete(event);
      }
    }
    /**
     * Emit an event to all subscribers.
     * @param {string} event
     * @param {*} [payload]
     */
    emit(event, payload) {
      const handlers = this._listeners.get(event);
      if (handlers) {
        handlers.forEach((fn) => {
          try {
            fn(payload);
          } catch (err) {
            console.error(`[DESSERT Controller] Error in listener for "${event}":`, err);
          }
        });
      }
      if (typeof window !== "undefined" && typeof window.dispatchEvent === "function" && typeof CustomEvent !== "undefined") {
        window.dispatchEvent(new CustomEvent(`dessert:${event}`, { detail: payload }));
      }
    }
    /**
     * Set global controller state key-value.
     * @param {string} key
     * @param {*} value
     */
    setState(key, value) {
      const prev = this._state.get(key);
      this._state.set(key, value);
      this.emit("state:change", { key, value, prev });
    }
    /**
     * Get controller state.
     * @param {string} key
     * @param {*} [fallback=null]
     * @returns {*}
     */
    getState(key, fallback = null) {
      return this._state.has(key) ? this._state.get(key) : fallback;
    }
    /**
     * Register an active component element in DOM.
     * @param {HTMLElement} el
     */
    registerInstance(el) {
      this._activeInstances.add(el);
      this.emit("instance:registered", { el });
    }
    /**
     * Unregister an active component element.
     * @param {HTMLElement} el
     */
    unregisterInstance(el) {
      this._activeInstances.delete(el);
      this.emit("instance:unregistered", { el });
    }
    /**
     * Close all active popups, dropdowns, and modals globally.
     */
    closeAll() {
      if (typeof document === "undefined") return;
      document.querySelectorAll(".dessert-modal.dessert-show").forEach((modal) => {
        this.core?.modal?.close(modal);
      });
      document.querySelectorAll(".dessert-dropdown-menu.dessert-show").forEach((menu) => {
        menu.classList.remove("dessert-show");
      });
      this.emit("dismiss:all");
    }
    /**
     * Refresh and re-run DOM component bindings.
     */
    refresh() {
      if (this.core) {
        this.core.autoInit?.();
        this.emit("lifecycle:refreshed");
      }
    }
    /**
     * Reset all controller listeners and states.
     */
    reset() {
      this._listeners.clear();
      this._state.clear();
      this._activeInstances.clear();
      this.emit("lifecycle:reset");
    }
  };

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
      this.controller = new DessertController({ core: this });
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
      this.controller.emit("init", { version: VERSION, options });
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
      helpers.controller?.emit("modal:open", { el, id: el.id });
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
      helpers.controller?.emit("modal:close", { el, id: el.id });
      log("modal close:", el.id);
    }
  };

  // src/api/alertAPI.js
  function alertAPI(msg, type = "info", duration = 3e3) {
    helpers.controller?.emit("alert:show", { message: msg, type, duration });
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
//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAic291cmNlcyI6IFsic3JjL2luZGV4LmpzIiwgInNyYy9jb3JlL2NvbnN0YW50cy5qcyIsICJzcmMvY29yZS9zdGF0ZS5qcyIsICJzcmMvY29yZS9yZWdpc3RyeS5qcyIsICJzcmMvdXRpbHMvYnJpZGdlLmpzIiwgInNyYy91dGlscy9sb2dnZXIuanMiLCAic3JjL2NvcmUvY29udHJvbGxlci5qcyIsICJzcmMvY29yZS9ERVNTRVJULmpzIiwgInNyYy91dGlscy9lc2NhcGUuanMiLCAic3JjL2NvbXBvbmVudHMvbW9kYWwuanMiLCAic3JjL3V0aWxzL2NsYXNzTmFtZXMuanMiLCAic3JjL2NvbXBvbmVudHMvZHJvcGRvd24uanMiLCAic3JjL2NvbXBvbmVudHMvdGFicy5qcyIsICJzcmMvY29tcG9uZW50cy9hY2NvcmRpb24uanMiLCAic3JjL2NvbXBvbmVudHMvY29tcG9uZW50cy5qcyIsICJzcmMvYXV0b2luaXQvYXV0b0luaXQuanMiLCAic3JjL2F1dG9pbml0L2VzY2FwZUtleS5qcyIsICJzcmMvdXRpbHMvdXJsLmpzIiwgInNyYy9pbmplY3QvaW5qZWN0Q1NTLmpzIiwgInNyYy9pbmplY3QvaW5qZWN0TG9hZGVyLmpzIiwgInNyYy9hcGkvbW9kYWxBUEkuanMiLCAic3JjL2FwaS9hbGVydEFQSS5qcyIsICJzcmMvYXBpL2Rlc3Ryb3lBUEkuanMiLCAic3JjL3V0aWxzL2F0dHJpYnV0ZXMuanMiXSwKICAic291cmNlc0NvbnRlbnQiOiBbIi8qKlxuICogQGZpbGUgREVTU0VSVCBtYWluIGVudHJ5IFx1MjAxNCB0aGUgb25seSBpbmRleC5qcyBpbiB0aGUgcHJvamVjdC5cbiAqL1xuXG5pbXBvcnQgeyBERVNTRVJUIH0gZnJvbSAnLi9jb3JlL0RFU1NFUlQuanMnO1xuaW1wb3J0IHsgRGVzc2VydENvbnRyb2xsZXIgfSBmcm9tICcuL2NvcmUvY29udHJvbGxlci5qcyc7XG5pbXBvcnQgeyBjb21wb25lbnRzIH0gZnJvbSAnLi9jb21wb25lbnRzL2NvbXBvbmVudHMuanMnO1xuaW1wb3J0IHsgYXV0b0luaXQgfSBmcm9tICcuL2F1dG9pbml0L2F1dG9Jbml0LmpzJztcbmltcG9ydCB7IGJpbmRFc2NhcGVLZXkgfSBmcm9tICcuL2F1dG9pbml0L2VzY2FwZUtleS5qcyc7XG5pbXBvcnQgeyBpbmplY3RDU1MgfSBmcm9tICcuL2luamVjdC9pbmplY3RDU1MuanMnO1xuaW1wb3J0IHsgaW5qZWN0TG9hZGVyIH0gZnJvbSAnLi9pbmplY3QvaW5qZWN0TG9hZGVyLmpzJztcbmltcG9ydCB7IG1vZGFsQVBJIH0gZnJvbSAnLi9hcGkvbW9kYWxBUEkuanMnO1xuaW1wb3J0IHsgYWxlcnRBUEkgfSBmcm9tICcuL2FwaS9hbGVydEFQSS5qcyc7XG5pbXBvcnQgeyBkZXN0cm95QVBJIH0gZnJvbSAnLi9hcGkvZGVzdHJveUFQSS5qcyc7XG5pbXBvcnQgeyBhZGRDbGFzcywgcmVtb3ZlQ2xhc3MsIHRvZ2dsZUNsYXNzIH0gZnJvbSAnLi91dGlscy9jbGFzc05hbWVzLmpzJztcbmltcG9ydCB7IHNldERhdGEsIGdldERhdGEgfSBmcm9tICcuL3V0aWxzL2F0dHJpYnV0ZXMuanMnO1xuXG4vKiAxLiBhdHRhY2ggcHVibGljIEFQSSBvbnRvIHByb3RvdHlwZSAqL1xuREVTU0VSVC5wcm90b3R5cGUuY29tcG9uZW50cyAgPSBjb21wb25lbnRzO1xuREVTU0VSVC5wcm90b3R5cGUubW9kYWwgICAgICAgPSBtb2RhbEFQSTtcbkRFU1NFUlQucHJvdG90eXBlLmFsZXJ0ICAgICAgID0gYWxlcnRBUEk7XG5ERVNTRVJULnByb3RvdHlwZS5kZXN0cm95ICAgICA9IGRlc3Ryb3lBUEk7XG5ERVNTRVJULnByb3RvdHlwZS5hdXRvSW5pdCAgICA9IGF1dG9Jbml0O1xuREVTU0VSVC5wcm90b3R5cGUuYWRkQ2xhc3MgICAgPSBhZGRDbGFzcztcbkRFU1NFUlQucHJvdG90eXBlLnJlbW92ZUNsYXNzID0gcmVtb3ZlQ2xhc3M7XG5ERVNTRVJULnByb3RvdHlwZS50b2dnbGVDbGFzcyA9IHRvZ2dsZUNsYXNzO1xuREVTU0VSVC5wcm90b3R5cGUuc2V0RGF0YSAgICAgPSBzZXREYXRhO1xuREVTU0VSVC5wcm90b3R5cGUuZ2V0RGF0YSAgICAgPSBnZXREYXRhO1xuXG4vKipcbiAqIEBkZXNjcmlwdGlvbiBTaW5nbGV0b24gREVTU0VSVCBpbnN0YW5jZS5cbiAqIEB0eXBlIHtERVNTRVJUfVxuICovXG5jb25zdCBERVNTRVJUX0lOU1RBTkNFID0gbmV3IERFU1NFUlQoKTtcblxuLyogMi4gc2lkZSBlZmZlY3RzOiBpbmplY3QgYXNzZXRzICYgYXV0by1ib290ICovXG5pZiAodHlwZW9mIGRvY3VtZW50ICE9PSAndW5kZWZpbmVkJykge1xuICBpbmplY3RDU1MoKTtcbiAgaW5qZWN0TG9hZGVyKCk7XG5cbiAgY29uc3QgYm9vdCA9ICgpID0+IHtcbiAgICBERVNTRVJUX0lOU1RBTkNFLmluaXQoKTtcbiAgICBiaW5kRXNjYXBlS2V5KERFU1NFUlRfSU5TVEFOQ0UpO1xuICB9O1xuXG4gIGlmIChkb2N1bWVudC5yZWFkeVN0YXRlID09PSAnbG9hZGluZycpIHtcbiAgICBkb2N1bWVudC5hZGRFdmVudExpc3RlbmVyKCdET01Db250ZW50TG9hZGVkJywgYm9vdCk7XG4gIH0gZWxzZSB7XG4gICAgYm9vdCgpO1xuICB9XG59XG5cbmV4cG9ydCB7IERFU1NFUlQsIERFU1NFUlRfSU5TVEFOQ0UsIERlc3NlcnRDb250cm9sbGVyIH07XG5leHBvcnQgeyBERVNTRVJUX0lOU1RBTkNFIGFzIGRlZmF1bHQgfTtcbiIsICIvKipcbiAqIEBmaWxlIENvbnN0YW50cyBmb3IgREVTU0VSVCBjb3JlLlxuICovXG5cbi8qKlxuICogQGRlc2NyaXB0aW9uIExpYnJhcnkgdmVyc2lvbi5cbiAqIEB0eXBlIHtzdHJpbmd9XG4gKiBAY29uc3RhbnRcbiAqL1xuY29uc3QgVkVSU0lPTiA9ICcyLjAuMCc7XG5cbi8qKlxuICogQGRlc2NyaXB0aW9uIENTUyBwcmVmaXggdXNlZCBhY3Jvc3MgdGhlIGxpYnJhcnkuXG4gKiBAdHlwZSB7c3RyaW5nfVxuICogQGNvbnN0YW50XG4gKi9cbmNvbnN0IFBSRUZJWCA9ICdkZXNzZXJ0JztcblxuLyoqXG4gKiBAZGVzY3JpcHRpb24gRGF0YSBhdHRyaWJ1dGUgdXNlZCBmb3IgYXV0by1pbml0LlxuICogQHR5cGUge3N0cmluZ31cbiAqIEBjb25zdGFudFxuICovXG5jb25zdCBEQVRBX0FUVFIgPSAnZGF0YS1kZXNzZXJ0JztcblxuLyoqXG4gKiBAdHlwZWRlZiB7T2JqZWN0fSBEZXNzZXJ0T3B0aW9uc1xuICogQHByb3BlcnR5IHtib29sZWFufSBbYXV0b0luaXQ9dHJ1ZV1cbiAqIEBwcm9wZXJ0eSB7Ym9vbGVhbn0gW2RlYnVnPWZhbHNlXVxuICogQHByb3BlcnR5IHtib29sZWFufSBbY2xvc2VPbkVzY2FwZT10cnVlXVxuICovXG5cbi8qKlxuICogQGRlc2NyaXB0aW9uIERlZmF1bHQgb3B0aW9ucyBmb3IgREVTU0VSVC5cbiAqIEB0eXBlIHtSZWFkb25seTxEZXNzZXJ0T3B0aW9ucz59XG4gKiBAY29uc3RhbnRcbiAqL1xuY29uc3QgREVGQVVMVF9PUFRJT05TID0gT2JqZWN0LmZyZWV6ZSh7XG4gIGF1dG9Jbml0OiB0cnVlLFxuICBkZWJ1ZzogZmFsc2UsXG4gIGNsb3NlT25Fc2NhcGU6IHRydWUsXG59KTtcblxuZXhwb3J0IHsgVkVSU0lPTiwgUFJFRklYLCBEQVRBX0FUVFIsIERFRkFVTFRfT1BUSU9OUyB9O1xuIiwgIi8qKlxuICogQGZpbGUgU2hhcmVkIG11dGFibGUgc3RhdGUuXG4gKi9cblxuLyoqXG4gKiBAdHlwZWRlZiB7T2JqZWN0fSBEZXNzZXJ0U3RhdGVcbiAqIEBwcm9wZXJ0eSB7Ym9vbGVhbn0gZXNjQm91bmRcbiAqIEBwcm9wZXJ0eSB7SFRNTEVsZW1lbnR8bnVsbH0gbGFzdEZvY3VzZWRcbiAqL1xuXG4vKipcbiAqIEBkZXNjcmlwdGlvbiBHbG9iYWwgcnVudGltZSBzdGF0ZS5cbiAqIEB0eXBlIHtEZXNzZXJ0U3RhdGV9XG4gKi9cbmNvbnN0IHN0YXRlID0ge1xuICBlc2NCb3VuZDogZmFsc2UsXG4gIGxhc3RGb2N1c2VkOiBudWxsLFxufTtcblxuLyoqXG4gKiBAZGVzY3JpcHRpb24gR2xvYmFsIG9wdGlvbnMgbXV0YXRlZCBieSBERVNTRVJULmluaXQoKS5cbiAqIEB0eXBlIHtPYmplY3Q8c3RyaW5nLCAqPn1cbiAqL1xuY29uc3Qgb3B0aW9ucyA9IHt9O1xuXG5leHBvcnQgeyBzdGF0ZSwgb3B0aW9ucyB9O1xuIiwgIi8qKlxuICogQGZpbGUgSW50ZXJuYWwgcGx1Z2luIGFuZCBpbnN0YW5jZSByZWdpc3RyaWVzLlxuICovXG5cbi8qKlxuICogQHR5cGVkZWYge09iamVjdH0gSW5zdGFuY2VSZWNvcmRcbiAqIEBwcm9wZXJ0eSB7c3RyaW5nfSB0eXBlXG4gKiBAcHJvcGVydHkge0FycmF5PFtFdmVudFRhcmdldCwgc3RyaW5nLCBFdmVudExpc3RlbmVyXT59IGhhbmRsZXJzXG4gKi9cblxuLyoqXG4gKiBAdHlwZWRlZiB7T2JqZWN0fSBEZXNzZXJ0UmVnaXN0cnlcbiAqIEBwcm9wZXJ0eSB7TWFwPHN0cmluZywgKj59IHBsdWdpbnNcbiAqIEBwcm9wZXJ0eSB7V2Vha01hcDxIVE1MRWxlbWVudCwgSW5zdGFuY2VSZWNvcmQ+fSBpbnN0YW5jZXNcbiAqL1xuXG4vKipcbiAqIEBkZXNjcmlwdGlvbiBQbHVnaW4gYW5kIGluc3RhbmNlIHJlZ2lzdHJpZXMuXG4gKiBAdHlwZSB7RGVzc2VydFJlZ2lzdHJ5fVxuICovXG5jb25zdCByZWdpc3RyeSA9IHtcbiAgcGx1Z2luczogbmV3IE1hcCgpLFxuICBpbnN0YW5jZXM6IG5ldyBXZWFrTWFwKCksXG59O1xuXG5leHBvcnQgeyByZWdpc3RyeSB9O1xuIiwgIi8qKlxuICogQGZpbGUgSW50ZXJuYWwgREkgYnJpZGdlIGZvciBwcml2YXRlIHN0YXRlIGFjY2Vzcy5cbiAqL1xuXG4vKipcbiAqIEB0eXBlZGVmIHtPYmplY3R9IEhlbHBlckNvbnRleHRcbiAqIEBwcm9wZXJ0eSB7Kn0gY29yZVxuICogQHByb3BlcnR5IHtPYmplY3Q8c3RyaW5nLCAqPn0gb3B0aW9uc1xuICogQHByb3BlcnR5IHsqfSBzdGF0ZVxuICogQHByb3BlcnR5IHsqfSByZWdpc3RyeVxuICovXG5cbi8qKlxuICogQHByaXZhdGVcbiAqIEB0eXBlIHtIZWxwZXJDb250ZXh0fG51bGx9XG4gKi9cbmxldCBfY3R4ID0gbnVsbDtcblxuY29uc3QgaGVscGVycyA9IHtcbiAgLyoqXG4gICAqIEBkZXNjcmlwdGlvbiBCaW5kIHByaXZhdGUgY29udGV4dCBvbmNlIGZyb20gdGhlIERFU1NFUlQgY29uc3RydWN0b3IuXG4gICAqIEBwYXJhbSB7SGVscGVyQ29udGV4dH0gY3R4XG4gICAqIEByZXR1cm5zIHt2b2lkfVxuICAgKi9cbiAgYmluZChjdHgpIHsgX2N0eCA9IGN0eDsgfSxcblxuICAvKipcbiAgICogQGRlc2NyaXB0aW9uIFJldHJpZXZlIHRoZSBjdXJyZW50IGhlbHBlciBjb250ZXh0LlxuICAgKiBAcmV0dXJucyB7SGVscGVyQ29udGV4dH1cbiAgICovXG4gIGdldCBjdHgoKSB7XG4gICAgaWYgKCFfY3R4KSB0aHJvdyBuZXcgRXJyb3IoJ1tERVNTRVJUXSBoZWxwZXJzIG5vdCBib3VuZCB5ZXQnKTtcbiAgICByZXR1cm4gX2N0eDtcbiAgfSxcblxuICAvKiogQHJldHVybnMgeyp9ICovXG4gIGdldCBjb3JlKCkgICAgIHsgcmV0dXJuIGhlbHBlcnMuY3R4LmNvcmU7IH0sXG5cbiAgLyoqIEByZXR1cm5zIHtPYmplY3Q8c3RyaW5nLCAqPn0gKi9cbiAgZ2V0IG9wdGlvbnMoKSAgeyByZXR1cm4gaGVscGVycy5jdHgub3B0aW9uczsgfSxcblxuICAvKiogQHJldHVybnMgeyp9ICovXG4gIGdldCBzdGF0ZSgpICAgIHsgcmV0dXJuIGhlbHBlcnMuY3R4LnN0YXRlOyB9LFxuXG4gIC8qKiBAcmV0dXJucyB7Kn0gKi9cbiAgZ2V0IHJlZ2lzdHJ5KCkgeyByZXR1cm4gaGVscGVycy5jdHgucmVnaXN0cnk7IH0sXG5cbiAgLyoqIEByZXR1cm5zIHsqfSAqL1xuICBnZXQgY29udHJvbGxlcigpIHsgcmV0dXJuIGhlbHBlcnMuY3R4LmNvcmU/LmNvbnRyb2xsZXI7IH0sXG59O1xuXG5leHBvcnQgeyBoZWxwZXJzIH07XG4iLCAiLyoqXG4gKiBAZmlsZSBEZWJ1ZyBsb2dnZXIuXG4gKi9cblxuaW1wb3J0IHsgaGVscGVycyB9IGZyb20gJy4vYnJpZGdlLmpzJztcblxuLyoqXG4gKiBAZGVzY3JpcHRpb24gTG9nIGEgbWVzc2FnZSB3aGVuIGRlYnVnIG1vZGUgaXMgZW5hYmxlZC5cbiAqIEBwYXJhbSB7Li4uKn0gYXJnc1xuICogQHJldHVybnMge3ZvaWR9XG4gKi9cbmZ1bmN0aW9uIGxvZyguLi5hcmdzKSB7XG4gIGlmIChoZWxwZXJzLm9wdGlvbnM/LmRlYnVnKSBjb25zb2xlLmxvZygnW0RFU1NFUlRdJywgLi4uYXJncyk7XG59XG5cbmV4cG9ydCB7IGxvZyB9O1xuIiwgIi8qKlxuICogQGZpbGUgREVTU0VSVCBDb250cm9sbGVyIFx1MjAxNCBDZW50cmFsaXplZCBFdmVudCBCdXMsIENvbXBvbmVudCBMaWZlY3ljbGUsICYgU3RhdGUgSHViLlxuICovXG5cbmNsYXNzIERlc3NlcnRDb250cm9sbGVyIHtcbiAgLyoqXG4gICAqIEBwYXJhbSB7T2JqZWN0fSBbY3R4PXt9XVxuICAgKi9cbiAgY29uc3RydWN0b3IoY3R4ID0ge30pIHtcbiAgICAvKiogQHR5cGUge2ltcG9ydCgnLi9ERVNTRVJULmpzJykuREVTU0VSVHxudWxsfSAqL1xuICAgIHRoaXMuY29yZSA9IGN0eC5jb3JlIHx8IG51bGw7XG4gICAgLyoqIEB0eXBlIHtNYXA8c3RyaW5nLCBTZXQ8RnVuY3Rpb24+Pn0gKi9cbiAgICB0aGlzLl9saXN0ZW5lcnMgPSBuZXcgTWFwKCk7XG4gICAgLyoqIEB0eXBlIHtNYXA8c3RyaW5nLCBhbnk+fSAqL1xuICAgIHRoaXMuX3N0YXRlID0gbmV3IE1hcCgpO1xuICAgIC8qKiBAdHlwZSB7U2V0PEhUTUxFbGVtZW50Pn0gKi9cbiAgICB0aGlzLl9hY3RpdmVJbnN0YW5jZXMgPSBuZXcgU2V0KCk7XG4gIH1cblxuICAvKipcbiAgICogQmluZCBjb3JlIGluc3RhbmNlIHJlZmVyZW5jZS5cbiAgICogQHBhcmFtIHtPYmplY3R9IGNvcmVcbiAgICovXG4gIGJpbmRDb3JlKGNvcmUpIHtcbiAgICB0aGlzLmNvcmUgPSBjb3JlO1xuICB9XG5cbiAgLyoqXG4gICAqIFJlZ2lzdGVyIGFuIGV2ZW50IGxpc3RlbmVyIChQdWIvU3ViKS5cbiAgICogQHBhcmFtIHtzdHJpbmd9IGV2ZW50XG4gICAqIEBwYXJhbSB7RnVuY3Rpb259IGhhbmRsZXJcbiAgICogQHJldHVybnMgeygpID0+IHZvaWR9IFVuc3Vic2NyaWJlIGZ1bmN0aW9uXG4gICAqL1xuICBvbihldmVudCwgaGFuZGxlcikge1xuICAgIGlmICghdGhpcy5fbGlzdGVuZXJzLmhhcyhldmVudCkpIHtcbiAgICAgIHRoaXMuX2xpc3RlbmVycy5zZXQoZXZlbnQsIG5ldyBTZXQoKSk7XG4gICAgfVxuICAgIHRoaXMuX2xpc3RlbmVycy5nZXQoZXZlbnQpLmFkZChoYW5kbGVyKTtcbiAgICByZXR1cm4gKCkgPT4gdGhpcy5vZmYoZXZlbnQsIGhhbmRsZXIpO1xuICB9XG5cbiAgLyoqXG4gICAqIFJlbW92ZSBhbiBldmVudCBsaXN0ZW5lci5cbiAgICogQHBhcmFtIHtzdHJpbmd9IGV2ZW50XG4gICAqIEBwYXJhbSB7RnVuY3Rpb259IGhhbmRsZXJcbiAgICovXG4gIG9mZihldmVudCwgaGFuZGxlcikge1xuICAgIGNvbnN0IGhhbmRsZXJzID0gdGhpcy5fbGlzdGVuZXJzLmdldChldmVudCk7XG4gICAgaWYgKGhhbmRsZXJzKSB7XG4gICAgICBoYW5kbGVycy5kZWxldGUoaGFuZGxlcik7XG4gICAgICBpZiAoaGFuZGxlcnMuc2l6ZSA9PT0gMCkgdGhpcy5fbGlzdGVuZXJzLmRlbGV0ZShldmVudCk7XG4gICAgfVxuICB9XG5cbiAgLyoqXG4gICAqIEVtaXQgYW4gZXZlbnQgdG8gYWxsIHN1YnNjcmliZXJzLlxuICAgKiBAcGFyYW0ge3N0cmluZ30gZXZlbnRcbiAgICogQHBhcmFtIHsqfSBbcGF5bG9hZF1cbiAgICovXG4gIGVtaXQoZXZlbnQsIHBheWxvYWQpIHtcbiAgICBjb25zdCBoYW5kbGVycyA9IHRoaXMuX2xpc3RlbmVycy5nZXQoZXZlbnQpO1xuICAgIGlmIChoYW5kbGVycykge1xuICAgICAgaGFuZGxlcnMuZm9yRWFjaCgoZm4pID0+IHtcbiAgICAgICAgdHJ5IHtcbiAgICAgICAgICBmbihwYXlsb2FkKTtcbiAgICAgICAgfSBjYXRjaCAoZXJyKSB7XG4gICAgICAgICAgY29uc29sZS5lcnJvcihgW0RFU1NFUlQgQ29udHJvbGxlcl0gRXJyb3IgaW4gbGlzdGVuZXIgZm9yIFwiJHtldmVudH1cIjpgLCBlcnIpO1xuICAgICAgICB9XG4gICAgICB9KTtcbiAgICB9XG4gICAgLy8gQWxzbyBkaXNwYXRjaCBhcyBhIG5hdGl2ZSBDdXN0b21FdmVudCBvbiB3aW5kb3cgZm9yIGV4dGVybmFsIGludGVncmF0aW9uc1xuICAgIGlmICh0eXBlb2Ygd2luZG93ICE9PSAndW5kZWZpbmVkJyAmJiB0eXBlb2Ygd2luZG93LmRpc3BhdGNoRXZlbnQgPT09ICdmdW5jdGlvbicgJiYgdHlwZW9mIEN1c3RvbUV2ZW50ICE9PSAndW5kZWZpbmVkJykge1xuICAgICAgd2luZG93LmRpc3BhdGNoRXZlbnQobmV3IEN1c3RvbUV2ZW50KGBkZXNzZXJ0OiR7ZXZlbnR9YCwgeyBkZXRhaWw6IHBheWxvYWQgfSkpO1xuICAgIH1cbiAgfVxuXG4gIC8qKlxuICAgKiBTZXQgZ2xvYmFsIGNvbnRyb2xsZXIgc3RhdGUga2V5LXZhbHVlLlxuICAgKiBAcGFyYW0ge3N0cmluZ30ga2V5XG4gICAqIEBwYXJhbSB7Kn0gdmFsdWVcbiAgICovXG4gIHNldFN0YXRlKGtleSwgdmFsdWUpIHtcbiAgICBjb25zdCBwcmV2ID0gdGhpcy5fc3RhdGUuZ2V0KGtleSk7XG4gICAgdGhpcy5fc3RhdGUuc2V0KGtleSwgdmFsdWUpO1xuICAgIHRoaXMuZW1pdCgnc3RhdGU6Y2hhbmdlJywgeyBrZXksIHZhbHVlLCBwcmV2IH0pO1xuICB9XG5cbiAgLyoqXG4gICAqIEdldCBjb250cm9sbGVyIHN0YXRlLlxuICAgKiBAcGFyYW0ge3N0cmluZ30ga2V5XG4gICAqIEBwYXJhbSB7Kn0gW2ZhbGxiYWNrPW51bGxdXG4gICAqIEByZXR1cm5zIHsqfVxuICAgKi9cbiAgZ2V0U3RhdGUoa2V5LCBmYWxsYmFjayA9IG51bGwpIHtcbiAgICByZXR1cm4gdGhpcy5fc3RhdGUuaGFzKGtleSkgPyB0aGlzLl9zdGF0ZS5nZXQoa2V5KSA6IGZhbGxiYWNrO1xuICB9XG5cbiAgLyoqXG4gICAqIFJlZ2lzdGVyIGFuIGFjdGl2ZSBjb21wb25lbnQgZWxlbWVudCBpbiBET00uXG4gICAqIEBwYXJhbSB7SFRNTEVsZW1lbnR9IGVsXG4gICAqL1xuICByZWdpc3Rlckluc3RhbmNlKGVsKSB7XG4gICAgdGhpcy5fYWN0aXZlSW5zdGFuY2VzLmFkZChlbCk7XG4gICAgdGhpcy5lbWl0KCdpbnN0YW5jZTpyZWdpc3RlcmVkJywgeyBlbCB9KTtcbiAgfVxuXG4gIC8qKlxuICAgKiBVbnJlZ2lzdGVyIGFuIGFjdGl2ZSBjb21wb25lbnQgZWxlbWVudC5cbiAgICogQHBhcmFtIHtIVE1MRWxlbWVudH0gZWxcbiAgICovXG4gIHVucmVnaXN0ZXJJbnN0YW5jZShlbCkge1xuICAgIHRoaXMuX2FjdGl2ZUluc3RhbmNlcy5kZWxldGUoZWwpO1xuICAgIHRoaXMuZW1pdCgnaW5zdGFuY2U6dW5yZWdpc3RlcmVkJywgeyBlbCB9KTtcbiAgfVxuXG4gIC8qKlxuICAgKiBDbG9zZSBhbGwgYWN0aXZlIHBvcHVwcywgZHJvcGRvd25zLCBhbmQgbW9kYWxzIGdsb2JhbGx5LlxuICAgKi9cbiAgY2xvc2VBbGwoKSB7XG4gICAgaWYgKHR5cGVvZiBkb2N1bWVudCA9PT0gJ3VuZGVmaW5lZCcpIHJldHVybjtcblxuICAgIC8vIENsb3NlIGFsbCBvcGVuIG1vZGFsc1xuICAgIGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3JBbGwoJy5kZXNzZXJ0LW1vZGFsLmRlc3NlcnQtc2hvdycpLmZvckVhY2goKG1vZGFsKSA9PiB7XG4gICAgICB0aGlzLmNvcmU/Lm1vZGFsPy5jbG9zZShtb2RhbCk7XG4gICAgfSk7XG5cbiAgICAvLyBDbG9zZSBhbGwgb3BlbiBkcm9wZG93biBtZW51c1xuICAgIGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3JBbGwoJy5kZXNzZXJ0LWRyb3Bkb3duLW1lbnUuZGVzc2VydC1zaG93JykuZm9yRWFjaCgobWVudSkgPT4ge1xuICAgICAgbWVudS5jbGFzc0xpc3QucmVtb3ZlKCdkZXNzZXJ0LXNob3cnKTtcbiAgICB9KTtcblxuICAgIHRoaXMuZW1pdCgnZGlzbWlzczphbGwnKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBSZWZyZXNoIGFuZCByZS1ydW4gRE9NIGNvbXBvbmVudCBiaW5kaW5ncy5cbiAgICovXG4gIHJlZnJlc2goKSB7XG4gICAgaWYgKHRoaXMuY29yZSkge1xuICAgICAgdGhpcy5jb3JlLmF1dG9Jbml0Py4oKTtcbiAgICAgIHRoaXMuZW1pdCgnbGlmZWN5Y2xlOnJlZnJlc2hlZCcpO1xuICAgIH1cbiAgfVxuXG4gIC8qKlxuICAgKiBSZXNldCBhbGwgY29udHJvbGxlciBsaXN0ZW5lcnMgYW5kIHN0YXRlcy5cbiAgICovXG4gIHJlc2V0KCkge1xuICAgIHRoaXMuX2xpc3RlbmVycy5jbGVhcigpO1xuICAgIHRoaXMuX3N0YXRlLmNsZWFyKCk7XG4gICAgdGhpcy5fYWN0aXZlSW5zdGFuY2VzLmNsZWFyKCk7XG4gICAgdGhpcy5lbWl0KCdsaWZlY3ljbGU6cmVzZXQnKTtcbiAgfVxufVxuXG5leHBvcnQgeyBEZXNzZXJ0Q29udHJvbGxlciB9O1xuIiwgIi8qKlxuICogQGZpbGUgQ29yZSBERVNTRVJUIGNsYXNzLlxuICovXG5cbmltcG9ydCB7IFZFUlNJT04sIFBSRUZJWCwgREVGQVVMVF9PUFRJT05TIH0gZnJvbSAnLi9jb25zdGFudHMuanMnO1xuaW1wb3J0IHsgc3RhdGUsIG9wdGlvbnMgfSBmcm9tICcuL3N0YXRlLmpzJztcbmltcG9ydCB7IHJlZ2lzdHJ5IH0gZnJvbSAnLi9yZWdpc3RyeS5qcyc7XG5pbXBvcnQgeyBoZWxwZXJzIH0gZnJvbSAnLi4vdXRpbHMvYnJpZGdlLmpzJztcbmltcG9ydCB7IGxvZyB9IGZyb20gJy4uL3V0aWxzL2xvZ2dlci5qcyc7XG5pbXBvcnQgeyBEZXNzZXJ0Q29udHJvbGxlciB9IGZyb20gJy4vY29udHJvbGxlci5qcyc7XG5cbi8qKlxuICogQHR5cGVkZWYge09iamVjdH0gRGVzc2VydENvbmZpZ1xuICogQHByb3BlcnR5IHtib29sZWFufSBbYXV0b0luaXRdXG4gKiBAcHJvcGVydHkge2Jvb2xlYW59IFtkZWJ1Z11cbiAqIEBwcm9wZXJ0eSB7Ym9vbGVhbn0gW2Nsb3NlT25Fc2NhcGVdXG4gKiBAcHJvcGVydHkge2Jvb2xlYW59IFtmb3JjZV1cbiAqL1xuXG4vKipcbiAqIEBkZXNjcmlwdGlvbiBDb3JlIERFU1NFUlQgY2xhc3MuXG4gKi9cbmNsYXNzIERFU1NFUlQge1xuICAvKipcbiAgICogQHByaXZhdGVcbiAgICogQHR5cGUge0RFU1NFUlR8bnVsbH1cbiAgICovXG4gIHN0YXRpYyAjaW5zdGFuY2UgPSBudWxsO1xuXG4gIC8qKlxuICAgKiBAZGVzY3JpcHRpb24gTGlicmFyeSB2ZXJzaW9uLlxuICAgKiBAcmV0dXJucyB7c3RyaW5nfVxuICAgKi9cbiAgc3RhdGljIGdldCB2ZXJzaW9uKCkgeyByZXR1cm4gVkVSU0lPTjsgfVxuXG4gIC8qKlxuICAgKiBAZGVzY3JpcHRpb24gQ3JlYXRlIGEgZnJlc2ggaW5zdGFuY2UgYnlwYXNzaW5nIHNpbmdsZXRvbi5cbiAgICogQHBhcmFtIHtEZXNzZXJ0Q29uZmlnfSBbY2ZnPXt9XVxuICAgKiBAcmV0dXJucyB7REVTU0VSVH1cbiAgICovXG4gIHN0YXRpYyBjcmVhdGUoY2ZnID0ge30pIHtcbiAgICByZXR1cm4gbmV3IERFU1NFUlQoeyAuLi5jZmcsIGZvcmNlOiB0cnVlIH0pO1xuICB9XG5cbiAgLyoqXG4gICAqIEBwYXJhbSB7RGVzc2VydENvbmZpZ30gW2NmZz17fV1cbiAgICovXG4gIGNvbnN0cnVjdG9yKGNmZyA9IHt9KSB7XG4gICAgaWYgKERFU1NFUlQuI2luc3RhbmNlICYmICFjZmcuZm9yY2UpIHJldHVybiBERVNTRVJULiNpbnN0YW5jZTtcblxuICAgIE9iamVjdC5hc3NpZ24ob3B0aW9ucywgREVGQVVMVF9PUFRJT05TLCBjZmcpO1xuXG4gICAgLyoqXG4gICAgICogQGRlc2NyaXB0aW9uIExpYnJhcnkgdmVyc2lvbi5cbiAgICAgKiBAdHlwZSB7c3RyaW5nfVxuICAgICAqL1xuICAgIHRoaXMudmVyc2lvbiA9IFZFUlNJT047XG5cbiAgICAvKipcbiAgICAgKiBAZGVzY3JpcHRpb24gQ1NTIHByZWZpeC5cbiAgICAgKiBAdHlwZSB7c3RyaW5nfVxuICAgICAqL1xuICAgIHRoaXMucHJlZml4ID0gUFJFRklYO1xuXG4gICAgaGVscGVycy5iaW5kKHsgY29yZTogdGhpcywgb3B0aW9ucywgc3RhdGUsIHJlZ2lzdHJ5IH0pO1xuXG4gICAgLyoqXG4gICAgICogQGRlc2NyaXB0aW9uIENlbnRyYWxpemVkIGNvbnRyb2xsZXIgYW5kIGV2ZW50IGJ1cy5cbiAgICAgKiBAdHlwZSB7RGVzc2VydENvbnRyb2xsZXJ9XG4gICAgICovXG4gICAgdGhpcy5jb250cm9sbGVyID0gbmV3IERlc3NlcnRDb250cm9sbGVyKHsgY29yZTogdGhpcyB9KTtcblxuICAgIERFU1NFUlQuI2luc3RhbmNlID0gdGhpcztcbiAgfVxuXG4gIC8qKlxuICAgKiBAZGVzY3JpcHRpb24gSW5pdGlhbGl6ZSB0aGUgbGlicmFyeS5cbiAgICogQHBhcmFtIHtEZXNzZXJ0Q29uZmlnfSBbZXh0cmE9e31dXG4gICAqIEByZXR1cm5zIHtERVNTRVJUfVxuICAgKi9cbiAgaW5pdChleHRyYSA9IHt9KSB7XG4gICAgT2JqZWN0LmFzc2lnbihvcHRpb25zLCBleHRyYSk7XG5cbiAgICBpZiAob3B0aW9ucy5hdXRvSW5pdCkgdGhpcy5hdXRvSW5pdCgpO1xuXG4gICAgcmVnaXN0cnkucGx1Z2lucy5mb3JFYWNoKChwbHVnaW4pID0+IHBsdWdpbi5pbml0Py4odGhpcykpO1xuXG4gICAgdGhpcy5jb250cm9sbGVyLmVtaXQoJ2luaXQnLCB7IHZlcnNpb246IFZFUlNJT04sIG9wdGlvbnMgfSk7XG5cbiAgICBsb2coYERFU1NFUlQgdiR7VkVSU0lPTn0gaW5pdGlhbGl6ZWRgKTtcbiAgICByZXR1cm4gdGhpcztcbiAgfVxuXG4gIC8qKlxuICAgKiBAZGVzY3JpcHRpb24gUmVnaXN0ZXIgYSBwbHVnaW4uXG4gICAqIEBwYXJhbSB7c3RyaW5nfSBuYW1lXG4gICAqIEBwYXJhbSB7Kn0gcGx1Z2luXG4gICAqIEByZXR1cm5zIHtERVNTRVJUfVxuICAgKi9cbiAgcmVnaXN0ZXIobmFtZSwgcGx1Z2luKSB7XG4gICAgaWYgKHJlZ2lzdHJ5LnBsdWdpbnMuaGFzKG5hbWUpKSByZXR1cm4gdGhpcztcbiAgICByZWdpc3RyeS5wbHVnaW5zLnNldChuYW1lLCBwbHVnaW4pO1xuICAgIHBsdWdpbi5pbnN0YWxsPy4odGhpcywgaGVscGVycyk7XG4gICAgbG9nKCdwbHVnaW4gcmVnaXN0ZXJlZDonLCBuYW1lKTtcbiAgICByZXR1cm4gdGhpcztcbiAgfVxuXG4gIC8qKlxuICAgKiBAZGVzY3JpcHRpb24gUmVnaXN0ZXIgYW5kIGluaXQgYSBwbHVnaW4uXG4gICAqIEBwYXJhbSB7Kn0gcGx1Z2luXG4gICAqIEByZXR1cm5zIHtERVNTRVJUfVxuICAgKi9cbiAgdXNlKHBsdWdpbikge1xuICAgIGlmICghcGx1Z2luPy5uYW1lKSByZXR1cm4gdGhpcztcbiAgICB0aGlzLnJlZ2lzdGVyKHBsdWdpbi5uYW1lLCBwbHVnaW4pO1xuICAgIHBsdWdpbi5pbml0Py4odGhpcyk7XG4gICAgcmV0dXJuIHRoaXM7XG4gIH1cbn1cblxuZXhwb3J0IHsgREVTU0VSVCB9O1xuIiwgIi8qKlxuICogQGZpbGUgQ1NTIHNlbGVjdG9yIGVzY2FwaW5nLlxuICovXG5cbi8qKlxuICogQGRlc2NyaXB0aW9uIEVzY2FwZSBhIHN0cmluZyBmb3IgQ1NTIHNlbGVjdG9ycy5cbiAqIEBwYXJhbSB7c3RyaW5nfSBzXG4gKiBAcmV0dXJucyB7c3RyaW5nfVxuICovXG5mdW5jdGlvbiBlc2Mocykge1xuICByZXR1cm4gZ2xvYmFsVGhpcy5DU1M/LmVzY2FwZVxuICAgID8gQ1NTLmVzY2FwZShzKVxuICAgIDogU3RyaW5nKHMpLnJlcGxhY2UoL1wiL2csICdcXFxcXCInKTtcbn1cblxuZXhwb3J0IHsgZXNjIH07XG4iLCAiLyoqXG4gKiBAZmlsZSBNb2RhbCBjb21wb25lbnQuXG4gKi9cblxuaW1wb3J0IHsgZXNjIH0gZnJvbSAnLi4vdXRpbHMvZXNjYXBlLmpzJztcbmltcG9ydCB7IHJlZ2lzdHJ5IH0gZnJvbSAnLi4vY29yZS9yZWdpc3RyeS5qcyc7XG5pbXBvcnQgeyBsb2cgfSBmcm9tICcuLi91dGlscy9sb2dnZXIuanMnO1xuXG4vKipcbiAqIEB0eXBlZGVmIHtPYmplY3R9IE1vZGFsQ29yZVxuICogQHByb3BlcnR5IHt7IG9wZW46IChlbDogSFRNTEVsZW1lbnQpID0+IHZvaWQsIGNsb3NlOiAoZWw6IEhUTUxFbGVtZW50KSA9PiB2b2lkIH19IG1vZGFsXG4gKi9cblxuLyoqXG4gKiBAZGVzY3JpcHRpb24gSW5pdGlhbGl6ZSBtb2RhbCBlbGVtZW50LlxuICogQHRoaXMge01vZGFsQ29yZX1cbiAqIEBwYXJhbSB7SFRNTEVsZW1lbnR9IGVsXG4gKiBAcmV0dXJucyB7dm9pZH1cbiAqL1xuZnVuY3Rpb24gbW9kYWxDb21wb25lbnQoZWwpIHtcbiAgY29uc3QgY29yZSA9IHRoaXM7XG4gIGNvbnN0IG9wZW5CdG5zID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvckFsbChcbiAgICBgW2RhdGEtZGVzc2VydC1vcGVuPVwiJHtlc2MoZWwuaWQpfVwiXWBcbiAgKTtcbiAgY29uc3QgY2xvc2VCdG5zID0gZWwucXVlcnlTZWxlY3RvckFsbCgnW2RhdGEtZGVzc2VydC1jbG9zZV0nKTtcbiAgLyoqIEB0eXBlIHtBcnJheTxbRXZlbnRUYXJnZXQsIHN0cmluZywgRXZlbnRMaXN0ZW5lcl0+fSAqL1xuICBjb25zdCBoYW5kbGVycyA9IFtdO1xuXG4gIG9wZW5CdG5zLmZvckVhY2goKGJ0bikgPT4ge1xuICAgIGNvbnN0IGggPSAoKSA9PiBjb3JlLm1vZGFsLm9wZW4oZWwpO1xuICAgIGJ0bi5hZGRFdmVudExpc3RlbmVyKCdjbGljaycsIGgpO1xuICAgIGhhbmRsZXJzLnB1c2goW2J0biwgJ2NsaWNrJywgaF0pO1xuICB9KTtcblxuICBjbG9zZUJ0bnMuZm9yRWFjaCgoYnRuKSA9PiB7XG4gICAgY29uc3QgaCA9ICgpID0+IGNvcmUubW9kYWwuY2xvc2UoZWwpO1xuICAgIGJ0bi5hZGRFdmVudExpc3RlbmVyKCdjbGljaycsIGgpO1xuICAgIGhhbmRsZXJzLnB1c2goW2J0biwgJ2NsaWNrJywgaF0pO1xuICB9KTtcblxuICBjb25zdCBvdmVybGF5SCA9IChlKSA9PiB7IGlmIChlLnRhcmdldCA9PT0gZWwpIGNvcmUubW9kYWwuY2xvc2UoZWwpOyB9O1xuICBlbC5hZGRFdmVudExpc3RlbmVyKCdjbGljaycsIG92ZXJsYXlIKTtcbiAgaGFuZGxlcnMucHVzaChbZWwsICdjbGljaycsIG92ZXJsYXlIXSk7XG5cbiAgcmVnaXN0cnkuaW5zdGFuY2VzLnNldChlbCwgeyB0eXBlOiAnbW9kYWwnLCBoYW5kbGVycyB9KTtcbiAgbG9nKCdtb2RhbCBpbml0OicsIGVsLmlkKTtcbn1cblxuZXhwb3J0IHsgbW9kYWxDb21wb25lbnQgfTtcbiIsICIvKipcbiAqIEBmaWxlIFByZWZpeGVkIGNsYXNzIGhlbHBlcnMuXG4gKi9cblxuaW1wb3J0IHsgUFJFRklYIH0gZnJvbSAnLi4vY29yZS9jb25zdGFudHMuanMnO1xuXG4vKipcbiAqIEBkZXNjcmlwdGlvbiBBZGQgYSBwcmVmaXhlZCBjbGFzcy5cbiAqIEBwYXJhbSB7SFRNTEVsZW1lbnR9IGVsXG4gKiBAcGFyYW0ge3N0cmluZ30gbmFtZVxuICogQHJldHVybnMge0hUTUxFbGVtZW50fVxuICovXG5mdW5jdGlvbiBhZGRDbGFzcyhlbCwgbmFtZSkge1xuICBlbC5jbGFzc0xpc3QuYWRkKGAke1BSRUZJWH0tJHtuYW1lfWApO1xuICByZXR1cm4gZWw7XG59XG5cbi8qKlxuICogQGRlc2NyaXB0aW9uIFJlbW92ZSBhIHByZWZpeGVkIGNsYXNzLlxuICogQHBhcmFtIHtIVE1MRWxlbWVudH0gZWxcbiAqIEBwYXJhbSB7c3RyaW5nfSBuYW1lXG4gKiBAcmV0dXJucyB7SFRNTEVsZW1lbnR9XG4gKi9cbmZ1bmN0aW9uIHJlbW92ZUNsYXNzKGVsLCBuYW1lKSB7XG4gIGVsLmNsYXNzTGlzdC5yZW1vdmUoYCR7UFJFRklYfS0ke25hbWV9YCk7XG4gIHJldHVybiBlbDtcbn1cblxuLyoqXG4gKiBAZGVzY3JpcHRpb24gVG9nZ2xlIGEgcHJlZml4ZWQgY2xhc3MuXG4gKiBAcGFyYW0ge0hUTUxFbGVtZW50fSBlbFxuICogQHBhcmFtIHtzdHJpbmd9IG5hbWVcbiAqIEBwYXJhbSB7Ym9vbGVhbn0gW2ZvcmNlXVxuICogQHJldHVybnMge0hUTUxFbGVtZW50fVxuICovXG5mdW5jdGlvbiB0b2dnbGVDbGFzcyhlbCwgbmFtZSwgZm9yY2UpIHtcbiAgY29uc3QgY2xzID0gYCR7UFJFRklYfS0ke25hbWV9YDtcbiAgdHlwZW9mIGZvcmNlID09PSAnYm9vbGVhbidcbiAgICA/IGVsLmNsYXNzTGlzdC50b2dnbGUoY2xzLCBmb3JjZSlcbiAgICA6IGVsLmNsYXNzTGlzdC50b2dnbGUoY2xzKTtcbiAgcmV0dXJuIGVsO1xufVxuXG5leHBvcnQgeyBhZGRDbGFzcywgcmVtb3ZlQ2xhc3MsIHRvZ2dsZUNsYXNzIH07XG4iLCAiLyoqXG4gKiBAZmlsZSBEcm9wZG93biBjb21wb25lbnQuXG4gKi9cblxuaW1wb3J0IHsgcmVtb3ZlQ2xhc3MsIHRvZ2dsZUNsYXNzIH0gZnJvbSAnLi4vdXRpbHMvY2xhc3NOYW1lcy5qcyc7XG5pbXBvcnQgeyByZWdpc3RyeSB9IGZyb20gJy4uL2NvcmUvcmVnaXN0cnkuanMnO1xuaW1wb3J0IHsgbG9nIH0gZnJvbSAnLi4vdXRpbHMvbG9nZ2VyLmpzJztcblxuLyoqXG4gKiBAZGVzY3JpcHRpb24gSW5pdGlhbGl6ZSBkcm9wZG93biBlbGVtZW50LlxuICogQHBhcmFtIHtIVE1MRWxlbWVudH0gZWxcbiAqIEByZXR1cm5zIHt2b2lkfVxuICovXG5mdW5jdGlvbiBkcm9wZG93bkNvbXBvbmVudChlbCkge1xuICBjb25zdCB0cmlnZ2VyID0gZWwucXVlcnlTZWxlY3RvcignW2RhdGEtZGVzc2VydC10cmlnZ2VyXScpO1xuICBjb25zdCBtZW51ID0gZWwucXVlcnlTZWxlY3RvcignW2RhdGEtZGVzc2VydC1tZW51XScpO1xuICBpZiAoIXRyaWdnZXIgfHwgIW1lbnUpIHJldHVybjtcblxuICAvKiogQHR5cGUge0FycmF5PFtFdmVudFRhcmdldCwgc3RyaW5nLCBFdmVudExpc3RlbmVyXT59ICovXG4gIGNvbnN0IGhhbmRsZXJzID0gW107XG5cbiAgY29uc3Qgb25UcmlnZ2VyID0gKGUpID0+IHtcbiAgICBlLnN0b3BQcm9wYWdhdGlvbigpO1xuICAgIHRvZ2dsZUNsYXNzKGVsLCAnb3BlbicpO1xuICAgIHRvZ2dsZUNsYXNzKG1lbnUsICdzaG93Jyk7XG4gIH07XG4gIHRyaWdnZXIuYWRkRXZlbnRMaXN0ZW5lcignY2xpY2snLCBvblRyaWdnZXIpO1xuICBoYW5kbGVycy5wdXNoKFt0cmlnZ2VyLCAnY2xpY2snLCBvblRyaWdnZXJdKTtcblxuICBjb25zdCBvbk91dHNpZGUgPSAoZSkgPT4ge1xuICAgIGlmICghZWwuY29udGFpbnMoLyoqIEB0eXBlIHtOb2RlfSAqLyhlLnRhcmdldCkpKSB7XG4gICAgICByZW1vdmVDbGFzcyhlbCwgJ29wZW4nKTtcbiAgICAgIHJlbW92ZUNsYXNzKG1lbnUsICdzaG93Jyk7XG4gICAgfVxuICB9O1xuICBkb2N1bWVudC5hZGRFdmVudExpc3RlbmVyKCdjbGljaycsIG9uT3V0c2lkZSk7XG4gIGhhbmRsZXJzLnB1c2goW2RvY3VtZW50LCAnY2xpY2snLCBvbk91dHNpZGVdKTtcblxuICByZWdpc3RyeS5pbnN0YW5jZXMuc2V0KGVsLCB7IHR5cGU6ICdkcm9wZG93bicsIGhhbmRsZXJzIH0pO1xuICBsb2coJ2Ryb3Bkb3duIGluaXQnKTtcbn1cblxuZXhwb3J0IHsgZHJvcGRvd25Db21wb25lbnQgfTtcbiIsICIvKipcbiAqIEBmaWxlIFRhYnMgY29tcG9uZW50LlxuICovXG5cbmltcG9ydCB7IGFkZENsYXNzLCByZW1vdmVDbGFzcyB9IGZyb20gJy4uL3V0aWxzL2NsYXNzTmFtZXMuanMnO1xuaW1wb3J0IHsgZXNjIH0gZnJvbSAnLi4vdXRpbHMvZXNjYXBlLmpzJztcbmltcG9ydCB7IHJlZ2lzdHJ5IH0gZnJvbSAnLi4vY29yZS9yZWdpc3RyeS5qcyc7XG5pbXBvcnQgeyBsb2cgfSBmcm9tICcuLi91dGlscy9sb2dnZXIuanMnO1xuXG4vKipcbiAqIEBkZXNjcmlwdGlvbiBJbml0aWFsaXplIHRhYnMgZWxlbWVudC5cbiAqIEBwYXJhbSB7SFRNTEVsZW1lbnR9IGVsXG4gKiBAcmV0dXJucyB7dm9pZH1cbiAqL1xuZnVuY3Rpb24gdGFic0NvbXBvbmVudChlbCkge1xuICBjb25zdCBidXR0b25zID0gZWwucXVlcnlTZWxlY3RvckFsbCgnW2RhdGEtZGVzc2VydC10YWJdJyk7XG4gIGNvbnN0IHBhbmVscyA9IGVsLnF1ZXJ5U2VsZWN0b3JBbGwoJ1tkYXRhLWRlc3NlcnQtcGFuZWxdJyk7XG4gIGlmICghYnV0dG9ucy5sZW5ndGgpIHJldHVybjtcblxuICAvKiogQHR5cGUge0FycmF5PFtFdmVudFRhcmdldCwgc3RyaW5nLCBFdmVudExpc3RlbmVyXT59ICovXG4gIGNvbnN0IGhhbmRsZXJzID0gW107XG5cbiAgLyoqXG4gICAqIEBkZXNjcmlwdGlvbiBBY3RpdmF0ZSBhIHRhYiBhbmQgaXRzIHBhbmVsLlxuICAgKiBAcGFyYW0ge3N0cmluZ30gdGFyZ2V0XG4gICAqIEByZXR1cm5zIHt2b2lkfVxuICAgKi9cbiAgY29uc3QgYWN0aXZhdGUgPSAodGFyZ2V0KSA9PiB7XG4gICAgYnV0dG9ucy5mb3JFYWNoKChiKSA9PiByZW1vdmVDbGFzcyhiLCAnYWN0aXZlJykpO1xuICAgIHBhbmVscy5mb3JFYWNoKChwKSA9PiByZW1vdmVDbGFzcyhwLCAnYWN0aXZlJykpO1xuXG4gICAgY29uc3QgYnRuID0gZWwucXVlcnlTZWxlY3RvcihgW2RhdGEtZGVzc2VydC10YWI9XCIke2VzYyh0YXJnZXQpfVwiXWApO1xuICAgIGNvbnN0IHBhbmVsID0gZWwucXVlcnlTZWxlY3RvcihgW2RhdGEtZGVzc2VydC1wYW5lbD1cIiR7ZXNjKHRhcmdldCl9XCJdYCk7XG4gICAgaWYgKGJ0bikgYWRkQ2xhc3MoYnRuLCAnYWN0aXZlJyk7XG4gICAgaWYgKHBhbmVsKSBhZGRDbGFzcyhwYW5lbCwgJ2FjdGl2ZScpO1xuICB9O1xuXG4gIGJ1dHRvbnMuZm9yRWFjaCgoYnRuKSA9PiB7XG4gICAgY29uc3QgaCA9ICgpID0+IGFjdGl2YXRlKGJ0bi5nZXRBdHRyaWJ1dGUoJ2RhdGEtZGVzc2VydC10YWInKSk7XG4gICAgYnRuLmFkZEV2ZW50TGlzdGVuZXIoJ2NsaWNrJywgaCk7XG4gICAgaGFuZGxlcnMucHVzaChbYnRuLCAnY2xpY2snLCBoXSk7XG4gIH0pO1xuXG4gIGNvbnN0IGluaXRpYWwgPSBlbC5xdWVyeVNlbGVjdG9yKCcuZGVzc2VydC10YWIuZGVzc2VydC1hY3RpdmUnKTtcbiAgaWYgKGluaXRpYWwpIGFjdGl2YXRlKGluaXRpYWwuZ2V0QXR0cmlidXRlKCdkYXRhLWRlc3NlcnQtdGFiJykpO1xuXG4gIHJlZ2lzdHJ5Lmluc3RhbmNlcy5zZXQoZWwsIHsgdHlwZTogJ3RhYnMnLCBoYW5kbGVycyB9KTtcbiAgbG9nKCd0YWJzIGluaXQnKTtcbn1cblxuZXhwb3J0IHsgdGFic0NvbXBvbmVudCB9O1xuIiwgIi8qKlxuICogQGZpbGUgQWNjb3JkaW9uIGNvbXBvbmVudC5cbiAqL1xuXG5pbXBvcnQgeyBhZGRDbGFzcywgcmVtb3ZlQ2xhc3MgfSBmcm9tICcuLi91dGlscy9jbGFzc05hbWVzLmpzJztcbmltcG9ydCB7IHJlZ2lzdHJ5IH0gZnJvbSAnLi4vY29yZS9yZWdpc3RyeS5qcyc7XG5pbXBvcnQgeyBsb2cgfSBmcm9tICcuLi91dGlscy9sb2dnZXIuanMnO1xuXG4vKipcbiAqIEBkZXNjcmlwdGlvbiBJbml0aWFsaXplIGFjY29yZGlvbiBlbGVtZW50LlxuICogQHBhcmFtIHtIVE1MRWxlbWVudH0gZWxcbiAqIEByZXR1cm5zIHt2b2lkfVxuICovXG5mdW5jdGlvbiBhY2NvcmRpb25Db21wb25lbnQoZWwpIHtcbiAgY29uc3QgaXRlbXMgPSBlbC5xdWVyeVNlbGVjdG9yQWxsKCcuZGVzc2VydC1hY2NvcmRpb24taXRlbScpO1xuICAvKiogQHR5cGUge0FycmF5PFtFdmVudFRhcmdldCwgc3RyaW5nLCBFdmVudExpc3RlbmVyXT59ICovXG4gIGNvbnN0IGhhbmRsZXJzID0gW107XG5cbiAgaXRlbXMuZm9yRWFjaCgoaXRlbSkgPT4ge1xuICAgIGNvbnN0IGhlYWRlciA9IGl0ZW0ucXVlcnlTZWxlY3RvcignLmRlc3NlcnQtYWNjb3JkaW9uLWhlYWRlcicpO1xuICAgIGNvbnN0IGJvZHkgPSBpdGVtLnF1ZXJ5U2VsZWN0b3IoJy5kZXNzZXJ0LWFjY29yZGlvbi1ib2R5Jyk7XG4gICAgaWYgKCFoZWFkZXIpIHJldHVybjtcblxuICAgIGNvbnN0IGggPSAoKSA9PiB7XG4gICAgICBjb25zdCBpc09wZW4gPSBpdGVtLmNsYXNzTGlzdC5jb250YWlucygnZGVzc2VydC1vcGVuJyk7XG5cbiAgICAgIGl0ZW1zLmZvckVhY2goKGkpID0+IHtcbiAgICAgICAgcmVtb3ZlQ2xhc3MoaSwgJ29wZW4nKTtcbiAgICAgICAgY29uc3QgYiA9IGkucXVlcnlTZWxlY3RvcignLmRlc3NlcnQtYWNjb3JkaW9uLWJvZHknKTtcbiAgICAgICAgaWYgKGIpIGIuc3R5bGUubWF4SGVpZ2h0ID0gJyc7XG4gICAgICB9KTtcblxuICAgICAgaWYgKCFpc09wZW4pIHtcbiAgICAgICAgYWRkQ2xhc3MoaXRlbSwgJ29wZW4nKTtcbiAgICAgICAgaWYgKGJvZHkpIGJvZHkuc3R5bGUubWF4SGVpZ2h0ID0gYCR7Ym9keS5zY3JvbGxIZWlnaHR9cHhgO1xuICAgICAgfVxuICAgIH07XG5cbiAgICBoZWFkZXIuYWRkRXZlbnRMaXN0ZW5lcignY2xpY2snLCBoKTtcbiAgICBoYW5kbGVycy5wdXNoKFtoZWFkZXIsICdjbGljaycsIGhdKTtcbiAgfSk7XG5cbiAgcmVnaXN0cnkuaW5zdGFuY2VzLnNldChlbCwgeyB0eXBlOiAnYWNjb3JkaW9uJywgaGFuZGxlcnMgfSk7XG4gIGxvZygnYWNjb3JkaW9uIGluaXQnKTtcbn1cblxuZXhwb3J0IHsgYWNjb3JkaW9uQ29tcG9uZW50IH07XG4iLCAiLyoqXG4gKiBAZmlsZSBDb21wb25lbnQgcmVnaXN0cnkgYmFycmVsLlxuICovXG5cbmltcG9ydCB7IG1vZGFsQ29tcG9uZW50IH0gZnJvbSAnLi9tb2RhbC5qcyc7XG5pbXBvcnQgeyBkcm9wZG93bkNvbXBvbmVudCB9IGZyb20gJy4vZHJvcGRvd24uanMnO1xuaW1wb3J0IHsgdGFic0NvbXBvbmVudCB9IGZyb20gJy4vdGFicy5qcyc7XG5pbXBvcnQgeyBhY2NvcmRpb25Db21wb25lbnQgfSBmcm9tICcuL2FjY29yZGlvbi5qcyc7XG5cbi8qKlxuICogQHR5cGVkZWYge09iamVjdH0gQ29tcG9uZW50c1xuICogQHByb3BlcnR5IHsoZWw6IEhUTUxFbGVtZW50KSA9PiB2b2lkfSBtb2RhbFxuICogQHByb3BlcnR5IHsoZWw6IEhUTUxFbGVtZW50KSA9PiB2b2lkfSBkcm9wZG93blxuICogQHByb3BlcnR5IHsoZWw6IEhUTUxFbGVtZW50KSA9PiB2b2lkfSB0YWJzXG4gKiBAcHJvcGVydHkgeyhlbDogSFRNTEVsZW1lbnQpID0+IHZvaWR9IGFjY29yZGlvblxuICovXG5cbi8qKlxuICogQGRlc2NyaXB0aW9uIENvbXBvbmVudCByZWdpc3RyeSBtYXAuXG4gKiBAdHlwZSB7Q29tcG9uZW50c31cbiAqL1xuY29uc3QgY29tcG9uZW50cyA9IHtcbiAgbW9kYWw6IG1vZGFsQ29tcG9uZW50LFxuICBkcm9wZG93bjogZHJvcGRvd25Db21wb25lbnQsXG4gIHRhYnM6IHRhYnNDb21wb25lbnQsXG4gIGFjY29yZGlvbjogYWNjb3JkaW9uQ29tcG9uZW50LFxufTtcblxuZXhwb3J0IHsgY29tcG9uZW50cyB9O1xuIiwgIi8qKlxuICogQGZpbGUgU2NhbiBET00gYW5kIGluaXRpYWxpemUgY29tcG9uZW50cy5cbiAqL1xuXG5pbXBvcnQgeyBEQVRBX0FUVFIgfSBmcm9tICcuLi9jb3JlL2NvbnN0YW50cy5qcyc7XG5cbi8qKlxuICogQHR5cGVkZWYge09iamVjdH0gQ29tcG9uZW50c01hcFxuICogQHByb3BlcnR5IHsqfSBba2V5XVxuICovXG5cbi8qKlxuICogQGRlc2NyaXB0aW9uIEF1dG8taW5pdCBhbGwgZWxlbWVudHMgd2l0aCBkYXRhLWRlc3NlcnQgYXR0cmlidXRlLlxuICogQHRoaXMge3sgY29tcG9uZW50czogQ29tcG9uZW50c01hcCB9fVxuICogQHBhcmFtIHtQYXJlbnROb2RlfSBbcm9vdD1kb2N1bWVudF1cbiAqIEByZXR1cm5zIHt2b2lkfVxuICovXG5mdW5jdGlvbiBhdXRvSW5pdChyb290ID0gZG9jdW1lbnQpIHtcbiAgcm9vdC5xdWVyeVNlbGVjdG9yQWxsKGBbJHtEQVRBX0FUVFJ9XWApLmZvckVhY2goKG5vZGUpID0+IHtcbiAgICBpZiAobm9kZS5fZGVzc2VydEluaXRpYWxpemVkKSByZXR1cm47XG4gICAgY29uc3QgdHlwZSA9IG5vZGUuZ2V0QXR0cmlidXRlKERBVEFfQVRUUik7XG4gICAgY29uc3QgZm4gPSB0aGlzLmNvbXBvbmVudHNbdHlwZV07XG4gICAgaWYgKHR5cGVvZiBmbiA9PT0gJ2Z1bmN0aW9uJykge1xuICAgICAgZm4uY2FsbCh0aGlzLCBub2RlKTtcbiAgICAgIG5vZGUuX2Rlc3NlcnRJbml0aWFsaXplZCA9IHRydWU7XG4gICAgfVxuICB9KTtcbn1cblxuZXhwb3J0IHsgYXV0b0luaXQgfTtcbiIsICIvKipcbiAqIEBmaWxlIEdsb2JhbCBFU0Mga2V5IGhhbmRsZXIuXG4gKi9cblxuaW1wb3J0IHsgc3RhdGUgfSBmcm9tICcuLi9jb3JlL3N0YXRlLmpzJztcblxuLyoqXG4gKiBAdHlwZWRlZiB7T2JqZWN0fSBDb3JlTGlrZVxuICogQHByb3BlcnR5IHtzdHJpbmd9IHByZWZpeFxuICogQHByb3BlcnR5IHt7IGNsb3NlOiAoZWw6IEhUTUxFbGVtZW50KSA9PiB2b2lkIH19IG1vZGFsXG4gKi9cblxuLyoqXG4gKiBAZGVzY3JpcHRpb24gQmluZCBnbG9iYWwgRVNDIGhhbmRsZXIgdG8gY2xvc2UgdmlzaWJsZSBtb2RhbHMuXG4gKiBAcGFyYW0ge0NvcmVMaWtlfSBjb3JlXG4gKiBAcmV0dXJucyB7dm9pZH1cbiAqL1xuZnVuY3Rpb24gYmluZEVzY2FwZUtleShjb3JlKSB7XG4gIGlmIChzdGF0ZS5lc2NCb3VuZCkgcmV0dXJuO1xuXG4gIGRvY3VtZW50LmFkZEV2ZW50TGlzdGVuZXIoJ2tleWRvd24nLCAoZSkgPT4ge1xuICAgIGlmIChlLmtleSAhPT0gJ0VzY2FwZScpIHJldHVybjtcbiAgICBkb2N1bWVudFxuICAgICAgLnF1ZXJ5U2VsZWN0b3JBbGwoYC4ke2NvcmUucHJlZml4fS1tb2RhbC4ke2NvcmUucHJlZml4fS1zaG93YClcbiAgICAgIC5mb3JFYWNoKChtKSA9PiBjb3JlLm1vZGFsLmNsb3NlKG0pKTtcbiAgfSk7XG5cbiAgc3RhdGUuZXNjQm91bmQgPSB0cnVlO1xufVxuXG5leHBvcnQgeyBiaW5kRXNjYXBlS2V5IH07XG4iLCAiLyoqXG4gKiBAZmlsZSBVUkwgcmVzb2x1dGlvbiBoZWxwZXJzLlxuICovXG5cbi8qKlxuICogQGRlc2NyaXB0aW9uIFJlc29sdmUgYSBwYXRoIHJlbGF0aXZlIHRvIGEgYmFzZS5cbiAqIEBwYXJhbSB7c3RyaW5nfSBiYXNlXG4gKiBAcGFyYW0ge3N0cmluZ30gcGF0aFxuICogQHJldHVybnMge3N0cmluZ31cbiAqL1xuZnVuY3Rpb24gcmVzb2x2ZVVSTChiYXNlLCBwYXRoKSB7XG4gIHRyeSB7IHJldHVybiBuZXcgVVJMKHBhdGgsIGJhc2UpLmhyZWY7IH1cbiAgY2F0Y2ggeyByZXR1cm4gcGF0aDsgfVxufVxuXG4vKipcbiAqIEBkZXNjcmlwdGlvbiBEZXJpdmUgYmFzZSBVUkwgZnJvbSBhIHNjcmlwdCBlbGVtZW50IChhc3N1bWVzIC9zcmMvIGxheW91dCkuXG4gKiBAcGFyYW0ge0hUTUxTY3JpcHRFbGVtZW50fSBzY3JpcHRFbFxuICogQHJldHVybnMgez9zdHJpbmd9XG4gKi9cbmZ1bmN0aW9uIGdldFNjcmlwdEJhc2Uoc2NyaXB0RWwpIHtcbiAgaWYgKCFzY3JpcHRFbD8uc3JjKSByZXR1cm4gbnVsbDtcbiAgY29uc3QgbSA9IHNjcmlwdEVsLnNyYy5tYXRjaCgvXiguKj8pXFwvc3JjXFwvW14vXSskLyk7XG4gIHJldHVybiBtID8gbVsxXSA6IHNjcmlwdEVsLnNyYy5yZXBsYWNlKC9cXC9bXi9dKyQvLCAnJyk7XG59XG5cbi8qKlxuICogQGRlc2NyaXB0aW9uIEdldCB0aGUgY3VycmVudGx5IGV4ZWN1dGluZyBzY3JpcHQgZWxlbWVudC5cbiAqIEByZXR1cm5zIHtIVE1MU2NyaXB0RWxlbWVudHx1bmRlZmluZWR9XG4gKi9cbmZ1bmN0aW9uIGN1cnJlbnRTY3JpcHQoKSB7XG4gIHJldHVybiBkb2N1bWVudC5jdXJyZW50U2NyaXB0XG4gICAgfHwgKCgpID0+IHtcbiAgICAgIGNvbnN0IHMgPSBkb2N1bWVudC5nZXRFbGVtZW50c0J5VGFnTmFtZSgnc2NyaXB0Jyk7XG4gICAgICByZXR1cm4gc1tzLmxlbmd0aCAtIDFdO1xuICAgIH0pKCk7XG59XG5cbmV4cG9ydCB7IHJlc29sdmVVUkwsIGdldFNjcmlwdEJhc2UsIGN1cnJlbnRTY3JpcHQgfTtcbiIsICIvKipcbiAqIEBmaWxlIEF1dG8taW5qZWN0IGRlc3NlcnQuY3NzLlxuICovXG5cbmltcG9ydCB7IGN1cnJlbnRTY3JpcHQsIGdldFNjcmlwdEJhc2UgfSBmcm9tICcuLi91dGlscy91cmwuanMnO1xuaW1wb3J0IHsgbG9nIH0gZnJvbSAnLi4vdXRpbHMvbG9nZ2VyLmpzJztcblxuLyoqXG4gKiBAZGVzY3JpcHRpb24gSW5qZWN0IGRlc3NlcnQuY3NzIGlmIG5vdCBhbHJlYWR5IHByZXNlbnQuXG4gKiBAcmV0dXJucyB7dm9pZH1cbiAqL1xuZnVuY3Rpb24gaW5qZWN0Q1NTKCkge1xuICBpZiAoZG9jdW1lbnQucXVlcnlTZWxlY3RvcignbGlua1tkYXRhLWRlc3NlcnQtY3NzXScpKSByZXR1cm47XG5cbiAgY29uc3QgYmFzZSA9IGdldFNjcmlwdEJhc2UoY3VycmVudFNjcmlwdCgpKTtcbiAgY29uc3QgaHJlZiA9IGJhc2VcbiAgICA/IGAke2Jhc2V9L3NyYy9zdHlsZXMvZGVzc2VydC5jc3NgXG4gICAgOiAnZGlzdC9kZXNzZXJ0LmNzcyc7XG5cbiAgY29uc3QgbGluayA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2xpbmsnKTtcbiAgbGluay5yZWwgPSAnc3R5bGVzaGVldCc7XG4gIGxpbmsuaHJlZiA9IGhyZWY7XG4gIGxpbmsuc2V0QXR0cmlidXRlKCdkYXRhLWRlc3NlcnQtY3NzJywgJycpO1xuICBsaW5rLm9uZXJyb3IgPSAoKSA9PiBsb2coJ0NTUyBsb2FkIGZhaWxlZDonLCBocmVmKTtcbiAgZG9jdW1lbnQuaGVhZC5hcHBlbmRDaGlsZChsaW5rKTtcbn1cblxuZXhwb3J0IHsgaW5qZWN0Q1NTIH07XG4iLCAiLyoqXG4gKiBAZmlsZSBBdXRvLWluamVjdCBsb2FkZXIgcGx1Z2luLlxuICovXG5cbmltcG9ydCB7IHJlZ2lzdHJ5IH0gZnJvbSAnLi4vY29yZS9yZWdpc3RyeS5qcyc7XG5pbXBvcnQgeyBjdXJyZW50U2NyaXB0LCBnZXRTY3JpcHRCYXNlIH0gZnJvbSAnLi4vdXRpbHMvdXJsLmpzJztcbmltcG9ydCB7IGxvZyB9IGZyb20gJy4uL3V0aWxzL2xvZ2dlci5qcyc7XG5cbi8qKlxuICogQGRlc2NyaXB0aW9uIEluamVjdCBsb2FkZXIgcGx1Z2luIGlmIG5vdCByZWdpc3RlcmVkLlxuICogQHJldHVybnMge3ZvaWR9XG4gKi9cbmZ1bmN0aW9uIGluamVjdExvYWRlcigpIHtcbiAgaWYgKHJlZ2lzdHJ5LnBsdWdpbnMuaGFzKCdsb2FkZXInKSkgcmV0dXJuO1xuICBpZiAoZG9jdW1lbnQucXVlcnlTZWxlY3Rvcignc2NyaXB0W2RhdGEtZGVzc2VydC1sb2FkZXJdJykpIHJldHVybjtcblxuICBjb25zdCBiYXNlID0gZ2V0U2NyaXB0QmFzZShjdXJyZW50U2NyaXB0KCkpO1xuICBjb25zdCBzcmMgPSBiYXNlXG4gICAgPyBgJHtiYXNlfS9zcmMvcGx1Z2lucy9sb2FkZXIvTG9hZGVyUGx1Z2luLmpzYFxuICAgIDogJ2xvYWRlci51bWQuanMnO1xuXG4gIGNvbnN0IHMgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdzY3JpcHQnKTtcbiAgcy50eXBlID0gYmFzZSA/ICdtb2R1bGUnIDogJ3RleHQvamF2YXNjcmlwdCc7XG4gIHMuc3JjID0gc3JjO1xuICBzLmFzeW5jID0gZmFsc2U7XG4gIHMuc2V0QXR0cmlidXRlKCdkYXRhLWRlc3NlcnQtbG9hZGVyJywgJycpO1xuICBzLm9uZXJyb3IgPSAoKSA9PiBsb2coJ2xvYWRlciBpbmplY3QgZmFpbGVkOicsIHNyYyk7XG4gIGRvY3VtZW50LmhlYWQuYXBwZW5kQ2hpbGQocyk7XG59XG5cbmV4cG9ydCB7IGluamVjdExvYWRlciB9O1xuIiwgIi8qKlxuICogQGZpbGUgTW9kYWwgb3Blbi9jbG9zZSBjb250cm9sbGVyLlxuICovXG5cbmltcG9ydCB7IGFkZENsYXNzLCByZW1vdmVDbGFzcyB9IGZyb20gJy4uL3V0aWxzL2NsYXNzTmFtZXMuanMnO1xuaW1wb3J0IHsgc3RhdGUgfSBmcm9tICcuLi9jb3JlL3N0YXRlLmpzJztcbmltcG9ydCB7IGhlbHBlcnMgfSBmcm9tICcuLi91dGlscy9icmlkZ2UuanMnO1xuaW1wb3J0IHsgbG9nIH0gZnJvbSAnLi4vdXRpbHMvbG9nZ2VyLmpzJztcblxuLyoqXG4gKiBAdHlwZWRlZiB7T2JqZWN0fSBNb2RhbEFQSVxuICogQHByb3BlcnR5IHsoZWw6IEhUTUxFbGVtZW50KSA9PiB2b2lkfSBvcGVuXG4gKiBAcHJvcGVydHkgeyhlbDogSFRNTEVsZW1lbnQpID0+IHZvaWR9IGNsb3NlXG4gKi9cblxuLyoqXG4gKiBAZGVzY3JpcHRpb24gTW9kYWwgY29udHJvbGxlci5cbiAqIEB0eXBlIHtNb2RhbEFQSX1cbiAqL1xuY29uc3QgbW9kYWxBUEkgPSB7XG4gIC8qKlxuICAgKiBAZGVzY3JpcHRpb24gT3BlbiBhIG1vZGFsIGVsZW1lbnQuXG4gICAqIEBwYXJhbSB7SFRNTEVsZW1lbnR9IGVsXG4gICAqIEByZXR1cm5zIHt2b2lkfVxuICAgKi9cbiAgb3BlbihlbCkge1xuICAgIHN0YXRlLmxhc3RGb2N1c2VkID0gZG9jdW1lbnQuYWN0aXZlRWxlbWVudDtcblxuICAgIGVsLnN0eWxlLmRpc3BsYXkgPSAnZmxleCc7XG4gICAgZG9jdW1lbnQuYm9keS5zdHlsZS5vdmVyZmxvdyA9ICdoaWRkZW4nO1xuICAgIHJlcXVlc3RBbmltYXRpb25GcmFtZSgoKSA9PiBhZGRDbGFzcyhlbCwgJ3Nob3cnKSk7XG5cbiAgICBzZXRUaW1lb3V0KCgpID0+IHtcbiAgICAgIGNvbnN0IGYgPSBlbC5xdWVyeVNlbGVjdG9yKFxuICAgICAgICAnYnV0dG9uLCBbaHJlZl0sIGlucHV0LCBzZWxlY3QsIHRleHRhcmVhLCBbdGFiaW5kZXhdOm5vdChbdGFiaW5kZXg9XCItMVwiXSknXG4gICAgICApO1xuICAgICAgLyoqIEB0eXBlIHtIVE1MRWxlbWVudHxudWxsfSAqLyhmKT8uZm9jdXMoKTtcbiAgICB9LCAxMDApO1xuXG4gICAgaGVscGVycy5jb250cm9sbGVyPy5lbWl0KCdtb2RhbDpvcGVuJywgeyBlbCwgaWQ6IGVsLmlkIH0pO1xuICAgIGxvZygnbW9kYWwgb3BlbjonLCBlbC5pZCk7XG4gIH0sXG5cbiAgLyoqXG4gICAqIEBkZXNjcmlwdGlvbiBDbG9zZSBhIG1vZGFsIGVsZW1lbnQuXG4gICAqIEBwYXJhbSB7SFRNTEVsZW1lbnR9IGVsXG4gICAqIEByZXR1cm5zIHt2b2lkfVxuICAgKi9cbiAgY2xvc2UoZWwpIHtcbiAgICByZW1vdmVDbGFzcyhlbCwgJ3Nob3cnKTtcblxuICAgIHNldFRpbWVvdXQoKCkgPT4ge1xuICAgICAgZWwuc3R5bGUuZGlzcGxheSA9ICdub25lJztcbiAgICAgIGRvY3VtZW50LmJvZHkuc3R5bGUub3ZlcmZsb3cgPSAnJztcbiAgICAgIHN0YXRlLmxhc3RGb2N1c2VkPy5mb2N1cygpO1xuICAgIH0sIDMwMCk7XG5cbiAgICBoZWxwZXJzLmNvbnRyb2xsZXI/LmVtaXQoJ21vZGFsOmNsb3NlJywgeyBlbCwgaWQ6IGVsLmlkIH0pO1xuICAgIGxvZygnbW9kYWwgY2xvc2U6JywgZWwuaWQpO1xuICB9LFxufTtcblxuZXhwb3J0IHsgbW9kYWxBUEkgfTtcbiIsICIvKipcbiAqIEBmaWxlIFN0YWNrZWQgYWxlcnQvdG9hc3QgQVBJLlxuICovXG5cbmltcG9ydCB7IGFkZENsYXNzLCByZW1vdmVDbGFzcyB9IGZyb20gJy4uL3V0aWxzL2NsYXNzTmFtZXMuanMnO1xuaW1wb3J0IHsgaGVscGVycyB9IGZyb20gJy4uL3V0aWxzL2JyaWRnZS5qcyc7XG5cbi8qKlxuICogQHR5cGVkZWYgeydpbmZvJ3wnc3VjY2Vzcyd8J3dhcm5pbmcnfCdkYW5nZXInfSBBbGVydFR5cGVcbiAqL1xuXG4vKipcbiAqIEBkZXNjcmlwdGlvbiBTaG93IGEgc3RhY2tlZCBhbGVydC5cbiAqIEBwYXJhbSB7c3RyaW5nfSBtc2dcbiAqIEBwYXJhbSB7QWxlcnRUeXBlfSBbdHlwZT0naW5mbyddXG4gKiBAcGFyYW0ge251bWJlcn0gW2R1cmF0aW9uPTMwMDBdXG4gKiBAcmV0dXJucyB7dm9pZH1cbiAqL1xuZnVuY3Rpb24gYWxlcnRBUEkobXNnLCB0eXBlID0gJ2luZm8nLCBkdXJhdGlvbiA9IDMwMDApIHtcbiAgaGVscGVycy5jb250cm9sbGVyPy5lbWl0KCdhbGVydDpzaG93JywgeyBtZXNzYWdlOiBtc2csIHR5cGUsIGR1cmF0aW9uIH0pO1xuXG4gIGxldCBjb250YWluZXIgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKCcuZGVzc2VydC1hbGVydC1jb250YWluZXInKTtcbiAgaWYgKCFjb250YWluZXIpIHtcbiAgICBjb250YWluZXIgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdkaXYnKTtcbiAgICBjb250YWluZXIuY2xhc3NOYW1lID0gJ2Rlc3NlcnQtYWxlcnQtY29udGFpbmVyJztcbiAgICBkb2N1bWVudC5ib2R5LmFwcGVuZENoaWxkKGNvbnRhaW5lcik7XG4gIH1cblxuICBjb25zdCBib3ggPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdkaXYnKTtcbiAgYm94LmNsYXNzTmFtZSA9IGBkZXNzZXJ0LWFsZXJ0IGRlc3NlcnQtYWxlcnQtJHt0eXBlfWA7XG4gIGJveC50ZXh0Q29udGVudCA9IG1zZztcbiAgY29udGFpbmVyLmFwcGVuZENoaWxkKGJveCk7XG5cbiAgcmVxdWVzdEFuaW1hdGlvbkZyYW1lKCgpID0+IGFkZENsYXNzKGJveCwgJ3Nob3cnKSk7XG5cbiAgc2V0VGltZW91dCgoKSA9PiB7XG4gICAgcmVtb3ZlQ2xhc3MoYm94LCAnc2hvdycpO1xuICAgIHNldFRpbWVvdXQoKCkgPT4ge1xuICAgICAgYm94LnJlbW92ZSgpO1xuICAgICAgaWYgKCFjb250YWluZXIuY2hpbGRyZW4ubGVuZ3RoKSBjb250YWluZXIucmVtb3ZlKCk7XG4gICAgfSwgMzAwKTtcbiAgfSwgZHVyYXRpb24pO1xufVxuXG5leHBvcnQgeyBhbGVydEFQSSB9O1xuIiwgIi8qKlxuICogQGZpbGUgQ29tcG9uZW50IHRlYXJkb3duIEFQSS5cbiAqL1xuXG5pbXBvcnQgeyByZWdpc3RyeSB9IGZyb20gJy4uL2NvcmUvcmVnaXN0cnkuanMnO1xuaW1wb3J0IHsgbG9nIH0gZnJvbSAnLi4vdXRpbHMvbG9nZ2VyLmpzJztcblxuLyoqXG4gKiBAZGVzY3JpcHRpb24gRGVzdHJveSBhbiBpbml0aWFsaXplZCBlbGVtZW50IGFuZCByZW1vdmUgbGlzdGVuZXJzLlxuICogQHBhcmFtIHtIVE1MRWxlbWVudH0gZWxcbiAqIEByZXR1cm5zIHt2b2lkfVxuICovXG5mdW5jdGlvbiBkZXN0cm95QVBJKGVsKSB7XG4gIGNvbnN0IGluc3QgPSByZWdpc3RyeS5pbnN0YW5jZXMuZ2V0KGVsKTtcbiAgaWYgKCFpbnN0KSByZXR1cm47XG5cbiAgaW5zdC5oYW5kbGVycy5mb3JFYWNoKChbdGFyZ2V0LCB0eXBlLCBoYW5kbGVyXSkgPT4ge1xuICAgIHRhcmdldC5yZW1vdmVFdmVudExpc3RlbmVyKHR5cGUsIGhhbmRsZXIpO1xuICB9KTtcblxuICBlbC5fZGVzc2VydEluaXRpYWxpemVkID0gZmFsc2U7XG4gIHJlZ2lzdHJ5Lmluc3RhbmNlcy5kZWxldGUoZWwpO1xuICBsb2coJ2Rlc3Ryb3llZDonLCBpbnN0LnR5cGUpO1xufVxuXG5leHBvcnQgeyBkZXN0cm95QVBJIH07XG4iLCAiLyoqXG4gKiBAZmlsZSBQcmVmaXhlZCBkYXRhIGF0dHJpYnV0ZSBoZWxwZXJzLlxuICovXG5cbmltcG9ydCB7IFBSRUZJWCB9IGZyb20gJy4uL2NvcmUvY29uc3RhbnRzLmpzJztcblxuLyoqXG4gKiBAZGVzY3JpcHRpb24gU2V0IGEgcHJlZml4ZWQgZGF0YSBhdHRyaWJ1dGUuXG4gKiBAcGFyYW0ge0hUTUxFbGVtZW50fSBlbFxuICogQHBhcmFtIHtzdHJpbmd9IGtleVxuICogQHBhcmFtIHtzdHJpbmd9IHZhbHVlXG4gKiBAcmV0dXJucyB7SFRNTEVsZW1lbnR9XG4gKi9cbmZ1bmN0aW9uIHNldERhdGEoZWwsIGtleSwgdmFsdWUpIHtcbiAgZWwuc2V0QXR0cmlidXRlKGBkYXRhLSR7UFJFRklYfS0ke2tleX1gLCB2YWx1ZSk7XG4gIHJldHVybiBlbDtcbn1cblxuLyoqXG4gKiBAZGVzY3JpcHRpb24gR2V0IGEgcHJlZml4ZWQgZGF0YSBhdHRyaWJ1dGUuXG4gKiBAcGFyYW0ge0hUTUxFbGVtZW50fSBlbFxuICogQHBhcmFtIHtzdHJpbmd9IGtleVxuICogQHJldHVybnMgez9zdHJpbmd9XG4gKi9cbmZ1bmN0aW9uIGdldERhdGEoZWwsIGtleSkge1xuICByZXR1cm4gZWwuZ2V0QXR0cmlidXRlKGBkYXRhLSR7UFJFRklYfS0ke2tleX1gKTtcbn1cblxuZXhwb3J0IHsgc2V0RGF0YSwgZ2V0RGF0YSB9O1xuIl0sCiAgIm1hcHBpbmdzIjogIjs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7OztBQ1NBLE1BQU0sVUFBVTtBQU9oQixNQUFNLFNBQVM7QUFPZixNQUFNLFlBQVk7QUFjbEIsTUFBTSxrQkFBa0IsT0FBTyxPQUFPO0FBQUEsSUFDcEMsVUFBVTtBQUFBLElBQ1YsT0FBTztBQUFBLElBQ1AsZUFBZTtBQUFBLEVBQ2pCLENBQUM7OztBQzNCRCxNQUFNLFFBQVE7QUFBQSxJQUNaLFVBQVU7QUFBQSxJQUNWLGFBQWE7QUFBQSxFQUNmO0FBTUEsTUFBTSxVQUFVLENBQUM7OztBQ0hqQixNQUFNLFdBQVc7QUFBQSxJQUNmLFNBQVMsb0JBQUksSUFBSTtBQUFBLElBQ2pCLFdBQVcsb0JBQUksUUFBUTtBQUFBLEVBQ3pCOzs7QUNQQSxNQUFJLE9BQU87QUFFWCxNQUFNLFVBQVU7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUEsSUFNZCxLQUFLLEtBQUs7QUFBRSxhQUFPO0FBQUEsSUFBSztBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUEsSUFNeEIsSUFBSSxNQUFNO0FBQ1IsVUFBSSxDQUFDLEtBQU0sT0FBTSxJQUFJLE1BQU0saUNBQWlDO0FBQzVELGFBQU87QUFBQSxJQUNUO0FBQUE7QUFBQSxJQUdBLElBQUksT0FBVztBQUFFLGFBQU8sUUFBUSxJQUFJO0FBQUEsSUFBTTtBQUFBO0FBQUEsSUFHMUMsSUFBSSxVQUFXO0FBQUUsYUFBTyxRQUFRLElBQUk7QUFBQSxJQUFTO0FBQUE7QUFBQSxJQUc3QyxJQUFJLFFBQVc7QUFBRSxhQUFPLFFBQVEsSUFBSTtBQUFBLElBQU87QUFBQTtB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

  return typeof DESSERT !== 'undefined' ? DESSERT : (typeof exports !== 'undefined' ? exports : {});
}));