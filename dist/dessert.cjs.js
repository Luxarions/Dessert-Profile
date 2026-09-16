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
//# sourceMappingURL=dessert.cjs.js.map
