/**
 * @file Scan DOM and initialize components.
 */

import { DATA_ATTR } from '../core/constants.js';

/**
 * @typedef {Object} ComponentsMap
 * @property {*} [key]
 */

/**
 * @description Auto-init all elements with data-dessert attribute.
 * @this {{ components: ComponentsMap }}
 * @param {ParentNode} [root=document]
 * @returns {void}
 */
function autoInit(root = document) {
  root.querySelectorAll(`[${DATA_ATTR}]`).forEach((node) => {
    if (node._dessertInitialized) return;
    const type = node.getAttribute(DATA_ATTR);
    const fn = this.components[type];
    if (typeof fn === 'function') {
      fn.call(this, node);
      node._dessertInitialized = true;
    }
  });
}

export { autoInit };
