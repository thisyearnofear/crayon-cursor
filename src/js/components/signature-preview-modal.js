export class SignaturePreviewModal {
  constructor() {
    this.modal = null;
    this.createModal();
  }

  createModal() {
    // Create modal container
    this.modal = document.createElement("div");
    this.modal.className = "signature-preview-modal";
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
    this.overlay = document.createElement("div");
    this.overlay.className = "signature-preview-overlay";
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
    this.content = document.createElement("div");
    this.content.className = "signature-preview-content";
    this.content.style.cssText = `
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 20px;
    `;

    // Create preview image
    this.previewImage = document.createElement("img");
    this.previewImage.style.cssText = `
      max-width: 100%;
      max-height: 60vh;
      object-fit: contain;
    `;

    // Create buttons container
    this.buttons = document.createElement("div");
    this.buttons.style.cssText = `
      display: flex;
      gap: 10px;
      justify-content: center;
    `;

    // Create save button
    this.saveButton = document.createElement("button");
    this.saveButton.textContent = "Save to Grove";
    this.saveButton.className = "signature-button";
    this.saveButton.style.cssText = `
      background-color: #2196F3;
      color: white;
      border: none;
      padding: 10px 20px;
      border-radius: 4px;
      cursor: pointer;
      font-weight: bold;
    `;

    // Create cancel button
    this.cancelButton = document.createElement("button");
    this.cancelButton.textContent = "Cancel";
    this.cancelButton.className = "signature-button";
    this.cancelButton.style.cssText = `
      background-color: #f44336;
      color: white;
      border: none;
      padding: 10px 20px;
      border-radius: 4px;
      cursor: pointer;
      font-weight: bold;
    `;

    // Add loading indicator
    this.loadingIndicator = document.createElement("div");
    this.loadingIndicator.className = "loading-indicator";
    this.loadingIndicator.style.cssText = `
      display: none;
      text-align: center;
      margin-top: 10px;
      font-style: italic;
      color: #666;
    `;
    this.loadingIndicator.textContent = "Processing...";

    // Assemble modal
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
    this.overlay.addEventListener("click", () => this.hide());
    this.cancelButton.addEventListener("click", () => this.hide());
  }

  show(imageDataUrl, onSave) {
    this.previewImage.src = imageDataUrl;
    this.modal.style.display = "block";
    this.overlay.style.display = "block";

    // Setup save handler
    this.saveButton.onclick = () => {
      this.hide();
      onSave(imageDataUrl);
    };
  }

  hide() {
    this.modal.style.display = "none";
    this.overlay.style.display = "none";
  }
}
