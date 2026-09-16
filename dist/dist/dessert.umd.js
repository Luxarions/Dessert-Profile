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
      const body = (
        /** @type {HTMLElement|null} */
        item.querySelector(".dessert-accordion-body")
      );
      if (item.classList.contains("dessert-open") && body) {
        body.style.maxHeight = "none";
        body.style.overflow = "visible";
      } else if (body) {
        body.style.maxHeight = "0px";
        body.style.overflow = "hidden";
      }
    });
    items.forEach((item) => {
      const header = item.querySelector(".dessert-accordion-header");
      const body = (
        /** @type {HTMLElement|null} */
        item.querySelector(".dessert-accordion-body")
      );
      if (!header || !body) return;
      const toggle = () => {
        const isOpen = item.classList.contains("dessert-open");
        items.forEach((sibling) => {
          if (sibling !== item && sibling.classList.contains("dessert-open")) {
            const sBody = (
              /** @type {HTMLElement|null} */
              sibling.querySelector(".dessert-accordion-body")
            );
            if (sBody) {
              sBody.style.overflow = "hidden";
              sBody.style.maxHeight = `${sBody.scrollHeight}px`;
              void sBody.offsetHeight;
              sBody.style.maxHeight = "0px";
            }
            removeClass(sibling, "open");
          }
        });
        if (isOpen) {
          body.style.overflow = "hidden";
          body.style.maxHeight = `${body.scrollHeight}px`;
          void body.offsetHeight;
          body.style.maxHeight = "0px";
          removeClass(item, "open");
          helpers.controller?.emit("accordion:close", { el: item });
        } else {
          addClass(item, "open");
          body.style.overflow = "hidden";
          const targetHeight = body.scrollHeight + 32;
          body.style.maxHeight = `${targetHeight}px`;
          const onTransitionEnd = (e) => {
            if (e.propertyName === "max-height" && item.classList.contains("dessert-open")) {
              body.style.maxHeight = "none";
              body.style.overflow = "visible";
              body.removeEventListener("transitionend", onTransitionEnd);
            }
          };
          body.addEventListener("transitionend", onTransitionEnd);
          helpers.controller?.emit("accordion:open", { el: item });
        }
      };
      header.addEventListener("click", toggle);
      handlers.push([header, "click", toggle]);
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
//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAic291cmNlcyI6IFsic3JjL2luZGV4LmpzIiwgInNyYy9jb3JlL2NvbnN0YW50cy5qcyIsICJzcmMvY29yZS9zdGF0ZS5qcyIsICJzcmMvY29yZS9yZWdpc3RyeS5qcyIsICJzcmMvdXRpbHMvYnJpZGdlLmpzIiwgInNyYy91dGlscy9sb2dnZXIuanMiLCAic3JjL2NvcmUvY29udHJvbGxlci5qcyIsICJzcmMvY29yZS9ERVNTRVJULmpzIiwgInNyYy91dGlscy9lc2NhcGUuanMiLCAic3JjL2NvbXBvbmVudHMvbW9kYWwuanMiLCAic3JjL3V0aWxzL2NsYXNzTmFtZXMuanMiLCAic3JjL2NvbXBvbmVudHMvZHJvcGRvd24uanMiLCAic3JjL2NvbXBvbmVudHMvdGFicy5qcyIsICJzcmMvY29tcG9uZW50cy9hY2NvcmRpb24uanMiLCAic3JjL2NvbXBvbmVudHMvY2FyZC5qcyIsICJzcmMvY29tcG9uZW50cy9iYWRnZS5qcyIsICJzcmMvY29tcG9uZW50cy9jb21wb25lbnRzLmpzIiwgInNyYy9hdXRvaW5pdC9hdXRvSW5pdC5qcyIsICJzcmMvYXV0b2luaXQvZXNjYXBlS2V5LmpzIiwgInNyYy91dGlscy91cmwuanMiLCAic3JjL2luamVjdC9pbmplY3RDU1MuanMiLCAic3JjL2luamVjdC9pbmplY3RMb2FkZXIuanMiLCAic3JjL2FwaS9tb2RhbEFQSS5qcyIsICJzcmMvYXBpL2FsZXJ0QVBJLmpzIiwgInNyYy9hcGkvZGVzdHJveUFQSS5qcyIsICJzcmMvdXRpbHMvYXR0cmlidXRlcy5qcyJdLAogICJzb3VyY2VzQ29udGVudCI6IFsiLyoqXG4gKiBAZmlsZSBERVNTRVJUIG1haW4gZW50cnkgXHUyMDE0IHRoZSBvbmx5IGluZGV4LmpzIGluIHRoZSBwcm9qZWN0LlxuICovXG5cbmltcG9ydCB7IERFU1NFUlQgfSBmcm9tICcuL2NvcmUvREVTU0VSVC5qcyc7XG5pbXBvcnQgeyBEZXNzZXJ0Q29udHJvbGxlciB9IGZyb20gJy4vY29yZS9jb250cm9sbGVyLmpzJztcbmltcG9ydCB7IGNvbXBvbmVudHMgfSBmcm9tICcuL2NvbXBvbmVudHMvY29tcG9uZW50cy5qcyc7XG5pbXBvcnQgeyBhdXRvSW5pdCB9IGZyb20gJy4vYXV0b2luaXQvYXV0b0luaXQuanMnO1xuaW1wb3J0IHsgYmluZEVzY2FwZUtleSB9IGZyb20gJy4vYXV0b2luaXQvZXNjYXBlS2V5LmpzJztcbmltcG9ydCB7IGluamVjdENTUyB9IGZyb20gJy4vaW5qZWN0L2luamVjdENTUy5qcyc7XG5pbXBvcnQgeyBpbmplY3RMb2FkZXIgfSBmcm9tICcuL2luamVjdC9pbmplY3RMb2FkZXIuanMnO1xuaW1wb3J0IHsgbW9kYWxBUEkgfSBmcm9tICcuL2FwaS9tb2RhbEFQSS5qcyc7XG5pbXBvcnQgeyBhbGVydEFQSSB9IGZyb20gJy4vYXBpL2FsZXJ0QVBJLmpzJztcbmltcG9ydCB7IGRlc3Ryb3lBUEkgfSBmcm9tICcuL2FwaS9kZXN0cm95QVBJLmpzJztcbmltcG9ydCB7IGFkZENsYXNzLCByZW1vdmVDbGFzcywgdG9nZ2xlQ2xhc3MgfSBmcm9tICcuL3V0aWxzL2NsYXNzTmFtZXMuanMnO1xuaW1wb3J0IHsgc2V0RGF0YSwgZ2V0RGF0YSB9IGZyb20gJy4vdXRpbHMvYXR0cmlidXRlcy5qcyc7XG5cbi8qIDEuIGF0dGFjaCBwdWJsaWMgQVBJIG9udG8gcHJvdG90eXBlICovXG5ERVNTRVJULnByb3RvdHlwZS5jb21wb25lbnRzICA9IGNvbXBvbmVudHM7XG5ERVNTRVJULnByb3RvdHlwZS5tb2RhbCAgICAgICA9IG1vZGFsQVBJO1xuREVTU0VSVC5wcm90b3R5cGUuYWxlcnQgICAgICAgPSBhbGVydEFQSTtcbkRFU1NFUlQucHJvdG90eXBlLmRlc3Ryb3kgICAgID0gZGVzdHJveUFQSTtcbkRFU1NFUlQucHJvdG90eXBlLmF1dG9Jbml0ICAgID0gYXV0b0luaXQ7XG5ERVNTRVJULnByb3RvdHlwZS5hZGRDbGFzcyAgICA9IGFkZENsYXNzO1xuREVTU0VSVC5wcm90b3R5cGUucmVtb3ZlQ2xhc3MgPSByZW1vdmVDbGFzcztcbkRFU1NFUlQucHJvdG90eXBlLnRvZ2dsZUNsYXNzID0gdG9nZ2xlQ2xhc3M7XG5ERVNTRVJULnByb3RvdHlwZS5zZXREYXRhICAgICA9IHNldERhdGE7XG5ERVNTRVJULnByb3RvdHlwZS5nZXREYXRhICAgICA9IGdldERhdGE7XG5cbi8qKlxuICogQGRlc2NyaXB0aW9uIFNpbmdsZXRvbiBERVNTRVJUIGluc3RhbmNlLlxuICogQHR5cGUge0RFU1NFUlR9XG4gKi9cbmNvbnN0IERFU1NFUlRfSU5TVEFOQ0UgPSBuZXcgREVTU0VSVCgpO1xuXG4vKiAyLiBzaWRlIGVmZmVjdHM6IGluamVjdCBhc3NldHMgJiBhdXRvLWJvb3QgKi9cbmlmICh0eXBlb2YgZG9jdW1lbnQgIT09ICd1bmRlZmluZWQnKSB7XG4gIGluamVjdENTUygpO1xuICBpbmplY3RMb2FkZXIoKTtcblxuICBjb25zdCBib290ID0gKCkgPT4ge1xuICAgIERFU1NFUlRfSU5TVEFOQ0UuaW5pdCgpO1xuICAgIGJpbmRFc2NhcGVLZXkoREVTU0VSVF9JTlNUQU5DRSk7XG4gIH07XG5cbiAgaWYgKGRvY3VtZW50LnJlYWR5U3RhdGUgPT09ICdsb2FkaW5nJykge1xuICAgIGRvY3VtZW50LmFkZEV2ZW50TGlzdGVuZXIoJ0RPTUNvbnRlbnRMb2FkZWQnLCBib290KTtcbiAgfSBlbHNlIHtcbiAgICBib290KCk7XG4gIH1cbn1cblxuZXhwb3J0IHsgREVTU0VSVCwgREVTU0VSVF9JTlNUQU5DRSwgRGVzc2VydENvbnRyb2xsZXIgfTtcbmV4cG9ydCB7IERFU1NFUlRfSU5TVEFOQ0UgYXMgZGVmYXVsdCB9O1xuIiwgIi8qKlxuICogQGZpbGUgQ29uc3RhbnRzIGZvciBERVNTRVJUIGNvcmUuXG4gKi9cblxuLyoqXG4gKiBAZGVzY3JpcHRpb24gTGlicmFyeSB2ZXJzaW9uLlxuICogQHR5cGUge3N0cmluZ31cbiAqIEBjb25zdGFudFxuICovXG5jb25zdCBWRVJTSU9OID0gJzIuMC4wJztcblxuLyoqXG4gKiBAZGVzY3JpcHRpb24gQ1NTIHByZWZpeCB1c2VkIGFjcm9zcyB0aGUgbGlicmFyeS5cbiAqIEB0eXBlIHtzdHJpbmd9XG4gKiBAY29uc3RhbnRcbiAqL1xuY29uc3QgUFJFRklYID0gJ2Rlc3NlcnQnO1xuXG4vKipcbiAqIEBkZXNjcmlwdGlvbiBEYXRhIGF0dHJpYnV0ZSB1c2VkIGZvciBhdXRvLWluaXQuXG4gKiBAdHlwZSB7c3RyaW5nfVxuICogQGNvbnN0YW50XG4gKi9cbmNvbnN0IERBVEFfQVRUUiA9ICdkYXRhLWRlc3NlcnQnO1xuXG4vKipcbiAqIEB0eXBlZGVmIHtPYmplY3R9IERlc3NlcnRPcHRpb25zXG4gKiBAcHJvcGVydHkge2Jvb2xlYW59IFthdXRvSW5pdD10cnVlXVxuICogQHByb3BlcnR5IHtib29sZWFufSBbZGVidWc9ZmFsc2VdXG4gKiBAcHJvcGVydHkge2Jvb2xlYW59IFtjbG9zZU9uRXNjYXBlPXRydWVdXG4gKi9cblxuLyoqXG4gKiBAZGVzY3JpcHRpb24gRGVmYXVsdCBvcHRpb25zIGZvciBERVNTRVJULlxuICogQHR5cGUge1JlYWRvbmx5PERlc3NlcnRPcHRpb25zPn1cbiAqIEBjb25zdGFudFxuICovXG5jb25zdCBERUZBVUxUX09QVElPTlMgPSBPYmplY3QuZnJlZXplKHtcbiAgYXV0b0luaXQ6IHRydWUsXG4gIGRlYnVnOiBmYWxzZSxcbiAgY2xvc2VPbkVzY2FwZTogdHJ1ZSxcbn0pO1xuXG5leHBvcnQgeyBWRVJTSU9OLCBQUkVGSVgsIERBVEFfQVRUUiwgREVGQVVMVF9PUFRJT05TIH07XG4iLCAiLyoqXG4gKiBAZmlsZSBTaGFyZWQgbXV0YWJsZSBzdGF0ZS5cbiAqL1xuXG4vKipcbiAqIEB0eXBlZGVmIHtPYmplY3R9IERlc3NlcnRTdGF0ZVxuICogQHByb3BlcnR5IHtib29sZWFufSBlc2NCb3VuZFxuICogQHByb3BlcnR5IHtIVE1MRWxlbWVudHxudWxsfSBsYXN0Rm9jdXNlZFxuICovXG5cbi8qKlxuICogQGRlc2NyaXB0aW9uIEdsb2JhbCBydW50aW1lIHN0YXRlLlxuICogQHR5cGUge0Rlc3NlcnRTdGF0ZX1cbiAqL1xuY29uc3Qgc3RhdGUgPSB7XG4gIGVzY0JvdW5kOiBmYWxzZSxcbiAgbGFzdEZvY3VzZWQ6IG51bGwsXG59O1xuXG4vKipcbiAqIEBkZXNjcmlwdGlvbiBHbG9iYWwgb3B0aW9ucyBtdXRhdGVkIGJ5IERFU1NFUlQuaW5pdCgpLlxuICogQHR5cGUge09iamVjdDxzdHJpbmcsICo+fVxuICovXG5jb25zdCBvcHRpb25zID0ge307XG5cbmV4cG9ydCB7IHN0YXRlLCBvcHRpb25zIH07XG4iLCAiLyoqXG4gKiBAZmlsZSBJbnRlcm5hbCBwbHVnaW4gYW5kIGluc3RhbmNlIHJlZ2lzdHJpZXMuXG4gKi9cblxuLyoqXG4gKiBAdHlwZWRlZiB7T2JqZWN0fSBJbnN0YW5jZVJlY29yZFxuICogQHByb3BlcnR5IHtzdHJpbmd9IHR5cGVcbiAqIEBwcm9wZXJ0eSB7QXJyYXk8W0V2ZW50VGFyZ2V0LCBzdHJpbmcsIEV2ZW50TGlzdGVuZXJdPn0gaGFuZGxlcnNcbiAqL1xuXG4vKipcbiAqIEB0eXBlZGVmIHtPYmplY3R9IERlc3NlcnRSZWdpc3RyeVxuICogQHByb3BlcnR5IHtNYXA8c3RyaW5nLCAqPn0gcGx1Z2luc1xuICogQHByb3BlcnR5IHtXZWFrTWFwPEhUTUxFbGVtZW50LCBJbnN0YW5jZVJlY29yZD59IGluc3RhbmNlc1xuICovXG5cbi8qKlxuICogQGRlc2NyaXB0aW9uIFBsdWdpbiBhbmQgaW5zdGFuY2UgcmVnaXN0cmllcy5cbiAqIEB0eXBlIHtEZXNzZXJ0UmVnaXN0cnl9XG4gKi9cbmNvbnN0IHJlZ2lzdHJ5ID0ge1xuICBwbHVnaW5zOiBuZXcgTWFwKCksXG4gIGluc3RhbmNlczogbmV3IFdlYWtNYXAoKSxcbn07XG5cbmV4cG9ydCB7IHJlZ2lzdHJ5IH07XG4iLCAiLyoqXG4gKiBAZmlsZSBJbnRlcm5hbCBESSBicmlkZ2UgZm9yIHByaXZhdGUgc3RhdGUgYWNjZXNzLlxuICovXG5cbi8qKlxuICogQHR5cGVkZWYge09iamVjdH0gSGVscGVyQ29udGV4dFxuICogQHByb3BlcnR5IHsqfSBjb3JlXG4gKiBAcHJvcGVydHkge09iamVjdDxzdHJpbmcsICo+fSBvcHRpb25zXG4gKiBAcHJvcGVydHkgeyp9IHN0YXRlXG4gKiBAcHJvcGVydHkgeyp9IHJlZ2lzdHJ5XG4gKi9cblxuLyoqXG4gKiBAcHJpdmF0ZVxuICogQHR5cGUge0hlbHBlckNvbnRleHR8bnVsbH1cbiAqL1xubGV0IF9jdHggPSBudWxsO1xuXG5jb25zdCBoZWxwZXJzID0ge1xuICAvKipcbiAgICogQGRlc2NyaXB0aW9uIEJpbmQgcHJpdmF0ZSBjb250ZXh0IG9uY2UgZnJvbSB0aGUgREVTU0VSVCBjb25zdHJ1Y3Rvci5cbiAgICogQHBhcmFtIHtIZWxwZXJDb250ZXh0fSBjdHhcbiAgICogQHJldHVybnMge3ZvaWR9XG4gICAqL1xuICBiaW5kKGN0eCkgeyBfY3R4ID0gY3R4OyB9LFxuXG4gIC8qKlxuICAgKiBAZGVzY3JpcHRpb24gUmV0cmlldmUgdGhlIGN1cnJlbnQgaGVscGVyIGNvbnRleHQuXG4gICAqIEByZXR1cm5zIHtIZWxwZXJDb250ZXh0fVxuICAgKi9cbiAgZ2V0IGN0eCgpIHtcbiAgICBpZiAoIV9jdHgpIHRocm93IG5ldyBFcnJvcignW0RFU1NFUlRdIGhlbHBlcnMgbm90IGJvdW5kIHlldCcpO1xuICAgIHJldHVybiBfY3R4O1xuICB9LFxuXG4gIC8qKiBAcmV0dXJucyB7Kn0gKi9cbiAgZ2V0IGNvcmUoKSAgICAgeyByZXR1cm4gaGVscGVycy5jdHguY29yZTsgfSxcblxuICAvKiogQHJldHVybnMge09iamVjdDxzdHJpbmcsICo+fSAqL1xuICBnZXQgb3B0aW9ucygpICB7IHJldHVybiBoZWxwZXJzLmN0eC5vcHRpb25zOyB9LFxuXG4gIC8qKiBAcmV0dXJucyB7Kn0gKi9cbiAgZ2V0IHN0YXRlKCkgICAgeyByZXR1cm4gaGVscGVycy5jdHguc3RhdGU7IH0sXG5cbiAgLyoqIEByZXR1cm5zIHsqfSAqL1xuICBnZXQgcmVnaXN0cnkoKSB7IHJldHVybiBoZWxwZXJzLmN0eC5yZWdpc3RyeTsgfSxcblxuICAvKiogQHJldHVybnMgeyp9ICovXG4gIGdldCBjb250cm9sbGVyKCkgeyByZXR1cm4gaGVscGVycy5jdHguY29yZT8uY29udHJvbGxlcjsgfSxcbn07XG5cbmV4cG9ydCB7IGhlbHBlcnMgfTtcbiIsICIvKipcbiAqIEBmaWxlIERlYnVnIGxvZ2dlci5cbiAqL1xuXG5pbXBvcnQgeyBoZWxwZXJzIH0gZnJvbSAnLi9icmlkZ2UuanMnO1xuXG4vKipcbiAqIEBkZXNjcmlwdGlvbiBMb2cgYSBtZXNzYWdlIHdoZW4gZGVidWcgbW9kZSBpcyBlbmFibGVkLlxuICogQHBhcmFtIHsuLi4qfSBhcmdzXG4gKiBAcmV0dXJucyB7dm9pZH1cbiAqL1xuZnVuY3Rpb24gbG9nKC4uLmFyZ3MpIHtcbiAgaWYgKGhlbHBlcnMub3B0aW9ucz8uZGVidWcpIGNvbnNvbGUubG9nKCdbREVTU0VSVF0nLCAuLi5hcmdzKTtcbn1cblxuZXhwb3J0IHsgbG9nIH07XG4iLCAiLyoqXG4gKiBAZmlsZSBERVNTRVJUIENvbnRyb2xsZXIgXHUyMDE0IENlbnRyYWxpemVkIEV2ZW50IEJ1cywgQ29tcG9uZW50IExpZmVjeWNsZSwgJiBTdGF0ZSBIdWIuXG4gKi9cblxuY2xhc3MgRGVzc2VydENvbnRyb2xsZXIge1xuICAvKipcbiAgICogQHBhcmFtIHtPYmplY3R9IFtjdHg9e31dXG4gICAqL1xuICBjb25zdHJ1Y3RvcihjdHggPSB7fSkge1xuICAgIC8qKiBAdHlwZSB7aW1wb3J0KCcuL0RFU1NFUlQuanMnKS5ERVNTRVJUfG51bGx9ICovXG4gICAgdGhpcy5jb3JlID0gY3R4LmNvcmUgfHwgbnVsbDtcbiAgICAvKiogQHR5cGUge01hcDxzdHJpbmcsIFNldDxGdW5jdGlvbj4+fSAqL1xuICAgIHRoaXMuX2xpc3RlbmVycyA9IG5ldyBNYXAoKTtcbiAgICAvKiogQHR5cGUge01hcDxzdHJpbmcsIGFueT59ICovXG4gICAgdGhpcy5fc3RhdGUgPSBuZXcgTWFwKCk7XG4gICAgLyoqIEB0eXBlIHtTZXQ8SFRNTEVsZW1lbnQ+fSAqL1xuICAgIHRoaXMuX2FjdGl2ZUluc3RhbmNlcyA9IG5ldyBTZXQoKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBCaW5kIGNvcmUgaW5zdGFuY2UgcmVmZXJlbmNlLlxuICAgKiBAcGFyYW0ge09iamVjdH0gY29yZVxuICAgKi9cbiAgYmluZENvcmUoY29yZSkge1xuICAgIHRoaXMuY29yZSA9IGNvcmU7XG4gIH1cblxuICAvKipcbiAgICogUmVnaXN0ZXIgYW4gZXZlbnQgbGlzdGVuZXIgKFB1Yi9TdWIpLlxuICAgKiBAcGFyYW0ge3N0cmluZ30gZXZlbnRcbiAgICogQHBhcmFtIHtGdW5jdGlvbn0gaGFuZGxlclxuICAgKiBAcmV0dXJucyB7KCkgPT4gdm9pZH0gVW5zdWJzY3JpYmUgZnVuY3Rpb25cbiAgICovXG4gIG9uKGV2ZW50LCBoYW5kbGVyKSB7XG4gICAgaWYgKCF0aGlzLl9saXN0ZW5lcnMuaGFzKGV2ZW50KSkge1xuICAgICAgdGhpcy5fbGlzdGVuZXJzLnNldChldmVudCwgbmV3IFNldCgpKTtcbiAgICB9XG4gICAgdGhpcy5fbGlzdGVuZXJzLmdldChldmVudCkuYWRkKGhhbmRsZXIpO1xuICAgIHJldHVybiAoKSA9PiB0aGlzLm9mZihldmVudCwgaGFuZGxlcik7XG4gIH1cblxuICAvKipcbiAgICogUmVtb3ZlIGFuIGV2ZW50IGxpc3RlbmVyLlxuICAgKiBAcGFyYW0ge3N0cmluZ30gZXZlbnRcbiAgICogQHBhcmFtIHtGdW5jdGlvbn0gaGFuZGxlclxuICAgKi9cbiAgb2ZmKGV2ZW50LCBoYW5kbGVyKSB7XG4gICAgY29uc3QgaGFuZGxlcnMgPSB0aGlzLl9saXN0ZW5lcnMuZ2V0KGV2ZW50KTtcbiAgICBpZiAoaGFuZGxlcnMpIHtcbiAgICAgIGhhbmRsZXJzLmRlbGV0ZShoYW5kbGVyKTtcbiAgICAgIGlmIChoYW5kbGVycy5zaXplID09PSAwKSB0aGlzLl9saXN0ZW5lcnMuZGVsZXRlKGV2ZW50KTtcbiAgICB9XG4gIH1cblxuICAvKipcbiAgICogRW1pdCBhbiBldmVudCB0byBhbGwgc3Vic2NyaWJlcnMuXG4gICAqIEBwYXJhbSB7c3RyaW5nfSBldmVudFxuICAgKiBAcGFyYW0geyp9IFtwYXlsb2FkXVxuICAgKi9cbiAgZW1pdChldmVudCwgcGF5bG9hZCkge1xuICAgIGNvbnN0IGhhbmRsZXJzID0gdGhpcy5fbGlzdGVuZXJzLmdldChldmVudCk7XG4gICAgaWYgKGhhbmRsZXJzKSB7XG4gICAgICBoYW5kbGVycy5mb3JFYWNoKChmbikgPT4ge1xuICAgICAgICB0cnkge1xuICAgICAgICAgIGZuKHBheWxvYWQpO1xuICAgICAgICB9IGNhdGNoIChlcnIpIHtcbiAgICAgICAgICBjb25zb2xlLmVycm9yKGBbREVTU0VSVCBDb250cm9sbGVyXSBFcnJvciBpbiBsaXN0ZW5lciBmb3IgXCIke2V2ZW50fVwiOmAsIGVycik7XG4gICAgICAgIH1cbiAgICAgIH0pO1xuICAgIH1cbiAgICAvLyBBbHNvIGRpc3BhdGNoIGFzIGEgbmF0aXZlIEN1c3RvbUV2ZW50IG9uIHdpbmRvdyBmb3IgZXh0ZXJuYWwgaW50ZWdyYXRpb25zXG4gICAgaWYgKHR5cGVvZiB3aW5kb3cgIT09ICd1bmRlZmluZWQnICYmIHR5cGVvZiB3aW5kb3cuZGlzcGF0Y2hFdmVudCA9PT0gJ2Z1bmN0aW9uJyAmJiB0eXBlb2YgQ3VzdG9tRXZlbnQgIT09ICd1bmRlZmluZWQnKSB7XG4gICAgICB3aW5kb3cuZGlzcGF0Y2hFdmVudChuZXcgQ3VzdG9tRXZlbnQoYGRlc3NlcnQ6JHtldmVudH1gLCB7IGRldGFpbDogcGF5bG9hZCB9KSk7XG4gICAgfVxuICB9XG5cbiAgLyoqXG4gICAqIFNldCBnbG9iYWwgY29udHJvbGxlciBzdGF0ZSBrZXktdmFsdWUuXG4gICAqIEBwYXJhbSB7c3RyaW5nfSBrZXlcbiAgICogQHBhcmFtIHsqfSB2YWx1ZVxuICAgKi9cbiAgc2V0U3RhdGUoa2V5LCB2YWx1ZSkge1xuICAgIGNvbnN0IHByZXYgPSB0aGlzLl9zdGF0ZS5nZXQoa2V5KTtcbiAgICB0aGlzLl9zdGF0ZS5zZXQoa2V5LCB2YWx1ZSk7XG4gICAgdGhpcy5lbWl0KCdzdGF0ZTpjaGFuZ2UnLCB7IGtleSwgdmFsdWUsIHByZXYgfSk7XG4gIH1cblxuICAvKipcbiAgICogR2V0IGNvbnRyb2xsZXIgc3RhdGUuXG4gICAqIEBwYXJhbSB7c3RyaW5nfSBrZXlcbiAgICogQHBhcmFtIHsqfSBbZmFsbGJhY2s9bnVsbF1cbiAgICogQHJldHVybnMgeyp9XG4gICAqL1xuICBnZXRTdGF0ZShrZXksIGZhbGxiYWNrID0gbnVsbCkge1xuICAgIHJldHVybiB0aGlzLl9zdGF0ZS5oYXMoa2V5KSA/IHRoaXMuX3N0YXRlLmdldChrZXkpIDogZmFsbGJhY2s7XG4gIH1cblxuICAvKipcbiAgICogUmVnaXN0ZXIgYW4gYWN0aXZlIGNvbXBvbmVudCBlbGVtZW50IGluIERPTS5cbiAgICogQHBhcmFtIHtIVE1MRWxlbWVudH0gZWxcbiAgICovXG4gIHJlZ2lzdGVySW5zdGFuY2UoZWwpIHtcbiAgICB0aGlzLl9hY3RpdmVJbnN0YW5jZXMuYWRkKGVsKTtcbiAgICB0aGlzLmVtaXQoJ2luc3RhbmNlOnJlZ2lzdGVyZWQnLCB7IGVsIH0pO1xuICB9XG5cbiAgLyoqXG4gICAqIFVucmVnaXN0ZXIgYW4gYWN0aXZlIGNvbXBvbmVudCBlbGVtZW50LlxuICAgKiBAcGFyYW0ge0hUTUxFbGVtZW50fSBlbFxuICAgKi9cbiAgdW5yZWdpc3Rlckluc3RhbmNlKGVsKSB7XG4gICAgdGhpcy5fYWN0aXZlSW5zdGFuY2VzLmRlbGV0ZShlbCk7XG4gICAgdGhpcy5lbWl0KCdpbnN0YW5jZTp1bnJlZ2lzdGVyZWQnLCB7IGVsIH0pO1xuICB9XG5cbiAgLyoqXG4gICAqIENsb3NlIGFsbCBhY3RpdmUgcG9wdXBzLCBkcm9wZG93bnMsIGFuZCBtb2RhbHMgZ2xvYmFsbHkuXG4gICAqL1xuICBjbG9zZUFsbCgpIHtcbiAgICBpZiAodHlwZW9mIGRvY3VtZW50ID09PSAndW5kZWZpbmVkJykgcmV0dXJuO1xuXG4gICAgLy8gQ2xvc2UgYWxsIG9wZW4gbW9kYWxzXG4gICAgZG9jdW1lbnQucXVlcnlTZWxlY3RvckFsbCgnLmRlc3NlcnQtbW9kYWwuZGVzc2VydC1zaG93JykuZm9yRWFjaCgobW9kYWwpID0+IHtcbiAgICAgIHRoaXMuY29yZT8ubW9kYWw/LmNsb3NlKG1vZGFsKTtcbiAgICB9KTtcblxuICAgIC8vIENsb3NlIGFsbCBvcGVuIGRyb3Bkb3duIG1lbnVzXG4gICAgZG9jdW1lbnQucXVlcnlTZWxlY3RvckFsbCgnLmRlc3NlcnQtZHJvcGRvd24tbWVudS5kZXNzZXJ0LXNob3cnKS5mb3JFYWNoKChtZW51KSA9PiB7XG4gICAgICBtZW51LmNsYXNzTGlzdC5yZW1vdmUoJ2Rlc3NlcnQtc2hvdycpO1xuICAgIH0pO1xuXG4gICAgdGhpcy5lbWl0KCdkaXNtaXNzOmFsbCcpO1xuICB9XG5cbiAgLyoqXG4gICAqIFJlZnJlc2ggYW5kIHJlLXJ1biBET00gY29tcG9uZW50IGJpbmRpbmdzLlxuICAgKi9cbiAgcmVmcmVzaCgpIHtcbiAgICBpZiAodGhpcy5jb3JlKSB7XG4gICAgICB0aGlzLmNvcmUuYXV0b0luaXQ/LigpO1xuICAgICAgdGhpcy5lbWl0KCdsaWZlY3ljbGU6cmVmcmVzaGVkJyk7XG4gICAgfVxuICB9XG5cbiAgLyoqXG4gICAqIFJlc2V0IGFsbCBjb250cm9sbGVyIGxpc3RlbmVycyBhbmQgc3RhdGVzLlxuICAgKi9cbiAgcmVzZXQoKSB7XG4gICAgdGhpcy5fbGlzdGVuZXJzLmNsZWFyKCk7XG4gICAgdGhpcy5fc3RhdGUuY2xlYXIoKTtcbiAgICB0aGlzLl9hY3RpdmVJbnN0YW5jZXMuY2xlYXIoKTtcbiAgICB0aGlzLmVtaXQoJ2xpZmVjeWNsZTpyZXNldCcpO1xuICB9XG59XG5cbmV4cG9ydCB7IERlc3NlcnRDb250cm9sbGVyIH07XG4iLCAiLyoqXG4gKiBAZmlsZSBDb3JlIERFU1NFUlQgY2xhc3MuXG4gKi9cblxuaW1wb3J0IHsgVkVSU0lPTiwgUFJFRklYLCBERUZBVUxUX09QVElPTlMgfSBmcm9tICcuL2NvbnN0YW50cy5qcyc7XG5pbXBvcnQgeyBzdGF0ZSwgb3B0aW9ucyB9IGZyb20gJy4vc3RhdGUuanMnO1xuaW1wb3J0IHsgcmVnaXN0cnkgfSBmcm9tICcuL3JlZ2lzdHJ5LmpzJztcbmltcG9ydCB7IGhlbHBlcnMgfSBmcm9tICcuLi91dGlscy9icmlkZ2UuanMnO1xuaW1wb3J0IHsgbG9nIH0gZnJvbSAnLi4vdXRpbHMvbG9nZ2VyLmpzJztcbmltcG9ydCB7IERlc3NlcnRDb250cm9sbGVyIH0gZnJvbSAnLi9jb250cm9sbGVyLmpzJztcblxuLyoqXG4gKiBAdHlwZWRlZiB7T2JqZWN0fSBEZXNzZXJ0Q29uZmlnXG4gKiBAcHJvcGVydHkge2Jvb2xlYW59IFthdXRvSW5pdF1cbiAqIEBwcm9wZXJ0eSB7Ym9vbGVhbn0gW2RlYnVnXVxuICogQHByb3BlcnR5IHtib29sZWFufSBbY2xvc2VPbkVzY2FwZV1cbiAqIEBwcm9wZXJ0eSB7Ym9vbGVhbn0gW2ZvcmNlXVxuICovXG5cbi8qKlxuICogQGRlc2NyaXB0aW9uIENvcmUgREVTU0VSVCBjbGFzcy5cbiAqL1xuY2xhc3MgREVTU0VSVCB7XG4gIC8qKlxuICAgKiBAcHJpdmF0ZVxuICAgKiBAdHlwZSB7REVTU0VSVHxudWxsfVxuICAgKi9cbiAgc3RhdGljICNpbnN0YW5jZSA9IG51bGw7XG5cbiAgLyoqXG4gICAqIEBkZXNjcmlwdGlvbiBMaWJyYXJ5IHZlcnNpb24uXG4gICAqIEByZXR1cm5zIHtzdHJpbmd9XG4gICAqL1xuICBzdGF0aWMgZ2V0IHZlcnNpb24oKSB7IHJldHVybiBWRVJTSU9OOyB9XG5cbiAgLyoqXG4gICAqIEBkZXNjcmlwdGlvbiBDcmVhdGUgYSBmcmVzaCBpbnN0YW5jZSBieXBhc3Npbmcgc2luZ2xldG9uLlxuICAgKiBAcGFyYW0ge0Rlc3NlcnRDb25maWd9IFtjZmc9e31dXG4gICAqIEByZXR1cm5zIHtERVNTRVJUfVxuICAgKi9cbiAgc3RhdGljIGNyZWF0ZShjZmcgPSB7fSkge1xuICAgIHJldHVybiBuZXcgREVTU0VSVCh7IC4uLmNmZywgZm9yY2U6IHRydWUgfSk7XG4gIH1cblxuICAvKipcbiAgICogQHBhcmFtIHtEZXNzZXJ0Q29uZmlnfSBbY2ZnPXt9XVxuICAgKi9cbiAgY29uc3RydWN0b3IoY2ZnID0ge30pIHtcbiAgICBpZiAoREVTU0VSVC4jaW5zdGFuY2UgJiYgIWNmZy5mb3JjZSkgcmV0dXJuIERFU1NFUlQuI2luc3RhbmNlO1xuXG4gICAgT2JqZWN0LmFzc2lnbihvcHRpb25zLCBERUZBVUxUX09QVElPTlMsIGNmZyk7XG5cbiAgICAvKipcbiAgICAgKiBAZGVzY3JpcHRpb24gTGlicmFyeSB2ZXJzaW9uLlxuICAgICAqIEB0eXBlIHtzdHJpbmd9XG4gICAgICovXG4gICAgdGhpcy52ZXJzaW9uID0gVkVSU0lPTjtcblxuICAgIC8qKlxuICAgICAqIEBkZXNjcmlwdGlvbiBDU1MgcHJlZml4LlxuICAgICAqIEB0eXBlIHtzdHJpbmd9XG4gICAgICovXG4gICAgdGhpcy5wcmVmaXggPSBQUkVGSVg7XG5cbiAgICBoZWxwZXJzLmJpbmQoeyBjb3JlOiB0aGlzLCBvcHRpb25zLCBzdGF0ZSwgcmVnaXN0cnkgfSk7XG5cbiAgICAvKipcbiAgICAgKiBAZGVzY3JpcHRpb24gQ2VudHJhbGl6ZWQgY29udHJvbGxlciBhbmQgZXZlbnQgYnVzLlxuICAgICAqIEB0eXBlIHtEZXNzZXJ0Q29udHJvbGxlcn1cbiAgICAgKi9cbiAgICB0aGlzLmNvbnRyb2xsZXIgPSBuZXcgRGVzc2VydENvbnRyb2xsZXIoeyBjb3JlOiB0aGlzIH0pO1xuXG4gICAgREVTU0VSVC4jaW5zdGFuY2UgPSB0aGlzO1xuICB9XG5cbiAgLyoqXG4gICAqIEBkZXNjcmlwdGlvbiBJbml0aWFsaXplIHRoZSBsaWJyYXJ5LlxuICAgKiBAcGFyYW0ge0Rlc3NlcnRDb25maWd9IFtleHRyYT17fV1cbiAgICogQHJldHVybnMge0RFU1NFUlR9XG4gICAqL1xuICBpbml0KGV4dHJhID0ge30pIHtcbiAgICBPYmplY3QuYXNzaWduKG9wdGlvbnMsIGV4dHJhKTtcblxuICAgIGlmIChvcHRpb25zLmF1dG9Jbml0KSB0aGlzLmF1dG9Jbml0KCk7XG5cbiAgICByZWdpc3RyeS5wbHVnaW5zLmZvckVhY2goKHBsdWdpbikgPT4gcGx1Z2luLmluaXQ/Lih0aGlzKSk7XG5cbiAgICB0aGlzLmNvbnRyb2xsZXIuZW1pdCgnaW5pdCcsIHsgdmVyc2lvbjogVkVSU0lPTiwgb3B0aW9ucyB9KTtcblxuICAgIGxvZyhgREVTU0VSVCB2JHtWRVJTSU9OfSBpbml0aWFsaXplZGApO1xuICAgIHJldHVybiB0aGlzO1xuICB9XG5cbiAgLyoqXG4gICAqIEBkZXNjcmlwdGlvbiBSZWdpc3RlciBhIHBsdWdpbi5cbiAgICogQHBhcmFtIHtzdHJpbmd9IG5hbWVcbiAgICogQHBhcmFtIHsqfSBwbHVnaW5cbiAgICogQHJldHVybnMge0RFU1NFUlR9XG4gICAqL1xuICByZWdpc3RlcihuYW1lLCBwbHVnaW4pIHtcbiAgICBpZiAocmVnaXN0cnkucGx1Z2lucy5oYXMobmFtZSkpIHJldHVybiB0aGlzO1xuICAgIHJlZ2lzdHJ5LnBsdWdpbnMuc2V0KG5hbWUsIHBsdWdpbik7XG4gICAgcGx1Z2luLmluc3RhbGw/Lih0aGlzLCBoZWxwZXJzKTtcbiAgICBsb2coJ3BsdWdpbiByZWdpc3RlcmVkOicsIG5hbWUpO1xuICAgIHJldHVybiB0aGlzO1xuICB9XG5cbiAgLyoqXG4gICAqIEBkZXNjcmlwdGlvbiBSZWdpc3RlciBhbmQgaW5pdCBhIHBsdWdpbi5cbiAgICogQHBhcmFtIHsqfSBwbHVnaW5cbiAgICogQHJldHVybnMge0RFU1NFUlR9XG4gICAqL1xuICB1c2UocGx1Z2luKSB7XG4gICAgaWYgKCFwbHVnaW4/Lm5hbWUpIHJldHVybiB0aGlzO1xuICAgIHRoaXMucmVnaXN0ZXIocGx1Z2luLm5hbWUsIHBsdWdpbik7XG4gICAgcGx1Z2luLmluaXQ/Lih0aGlzKTtcbiAgICByZXR1cm4gdGhpcztcbiAgfVxufVxuXG5leHBvcnQgeyBERVNTRVJUIH07XG4iLCAiLyoqXG4gKiBAZmlsZSBDU1Mgc2VsZWN0b3IgZXNjYXBpbmcuXG4gKi9cblxuLyoqXG4gKiBAZGVzY3JpcHRpb24gRXNjYXBlIGEgc3RyaW5nIGZvciBDU1Mgc2VsZWN0b3JzLlxuICogQHBhcmFtIHtzdHJpbmd9IHNcbiAqIEByZXR1cm5zIHtzdHJpbmd9XG4gKi9cbmZ1bmN0aW9uIGVzYyhzKSB7XG4gIHJldHVybiBnbG9iYWxUaGlzLkNTUz8uZXNjYXBlXG4gICAgPyBDU1MuZXNjYXBlKHMpXG4gICAgOiBTdHJpbmcocykucmVwbGFjZSgvXCIvZywgJ1xcXFxcIicpO1xufVxuXG5leHBvcnQgeyBlc2MgfTtcbiIsICIvKipcbiAqIEBmaWxlIE1vZGFsIGNvbXBvbmVudC5cbiAqL1xuXG5pbXBvcnQgeyBlc2MgfSBmcm9tICcuLi91dGlscy9lc2NhcGUuanMnO1xuaW1wb3J0IHsgcmVnaXN0cnkgfSBmcm9tICcuLi9jb3JlL3JlZ2lzdHJ5LmpzJztcbmltcG9ydCB7IGxvZyB9IGZyb20gJy4uL3V0aWxzL2xvZ2dlci5qcyc7XG5cbi8qKlxuICogQHR5cGVkZWYge09iamVjdH0gTW9kYWxDb3JlXG4gKiBAcHJvcGVydHkge3sgb3BlbjogKGVsOiBIVE1MRWxlbWVudCkgPT4gdm9pZCwgY2xvc2U6IChlbDogSFRNTEVsZW1lbnQpID0+IHZvaWQgfX0gbW9kYWxcbiAqL1xuXG4vKipcbiAqIEBkZXNjcmlwdGlvbiBJbml0aWFsaXplIG1vZGFsIGVsZW1lbnQuXG4gKiBAdGhpcyB7TW9kYWxDb3JlfVxuICogQHBhcmFtIHtIVE1MRWxlbWVudH0gZWxcbiAqIEByZXR1cm5zIHt2b2lkfVxuICovXG5mdW5jdGlvbiBtb2RhbENvbXBvbmVudChlbCkge1xuICBjb25zdCBjb3JlID0gdGhpcztcbiAgY29uc3Qgb3BlbkJ0bnMgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yQWxsKFxuICAgIGBbZGF0YS1kZXNzZXJ0LW9wZW49XCIke2VzYyhlbC5pZCl9XCJdYFxuICApO1xuICBjb25zdCBjbG9zZUJ0bnMgPSBlbC5xdWVyeVNlbGVjdG9yQWxsKCdbZGF0YS1kZXNzZXJ0LWNsb3NlXScpO1xuICAvKiogQHR5cGUge0FycmF5PFtFdmVudFRhcmdldCwgc3RyaW5nLCBFdmVudExpc3RlbmVyXT59ICovXG4gIGNvbnN0IGhhbmRsZXJzID0gW107XG5cbiAgb3BlbkJ0bnMuZm9yRWFjaCgoYnRuKSA9PiB7XG4gICAgY29uc3QgaCA9ICgpID0+IGNvcmUubW9kYWwub3BlbihlbCk7XG4gICAgYnRuLmFkZEV2ZW50TGlzdGVuZXIoJ2NsaWNrJywgaCk7XG4gICAgaGFuZGxlcnMucHVzaChbYnRuLCAnY2xpY2snLCBoXSk7XG4gIH0pO1xuXG4gIGNsb3NlQnRucy5mb3JFYWNoKChidG4pID0+IHtcbiAgICBjb25zdCBoID0gKCkgPT4gY29yZS5tb2RhbC5jbG9zZShlbCk7XG4gICAgYnRuLmFkZEV2ZW50TGlzdGVuZXIoJ2NsaWNrJywgaCk7XG4gICAgaGFuZGxlcnMucHVzaChbYnRuLCAnY2xpY2snLCBoXSk7XG4gIH0pO1xuXG4gIGNvbnN0IG92ZXJsYXlIID0gKGUpID0+IHsgaWYgKGUudGFyZ2V0ID09PSBlbCkgY29yZS5tb2RhbC5jbG9zZShlbCk7IH07XG4gIGVsLmFkZEV2ZW50TGlzdGVuZXIoJ2NsaWNrJywgb3ZlcmxheUgpO1xuICBoYW5kbGVycy5wdXNoKFtlbCwgJ2NsaWNrJywgb3ZlcmxheUhdKTtcblxuICByZWdpc3RyeS5pbnN0YW5jZXMuc2V0KGVsLCB7IHR5cGU6ICdtb2RhbCcsIGhhbmRsZXJzIH0pO1xuICBsb2coJ21vZGFsIGluaXQ6JywgZWwuaWQpO1xufVxuXG5leHBvcnQgeyBtb2RhbENvbXBvbmVudCB9O1xuIiwgIi8qKlxuICogQGZpbGUgUHJlZml4ZWQgY2xhc3MgaGVscGVycy5cbiAqL1xuXG5pbXBvcnQgeyBQUkVGSVggfSBmcm9tICcuLi9jb3JlL2NvbnN0YW50cy5qcyc7XG5cbi8qKlxuICogQGRlc2NyaXB0aW9uIEFkZCBhIHByZWZpeGVkIGNsYXNzLlxuICogQHBhcmFtIHtIVE1MRWxlbWVudH0gZWxcbiAqIEBwYXJhbSB7c3RyaW5nfSBuYW1lXG4gKiBAcmV0dXJucyB7SFRNTEVsZW1lbnR9XG4gKi9cbmZ1bmN0aW9uIGFkZENsYXNzKGVsLCBuYW1lKSB7XG4gIGVsLmNsYXNzTGlzdC5hZGQoYCR7UFJFRklYfS0ke25hbWV9YCk7XG4gIHJldHVybiBlbDtcbn1cblxuLyoqXG4gKiBAZGVzY3JpcHRpb24gUmVtb3ZlIGEgcHJlZml4ZWQgY2xhc3MuXG4gKiBAcGFyYW0ge0hUTUxFbGVtZW50fSBlbFxuICogQHBhcmFtIHtzdHJpbmd9IG5hbWVcbiAqIEByZXR1cm5zIHtIVE1MRWxlbWVudH1cbiAqL1xuZnVuY3Rpb24gcmVtb3ZlQ2xhc3MoZWwsIG5hbWUpIHtcbiAgZWwuY2xhc3NMaXN0LnJlbW92ZShgJHtQUkVGSVh9LSR7bmFtZX1gKTtcbiAgcmV0dXJuIGVsO1xufVxuXG4vKipcbiAqIEBkZXNjcmlwdGlvbiBUb2dnbGUgYSBwcmVmaXhlZCBjbGFzcy5cbiAqIEBwYXJhbSB7SFRNTEVsZW1lbnR9IGVsXG4gKiBAcGFyYW0ge3N0cmluZ30gbmFtZVxuICogQHBhcmFtIHtib29sZWFufSBbZm9yY2VdXG4gKiBAcmV0dXJucyB7SFRNTEVsZW1lbnR9XG4gKi9cbmZ1bmN0aW9uIHRvZ2dsZUNsYXNzKGVsLCBuYW1lLCBmb3JjZSkge1xuICBjb25zdCBjbHMgPSBgJHtQUkVGSVh9LSR7bmFtZX1gO1xuICB0eXBlb2YgZm9yY2UgPT09ICdib29sZWFuJ1xuICAgID8gZWwuY2xhc3NMaXN0LnRvZ2dsZShjbHMsIGZvcmNlKVxuICAgIDogZWwuY2xhc3NMaXN0LnRvZ2dsZShjbHMpO1xuICByZXR1cm4gZWw7XG59XG5cbmV4cG9ydCB7IGFkZENsYXNzLCByZW1vdmVDbGFzcywgdG9nZ2xlQ2xhc3MgfTtcbiIsICIvKipcbiAqIEBmaWxlIERyb3Bkb3duIGNvbXBvbmVudC5cbiAqL1xuXG5pbXBvcnQgeyByZW1vdmVDbGFzcywgdG9nZ2xlQ2xhc3MgfSBmcm9tICcuLi91dGlscy9jbGFzc05hbWVzLmpzJztcbmltcG9ydCB7IHJlZ2lzdHJ5IH0gZnJvbSAnLi4vY29yZS9yZWdpc3RyeS5qcyc7XG5pbXBvcnQgeyBsb2cgfSBmcm9tICcuLi91dGlscy9sb2dnZXIuanMnO1xuXG4vKipcbiAqIEBkZXNjcmlwdGlvbiBJbml0aWFsaXplIGRyb3Bkb3duIGVsZW1lbnQuXG4gKiBAcGFyYW0ge0hUTUxFbGVtZW50fSBlbFxuICogQHJldHVybnMge3ZvaWR9XG4gKi9cbmZ1bmN0aW9uIGRyb3Bkb3duQ29tcG9uZW50KGVsKSB7XG4gIGNvbnN0IHRyaWdnZXIgPSBlbC5xdWVyeVNlbGVjdG9yKCdbZGF0YS1kZXNzZXJ0LXRyaWdnZXJdJyk7XG4gIGNvbnN0IG1lbnUgPSBlbC5xdWVyeVNlbGVjdG9yKCdbZGF0YS1kZXNzZXJ0LW1lbnVdJyk7XG4gIGlmICghdHJpZ2dlciB8fCAhbWVudSkgcmV0dXJuO1xuXG4gIC8qKiBAdHlwZSB7QXJyYXk8W0V2ZW50VGFyZ2V0LCBzdHJpbmcsIEV2ZW50TGlzdGVuZXJdPn0gKi9cbiAgY29uc3QgaGFuZGxlcnMgPSBbXTtcblxuICBjb25zdCBvblRyaWdnZXIgPSAoZSkgPT4ge1xuICAgIGUuc3RvcFByb3BhZ2F0aW9uKCk7XG4gICAgdG9nZ2xlQ2xhc3MoZWwsICdvcGVuJyk7XG4gICAgdG9nZ2xlQ2xhc3MobWVudSwgJ3Nob3cnKTtcbiAgfTtcbiAgdHJpZ2dlci5hZGRFdmVudExpc3RlbmVyKCdjbGljaycsIG9uVHJpZ2dlcik7XG4gIGhhbmRsZXJzLnB1c2goW3RyaWdnZXIsICdjbGljaycsIG9uVHJpZ2dlcl0pO1xuXG4gIGNvbnN0IG9uT3V0c2lkZSA9IChlKSA9PiB7XG4gICAgaWYgKCFlbC5jb250YWlucygvKiogQHR5cGUge05vZGV9ICovKGUudGFyZ2V0KSkpIHtcbiAgICAgIHJlbW92ZUNsYXNzKGVsLCAnb3BlbicpO1xuICAgICAgcmVtb3ZlQ2xhc3MobWVudSwgJ3Nob3cnKTtcbiAgICB9XG4gIH07XG4gIGRvY3VtZW50LmFkZEV2ZW50TGlzdGVuZXIoJ2NsaWNrJywgb25PdXRzaWRlKTtcbiAgaGFuZGxlcnMucHVzaChbZG9jdW1lbnQsICdjbGljaycsIG9uT3V0c2lkZV0pO1xuXG4gIHJlZ2lzdHJ5Lmluc3RhbmNlcy5zZXQoZWwsIHsgdHlwZTogJ2Ryb3Bkb3duJywgaGFuZGxlcnMgfSk7XG4gIGxvZygnZHJvcGRvd24gaW5pdCcpO1xufVxuXG5leHBvcnQgeyBkcm9wZG93bkNvbXBvbmVudCB9O1xuIiwgIi8qKlxuICogQGZpbGUgVGFicyBjb21wb25lbnQuXG4gKi9cblxuaW1wb3J0IHsgYWRkQ2xhc3MsIHJlbW92ZUNsYXNzIH0gZnJvbSAnLi4vdXRpbHMvY2xhc3NOYW1lcy5qcyc7XG5pbXBvcnQgeyBlc2MgfSBmcm9tICcuLi91dGlscy9lc2NhcGUuanMnO1xuaW1wb3J0IHsgcmVnaXN0cnkgfSBmcm9tICcuLi9jb3JlL3JlZ2lzdHJ5LmpzJztcbmltcG9ydCB7IGxvZyB9IGZyb20gJy4uL3V0aWxzL2xvZ2dlci5qcyc7XG5cbi8qKlxuICogQGRlc2NyaXB0aW9uIEluaXRpYWxpemUgdGFicyBlbGVtZW50LlxuICogQHBhcmFtIHtIVE1MRWxlbWVudH0gZWxcbiAqIEByZXR1cm5zIHt2b2lkfVxuICovXG5mdW5jdGlvbiB0YWJzQ29tcG9uZW50KGVsKSB7XG4gIGNvbnN0IGJ1dHRvbnMgPSBlbC5xdWVyeVNlbGVjdG9yQWxsKCdbZGF0YS1kZXNzZXJ0LXRhYl0nKTtcbiAgY29uc3QgcGFuZWxzID0gZWwucXVlcnlTZWxlY3RvckFsbCgnW2RhdGEtZGVzc2VydC1wYW5lbF0nKTtcbiAgaWYgKCFidXR0b25zLmxlbmd0aCkgcmV0dXJuO1xuXG4gIC8qKiBAdHlwZSB7QXJyYXk8W0V2ZW50VGFyZ2V0LCBzdHJpbmcsIEV2ZW50TGlzdGVuZXJdPn0gKi9cbiAgY29uc3QgaGFuZGxlcnMgPSBbXTtcblxuICAvKipcbiAgICogQGRlc2NyaXB0aW9uIEFjdGl2YXRlIGEgdGFiIGFuZCBpdHMgcGFuZWwuXG4gICAqIEBwYXJhbSB7c3RyaW5nfSB0YXJnZXRcbiAgICogQHJldHVybnMge3ZvaWR9XG4gICAqL1xuICBjb25zdCBhY3RpdmF0ZSA9ICh0YXJnZXQpID0+IHtcbiAgICBidXR0b25zLmZvckVhY2goKGIpID0+IHJlbW92ZUNsYXNzKGIsICdhY3RpdmUnKSk7XG4gICAgcGFuZWxzLmZvckVhY2goKHApID0+IHJlbW92ZUNsYXNzKHAsICdhY3RpdmUnKSk7XG5cbiAgICBjb25zdCBidG4gPSBlbC5xdWVyeVNlbGVjdG9yKGBbZGF0YS1kZXNzZXJ0LXRhYj1cIiR7ZXNjKHRhcmdldCl9XCJdYCk7XG4gICAgY29uc3QgcGFuZWwgPSBlbC5xdWVyeVNlbGVjdG9yKGBbZGF0YS1kZXNzZXJ0LXBhbmVsPVwiJHtlc2ModGFyZ2V0KX1cIl1gKTtcbiAgICBpZiAoYnRuKSBhZGRDbGFzcyhidG4sICdhY3RpdmUnKTtcbiAgICBpZiAocGFuZWwpIGFkZENsYXNzKHBhbmVsLCAnYWN0aXZlJyk7XG4gIH07XG5cbiAgYnV0dG9ucy5mb3JFYWNoKChidG4pID0+IHtcbiAgICBjb25zdCBoID0gKCkgPT4gYWN0aXZhdGUoYnRuLmdldEF0dHJpYnV0ZSgnZGF0YS1kZXNzZXJ0LXRhYicpKTtcbiAgICBidG4uYWRkRXZlbnRMaXN0ZW5lcignY2xpY2snLCBoKTtcbiAgICBoYW5kbGVycy5wdXNoKFtidG4sICdjbGljaycsIGhdKTtcbiAgfSk7XG5cbiAgY29uc3QgaW5pdGlhbCA9IGVsLnF1ZXJ5U2VsZWN0b3IoJy5kZXNzZXJ0LXRhYi5kZXNzZXJ0LWFjdGl2ZScpO1xuICBpZiAoaW5pdGlhbCkgYWN0aXZhdGUoaW5pdGlhbC5nZXRBdHRyaWJ1dGUoJ2RhdGEtZGVzc2VydC10YWInKSk7XG5cbiAgcmVnaXN0cnkuaW5zdGFuY2VzLnNldChlbCwgeyB0eXBlOiAndGFicycsIGhhbmRsZXJzIH0pO1xuICBsb2coJ3RhYnMgaW5pdCcpO1xufVxuXG5leHBvcnQgeyB0YWJzQ29tcG9uZW50IH07XG4iLCAiLyoqXG4gKiBAZmlsZSBBY2NvcmRpb24gY29tcG9uZW50LlxuICogUm9idXN0IGF1dG8tZXhwYW5kaW5nIGFjY29yZGlvbiB3aXRoIHplcm8gdGV4dCBjbGlwcGluZy5cbiAqL1xuXG5pbXBvcnQgeyBhZGRDbGFzcywgcmVtb3ZlQ2xhc3MgfSBmcm9tICcuLi91dGlscy9jbGFzc05hbWVzLmpzJztcbmltcG9ydCB7IHJlZ2lzdHJ5IH0gZnJvbSAnLi4vY29yZS9yZWdpc3RyeS5qcyc7XG5pbXBvcnQgeyBoZWxwZXJzIH0gZnJvbSAnLi4vdXRpbHMvYnJpZGdlLmpzJztcbmltcG9ydCB7IGxvZyB9IGZyb20gJy4uL3V0aWxzL2xvZ2dlci5qcyc7XG5cbi8qKlxuICogQGRlc2NyaXB0aW9uIEluaXRpYWxpemUgYWNjb3JkaW9uIGVsZW1lbnQuXG4gKiBAcGFyYW0ge0hUTUxFbGVtZW50fSBlbFxuICogQHJldHVybnMge3ZvaWR9XG4gKi9cbmZ1bmN0aW9uIGFjY29yZGlvbkNvbXBvbmVudChlbCkge1xuICBjb25zdCBpdGVtcyA9IGVsLnF1ZXJ5U2VsZWN0b3JBbGwoJy5kZXNzZXJ0LWFjY29yZGlvbi1pdGVtJyk7XG4gIC8qKiBAdHlwZSB7QXJyYXk8W0V2ZW50VGFyZ2V0LCBzdHJpbmcsIEV2ZW50TGlzdGVuZXJdPn0gKi9cbiAgY29uc3QgaGFuZGxlcnMgPSBbXTtcblxuICAvLyBJbml0aWFsaXplIGV4aXN0aW5nIG9wZW4gaXRlbXNcbiAgaXRlbXMuZm9yRWFjaCgoaXRlbSkgPT4ge1xuICAgIGNvbnN0IGJvZHkgPSAvKiogQHR5cGUge0hUTUxFbGVtZW50fG51bGx9ICovIChpdGVtLnF1ZXJ5U2VsZWN0b3IoJy5kZXNzZXJ0LWFjY29yZGlvbi1ib2R5JykpO1xuICAgIGlmIChpdGVtLmNsYXNzTGlzdC5jb250YWlucygnZGVzc2VydC1vcGVuJykgJiYgYm9keSkge1xuICAgICAgYm9keS5zdHlsZS5tYXhIZWlnaHQgPSAnbm9uZSc7XG4gICAgICBib2R5LnN0eWxlLm92ZXJmbG93ID0gJ3Zpc2libGUnO1xuICAgIH0gZWxzZSBpZiAoYm9keSkge1xuICAgICAgYm9keS5zdHlsZS5tYXhIZWlnaHQgPSAnMHB4JztcbiAgICAgIGJvZHkuc3R5bGUub3ZlcmZsb3cgPSAnaGlkZGVuJztcbiAgICB9XG4gIH0pO1xuXG4gIGl0ZW1zLmZvckVhY2goKGl0ZW0pID0+IHtcbiAgICBjb25zdCBoZWFkZXIgPSBpdGVtLnF1ZXJ5U2VsZWN0b3IoJy5kZXNzZXJ0LWFjY29yZGlvbi1oZWFkZXInKTtcbiAgICBjb25zdCBib2R5ID0gLyoqIEB0eXBlIHtIVE1MRWxlbWVudHxudWxsfSAqLyAoaXRlbS5xdWVyeVNlbGVjdG9yKCcuZGVzc2VydC1hY2NvcmRpb24tYm9keScpKTtcbiAgICBpZiAoIWhlYWRlciB8fCAhYm9keSkgcmV0dXJuO1xuXG4gICAgY29uc3QgdG9nZ2xlID0gKCkgPT4ge1xuICAgICAgY29uc3QgaXNPcGVuID0gaXRlbS5jbGFzc0xpc3QuY29udGFpbnMoJ2Rlc3NlcnQtb3BlbicpO1xuXG4gICAgICAvLyBDbG9zZSBzaWJsaW5ncyBpZiBpbiBzdGFuZGFyZCBzaW5nbGUtb3BlbiBhY2NvcmRpb24gbW9kZVxuICAgICAgaXRlbXMuZm9yRWFjaCgoc2libGluZykgPT4ge1xuICAgICAgICBpZiAoc2libGluZyAhPT0gaXRlbSAmJiBzaWJsaW5nLmNsYXNzTGlzdC5jb250YWlucygnZGVzc2VydC1vcGVuJykpIHtcbiAgICAgICAgICBjb25zdCBzQm9keSA9IC8qKiBAdHlwZSB7SFRNTEVsZW1lbnR8bnVsbH0gKi8gKHNpYmxpbmcucXVlcnlTZWxlY3RvcignLmRlc3NlcnQtYWNjb3JkaW9uLWJvZHknKSk7XG4gICAgICAgICAgaWYgKHNCb2R5KSB7XG4gICAgICAgICAgICBzQm9keS5zdHlsZS5vdmVyZmxvdyA9ICdoaWRkZW4nO1xuICAgICAgICAgICAgc0JvZHkuc3R5bGUubWF4SGVpZ2h0ID0gYCR7c0JvZHkuc2Nyb2xsSGVpZ2h0fXB4YDtcbiAgICAgICAgICAgIC8vIFRyaWdnZXIgcmVmbG93XG4gICAgICAgICAgICB2b2lkIHNCb2R5Lm9mZnNldEhlaWdodDtcbiAgICAgICAgICAgIHNCb2R5LnN0eWxlLm1heEhlaWdodCA9ICcwcHgnO1xuICAgICAgICAgIH1cbiAgICAgICAgICByZW1vdmVDbGFzcyhzaWJsaW5nLCAnb3BlbicpO1xuICAgICAgICB9XG4gICAgICB9KTtcblxuICAgICAgaWYgKGlzT3Blbikge1xuICAgICAgICAvLyBDbG9zaW5nIGN1cnJlbnQgaXRlbVxuICAgICAgICBib2R5LnN0eWxlLm92ZXJmbG93ID0gJ2hpZGRlbic7XG4gICAgICAgIGJvZHkuc3R5bGUubWF4SGVpZ2h0ID0gYCR7Ym9keS5zY3JvbGxIZWlnaHR9cHhgO1xuICAgICAgICB2b2lkIGJvZHkub2Zmc2V0SGVpZ2h0O1xuICAgICAgICBib2R5LnN0eWxlLm1heEhlaWdodCA9ICcwcHgnO1xuICAgICAgICByZW1vdmVDbGFzcyhpdGVtLCAnb3BlbicpO1xuICAgICAgICBoZWxwZXJzLmNvbnRyb2xsZXI/LmVtaXQoJ2FjY29yZGlvbjpjbG9zZScsIHsgZWw6IGl0ZW0gfSk7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICAvLyBPcGVuaW5nIGN1cnJlbnQgaXRlbVxuICAgICAgICBhZGRDbGFzcyhpdGVtLCAnb3BlbicpO1xuICAgICAgICBib2R5LnN0eWxlLm92ZXJmbG93ID0gJ2hpZGRlbic7XG4gICAgICAgIC8vIEFkZCBleHRyYSBwYWRkaW5nIHNhZmV0eSBtYXJnaW4gc28gc2Nyb2xsSGVpZ2h0IG5ldmVyIGNsaXBzXG4gICAgICAgIGNvbnN0IHRhcmdldEhlaWdodCA9IGJvZHkuc2Nyb2xsSGVpZ2h0ICsgMzI7XG4gICAgICAgIGJvZHkuc3R5bGUubWF4SGVpZ2h0ID0gYCR7dGFyZ2V0SGVpZ2h0fXB4YDtcblxuICAgICAgICBjb25zdCBvblRyYW5zaXRpb25FbmQgPSAoZSkgPT4ge1xuICAgICAgICAgIGlmIChlLnByb3BlcnR5TmFtZSA9PT0gJ21heC1oZWlnaHQnICYmIGl0ZW0uY2xhc3NMaXN0LmNvbnRhaW5zKCdkZXNzZXJ0LW9wZW4nKSkge1xuICAgICAgICAgICAgYm9keS5zdHlsZS5tYXhIZWlnaHQgPSAnbm9uZSc7XG4gICAgICAgICAgICBib2R5LnN0eWxlLm92ZXJmbG93ID0gJ3Zpc2libGUnO1xuICAgICAgICAgICAgYm9keS5yZW1vdmVFdmVudExpc3RlbmVyKCd0cmFuc2l0aW9uZW5kJywgb25UcmFuc2l0aW9uRW5kKTtcbiAgICAgICAgICB9XG4gICAgICAgIH07XG4gICAgICAgIGJvZHkuYWRkRXZlbnRMaXN0ZW5lcigndHJhbnNpdGlvbmVuZCcsIG9uVHJhbnNpdGlvbkVuZCk7XG4gICAgICAgIGhlbHBlcnMuY29udHJvbGxlcj8uZW1pdCgnYWNjb3JkaW9uOm9wZW4nLCB7IGVsOiBpdGVtIH0pO1xuICAgICAgfVxuICAgIH07XG5cbiAgICBoZWFkZXIuYWRkRXZlbnRMaXN0ZW5lcignY2xpY2snLCB0b2dnbGUpO1xuICAgIGhhbmRsZXJzLnB1c2goW2hlYWRlciwgJ2NsaWNrJywgdG9nZ2xlXSk7XG4gIH0pO1xuXG4gIHJlZ2lzdHJ5Lmluc3RhbmNlcy5zZXQoZWwsIHsgdHlwZTogJ2FjY29yZGlvbicsIGhhbmRsZXJzIH0pO1xuICBsb2coJ2FjY29yZGlvbiBpbml0Jyk7XG59XG5cbmV4cG9ydCB7IGFjY29yZGlvbkNvbXBvbmVudCB9O1xuIiwgIi8qKlxuICogQGZpbGUgREVTU0VSVCBDYXJkIENvbXBvbmVudC5cbiAqIFN1cHBvcnRzIGF1dG8taW5pdCBjb2xsYXBzaWJsZSBjYXJkcywgY2FyZCBkaXNtaXNzLCBhbmQgY2FyZCBhY3Rpb25zLlxuICovXG5cbmltcG9ydCB7IGFkZENsYXNzLCByZW1vdmVDbGFzcywgdG9nZ2xlQ2xhc3MgfSBmcm9tICcuLi91dGlscy9jbGFzc05hbWVzLmpzJztcbmltcG9ydCB7IGhlbHBlcnMgfSBmcm9tICcuLi91dGlscy9icmlkZ2UuanMnO1xuXG4vKipcbiAqIEBwYXJhbSB7SFRNTEVsZW1lbnR9IGVsXG4gKiBAcmV0dXJucyB7dm9pZH1cbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGNhcmRDb21wb25lbnQoZWwpIHtcbiAgLy8gQ2hlY2sgaWYgY2FyZCBoYXMgYSB0b2dnbGUgdHJpZ2dlciBidXR0b25cbiAgY29uc3QgdG9nZ2xlQnRuID0gZWwucXVlcnlTZWxlY3RvcignW2RhdGEtZGVzc2VydC1jYXJkLXRvZ2dsZV0nKTtcbiAgY29uc3QgYm9keSA9IGVsLnF1ZXJ5U2VsZWN0b3IoJy5kZXNzZXJ0LWNhcmQtYm9keScpO1xuXG4gIGlmICh0b2dnbGVCdG4gJiYgYm9keSkge1xuICAgIHRvZ2dsZUJ0bi5hZGRFdmVudExpc3RlbmVyKCdjbGljaycsICgpID0+IHtcbiAgICAgIGNvbnN0IGlzQ29sbGFwc2VkID0gZWwuY2xhc3NMaXN0LmNvbnRhaW5zKCdkZXNzZXJ0LWNhcmQtY29sbGFwc2VkJyk7XG4gICAgICBpZiAoaXNDb2xsYXBzZWQpIHtcbiAgICAgICAgcmVtb3ZlQ2xhc3MoZWwsICdjYXJkLWNvbGxhcHNlZCcpO1xuICAgICAgICBib2R5LnN0eWxlLmRpc3BsYXkgPSAnYmxvY2snO1xuICAgICAgICBoZWxwZXJzLmNvbnRyb2xsZXI/LmVtaXQoJ2NhcmQ6ZXhwYW5kJywgeyBlbCB9KTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIGFkZENsYXNzKGVsLCAnY2FyZC1jb2xsYXBzZWQnKTtcbiAgICAgICAgYm9keS5zdHlsZS5kaXNwbGF5ID0gJ25vbmUnO1xuICAgICAgICBoZWxwZXJzLmNvbnRyb2xsZXI/LmVtaXQoJ2NhcmQ6Y29sbGFwc2UnLCB7IGVsIH0pO1xuICAgICAgfVxuICAgIH0pO1xuICB9XG5cbiAgLy8gQ2hlY2sgaWYgY2FyZCBoYXMgYSBjbG9zZS9kaXNtaXNzIHRyaWdnZXJcbiAgY29uc3QgY2xvc2VCdG4gPSBlbC5xdWVyeVNlbGVjdG9yKCdbZGF0YS1kZXNzZXJ0LWNhcmQtY2xvc2VdJyk7XG4gIGlmIChjbG9zZUJ0bikge1xuICAgIGNsb3NlQnRuLmFkZEV2ZW50TGlzdGVuZXIoJ2NsaWNrJywgKCkgPT4ge1xuICAgICAgZWwuc3R5bGUub3BhY2l0eSA9ICcwJztcbiAgICAgIGVsLnN0eWxlLnRyYW5zZm9ybSA9ICdzY2FsZSgwLjk1KSc7XG4gICAgICBzZXRUaW1lb3V0KCgpID0+IHtcbiAgICAgICAgZWwucmVtb3ZlKCk7XG4gICAgICAgIGhlbHBlcnMuY29udHJvbGxlcj8uZW1pdCgnY2FyZDpkaXNtaXNzJywgeyBlbCB9KTtcbiAgICAgIH0sIDIwMCk7XG4gICAgfSk7XG4gIH1cbn1cbiIsICIvKipcbiAqIEBmaWxlIERFU1NFUlQgQmFkZ2UgQ29tcG9uZW50LlxuICogU3VwcG9ydHMgZGlzbWlzc2libGUgYmFkZ2VzIGFuZCBzdGF0dXMgZG90IGJhZGdlcy5cbiAqL1xuXG5pbXBvcnQgeyBoZWxwZXJzIH0gZnJvbSAnLi4vdXRpbHMvYnJpZGdlLmpzJztcblxuLyoqXG4gKiBAcGFyYW0ge0hUTUxFbGVtZW50fSBlbFxuICogQHJldHVybnMge3ZvaWR9XG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBiYWRnZUNvbXBvbmVudChlbCkge1xuICBjb25zdCBkaXNtaXNzQnRuID0gZWwucXVlcnlTZWxlY3RvcignW2RhdGEtZGVzc2VydC1iYWRnZS1kaXNtaXNzXScpO1xuICBpZiAoZGlzbWlzc0J0bikge1xuICAgIGRpc21pc3NCdG4uYWRkRXZlbnRMaXN0ZW5lcignY2xpY2snLCAoZSkgPT4ge1xuICAgICAgZS5zdG9wUHJvcGFnYXRpb24oKTtcbiAgICAgIGVsLnN0eWxlLm9wYWNpdHkgPSAnMCc7XG4gICAgICBzZXRUaW1lb3V0KCgpID0+IHtcbiAgICAgICAgZWwucmVtb3ZlKCk7XG4gICAgICAgIGhlbHBlcnMuY29udHJvbGxlcj8uZW1pdCgnYmFkZ2U6ZGlzbWlzcycsIHsgZWwgfSk7XG4gICAgICB9LCAxNTApO1xuICAgIH0pO1xuICB9XG59XG4iLCAiLyoqXG4gKiBAZmlsZSBDb21wb25lbnQgcmVnaXN0cnkgYmFycmVsLlxuICovXG5cbmltcG9ydCB7IG1vZGFsQ29tcG9uZW50IH0gZnJvbSAnLi9tb2RhbC5qcyc7XG5pbXBvcnQgeyBkcm9wZG93bkNvbXBvbmVudCB9IGZyb20gJy4vZHJvcGRvd24uanMnO1xuaW1wb3J0IHsgdGFic0NvbXBvbmVudCB9IGZyb20gJy4vdGFicy5qcyc7XG5pbXBvcnQgeyBhY2NvcmRpb25Db21wb25lbnQgfSBmcm9tICcuL2FjY29yZGlvbi5qcyc7XG5pbXBvcnQgeyBjYXJkQ29tcG9uZW50IH0gZnJvbSAnLi9jYXJkLmpzJztcbmltcG9ydCB7IGJhZGdlQ29tcG9uZW50IH0gZnJvbSAnLi9iYWRnZS5qcyc7XG5cbi8qKlxuICogQHR5cGVkZWYge09iamVjdH0gQ29tcG9uZW50c1xuICogQHByb3BlcnR5IHsoZWw6IEhUTUxFbGVtZW50KSA9PiB2b2lkfSBtb2RhbFxuICogQHByb3BlcnR5IHsoZWw6IEhUTUxFbGVtZW50KSA9PiB2b2lkfSBkcm9wZG93blxuICogQHByb3BlcnR5IHsoZWw6IEhUTUxFbGVtZW50KSA9PiB2b2lkfSB0YWJzXG4gKiBAcHJvcGVydHkgeyhlbDogSFRNTEVsZW1lbnQpID0+IHZvaWR9IGFjY29yZGlvblxuICogQHByb3BlcnR5IHsoZWw6IEhUTUxFbGVtZW50KSA9PiB2b2lkfSBjYXJkXG4gKiBAcHJvcGVydHkgeyhlbDogSFRNTEVsZW1lbnQpID0+IHZvaWR9IGJhZGdlXG4gKi9cblxuLyoqXG4gKiBAZGVzY3JpcHRpb24gQ29tcG9uZW50IHJlZ2lzdHJ5IG1hcC5cbiAqIEB0eXBlIHtDb21wb25lbnRzfVxuICovXG5jb25zdCBjb21wb25lbnRzID0ge1xuICBtb2RhbDogbW9kYWxDb21wb25lbnQsXG4gIGRyb3Bkb3duOiBkcm9wZG93bkNvbXBvbmVudCxcbiAgdGFiczogdGFic0NvbXBvbmVudCxcbiAgYWNjb3JkaW9uOiBhY2NvcmRpb25Db21wb25lbnQsXG4gIGNhcmQ6IGNhcmRDb21wb25lbnQsXG4gIGJhZGdlOiBiYWRnZUNvbXBvbmVudCxcbn07XG5cbmV4cG9ydCB7IGNvbXBvbmVudHMgfTtcbiIsICIvKipcbiAqIEBmaWxlIFNjYW4gRE9NIGFuZCBpbml0aWFsaXplIGNvbXBvbmVudHMuXG4gKi9cblxuaW1wb3J0IHsgREFUQV9BVFRSIH0gZnJvbSAnLi4vY29yZS9jb25zdGFudHMuanMnO1xuXG4vKipcbiAqIEB0eXBlZGVmIHtPYmplY3R9IENvbXBvbmVudHNNYXBcbiAqIEBwcm9wZXJ0eSB7Kn0gW2tleV1cbiAqL1xuXG4vKipcbiAqIEBkZXNjcmlwdGlvbiBBdXRvLWluaXQgYWxsIGVsZW1lbnRzIHdpdGggZGF0YS1kZXNzZXJ0IGF0dHJpYnV0ZS5cbiAqIEB0aGlzIHt7IGNvbXBvbmVudHM6IENvbXBvbmVudHNNYXAgfX1cbiAqIEBwYXJhbSB7UGFyZW50Tm9kZX0gW3Jvb3Q9ZG9jdW1lbnRdXG4gKiBAcmV0dXJucyB7dm9pZH1cbiAqL1xuZnVuY3Rpb24gYXV0b0luaXQocm9vdCA9IGRvY3VtZW50KSB7XG4gIHJvb3QucXVlcnlTZWxlY3RvckFsbChgWyR7REFUQV9BVFRSfV1gKS5mb3JFYWNoKChub2RlKSA9PiB7XG4gICAgaWYgKG5vZGUuX2Rlc3NlcnRJbml0aWFsaXplZCkgcmV0dXJuO1xuICAgIGNvbnN0IHR5cGUgPSBub2RlLmdldEF0dHJpYnV0ZShEQVRBX0FUVFIpO1xuICAgIGNvbnN0IGZuID0gdGhpcy5jb21wb25lbnRzW3R5cGVdO1xuICAgIGlmICh0eXBlb2YgZm4gPT09ICdmdW5jdGlvbicpIHtcbiAgICAgIGZuLmNhbGwodGhpcywgbm9kZSk7XG4gICAgICBub2RlLl9kZXNzZXJ0SW5pdGlhbGl6ZWQgPSB0cnVlO1xuICAgIH1cbiAgfSk7XG59XG5cbmV4cG9ydCB7IGF1dG9Jbml0IH07XG4iLCAiLyoqXG4gKiBAZmlsZSBHbG9iYWwgRVNDIGtleSBoYW5kbGVyLlxuICovXG5cbmltcG9ydCB7IHN0YXRlIH0gZnJvbSAnLi4vY29yZS9zdGF0ZS5qcyc7XG5cbi8qKlxuICogQHR5cGVkZWYge09iamVjdH0gQ29yZUxpa2VcbiAqIEBwcm9wZXJ0eSB7c3RyaW5nfSBwcmVmaXhcbiAqIEBwcm9wZXJ0eSB7eyBjbG9zZTogKGVsOiBIVE1MRWxlbWVudCkgPT4gdm9pZCB9fSBtb2RhbFxuICovXG5cbi8qKlxuICogQGRlc2NyaXB0aW9uIEJpbmQgZ2xvYmFsIEVTQyBoYW5kbGVyIHRvIGNsb3NlIHZpc2libGUgbW9kYWxzLlxuICogQHBhcmFtIHtDb3JlTGlrZX0gY29yZVxuICogQHJldHVybnMge3ZvaWR9XG4gKi9cbmZ1bmN0aW9uIGJpbmRFc2NhcGVLZXkoY29yZSkge1xuICBpZiAoc3RhdGUuZXNjQm91bmQpIHJldHVybjtcblxuICBkb2N1bWVudC5hZGRFdmVudExpc3RlbmVyKCdrZXlkb3duJywgKGUpID0+IHtcbiAgICBpZiAoZS5rZXkgIT09ICdFc2NhcGUnKSByZXR1cm47XG4gICAgZG9jdW1lbnRcbiAgICAgIC5xdWVyeVNlbGVjdG9yQWxsKGAuJHtjb3JlLnByZWZpeH0tbW9kYWwuJHtjb3JlLnByZWZpeH0tc2hvd2ApXG4gICAgICAuZm9yRWFjaCgobSkgPT4gY29yZS5tb2RhbC5jbG9zZShtKSk7XG4gIH0pO1xuXG4gIHN0YXRlLmVzY0JvdW5kID0gdHJ1ZTtcbn1cblxuZXhwb3J0IHsgYmluZEVzY2FwZUtleSB9O1xuIiwgIi8qKlxuICogQGZpbGUgVVJMIHJlc29sdXRpb24gaGVscGVycy5cbiAqL1xuXG4vKipcbiAqIEBkZXNjcmlwdGlvbiBSZXNvbHZlIGEgcGF0aCByZWxhdGl2ZSB0byBhIGJhc2UuXG4gKiBAcGFyYW0ge3N0cmluZ30gYmFzZVxuICogQHBhcmFtIHtzdHJpbmd9IHBhdGhcbiAqIEByZXR1cm5zIHtzdHJpbmd9XG4gKi9cbmZ1bmN0aW9uIHJlc29sdmVVUkwoYmFzZSwgcGF0aCkge1xuICB0cnkgeyByZXR1cm4gbmV3IFVSTChwYXRoLCBiYXNlKS5ocmVmOyB9XG4gIGNhdGNoIHsgcmV0dXJuIHBhdGg7IH1cbn1cblxuLyoqXG4gKiBAZGVzY3JpcHRpb24gRGVyaXZlIGJhc2UgVVJMIGZyb20gYSBzY3JpcHQgZWxlbWVudCAoYXNzdW1lcyAvc3JjLyBsYXlvdXQpLlxuICogQHBhcmFtIHtIVE1MU2NyaXB0RWxlbWVudH0gc2NyaXB0RWxcbiAqIEByZXR1cm5zIHs/c3RyaW5nfVxuICovXG5mdW5jdGlvbiBnZXRTY3JpcHRCYXNlKHNjcmlwdEVsKSB7XG4gIGlmICghc2NyaXB0RWw/LnNyYykgcmV0dXJuIG51bGw7XG4gIGNvbnN0IG0gPSBzY3JpcHRFbC5zcmMubWF0Y2goL14oLio/KVxcL3NyY1xcL1teL10rJC8pO1xuICByZXR1cm4gbSA/IG1bMV0gOiBzY3JpcHRFbC5zcmMucmVwbGFjZSgvXFwvW14vXSskLywgJycpO1xufVxuXG4vKipcbiAqIEBkZXNjcmlwdGlvbiBHZXQgdGhlIGN1cnJlbnRseSBleGVjdXRpbmcgc2NyaXB0IGVsZW1lbnQuXG4gKiBAcmV0dXJucyB7SFRNTFNjcmlwdEVsZW1lbnR8dW5kZWZpbmVkfVxuICovXG5mdW5jdGlvbiBjdXJyZW50U2NyaXB0KCkge1xuICByZXR1cm4gZG9jdW1lbnQuY3VycmVudFNjcmlwdFxuICAgIHx8ICgoKSA9PiB7XG4gICAgICBjb25zdCBzID0gZG9jdW1lbnQuZ2V0RWxlbWVudHNCeVRhZ05hbWUoJ3NjcmlwdCcpO1xuICAgICAgcmV0dXJuIHNbcy5sZW5ndGggLSAxXTtcbiAgICB9KSgpO1xufVxuXG5leHBvcnQgeyByZXNvbHZlVVJMLCBnZXRTY3JpcHRCYXNlLCBjdXJyZW50U2NyaXB0IH07XG4iLCAiLyoqXG4gKiBAZmlsZSBBdXRvLWluamVjdCBkZXNzZXJ0LmNzcy5cbiAqL1xuXG5pbXBvcnQgeyBjdXJyZW50U2NyaXB0LCBnZXRTY3JpcHRCYXNlIH0gZnJvbSAnLi4vdXRpbHMvdXJsLmpzJztcbmltcG9ydCB7IGxvZyB9IGZyb20gJy4uL3V0aWxzL2xvZ2dlci5qcyc7XG5cbi8qKlxuICogQGRlc2NyaXB0aW9uIEluamVjdCBkZXNzZXJ0LmNzcyBpZiBub3QgYWxyZWFkeSBwcmVzZW50LlxuICogQHJldHVybnMge3ZvaWR9XG4gKi9cbmZ1bmN0aW9uIGluamVjdENTUygpIHtcbiAgaWYgKGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoJ2xpbmtbZGF0YS1kZXNzZXJ0LWNzc10nKSkgcmV0dXJuO1xuXG4gIGNvbnN0IGJhc2UgPSBnZXRTY3JpcHRCYXNlKGN1cnJlbnRTY3JpcHQoKSk7XG4gIGNvbnN0IGhyZWYgPSBiYXNlXG4gICAgPyBgJHtiYXNlfS9zcmMvc3R5bGVzL2Rlc3NlcnQuY3NzYFxuICAgIDogJ2Rpc3QvZGVzc2VydC5jc3MnO1xuXG4gIGNvbnN0IGxpbmsgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdsaW5rJyk7XG4gIGxpbmsucmVsID0gJ3N0eWxlc2hlZXQnO1xuICBsaW5rLmhyZWYgPSBocmVmO1xuICBsaW5rLnNldEF0dHJpYnV0ZSgnZGF0YS1kZXNzZXJ0LWNzcycsICcnKTtcbiAgbGluay5vbmVycm9yID0gKCkgPT4gbG9nKCdDU1MgbG9hZCBmYWlsZWQ6JywgaHJlZik7XG4gIGRvY3VtZW50LmhlYWQuYXBwZW5kQ2hpbGQobGluayk7XG59XG5cbmV4cG9ydCB7IGluamVjdENTUyB9O1xuIiwgIi8qKlxuICogQGZpbGUgQXV0by1pbmplY3QgbG9hZGVyIHBsdWdpbi5cbiAqL1xuXG5pbXBvcnQgeyByZWdpc3RyeSB9IGZyb20gJy4uL2NvcmUvcmVnaXN0cnkuanMnO1xuaW1wb3J0IHsgY3VycmVudFNjcmlwdCwgZ2V0U2NyaXB0QmFzZSB9IGZyb20gJy4uL3V0aWxzL3VybC5qcyc7XG5pbXBvcnQgeyBsb2cgfSBmcm9tICcuLi91dGlscy9sb2dnZXIuanMnO1xuXG4vKipcbiAqIEBkZXNjcmlwdGlvbiBJbmplY3QgbG9hZGVyIHBsdWdpbiBpZiBub3QgcmVnaXN0ZXJlZC5cbiAqIEByZXR1cm5zIHt2b2lkfVxuICovXG5mdW5jdGlvbiBpbmplY3RMb2FkZXIoKSB7XG4gIGlmIChyZWdpc3RyeS5wbHVnaW5zLmhhcygnbG9hZGVyJykpIHJldHVybjtcbiAgaWYgKGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoJ3NjcmlwdFtkYXRhLWRlc3NlcnQtbG9hZGVyXScpKSByZXR1cm47XG5cbiAgY29uc3QgYmFzZSA9IGdldFNjcmlwdEJhc2UoY3VycmVudFNjcmlwdCgpKTtcbiAgY29uc3Qgc3JjID0gYmFzZVxuICAgID8gYCR7YmFzZX0vc3JjL3BsdWdpbnMvbG9hZGVyL0xvYWRlclBsdWdpbi5qc2BcbiAgICA6ICdsb2FkZXIudW1kLmpzJztcblxuICBjb25zdCBzID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnc2NyaXB0Jyk7XG4gIHMudHlwZSA9IGJhc2UgPyAnbW9kdWxlJyA6ICd0ZXh0L2phdmFzY3JpcHQnO1xuICBzLnNyYyA9IHNyYztcbiAgcy5hc3luYyA9IGZhbHNlO1xuICBzLnNldEF0dHJpYnV0ZSgnZGF0YS1kZXNzZXJ0LWxvYWRlcicsICcnKTtcbiAgcy5vbmVycm9yID0gKCkgPT4gbG9nKCdsb2FkZXIgaW5qZWN0IGZhaWxlZDonLCBzcmMpO1xuICBkb2N1bWVudC5oZWFkLmFwcGVuZENoaWxkKHMpO1xufVxuXG5leHBvcnQgeyBpbmplY3RMb2FkZXIgfTtcbiIsICIvKipcbiAqIEBmaWxlIE1vZGFsIG9wZW4vY2xvc2UgY29udHJvbGxlci5cbiAqL1xuXG5pbXBvcnQgeyBhZGRDbGFzcywgcmVtb3ZlQ2xhc3MgfSBmcm9tICcuLi91dGlscy9jbGFzc05hbWVzLmpzJztcbmltcG9ydCB7IHN0YXRlIH0gZnJvbSAnLi4vY29yZS9zdGF0ZS5qcyc7XG5pbXBvcnQgeyBoZWxwZXJzIH0gZnJvbSAnLi4vdXRpbHMvYnJpZGdlLmpzJztcbmltcG9ydCB7IGxvZyB9IGZyb20gJy4uL3V0aWxzL2xvZ2dlci5qcyc7XG5cbi8qKlxuICogQHR5cGVkZWYge09iamVjdH0gTW9kYWxBUElcbiAqIEBwcm9wZXJ0eSB7KGVsOiBIVE1MRWxlbWVudCkgPT4gdm9pZH0gb3BlblxuICogQHByb3BlcnR5IHsoZWw6IEhUTUxFbGVtZW50KSA9PiB2b2lkfSBjbG9zZVxuICovXG5cbi8qKlxuICogQGRlc2NyaXB0aW9uIE1vZGFsIGNvbnRyb2xsZXIuXG4gKiBAdHlwZSB7TW9kYWxBUEl9XG4gKi9cbmNvbnN0IG1vZGFsQVBJID0ge1xuICAvKipcbiAgICogQGRlc2NyaXB0aW9uIE9wZW4gYSBtb2RhbCBlbGVtZW50LlxuICAgKiBAcGFyYW0ge0hUTUxFbGVtZW50fSBlbFxuICAgKiBAcmV0dXJucyB7dm9pZH1cbiAgICovXG4gIG9wZW4oZWwpIHtcbiAgICBzdGF0ZS5sYXN0Rm9jdXNlZCA9IGRvY3VtZW50LmFjdGl2ZUVsZW1lbnQ7XG5cbiAgICBlbC5zdHlsZS5kaXNwbGF5ID0gJ2ZsZXgnO1xuICAgIGRvY3VtZW50LmJvZHkuc3R5bGUub3ZlcmZsb3cgPSAnaGlkZGVuJztcbiAgICByZXF1ZXN0QW5pbWF0aW9uRnJhbWUoKCkgPT4gYWRkQ2xhc3MoZWwsICdzaG93JykpO1xuXG4gICAgc2V0VGltZW91dCgoKSA9PiB7XG4gICAgICBjb25zdCBmID0gZWwucXVlcnlTZWxlY3RvcihcbiAgICAgICAgJ2J1dHRvbiwgW2hyZWZdLCBpbnB1dCwgc2VsZWN0LCB0ZXh0YXJlYSwgW3RhYmluZGV4XTpub3QoW3RhYmluZGV4PVwiLTFcIl0pJ1xuICAgICAgKTtcbiAgICAgIC8qKiBAdHlwZSB7SFRNTEVsZW1lbnR8bnVsbH0gKi8oZik/LmZvY3VzKCk7XG4gICAgfSwgMTAwKTtcblxuICAgIGhlbHBlcnMuY29udHJvbGxlcj8uZW1pdCgnbW9kYWw6b3BlbicsIHsgZWwsIGlkOiBlbC5pZCB9KTtcbiAgICBsb2coJ21vZGFsIG9wZW46JywgZWwuaWQpO1xuICB9LFxuXG4gIC8qKlxuICAgKiBAZGVzY3JpcHRpb24gQ2xvc2UgYSBtb2RhbCBlbGVtZW50LlxuICAgKiBAcGFyYW0ge0hUTUxFbGVtZW50fSBlbFxuICAgKiBAcmV0dXJucyB7dm9pZH1cbiAgICovXG4gIGNsb3NlKGVsKSB7XG4gICAgcmVtb3ZlQ2xhc3MoZWwsICdzaG93Jyk7XG5cbiAgICBzZXRUaW1lb3V0KCgpID0+IHtcbiAgICAgIGVsLnN0eWxlLmRpc3BsYXkgPSAnbm9uZSc7XG4gICAgICBkb2N1bWVudC5ib2R5LnN0eWxlLm92ZXJmbG93ID0gJyc7XG4gICAgICBzdGF0ZS5sYXN0Rm9jdXNlZD8uZm9jdXMoKTtcbiAgICB9LCAzMDApO1xuXG4gICAgaGVscGVycy5jb250cm9sbGVyPy5lbWl0KCdtb2RhbDpjbG9zZScsIHsgZWwsIGlkOiBlbC5pZCB9KTtcbiAgICBsb2coJ21vZGFsIGNsb3NlOicsIGVsLmlkKTtcbiAgfSxcbn07XG5cbmV4cG9ydCB7IG1vZGFsQVBJIH07XG4iLCAiLyoqXG4gKiBAZmlsZSBTdGFja2VkIGFsZXJ0L3RvYXN0IEFQSS5cbiAqL1xuXG5pbXBvcnQgeyBhZGRDbGFzcywgcmVtb3ZlQ2xhc3MgfSBmcm9tICcuLi91dGlscy9jbGFzc05hbWVzLmpzJztcbmltcG9ydCB7IGhlbHBlcnMgfSBmcm9tICcuLi91dGlscy9icmlkZ2UuanMnO1xuXG4vKipcbiAqIEB0eXBlZGVmIHsnaW5mbyd8J3N1Y2Nlc3MnfCd3YXJuaW5nJ3wnZGFuZ2VyJ30gQWxlcnRUeXBlXG4gKi9cblxuLyoqXG4gKiBAZGVzY3JpcHRpb24gU2hvdyBhIHN0YWNrZWQgYWxlcnQuXG4gKiBAcGFyYW0ge3N0cmluZ30gbXNnXG4gKiBAcGFyYW0ge0FsZXJ0VHlwZX0gW3R5cGU9J2luZm8nXVxuICogQHBhcmFtIHtudW1iZXJ9IFtkdXJhdGlvbj0zMDAwXVxuICogQHJldHVybnMge3ZvaWR9XG4gKi9cbmZ1bmN0aW9uIGFsZXJ0QVBJKG1zZywgdHlwZSA9ICdpbmZvJywgZHVyYXRpb24gPSAzMDAwKSB7XG4gIGhlbHBlcnMuY29udHJvbGxlcj8uZW1pdCgnYWxlcnQ6c2hvdycsIHsgbWVzc2FnZTogbXNnLCB0eXBlLCBkdXJhdGlvbiB9KTtcblxuICBsZXQgY29udGFpbmVyID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcignLmRlc3NlcnQtYWxlcnQtY29udGFpbmVyJyk7XG4gIGlmICghY29udGFpbmVyKSB7XG4gICAgY29udGFpbmVyID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnZGl2Jyk7XG4gICAgY29udGFpbmVyLmNsYXNzTmFtZSA9ICdkZXNzZXJ0LWFsZXJ0LWNvbnRhaW5lcic7XG4gICAgZG9jdW1lbnQuYm9keS5hcHBlbmRDaGlsZChjb250YWluZXIpO1xuICB9XG5cbiAgY29uc3QgYm94ID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnZGl2Jyk7XG4gIGJveC5jbGFzc05hbWUgPSBgZGVzc2VydC1hbGVydCBkZXNzZXJ0LWFsZXJ0LSR7dHlwZX1gO1xuICBib3gudGV4dENvbnRlbnQgPSBtc2c7XG4gIGNvbnRhaW5lci5hcHBlbmRDaGlsZChib3gpO1xuXG4gIHJlcXVlc3RBbmltYXRpb25GcmFtZSgoKSA9PiBhZGRDbGFzcyhib3gsICdzaG93JykpO1xuXG4gIHNldFRpbWVvdXQoKCkgPT4ge1xuICAgIHJlbW92ZUNsYXNzKGJveCwgJ3Nob3cnKTtcbiAgICBzZXRUaW1lb3V0KCgpID0+IHtcbiAgICAgIGJveC5yZW1vdmUoKTtcbiAgICAgIGlmICghY29udGFpbmVyLmNoaWxkcmVuLmxlbmd0aCkgY29udGFpbmVyLnJlbW92ZSgpO1xuICAgIH0sIDMwMCk7XG4gIH0sIGR1cmF0aW9uKTtcbn1cblxuZXhwb3J0IHsgYWxlcnRBUEkgfTtcbiIsICIvKipcbiAqIEBmaWxlIENvbXBvbmVudCB0ZWFyZG93biBBUEkuXG4gKi9cblxuaW1wb3J0IHsgcmVnaXN0cnkgfSBmcm9tICcuLi9jb3JlL3JlZ2lzdHJ5LmpzJztcbmltcG9ydCB7IGxvZyB9IGZyb20gJy4uL3V0aWxzL2xvZ2dlci5qcyc7XG5cbi8qKlxuICogQGRlc2NyaXB0aW9uIERlc3Ryb3kgYW4gaW5pdGlhbGl6ZWQgZWxlbWVudCBhbmQgcmVtb3ZlIGxpc3RlbmVycy5cbiAqIEBwYXJhbSB7SFRNTEVsZW1lbnR9IGVsXG4gKiBAcmV0dXJucyB7dm9pZH1cbiAqL1xuZnVuY3Rpb24gZGVzdHJveUFQSShlbCkge1xuICBjb25zdCBpbnN0ID0gcmVnaXN0cnkuaW5zdGFuY2VzLmdldChlbCk7XG4gIGlmICghaW5zdCkgcmV0dXJuO1xuXG4gIGluc3QuaGFuZGxlcnMuZm9yRWFjaCgoW3RhcmdldCwgdHlwZSwgaGFuZGxlcl0pID0+IHtcbiAgICB0YXJnZXQucmVtb3ZlRXZlbnRMaXN0ZW5lcih0eXBlLCBoYW5kbGVyKTtcbiAgfSk7XG5cbiAgZWwuX2Rlc3NlcnRJbml0aWFsaXplZCA9IGZhbHNlO1xuICByZWdpc3RyeS5pbnN0YW5jZXMuZGVsZXRlKGVsKTtcbiAgbG9nKCdkZXN0cm95ZWQ6JywgaW5zdC50eXBlKTtcbn1cblxuZXhwb3J0IHsgZGVzdHJveUFQSSB9O1xuIiwgIi8qKlxuICogQGZpbGUgUHJlZml4ZWQgZGF0YSBhdHRyaWJ1dGUgaGVscGVycy5cbiAqL1xuXG5pbXBvcnQgeyBQUkVGSVggfSBmcm9tICcuLi9jb3JlL2NvbnN0YW50cy5qcyc7XG5cbi8qKlxuICogQGRlc2NyaXB0aW9uIFNldCBhIHByZWZpeGVkIGRhdGEgYXR0cmlidXRlLlxuICogQHBhcmFtIHtIVE1MRWxlbWVudH0gZWxcbiAqIEBwYXJhbSB7c3RyaW5nfSBrZXlcbiAqIEBwYXJhbSB7c3RyaW5nfSB2YWx1ZVxuICogQHJldHVybnMge0hUTUxFbGVtZW50fVxuICovXG5mdW5jdGlvbiBzZXREYXRhKGVsLCBrZXksIHZhbHVlKSB7XG4gIGVsLnNldEF0dHJpYnV0ZShgZGF0YS0ke1BSRUZJWH0tJHtrZXl9YCwgdmFsdWUpO1xuICByZXR1cm4gZWw7XG59XG5cbi8qKlxuICogQGRlc2NyaXB0aW9uIEdldCBhIHByZWZpeGVkIGRhdGEgYXR0cmlidXRlLlxuICogQHBhcmFtIHtIVE1MRWxlbWVudH0gZWxcbiAqIEBwYXJhbSB7c3RyaW5nfSBrZXlcbiAqIEByZXR1cm5zIHs/c3RyaW5nfVxuICovXG5mdW5jdGlvbiBnZXREYXRhKGVsLCBrZXkpIHtcbiAgcmV0dXJuIGVsLmdldEF0dHJpYnV0ZShgZGF0YS0ke1BSRUZJWH0tJHtrZXl9YCk7XG59XG5cbmV4cG9ydCB7IHNldERhdGEsIGdldERhdGEgfTtcbiJdLAogICJtYXBwaW5ncyI6ICI7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OztBQUFBO0FBQUE7QUFBQTtBQUFB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RXpCLDBCQUFzQixNQUFNLFNBQVMsS0FBSyxNQUFNLENBQUM7QUFFakQsZUFBVyxNQUFNO0FBQ2Ysa0JBQVksS0FBSyxNQUFNO0FBQ3ZCLGlCQUFXLE1BQU07QUFDZixZQUFJLE9BQU87QUFDWCxZQUFJLENBQUMsVUFBVSxTQUFTLE9BQVEsV0FBVSxPQUFPO0FBQUEsTUFDbkQsR0FBRyxHQUFHO0FBQUEsSUFDUixHQUFHLFFBQVE7QUFBQSxFQUNiOzs7QUM5QkEsV0FBUyxXQUFXLElBQUk7QUFDdEIsVUFBTSxPQUFPLFNBQVMsVUFBVSxJQUFJLEVBQUU7QUFDdEMsUUFBSSxDQUFDLEtBQU07QUFFWCxTQUFLLFNBQVMsUUFBUSxDQUFDLENBQUMsUUFBUSxNQUFNLE9BQU8sTUFBTTtBQUNqRCxhQUFPLG9CQUFvQixNQUFNLE9BQU87QUFBQSxJQUMxQyxDQUFDO0FBRUQsT0FBRyxzQkFBc0I7QUFDekIsYUFBUyxVQUFVLE9BQU8sRUFBRTtBQUM1QixRQUFJLGNBQWMsS0FBSyxJQUFJO0FBQUEsRUFDN0I7OztBQ1ZBLFdBQVMsUUFBUSxJQUFJLEtBQUssT0FBTztBQUMvQixPQUFHLGFBQWEsUUFBUSxNQUFNLElBQUksR0FBRyxJQUFJLEtBQUs7QUFDOUMsV0FBTztBQUFBLEVBQ1Q7QUFRQSxXQUFTLFFBQVEsSUFBSSxLQUFLO0FBQ3hCLFdBQU8sR0FBRyxhQUFhLFFBQVEsTUFBTSxJQUFJLEdBQUcsRUFBRTtBQUFBLEVBQ2hEOzs7QXpCUkEsVUFBUSxVQUFVLGFBQWM7QUFDaEMsVUFBUSxVQUFVLFFBQWM7QUFDaEMsVUFBUSxVQUFVLFFBQWM7QUFDaEMsVUFBUSxVQUFVLFVBQWM7QUFDaEMsVUFBUSxVQUFVLFdBQWM7QUFDaEMsVUFBUSxVQUFVLFdBQWM7QUFDaEMsVUFBUSxVQUFVLGNBQWM7QUFDaEMsVUFBUSxVQUFVLGNBQWM7QUFDaEMsVUFBUSxVQUFVLFVBQWM7QUFDaEMsVUFBUSxVQUFVLFVBQWM7QUFNaEMsTUFBTSxtQkFBbUIsSUFBSSxRQUFRO0FBR3JDLE1BQUksT0FBTyxhQUFhLGFBQWE7QUFDbkMsY0FBVTtBQUNWLGlCQUFhO0FBRWIsVUFBTSxPQUFPLE1BQU07QUFDakIsdUJBQWlCLEtBQUs7QUFDdEIsb0JBQWMsZ0JBQWdCO0FBQUEsSUFDaEM7QUFFQSxRQUFJLFNBQVMsZUFBZSxXQUFXO0FBQ3JDLGVBQVMsaUJBQWlCLG9CQUFvQixJQUFJO0FBQUEsSUFDcEQsT0FBTztBQUNMLFdBQUs7QUFBQSxJQUNQO0FBQUEsRUFDRjsiLAogICJuYW1lcyI6IFtdCn0K

  return typeof DESSERT !== 'undefined' ? DESSERT : (typeof exports !== 'undefined' ? exports : {});
}));