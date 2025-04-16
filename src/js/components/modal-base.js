// modal-base.js
// Base class for modals with common functionality

import { createButton, createContainer, createStatusMessage } from '../utils/dom.js';

export class ModalBase {
  constructor(options = {}) {
    this.options = {
      title: options.title || '',
      width: options.width || '400px',
      height: options.height || 'auto',
      onClose: options.onClose || (() => {}),
      showCloseButton: options.showCloseButton !== false,
      className: options.className || ''
    };
    
    this.modal = null;
    this.overlay = null;
    this.content = null;
    this.statusMessage = null;
    this.closeBtn = null;
    
    this.createModal();
  }
  
  createModal() {
    // Create overlay
    this.overlay = document.createElement('div');
    this.overlay.className = 'modal-overlay';
    this.overlay.style.cssText = `
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background: rgba(0, 0, 0, 0.5);
      display: none;
      z-index: 1000;
    `;
    
    // Create modal
    this.modal = document.createElement('div');
    this.modal.className = `modal ${this.options.className}`;
    this.modal.style.cssText = `
      position: fixed;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      background: white;
      padding: 20px;
      border-radius: 8px;
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
      z-index: 1001;
      display: none;
      width: ${this.options.width};
      max-width: 90%;
      max-height: 90vh;
      overflow-y: auto;
    `;
    
    // Create content container
    this.content = document.createElement('div');
    this.content.className = 'modal-content';
    
    // Create title if provided
    if (this.options.title) {
      const title = document.createElement('h3');
      title.textContent = this.options.title;
      title.style.cssText = 'margin-top: 0; margin-bottom: 15px;';
      this.content.appendChild(title);
    }
    
    // Create status message
    this.statusMessage = createStatusMessage({});
    this.content.appendChild(this.statusMessage);
    
    // Create close button if enabled
    if (this.options.showCloseButton) {
      this.closeBtn = document.createElement('button');
      this.closeBtn.innerHTML = '&times;';
      this.closeBtn.className = 'modal-close';
      this.closeBtn.style.cssText = `
        position: absolute;
        top: 10px;
        right: 10px;
        background: none;
        border: none;
        font-size: 24px;
        cursor: pointer;
        padding: 0;
        line-height: 1;
      `;
      this.closeBtn.onclick = () => this.hide();
      this.modal.appendChild(this.closeBtn);
    }
    
    // Assemble modal
    this.modal.appendChild(this.content);
    
    // Add to document
    document.body.appendChild(this.overlay);
    document.body.appendChild(this.modal);
    
    // Close on overlay click
    this.overlay.addEventListener('click', () => this.hide());
  }
  
  show() {
    this.modal.style.display = 'block';
    this.overlay.style.display = 'block';
  }
  
  hide() {
    this.modal.style.display = 'none';
    this.overlay.style.display = 'none';
    if (this.options.onClose) {
      this.options.onClose();
    }
  }
  
  setStatus(message, color = '#888') {
    this.statusMessage.textContent = message;
    this.statusMessage.style.color = color;
  }
  
  clearStatus() {
    this.statusMessage.textContent = '';
  }
}
