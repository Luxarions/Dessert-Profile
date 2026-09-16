/**
 * @file Video loader.
 */

import { cached } from '../cache.js';

/**
 * @description Load a video element (metadata ready).
 * @param {string} url
 * @returns {Promise<HTMLVideoElement>}
 */
function loadVideo(url) {
  return cached(url, () => new Promise((resolve, reject) => {
    const v = document.createElement('video');
    v.preload = 'auto';
    v.onloadedmetadata = () => resolve(v);
    v.onerror = () => reject(new Error(`Video failed: ${url}`));
    v.src = url;
  }));
}

export { loadVideo };
