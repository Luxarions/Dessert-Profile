/**
 * @file URL resolution helpers.
 */

/**
 * @description Resolve a path relative to a base.
 * @param {string} base
 * @param {string} path
 * @returns {string}
 */
function resolveURL(base, path) {
  try { return new URL(path, base).href; }
  catch { return path; }
}

/**
 * @description Derive base URL from a script element (assumes /src/ layout).
 * @param {HTMLScriptElement} scriptEl
 * @returns {?string}
 */
function getScriptBase(scriptEl) {
  if (!scriptEl?.src) return null;
  const m = scriptEl.src.match(/^(.*?)\/src\/[^/]+$/);
  return m ? m[1] : scriptEl.src.replace(/\/[^/]+$/, '');
}

/**
 * @description Get the currently executing script element.
 * @returns {HTMLScriptElement|undefined}
 */
function currentScript() {
  return document.currentScript
    || (() => {
      const s = document.getElementsByTagName('script');
      return s[s.length - 1];
    })();
}

export { resolveURL, getScriptBase, currentScript };
