/**
 * @file Preload hint helper.
 */

import { ext } from '../ext.js';

/**
 * @description Extension-to-`as` attribute map.
 * @type {Object<string, string>}
 */
const AS_MAP = {
  css: 'style', js: 'script', mjs: 'script',
  png: 'image', jpg: 'image', jpeg: 'image', gif: 'image',
  webp: 'image', svg: 'image', avif: 'image',
  woff: 'font', woff2: 'font', ttf: 'font', otf: 'font',
  json: 'fetch', mp4: 'video', webm: 'video',
  mp3: 'audio', ogg: 'audio', wav: 'audio',
};

/**
 * @description Add <link rel="preload"> hints for URLs.
 * @param {string[]} urls
 * @returns {void}
 */
function preload(urls) {
  urls.forEach((url) => {
    const type = ext(url);
    const as = AS_MAP[type];
    if (!as) return;

    const link = document.createElement('link');
    link.rel = 'preload';
    link.href = url;
    link.as = as;
    if (as === 'font' || as === 'fetch') link.crossOrigin = 'anonymous';
    document.head.appendChild(link);
  });
}

export { preload };
