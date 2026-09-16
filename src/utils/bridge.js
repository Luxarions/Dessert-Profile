/**
 * @file Internal DI bridge for private state access.
 */

/**
 * @typedef {Object} HelperContext
 * @property {*} core
 * @property {Object<string, *>} options
 * @property {*} state
 * @property {*} registry
 */

/**
 * @private
 * @type {HelperContext|null}
 */
let _ctx = null;

const helpers = {
  /**
   * @description Bind private context once from the DESSERT constructor.
   * @param {HelperContext} ctx
   * @returns {void}
   */
  bind(ctx) { _ctx = ctx; },

  /**
   * @description Retrieve the current helper context.
   * @returns {HelperContext}
   */
  get ctx() {
    if (!_ctx) throw new Error('[DESSERT] helpers not bound yet');
    return _ctx;
  },

  /** @returns {*} */
  get core()     { return helpers.ctx.core; },

  /** @returns {Object<string, *>} */
  get options()  { return helpers.ctx.options; },

  /** @returns {*} */
  get state()    { return helpers.ctx.state; },

  /** @returns {*} */
  get registry() { return helpers.ctx.registry; },
};

export { helpers };
