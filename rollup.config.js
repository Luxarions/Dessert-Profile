/**
 * @file Rollup build configuration for DESSERT.
 */

import { babel } from '@rollup/plugin-babel';
import { nodeResolve } from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';
import terser from '@rollup/plugin-terser';

/**
 * @description Banner prepended to bundle files.
 * @type {string}
 * @constant
 */
const banner = `/*! DESSERT v2.0.0 | MIT License */`;

/**
 * @description Babel plugin instance.
 * @type {*}
 */
const babelPlugin = babel({
  babelHelpers: 'bundled',
  exclude: 'node_modules/**',
  presets: [['@babel/preset-env', {
    targets: '> 0.5%, last 2 versions, not dead',
    modules: false,
  }]],
});

/**
 * @description Base plugin chain.
 * @type {Array<*>}
 */
const basePlugins = [nodeResolve(), commonjs(), babelPlugin];

/**
 * @description Build output descriptors for a bundle.
 * @param {string} name
 * @param {string} globalName
 * @returns {Array<*>}
 */
function buildOutputs(name, globalName) {
  const mk = (format, min) => {
    const out = {
      file: `dist/${name}.${format}${min ? '.min' : ''}.js`,
      format,
      exports: 'named',
      banner,
      sourcemap: true,
    };
    if (format === 'umd') out.name = globalName;
    if (min) out.plugins = [terser({ format: { comments: /^!/ } })];
    return out;
  };

  return [
    mk('cjs', false), mk('cjs', true),
    mk('es', false),  mk('es', true),
    mk('umd', false), mk('umd', true),
  ];
}

export default [
  {
    input: 'src/index.js',
    plugins: basePlugins,
    output: buildOutputs('dessert', 'DESSERT'),
  },
  {
    input: 'src/plugins/loader/LoaderPlugin.js',
    plugins: basePlugins,
    output: buildOutputs('loader', 'DESSERTLoader'),
  },
];
