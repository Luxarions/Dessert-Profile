/**
 * @file CSS build script.
 */

import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { dirname } from 'node:path';

const SRC = 'src/styles/dessert.css';
const OUT = 'dist/dessert.css';
const OUT_MIN = 'dist/dessert.min.css';

/**
 * @description Naive CSS minifier.
 * @param {string} css
 * @returns {string}
 */
function minify(css) {
  return css
    .replace(/\/\*[\s\S]*?\*\//g, '')
    .replace(/\s+/g, ' ')
    .replace(/\s*([{};:,>])\s*/g, '$1')
    .replace(/;}/g, '}')
    .trim();
}

mkdirSync(dirname(OUT), { recursive: true });
mkdirSync('dist/dist', { recursive: true });
const css = readFileSync(SRC, 'utf8');
const minCss = minify(css);
writeFileSync(OUT, css);
writeFileSync(OUT_MIN, minCss);
writeFileSync('dist/dist/dessert.css', css);
writeFileSync('dist/dist/dessert.min.css', minCss);
console.log('✅ CSS built →', OUT, '&', OUT_MIN, '(mirrored to dist/dist/)');
