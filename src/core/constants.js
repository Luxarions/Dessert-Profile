/**
 * @file Constants for DESSERT core.
 */

/**
 * @description Library version.
 * @type {string}
 * @constant
 */
const VERSION = '2.0.0';

/**
 * @description CSS prefix used across the library.
 * @type {string}
 * @constant
 */
const PREFIX = 'dessert';

/**
 * @description Data attribute used for auto-init.
 * @type {string}
 * @constant
 */
const DATA_ATTR = 'data-dessert';

/**
 * @typedef {Object} DessertOptions
 * @property {boolean} [autoInit=true]
 * @property {boolean} [debug=false]
 * @property {boolean} [closeOnEscape=true]
 */

/**
 * @description Default options for DESSERT.
 * @type {Readonly<DessertOptions>}
 * @constant
 */
const DEFAULT_OPTIONS = Object.freeze({
  autoInit: true,
  debug: false,
  closeOnEscape: true,
});

export { VERSION, PREFIX, DATA_ATTR, DEFAULT_OPTIONS };
