// MobileSignatureModal: A contained modal for fast, focused drawing on mobile
import { SignatureCapture } from '../signature-capture.js';
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

    // Close (×) button
    const closeBtn = document.createElement('button');
    closeBtn.innerHTML = '&times;';
    closeBtn.setAttribute('aria-label', 'Close');
    closeBtn.style.cssText = `
      position: absolute;
      top: 16px;
      right: 16px;
      width: 36px;
      height: 36px;
      background: #fff;
      color: #FC0E49;
      border: none;
      border-radius: 50%;
      font-size: 2rem;
      font-weight: bold;
      box-shadow: 0 2px 8px rgba(0,0,0,0.13);
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 10001;
      transition: background 0.2s;
    `;
    closeBtn.onpointerdown = e => { e.preventDefault(); e.stopPropagation(); this.hide(true); };
    this.modal.appendChild(closeBtn);

    // Centered container
    const container = document.createElement('div');
    container.style.cssText = `
      background: #fff;
      border-radius: 16px;
      padding: 12px 8px 64px 8px;
      box-shadow: 0 6px 32px rgba(0,0,0,0.18);
      display: flex;
      flex-direction: column;
      align-items: center;
      width: 95vw;
      max-width: 400px;
      max-height: 90vh;
      overflow-y: auto;
      position: relative;
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
    controls.style.cssText = 'margin-top:14px;display:flex;gap:10px;position:fixed;bottom:24px;left:50%;transform:translateX(-50%);z-index:10001;background:rgba(255,255,255,0.95);padding:8px 0 4px 0;border-radius:12px;box-shadow:0 2px 8px rgba(0,0,0,0.07);width:calc(95vw - 16px);max-width:384px;justify-content:center;';
    const saveBtn = document.createElement('button');
    saveBtn.textContent = 'Save';
    saveBtn.className = 'signature-button';
    const mintBtn = document.createElement('button');
    mintBtn.textContent = 'Mint';
    mintBtn.className = 'signature-button';
    const clearBtn = document.createElement('button');
    clearBtn.textContent = 'Clear';
    clearBtn.className = 'signature-button';
    const cancelBtn = document.createElement('button');
    cancelBtn.textContent = 'Cancel';
    cancelBtn.className = 'signature-button';
    controls.appendChild(saveBtn);
    controls.appendChild(mintBtn);
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
    // Store last saved Grove URL for minting
    let lastSavedGroveUrl = null;
    let lastSaveResult = null;
    saveBtn.onclick = async () => {
      // Show processing status, disable save
      this.statusMessage.textContent = 'Processing';
      this.statusMessage.style.color = '#888';
      saveBtn.disabled = true;
      try {
        const dataUrl = this.canvas.toDataURL('image/png');
        if (!this.signatureCapture) this.signatureCapture = new SignatureCapture();
        this.signatureCapture.drawingData = [{ x: 0, y: 0, time: 0 }];
        const fakeCanvasManager = { captureCanvas: () => dataUrl };
        const result = await this.signatureCapture.saveToGrove(fakeCanvasManager, dataUrl);
        lastSaveResult = result;
        // Convert lens://... to https://api.grove.storage/...
        function lensToHttpUrl(uri) {
          if (uri && uri.startsWith('lens://')) {
            return 'https://api.grove.storage/' + uri.slice('lens://'.length);
          }
          return uri;
        }
        lastSavedGroveUrl = lensToHttpUrl(result.imageUrl || result.uri || result.lensUri);
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
        urlLink.href = lastSavedGroveUrl;
        urlLink.textContent = lastSavedGroveUrl;
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

    // Mint button handler
    mintBtn.onclick = () => {
      // Require save first
      if (!lastSavedGroveUrl) {
        this.statusMessage.textContent = 'Please save your signature before minting.';
        this.statusMessage.style.color = '#FC0E49';
        return;
      }
      // Remove any previous mint form
      if (this.mintFormContainer) this.mintFormContainer.remove();
      const mintForm = document.createElement('form');
      mintForm.style.cssText = 'margin-top:8px;display:flex;flex-direction:column;align-items:center;gap:6px;width:100%;max-width:360px;';
      // Name
      const nameLabel = document.createElement('label');
      nameLabel.textContent = 'Name:';
      nameLabel.style.cssText = 'font-weight:bold;align-self:flex-start;';
      const nameInput = document.createElement('input');
      nameInput.type = 'text';
      nameInput.required = true;
      nameInput.placeholder = 'Signature Name';
      nameInput.style.cssText = 'width:100%;padding:8px;border-radius:6px;border:1px solid #ccc;';
      // Symbol
      const symbolLabel = document.createElement('label');
      symbolLabel.textContent = 'Symbol:';
      symbolLabel.style.cssText = 'font-weight:bold;align-self:flex-start;';
      const symbolInput = document.createElement('input');
      symbolInput.type = 'text';
      symbolInput.required = true;
      symbolInput.maxLength = 8;
      symbolInput.placeholder = 'e.g. SIGN';
      symbolInput.style.cssText = 'width:100%;padding:8px;border-radius:6px;border:1px solid #ccc;text-transform:uppercase;';
      // Metadata URI
      const uriLabel = document.createElement('label');
      uriLabel.textContent = 'Metadata URI:';
      uriLabel.style.cssText = 'font-weight:bold;align-self:flex-start;';
      const uriInput = document.createElement('input');
      uriInput.type = 'text';
      uriInput.required = true;
      uriInput.value = lastSavedGroveUrl;
      uriInput.readOnly = true;
      uriInput.style.cssText = 'width:100%;padding:8px;border-radius:6px;border:1px solid #ccc;background:#f9f9f9;';
      // Payout Address
      const payoutLabel = document.createElement('label');
      payoutLabel.textContent = 'Payout Address:';
      payoutLabel.style.cssText = 'font-weight:bold;align-self:flex-start;';
      const payoutInput = document.createElement('input');
      payoutInput.type = 'text';
      payoutInput.required = true;
      payoutInput.placeholder = 'Your wallet address';
      payoutInput.style.cssText = 'width:100%;padding:8px;border-radius:6px;border:1px solid #ccc;';
      // Mint button
      const mintFormBtn = document.createElement('button');
      mintFormBtn.type = 'submit';
      mintFormBtn.textContent = 'Mint';
      mintFormBtn.style.cssText = 'margin-top:6px;padding:10px 28px;border-radius:7px;background:#7A200C;color:#fff;border:none;cursor:pointer;font-size:1.1em;width:100%;max-width:340px;';
      // Cancel button
      const mintCancelBtn = document.createElement('button');
      mintCancelBtn.type = 'button';
      mintCancelBtn.textContent = 'Cancel';
      mintCancelBtn.style.cssText = 'margin-top:6px;padding:9px 22px;border-radius:7px;background:#FC0E49;color:#fff;border:none;cursor:pointer;width:100%;max-width:340px;';
      mintCancelBtn.onclick = () => {
        mintForm.remove();
      };
      // Result/status
      const resultDiv = document.createElement('div');
      resultDiv.style.cssText = 'margin-top:10px;text-align:center;min-height:1.5em;';
      // Assemble form
      mintForm.appendChild(nameLabel);
      mintForm.appendChild(nameInput);
      mintForm.appendChild(symbolLabel);
      mintForm.appendChild(symbolInput);
      mintForm.appendChild(uriLabel);
      mintForm.appendChild(uriInput);
      mintForm.appendChild(payoutLabel);
      mintForm.appendChild(payoutInput);
      mintForm.appendChild(mintFormBtn);
      mintForm.appendChild(mintCancelBtn);
      mintForm.appendChild(resultDiv);
      container.appendChild(mintForm);
      this.mintFormContainer = mintForm;
      // Mint submit handler (async)
      mintForm.onsubmit = async (e) => {
        e.preventDefault();
        mintFormBtn.disabled = true;
        mintCancelBtn.disabled = true;
        resultDiv.textContent = 'Minting...';
        resultDiv.style.color = '#7A200C';
        try {
          const { createSignatureCoin } = await import('../coins/zora-coins.js');
          const resultMint = await createSignatureCoin({
            name: nameInput.value,
            symbol: symbolInput.value.toUpperCase(),
            metadataUri: uriInput.value,
            payoutRecipient: payoutInput.value,
            account: payoutInput.value,
            rpcUrl: 'https://mainnet.base.org',
            platformReferrer: '0x55A5705453Ee82c742274154136Fce8149597058'
          });
          resultDiv.innerHTML = `<div style='color:#22a722;font-weight:bold;'>Minted!</div><div><b>Coin Address:</b> <a href='https://basescan.org/address/${resultMint.address}' target='_blank'>${resultMint.address}</a></div><div><b>Tx Hash:</b> <a href='https://basescan.org/tx/${resultMint.hash}' target='_blank'>${resultMint.hash}</a></div>`;
        } catch (err) {
          resultDiv.textContent = 'Mint failed: ' + (err.message || err);
          resultDiv.style.color = '#D32F2F';
        } finally {
          mintFormBtn.disabled = false;
          mintCancelBtn.disabled = false;
        }
      };
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
