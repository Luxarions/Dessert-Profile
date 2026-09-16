/**
 * @file Core DESSERT class.
 */

import { VERSION, PREFIX, DEFAULT_OPTIONS } from './constants.js';
import { state, options } from './state.js';
import { registry } from './registry.js';
import { helpers } from '../utils/bridge.js';
import { log } from '../utils/logger.js';
import { DessertController } from './controller.js';

/**
 * @typedef {Object} DessertConfig
 * @property {boolean} [autoInit]
 * @property {boolean} [debug]
 * @property {boolean} [closeOnEscape]
 * @property {boolean} [force]
 */

/**
 * @description Core DESSERT class.
 */
class DESSERT {
  /**
   * @private
   * @type {DESSERT|null}
   */
  static #instance = null;

  /**
   * @description Library version.
   * @returns {string}
   */
  static get version() { return VERSION; }

  /**
   * @description Create a fresh instance bypassing singleton.
   * @param {DessertConfig} [cfg={}]
   * @returns {DESSERT}
   */
  static create(cfg = {}) {
    return new DESSERT({ ...cfg, force: true });
  }

  /**
   * @param {DessertConfig} [cfg={}]
   */
  constructor(cfg = {}) {
    if (DESSERT.#instance && !cfg.force) return DESSERT.#instance;

    Object.assign(options, DEFAULT_OPTIONS, cfg);

    /**
     * @description Library version.
     * @type {string}
     */
    this.version = VERSION;

    /**
     * @description CSS prefix.
     * @type {string}
     */
    this.prefix = PREFIX;

    helpers.bind({ core: this, options, state, registry });

    /**
     * @description Centralized controller and event bus.
     * @type {DessertController}
     */
    this.controller = new DessertController({ core: this });

    DESSERT.#instance = this;
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

    this.controller.emit('init', { version: VERSION, options });

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
    log('plugin registered:', name);
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
}

export { DESSERT };
