// dom.js
// Helper functions for DOM manipulation and UI creation

/**
 * Creates a button element with the specified properties
 * @param {Object} options - Button configuration options
 * @param {string} options.text - Button text
 * @param {string} [options.className=''] - CSS class name
 * @param {string} [options.style=''] - Inline CSS styles
 * @param {Function} [options.onClick] - Click event handler
 * @param {string} [options.type='button'] - Button type attribute
 * @returns {HTMLButtonElement} The created button element
 */
export function createButton({ text, className = '', style = '', onClick, type = 'button' }) {
  const btn = document.createElement('button');
  btn.textContent = text;
  btn.type = type;
  if (className) btn.className = className;
  if (style) btn.style.cssText = style;
  if (onClick) btn.onclick = onClick;
  return btn;
}

/**
 * Creates a container element with the specified properties
 * @param {Object} options - Container configuration options
 * @param {string} [options.className=''] - CSS class name
 * @param {string} [options.style=''] - Inline CSS styles
 * @param {Array<HTMLElement>} [options.children=[]] - Child elements to append
 * @returns {HTMLDivElement} The created container element
 */
export function createContainer({ className = '', style = '', children = [] }) {
  const div = document.createElement('div');
  if (className) div.className = className;
  if (style) div.style.cssText = style;
  children.forEach(child => div.appendChild(child));
  return div;
}

/**
 * Creates a status message element with the specified properties
 * @param {Object} options - Status message configuration options
 * @param {string} [options.text=''] - Message text
 * @param {string} [options.color='#888'] - Text color
 * @param {string} [options.style=''] - Additional inline CSS styles
 * @returns {HTMLDivElement} The created status message element
 */
export function createStatusMessage({ text = '', color = '#888', style = '' }) {
  const div = document.createElement('div');
  div.textContent = text;
  div.style.cssText = `font-size: 15px;font-weight: 500;margin-bottom: 10px;text-align: center;min-height: 1.5em;transition: color 0.25s;${style}`;
  div.style.color = color;
  return div;
}

/**
 * Creates a form input with label
 * @param {Object} options - Input configuration options
 * @param {string} options.id - Input ID
 * @param {string} options.label - Label text
 * @param {string} [options.type='text'] - Input type
 * @param {string} [options.value=''] - Initial value
 * @param {string} [options.placeholder=''] - Placeholder text
 * @returns {HTMLDivElement} Container with label and input
 */
export function createFormInput({ id, label, type = 'text', value = '', placeholder = '' }) {
  const container = document.createElement('div');
  container.style.cssText = 'margin-bottom: 12px;';
  
  const labelEl = document.createElement('label');
  labelEl.htmlFor = id;
  labelEl.textContent = label;
  labelEl.style.cssText = 'display: block; margin-bottom: 4px; font-weight: 500;';
  
  const input = document.createElement('input');
  input.type = type;
  input.id = id;
  input.value = value;
  input.placeholder = placeholder;
  input.style.cssText = 'width: 100%; padding: 8px; border: 1px solid #ccc; border-radius: 4px;';
  
  container.appendChild(labelEl);
  container.appendChild(input);
  
  return container;
}
