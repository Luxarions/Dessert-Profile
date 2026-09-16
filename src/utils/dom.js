/**
 * @file DOM creation helpers.
 */

/**
 * @description Create an element with attributes and children.
 * @param {string} tag
 * @param {Object<string, string>} [attrs={}]
 * @param {Array<Node|string>} [children=[]]
 * @returns {HTMLElement}
 */
function el(tag, attrs = {}, children = []) {
  const node = document.createElement(tag);
  Object.entries(attrs).forEach(([k, v]) => node.setAttribute(k, v));
  children.forEach((c) =>
    node.appendChild(typeof c === 'string' ? document.createTextNode(c) : c)
  );
  return node;
}

/**
 * @description Remove a node from its parent.
 * @param {Node} node
 * @returns {void}
 */
function remove(node) {
  node?.parentNode?.removeChild(node);
}

/**
 * @description Append multiple nodes to a parent.
 * @param {Node} parent
 * @param {...Node} nodes
 * @returns {Node}
 */
function appendTo(parent, ...nodes) {
  nodes.forEach((n) => parent.appendChild(n));
  return parent;
}

export { el, remove, appendTo };
