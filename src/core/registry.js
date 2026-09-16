/**
 * @file Internal plugin and instance registries.
 */

/**
 * @typedef {Object} InstanceRecord
 * @property {string} type
 * @property {Array<[EventTarget, string, EventListener]>} handlers
 */

/**
 * @typedef {Object} DessertRegistry
 * @property {Map<string, *>} plugins
 * @property {WeakMap<HTMLElement, InstanceRecord>} instances
 */

/**
 * @description Plugin and instance registries.
 * @type {DessertRegistry}
 */
const registry = {
  plugins: new Map(),
  instances: new WeakMap(),
};

export { registry };
