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

  // src/components/card.js
  function cardComponent(el) {
    const toggleBtn = el.querySelector("[data-dessert-card-toggle]");
    const body = el.querySelector(".dessert-card-body");
    if (toggleBtn && body) {
      toggleBtn.addEventListener("click", () => {
        const isCollapsed = el.classList.contains("dessert-card-collapsed");
        if (isCollapsed) {
          removeClass(el, "card-collapsed");
          body.style.display = "block";
          helpers.controller?.emit("card:expand", { el });
        } else {
          addClass(el, "card-collapsed");
          body.style.display = "none";
          helpers.controller?.emit("card:collapse", { el });
        }
      });
    }
    const closeBtn = el.querySelector("[data-dessert-card-close]");
    if (closeBtn) {
      closeBtn.addEventListener("click", () => {
        el.style.opacity = "0";
        el.style.transform = "scale(0.95)";
        setTimeout(() => {
          el.remove();
          helpers.controller?.emit("card:dismiss", { el });
        }, 200);
      });
    }
  }

  // src/components/badge.js
  function badgeComponent(el) {
    const dismissBtn = el.querySelector("[data-dessert-badge-dismiss]");
    if (dismissBtn) {
      dismissBtn.addEventListener("click", (e) => {
        e.stopPropagation();
        el.style.opacity = "0";
        setTimeout(() => {
          el.remove();
          helpers.controller?.emit("badge:dismiss", { el });
        }, 150);
      });
    }
  }

  // src/components/components.js
  var components = {
    modal: modalComponent,
    dropdown: dropdownComponent,
    tabs: tabsComponent,
    accordion: accordionComponent,
    card: cardComponent,
    badge: badgeComponent
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
//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAic291cmNlcyI6IFsic3JjL2luZGV4LmpzIiwgInNyYy9jb3JlL2NvbnN0YW50cy5qcyIsICJzcmMvY29yZS9zdGF0ZS5qcyIsICJzcmMvY29yZS9yZWdpc3RyeS5qcyIsICJzcmMvdXRpbHMvYnJpZGdlLmpzIiwgInNyYy91dGlscy9sb2dnZXIuanMiLCAic3JjL2NvcmUvY29udHJvbGxlci5qcyIsICJzcmMvY29yZS9ERVNTRVJULmpzIiwgInNyYy91dGlscy9lc2NhcGUuanMiLCAic3JjL2NvbXBvbmVudHMvbW9kYWwuanMiLCAic3JjL3V0aWxzL2NsYXNzTmFtZXMuanMiLCAic3JjL2NvbXBvbmVudHMvZHJvcGRvd24uanMiLCAic3JjL2NvbXBvbmVudHMvdGFicy5qcyIsICJzcmMvY29tcG9uZW50cy9hY2NvcmRpb24uanMiLCAic3JjL2NvbXBvbmVudHMvY2FyZC5qcyIsICJzcmMvY29tcG9uZW50cy9iYWRnZS5qcyIsICJzcmMvY29tcG9uZW50cy9jb21wb25lbnRzLmpzIiwgInNyYy9hdXRvaW5pdC9hdXRvSW5pdC5qcyIsICJzcmMvYXV0b2luaXQvZXNjYXBlS2V5LmpzIiwgInNyYy91dGlscy91cmwuanMiLCAic3JjL2luamVjdC9pbmplY3RDU1MuanMiLCAic3JjL2luamVjdC9pbmplY3RMb2FkZXIuanMiLCAic3JjL2FwaS9tb2RhbEFQSS5qcyIsICJzcmMvYXBpL2FsZXJ0QVBJLmpzIiwgInNyYy9hcGkvZGVzdHJveUFQSS5qcyIsICJzcmMvdXRpbHMvYXR0cmlidXRlcy5qcyJdLAogICJzb3VyY2VzQ29udGVudCI6IFsiLyoqXG4gKiBAZmlsZSBERVNTRVJUIG1haW4gZW50cnkgXHUyMDE0IHRoZSBvbmx5IGluZGV4LmpzIGluIHRoZSBwcm9qZWN0LlxuICovXG5cbmltcG9ydCB7IERFU1NFUlQgfSBmcm9tICcuL2NvcmUvREVTU0VSVC5qcyc7XG5pbXBvcnQgeyBEZXNzZXJ0Q29udHJvbGxlciB9IGZyb20gJy4vY29yZS9jb250cm9sbGVyLmpzJztcbmltcG9ydCB7IGNvbXBvbmVudHMgfSBmcm9tICcuL2NvbXBvbmVudHMvY29tcG9uZW50cy5qcyc7XG5pbXBvcnQgeyBhdXRvSW5pdCB9IGZyb20gJy4vYXV0b2luaXQvYXV0b0luaXQuanMnO1xuaW1wb3J0IHsgYmluZEVzY2FwZUtleSB9IGZyb20gJy4vYXV0b2luaXQvZXNjYXBlS2V5LmpzJztcbmltcG9ydCB7IGluamVjdENTUyB9IGZyb20gJy4vaW5qZWN0L2luamVjdENTUy5qcyc7XG5pbXBvcnQgeyBpbmplY3RMb2FkZXIgfSBmcm9tICcuL2luamVjdC9pbmplY3RMb2FkZXIuanMnO1xuaW1wb3J0IHsgbW9kYWxBUEkgfSBmcm9tICcuL2FwaS9tb2RhbEFQSS5qcyc7XG5pbXBvcnQgeyBhbGVydEFQSSB9IGZyb20gJy4vYXBpL2FsZXJ0QVBJLmpzJztcbmltcG9ydCB7IGRlc3Ryb3lBUEkgfSBmcm9tICcuL2FwaS9kZXN0cm95QVBJLmpzJztcbmltcG9ydCB7IGFkZENsYXNzLCByZW1vdmVDbGFzcywgdG9nZ2xlQ2xhc3MgfSBmcm9tICcuL3V0aWxzL2NsYXNzTmFtZXMuanMnO1xuaW1wb3J0IHsgc2V0RGF0YSwgZ2V0RGF0YSB9IGZyb20gJy4vdXRpbHMvYXR0cmlidXRlcy5qcyc7XG5cbi8qIDEuIGF0dGFjaCBwdWJsaWMgQVBJIG9udG8gcHJvdG90eXBlICovXG5ERVNTRVJULnByb3RvdHlwZS5jb21wb25lbnRzICA9IGNvbXBvbmVudHM7XG5ERVNTRVJULnByb3RvdHlwZS5tb2RhbCAgICAgICA9IG1vZGFsQVBJO1xuREVTU0VSVC5wcm90b3R5cGUuYWxlcnQgICAgICAgPSBhbGVydEFQSTtcbkRFU1NFUlQucHJvdG90eXBlLmRlc3Ryb3kgICAgID0gZGVzdHJveUFQSTtcbkRFU1NFUlQucHJvdG90eXBlLmF1dG9Jbml0ICAgID0gYXV0b0luaXQ7XG5ERVNTRVJULnByb3RvdHlwZS5hZGRDbGFzcyAgICA9IGFkZENsYXNzO1xuREVTU0VSVC5wcm90b3R5cGUucmVtb3ZlQ2xhc3MgPSByZW1vdmVDbGFzcztcbkRFU1NFUlQucHJvdG90eXBlLnRvZ2dsZUNsYXNzID0gdG9nZ2xlQ2xhc3M7XG5ERVNTRVJULnByb3RvdHlwZS5zZXREYXRhICAgICA9IHNldERhdGE7XG5ERVNTRVJULnByb3RvdHlwZS5nZXREYXRhICAgICA9IGdldERhdGE7XG5cbi8qKlxuICogQGRlc2NyaXB0aW9uIFNpbmdsZXRvbiBERVNTRVJUIGluc3RhbmNlLlxuICogQHR5cGUge0RFU1NFUlR9XG4gKi9cbmNvbnN0IERFU1NFUlRfSU5TVEFOQ0UgPSBuZXcgREVTU0VSVCgpO1xuXG4vKiAyLiBzaWRlIGVmZmVjdHM6IGluamVjdCBhc3NldHMgJiBhdXRvLWJvb3QgKi9cbmlmICh0eXBlb2YgZG9jdW1lbnQgIT09ICd1bmRlZmluZWQnKSB7XG4gIGluamVjdENTUygpO1xuICBpbmplY3RMb2FkZXIoKTtcblxuICBjb25zdCBib290ID0gKCkgPT4ge1xuICAgIERFU1NFUlRfSU5TVEFOQ0UuaW5pdCgpO1xuICAgIGJpbmRFc2NhcGVLZXkoREVTU0VSVF9JTlNUQU5DRSk7XG4gIH07XG5cbiAgaWYgKGRvY3VtZW50LnJlYWR5U3RhdGUgPT09ICdsb2FkaW5nJykge1xuICAgIGRvY3VtZW50LmFkZEV2ZW50TGlzdGVuZXIoJ0RPTUNvbnRlbnRMb2FkZWQnLCBib290KTtcbiAgfSBlbHNlIHtcbiAgICBib290KCk7XG4gIH1cbn1cblxuZXhwb3J0IHsgREVTU0VSVCwgREVTU0VSVF9JTlNUQU5DRSwgRGVzc2VydENvbnRyb2xsZXIgfTtcbmV4cG9ydCB7IERFU1NFUlRfSU5TVEFOQ0UgYXMgZGVmYXVsdCB9O1xuIiwgIi8qKlxuICogQGZpbGUgQ29uc3RhbnRzIGZvciBERVNTRVJUIGNvcmUuXG4gKi9cblxuLyoqXG4gKiBAZGVzY3JpcHRpb24gTGlicmFyeSB2ZXJzaW9uLlxuICogQHR5cGUge3N0cmluZ31cbiAqIEBjb25zdGFudFxuICovXG5jb25zdCBWRVJTSU9OID0gJzIuMC4wJztcblxuLyoqXG4gKiBAZGVzY3JpcHRpb24gQ1NTIHByZWZpeCB1c2VkIGFjcm9zcyB0aGUgbGlicmFyeS5cbiAqIEB0eXBlIHtzdHJpbmd9XG4gKiBAY29uc3RhbnRcbiAqL1xuY29uc3QgUFJFRklYID0gJ2Rlc3NlcnQnO1xuXG4vKipcbiAqIEBkZXNjcmlwdGlvbiBEYXRhIGF0dHJpYnV0ZSB1c2VkIGZvciBhdXRvLWluaXQuXG4gKiBAdHlwZSB7c3RyaW5nfVxuICogQGNvbnN0YW50XG4gKi9cbmNvbnN0IERBVEFfQVRUUiA9ICdkYXRhLWRlc3NlcnQnO1xuXG4vKipcbiAqIEB0eXBlZGVmIHtPYmplY3R9IERlc3NlcnRPcHRpb25zXG4gKiBAcHJvcGVydHkge2Jvb2xlYW59IFthdXRvSW5pdD10cnVlXVxuICogQHByb3BlcnR5IHtib29sZWFufSBbZGVidWc9ZmFsc2VdXG4gKiBAcHJvcGVydHkge2Jvb2xlYW59IFtjbG9zZU9uRXNjYXBlPXRydWVdXG4gKi9cblxuLyoqXG4gKiBAZGVzY3JpcHRpb24gRGVmYXVsdCBvcHRpb25zIGZvciBERVNTRVJULlxuICogQHR5cGUge1JlYWRvbmx5PERlc3NlcnRPcHRpb25zPn1cbiAqIEBjb25zdGFudFxuICovXG5jb25zdCBERUZBVUxUX09QVElPTlMgPSBPYmplY3QuZnJlZXplKHtcbiAgYXV0b0luaXQ6IHRydWUsXG4gIGRlYnVnOiBmYWxzZSxcbiAgY2xvc2VPbkVzY2FwZTogdHJ1ZSxcbn0pO1xuXG5leHBvcnQgeyBWRVJTSU9OLCBQUkVGSVgsIERBVEFfQVRUUiwgREVGQVVMVF9PUFRJT05TIH07XG4iLCAiLyoqXG4gKiBAZmlsZSBTaGFyZWQgbXV0YWJsZSBzdGF0ZS5cbiAqL1xuXG4vKipcbiAqIEB0eXBlZGVmIHtPYmplY3R9IERlc3NlcnRTdGF0ZVxuICogQHByb3BlcnR5IHtib29sZWFufSBlc2NCb3VuZFxuICogQHByb3BlcnR5IHtIVE1MRWxlbWVudHxudWxsfSBsYXN0Rm9jdXNlZFxuICovXG5cbi8qKlxuICogQGRlc2NyaXB0aW9uIEdsb2JhbCBydW50aW1lIHN0YXRlLlxuICogQHR5cGUge0Rlc3NlcnRTdGF0ZX1cbiAqL1xuY29uc3Qgc3RhdGUgPSB7XG4gIGVzY0JvdW5kOiBmYWxzZSxcbiAgbGFzdEZvY3VzZWQ6IG51bGwsXG59O1xuXG4vKipcbiAqIEBkZXNjcmlwdGlvbiBHbG9iYWwgb3B0aW9ucyBtdXRhdGVkIGJ5IERFU1NFUlQuaW5pdCgpLlxuICogQHR5cGUge09iamVjdDxzdHJpbmcsICo+fVxuICovXG5jb25zdCBvcHRpb25zID0ge307XG5cbmV4cG9ydCB7IHN0YXRlLCBvcHRpb25zIH07XG4iLCAiLyoqXG4gKiBAZmlsZSBJbnRlcm5hbCBwbHVnaW4gYW5kIGluc3RhbmNlIHJlZ2lzdHJpZXMuXG4gKi9cblxuLyoqXG4gKiBAdHlwZWRlZiB7T2JqZWN0fSBJbnN0YW5jZVJlY29yZFxuICogQHByb3BlcnR5IHtzdHJpbmd9IHR5cGVcbiAqIEBwcm9wZXJ0eSB7QXJyYXk8W0V2ZW50VGFyZ2V0LCBzdHJpbmcsIEV2ZW50TGlzdGVuZXJdPn0gaGFuZGxlcnNcbiAqL1xuXG4vKipcbiAqIEB0eXBlZGVmIHtPYmplY3R9IERlc3NlcnRSZWdpc3RyeVxuICogQHByb3BlcnR5IHtNYXA8c3RyaW5nLCAqPn0gcGx1Z2luc1xuICogQHByb3BlcnR5IHtXZWFrTWFwPEhUTUxFbGVtZW50LCBJbnN0YW5jZVJlY29yZD59IGluc3RhbmNlc1xuICovXG5cbi8qKlxuICogQGRlc2NyaXB0aW9uIFBsdWdpbiBhbmQgaW5zdGFuY2UgcmVnaXN0cmllcy5cbiAqIEB0eXBlIHtEZXNzZXJ0UmVnaXN0cnl9XG4gKi9cbmNvbnN0IHJlZ2lzdHJ5ID0ge1xuICBwbHVnaW5zOiBuZXcgTWFwKCksXG4gIGluc3RhbmNlczogbmV3IFdlYWtNYXAoKSxcbn07XG5cbmV4cG9ydCB7IHJlZ2lzdHJ5IH07XG4iLCAiLyoqXG4gKiBAZmlsZSBJbnRlcm5hbCBESSBicmlkZ2UgZm9yIHByaXZhdGUgc3RhdGUgYWNjZXNzLlxuICovXG5cbi8qKlxuICogQHR5cGVkZWYge09iamVjdH0gSGVscGVyQ29udGV4dFxuICogQHByb3BlcnR5IHsqfSBjb3JlXG4gKiBAcHJvcGVydHkge09iamVjdDxzdHJpbmcsICo+fSBvcHRpb25zXG4gKiBAcHJvcGVydHkgeyp9IHN0YXRlXG4gKiBAcHJvcGVydHkgeyp9IHJlZ2lzdHJ5XG4gKi9cblxuLyoqXG4gKiBAcHJpdmF0ZVxuICogQHR5cGUge0hlbHBlckNvbnRleHR8bnVsbH1cbiAqL1xubGV0IF9jdHggPSBudWxsO1xuXG5jb25zdCBoZWxwZXJzID0ge1xuICAvKipcbiAgICogQGRlc2NyaXB0aW9uIEJpbmQgcHJpdmF0ZSBjb250ZXh0IG9uY2UgZnJvbSB0aGUgREVTU0VSVCBjb25zdHJ1Y3Rvci5cbiAgICogQHBhcmFtIHtIZWxwZXJDb250ZXh0fSBjdHhcbiAgICogQHJldHVybnMge3ZvaWR9XG4gICAqL1xuICBiaW5kKGN0eCkgeyBfY3R4ID0gY3R4OyB9LFxuXG4gIC8qKlxuICAgKiBAZGVzY3JpcHRpb24gUmV0cmlldmUgdGhlIGN1cnJlbnQgaGVscGVyIGNvbnRleHQuXG4gICAqIEByZXR1cm5zIHtIZWxwZXJDb250ZXh0fVxuICAgKi9cbiAgZ2V0IGN0eCgpIHtcbiAgICBpZiAoIV9jdHgpIHRocm93IG5ldyBFcnJvcignW0RFU1NFUlRdIGhlbHBlcnMgbm90IGJvdW5kIHlldCcpO1xuICAgIHJldHVybiBfY3R4O1xuICB9LFxuXG4gIC8qKiBAcmV0dXJucyB7Kn0gKi9cbiAgZ2V0IGNvcmUoKSAgICAgeyByZXR1cm4gaGVscGVycy5jdHguY29yZTsgfSxcblxuICAvKiogQHJldHVybnMge09iamVjdDxzdHJpbmcsICo+fSAqL1xuICBnZXQgb3B0aW9ucygpICB7IHJldHVybiBoZWxwZXJzLmN0eC5vcHRpb25zOyB9LFxuXG4gIC8qKiBAcmV0dXJucyB7Kn0gKi9cbiAgZ2V0IHN0YXRlKCkgICAgeyByZXR1cm4gaGVscGVycy5jdHguc3RhdGU7IH0sXG5cbiAgLyoqIEByZXR1cm5zIHsqfSAqL1xuICBnZXQgcmVnaXN0cnkoKSB7IHJldHVybiBoZWxwZXJzLmN0eC5yZWdpc3RyeTsgfSxcblxuICAvKiogQHJldHVybnMgeyp9ICovXG4gIGdldCBjb250cm9sbGVyKCkgeyByZXR1cm4gaGVscGVycy5jdHguY29yZT8uY29udHJvbGxlcjsgfSxcbn07XG5cbmV4cG9ydCB7IGhlbHBlcnMgfTtcbiIsICIvKipcbiAqIEBmaWxlIERlYnVnIGxvZ2dlci5cbiAqL1xuXG5pbXBvcnQgeyBoZWxwZXJzIH0gZnJvbSAnLi9icmlkZ2UuanMnO1xuXG4vKipcbiAqIEBkZXNjcmlwdGlvbiBMb2cgYSBtZXNzYWdlIHdoZW4gZGVidWcgbW9kZSBpcyBlbmFibGVkLlxuICogQHBhcmFtIHsuLi4qfSBhcmdzXG4gKiBAcmV0dXJucyB7dm9pZH1cbiAqL1xuZnVuY3Rpb24gbG9nKC4uLmFyZ3MpIHtcbiAgaWYgKGhlbHBlcnMub3B0aW9ucz8uZGVidWcpIGNvbnNvbGUubG9nKCdbREVTU0VSVF0nLCAuLi5hcmdzKTtcbn1cblxuZXhwb3J0IHsgbG9nIH07XG4iLCAiLyoqXG4gKiBAZmlsZSBERVNTRVJUIENvbnRyb2xsZXIgXHUyMDE0IENlbnRyYWxpemVkIEV2ZW50IEJ1cywgQ29tcG9uZW50IExpZmVjeWNsZSwgJiBTdGF0ZSBIdWIuXG4gKi9cblxuY2xhc3MgRGVzc2VydENvbnRyb2xsZXIge1xuICAvKipcbiAgICogQHBhcmFtIHtPYmplY3R9IFtjdHg9e31dXG4gICAqL1xuICBjb25zdHJ1Y3RvcihjdHggPSB7fSkge1xuICAgIC8qKiBAdHlwZSB7aW1wb3J0KCcuL0RFU1NFUlQuanMnKS5ERVNTRVJUfG51bGx9ICovXG4gICAgdGhpcy5jb3JlID0gY3R4LmNvcmUgfHwgbnVsbDtcbiAgICAvKiogQHR5cGUge01hcDxzdHJpbmcsIFNldDxGdW5jdGlvbj4+fSAqL1xuICAgIHRoaXMuX2xpc3RlbmVycyA9IG5ldyBNYXAoKTtcbiAgICAvKiogQHR5cGUge01hcDxzdHJpbmcsIGFueT59ICovXG4gICAgdGhpcy5fc3RhdGUgPSBuZXcgTWFwKCk7XG4gICAgLyoqIEB0eXBlIHtTZXQ8SFRNTEVsZW1lbnQ+fSAqL1xuICAgIHRoaXMuX2FjdGl2ZUluc3RhbmNlcyA9IG5ldyBTZXQoKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBCaW5kIGNvcmUgaW5zdGFuY2UgcmVmZXJlbmNlLlxuICAgKiBAcGFyYW0ge09iamVjdH0gY29yZVxuICAgKi9cbiAgYmluZENvcmUoY29yZSkge1xuICAgIHRoaXMuY29yZSA9IGNvcmU7XG4gIH1cblxuICAvKipcbiAgICogUmVnaXN0ZXIgYW4gZXZlbnQgbGlzdGVuZXIgKFB1Yi9TdWIpLlxuICAgKiBAcGFyYW0ge3N0cmluZ30gZXZlbnRcbiAgICogQHBhcmFtIHtGdW5jdGlvbn0gaGFuZGxlclxuICAgKiBAcmV0dXJucyB7KCkgPT4gdm9pZH0gVW5zdWJzY3JpYmUgZnVuY3Rpb25cbiAgICovXG4gIG9uKGV2ZW50LCBoYW5kbGVyKSB7XG4gICAgaWYgKCF0aGlzLl9saXN0ZW5lcnMuaGFzKGV2ZW50KSkge1xuICAgICAgdGhpcy5fbGlzdGVuZXJzLnNldChldmVudCwgbmV3IFNldCgpKTtcbiAgICB9XG4gICAgdGhpcy5fbGlzdGVuZXJzLmdldChldmVudCkuYWRkKGhhbmRsZXIpO1xuICAgIHJldHVybiAoKSA9PiB0aGlzLm9mZihldmVudCwgaGFuZGxlcik7XG4gIH1cblxuICAvKipcbiAgICogUmVtb3ZlIGFuIGV2ZW50IGxpc3RlbmVyLlxuICAgKiBAcGFyYW0ge3N0cmluZ30gZXZlbnRcbiAgICogQHBhcmFtIHtGdW5jdGlvbn0gaGFuZGxlclxuICAgKi9cbiAgb2ZmKGV2ZW50LCBoYW5kbGVyKSB7XG4gICAgY29uc3QgaGFuZGxlcnMgPSB0aGlzLl9saXN0ZW5lcnMuZ2V0KGV2ZW50KTtcbiAgICBpZiAoaGFuZGxlcnMpIHtcbiAgICAgIGhhbmRsZXJzLmRlbGV0ZShoYW5kbGVyKTtcbiAgICAgIGlmIChoYW5kbGVycy5zaXplID09PSAwKSB0aGlzLl9saXN0ZW5lcnMuZGVsZXRlKGV2ZW50KTtcbiAgICB9XG4gIH1cblxuICAvKipcbiAgICogRW1pdCBhbiBldmVudCB0byBhbGwgc3Vic2NyaWJlcnMuXG4gICAqIEBwYXJhbSB7c3RyaW5nfSBldmVudFxuICAgKiBAcGFyYW0geyp9IFtwYXlsb2FkXVxuICAgKi9cbiAgZW1pdChldmVudCwgcGF5bG9hZCkge1xuICAgIGNvbnN0IGhhbmRsZXJzID0gdGhpcy5fbGlzdGVuZXJzLmdldChldmVudCk7XG4gICAgaWYgKGhhbmRsZXJzKSB7XG4gICAgICBoYW5kbGVycy5mb3JFYWNoKChmbikgPT4ge1xuICAgICAgICB0cnkge1xuICAgICAgICAgIGZuKHBheWxvYWQpO1xuICAgICAgICB9IGNhdGNoIChlcnIpIHtcbiAgICAgICAgICBjb25zb2xlLmVycm9yKGBbREVTU0VSVCBDb250cm9sbGVyXSBFcnJvciBpbiBsaXN0ZW5lciBmb3IgXCIke2V2ZW50fVwiOmAsIGVycik7XG4gICAgICAgIH1cbiAgICAgIH0pO1xuICAgIH1cbiAgICAvLyBBbHNvIGRpc3BhdGNoIGFzIGEgbmF0aXZlIEN1c3RvbUV2ZW50IG9uIHdpbmRvdyBmb3IgZXh0ZXJuYWwgaW50ZWdyYXRpb25zXG4gICAgaWYgKHR5cGVvZiB3aW5kb3cgIT09ICd1bmRlZmluZWQnICYmIHR5cGVvZiB3aW5kb3cuZGlzcGF0Y2hFdmVudCA9PT0gJ2Z1bmN0aW9uJyAmJiB0eXBlb2YgQ3VzdG9tRXZlbnQgIT09ICd1bmRlZmluZWQnKSB7XG4gICAgICB3aW5kb3cuZGlzcGF0Y2hFdmVudChuZXcgQ3VzdG9tRXZlbnQoYGRlc3NlcnQ6JHtldmVudH1gLCB7IGRldGFpbDogcGF5bG9hZCB9KSk7XG4gICAgfVxuICB9XG5cbiAgLyoqXG4gICAqIFNldCBnbG9iYWwgY29udHJvbGxlciBzdGF0ZSBrZXktdmFsdWUuXG4gICAqIEBwYXJhbSB7c3RyaW5nfSBrZXlcbiAgICogQHBhcmFtIHsqfSB2YWx1ZVxuICAgKi9cbiAgc2V0U3RhdGUoa2V5LCB2YWx1ZSkge1xuICAgIGNvbnN0IHByZXYgPSB0aGlzLl9zdGF0ZS5nZXQoa2V5KTtcbiAgICB0aGlzLl9zdGF0ZS5zZXQoa2V5LCB2YWx1ZSk7XG4gICAgdGhpcy5lbWl0KCdzdGF0ZTpjaGFuZ2UnLCB7IGtleSwgdmFsdWUsIHByZXYgfSk7XG4gIH1cblxuICAvKipcbiAgICogR2V0IGNvbnRyb2xsZXIgc3RhdGUuXG4gICAqIEBwYXJhbSB7c3RyaW5nfSBrZXlcbiAgICogQHBhcmFtIHsqfSBbZmFsbGJhY2s9bnVsbF1cbiAgICogQHJldHVybnMgeyp9XG4gICAqL1xuICBnZXRTdGF0ZShrZXksIGZhbGxiYWNrID0gbnVsbCkge1xuICAgIHJldHVybiB0aGlzLl9zdGF0ZS5oYXMoa2V5KSA/IHRoaXMuX3N0YXRlLmdldChrZXkpIDogZmFsbGJhY2s7XG4gIH1cblxuICAvKipcbiAgICogUmVnaXN0ZXIgYW4gYWN0aXZlIGNvbXBvbmVudCBlbGVtZW50IGluIERPTS5cbiAgICogQHBhcmFtIHtIVE1MRWxlbWVudH0gZWxcbiAgICovXG4gIHJlZ2lzdGVySW5zdGFuY2UoZWwpIHtcbiAgICB0aGlzLl9hY3RpdmVJbnN0YW5jZXMuYWRkKGVsKTtcbiAgICB0aGlzLmVtaXQoJ2luc3RhbmNlOnJlZ2lzdGVyZWQnLCB7IGVsIH0pO1xuICB9XG5cbiAgLyoqXG4gICAqIFVucmVnaXN0ZXIgYW4gYWN0aXZlIGNvbXBvbmVudCBlbGVtZW50LlxuICAgKiBAcGFyYW0ge0hUTUxFbGVtZW50fSBlbFxuICAgKi9cbiAgdW5yZWdpc3Rlckluc3RhbmNlKGVsKSB7XG4gICAgdGhpcy5fYWN0aXZlSW5zdGFuY2VzLmRlbGV0ZShlbCk7XG4gICAgdGhpcy5lbWl0KCdpbnN0YW5jZTp1bnJlZ2lzdGVyZWQnLCB7IGVsIH0pO1xuICB9XG5cbiAgLyoqXG4gICAqIENsb3NlIGFsbCBhY3RpdmUgcG9wdXBzLCBkcm9wZG93bnMsIGFuZCBtb2RhbHMgZ2xvYmFsbHkuXG4gICAqL1xuICBjbG9zZUFsbCgpIHtcbiAgICBpZiAodHlwZW9mIGRvY3VtZW50ID09PSAndW5kZWZpbmVkJykgcmV0dXJuO1xuXG4gICAgLy8gQ2xvc2UgYWxsIG9wZW4gbW9kYWxzXG4gICAgZG9jdW1lbnQucXVlcnlTZWxlY3RvckFsbCgnLmRlc3NlcnQtbW9kYWwuZGVzc2VydC1zaG93JykuZm9yRWFjaCgobW9kYWwpID0+IHtcbiAgICAgIHRoaXMuY29yZT8ubW9kYWw/LmNsb3NlKG1vZGFsKTtcbiAgICB9KTtcblxuICAgIC8vIENsb3NlIGFsbCBvcGVuIGRyb3Bkb3duIG1lbnVzXG4gICAgZG9jdW1lbnQucXVlcnlTZWxlY3RvckFsbCgnLmRlc3NlcnQtZHJvcGRvd24tbWVudS5kZXNzZXJ0LXNob3cnKS5mb3JFYWNoKChtZW51KSA9PiB7XG4gICAgICBtZW51LmNsYXNzTGlzdC5yZW1vdmUoJ2Rlc3NlcnQtc2hvdycpO1xuICAgIH0pO1xuXG4gICAgdGhpcy5lbWl0KCdkaXNtaXNzOmFsbCcpO1xuICB9XG5cbiAgLyoqXG4gICAqIFJlZnJlc2ggYW5kIHJlLXJ1biBET00gY29tcG9uZW50IGJpbmRpbmdzLlxuICAgKi9cbiAgcmVmcmVzaCgpIHtcbiAgICBpZiAodGhpcy5jb3JlKSB7XG4gICAgICB0aGlzLmNvcmUuYXV0b0luaXQ/LigpO1xuICAgICAgdGhpcy5lbWl0KCdsaWZlY3ljbGU6cmVmcmVzaGVkJyk7XG4gICAgfVxuICB9XG5cbiAgLyoqXG4gICAqIFJlc2V0IGFsbCBjb250cm9sbGVyIGxpc3RlbmVycyBhbmQgc3RhdGVzLlxuICAgKi9cbiAgcmVzZXQoKSB7XG4gICAgdGhpcy5fbGlzdGVuZXJzLmNsZWFyKCk7XG4gICAgdGhpcy5fc3RhdGUuY2xlYXIoKTtcbiAgICB0aGlzLl9hY3RpdmVJbnN0YW5jZXMuY2xlYXIoKTtcbiAgICB0aGlzLmVtaXQoJ2xpZmVjeWNsZTpyZXNldCcpO1xuICB9XG59XG5cbmV4cG9ydCB7IERlc3NlcnRDb250cm9sbGVyIH07XG4iLCAiLyoqXG4gKiBAZmlsZSBDb3JlIERFU1NFUlQgY2xhc3MuXG4gKi9cblxuaW1wb3J0IHsgVkVSU0lPTiwgUFJFRklYLCBERUZBVUxUX09QVElPTlMgfSBmcm9tICcuL2NvbnN0YW50cy5qcyc7XG5pbXBvcnQgeyBzdGF0ZSwgb3B0aW9ucyB9IGZyb20gJy4vc3RhdGUuanMnO1xuaW1wb3J0IHsgcmVnaXN0cnkgfSBmcm9tICcuL3JlZ2lzdHJ5LmpzJztcbmltcG9ydCB7IGhlbHBlcnMgfSBmcm9tICcuLi91dGlscy9icmlkZ2UuanMnO1xuaW1wb3J0IHsgbG9nIH0gZnJvbSAnLi4vdXRpbHMvbG9nZ2VyLmpzJztcbmltcG9ydCB7IERlc3NlcnRDb250cm9sbGVyIH0gZnJvbSAnLi9jb250cm9sbGVyLmpzJztcblxuLyoqXG4gKiBAdHlwZWRlZiB7T2JqZWN0fSBEZXNzZXJ0Q29uZmlnXG4gKiBAcHJvcGVydHkge2Jvb2xlYW59IFthdXRvSW5pdF1cbiAqIEBwcm9wZXJ0eSB7Ym9vbGVhbn0gW2RlYnVnXVxuICogQHByb3BlcnR5IHtib29sZWFufSBbY2xvc2VPbkVzY2FwZV1cbiAqIEBwcm9wZXJ0eSB7Ym9vbGVhbn0gW2ZvcmNlXVxuICovXG5cbi8qKlxuICogQGRlc2NyaXB0aW9uIENvcmUgREVTU0VSVCBjbGFzcy5cbiAqL1xuY2xhc3MgREVTU0VSVCB7XG4gIC8qKlxuICAgKiBAcHJpdmF0ZVxuICAgKiBAdHlwZSB7REVTU0VSVHxudWxsfVxuICAgKi9cbiAgc3RhdGljICNpbnN0YW5jZSA9IG51bGw7XG5cbiAgLyoqXG4gICAqIEBkZXNjcmlwdGlvbiBMaWJyYXJ5IHZlcnNpb24uXG4gICAqIEByZXR1cm5zIHtzdHJpbmd9XG4gICAqL1xuICBzdGF0aWMgZ2V0IHZlcnNpb24oKSB7IHJldHVybiBWRVJTSU9OOyB9XG5cbiAgLyoqXG4gICAqIEBkZXNjcmlwdGlvbiBDcmVhdGUgYSBmcmVzaCBpbnN0YW5jZSBieXBhc3Npbmcgc2luZ2xldG9uLlxuICAgKiBAcGFyYW0ge0Rlc3NlcnRDb25maWd9IFtjZmc9e31dXG4gICAqIEByZXR1cm5zIHtERVNTRVJUfVxuICAgKi9cbiAgc3RhdGljIGNyZWF0ZShjZmcgPSB7fSkge1xuICAgIHJldHVybiBuZXcgREVTU0VSVCh7IC4uLmNmZywgZm9yY2U6IHRydWUgfSk7XG4gIH1cblxuICAvKipcbiAgICogQHBhcmFtIHtEZXNzZXJ0Q29uZmlnfSBbY2ZnPXt9XVxuICAgKi9cbiAgY29uc3RydWN0b3IoY2ZnID0ge30pIHtcbiAgICBpZiAoREVTU0VSVC4jaW5zdGFuY2UgJiYgIWNmZy5mb3JjZSkgcmV0dXJuIERFU1NFUlQuI2luc3RhbmNlO1xuXG4gICAgT2JqZWN0LmFzc2lnbihvcHRpb25zLCBERUZBVUxUX09QVElPTlMsIGNmZyk7XG5cbiAgICAvKipcbiAgICAgKiBAZGVzY3JpcHRpb24gTGlicmFyeSB2ZXJzaW9uLlxuICAgICAqIEB0eXBlIHtzdHJpbmd9XG4gICAgICovXG4gICAgdGhpcy52ZXJzaW9uID0gVkVSU0lPTjtcblxuICAgIC8qKlxuICAgICAqIEBkZXNjcmlwdGlvbiBDU1MgcHJlZml4LlxuICAgICAqIEB0eXBlIHtzdHJpbmd9XG4gICAgICovXG4gICAgdGhpcy5wcmVmaXggPSBQUkVGSVg7XG5cbiAgICBoZWxwZXJzLmJpbmQoeyBjb3JlOiB0aGlzLCBvcHRpb25zLCBzdGF0ZSwgcmVnaXN0cnkgfSk7XG5cbiAgICAvKipcbiAgICAgKiBAZGVzY3JpcHRpb24gQ2VudHJhbGl6ZWQgY29udHJvbGxlciBhbmQgZXZlbnQgYnVzLlxuICAgICAqIEB0eXBlIHtEZXNzZXJ0Q29udHJvbGxlcn1cbiAgICAgKi9cbiAgICB0aGlzLmNvbnRyb2xsZXIgPSBuZXcgRGVzc2VydENvbnRyb2xsZXIoeyBjb3JlOiB0aGlzIH0pO1xuXG4gICAgREVTU0VSVC4jaW5zdGFuY2UgPSB0aGlzO1xuICB9XG5cbiAgLyoqXG4gICAqIEBkZXNjcmlwdGlvbiBJbml0aWFsaXplIHRoZSBsaWJyYXJ5LlxuICAgKiBAcGFyYW0ge0Rlc3NlcnRDb25maWd9IFtleHRyYT17fV1cbiAgICogQHJldHVybnMge0RFU1NFUlR9XG4gICAqL1xuICBpbml0KGV4dHJhID0ge30pIHtcbiAgICBPYmplY3QuYXNzaWduKG9wdGlvbnMsIGV4dHJhKTtcblxuICAgIGlmIChvcHRpb25zLmF1dG9Jbml0KSB0aGlzLmF1dG9Jbml0KCk7XG5cbiAgICByZWdpc3RyeS5wbHVnaW5zLmZvckVhY2goKHBsdWdpbikgPT4gcGx1Z2luLmluaXQ/Lih0aGlzKSk7XG5cbiAgICB0aGlzLmNvbnRyb2xsZXIuZW1pdCgnaW5pdCcsIHsgdmVyc2lvbjogVkVSU0lPTiwgb3B0aW9ucyB9KTtcblxuICAgIGxvZyhgREVTU0VSVCB2JHtWRVJTSU9OfSBpbml0aWFsaXplZGApO1xuICAgIHJldHVybiB0aGlzO1xuICB9XG5cbiAgLyoqXG4gICAqIEBkZXNjcmlwdGlvbiBSZWdpc3RlciBhIHBsdWdpbi5cbiAgICogQHBhcmFtIHtzdHJpbmd9IG5hbWVcbiAgICogQHBhcmFtIHsqfSBwbHVnaW5cbiAgICogQHJldHVybnMge0RFU1NFUlR9XG4gICAqL1xuICByZWdpc3RlcihuYW1lLCBwbHVnaW4pIHtcbiAgICBpZiAocmVnaXN0cnkucGx1Z2lucy5oYXMobmFtZSkpIHJldHVybiB0aGlzO1xuICAgIHJlZ2lzdHJ5LnBsdWdpbnMuc2V0KG5hbWUsIHBsdWdpbik7XG4gICAgcGx1Z2luLmluc3RhbGw/Lih0aGlzLCBoZWxwZXJzKTtcbiAgICBsb2coJ3BsdWdpbiByZWdpc3RlcmVkOicsIG5hbWUpO1xuICAgIHJldHVybiB0aGlzO1xuICB9XG5cbiAgLyoqXG4gICAqIEBkZXNjcmlwdGlvbiBSZWdpc3RlciBhbmQgaW5pdCBhIHBsdWdpbi5cbiAgICogQHBhcmFtIHsqfSBwbHVnaW5cbiAgICogQHJldHVybnMge0RFU1NFUlR9XG4gICAqL1xuICB1c2UocGx1Z2luKSB7XG4gICAgaWYgKCFwbHVnaW4/Lm5hbWUpIHJldHVybiB0aGlzO1xuICAgIHRoaXMucmVnaXN0ZXIocGx1Z2luLm5hbWUsIHBsdWdpbik7XG4gICAgcGx1Z2luLmluaXQ/Lih0aGlzKTtcbiAgICByZXR1cm4gdGhpcztcbiAgfVxufVxuXG5leHBvcnQgeyBERVNTRVJUIH07XG4iLCAiLyoqXG4gKiBAZmlsZSBDU1Mgc2VsZWN0b3IgZXNjYXBpbmcuXG4gKi9cblxuLyoqXG4gKiBAZGVzY3JpcHRpb24gRXNjYXBlIGEgc3RyaW5nIGZvciBDU1Mgc2VsZWN0b3JzLlxuICogQHBhcmFtIHtzdHJpbmd9IHNcbiAqIEByZXR1cm5zIHtzdHJpbmd9XG4gKi9cbmZ1bmN0aW9uIGVzYyhzKSB7XG4gIHJldHVybiBnbG9iYWxUaGlzLkNTUz8uZXNjYXBlXG4gICAgPyBDU1MuZXNjYXBlKHMpXG4gICAgOiBTdHJpbmcocykucmVwbGFjZSgvXCIvZywgJ1xcXFxcIicpO1xufVxuXG5leHBvcnQgeyBlc2MgfTtcbiIsICIvKipcbiAqIEBmaWxlIE1vZGFsIGNvbXBvbmVudC5cbiAqL1xuXG5pbXBvcnQgeyBlc2MgfSBmcm9tICcuLi91dGlscy9lc2NhcGUuanMnO1xuaW1wb3J0IHsgcmVnaXN0cnkgfSBmcm9tICcuLi9jb3JlL3JlZ2lzdHJ5LmpzJztcbmltcG9ydCB7IGxvZyB9IGZyb20gJy4uL3V0aWxzL2xvZ2dlci5qcyc7XG5cbi8qKlxuICogQHR5cGVkZWYge09iamVjdH0gTW9kYWxDb3JlXG4gKiBAcHJvcGVydHkge3sgb3BlbjogKGVsOiBIVE1MRWxlbWVudCkgPT4gdm9pZCwgY2xvc2U6IChlbDogSFRNTEVsZW1lbnQpID0+IHZvaWQgfX0gbW9kYWxcbiAqL1xuXG4vKipcbiAqIEBkZXNjcmlwdGlvbiBJbml0aWFsaXplIG1vZGFsIGVsZW1lbnQuXG4gKiBAdGhpcyB7TW9kYWxDb3JlfVxuICogQHBhcmFtIHtIVE1MRWxlbWVudH0gZWxcbiAqIEByZXR1cm5zIHt2b2lkfVxuICovXG5mdW5jdGlvbiBtb2RhbENvbXBvbmVudChlbCkge1xuICBjb25zdCBjb3JlID0gdGhpcztcbiAgY29uc3Qgb3BlbkJ0bnMgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yQWxsKFxuICAgIGBbZGF0YS1kZXNzZXJ0LW9wZW49XCIke2VzYyhlbC5pZCl9XCJdYFxuICApO1xuICBjb25zdCBjbG9zZUJ0bnMgPSBlbC5xdWVyeVNlbGVjdG9yQWxsKCdbZGF0YS1kZXNzZXJ0LWNsb3NlXScpO1xuICAvKiogQHR5cGUge0FycmF5PFtFdmVudFRhcmdldCwgc3RyaW5nLCBFdmVudExpc3RlbmVyXT59ICovXG4gIGNvbnN0IGhhbmRsZXJzID0gW107XG5cbiAgb3BlbkJ0bnMuZm9yRWFjaCgoYnRuKSA9PiB7XG4gICAgY29uc3QgaCA9ICgpID0+IGNvcmUubW9kYWwub3BlbihlbCk7XG4gICAgYnRuLmFkZEV2ZW50TGlzdGVuZXIoJ2NsaWNrJywgaCk7XG4gICAgaGFuZGxlcnMucHVzaChbYnRuLCAnY2xpY2snLCBoXSk7XG4gIH0pO1xuXG4gIGNsb3NlQnRucy5mb3JFYWNoKChidG4pID0+IHtcbiAgICBjb25zdCBoID0gKCkgPT4gY29yZS5tb2RhbC5jbG9zZShlbCk7XG4gICAgYnRuLmFkZEV2ZW50TGlzdGVuZXIoJ2NsaWNrJywgaCk7XG4gICAgaGFuZGxlcnMucHVzaChbYnRuLCAnY2xpY2snLCBoXSk7XG4gIH0pO1xuXG4gIGNvbnN0IG92ZXJsYXlIID0gKGUpID0+IHsgaWYgKGUudGFyZ2V0ID09PSBlbCkgY29yZS5tb2RhbC5jbG9zZShlbCk7IH07XG4gIGVsLmFkZEV2ZW50TGlzdGVuZXIoJ2NsaWNrJywgb3ZlcmxheUgpO1xuICBoYW5kbGVycy5wdXNoKFtlbCwgJ2NsaWNrJywgb3ZlcmxheUhdKTtcblxuICByZWdpc3RyeS5pbnN0YW5jZXMuc2V0KGVsLCB7IHR5cGU6ICdtb2RhbCcsIGhhbmRsZXJzIH0pO1xuICBsb2coJ21vZGFsIGluaXQ6JywgZWwuaWQpO1xufVxuXG5leHBvcnQgeyBtb2RhbENvbXBvbmVudCB9O1xuIiwgIi8qKlxuICogQGZpbGUgUHJlZml4ZWQgY2xhc3MgaGVscGVycy5cbiAqL1xuXG5pbXBvcnQgeyBQUkVGSVggfSBmcm9tICcuLi9jb3JlL2NvbnN0YW50cy5qcyc7XG5cbi8qKlxuICogQGRlc2NyaXB0aW9uIEFkZCBhIHByZWZpeGVkIGNsYXNzLlxuICogQHBhcmFtIHtIVE1MRWxlbWVudH0gZWxcbiAqIEBwYXJhbSB7c3RyaW5nfSBuYW1lXG4gKiBAcmV0dXJucyB7SFRNTEVsZW1lbnR9XG4gKi9cbmZ1bmN0aW9uIGFkZENsYXNzKGVsLCBuYW1lKSB7XG4gIGVsLmNsYXNzTGlzdC5hZGQoYCR7UFJFRklYfS0ke25hbWV9YCk7XG4gIHJldHVybiBlbDtcbn1cblxuLyoqXG4gKiBAZGVzY3JpcHRpb24gUmVtb3ZlIGEgcHJlZml4ZWQgY2xhc3MuXG4gKiBAcGFyYW0ge0hUTUxFbGVtZW50fSBlbFxuICogQHBhcmFtIHtzdHJpbmd9IG5hbWVcbiAqIEByZXR1cm5zIHtIVE1MRWxlbWVudH1cbiAqL1xuZnVuY3Rpb24gcmVtb3ZlQ2xhc3MoZWwsIG5hbWUpIHtcbiAgZWwuY2xhc3NMaXN0LnJlbW92ZShgJHtQUkVGSVh9LSR7bmFtZX1gKTtcbiAgcmV0dXJuIGVsO1xufVxuXG4vKipcbiAqIEBkZXNjcmlwdGlvbiBUb2dnbGUgYSBwcmVmaXhlZCBjbGFzcy5cbiAqIEBwYXJhbSB7SFRNTEVsZW1lbnR9IGVsXG4gKiBAcGFyYW0ge3N0cmluZ30gbmFtZVxuICogQHBhcmFtIHtib29sZWFufSBbZm9yY2VdXG4gKiBAcmV0dXJucyB7SFRNTEVsZW1lbnR9XG4gKi9cbmZ1bmN0aW9uIHRvZ2dsZUNsYXNzKGVsLCBuYW1lLCBmb3JjZSkge1xuICBjb25zdCBjbHMgPSBgJHtQUkVGSVh9LSR7bmFtZX1gO1xuICB0eXBlb2YgZm9yY2UgPT09ICdib29sZWFuJ1xuICAgID8gZWwuY2xhc3NMaXN0LnRvZ2dsZShjbHMsIGZvcmNlKVxuICAgIDogZWwuY2xhc3NMaXN0LnRvZ2dsZShjbHMpO1xuICByZXR1cm4gZWw7XG59XG5cbmV4cG9ydCB7IGFkZENsYXNzLCByZW1vdmVDbGFzcywgdG9nZ2xlQ2xhc3MgfTtcbiIsICIvKipcbiAqIEBmaWxlIERyb3Bkb3duIGNvbXBvbmVudC5cbiAqL1xuXG5pbXBvcnQgeyByZW1vdmVDbGFzcywgdG9nZ2xlQ2xhc3MgfSBmcm9tICcuLi91dGlscy9jbGFzc05hbWVzLmpzJztcbmltcG9ydCB7IHJlZ2lzdHJ5IH0gZnJvbSAnLi4vY29yZS9yZWdpc3RyeS5qcyc7XG5pbXBvcnQgeyBsb2cgfSBmcm9tICcuLi91dGlscy9sb2dnZXIuanMnO1xuXG4vKipcbiAqIEBkZXNjcmlwdGlvbiBJbml0aWFsaXplIGRyb3Bkb3duIGVsZW1lbnQuXG4gKiBAcGFyYW0ge0hUTUxFbGVtZW50fSBlbFxuICogQHJldHVybnMge3ZvaWR9XG4gKi9cbmZ1bmN0aW9uIGRyb3Bkb3duQ29tcG9uZW50KGVsKSB7XG4gIGNvbnN0IHRyaWdnZXIgPSBlbC5xdWVyeVNlbGVjdG9yKCdbZGF0YS1kZXNzZXJ0LXRyaWdnZXJdJyk7XG4gIGNvbnN0IG1lbnUgPSBlbC5xdWVyeVNlbGVjdG9yKCdbZGF0YS1kZXNzZXJ0LW1lbnVdJyk7XG4gIGlmICghdHJpZ2dlciB8fCAhbWVudSkgcmV0dXJuO1xuXG4gIC8qKiBAdHlwZSB7QXJyYXk8W0V2ZW50VGFyZ2V0LCBzdHJpbmcsIEV2ZW50TGlzdGVuZXJdPn0gKi9cbiAgY29uc3QgaGFuZGxlcnMgPSBbXTtcblxuICBjb25zdCBvblRyaWdnZXIgPSAoZSkgPT4ge1xuICAgIGUuc3RvcFByb3BhZ2F0aW9uKCk7XG4gICAgdG9nZ2xlQ2xhc3MoZWwsICdvcGVuJyk7XG4gICAgdG9nZ2xlQ2xhc3MobWVudSwgJ3Nob3cnKTtcbiAgfTtcbiAgdHJpZ2dlci5hZGRFdmVudExpc3RlbmVyKCdjbGljaycsIG9uVHJpZ2dlcik7XG4gIGhhbmRsZXJzLnB1c2goW3RyaWdnZXIsICdjbGljaycsIG9uVHJpZ2dlcl0pO1xuXG4gIGNvbnN0IG9uT3V0c2lkZSA9IChlKSA9PiB7XG4gICAgaWYgKCFlbC5jb250YWlucygvKiogQHR5cGUge05vZGV9ICovKGUudGFyZ2V0KSkpIHtcbiAgICAgIHJlbW92ZUNsYXNzKGVsLCAnb3BlbicpO1xuICAgICAgcmVtb3ZlQ2xhc3MobWVudSwgJ3Nob3cnKTtcbiAgICB9XG4gIH07XG4gIGRvY3VtZW50LmFkZEV2ZW50TGlzdGVuZXIoJ2NsaWNrJywgb25PdXRzaWRlKTtcbiAgaGFuZGxlcnMucHVzaChbZG9jdW1lbnQsICdjbGljaycsIG9uT3V0c2lkZV0pO1xuXG4gIHJlZ2lzdHJ5Lmluc3RhbmNlcy5zZXQoZWwsIHsgdHlwZTogJ2Ryb3Bkb3duJywgaGFuZGxlcnMgfSk7XG4gIGxvZygnZHJvcGRvd24gaW5pdCcpO1xufVxuXG5leHBvcnQgeyBkcm9wZG93bkNvbXBvbmVudCB9O1xuIiwgIi8qKlxuICogQGZpbGUgVGFicyBjb21wb25lbnQuXG4gKi9cblxuaW1wb3J0IHsgYWRkQ2xhc3MsIHJlbW92ZUNsYXNzIH0gZnJvbSAnLi4vdXRpbHMvY2xhc3NOYW1lcy5qcyc7XG5pbXBvcnQgeyBlc2MgfSBmcm9tICcuLi91dGlscy9lc2NhcGUuanMnO1xuaW1wb3J0IHsgcmVnaXN0cnkgfSBmcm9tICcuLi9jb3JlL3JlZ2lzdHJ5LmpzJztcbmltcG9ydCB7IGxvZyB9IGZyb20gJy4uL3V0aWxzL2xvZ2dlci5qcyc7XG5cbi8qKlxuICogQGRlc2NyaXB0aW9uIEluaXRpYWxpemUgdGFicyBlbGVtZW50LlxuICogQHBhcmFtIHtIVE1MRWxlbWVudH0gZWxcbiAqIEByZXR1cm5zIHt2b2lkfVxuICovXG5mdW5jdGlvbiB0YWJzQ29tcG9uZW50KGVsKSB7XG4gIGNvbnN0IGJ1dHRvbnMgPSBlbC5xdWVyeVNlbGVjdG9yQWxsKCdbZGF0YS1kZXNzZXJ0LXRhYl0nKTtcbiAgY29uc3QgcGFuZWxzID0gZWwucXVlcnlTZWxlY3RvckFsbCgnW2RhdGEtZGVzc2VydC1wYW5lbF0nKTtcbiAgaWYgKCFidXR0b25zLmxlbmd0aCkgcmV0dXJuO1xuXG4gIC8qKiBAdHlwZSB7QXJyYXk8W0V2ZW50VGFyZ2V0LCBzdHJpbmcsIEV2ZW50TGlzdGVuZXJdPn0gKi9cbiAgY29uc3QgaGFuZGxlcnMgPSBbXTtcblxuICAvKipcbiAgICogQGRlc2NyaXB0aW9uIEFjdGl2YXRlIGEgdGFiIGFuZCBpdHMgcGFuZWwuXG4gICAqIEBwYXJhbSB7c3RyaW5nfSB0YXJnZXRcbiAgICogQHJldHVybnMge3ZvaWR9XG4gICAqL1xuICBjb25zdCBhY3RpdmF0ZSA9ICh0YXJnZXQpID0+IHtcbiAgICBidXR0b25zLmZvckVhY2goKGIpID0+IHJlbW92ZUNsYXNzKGIsICdhY3RpdmUnKSk7XG4gICAgcGFuZWxzLmZvckVhY2goKHApID0+IHJlbW92ZUNsYXNzKHAsICdhY3RpdmUnKSk7XG5cbiAgICBjb25zdCBidG4gPSBlbC5xdWVyeVNlbGVjdG9yKGBbZGF0YS1kZXNzZXJ0LXRhYj1cIiR7ZXNjKHRhcmdldCl9XCJdYCk7XG4gICAgY29uc3QgcGFuZWwgPSBlbC5xdWVyeVNlbGVjdG9yKGBbZGF0YS1kZXNzZXJ0LXBhbmVsPVwiJHtlc2ModGFyZ2V0KX1cIl1gKTtcbiAgICBpZiAoYnRuKSBhZGRDbGFzcyhidG4sICdhY3RpdmUnKTtcbiAgICBpZiAocGFuZWwpIGFkZENsYXNzKHBhbmVsLCAnYWN0aXZlJyk7XG4gIH07XG5cbiAgYnV0dG9ucy5mb3JFYWNoKChidG4pID0+IHtcbiAgICBjb25zdCBoID0gKCkgPT4gYWN0aXZhdGUoYnRuLmdldEF0dHJpYnV0ZSgnZGF0YS1kZXNzZXJ0LXRhYicpKTtcbiAgICBidG4uYWRkRXZlbnRMaXN0ZW5lcignY2xpY2snLCBoKTtcbiAgICBoYW5kbGVycy5wdXNoKFtidG4sICdjbGljaycsIGhdKTtcbiAgfSk7XG5cbiAgY29uc3QgaW5pdGlhbCA9IGVsLnF1ZXJ5U2VsZWN0b3IoJy5kZXNzZXJ0LXRhYi5kZXNzZXJ0LWFjdGl2ZScpO1xuICBpZiAoaW5pdGlhbCkgYWN0aXZhdGUoaW5pdGlhbC5nZXRBdHRyaWJ1dGUoJ2RhdGEtZGVzc2VydC10YWInKSk7XG5cbiAgcmVnaXN0cnkuaW5zdGFuY2VzLnNldChlbCwgeyB0eXBlOiAndGFicycsIGhhbmRsZXJzIH0pO1xuICBsb2coJ3RhYnMgaW5pdCcpO1xufVxuXG5leHBvcnQgeyB0YWJzQ29tcG9uZW50IH07XG4iLCAiLyoqXG4gKiBAZmlsZSBBY2NvcmRpb24gY29tcG9uZW50LlxuICovXG5cbmltcG9ydCB7IGFkZENsYXNzLCByZW1vdmVDbGFzcyB9IGZyb20gJy4uL3V0aWxzL2NsYXNzTmFtZXMuanMnO1xuaW1wb3J0IHsgcmVnaXN0cnkgfSBmcm9tICcuLi9jb3JlL3JlZ2lzdHJ5LmpzJztcbmltcG9ydCB7IGxvZyB9IGZyb20gJy4uL3V0aWxzL2xvZ2dlci5qcyc7XG5cbi8qKlxuICogQGRlc2NyaXB0aW9uIEluaXRpYWxpemUgYWNjb3JkaW9uIGVsZW1lbnQuXG4gKiBAcGFyYW0ge0hUTUxFbGVtZW50fSBlbFxuICogQHJldHVybnMge3ZvaWR9XG4gKi9cbmZ1bmN0aW9uIGFjY29yZGlvbkNvbXBvbmVudChlbCkge1xuICBjb25zdCBpdGVtcyA9IGVsLnF1ZXJ5U2VsZWN0b3JBbGwoJy5kZXNzZXJ0LWFjY29yZGlvbi1pdGVtJyk7XG4gIC8qKiBAdHlwZSB7QXJyYXk8W0V2ZW50VGFyZ2V0LCBzdHJpbmcsIEV2ZW50TGlzdGVuZXJdPn0gKi9cbiAgY29uc3QgaGFuZGxlcnMgPSBbXTtcblxuICBpdGVtcy5mb3JFYWNoKChpdGVtKSA9PiB7XG4gICAgY29uc3QgaGVhZGVyID0gaXRlbS5xdWVyeVNlbGVjdG9yKCcuZGVzc2VydC1hY2NvcmRpb24taGVhZGVyJyk7XG4gICAgY29uc3QgYm9keSA9IGl0ZW0ucXVlcnlTZWxlY3RvcignLmRlc3NlcnQtYWNjb3JkaW9uLWJvZHknKTtcbiAgICBpZiAoIWhlYWRlcikgcmV0dXJuO1xuXG4gICAgY29uc3QgaCA9ICgpID0+IHtcbiAgICAgIGNvbnN0IGlzT3BlbiA9IGl0ZW0uY2xhc3NMaXN0LmNvbnRhaW5zKCdkZXNzZXJ0LW9wZW4nKTtcblxuICAgICAgaXRlbXMuZm9yRWFjaCgoaSkgPT4ge1xuICAgICAgICByZW1vdmVDbGFzcyhpLCAnb3BlbicpO1xuICAgICAgICBjb25zdCBiID0gaS5xdWVyeVNlbGVjdG9yKCcuZGVzc2VydC1hY2NvcmRpb24tYm9keScpO1xuICAgICAgICBpZiAoYikgYi5zdHlsZS5tYXhIZWlnaHQgPSAnJztcbiAgICAgIH0pO1xuXG4gICAgICBpZiAoIWlzT3Blbikge1xuICAgICAgICBhZGRDbGFzcyhpdGVtLCAnb3BlbicpO1xuICAgICAgICBpZiAoYm9keSkgYm9keS5zdHlsZS5tYXhIZWlnaHQgPSBgJHtib2R5LnNjcm9sbEhlaWdodH1weGA7XG4gICAgICB9XG4gICAgfTtcblxuICAgIGhlYWRlci5hZGRFdmVudExpc3RlbmVyKCdjbGljaycsIGgpO1xuICAgIGhhbmRsZXJzLnB1c2goW2hlYWRlciwgJ2NsaWNrJywgaF0pO1xuICB9KTtcblxuICByZWdpc3RyeS5pbnN0YW5jZXMuc2V0KGVsLCB7IHR5cGU6ICdhY2NvcmRpb24nLCBoYW5kbGVycyB9KTtcbiAgbG9nKCdhY2NvcmRpb24gaW5pdCcpO1xufVxuXG5leHBvcnQgeyBhY2NvcmRpb25Db21wb25lbnQgfTtcbiIsICIvKipcbiAqIEBmaWxlIERFU1NFUlQgQ2FyZCBDb21wb25lbnQuXG4gKiBTdXBwb3J0cyBhdXRvLWluaXQgY29sbGFwc2libGUgY2FyZHMsIGNhcmQgZGlzbWlzcywgYW5kIGNhcmQgYWN0aW9ucy5cbiAqL1xuXG5pbXBvcnQgeyBhZGRDbGFzcywgcmVtb3ZlQ2xhc3MsIHRvZ2dsZUNsYXNzIH0gZnJvbSAnLi4vdXRpbHMvY2xhc3NOYW1lcy5qcyc7XG5pbXBvcnQgeyBoZWxwZXJzIH0gZnJvbSAnLi4vdXRpbHMvYnJpZGdlLmpzJztcblxuLyoqXG4gKiBAcGFyYW0ge0hUTUxFbGVtZW50fSBlbFxuICogQHJldHVybnMge3ZvaWR9XG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBjYXJkQ29tcG9uZW50KGVsKSB7XG4gIC8vIENoZWNrIGlmIGNhcmQgaGFzIGEgdG9nZ2xlIHRyaWdnZXIgYnV0dG9uXG4gIGNvbnN0IHRvZ2dsZUJ0biA9IGVsLnF1ZXJ5U2VsZWN0b3IoJ1tkYXRhLWRlc3NlcnQtY2FyZC10b2dnbGVdJyk7XG4gIGNvbnN0IGJvZHkgPSBlbC5xdWVyeVNlbGVjdG9yKCcuZGVzc2VydC1jYXJkLWJvZHknKTtcblxuICBpZiAodG9nZ2xlQnRuICYmIGJvZHkpIHtcbiAgICB0b2dnbGVCdG4uYWRkRXZlbnRMaXN0ZW5lcignY2xpY2snLCAoKSA9PiB7XG4gICAgICBjb25zdCBpc0NvbGxhcHNlZCA9IGVsLmNsYXNzTGlzdC5jb250YWlucygnZGVzc2VydC1jYXJkLWNvbGxhcHNlZCcpO1xuICAgICAgaWYgKGlzQ29sbGFwc2VkKSB7XG4gICAgICAgIHJlbW92ZUNsYXNzKGVsLCAnY2FyZC1jb2xsYXBzZWQnKTtcbiAgICAgICAgYm9keS5zdHlsZS5kaXNwbGF5ID0gJ2Jsb2NrJztcbiAgICAgICAgaGVscGVycy5jb250cm9sbGVyPy5lbWl0KCdjYXJkOmV4cGFuZCcsIHsgZWwgfSk7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICBhZGRDbGFzcyhlbCwgJ2NhcmQtY29sbGFwc2VkJyk7XG4gICAgICAgIGJvZHkuc3R5bGUuZGlzcGxheSA9ICdub25lJztcbiAgICAgICAgaGVscGVycy5jb250cm9sbGVyPy5lbWl0KCdjYXJkOmNvbGxhcHNlJywgeyBlbCB9KTtcbiAgICAgIH1cbiAgICB9KTtcbiAgfVxuXG4gIC8vIENoZWNrIGlmIGNhcmQgaGFzIGEgY2xvc2UvZGlzbWlzcyB0cmlnZ2VyXG4gIGNvbnN0IGNsb3NlQnRuID0gZWwucXVlcnlTZWxlY3RvcignW2RhdGEtZGVzc2VydC1jYXJkLWNsb3NlXScpO1xuICBpZiAoY2xvc2VCdG4pIHtcbiAgICBjbG9zZUJ0bi5hZGRFdmVudExpc3RlbmVyKCdjbGljaycsICgpID0+IHtcbiAgICAgIGVsLnN0eWxlLm9wYWNpdHkgPSAnMCc7XG4gICAgICBlbC5zdHlsZS50cmFuc2Zvcm0gPSAnc2NhbGUoMC45NSknO1xuICAgICAgc2V0VGltZW91dCgoKSA9PiB7XG4gICAgICAgIGVsLnJlbW92ZSgpO1xuICAgICAgICBoZWxwZXJzLmNvbnRyb2xsZXI/LmVtaXQoJ2NhcmQ6ZGlzbWlzcycsIHsgZWwgfSk7XG4gICAgICB9LCAyMDApO1xuICAgIH0pO1xuICB9XG59XG4iLCAiLyoqXG4gKiBAZmlsZSBERVNTRVJUIEJhZGdlIENvbXBvbmVudC5cbiAqIFN1cHBvcnRzIGRpc21pc3NpYmxlIGJhZGdlcyBhbmQgc3RhdHVzIGRvdCBiYWRnZXMuXG4gKi9cblxuaW1wb3J0IHsgaGVscGVycyB9IGZyb20gJy4uL3V0aWxzL2JyaWRnZS5qcyc7XG5cbi8qKlxuICogQHBhcmFtIHtIVE1MRWxlbWVudH0gZWxcbiAqIEByZXR1cm5zIHt2b2lkfVxuICovXG5leHBvcnQgZnVuY3Rpb24gYmFkZ2VDb21wb25lbnQoZWwpIHtcbiAgY29uc3QgZGlzbWlzc0J0biA9IGVsLnF1ZXJ5U2VsZWN0b3IoJ1tkYXRhLWRlc3NlcnQtYmFkZ2UtZGlzbWlzc10nKTtcbiAgaWYgKGRpc21pc3NCdG4pIHtcbiAgICBkaXNtaXNzQnRuLmFkZEV2ZW50TGlzdGVuZXIoJ2NsaWNrJywgKGUpID0+IHtcbiAgICAgIGUuc3RvcFByb3BhZ2F0aW9uKCk7XG4gICAgICBlbC5zdHlsZS5vcGFjaXR5ID0gJzAnO1xuICAgICAgc2V0VGltZW91dCgoKSA9PiB7XG4gICAgICAgIGVsLnJlbW92ZSgpO1xuICAgICAgICBoZWxwZXJzLmNvbnRyb2xsZXI/LmVtaXQoJ2JhZGdlOmRpc21pc3MnLCB7IGVsIH0pO1xuICAgICAgfSwgMTUwKTtcbiAgICB9KTtcbiAgfVxufVxuIiwgIi8qKlxuICogQGZpbGUgQ29tcG9uZW50IHJlZ2lzdHJ5IGJhcnJlbC5cbiAqL1xuXG5pbXBvcnQgeyBtb2RhbENvbXBvbmVudCB9IGZyb20gJy4vbW9kYWwuanMnO1xuaW1wb3J0IHsgZHJvcGRvd25Db21wb25lbnQgfSBmcm9tICcuL2Ryb3Bkb3duLmpzJztcbmltcG9ydCB7IHRhYnNDb21wb25lbnQgfSBmcm9tICcuL3RhYnMuanMnO1xuaW1wb3J0IHsgYWNjb3JkaW9uQ29tcG9uZW50IH0gZnJvbSAnLi9hY2NvcmRpb24uanMnO1xuaW1wb3J0IHsgY2FyZENvbXBvbmVudCB9IGZyb20gJy4vY2FyZC5qcyc7XG5pbXBvcnQgeyBiYWRnZUNvbXBvbmVudCB9IGZyb20gJy4vYmFkZ2UuanMnO1xuXG4vKipcbiAqIEB0eXBlZGVmIHtPYmplY3R9IENvbXBvbmVudHNcbiAqIEBwcm9wZXJ0eSB7KGVsOiBIVE1MRWxlbWVudCkgPT4gdm9pZH0gbW9kYWxcbiAqIEBwcm9wZXJ0eSB7KGVsOiBIVE1MRWxlbWVudCkgPT4gdm9pZH0gZHJvcGRvd25cbiAqIEBwcm9wZXJ0eSB7KGVsOiBIVE1MRWxlbWVudCkgPT4gdm9pZH0gdGFic1xuICogQHByb3BlcnR5IHsoZWw6IEhUTUxFbGVtZW50KSA9PiB2b2lkfSBhY2NvcmRpb25cbiAqIEBwcm9wZXJ0eSB7KGVsOiBIVE1MRWxlbWVudCkgPT4gdm9pZH0gY2FyZFxuICogQHByb3BlcnR5IHsoZWw6IEhUTUxFbGVtZW50KSA9PiB2b2lkfSBiYWRnZVxuICovXG5cbi8qKlxuICogQGRlc2NyaXB0aW9uIENvbXBvbmVudCByZWdpc3RyeSBtYXAuXG4gKiBAdHlwZSB7Q29tcG9uZW50c31cbiAqL1xuY29uc3QgY29tcG9uZW50cyA9IHtcbiAgbW9kYWw6IG1vZGFsQ29tcG9uZW50LFxuICBkcm9wZG93bjogZHJvcGRvd25Db21wb25lbnQsXG4gIHRhYnM6IHRhYnNDb21wb25lbnQsXG4gIGFjY29yZGlvbjogYWNjb3JkaW9uQ29tcG9uZW50LFxuICBjYXJkOiBjYXJkQ29tcG9uZW50LFxuICBiYWRnZTogYmFkZ2VDb21wb25lbnQsXG59O1xuXG5leHBvcnQgeyBjb21wb25lbnRzIH07XG4iLCAiLyoqXG4gKiBAZmlsZSBTY2FuIERPTSBhbmQgaW5pdGlhbGl6ZSBjb21wb25lbnRzLlxuICovXG5cbmltcG9ydCB7IERBVEFfQVRUUiB9IGZyb20gJy4uL2NvcmUvY29uc3RhbnRzLmpzJztcblxuLyoqXG4gKiBAdHlwZWRlZiB7T2JqZWN0fSBDb21wb25lbnRzTWFwXG4gKiBAcHJvcGVydHkgeyp9IFtrZXldXG4gKi9cblxuLyoqXG4gKiBAZGVzY3JpcHRpb24gQXV0by1pbml0IGFsbCBlbGVtZW50cyB3aXRoIGRhdGEtZGVzc2VydCBhdHRyaWJ1dGUuXG4gKiBAdGhpcyB7eyBjb21wb25lbnRzOiBDb21wb25lbnRzTWFwIH19XG4gKiBAcGFyYW0ge1BhcmVudE5vZGV9IFtyb290PWRvY3VtZW50XVxuICogQHJldHVybnMge3ZvaWR9XG4gKi9cbmZ1bmN0aW9uIGF1dG9Jbml0KHJvb3QgPSBkb2N1bWVudCkge1xuICByb290LnF1ZXJ5U2VsZWN0b3JBbGwoYFske0RBVEFfQVRUUn1dYCkuZm9yRWFjaCgobm9kZSkgPT4ge1xuICAgIGlmIChub2RlLl9kZXNzZXJ0SW5pdGlhbGl6ZWQpIHJldHVybjtcbiAgICBjb25zdCB0eXBlID0gbm9kZS5nZXRBdHRyaWJ1dGUoREFUQV9BVFRSKTtcbiAgICBjb25zdCBmbiA9IHRoaXMuY29tcG9uZW50c1t0eXBlXTtcbiAgICBpZiAodHlwZW9mIGZuID09PSAnZnVuY3Rpb24nKSB7XG4gICAgICBmbi5jYWxsKHRoaXMsIG5vZGUpO1xuICAgICAgbm9kZS5fZGVzc2VydEluaXRpYWxpemVkID0gdHJ1ZTtcbiAgICB9XG4gIH0pO1xufVxuXG5leHBvcnQgeyBhdXRvSW5pdCB9O1xuIiwgIi8qKlxuICogQGZpbGUgR2xvYmFsIEVTQyBrZXkgaGFuZGxlci5cbiAqL1xuXG5pbXBvcnQgeyBzdGF0ZSB9IGZyb20gJy4uL2NvcmUvc3RhdGUuanMnO1xuXG4vKipcbiAqIEB0eXBlZGVmIHtPYmplY3R9IENvcmVMaWtlXG4gKiBAcHJvcGVydHkge3N0cmluZ30gcHJlZml4XG4gKiBAcHJvcGVydHkge3sgY2xvc2U6IChlbDogSFRNTEVsZW1lbnQpID0+IHZvaWQgfX0gbW9kYWxcbiAqL1xuXG4vKipcbiAqIEBkZXNjcmlwdGlvbiBCaW5kIGdsb2JhbCBFU0MgaGFuZGxlciB0byBjbG9zZSB2aXNpYmxlIG1vZGFscy5cbiAqIEBwYXJhbSB7Q29yZUxpa2V9IGNvcmVcbiAqIEByZXR1cm5zIHt2b2lkfVxuICovXG5mdW5jdGlvbiBiaW5kRXNjYXBlS2V5KGNvcmUpIHtcbiAgaWYgKHN0YXRlLmVzY0JvdW5kKSByZXR1cm47XG5cbiAgZG9jdW1lbnQuYWRkRXZlbnRMaXN0ZW5lcigna2V5ZG93bicsIChlKSA9PiB7XG4gICAgaWYgKGUua2V5ICE9PSAnRXNjYXBlJykgcmV0dXJuO1xuICAgIGRvY3VtZW50XG4gICAgICAucXVlcnlTZWxlY3RvckFsbChgLiR7Y29yZS5wcmVmaXh9LW1vZGFsLiR7Y29yZS5wcmVmaXh9LXNob3dgKVxuICAgICAgLmZvckVhY2goKG0pID0+IGNvcmUubW9kYWwuY2xvc2UobSkpO1xuICB9KTtcblxuICBzdGF0ZS5lc2NCb3VuZCA9IHRydWU7XG59XG5cbmV4cG9ydCB7IGJpbmRFc2NhcGVLZXkgfTtcbiIsICIvKipcbiAqIEBmaWxlIFVSTCByZXNvbHV0aW9uIGhlbHBlcnMuXG4gKi9cblxuLyoqXG4gKiBAZGVzY3JpcHRpb24gUmVzb2x2ZSBhIHBhdGggcmVsYXRpdmUgdG8gYSBiYXNlLlxuICogQHBhcmFtIHtzdHJpbmd9IGJhc2VcbiAqIEBwYXJhbSB7c3RyaW5nfSBwYXRoXG4gKiBAcmV0dXJucyB7c3RyaW5nfVxuICovXG5mdW5jdGlvbiByZXNvbHZlVVJMKGJhc2UsIHBhdGgpIHtcbiAgdHJ5IHsgcmV0dXJuIG5ldyBVUkwocGF0aCwgYmFzZSkuaHJlZjsgfVxuICBjYXRjaCB7IHJldHVybiBwYXRoOyB9XG59XG5cbi8qKlxuICogQGRlc2NyaXB0aW9uIERlcml2ZSBiYXNlIFVSTCBmcm9tIGEgc2NyaXB0IGVsZW1lbnQgKGFzc3VtZXMgL3NyYy8gbGF5b3V0KS5cbiAqIEBwYXJhbSB7SFRNTFNjcmlwdEVsZW1lbnR9IHNjcmlwdEVsXG4gKiBAcmV0dXJucyB7P3N0cmluZ31cbiAqL1xuZnVuY3Rpb24gZ2V0U2NyaXB0QmFzZShzY3JpcHRFbCkge1xuICBpZiAoIXNjcmlwdEVsPy5zcmMpIHJldHVybiBudWxsO1xuICBjb25zdCBtID0gc2NyaXB0RWwuc3JjLm1hdGNoKC9eKC4qPylcXC9zcmNcXC9bXi9dKyQvKTtcbiAgcmV0dXJuIG0gPyBtWzFdIDogc2NyaXB0RWwuc3JjLnJlcGxhY2UoL1xcL1teL10rJC8sICcnKTtcbn1cblxuLyoqXG4gKiBAZGVzY3JpcHRpb24gR2V0IHRoZSBjdXJyZW50bHkgZXhlY3V0aW5nIHNjcmlwdCBlbGVtZW50LlxuICogQHJldHVybnMge0hUTUxTY3JpcHRFbGVtZW50fHVuZGVmaW5lZH1cbiAqL1xuZnVuY3Rpb24gY3VycmVudFNjcmlwdCgpIHtcbiAgcmV0dXJuIGRvY3VtZW50LmN1cnJlbnRTY3JpcHRcbiAgICB8fCAoKCkgPT4ge1xuICAgICAgY29uc3QgcyA9IGRvY3VtZW50LmdldEVsZW1lbnRzQnlUYWdOYW1lKCdzY3JpcHQnKTtcbiAgICAgIHJldHVybiBzW3MubGVuZ3RoIC0gMV07XG4gICAgfSkoKTtcbn1cblxuZXhwb3J0IHsgcmVzb2x2ZVVSTCwgZ2V0U2NyaXB0QmFzZSwgY3VycmVudFNjcmlwdCB9O1xuIiwgIi8qKlxuICogQGZpbGUgQXV0by1pbmplY3QgZGVzc2VydC5jc3MuXG4gKi9cblxuaW1wb3J0IHsgY3VycmVudFNjcmlwdCwgZ2V0U2NyaXB0QmFzZSB9IGZyb20gJy4uL3V0aWxzL3VybC5qcyc7XG5pbXBvcnQgeyBsb2cgfSBmcm9tICcuLi91dGlscy9sb2dnZXIuanMnO1xuXG4vKipcbiAqIEBkZXNjcmlwdGlvbiBJbmplY3QgZGVzc2VydC5jc3MgaWYgbm90IGFscmVhZHkgcHJlc2VudC5cbiAqIEByZXR1cm5zIHt2b2lkfVxuICovXG5mdW5jdGlvbiBpbmplY3RDU1MoKSB7XG4gIGlmIChkb2N1bWVudC5xdWVyeVNlbGVjdG9yKCdsaW5rW2RhdGEtZGVzc2VydC1jc3NdJykpIHJldHVybjtcblxuICBjb25zdCBiYXNlID0gZ2V0U2NyaXB0QmFzZShjdXJyZW50U2NyaXB0KCkpO1xuICBjb25zdCBocmVmID0gYmFzZVxuICAgID8gYCR7YmFzZX0vc3JjL3N0eWxlcy9kZXNzZXJ0LmNzc2BcbiAgICA6ICdkaXN0L2Rlc3NlcnQuY3NzJztcblxuICBjb25zdCBsaW5rID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnbGluaycpO1xuICBsaW5rLnJlbCA9ICdzdHlsZXNoZWV0JztcbiAgbGluay5ocmVmID0gaHJlZjtcbiAgbGluay5zZXRBdHRyaWJ1dGUoJ2RhdGEtZGVzc2VydC1jc3MnLCAnJyk7XG4gIGxpbmsub25lcnJvciA9ICgpID0+IGxvZygnQ1NTIGxvYWQgZmFpbGVkOicsIGhyZWYpO1xuICBkb2N1bWVudC5oZWFkLmFwcGVuZENoaWxkKGxpbmspO1xufVxuXG5leHBvcnQgeyBpbmplY3RDU1MgfTtcbiIsICIvKipcbiAqIEBmaWxlIEF1dG8taW5qZWN0IGxvYWRlciBwbHVnaW4uXG4gKi9cblxuaW1wb3J0IHsgcmVnaXN0cnkgfSBmcm9tICcuLi9jb3JlL3JlZ2lzdHJ5LmpzJztcbmltcG9ydCB7IGN1cnJlbnRTY3JpcHQsIGdldFNjcmlwdEJhc2UgfSBmcm9tICcuLi91dGlscy91cmwuanMnO1xuaW1wb3J0IHsgbG9nIH0gZnJvbSAnLi4vdXRpbHMvbG9nZ2VyLmpzJztcblxuLyoqXG4gKiBAZGVzY3JpcHRpb24gSW5qZWN0IGxvYWRlciBwbHVnaW4gaWYgbm90IHJlZ2lzdGVyZWQuXG4gKiBAcmV0dXJucyB7dm9pZH1cbiAqL1xuZnVuY3Rpb24gaW5qZWN0TG9hZGVyKCkge1xuICBpZiAocmVnaXN0cnkucGx1Z2lucy5oYXMoJ2xvYWRlcicpKSByZXR1cm47XG4gIGlmIChkb2N1bWVudC5xdWVyeVNlbGVjdG9yKCdzY3JpcHRbZGF0YS1kZXNzZXJ0LWxvYWRlcl0nKSkgcmV0dXJuO1xuXG4gIGNvbnN0IGJhc2UgPSBnZXRTY3JpcHRCYXNlKGN1cnJlbnRTY3JpcHQoKSk7XG4gIGNvbnN0IHNyYyA9IGJhc2VcbiAgICA/IGAke2Jhc2V9L3NyYy9wbHVnaW5zL2xvYWRlci9Mb2FkZXJQbHVnaW4uanNgXG4gICAgOiAnbG9hZGVyLnVtZC5qcyc7XG5cbiAgY29uc3QgcyA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ3NjcmlwdCcpO1xuICBzLnR5cGUgPSBiYXNlID8gJ21vZHVsZScgOiAndGV4dC9qYXZhc2NyaXB0JztcbiAgcy5zcmMgPSBzcmM7XG4gIHMuYXN5bmMgPSBmYWxzZTtcbiAgcy5zZXRBdHRyaWJ1dGUoJ2RhdGEtZGVzc2VydC1sb2FkZXInLCAnJyk7XG4gIHMub25lcnJvciA9ICgpID0+IGxvZygnbG9hZGVyIGluamVjdCBmYWlsZWQ6Jywgc3JjKTtcbiAgZG9jdW1lbnQuaGVhZC5hcHBlbmRDaGlsZChzKTtcbn1cblxuZXhwb3J0IHsgaW5qZWN0TG9hZGVyIH07XG4iLCAiLyoqXG4gKiBAZmlsZSBNb2RhbCBvcGVuL2Nsb3NlIGNvbnRyb2xsZXIuXG4gKi9cblxuaW1wb3J0IHsgYWRkQ2xhc3MsIHJlbW92ZUNsYXNzIH0gZnJvbSAnLi4vdXRpbHMvY2xhc3NOYW1lcy5qcyc7XG5pbXBvcnQgeyBzdGF0ZSB9IGZyb20gJy4uL2NvcmUvc3RhdGUuanMnO1xuaW1wb3J0IHsgaGVscGVycyB9IGZyb20gJy4uL3V0aWxzL2JyaWRnZS5qcyc7XG5pbXBvcnQgeyBsb2cgfSBmcm9tICcuLi91dGlscy9sb2dnZXIuanMnO1xuXG4vKipcbiAqIEB0eXBlZGVmIHtPYmplY3R9IE1vZGFsQVBJXG4gKiBAcHJvcGVydHkgeyhlbDogSFRNTEVsZW1lbnQpID0+IHZvaWR9IG9wZW5cbiAqIEBwcm9wZXJ0eSB7KGVsOiBIVE1MRWxlbWVudCkgPT4gdm9pZH0gY2xvc2VcbiAqL1xuXG4vKipcbiAqIEBkZXNjcmlwdGlvbiBNb2RhbCBjb250cm9sbGVyLlxuICogQHR5cGUge01vZGFsQVBJfVxuICovXG5jb25zdCBtb2RhbEFQSSA9IHtcbiAgLyoqXG4gICAqIEBkZXNjcmlwdGlvbiBPcGVuIGEgbW9kYWwgZWxlbWVudC5cbiAgICogQHBhcmFtIHtIVE1MRWxlbWVudH0gZWxcbiAgICogQHJldHVybnMge3ZvaWR9XG4gICAqL1xuICBvcGVuKGVsKSB7XG4gICAgc3RhdGUubGFzdEZvY3VzZWQgPSBkb2N1bWVudC5hY3RpdmVFbGVtZW50O1xuXG4gICAgZWwuc3R5bGUuZGlzcGxheSA9ICdmbGV4JztcbiAgICBkb2N1bWVudC5ib2R5LnN0eWxlLm92ZXJmbG93ID0gJ2hpZGRlbic7XG4gICAgcmVxdWVzdEFuaW1hdGlvbkZyYW1lKCgpID0+IGFkZENsYXNzKGVsLCAnc2hvdycpKTtcblxuICAgIHNldFRpbWVvdXQoKCkgPT4ge1xuICAgICAgY29uc3QgZiA9IGVsLnF1ZXJ5U2VsZWN0b3IoXG4gICAgICAgICdidXR0b24sIFtocmVmXSwgaW5wdXQsIHNlbGVjdCwgdGV4dGFyZWEsIFt0YWJpbmRleF06bm90KFt0YWJpbmRleD1cIi0xXCJdKSdcbiAgICAgICk7XG4gICAgICAvKiogQHR5cGUge0hUTUxFbGVtZW50fG51bGx9ICovKGYpPy5mb2N1cygpO1xuICAgIH0sIDEwMCk7XG5cbiAgICBoZWxwZXJzLmNvbnRyb2xsZXI/LmVtaXQoJ21vZGFsOm9wZW4nLCB7IGVsLCBpZDogZWwuaWQgfSk7XG4gICAgbG9nKCdtb2RhbCBvcGVuOicsIGVsLmlkKTtcbiAgfSxcblxuICAvKipcbiAgICogQGRlc2NyaXB0aW9uIENsb3NlIGEgbW9kYWwgZWxlbWVudC5cbiAgICogQHBhcmFtIHtIVE1MRWxlbWVudH0gZWxcbiAgICogQHJldHVybnMge3ZvaWR9XG4gICAqL1xuICBjbG9zZShlbCkge1xuICAgIHJlbW92ZUNsYXNzKGVsLCAnc2hvdycpO1xuXG4gICAgc2V0VGltZW91dCgoKSA9PiB7XG4gICAgICBlbC5zdHlsZS5kaXNwbGF5ID0gJ25vbmUnO1xuICAgICAgZG9jdW1lbnQuYm9keS5zdHlsZS5vdmVyZmxvdyA9ICcnO1xuICAgICAgc3RhdGUubGFzdEZvY3VzZWQ/LmZvY3VzKCk7XG4gICAgfSwgMzAwKTtcblxuICAgIGhlbHBlcnMuY29udHJvbGxlcj8uZW1pdCgnbW9kYWw6Y2xvc2UnLCB7IGVsLCBpZDogZWwuaWQgfSk7XG4gICAgbG9nKCdtb2RhbCBjbG9zZTonLCBlbC5pZCk7XG4gIH0sXG59O1xuXG5leHBvcnQgeyBtb2RhbEFQSSB9O1xuIiwgIi8qKlxuICogQGZpbGUgU3RhY2tlZCBhbGVydC90b2FzdCBBUEkuXG4gKi9cblxuaW1wb3J0IHsgYWRkQ2xhc3MsIHJlbW92ZUNsYXNzIH0gZnJvbSAnLi4vdXRpbHMvY2xhc3NOYW1lcy5qcyc7XG5pbXBvcnQgeyBoZWxwZXJzIH0gZnJvbSAnLi4vdXRpbHMvYnJpZGdlLmpzJztcblxuLyoqXG4gKiBAdHlwZWRlZiB7J2luZm8nfCdzdWNjZXNzJ3wnd2FybmluZyd8J2Rhbmdlcid9IEFsZXJ0VHlwZVxuICovXG5cbi8qKlxuICogQGRlc2NyaXB0aW9uIFNob3cgYSBzdGFja2VkIGFsZXJ0LlxuICogQHBhcmFtIHtzdHJpbmd9IG1zZ1xuICogQHBhcmFtIHtBbGVydFR5cGV9IFt0eXBlPSdpbmZvJ11cbiAqIEBwYXJhbSB7bnVtYmVyfSBbZHVyYXRpb249MzAwMF1cbiAqIEByZXR1cm5zIHt2b2lkfVxuICovXG5mdW5jdGlvbiBhbGVydEFQSShtc2csIHR5cGUgPSAnaW5mbycsIGR1cmF0aW9uID0gMzAwMCkge1xuICBoZWxwZXJzLmNvbnRyb2xsZXI/LmVtaXQoJ2FsZXJ0OnNob3cnLCB7IG1lc3NhZ2U6IG1zZywgdHlwZSwgZHVyYXRpb24gfSk7XG5cbiAgbGV0IGNvbnRhaW5lciA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoJy5kZXNzZXJ0LWFsZXJ0LWNvbnRhaW5lcicpO1xuICBpZiAoIWNvbnRhaW5lcikge1xuICAgIGNvbnRhaW5lciA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2RpdicpO1xuICAgIGNvbnRhaW5lci5jbGFzc05hbWUgPSAnZGVzc2VydC1hbGVydC1jb250YWluZXInO1xuICAgIGRvY3VtZW50LmJvZHkuYXBwZW5kQ2hpbGQoY29udGFpbmVyKTtcbiAgfVxuXG4gIGNvbnN0IGJveCA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2RpdicpO1xuICBib3guY2xhc3NOYW1lID0gYGRlc3NlcnQtYWxlcnQgZGVzc2VydC1hbGVydC0ke3R5cGV9YDtcbiAgYm94LnRleHRDb250ZW50ID0gbXNnO1xuICBjb250YWluZXIuYXBwZW5kQ2hpbGQoYm94KTtcblxuICByZXF1ZXN0QW5pbWF0aW9uRnJhbWUoKCkgPT4gYWRkQ2xhc3MoYm94LCAnc2hvdycpKTtcblxuICBzZXRUaW1lb3V0KCgpID0+IHtcbiAgICByZW1vdmVDbGFzcyhib3gsICdzaG93Jyk7XG4gICAgc2V0VGltZW91dCgoKSA9PiB7XG4gICAgICBib3gucmVtb3ZlKCk7XG4gICAgICBpZiAoIWNvbnRhaW5lci5jaGlsZHJlbi5sZW5ndGgpIGNvbnRhaW5lci5yZW1vdmUoKTtcbiAgICB9LCAzMDApO1xuICB9LCBkdXJhdGlvbik7XG59XG5cbmV4cG9ydCB7IGFsZXJ0QVBJIH07XG4iLCAiLyoqXG4gKiBAZmlsZSBDb21wb25lbnQgdGVhcmRvd24gQVBJLlxuICovXG5cbmltcG9ydCB7IHJlZ2lzdHJ5IH0gZnJvbSAnLi4vY29yZS9yZWdpc3RyeS5qcyc7XG5pbXBvcnQgeyBsb2cgfSBmcm9tICcuLi91dGlscy9sb2dnZXIuanMnO1xuXG4vKipcbiAqIEBkZXNjcmlwdGlvbiBEZXN0cm95IGFuIGluaXRpYWxpemVkIGVsZW1lbnQgYW5kIHJlbW92ZSBsaXN0ZW5lcnMuXG4gKiBAcGFyYW0ge0hUTUxFbGVtZW50fSBlbFxuICogQHJldHVybnMge3ZvaWR9XG4gKi9cbmZ1bmN0aW9uIGRlc3Ryb3lBUEkoZWwpIHtcbiAgY29uc3QgaW5zdCA9IHJlZ2lzdHJ5Lmluc3RhbmNlcy5nZXQoZWwpO1xuICBpZiAoIWluc3QpIHJldHVybjtcblxuICBpbnN0LmhhbmRsZXJzLmZvckVhY2goKFt0YXJnZXQsIHR5cGUsIGhhbmRsZXJdKSA9PiB7XG4gICAgdGFyZ2V0LnJlbW92ZUV2ZW50TGlzdGVuZXIodHlwZSwgaGFuZGxlcik7XG4gIH0pO1xuXG4gIGVsLl9kZXNzZXJ0SW5pdGlhbGl6ZWQgPSBmYWxzZTtcbiAgcmVnaXN0cnkuaW5zdGFuY2VzLmRlbGV0ZShlbCk7XG4gIGxvZygnZGVzdHJveWVkOicsIGluc3QudHlwZSk7XG59XG5cbmV4cG9ydCB7IGRlc3Ryb3lBUEkgfTtcbiIsICIvKipcbiAqIEBmaWxlIFByZWZpeGVkIGRhdGEgYXR0cmlidXRlIGhlbHBlcnMuXG4gKi9cblxuaW1wb3J0IHsgUFJFRklYIH0gZnJvbSAnLi4vY29yZS9jb25zdGFudHMuanMnO1xuXG4vKipcbiAqIEBkZXNjcmlwdGlvbiBTZXQgYSBwcmVmaXhlZCBkYXRhIGF0dHJpYnV0ZS5cbiAqIEBwYXJhbSB7SFRNTEVsZW1lbnR9IGVsXG4gKiBAcGFyYW0ge3N0cmluZ30ga2V5XG4gKiBAcGFyYW0ge3N0cmluZ30gdmFsdWVcbiAqIEByZXR1cm5zIHtIVE1MRWxlbWVudH1cbiAqL1xuZnVuY3Rpb24gc2V0RGF0YShlbCwga2V5LCB2YWx1ZSkge1xuICBlbC5zZXRBdHRyaWJ1dGUoYGRhdGEtJHtQUkVGSVh9LSR7a2V5fWAsIHZhbHVlKTtcbiAgcmV0dXJuIGVsO1xufVxuXG4vKipcbiAqIEBkZXNjcmlwdGlvbiBHZXQgYSBwcmVmaXhlZCBkYXRhIGF0dHJpYnV0ZS5cbiAqIEBwYXJhbSB7SFRNTEVsZW1lbnR9IGVsXG4gKiBAcGFyYW0ge3N0cmluZ30ga2V5XG4gKiBAcmV0dXJucyB7P3N0cmluZ31cbiAqL1xuZnVuY3Rpb24gZ2V0RGF0YShlbCwga2V5KSB7XG4gIHJldHVybiBlbC5nZXRBdHRyaWJ1dGUoYGRhdGEtJHtQUkVGSVh9LSR7a2V5fWApO1xufVxuXG5leHBvcnQgeyBzZXREYXRhLCBnZXREYXRhIH07XG4iXSwKICAibWFwcGluZ3MiOiAiOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTs7O0FDU0EsTUFBTSxVQUFVO0FBT2hCLE1BQU0sU0FBUztBQU9mLE1BQU0sWUFBWTtBQWNsQixNQUFNLGtCQUFrQixPQUFPLE9BQU87QUFBQSxJQUNwQyxVQUFVO0FBQUEsSUFDVixPQUFPO0FBQUEsSUFDUCxlQUFlO0FBQUEsRUFDakIsQ0FBQzs7O0FDM0JELE1BQU0sUUFBUTtBQUFBLElBQ1osVUFBVTtB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

  return typeof DESSERT !== 'undefined' ? DESSERT : (typeof exports !== 'undefined' ? exports : {});
}));