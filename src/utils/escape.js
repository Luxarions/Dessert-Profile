/**
 * @file CSS selector escaping.
 */

/**
 * @description Escape a string for CSS selectors.
 * @param {string} s
 * @returns {string}
 */
function esc(s) {
  return globalThis.CSS?.escape
    ? CSS.escape(s)
    : String(s).replace(/"/g, '\\"');
}

export { esc };
