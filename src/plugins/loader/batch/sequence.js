/**
 * @file Sequential batch loader.
 */

import { dispatch } from '../dispatch.js';

/**
 * @typedef {Object} SequenceItem
 * @property {string} type
 * @property {string} url
 * @property {*} [opts]
 */

/**
 * @description Load items one after another.
 * @param {Array<string|SequenceItem>} items
 * @param {(done: number, total: number, item: *) => void} [onProgress]
 * @returns {Promise<Array<*>>}
 */
function sequence(items, onProgress) {
  let done = 0;
  const total = items.length;
  let chain = Promise.resolve([]);

  items.forEach((item) => {
    chain = chain.then((results) => {
      const p = typeof item === 'string'
        ? dispatch(item)
        : dispatch(item.type, item.url, item.opts);
      return p.then((res) => {
        done++;
        onProgress?.(done, total, item);
        results.push(res);
        return results;
      });
    });
  });

  return chain;
}

export { sequence };
