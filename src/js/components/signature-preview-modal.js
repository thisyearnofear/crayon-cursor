export class SignaturePreviewModal {
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

    // Create upscale button
    this.upscaleButton = document.createElement('button');
    this.upscaleButton.textContent = 'Upscale (2x)';
    this.upscaleButton.className = 'signature-button';

    // Create cancel button
    this.cancelButton = document.createElement('button');
    this.cancelButton.textContent = 'Cancel';
    this.cancelButton.className = 'signature-button';

    // Add loading indicator
    this.loadingIndicator = document.createElement('div');
    this.loadingIndicator.className = 'loading-indicator';
    this.loadingIndicator.style.cssText = `
      display: none;
      text-align: center;
      margin-top: 10px;
      font-style: italic;
      color: #666;
    `;
    this.loadingIndicator.textContent = 'Processing...';

    // Assemble modal
    this.buttons.appendChild(this.upscaleButton);
    this.buttons.appendChild(this.saveButton);
    this.buttons.appendChild(this.cancelButton);
    this.content.appendChild(this.previewImage);
    this.content.appendChild(this.buttons);
    this.content.appendChild(this.loadingIndicator);
    this.modal.appendChild(this.content);

    // Add to document
    document.body.appendChild(this.overlay);
    document.body.appendChild(this.modal);

    // Close on overlay click
    this.overlay.addEventListener('click', () => this.hide());
    this.cancelButton.addEventListener('click', () => this.hide());
  }

  async upscaleImage(imageDataUrl) {
    this.loadingIndicator.style.display = 'block';
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
      this.loadingIndicator.style.display = 'none';
      this.buttons.style.display = 'flex';
    }
  }

  show(imageDataUrl, onSave) {
    this.previewImage.src = imageDataUrl;
    this.modal.style.display = 'block';
    this.overlay.style.display = 'block';

    // Setup upscale handler
    this.upscaleButton.onclick = async () => {
      try {
        const upscaledImageUrl = await this.upscaleImage(imageDataUrl);
        this.previewImage.src = upscaledImageUrl;
        // Update the save handler to use upscaled image
        this.saveButton.onclick = () => {
          this.hide();
          onSave(upscaledImageUrl);
        };
      } catch (error) {
        console.error('Failed to upscale:', error);
        alert('Failed to upscale image. Please try again.');
      }
    };

    // Setup save handler
    this.saveButton.onclick = () => {
      this.hide();
      onSave(imageDataUrl);
    };
  }

  hide() {
    this.modal.style.display = 'none';
    this.overlay.style.display = 'none';
  }
}
