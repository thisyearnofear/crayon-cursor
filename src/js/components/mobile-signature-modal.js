// MobileSignatureModal: A contained modal for fast, focused drawing on mobile
import { SignatureCapture } from '../signature-capture.js';
import { createButton, createContainer, createStatusMessage } from './ui-helpers.js';
import { mintSignature } from './mint-signature.js';
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
    // Close button
    const closeBtn = createButton({
      text: '×',
      className: '',
      style: `position: absolute;top: 16px;right: 16px;width: 36px;height: 36px;background: #fff;color: #FC0E49;border: none;border-radius: 50%;font-size: 2rem;font-weight: bold;box-shadow: 0 2px 8px rgba(0,0,0,0.13);cursor: pointer;display: flex;align-items: center;justify-content: center;z-index: 10001;transition: background 0.2s;`,
      onClick: (e) => { e.preventDefault(); e.stopPropagation(); this.hide(true); }
    });
    this.modal.appendChild(closeBtn);
    // Main container
    const container = createContainer({
      style: `background: #fff;border-radius: 16px;padding: 12px 8px 64px 8px;box-shadow: 0 6px 32px rgba(0,0,0,0.18);display: flex;flex-direction: column;align-items: center;width: 95vw;max-width: 400px;max-height: 90vh;overflow-y: auto;position: relative;`
    });
    // Status message
    this.statusMessage = createStatusMessage({});
    container.appendChild(this.statusMessage);
    // Canvas
    this.canvas = document.createElement('canvas');
    this.canvas.width = 340;
    this.canvas.height = 220;
    this.canvas.style.cssText = 'background:#fff;border:2px solid #FC0E49;border-radius:8px;touch-action:none;';
    container.appendChild(this.canvas);
    // Controls
    const saveBtn = createButton({ text: 'Save', className: 'signature-button' });
    const mintBtn = createButton({ text: 'Mint', className: 'signature-button mint' });
    const clearBtn = createButton({ text: 'Clear', className: 'signature-button' });
    const cancelBtn = createButton({ text: 'Cancel', className: 'signature-button' });
    const controls = createContainer({
      style: 'margin-top:14px;display:flex;gap:10px;position:fixed;bottom:24px;left:50%;transform:translateX(-50%);z-index:10001;background:rgba(255,255,255,0.95);padding:8px 0 4px 0;border-radius:12px;box-shadow:0 2px 8px rgba(0,0,0,0.07);width:calc(95vw - 16px);max-width:384px;justify-content:center;',
      children: [saveBtn, mintBtn, clearBtn, cancelBtn]
    });
    container.appendChild(controls);
    this.modal.appendChild(container);
    document.body.appendChild(this.modal);
    // Drawing logic
    this.ctx = this.canvas.getContext('2d');
    this.ctx.lineWidth = 3;
    this.ctx.strokeStyle = '#7A200C';
    this.ctx.lineCap = 'round';
    this.canvas.addEventListener('pointerdown', this.startDraw.bind(this));
    this.canvas.addEventListener('pointermove', this.draw.bind(this));
    this.canvas.addEventListener('pointerup', this.endDraw.bind(this));
    this.canvas.addEventListener('pointerleave', this.endDraw.bind(this));
    this.modal.addEventListener('touchmove', e => e.preventDefault(), { passive: false });
    clearBtn.onclick = () => this.clear();
    cancelBtn.onclick = () => this.hide(true);
    // Save logic
    let lastSavedGroveUrl = null;
    let lastSaveResult = null;
    saveBtn.onclick = async () => {
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
        this.resultContainer = createContainer({
          style: 'display: flex;flex-direction: column;align-items: center;gap: 12px;margin-top: 16px;word-break: break-all;',
          children: [
            (() => { const d = document.createElement('div'); d.textContent = 'Saved URL:'; d.style.fontWeight = 'bold'; return d; })(),
            (() => { const a = document.createElement('a'); a.href = lastSavedGroveUrl; a.textContent = lastSavedGroveUrl; a.target = '_blank'; a.style.color = '#7A200C'; a.style.textDecoration = 'underline'; return a; })(),
            (() => { const a = document.createElement('a'); a.textContent = 'Download'; a.href = dataUrl; a.download = 'signature.png'; a.className = 'signature-button'; a.style.marginTop = '8px'; a.style.background = '#7A200C'; a.style.color = 'white'; a.style.padding = '7px 18px'; a.style.borderRadius = '6px'; a.style.textAlign = 'center'; return a; })()
          ]
        });
        container.appendChild(this.resultContainer);
      } catch (error) {
        this.statusMessage.textContent = 'Failed to save. Please try again.';
        this.statusMessage.style.color = '#D32F2F';
        saveBtn.disabled = false;
      }
    };
    // Mint logic (shared)
    mintBtn.onclick = () => {
      if (!lastSavedGroveUrl) {
        this.statusMessage.textContent = 'Please save your signature before minting.';
        this.statusMessage.style.color = '#FC0E49';
        return;
      }
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
      uriInput.value = '';
      uriInput.readOnly = true;
      uriInput.style.cssText = 'width:100%;padding:8px;border-radius:6px;border:1px solid #ccc;background:#f9f9f9;';
      // Payout Address
      const payoutLabel = document.createElement('label');
      payoutLabel.textContent = 'Payout Address:';
      payoutLabel.style.cssText = 'font-weight:bold;align-self:flex-start;';
      const payoutInput = document.createElement('input');
      payoutInput.type = 'text';
      payoutInput.required = true;
      payoutInput.readOnly = false;
      payoutInput.disabled = false;
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
          // Step 1: Pin the actual canvas image to IPFS
          const { pinFileWithPinata } = await import('../utils/pinata.js');
          const dataUrl = this.canvas.toDataURL('image/png');
          const dataUrlToBlob = (dataUrl) => {
            const arr = dataUrl.split(',');
            const mime = arr[0].match(/:(.*?);/)[1];
            const bstr = atob(arr[1]);
            let n = bstr.length;
            const u8arr = new Uint8Array(n);
            while (n--) u8arr[n] = bstr.charCodeAt(n);
            return new Blob([u8arr], { type: mime });
          };
          const signatureBlob = dataUrlToBlob(dataUrl);
          const ipfsImageUri = await pinFileWithPinata(signatureBlob);
          // Step 2: Build metadata JSON with the IPFS image URL
          const { buildSignatureMetadata } = await import('../utils/metadata.js');
          const metadataJson = buildSignatureMetadata({
            name: nameInput.value,
            imageUrl: ipfsImageUri,
            description: 'A unique signature minted as an NFT.'
          });
          // Step 3: Pin metadata JSON to Pinata
          const { pinJsonWithPinata } = await import('../utils/pinata.js');
          const ipfsMetadataUri = await pinJsonWithPinata(metadataJson);
          // Step 4: Mint using the IPFS metadata URI
          const { createSignatureCoin } = await import('../coins/zora-coins.js');
          const resultMint = await createSignatureCoin({
            name: nameInput.value,
            symbol: symbolInput.value.toUpperCase(),
            metadataUri: ipfsMetadataUri,
            payoutRecipient: payoutInput.value,
            account: payoutInput.value,
            rpcUrl: 'https://mainnet.base.org',
            platformReferrer: '0x55A5705453Ee82c742274154136Fce8149597058'
          });
          // Show the IPFS metadata URI in the form
          uriInput.value = ipfsMetadataUri;
          resultDiv.innerHTML = `<div style='color:#22a722;font-weight:bold;'>Minted!</div><div><b>Coin Address:</b> <a href='https://basescan.org/address/${resultMint.address}' target='_blank'>${resultMint.address}</a></div><div><b>Tx Hash:</b> <a href='https://basescan.org/tx/${resultMint.hash}' target='_blank'>${resultMint.hash}</a></div>`;
        } catch (err) {
          resultDiv.textContent = 'Mint failed: ' + (err.message || err);
          resultDiv.style.color = '#D32F2F';
        } finally {
          mintFormBtn.disabled = false;
          mintCancelBtn.disabled = false;
        }
      };
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
