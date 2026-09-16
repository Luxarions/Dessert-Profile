/**
 * @file JSON loader.
 */

import { cached } from '../cache.js';

/**
 * @description Fetch and parse JSON.
 * @param {string} url
 * @returns {Promise<Object>}
 */
function loadJSON(url) {
  return cached(url, () =>
    fetch(url).then((r) => {
      if (!r.ok) throw new Error(`JSON failed: ${url} (${r.status})`);
      return r.json();
    })
  );
}

export { loadJSON };
