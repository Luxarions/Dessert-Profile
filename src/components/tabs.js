/**
 * @file Tabs component.
 */

import { addClass, removeClass } from '../utils/classNames.js';
import { esc } from '../utils/escape.js';
import { registry } from '../core/registry.js';
import { log } from '../utils/logger.js';

/**
 * @description Initialize tabs element.
 * @param {HTMLElement} el
 * @returns {void}
 */
function tabsComponent(el) {
  const buttons = el.querySelectorAll('[data-dessert-tab]');
  const panels = el.querySelectorAll('[data-dessert-panel]');
  if (!buttons.length) return;

  /** @type {Array<[EventTarget, string, EventListener]>} */
  const handlers = [];

  /**
   * @description Activate a tab and its panel.
   * @param {string} target
   * @returns {void}
   */
  const activate = (target) => {
    buttons.forEach((b) => removeClass(b, 'active'));
    panels.forEach((p) => removeClass(p, 'active'));

    const btn = el.querySelector(`[data-dessert-tab="${esc(target)}"]`);
    const panel = el.querySelector(`[data-dessert-panel="${esc(target)}"]`);
    if (btn) addClass(btn, 'active');
    if (panel) addClass(panel, 'active');
  };

  buttons.forEach((btn) => {
    const h = () => activate(btn.getAttribute('data-dessert-tab'));
    btn.addEventListener('click', h);
    handlers.push([btn, 'click', h]);
  });

  const initial = el.querySelector('.dessert-tab.dessert-active');
  if (initial) activate(initial.getAttribute('data-dessert-tab'));

  registry.instances.set(el, { type: 'tabs', handlers });
  log('tabs init');
}

export { tabsComponent };
