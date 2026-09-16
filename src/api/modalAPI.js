/**
 * @file Modal open/close controller.
 */

import { addClass, removeClass } from '../utils/classNames.js';
import { state } from '../core/state.js';
import { log } from '../utils/logger.js';

/**
 * @typedef {Object} ModalAPI
 * @property {(el: HTMLElement) => void} open
 * @property {(el: HTMLElement) => void} close
 */

/**
 * @description Modal controller.
 * @type {ModalAPI}
 */
const modalAPI = {
  /**
   * @description Open a modal element.
   * @param {HTMLElement} el
   * @returns {void}
   */
  open(el) {
    state.lastFocused = document.activeElement;

    el.style.display = 'flex';
    document.body.style.overflow = 'hidden';
    requestAnimationFrame(() => addClass(el, 'show'));

    setTimeout(() => {
      const f = el.querySelector(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
      );
      /** @type {HTMLElement|null} */(f)?.focus();
    }, 100);

    log('modal open:', el.id);
  },

  /**
   * @description Close a modal element.
   * @param {HTMLElement} el
   * @returns {void}
   */
  close(el) {
    removeClass(el, 'show');

    setTimeout(() => {
      el.style.display = 'none';
      document.body.style.overflow = '';
      state.lastFocused?.focus();
    }, 300);

    log('modal close:', el.id);
  },
};

export { modalAPI };
