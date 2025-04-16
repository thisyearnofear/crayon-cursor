// MobileSignatureModal: A contained modal for fast, focused drawing on mobile
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
      transition: background 0.2s;
    `;

    // Centered container
    const container = document.createElement('div');
    container.style.cssText = `
      background: #fff;
      border-radius: 24px;
      padding: 24px 18px 18px 18px;
      box-shadow: 0 8px 40px 0 rgba(252,14,73,0.18), 0 2px 12px 0 rgba(0,0,0,0.10);
      display: flex;
      flex-direction: column;
      align-items: center;
      width: 96vw;
      max-width: 440px;
      max-height: 92vh;
      margin: 0 auto;
      position: relative;
      justify-content: center;
    `;

    // Canvas
    this.canvas = document.createElement('canvas');
    // Match desktop aspect ratio (e.g., 420x260)
    this.canvas.width = 420;
    this.canvas.height = 260;
    this.canvas.style.cssText = 'background:#fff;border:2px solid #FC0E49;border-radius:12rem;touch-action:none;box-shadow:0 2rem 12rem 0 rgba(0,0,0,0.08);';
    container.appendChild(this.canvas);

    // Controls styled like desktop
    const controls = document.createElement('div');
    controls.style.cssText = 'margin-top:18rem;display:flex;gap:16rem;justify-content:center;';
    const saveBtn = document.createElement('button');
    saveBtn.textContent = 'Save';
    saveBtn.className = 'signature-button save-btn';
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

    // Add style for modal controls to match desktop
    const style = document.createElement('style');
    style.textContent = `
      .mobile-signature-modal .signature-button {
        padding: 7rem 13rem;
        border: none;
        border-radius: 6rem;
        cursor: pointer;
        font-weight: 500;
        font-size: 11rem;
        transition: background-color 0.2s;
        margin: 0;
      }
      .mobile-signature-modal .save-btn {
        background: #7A200C;
        color: white;
      }
      .mobile-signature-modal .save-btn:hover {
        background: #FC0E49;
        color: white;
      }
      .mobile-signature-modal .signature-button:not(.save-btn) {
        background: #FC0E49;
        color: white;
      }
      .mobile-signature-modal .signature-button:not(.save-btn):hover {
        background: #e00940;
      }
    `;
    document.head.appendChild(style);

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
    saveBtn.onclick = () => {
      // Add crayon texture overlay before saving
      addCrayonTextureToCanvas(this.canvas);
      const dataUrl = this.canvas.toDataURL('image/png');
      this.hide();
      // Instead of passing dataUrl to preview, pass it to onSave for injection to p5.js canvas
      if (this.onSave) this.onSave(dataUrl);
    };

    // Helper: Add crayon/noise texture overlay
    function addCrayonTextureToCanvas(canvas) {
      const ctx = canvas.getContext('2d');
      const w = canvas.width, h = canvas.height;
      // Simple noise overlay
      const noise = ctx.createImageData(w, h);
      for (let i = 0; i < noise.data.length; i += 4) {
        const v = 220 + Math.floor(Math.random() * 30); // light gray
        noise.data[i] = v;
        noise.data[i+1] = v;
        noise.data[i+2] = v;
        noise.data[i+3] = Math.random() < 0.5 ? 12 : 0; // sparse alpha
      }
      ctx.putImageData(noise, 0, 0);
    }
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
