/**
 * @file DESSERT Card Component.
 * Supports auto-init collapsible cards, card dismiss, and card actions.
 */

import { addClass, removeClass, toggleClass } from '../utils/classNames.js';
import { helpers } from '../utils/bridge.js';

/**
 * @param {HTMLElement} el
 * @returns {void}
 */
export function cardComponent(el) {
  // Check if card has a toggle trigger button
  const toggleBtn = el.querySelector('[data-dessert-card-toggle]');
  const body = el.querySelector('.dessert-card-body');

  if (toggleBtn && body) {
    toggleBtn.addEventListener('click', () => {
      const isCollapsed = el.classList.contains('dessert-card-collapsed');
      if (isCollapsed) {
        removeClass(el, 'card-collapsed');
        body.style.display = 'block';
        helpers.controller?.emit('card:expand', { el });
      } else {
        addClass(el, 'card-collapsed');
        body.style.display = 'none';
        helpers.controller?.emit('card:collapse', { el });
      }
    });
  }

  // Check if card has a close/dismiss trigger
  const closeBtn = el.querySelector('[data-dessert-card-close]');
  if (closeBtn) {
    closeBtn.addEventListener('click', () => {
      el.style.opacity = '0';
      el.style.transform = 'scale(0.95)';
      setTimeout(() => {
        el.remove();
        helpers.controller?.emit('card:dismiss', { el });
      }, 200);
    });
  }
}
