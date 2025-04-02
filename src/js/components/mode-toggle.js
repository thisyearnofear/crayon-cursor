export class ModeToggle {
  constructor(canvasManager) {
    this.canvasManager = canvasManager;
    this.currentMode = "signature";
    this.createUI();
  }

  createUI() {
    // Create styles for mode toggle container
    const style = document.createElement("style");
    style.textContent = `
      .mode-toggle-container {
        position: fixed;
        top: 20px;
        left: 20px;
        z-index: 1002;
      }

      @media (max-width: 768px) {
        .mode-toggle-container {
          top: 20px;
          left: 50%;
          transform: translateX(-50%);
        }
      }
    `;
    document.head.appendChild(style);

    // Create mode toggle button
    const container = document.createElement("div");
    container.className = "mode-toggle-container";

    const toggleButton = document.createElement("button");
    toggleButton.className = "mode-toggle-btn";
    toggleButton.innerHTML = `
      <span class="mode-icon">✏️</span>
      <span class="mode-text">Switch to Quill</span>
    `;
    toggleButton.style.cssText = `
      background-color: #7A200C;
      color: white;
      border: none;
      padding: 8px 16px;
      border-radius: 4px;
      cursor: pointer;
      font-weight: bold;
      transition: all 0.2s;
      font-family: inherit;
      font-size: 14px;
      display: flex;
      align-items: center;
      gap: 8px;
      position: relative;
      white-space: nowrap;
    `;

    // Add hover effects
    toggleButton.addEventListener("mouseover", () => {
      toggleButton.style.backgroundColor = "#8B2314";
      toggleButton.style.transform = "translateY(-1px)";
    });

    toggleButton.addEventListener("mouseout", () => {
      toggleButton.style.backgroundColor = "#7A200C";
      toggleButton.style.transform = "translateY(0)";
    });

    toggleButton.addEventListener("click", () =>
      this.handleToggle(toggleButton)
    );
    container.appendChild(toggleButton);
    document.body.appendChild(container);

    // Store reference to button
    this.toggleButton = toggleButton;
  }

  handleToggle(button) {
    this.currentMode = this.currentMode === "signature" ? "quill" : "signature";

    // Update button text
    button.innerHTML = `
      <span class="mode-icon">✏️</span>
      <span class="mode-text">Switch to ${
        this.currentMode === "signature" ? "Quill" : "Signature"
      }</span>
    `;

    // Update UI state
    document.body.setAttribute("data-mode", this.currentMode);

    // Handle canvas cleanup and initialization
    if (this.canvasManager) {
      // Update canvas manager mode
      this.canvasManager.currentMode = this.currentMode;

      // Clean up and reinitialize
      this.canvasManager.cleanup();
      this.canvasManager.initCanvas();
    }
  }
}
