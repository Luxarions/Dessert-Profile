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
const css = readFileSync(SRC, 'utf8');
writeFileSync(OUT, css);
writeFileSync(OUT_MIN, minify(css));
console.log('✅ CSS built →', OUT, '&', OUT_MIN);
