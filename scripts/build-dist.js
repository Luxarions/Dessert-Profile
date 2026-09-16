/**
 * @file Dist bundler using esbuild for CJS, ESM, and UMD.
 */

import { buildSync } from 'esbuild';
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { dirname } from 'node:path';

const banner = '/*! DESSERT v2.0.0 | MIT License */';

mkdirSync('dist', { recursive: true });

function buildBundle(entry, name, globalName) {
  // 1. ESM
  buildSync({
    entryPoints: [entry],
    outfile: `dist/${name}.esm.js`,
    format: 'esm',
    bundle: true,
    banner: { js: banner },
    sourcemap: true,
  });
  buildSync({
    entryPoints: [entry],
    outfile: `dist/${name}.esm.min.js`,
    format: 'esm',
    bundle: true,
    minify: true,
    banner: { js: banner },
    sourcemap: true,
  });

  // 2. CJS
  buildSync({
    entryPoints: [entry],
    outfile: `dist/${name}.cjs.js`,
    format: 'cjs',
    bundle: true,
    banner: { js: banner },
    sourcemap: true,
  });
  buildSync({
    entryPoints: [entry],
    outfile: `dist/${name}.cjs.min.js`,
    format: 'cjs',
    bundle: true,
    minify: true,
    banner: { js: banner },
    sourcemap: true,
  });

  // 3. IIFE/UMD wrapper
  const iifeResult = buildSync({
    entryPoints: [entry],
    format: 'iife',
    globalName,
    bundle: true,
    write: false,
    banner: { js: banner },
    sourcemap: true,
  });

  const iifeMinResult = buildSync({
    entryPoints: [entry],
    format: 'iife',
    globalName,
    bundle: true,
    minify: true,
    write: false,
    banner: { js: banner },
    sourcemap: true,
  });

  const umdWrapper = (code) => `(function (root, factory) {
  if (typeof define === 'function' && define.amd) {
    define([], factory);
  } else if (typeof module === 'object' && module.exports) {
    module.exports = factory();
  } else {
    root.${globalName} = factory();
  }
}(typeof self !== 'undefined' ? self : this, function () {
${code}
  return typeof ${globalName} !== 'undefined' ? ${globalName} : (typeof exports !== 'undefined' ? exports : {});
}));`;

  writeFileSync(`dist/${name}.umd.js`, umdWrapper(iifeResult.outputFiles[0].text));
  writeFileSync(`dist/${name}.umd.min.js`, umdWrapper(iifeMinResult.outputFiles[0].text));
  console.log(`✅ Built ${name} (CJS, ESM, UMD)`);
}

buildBundle('src/index.js', 'dessert', 'DESSERT');
buildBundle('src/plugins/loader/LoaderPlugin.js', 'loader', 'DESSERTLoader');
