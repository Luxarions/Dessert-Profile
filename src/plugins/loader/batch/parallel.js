/**
 * @file Parallel batch loader.
 */

import { dispatch } from '../dispatch.js';

/**
 * @typedef {Object} LoadItem
 * @property {string} type
 * @property {string} url
 * @property {*} [opts]
 */

/**
 * @typedef {(done: number, total: number, item: string|LoadItem) => void} ProgressFn
 */

/**
 * @description Load items in parallel.
 * @param {Array<string|LoadItem>} items
 * @param {ProgressFn} [onProgress]
 * @returns {Promise<Array<*>>}
 */
function parallel(items, onProgress) {
  let done = 0;
  const total = items.length;
  return Promise.all(
    items.map((item) => {
      const p = typeof item === 'string'
        ? dispatch(item)
        : dispatch(item.type, item.url, item.opts);
      return p.then((res) => {
        done++;
        onProgress?.(done, total, item);
        return res;
      });
    })
  );
}

export { parallel };
