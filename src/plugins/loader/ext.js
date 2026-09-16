/**
 * @file File extension helpers.
 */

/**
 * @description Extract lowercase extension from URL.
 * @param {string} url
 * @returns {string}
 */
function ext(url) {
  const clean = url.split('?')[0].split('#')[0];
  const m = clean.match(/\.([a-z0-9]+)$/i);
  return m ? m[1].toLowerCase() : '';
}

/**
 * @description Extension-to-loader alias map.
 * @type {Readonly<Object<string, string>>}
 */
const ALIASES = Object.freeze({
  jpg: 'img', jpeg: 'img', png: 'img', gif: 'img',
  webp: 'img', svg: 'img', avif: 'img',
  woff: 'font', woff2: 'font', ttf: 'font', otf: 'font',
  mjs: 'js', htm: 'html',
  mp4: 'video', webm: 'video',
  mp3: 'audio', ogg: 'audio', wav: 'audio',
});

export { ext, ALIASES };
