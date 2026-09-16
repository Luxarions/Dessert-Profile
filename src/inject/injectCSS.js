/**
 * @file Auto-inject dessert.css.
 */

import { currentScript, getScriptBase } from '../utils/url.js';
import { log } from '../utils/logger.js';

/**
 * @description Inject dessert.css if not already present.
 * @returns {void}
 */
function injectCSS() {
  if (document.querySelector('link[data-dessert-css]')) return;

  const base = getScriptBase(currentScript());
  const href = base
    ? `${base}/src/styles/dessert.css`
    : 'dist/dessert.css';

  const link = document.createElement('link');
  link.rel = 'stylesheet';
  link.href = href;
  link.setAttribute('data-dessert-css', '');
  link.onerror = () => log('CSS load failed:', href);
  document.head.appendChild(link);
}

export { injectCSS };
