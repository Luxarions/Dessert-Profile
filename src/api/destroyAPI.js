/**
 * @file Component teardown API.
 */

import { registry } from '../core/registry.js';
import { log } from '../utils/logger.js';

/**
 * @description Destroy an initialized element and remove listeners.
 * @param {HTMLElement} el
 * @returns {void}
 */
function destroyAPI(el) {
  const inst = registry.instances.get(el);
  if (!inst) return;

  inst.handlers.forEach(([target, type, handler]) => {
    target.removeEventListener(type, handler);
  });

  el._dessertInitialized = false;
  registry.instances.delete(el);
  log('destroyed:', inst.type);
}

export { destroyAPI };
