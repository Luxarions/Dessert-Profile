/**
 * @file Modal component.
 */

import { esc } from '../utils/escape.js';
import { registry } from '../core/registry.js';
import { log } from '../utils/logger.js';

/**
 * @typedef {Object} ModalCore
 * @property {{ open: (el: HTMLElement) => void, close: (el: HTMLElement) => void }} modal
 */

/**
 * @description Initialize modal element.
 * @this {ModalCore}
 * @param {HTMLElement} el
 * @returns {void}
 */
function modalComponent(el) {
  const core = this;
  const openBtns = document.querySelectorAll(
    `[data-dessert-open="${esc(el.id)}"]`
  );
  const closeBtns = el.querySelectorAll('[data-dessert-close]');
  /** @type {Array<[EventTarget, string, EventListener]>} */
  const handlers = [];

  openBtns.forEach((btn) => {
    const h = () => core.modal.open(el);
    btn.addEventListener('click', h);
    handlers.push([btn, 'click', h]);
  });

  closeBtns.forEach((btn) => {
    const h = () => core.modal.close(el);
    btn.addEventListener('click', h);
    handlers.push([btn, 'click', h]);
  });

  const overlayH = (e) => { if (e.target === el) core.modal.close(el); };
  el.addEventListener('click', overlayH);
  handlers.push([el, 'click', overlayH]);

  registry.instances.set(el, { type: 'modal', handlers });
  log('modal init:', el.id);
}

export { modalComponent };
