/**
 * @file DESSERT main entry — the only index.js in the project.
 */

import { DESSERT } from './core/DESSERT.js';
import { DessertController } from './core/controller.js';
import { components } from './components/components.js';
import { autoInit } from './autoinit/autoInit.js';
import { bindEscapeKey } from './autoinit/escapeKey.js';
import { injectCSS } from './inject/injectCSS.js';
import { injectLoader } from './inject/injectLoader.js';
import { modalAPI } from './api/modalAPI.js';
import { alertAPI } from './api/alertAPI.js';
import { destroyAPI } from './api/destroyAPI.js';
import { addClass, removeClass, toggleClass } from './utils/classNames.js';
import { setData, getData } from './utils/attributes.js';

/* 1. attach public API onto prototype */
DESSERT.prototype.components  = components;
DESSERT.prototype.modal       = modalAPI;
DESSERT.prototype.alert       = alertAPI;
DESSERT.prototype.destroy     = destroyAPI;
DESSERT.prototype.autoInit    = autoInit;
DESSERT.prototype.addClass    = addClass;
DESSERT.prototype.removeClass = removeClass;
DESSERT.prototype.toggleClass = toggleClass;
DESSERT.prototype.setData     = setData;
DESSERT.prototype.getData     = getData;

/**
 * @description Singleton DESSERT instance.
 * @type {DESSERT}
 */
const DESSERT_INSTANCE = new DESSERT();

/* 2. side effects: inject assets & auto-boot */
if (typeof document !== 'undefined') {
  injectCSS();
  injectLoader();

  const boot = () => {
    DESSERT_INSTANCE.init();
    bindEscapeKey(DESSERT_INSTANCE);
  };

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', boot);
  } else {
    boot();
  }
}

export { DESSERT, DESSERT_INSTANCE, DessertController };
export { DESSERT_INSTANCE as default };
