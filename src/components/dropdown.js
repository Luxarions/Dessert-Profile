/**
 * @file Dropdown component.
 */

import { removeClass, toggleClass } from '../utils/classNames.js';
import { registry } from '../core/registry.js';
import { log } from '../utils/logger.js';

/**
 * @description Initialize dropdown element.
 * @param {HTMLElement} el
 * @returns {void}
 */
function dropdownComponent(el) {
  const trigger = el.querySelector('[data-dessert-trigger]');
  const menu = el.querySelector('[data-dessert-menu]');
  if (!trigger || !menu) return;

  /** @type {Array<[EventTarget, string, EventListener]>} */
  const handlers = [];

  const onTrigger = (e) => {
    e.stopPropagation();
    toggleClass(el, 'open');
    toggleClass(menu, 'show');
  };
  trigger.addEventListener('click', onTrigger);
  handlers.push([trigger, 'click', onTrigger]);

  const onOutside = (e) => {
    if (!el.contains(/** @type {Node} */(e.target))) {
      removeClass(el, 'open');
      removeClass(menu, 'show');
    }
  };
  document.addEventListener('click', onOutside);
  handlers.push([document, 'click', onOutside]);

  registry.instances.set(el, { type: 'dropdown', handlers });
  log('dropdown init');
}

export { dropdownComponent };
