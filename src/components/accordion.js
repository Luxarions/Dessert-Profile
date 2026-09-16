/**
 * @file Accordion component.
 */

import { addClass, removeClass } from '../utils/classNames.js';
import { registry } from '../core/registry.js';
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

  items.forEach((item) => {
    const header = item.querySelector('.dessert-accordion-header');
    const body = item.querySelector('.dessert-accordion-body');
    if (!header) return;

    const h = () => {
      const isOpen = item.classList.contains('dessert-open');

      items.forEach((i) => {
        removeClass(i, 'open');
        const b = i.querySelector('.dessert-accordion-body');
        if (b) b.style.maxHeight = '';
      });

      if (!isOpen) {
        addClass(item, 'open');
        if (body) body.style.maxHeight = `${body.scrollHeight}px`;
      }
    };

    header.addEventListener('click', h);
    handlers.push([header, 'click', h]);
  });

  registry.instances.set(el, { type: 'accordion', handlers });
  log('accordion init');
}

export { accordionComponent };
