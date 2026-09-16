/**
 * @file DESSERT Badge Component.
 * Supports dismissible badges and status dot badges.
 */

import { helpers } from '../utils/bridge.js';

/**
 * @param {HTMLElement} el
 * @returns {void}
 */
export function badgeComponent(el) {
  const dismissBtn = el.querySelector('[data-dessert-badge-dismiss]');
  if (dismissBtn) {
    dismissBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      el.style.opacity = '0';
      setTimeout(() => {
        el.remove();
        helpers.controller?.emit('badge:dismiss', { el });
      }, 150);
    });
  }
}
