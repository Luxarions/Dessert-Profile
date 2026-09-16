/**
 * @file HTML loader.
 */

import { cached } from '../cache.js';

/**
 * @description Fetch HTML text.
 * @param {string} url
 * @returns {Promise<string>}
 */
function loadHTML(url) {
  return cached(url, () =>
    fetch(url).then((r) => {
      if (!r.ok) throw new Error(`HTML failed: ${url}`);
      return r.text();
    })
  );
}

export { loadHTML };
