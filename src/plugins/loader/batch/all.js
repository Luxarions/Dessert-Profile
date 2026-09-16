/**
 * @file Keyed batch loader.
 */

import { parallel } from './parallel.js';

/**
 * @description Load all entries of a map in parallel.
 * @param {Object<string, string>} map
 * @param {(done: number, total: number, item: *) => void} [onProgress]
 * @returns {Promise<Object<string, *>>}
 */
function all(map, onProgress) {
  const keys = Object.keys(map);
  return parallel(keys.map((k) => map[k]), onProgress)
    .then((results) => {
      const out = {};
      keys.forEach((k, i) => { out[k] = results[i]; });
      return out;
    });
}

export { all };
