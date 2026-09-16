/**
 * @file Font preload loader.
 */

import { cached } from '../cache.js';
import { ext } from '../ext.js';

/**
 * @description Preload a font file.
 * @param {string} url
 * @returns {Promise<HTMLLinkElement>}
 */
function loadFont(url) {
  return cached(url, () => new Promise((resolve, reject) => {
    const link = document.createElement('link');
    link.rel = 'preload';
    link.as = 'font';
    link.type = `font/${ext(url) === 'woff2' ? 'woff2' : 'woff'}`;
    link.href = url;
    link.crossOrigin = 'anonymous';
    link.onload = () => resolve(link);
    link.onerror = () => reject(new Error(`Font failed: ${url}`));
    document.head.appendChild(link);
  }));
}

export { loadFont };
