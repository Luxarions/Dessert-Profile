/**
 * @file Loader dispatcher.
 */

import { ext, ALIASES } from './ext.js';
import { loadCSS } from './loaders/css.js';
import { loadJS } from './loaders/js.js';
import { loadImg } from './loaders/img.js';
import { loadFont } from './loaders/font.js';
import { loadJSON } from './loaders/json.js';
import { loadHTML } from './loaders/html.js';
import { loadVideo } from './loaders/video.js';
import { loadAudio } from './loaders/audio.js';

/**
 * @typedef {(url: string, opts?: *) => Promise<*>} LoaderFn
 */

/**
 * @description Loader map keyed by canonical type.
 * @type {Object<string, LoaderFn>}
 */
const LOADERS = {
  css: loadCSS,
  js: loadJS,
  img: loadImg,
  font: loadFont,
  json: loadJSON,
  html: loadHTML,
  video: loadVideo,
  audio: loadAudio,
};

/**
 * @description Dispatch to the correct loader.
 * @param {string} typeOrUrl
 * @param {string} [maybeUrl]
 * @param {*} [opts]
 * @returns {Promise<*>}
 */
function dispatch(typeOrUrl, maybeUrl, opts) {
  let type, url;
  if (maybeUrl === undefined) {
    url = typeOrUrl;
    type = ext(url);
  } else {
    type = typeOrUrl;
    url = maybeUrl;
  }

  const key = ALIASES[type] || type;
  const fn = LOADERS[key];

  if (typeof fn !== 'function') {
    return Promise.reject(new Error(`Unsupported asset: ${type} (${url})`));
  }
  return fn(url, opts);
}

export { dispatch };
