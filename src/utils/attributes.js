/**
 * @file Prefixed data attribute helpers.
 */

import { PREFIX } from '../core/constants.js';

/**
 * @description Set a prefixed data attribute.
 * @param {HTMLElement} el
 * @param {string} key
 * @param {string} value
 * @returns {HTMLElement}
 */
function setData(el, key, value) {
  el.setAttribute(`data-${PREFIX}-${key}`, value);
  return el;
}

/**
 * @description Get a prefixed data attribute.
 * @param {HTMLElement} el
 * @param {string} key
 * @returns {?string}
 */
function getData(el, key) {
  return el.getAttribute(`data-${PREFIX}-${key}`);
}

export { setData, getData };
