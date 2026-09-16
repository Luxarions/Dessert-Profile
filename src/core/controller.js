/**
 * @file DESSERT Controller — Centralized Event Bus, Component Lifecycle, & State Hub.
 */

class DessertController {
  /**
   * @param {Object} [ctx={}]
   */
  constructor(ctx = {}) {
    /** @type {import('./DESSERT.js').DESSERT|null} */
    this.core = ctx.core || null;
    /** @type {Map<string, Set<Function>>} */
    this._listeners = new Map();
    /** @type {Map<string, any>} */
    this._state = new Map();
    /** @type {Set<HTMLElement>} */
    this._activeInstances = new Set();
  }

  /**
   * Bind core instance reference.
   * @param {Object} core
   */
  bindCore(core) {
    this.core = core;
  }

  /**
   * Register an event listener (Pub/Sub).
   * @param {string} event
   * @param {Function} handler
   * @returns {() => void} Unsubscribe function
   */
  on(event, handler) {
    if (!this._listeners.has(event)) {
      this._listeners.set(event, new Set());
    }
    this._listeners.get(event).add(handler);
    return () => this.off(event, handler);
  }

  /**
   * Remove an event listener.
   * @param {string} event
   * @param {Function} handler
   */
  off(event, handler) {
    const handlers = this._listeners.get(event);
    if (handlers) {
      handlers.delete(handler);
      if (handlers.size === 0) this._listeners.delete(event);
    }
  }

  /**
   * Emit an event to all subscribers.
   * @param {string} event
   * @param {*} [payload]
   */
  emit(event, payload) {
    const handlers = this._listeners.get(event);
    if (handlers) {
      handlers.forEach((fn) => {
        try {
          fn(payload);
        } catch (err) {
          console.error(`[DESSERT Controller] Error in listener for "${event}":`, err);
        }
      });
    }
    // Also dispatch as a native CustomEvent on window for external integrations
    if (typeof window !== 'undefined' && typeof window.dispatchEvent === 'function' && typeof CustomEvent !== 'undefined') {
      window.dispatchEvent(new CustomEvent(`dessert:${event}`, { detail: payload }));
    }
  }

  /**
   * Set global controller state key-value.
   * @param {string} key
   * @param {*} value
   */
  setState(key, value) {
    const prev = this._state.get(key);
    this._state.set(key, value);
    this.emit('state:change', { key, value, prev });
  }

  /**
   * Get controller state.
   * @param {string} key
   * @param {*} [fallback=null]
   * @returns {*}
   */
  getState(key, fallback = null) {
    return this._state.has(key) ? this._state.get(key) : fallback;
  }

  /**
   * Register an active component element in DOM.
   * @param {HTMLElement} el
   */
  registerInstance(el) {
    this._activeInstances.add(el);
    this.emit('instance:registered', { el });
  }

  /**
   * Unregister an active component element.
   * @param {HTMLElement} el
   */
  unregisterInstance(el) {
    this._activeInstances.delete(el);
    this.emit('instance:unregistered', { el });
  }

  /**
   * Close all active popups, dropdowns, and modals globally.
   */
  closeAll() {
    if (typeof document === 'undefined') return;

    // Close all open modals
    document.querySelectorAll('.dessert-modal.dessert-show').forEach((modal) => {
      this.core?.modal?.close(modal);
    });

    // Close all open dropdown menus
    document.querySelectorAll('.dessert-dropdown-menu.dessert-show').forEach((menu) => {
      menu.classList.remove('dessert-show');
    });

    this.emit('dismiss:all');
  }

  /**
   * Refresh and re-run DOM component bindings.
   */
  refresh() {
    if (this.core) {
      this.core.autoInit?.();
      this.emit('lifecycle:refreshed');
    }
  }

  /**
   * Reset all controller listeners and states.
   */
  reset() {
    this._listeners.clear();
    this._state.clear();
    this._activeInstances.clear();
    this.emit('lifecycle:reset');
  }
}

export { DessertController };
