// MobileSignatureModal: A contained modal for fast, focused drawing on mobile
import { SignatureCapture } from './signature-capture.js';
export class MobileSignatureModal {
  constructor({ onSave, onCancel }) {
    this.onSave = onSave;
    this.onCancel = onCancel;
    this.modal = null;
    this.canvas = null;
    this.ctx = null;
    this.isDrawing = false;
    this.lastX = 0;
    this.lastY = 0;
    this.createModal();
  }

  createModal() {
    // Modal overlay
    this.modal = document.createElement('div');
    this.modal.className = 'mobile-signature-modal';
    this.modal.style.cssText = `
      position: fixed;
      top: 0; left: 0; right: 0; bottom: 0;
      background: #FC0E49;
      z-index: 10000;
      display: flex;
      align-items: center;
      justify-content: center;
    `;

    // Centered container
    const container = document.createElement('div');
    container.style.cssText = `
      background: #fff;
      border-radius: 16px;
      padding: 16px;
      box-shadow: 0 6px 32px rgba(0,0,0,0.18);
      display: flex;
      flex-direction: column;
      align-items: center;
      width: 95vw;
      max-width: 400px;
      max-height: 90vh;
    `;

    // Status message
    this.statusMessage = document.createElement('div');
    this.statusMessage.style.cssText = `
      font-size: 15px;
      font-weight: 500;
      margin-bottom: 10px;
      color: #888;
      text-align: center;
      min-height: 1.5em;
      transition: color 0.25s;
    `;
    container.appendChild(this.statusMessage);

    // Canvas
    this.canvas = document.createElement('canvas');
    this.canvas.width = 340;
    this.canvas.height = 220;
    this.canvas.style.cssText = 'background:#fff;border:2px solid #FC0E49;border-radius:8px;touch-action:none;';
    container.appendChild(this.canvas);

    // Controls
    const controls = document.createElement('div');
    controls.style.cssText = 'margin-top:14px;display:flex;gap:10px;';
    const saveBtn = document.createElement('button');
    saveBtn.textContent = 'Save';
    saveBtn.className = 'signature-button';
    const clearBtn = document.createElement('button');
    clearBtn.textContent = 'Clear';
    clearBtn.className = 'signature-button';
    const cancelBtn = document.createElement('button');
    cancelBtn.textContent = 'Cancel';
    cancelBtn.className = 'signature-button';
    controls.appendChild(saveBtn);
    controls.appendChild(clearBtn);
    controls.appendChild(cancelBtn);
    container.appendChild(controls);

    this.modal.appendChild(container);
    document.body.appendChild(this.modal);

    // Drawing logic
    this.ctx = this.canvas.getContext('2d');
    this.ctx.lineWidth = 3;
    this.ctx.strokeStyle = '#7A200C';
    this.ctx.lineCap = 'round';

    // Touch events only for modal canvas
    this.canvas.addEventListener('pointerdown', this.startDraw.bind(this));
    this.canvas.addEventListener('pointermove', this.draw.bind(this));
    this.canvas.addEventListener('pointerup', this.endDraw.bind(this));
    this.canvas.addEventListener('pointerleave', this.endDraw.bind(this));

    // Prevent scrolling while drawing
    this.modal.addEventListener('touchmove', e => e.preventDefault(), { passive: false });

    // Controls
    clearBtn.onclick = () => this.clear();
    cancelBtn.onclick = () => this.hide(true);
    saveBtn.onclick = async () => {
      // Show processing status, disable save
      this.statusMessage.textContent = 'Processing';
      this.statusMessage.style.color = '#888';
      saveBtn.disabled = true;
      const dataUrl = this.canvas.toDataURL('image/png');
      try {
        // Use actual SignatureCapture.saveToGrove logic
        if (!this.signatureCapture) this.signatureCapture = new SignatureCapture();
        // Set dummy drawingData so saveToGrove doesn't throw
        this.signatureCapture.drawingData = [{ x: 0, y: 0, time: 0 }];
        const fakeCanvasManager = { captureCanvas: () => dataUrl };
        const result = await this.signatureCapture.saveToGrove(fakeCanvasManager, dataUrl);
        this.statusMessage.textContent = 'Signed';
        this.statusMessage.style.color = '#22a722';
        if (this.resultContainer) this.resultContainer.remove();
        this.resultContainer = document.createElement('div');
        this.resultContainer.style.cssText = `
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 12px;
          margin-top: 16px;
          word-break: break-all;
        `;
        const urlLabel = document.createElement('div');
        urlLabel.textContent = 'Saved URL:';
        urlLabel.style.fontWeight = 'bold';
        const urlLink = document.createElement('a');
        urlLink.href = result.imageUrl;
        urlLink.textContent = result.imageUrl;
        urlLink.target = '_blank';
        urlLink.style.color = '#7A200C';
        urlLink.style.textDecoration = 'underline';
        const downloadBtn = document.createElement('a');
        downloadBtn.textContent = 'Download';
        downloadBtn.href = dataUrl;
        downloadBtn.download = 'signature.png';
        downloadBtn.className = 'signature-button';
        downloadBtn.style.marginTop = '8px';
        downloadBtn.style.background = '#7A200C';
        downloadBtn.style.color = 'white';
        downloadBtn.style.padding = '7px 18px';
        downloadBtn.style.borderRadius = '6px';
        downloadBtn.style.textAlign = 'center';
        this.resultContainer.appendChild(urlLabel);
        this.resultContainer.appendChild(urlLink);
        this.resultContainer.appendChild(downloadBtn);
        container.appendChild(this.resultContainer);
      } catch (error) {
        this.statusMessage.textContent = 'Failed to save. Please try again.';
        this.statusMessage.style.color = '#D32F2F';
        saveBtn.disabled = false;
      }
    };


  }

  startDraw(e) {
    this.isDrawing = true;
    const rect = this.canvas.getBoundingClientRect();
    this.lastX = (e.touches ? e.touches[0].clientX : e.clientX) - rect.left;
    this.lastY = (e.touches ? e.touches[0].clientY : e.clientY) - rect.top;
  }

  draw(e) {
    if (!this.isDrawing) return;
    e.preventDefault();
    const rect = this.canvas.getBoundingClientRect();
    const x = (e.touches ? e.touches[0].clientX : e.clientX) - rect.left;
    const y = (e.touches ? e.touches[0].clientY : e.clientY) - rect.top;
    this.ctx.beginPath();
    this.ctx.moveTo(this.lastX, this.lastY);
    this.ctx.lineTo(x, y);
    this.ctx.stroke();
    this.lastX = x;
    this.lastY = y;
  }

  endDraw(e) {
    this.isDrawing = false;
  }

  clear() {
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
  }

  hide(cancelled) {
    this.modal.remove();
    if (cancelled && this.onCancel) this.onCancel();
  }
}
