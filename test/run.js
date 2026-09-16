/**
 * @file Test entry point.
 */

// If running in Node without browser DOM:
if (typeof document === 'undefined') {
  class MockElement {
    constructor(tag = 'div') {
      this.tagName = tag.toUpperCase();
      this.classList = {
        _classes: new Set(),
        add(c) { this._classes.add(c); },
        remove(c) { this._classes.delete(c); },
        contains(c) { return this._classes.has(c); },
        toggle(c, force) {
          if (typeof force === 'boolean') {
            force ? this._classes.add(c) : this._classes.delete(c);
            return force;
          }
          if (this._classes.has(c)) {
            this._classes.delete(c);
            return false;
          }
          this._classes.add(c);
          return true;
        }
      };
      this.attributes = new Map();
      this.style = {};
      this.children = [];
    }
    setAttribute(k, v) { this.attributes.set(k, String(v)); }
    getAttribute(k) { return this.attributes.get(k) || null; }
    removeAttribute(k) { this.attributes.delete(k); }
    appendChild(child) { this.children.push(child); return child; }
    querySelectorAll() { return []; }
    querySelector() { return null; }
    addEventListener() {}
    removeEventListener() {}
  }

  globalThis.document = {
    createElement(tag) { return new MockElement(tag); },
    createTextNode(text) { return { textContent: text }; },
    querySelectorAll() { return []; },
    querySelector() { return null; },
    getElementsByTagName(tag) { return []; },
    addEventListener() {},
    removeEventListener() {},
    body: new MockElement('body'),
    head: new MockElement('head'),
    activeElement: null,
    readyState: 'complete',
  };
  globalThis.window = globalThis;
}

const { default: DESSERT } = await import('../src/index.js');
const { loaderPlugin } = await import('../src/plugins/loader/LoaderPlugin.js');

DESSERT.use(loaderPlugin);
globalThis.DESSERT = DESSERT;

await import('./dessert.test.js');
await import('./loader.test.js');
