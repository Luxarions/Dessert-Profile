/**
 * @file Auto-inject loader plugin.
 */

import { registry } from '../core/registry.js';
import { currentScript, getScriptBase } from '../utils/url.js';
import { log } from '../utils/logger.js';

/**
 * @description Inject loader plugin if not registered.
 * @returns {void}
 */
function injectLoader() {
  if (registry.plugins.has('loader')) return;
  if (document.querySelector('script[data-dessert-loader]')) return;

  const base = getScriptBase(currentScript());
  const src = base
    ? `${base}/src/plugins/loader/LoaderPlugin.js`
    : 'loader.umd.js';

  const s = document.createElement('script');
  s.type = base ? 'module' : 'text/javascript';
  s.src = src;
  s.async = false;
  s.setAttribute('data-dessert-loader', '');
  s.onerror = () => log('loader inject failed:', src);
  document.head.appendChild(s);
}

export { injectLoader };
