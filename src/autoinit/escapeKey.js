/**
 * @file Global ESC key handler.
 */

import { state } from '../core/state.js';

/**
 * @typedef {Object} CoreLike
 * @property {string} prefix
 * @property {{ close: (el: HTMLElement) => void }} modal
 */

/**
 * @description Bind global ESC handler to close visible modals.
 * @param {CoreLike} core
 * @returns {void}
 */
function bindEscapeKey(core) {
  if (state.escBound) return;

  document.addEventListener('keydown', (e) => {
    if (e.key !== 'Escape') return;
    document
      .querySelectorAll(`.${core.prefix}-modal.${core.prefix}-show`)
      .forEach((m) => core.modal.close(m));
  });

  state.escBound = true;
}

export { bindEscapeKey };
