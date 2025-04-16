// ui-helpers.js
// Helper functions for creating UI elements shared by modals

export function createButton({ text, className = '', style = '', onClick, type = 'button' }) {
  const btn = document.createElement('button');
  btn.textContent = text;
  btn.type = type;
  if (className) btn.className = className;
  if (style) btn.style.cssText = style;
  if (onClick) btn.onclick = onClick;
  return btn;
}

export function createContainer({ className = '', style = '', children = [] }) {
  const div = document.createElement('div');
  if (className) div.className = className;
  if (style) div.style.cssText = style;
  children.forEach(child => div.appendChild(child));
  return div;
}

export function createStatusMessage({ text = '', color = '#888', style = '' }) {
  const div = document.createElement('div');
  div.textContent = text;
  div.style.cssText = `font-size: 15px;font-weight: 500;margin-bottom: 10px;text-align: center;min-height: 1.5em;transition: color 0.25s;${style}`;
  div.style.color = color;
  return div;
}
