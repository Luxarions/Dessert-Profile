/**
 * @file Audio loader.
 */

import { cached } from '../cache.js';

/**
 * @description Load an audio element (canplaythrough).
 * @param {string} url
 * @returns {Promise<HTMLAudioElement>}
 */
function loadAudio(url) {
  return cached(url, () => new Promise((resolve, reject) => {
    const a = new Audio();
    a.preload = 'auto';
    a.oncanplaythrough = () => resolve(a);
    a.onerror = () => reject(new Error(`Audio failed: ${url}`));
    a.src = url;
  }));
}

export { loadAudio };
