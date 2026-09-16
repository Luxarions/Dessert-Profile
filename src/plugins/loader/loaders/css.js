/**
 * @file CSS loader.
 */

import { cached } from '../cache.js';

/**
 * @description Load a CSS file via <link>.
 * @param {string} url
 * @returns {Promise<HTMLLinkElement>}
 */
function loadCSS(url) {
  return cached(url, () => new Promise((resolve, reject) => {
    const existing = document.querySelector(`link[href="${url}"]`);
    if (existing) return resolve(/** @type {HTMLLinkElement} */(existing));

    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = url;
    link.setAttribute('data-dessert-loaded', 'css');
    link.onload = () => resolve(link);
    link.onerror = () => reject(new Error(`CSS failed: ${url}`));
    document.head.appendChild(link);
  }));
}

export { loadCSS };
