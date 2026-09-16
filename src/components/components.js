/**
 * @file Component registry barrel.
 */

import { modalComponent } from './modal.js';
import { dropdownComponent } from './dropdown.js';
import { tabsComponent } from './tabs.js';
import { accordionComponent } from './accordion.js';
import { cardComponent } from './card.js';
import { badgeComponent } from './badge.js';

/**
 * @typedef {Object} Components
 * @property {(el: HTMLElement) => void} modal
 * @property {(el: HTMLElement) => void} dropdown
 * @property {(el: HTMLElement) => void} tabs
 * @property {(el: HTMLElement) => void} accordion
 * @property {(el: HTMLElement) => void} card
 * @property {(el: HTMLElement) => void} badge
 */

/**
 * @description Component registry map.
 * @type {Components}
 */
const components = {
  modal: modalComponent,
  dropdown: dropdownComponent,
  tabs: tabsComponent,
  accordion: accordionComponent,
  card: cardComponent,
  badge: badgeComponent,
};

export { components };
