/**
 * @file Debug logger.
 */

import { helpers } from './bridge.js';

/**
 * @description Log a message when debug mode is enabled.
 * @param {...*} args
 * @returns {void}
 */
function log(...args) {
  if (helpers.options?.debug) console.log('[DESSERT]', ...args);
}

export { log };
