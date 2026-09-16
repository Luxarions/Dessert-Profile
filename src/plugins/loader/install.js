/**
 * @file Attach loader API onto a DESSERT instance.
 */

/**
 * @typedef {Object} LoaderAPI
 * @property {Function} dispatch
 * @property {Function} loadCSS
 * @property {Function} loadJS
 * @property {Function} loadImg
 * @property {Function} loadFont
 * @property {Function} loadJSON
 * @property {Function} loadHTML
 * @property {Function} loadVideo
 * @property {Function} loadAudio
 * @property {Function} parallel
 * @property {Function} sequence
 * @property {Function} all
 * @property {Function} preload
 * @property {Map<string, Promise<*>>} cache
 * @property {Function} clearCache
 * @property {string} version
 */

/**
 * @description Attach loader methods onto core.load.
 * @param {*} core - DESSERT instance.
 * @param {{ log?: (...args: *) => void }} priv - Private helpers.
 * @param {LoaderAPI} api
 * @returns {void}
 */
function install(core, priv, api) {
  const load = api.dispatch;
  load.css        = api.loadCSS;
  load.js         = api.loadJS;
  load.img        = api.loadImg;
  load.font       = api.loadFont;
  load.json       = api.loadJSON;
  load.html       = api.loadHTML;
  load.video      = api.loadVideo;
  load.audio      = api.loadAudio;
  load.parallel   = api.parallel;
  load.sequence   = api.sequence;
  load.all        = api.all;
  load.preload    = api.preload;
  load.clearCache = api.clearCache;
  load.cache      = api.cache;
  load.version    = api.version;

  core.load = load;
  priv.log?.('loader installed');
}

export { install };
