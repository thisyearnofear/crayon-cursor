export class SignaturePreviewModal {
  showResult({ imageUrl, uri, imageDataUrl }) {
    // Show success status
    this.statusMessage.textContent = 'Signed';
    this.statusMessage.style.color = '#22a722';
    // Remove old result if present
    if (this.resultContainer) {
      this.resultContainer.remove();
    }
    this.resultContainer = document.createElement('div');
    this.resultContainer.style.cssText = `
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 12px;
      margin-top: 16px;
      word-break: break-all;
    `;
    // Grove URL
    const urlLabel = document.createElement('div');
    urlLabel.textContent = 'Saved URL:';
    urlLabel.style.fontWeight = 'bold';
    const urlLink = document.createElement('a');
    urlLink.href = imageUrl;
    urlLink.textContent = imageUrl;
    urlLink.target = '_blank';
    urlLink.style.color = '#7A200C';
    urlLink.style.textDecoration = 'underline';
    // Download button
    const downloadBtn = document.createElement('a');
    downloadBtn.textContent = 'Download';
    downloadBtn.href = imageDataUrl;
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
    this.content.appendChild(this.resultContainer);
    // Show modal if not already visible
    this.modal.style.display = 'block';
    this.overlay.style.display = 'block';
  }

  constructor() {
    this.modal = null;
    this.createModal();
  }

  createModal() {
    // Create modal container
    this.modal = document.createElement('div');
    this.modal.className = 'signature-preview-modal';
    this.modal.style.cssText = `
      display: none;
      position: fixed;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      background: white;
      padding: 20px;
      border-radius: 8px;
      box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
      z-index: 1000;
      max-width: 90vw;
      max-height: 90vh;
      overflow: auto;
    `;

    // Create overlay
    this.overlay = document.createElement('div');
    this.overlay.className = 'signature-preview-overlay';
    this.overlay.style.cssText = `
      display: none;
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: rgba(0, 0, 0, 0.5);
      z-index: 999;
    `;

    // Create content
    this.content = document.createElement('div');
    this.content.className = 'signature-preview-content';
    this.content.style.cssText = `
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 20px;
    `;

    // Create status message
    this.statusMessage = document.createElement('div');
    this.statusMessage.className = 'signature-status-message';
    this.statusMessage.style.cssText = `
      font-size: 15px;
      font-weight: 500;
      margin-bottom: 10px;
      color: #888;
      text-align: center;
      min-height: 1.5em;
      transition: color 0.25s;
    `;

    // Create close (X) button
    this.closeBtn = document.createElement('button');
    this.closeBtn.innerHTML = '&times;';
    this.closeBtn.className = 'signature-modal-close';
    this.closeBtn.style.cssText = `
      position: absolute;
      top: 16px;
      right: 16px;
      width: 32px;
      height: 32px;
      border: none;
      background: #f4f4f4;
      color: #7A200C;
      font-size: 22px;
      border-radius: 8px;
      box-shadow: 0 1px 4px rgba(0,0,0,0.06);
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 10;
      transition: background 0.2s;
    `;
    this.closeBtn.onmouseenter = () => { this.closeBtn.style.background = '#eee'; };
    this.closeBtn.onmouseleave = () => { this.closeBtn.style.background = '#f4f4f4'; };
    this.closeBtn.onclick = () => this.hide();

    // Create preview image
    this.previewImage = document.createElement('img');
    this.previewImage.style.cssText = `
      max-width: 100%;
      max-height: 60vh;
      object-fit: contain;
    `;

    // Create buttons container
    this.buttons = document.createElement('div');
    this.buttons.style.cssText = `
      display: flex;
      gap: 10px;
      justify-content: center;
    `;

    // Create save button
    this.saveButton = document.createElement('button');
    this.saveButton.textContent = 'Save to Grove';
    this.saveButton.className = 'signature-button';

    // Create mint button
    this.mintButton = document.createElement('button');
    this.mintButton.textContent = 'Mint';
    this.mintButton.className = 'signature-button mint';

    // Create cancel button
    this.cancelButton = document.createElement('button');
    this.cancelButton.textContent = 'Cancel';
    this.cancelButton.className = 'signature-button';

    // Add loading indicator

    // Assemble modal
    this.buttons.appendChild(this.saveButton);
    this.buttons.appendChild(this.mintButton);
    this.buttons.appendChild(this.cancelButton);
    // Add status message and close button above preview image
    this.content.appendChild(this.statusMessage);
    this.modal.appendChild(this.closeBtn);
    this.content.appendChild(this.previewImage);
    this.content.appendChild(this.buttons);
    this.modal.appendChild(this.content);

    // Add to document
    document.body.appendChild(this.overlay);
    document.body.appendChild(this.modal);

    // Close on overlay click
    this.overlay.addEventListener('click', () => this.hide());
    this.cancelButton.addEventListener('click', () => this.hide());
  }

  async upscaleImage(imageDataUrl) {
    this.buttons.style.display = 'none';

    try {
      // Convert data URL to blob
      const base64Data = imageDataUrl.split(',')[1];
      const binaryStr = atob(base64Data);
      const byteNumbers = new Array(binaryStr.length);
      for (let i = 0; i < binaryStr.length; i++) {
          byteNumbers[i] = binaryStr.charCodeAt(i);
      }
      const byteArray = new Uint8Array(byteNumbers);
      const imageBlob = new Blob([byteArray], { type: 'image/png' });

      // Create form data
      const formData = new FormData();
      formData.append('image', imageBlob, 'signature.png');
      formData.append('scale', JSON.stringify([2]));

      // Call Venice API
      const response = await fetch('https://api.venice.ai/api/v1/image/upscale', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${process.env.VENICE_API_KEY}`
        },
        body: formData
      });

      if (!response.ok) {
        throw new Error(`Upscale failed: ${response.statusText}`);
      }

      // Convert response to data URL
      const upscaledBlob = await response.blob();
      const reader = new FileReader();
      return new Promise((resolve, reject) => {
        reader.onloadend = () => resolve(reader.result);
        reader.onerror = reject;
        reader.readAsDataURL(upscaledBlob);
      });
    } finally {
      this.buttons.style.display = 'flex';
    }
  }

  async show(imageDataUrl, onSave, onMint) {
    // Crop bottom third for preview
    const croppedDataUrl = await this.cropBottomThird(imageDataUrl);
    this.previewImage.src = croppedDataUrl;
    this.modal.style.display = 'block';
    this.overlay.style.display = 'block';

    // Setup save handler
    this.saveButton.onclick = () => {
      // Show loading indicator, hide buttons
      this.buttons.style.display = 'none';
      this.statusMessage.textContent = 'Processing';
      this.statusMessage.style.color = '#888';
      if (onSave) onSave(imageDataUrl);
    };

    // Setup mint handler
    this.mintButton.onclick = () => {
      this.hide();
      if (onMint) onMint(imageDataUrl);
    };
  }

  // Crop bottom third off for preview
  async cropBottomThird(imageDataUrl) {
    return new Promise((resolve) => {
      const img = new window.Image();
      img.onload = function() {
        const cropHeight = Math.floor(img.height * 2 / 3);
        const canvas = document.createElement('canvas');
        canvas.width = img.width;
        canvas.height = cropHeight;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, img.width, cropHeight, 0, 0, img.width, cropHeight);
        resolve(canvas.toDataURL());
      };
      img.src = imageDataUrl;
    });
  }

  hide() {
    this.modal.style.display = 'none';
    this.overlay.style.display = 'none';
  }
}
