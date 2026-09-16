/**
 * @file Shared mutable state.
 */

/**
 * @typedef {Object} DessertState
 * @property {boolean} escBound
 * @property {HTMLElement|null} lastFocused
 */

/**
 * @description Global runtime state.
 * @type {DessertState}
 */
const state = {
  escBound: false,
  lastFocused: null,
};

/**
 * @description Global options mutated by DESSERT.init().
 * @type {Object<string, *>}
 */
const options = {};

export { state, options };
