/**
 * @file DESSERT Loader plugin class.
 */

import { dispatch } from './dispatch.js';
import { loadCSS } from './loaders/css.js';
import { loadJS } from './loaders/js.js';
import { loadImg } from './loaders/img.js';
import { loadFont } from './loaders/font.js';
import { loadJSON } from './loaders/json.js';
import { loadHTML } from './loaders/html.js';
import { loadVideo } from './loaders/video.js';
import { loadAudio } from './loaders/audio.js';
import { parallel } from './batch/parallel.js';
import { sequence } from './batch/sequence.js';
import { all } from './batch/all.js';
import { preload } from './batch/preload.js';
import { _cache, clearCache } from './cache.js';
import { install } from './install.js';

/**
 * @description Loader plugin version.
 * @type {string}
 * @constant
 */
const VERSION = '2.0.0';

/**
 * @description DESSERT Loader plugin.
 */
class LoaderPlugin {
  /** @type {string} */
  static name = 'loader';

  /** @type {string} */
  static version = VERSION;

  /** @returns {string} */
  get name() { return LoaderPlugin.name; }

  /** @returns {string} */
  get version() { return LoaderPlugin.version; }

  /**
   * @description Install loader API onto a DESSERT instance.
   * @param {*} core
   * @param {{ log?: (...args: *) => void }} priv
   * @returns {void}
   */
  install(core, priv) {
    install(core, priv, {
      dispatch,
      loadCSS, loadJS, loadImg, loadFont, loadJSON,
      loadHTML, loadVideo, loadAudio,
      parallel, sequence, all, preload,
      cache: _cache,
      clearCache,
      version: VERSION,
    });
  }

  /**
   * @description Plugin init hook.
   * @param {*} core
   * @returns {void}
   */
  init(core) {
    // no-op
  }
}

/**
 * @description Singleton loader plugin.
 * @type {LoaderPlugin}
 */
const loaderPlugin = new LoaderPlugin();

export { LoaderPlugin, loaderPlugin };
