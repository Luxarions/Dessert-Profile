/**
 * @file Image loader.
 */

import { cached } from '../cache.js';

/**
 * @description Load an image.
 * @param {string} url
 * @returns {Promise<HTMLImageElement>}
 */
function loadImg(url) {
  return cached(url, () => new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error(`IMG failed: ${url}`));
    img.src = url;
  }));
}

export { loadImg };
