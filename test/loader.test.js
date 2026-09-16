/**
 * @file DESSERT Loader test suite.
 */

let passed = 0, failed = 0;

/**
 * @description Assert a condition.
 * @param {boolean} cond
 * @param {string} msg
 * @returns {void}
 */
function assert(cond, msg) {
  if (cond) { passed++; console.log(`✅ PASS: ${msg}`); }
  else { failed++; console.error(`❌ FAIL: ${msg}`); }
}

/**
 * @description Group tests under a label.
 * @param {string} name
 * @param {() => void} fn
 * @returns {void}
 */
function group(name, fn) { console.group(`🧪 ${name}`); fn(); console.groupEnd(); }

const DESSERT = globalThis.DESSERT;

if (!DESSERT || !DESSERT.load) {
  console.error('DESSERT Loader not loaded!');
} else {
  group('Loader API', () => {
    assert(typeof DESSERT.load === 'function', 'load() is function');
    assert(typeof DESSERT.load.css === 'function', 'load.css exists');
    assert(typeof DESSERT.load.js === 'function', 'load.js exists');
    assert(typeof DESSERT.load.img === 'function', 'load.img exists');
    assert(typeof DESSERT.load.json === 'function', 'load.json exists');
    assert(typeof DESSERT.load.parallel === 'function', 'load.parallel exists');
    assert(typeof DESSERT.load.sequence === 'function', 'load.sequence exists');
    assert(typeof DESSERT.load.all === 'function', 'load.all exists');
    assert(typeof DESSERT.load.preload === 'function', 'load.preload exists');
    assert(DESSERT.load.cache instanceof Map, 'cache is Map');
  });
}

console.log(`\n📊 Summary: ${passed} passed, ${failed} failed`);
