/**
 * @file DESSERT Responsive & Viewport Utility.
 */

export const responsive = {
  get isMobile() {
    return typeof window !== 'undefined' && window.innerWidth < 640;
  },

  get isTablet() {
    return typeof window !== 'undefined' && window.innerWidth >= 640 && window.innerWidth < 1024;
  },

  get isDesktop() {
    return typeof window !== 'undefined' && window.innerWidth >= 1024;
  },

  /**
   * Listen to viewport breakpoint change.
   * @param {Function} cb
   * @returns {() => void}
   */
  onChange(cb) {
    if (typeof window === 'undefined') return () => {};
    let lastState = this.isMobile;
    const handler = () => {
      const current = this.isMobile;
      if (current !== lastState) {
        lastState = current;
        cb({ isMobile: current, width: window.innerWidth });
      }
    };
    window.addEventListener('resize', handler, { passive: true });
    return () => window.removeEventListener('resize', handler);
  }
};
