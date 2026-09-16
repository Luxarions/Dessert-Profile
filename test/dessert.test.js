/**
 * @file DESSERT core test suite.
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

if (!DESSERT) {
  console.error('DESSERT not loaded!');
} else {
  group('Core API', () => {
    assert(typeof DESSERT === 'object', 'DESSERT is object');
    assert(DESSERT.prefix === 'dessert', 'prefix = dessert');
    assert(typeof DESSERT.version === 'string', 'version exists');
    assert(typeof DESSERT.init === 'function', 'init() exists');
    assert(typeof DESSERT.alert === 'function', 'alert() exists');
    assert(typeof DESSERT.addClass === 'function', 'addClass() exists');
    assert(typeof DESSERT.removeClass === 'function', 'removeClass() exists');
    assert(typeof DESSERT.toggleClass === 'function', 'toggleClass() exists');
    assert(typeof DESSERT.modal === 'object', 'modal API exists');
    assert(typeof DESSERT.destroy === 'function', 'destroy() exists');
  });

  group('DOM Utilities', () => {
    const el = document.createElement('div');
    DESSERT.addClass(el, 'test');
    assert(el.classList.contains('dessert-test'), 'addClass adds prefixed class');
    DESSERT.removeClass(el, 'test');
    assert(!el.classList.contains('dessert-test'), 'removeClass removes');
    DESSERT.toggleClass(el, 'test');
    assert(el.classList.contains('dessert-test'), 'toggleClass adds');
    DESSERT.toggleClass(el, 'test');
    assert(!el.classList.contains('dessert-test'), 'toggleClass removes');
    DESSERT.setData(el, 'foo', 'bar');
    assert(DESSERT.getData(el, 'foo') === 'bar', 'setData/getData works');
  });
}

console.log(`\n📊 Summary: ${passed} passed, ${failed} failed`);
