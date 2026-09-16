/**
 * @file Loader promise cache.
 */

/**
 * @description Cache map for asset loading promises.
 * @type {Map<string, Promise<*>>}
 */
const _cache = new Map();

/**
 * @description Wrap a factory with caching.
 * @template T
 * @param {string} url
 * @param {() => Promise<T>} factory
 * @returns {Promise<T>}
 */
function cached(url, factory) {
  if (_cache.has(url)) return _cache.get(url);
  const p = factory().catch((err) => {
    _cache.delete(url);
    throw err;
  });
  _cache.set(url, p);
  return p;
}

/**
 * @description Clear asset cache.
 * @returns {void}
 */
function clearCache() {
  _cache.clear();
}

export { _cache, cached, clearCache };
