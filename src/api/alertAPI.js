/**
 * @file Stacked alert/toast API.
 */

import { addClass, removeClass } from '../utils/classNames.js';

/**
 * @typedef {'info'|'success'|'warning'|'danger'} AlertType
 */

/**
 * @description Show a stacked alert.
 * @param {string} msg
 * @param {AlertType} [type='info']
 * @param {number} [duration=3000]
 * @returns {void}
 */
function alertAPI(msg, type = 'info', duration = 3000) {
  let container = document.querySelector('.dessert-alert-container');
  if (!container) {
    container = document.createElement('div');
    container.className = 'dessert-alert-container';
    document.body.appendChild(container);
  }

  const box = document.createElement('div');
  box.className = `dessert-alert dessert-alert-${type}`;
  box.textContent = msg;
  container.appendChild(box);

  requestAnimationFrame(() => addClass(box, 'show'));

  setTimeout(() => {
    removeClass(box, 'show');
    setTimeout(() => {
      box.remove();
      if (!container.children.length) container.remove();
    }, 300);
  }, duration);
}

export { alertAPI };
