/**
 * @file Accordion component.
 * Robust auto-expanding accordion with zero text clipping.
 */

import { addClass, removeClass } from '../utils/classNames.js';
import { registry } from '../core/registry.js';
import { helpers } from '../utils/bridge.js';
import { log } from '../utils/logger.js';

/**
 * @description Initialize accordion element.
 * @param {HTMLElement} el
 * @returns {void}
 */
function accordionComponent(el) {
  const items = el.querySelectorAll('.dessert-accordion-item');
  /** @type {Array<[EventTarget, string, EventListener]>} */
  const handlers = [];

  // Initialize existing open items
  items.forEach((item) => {
    const body = /** @type {HTMLElement|null} */ (item.querySelector('.dessert-accordion-body'));
    if (item.classList.contains('dessert-open') && body) {
      body.style.maxHeight = 'none';
      body.style.overflow = 'visible';
    } else if (body) {
      body.style.maxHeight = '0px';
      body.style.overflow = 'hidden';
    }
  });

  items.forEach((item) => {
    const header = item.querySelector('.dessert-accordion-header');
    const body = /** @type {HTMLElement|null} */ (item.querySelector('.dessert-accordion-body'));
    if (!header || !body) return;

    const toggle = () => {
      const isOpen = item.classList.contains('dessert-open');

      // Close siblings if in standard single-open accordion mode
      items.forEach((sibling) => {
        if (sibling !== item && sibling.classList.contains('dessert-open')) {
          const sBody = /** @type {HTMLElement|null} */ (sibling.querySelector('.dessert-accordion-body'));
          if (sBody) {
            sBody.style.overflow = 'hidden';
            sBody.style.maxHeight = `${sBody.scrollHeight}px`;
            // Trigger reflow
            void sBody.offsetHeight;
            sBody.style.maxHeight = '0px';
          }
          removeClass(sibling, 'open');
        }
      });

      if (isOpen) {
        // Closing current item
        body.style.overflow = 'hidden';
        body.style.maxHeight = `${body.scrollHeight}px`;
        void body.offsetHeight;
        body.style.maxHeight = '0px';
        removeClass(item, 'open');
        helpers.controller?.emit('accordion:close', { el: item });
      } else {
        // Opening current item
        addClass(item, 'open');
        body.style.overflow = 'hidden';
        // Add extra padding safety margin so scrollHeight never clips
        const targetHeight = body.scrollHeight + 32;
        body.style.maxHeight = `${targetHeight}px`;

        const onTransitionEnd = (e) => {
          if (e.propertyName === 'max-height' && item.classList.contains('dessert-open')) {
            body.style.maxHeight = 'none';
            body.style.overflow = 'visible';
            body.removeEventListener('transitionend', onTransitionEnd);
          }
        };
        body.addEventListener('transitionend', onTransitionEnd);
        helpers.controller?.emit('accordion:open', { el: item });
      }
    };

    header.addEventListener('click', toggle);
    handlers.push([header, 'click', toggle]);
  });

  registry.instances.set(el, { type: 'accordion', handlers });
  log('accordion init');
}

export { accordionComponent };
