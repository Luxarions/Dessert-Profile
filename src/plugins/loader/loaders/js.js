/**
 * @file JavaScript loader.
 */

import { cached } from '../cache.js';

/**
 * @typedef {Object} JSLoaderOptions
 * @property {boolean} [async=true]
 * @property {boolean} [module=false]
 * @property {HTMLElement} [target]
 */

/**
 * @description Load a JS file via <script>.
 * @param {string} url
 * @param {JSLoaderOptions} [opts={}]
 * @returns {Promise<HTMLScriptElement>}
 */
function loadJS(url, opts = {}) {
  return cached(url, () => new Promise((resolve, reject) => {
    const existing = document.querySelector(`script[src="${url}"]`);
    if (existing) return resolve(/** @type {HTMLScriptElement} */(existing));

    const s = document.createElement('script');
    s.src = url;
    s.async = opts.async !== false;
    if (opts.module) s.type = 'module';
    s.onload = () => resolve(s);
    s.onerror = () => reject(new Error(`JS failed: ${url}`));
    (opts.target || document.head).appendChild(s);
  }));
}

export { loadJS };
