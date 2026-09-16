/**
 * @file Prefixed class helpers.
 */

import { PREFIX } from '../core/constants.js';

/**
 * @description Add a prefixed class.
 * @param {HTMLElement} el
 * @param {string} name
 * @returns {HTMLElement}
 */
function addClass(el, name) {
  el.classList.add(`${PREFIX}-${name}`);
  return el;
}

/**
 * @description Remove a prefixed class.
 * @param {HTMLElement} el
 * @param {string} name
 * @returns {HTMLElement}
 */
function removeClass(el, name) {
  el.classList.remove(`${PREFIX}-${name}`);
  return el;
}

/**
 * @description Toggle a prefixed class.
 * @param {HTMLElement} el
 * @param {string} name
 * @param {boolean} [force]
 * @returns {HTMLElement}
 */
function toggleClass(el, name, force) {
  const cls = `${PREFIX}-${name}`;
  typeof force === 'boolean'
    ? el.classList.toggle(cls, force)
    : el.classList.toggle(cls);
  return el;
}

export { addClass, removeClass, toggleClass };
