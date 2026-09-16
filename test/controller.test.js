/**
 * @file Unit tests for DessertController.
 */

function assert(condition, message) {
  if (!condition) {
    console.error(`  ❌ FAIL: ${message}`);
    process.exit(1);
  }
  console.log(`  ✅ PASS: ${message}`);
}

console.log('🎮 Controller API');

const ctrl = DESSERT.controller;

assert(ctrl !== undefined, 'DESSERT.controller is defined');
assert(typeof ctrl.on === 'function', 'controller.on is a function');
assert(typeof ctrl.off === 'function', 'controller.off is a function');
assert(typeof ctrl.emit === 'function', 'controller.emit is a function');
assert(typeof ctrl.setState === 'function', 'controller.setState is a function');
assert(typeof ctrl.getState === 'function', 'controller.getState is a function');
assert(typeof ctrl.closeAll === 'function', 'controller.closeAll is a function');

// Test Pub/Sub
let received = null;
const unsub = ctrl.on('test:event', (payload) => {
  received = payload;
});
ctrl.emit('test:event', { foo: 'bar' });
assert(received && received.foo === 'bar', 'controller emit/on delivers payload');

// Test Unsubscribe
unsub();
ctrl.emit('test:event', { foo: 'baz' });
assert(received.foo === 'bar', 'controller unsubscribe works');

// Test State Hub
ctrl.setState('theme', 'dark');
assert(ctrl.getState('theme') === 'dark', 'controller getState/setState works');

console.log('📊 Summary: Controller tests passed');
