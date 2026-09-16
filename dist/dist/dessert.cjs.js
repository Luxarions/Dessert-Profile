/*! DESSERT v2.0.0 | MIT License */
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
module.exports = __toCommonJS(index_exports);

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
//# sourceMappingURL=dessert.cjs.js.map
